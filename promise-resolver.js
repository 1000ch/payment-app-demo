class PromiseResolver {
  constructor(promise) {
    this.promise = promise;
  }

  resolve(...args) {
    this.promise.resolve(...args);
  }

  reject(...args) {
    this.promise.reject(...args);
  }
}
