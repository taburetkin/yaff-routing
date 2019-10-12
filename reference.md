## Modules

<dl>
<dt><a href="#module_routing">routing</a></dt>
<dd><p>This is main module.
By Default its only the thing you should use working with fe-routing-js</p>
</dd>
</dl>

## Classes

<dl>
<dt><a href="#Router">Router</a></dt>
<dd><p>Manipulates existing routeHandlers, global middlewares and processes the requests</p>
</dd>
<dt><a href="#RouteHandler">RouteHandler</a></dt>
<dd><p>Represents handler for a given string route.
When request occurs and request path matches handlres&#39;s route pattern
then all registered middlewares beeing invoked.</p>
</dd>
<dt><a href="#RequestContext">RequestContext</a></dt>
<dd><p>Represents request state.</p>
</dd>
<dt><a href="#ResponseContext">ResponseContext</a></dt>
<dd><p>Represents response state.</p>
</dd>
</dl>

## Objects

<dl>
<dt><a href="#configuration">configuration</a> : <code>object</code></dt>
<dd><p>Routing configuration.
You can provide your own versions of internal classes and setup some behavior.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#startOptions">startOptions</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#routingOptions">routingOptions</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="module_routing"></a>

## routing
This is main module.By Default its only the thing you should use working with fe-routing-js


