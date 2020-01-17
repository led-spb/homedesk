$(function(){

app.plugins.iframe = function(holder, options){
   this.holder  = holder;
   this.options = $.extend({}, options);

   this.init = function(){
      var self = this;
      self.holder.append('<iframe frameborder="0"></iframe>')
   }

   this.init()
}

})