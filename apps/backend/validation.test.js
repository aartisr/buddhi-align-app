const test = require('node:test');
const assert = require('node:assert/strict');
const { ValidationError, validateRequestBody, validateId } = require('./validation');

test('validateRequestBody throws on null', () => {
  assert.throws(() => validateRequestBody(null), ValidationError);
});

test('validateRequestBody throws on non-object', () => {
  assert.throws(() => validateRequestBody('string'), ValidationError);
  assert.throws(() => validateRequestBody(123), ValidationError);
  assert.throws(() => validateRequestBody(true), ValidationError);
});

test('validateRequestBody throws on array', () => {
  assert.throws(() => validateRequestBody([]), ValidationError);
});

test('validateRequestBody accepts valid object', () => {
  assert.doesNotThrow(() => validateRequestBody({ key: 'value' }));
});

test('validateId throws on empty string', () => {
  assert.throws(() => validateId(''), ValidationError);
  assert.throws(() => validateId(null), Error);
  assert.throws(() => validateId(undefined), Error);
});

test('validateId accepts valid ID', () => {
  assert.doesNotThrow(() => validateId('valid-id-123'));
});
