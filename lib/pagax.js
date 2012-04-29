// Created by Jonathan Eatherly, (https://github.com/joneath)
// MIT license
// Version 0.1

var pajax = (function() {
  var pajax = function(callbacks) {
    var self = {},
        exports = {
          page: 0,
          collection: []
        };

    (function initialize() {
      callbacks = callbacks || {};
      callbacks.parse = callbacks.parse || function(results) { return results };
      callbacks.onPage = callbacks.onPage || function() {};
      callbacks.onError = callbacks.onError || function() {};
      callbacks.onComplete = callbacks.onComplete || function() {};
    }());

    self.request = function(url) {
      var dataType = url.indexOf("callback") != -1 ? "jsonp" :"json";

      $.ajax({
        url: url,
        dataType: dataType,
        type: "GET"
      })
      .success(self.handleResponse)
      .error(callbacks.onError);
    };

    self.handleResponse = function(response) {
      var nextPage,
          parsedResponse;

      parsedResponse = callbacks.parse(response);
      exports.collection.push(parsedResponse);
      exports.page += 1;

      nextPage = callbacks.onPage(response, exports);
      if (!nextPage) {
        self.onComplete();
      } else {
        self.request(nextPage);
      }
    };

    self.onComplete = function() {
      callbacks.onComplete(exports.collection);
    };

    return self.handleResponse;
  };

  window.pajax = pajax;

  return pajax;
}());

