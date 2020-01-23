$(function(){

app.plugins.weather = function(holder, options) {

  this.holder = holder;
  this.time_periods = [ {"name":"утро","from":7*60, "to":10*60}, {"name":"день","from":10*60+1, "to":15*60}, {"name":"вечер","from":15*60+1, "to":21*60} ];
  this.options = $.extend({}, {}, options);
  this.toggle_state = false;
  this.fallbackInterval = 500;

  this.init = function() {
      var self = this;

      this.holder.append('<div class="weather_current">'
                            +'<div class="weather_icon"></div>'
                            +'<div class="weather_cond"></div>'
                            +'<div class="weather_updated"><span class="mdi mdi-reload"></span><span class="weather_updated_text"></span></div>'
                            +'<div class="weather_detail"></div>'
                            +'<div class="weather_future">'
                                 +'<div><span class="mdi mdi-weather-sunset-up"></span><span class="weather_sunrise"></span></div>'
                                 +'<div><span class="mdi mdi-weather-sunset-down"></span><span class="weather_sunset"></span></div>'
                            +'</div>'
                        +'</div>'
      );
      this.holder.append('<div class="weather_forecast"></div>');
      this.holder.hide();

      app.utils.mqtt.subscribe("weather/spb", function(message){
          self.data = JSON.parse(message.payloadString)
          self.show()
      })
  };

  this.show = function(){
      var self = this;

      self.holder.find('.weather_updated_text').text(moment(self.data.dt*1000).format('HH:mm'))
      self.holder.find(".weather_detail").text(self.data.weather[0].description)
      self.holder.find(".weather_cond").text( (self.data.main.temp>=0?'+':'')+(Math.round(parseFloat(self.data.main.temp)*10)/10)+'°');
      self.holder.find(".weather_icon").css( 'background-image','url("http://openweathermap.org/img/w/'+self.data.weather[0].icon+'.png")');
      self.holder.find(".weather_sunrise").text(moment(self.data.sys.sunrise*1000).format('HH:mm'))
      self.holder.find(".weather_sunset").text(moment(self.data.sys.sunset*1000).format('HH:mm'))

      self.holder.show();
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
 
  this.loadCurrent = function(){
        var self=this;
        $.getJSON( location.protocol+'//api.openweathermap.org/data/2.5/weather?callback=?', { q :self.options.city+',ru', APPID:self.options.app_key, lang:'ru', units:'metric' },
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

     $.getJSON( location.protocol+'//api.openweathermap.org/data/2.5/forecast?callback=?', { q :self.options.city+',ru', APPID:self.options.app_key, lang:'ru', units:'metric' },
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
        //this.loadCurrent();
        //this.loadForecast();
  };

  this.init();
}

})