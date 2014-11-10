// The container variable for our library instance. As you browse through the libraries code you'll see the `me`
// variable referenced throughout, this is simply short-hand for the library.
var me = {};

// Initialize our library. This function must be invoked before we start using the library.
me.init = function() {
	// Reference the `head` element of our document and store it into memory.
	me.init.head();

	// Spawn our utility functions for the library.
	me.init.utilities(me.utility.types);

	// Reference aliases for the library into the `global` object for the user to directly access.
	me.init.aliases(me.aliases);

	// Automatically configure our library via attributes being set on any `script` elements on the page.
	me.init.autoloader();
};

// Reference the library's aliases into the `global` `Object` for the user to directly access. If a alias that we're
// attempting to reference currently exists in our `global` `Object`, then we won't override it.
me.init.aliases = function(input) {
	// Loop through each of our aliases.
	me.each(input, function(aliases, key) {
		// Store the module name that we'll reference throughout our loop.
		var moduleName = key;

		// Store the factory for our module that we'll reference throughout our loop.
		var factory = me;

		if (key === 'me') {
			// If the `key` is `me`, then we need to reference the library itself.
			moduleName = 'fallback';
		} else {
			// Reference the function within our library.
			factory = me[key];
		}

		// Define modules that reference back to the library so that they can be used within our `define` and `require`
		// functions. For example in a `define` `factory` we might want to access the `fallback` library, or the `require`
		// function, this will allow us to do that. Makes for good code encapsulation if the developer wants to take
		// advantage of it.
		me.define(moduleName, factory);

		// Fetch the reference of our new module.
		var module = me.module(moduleName, null, false);

		// Flag our new module as invoked and loaded since it's internal.
		module.invoked = module.loader.loaded = true;

		// Map all of our aliases to our module.
		me.each(aliases, function(alias) {
			// If the alias is currently defined in the `global` object, skip it and throw a warning to the end user.
			if (me.isDefined(window[alias])) {
				me.warn('core', 'init', 'aliases', 'The variable global["' + alias + '"] already exists.');
				return;
			}

			// Map the alias to our module.
			me.module.alias(moduleName, alias);

			// Reference the alias of our module within the `global` `Object`.
			me.global[alias] = factory;
		});
	});
};

// If the attributes `base` or `data-base` are found on any of the `script` tags within the page when the library is
// loaded, automatically set the `base` variable for our configuration to that `value`. If the attributes `main` or
// `data-main` are found on any of the `script` tags when the library is loaded on the page, automatically load up that
// `value` as a module. If the `value` is a comma delimited string, we'll split on the comma and load each separately.
me.init.autoloader = function() {
	// Fetch `base` and/or `data-base`.
	var base = me.normalizeStringSeries(me.autoloader('base'));

	// If our `attribute` exists, then configure it.
	if (base.length) {
		// Since `me.autoloader` will return an `Array` series, only use the first value of our `Array`.
		me.config({
			base: base.shift()
		});
	}

	// Fetch `main` and/or `data-main`.
	var main = me.normalizeStringSeries(me.autoloader('main'));

	// If our `attribute` exists, then `require` it.
	if (main.length) {
		me.require(main);
	}
};

// Fetch the `head` element that resides on the page.
me.init.head = function() {
	// If the `head` element ever contains more than a single element, then the document is malformed.
	me.head = window.document.getElementsByTagName('head')[0];
};

// Automatically spawn helper functions that we'll use throughout the library. For example we're spawning the following
// functions: `isArray`, `normalizeArray`, `normalizeArraySeries`, etc. Spawning these functions this way results in
// less code for the library and achieves the same objective.
me.init.utilities = function(input) {
	// Loop through each of our different utility types.
	for (var index in input) {
		// Make sure it's not empty.
		if (input[index]) {
			// Spawn the utility function for the library.
			me.utility(input[index]);
		}
	}
};

