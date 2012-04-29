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
      callbacks.onPage = callbacks.onPage || function() {};
      callbacks.onError = callbacks.onError || function() {};
      callbacks.onComplete = callbacks.onComplete || function() {};
    }());

    self.request = function(url) {
      $.get(url)
      .success(self.onPage)
      .error(self.onError);
    };

    self.handleResponse = function(response) {

      self.onPage(response);
    };

    self.onPage = function(response) {
      exports.page += 1;
      exports.collection.push(response);

      var nextPage = callbacks.onPage(response, exports);

      if (!nextPage) {
        self.onComplete();
      } else {
        self.request(nextPage);
      }
    };

    self.onError = function(response) {
      callbacks.onError(JSON.parse(response.responseText), exports);
    }

    self.onComplete = function() {
      callbacks.onComplete(exports.collection);
    };

    return self.handleResponse;
  };

  window.pajax = pajax;

  return pajax;
}());

