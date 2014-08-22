(function(){

  function Promise(){
    this._callbacks = [];
  }

  Promise.prototype.then = function(func, context){
    var promise;
    if(this._is_done){
      promise = func.apply(context, this.result);
    }else{
      promise = new Promise();
      this._callbacks.push(function(){
        var response = func.apply(context, arguments);
        if(response && typeof response.then === 'function') response.then(promise.done, promise);
      });
    }
    return promise;
  };

  Promise.prototype.done = function(){
    this.result   = arguments;
    this._is_done = true;
    for(var i = 0; i < this._callbacks.length; i++){
      this._callbacks[i].apply(null, arguments);
    }
    this._callbacks = [];
  };

  function parallel(promises){
    var promise = new Promise();
    var results = [];

    if(!promises || !promises.length){
      promise.done(results);
      return promise;
    }

    var num_done = 0;
    var total    = promises.length;

    function next(i){
      return function(){
        num_done  += 1;
        results[i] = Array.prototype.slice.call(arguments);
        if(num_done === total) promise.done(results);
      };
    }

    for(var i = 0; i < total; i++){
      promises[i].then(next(i));
    }
    return promise;
  }

  function waterfall(functions, args){
    var promise = new Promise();
    if(functions.length === 0){
      promise.done.apply(promise, args);
    }else{
      functions[0].apply(null, args).then(function(){
        functions.splice(0, 1);
        waterfall(functions, arguments).then(function(){
          promise.done.apply(promise, arguments);
        });
      });
    }
    return promise;
  }

  function _encode(data){
    var result = '';
    if(typeof data === 'string'){
      result = data;
    }else{
      var encode = encodeURIComponent;
      for(var key in data){
        if(data.hasOwnProperty(key)){
          result += '&' + encode(key) + '=' + encode(data[key]);
        }
      }
    }
    return result;
  }

  function newXHR(){
    var xhr;
    if(window.XMLHttpRequest){
      xhr = new XMLHttpRequest();
    }else if(window.ActiveXObject){
      try{
        xhr = new ActiveXObject('Msxml2.XMLHTTP');
      }catch(error){
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
      }
    }
    return xhr;
  }

  function ajax(method, url, data, options){
    var promise = new Promise();
    var xhr     = newXHR();
    var payload = _encode(data);

    data    = data || {};
    options = options || {};
    headers = options.headers || {};
    options.headers = _extend(G.headers, headers);
    options.type    = options.type || 'json'

    if(!method) method = 'GET';
    if(method === 'GET' && payload){
      url += '?' + payload;
      payload = null;
    }

    xhr.open(method, url);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    for(var header in options.headers){
      if(options.headers.hasOwnProperty(header)){
        xhr.setRequestHeader(header, options.headers[header]);
      }
    }

    function onTimeout(){
      xhr.abort();
      promise.done(xhr, null);
    }

    var timeout = G.ajaxTimeout;
    if(timeout){
      var tid = setTimeout(onTimeout, timeout);
    }

    xhr.onreadystatechange = function(){
      if(timeout){
        clearTimeout(tid);
      }
      if(xhr.readyState === 4){
        var err = (!xhr.status || (xhr.status < 200 || xhr.status >= 300) && xhr.status !== 304);
        var xhr_parsed = {};
        xhr_parsed = _parseXHR(xhr, options.type);
        if(err) promise.done(xhr_parsed, null); else promise.done(null, xhr_parsed.response, xhr_parsed);
      }
    };

    xhr.send(payload);
    return promise;
  }

  function _parseXHR(xhr, type){
    xhr_parsed = {};
    for(var attr in xhr){
      if(xhr.hasOwnProperty(attr)) xhr_parsed[attr] = xhr[attr];
    }
    if(xhr.responseText && type === 'json'){
      try{
        xhr_parsed.response = JSON.parse(xhr_parsed.responseText);
      }catch(e){}
    }else if(type === 'xml'){
      xhr_parsed.response = xhr_parsed.responseXML;
    }
    return xhr_parsed;
  }

  function _extend() {
    var obj = {};
    for(var i = 0; i < arguments.length; i++){
      for(var prop in arguments[i]) {
        if(hasOwnProperty.call(arguments[i], prop)) {
          obj[prop] = arguments[i][prop];
        }
      }
    }
    return obj;
  }

  var G = {
    Promise     : Promise,
    parallel    : parallel,
    waterfall   : waterfall,
    ajax        : ajax,
    headers     : {},
    ajaxTimeout : 0
  };

  window.G = G;

})();
