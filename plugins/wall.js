$(function(){

  app.plugins.wall = function( holder, options ){
     this.holder  = holder;
     this.options = $.extend({token:"", aid:"", interval: 5*60*1000}, options);

     this.current_background = "";
     this.interval_id = -1;
     this.images = [];

     this.init = function(){
        var self = this;
        self.holder.addClass("fixed");

        $.getJSON("https://api.vk.com/method/photos.get?v=5.131&access_token="+self.options.token+"&album_id="+self.options.aid+"&callback=?",
           function(data){
               if( data["error"] ){
                  alertify.error(""+data["error"]["error_msg"]);
                  return;
               }
               $.each(data.response.items, function(){
                  var image = this.sizes.pop()
                  if( image && image.url )
                     self.images.push( image.url );
               });
               self.schedule();
           }
        ).fail( 
           function(){
              setTimeout( function(){self.init()}, 13000 );
           }
        );
     };

     this.update = function(){
        var self=this;
        if( self.images.length==0 )
           return;

        if( self.images.length==1 ){
           self.current_background = self.images[0];
        }else{
           while(true){
              var idx = Math.round( Math.random() * (self.images.length-1))
              if( self.current_background != self.images[idx] ){
                 self.current_background = self.images[idx]
                 break
              }
           }
        }
        self.animate_change();
     };

     this.schedule = function(){
        var self = this;
        if( self.interval_id>=0 ){
           clearInterval( self.timeout_id );
        }else{
           self.update();
        }
        self.interval_id = setInterval( function(){ self.update() }, self.options.interval )
     };

     this.animate_change = function(){
        var self = this;
        self.holder.animate( {"opacity": 0},
               function(){
                  $(this)
                     .css( {'background-image': 'url('+self.current_background+')' } )
                     .animate( {"opacity": 1} )
               }
        );
     };

     this.init();
  }

})