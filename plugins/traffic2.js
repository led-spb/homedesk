$.getScript("http://api-maps.yandex.ru/2.1/?lang=ru_RU").done(
   function(){ 
      ymaps.ready(
          function(){
/*
             for(var i=0;i<app.applets.length;i++)
             if( app.applets[i].constructor === app.plugins.traffic2 ){
                  app.applets[i].update();
             }*/
          }
      );
   }
);

app.plugins.traffic2 = function( holder, options ){

   this.holder = $(holder);
   this.routes = {};
   this.open_state = false;
   this.options = $.extend( {}, {}, options );

   this.init = function(){
       holder.append('<div class="traffic_icon ico-traffic-green"></div>');
       holder.append('<div class="map_holder" id="map_holder"></div>');

       var self = this;
       holder.children(".traffic_icon").click( function(){ self.openToggle() }  );
   };

   this.openToggle = function(){
      var self = this;
      if( this.open_state ){
         holder.css( { width: '50px', height: '45px'} )
         self.open_state = false;
      }else{
         holder.css( { width: '100%', height: '100%'} )
         self.open_state = true; self.update();
      }
   };

   this.update = function(){
      if( !this.map ){
          this.map = new ymaps.Map( 'map_holder', { center: [59.938531, 30.313497], zoom: 11 } );

          var trafficControl = this.map.controls.get('trafficControl');
          trafficControl.getProvider('traffic#actual').state.set('infoLayerShown', true);
          trafficControl.showTraffic();
/*
          var actualProvider = new ymaps.traffic.provider.Actual({}, { infoLayerShown: true });
          actualProvider.setMap(this.map);*/
      }
   };

   this.init();
};
