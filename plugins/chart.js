app.plugins.chart = function(holder, options){
   this.holder = holder;
   this.options = $.extend({}, 
        { "interval": 300,  // refresh every 5 min
          "period": 21600,  // last 6h
          "data": [/*
              {url: "/mon/data/rasp/curl_json-weather/temperature-spb.rrd", yaxis:1 },*/
          ],
          "plot": { /*
              yaxis:  { position:"left" },
              series: { curvedLines: {apply:true, active:true, monotonicFit: true} } */
          }
        }, 
   options);

   this.plot_options = $.extend( {}, {
      series: {
          lines:{
             show: true,
             fill: false
          }
      },
      xaxis:{
         mode: "time", show:false
      },
      grid:{
         borderWidth: 0
      },
      legend:{
         show: false
      }
   }, this.options.plot );
   this.data = [];


   this.init = function(){
      var self = this;

      this.plot = $.plot( this.holder, [ {data: []} ], this.plot_options )
      this.holder.on("resizestop", function(){ self.resize() } );

      this.refresh();
      setInterval(function(){self.refresh();}, this.options.interval*1000);
   };

   this.refresh = function(){
      var self = this;
      var now = (new Date()).getTime();
      var flot_data = [], def=[];

      for( var i=0; i<this.options.data.length; i++){
         var data = this.options.data[i];
         flot_data.push( data );

         def.push(
            $.ajax( data.url, {
                      context:  {index: i},
                      dataType: 'text',
                      cache:    false,
                      mimeType: 'text/plain; charset=x-user-defined',
            }).done (
               function( raw ){
                  var idx = this.index;
                  var rrd = new RRDFile( new BinaryFile(raw) );

                  $.extend( flot_data[idx], self.getData(rrd, now-self.options.period*1000, now ) );
               }
            )
         );
      }

      $.when.apply($, def).then(
         function(){
            // console.log('Flot data', flot_data );
            self.plot.setData( flot_data );
            self.plot.setupGrid();
            self.plot.draw();
         }
      );
   };

   this.getData = function(rrd, startTimeJs, endTimeJs, dsId, cfName) {
       var self = this;

       if (startTimeJs >= endTimeJs) {
           throw RangeError(
               ['starttime must be less than endtime.',
                'starttime:', startTimeJs,
                'endtime:', endTimeJs].join(' '));
       }

       var startTime = startTimeJs/1000;
       var lastUpdated = rrd.getLastUpdate();
       // default endTime to the last updated time (quantized to rrd step boundry)
       var endTime = lastUpdated - lastUpdated%rrd.getMinStep();
       if(endTimeJs) {
           endTime = endTimeJs/1000;
       }

       if(typeof(dsId) === 'undefined' && dsId !== null) {
           dsId = 0;
       }
       var ds = rrd.getDS(dsId);

       if(typeof(cfName) === 'undefined' && cfName !== null) {
           cfName = 'AVERAGE';
       }

       var rra, step, rraRowCount, lastRowTime, firstRowTime;

       for(var i=0; i<rrd.getNrRRAs(); i++) {
           rra = rrd.getRRA(i);
           if(rra.getCFName() !== cfName) {
               continue;
           }

           step = rra.getStep();
           rraRowCount = rra.getNrRows();
           lastRowTime = lastUpdated-lastUpdated%step;
           firstRowTime = lastRowTime - rraRowCount * step;
           if(firstRowTime <= startTime) {
               break;
           }
       }
       if(!step) {
           throw TypeError('Unrecognised consolidation function: ' + cfName);
       }

       var flotData = [];
       var dsIndex = ds.getIdx();

       var startRowTime = Math.max(firstRowTime, startTime - startTime%step);
       var endRowTime = Math.min(lastRowTime, endTime - endTime%step);

       startRowTime = Math.min(startRowTime, endRowTime);

       var startRowIndex = rraRowCount - (lastRowTime - startRowTime)  / step;
       var endRowIndex = rraRowCount - (lastRowTime - endRowTime)  / step;

       var val;
       var timestamp = startRowTime;

       for(i=startRowIndex; i<endRowIndex; i++) {
           val = rra.getEl(i, dsIndex);
           flotData.push( [timestamp*1000.0, val] );
           timestamp += step;
       }
       //flotData = this.transformNulls(flotData);

       rra = rrd.getRRA(rrd.getNrRRAs()-1);
       var firstUpdated = lastUpdated - (rra.getNrRows() -1) * rra.getStep();

       return {'label': ds.getName(), 'data': flotData, //'unit': this.unit,
               'firstUpdated': firstUpdated*1000.0,
               'lastUpdated': lastUpdated*1000.0};
   };


   this.resize = function(){
      this.plot.resize();
      this.plot.setupGrid();
      this.plot.draw();
   };

   this.init();
};