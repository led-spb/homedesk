$(function(){

app.plugins.iframe = function(holder, options){
   this.holder  = holder;
   this.options = $.extend({}, options);

   this.init = function(){
      var self = this;
      self.holder.append('<iframe frameborder="0" seamles width="320" height="480" src="https://www.gismeteo.ru/nowcast-sankt-peterburg-4079/"></iframe>')
   }

   this.init()
}

})