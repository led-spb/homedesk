app.plugins.clock = function(holder, options){
   this.holder   = holder;
   this.options  = $.extend( {}, {}, options);

   this.weekdays = ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'];
   this.months   = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];

   this.init = function(){
           holder.append('<div class="clock_time"></div><div class="clock_date"></div>');
           this._skip_to_zero()
           this.refresh()
   }

   this.animate = function(element, new_val){
           if( $(element).text()!=new_val ){
              $(element).fadeOut( 500, function(){
                    $(this).text(new_val).fadeIn( 500 )
                 }
              );
           }
   };

   this.refresh = function(){
           var curr = new Date();
           var time_str = (curr.getHours()<10?"0":"")+curr.getHours() + ":" + (curr.getMinutes()<10?"0":"")+curr.getMinutes();
           var date_str = this.weekdays[curr.getDay()]+", "+(curr.getDate()<10?"0":"")+curr.getDate()+" "+this.months[curr.getMonth()];

           this.animate( holder.children(".clock_time"), time_str );
           this.animate( holder.children(".clock_date"), date_str );
   };

   this._skip_to_zero = function(){
            var curr = new Date();
            var self = this;

            if( curr.getSeconds()==0 ){
              this.refresh();
              setInterval( function(){ self.refresh() } , 60000);
            }else{
              setTimeout( function(){ self._skip_to_zero() }, 1000 );
            }
   };

   this.init()
};