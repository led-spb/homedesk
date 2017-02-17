app.plugins.energy = function(holder, options){
   this.holder   = holder;
   this.options  = $.extend( {}, {}, options);

   this.init = function(){
        var self = this;

        self.chart = self.holder.append("<div>").highcharts(
           {
            chart: { type: 'solidgauge' , backgroundColor: 'rgba(255, 255, 255, 0)' },
            title: null,
                    
            pane: {
                center: ['50%', '95%'],
                size: '140px',
                startAngle: -90,
                endAngle: 90,
                background: {
                    // backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
                    innerRadius: '60%',
                    outerRadius: '100%',
                    shape: 'arc'
                }
            },
            tooltip: { enabled: false },
            credits: { enabled: false },

            // the value axis
            yAxis: { 
              min: 0,
              max: 1000,
              stops: [
                  [0.1, '#55BF3B'], // green
                  [0.5, '#DDDF0D'], // yellow
                  [0.9, '#DF5353'] // red
              ],
            },
/*
            yAxis: {
                stops: [
                    [0.1, '#55BF3B'], // green
                    [0.5, '#DDDF0D'], // yellow
                    [0.9, '#DF5353'] // red
                ],
                lineWidth: 0,
                minorTickInterval: null,
                tickAmount: 2,
                title: {
                    y: 0
                },
                labels: {
                    y: 16
                },
                title: {
                   text: 'Power'
                }
            },*/

            plotOptions: {
                solidgauge: {
                    dataLabels: {
                        y: 5,
                        borderWidth: 0,
                        useHTML: true
                    }
                }
            },
            series: [{
               name: 'Power',
               data: [0],
               dataLabels: {
                   format: '<div style="text-align:center"><span style="font-size:20px;color: white">{y}</span><br/>' +
                           '<span style="font-size:12px;color:silver">Wh</span></div>'
               },
               tooltip: {
                   valueSuffix: ' Wh'
               }
            }]
        }
        );



        self.client = new Paho.MQTT.Client( window.location.hostname, Number(window.location.port==""?80:window.location.port), "/mqtt", "client"+Math.random() );
        self.client.onConnectionLost = function (responseObject) {
             console.log("Connection Lost: "+responseObject.errorMessage);
        }

        self.client.onMessageArrived = function (message) {
           var measure = jQuery.parseJSON( message.payloadString );
           var chart = self.chart.highcharts();

           var now = (new Date()).getTime();
           if( (now-self.maxUpdated)>60*60*1000 ){
               chart.axes[1].update( { max: 1000} );
               self.maxUpdated = now;
           } 

           if( chart.axes[1].max < measure.power ){
              chart.axes[1].update( { max: measure.power+100} );
              self.maxUpdated = now;
           }

           chart.series[0].points[0].update( measure.power );
        }

        self.client.connect( { onSuccess: function(){
              self.client.subscribe("/home/energy");
           }
        });




   };

   this.init();
};