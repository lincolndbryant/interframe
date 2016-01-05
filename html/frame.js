(function() {
  var messenger = new Interframe(window.parent);

  messenger.on('message', function (message) {
    message.response = {
      received: true
    }
    messenger.postMessage(message)
  })
})();