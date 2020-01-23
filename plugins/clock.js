$(function(){

app.plugins.clock = function(holder, options){
   this.holder   = holder;
   this.options  = $.extend( {dateformat: "dddd, DD MMMM", timeformat: "HH:mm"}, options);
   this.holder.on('click', function(){screenfull.toggle()});

   this.init = function(){
        var self = this;

        holder.append('<div class="clock_time"></div><div class="clock_date"></div>');
        this.refresh();
        setInterval(
           function(){ self.refresh() }, 
        1000);
   }
   this.refresh = function(){
        var curr = moment();
        holder.find(".clock_time").text(curr.format(this.options.timeformat));
        holder.find(".clock_date").text(curr.format(this.options.dateformat));
   };

   this.init()
}

})