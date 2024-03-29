//import config from '../../config';
//Object.assign(config, routing.config);

import { expect } from 'chai';
import { invoke, buildSegments, compare } from '../../utils';
//import config from '../../config';
const url = global.normalizeUrl;
const urlParams = global.replaceUrlParams;
const config = global.config;
//const config = global.config;

describe("utils coverage", () => {



  describe("url", () => {
    afterEach(function () {
      config.useHashes = false;
    });

    it('should treat url() as root url, equal to `/`', function () {
      let val = url();
      expect(val).to.be.equal('/');
    });

    it('should treat url() as root url, equal to `/#/` when useHashes is true', function () {
      config.useHashes = true;
      let val = url();
      expect(val).to.be.equal('/#/');
    });

    it('should convert `asd/qwe` to `/asd/qwe`', function () {
      let value = 'asd/qwe';
      let expected = '/asd/qwe'
      expect(url(value)).to.be.equal(expected);
    });

    it('should convert `asd/qwe` to `/#/asd/qwe` when useHashes is true', function () {
      config.useHashes = true;
      let value = 'asd/qwe';
      let expected = '/#/asd/qwe'
      expect(url(value)).to.be.equal(expected);
    });

    it('`/asd/qwe` should stay as `/asd/qwe`', function () {
      let value = '/asd/qwe';
      let expected = '/asd/qwe'
      expect(url(value)).to.be.equal(expected);
    });

    it('`/asd/qwe` should became `/#/asd/qwe` when useHashes is true', function () {
      config.useHashes = true;
      let value = '/asd/qwe';
      let expected = '/#/asd/qwe'
      expect(url(value)).to.be.equal(expected);
    });

    it('should convert `#asd/qwe` to `/#asd/qwe` (note!: no slash between # and asd)', function () {
      let value = '#asd/qwe';
      let expected = '/#asd/qwe';
      expect(url(value)).to.be.equal(expected);
    });

    it('should convert `#asd/qwe` to `/#/asd/qwe` when useHashes is true', function () {
      config.useHashes = true;
      let value = '#asd/qwe';
      let expected = '/#/asd/qwe';
      expect(url(value)).to.be.equal(expected);
    });



  });

  describe("replaceUrlParams", () => {
    it('should not throw if called without arguments', () => {
      expect(urlParams).to.not.throw();
    });
    it('should return exactly given argument if its falsy', () => {
      let res1 = urlParams(false, {});
      let res2 = urlParams(null, {});
      let res3 = urlParams(0, {});
      let res4 = urlParams('', {});
      expect(res1).to.be.false;
      expect(res2).to.be.null;
      expect(res3).to.be.equal(0);
      expect(res4).to.be.equal('');
    });
    it('should return exactly given argument if no args was provided', () => {
      let res1 = urlParams(false);
      let res2 = urlParams(null);
      let res3 = urlParams(0);
      let res4 = urlParams('');
      let res5 = urlParams('foo/bar');
      expect(res1).to.be.false;
      expect(res2).to.be.null;
      expect(res3).to.be.equal(0);
      expect(res4).to.be.equal('');
      expect(res5).to.be.equal('foo/bar');
    });
    it('should remove trailing optional slash (/)', () => {
      let res = urlParams('asd/qwe(/)', { id: 1 });
      expect(res).to.be.equal('asd/qwe');
    });
    it('should remove optional segment if its missing in args', () => {
      let res = urlParams('asd/qwe(/:optional)/finaly', { id: 1 });
      expect(res).to.be.equal('asd/qwe/finaly');
    });
    it('should leave untouched segment missing in args', () => {
      let res = urlParams('asd/qwe/:zxc', { id: 1 });
      expect(res).to.be.equal('asd/qwe/:zxc');
    });
    it('should replace params', () => {
      let res = urlParams('asd(/:qwe)/:zxc', { zxc: 'bar', qwe: 'foo' });
      expect(res).to.be.equal('asd/foo/bar');
    })
  });

  describe('buildSegments', function () {
    const paths = {
      '(/)': [''],
      'foo/bar/': ['foo', 'bar'],
      'foo/bar(/)': ['foo', 'bar'],
      '/foo/bar(/)': ['foo', 'bar'],
      '/foo/bar/': ['foo', 'bar'],
      'foo/bar': ['foo', 'bar'],
      'foo/:bar': ['foo', ':bar'],
      'foo/(:bar)': ['foo', '(:bar)'],
      'foo/(:bar)/(:baz)': ['foo', '(:bar)', '(:baz)'],
      '/foo(/:bar)(/:baz)': ['foo', '(:bar)', '(:baz)'],
      'foo(/:bar)/ufo(/:baz)': ['foo', '(:bar)', 'ufo', '(:baz)'],
      'foo(/:bar)': ['foo', '(:bar)'],
      'foo(/:bar-:man)': ['foo', '(:bar-:man)']
    };
    it('should convert path to modified array with respect to optional segments', function () {
      Object.keys(paths).forEach(key => {
        expect(buildSegments(key), 'at ' + key).to.be.eql(paths[key]);
      });
    });
  });

  describe('comparing utils', function () {
    const basedata = [
      {
        name: 'Oddri',
        age: 98,
        sex: 'female'
      },
      {
        name: 'John',
        age: 15,
        sex: 'male'
      },
      {
        name: 'Hugo',
        age: 37,
        sex: 'male'
      },
      {
        name: 'Tifany',
        age: 17,
        sex: 'female'
      },
      {
        name: 'Grant',
        age: 70,
        sex: 'male'
      },
      {
        name: 'Sara',
        age: 41,
        sex: 'female'
      }
    ];
    let people;
    const first = () => people[0];
    let last = () => people[people.length - 1];
    beforeEach(function () {
      people = basedata.slice(0);
    });
    describe('when using function as third argument', function () {
      it('should order by age in asc', function () {
        people.sort((a, b) => compare(a, b, x => x.age));
        expect(first().age).to.be.equal(15);
        expect(last().age).to.be.equal(98);
      });
      it('should order by age in desc', function () {
        people.sort((a, b) => compare(b, a, x => x.age));
        expect(first().age).to.be.equal(98);
        expect(last().age).to.be.equal(15);
      });
    });
    describe('when ussing array of functions as third arguyment', function () {
      it('should order females first, then by age ascending', function () {
        people.sort((a, b) => compare(a, b, [x => x.sex, x => x.age]));
        //console.log(people.map(m => `[${m.sex}:${m.age}]`));
        expect(first().age).to.be.equal(17);
        expect(first().sex).to.be.equal('female');
        expect(last().age).to.be.equal(70);
        expect(last().sex).to.be.equal('male');
      });
      it('should order males first, then by age descending', function () {
        people.sort((a, b) => compare(b, a, [x => x.sex, x => x.age]));
        //console.log(people.map(m => `[${m.sex}:${m.age}]`));
        expect(first().age).to.be.equal(70);
        expect(first().sex).to.be.equal('male');
        expect(last().age).to.be.equal(17);
        expect(last().sex).to.be.equal('female');
      });
      it('should not order if third argument is wrong', function () {
        people.sort((a, b) => compare(b, a, 123));
        expect(first().age).to.be.equal(98);
        expect(last().age).to.be.equal(41);
      });
    });
  });


  describe('invoke', () => {
    let arg, res, a1, a2, a3, context;

    beforeEach(function () {
      arg = this.sinon.spy();
      a1 = 'foo';
      a2 = 'bar';
      a3 = {};
      context = {};
    });

    it('should return arg if its not a function', () => {
      arg = 'foo';
      res = invoke(arg);
      expect(res).to.be.equal(arg);
    });

    it('should invoke arg without context if its a function and there is no context', () => {
      invoke(arg);
      expect(arg).to.be.calledOnce;
    });

    it('should invoke arg without context with arguments if its a function and there is no context but arguments are exists', () => {
      invoke(arg, null, a1, a2, a3);
      expect(arg).to.be.calledOnce.and.calledWithExactly(a1, a2, a3);
    });

    it('should invoke arg without context with argument if its a function and there is no context and only one argument', () => {
      invoke(arg, null, a1);
      expect(arg).to.be.calledOnce.and.calledWithExactly(a1);
    });

    it('should invoke arg with context without arguments if its a function and there is a context but no arguments are exists', () => {
      invoke(arg, context);
      expect(arg).to.be.calledOnce.and.calledOn(context);
    });

    it('should invoke arg with context and arguments if its a function and there is a context and arguments are exists', () => {
      invoke(arg, context, a1, a2, a3);
      expect(arg).to.be.calledOnce.and.calledOn(context).calledWithExactly(a1, a2, a3);
    });

    it('should return invoke result', function () {
      let res = {};
      arg = () => res;
      let returned = invoke(arg);
      expect(returned).to.be.equal(res);
    });

  });

})