// This is where we hold all of our functional aliases for the library.
me.aliases = {
	// Referenecs for our `config` function.
	config: ['cfg', 'conf', 'config'],

	// Referenecs for our `define` function.
	define: ['def', 'define'],

	// Referenecs for the library.
	me: ['fallback', 'fbk'],

	// Referenecs for our `require` function.
	require: ['req', 'require']
};

// Fetch the parameters that are passed into a `Function` and return them in an `Array` `String` series. For example:
// `function(a, b, c)` returns `['a', 'b', 'c']`. Thanks to @toddmotto who wrote the better part of this `Function`.
// @reference http://toddmotto.com/angular-js-dependency-injection-annotation-process/
me.args = function(reference) {
	// If our `reference` is not a `Function`, then halt.
	if (!me.isFunction(reference)) {
		return [];
	}

	// Setup our regular expressions that we'll use to parse out the arguments of our `reference` `Function`.
	var expessions = {
		arg: /^\s*(_?)(.+?)\1\s*$/,
		args: /^function\s*[^\(]*\(\s*([^\)]*)\)/m,
		argsSplit: /,/,
		comments: /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg
	};

	// The `Array` of our cleansed arguments from the `reference` `Function`.
	var args = [];

	// Strip out any comments that are listed in the `Function`.
	var name = reference.toString().replace(expessions.comments, '');

	// Explicity fetch the arguments out of the `Function`.
	var declaration = name.match(expessions.args);

	// Split on `,` and loop through each of the arguments.
	me.each(declaration[1].split(expessions.argsSplit), function(arg) {
		// Clean the dirty argument.
		arg.replace(expessions.arg, function(all, underscore, name) {
			// Push the cleansed argument to the `args` `Array`.
			args.push(name);
		});
	});

	// Return the cleansed `Array` of arguments from our `reference`.
	return args;
};

// Clone an array. `Array.prototype.slice` appears to be the most efficient way of doing this.
// @reference http://jsperf.com/new-array-vs-splice-vs-slice/19
me.arrayClone = function(input) {
	return input.slice();
};

// Remove all duplicates from an array.
me.arrayUnique = function(input) {
	// Store our normalized values.
	var normalized = [];

	// If an array was not passed in, halt the function.
	if (!me.isArray(normalized)) {
		return normalized;
	}

	// Run through each of our `Array` values.
	me.each(input, function(value) {
		// Make sure the `value` doesn't already exist in our `normalized` `Array`.
		if (me.indexOf(normalized, value) === -1) {
			// Push our non-duplicated `value` off to our `normalized` `Array`.
			normalized.push(value);
		}
	});

	// Return our normalized set of unique values.
	return normalized;
};

// Sift through the script elements on the page and attempt to derive the values from `attribute` that is passed in to
// the `Function`. Along with checking the `attribute` that is passed in, this `Function` will also prefix the
// given `attribute` with `data-` and check for that attribute as well. For example if the `Function` was called with
// `base`, then the `Function` will atempt to derive values for the attributes `base` and `data-base`.
me.autoloader = function(attribute) {
	// The `Array` to store our `attribute` values.
	var values = [];

	// If the `attribute` is not a string, halt the `Function`.
	if (!me.isString(attribute)) {
		return values;
	}

	// Fetch all script tags that are on the page.
	var scripts = window.document.getElementsByTagName('script');

	// Check to make sure that we retrieved a `HTMLCollection`, otherwise halt the `Function`.
	if (!me.isHTMLCollection(scripts)) {
		return values;
	}

	// Loop through each of our scripts.
	me.each(scripts, function(script) {
		// If our script instance isn't an `HTMLScriptElement`, then skip the iteration.
		if (!me.isHTMLScriptElement(script)) {
			return;
		}

		// Check to see if our `attribute` exists along with the prefix `data-` for the `attribute` in questino.
		me.each([attribute, 'data-' + attribute], function(attribute) {
			// Fetch the value for the attribute.
			var value = script.getAttribute(attribute);

			// If the value exists then use it.
			if (value) {
				// Split our value on `,` that way we can pass in multiple values.
				value = value.split(',');

				// Merge our values.
				values = values.concat(value);
			}
		});
	});

	// Return the values for attributes.
	return values;
};

