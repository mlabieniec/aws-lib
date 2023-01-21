(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@aws-sdk/client-cognito-identity'), require('@aws-sdk/client-cognito-identity-provider'), require('axios'), require('@aws-sdk/signature-v4'), require('@aws-crypto/sha256-js'), require('localstorage-slim'), require('crypto-js/enc-utf8'), require('crypto-js/aes')) :
  typeof define === 'function' && define.amd ? define(['exports', '@aws-sdk/client-cognito-identity', '@aws-sdk/client-cognito-identity-provider', 'axios', '@aws-sdk/signature-v4', '@aws-crypto/sha256-js', 'localstorage-slim', 'crypto-js/enc-utf8', 'crypto-js/aes'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.awsLib = {}, global.clientCognitoIdentity, global.clientCognitoIdentityProvider, global.axios, global.signatureV4, global.sha256Js, global.ls, global.encUTF8, global.AES));
})(this, (function (exports, clientCognitoIdentity, clientCognitoIdentityProvider, axios, signatureV4, sha256Js, ls, encUTF8, AES) { 'use strict';

  var AppStack = {
  	cognitoIdentityPoolID: "us-east-1:3c32a4f0-cd83-4eff-bce8-22144dee7b80",
  	cognitoUserPoolClientID: "fiea480dpek44e71t52qkiipf",
  	cognitoUserpoolID: "us-east-1_MOq2y9G4G",
  	data: "https://hlwkrq00q7.execute-api.us-east-1.amazonaws.com/prod/data",
  	auth: "https://hlwkrq00q7.execute-api.us-east-1.amazonaws.com/prod/auth",
  	google: "677953287897-2brf5vfk5tbs9t7a607tuiu8mjqavaej.apps.googleusercontent.com",
  	id: "74a7c66d-af69-5b3a-b43b-19310b2a23a1",
  	region: "us-east-1"
  };
  var Exports = {
  	AppStack: AppStack
  };

  /*
  axios v0.7.0 
  Copyright (c) 2014 Matt Zabriskie

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
  */
  (function webpackUniversalModuleDefinition(root, factory) {
  	if(typeof exports === 'object' && typeof module === 'object')
  		module.exports = factory();
  	else if(typeof define === 'function' && define.amd)
  		define([], factory);
  	else if(typeof exports === 'object')
  		exports["axios"] = factory();
  	else
  		root["axios"] = factory();
  })(undefined, function() {
  return /******/ (function(modules) { // webpackBootstrap
  /******/ 	// The module cache
  /******/ 	var installedModules = {};
  /******/
  /******/ 	// The require function
  /******/ 	function __webpack_require__(moduleId) {
  /******/
  /******/ 		// Check if module is in cache
  /******/ 		if(installedModules[moduleId])
  /******/ 			return installedModules[moduleId].exports;
  /******/
  /******/ 		// Create a new module (and put it into the cache)
  /******/ 		var module = installedModules[moduleId] = {
  /******/ 			exports: {},
  /******/ 			id: moduleId,
  /******/ 			loaded: false
  /******/ 		};
  /******/
  /******/ 		// Execute the module function
  /******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
  /******/
  /******/ 		// Flag the module as loaded
  /******/ 		module.loaded = true;
  /******/
  /******/ 		// Return the exports of the module
  /******/ 		return module.exports;
  /******/ 	}
  /******/
  /******/
  /******/ 	// expose the modules object (__webpack_modules__)
  /******/ 	__webpack_require__.m = modules;
  /******/
  /******/ 	// expose the module cache
  /******/ 	__webpack_require__.c = installedModules;
  /******/
  /******/ 	// __webpack_public_path__
  /******/ 	__webpack_require__.p = "";
  /******/
  /******/ 	// Load entry module and return exports
  /******/ 	return __webpack_require__(0);
  /******/ })
  /************************************************************************/
  /******/ ([
  /* 0 */
  /***/ function(module, exports, __webpack_require__) {

  	module.exports = __webpack_require__(1);

  /***/ },
  /* 1 */
  /***/ function(module, exports, __webpack_require__) {
  	
  	var defaults = __webpack_require__(2);
  	var utils = __webpack_require__(3);
  	var dispatchRequest = __webpack_require__(4);
  	var InterceptorManager = __webpack_require__(12);
  	
  	var axios = module.exports = function (config) {
  	  // Allow for axios('example/url'[, config]) a la fetch API
  	  if (typeof config === 'string') {
  	    config = utils.merge({
  	      url: arguments[0]
  	    }, arguments[1]);
  	  }
  	
  	  config = utils.merge({
  	    method: 'get',
  	    headers: {},
  	    timeout: defaults.timeout,
  	    transformRequest: defaults.transformRequest,
  	    transformResponse: defaults.transformResponse
  	  }, config);
  	
  	  // Don't allow overriding defaults.withCredentials
  	  config.withCredentials = config.withCredentials || defaults.withCredentials;
  	
  	  // Hook up interceptors middleware
  	  var chain = [dispatchRequest, undefined];
  	  var promise = Promise.resolve(config);
  	
  	  axios.interceptors.request.forEach(function (interceptor) {
  	    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  	  });
  	
  	  axios.interceptors.response.forEach(function (interceptor) {
  	    chain.push(interceptor.fulfilled, interceptor.rejected);
  	  });
  	
  	  while (chain.length) {
  	    promise = promise.then(chain.shift(), chain.shift());
  	  }
  	
  	  return promise;
  	};
  	
  	// Expose defaults
  	axios.defaults = defaults;
  	
  	// Expose all/spread
  	axios.all = function (promises) {
  	  return Promise.all(promises);
  	};
  	axios.spread = __webpack_require__(13);
  	
  	// Expose interceptors
  	axios.interceptors = {
  	  request: new InterceptorManager(),
  	  response: new InterceptorManager()
  	};
  	
  	// Provide aliases for supported request methods
  	(function () {
  	  function createShortMethods() {
  	    utils.forEach(arguments, function (method) {
  	      axios[method] = function (url, config) {
  	        return axios(utils.merge(config || {}, {
  	          method: method,
  	          url: url
  	        }));
  	      };
  	    });
  	  }
  	
  	  function createShortMethodsWithData() {
  	    utils.forEach(arguments, function (method) {
  	      axios[method] = function (url, data, config) {
  	        return axios(utils.merge(config || {}, {
  	          method: method,
  	          url: url,
  	          data: data
  	        }));
  	      };
  	    });
  	  }
  	
  	  createShortMethods('delete', 'get', 'head');
  	  createShortMethodsWithData('post', 'put', 'patch');
  	})();


  /***/ },
  /* 2 */
  /***/ function(module, exports, __webpack_require__) {
  	
  	var utils = __webpack_require__(3);
  	
  	var PROTECTION_PREFIX = /^\)\]\}',?\n/;
  	var DEFAULT_CONTENT_TYPE = {
  	  'Content-Type': 'application/json'
  	};
  	
  	module.exports = {
  	  transformRequest: [function (data, headers) {
  	    if(utils.isFormData(data)) {
  	      return data;
  	    }
  	    if (utils.isArrayBuffer(data)) {
  	      return data;
  	    }
  	    if (utils.isArrayBufferView(data)) {
  	      return data.buffer;
  	    }
  	    if (utils.isObject(data) && !utils.isFile(data) && !utils.isBlob(data)) {
  	      // Set application/json if no Content-Type has been specified
  	      if (!utils.isUndefined(headers)) {
  	        utils.forEach(headers, function (val, key) {
  	          if (key.toLowerCase() === 'content-type') {
  	            headers['Content-Type'] = val;
  	          }
  	        });
  	
  	        if (utils.isUndefined(headers['Content-Type'])) {
  	          headers['Content-Type'] = 'application/json;charset=utf-8';
  	        }
  	      }
  	      return JSON.stringify(data);
  	    }
  	    return data;
  	  }],
  	
  	  transformResponse: [function (data) {
  	    if (typeof data === 'string') {
  	      data = data.replace(PROTECTION_PREFIX, '');
  	      try {
  	        data = JSON.parse(data);
  	      } catch (e) { /* Ignore */ }
  	    }
  	    return data;
  	  }],
  	
  	  headers: {
  	    common: {
  	      'Accept': 'application/json, text/plain, */*'
  	    },
  	    patch: utils.merge(DEFAULT_CONTENT_TYPE),
  	    post: utils.merge(DEFAULT_CONTENT_TYPE),
  	    put: utils.merge(DEFAULT_CONTENT_TYPE)
  	  },
  	
  	  timeout: 0,
  	
  	  xsrfCookieName: 'XSRF-TOKEN',
  	  xsrfHeaderName: 'X-XSRF-TOKEN'
  	};


  /***/ },
  /* 3 */
  /***/ function(module, exports) {
  	
  	/*global toString:true*/
  	
  	// utils is a library of generic helper functions non-specific to axios
  	
  	var toString = Object.prototype.toString;
  	
  	/**
  	 * Determine if a value is an Array
  	 *
  	 * @param {Object} val The value to test
  	 * @returns {boolean} True if value is an Array, otherwise false
  	 */
  	function isArray(val) {
  	  return toString.call(val) === '[object Array]';
  	}
  	
  	/**
  	 * Determine if a value is an ArrayBuffer
  	 *
  	 * @param {Object} val The value to test
  	 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
  	 */
  	function isArrayBuffer(val) {
  	  return toString.call(val) === '[object ArrayBuffer]';
  	}
  	
  	/**
  	 * Determine if a value is a FormData
  	 *
  	 * @param {Object} val The value to test
  	 * @returns {boolean} True if value is an FormData, otherwise false
  	 */
  	function isFormData(val) {
  	  return toString.call(val) === '[object FormData]';
  	}
  	
  	/**
  	 * Determine if a value is a view on an ArrayBuffer
  	 *
  	 * @param {Object} val The value to test
  	 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
  	 */
  	function isArrayBufferView(val) {
  	  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
  	    return ArrayBuffer.isView(val);
  	  } else {
  	    return (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  	  }
  	}
  	
  	/**
  	 * Determine if a value is a String
  	 *
  	 * @param {Object} val The value to test
  	 * @returns {boolean} True if value is a String, otherwise false
  	 */
  	function isString(val) {
  	  return typeof val === 'string';
  	}
  	
  	/**
  	 * Determine if a value is a Number
  	 *
  	 * @param {Object} val The value to test
  	 * @returns {boolean} True if value is a Number, otherwise false
  	 */
  	function isNumber(val) {
  	  return typeof val === 'number';
  	}
  	
  	/**
  	 * Determine if a value is undefined
  	 *
  	 * @param {Object} val The value to test
  	 * @returns {boolean} True if the value is undefined, otherwise false
  	 */
  	function isUndefined(val) {
  	  return typeof val === 'undefined';
  	}
  	
  	/**
  	 * Determine if a value is an Object
  	 *
  	 * @param {Object} val The value to test
  	 * @returns {boolean} True if value is an Object, otherwise false
  	 */
  	function isObject(val) {
  	  return val !== null && typeof val === 'object';
  	}
  	
  	/**
  	 * Determine if a value is a Date
  	 *
  	 * @param {Object} val The value to test
  	 * @returns {boolean} True if value is a Date, otherwise false
  	 */
  	function isDate(val) {
  	  return toString.call(val) === '[object Date]';
  	}
  	
  	/**
  	 * Determine if a value is a File
  	 *
  	 * @param {Object} val The value to test
  	 * @returns {boolean} True if value is a File, otherwise false
  	 */
  	function isFile(val) {
  	  return toString.call(val) === '[object File]';
  	}
  	
  	/**
  	 * Determine if a value is a Blob
  	 *
  	 * @param {Object} val The value to test
  	 * @returns {boolean} True if value is a Blob, otherwise false
  	 */
  	function isBlob(val) {
  	  return toString.call(val) === '[object Blob]';
  	}
  	
  	/**
  	 * Trim excess whitespace off the beginning and end of a string
  	 *
  	 * @param {String} str The String to trim
  	 * @returns {String} The String freed of excess whitespace
  	 */
  	function trim(str) {
  	  return str.replace(/^\s*/, '').replace(/\s*$/, '');
  	}
  	
  	/**
  	 * Determine if a value is an Arguments object
  	 *
  	 * @param {Object} val The value to test
  	 * @returns {boolean} True if value is an Arguments object, otherwise false
  	 */
  	function isArguments(val) {
  	  return toString.call(val) === '[object Arguments]';
  	}
  	
  	/**
  	 * Determine if we're running in a standard browser environment
  	 *
  	 * This allows axios to run in a web worker, and react-native.
  	 * Both environments support XMLHttpRequest, but not fully standard globals.
  	 *
  	 * web workers:
  	 *  typeof window -> undefined
  	 *  typeof document -> undefined
  	 *
  	 * react-native:
  	 *  typeof document.createelement -> undefined
  	 */
  	function isStandardBrowserEnv() {
  	  return (
  	    typeof window !== 'undefined' &&
  	    typeof document !== 'undefined' &&
  	    typeof document.createElement === 'function'
  	  );
  	}
  	
  	/**
  	 * Iterate over an Array or an Object invoking a function for each item.
  	 *
  	 * If `obj` is an Array or arguments callback will be called passing
  	 * the value, index, and complete array for each item.
  	 *
  	 * If 'obj' is an Object callback will be called passing
  	 * the value, key, and complete object for each property.
  	 *
  	 * @param {Object|Array} obj The object to iterate
  	 * @param {Function} fn The callback to invoke for each item
  	 */
  	function forEach(obj, fn) {
  	  // Don't bother if no value provided
  	  if (obj === null || typeof obj === 'undefined') {
  	    return;
  	  }
  	
  	  // Check if obj is array-like
  	  var isArrayLike = isArray(obj) || isArguments(obj);
  	
  	  // Force an array if not already something iterable
  	  if (typeof obj !== 'object' && !isArrayLike) {
  	    obj = [obj];
  	  }
  	
  	  // Iterate over array values
  	  if (isArrayLike) {
  	    for (var i = 0, l = obj.length; i < l; i++) {
  	      fn.call(null, obj[i], i, obj);
  	    }
  	  }
  	  // Iterate over object keys
  	  else {
  	    for (var key in obj) {
  	      if (obj.hasOwnProperty(key)) {
  	        fn.call(null, obj[key], key, obj);
  	      }
  	    }
  	  }
  	}
  	
  	/**
  	 * Accepts varargs expecting each argument to be an object, then
  	 * immutably merges the properties of each object and returns result.
  	 *
  	 * When multiple objects contain the same key the later object in
  	 * the arguments list will take precedence.
  	 *
  	 * Example:
  	 *
  	 * ```js
  	 * var result = merge({foo: 123}, {foo: 456});
  	 * console.log(result.foo); // outputs 456
  	 * ```
  	 *
  	 * @param {Object} obj1 Object to merge
  	 * @returns {Object} Result of all merge properties
  	 */
  	function merge(/*obj1, obj2, obj3, ...*/) {
  	  var result = {};
  	  forEach(arguments, function (obj) {
  	    forEach(obj, function (val, key) {
  	      result[key] = val;
  	    });
  	  });
  	  return result;
  	}
  	
  	module.exports = {
  	  isArray: isArray,
  	  isArrayBuffer: isArrayBuffer,
  	  isFormData: isFormData,
  	  isArrayBufferView: isArrayBufferView,
  	  isString: isString,
  	  isNumber: isNumber,
  	  isObject: isObject,
  	  isUndefined: isUndefined,
  	  isDate: isDate,
  	  isFile: isFile,
  	  isBlob: isBlob,
  	  isStandardBrowserEnv: isStandardBrowserEnv,
  	  forEach: forEach,
  	  merge: merge,
  	  trim: trim
  	};


  /***/ },
  /* 4 */
  /***/ function(module, exports, __webpack_require__) {

  	/* WEBPACK VAR INJECTION */(function(process) {	
  	/**
  	 * Dispatch a request to the server using whichever adapter
  	 * is supported by the current environment.
  	 *
  	 * @param {object} config The config that is to be used for the request
  	 * @returns {Promise} The Promise to be fulfilled
  	 */
  	module.exports = function dispatchRequest(config) {
  	  return new Promise(function (resolve, reject) {
  	    try {
  	      // For browsers use XHR adapter
  	      if ((typeof XMLHttpRequest !== 'undefined') || (typeof ActiveXObject !== 'undefined')) {
  	        __webpack_require__(6)(resolve, reject, config);
  	      }
  	      // For node use HTTP adapter
  	      else if (typeof process !== 'undefined') {
  	        __webpack_require__(6)(resolve, reject, config);
  	      }
  	    } catch (e) {
  	      reject(e);
  	    }
  	  });
  	};
  	
  	
  	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)));

  /***/ },
  /* 5 */
  /***/ function(module, exports) {

  	// shim for using process in browser
  	
  	var process = module.exports = {};
  	var queue = [];
  	var draining = false;
  	var currentQueue;
  	var queueIndex = -1;
  	
  	function cleanUpNextTick() {
  	    draining = false;
  	    if (currentQueue.length) {
  	        queue = currentQueue.concat(queue);
  	    } else {
  	        queueIndex = -1;
  	    }
  	    if (queue.length) {
  	        drainQueue();
  	    }
  	}
  	
  	function drainQueue() {
  	    if (draining) {
  	        return;
  	    }
  	    var timeout = setTimeout(cleanUpNextTick);
  	    draining = true;
  	
  	    var len = queue.length;
  	    while(len) {
  	        currentQueue = queue;
  	        queue = [];
  	        while (++queueIndex < len) {
  	            if (currentQueue) {
  	                currentQueue[queueIndex].run();
  	            }
  	        }
  	        queueIndex = -1;
  	        len = queue.length;
  	    }
  	    currentQueue = null;
  	    draining = false;
  	    clearTimeout(timeout);
  	}
  	
  	process.nextTick = function (fun) {
  	    var args = new Array(arguments.length - 1);
  	    if (arguments.length > 1) {
  	        for (var i = 1; i < arguments.length; i++) {
  	            args[i - 1] = arguments[i];
  	        }
  	    }
  	    queue.push(new Item(fun, args));
  	    if (queue.length === 1 && !draining) {
  	        setTimeout(drainQueue, 0);
  	    }
  	};
  	
  	// v8 likes predictible objects
  	function Item(fun, array) {
  	    this.fun = fun;
  	    this.array = array;
  	}
  	Item.prototype.run = function () {
  	    this.fun.apply(null, this.array);
  	};
  	process.title = 'browser';
  	process.browser = true;
  	process.env = {};
  	process.argv = [];
  	process.version = ''; // empty string to avoid regexp issues
  	process.versions = {};
  	
  	function noop() {}
  	
  	process.on = noop;
  	process.addListener = noop;
  	process.once = noop;
  	process.off = noop;
  	process.removeListener = noop;
  	process.removeAllListeners = noop;
  	process.emit = noop;
  	
  	process.binding = function (name) {
  	    throw new Error('process.binding is not supported');
  	};
  	
  	process.cwd = function () { return '/' };
  	process.chdir = function (dir) {
  	    throw new Error('process.chdir is not supported');
  	};
  	process.umask = function() { return 0; };


  /***/ },
  /* 6 */
  /***/ function(module, exports, __webpack_require__) {
  	
  	/*global ActiveXObject:true*/
  	
  	var defaults = __webpack_require__(2);
  	var utils = __webpack_require__(3);
  	var buildUrl = __webpack_require__(7);
  	var parseHeaders = __webpack_require__(8);
  	var transformData = __webpack_require__(9);
  	
  	module.exports = function xhrAdapter(resolve, reject, config) {
  	  // Transform request data
  	  var data = transformData(
  	    config.data,
  	    config.headers,
  	    config.transformRequest
  	  );
  	
  	  // Merge headers
  	  var requestHeaders = utils.merge(
  	    defaults.headers.common,
  	    defaults.headers[config.method] || {},
  	    config.headers || {}
  	  );
  	
  	  if (utils.isFormData(data)) ;
  	
  	  // Create the request
  	  var request = new (XMLHttpRequest || ActiveXObject)('Microsoft.XMLHTTP');
  	  request.open(config.method.toUpperCase(), buildUrl(config.url, config.params), true);
  	
  	  // Set the request timeout in MS
  	  request.timeout = config.timeout;
  	
  	  // Listen for ready state
  	  request.onreadystatechange = function () {
  	    if (request && request.readyState === 4) {
  	      // Prepare the response
  	      var responseHeaders = parseHeaders(request.getAllResponseHeaders());
  	      var responseData = ['text', ''].indexOf(config.responseType || '') !== -1 ? request.responseText : request.response;
  	      var response = {
  	        data: transformData(
  	          responseData,
  	          responseHeaders,
  	          config.transformResponse
  	        ),
  	        status: request.status,
  	        statusText: request.statusText,
  	        headers: responseHeaders,
  	        config: config
  	      };
  	
  	      // Resolve or reject the Promise based on the status
  	      (request.status >= 200 && request.status < 300 ?
  	        resolve :
  	        reject)(response);
  	
  	      // Clean up request
  	      request = null;
  	    }
  	  };
  	
  	  // Add xsrf header
  	  // This is only done if running in a standard browser environment.
  	  // Specifically not if we're in a web worker, or react-native.
  	  if (utils.isStandardBrowserEnv()) {
  	    var cookies = __webpack_require__(10);
  	    var urlIsSameOrigin = __webpack_require__(11);
  	
  	    // Add xsrf header
  	    var xsrfValue = urlIsSameOrigin(config.url) ?
  	        cookies.read(config.xsrfCookieName || defaults.xsrfCookieName) :
  	        undefined;
  	
  	    if (xsrfValue) {
  	      requestHeaders[config.xsrfHeaderName || defaults.xsrfHeaderName] = xsrfValue;
  	    }
  	  }
  	
  	  // Add headers to the request
  	  utils.forEach(requestHeaders, function (val, key) {
  	    // Remove Content-Type if data is undefined
  	    if (!data && key.toLowerCase() === 'content-type') {
  	      delete requestHeaders[key];
  	    }
  	    // Otherwise add header to the request
  	    else {
  	      request.setRequestHeader(key, val);
  	    }
  	  });
  	
  	  // Add withCredentials to request if needed
  	  if (config.withCredentials) {
  	    request.withCredentials = true;
  	  }
  	
  	  // Add responseType to request if needed
  	  if (config.responseType) {
  	    try {
  	      request.responseType = config.responseType;
  	    } catch (e) {
  	      if (request.responseType !== 'json') {
  	        throw e;
  	      }
  	    }
  	  }
  	
  	  if (utils.isArrayBuffer(data)) {
  	    data = new DataView(data);
  	  }
  	
  	  // Send the request
  	  request.send(data);
  	};


  /***/ },
  /* 7 */
  /***/ function(module, exports, __webpack_require__) {
  	
  	var utils = __webpack_require__(3);
  	
  	function encode(val) {
  	  return encodeURIComponent(val).
  	    replace(/%40/gi, '@').
  	    replace(/%3A/gi, ':').
  	    replace(/%24/g, '$').
  	    replace(/%2C/gi, ',').
  	    replace(/%20/g, '+').
  	    replace(/%5B/gi, '[').
  	    replace(/%5D/gi, ']');
  	}
  	
  	/**
  	 * Build a URL by appending params to the end
  	 *
  	 * @param {string} url The base of the url (e.g., http://www.google.com)
  	 * @param {object} [params] The params to be appended
  	 * @returns {string} The formatted url
  	 */
  	module.exports = function buildUrl(url, params) {
  	  if (!params) {
  	    return url;
  	  }
  	
  	  var parts = [];
  	
  	  utils.forEach(params, function (val, key) {
  	    if (val === null || typeof val === 'undefined') {
  	      return;
  	    }
  	
  	    if (utils.isArray(val)) {
  	      key = key + '[]';
  	    }
  	
  	    if (!utils.isArray(val)) {
  	      val = [val];
  	    }
  	
  	    utils.forEach(val, function (v) {
  	      if (utils.isDate(v)) {
  	        v = v.toISOString();
  	      }
  	      else if (utils.isObject(v)) {
  	        v = JSON.stringify(v);
  	      }
  	      parts.push(encode(key) + '=' + encode(v));
  	    });
  	  });
  	
  	  if (parts.length > 0) {
  	    url += (url.indexOf('?') === -1 ? '?' : '&') + parts.join('&');
  	  }
  	
  	  return url;
  	};


  /***/ },
  /* 8 */
  /***/ function(module, exports, __webpack_require__) {
  	
  	var utils = __webpack_require__(3);
  	
  	/**
  	 * Parse headers into an object
  	 *
  	 * ```
  	 * Date: Wed, 27 Aug 2014 08:58:49 GMT
  	 * Content-Type: application/json
  	 * Connection: keep-alive
  	 * Transfer-Encoding: chunked
  	 * ```
  	 *
  	 * @param {String} headers Headers needing to be parsed
  	 * @returns {Object} Headers parsed into an object
  	 */
  	module.exports = function parseHeaders(headers) {
  	  var parsed = {}, key, val, i;
  	
  	  if (!headers) { return parsed; }
  	
  	  utils.forEach(headers.split('\n'), function(line) {
  	    i = line.indexOf(':');
  	    key = utils.trim(line.substr(0, i)).toLowerCase();
  	    val = utils.trim(line.substr(i + 1));
  	
  	    if (key) {
  	      parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
  	    }
  	  });
  	
  	  return parsed;
  	};


  /***/ },
  /* 9 */
  /***/ function(module, exports, __webpack_require__) {
  	
  	var utils = __webpack_require__(3);
  	
  	/**
  	 * Transform the data for a request or a response
  	 *
  	 * @param {Object|String} data The data to be transformed
  	 * @param {Array} headers The headers for the request or response
  	 * @param {Array|Function} fns A single function or Array of functions
  	 * @returns {*} The resulting transformed data
  	 */
  	module.exports = function transformData(data, headers, fns) {
  	  utils.forEach(fns, function (fn) {
  	    data = fn(data, headers);
  	  });
  	
  	  return data;
  	};


  /***/ },
  /* 10 */
  /***/ function(module, exports, __webpack_require__) {
  	
  	/**
  	 * WARNING:
  	 *  This file makes references to objects that aren't safe in all environments.
  	 *  Please see lib/utils.isStandardBrowserEnv before including this file.
  	 */
  	
  	var utils = __webpack_require__(3);
  	
  	module.exports = {
  	  write: function write(name, value, expires, path, domain, secure) {
  	    var cookie = [];
  	    cookie.push(name + '=' + encodeURIComponent(value));
  	
  	    if (utils.isNumber(expires)) {
  	      cookie.push('expires=' + new Date(expires).toGMTString());
  	    }
  	
  	    if (utils.isString(path)) {
  	      cookie.push('path=' + path);
  	    }
  	
  	    if (utils.isString(domain)) {
  	      cookie.push('domain=' + domain);
  	    }
  	
  	    if (secure === true) {
  	      cookie.push('secure');
  	    }
  	
  	    document.cookie = cookie.join('; ');
  	  },
  	
  	  read: function read(name) {
  	    var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  	    return (match ? decodeURIComponent(match[3]) : null);
  	  },
  	
  	  remove: function remove(name) {
  	    this.write(name, '', Date.now() - 86400000);
  	  }
  	};


  /***/ },
  /* 11 */
  /***/ function(module, exports, __webpack_require__) {
  	
  	/**
  	 * WARNING:
  	 *  This file makes references to objects that aren't safe in all environments.
  	 *  Please see lib/utils.isStandardBrowserEnv before including this file.
  	 */
  	
  	var utils = __webpack_require__(3);
  	var msie = /(msie|trident)/i.test(navigator.userAgent);
  	var urlParsingNode = document.createElement('a');
  	var originUrl;
  	
  	/**
  	 * Parse a URL to discover it's components
  	 *
  	 * @param {String} url The URL to be parsed
  	 * @returns {Object}
  	 */
  	function urlResolve(url) {
  	  var href = url;
  	
  	  if (msie) {
  	    // IE needs attribute set twice to normalize properties
  	    urlParsingNode.setAttribute('href', href);
  	    href = urlParsingNode.href;
  	  }
  	
  	  urlParsingNode.setAttribute('href', href);
  	
  	  // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
  	  return {
  	    href: urlParsingNode.href,
  	    protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
  	    host: urlParsingNode.host,
  	    search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
  	    hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
  	    hostname: urlParsingNode.hostname,
  	    port: urlParsingNode.port,
  	    pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
  	              urlParsingNode.pathname :
  	              '/' + urlParsingNode.pathname
  	  };
  	}
  	
  	originUrl = urlResolve(window.location.href);
  	
  	/**
  	 * Determine if a URL shares the same origin as the current location
  	 *
  	 * @param {String} requestUrl The URL to test
  	 * @returns {boolean} True if URL shares the same origin, otherwise false
  	 */
  	module.exports = function urlIsSameOrigin(requestUrl) {
  	  var parsed = (utils.isString(requestUrl)) ? urlResolve(requestUrl) : requestUrl;
  	  return (parsed.protocol === originUrl.protocol &&
  	        parsed.host === originUrl.host);
  	};


  /***/ },
  /* 12 */
  /***/ function(module, exports, __webpack_require__) {
  	
  	var utils = __webpack_require__(3);
  	
  	function InterceptorManager() {
  	  this.handlers = [];
  	}
  	
  	/**
  	 * Add a new interceptor to the stack
  	 *
  	 * @param {Function} fulfilled The function to handle `then` for a `Promise`
  	 * @param {Function} rejected The function to handle `reject` for a `Promise`
  	 *
  	 * @return {Number} An ID used to remove interceptor later
  	 */
  	InterceptorManager.prototype.use = function (fulfilled, rejected) {
  	  this.handlers.push({
  	    fulfilled: fulfilled,
  	    rejected: rejected
  	  });
  	  return this.handlers.length - 1;
  	};
  	
  	/**
  	 * Remove an interceptor from the stack
  	 *
  	 * @param {Number} id The ID that was returned by `use`
  	 */
  	InterceptorManager.prototype.eject = function (id) {
  	  if (this.handlers[id]) {
  	    this.handlers[id] = null;
  	  }
  	};
  	
  	/**
  	 * Iterate over all the registered interceptors
  	 *
  	 * This method is particularly useful for skipping over any
  	 * interceptors that may have become `null` calling `remove`.
  	 *
  	 * @param {Function} fn The function to call for each interceptor
  	 */
  	InterceptorManager.prototype.forEach = function (fn) {
  	  utils.forEach(this.handlers, function (h) {
  	    if (h !== null) {
  	      fn(h);
  	    }
  	  });
  	};
  	
  	module.exports = InterceptorManager;


  /***/ },
  /* 13 */
  /***/ function(module, exports) {
  	
  	/**
  	 * Syntactic sugar for invoking a function and expanding an array for arguments.
  	 *
  	 * Common use case would be to use `Function.prototype.apply`.
  	 *
  	 *  ```js
  	 *  function f(x, y, z) {}
  	 *  var args = [1, 2, 3];
  	 *  f.apply(null, args);
  	 *  ```
  	 *
  	 * With `spread` this example can be re-written.
  	 *
  	 *  ```js
  	 *  spread(function(x, y, z) {})([1, 2, 3]);
  	 *  ```
  	 *
  	 * @param {Function} callback
  	 * @returns {Function}
  	 */
  	module.exports = function spread(callback) {
  	  return function (arr) {
  	    return callback.apply(null, arr);
  	  };
  	};


  /***/ }
  /******/ ])
  });

  /*
  CryptoJS v3.1.2
  code.google.com/p/crypto-js
  (c) 2009-2013 by Jeff Mott. All rights reserved.
  code.google.com/p/crypto-js/wiki/License
  */
  CryptoJS=CryptoJS||function(h,s){var f={},g=f.lib={},q=function(){},m=g.Base={extend:function(a){q.prototype=this;var c=new q;a&&c.mixIn(a);c.hasOwnProperty("init")||(c.init=function(){c.$super.init.apply(this,arguments);});c.init.prototype=c;c.$super=this;return c},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var c in a)a.hasOwnProperty(c)&&(this[c]=a[c]);a.hasOwnProperty("toString")&&(this.toString=a.toString);},clone:function(){return this.init.prototype.extend(this)}},
  r=g.WordArray=m.extend({init:function(a,c){a=this.words=a||[];this.sigBytes=c!=s?c:4*a.length;},toString:function(a){return (a||k).stringify(this)},concat:function(a){var c=this.words,d=a.words,b=this.sigBytes;a=a.sigBytes;this.clamp();if(b%4)for(var e=0;e<a;e++)c[b+e>>>2]|=(d[e>>>2]>>>24-8*(e%4)&255)<<24-8*((b+e)%4);else if(65535<d.length)for(e=0;e<a;e+=4)c[b+e>>>2]=d[e>>>2];else c.push.apply(c,d);this.sigBytes+=a;return this},clamp:function(){var a=this.words,c=this.sigBytes;a[c>>>2]&=4294967295<<
  32-8*(c%4);a.length=h.ceil(c/4);},clone:function(){var a=m.clone.call(this);a.words=this.words.slice(0);return a},random:function(a){for(var c=[],d=0;d<a;d+=4)c.push(4294967296*h.random()|0);return new r.init(c,a)}}),l=f.enc={},k=l.Hex={stringify:function(a){var c=a.words;a=a.sigBytes;for(var d=[],b=0;b<a;b++){var e=c[b>>>2]>>>24-8*(b%4)&255;d.push((e>>>4).toString(16));d.push((e&15).toString(16));}return d.join("")},parse:function(a){for(var c=a.length,d=[],b=0;b<c;b+=2)d[b>>>3]|=parseInt(a.substr(b,
  2),16)<<24-4*(b%8);return new r.init(d,c/2)}},n=l.Latin1={stringify:function(a){var c=a.words;a=a.sigBytes;for(var d=[],b=0;b<a;b++)d.push(String.fromCharCode(c[b>>>2]>>>24-8*(b%4)&255));return d.join("")},parse:function(a){for(var c=a.length,d=[],b=0;b<c;b++)d[b>>>2]|=(a.charCodeAt(b)&255)<<24-8*(b%4);return new r.init(d,c)}},j=l.Utf8={stringify:function(a){try{return decodeURIComponent(escape(n.stringify(a)))}catch(c){throw Error("Malformed UTF-8 data");}},parse:function(a){return n.parse(unescape(encodeURIComponent(a)))}},
  u=g.BufferedBlockAlgorithm=m.extend({reset:function(){this._data=new r.init;this._nDataBytes=0;},_append:function(a){"string"==typeof a&&(a=j.parse(a));this._data.concat(a);this._nDataBytes+=a.sigBytes;},_process:function(a){var c=this._data,d=c.words,b=c.sigBytes,e=this.blockSize,f=b/(4*e),f=a?h.ceil(f):h.max((f|0)-this._minBufferSize,0);a=f*e;b=h.min(4*a,b);if(a){for(var g=0;g<a;g+=e)this._doProcessBlock(d,g);g=d.splice(0,a);c.sigBytes-=b;}return new r.init(g,b)},clone:function(){var a=m.clone.call(this);
  a._data=this._data.clone();return a},_minBufferSize:0});g.Hasher=u.extend({cfg:m.extend(),init:function(a){this.cfg=this.cfg.extend(a);this.reset();},reset:function(){u.reset.call(this);this._doReset();},update:function(a){this._append(a);this._process();return this},finalize:function(a){a&&this._append(a);return this._doFinalize()},blockSize:16,_createHelper:function(a){return function(c,d){return (new a.init(d)).finalize(c)}},_createHmacHelper:function(a){return function(c,d){return (new t.HMAC.init(a,
  d)).finalize(c)}}});var t=f.algo={};return f}(Math);
  (function(h){for(var s=CryptoJS,f=s.lib,g=f.WordArray,q=f.Hasher,f=s.algo,m=[],r=[],l=function(a){return 4294967296*(a-(a|0))|0},k=2,n=0;64>n;){var j;a:{j=k;for(var u=h.sqrt(j),t=2;t<=u;t++)if(!(j%t)){j=!1;break a}j=!0;}j&&(8>n&&(m[n]=l(h.pow(k,0.5))),r[n]=l(h.pow(k,1/3)),n++);k++;}var a=[],f=f.SHA256=q.extend({_doReset:function(){this._hash=new g.init(m.slice(0));},_doProcessBlock:function(c,d){for(var b=this._hash.words,e=b[0],f=b[1],g=b[2],j=b[3],h=b[4],m=b[5],n=b[6],q=b[7],p=0;64>p;p++){if(16>p)a[p]=
  c[d+p]|0;else {var k=a[p-15],l=a[p-2];a[p]=((k<<25|k>>>7)^(k<<14|k>>>18)^k>>>3)+a[p-7]+((l<<15|l>>>17)^(l<<13|l>>>19)^l>>>10)+a[p-16];}k=q+((h<<26|h>>>6)^(h<<21|h>>>11)^(h<<7|h>>>25))+(h&m^~h&n)+r[p]+a[p];l=((e<<30|e>>>2)^(e<<19|e>>>13)^(e<<10|e>>>22))+(e&f^e&g^f&g);q=n;n=m;m=h;h=j+k|0;j=g;g=f;f=e;e=k+l|0;}b[0]=b[0]+e|0;b[1]=b[1]+f|0;b[2]=b[2]+g|0;b[3]=b[3]+j|0;b[4]=b[4]+h|0;b[5]=b[5]+m|0;b[6]=b[6]+n|0;b[7]=b[7]+q|0;},_doFinalize:function(){var a=this._data,d=a.words,b=8*this._nDataBytes,e=8*a.sigBytes;
  d[e>>>5]|=128<<24-e%32;d[(e+64>>>9<<4)+14]=h.floor(b/4294967296);d[(e+64>>>9<<4)+15]=b;a.sigBytes=4*d.length;this._process();return this._hash},clone:function(){var a=q.clone.call(this);a._hash=this._hash.clone();return a}});s.SHA256=q._createHelper(f);s.HmacSHA256=q._createHmacHelper(f);})(Math);
  (function(){var h=CryptoJS,s=h.enc.Utf8;h.algo.HMAC=h.lib.Base.extend({init:function(f,g){f=this._hasher=new f.init;"string"==typeof g&&(g=s.parse(g));var h=f.blockSize,m=4*h;g.sigBytes>m&&(g=f.finalize(g));g.clamp();for(var r=this._oKey=g.clone(),l=this._iKey=g.clone(),k=r.words,n=l.words,j=0;j<h;j++)k[j]^=1549556828,n[j]^=909522486;r.sigBytes=l.sigBytes=m;this.reset();},reset:function(){var f=this._hasher;f.reset();f.update(this._iKey);},update:function(f){this._hasher.update(f);return this},finalize:function(f){var g=
  this._hasher;f=g.finalize(f);g.reset();return g.finalize(this._oKey.clone().concat(f))}});})();

  const API_URL = Exports.AppStack.data;
  const STORAGE_KEY_CREDENTIALS = 'credentials';

  class Config {

      /**
       * Access exported Cloudformation values
       */
      exports = Exports.AppStack;

      /**
       * Configure local storage encryption
       * @param {boolean} encrypt local storage
       * @param {string} encryption key
       * @returns null
       */
      encryption(encrypt = true, secret = 'secret-string-to-be-replaced') {
          // update localstorage-slim
          ls.config.encrypt = true;             // global encryption
          ls.config.secret = 'secret-string-to-be-replaced';   // global secret

          // update encrypter to use AES encryption
          ls.config.encrypter = (data, secret) => AES.encrypt(JSON.stringify(data), secret).toString();
          
          // update decrypter to decrypt AES-encrypted data
          ls.config.decrypter = (data, secret) => {
          try {
              return JSON.parse(AES.decrypt(data, secret).toString(encUTF8));
          } catch (e) {
              // incorrect/missing secret, return the encrypted data instead
              return data;
          }
          };
      }
  }

  class API {

      // Rest API Endpoint
      apiUrl = new URL(API_URL);

      // signing for API calls
      sigv4;

      // an authenticated Auth instance
      auth;

      constructor(auth) {
          this.auth = auth;
          //this.initApi();
      }

      async initApi() {
          this.sigv4 = new signatureV4.SignatureV4({
              service: 'execute-api',
              region: Exports.AppStack.region,
              credentials: {
                accessKeyId: this.auth.credentials.AccessKeyId,
                secretAccessKey: this.auth.credentials.SecretKey,
                sessionToken: this.auth.credentials.SessionToken,
              },
              sha256: sha256Js.Sha256,
            });
      }

      async request(apiUrl = this.apiUrl, method = 'POST', body = {}) {
          const signed = await this.sigv4.sign({
              hostname: apiUrl.host,
              path: apiUrl.pathname,
              protocol: apiUrl.protocol,
              headers: {
                  'Content-Type': 'application/json'
              },
            });
          try {
              const { data } = await axios({
                ...signed,
                url: apiUrl.href,
                method: method,
                data: JSON.stringify(body)
              });
              console.log('Successfully received data: ', data);
              return data;
          } catch (error) {
              console.log('An error occurred', error);
              throw error;
          }
      }
  }

  class Auth {

      // Cognito Identities client for making calls to the service
      cognitoIdentities;
      
      // Cognito User Pools client
      cognitoUserPools;
      
      // App Client ID from configuration
      clientId;
      
      // The current challenge session from requesting a code
      challengeSession;

      // The final Authentication Result containing ID and Access tokens for making authenticated calls
      /**
       * @AuthenticationResult: 
          AccessToken: String
          ExpiresIn: Number
          IdToken: String 
          NewDeviceMetadata: undefined
          RefreshToken: String 
          TokenType: "Bearer"
       */
      access;

      // Temp credentials and identity from Cognito Identity Pools (Authz)
      credentials;
      identityId;

      // The Cognito Provider (IDP) key name to be provided in GetID (authenticated) calls
      cognitoProviderLoginName;

      // mock password to send with requests using CUSTOM_AUTH
      password = 'asdfghJKL@5679';

      /**
       * The Authentication flow to use
       */
      AUTH_FLOW = {
          CUSTOM_AUTH: "CUSTOM_AUTH",
          USERNAME_PASSWORD: "USERNAME_PASSWORD",
          SRP: "SRP"
      };

      AUTH_PROVIDERS = {
          'google': 'accounts.google.com'
      };

      constructor() {
          this.cognitoIdentities = new clientCognitoIdentity.CognitoIdentityClient({ 
              region: Exports.AppStack.region 
          });
          this.cognitoUserPools = new clientCognitoIdentityProvider.CognitoIdentityProviderClient({ 
              region: Exports.AppStack.region
          });
          this.clientId = Exports.AppStack.cognitoUserPoolClientID;
          this.cognitoProviderLoginName = `cognito-idp.${Exports.AppStack.region}.amazonaws.com/${Exports.AppStack.cognitoUserPoolID}`;
          this.init();
      }

      /**
       * @private
       * Instantiates the cognito clients and stores credentials and identity id for later use
       * This will get re-run once authenticated in order to retrieve credentials for the authenticated
       * identity ID. Prior to authenticating, a 'guest' ID will be retrieved and assume an 'unauthenticated' role
       */
      async init() {

          if (ls.get(STORAGE_KEY_CREDENTIALS)) {
              const item = ls.get(STORAGE_KEY_CREDENTIALS);
              this.credentials = item.Credentials;
              this.identityId = item.IdentityId;
              return;
          }

          // 1. Get the Identity ID of the user from Cognito Identity Pools via the Identity Pools ID. This
          //    initial ID will assume an 'unauthenticated' or 'guest' role since no Logins map is sent
          const getIdPayload = { IdentityPoolId: Exports.AppStack.cognitoIdentityPoolID };
          if (!this.access) {
              //getIdPayload.Logins = {};
              //getIdPayload.Logins[this.cognitoProviderLoginName] = this.access.IdToken || '';
              const getId = new clientCognitoIdentity.GetIdCommand(getIdPayload);
              this.identityId = (await this.cognitoIdentities.send(getId)).IdentityId;
          }
          // 2. Get AWS credentials to make AWS service calls based on the assumed role. The role assumed
          //    will be dependent on the ID that is sent. ID Tokens are retrieved from authenticating.
          const getCredsPayload = { IdentityId: this.identityId };
          if (this.access) {
              getCredsPayload.Logins = {};
              getCredsPayload.Logins[this.cognitoProviderLoginName] = this.access.IdToken;
          }
          const getCreds = new clientCognitoIdentity.GetCredentialsForIdentityCommand(getCredsPayload);
          const getCredsResponse = await this.cognitoIdentities.send(getCreds);
          this.credentials = getCredsResponse.Credentials;
          this.identityId = getCredsResponse.IdentityId;
          ls.set(STORAGE_KEY_CREDENTIALS, getCredsResponse);
      }

      /**
       * initialize an identity and credentials for an external identity provider
       * @param {string} provider
       * @param {string} token 
       */
      async initProvider(provider, token) {
          const getIdPayload = { IdentityPoolId: Exports.AppStack.cognitoIdentityPoolID };
          getIdPayload.Logins = {};
          getIdPayload.Logins[provider] = token;
          const getId = new clientCognitoIdentity.GetIdCommand(getIdPayload);
          this.identityId = (await this.cognitoIdentities.send(getId)).IdentityId;
          
          const getCredsPayload = { IdentityId: this.identityId };
          getCredsPayload.Logins = {};
          getCredsPayload.Logins[provider] = token;
          
          const getCreds = new clientCognitoIdentity.GetCredentialsForIdentityCommand(getCredsPayload);
          const getCredsResponse = await this.cognitoIdentities.send(getCreds);
          this.credentials = getCredsResponse.Credentials;
          this.identityId = getCredsResponse.IdentityId;
          ls.set(STORAGE_KEY_CREDENTIALS, getCredsResponse);

          const api = new API(this);
          api.apiUrl = new URL(Exports.AppStack.auth);
          api.initApi();
          api.request();
      }

      /**
       * @public
       * Initiates a custom authentication session for a phone number or email. This
       * will send a confirmation code either via SMS or Email that will need to be verified. If a user is not registered
       * the sign-up flow will be called, a user will be created, and the resulting {Promise} will be returned e.g. Logged in
       * when using CUSTOM_AUTH/SMS (recommended), or confirmation challenge for other flows. 
       * @param {string} user 
       * @param {string} password Password uses a default/dummy password for custom auth
       * @param {string} authFlow The AuthFlow to use to authenticate, @see AUTH_FLOW for supported methods
       * @returns {Promise<string>} Either an error message or Session token to be used in challenge response
       */
      async initAuth(
          user, 
          password = this.password, 
          authFlow = this.AUTH_FLOW.CUSTOM_AUTH ) {
          const cmd = new clientCognitoIdentityProvider.InitiateAuthCommand({
              AuthFlow: authFlow,
              AuthParameters: {
                  USERNAME: user,
                  PASSWORD: password
              },
              ClientId: this.clientId
          });
          return this.cognitoUserPools.send(cmd)
              .then((response) => {
                  this.challengeSession = response.Session;
                  return response.Session;
              }).catch((error) => {
                  if (error.__type === 'UserNotFoundException') {
                      return this.signUp(user, password, authFlow);
                  } else {
                      return error.message;
                  }
              });
      }

      /**
       * Runs a sign-up flow, this can generally be not called and part of sign-up unless more attributes are required.
       * It's recommended to use simple login/sign-up e.g. CUSTOM_AUTH w/SMS, or Username/Password first, then update attributes
       * after user is signed up for the the best user/autnentication experience.
       * @param {string} user 
       * @param {string} password Password uses a default/dummy in the case of CUSTOM_AUTH
       * @returns {Promise} re-runs the initiate auth for the given user
       */
      async signUp(
          user, 
          password = this.password, 
          authFlow = this.AUTH_FLOW.CUSTOM_AUTH ) {
          const cmd = new clientCognitoIdentityProvider.SignUpCommand({
              Username: user,
              Password: password,
              UserAttributes: (authFlow === this.AUTH_FLOW.CUSTOM_AUTH) ? [{Name: "phone_number",Value: user}] : [],
              ClientId: this.clientId
          });
          await this.cognitoUserPools.send(cmd);
          return this.initAuth(user);
      }

      /**
       * Confirms a confirmation code sent via the SignUp command
       * @param {string} user 
       * @param {string} code 
       */
      async confirm(user, code) {
          if (this.challengeSession) {
              return this.verify(user, code);
          } else {
              const cmd = new clientCognitoIdentityProvider.ConfirmSignUpCommand({
                  ClientId: this.clientId,
                  Username: user,
                  ConfirmationCode: code
              });
              await this.cognitoUserPools.send(cmd);
              this.initAuth(user);
          }
      }

      /**
       * Verify a confirmation code (challenge) that was sent
       * @param {string} user 
       * @param {string} code 
       * @returns {Promise<object>} a promise containing the access and ID tokens
       */
      async verify(user, code) {
          const cmd = new clientCognitoIdentityProvider.RespondToAuthChallengeCommand({
              ChallengeName: "CUSTOM_CHALLENGE",
              ClientId: this.clientId,
              ChallengeResponses: {
                  "USERNAME": user,
                  "ANSWER":code
              },
              Session: this.challengeSession
          });
          try {
              const result = await this.cognitoUserPools.send(cmd);
              this.access = result.AuthenticationResult;
              // re-retrieve credentials for this login
              this.init();
              return result;
          } catch (e) {
              return e.message;
          }
      }


  }

  exports.API = API;
  exports.Auth = Auth;
  exports.Config = Config;

}));
