Date.prototype.date_formatters = {
      "yyyy": function(d){ return d.getFullYear(); },
      "mmm":  function(d){ return ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'][ d.getMonth() ]; },
      "mm":   function(d){ return d.getMonth()>8?d.getMonth()+1:"0"+(d.getMonth()+1); },
      "dd":   function(d){ return d.getDate()>9?d.getDate():"0"+d.getDate(); },
      "HH":   function(d){ return d.getHours()>9?d.getHours():"0"+d.getHours(); },
      "MM":   function(d){ return d.getMinutes()>9?d.getMinutes():"0"+d.getMinutes(); },
      "SS":   function(d){ return d.getSeconds()>9?d.getSeconds():"0"+d.getSeconds(); },
      "W":    function(d){ return ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'][d.getDay()] }
};


Date.prototype.format = function(format){
    for( key in Date.prototype.date_formatters ){
        format = format.replace(key, Date.prototype.date_formatters[key]( this ) );
    }
    return format;
};

Date.prototype.trunc = function(){
    this.setHours(0);
    this.setMinutes(0);
    this.setSeconds(0);
    this.setMilliseconds(0);
};
