app.plugins.weather = function(holder, options) {

  this.holder = holder;
  this.time_periods = [ {"name":"утро","from":7*60, "to":10*60}, {"name":"день","from":10*60+1, "to":15*60}, {"name":"вечер","from":15*60+1, "to":21*60} ];
  this.options = $.extend({}, {city:'Санкт-Петербург', interval: 5*60*1000, appkey: ''}, options);
  this.toggle_state = false;
  this.fallbackInterval = 500;

  this.init = function() {
      var self = this;

      this.holder.append('<div class="weather_current">'
                            +'<div class="weather_icon"></div><div class="weather_cond"></div><div class="weather_wind"></div><div class="weather_city"></div>'
                            +'<div class="weather_updated"></div><div class="weather_detail"></div><div class="weather_future"></div>'
                        +'</div>'
      );
      this.holder.append('<div class="weather_forecast"></div>');

      //this.holder.click( function(){ self.toggleOpen(); } );
      this.update();
      var self = this;

      setInterval( function(){ self.update() }, self.options.interval );
  };

  this.toggleOpen = function(){
      var self = this;

      if( this.toggle_state ){
         this.holder.animate( { height:"96px"} )
         this.toggle_state = false;
      }else{
         this.holder.animate( {height:"321px"} )
         this.toggle_state = true;
      }
  }

  this.calcPeriod = function(date){
     var periods  = this.time_periods;
     var time = date.getHours()*60+date.getMinutes();

     for(var i in periods ){
        if( time >= periods[i].from && time<=periods[i].to )
             return i;
     }
     return;
  }


  this.updateForecast = function(){
      var i=0; var text="";
      for(var idx in this.forecast){
         if( i>=1 && i<=2 ){
           var f = this.forecast[idx];
           var temp = f.temp;

           var msg = f.period+" "+(temp>=0?'+':'')+(Math.round(parseFloat(temp)*10)/10)+'°';
           //console.log(msg);
           text =  text + (text==""?msg:"<br>"+msg);
         }
         i++;
       }

       this.holder.find(".weather_future").html( text );
   }

   this.loadCurrent = function(){
        var self=this;
        $.getJSON( 'http://api.openweathermap.org/data/2.5/weather?callback=?', { q :self.options.city+',ru', APPID:self.options.app_key, lang:'ru', units:'metric' },
            function(data){
              if( !data || !data.main || data.main.temp===undefined ){
                 self.fallbackInterval = Math.floor(self.falbackInterval*1.5);
                 if( self.fallbackInterval>self.options.interval ){
                   return
                 }

                 setTimeout( function(){ self.loadCurrent(); }, self.fallbackInterval );
                 return;
              }
              self.fallbackInterval = 500;

 	      var upd = new Date(data.dt*1000);
              var upd_str = (upd.getHours()<10?"0":"")+upd.getHours() + ":" + (upd.getMinutes()<10?"0":"")+upd.getMinutes();

              holder.find(".weather_icon").css( 'background-image','url("http://openweathermap.org/img/w/'+data.weather[0].icon+'.png")');
              holder.find(".weather_city").text( self.options.city );
              holder.find(".weather_detail").text( data.weather[0].description );
              holder.find(".weather_updated").text( upd_str );
              holder.find(".weather_cond").text( (data.main.temp>=0?'+':'')+(Math.round(parseFloat(data.main.temp)*10)/10)+'°');
           }
        );
  };

  this.loadForecast = function(){
     var self = this;

     var dt = new Date();
     var now = new Date();
     var forecast = {};

     $.getJSON( 'http://api.openweathermap.org/data/2.5/forecast?callback=?', { q :self.options.city+',ru', APPID:self.options.app_key, lang:'ru', units:'metric' },
         function(data){
            var currdate, currhour;
            for(var i in data.list){
               var info = data.list[i];

               dt.setTime(info.dt*1000);

               var time = self.calcPeriod(dt);
               if( time!==undefined ) {
                 var day = new Date;
                 day.setTime( info.dt*1000 ); day.setHours(0); day.setMinutes(0); day.setSeconds(0);
                 var idx = day.format("yyyymmdd")+time;

                 var temp     = info.main.temp;
                 var temp_min = info.main.temp_min;
                 var temp_max = info.main.temp_max;

                 if( idx in forecast ){
                   temp_min = temp_min>forecast[idx].temp_min?forecast[idx].temp_min:temp_min;
                   temp_max = temp_max<forecast[idx].temp_max?forecast[idx].temp_max:temp_max;

                 }
                 forecast[idx]={"date": day, "period": self.time_periods[time].name, "weather": info.weather[0], "temp_min": temp_min, "temp_max": temp_max, "temp": temp };
               }

            }
            self.forecast = forecast;
            self.updateForecast( self.forecast );
         }
     );
  }

  this.update = function(){
        this.loadCurrent();
        this.loadForecast();
  };

  this.init();
};