$.getScript("http://api-maps.yandex.ru/2.0-stable/?load=package.traffic,package.route&lang=ru_RU").done(
   function(){ 
      ymaps.ready(
          function(){
             for(var i=0;i<app.applets.length;i++)
             if( app.applets[i].constructor === app.plugins.traffic ){
                  app.applets[i].update();
             }
          }
      );
   }
);

app.plugins.traffic = function( holder, options ){

   this.holder = $(holder);
   this.routes = {};
   this.open_state = false;
   this.options = $.extend( {}, {interval:15*60*1000, title:"", route:[], route_b: $.extend([],options.route).reverse() }, options );

   this.init = function(){
       holder.append('<div class="traffic_icon ico-traffic-green"></div>');
       holder.append('<div class="routes_info"><div class="route_title"></div><div class="route_a_time"></div>');

       var self = this;
       setInterval( function(){ self.update() }, self.options.interval );
       setInterval( function(){ self.rotateRoute() }, 20*1000 );

       holder.children(".traffic_icon").click( function(){ self.openToggle() }  );
       holder.children(".routes_info").click( function(){ self.rotateRoute() } );
   };
   this.openToggle = function(){
      var self = this;
      if( this.open_state ){
         holder.animate( { width: '50px' },  function(){ self.open_state = false; } );
      }else{
         holder.animate( { width: '370px'}, function(){ self.open_state = true;  } );
      }
   };

   this.processRoute = function(route_name, route_options){
       var self = this;
       ymaps.route( route_options ).then(
           function( route ) {
              self.routes[ route_name ] = { 
                                            name: route_name, 
                                            len:  route.getLength(), 
                                            time: route.getTime(), jams_time:route.getJamsTime(), time_str:route.getHumanTime(), jams_time_str:route.getHumanJamsTime(),
                                            traffic_rate:  (route.getJamsTime()/route.getTime()-1)*100
                                          };
              console.log( self.routes[ route_name ] );
           }
       );
   };

   this.rotateRoute = function(){
      var self = this;

      var names=[];
      for(var idx in this.routes)
         names.push(idx);

      if( names.length<1 ) return;

      if( this.display_route==undefined || this.display_route >= (names.length-1) )
         this.display_route = 0;
      else
         ++this.display_route;

      var info = this.routes[ names[this.display_route] ];
      holder.children(".routes_info").animate( {opacity: 0}, 
                  function(){
                     holder.find(".route_title").text( info.name );
                     var traffic_class='green';
                     if( info.traffic_rate>=20 ) traffic_class='yellow';
                     if( info.traffic_rate>=55 ) traffic_class='red';

                     holder.find(".route_a_time").removeClass('traffic-green traffic-yellow traffic-red').addClass('traffic-'+traffic_class).html( info.jams_time_str );
                     //holder.find(".route_b_time").html( info.time_str );
                     $(this).animate( {opacity: 1} );
                  } 
      );
   }

   this.update = function() {
      var self=this;
      $.get("http://export.yandex.ru/bar/reginfo.xml", 
            function(data){
               var xml = $(data).find("traffic").first()


               var traffic_hint  = xml.find('hint[lang="ru"]').text();
               var traffic_color = xml.find("icon").text();
               var traffic_rank  = xml.find("level").text();


               self.holder.children(".traffic_text").text(  traffic_hint );

               var icon = self.holder.children(".traffic_icon");
               icon.removeClass("ico-traffic-green ico-traffic-red ico-traffic-yellow");
               icon.addClass("ico-traffic-"+traffic_color);
               //icon.text( traffic_rank );
            }, 
           "xml");

      for( var key in self.options.routes ){
         this.processRoute(key, self.options.routes[key] );
      }
   };
   this.init();
};
