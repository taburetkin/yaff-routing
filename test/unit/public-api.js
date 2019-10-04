import { Instance, debounce, delay } from '../tests-helpers';
//import events from '../../api';
let emiter;
let counter = 0;
let counter2 = 0;
let context1 = { type: 1 };
let listener;
let increment = () => counter++;
let increment2 = () => counter2++;

let context1Increment = function() {
	this == context1 && increment();
}

let notContext1Increment = function() {
	this != context1 && increment();
}

beforeEach(function() {
	counter = 0;
	counter2 = 0;
	emiter = new Instance('emiter');
	listener = new Instance('emiter');
});

describe('on', function() {

	describe('string', function() {

		it('should add listener by event name', function() {
			emiter.on('a', increment);
			emiter.trigger('a');
			expect(counter).to.be.equal(1);
		});

		it('should add listener by event name with context', function() {
			emiter.on('a', context1Increment, context1);
			emiter.trigger('a');
			expect(counter).to.be.equal(1);
		});

		it('should add listeners for events separated by space', function() {
			emiter.on('a b', increment);
			emiter.trigger('a');
			emiter.trigger('b');
			expect(counter).to.be.equal(2);
		});

		it('should add listeners for events separated by space with context', function() {
			emiter.on('a b', context1Increment, context1);
			emiter.on('c', context1Increment);
			emiter.trigger('a');
			emiter.trigger('b');
			emiter.trigger('c');
			expect(counter).to.be.equal(2);
		});
	});

	describe('events hash', function() {
		it('should add listeners for given event hash', function() {
			emiter.on({ a: increment, b: increment });
			emiter.trigger('a');
			emiter.trigger('b');
			expect(counter).to.be.equal(2);
		});

		it('should add listeners for given event hash with context', function() {
			emiter.on({ a: context1Increment, b: increment }, context1);
			emiter.on('c', context1Increment);
			emiter.trigger('a');
			emiter.trigger('b');
			emiter.trigger('c');
			expect(counter).to.be.equal(2);
		});

		/** { 'a b', c } */
		it('should respect space separated events', function() {
			emiter.on({
				'a c': increment,
				b: increment
			});
			emiter.trigger('a');
			emiter.trigger('b');
			emiter.trigger('c');
			expect(counter).to.be.equal(3);
		});

		it('should respect space separated events with context', function() {
			emiter.on({
				'a c': context1Increment,
				b: increment,
				d: notContext1Increment
			}, context1);
			emiter.trigger('a');
			emiter.trigger('b');
			emiter.trigger('c');
			emiter.trigger('d');
			expect(counter).to.be.equal(3);
		});
	});


});

describe('once', function() {
	describe('string', function() {
		/** a */
		it('should add listener for given event name', function() {
			emiter.once('a', increment);
			emiter.trigger('a');
			emiter.trigger('a');
			expect(counter).to.be.equal(1);
		});

		it('should add listener for given event name with context', function() {
			emiter.once('a', context1Increment, context1);
			emiter.trigger('a');
			emiter.trigger('a');
			expect(counter).to.be.equal(1);
		});

		/** a b */
		it('should add listeners for given event names separated by space', function() {
			emiter.once('a b', increment);
			emiter.trigger('a');
			emiter.trigger('b');
			emiter.trigger('a');
			emiter.trigger('b');
			expect(counter).to.be.equal(2);
		});

		it('should add listeners for given event names separated by space with context', function() {
			emiter.once('a b', context1Increment, context1);
			emiter.once('c', context1Increment);
			emiter.trigger('a');
			emiter.trigger('b');
			emiter.trigger('c');
			emiter.trigger('a');
			emiter.trigger('b');
			emiter.trigger('c');
			expect(counter).to.be.equal(2);
		});

	});

	describe('events hash', function() {
		/** { a, b } */
		it('should add listeners for given event hash', function() {
			emiter.once({ a: increment, b: increment });
			emiter.trigger('a');
			emiter.trigger('b');
			emiter.trigger('a');
			emiter.trigger('b');
			expect(counter).to.be.equal(2);
		});

		it('should add listeners for given event hash with context', function() {
			emiter.once({ a: context1Increment, b: increment }, context1);
			emiter.once('c', context1Increment);
			emiter.trigger('a');
			emiter.trigger('b');
			emiter.trigger('c');
			emiter.trigger('a');
			emiter.trigger('b');
			emiter.trigger('c');
			expect(counter).to.be.equal(2);
		});

		/** { 'a b', c } */
		it('should add listeners for given event hash with respect to space separated events', function() {
			emiter.once({
				'a c': increment,
				b: increment
			});
			emiter.trigger('a');
			emiter.trigger('b');
			emiter.trigger('c');
			emiter.trigger('a');
			emiter.trigger('b');
			emiter.trigger('c');
			expect(counter).to.be.equal(3);
		});

		it('should add listeners for given event hash with respect to space separated events with context', function() {
			emiter.once({
				'a c': context1Increment,
				b: increment,
				d: notContext1Increment
			}, context1);
			emiter.trigger('a');
			emiter.trigger('b');
			emiter.trigger('c');
			emiter.trigger('d');
			emiter.trigger('a');
			emiter.trigger('b');
			emiter.trigger('c');
			emiter.trigger('d');
			expect(counter).to.be.equal(3);
		});

	});

});

describe('off', function() {

});

describe('listenTo', function() {

});

describe('listenToOnce', function() {

});

describe('stopListening', function() {

});