// ASCII banner for the library.
me.banner = '   ad88              88  88  88                                   88         88             \n  d8"                88  88  88                                   88         ""             \n  88                 88  88  88                                   88                        \nMM88MMM  ,adPPYYba,  88  88  88,dPPYba,   ,adPPYYba,   ,adPPYba,  88   ,d8   88  ,adPPYba,  \n  88     ""     `Y8  88  88  88P\'    "8a  ""     `Y8  a8"     ""  88 ,a8"    88  I8[    ""  \n  88     ,adPPPPP88  88  88  88       d8  ,adPPPPP88  8b          8888[      88   `"Y8ba,   \n  88     88,    ,88  88  88  88b,   ,a8"  88,    ,88  "8a,   ,aa  88`"Yba,   88  aa    ]8I  \n  88     `"8bbdP"Y8  88  88  8Y"Ybbd8"\'   `"8bbdP"Y8   `"Ybbd8"\'  88   `Y8a  88  `"YbbdP"\'  \n                                                                            ,88             \n                                                                          888P"';

// All of our browser detection functions reside here. Some browsers have special edge cases that we need to cater to,
// and that's the sole purpose of these functions.
me.browser = {};

// Detect whether or not the current browser is IE11.
me.browser.isIE11 = function() {
	return Object.hasOwnProperty.call(window, 'ActiveXObject') && !window.ActiveXObject;
};

// Shorthand for a `for in` loop. Less code, easier readability. If `false` is returned, the loop will be halted.
me.each = function(input, callback) {
	// If anything other than an `Array` or `Object` was passed in, halt the `Function`.
	if (!me.isArray(input) && !me.isObject(input) && typeof input !== 'object') {
		return;
	}

	// Normalize our callback to a `Function`.
	callback = me.normalizeFunction(callback);

	// Run our loop.
	for (var index in input) {
		// If a `false` is returned during the loop, then halt the loo!.
		if (callback(input[index], index) === false) {
			break;
		}
	}
};

// This is the global variable that we'll use to check whether a library was loaded or not. This variable can be
// overriden via the configuration `Function`.
me.global = window;

// Generate a global unique idenifier.
me.guid = function() {
	return me.guid.block() + me.guid.block(true) + me.guid.block(true) + me.guid.block();
};

// Random blocks for a GUID.
me.guid.block = function(dashed) {
	var generated = (Math.random().toString(16) + '000000000').substr(2, 8);
	return dashed ? '-' + generated.substr(0, 4) + '-' + generated.substr(4, 4) : generated;
};

// Legacy browsers don't support `Array.prototype.indexOf`, this function dubs as a polyfill for this browsers. In
// particular IE < 9, doesn't support it. @ie @ie6 @ie7 @ie8
// @reference https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
me.indexOf = function(input, value) {
	// By default we'll return `-1` if nothing is found to simulate the native `indexOf` functionality.
	var index = -1;

	// If our `input` is not an `Array`, or our `value is not a `String` or `Number`, halt the `Function`.
	if (!me.isArray(input) && !me.isString(value) && me.isNumber(value)) {
		return index;
	}

	// Search through our `Array` for our `value`.
	me.each(input, function(iterationValue, iterationIndex) {
		// As soon as we find our first value, halt the loop.
		if (iterationValue === value) {
			// Set the index of our result.
			index = parseInt(iterationIndex, 10);

			// Halt the loop.
			return false;
		}
	});

	// Return the index of our `value`.
	return index;
};

// Check whether or not a variable is defined.
me.isDefined = function(variable) {
	// By default return `false`.
	var defined = false;

	// Wrap our check in a `try catch`, as some browsers get extra sensitive when checking `undefined` variables.
	try {
		defined = typeof variable !== 'undefined';
	} catch (exception) {}

	// Return whether our not our `variable` was defined.
	return defined;
};

