app.plugins.timeline = function(holder, options){
   this.holder   = holder;
   this.options  = $.extend( {}, {"interval": 60*1000, "url": ""}, options);

   this.init = function(){
        var self = this;
        this.holder.append('<div class="timeline_item"></div>');


        self.refresh();
   };


   this.refresh = function(){
        var self = this;
        var url = self.options['url']+'&salt='+Math.random();
        self.holder.find(".timeline_item").css('background-image', 'url("'+url+'")' );
        setTimeout( function(){ self.refresh() } , self.options['interval'] );
   };
   /*
   this.display = function(){
      var self = this;

      $.each(self.events, function(){
         self.holder.css('background-image', 'url("/alarm/cgi-bin/media?'+this[4]+'")' );
      });
   }*/

   this.init();
};
