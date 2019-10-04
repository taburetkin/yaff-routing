# fe-routing-js
This is a small lib which helps to setup route based handlers.  
The API is pretty similar to nodejs express and supposed to be used in a browser with pushState (enabled by default) but old school hash based routes supported too.

## How to use
### Simple use case:
```javascript
import { routing } from 'fe-routing-js';

//define handler for root page http://localhost
routing.get('', () => {
	console.log('this is main page');
});

//define handler for articles page http://localhost/articles
routing.get('articles', () => {
	console.log('this is articles page');
});

//define handler for article page http://localhost/articles/[id]
routing.get('articles/:id', (req) => {
	let articleId = req.args.id;
	console.log(`this is article page with id ${articleId}`);
});

// launch routing
routing.start();

```
### Starting routing
By default routing does not do anything until you start it.  
You can define route handlers at any time during application lifecycle, but you have to `start` routing when you wants to begin to handle requests.  

```javascript
routing.start();
```

### Handlers chain
As in nodejs express routing you can setup multiple handlers for each route, they will be executed in order.
```javascript
import { routing } from 'fe-routing-js';

routing.get('some/deep/route', (req, res, next) => {
	console.log('this is first handler');
	
	//if you need to proceed to the next handler
	//you should call next()
	next(); 

}, (req, res, next) => {
	
	console.log('this is second handler');
	next();

}, () => {
	console.log('this is last handler');
});

```

#### Usecase
Next snipet illustrates one of possible ways of using handlers chain:

```javascript
import { routing } from 'fe-routing-js';

function validate(req, res, next) {
	let articleId = parseInt(req.args.id, 10);
	// we expect the id be a number
	if (isNaN(articleId)) {
		//setting up `notfound` error in response object;
		res.notFound();
	}
	next();
}

async function fetchArticle(req, res, next) {
	try {
		// fetching the article from the backend;
		let article = await fetch('/api/articles/' + req.args.id);
		//putting the article into response object
		res.locals.article = article;
		next();

	} catch(e) {
		res.setError(e);
	}
}

function showArticle(req, res) {
	console.log(res.locals.article);
}

routing.get('articles/:id', validate, fetchArticle, showArticle);

// starting routing with redefined notfound and default error handler
routing.start({
	errorHandlers: {
		notfound() {
			console.log('the article you are looking for is not found');
		}
		default(err) {
			console.log('there was an error', err);
		}
	}
});

```


#### request processing
In the middle of handlers chain you have to call `next()` to invoke next handler.
```javascript
const handler = (req, res, next) => {
	if (shouldStopPrecessing) {
		return; // will stop processing the request
	} else {
		next(); // will execute next handler in the handlers chain
	}
}
```

### Common middleware
Sometimes you have to define common handler for all your routes
```javascript
import { routing } from 'fe-routing-js';

//this handler will be executed on each route
function logger(req) {
	console.log('the path is', req.path);
}

routing.use(logger);

```

### Error handling
Sometimes you have to setup an error during processing the request.
And there are three default handlers
`notfound`, `notallowed` and `default`
Btw, you can setup as many different handlers as you need.
```javascript

routing.use((req, res, next) => {

	// custom error
	// all errors instances of Error will be processed with default handler
	res.setError(new Error('some error'));

	// notallowed handler
	res.setError('notallowed');

	// or with shorthand
	res.notAllowed(); //which internally do the same

	// notfound handler
	res.setError('notfound');
	res.notFound(); // or this one

	// setting custom handler
	res.setError('myOwnHandler')


});

routing.start({
	errorHandlers: {
		default(error, req, res) {
			//all javascript errors goes here
		},
		notfound() {
			// show notfound
		},
		notallowed() {
			// show notallowed
		},
		myOwnHandler() {
			// some custom error handler
		}
	}
});


```
### Understanding route handler order
Each routehandler executes defined callbacks in this order:  
global handlers, then ruote handler  
`global1 -> global2 -> route1 -> route2`

#### Adding and removing global handlers.  

Global handlers always added to the end of the globals array.
First added - first called. 

```javascript

const globalHandler1 = (req, res, next) => next();
const globalHandler2 = (req, res, next) => next();
const globalHandler3 = (req, res, next) => next();

routing.use(globalHandler1);
routing.use(globalHandler2);
routing.use(globalHandler3);
// execution order is
// globalHandler1 -> globalHandler2 -> globalHandler3

routing.remove(globalHandler2);
// execution order is
// globalHandler1 -> globalHandler3

```

#### Route handlers
Route handlers can be added in two ways  
`routing.get(route, handlerOne, handlerTwo)` - adds handler to the end of route's handler array  
`routing.use(route, handler)` - adds handler to the begining of route's array

```javascript
// global handlers are defined in previous example

const routeHandler1 = (req, res, next) => next();
const routeHandler2 = (req, res, next) => next();
const routeHandler3 = (req, res, next) => next();

routing.get('somepage', routeHandler1, routeHandler2);
// execution order for /somepage is
// handler1 -> handler3 -> routeHandler1 -> routeHandler2


routing.get('somepage', routeHandler3);
// execution order for /somepage is
// handler1 -> handler3 -> routeHandler1 -> routeHandler2 -> routeHandler3

routing.remove('somepage', routeHandler3);
// execution order for /somepage is
// handler1 -> handler3 -> routeHandler1 -> routeHandler2


// Now lets add handler before
// for this we will use `routing.use` instead of `routing.get`
routing.use('somepage', routeHandler3);
// execution order for /somepage is
// handler1 -> handler3 -> routeHandler3 -> routeHandler1 -> routeHandler2


```
------

# Reference

## routing
`import { routing } from 'fe-routing-js';`  
The main thing.  
In most cases it will be enough just use this api set.

### routing methods:

#### start(options)
Starts the routing with given options.
```
options = {
	pushState: bool, optional, true by default
	errorHandlers: object, optional
}
```
#### stop()
Stops route handling.
#### isStarted()
Returns true if routing started
#### get(routeString, handler1, handler2, ...)
Registers the route if it's not and adds route handlers.

#### use(handler)
Register global handler.
#### use(routeString, handler)
Registers the route if it's not and unshift handler to the route's handler chain.
#### remove(handler)
Removes global handler.
#### remove(routeString, handler)
Removes route's handler.