// Logging function for when debugging is turned on. @todo
me.error = me.log = me.warn = me.info = function() {
	// Make sure that both debugging is enable and what `window.console` exists.
	if (!me.debug || !window.console) {
		return;
	}

	var args = me.toArray(arguments);

	window.console.warn('%cFallbackJS: %c' + args.shift() + ': %c' + args.join(), 'font-weight: bold; color: #da542c', 'font-weight: bold; color: #000', 'color: #999');
};

// Generate a normalization function based on the type that is passed in. For example if a type of `String` was passed
// in, the function `normalizeString` would be generated for the library. The purpose of these functions are to
// normalize any data that's passed into them. If you try to pass an `Array` to `normalizeString`, the function would
// then return the `fallback` value that is specified; if no `fallback` value is specified it would then return `null`.
me.normalize = function(input, type, fallback) {
	return me['is' + type](input) ? input : fallback;
};

// Perform normalization on a series of data types. It provides the same functionality as the `normalize` function but
// it expects to receive of an `Array` series of data sets.
me.normalizeSeries = function(input, type, fallback, strip) {
	// Store our normalized series.
	var normalized = [];

	// Case our input to an array/series.
	if (!me.isArray(input)) {
		input = [input];
	}

	// Loop through eaach of our values.
	me.each(input, function(value, key) {
		// Normalize our value.
		value = me['normalize' + type](value, fallback);

		// If strip is not explicity set in, and the `value` is falsey, it'll be removed from the normalized results. Falsey
		// translate to: `null`, `0`, `false`, `undefined`.
		if (strip !== false && !value) {
			return;
		}

		// Set our normalized value.
		normalized[key] = value;
	});

	// Return our normalized series.
	return normalized;
};

// Constrain an object to only contain a specific set of keys. All other keys are discarded, and a warning is thrown.
me.objectConstrain = function(input, whitelist, reference) {
	// Store our normalized `Object`.
	var normalized = {};

	// Loop through our `Object`.
	me.each(input, function(value, key) {
		// Throw a warning to the user that we've discarded the `key` in question.
		if (whitelist.indexOf(key) === -1) {
			me.warn('core', 'objectConstrain', 'The key `' + key + '` is not allowed in `' + reference + '`, discarding.', input);
			return;
		}

		// Set our normalized value.
		normalized[key] = value;
	});

	// Return our normalized `Object`.
	return normalized;
};

// Merge an `Object` with a set of default values. If the `defaults` parameter is an `Array`, it will treat whatever
// the value is for `fallback` as it's value.
me.objectMerge = function(input, defaults, fallback) {
	// Our merge `Object`.
	var normalized = {};

	// The defaults to merge with.
	var defaultsIArray = me.isArray(defaults);

	// Loop through our defaults.
	me.each(defaults, function(value, key) {
		// If our `defaults` is an `Array` we need to swap out the key/values.
		if (defaultsIArray === true) {
			key = value;
			value = fallback;
		}

		// If the `key` is defined in our `input` object, then don't override it, reference it.
		if (me.isDefined(input[key])) {
			normalized[key] = input[key];
			return;
		}

		// Set the value of our default `key`.
		normalized[key] = value;
	});

	// Return our merged `Object`.
	return normalized;
};

// Run a number of functions in parallel with the ability to call a single callback once they've all completed.
me.parallel = function(references, callback) {
	// Our reference argument must be an `Array`, if not halt the function.
	if (!me.isArray(references)) {
		callback();
		return;
	}

	// Generate a unique identifier for our parallel instance to avoid collisions.
	var guid = me.guid();

	// Add the our `references` to our parallel queue.
	me.parallel.queue[guid] = {
		// The number of callbacks that were invoked.
		interval: 0,

		// The total number of callbacks to run in parralel.
		length: references.length
	};

	// Loop through all of our refernces and execute them.
	me.each(references, function(reference) {
		// Anonymous spawn and track our `Function` to invoke.
		me.parallel.anonymous(reference, guid, callback);
	});
};

