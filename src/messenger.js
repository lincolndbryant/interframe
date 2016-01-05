import EventEmitter from 'wolfy87-eventemitter'
import assign from 'object-assign'
import DEFAULTS from './options'
import nativePromiseAdaptor from './promise-adaptors/native'
import {getAdaptors} from './promise-adaptors'

export default class Messenger {

  constructor(remoteWindow, options={}) {
    this.remoteWindow = remoteWindow;
    this.options = assign({}, DEFAULTS, options);
    this.promiseAdaptor = getAdaptors()[this.options.promiseAdaptor];

    this.callbacks = {};
    this.deferreds = {};
    this.queue = [];
    this.idIncrement = 0;
    this.onMessage = this.onMessage.bind(this);

    this.ee = new EventEmitter();
    this.on = this.ee.on.bind(this.ee);
    this.off = this.ee.off.bind(this.ee);
    window.addEventListener('message', this.onMessage, false);
  }

  postMessage(message, callback) {
    let deferred;
    if (this.promiseAdaptor) {
      deferred = this.promiseAdaptor.defer();
    }
    if (message.response && message._callbackId) {
      message.response._end = +new Date();
      message.response._start = message._start;
    } else {
      message._start = +new Date();
      this.idIncrement++;
      message._callbackId = this.idIncrement;
      if (typeof callback == 'function') {
        this.callbacks[message._callbackId] = callback;
      }
      if (deferred) {
        this.deferreds[message._callbackId] = deferred;
      }
    }
    if (this.loading) {
      this.queue.push(message);
    } else {
      this._send(message);
    }
    return typeof deferred.promise == 'function' ? deferred.promise() : deferred.promise
  }

  _send(message) {
    this.log('Posting message to ' + this.options.origin, message);
    let serialized = this.options.serialize(message);
    return this.remoteWindow.postMessage(serialized, this.options.origin);
  }

  onMessage(e) {
    let validMessage = false,
      message;
    try {
      message = this.options.deserialize(e.data)
      validMessage = true
    } catch (_error) {
      e = _error;
      message = e.data
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
    if (message.response && message._callbackId) {
      if (this.callbacks[message._callbackId]) {
        this.callbacks[message._callbackId](message.response);
        delete this.callbacks[message._callbackId];
      }
      if (this.deferreds[message._callbackId]) {
        this.deferreds[message._callbackId].resolve(message.response);
        delete this.deferreds[message._callbackId];
      }
    }
    return this.ee.trigger('message', [message]);
  }

  log(...message) {
    try {
      if (window.localStorage && localStorage.getItem('INTERFRAME_DEBUG')) {
        return console.log(...message);
      }
    } catch (e) { }
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