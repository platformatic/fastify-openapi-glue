# Fastify OpenApi Glue

A plugin for [fastify](https://fastify.dev) to autogenerate a configuration based on a [OpenApi](https://www.openapis.org/)(v2/v3) specification.

Given an OpenApi specification Fastify-openapi-glue handles the fastify configuration of routes and validation schemas etc.

<a name="install"></a>
## Install 
```
npm i @platformatic/fastify-openapi-glue --save
```
<a name="plugin"></a>
## Plugin
<a name="pluginUsage"></a>
### Usage

Add the plugin to your project with `register` and pass it some basic options and you are done !
```javascript
import openapiGlue from "@platformatic/fastify-openapi-glue";
import { Service } from "./service.js";
import { Security } from "./security.js";

const options = {
  specification: `${currentDir}/petstore-openapi.v3.json`,
  serviceHandlers: new Service(),
  securityHandlers: new Security(),
  prefix: "v1",
};


fastify.register(openapiGlue, options);
```

All schema and routes will be taken from the OpenApi specification listed in the options. No need to specify them in your code. 
<a name="pluginOptions"></a>
### Options
  - `specification`: this can be a JSON object, or the name of a JSON or YAML file containing a valid OpenApi(v2/v3) file 
  - `serviceHandlers`: this can be a javascript object or class instance. See the [serviceHandlers documentation](docs/serviceHandlers.md) for more details.
  - `securityHandlers`: this can be a javascript object or class instance. See the [securityHandlers documentation](docs/securityHandlers.md) for more details.
  - `prefix`: this is a string that can be used to prefix the routes, it is passed verbatim to fastify. E.g. if the path to your operation is specified as "/operation" then a prefix of "v1" will make it available at "/v1/operation". This setting overrules any "basePath" setting in a v2 specification. See the [servers documentation](docs/servers.md) for more details on using prefix with a v3 specification.
 - `operationResolver`: a custom operation resolver function, `(operationId, method, openapiPath) => handler | routeOptions` where method is the uppercase HTTP method (e.g. "GET") and openapiPath is the path taken from the specification without prefix (e.g. "/operation"). Mutually exclusive with `serviceHandlers`. See the [operationResolver documentation](docs/operationResolver.md) for more details.
 - `addEmptySchema`: a boolean that allows empty bodies schemas to be passed through. This might be useful for status codes like 204 or 304. Default is `false`.

`specification` and either `serviceHandlers` or `operationResolver` are mandatory, `securityHandlers` and `prefix` are optional.

Please be aware that `this` will refer to your serviceHandlers object or your securityHandler object and not to Fastify as explained in the [bindings documentation](docs/bindings.md)

<a name="pluginApiExtensions"></a>
### OpenAPI extensions
The OpenAPI specification supports [extending an API spec](https://spec.openapis.org/oas/latest.html#specification-extensions) to describe extra functionality that isn't covered by the official specification. Extensions start with `x-` (e.g., `x-myapp-logo`) and can contain a primitive, an array, an object, or `null`.

The following extensions are provided by the plugin:
- `x-fastify-config` (object): any properties will be added to the `routeOptions.config` property of the Fastify route.

  For example, if you wanted to use the fastify-raw-body plugin to compute a checksum of the request body, you could add the following extension to your OpenAPI spec to signal the plugin to specially handle this route:

  ```yaml
  paths:
    /webhooks:
      post:
        operationId: processWebhook
        x-fastify-config:
          rawBody: true
        responses:
          204:
            description: Webhook processed successfully
  ```

- `x-no-fastify-config` (true): this will ignore this specific route as if it was not present in your OpenAPI specification:

```yaml
  paths:
    /webhooks:
      post:
        operationId: processWebhook
        x-no-fastify-config: true
        responses:
          204:
            description: Webhook processed successfully
  ```

You can also set custom OpenAPI extensions (e.g., `x-myapp-foo`) for use within your app's implementation. These properties are passed through unmodified to the Fastify route on `{req,reply}.routeOptions.config`. Extensions specified on a schema are also accessible (e.g., `routeOptions.schema.body` or `routeOptions.schema.responses[<statusCode>]`).

<a name="Notes"></a>
## Notes
- the plugin ignores information in a v3 specification under `server/url` as there could be multiple values here, use the `prefix` [option](#pluginOptions) if you need to prefix your routes. See the [servers documentation](docs/servers.md) for more details.
- fastify only supports `application/json` and `text/plain` out of the box. The default charset is `utf-8`.  If you need to support different content types, you can use the fastify `addContentTypeParser` API.
- fastify will by default coerce types, e.g when you expect a number a string like `"1"` will also pass validation, this can be reconfigured, see [Validation and Serialization](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/).
- fastify only supports one schema per route. So while the v3 standard allows for multiple content types per route, each with their own schema this is currently not going to work with fastify. Potential workarounds include a custom content type parser and merging schemas upfront using JSON schema `oneOf`.
- the plugin aims to follow fastify and does not compensate for features that are possible according to the OpenApi specification but not possible in standard fastify (without plugins). This will keep the plugin lightweigth and maintainable. E.g. Fastify does not support cookie validation, while OpenApi v3 does.
- in some cases however, the plugin may be able to provide you with data which could be used to enhance OpenApi support within your own Fastify application. Here is one possible way to perform [cookie validation](docs/cookieValidationHowTo.md)  yourself.
- if you have special needs on querystring handling (e.g. arrays, objects etc) then fastify supports a [custom querystring parser](https://fastify.dev/docs/latest/Reference/Server/#querystringparser). You might need to pass the AJV option `coerceTypes: 'array'` as an option to Fastify.
- the plugin is an ECMAscript Module (aka ESM). If you are using Typescript then make sure that you have read: https://www.typescriptlang.org/docs/handbook/esm-node.html to avoid any confusion.
- If you want to use a specification that consists of multiple files then please check out the page on [subschemas](docs/subSchemas.md) 
- Fastify uses AJV strict mode in validating schemas. If you get an error like `....due to error strict mode: unknown keyword: "..."` then please check out the page on [AJV strict mode](docs/AJVstrictMode.md) 

<a name="Contributing"></a>
## Contributing
- contributions are always welcome. 
- if you plan on submitting new features then please create an issue first to discuss and avoid disappointments.
- main development is done on the master branch therefore PRs to that branch are preferred.
- please make sure you have run `npm test` before you submit a PR.

# Credits

This module was forked from
[https://github.com/seriousme/fastify-openapi-glue](https://github.com/seriousme/fastify-openapi-glue)
at [commit afb4ac65a4d4c7d1bf53c0d245ed134a8f1b5689](https://github.com/seriousme/fastify-openapi-glue/commit/afb4ac65a4d4c7d1bf53c0d245ed134a8f1b5689)
We thank Hans Klunder for his original work on this module.

<a name="license"></a>
# License
Licensed under [MIT](LICENSE.txt)
