class ResponseContext {
  constructor(req) {
    this.request = req;
    this._processing = true;
    this.locals = {};
  }

  isOk() {
    return !this.error;
  }
  end() {
    this._processing = false;
    return this;
  }
  isEnded() {
    return this._processig == false;
  }
  setError(error) {
    this.error = error;
    return this;
  }
  notFound() {
    this.setError("notfound");
    return this;
  }
  notAllowed() {
    this.setError("notallowed");
    return this;
  }
}

export default ResponseContext;
