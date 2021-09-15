$( function(){

   app = {
      options: {},
      plugins: {},
      widgets: [],
      utils: {},

      init: function(options){
         var self = this;
         moment.locale('ru');
         alertify.set('notifier','position', 'top-right');
         alertify.set('notifier','delay', 3);

         this.options = options;
         this.viewport = $(options.viewport);

         $.each(this.utils, function(name, obj){
             try{
                obj.init(self)
             }catch(err){
                console.error('Unable to initialize utility '+name, err)
             }
         });

         if( typeof this.utils.mqtt != 'undefined' ){
             this.utils.mqtt.subscribe('homedesk/actions', function(message){
                 if( message.payloadString=='reload' ){
                    window.location.reload()
                 }
             })
         }

         this.create_widgets(CONFIG.widgets);
      },


      create_widgets: function(widgets){
         var self = this;

         console.log("Creating widgets");
         $.each( widgets,
             function( idx, value ){
                   if( !value.enabled )
                      return;
                   console.log("["+ value.type+"]");
                   try{
                      var widget = self.add_widget( value.type, value.options, idx );
                      widget.holder.css( $.extend( {"z-index": widget.idx}, value.css ) );
                   }catch(err){
                      console.log(err);
                   }
             }
         );
      },

      register_plugin: function(plugin, done ){
         $("head").append('<li'+'nk rel="stylesheet" type="text/css" href="plugins/'+plugin+'.css?_="'+Math.random()+' />');
         return $.getScript("plugins/"+plugin+".js").done( done );
      },


      add_widget: function(type, opt, idx){
         if( typeof app.plugins[type] != 'function'){
            alertify.error('Couldn`t find plugin '+type, 10000)
            return
         }

         try{
            var holder = $('<div class="widget_holder '+type+'_widget"></div>');
            this.viewport.append( holder );

            // create new widget
            var widget = new app.plugins[type](holder, opt);
            widget.name = type;
            this.widgets.push( widget );
         }catch(e){
            holder.remove()
            alertify.error('widget '+type+' error '+e, 10000);
            alertify.error(e.stack, 10000);
            return;
         }
         return widget;
      },

      find_widget: function(type){
         var self = this;
         return self.widgets.reduce(
            function(total, w){
              if( w.name == type )
                  total.push(w)
              return total
            }, []
         )
      },

   };

});