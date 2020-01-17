$(function(){

app.plugins.camera = function(holder, options){
   this.holder   = holder;
   this.options  = $.extend({stream: "ws://127.0.0.1/", topic: ""}, options);

   this.init = function(){
       var self = this;
       self.holder.off('click').on('click', function(){ self.toggle_camera() } );
       app.utils.mqtt.subscribe(self.options.topic,  function(message){ self.on_snapshot(message)} )

       app.utils.mqtt.subscribe('home/sensor/motion_door', function(message){ self.on_motion(message)} )
       //self.init_camera()
   };

   this.on_snapshot = function(message){
       this.draw_frame(message.payloadBytes);
   };

   this.draw_frame = function( bytes ){
       this.holder.css('background-image', 'url("data:image/jpeg;base64,'+base64ArrayBuffer(bytes)+'")' );
   }

   this.on_motion = function(message){
       if( message.payloadString=="1" ){
          this.turn_on_camera(400);
       }else{
          this.turn_off_camera();
       }
   }

   this.init_camera = function(rate){
        var self = this;

        self.sock = new WebSocket(self.options.stream);
        self.sock.onopen = function(event){
           if( rate !== 'undefinded' ){
               self.sock.send(JSON.stringify({cmd: "start", rate: rate}))
           }
        };
        self.sock.onmessage = function(message){
              var reader = new FileReader();
              reader.addEventListener("loadend", function() {
                   self.draw_frame(reader.result)
              });
              reader.readAsArrayBuffer(message.data);
        };
        /*
        self.sock.onclose = function(){
           setTimeout( function(){ self.init_camera(rate) }, 3000 );
        }*/
   }
   this.toggle_camera = function(){
        if( this.holder.hasClass("camera_stream") ){
           this.turn_off_camera()
        }else{
           this.turn_on_camera(400)
        }
   };

   this.turn_on_camera = function(refresh){
        var self = this;
        self.init_camera(refresh)
        this.holder.addClass("camera_stream")
   };

   this.turn_off_camera = function(){
        var self = this;

        if( self.sock !== undefined && self.sock.readyState==1){
            self.sock.send(JSON.stringify({cmd: "stop"}));
            self.sock.close();
        }
        this.holder.removeClass("camera_stream")
   };

   this.init();
}

})