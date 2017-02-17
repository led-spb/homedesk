app.plugins.lgtv = function(holder, options){
   this.holder   = holder;
   this.options  = $.extend( {}, {"reconnect": 30000}, options);


   this.init = function(){
        var self = this;
        self.client = new Paho.MQTT.Client( window.location.hostname, Number(window.location.port==""?80:window.location.port), "/mqtt", "client"+Math.random() );

         // set callback handlers
        self.client.onConnectionLost = function (responseObject) {
             console.log("Connection Lost: "+responseObject.errorMessage);
             setTimeout( function(){ self.init(); }, self.options.reconnect );
        };
          
        self.client.onMessageArrived = function (message) {
              console.log( message );
        };
          
        // Connect the client, providing an onConnect callback
        var connectOptions = { 
             onSuccess: function(){
                 console.log("MQTT broker connected!");
                 self.client.subscribe("/home/tv/detail");
             },

             onFailure: function( message ){
                 console.log( 'Failure connection to MQTT', message );
                 setTimeout( 
                    function(){ self.init(); }, self.options.reconnect );
             }
        };
        $.each( self.options, function( key, value){
                if( ['userName', 'password', 'timeout', 'cleanSession'].indexOf(key)>=0 ){
                    connectOptions[key] = value;
                }
        });
        self.client.connect( connectOptions );
   };
   this.init();
};
