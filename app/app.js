$( function(){

   app = {
      options: {},
      plugins: {},
      rows: {
          "1": {offset: 0, height: 0, left: 0, right: 0},
         "-1": {offset: 0, height: 0, left: 0, right: 0}
      },
      widgets: [],
      utils: {},

      init: function(options){
         const self = this;
         moment.locale('ru');
         alertify.set('notifier','position', 'top-right');
         alertify.set('notifier','delay', 3);

         self.options = options;
         self.viewport = $(options.viewport);
         
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
         const self = this;
         console.log("Creating widgets");
         $.each( widgets,
             function( idx, value ){
                   if( !value.enabled )
                      return;
                   try{
                      var widget = self.add_widget( value, idx );
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

      arrange_widget: function(widget, width, height){
         const self = this;
         const position = $.extend({}, widget.position)
         const style = $.extend({}, widget.css);

         const row_id = position.row;
         if( row_id ){
            if( !self.rows[""+row_id] ){
                const prev_row = self.rows[""+(row_id-1)] 
                self.rows[""+row_id] = {offset: prev_row.offset+prev_row.height+5, height: 0, left: 0, right: 0}
            }
            const row = self.rows[""+row_id];
            if( position.direction == 'left' ){
               style.left = row.left+'px';
               row.left = row.left + width + 5;
            }else{
               style.right = row.right+'px';
               row.right = row.right + width + 5;
            }
            if( row_id > 0 ){
               style.top = row.offset+'px';
            }else {
               style.bottom = row.offset+'px';
            }
            if( height > row.height ){
               row.height = height;
            }
         }         
         return style;
      },

      add_widget: function(w, idx){
         const self = this;
         const type = w.type;
         const opt = w.options;

         if( typeof app.plugins[type] != 'function'){
            alertify.error('Couldn`t find plugin '+type, 10000)
            return
         }

         try{
            var holder = $('<div></div>')
                               .attr('id', 'widget-'+idx)
                               .attr('class','widget_holder '+type+'_widget');
            // calculate and arrange widget
            this.viewport.append( holder );
            const width = holder.get(0).offsetWidth,
                  height = holder.get(0).offsetHeight;
            holder.css( $.extend({"z-index": idx}, self.arrange_widget(w, width, height)) );
            
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
         const self = this;
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