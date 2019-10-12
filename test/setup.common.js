const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiPromise = require('chai-as-promised');

chai.use(chaiPromise);
chai.use(sinonChai);

global.chai = chai;
global.sinon = sinon;
global.expect = global.chai.expect;
global.document = {
  location: new URL('', 'http://localhost')
};
global.baseUrl = new URL('', 'http://localhost');
global.window = {
  addEventListener(type, cb) {
    this['on' + type] = cb;
  },
  removeEventListener(type) {
    delete this['on' + type];
  }
};
global.history = {
  states: [],
  pushState(state, title, url) {
    document.location.href = url;
    this.states.unshift({ url: document.location.href, state, title });
  },
  popState() {
    this.states.shift();
    let moveTo = this.states[0];
    global.document.location.href = moveTo
      ? moveTo.url
      : document.location.origin;
    if (arguments.length != 0) {
      moveTo = null;
    }
    return (
      moveTo && global.window.onpopstate && global.window.onpopstate(moveTo)
    );
  }
};

beforeEach(function() {
  this.sinon = global.sinon.createSandbox();
});

afterEach(function() {
  this.sinon.restore();
});
