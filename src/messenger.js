'use es6';

let $ = 'jQuery';

export default class Messenger {

  constructor(remoteDomain, remoteWindow, json, promiseAdaptor) {
    this.remoteDomain = remoteDomain;
    this.window = remoteWindow;
    this.json = json != null ? json : true;
    this.adaptor = promiseAdaptor;
    this.onMessage = this.onMessage.bind(this);
    this.callbacks = {};
    this.deferreds = {};
    this.queue = [];
    this.idIncrement = 0;
    window.addEventListener('message', this.onMessage, false);
  }

  postMessage(message, callback) {
    var deferred;
    deferred = this.adaptor.defer();
    if (message.response && message._callbackId) {
      message.response._end = +new Date();
      message.response._start = message._start;
    } else {
      message._start = +new Date();
      this.idIncrement++;
      message._callbackId = this.idIncrement;
      this.deferreds[message._callbackId] = deferred;
      if (typeof callback == 'function') {
        this.callbacks[message._callbackId] = callback;
      }
    }
    if (this.loading) {
      this.queue.push(message);
    } else {
      this._send(message);
    }
    return typeof deferred == 'function' ? deferred.promise() : deferred.promise
  }

  _send(message) {
    var serialized;
    serialized = this.json ? JSON.stringify(message) : message;
    this.log('Posting message to ' + this.remoteDomain);
    this.log(message);
    return this.window.postMessage(serialized, this.remoteDomain);
  }

  onMessage(e) {
    var message, validMessage;
    validMessage = false;
    if (this.json) {
      try {
        message = JSON.parse(e.data);
        if ($.isPlainObject(message)) {
          validMessage = true;
        }
      } catch (_error) {
        e = _error;
        message = e.data;
      }
    } else {
      validMessage = true;
      message = e.data;
    }
    if (!validMessage) {
      this.log("Invalid message received");
      this.log(message);
      return;
    }
    if (this.debug) {
      this.log("Received message from " + e.origin);
      this.log(message);
    }
    if ($.isPlainObject(message) && message.response && message._callbackId) {
      if (this.callbacks[message._callbackId]) {
        this.callbacks[message._callbackId](message.response);
        delete this.callbacks[message._callbackId];
      }
      if (this.deferreds[message._callbackId]) {
        this.deferreds[message._callbackId].resolve(message.response);
        delete this.deferreds[message._callbackId];
      }
    }
    return $(this).trigger('message', message);
  }

  log(message) {
    if ((typeof localStorage !== "undefined" && localStorage !== null ? localStorage.getItem('INTERFRAME_DEBUG') : void 0) && (window.console != null) && (window.console.log != null)) {
      return console.log(message);
    }
  }

  setLoading(loading) {
    var message, _results;
    this.loading = loading;
    if (!this.loading) {
      _results = [];
      while (message = this.queue.shift()) {
        _results.push(this._send(message));
      }
      return _results;
    }
  }
}

window.Interframe = Messenger;