# yaff-routing v1.0.1

Simple frontend routing with pretty similar to nodejs express API.

## Install

```javascript
npm install yaff-routing
// or
yarn add yaff-routing
```

## Reference

For detailed reference [go here](https://github.com/taburetkin/yaff-routing/blob/master/reference.md)

## How to use

This package is shipped as pure es6 module and it should be transpiled and minified by your own during bundle time of your application.  
Btw, there is a special packed `es5 umd` and `esm` versions in the `lib` folder for stand alone include.

> **NOTE!**  
> This package internally uses `URL`, `addEventListener`, window's `popstate` event and `history.pushState`, so if you are going to use it with **IE11** you have to provide polifylls for that. I've tested it with `core-js` and `jquery` and it seems that its enough for using in old browsers.

### Ideology

1. you should define your app's entry points.

```javascript
routing.get('my/some/page', (req, res) => {});
```

2. start routing

```javascript
routing.start();
```

3. use `routing.navigate` when you have to invoke route middlewares and the history backward and forward will be handled automaticaly.

```javascript
routing.navigate('my/some/page');
```

At this point there are only two methods to define route handlers: `get` and `use`, so those are not awailable: `put`, `post`, `patch`, `delete`, etc.

### Simple use case:

```javascript
import { routing } from 'yaff-routing';

//define middleware for root page http://localhost
routing.get('', () => {
  console.log('this is main page');
});

//define middleware for articles page http://localhost/articles
routing.get('articles', () => {
  console.log('this is articles page');
});

//define middleware for article page http://localhost/articles/[id]
routing.get('articles/:id', (req) => {
  let articleId = req.args.id;
  console.log(`this is article page with id ${articleId}`);
});

// launch routing
routing.start();

// changes browser location and invokes all registered handlers
routing.navigate('articles/123');
```

### Starting routing

By default routing does not do anything until you start it.  
You can define route handlers at any time during application lifecycle, but you have to `start` routing when you wants to begin to handle requests.

```javascript
routing.start();
```

### Configuration

So, if you are going to use it as stand alone library, then all you have to do is just use `routing`. It includes `config` - the configuration namesace and it in turn holds all necessary definitions:  
`let router = new routing.config.Router();` - see full reference for details

You can extend any class with your own, but don't forget to put it in config if you want your new classes will be used by default:

```javascript
class MyRouter extends Router { ... }
config.Router = MyRouter;

class MyRequestContext extends RequestContext { ... }
config.RequestContext = MyRequestContext;

```

### Middlewares chain

As in nodejs express routing you can setup multiple middlewares for each route, they will be executed in order.

```javascript
import { routing } from 'yaff-routing';

routing.get(
  'some/deep/route',
  (req, res, next) => {
    console.log('this is first middleware');

    //if you need to proceed to the next middleware
    //you should call next()
    next();
  },
  (req, res, next) => {
    console.log('this is second middleware');
    next();
  },
  () => {
    console.log('this is last middleware');
  }
);
```

Next example illustrates one of possible ways of using middlewares chain:

```javascript
import { routing } from 'yaff-routing';

function validate(req, res, next) {
  let articleId = parseInt(req.args.id, 10);
  // we expect the id be a number
  if (isNaN(articleId)) {
    //setting up `notfound` error in response object;
    //end stoping the process by not calling `next`
    res.notFound();
  } else {
    next();
  }
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

// starting routing with defined notfound and default error handler
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

#### Request processing

In the middle of middlewares chain you have to call `next()` to invoke next middleware.

```javascript
const middleware = (req, res, next) => {
  if (shouldStopPrecessing) {
    return; // will stop processing the request
  } else {
    next(); // will execute next middleware in the middlewares chain
  }
};
```

### Common middleware

Sometimes you have to define common middleware for all your routes

```javascript
import { routing } from 'yaff-routing';

//this middleware will be executed on each route
function logger(req) {
  console.log('the path is', req.path);
}

routing.use(logger);
```

### Error handling

Sometimes you have to setup an error during processing the request.  
By default there is no any handlers and you have to define it by your own.  
In case there is no routeHandler for processing request there will be a try to invoke `notfound` handler.
In case the `response.error` is instance of `Error` then there will be a try to invoke `exception`.  
In case there is no error handler found then there will be a try to invoke `default` handler.

```javascript
routing.use((req, res, next) => {
  // custom error
  // all errors instances of Error will be processed with `exception` handler, in case you define it.
  res.setError(new Error('some error'));

  // notallowed handler
  // will try to invoke `notallowed` handler and if it does not exist then `default` handler
  res.setError('notallowed');

  // or with shorthand
  res.notAllowed(); //which internally do the same

  // notfound handler
  res.setError('notfound');
  res.notFound(); // or this one

  // setting custom handler
  res.setError('myOwnHandler');

  // setting undefined error, it will be handled by `default` handler
  res.setError('something-not-defined');
});

routing.start({
  errorHandlers: {
    default(error, req, res) {
      //all undefined errors goes here
    },
    exception(error) {
      //all Error's goes here
    },
    notfound() {
      // show notfound page
    },
    notallowed() {
      // show notallowed page
    },
    myOwnHandler() {
      // some custom error handler
    },
  },
});
```

You can provide `errorHandlers` at the start time, then will be invoked `routing.instance.setErrorHandlers` with "merge" behavior.
Also, you can call `setErrorHandlers` on main router at any time.

> **NOTE**  
> ErrorHandlers in nested routers not used

### Understanding route middlewares order

Each routeHandler executes middlewares in this order:  
global middlewares, then ruote middlewares  
`global1 -> global2 -> route1 -> route2`

#### Adding and removing global middleware.

Global middlewares always added to the end of the globals array.
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

#### Route middlewares

Route middlewares can be added in two ways  
`routing.get(route, middlewareOne, middlewareTwo)` - adds middlewares to the end of route's middlewares array  
`routing.use(route, middleware)` - adds middleware to the begining of route's array

```javascript
// global middlewares are defined in previous example
// as globalHandler1 and globalHandler3

const routeHandler1 = (req, res, next) => next();
const routeHandler2 = (req, res, next) => next();
const routeHandler3 = (req, res, next) => next();

routing.get('somepage', routeHandler1, routeHandler2);
// execution order for /somepage is
// globalHandler1 -> globalHandler3 -> routeHandler1 -> routeHandler2

routing.get('somepage', routeHandler3);
// execution order for /somepage is
// globalHandler1 -> globalHandler3 -> routeHandler1 -> routeHandler2 -> routeHandler3

routing.remove('somepage', routeHandler3);
// execution order for /somepage is
// globalHandler1 -> globalHandler3 -> routeHandler1 -> routeHandler2

// Now lets add middleware before
// for this we will use `routing.use` instead of `routing.get`
routing.use('somepage', routeHandler3);
// execution order for /somepage is
// globalHandler1 -> globalHandler3 -> routeHandler3 -> routeHandler1 -> routeHandler2
```

### Nesting routers

You can organize your entry points with multiple routers.

```javascript
import { routing, Router } from 'yaff-routing';

const account = new Router();

// configuring login page
account.get('login', (req, res) => { ... });
// configuring registration page
account.get('registration', (req, res) => { ... });

const articles = new Router();

// configuring articles list page
articles.get('', (req, res) => { ... });
// configuring article page
articles.get(':id', (req, res) => { ... });

routing.use('acc', account);
routing.use('articles', articles);

routing.start();

```

Each router can hold another routers as deep as you need.  
There is only one limitation - you can not set up circular routes like this

```javascript
import { routing, Router } from 'yaff-routing';

const foo = new Router();
const bar = new Router();

bar.use('foo', foo);
foo.use('bar', bar);

// this will throw circular error at the later time.
```

### Request arguments

Its possible to specify routes with dynamic segments which will be the request arguments at the processing time and will be placed in `req.args`:

```javascript
routing.get('articles/:category/:subcategory', (req, res) => {
  console.log(req.args.category, req.args.subcategory);
});

routing.start();
routing.navigate('articles/cats/funy');

//console: cats funy
```

[Take a look on detailed reference](https://github.com/taburetkin/yaff-routing/blob/master/reference.md)
