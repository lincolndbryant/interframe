import { register } from '.'

register('native', {

  isSupported: () => {
    return typeof window.Promise === 'function'
  },

  defer: () => {
    let deferred = {};
    let promise = new Promise((resolve, reject) => {
      deferred.resolve = resolve;
      deferred.reject = reject;
    })
    deferred.promise = promise;
    return deferred;
  }
});