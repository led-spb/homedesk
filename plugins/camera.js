app.plugins.camera = function(holder, options){
   this.holder   = holder;
   this.options  = $.extend( {"reconnect": 60*1000 }, options);

   this.init = function(){
        var self = this;

        self.client = new Paho.MQTT.Client( window.location.hostname, Number(window.location.port==""?80:window.location.port), "/mqtt", "client"+Math.random() );
         // set callback handlers
        self.client.onConnectionLost = function (responseObject) {
             console.log("Connection Lost: "+responseObject.errorMessage);
             setTimeout( function(){ self.init(); }, self.options.reconnect );
        }
          

        self.client.onMessageArrived = function (message) {
              if( message.destinationName.endsWith("/photo") ){
                  console.log( "Camera image updated" );
                  var encoded = base64ArrayBuffer( message.payloadBytes );
                  self.holder.css('background-image', 'url("data:image/jpeg;base64,'+encoded+'")' );
              }

              if( message.destinationName.endsWith("/motion_door") ){
                  if( message.payloadString=="1" ){
                      self.turn_on_camera();
                  }else{
                      self.turn_off_camera();
                  }
              }
        }
          
        var connectOptions = { 
             onSuccess: function(){
                 console.log("MQTT broker connected!");
                 self.client.subscribe("/home/camera/door/photo");
                 // self.client.subscribe("/home/sensor/motion_door");
             },

             onFailure: function(message){
                 console.log("Failure connection to MQTT broker.", message );
                 setTimeout( function(){ self.init(); }, self.options.reconnect );
             }
        };
        $.each( self.options, function( key, value){
                if( ['userName', 'password', 'timeout', 'cleanSession'].indexOf(key)>=0 ){
                    connectOptions[key] = value;
                }
             }
        );
        // connectOptions = $.extend( connectOptions, self.options );
        // Connect the client, providing an onConnect callback
        self.client.connect( connectOptions );
   };

   this.turn_on_camera = function(){
        var self = this;
        self.fsview.show();

	self.sock = new WebSocket( "ws://"+window.location.host+"/camera");
        self.sock.onmessage = function (message) {
              var reader = new FileReader();
              reader.addEventListener("loadend", function() {
                 var encoded = base64ArrayBuffer( reader.result );
                 self.fsview.css('background-image', 'url("data:image/jpeg;base64,'+encoded+'")' );
              });
              reader.readAsArrayBuffer(message.data);
        };
   };

   this.turn_off_camera = function(){
        var self = this;

        self.fsview.hide();
        self.sock.close();
   };

/*
   this.init = function(){
        var self = this;

	var sock = new WebSocket( "ws://"+window.location.host+"/camera");
        sock.onmessage = function (message) {
              var reader = new FileReader();
              reader.addEventListener("loadend", function() {
                 var encoded = base64ArrayBuffer( reader.result );
                 self.holder.css('background-image', 'url("data:image/jpeg;base64,'+encoded+'")' );
              });
              reader.readAsArrayBuffer(message.data);
        };
   };*/

   this.holder.parent().append('<div class="camera_fullscreen">');
   this.fsview = $(".camera_fullscreen");
   this.init();
};
