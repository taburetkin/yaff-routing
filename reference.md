## Modules

<dl>
<dt><a href="#module_routing">routing</a></dt>
<dd><p>This is main module.
By Default its only the thing you should use working with fe-routing-js</p>
</dd>
</dl>

## Classes

<dl>
<dt><a href="#Routing">Routing</a></dt>
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
<dt><a href="#configaration">configaration</a> : <code>object</code></dt>
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
This is main module.


* [routing](#module_routing)
    * [.config](#module_routing.config)
    * [.createRouting()](#module_routing.createRouting) ⇒ [<code>Routing</code>](#Routing)
    * [.get()](#module_routing.get) ⇒ [<code>Routing</code>](#Routing)
    * [.use()](#module_routing.use) ⇒ [<code>Routing</code>](#Routing)
    * [.isStarted()](#module_routing.isStarted) ⇒ <code>boolean</code>
    * [.start()](#module_routing.start) ⇒ [<code>Routing</code>](#Routing)
    * [.stop()](#module_routing.stop) ⇒ [<code>Routing</code>](#Routing)
    * [.remove()](#module_routing.remove) ⇒ [<code>RouteHandler</code>](#RouteHandler) \| <code>void</code>
    * [.navigate()](#module_routing.navigate)

<a name="module_routing.config"></a>

### routing.config
routing Configuration

**Kind**: static property of [<code>routing</code>](#module_routing)  
**See**: [configuration](configuration)  
<a name="module_routing.createRouting"></a>

### routing.createRouting() ⇒ [<code>Routing</code>](#Routing)
Creates instance of Routing with config.routingOptions.

**Kind**: static method of [<code>routing</code>](#module_routing)  
**Returns**: [<code>Routing</code>](#Routing) - Routing instance  
<a name="module_routing.get"></a>

### routing.get() ⇒ [<code>Routing</code>](#Routing)
Proxy method to Routing instance's `get`

**Kind**: static method of [<code>routing</code>](#module_routing)  
**See**: [Routing.get](Routing.get)  
<a name="module_routing.use"></a>

### routing.use() ⇒ [<code>Routing</code>](#Routing)
Proxy method to Routing instance's `use`

**Kind**: static method of [<code>routing</code>](#module_routing)  
**See**: [Routing.use](Routing.use)  
<a name="module_routing.isStarted"></a>

### routing.isStarted() ⇒ <code>boolean</code>
Returns true if routing started

**Kind**: static method of [<code>routing</code>](#module_routing)  
<a name="module_routing.start"></a>

### routing.start() ⇒ [<code>Routing</code>](#Routing)
Starts routing

**Kind**: static method of [<code>routing</code>](#module_routing)  
**See**: [Routing.start](Routing.start)  
<a name="module_routing.stop"></a>

### routing.stop() ⇒ [<code>Routing</code>](#Routing)
Stops routing

**Kind**: static method of [<code>routing</code>](#module_routing)  
**See**: [Routing.stop](Routing.stop)  
<a name="module_routing.remove"></a>

### routing.remove() ⇒ [<code>RouteHandler</code>](#RouteHandler) \| <code>void</code>
Removes middleware or middleware's handler.

**Kind**: static method of [<code>routing</code>](#module_routing)  
**See**: [Routing.stop](Routing.stop)  
<a name="module_routing.navigate"></a>

### routing.navigate()
Initiates the request.

**Kind**: static method of [<code>routing</code>](#module_routing)  
**See**: [Routing.navigate](Routing.navigate)  
<a name="Routing"></a>

## Routing
Manipulates existing routeHandlers, global middlewares and processes the requests

**Kind**: global class  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| routes | <code>RoutesManager</code> | Holds all registered routeHandlers |


* [Routing](#Routing)
    * [new Routing([options])](#new_Routing_new)
    * [.start(options)](#Routing+start) ⇒ [<code>Routing</code>](#Routing)
    * [.stop()](#Routing+stop) ⇒ [<code>Routing</code>](#Routing)
    * [.isStarted()](#Routing+isStarted) ⇒ <code>boolean</code>
    * [.use(path, [middleware])](#Routing+use) ⇒ [<code>Routing</code>](#Routing)
    * [.get(path, ...middlewares)](#Routing+get) ⇒ [<code>Routing</code>](#Routing)
    * [.add(path, middlewares, unshift)](#Routing+add) ⇒ [<code>RouteHandler</code>](#RouteHandler)
    * [.remove(path, middleware)](#Routing+remove) ⇒ <code>function</code> \| <code>void</code>
    * [.createRequestContext(url, options)](#Routing+createRequestContext) ⇒
    * [.createResponseContext(req)](#Routing+createResponseContext) ⇒
    * [.findRouteHandler(req)](#Routing+findRouteHandler) ⇒
    * [.testRouteHandler(req, routeHandler)](#Routing+testRouteHandler) ⇒ <code>boolean</code>
    * [.handleError(error, req, res)](#Routing+handleError)
    * [.getErrorHandlerName(error)](#Routing+getErrorHandlerName) ⇒ <code>string</code>
    * [.navigate(url, [options])](#Routing+navigate) ⇒ <code>boolean</code>
    * [.isCurrentUrl(url)](#Routing+isCurrentUrl) ⇒ <code>boolean</code>
    * [.setCurrentUrl(url)](#Routing+setCurrentUrl)
    * [.browserPushState(url)](#Routing+browserPushState)
    * [.getCurrentState()](#Routing+getCurrentState) ⇒ <code>object</code>

<a name="new_Routing_new"></a>

### new Routing([options])
Creates an instance of Routing.


| Param | Type | Default |
| --- | --- | --- |
| [options] | [<code>routingOptions</code>](#routingOptions) | <code>{}</code> | 

<a name="Routing+start"></a>

### routing.start(options) ⇒ [<code>Routing</code>](#Routing)
Starts routing with given options

**Kind**: instance method of [<code>Routing</code>](#Routing)  
**Returns**: [<code>Routing</code>](#Routing) - Routing instance  

| Param | Type |
| --- | --- |
| options | [<code>startOptions</code>](#startOptions) | 

<a name="Routing+stop"></a>

### routing.stop() ⇒ [<code>Routing</code>](#Routing)
Stops routing

**Kind**: instance method of [<code>Routing</code>](#Routing)  
<a name="Routing+isStarted"></a>

### routing.isStarted() ⇒ <code>boolean</code>
Returns routing state. True if started

**Kind**: instance method of [<code>Routing</code>](#Routing)  
<a name="Routing+use"></a>

### routing.use(path, [middleware]) ⇒ [<code>Routing</code>](#Routing)
Unshift middleware for a given route.

**Kind**: instance method of [<code>Routing</code>](#Routing)  
**Returns**: [<code>Routing</code>](#Routing) - routing instance  

| Param | Type |
| --- | --- |
| path | <code>string</code> \| <code>function</code> | 
| [middleware] | <code>function</code> | 

<a name="Routing+get"></a>

### routing.get(path, ...middlewares) ⇒ [<code>Routing</code>](#Routing)
Adds given handlers to the routehandler

**Kind**: instance method of [<code>Routing</code>](#Routing)  

| Param | Type |
| --- | --- |
| path | <code>string</code> | 
| ...middlewares | <code>function</code> | 

<a name="Routing+add"></a>

### routing.add(path, middlewares, unshift) ⇒ [<code>RouteHandler</code>](#RouteHandler)
Adds middlewares to a routeHandler by given path

**Kind**: instance method of [<code>Routing</code>](#Routing)  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> |  |
| middlewares | <code>Array.&lt;function()&gt;</code> | array of handlers |
| unshift | <code>boolean</code> | indicates should middlewares be added in the begining |

<a name="Routing+remove"></a>

### routing.remove(path, middleware) ⇒ <code>function</code> \| <code>void</code>
Removes registered routeHandler if path param is a string and middleware param is undefined.

**Kind**: instance method of [<code>Routing</code>](#Routing)  
**Returns**: <code>function</code> \| <code>void</code> - removed middleware  

| Param | Type |
| --- | --- |
| path | <code>string</code> \| <code>function</code> | 
| middleware | <code>function</code> | 

<a name="Routing+createRequestContext"></a>

### routing.createRequestContext(url, options) ⇒
Creates RequestContext instance

**Kind**: instance method of [<code>Routing</code>](#Routing)  
**Returns**: RequestContext instance  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> \| <code>URL</code> |  |
| options | <code>\*</code> | request options |

<a name="Routing+createResponseContext"></a>

### routing.createResponseContext(req) ⇒
Creates ResponseContext instance

**Kind**: instance method of [<code>Routing</code>](#Routing)  
**Returns**: ResponseContext instance  

| Param | Type |
| --- | --- |
| req | [<code>RequestContext</code>](#RequestContext) | 

<a name="Routing+findRouteHandler"></a>

### routing.findRouteHandler(req) ⇒
Finds routehandler by requestContext.

**Kind**: instance method of [<code>Routing</code>](#Routing)  
**Returns**: RouteHandler instance  

| Param | Type |
| --- | --- |
| req | <code>string</code> \| [<code>RequestContext</code>](#RequestContext) | 

<a name="Routing+testRouteHandler"></a>

### routing.testRouteHandler(req, routeHandler) ⇒ <code>boolean</code>
Tests RouteHandler instance against requestContext or path string

**Kind**: instance method of [<code>Routing</code>](#Routing)  
**Returns**: <code>boolean</code> - true if request path match routeHandler path  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>string</code> \| [<code>RequestContext</code>](#RequestContext) | path or requestContext |
| routeHandler | [<code>RouteHandler</code>](#RouteHandler) |  |

<a name="Routing+handleError"></a>

### routing.handleError(error, req, res)
Handles request errors.

**Kind**: instance method of [<code>Routing</code>](#Routing)  

| Param | Type |
| --- | --- |
| error | <code>string</code> \| <code>Error</code> | 
| req | [<code>RequestContext</code>](#RequestContext) | 
| res | [<code>ResponseContext</code>](#ResponseContext) | 

<a name="Routing+getErrorHandlerName"></a>

### routing.getErrorHandlerName(error) ⇒ <code>string</code>
Converts response error to errorHandler name.

**Kind**: instance method of [<code>Routing</code>](#Routing)  
**Returns**: <code>string</code> - errorHandler name  

| Param | Type |
| --- | --- |
| error | <code>\*</code> | 

<a name="Routing+navigate"></a>

### routing.navigate(url, [options]) ⇒ <code>boolean</code>
Tries to find registered routeHandler by path and execute its middlewares.

**Kind**: instance method of [<code>Routing</code>](#Routing)  
**Returns**: <code>boolean</code> - Returns `false` if navigate is used against current url.  

| Param | Type | Default |
| --- | --- | --- |
| url | <code>\*</code> |  | 
| [options] | <code>\*</code> | <code>{}</code> | 

<a name="Routing+isCurrentUrl"></a>

### routing.isCurrentUrl(url) ⇒ <code>boolean</code>
Checks if a given url is current or a new one

**Kind**: instance method of [<code>Routing</code>](#Routing)  

| Param | Type |
| --- | --- |
| url | <code>string</code> \| <code>URL</code> | 

<a name="Routing+setCurrentUrl"></a>

### routing.setCurrentUrl(url)
Stores given url as current.

**Kind**: instance method of [<code>Routing</code>](#Routing)  

| Param | Type |
| --- | --- |
| url | <code>string</code> \| <code>URL</code> | 

<a name="Routing+browserPushState"></a>

### routing.browserPushState(url)
Pushes state to browser's history

**Kind**: instance method of [<code>Routing</code>](#Routing)  

| Param | Type |
| --- | --- |
| url | <code>string</code> \| <code>URL</code> | 

<a name="Routing+getCurrentState"></a>

### routing.getCurrentState() ⇒ <code>object</code>
Returns current state object, by default return empty object.

**Kind**: instance method of [<code>Routing</code>](#Routing)  
<a name="RouteHandler"></a>

## RouteHandler
Represents handler for a given string route.

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
Adds middleware to middlewares array.

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
Removes all middlewares if called without arguments or if passed middlewares is null or undefined.

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
Extracts route arguments into key-value object.

**Kind**: instance method of [<code>RouteHandler</code>](#RouteHandler)  

| Param | Type |
| --- | --- |
| req | [<code>RequestContext</code>](#RequestContext) | 

<a name="RouteHandler+testRequest"></a>

### routeHandler.testRequest(req) ⇒ <code>boolean</code>
Test's given requestContext's string path against handler's route pattern.

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
<a name="configaration"></a>

## configaration : <code>object</code>
Routing configuration.

**Kind**: global namespace  
<a name="startOptions"></a>

## startOptions : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| [trigger] | <code>boolean</code> | <code>true</code> | If true, will try to invoke handlers for current location |
| [errorHandlers] | <code>Object.&lt;string, function()&gt;</code> |  | Error handlers to set into Routing instance |
| [replaceErrorHandlers] | <code>boolean</code> | <code>false</code> | Indicates how errorHandlers should be applied. default behavior is merge |
| [useHashes] | <code>boolean</code> | <code>false</code> | Enables old school hash based routing |

<a name="routingOptions"></a>

## routingOptions : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [errorHandlers] | <code>Object.&lt;string, function()&gt;</code> | Error handlers to set into Routing instance |
