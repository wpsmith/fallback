/* global describe, expect, fallback, it */

describe('fallback.utility', function() {
	var test = {};

	fallback.utility(test, 'Array');

	it('isArray Function should exist', function() {
		expect(fallback.isFunction(test.isArray)).to.equal(true);
	});

	it('normalizeArray Function should exist', function() {
		expect(fallback.isFunction(test.normalizeArray)).to.equal(true);
	});

	it('normalizeArraySeries Function should exist', function() {
		expect(fallback.isFunction(test.normalizeArraySeries)).to.equal(true);
	});
});