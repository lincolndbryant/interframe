(function() {
  var iframe = document.getElementsByTagName('iframe')[0];
  var messenger = new Interframe(document.origin, iframe.contentWindow);
  iframe.addEventListener('load', onIframeLoad);

  function onIframeLoad() {
    messenger.postMessage({
      action: 'hello',
      data: 'important stuff'
    }).then(function (message) {
      console.log(message)
    })
  }
})();