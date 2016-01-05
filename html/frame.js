(function() {
  var messenger = new Interframe(document.origin, window.parent);

  messenger.on('message', function (message) {
    debugger
  })
})();