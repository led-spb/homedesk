$(function(){

app.plugins.icon = function(holder, options){
   this.holder   = holder;
   this.options  = $.extend({
        topic: 'home/sensor/unknown', 
        header: "",
        footer: "",
        icon_on: "", 
        icon_off: ""
   },
   options);

   this.status = function(){
      var status = this.state
      if( typeof this.options.status == 'function' ){
         try{
            status = this.options.status(this)
         }catch(e){
         }
      }
      return status
   }

   this.init = function(){
      var self = this;
      self.holder.hide();

      this.holder.append(
           '<div class="icon_head"></div>'
          +'<div class="icon_body"><span class="icon_image mdi"></span></div>'
          +'<div class="icon_foot"></div>'
      );

      if( typeof(self.options.click) == 'function' ){
          this.holder.find(".icon_body").click(function(){ self.options.click(self) });
      }
      if( typeof(self.options.init) == 'function' ){
          self.options.init(self)
      }

      app.utils.mqtt.subscribe( self.options.topic, 
          function(message){
             self.state = message.payloadString
             try{
                self.state = JSON.parse(self.state)
             }catch(e){
             }
             if( typeof self.options.changed == 'function' ){
                self.options.changed(self)
             }
             if( typeof self.options.style == 'function' ){
                self.holder.css( self.options.style(self) )
             }

             self.holder.find(".icon_foot").text(typeof self.options.footer == 'function' ? self.options.footer(self) :self.options.footer)
             self.holder.find(".icon_head").text(typeof self.options.header == 'function' ? self.options.header(self) :self.options.header)

             if( self.status() ){
                self.holder.find('.icon_image').addClass(self.options.icon_on).removeClass(self.options.icon_off)
             }else{
                self.holder.find('.icon_image').removeClass(self.options.icon_on).addClass(self.options.icon_off)
             }
             self.holder.show();
          }
      );
   };
   this.init();
}

})