// Our anonymous functions that we're executing in parallel.
me.parallel.anonymous = function(reference, guid, callback) {
	// Invoke our queued function.
	reference(function() {
		// Reference the instance of our parallel runner.
		var parallel = me.parallel.queue[guid];

		// If the `guid` is not defined in our queue, then it was cancelled.
		if (!me.isDefined(parallel)) {
			return callback(false);
		}

		// Increment our callback invocation count.
		parallel.interval++;

		// If all of our functions ran successful, process our final callback and clear our memory of the queue.
		if (parallel.interval === parallel.length) {
			// Remove our runner instance from the queue.
			delete me.parallel.queue[guid];

			// Fire off our final callback, as the queue has been exhausted.
			callback(true);
		}
	});
};

// Container `Object` for all of the currently running parallel jobs.
me.parallel.queue = {};

// Output the configured libraries, their load times and other useful statistics for the end user. @todo
me.stats = function() {
	var separator = '\n' + Array(250).join('-') + '\n';
	var padding30 = Array(30).join(' ');
	var padding60 = Array(60).join(' ');

	var output = '\n' + me.banner;
	output += '\n' + me.stringPad('v' + me.version, padding60, true) + '\n';
	output += '\n' + me.stringPad('http://fallbackjs.com', padding60, true) + '\n';
	output += separator;
	output += me.stringPad('Library', padding60);
	output += me.stringPad('Type', padding30);
	output += me.stringPad('Time', padding30);
	output += me.stringPad('Loaded', padding30);
	output += me.stringPad('Invoked', padding30);
	output += me.stringPad('Failed', padding30);
	output += 'Success';
	output += separator;

	me.each(me.module.definitions, function(value, key) {
		var time = (value.loader.timeEnd - value.loader.timeStart) / 1000;
		time = time || time === 0 ? time + 's' : 'N/A';

		output += me.stringPad(key, padding60);
		output += me.stringPad(typeof value.factory, padding30);
		output += me.stringPad(time, padding30);
		output += me.stringPad(me.normalizeBoolean(value.loader.loaded, false), padding30);
		output += me.stringPad(me.normalizeBoolean(value.invoked, false), padding30);
		output += me.stringPad(value.loader.failed.length, padding30);
		output += value.loader.success ? value.loader.success : 'N/A';
		output += '\n';
	});

	return output;
};

// A function which simply pads a `String` with whatever `String` is supplied.
me.stringPad = function(input, pad, left) {
	if (!me.isDefined(input)) {
		return pad;
	}

	if (left) {
		return (pad + input).slice(-pad.length);
	}

	return (input + pad).substr(0, pad.length);
};

// Convert any `input` to an `Array`.
me.toArray = function(input) {
	return Array.prototype.slice.call(input);
};

// Automatically generate utility functions for our library. This library will generate the following functions:
// - isArray, normalizeArray, normalizeArraySeries
// - iBoolean, normalizeBoolean, normalizeBooleanSeries
// - isFunction, normalizeFunction, normalizeFunctionSeries
// - isHTMLScriptElement
// - isNumber, normalizeNumber, normalizeNumberSeries
// - isObject, normalizeObject, normalizeObjectSeries
// - isString, normalizeString, normalizeStringSeries
me.utility = function(type) {
	// Adding a function prefixed with `is` to check if a variable is actually the type that's being passed in.
	me['is' + type] = function(variable) {
		return Object.prototype.toString.call(variable) === '[object ' + type + ']';
	};

	// We cannot generate normalize functions for the following types, so skip them.
	if (type === 'HTMLCollection' || type === 'HTMLScriptElement') {
		return;
	}

	// Our normalization function.
	me['normalize' + type] = function(input, fallback) {
		return me.normalize(input, type, me.isDefined(fallback) ? fallback : null);
	};

	// Our normalization series function.
	me['normalize' + type + 'Series'] = function(input, fallback) {
		return me.normalizeSeries(input, type, me.isDefined(fallback) ? fallback : null);
	};
};

// The different utility types that we want to generate functions for.
me.utility.types = ['Array', 'Boolean', 'Function', 'HTMLCollection', 'HTMLScriptElement', 'Number', 'Object', 'String'];