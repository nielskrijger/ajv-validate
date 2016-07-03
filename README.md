# ajv-validate

A basic wrapper for [AJV](https://github.com/epoberezkin/ajv).

**NOTE**: this library is not very customizable nor will it be, its intent is to serve as a standard for my personal projects.

# Install

```
$ npm install --save @nielskrijger/ajv-errors
```

# Usage

This library manages two AJV validation instances, one for validating a request body and one for validatinga query parameters. Differences are listed below:

- The *body validator* returns [JSON pointers](https://tools.ietf.org/html/rfc6901) in error paths to indicate which property failed, e.g. `/name`. The *query validator* prefixes error paths with a question mark, e.g. `?name`.
- The *query validator* will attempt to convert properties to their expected types, the *body validator* doesn't.

## addBodySchema(schema, schemaName)

Adds a JSON schema to validate the message body. A schema is referenced by its name using `validator.validateBody(schemaName, body)`.

```js
import * as validator from '@nielskrijger/ajv-validate';

validator.addBodySchema({
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 10 },
  },
}, 'testBody');

/**
 * [{ code: 'min_length',
 *    path: '/name',
 *    message: 'should NOT be shorter than 10 characters' }]
 */
validator.validateBody('testBody', { name: 'test' });
```

## addQuerySchema(schema, schemaName)

Adds a JSON schema to validate a message query. A schema is referenced by its name using `validator.validateQuery(schemaName, queryParams)`.

```js
import * as validator from './src/index';

validator.addQuerySchema({
  type: 'object',
  properties: {
    limit: { type: 'integer', minimum: 0 },
  },
}, 'testBody');

/**
 * [{ code: 'minimum',
 *    path: '?limit',
 *    message: 'should be >= 0' }]
 */
validator.validateQuery('testBody', { limit: -1 });
```

## Additional formats

- **date-time**: the standard `date-time` format is replaced by a `moment(...).isValid()` check which accepts any IS0-8601 string.

## Error format

`validateBody` and `validateQuery` return an array of errors formatted as follows:

```js
{
  code: 'minimum',
  path: '?limit',
  message: 'should be >= 0',
}
```

Property | Description
---------|------------------------
code     | Error code formatted in snake_case.
path     | JSON pointer or query parameter name indicating which property validation failed.
message  | Human-readable error message.
