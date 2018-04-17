$( function(){
   app = {
      options: {},
      plugins: {},
      applets: [],
      dragging: 0,
      settings: $.extend({}, Cookies.getJSON("applet_config") ),

      init: function(options){
         var self = this;

         this.options = options;
         this.viewport = $(options.viewport);


         // Load config
         $.getJSON("config.json", function(data){
             console.log("Loading plugins");
             var deferred = [];
             var plugins = []

             // Register plugins
             $.each( data,
                 function( idx, item ){
                     var plugin = item['type'], enabled = item['enabled'];

                     if( !(plugin in plugins) && enabled ){
                        plugins.push( plugin )
                        deferred.push( self.register_plugin( plugin, function(){'Plugin '+plugin+' loaded'} ) )
                     }
                 } 
             );

             // Create applets when all plugins loaded
             $.when.apply($, deferred).done(
                function(){
                   console.log("Creating applets");
                   $.each( data,
                       function( idx, value ){
                             if( !value.enabled )
                               return;
                             console.log("["+ value.type+"]");
                             try{
                               var applet = self.add_applet( value.type, value.options, idx );
                               applet.holder.css( $.extend( {"z-index": applet.idx}, value.css ) );
                             }catch(err){
                             }
                       }
                   );
                   self.onStarted();
                }
             );
         });
      },

      applet_settings: function(plugin, index, data){
         if( typeof(data)==="undefined" ){
             return this.settings[plugin][index];
         }else{
             this.settings[plugin][index] = data;
             Cookies.set( "applet_config", this.settings, { "expires":30650 } );
         }
      },

      load_ext_lib: function( plugins, done ){
         var def = [];

         $.each( $.isArray(plugins)?plugins:[plugins], 
            function(i, lib){ 
               console.log("Loading library", lib );
               def.push( $.ajax( {dataType:"script", cache:true, url: lib} ) ); 
         });

         if( $.isFunction(done) ){
             $.when.apply($, def).then( function(){ 
               console.log("Libraries successful loaded");
               done(); 
             } );
         }
         return def;
      },

      register_plugin: function(plugin, done ){
         // console.log("Registering plugin "+plugin);
         var empty = {};
         empty[plugin]=[];
         this.settings = $.extend( {}, empty, this.settings);
         console.log('Loading plugin '+plugin);

         $("head").append('<link rel="stylesheet" type="text/css" href="plugins/'+plugin+'.css?_="'+Math.random()+' />');
         return $.getScript("plugins/"+plugin+".js").done( done );
      },


      add_applet: function(plugin, opt, idx){
         // this.settings[plugin]
         this.applet_settings( plugin, idx, $.extend({}, this.applet_settings(plugin,idx), opt) );

         var holder = $('<div class="plugin_holder '+plugin+'_plugin"></div>');
         this.viewport.append( holder );
         // create new applet
         var applet = new app.plugins[plugin](holder, opt);

         applet.holder = holder;
         applet.name   = plugin;
         applet.index  = idx;
         applet.idx    = this.applets.length;
         
         holder.get(0)._applet_index = idx;
         holder.get(0)._applet_class = plugin;

         this.applets.push( applet );
         return applet;
      },


      _move_handler: function(event, ui){
         var holder       = ui.helper;
         var applet_index = holder.get(0)._applet_index;
         var applet_class = holder.get(0)._applet_class;

         this.applet_settings( applet_class, applet_index, 
             { left:   holder.css('left'),   top:    holder.css('top'), 
               right:  holder.css('right'),  bottom: holder.css('bottom'),
               width:  holder.css('width'),  height: holder.css('height') }
         );
      },

      clear_settings:  function(){
         Cookies.remove("applets");
      },

      enable_edit: function(element){
         var self=this;
         element.draggable ( 
            { 
               containment: "parent",
               snap:        ".plugin_holder", 
               snapMode:    "outer",
               stop:        function(event,ui){ self._move_handler(event,ui); },
            } 
         ).css( "opacity", 0.6 )
         .resizable(
            {
               containment: "parent",
               handles:	    "all", 
               stop:        function(event,ui){ self._move_handler(event,ui); },
            }
         );
      },
      disable_edit: function(element){
         element.draggable("destroy").resizable("destroy").css("opacity",1);
      },

      context_menu: function(){
      },

      onStarted: function(){
         var self = this;

         this.viewport.find(".plugin_holder:not(.fixed)")
             .trigger("resizestop")
             .on("dblclick", function(event) {
                  var target = event.currentTarget;
                  if( target._edit ){
                    self.disable_edit( $(target) );
                    target._edit = false;
                  }else{
                    self.enable_edit( $(target) );
                    target._edit = true;
                  }
             });
      }
   };
 } 
);