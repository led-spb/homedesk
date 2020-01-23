$(function(){

app.plugins.text = function(holder, options){
   this.holder   = holder;
   this.options  = $.extend({
        topic: 'home/sensor/unknown', 
        header: "",
        footer: "",
        text: "",
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
      self.holder.hide()

      this.holder.append(
           '<div class="text_head"></div>'
          +'<div class="text_body"></div>'
          +'<div class="text_foot"></div>'
      );

      if( typeof(self.options.click) == 'function' ){
          this.holder.find(".text_body").click(function(){ self.options.click(self) });
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

             self.holder.find(".text_foot").text(typeof self.options.footer == 'function' ? self.options.footer(self) :self.options.footer)
             self.holder.find(".text_head").text(typeof self.options.header == 'function' ? self.options.header(self) :self.options.header)
             self.holder.find('.text_body').text(self.status())
             self.holder.show()
          }
      );
   };
   this.init();
}

})