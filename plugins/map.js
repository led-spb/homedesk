$(function(){

app.plugins.map = function(holder, options){
   this.holder   = holder;
   this.options  = $.extend({
        topic: 'owntracks/+/+',
        api_key: "",
   },
   options);

   this.init = function(){
      var self = this;
      self.markers = {};

      self.holder.append('<div id="map" style="width: 100%; height: 100%"></div>');

      L.mapquest.key = self.options.api_key;
      self.map = L.mapquest.map('map', {
          center: [59.938434, 30.313575],
          layers: L.mapquest.tileLayer('map'),
          zoom: 15
      });
        
      app.utils.mqtt.subscribe( self.options.topic, 
          function(message){
             self.state = message.payloadString
             try{
                self.state = JSON.parse(self.state)
             }catch(e){
             }
             if( typeof self.options.changed == 'function' ){
                self.options.changed(self, message)
             }
             if( typeof self.options.style == 'function' ){
                self.holder.css( self.options.style(self) )
             }
             if( self.state._type != 'location' ) return

             var name = message.topic.split('/').pop()
             var batt = self.state.batt
             var changed = self.state.created_at

             if( !(name in self.markers) )
                 self.markers[name] = L.mapquest.textMarker([self.state.lat, self.state.lon]).addTo(self.map)
             
             var marker = self.markers[name];
             marker.setLatLng([self.state.lat, self.state.lon]);
             marker.setText({ text: name, subtext: moment(changed*1000).format("HH:mm")+" "+batt+"%"})

             var markers = Object.keys(self.markers).map(function(key){return self.markers[key];});
             var group = new L.featureGroup(markers);
             self.map.panInsideBounds(group.getBounds());
          }
      );
   };
   this.init();
}

})