let adaptors = {};

export function register(name, adaptor) {
  if (adaptor.isSupported()) {
    adaptors[name] = adaptor;
  }
}

export function getAdaptors() {
  return adaptors;
}