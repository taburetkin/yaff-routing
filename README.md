# @yaff/routing (pre release)

Simple frontend routing with pretty similar to nodejs express API.

## Reference

For detailed reference [go here](https://github.com/taburetkin/@yaff/routing/blob/master/reference.md)

## How to use

This package is shipped as pure es6 module and it should be transpiled and minified by your own during bundle time of your application.  
Btw, there is a special packed `es5 umd` and `esm` versions in the `lib` folder for stand alone include.

> **NOTE!**  
> This package internally uses `URL`, `addEventListener`, window's `popstate` event and `history.pushState`, so if you are going to use it with **IE11** you have to provide polifylls for that. I've tested it with `core-js` and `jquery` and it seems that its enough for using in old browsers.

### Simple use case:

```javascript
import { routing } from '@yaff/routing';

//define middleware for root page http://localhost
routing.get('', () => {
  console.log('this is main page');
});

//define middleware for articles page http://localhost/articles
routing.get('articles', () => {
  console.log('this is articles page');
});

//define middleware for article page http://localhost/articles/[id]
routing.get('articles/:id', req => {
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

### Middlewares chain

As in nodejs express routing you can setup multiple middlewares for each route, they will be executed in order.

```javascript
import { routing } from '@yaff/routing';

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
import { routing } from '@yaff/routing';

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

#### request processing

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
import { routing } from '@yaff/routing';

//this middleware will be executed on each route
function logger(req) {
  console.log('the path is', req.path);
}

routing.use(logger);
```

### Error handling

Sometimes you have to setup an error during processing the request.  
By default there is no any handlers and you have to define it by your own.  
In case there is no routeHandler for precessing request the `notfound` handler will be invoked.
In case the `response.error` is instance of `Error` then `exception` handler will be invoked.  
In case there is no error handler found then `default` handler will be invoked.

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
    }
  }
});
```

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
// global middleware are defined in previous example

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

// Now lets add middleware before
// for this we will use `routing.use` instead of `routing.get`
routing.use('somepage', routeHandler3);
// execution order for /somepage is
// handler1 -> handler3 -> routeHandler3 -> routeHandler1 -> routeHandler2
```

[Take a look on detailed reference](https://github.com/taburetkin/@yaff/routing/blob/master/reference.md)
