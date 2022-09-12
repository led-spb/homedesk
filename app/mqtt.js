$(function(){
  app.utils.mqtt = {
     _subscriptions: [],

     init: function(app){
         var self = this;
         self.app = app;

         this._client = new Paho.MQTT.Client(CONFIG.mqtt.host, CONFIG.mqtt.port, CONFIG.mqtt.path, CONFIG.mqtt.client_id);
         this._client.onMessageArrived = function (message) {

             var content = '[binary]'
             try{
                content = message.payloadString
             }catch(e){}
             console.log('mqtt message', message.topic, content)

             $.each(self._subscriptions, function(idx, subscr){
                 if( subscr.regexp.test(message.destinationName) ){
                    try{
                       subscr.callback(message)
                    }catch(e){
                       alertify.error(""+e)
                    }
                 }
             });
         };
         this._client.onConnectionLost = function(context) {
              if (context.errorCode !== 0){
                   alertify.error("MQTT closes connection\n" + context.errorMessage)
                   setTimeout( function(){ self.init(self.app) }, 5000);
              }
         }
         var connect_options = {
             keepAliveInterval: CONFIG.mqtt.keepAliveInterval,
             mqttVersion: 3,
             useSSL: window.location.protocol == 'https:',
             reconnect: false,
             onSuccess: function(){
                alertify.success('MQTT connected')
                $.each(self._subscriptions, function(idx, subscr){
                          self._client.subscribe(subscr.pattern)
                      }
                )
             },
             onFailure: function(context){
                alertify.error("MQTT error\n" + context.errorMessage);
                setTimeout( function(){ self.init(self.app) }, 5000);
             }
         };
         console.log(connect_options);
         self._client.connect(connect_options);
     },

     topic_regexp: function(pattern){
        return new RegExp('^'+pattern.replace(/\+/g,'[^/]+').replace(/#/g,'.*')+'$');
     },

     topic_match: function(topic, pattern){
        var reg = this.topic_regexp(pattern);
        return reg.test(topic);
     },

     subscribe: function(pattern, callback){
        // console.log('mqtt.subscribe', pattern)
        this._subscriptions.push({ pattern: pattern, regexp: this.topic_regexp(pattern), callback: callback})

        if( this._client.isConnected() ){
            this._client.subscribe(pattern)
        }
     },

     publish: function(topic, payload, qos, retained){
        this._client.send(topic, payload, qos, retained)
     }
  }
})