* [routing](#module_routing)
    * [.config](#module_routing.config)
    * [.createRouter()](#module_routing.createRouter) ⇒ [<code>Router</code>](#Router)
    * [.get()](#module_routing.get) ⇒ [<code>Router</code>](#Router)
    * [.use()](#module_routing.use) ⇒ [<code>Router</code>](#Router)
    * [.isStarted()](#module_routing.isStarted) ⇒ <code>boolean</code>
    * [.start()](#module_routing.start) ⇒ [<code>Router</code>](#Router)
    * [.stop()](#module_routing.stop) ⇒ [<code>Router</code>](#Router)
    * [.remove()](#module_routing.remove) ⇒ [<code>RouteHandler</code>](#RouteHandler) \| <code>void</code>
    * [.navigate()](#module_routing.navigate)

<a name="module_routing.config"></a>

### routing.config
routing Configuration

**Kind**: static property of [<code>routing</code>](#module_routing)  
**See**: [configuration](#configuration)  
<a name="module_routing.createRouter"></a>

### routing.createRouter() ⇒ [<code>Router</code>](#Router)
Creates instance of Router with config.routingOptions.

**Kind**: static method of [<code>routing</code>](#module_routing)  
**Returns**: [<code>Router</code>](#Router) - Router instance  
<a name="module_routing.get"></a>

### routing.get() ⇒ [<code>Router</code>](#Router)
Proxy method to Router instance's `get`

**Kind**: static method of [<code>routing</code>](#module_routing)  
**See**: [Router.get](Router.get)  
<a name="module_routing.use"></a>

### routing.use() ⇒ [<code>Router</code>](#Router)
Proxy method to Router instance's `use`

**Kind**: static method of [<code>routing</code>](#module_routing)  
**See**: [Router.use](Router.use)  
<a name="module_routing.isStarted"></a>

### routing.isStarted() ⇒ <code>boolean</code>
Returns true if routing started

**Kind**: static method of [<code>routing</code>](#module_routing)  
<a name="module_routing.start"></a>

### routing.start() ⇒ [<code>Router</code>](#Router)
Starts routing

**Kind**: static method of [<code>routing</code>](#module_routing)  
**See**: [Router.start](Router.start)  
<a name="module_routing.stop"></a>

### routing.stop() ⇒ [<code>Router</code>](#Router)
Stops routing

**Kind**: static method of [<code>routing</code>](#module_routing)  
**See**: [Router.stop](Router.stop)  
<a name="module_routing.remove"></a>

### routing.remove() ⇒ [<code>RouteHandler</code>](#RouteHandler) \| <code>void</code>
Removes middleware or middleware's handler.Proxy method for Router instance's `remove`.

**Kind**: static method of [<code>routing</code>](#module_routing)  
**See**: [Router.stop](Router.stop)  
<a name="module_routing.navigate"></a>

### routing.navigate()
Initiates the request.Proxy method for Router instance's `navigate`.

**Kind**: static method of [<code>routing</code>](#module_routing)  
**See**: [Router.navigate](Router.navigate)  
<a name="Router"></a>

## Router
Manipulates existing routeHandlers, global middlewares and processes the requests

**Kind**: global class  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| routes | <code>RoutesManager</code> | Holds all registered routeHandlers |


* [Router](#Router)
    * [new Router([options])](#new_Router_new)
    * [.start(options)](#Router+start) ⇒ [<code>Router</code>](#Router)
    * [.stop()](#Router+stop) ⇒ [<code>Router</code>](#Router)
    * [.isStarted()](#Router+isStarted) ⇒ <code>boolean</code>
    * [.use(path, [middleware])](#Router+use) ⇒ [<code>Router</code>](#Router)
    * [.get(path, ...middlewares)](#Router+get) ⇒ [<code>Router</code>](#Router)
    * [.add(path, middlewares, unshift)](#Router+add) ⇒ [<code>RouteHandler</code>](#RouteHandler)
    * [.remove(path, middleware)](#Router+remove) ⇒ <code>function</code> \| <code>void</code>
    * [.createRequestContext(url, options)](#Router+createRequestContext) ⇒
    * [.createResponseContext(req)](#Router+createResponseContext) ⇒
    * [.findRouteHandler(req)](#Router+findRouteHandler) ⇒
    * [.testRouteHandler(req, routeHandler)](#Router+testRouteHandler) ⇒ <code>boolean</code>
    * [.handleError(error, req, res)](#Router+handleError)
    * [.getErrorHandlerName(error)](#Router+getErrorHandlerName) ⇒ <code>string</code>
    * [.navigate(url, [options])](#Router+navigate) ⇒ <code>Promise</code>
    * [.isCurrentUrl(url)](#Router+isCurrentUrl) ⇒ <code>boolean</code>
    * [.setCurrentUrl(url)](#Router+setCurrentUrl)
    * [.browserPushState(url)](#Router+browserPushState)
    * [.getCurrentState()](#Router+getCurrentState) ⇒ <code>object</code>

<a name="new_Router_new"></a>

### new Router([options])
Creates an instance of Router.


| Param | Type | Default |
| --- | --- | --- |
| [options] | [<code>routingOptions</code>](#routingOptions) | <code>{}</code> | 

<a name="Router+start"></a>

### router.start(options) ⇒ [<code>Router</code>](#Router)
Starts routing with given options

**Kind**: instance method of [<code>Router</code>](#Router)  
**Returns**: [<code>Router</code>](#Router) - Router instance  

| Param | Type |
| --- | --- |
| options | [<code>startOptions</code>](#startOptions) | 

<a name="Router+stop"></a>

### router.stop() ⇒ [<code>Router</code>](#Router)
Stops routing

**Kind**: instance method of [<code>Router</code>](#Router)  
<a name="Router+isStarted"></a>

### router.isStarted() ⇒ <code>boolean</code>
Returns routing state. True if started

**Kind**: instance method of [<code>Router</code>](#Router)  
<a name="Router+use"></a>

### router.use(path, [middleware]) ⇒ [<code>Router</code>](#Router)
Unshift middleware for a given route.If path is a function then adds given middleware to global middlewares

**Kind**: instance method of [<code>Router</code>](#Router)  
**Returns**: [<code>Router</code>](#Router) - routing instance  

| Param | Type |
| --- | --- |
| path | <code>string</code> \| <code>function</code> | 
| [middleware] | <code>function</code> | 

<a name="Router+get"></a>

### router.get(path, ...middlewares) ⇒ [<code>Router</code>](#Router)
Adds given handlers to the routehandlerAlias for `add`

**Kind**: instance method of [<code>Router</code>](#Router)  

| Param | Type |
| --- | --- |
| path | <code>string</code> | 
| ...middlewares | <code>function</code> | 

<a name="Router+add"></a>

### router.add(path, middlewares, unshift) ⇒ [<code>RouteHandler</code>](#RouteHandler)
Adds middlewares to a routeHandler by given pathIf routeHandler does not exists it will be created

**Kind**: instance method of [<code>Router</code>](#Router)  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> |  |
| middlewares | <code>Array.&lt;function()&gt;</code> | array of handlers |
| unshift | <code>boolean</code> | indicates should middlewares be added in the begining |

<a name="Router+remove"></a>

### router.remove(path, middleware) ⇒ <code>function</code> \| <code>void</code>
Removes registered routeHandler if path param is a string and middleware param is undefined.Removes registered routehandler's middleware if path param is a string and middleware param is a functionRemoves global middleware if path param is a function

**Kind**: instance method of [<code>Router</code>](#Router)  
**Returns**: <code>function</code> \| <code>void</code> - removed middleware  

| Param | Type |
| --- | --- |
| path | <code>string</code> \| <code>function</code> | 
| middleware | <code>function</code> | 

<a name="Router+createRequestContext"></a>

### router.createRequestContext(url, options) ⇒
Creates RequestContext instance

**Kind**: instance method of [<code>Router</code>](#Router)  
**Returns**: RequestContext instance  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> \| <code>URL</code> |  |
| options | <code>\*</code> | request options |

<a name="Router+createResponseContext"></a>

### router.createResponseContext(req) ⇒
Creates ResponseContext instance

**Kind**: instance method of [<code>Router</code>](#Router)  
**Returns**: ResponseContext instance  

| Param | Type |
| --- | --- |
| req | [<code>RequestContext</code>](#RequestContext) | 

<a name="Router+findRouteHandler"></a>

### router.findRouteHandler(req) ⇒
Finds routehandler by requestContext.Can also be used to find routehandler by path

**Kind**: instance method of [<code>Router</code>](#Router)  
**Returns**: RouteHandler instance  

| Param | Type |
| --- | --- |
| req | <code>string</code> \| [<code>RequestContext</code>](#RequestContext) | 

<a name="Router+testRouteHandler"></a>

### router.testRouteHandler(req, routeHandler) ⇒ <code>boolean</code>
Tests RouteHandler instance against requestContext or path string

**Kind**: instance method of [<code>Router</code>](#Router)  
**Returns**: <code>boolean</code> - true if request path match routeHandler path  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>string</code> \| [<code>RequestContext</code>](#RequestContext) | path or requestContext |
| routeHandler | [<code>RouteHandler</code>](#RouteHandler) |  |

<a name="Router+handleError"></a>

### router.handleError(error, req, res)
Handles request errors.Converts error to a handler name and tries to execute it.By default there is no any handlers, so you have to define it by yourself.

**Kind**: instance method of [<code>Router</code>](#Router)  

| Param | Type |
| --- | --- |
| error | <code>string</code> \| <code>Error</code> | 
| req | [<code>RequestContext</code>](#RequestContext) | 
| res | [<code>ResponseContext</code>](#ResponseContext) | 

<a name="Router+getErrorHandlerName"></a>

### router.getErrorHandlerName(error) ⇒ <code>string</code>
Converts response error to errorHandler name.If error instance of Error then `exception` name will be used.If error is a string then error value will be used as handler name.Otherwise `default`.

**Kind**: instance method of [<code>Router</code>](#Router)  
**Returns**: <code>string</code> - errorHandler name  

| Param | Type |
| --- | --- |
| error | <code>\*</code> | 

<a name="Router+navigate"></a>

### router.navigate(url, [options]) ⇒ <code>Promise</code>
Tries to find registered routeHandler by path and execute its middlewares.If there is no such routeHandler then `notfound` errorHandler will be invoked.

**Kind**: instance method of [<code>Router</code>](#Router)  

| Param | Type | Default |
| --- | --- | --- |
| url | <code>\*</code> |  | 
| [options] | <code>\*</code> | <code>{}</code> | 

<a name="Router+isCurrentUrl"></a>

### router.isCurrentUrl(url) ⇒ <code>boolean</code>
Checks if a given url is current or a new one

**Kind**: instance method of [<code>Router</code>](#Router)  

| Param | Type |
| --- | --- |
| url | <code>string</code> \| <code>URL</code> | 

<a name="Router+setCurrentUrl"></a>

### router.setCurrentUrl(url)
Stores given url as current.Method internally used by `navigate`

**Kind**: instance method of [<code>Router</code>](#Router)  

| Param | Type |
| --- | --- |
| url | <code>string</code> \| <code>URL</code> | 

<a name="Router+browserPushState"></a>

### router.browserPushState(url)
Pushes state to browser's historyMethod internally used by `navigate`

**Kind**: instance method of [<code>Router</code>](#Router)  

| Param | Type |
| --- | --- |
| url | <code>string</code> \| <code>URL</code> | 

<a name="Router+getCurrentState"></a>

### router.getCurrentState() ⇒ <code>object</code>
Returns current state object, by default return empty object.feel free to override.method internaly used by `browserPushState`

**Kind**: instance method of [<code>Router</code>](#Router)  
<a name="RouteHandler"></a>

## RouteHandler
Represents handler for a given string route.When request occurs and request path matches handlres's route patternthen all registered middlewares beeing invoked.

**Kind**: global class  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| url | <code>URL</code> | the URL instance of route |
| path | <code>string</code> | string path of route |
| pattern | <code>RegExp</code> | route's RegExp pattern |
| regexPatterns | <code>Object.&lt;string, RegExp&gt;</code> | default RegExp patterns for maintaining routes and routes parameters |
| middlewares | <code>Array.&lt;function()&gt;</code> | registerd route's middlewares |


* [RouteHandler](#RouteHandler)
    * [new RouteHandler(url)](#new_RouteHandler_new)
    * [.addMiddlewares(middlewares)](#RouteHandler+addMiddlewares)
    * [.addMiddleware(middleware)](#RouteHandler+addMiddleware)
    * [.removeMiddleware(middleware)](#RouteHandler+removeMiddleware) ⇒ <code>function</code> \| <code>void</code>
    * [.removeMiddlewares(middlewares)](#RouteHandler+removeMiddlewares) ⇒ <code>void</code>
    * [.hasMiddleware(middleware)](#RouteHandler+hasMiddleware) ⇒ <code>boolean</code>
    * [.extractRouteArguments(req)](#RouteHandler+extractRouteArguments) ⇒ <code>Object.&lt;string, \*&gt;</code>
    * [.testRequest(req)](#RouteHandler+testRequest) ⇒ <code>boolean</code>

<a name="new_RouteHandler_new"></a>

### new RouteHandler(url)
Creates an instance of RouteHandler.


| Param | Type |
| --- | --- |
| url | <code>string</code> \| <code>URL</code> | 

<a name="RouteHandler+addMiddlewares"></a>

### routeHandler.addMiddlewares(middlewares)
Adds middlewares to middlewares array's

**Kind**: instance method of [<code>RouteHandler</code>](#RouteHandler)  

| Param | Type |
| --- | --- |
| middlewares | <code>Array.&lt;function()&gt;</code> | 

<a name="RouteHandler+addMiddleware"></a>

### routeHandler.addMiddleware(middleware)
Adds middleware to middlewares array.Throws if given argument is not a function.

**Kind**: instance method of [<code>RouteHandler</code>](#RouteHandler)  

| Param | Type |
| --- | --- |
| middleware | <code>function</code> | 

<a name="RouteHandler+removeMiddleware"></a>

### routeHandler.removeMiddleware(middleware) ⇒ <code>function</code> \| <code>void</code>
Removes given middleware from middlewares array

**Kind**: instance method of [<code>RouteHandler</code>](#RouteHandler)  
**Returns**: <code>function</code> \| <code>void</code> - Returns nothing if given middleware was not found in an array  

| Param | Type |
| --- | --- |
| middleware | <code>function</code> | 

<a name="RouteHandler+removeMiddlewares"></a>

### routeHandler.removeMiddlewares(middlewares) ⇒ <code>void</code>
Removes all middlewares if called without arguments or if passed middlewares is null or undefined.Otherwise will remove passed middlewares from middlewares array

**Kind**: instance method of [<code>RouteHandler</code>](#RouteHandler)  

| Param | Type |
| --- | --- |
| middlewares | <code>Array.&lt;function()&gt;</code> \| <code>void</code> | 

<a name="RouteHandler+hasMiddleware"></a>

### routeHandler.hasMiddleware(middleware) ⇒ <code>boolean</code>
Returns true if given middleware is present in middlewares array

**Kind**: instance method of [<code>RouteHandler</code>](#RouteHandler)  

| Param | Type |
| --- | --- |
| middleware | <code>function</code> | 

<a name="RouteHandler+extractRouteArguments"></a>

### routeHandler.extractRouteArguments(req) ⇒ <code>Object.&lt;string, \*&gt;</code>
Extracts route arguments into key-value object.`path/:foo/:bar` vs `path/oof/rab` = `{ foo: 'oof', bar: 'rab'}`.repeated names will be overriden so, DONT do this: `path/:foo/:foo`

**Kind**: instance method of [<code>RouteHandler</code>](#RouteHandler)  

| Param | Type |
| --- | --- |
| req | [<code>RequestContext</code>](#RequestContext) | 

<a name="RouteHandler+testRequest"></a>

### routeHandler.testRequest(req) ⇒ <code>boolean</code>
Test's given requestContext's string path against handler's route pattern.Returns true on match.

**Kind**: instance method of [<code>RouteHandler</code>](#RouteHandler)  

| Param | Type |
| --- | --- |
| req | [<code>RequestContext</code>](#RequestContext) | 

<a name="RequestContext"></a>

## RequestContext
Represents request state.

**Kind**: global class  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| args | <code>Object.&lt;string, string&gt;</code> | holds route arguments |
| path | <code>string</code> | route path |
| url | <code>URL</code> | route URL instance |
| query | <code>Object.&lt;string, (string\|Array.&lt;string&gt;)&gt;</code> | search query parameters |
| options | <code>object</code> | initialization options |


* [RequestContext](#RequestContext)
    * [new RequestContext(url, options)](#new_RequestContext_new)
    * [.setRouteArguments(args)](#RequestContext+setRouteArguments)

<a name="new_RequestContext_new"></a>

### new RequestContext(url, options)
Creates an instance of RequestContext.


| Param | Type |
| --- | --- |
| url | <code>string</code> \| <code>URL</code> | 
| options | <code>\*</code> | 

<a name="RequestContext+setRouteArguments"></a>

### requestContext.setRouteArguments(args)
Merges route arguments with given object

**Kind**: instance method of [<code>RequestContext</code>](#RequestContext)  

| Param | Type |
| --- | --- |
| args | <code>Object.&lt;string, \*&gt;</code> | 

<a name="ResponseContext"></a>

## ResponseContext
Represents response state.

**Kind**: global class  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| error | <code>\*</code> | if not falsy will be passed to errorHandler |
| request | [<code>RequestContext</code>](#RequestContext) | processing request's requestContext instance. |
| locals | <code>\*</code> | the legal way to pass data between middlewares |


* [ResponseContext](#ResponseContext)
    * [new ResponseContext(req)](#new_ResponseContext_new)
    * [.isOk()](#ResponseContext+isOk) ⇒ <code>boolean</code>
    * [.setError(error)](#ResponseContext+setError) ⇒ [<code>ResponseContext</code>](#ResponseContext)
    * [.notFound()](#ResponseContext+notFound) ⇒ [<code>ResponseContext</code>](#ResponseContext)
    * [.notAllowed()](#ResponseContext+notAllowed) ⇒ [<code>ResponseContext</code>](#ResponseContext)

<a name="new_ResponseContext_new"></a>

### new ResponseContext(req)
Creates an instance of ResponseContext.


| Param | Type |
| --- | --- |
| req | [<code>RequestContext</code>](#RequestContext) | 

<a name="ResponseContext+isOk"></a>

### responseContext.isOk() ⇒ <code>boolean</code>
Returns true if there is no error, otherwise false

**Kind**: instance method of [<code>ResponseContext</code>](#ResponseContext)  
<a name="ResponseContext+setError"></a>

### responseContext.setError(error) ⇒ [<code>ResponseContext</code>](#ResponseContext)
Sets response error

**Kind**: instance method of [<code>ResponseContext</code>](#ResponseContext)  

| Param | Type |
| --- | --- |
| error | <code>\*</code> | 

<a name="ResponseContext+notFound"></a>

### responseContext.notFound() ⇒ [<code>ResponseContext</code>](#ResponseContext)
Sets 'notfound' error, shorthand for setError('notfound')

**Kind**: instance method of [<code>ResponseContext</code>](#ResponseContext)  
<a name="ResponseContext+notAllowed"></a>

### responseContext.notAllowed() ⇒ [<code>ResponseContext</code>](#ResponseContext)
Sets 'notallowed' error, shorthand for setError('notallowed')

**Kind**: instance method of [<code>ResponseContext</code>](#ResponseContext)  
<a name="configuration"></a>

## configuration : <code>object</code>
Routing configuration.You can provide your own versions of internal classes and setup some behavior.

**Kind**: global namespace  
<a name="startOptions"></a>

## startOptions : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| [trigger] | <code>boolean</code> | <code>true</code> | If true, will try to invoke handlers for current location |
| [errorHandlers] | <code>Object.&lt;string, function()&gt;</code> |  | Error handlers to set into Router instance |
| [replaceErrorHandlers] | <code>boolean</code> | <code>false</code> | Indicates how errorHandlers should be applied. default behavior is merge |
| [useHashes] | <code>boolean</code> | <code>false</code> | Enables old school hash based routing |

<a name="routingOptions"></a>

## routingOptions : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [errorHandlers] | <code>Object.&lt;string, function()&gt;</code> | Error handlers to set into Router instance |

