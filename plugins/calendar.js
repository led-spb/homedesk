app.plugins.calendar = function(holder, options){
   this.holder   = holder;
   this.options  = $.extend( {}, {"calendars":[], "max_events":5, "lookup_days": 5, "refresh": 15*60*1000}, options);
   this.toggle_state = false;

   this.init = function(){
        //this.holder.append('');
        var self = this;
 
        self.refresh();
        setInterval( function(){ self.refresh() } , self.options.refresh );
   };

   this.refresh = function(){
        var self = this;
        var now  = new Date();
        var end  = new Date(); end.setTime( now.getTime() + this.options.lookup_days*24*60*60*1000 );

        var requests = [];
        for( var idx=0;idx<self.options.calendars.length;idx++ ){
           var url  = "https://www.google.com/calendar/feeds/"+this.options.calendars[idx]+"/basic?alt=jsonc&sinleevents=true&callback=?"
                                 +"&start-min="+now.format("yyyy-mm-dd")
                                 +"&start-max="+end.format("yyyy-mm-dd");
           requests.push( $.getJSON(url) );
        }
        if( requests.length==1 ) requests.push( $.when( [{data:{items:[]}}] ) );

        $.when.apply($, requests ).then( 
          function(){
              events = [];
              for(var idx=0;idx<arguments.length;idx++){
                  if( arguments[idx][0].data.items )
                     events = events.concat( arguments[idx][0].data.items );
              }
              events = events.sort( function(a,b) {
                                return (new Date(a.when[0].start)).getTime() - (new Date(b.when[0].start)).getTime();
                           }
              );
              events.splice( self.options.max_events );
              self.holder.empty();
              self.holder.height( (49 * events.length)+"px" )
              console.log( events.length+" calendar events loaded", events );
              $.each( events, 
                      function(){
                         this.start_date = new Date( this.when[0].start );
                         this.end_date   = new Date( this.when[0].end );
                         this.all_day    = (this.end_date.getTime()-this.start_date.getTime()) >= 24*60*60*1000;
                         var event_class = 'calendar_current';
                         if( now.getTime() - this.end_date.getTime() > 0 ) event_class='calendar_past';
                         if( now.getTime() - this.start_date.getTime() < 0 ) event_class='calendar_future';

                         self.holder.append('<div class="calendar_event '+event_class+'">'+
                                                    '<div class="calendar_when_date">'+this.start_date.format("dd mmm")+'</div>'+
                                                    '<div class="calendar_when_time">'+(this.all_day?'':this.start_date.format("HH:MM"))+'</div>'+
                                                    '<div class="calendar_title">'+this.title+'</div>'+
                                                    '<div class="calendar_location">'+this.location+'</div>'+
                                            '</div>' 
                         );
                      }
              );
          } 
        );
   };

   this.init();
};