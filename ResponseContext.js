/**
 * holds response state.
 *
 * @prop {*} error - if not falsy will be passed to errorHandler
 * @prop {RequestContext} request - processing request's requestContext instance.
 * @prop {*} locals - the legal way to pass data between middlewares
 * @class ResponseContext
 */
class ResponseContext {
  constructor(req) {
    this.error = null;
    this.request = req;
    this.locals = {};
  }

  /**
   * Returns true if there is no error, otherwise false
   *
   * @returns {boolean}
   * @memberof ResponseContext
   */
  isOk() {
    return !this.error;
  }

  /**
   * Sets response error
   *
   * @param {*} error
   * @returns {ResponseContext}
   * @memberof ResponseContext
   */
  setError(error) {
    this.error = error;
    return this;
  }

  /**
   * Sets 'notfound' error, shorthand for setError('notfound')
   *
   * @returns {ResponseContext}
   * @memberof ResponseContext
   */
  notFound() {
    this.setError('notfound');
    return this;
  }

  /**
   * Sets 'notallowed' error, shorthand for setError('notallowed')
   *
   * @returns {ResponseContext}
   * @memberof ResponseContext
   */
  notAllowed() {
    this.setError('notallowed');
    return this;
  }
}

export default ResponseContext;
