import Ajv from 'ajv';
import _ from 'lodash';
import moment from 'moment';

const defaultOptions = {
  allErrors: true,
  jsonPointers: true,
  format: 'full',
  useDefaults: true,
  formats: {
    'date-time': (value) => moment(value, moment.ISO_8601, true).isValid(),
  },
};

// ajvBody does not transform types
const ajvBody = new Ajv(defaultOptions);

// ajvQuery does attempt to transform types
const ajvQuery = new Ajv(Object.assign({}, defaultOptions, {
  coerceTypes: true,
}));

/**
 * Formats errors.
 */
function formatErrors(errors, isQuery = false) {
  return _.map(errors, (error) => {
    let path = error.dataPath;
    if (isQuery && path.length > 0) path = '?' + path.substr(1);
    return {
      code: _.snakeCase(error.keyword),
      path,
      message: error.message,
    };
  })
}

/**
 * Adds AJV validation schema to validate a query parameters.
 */
export function addQuerySchema(schema, schemaName) {
  ajvQuery.addSchema(schema, schemaName);
}

/**
 * Adds AJV validation schema to validate a request body.
 */
export function addBodySchema(schema, schemaName) {
  ajvBody.addSchema(schema, schemaName);
}

/**
 * Validates a schema.
 */
function validate(validator, schemaName, data, isQuery = false) {
  const valid = validator.validate(schemaName, data);
  if (!valid) {
    return formatErrors(validator.errors, isQuery);
  }
  return null;
}

/**
 * Validates a request query against a JSON Schema.
 *
 * Validating a request query attempts to coerce types. Modifies original data.
 */
export function validateQuery(schemaName, data) {
  return validate(ajvQuery, schemaName, data, true);
}

/**
 * Validates an object against a JSON Schema.
 *
 * Validating a request body does not attempt to coerce types.
 */
export function validateBody(schemaName, data) {
  return validate(ajvBody, schemaName, data, false);
}
