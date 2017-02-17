app.plugins.alarm = function(holder, options){
   this.holder   = holder;
   this.options  = $.extend( {}, {"reconnect": 30000}, options);
   this.events   = [];

   this.init = function(){
        var self = this;

        self.client = new Paho.MQTT.Client( window.location.hostname, Number(window.location.port==""?80:window.location.port), "/mqtt", "client"+Math.random() );
         // set callback handlers
        self.client.onConnectionLost = function (responseObject) {
             console.log("Connection Lost: "+responseObject.errorMessage);
             setTimeout( function(){ self.init(); }, self.options.reconnect );
        }
          
        self.client.onMessageArrived = function (message) {
              var encoded = base64ArrayBuffer( message.payloadBytes );
              self.holder.css('background-image', 'url("data:image/jpeg;base64,'+encoded+'")' );
              console.log( "Camera image updated" );
        }
          
        // Connect the client, providing an onConnect callback
        self.client.connect( { 
             onSuccess: function(){
                 console.log("MQTT broker connected!");
                 self.client.subscribe("/home/alarm/camera/+/photo");
             },
             onFailure: function(){
                 setTimeout( function(){ self.init(); }, self.options.reconnect );
             }
        });
   };

   this.init();
};
