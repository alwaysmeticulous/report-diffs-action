'use strict';

var require$$1 = require('node:path');
var require$$2 = require('node:fs');
var core = require('@actions/core');
var Sentry = require('@sentry/node');
var sentry = require('@alwaysmeticulous/sentry');
var common = require('@alwaysmeticulous/common');
var log = require('loglevel');
var prefix = require('loglevel-plugin-prefix');
var node_child_process = require('node:child_process');
var github = require('@actions/github');
var Joi = require('joi');
var YAML = require('yaml');
var client = require('@alwaysmeticulous/client');
var remoteReplayLauncher = require('@alwaysmeticulous/remote-replay-launcher');
var retry = require('retry');
var luxon = require('luxon');

function _interopNamespaceDefault(e) {
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var Sentry__namespace = /*#__PURE__*/_interopNamespaceDefault(Sentry);
var retry__namespace = /*#__PURE__*/_interopNamespaceDefault(retry);

var register = {};

var sourceMapSupport = {exports: {}};

var sourceMap = {};

var sourceMapGenerator = {};

var base64Vlq = {};

var base64 = {};

/* -*- Mode: js; js-indent-level: 2; -*- */

var hasRequiredBase64;

function requireBase64 () {
	if (hasRequiredBase64) return base64;
	hasRequiredBase64 = 1;
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */

	var intToCharMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');

	/**
	 * Encode an integer in the range of 0 to 63 to a single base 64 digit.
	 */
	base64.encode = function (number) {
	  if (0 <= number && number < intToCharMap.length) {
	    return intToCharMap[number];
	  }
	  throw new TypeError("Must be between 0 and 63: " + number);
	};

	/**
	 * Decode a single base 64 character code digit to an integer. Returns -1 on
	 * failure.
	 */
	base64.decode = function (charCode) {
	  var bigA = 65;     // 'A'
	  var bigZ = 90;     // 'Z'

	  var littleA = 97;  // 'a'
	  var littleZ = 122; // 'z'

	  var zero = 48;     // '0'
	  var nine = 57;     // '9'

	  var plus = 43;     // '+'
	  var slash = 47;    // '/'

	  var littleOffset = 26;
	  var numberOffset = 52;

	  // 0 - 25: ABCDEFGHIJKLMNOPQRSTUVWXYZ
	  if (bigA <= charCode && charCode <= bigZ) {
	    return (charCode - bigA);
	  }

	  // 26 - 51: abcdefghijklmnopqrstuvwxyz
	  if (littleA <= charCode && charCode <= littleZ) {
	    return (charCode - littleA + littleOffset);
	  }

	  // 52 - 61: 0123456789
	  if (zero <= charCode && charCode <= nine) {
	    return (charCode - zero + numberOffset);
	  }

	  // 62: +
	  if (charCode == plus) {
	    return 62;
	  }

	  // 63: /
	  if (charCode == slash) {
	    return 63;
	  }

	  // Invalid base64 digit.
	  return -1;
	};
	return base64;
}

/* -*- Mode: js; js-indent-level: 2; -*- */

var hasRequiredBase64Vlq;

function requireBase64Vlq () {
	if (hasRequiredBase64Vlq) return base64Vlq;
	hasRequiredBase64Vlq = 1;
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 *
	 * Based on the Base 64 VLQ implementation in Closure Compiler:
	 * https://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/Base64VLQ.java
	 *
	 * Copyright 2011 The Closure Compiler Authors. All rights reserved.
	 * Redistribution and use in source and binary forms, with or without
	 * modification, are permitted provided that the following conditions are
	 * met:
	 *
	 *  * Redistributions of source code must retain the above copyright
	 *    notice, this list of conditions and the following disclaimer.
	 *  * Redistributions in binary form must reproduce the above
	 *    copyright notice, this list of conditions and the following
	 *    disclaimer in the documentation and/or other materials provided
	 *    with the distribution.
	 *  * Neither the name of Google Inc. nor the names of its
	 *    contributors may be used to endorse or promote products derived
	 *    from this software without specific prior written permission.
	 *
	 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
	 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
	 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
	 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
	 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
	 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
	 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
	 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
	 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */

	var base64 = requireBase64();

	// A single base 64 digit can contain 6 bits of data. For the base 64 variable
	// length quantities we use in the source map spec, the first bit is the sign,
	// the next four bits are the actual value, and the 6th bit is the
	// continuation bit. The continuation bit tells us whether there are more
	// digits in this value following this digit.
	//
	//   Continuation
	//   |    Sign
	//   |    |
	//   V    V
	//   101011

	var VLQ_BASE_SHIFT = 5;

	// binary: 100000
	var VLQ_BASE = 1 << VLQ_BASE_SHIFT;

	// binary: 011111
	var VLQ_BASE_MASK = VLQ_BASE - 1;

	// binary: 100000
	var VLQ_CONTINUATION_BIT = VLQ_BASE;

	/**
	 * Converts from a two-complement value to a value where the sign bit is
	 * placed in the least significant bit.  For example, as decimals:
	 *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
	 *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
	 */
	function toVLQSigned(aValue) {
	  return aValue < 0
	    ? ((-aValue) << 1) + 1
	    : (aValue << 1) + 0;
	}

	/**
	 * Converts to a two-complement value from a value where the sign bit is
	 * placed in the least significant bit.  For example, as decimals:
	 *   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
	 *   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
	 */
	function fromVLQSigned(aValue) {
	  var isNegative = (aValue & 1) === 1;
	  var shifted = aValue >> 1;
	  return isNegative
	    ? -shifted
	    : shifted;
	}

	/**
	 * Returns the base 64 VLQ encoded value.
	 */
	base64Vlq.encode = function base64VLQ_encode(aValue) {
	  var encoded = "";
	  var digit;

	  var vlq = toVLQSigned(aValue);

	  do {
	    digit = vlq & VLQ_BASE_MASK;
	    vlq >>>= VLQ_BASE_SHIFT;
	    if (vlq > 0) {
	      // There are still more digits in this value, so we must make sure the
	      // continuation bit is marked.
	      digit |= VLQ_CONTINUATION_BIT;
	    }
	    encoded += base64.encode(digit);
	  } while (vlq > 0);

	  return encoded;
	};

	/**
	 * Decodes the next base 64 VLQ value from the given string and returns the
	 * value and the rest of the string via the out parameter.
	 */
	base64Vlq.decode = function base64VLQ_decode(aStr, aIndex, aOutParam) {
	  var strLen = aStr.length;
	  var result = 0;
	  var shift = 0;
	  var continuation, digit;

	  do {
	    if (aIndex >= strLen) {
	      throw new Error("Expected more digits in base 64 VLQ value.");
	    }

	    digit = base64.decode(aStr.charCodeAt(aIndex++));
	    if (digit === -1) {
	      throw new Error("Invalid base64 digit: " + aStr.charAt(aIndex - 1));
	    }

	    continuation = !!(digit & VLQ_CONTINUATION_BIT);
	    digit &= VLQ_BASE_MASK;
	    result = result + (digit << shift);
	    shift += VLQ_BASE_SHIFT;
	  } while (continuation);

	  aOutParam.value = fromVLQSigned(result);
	  aOutParam.rest = aIndex;
	};
	return base64Vlq;
}

var util = {};

/* -*- Mode: js; js-indent-level: 2; -*- */

var hasRequiredUtil;

function requireUtil () {
	if (hasRequiredUtil) return util;
	hasRequiredUtil = 1;
	(function (exports) {
		/*
		 * Copyright 2011 Mozilla Foundation and contributors
		 * Licensed under the New BSD license. See LICENSE or:
		 * http://opensource.org/licenses/BSD-3-Clause
		 */

		/**
		 * This is a helper function for getting values from parameter/options
		 * objects.
		 *
		 * @param args The object we are extracting values from
		 * @param name The name of the property we are getting.
		 * @param defaultValue An optional value to return if the property is missing
		 * from the object. If this is not specified and the property is missing, an
		 * error will be thrown.
		 */
		function getArg(aArgs, aName, aDefaultValue) {
		  if (aName in aArgs) {
		    return aArgs[aName];
		  } else if (arguments.length === 3) {
		    return aDefaultValue;
		  } else {
		    throw new Error('"' + aName + '" is a required argument.');
		  }
		}
		exports.getArg = getArg;

		var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.-]*)(?::(\d+))?(.*)$/;
		var dataUrlRegexp = /^data:.+\,.+$/;

		function urlParse(aUrl) {
		  var match = aUrl.match(urlRegexp);
		  if (!match) {
		    return null;
		  }
		  return {
		    scheme: match[1],
		    auth: match[2],
		    host: match[3],
		    port: match[4],
		    path: match[5]
		  };
		}
		exports.urlParse = urlParse;

		function urlGenerate(aParsedUrl) {
		  var url = '';
		  if (aParsedUrl.scheme) {
		    url += aParsedUrl.scheme + ':';
		  }
		  url += '//';
		  if (aParsedUrl.auth) {
		    url += aParsedUrl.auth + '@';
		  }
		  if (aParsedUrl.host) {
		    url += aParsedUrl.host;
		  }
		  if (aParsedUrl.port) {
		    url += ":" + aParsedUrl.port;
		  }
		  if (aParsedUrl.path) {
		    url += aParsedUrl.path;
		  }
		  return url;
		}
		exports.urlGenerate = urlGenerate;

		/**
		 * Normalizes a path, or the path portion of a URL:
		 *
		 * - Replaces consecutive slashes with one slash.
		 * - Removes unnecessary '.' parts.
		 * - Removes unnecessary '<dir>/..' parts.
		 *
		 * Based on code in the Node.js 'path' core module.
		 *
		 * @param aPath The path or url to normalize.
		 */
		function normalize(aPath) {
		  var path = aPath;
		  var url = urlParse(aPath);
		  if (url) {
		    if (!url.path) {
		      return aPath;
		    }
		    path = url.path;
		  }
		  var isAbsolute = exports.isAbsolute(path);

		  var parts = path.split(/\/+/);
		  for (var part, up = 0, i = parts.length - 1; i >= 0; i--) {
		    part = parts[i];
		    if (part === '.') {
		      parts.splice(i, 1);
		    } else if (part === '..') {
		      up++;
		    } else if (up > 0) {
		      if (part === '') {
		        // The first part is blank if the path is absolute. Trying to go
		        // above the root is a no-op. Therefore we can remove all '..' parts
		        // directly after the root.
		        parts.splice(i + 1, up);
		        up = 0;
		      } else {
		        parts.splice(i, 2);
		        up--;
		      }
		    }
		  }
		  path = parts.join('/');

		  if (path === '') {
		    path = isAbsolute ? '/' : '.';
		  }

		  if (url) {
		    url.path = path;
		    return urlGenerate(url);
		  }
		  return path;
		}
		exports.normalize = normalize;

		/**
		 * Joins two paths/URLs.
		 *
		 * @param aRoot The root path or URL.
		 * @param aPath The path or URL to be joined with the root.
		 *
		 * - If aPath is a URL or a data URI, aPath is returned, unless aPath is a
		 *   scheme-relative URL: Then the scheme of aRoot, if any, is prepended
		 *   first.
		 * - Otherwise aPath is a path. If aRoot is a URL, then its path portion
		 *   is updated with the result and aRoot is returned. Otherwise the result
		 *   is returned.
		 *   - If aPath is absolute, the result is aPath.
		 *   - Otherwise the two paths are joined with a slash.
		 * - Joining for example 'http://' and 'www.example.com' is also supported.
		 */
		function join(aRoot, aPath) {
		  if (aRoot === "") {
		    aRoot = ".";
		  }
		  if (aPath === "") {
		    aPath = ".";
		  }
		  var aPathUrl = urlParse(aPath);
		  var aRootUrl = urlParse(aRoot);
		  if (aRootUrl) {
		    aRoot = aRootUrl.path || '/';
		  }

		  // `join(foo, '//www.example.org')`
		  if (aPathUrl && !aPathUrl.scheme) {
		    if (aRootUrl) {
		      aPathUrl.scheme = aRootUrl.scheme;
		    }
		    return urlGenerate(aPathUrl);
		  }

		  if (aPathUrl || aPath.match(dataUrlRegexp)) {
		    return aPath;
		  }

		  // `join('http://', 'www.example.com')`
		  if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
		    aRootUrl.host = aPath;
		    return urlGenerate(aRootUrl);
		  }

		  var joined = aPath.charAt(0) === '/'
		    ? aPath
		    : normalize(aRoot.replace(/\/+$/, '') + '/' + aPath);

		  if (aRootUrl) {
		    aRootUrl.path = joined;
		    return urlGenerate(aRootUrl);
		  }
		  return joined;
		}
		exports.join = join;

		exports.isAbsolute = function (aPath) {
		  return aPath.charAt(0) === '/' || urlRegexp.test(aPath);
		};

		/**
		 * Make a path relative to a URL or another path.
		 *
		 * @param aRoot The root path or URL.
		 * @param aPath The path or URL to be made relative to aRoot.
		 */
		function relative(aRoot, aPath) {
		  if (aRoot === "") {
		    aRoot = ".";
		  }

		  aRoot = aRoot.replace(/\/$/, '');

		  // It is possible for the path to be above the root. In this case, simply
		  // checking whether the root is a prefix of the path won't work. Instead, we
		  // need to remove components from the root one by one, until either we find
		  // a prefix that fits, or we run out of components to remove.
		  var level = 0;
		  while (aPath.indexOf(aRoot + '/') !== 0) {
		    var index = aRoot.lastIndexOf("/");
		    if (index < 0) {
		      return aPath;
		    }

		    // If the only part of the root that is left is the scheme (i.e. http://,
		    // file:///, etc.), one or more slashes (/), or simply nothing at all, we
		    // have exhausted all components, so the path is not relative to the root.
		    aRoot = aRoot.slice(0, index);
		    if (aRoot.match(/^([^\/]+:\/)?\/*$/)) {
		      return aPath;
		    }

		    ++level;
		  }

		  // Make sure we add a "../" for each component we removed from the root.
		  return Array(level + 1).join("../") + aPath.substr(aRoot.length + 1);
		}
		exports.relative = relative;

		var supportsNullProto = (function () {
		  var obj = Object.create(null);
		  return !('__proto__' in obj);
		}());

		function identity (s) {
		  return s;
		}

		/**
		 * Because behavior goes wacky when you set `__proto__` on objects, we
		 * have to prefix all the strings in our set with an arbitrary character.
		 *
		 * See https://github.com/mozilla/source-map/pull/31 and
		 * https://github.com/mozilla/source-map/issues/30
		 *
		 * @param String aStr
		 */
		function toSetString(aStr) {
		  if (isProtoString(aStr)) {
		    return '$' + aStr;
		  }

		  return aStr;
		}
		exports.toSetString = supportsNullProto ? identity : toSetString;

		function fromSetString(aStr) {
		  if (isProtoString(aStr)) {
		    return aStr.slice(1);
		  }

		  return aStr;
		}
		exports.fromSetString = supportsNullProto ? identity : fromSetString;

		function isProtoString(s) {
		  if (!s) {
		    return false;
		  }

		  var length = s.length;

		  if (length < 9 /* "__proto__".length */) {
		    return false;
		  }

		  if (s.charCodeAt(length - 1) !== 95  /* '_' */ ||
		      s.charCodeAt(length - 2) !== 95  /* '_' */ ||
		      s.charCodeAt(length - 3) !== 111 /* 'o' */ ||
		      s.charCodeAt(length - 4) !== 116 /* 't' */ ||
		      s.charCodeAt(length - 5) !== 111 /* 'o' */ ||
		      s.charCodeAt(length - 6) !== 114 /* 'r' */ ||
		      s.charCodeAt(length - 7) !== 112 /* 'p' */ ||
		      s.charCodeAt(length - 8) !== 95  /* '_' */ ||
		      s.charCodeAt(length - 9) !== 95  /* '_' */) {
		    return false;
		  }

		  for (var i = length - 10; i >= 0; i--) {
		    if (s.charCodeAt(i) !== 36 /* '$' */) {
		      return false;
		    }
		  }

		  return true;
		}

		/**
		 * Comparator between two mappings where the original positions are compared.
		 *
		 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
		 * mappings with the same original source/line/column, but different generated
		 * line and column the same. Useful when searching for a mapping with a
		 * stubbed out mapping.
		 */
		function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
		  var cmp = strcmp(mappingA.source, mappingB.source);
		  if (cmp !== 0) {
		    return cmp;
		  }

		  cmp = mappingA.originalLine - mappingB.originalLine;
		  if (cmp !== 0) {
		    return cmp;
		  }

		  cmp = mappingA.originalColumn - mappingB.originalColumn;
		  if (cmp !== 0 || onlyCompareOriginal) {
		    return cmp;
		  }

		  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
		  if (cmp !== 0) {
		    return cmp;
		  }

		  cmp = mappingA.generatedLine - mappingB.generatedLine;
		  if (cmp !== 0) {
		    return cmp;
		  }

		  return strcmp(mappingA.name, mappingB.name);
		}
		exports.compareByOriginalPositions = compareByOriginalPositions;

		/**
		 * Comparator between two mappings with deflated source and name indices where
		 * the generated positions are compared.
		 *
		 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
		 * mappings with the same generated line and column, but different
		 * source/name/original line and column the same. Useful when searching for a
		 * mapping with a stubbed out mapping.
		 */
		function compareByGeneratedPositionsDeflated(mappingA, mappingB, onlyCompareGenerated) {
		  var cmp = mappingA.generatedLine - mappingB.generatedLine;
		  if (cmp !== 0) {
		    return cmp;
		  }

		  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
		  if (cmp !== 0 || onlyCompareGenerated) {
		    return cmp;
		  }

		  cmp = strcmp(mappingA.source, mappingB.source);
		  if (cmp !== 0) {
		    return cmp;
		  }

		  cmp = mappingA.originalLine - mappingB.originalLine;
		  if (cmp !== 0) {
		    return cmp;
		  }

		  cmp = mappingA.originalColumn - mappingB.originalColumn;
		  if (cmp !== 0) {
		    return cmp;
		  }

		  return strcmp(mappingA.name, mappingB.name);
		}
		exports.compareByGeneratedPositionsDeflated = compareByGeneratedPositionsDeflated;

		function strcmp(aStr1, aStr2) {
		  if (aStr1 === aStr2) {
		    return 0;
		  }

		  if (aStr1 === null) {
		    return 1; // aStr2 !== null
		  }

		  if (aStr2 === null) {
		    return -1; // aStr1 !== null
		  }

		  if (aStr1 > aStr2) {
		    return 1;
		  }

		  return -1;
		}

		/**
		 * Comparator between two mappings with inflated source and name strings where
		 * the generated positions are compared.
		 */
		function compareByGeneratedPositionsInflated(mappingA, mappingB) {
		  var cmp = mappingA.generatedLine - mappingB.generatedLine;
		  if (cmp !== 0) {
		    return cmp;
		  }

		  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
		  if (cmp !== 0) {
		    return cmp;
		  }

		  cmp = strcmp(mappingA.source, mappingB.source);
		  if (cmp !== 0) {
		    return cmp;
		  }

		  cmp = mappingA.originalLine - mappingB.originalLine;
		  if (cmp !== 0) {
		    return cmp;
		  }

		  cmp = mappingA.originalColumn - mappingB.originalColumn;
		  if (cmp !== 0) {
		    return cmp;
		  }

		  return strcmp(mappingA.name, mappingB.name);
		}
		exports.compareByGeneratedPositionsInflated = compareByGeneratedPositionsInflated;

		/**
		 * Strip any JSON XSSI avoidance prefix from the string (as documented
		 * in the source maps specification), and then parse the string as
		 * JSON.
		 */
		function parseSourceMapInput(str) {
		  return JSON.parse(str.replace(/^\)]}'[^\n]*\n/, ''));
		}
		exports.parseSourceMapInput = parseSourceMapInput;

		/**
		 * Compute the URL of a source given the the source root, the source's
		 * URL, and the source map's URL.
		 */
		function computeSourceURL(sourceRoot, sourceURL, sourceMapURL) {
		  sourceURL = sourceURL || '';

		  if (sourceRoot) {
		    // This follows what Chrome does.
		    if (sourceRoot[sourceRoot.length - 1] !== '/' && sourceURL[0] !== '/') {
		      sourceRoot += '/';
		    }
		    // The spec says:
		    //   Line 4: An optional source root, useful for relocating source
		    //   files on a server or removing repeated values in the
		    //   “sources” entry.  This value is prepended to the individual
		    //   entries in the “source” field.
		    sourceURL = sourceRoot + sourceURL;
		  }

		  // Historically, SourceMapConsumer did not take the sourceMapURL as
		  // a parameter.  This mode is still somewhat supported, which is why
		  // this code block is conditional.  However, it's preferable to pass
		  // the source map URL to SourceMapConsumer, so that this function
		  // can implement the source URL resolution algorithm as outlined in
		  // the spec.  This block is basically the equivalent of:
		  //    new URL(sourceURL, sourceMapURL).toString()
		  // ... except it avoids using URL, which wasn't available in the
		  // older releases of node still supported by this library.
		  //
		  // The spec says:
		  //   If the sources are not absolute URLs after prepending of the
		  //   “sourceRoot”, the sources are resolved relative to the
		  //   SourceMap (like resolving script src in a html document).
		  if (sourceMapURL) {
		    var parsed = urlParse(sourceMapURL);
		    if (!parsed) {
		      throw new Error("sourceMapURL could not be parsed");
		    }
		    if (parsed.path) {
		      // Strip the last path component, but keep the "/".
		      var index = parsed.path.lastIndexOf('/');
		      if (index >= 0) {
		        parsed.path = parsed.path.substring(0, index + 1);
		      }
		    }
		    sourceURL = join(urlGenerate(parsed), sourceURL);
		  }

		  return normalize(sourceURL);
		}
		exports.computeSourceURL = computeSourceURL; 
	} (util));
	return util;
}

var arraySet = {};

/* -*- Mode: js; js-indent-level: 2; -*- */

var hasRequiredArraySet;

function requireArraySet () {
	if (hasRequiredArraySet) return arraySet;
	hasRequiredArraySet = 1;
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */

	var util = requireUtil();
	var has = Object.prototype.hasOwnProperty;
	var hasNativeMap = typeof Map !== "undefined";

	/**
	 * A data structure which is a combination of an array and a set. Adding a new
	 * member is O(1), testing for membership is O(1), and finding the index of an
	 * element is O(1). Removing elements from the set is not supported. Only
	 * strings are supported for membership.
	 */
	function ArraySet() {
	  this._array = [];
	  this._set = hasNativeMap ? new Map() : Object.create(null);
	}

	/**
	 * Static method for creating ArraySet instances from an existing array.
	 */
	ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
	  var set = new ArraySet();
	  for (var i = 0, len = aArray.length; i < len; i++) {
	    set.add(aArray[i], aAllowDuplicates);
	  }
	  return set;
	};

	/**
	 * Return how many unique items are in this ArraySet. If duplicates have been
	 * added, than those do not count towards the size.
	 *
	 * @returns Number
	 */
	ArraySet.prototype.size = function ArraySet_size() {
	  return hasNativeMap ? this._set.size : Object.getOwnPropertyNames(this._set).length;
	};

	/**
	 * Add the given string to this set.
	 *
	 * @param String aStr
	 */
	ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
	  var sStr = hasNativeMap ? aStr : util.toSetString(aStr);
	  var isDuplicate = hasNativeMap ? this.has(aStr) : has.call(this._set, sStr);
	  var idx = this._array.length;
	  if (!isDuplicate || aAllowDuplicates) {
	    this._array.push(aStr);
	  }
	  if (!isDuplicate) {
	    if (hasNativeMap) {
	      this._set.set(aStr, idx);
	    } else {
	      this._set[sStr] = idx;
	    }
	  }
	};

	/**
	 * Is the given string a member of this set?
	 *
	 * @param String aStr
	 */
	ArraySet.prototype.has = function ArraySet_has(aStr) {
	  if (hasNativeMap) {
	    return this._set.has(aStr);
	  } else {
	    var sStr = util.toSetString(aStr);
	    return has.call(this._set, sStr);
	  }
	};

	/**
	 * What is the index of the given string in the array?
	 *
	 * @param String aStr
	 */
	ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
	  if (hasNativeMap) {
	    var idx = this._set.get(aStr);
	    if (idx >= 0) {
	        return idx;
	    }
	  } else {
	    var sStr = util.toSetString(aStr);
	    if (has.call(this._set, sStr)) {
	      return this._set[sStr];
	    }
	  }

	  throw new Error('"' + aStr + '" is not in the set.');
	};

	/**
	 * What is the element at the given index?
	 *
	 * @param Number aIdx
	 */
	ArraySet.prototype.at = function ArraySet_at(aIdx) {
	  if (aIdx >= 0 && aIdx < this._array.length) {
	    return this._array[aIdx];
	  }
	  throw new Error('No element indexed by ' + aIdx);
	};

	/**
	 * Returns the array representation of this set (which has the proper indices
	 * indicated by indexOf). Note that this is a copy of the internal array used
	 * for storing the members so that no one can mess with internal state.
	 */
	ArraySet.prototype.toArray = function ArraySet_toArray() {
	  return this._array.slice();
	};

	arraySet.ArraySet = ArraySet;
	return arraySet;
}

var mappingList = {};

/* -*- Mode: js; js-indent-level: 2; -*- */

var hasRequiredMappingList;

function requireMappingList () {
	if (hasRequiredMappingList) return mappingList;
	hasRequiredMappingList = 1;
	/*
	 * Copyright 2014 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */

	var util = requireUtil();

	/**
	 * Determine whether mappingB is after mappingA with respect to generated
	 * position.
	 */
	function generatedPositionAfter(mappingA, mappingB) {
	  // Optimized for most common case
	  var lineA = mappingA.generatedLine;
	  var lineB = mappingB.generatedLine;
	  var columnA = mappingA.generatedColumn;
	  var columnB = mappingB.generatedColumn;
	  return lineB > lineA || lineB == lineA && columnB >= columnA ||
	         util.compareByGeneratedPositionsInflated(mappingA, mappingB) <= 0;
	}

	/**
	 * A data structure to provide a sorted view of accumulated mappings in a
	 * performance conscious manner. It trades a neglibable overhead in general
	 * case for a large speedup in case of mappings being added in order.
	 */
	function MappingList() {
	  this._array = [];
	  this._sorted = true;
	  // Serves as infimum
	  this._last = {generatedLine: -1, generatedColumn: 0};
	}

	/**
	 * Iterate through internal items. This method takes the same arguments that
	 * `Array.prototype.forEach` takes.
	 *
	 * NOTE: The order of the mappings is NOT guaranteed.
	 */
	MappingList.prototype.unsortedForEach =
	  function MappingList_forEach(aCallback, aThisArg) {
	    this._array.forEach(aCallback, aThisArg);
	  };

	/**
	 * Add the given source mapping.
	 *
	 * @param Object aMapping
	 */
	MappingList.prototype.add = function MappingList_add(aMapping) {
	  if (generatedPositionAfter(this._last, aMapping)) {
	    this._last = aMapping;
	    this._array.push(aMapping);
	  } else {
	    this._sorted = false;
	    this._array.push(aMapping);
	  }
	};

	/**
	 * Returns the flat, sorted array of mappings. The mappings are sorted by
	 * generated position.
	 *
	 * WARNING: This method returns internal data without copying, for
	 * performance. The return value must NOT be mutated, and should be treated as
	 * an immutable borrow. If you want to take ownership, you must make your own
	 * copy.
	 */
	MappingList.prototype.toArray = function MappingList_toArray() {
	  if (!this._sorted) {
	    this._array.sort(util.compareByGeneratedPositionsInflated);
	    this._sorted = true;
	  }
	  return this._array;
	};

	mappingList.MappingList = MappingList;
	return mappingList;
}

/* -*- Mode: js; js-indent-level: 2; -*- */

var hasRequiredSourceMapGenerator;

function requireSourceMapGenerator () {
	if (hasRequiredSourceMapGenerator) return sourceMapGenerator;
	hasRequiredSourceMapGenerator = 1;
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */

	var base64VLQ = requireBase64Vlq();
	var util = requireUtil();
	var ArraySet = requireArraySet().ArraySet;
	var MappingList = requireMappingList().MappingList;

	/**
	 * An instance of the SourceMapGenerator represents a source map which is
	 * being built incrementally. You may pass an object with the following
	 * properties:
	 *
	 *   - file: The filename of the generated source.
	 *   - sourceRoot: A root for all relative URLs in this source map.
	 */
	function SourceMapGenerator(aArgs) {
	  if (!aArgs) {
	    aArgs = {};
	  }
	  this._file = util.getArg(aArgs, 'file', null);
	  this._sourceRoot = util.getArg(aArgs, 'sourceRoot', null);
	  this._skipValidation = util.getArg(aArgs, 'skipValidation', false);
	  this._sources = new ArraySet();
	  this._names = new ArraySet();
	  this._mappings = new MappingList();
	  this._sourcesContents = null;
	}

	SourceMapGenerator.prototype._version = 3;

	/**
	 * Creates a new SourceMapGenerator based on a SourceMapConsumer
	 *
	 * @param aSourceMapConsumer The SourceMap.
	 */
	SourceMapGenerator.fromSourceMap =
	  function SourceMapGenerator_fromSourceMap(aSourceMapConsumer) {
	    var sourceRoot = aSourceMapConsumer.sourceRoot;
	    var generator = new SourceMapGenerator({
	      file: aSourceMapConsumer.file,
	      sourceRoot: sourceRoot
	    });
	    aSourceMapConsumer.eachMapping(function (mapping) {
	      var newMapping = {
	        generated: {
	          line: mapping.generatedLine,
	          column: mapping.generatedColumn
	        }
	      };

	      if (mapping.source != null) {
	        newMapping.source = mapping.source;
	        if (sourceRoot != null) {
	          newMapping.source = util.relative(sourceRoot, newMapping.source);
	        }

	        newMapping.original = {
	          line: mapping.originalLine,
	          column: mapping.originalColumn
	        };

	        if (mapping.name != null) {
	          newMapping.name = mapping.name;
	        }
	      }

	      generator.addMapping(newMapping);
	    });
	    aSourceMapConsumer.sources.forEach(function (sourceFile) {
	      var sourceRelative = sourceFile;
	      if (sourceRoot !== null) {
	        sourceRelative = util.relative(sourceRoot, sourceFile);
	      }

	      if (!generator._sources.has(sourceRelative)) {
	        generator._sources.add(sourceRelative);
	      }

	      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
	      if (content != null) {
	        generator.setSourceContent(sourceFile, content);
	      }
	    });
	    return generator;
	  };

	/**
	 * Add a single mapping from original source line and column to the generated
	 * source's line and column for this source map being created. The mapping
	 * object should have the following properties:
	 *
	 *   - generated: An object with the generated line and column positions.
	 *   - original: An object with the original line and column positions.
	 *   - source: The original source file (relative to the sourceRoot).
	 *   - name: An optional original token name for this mapping.
	 */
	SourceMapGenerator.prototype.addMapping =
	  function SourceMapGenerator_addMapping(aArgs) {
	    var generated = util.getArg(aArgs, 'generated');
	    var original = util.getArg(aArgs, 'original', null);
	    var source = util.getArg(aArgs, 'source', null);
	    var name = util.getArg(aArgs, 'name', null);

	    if (!this._skipValidation) {
	      this._validateMapping(generated, original, source, name);
	    }

	    if (source != null) {
	      source = String(source);
	      if (!this._sources.has(source)) {
	        this._sources.add(source);
	      }
	    }

	    if (name != null) {
	      name = String(name);
	      if (!this._names.has(name)) {
	        this._names.add(name);
	      }
	    }

	    this._mappings.add({
	      generatedLine: generated.line,
	      generatedColumn: generated.column,
	      originalLine: original != null && original.line,
	      originalColumn: original != null && original.column,
	      source: source,
	      name: name
	    });
	  };

	/**
	 * Set the source content for a source file.
	 */
	SourceMapGenerator.prototype.setSourceContent =
	  function SourceMapGenerator_setSourceContent(aSourceFile, aSourceContent) {
	    var source = aSourceFile;
	    if (this._sourceRoot != null) {
	      source = util.relative(this._sourceRoot, source);
	    }

	    if (aSourceContent != null) {
	      // Add the source content to the _sourcesContents map.
	      // Create a new _sourcesContents map if the property is null.
	      if (!this._sourcesContents) {
	        this._sourcesContents = Object.create(null);
	      }
	      this._sourcesContents[util.toSetString(source)] = aSourceContent;
	    } else if (this._sourcesContents) {
	      // Remove the source file from the _sourcesContents map.
	      // If the _sourcesContents map is empty, set the property to null.
	      delete this._sourcesContents[util.toSetString(source)];
	      if (Object.keys(this._sourcesContents).length === 0) {
	        this._sourcesContents = null;
	      }
	    }
	  };

	/**
	 * Applies the mappings of a sub-source-map for a specific source file to the
	 * source map being generated. Each mapping to the supplied source file is
	 * rewritten using the supplied source map. Note: The resolution for the
	 * resulting mappings is the minimium of this map and the supplied map.
	 *
	 * @param aSourceMapConsumer The source map to be applied.
	 * @param aSourceFile Optional. The filename of the source file.
	 *        If omitted, SourceMapConsumer's file property will be used.
	 * @param aSourceMapPath Optional. The dirname of the path to the source map
	 *        to be applied. If relative, it is relative to the SourceMapConsumer.
	 *        This parameter is needed when the two source maps aren't in the same
	 *        directory, and the source map to be applied contains relative source
	 *        paths. If so, those relative source paths need to be rewritten
	 *        relative to the SourceMapGenerator.
	 */
	SourceMapGenerator.prototype.applySourceMap =
	  function SourceMapGenerator_applySourceMap(aSourceMapConsumer, aSourceFile, aSourceMapPath) {
	    var sourceFile = aSourceFile;
	    // If aSourceFile is omitted, we will use the file property of the SourceMap
	    if (aSourceFile == null) {
	      if (aSourceMapConsumer.file == null) {
	        throw new Error(
	          'SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, ' +
	          'or the source map\'s "file" property. Both were omitted.'
	        );
	      }
	      sourceFile = aSourceMapConsumer.file;
	    }
	    var sourceRoot = this._sourceRoot;
	    // Make "sourceFile" relative if an absolute Url is passed.
	    if (sourceRoot != null) {
	      sourceFile = util.relative(sourceRoot, sourceFile);
	    }
	    // Applying the SourceMap can add and remove items from the sources and
	    // the names array.
	    var newSources = new ArraySet();
	    var newNames = new ArraySet();

	    // Find mappings for the "sourceFile"
	    this._mappings.unsortedForEach(function (mapping) {
	      if (mapping.source === sourceFile && mapping.originalLine != null) {
	        // Check if it can be mapped by the source map, then update the mapping.
	        var original = aSourceMapConsumer.originalPositionFor({
	          line: mapping.originalLine,
	          column: mapping.originalColumn
	        });
	        if (original.source != null) {
	          // Copy mapping
	          mapping.source = original.source;
	          if (aSourceMapPath != null) {
	            mapping.source = util.join(aSourceMapPath, mapping.source);
	          }
	          if (sourceRoot != null) {
	            mapping.source = util.relative(sourceRoot, mapping.source);
	          }
	          mapping.originalLine = original.line;
	          mapping.originalColumn = original.column;
	          if (original.name != null) {
	            mapping.name = original.name;
	          }
	        }
	      }

	      var source = mapping.source;
	      if (source != null && !newSources.has(source)) {
	        newSources.add(source);
	      }

	      var name = mapping.name;
	      if (name != null && !newNames.has(name)) {
	        newNames.add(name);
	      }

	    }, this);
	    this._sources = newSources;
	    this._names = newNames;

	    // Copy sourcesContents of applied map.
	    aSourceMapConsumer.sources.forEach(function (sourceFile) {
	      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
	      if (content != null) {
	        if (aSourceMapPath != null) {
	          sourceFile = util.join(aSourceMapPath, sourceFile);
	        }
	        if (sourceRoot != null) {
	          sourceFile = util.relative(sourceRoot, sourceFile);
	        }
	        this.setSourceContent(sourceFile, content);
	      }
	    }, this);
	  };

	/**
	 * A mapping can have one of the three levels of data:
	 *
	 *   1. Just the generated position.
	 *   2. The Generated position, original position, and original source.
	 *   3. Generated and original position, original source, as well as a name
	 *      token.
	 *
	 * To maintain consistency, we validate that any new mapping being added falls
	 * in to one of these categories.
	 */
	SourceMapGenerator.prototype._validateMapping =
	  function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource,
	                                              aName) {
	    // When aOriginal is truthy but has empty values for .line and .column,
	    // it is most likely a programmer error. In this case we throw a very
	    // specific error message to try to guide them the right way.
	    // For example: https://github.com/Polymer/polymer-bundler/pull/519
	    if (aOriginal && typeof aOriginal.line !== 'number' && typeof aOriginal.column !== 'number') {
	        throw new Error(
	            'original.line and original.column are not numbers -- you probably meant to omit ' +
	            'the original mapping entirely and only map the generated position. If so, pass ' +
	            'null for the original mapping instead of an object with empty or null values.'
	        );
	    }

	    if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
	        && aGenerated.line > 0 && aGenerated.column >= 0
	        && !aOriginal && !aSource && !aName) {
	      // Case 1.
	      return;
	    }
	    else if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
	             && aOriginal && 'line' in aOriginal && 'column' in aOriginal
	             && aGenerated.line > 0 && aGenerated.column >= 0
	             && aOriginal.line > 0 && aOriginal.column >= 0
	             && aSource) {
	      // Cases 2 and 3.
	      return;
	    }
	    else {
	      throw new Error('Invalid mapping: ' + JSON.stringify({
	        generated: aGenerated,
	        source: aSource,
	        original: aOriginal,
	        name: aName
	      }));
	    }
	  };

	/**
	 * Serialize the accumulated mappings in to the stream of base 64 VLQs
	 * specified by the source map format.
	 */
	SourceMapGenerator.prototype._serializeMappings =
	  function SourceMapGenerator_serializeMappings() {
	    var previousGeneratedColumn = 0;
	    var previousGeneratedLine = 1;
	    var previousOriginalColumn = 0;
	    var previousOriginalLine = 0;
	    var previousName = 0;
	    var previousSource = 0;
	    var result = '';
	    var next;
	    var mapping;
	    var nameIdx;
	    var sourceIdx;

	    var mappings = this._mappings.toArray();
	    for (var i = 0, len = mappings.length; i < len; i++) {
	      mapping = mappings[i];
	      next = '';

	      if (mapping.generatedLine !== previousGeneratedLine) {
	        previousGeneratedColumn = 0;
	        while (mapping.generatedLine !== previousGeneratedLine) {
	          next += ';';
	          previousGeneratedLine++;
	        }
	      }
	      else {
	        if (i > 0) {
	          if (!util.compareByGeneratedPositionsInflated(mapping, mappings[i - 1])) {
	            continue;
	          }
	          next += ',';
	        }
	      }

	      next += base64VLQ.encode(mapping.generatedColumn
	                                 - previousGeneratedColumn);
	      previousGeneratedColumn = mapping.generatedColumn;

	      if (mapping.source != null) {
	        sourceIdx = this._sources.indexOf(mapping.source);
	        next += base64VLQ.encode(sourceIdx - previousSource);
	        previousSource = sourceIdx;

	        // lines are stored 0-based in SourceMap spec version 3
	        next += base64VLQ.encode(mapping.originalLine - 1
	                                   - previousOriginalLine);
	        previousOriginalLine = mapping.originalLine - 1;

	        next += base64VLQ.encode(mapping.originalColumn
	                                   - previousOriginalColumn);
	        previousOriginalColumn = mapping.originalColumn;

	        if (mapping.name != null) {
	          nameIdx = this._names.indexOf(mapping.name);
	          next += base64VLQ.encode(nameIdx - previousName);
	          previousName = nameIdx;
	        }
	      }

	      result += next;
	    }

	    return result;
	  };

	SourceMapGenerator.prototype._generateSourcesContent =
	  function SourceMapGenerator_generateSourcesContent(aSources, aSourceRoot) {
	    return aSources.map(function (source) {
	      if (!this._sourcesContents) {
	        return null;
	      }
	      if (aSourceRoot != null) {
	        source = util.relative(aSourceRoot, source);
	      }
	      var key = util.toSetString(source);
	      return Object.prototype.hasOwnProperty.call(this._sourcesContents, key)
	        ? this._sourcesContents[key]
	        : null;
	    }, this);
	  };

	/**
	 * Externalize the source map.
	 */
	SourceMapGenerator.prototype.toJSON =
	  function SourceMapGenerator_toJSON() {
	    var map = {
	      version: this._version,
	      sources: this._sources.toArray(),
	      names: this._names.toArray(),
	      mappings: this._serializeMappings()
	    };
	    if (this._file != null) {
	      map.file = this._file;
	    }
	    if (this._sourceRoot != null) {
	      map.sourceRoot = this._sourceRoot;
	    }
	    if (this._sourcesContents) {
	      map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot);
	    }

	    return map;
	  };

	/**
	 * Render the source map being generated to a string.
	 */
	SourceMapGenerator.prototype.toString =
	  function SourceMapGenerator_toString() {
	    return JSON.stringify(this.toJSON());
	  };

	sourceMapGenerator.SourceMapGenerator = SourceMapGenerator;
	return sourceMapGenerator;
}

var sourceMapConsumer = {};

var binarySearch = {};

/* -*- Mode: js; js-indent-level: 2; -*- */

var hasRequiredBinarySearch;

function requireBinarySearch () {
	if (hasRequiredBinarySearch) return binarySearch;
	hasRequiredBinarySearch = 1;
	(function (exports) {
		/*
		 * Copyright 2011 Mozilla Foundation and contributors
		 * Licensed under the New BSD license. See LICENSE or:
		 * http://opensource.org/licenses/BSD-3-Clause
		 */

		exports.GREATEST_LOWER_BOUND = 1;
		exports.LEAST_UPPER_BOUND = 2;

		/**
		 * Recursive implementation of binary search.
		 *
		 * @param aLow Indices here and lower do not contain the needle.
		 * @param aHigh Indices here and higher do not contain the needle.
		 * @param aNeedle The element being searched for.
		 * @param aHaystack The non-empty array being searched.
		 * @param aCompare Function which takes two elements and returns -1, 0, or 1.
		 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
		 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
		 *     closest element that is smaller than or greater than the one we are
		 *     searching for, respectively, if the exact element cannot be found.
		 */
		function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare, aBias) {
		  // This function terminates when one of the following is true:
		  //
		  //   1. We find the exact element we are looking for.
		  //
		  //   2. We did not find the exact element, but we can return the index of
		  //      the next-closest element.
		  //
		  //   3. We did not find the exact element, and there is no next-closest
		  //      element than the one we are searching for, so we return -1.
		  var mid = Math.floor((aHigh - aLow) / 2) + aLow;
		  var cmp = aCompare(aNeedle, aHaystack[mid], true);
		  if (cmp === 0) {
		    // Found the element we are looking for.
		    return mid;
		  }
		  else if (cmp > 0) {
		    // Our needle is greater than aHaystack[mid].
		    if (aHigh - mid > 1) {
		      // The element is in the upper half.
		      return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare, aBias);
		    }

		    // The exact needle element was not found in this haystack. Determine if
		    // we are in termination case (3) or (2) and return the appropriate thing.
		    if (aBias == exports.LEAST_UPPER_BOUND) {
		      return aHigh < aHaystack.length ? aHigh : -1;
		    } else {
		      return mid;
		    }
		  }
		  else {
		    // Our needle is less than aHaystack[mid].
		    if (mid - aLow > 1) {
		      // The element is in the lower half.
		      return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare, aBias);
		    }

		    // we are in termination case (3) or (2) and return the appropriate thing.
		    if (aBias == exports.LEAST_UPPER_BOUND) {
		      return mid;
		    } else {
		      return aLow < 0 ? -1 : aLow;
		    }
		  }
		}

		/**
		 * This is an implementation of binary search which will always try and return
		 * the index of the closest element if there is no exact hit. This is because
		 * mappings between original and generated line/col pairs are single points,
		 * and there is an implicit region between each of them, so a miss just means
		 * that you aren't on the very start of a region.
		 *
		 * @param aNeedle The element you are looking for.
		 * @param aHaystack The array that is being searched.
		 * @param aCompare A function which takes the needle and an element in the
		 *     array and returns -1, 0, or 1 depending on whether the needle is less
		 *     than, equal to, or greater than the element, respectively.
		 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
		 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
		 *     closest element that is smaller than or greater than the one we are
		 *     searching for, respectively, if the exact element cannot be found.
		 *     Defaults to 'binarySearch.GREATEST_LOWER_BOUND'.
		 */
		exports.search = function search(aNeedle, aHaystack, aCompare, aBias) {
		  if (aHaystack.length === 0) {
		    return -1;
		  }

		  var index = recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack,
		                              aCompare, aBias || exports.GREATEST_LOWER_BOUND);
		  if (index < 0) {
		    return -1;
		  }

		  // We have found either the exact element, or the next-closest element than
		  // the one we are searching for. However, there may be more than one such
		  // element. Make sure we always return the smallest of these.
		  while (index - 1 >= 0) {
		    if (aCompare(aHaystack[index], aHaystack[index - 1], true) !== 0) {
		      break;
		    }
		    --index;
		  }

		  return index;
		}; 
	} (binarySearch));
	return binarySearch;
}

var quickSort = {};

/* -*- Mode: js; js-indent-level: 2; -*- */

var hasRequiredQuickSort;

function requireQuickSort () {
	if (hasRequiredQuickSort) return quickSort;
	hasRequiredQuickSort = 1;
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */

	// It turns out that some (most?) JavaScript engines don't self-host
	// `Array.prototype.sort`. This makes sense because C++ will likely remain
	// faster than JS when doing raw CPU-intensive sorting. However, when using a
	// custom comparator function, calling back and forth between the VM's C++ and
	// JIT'd JS is rather slow *and* loses JIT type information, resulting in
	// worse generated code for the comparator function than would be optimal. In
	// fact, when sorting with a comparator, these costs outweigh the benefits of
	// sorting in C++. By using our own JS-implemented Quick Sort (below), we get
	// a ~3500ms mean speed-up in `bench/bench.html`.

	/**
	 * Swap the elements indexed by `x` and `y` in the array `ary`.
	 *
	 * @param {Array} ary
	 *        The array.
	 * @param {Number} x
	 *        The index of the first item.
	 * @param {Number} y
	 *        The index of the second item.
	 */
	function swap(ary, x, y) {
	  var temp = ary[x];
	  ary[x] = ary[y];
	  ary[y] = temp;
	}

	/**
	 * Returns a random integer within the range `low .. high` inclusive.
	 *
	 * @param {Number} low
	 *        The lower bound on the range.
	 * @param {Number} high
	 *        The upper bound on the range.
	 */
	function randomIntInRange(low, high) {
	  return Math.round(low + (Math.random() * (high - low)));
	}

	/**
	 * The Quick Sort algorithm.
	 *
	 * @param {Array} ary
	 *        An array to sort.
	 * @param {function} comparator
	 *        Function to use to compare two items.
	 * @param {Number} p
	 *        Start index of the array
	 * @param {Number} r
	 *        End index of the array
	 */
	function doQuickSort(ary, comparator, p, r) {
	  // If our lower bound is less than our upper bound, we (1) partition the
	  // array into two pieces and (2) recurse on each half. If it is not, this is
	  // the empty array and our base case.

	  if (p < r) {
	    // (1) Partitioning.
	    //
	    // The partitioning chooses a pivot between `p` and `r` and moves all
	    // elements that are less than or equal to the pivot to the before it, and
	    // all the elements that are greater than it after it. The effect is that
	    // once partition is done, the pivot is in the exact place it will be when
	    // the array is put in sorted order, and it will not need to be moved
	    // again. This runs in O(n) time.

	    // Always choose a random pivot so that an input array which is reverse
	    // sorted does not cause O(n^2) running time.
	    var pivotIndex = randomIntInRange(p, r);
	    var i = p - 1;

	    swap(ary, pivotIndex, r);
	    var pivot = ary[r];

	    // Immediately after `j` is incremented in this loop, the following hold
	    // true:
	    //
	    //   * Every element in `ary[p .. i]` is less than or equal to the pivot.
	    //
	    //   * Every element in `ary[i+1 .. j-1]` is greater than the pivot.
	    for (var j = p; j < r; j++) {
	      if (comparator(ary[j], pivot) <= 0) {
	        i += 1;
	        swap(ary, i, j);
	      }
	    }

	    swap(ary, i + 1, j);
	    var q = i + 1;

	    // (2) Recurse on each half.

	    doQuickSort(ary, comparator, p, q - 1);
	    doQuickSort(ary, comparator, q + 1, r);
	  }
	}

	/**
	 * Sort the given array in-place with the given comparator function.
	 *
	 * @param {Array} ary
	 *        An array to sort.
	 * @param {function} comparator
	 *        Function to use to compare two items.
	 */
	quickSort.quickSort = function (ary, comparator) {
	  doQuickSort(ary, comparator, 0, ary.length - 1);
	};
	return quickSort;
}

/* -*- Mode: js; js-indent-level: 2; -*- */

var hasRequiredSourceMapConsumer;

function requireSourceMapConsumer () {
	if (hasRequiredSourceMapConsumer) return sourceMapConsumer;
	hasRequiredSourceMapConsumer = 1;
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */

	var util = requireUtil();
	var binarySearch = requireBinarySearch();
	var ArraySet = requireArraySet().ArraySet;
	var base64VLQ = requireBase64Vlq();
	var quickSort = requireQuickSort().quickSort;

	function SourceMapConsumer(aSourceMap, aSourceMapURL) {
	  var sourceMap = aSourceMap;
	  if (typeof aSourceMap === 'string') {
	    sourceMap = util.parseSourceMapInput(aSourceMap);
	  }

	  return sourceMap.sections != null
	    ? new IndexedSourceMapConsumer(sourceMap, aSourceMapURL)
	    : new BasicSourceMapConsumer(sourceMap, aSourceMapURL);
	}

	SourceMapConsumer.fromSourceMap = function(aSourceMap, aSourceMapURL) {
	  return BasicSourceMapConsumer.fromSourceMap(aSourceMap, aSourceMapURL);
	};

	/**
	 * The version of the source mapping spec that we are consuming.
	 */
	SourceMapConsumer.prototype._version = 3;

	// `__generatedMappings` and `__originalMappings` are arrays that hold the
	// parsed mapping coordinates from the source map's "mappings" attribute. They
	// are lazily instantiated, accessed via the `_generatedMappings` and
	// `_originalMappings` getters respectively, and we only parse the mappings
	// and create these arrays once queried for a source location. We jump through
	// these hoops because there can be many thousands of mappings, and parsing
	// them is expensive, so we only want to do it if we must.
	//
	// Each object in the arrays is of the form:
	//
	//     {
	//       generatedLine: The line number in the generated code,
	//       generatedColumn: The column number in the generated code,
	//       source: The path to the original source file that generated this
	//               chunk of code,
	//       originalLine: The line number in the original source that
	//                     corresponds to this chunk of generated code,
	//       originalColumn: The column number in the original source that
	//                       corresponds to this chunk of generated code,
	//       name: The name of the original symbol which generated this chunk of
	//             code.
	//     }
	//
	// All properties except for `generatedLine` and `generatedColumn` can be
	// `null`.
	//
	// `_generatedMappings` is ordered by the generated positions.
	//
	// `_originalMappings` is ordered by the original positions.

	SourceMapConsumer.prototype.__generatedMappings = null;
	Object.defineProperty(SourceMapConsumer.prototype, '_generatedMappings', {
	  configurable: true,
	  enumerable: true,
	  get: function () {
	    if (!this.__generatedMappings) {
	      this._parseMappings(this._mappings, this.sourceRoot);
	    }

	    return this.__generatedMappings;
	  }
	});

	SourceMapConsumer.prototype.__originalMappings = null;
	Object.defineProperty(SourceMapConsumer.prototype, '_originalMappings', {
	  configurable: true,
	  enumerable: true,
	  get: function () {
	    if (!this.__originalMappings) {
	      this._parseMappings(this._mappings, this.sourceRoot);
	    }

	    return this.__originalMappings;
	  }
	});

	SourceMapConsumer.prototype._charIsMappingSeparator =
	  function SourceMapConsumer_charIsMappingSeparator(aStr, index) {
	    var c = aStr.charAt(index);
	    return c === ";" || c === ",";
	  };

	/**
	 * Parse the mappings in a string in to a data structure which we can easily
	 * query (the ordered arrays in the `this.__generatedMappings` and
	 * `this.__originalMappings` properties).
	 */
	SourceMapConsumer.prototype._parseMappings =
	  function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
	    throw new Error("Subclasses must implement _parseMappings");
	  };

	SourceMapConsumer.GENERATED_ORDER = 1;
	SourceMapConsumer.ORIGINAL_ORDER = 2;

	SourceMapConsumer.GREATEST_LOWER_BOUND = 1;
	SourceMapConsumer.LEAST_UPPER_BOUND = 2;

	/**
	 * Iterate over each mapping between an original source/line/column and a
	 * generated line/column in this source map.
	 *
	 * @param Function aCallback
	 *        The function that is called with each mapping.
	 * @param Object aContext
	 *        Optional. If specified, this object will be the value of `this` every
	 *        time that `aCallback` is called.
	 * @param aOrder
	 *        Either `SourceMapConsumer.GENERATED_ORDER` or
	 *        `SourceMapConsumer.ORIGINAL_ORDER`. Specifies whether you want to
	 *        iterate over the mappings sorted by the generated file's line/column
	 *        order or the original's source/line/column order, respectively. Defaults to
	 *        `SourceMapConsumer.GENERATED_ORDER`.
	 */
	SourceMapConsumer.prototype.eachMapping =
	  function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
	    var context = aContext || null;
	    var order = aOrder || SourceMapConsumer.GENERATED_ORDER;

	    var mappings;
	    switch (order) {
	    case SourceMapConsumer.GENERATED_ORDER:
	      mappings = this._generatedMappings;
	      break;
	    case SourceMapConsumer.ORIGINAL_ORDER:
	      mappings = this._originalMappings;
	      break;
	    default:
	      throw new Error("Unknown order of iteration.");
	    }

	    var sourceRoot = this.sourceRoot;
	    mappings.map(function (mapping) {
	      var source = mapping.source === null ? null : this._sources.at(mapping.source);
	      source = util.computeSourceURL(sourceRoot, source, this._sourceMapURL);
	      return {
	        source: source,
	        generatedLine: mapping.generatedLine,
	        generatedColumn: mapping.generatedColumn,
	        originalLine: mapping.originalLine,
	        originalColumn: mapping.originalColumn,
	        name: mapping.name === null ? null : this._names.at(mapping.name)
	      };
	    }, this).forEach(aCallback, context);
	  };

	/**
	 * Returns all generated line and column information for the original source,
	 * line, and column provided. If no column is provided, returns all mappings
	 * corresponding to a either the line we are searching for or the next
	 * closest line that has any mappings. Otherwise, returns all mappings
	 * corresponding to the given line and either the column we are searching for
	 * or the next closest column that has any offsets.
	 *
	 * The only argument is an object with the following properties:
	 *
	 *   - source: The filename of the original source.
	 *   - line: The line number in the original source.  The line number is 1-based.
	 *   - column: Optional. the column number in the original source.
	 *    The column number is 0-based.
	 *
	 * and an array of objects is returned, each with the following properties:
	 *
	 *   - line: The line number in the generated source, or null.  The
	 *    line number is 1-based.
	 *   - column: The column number in the generated source, or null.
	 *    The column number is 0-based.
	 */
	SourceMapConsumer.prototype.allGeneratedPositionsFor =
	  function SourceMapConsumer_allGeneratedPositionsFor(aArgs) {
	    var line = util.getArg(aArgs, 'line');

	    // When there is no exact match, BasicSourceMapConsumer.prototype._findMapping
	    // returns the index of the closest mapping less than the needle. By
	    // setting needle.originalColumn to 0, we thus find the last mapping for
	    // the given line, provided such a mapping exists.
	    var needle = {
	      source: util.getArg(aArgs, 'source'),
	      originalLine: line,
	      originalColumn: util.getArg(aArgs, 'column', 0)
	    };

	    needle.source = this._findSourceIndex(needle.source);
	    if (needle.source < 0) {
	      return [];
	    }

	    var mappings = [];

	    var index = this._findMapping(needle,
	                                  this._originalMappings,
	                                  "originalLine",
	                                  "originalColumn",
	                                  util.compareByOriginalPositions,
	                                  binarySearch.LEAST_UPPER_BOUND);
	    if (index >= 0) {
	      var mapping = this._originalMappings[index];

	      if (aArgs.column === undefined) {
	        var originalLine = mapping.originalLine;

	        // Iterate until either we run out of mappings, or we run into
	        // a mapping for a different line than the one we found. Since
	        // mappings are sorted, this is guaranteed to find all mappings for
	        // the line we found.
	        while (mapping && mapping.originalLine === originalLine) {
	          mappings.push({
	            line: util.getArg(mapping, 'generatedLine', null),
	            column: util.getArg(mapping, 'generatedColumn', null),
	            lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
	          });

	          mapping = this._originalMappings[++index];
	        }
	      } else {
	        var originalColumn = mapping.originalColumn;

	        // Iterate until either we run out of mappings, or we run into
	        // a mapping for a different line than the one we were searching for.
	        // Since mappings are sorted, this is guaranteed to find all mappings for
	        // the line we are searching for.
	        while (mapping &&
	               mapping.originalLine === line &&
	               mapping.originalColumn == originalColumn) {
	          mappings.push({
	            line: util.getArg(mapping, 'generatedLine', null),
	            column: util.getArg(mapping, 'generatedColumn', null),
	            lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
	          });

	          mapping = this._originalMappings[++index];
	        }
	      }
	    }

	    return mappings;
	  };

	sourceMapConsumer.SourceMapConsumer = SourceMapConsumer;

	/**
	 * A BasicSourceMapConsumer instance represents a parsed source map which we can
	 * query for information about the original file positions by giving it a file
	 * position in the generated source.
	 *
	 * The first parameter is the raw source map (either as a JSON string, or
	 * already parsed to an object). According to the spec, source maps have the
	 * following attributes:
	 *
	 *   - version: Which version of the source map spec this map is following.
	 *   - sources: An array of URLs to the original source files.
	 *   - names: An array of identifiers which can be referrenced by individual mappings.
	 *   - sourceRoot: Optional. The URL root from which all sources are relative.
	 *   - sourcesContent: Optional. An array of contents of the original source files.
	 *   - mappings: A string of base64 VLQs which contain the actual mappings.
	 *   - file: Optional. The generated file this source map is associated with.
	 *
	 * Here is an example source map, taken from the source map spec[0]:
	 *
	 *     {
	 *       version : 3,
	 *       file: "out.js",
	 *       sourceRoot : "",
	 *       sources: ["foo.js", "bar.js"],
	 *       names: ["src", "maps", "are", "fun"],
	 *       mappings: "AA,AB;;ABCDE;"
	 *     }
	 *
	 * The second parameter, if given, is a string whose value is the URL
	 * at which the source map was found.  This URL is used to compute the
	 * sources array.
	 *
	 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
	 */
	function BasicSourceMapConsumer(aSourceMap, aSourceMapURL) {
	  var sourceMap = aSourceMap;
	  if (typeof aSourceMap === 'string') {
	    sourceMap = util.parseSourceMapInput(aSourceMap);
	  }

	  var version = util.getArg(sourceMap, 'version');
	  var sources = util.getArg(sourceMap, 'sources');
	  // Sass 3.3 leaves out the 'names' array, so we deviate from the spec (which
	  // requires the array) to play nice here.
	  var names = util.getArg(sourceMap, 'names', []);
	  var sourceRoot = util.getArg(sourceMap, 'sourceRoot', null);
	  var sourcesContent = util.getArg(sourceMap, 'sourcesContent', null);
	  var mappings = util.getArg(sourceMap, 'mappings');
	  var file = util.getArg(sourceMap, 'file', null);

	  // Once again, Sass deviates from the spec and supplies the version as a
	  // string rather than a number, so we use loose equality checking here.
	  if (version != this._version) {
	    throw new Error('Unsupported version: ' + version);
	  }

	  if (sourceRoot) {
	    sourceRoot = util.normalize(sourceRoot);
	  }

	  sources = sources
	    .map(String)
	    // Some source maps produce relative source paths like "./foo.js" instead of
	    // "foo.js".  Normalize these first so that future comparisons will succeed.
	    // See bugzil.la/1090768.
	    .map(util.normalize)
	    // Always ensure that absolute sources are internally stored relative to
	    // the source root, if the source root is absolute. Not doing this would
	    // be particularly problematic when the source root is a prefix of the
	    // source (valid, but why??). See github issue #199 and bugzil.la/1188982.
	    .map(function (source) {
	      return sourceRoot && util.isAbsolute(sourceRoot) && util.isAbsolute(source)
	        ? util.relative(sourceRoot, source)
	        : source;
	    });

	  // Pass `true` below to allow duplicate names and sources. While source maps
	  // are intended to be compressed and deduplicated, the TypeScript compiler
	  // sometimes generates source maps with duplicates in them. See Github issue
	  // #72 and bugzil.la/889492.
	  this._names = ArraySet.fromArray(names.map(String), true);
	  this._sources = ArraySet.fromArray(sources, true);

	  this._absoluteSources = this._sources.toArray().map(function (s) {
	    return util.computeSourceURL(sourceRoot, s, aSourceMapURL);
	  });

	  this.sourceRoot = sourceRoot;
	  this.sourcesContent = sourcesContent;
	  this._mappings = mappings;
	  this._sourceMapURL = aSourceMapURL;
	  this.file = file;
	}

	BasicSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
	BasicSourceMapConsumer.prototype.consumer = SourceMapConsumer;

	/**
	 * Utility function to find the index of a source.  Returns -1 if not
	 * found.
	 */
	BasicSourceMapConsumer.prototype._findSourceIndex = function(aSource) {
	  var relativeSource = aSource;
	  if (this.sourceRoot != null) {
	    relativeSource = util.relative(this.sourceRoot, relativeSource);
	  }

	  if (this._sources.has(relativeSource)) {
	    return this._sources.indexOf(relativeSource);
	  }

	  // Maybe aSource is an absolute URL as returned by |sources|.  In
	  // this case we can't simply undo the transform.
	  var i;
	  for (i = 0; i < this._absoluteSources.length; ++i) {
	    if (this._absoluteSources[i] == aSource) {
	      return i;
	    }
	  }

	  return -1;
	};

	/**
	 * Create a BasicSourceMapConsumer from a SourceMapGenerator.
	 *
	 * @param SourceMapGenerator aSourceMap
	 *        The source map that will be consumed.
	 * @param String aSourceMapURL
	 *        The URL at which the source map can be found (optional)
	 * @returns BasicSourceMapConsumer
	 */
	BasicSourceMapConsumer.fromSourceMap =
	  function SourceMapConsumer_fromSourceMap(aSourceMap, aSourceMapURL) {
	    var smc = Object.create(BasicSourceMapConsumer.prototype);

	    var names = smc._names = ArraySet.fromArray(aSourceMap._names.toArray(), true);
	    var sources = smc._sources = ArraySet.fromArray(aSourceMap._sources.toArray(), true);
	    smc.sourceRoot = aSourceMap._sourceRoot;
	    smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(),
	                                                            smc.sourceRoot);
	    smc.file = aSourceMap._file;
	    smc._sourceMapURL = aSourceMapURL;
	    smc._absoluteSources = smc._sources.toArray().map(function (s) {
	      return util.computeSourceURL(smc.sourceRoot, s, aSourceMapURL);
	    });

	    // Because we are modifying the entries (by converting string sources and
	    // names to indices into the sources and names ArraySets), we have to make
	    // a copy of the entry or else bad things happen. Shared mutable state
	    // strikes again! See github issue #191.

	    var generatedMappings = aSourceMap._mappings.toArray().slice();
	    var destGeneratedMappings = smc.__generatedMappings = [];
	    var destOriginalMappings = smc.__originalMappings = [];

	    for (var i = 0, length = generatedMappings.length; i < length; i++) {
	      var srcMapping = generatedMappings[i];
	      var destMapping = new Mapping;
	      destMapping.generatedLine = srcMapping.generatedLine;
	      destMapping.generatedColumn = srcMapping.generatedColumn;

	      if (srcMapping.source) {
	        destMapping.source = sources.indexOf(srcMapping.source);
	        destMapping.originalLine = srcMapping.originalLine;
	        destMapping.originalColumn = srcMapping.originalColumn;

	        if (srcMapping.name) {
	          destMapping.name = names.indexOf(srcMapping.name);
	        }

	        destOriginalMappings.push(destMapping);
	      }

	      destGeneratedMappings.push(destMapping);
	    }

	    quickSort(smc.__originalMappings, util.compareByOriginalPositions);

	    return smc;
	  };

	/**
	 * The version of the source mapping spec that we are consuming.
	 */
	BasicSourceMapConsumer.prototype._version = 3;

	/**
	 * The list of original sources.
	 */
	Object.defineProperty(BasicSourceMapConsumer.prototype, 'sources', {
	  get: function () {
	    return this._absoluteSources.slice();
	  }
	});

	/**
	 * Provide the JIT with a nice shape / hidden class.
	 */
	function Mapping() {
	  this.generatedLine = 0;
	  this.generatedColumn = 0;
	  this.source = null;
	  this.originalLine = null;
	  this.originalColumn = null;
	  this.name = null;
	}

	/**
	 * Parse the mappings in a string in to a data structure which we can easily
	 * query (the ordered arrays in the `this.__generatedMappings` and
	 * `this.__originalMappings` properties).
	 */
	BasicSourceMapConsumer.prototype._parseMappings =
	  function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
	    var generatedLine = 1;
	    var previousGeneratedColumn = 0;
	    var previousOriginalLine = 0;
	    var previousOriginalColumn = 0;
	    var previousSource = 0;
	    var previousName = 0;
	    var length = aStr.length;
	    var index = 0;
	    var cachedSegments = {};
	    var temp = {};
	    var originalMappings = [];
	    var generatedMappings = [];
	    var mapping, str, segment, end, value;

	    while (index < length) {
	      if (aStr.charAt(index) === ';') {
	        generatedLine++;
	        index++;
	        previousGeneratedColumn = 0;
	      }
	      else if (aStr.charAt(index) === ',') {
	        index++;
	      }
	      else {
	        mapping = new Mapping();
	        mapping.generatedLine = generatedLine;

	        // Because each offset is encoded relative to the previous one,
	        // many segments often have the same encoding. We can exploit this
	        // fact by caching the parsed variable length fields of each segment,
	        // allowing us to avoid a second parse if we encounter the same
	        // segment again.
	        for (end = index; end < length; end++) {
	          if (this._charIsMappingSeparator(aStr, end)) {
	            break;
	          }
	        }
	        str = aStr.slice(index, end);

	        segment = cachedSegments[str];
	        if (segment) {
	          index += str.length;
	        } else {
	          segment = [];
	          while (index < end) {
	            base64VLQ.decode(aStr, index, temp);
	            value = temp.value;
	            index = temp.rest;
	            segment.push(value);
	          }

	          if (segment.length === 2) {
	            throw new Error('Found a source, but no line and column');
	          }

	          if (segment.length === 3) {
	            throw new Error('Found a source and line, but no column');
	          }

	          cachedSegments[str] = segment;
	        }

	        // Generated column.
	        mapping.generatedColumn = previousGeneratedColumn + segment[0];
	        previousGeneratedColumn = mapping.generatedColumn;

	        if (segment.length > 1) {
	          // Original source.
	          mapping.source = previousSource + segment[1];
	          previousSource += segment[1];

	          // Original line.
	          mapping.originalLine = previousOriginalLine + segment[2];
	          previousOriginalLine = mapping.originalLine;
	          // Lines are stored 0-based
	          mapping.originalLine += 1;

	          // Original column.
	          mapping.originalColumn = previousOriginalColumn + segment[3];
	          previousOriginalColumn = mapping.originalColumn;

	          if (segment.length > 4) {
	            // Original name.
	            mapping.name = previousName + segment[4];
	            previousName += segment[4];
	          }
	        }

	        generatedMappings.push(mapping);
	        if (typeof mapping.originalLine === 'number') {
	          originalMappings.push(mapping);
	        }
	      }
	    }

	    quickSort(generatedMappings, util.compareByGeneratedPositionsDeflated);
	    this.__generatedMappings = generatedMappings;

	    quickSort(originalMappings, util.compareByOriginalPositions);
	    this.__originalMappings = originalMappings;
	  };

	/**
	 * Find the mapping that best matches the hypothetical "needle" mapping that
	 * we are searching for in the given "haystack" of mappings.
	 */
	BasicSourceMapConsumer.prototype._findMapping =
	  function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName,
	                                         aColumnName, aComparator, aBias) {
	    // To return the position we are searching for, we must first find the
	    // mapping for the given position and then return the opposite position it
	    // points to. Because the mappings are sorted, we can use binary search to
	    // find the best mapping.

	    if (aNeedle[aLineName] <= 0) {
	      throw new TypeError('Line must be greater than or equal to 1, got '
	                          + aNeedle[aLineName]);
	    }
	    if (aNeedle[aColumnName] < 0) {
	      throw new TypeError('Column must be greater than or equal to 0, got '
	                          + aNeedle[aColumnName]);
	    }

	    return binarySearch.search(aNeedle, aMappings, aComparator, aBias);
	  };

	/**
	 * Compute the last column for each generated mapping. The last column is
	 * inclusive.
	 */
	BasicSourceMapConsumer.prototype.computeColumnSpans =
	  function SourceMapConsumer_computeColumnSpans() {
	    for (var index = 0; index < this._generatedMappings.length; ++index) {
	      var mapping = this._generatedMappings[index];

	      // Mappings do not contain a field for the last generated columnt. We
	      // can come up with an optimistic estimate, however, by assuming that
	      // mappings are contiguous (i.e. given two consecutive mappings, the
	      // first mapping ends where the second one starts).
	      if (index + 1 < this._generatedMappings.length) {
	        var nextMapping = this._generatedMappings[index + 1];

	        if (mapping.generatedLine === nextMapping.generatedLine) {
	          mapping.lastGeneratedColumn = nextMapping.generatedColumn - 1;
	          continue;
	        }
	      }

	      // The last mapping for each line spans the entire line.
	      mapping.lastGeneratedColumn = Infinity;
	    }
	  };

	/**
	 * Returns the original source, line, and column information for the generated
	 * source's line and column positions provided. The only argument is an object
	 * with the following properties:
	 *
	 *   - line: The line number in the generated source.  The line number
	 *     is 1-based.
	 *   - column: The column number in the generated source.  The column
	 *     number is 0-based.
	 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
	 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
	 *     closest element that is smaller than or greater than the one we are
	 *     searching for, respectively, if the exact element cannot be found.
	 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
	 *
	 * and an object is returned with the following properties:
	 *
	 *   - source: The original source file, or null.
	 *   - line: The line number in the original source, or null.  The
	 *     line number is 1-based.
	 *   - column: The column number in the original source, or null.  The
	 *     column number is 0-based.
	 *   - name: The original identifier, or null.
	 */
	BasicSourceMapConsumer.prototype.originalPositionFor =
	  function SourceMapConsumer_originalPositionFor(aArgs) {
	    var needle = {
	      generatedLine: util.getArg(aArgs, 'line'),
	      generatedColumn: util.getArg(aArgs, 'column')
	    };

	    var index = this._findMapping(
	      needle,
	      this._generatedMappings,
	      "generatedLine",
	      "generatedColumn",
	      util.compareByGeneratedPositionsDeflated,
	      util.getArg(aArgs, 'bias', SourceMapConsumer.GREATEST_LOWER_BOUND)
	    );

	    if (index >= 0) {
	      var mapping = this._generatedMappings[index];

	      if (mapping.generatedLine === needle.generatedLine) {
	        var source = util.getArg(mapping, 'source', null);
	        if (source !== null) {
	          source = this._sources.at(source);
	          source = util.computeSourceURL(this.sourceRoot, source, this._sourceMapURL);
	        }
	        var name = util.getArg(mapping, 'name', null);
	        if (name !== null) {
	          name = this._names.at(name);
	        }
	        return {
	          source: source,
	          line: util.getArg(mapping, 'originalLine', null),
	          column: util.getArg(mapping, 'originalColumn', null),
	          name: name
	        };
	      }
	    }

	    return {
	      source: null,
	      line: null,
	      column: null,
	      name: null
	    };
	  };

	/**
	 * Return true if we have the source content for every source in the source
	 * map, false otherwise.
	 */
	BasicSourceMapConsumer.prototype.hasContentsOfAllSources =
	  function BasicSourceMapConsumer_hasContentsOfAllSources() {
	    if (!this.sourcesContent) {
	      return false;
	    }
	    return this.sourcesContent.length >= this._sources.size() &&
	      !this.sourcesContent.some(function (sc) { return sc == null; });
	  };

	/**
	 * Returns the original source content. The only argument is the url of the
	 * original source file. Returns null if no original source content is
	 * available.
	 */
	BasicSourceMapConsumer.prototype.sourceContentFor =
	  function SourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
	    if (!this.sourcesContent) {
	      return null;
	    }

	    var index = this._findSourceIndex(aSource);
	    if (index >= 0) {
	      return this.sourcesContent[index];
	    }

	    var relativeSource = aSource;
	    if (this.sourceRoot != null) {
	      relativeSource = util.relative(this.sourceRoot, relativeSource);
	    }

	    var url;
	    if (this.sourceRoot != null
	        && (url = util.urlParse(this.sourceRoot))) {
	      // XXX: file:// URIs and absolute paths lead to unexpected behavior for
	      // many users. We can help them out when they expect file:// URIs to
	      // behave like it would if they were running a local HTTP server. See
	      // https://bugzilla.mozilla.org/show_bug.cgi?id=885597.
	      var fileUriAbsPath = relativeSource.replace(/^file:\/\//, "");
	      if (url.scheme == "file"
	          && this._sources.has(fileUriAbsPath)) {
	        return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)]
	      }

	      if ((!url.path || url.path == "/")
	          && this._sources.has("/" + relativeSource)) {
	        return this.sourcesContent[this._sources.indexOf("/" + relativeSource)];
	      }
	    }

	    // This function is used recursively from
	    // IndexedSourceMapConsumer.prototype.sourceContentFor. In that case, we
	    // don't want to throw if we can't find the source - we just want to
	    // return null, so we provide a flag to exit gracefully.
	    if (nullOnMissing) {
	      return null;
	    }
	    else {
	      throw new Error('"' + relativeSource + '" is not in the SourceMap.');
	    }
	  };

	/**
	 * Returns the generated line and column information for the original source,
	 * line, and column positions provided. The only argument is an object with
	 * the following properties:
	 *
	 *   - source: The filename of the original source.
	 *   - line: The line number in the original source.  The line number
	 *     is 1-based.
	 *   - column: The column number in the original source.  The column
	 *     number is 0-based.
	 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
	 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
	 *     closest element that is smaller than or greater than the one we are
	 *     searching for, respectively, if the exact element cannot be found.
	 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
	 *
	 * and an object is returned with the following properties:
	 *
	 *   - line: The line number in the generated source, or null.  The
	 *     line number is 1-based.
	 *   - column: The column number in the generated source, or null.
	 *     The column number is 0-based.
	 */
	BasicSourceMapConsumer.prototype.generatedPositionFor =
	  function SourceMapConsumer_generatedPositionFor(aArgs) {
	    var source = util.getArg(aArgs, 'source');
	    source = this._findSourceIndex(source);
	    if (source < 0) {
	      return {
	        line: null,
	        column: null,
	        lastColumn: null
	      };
	    }

	    var needle = {
	      source: source,
	      originalLine: util.getArg(aArgs, 'line'),
	      originalColumn: util.getArg(aArgs, 'column')
	    };

	    var index = this._findMapping(
	      needle,
	      this._originalMappings,
	      "originalLine",
	      "originalColumn",
	      util.compareByOriginalPositions,
	      util.getArg(aArgs, 'bias', SourceMapConsumer.GREATEST_LOWER_BOUND)
	    );

	    if (index >= 0) {
	      var mapping = this._originalMappings[index];

	      if (mapping.source === needle.source) {
	        return {
	          line: util.getArg(mapping, 'generatedLine', null),
	          column: util.getArg(mapping, 'generatedColumn', null),
	          lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
	        };
	      }
	    }

	    return {
	      line: null,
	      column: null,
	      lastColumn: null
	    };
	  };

	sourceMapConsumer.BasicSourceMapConsumer = BasicSourceMapConsumer;

	/**
	 * An IndexedSourceMapConsumer instance represents a parsed source map which
	 * we can query for information. It differs from BasicSourceMapConsumer in
	 * that it takes "indexed" source maps (i.e. ones with a "sections" field) as
	 * input.
	 *
	 * The first parameter is a raw source map (either as a JSON string, or already
	 * parsed to an object). According to the spec for indexed source maps, they
	 * have the following attributes:
	 *
	 *   - version: Which version of the source map spec this map is following.
	 *   - file: Optional. The generated file this source map is associated with.
	 *   - sections: A list of section definitions.
	 *
	 * Each value under the "sections" field has two fields:
	 *   - offset: The offset into the original specified at which this section
	 *       begins to apply, defined as an object with a "line" and "column"
	 *       field.
	 *   - map: A source map definition. This source map could also be indexed,
	 *       but doesn't have to be.
	 *
	 * Instead of the "map" field, it's also possible to have a "url" field
	 * specifying a URL to retrieve a source map from, but that's currently
	 * unsupported.
	 *
	 * Here's an example source map, taken from the source map spec[0], but
	 * modified to omit a section which uses the "url" field.
	 *
	 *  {
	 *    version : 3,
	 *    file: "app.js",
	 *    sections: [{
	 *      offset: {line:100, column:10},
	 *      map: {
	 *        version : 3,
	 *        file: "section.js",
	 *        sources: ["foo.js", "bar.js"],
	 *        names: ["src", "maps", "are", "fun"],
	 *        mappings: "AAAA,E;;ABCDE;"
	 *      }
	 *    }],
	 *  }
	 *
	 * The second parameter, if given, is a string whose value is the URL
	 * at which the source map was found.  This URL is used to compute the
	 * sources array.
	 *
	 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit#heading=h.535es3xeprgt
	 */
	function IndexedSourceMapConsumer(aSourceMap, aSourceMapURL) {
	  var sourceMap = aSourceMap;
	  if (typeof aSourceMap === 'string') {
	    sourceMap = util.parseSourceMapInput(aSourceMap);
	  }

	  var version = util.getArg(sourceMap, 'version');
	  var sections = util.getArg(sourceMap, 'sections');

	  if (version != this._version) {
	    throw new Error('Unsupported version: ' + version);
	  }

	  this._sources = new ArraySet();
	  this._names = new ArraySet();

	  var lastOffset = {
	    line: -1,
	    column: 0
	  };
	  this._sections = sections.map(function (s) {
	    if (s.url) {
	      // The url field will require support for asynchronicity.
	      // See https://github.com/mozilla/source-map/issues/16
	      throw new Error('Support for url field in sections not implemented.');
	    }
	    var offset = util.getArg(s, 'offset');
	    var offsetLine = util.getArg(offset, 'line');
	    var offsetColumn = util.getArg(offset, 'column');

	    if (offsetLine < lastOffset.line ||
	        (offsetLine === lastOffset.line && offsetColumn < lastOffset.column)) {
	      throw new Error('Section offsets must be ordered and non-overlapping.');
	    }
	    lastOffset = offset;

	    return {
	      generatedOffset: {
	        // The offset fields are 0-based, but we use 1-based indices when
	        // encoding/decoding from VLQ.
	        generatedLine: offsetLine + 1,
	        generatedColumn: offsetColumn + 1
	      },
	      consumer: new SourceMapConsumer(util.getArg(s, 'map'), aSourceMapURL)
	    }
	  });
	}

	IndexedSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
	IndexedSourceMapConsumer.prototype.constructor = SourceMapConsumer;

	/**
	 * The version of the source mapping spec that we are consuming.
	 */
	IndexedSourceMapConsumer.prototype._version = 3;

	/**
	 * The list of original sources.
	 */
	Object.defineProperty(IndexedSourceMapConsumer.prototype, 'sources', {
	  get: function () {
	    var sources = [];
	    for (var i = 0; i < this._sections.length; i++) {
	      for (var j = 0; j < this._sections[i].consumer.sources.length; j++) {
	        sources.push(this._sections[i].consumer.sources[j]);
	      }
	    }
	    return sources;
	  }
	});

	/**
	 * Returns the original source, line, and column information for the generated
	 * source's line and column positions provided. The only argument is an object
	 * with the following properties:
	 *
	 *   - line: The line number in the generated source.  The line number
	 *     is 1-based.
	 *   - column: The column number in the generated source.  The column
	 *     number is 0-based.
	 *
	 * and an object is returned with the following properties:
	 *
	 *   - source: The original source file, or null.
	 *   - line: The line number in the original source, or null.  The
	 *     line number is 1-based.
	 *   - column: The column number in the original source, or null.  The
	 *     column number is 0-based.
	 *   - name: The original identifier, or null.
	 */
	IndexedSourceMapConsumer.prototype.originalPositionFor =
	  function IndexedSourceMapConsumer_originalPositionFor(aArgs) {
	    var needle = {
	      generatedLine: util.getArg(aArgs, 'line'),
	      generatedColumn: util.getArg(aArgs, 'column')
	    };

	    // Find the section containing the generated position we're trying to map
	    // to an original position.
	    var sectionIndex = binarySearch.search(needle, this._sections,
	      function(needle, section) {
	        var cmp = needle.generatedLine - section.generatedOffset.generatedLine;
	        if (cmp) {
	          return cmp;
	        }

	        return (needle.generatedColumn -
	                section.generatedOffset.generatedColumn);
	      });
	    var section = this._sections[sectionIndex];

	    if (!section) {
	      return {
	        source: null,
	        line: null,
	        column: null,
	        name: null
	      };
	    }

	    return section.consumer.originalPositionFor({
	      line: needle.generatedLine -
	        (section.generatedOffset.generatedLine - 1),
	      column: needle.generatedColumn -
	        (section.generatedOffset.generatedLine === needle.generatedLine
	         ? section.generatedOffset.generatedColumn - 1
	         : 0),
	      bias: aArgs.bias
	    });
	  };

	/**
	 * Return true if we have the source content for every source in the source
	 * map, false otherwise.
	 */
	IndexedSourceMapConsumer.prototype.hasContentsOfAllSources =
	  function IndexedSourceMapConsumer_hasContentsOfAllSources() {
	    return this._sections.every(function (s) {
	      return s.consumer.hasContentsOfAllSources();
	    });
	  };

	/**
	 * Returns the original source content. The only argument is the url of the
	 * original source file. Returns null if no original source content is
	 * available.
	 */
	IndexedSourceMapConsumer.prototype.sourceContentFor =
	  function IndexedSourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
	    for (var i = 0; i < this._sections.length; i++) {
	      var section = this._sections[i];

	      var content = section.consumer.sourceContentFor(aSource, true);
	      if (content) {
	        return content;
	      }
	    }
	    if (nullOnMissing) {
	      return null;
	    }
	    else {
	      throw new Error('"' + aSource + '" is not in the SourceMap.');
	    }
	  };

	/**
	 * Returns the generated line and column information for the original source,
	 * line, and column positions provided. The only argument is an object with
	 * the following properties:
	 *
	 *   - source: The filename of the original source.
	 *   - line: The line number in the original source.  The line number
	 *     is 1-based.
	 *   - column: The column number in the original source.  The column
	 *     number is 0-based.
	 *
	 * and an object is returned with the following properties:
	 *
	 *   - line: The line number in the generated source, or null.  The
	 *     line number is 1-based. 
	 *   - column: The column number in the generated source, or null.
	 *     The column number is 0-based.
	 */
	IndexedSourceMapConsumer.prototype.generatedPositionFor =
	  function IndexedSourceMapConsumer_generatedPositionFor(aArgs) {
	    for (var i = 0; i < this._sections.length; i++) {
	      var section = this._sections[i];

	      // Only consider this section if the requested source is in the list of
	      // sources of the consumer.
	      if (section.consumer._findSourceIndex(util.getArg(aArgs, 'source')) === -1) {
	        continue;
	      }
	      var generatedPosition = section.consumer.generatedPositionFor(aArgs);
	      if (generatedPosition) {
	        var ret = {
	          line: generatedPosition.line +
	            (section.generatedOffset.generatedLine - 1),
	          column: generatedPosition.column +
	            (section.generatedOffset.generatedLine === generatedPosition.line
	             ? section.generatedOffset.generatedColumn - 1
	             : 0)
	        };
	        return ret;
	      }
	    }

	    return {
	      line: null,
	      column: null
	    };
	  };

	/**
	 * Parse the mappings in a string in to a data structure which we can easily
	 * query (the ordered arrays in the `this.__generatedMappings` and
	 * `this.__originalMappings` properties).
	 */
	IndexedSourceMapConsumer.prototype._parseMappings =
	  function IndexedSourceMapConsumer_parseMappings(aStr, aSourceRoot) {
	    this.__generatedMappings = [];
	    this.__originalMappings = [];
	    for (var i = 0; i < this._sections.length; i++) {
	      var section = this._sections[i];
	      var sectionMappings = section.consumer._generatedMappings;
	      for (var j = 0; j < sectionMappings.length; j++) {
	        var mapping = sectionMappings[j];

	        var source = section.consumer._sources.at(mapping.source);
	        source = util.computeSourceURL(section.consumer.sourceRoot, source, this._sourceMapURL);
	        this._sources.add(source);
	        source = this._sources.indexOf(source);

	        var name = null;
	        if (mapping.name) {
	          name = section.consumer._names.at(mapping.name);
	          this._names.add(name);
	          name = this._names.indexOf(name);
	        }

	        // The mappings coming from the consumer for the section have
	        // generated positions relative to the start of the section, so we
	        // need to offset them to be relative to the start of the concatenated
	        // generated file.
	        var adjustedMapping = {
	          source: source,
	          generatedLine: mapping.generatedLine +
	            (section.generatedOffset.generatedLine - 1),
	          generatedColumn: mapping.generatedColumn +
	            (section.generatedOffset.generatedLine === mapping.generatedLine
	            ? section.generatedOffset.generatedColumn - 1
	            : 0),
	          originalLine: mapping.originalLine,
	          originalColumn: mapping.originalColumn,
	          name: name
	        };

	        this.__generatedMappings.push(adjustedMapping);
	        if (typeof adjustedMapping.originalLine === 'number') {
	          this.__originalMappings.push(adjustedMapping);
	        }
	      }
	    }

	    quickSort(this.__generatedMappings, util.compareByGeneratedPositionsDeflated);
	    quickSort(this.__originalMappings, util.compareByOriginalPositions);
	  };

	sourceMapConsumer.IndexedSourceMapConsumer = IndexedSourceMapConsumer;
	return sourceMapConsumer;
}

var sourceNode = {};

/* -*- Mode: js; js-indent-level: 2; -*- */

var hasRequiredSourceNode;

function requireSourceNode () {
	if (hasRequiredSourceNode) return sourceNode;
	hasRequiredSourceNode = 1;
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */

	var SourceMapGenerator = requireSourceMapGenerator().SourceMapGenerator;
	var util = requireUtil();

	// Matches a Windows-style `\r\n` newline or a `\n` newline used by all other
	// operating systems these days (capturing the result).
	var REGEX_NEWLINE = /(\r?\n)/;

	// Newline character code for charCodeAt() comparisons
	var NEWLINE_CODE = 10;

	// Private symbol for identifying `SourceNode`s when multiple versions of
	// the source-map library are loaded. This MUST NOT CHANGE across
	// versions!
	var isSourceNode = "$$$isSourceNode$$$";

	/**
	 * SourceNodes provide a way to abstract over interpolating/concatenating
	 * snippets of generated JavaScript source code while maintaining the line and
	 * column information associated with the original source code.
	 *
	 * @param aLine The original line number.
	 * @param aColumn The original column number.
	 * @param aSource The original source's filename.
	 * @param aChunks Optional. An array of strings which are snippets of
	 *        generated JS, or other SourceNodes.
	 * @param aName The original identifier.
	 */
	function SourceNode(aLine, aColumn, aSource, aChunks, aName) {
	  this.children = [];
	  this.sourceContents = {};
	  this.line = aLine == null ? null : aLine;
	  this.column = aColumn == null ? null : aColumn;
	  this.source = aSource == null ? null : aSource;
	  this.name = aName == null ? null : aName;
	  this[isSourceNode] = true;
	  if (aChunks != null) this.add(aChunks);
	}

	/**
	 * Creates a SourceNode from generated code and a SourceMapConsumer.
	 *
	 * @param aGeneratedCode The generated code
	 * @param aSourceMapConsumer The SourceMap for the generated code
	 * @param aRelativePath Optional. The path that relative sources in the
	 *        SourceMapConsumer should be relative to.
	 */
	SourceNode.fromStringWithSourceMap =
	  function SourceNode_fromStringWithSourceMap(aGeneratedCode, aSourceMapConsumer, aRelativePath) {
	    // The SourceNode we want to fill with the generated code
	    // and the SourceMap
	    var node = new SourceNode();

	    // All even indices of this array are one line of the generated code,
	    // while all odd indices are the newlines between two adjacent lines
	    // (since `REGEX_NEWLINE` captures its match).
	    // Processed fragments are accessed by calling `shiftNextLine`.
	    var remainingLines = aGeneratedCode.split(REGEX_NEWLINE);
	    var remainingLinesIndex = 0;
	    var shiftNextLine = function() {
	      var lineContents = getNextLine();
	      // The last line of a file might not have a newline.
	      var newLine = getNextLine() || "";
	      return lineContents + newLine;

	      function getNextLine() {
	        return remainingLinesIndex < remainingLines.length ?
	            remainingLines[remainingLinesIndex++] : undefined;
	      }
	    };

	    // We need to remember the position of "remainingLines"
	    var lastGeneratedLine = 1, lastGeneratedColumn = 0;

	    // The generate SourceNodes we need a code range.
	    // To extract it current and last mapping is used.
	    // Here we store the last mapping.
	    var lastMapping = null;

	    aSourceMapConsumer.eachMapping(function (mapping) {
	      if (lastMapping !== null) {
	        // We add the code from "lastMapping" to "mapping":
	        // First check if there is a new line in between.
	        if (lastGeneratedLine < mapping.generatedLine) {
	          // Associate first line with "lastMapping"
	          addMappingWithCode(lastMapping, shiftNextLine());
	          lastGeneratedLine++;
	          lastGeneratedColumn = 0;
	          // The remaining code is added without mapping
	        } else {
	          // There is no new line in between.
	          // Associate the code between "lastGeneratedColumn" and
	          // "mapping.generatedColumn" with "lastMapping"
	          var nextLine = remainingLines[remainingLinesIndex] || '';
	          var code = nextLine.substr(0, mapping.generatedColumn -
	                                        lastGeneratedColumn);
	          remainingLines[remainingLinesIndex] = nextLine.substr(mapping.generatedColumn -
	                                              lastGeneratedColumn);
	          lastGeneratedColumn = mapping.generatedColumn;
	          addMappingWithCode(lastMapping, code);
	          // No more remaining code, continue
	          lastMapping = mapping;
	          return;
	        }
	      }
	      // We add the generated code until the first mapping
	      // to the SourceNode without any mapping.
	      // Each line is added as separate string.
	      while (lastGeneratedLine < mapping.generatedLine) {
	        node.add(shiftNextLine());
	        lastGeneratedLine++;
	      }
	      if (lastGeneratedColumn < mapping.generatedColumn) {
	        var nextLine = remainingLines[remainingLinesIndex] || '';
	        node.add(nextLine.substr(0, mapping.generatedColumn));
	        remainingLines[remainingLinesIndex] = nextLine.substr(mapping.generatedColumn);
	        lastGeneratedColumn = mapping.generatedColumn;
	      }
	      lastMapping = mapping;
	    }, this);
	    // We have processed all mappings.
	    if (remainingLinesIndex < remainingLines.length) {
	      if (lastMapping) {
	        // Associate the remaining code in the current line with "lastMapping"
	        addMappingWithCode(lastMapping, shiftNextLine());
	      }
	      // and add the remaining lines without any mapping
	      node.add(remainingLines.splice(remainingLinesIndex).join(""));
	    }

	    // Copy sourcesContent into SourceNode
	    aSourceMapConsumer.sources.forEach(function (sourceFile) {
	      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
	      if (content != null) {
	        if (aRelativePath != null) {
	          sourceFile = util.join(aRelativePath, sourceFile);
	        }
	        node.setSourceContent(sourceFile, content);
	      }
	    });

	    return node;

	    function addMappingWithCode(mapping, code) {
	      if (mapping === null || mapping.source === undefined) {
	        node.add(code);
	      } else {
	        var source = aRelativePath
	          ? util.join(aRelativePath, mapping.source)
	          : mapping.source;
	        node.add(new SourceNode(mapping.originalLine,
	                                mapping.originalColumn,
	                                source,
	                                code,
	                                mapping.name));
	      }
	    }
	  };

	/**
	 * Add a chunk of generated JS to this source node.
	 *
	 * @param aChunk A string snippet of generated JS code, another instance of
	 *        SourceNode, or an array where each member is one of those things.
	 */
	SourceNode.prototype.add = function SourceNode_add(aChunk) {
	  if (Array.isArray(aChunk)) {
	    aChunk.forEach(function (chunk) {
	      this.add(chunk);
	    }, this);
	  }
	  else if (aChunk[isSourceNode] || typeof aChunk === "string") {
	    if (aChunk) {
	      this.children.push(aChunk);
	    }
	  }
	  else {
	    throw new TypeError(
	      "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
	    );
	  }
	  return this;
	};

	/**
	 * Add a chunk of generated JS to the beginning of this source node.
	 *
	 * @param aChunk A string snippet of generated JS code, another instance of
	 *        SourceNode, or an array where each member is one of those things.
	 */
	SourceNode.prototype.prepend = function SourceNode_prepend(aChunk) {
	  if (Array.isArray(aChunk)) {
	    for (var i = aChunk.length-1; i >= 0; i--) {
	      this.prepend(aChunk[i]);
	    }
	  }
	  else if (aChunk[isSourceNode] || typeof aChunk === "string") {
	    this.children.unshift(aChunk);
	  }
	  else {
	    throw new TypeError(
	      "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
	    );
	  }
	  return this;
	};

	/**
	 * Walk over the tree of JS snippets in this node and its children. The
	 * walking function is called once for each snippet of JS and is passed that
	 * snippet and the its original associated source's line/column location.
	 *
	 * @param aFn The traversal function.
	 */
	SourceNode.prototype.walk = function SourceNode_walk(aFn) {
	  var chunk;
	  for (var i = 0, len = this.children.length; i < len; i++) {
	    chunk = this.children[i];
	    if (chunk[isSourceNode]) {
	      chunk.walk(aFn);
	    }
	    else {
	      if (chunk !== '') {
	        aFn(chunk, { source: this.source,
	                     line: this.line,
	                     column: this.column,
	                     name: this.name });
	      }
	    }
	  }
	};

	/**
	 * Like `String.prototype.join` except for SourceNodes. Inserts `aStr` between
	 * each of `this.children`.
	 *
	 * @param aSep The separator.
	 */
	SourceNode.prototype.join = function SourceNode_join(aSep) {
	  var newChildren;
	  var i;
	  var len = this.children.length;
	  if (len > 0) {
	    newChildren = [];
	    for (i = 0; i < len-1; i++) {
	      newChildren.push(this.children[i]);
	      newChildren.push(aSep);
	    }
	    newChildren.push(this.children[i]);
	    this.children = newChildren;
	  }
	  return this;
	};

	/**
	 * Call String.prototype.replace on the very right-most source snippet. Useful
	 * for trimming whitespace from the end of a source node, etc.
	 *
	 * @param aPattern The pattern to replace.
	 * @param aReplacement The thing to replace the pattern with.
	 */
	SourceNode.prototype.replaceRight = function SourceNode_replaceRight(aPattern, aReplacement) {
	  var lastChild = this.children[this.children.length - 1];
	  if (lastChild[isSourceNode]) {
	    lastChild.replaceRight(aPattern, aReplacement);
	  }
	  else if (typeof lastChild === 'string') {
	    this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement);
	  }
	  else {
	    this.children.push(''.replace(aPattern, aReplacement));
	  }
	  return this;
	};

	/**
	 * Set the source content for a source file. This will be added to the SourceMapGenerator
	 * in the sourcesContent field.
	 *
	 * @param aSourceFile The filename of the source file
	 * @param aSourceContent The content of the source file
	 */
	SourceNode.prototype.setSourceContent =
	  function SourceNode_setSourceContent(aSourceFile, aSourceContent) {
	    this.sourceContents[util.toSetString(aSourceFile)] = aSourceContent;
	  };

	/**
	 * Walk over the tree of SourceNodes. The walking function is called for each
	 * source file content and is passed the filename and source content.
	 *
	 * @param aFn The traversal function.
	 */
	SourceNode.prototype.walkSourceContents =
	  function SourceNode_walkSourceContents(aFn) {
	    for (var i = 0, len = this.children.length; i < len; i++) {
	      if (this.children[i][isSourceNode]) {
	        this.children[i].walkSourceContents(aFn);
	      }
	    }

	    var sources = Object.keys(this.sourceContents);
	    for (var i = 0, len = sources.length; i < len; i++) {
	      aFn(util.fromSetString(sources[i]), this.sourceContents[sources[i]]);
	    }
	  };

	/**
	 * Return the string representation of this source node. Walks over the tree
	 * and concatenates all the various snippets together to one string.
	 */
	SourceNode.prototype.toString = function SourceNode_toString() {
	  var str = "";
	  this.walk(function (chunk) {
	    str += chunk;
	  });
	  return str;
	};

	/**
	 * Returns the string representation of this source node along with a source
	 * map.
	 */
	SourceNode.prototype.toStringWithSourceMap = function SourceNode_toStringWithSourceMap(aArgs) {
	  var generated = {
	    code: "",
	    line: 1,
	    column: 0
	  };
	  var map = new SourceMapGenerator(aArgs);
	  var sourceMappingActive = false;
	  var lastOriginalSource = null;
	  var lastOriginalLine = null;
	  var lastOriginalColumn = null;
	  var lastOriginalName = null;
	  this.walk(function (chunk, original) {
	    generated.code += chunk;
	    if (original.source !== null
	        && original.line !== null
	        && original.column !== null) {
	      if(lastOriginalSource !== original.source
	         || lastOriginalLine !== original.line
	         || lastOriginalColumn !== original.column
	         || lastOriginalName !== original.name) {
	        map.addMapping({
	          source: original.source,
	          original: {
	            line: original.line,
	            column: original.column
	          },
	          generated: {
	            line: generated.line,
	            column: generated.column
	          },
	          name: original.name
	        });
	      }
	      lastOriginalSource = original.source;
	      lastOriginalLine = original.line;
	      lastOriginalColumn = original.column;
	      lastOriginalName = original.name;
	      sourceMappingActive = true;
	    } else if (sourceMappingActive) {
	      map.addMapping({
	        generated: {
	          line: generated.line,
	          column: generated.column
	        }
	      });
	      lastOriginalSource = null;
	      sourceMappingActive = false;
	    }
	    for (var idx = 0, length = chunk.length; idx < length; idx++) {
	      if (chunk.charCodeAt(idx) === NEWLINE_CODE) {
	        generated.line++;
	        generated.column = 0;
	        // Mappings end at eol
	        if (idx + 1 === length) {
	          lastOriginalSource = null;
	          sourceMappingActive = false;
	        } else if (sourceMappingActive) {
	          map.addMapping({
	            source: original.source,
	            original: {
	              line: original.line,
	              column: original.column
	            },
	            generated: {
	              line: generated.line,
	              column: generated.column
	            },
	            name: original.name
	          });
	        }
	      } else {
	        generated.column++;
	      }
	    }
	  });
	  this.walkSourceContents(function (sourceFile, sourceContent) {
	    map.setSourceContent(sourceFile, sourceContent);
	  });

	  return { code: generated.code, map: map };
	};

	sourceNode.SourceNode = SourceNode;
	return sourceNode;
}

/*
 * Copyright 2009-2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE.txt or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var hasRequiredSourceMap;

function requireSourceMap () {
	if (hasRequiredSourceMap) return sourceMap;
	hasRequiredSourceMap = 1;
	sourceMap.SourceMapGenerator = requireSourceMapGenerator().SourceMapGenerator;
	sourceMap.SourceMapConsumer = requireSourceMapConsumer().SourceMapConsumer;
	sourceMap.SourceNode = requireSourceNode().SourceNode;
	return sourceMap;
}

/* eslint-disable node/no-deprecated-api */

var bufferFrom_1;
var hasRequiredBufferFrom;

function requireBufferFrom () {
	if (hasRequiredBufferFrom) return bufferFrom_1;
	hasRequiredBufferFrom = 1;
	var toString = Object.prototype.toString;

	var isModern = (
	  typeof Buffer !== 'undefined' &&
	  typeof Buffer.alloc === 'function' &&
	  typeof Buffer.allocUnsafe === 'function' &&
	  typeof Buffer.from === 'function'
	);

	function isArrayBuffer (input) {
	  return toString.call(input).slice(8, -1) === 'ArrayBuffer'
	}

	function fromArrayBuffer (obj, byteOffset, length) {
	  byteOffset >>>= 0;

	  var maxLength = obj.byteLength - byteOffset;

	  if (maxLength < 0) {
	    throw new RangeError("'offset' is out of bounds")
	  }

	  if (length === undefined) {
	    length = maxLength;
	  } else {
	    length >>>= 0;

	    if (length > maxLength) {
	      throw new RangeError("'length' is out of bounds")
	    }
	  }

	  return isModern
	    ? Buffer.from(obj.slice(byteOffset, byteOffset + length))
	    : new Buffer(new Uint8Array(obj.slice(byteOffset, byteOffset + length)))
	}

	function fromString (string, encoding) {
	  if (typeof encoding !== 'string' || encoding === '') {
	    encoding = 'utf8';
	  }

	  if (!Buffer.isEncoding(encoding)) {
	    throw new TypeError('"encoding" must be a valid string encoding')
	  }

	  return isModern
	    ? Buffer.from(string, encoding)
	    : new Buffer(string, encoding)
	}

	function bufferFrom (value, encodingOrOffset, length) {
	  if (typeof value === 'number') {
	    throw new TypeError('"value" argument must not be a number')
	  }

	  if (isArrayBuffer(value)) {
	    return fromArrayBuffer(value, encodingOrOffset, length)
	  }

	  if (typeof value === 'string') {
	    return fromString(value, encodingOrOffset)
	  }

	  return isModern
	    ? Buffer.from(value)
	    : new Buffer(value)
	}

	bufferFrom_1 = bufferFrom;
	return bufferFrom_1;
}

sourceMapSupport.exports;

var hasRequiredSourceMapSupport;

function requireSourceMapSupport () {
	if (hasRequiredSourceMapSupport) return sourceMapSupport.exports;
	hasRequiredSourceMapSupport = 1;
	(function (module, exports) {
		var SourceMapConsumer = requireSourceMap().SourceMapConsumer;
		var path = require$$1;

		var fs;
		try {
		  fs = require$$2;
		  if (!fs.existsSync || !fs.readFileSync) {
		    // fs doesn't have all methods we need
		    fs = null;
		  }
		} catch (err) {
		  /* nop */
		}

		var bufferFrom = requireBufferFrom();

		/**
		 * Requires a module which is protected against bundler minification.
		 *
		 * @param {NodeModule} mod
		 * @param {string} request
		 */
		function dynamicRequire(mod, request) {
		  return mod.require(request);
		}

		// Only install once if called multiple times
		var errorFormatterInstalled = false;
		var uncaughtShimInstalled = false;

		// If true, the caches are reset before a stack trace formatting operation
		var emptyCacheBetweenOperations = false;

		// Supports {browser, node, auto}
		var environment = "auto";

		// Maps a file path to a string containing the file contents
		var fileContentsCache = {};

		// Maps a file path to a source map for that file
		var sourceMapCache = {};

		// Regex for detecting source maps
		var reSourceMap = /^data:application\/json[^,]+base64,/;

		// Priority list of retrieve handlers
		var retrieveFileHandlers = [];
		var retrieveMapHandlers = [];

		function isInBrowser() {
		  if (environment === "browser")
		    return true;
		  if (environment === "node")
		    return false;
		  return ((typeof window !== 'undefined') && (typeof XMLHttpRequest === 'function') && !(window.require && window.module && window.process && window.process.type === "renderer"));
		}

		function hasGlobalProcessEventEmitter() {
		  return ((typeof process === 'object') && (process !== null) && (typeof process.on === 'function'));
		}

		function globalProcessVersion() {
		  if ((typeof process === 'object') && (process !== null)) {
		    return process.version;
		  } else {
		    return '';
		  }
		}

		function globalProcessStderr() {
		  if ((typeof process === 'object') && (process !== null)) {
		    return process.stderr;
		  }
		}

		function globalProcessExit(code) {
		  if ((typeof process === 'object') && (process !== null) && (typeof process.exit === 'function')) {
		    return process.exit(code);
		  }
		}

		function handlerExec(list) {
		  return function(arg) {
		    for (var i = 0; i < list.length; i++) {
		      var ret = list[i](arg);
		      if (ret) {
		        return ret;
		      }
		    }
		    return null;
		  };
		}

		var retrieveFile = handlerExec(retrieveFileHandlers);

		retrieveFileHandlers.push(function(path) {
		  // Trim the path to make sure there is no extra whitespace.
		  path = path.trim();
		  if (/^file:/.test(path)) {
		    // existsSync/readFileSync can't handle file protocol, but once stripped, it works
		    path = path.replace(/file:\/\/\/(\w:)?/, function(protocol, drive) {
		      return drive ?
		        '' : // file:///C:/dir/file -> C:/dir/file
		        '/'; // file:///root-dir/file -> /root-dir/file
		    });
		  }
		  if (path in fileContentsCache) {
		    return fileContentsCache[path];
		  }

		  var contents = '';
		  try {
		    if (!fs) {
		      // Use SJAX if we are in the browser
		      var xhr = new XMLHttpRequest();
		      xhr.open('GET', path, /** async */ false);
		      xhr.send(null);
		      if (xhr.readyState === 4 && xhr.status === 200) {
		        contents = xhr.responseText;
		      }
		    } else if (fs.existsSync(path)) {
		      // Otherwise, use the filesystem
		      contents = fs.readFileSync(path, 'utf8');
		    }
		  } catch (er) {
		    /* ignore any errors */
		  }

		  return fileContentsCache[path] = contents;
		});

		// Support URLs relative to a directory, but be careful about a protocol prefix
		// in case we are in the browser (i.e. directories may start with "http://" or "file:///")
		function supportRelativeURL(file, url) {
		  if (!file) return url;
		  var dir = path.dirname(file);
		  var match = /^\w+:\/\/[^\/]*/.exec(dir);
		  var protocol = match ? match[0] : '';
		  var startPath = dir.slice(protocol.length);
		  if (protocol && /^\/\w\:/.test(startPath)) {
		    // handle file:///C:/ paths
		    protocol += '/';
		    return protocol + path.resolve(dir.slice(protocol.length), url).replace(/\\/g, '/');
		  }
		  return protocol + path.resolve(dir.slice(protocol.length), url);
		}

		function retrieveSourceMapURL(source) {
		  var fileData;

		  if (isInBrowser()) {
		     try {
		       var xhr = new XMLHttpRequest();
		       xhr.open('GET', source, false);
		       xhr.send(null);
		       fileData = xhr.readyState === 4 ? xhr.responseText : null;

		       // Support providing a sourceMappingURL via the SourceMap header
		       var sourceMapHeader = xhr.getResponseHeader("SourceMap") ||
		                             xhr.getResponseHeader("X-SourceMap");
		       if (sourceMapHeader) {
		         return sourceMapHeader;
		       }
		     } catch (e) {
		     }
		  }

		  // Get the URL of the source map
		  fileData = retrieveFile(source);
		  var re = /(?:\/\/[@#][\s]*sourceMappingURL=([^\s'"]+)[\s]*$)|(?:\/\*[@#][\s]*sourceMappingURL=([^\s*'"]+)[\s]*(?:\*\/)[\s]*$)/mg;
		  // Keep executing the search to find the *last* sourceMappingURL to avoid
		  // picking up sourceMappingURLs from comments, strings, etc.
		  var lastMatch, match;
		  while (match = re.exec(fileData)) lastMatch = match;
		  if (!lastMatch) return null;
		  return lastMatch[1];
		}
		// Can be overridden by the retrieveSourceMap option to install. Takes a
		// generated source filename; returns a {map, optional url} object, or null if
		// there is no source map.  The map field may be either a string or the parsed
		// JSON object (ie, it must be a valid argument to the SourceMapConsumer
		// constructor).
		var retrieveSourceMap = handlerExec(retrieveMapHandlers);
		retrieveMapHandlers.push(function(source) {
		  var sourceMappingURL = retrieveSourceMapURL(source);
		  if (!sourceMappingURL) return null;

		  // Read the contents of the source map
		  var sourceMapData;
		  if (reSourceMap.test(sourceMappingURL)) {
		    // Support source map URL as a data url
		    var rawData = sourceMappingURL.slice(sourceMappingURL.indexOf(',') + 1);
		    sourceMapData = bufferFrom(rawData, "base64").toString();
		    sourceMappingURL = source;
		  } else {
		    // Support source map URLs relative to the source URL
		    sourceMappingURL = supportRelativeURL(source, sourceMappingURL);
		    sourceMapData = retrieveFile(sourceMappingURL);
		  }

		  if (!sourceMapData) {
		    return null;
		  }

		  return {
		    url: sourceMappingURL,
		    map: sourceMapData
		  };
		});

		function mapSourcePosition(position) {
		  var sourceMap = sourceMapCache[position.source];
		  if (!sourceMap) {
		    // Call the (overrideable) retrieveSourceMap function to get the source map.
		    var urlAndMap = retrieveSourceMap(position.source);
		    if (urlAndMap) {
		      sourceMap = sourceMapCache[position.source] = {
		        url: urlAndMap.url,
		        map: new SourceMapConsumer(urlAndMap.map)
		      };

		      // Load all sources stored inline with the source map into the file cache
		      // to pretend like they are already loaded. They may not exist on disk.
		      if (sourceMap.map.sourcesContent) {
		        sourceMap.map.sources.forEach(function(source, i) {
		          var contents = sourceMap.map.sourcesContent[i];
		          if (contents) {
		            var url = supportRelativeURL(sourceMap.url, source);
		            fileContentsCache[url] = contents;
		          }
		        });
		      }
		    } else {
		      sourceMap = sourceMapCache[position.source] = {
		        url: null,
		        map: null
		      };
		    }
		  }

		  // Resolve the source URL relative to the URL of the source map
		  if (sourceMap && sourceMap.map && typeof sourceMap.map.originalPositionFor === 'function') {
		    var originalPosition = sourceMap.map.originalPositionFor(position);

		    // Only return the original position if a matching line was found. If no
		    // matching line is found then we return position instead, which will cause
		    // the stack trace to print the path and line for the compiled file. It is
		    // better to give a precise location in the compiled file than a vague
		    // location in the original file.
		    if (originalPosition.source !== null) {
		      originalPosition.source = supportRelativeURL(
		        sourceMap.url, originalPosition.source);
		      return originalPosition;
		    }
		  }

		  return position;
		}

		// Parses code generated by FormatEvalOrigin(), a function inside V8:
		// https://code.google.com/p/v8/source/browse/trunk/src/messages.js
		function mapEvalOrigin(origin) {
		  // Most eval() calls are in this format
		  var match = /^eval at ([^(]+) \((.+):(\d+):(\d+)\)$/.exec(origin);
		  if (match) {
		    var position = mapSourcePosition({
		      source: match[2],
		      line: +match[3],
		      column: match[4] - 1
		    });
		    return 'eval at ' + match[1] + ' (' + position.source + ':' +
		      position.line + ':' + (position.column + 1) + ')';
		  }

		  // Parse nested eval() calls using recursion
		  match = /^eval at ([^(]+) \((.+)\)$/.exec(origin);
		  if (match) {
		    return 'eval at ' + match[1] + ' (' + mapEvalOrigin(match[2]) + ')';
		  }

		  // Make sure we still return useful information if we didn't find anything
		  return origin;
		}

		// This is copied almost verbatim from the V8 source code at
		// https://code.google.com/p/v8/source/browse/trunk/src/messages.js. The
		// implementation of wrapCallSite() used to just forward to the actual source
		// code of CallSite.prototype.toString but unfortunately a new release of V8
		// did something to the prototype chain and broke the shim. The only fix I
		// could find was copy/paste.
		function CallSiteToString() {
		  var fileName;
		  var fileLocation = "";
		  if (this.isNative()) {
		    fileLocation = "native";
		  } else {
		    fileName = this.getScriptNameOrSourceURL();
		    if (!fileName && this.isEval()) {
		      fileLocation = this.getEvalOrigin();
		      fileLocation += ", ";  // Expecting source position to follow.
		    }

		    if (fileName) {
		      fileLocation += fileName;
		    } else {
		      // Source code does not originate from a file and is not native, but we
		      // can still get the source position inside the source string, e.g. in
		      // an eval string.
		      fileLocation += "<anonymous>";
		    }
		    var lineNumber = this.getLineNumber();
		    if (lineNumber != null) {
		      fileLocation += ":" + lineNumber;
		      var columnNumber = this.getColumnNumber();
		      if (columnNumber) {
		        fileLocation += ":" + columnNumber;
		      }
		    }
		  }

		  var line = "";
		  var functionName = this.getFunctionName();
		  var addSuffix = true;
		  var isConstructor = this.isConstructor();
		  var isMethodCall = !(this.isToplevel() || isConstructor);
		  if (isMethodCall) {
		    var typeName = this.getTypeName();
		    // Fixes shim to be backward compatable with Node v0 to v4
		    if (typeName === "[object Object]") {
		      typeName = "null";
		    }
		    var methodName = this.getMethodName();
		    if (functionName) {
		      if (typeName && functionName.indexOf(typeName) != 0) {
		        line += typeName + ".";
		      }
		      line += functionName;
		      if (methodName && functionName.indexOf("." + methodName) != functionName.length - methodName.length - 1) {
		        line += " [as " + methodName + "]";
		      }
		    } else {
		      line += typeName + "." + (methodName || "<anonymous>");
		    }
		  } else if (isConstructor) {
		    line += "new " + (functionName || "<anonymous>");
		  } else if (functionName) {
		    line += functionName;
		  } else {
		    line += fileLocation;
		    addSuffix = false;
		  }
		  if (addSuffix) {
		    line += " (" + fileLocation + ")";
		  }
		  return line;
		}

		function cloneCallSite(frame) {
		  var object = {};
		  Object.getOwnPropertyNames(Object.getPrototypeOf(frame)).forEach(function(name) {
		    object[name] = /^(?:is|get)/.test(name) ? function() { return frame[name].call(frame); } : frame[name];
		  });
		  object.toString = CallSiteToString;
		  return object;
		}

		function wrapCallSite(frame, state) {
		  // provides interface backward compatibility
		  if (state === undefined) {
		    state = { nextPosition: null, curPosition: null };
		  }
		  if(frame.isNative()) {
		    state.curPosition = null;
		    return frame;
		  }

		  // Most call sites will return the source file from getFileName(), but code
		  // passed to eval() ending in "//# sourceURL=..." will return the source file
		  // from getScriptNameOrSourceURL() instead
		  var source = frame.getFileName() || frame.getScriptNameOrSourceURL();
		  if (source) {
		    var line = frame.getLineNumber();
		    var column = frame.getColumnNumber() - 1;

		    // Fix position in Node where some (internal) code is prepended.
		    // See https://github.com/evanw/node-source-map-support/issues/36
		    // Header removed in node at ^10.16 || >=11.11.0
		    // v11 is not an LTS candidate, we can just test the one version with it.
		    // Test node versions for: 10.16-19, 10.20+, 12-19, 20-99, 100+, or 11.11
		    var noHeader = /^v(10\.1[6-9]|10\.[2-9][0-9]|10\.[0-9]{3,}|1[2-9]\d*|[2-9]\d|\d{3,}|11\.11)/;
		    var headerLength = noHeader.test(globalProcessVersion()) ? 0 : 62;
		    if (line === 1 && column > headerLength && !isInBrowser() && !frame.isEval()) {
		      column -= headerLength;
		    }

		    var position = mapSourcePosition({
		      source: source,
		      line: line,
		      column: column
		    });
		    state.curPosition = position;
		    frame = cloneCallSite(frame);
		    var originalFunctionName = frame.getFunctionName;
		    frame.getFunctionName = function() {
		      if (state.nextPosition == null) {
		        return originalFunctionName();
		      }
		      return state.nextPosition.name || originalFunctionName();
		    };
		    frame.getFileName = function() { return position.source; };
		    frame.getLineNumber = function() { return position.line; };
		    frame.getColumnNumber = function() { return position.column + 1; };
		    frame.getScriptNameOrSourceURL = function() { return position.source; };
		    return frame;
		  }

		  // Code called using eval() needs special handling
		  var origin = frame.isEval() && frame.getEvalOrigin();
		  if (origin) {
		    origin = mapEvalOrigin(origin);
		    frame = cloneCallSite(frame);
		    frame.getEvalOrigin = function() { return origin; };
		    return frame;
		  }

		  // If we get here then we were unable to change the source position
		  return frame;
		}

		// This function is part of the V8 stack trace API, for more info see:
		// https://v8.dev/docs/stack-trace-api
		function prepareStackTrace(error, stack) {
		  if (emptyCacheBetweenOperations) {
		    fileContentsCache = {};
		    sourceMapCache = {};
		  }

		  var name = error.name || 'Error';
		  var message = error.message || '';
		  var errorString = name + ": " + message;

		  var state = { nextPosition: null, curPosition: null };
		  var processedStack = [];
		  for (var i = stack.length - 1; i >= 0; i--) {
		    processedStack.push('\n    at ' + wrapCallSite(stack[i], state));
		    state.nextPosition = state.curPosition;
		  }
		  state.curPosition = state.nextPosition = null;
		  return errorString + processedStack.reverse().join('');
		}

		// Generate position and snippet of original source with pointer
		function getErrorSource(error) {
		  var match = /\n    at [^(]+ \((.*):(\d+):(\d+)\)/.exec(error.stack);
		  if (match) {
		    var source = match[1];
		    var line = +match[2];
		    var column = +match[3];

		    // Support the inline sourceContents inside the source map
		    var contents = fileContentsCache[source];

		    // Support files on disk
		    if (!contents && fs && fs.existsSync(source)) {
		      try {
		        contents = fs.readFileSync(source, 'utf8');
		      } catch (er) {
		        contents = '';
		      }
		    }

		    // Format the line from the original source code like node does
		    if (contents) {
		      var code = contents.split(/(?:\r\n|\r|\n)/)[line - 1];
		      if (code) {
		        return source + ':' + line + '\n' + code + '\n' +
		          new Array(column).join(' ') + '^';
		      }
		    }
		  }
		  return null;
		}

		function printErrorAndExit (error) {
		  var source = getErrorSource(error);

		  // Ensure error is printed synchronously and not truncated
		  var stderr = globalProcessStderr();
		  if (stderr && stderr._handle && stderr._handle.setBlocking) {
		    stderr._handle.setBlocking(true);
		  }

		  if (source) {
		    console.error();
		    console.error(source);
		  }

		  console.error(error.stack);
		  globalProcessExit(1);
		}

		function shimEmitUncaughtException () {
		  var origEmit = process.emit;

		  process.emit = function (type) {
		    if (type === 'uncaughtException') {
		      var hasStack = (arguments[1] && arguments[1].stack);
		      var hasListeners = (this.listeners(type).length > 0);

		      if (hasStack && !hasListeners) {
		        return printErrorAndExit(arguments[1]);
		      }
		    }

		    return origEmit.apply(this, arguments);
		  };
		}

		var originalRetrieveFileHandlers = retrieveFileHandlers.slice(0);
		var originalRetrieveMapHandlers = retrieveMapHandlers.slice(0);

		exports.wrapCallSite = wrapCallSite;
		exports.getErrorSource = getErrorSource;
		exports.mapSourcePosition = mapSourcePosition;
		exports.retrieveSourceMap = retrieveSourceMap;

		exports.install = function(options) {
		  options = options || {};

		  if (options.environment) {
		    environment = options.environment;
		    if (["node", "browser", "auto"].indexOf(environment) === -1) {
		      throw new Error("environment " + environment + " was unknown. Available options are {auto, browser, node}")
		    }
		  }

		  // Allow sources to be found by methods other than reading the files
		  // directly from disk.
		  if (options.retrieveFile) {
		    if (options.overrideRetrieveFile) {
		      retrieveFileHandlers.length = 0;
		    }

		    retrieveFileHandlers.unshift(options.retrieveFile);
		  }

		  // Allow source maps to be found by methods other than reading the files
		  // directly from disk.
		  if (options.retrieveSourceMap) {
		    if (options.overrideRetrieveSourceMap) {
		      retrieveMapHandlers.length = 0;
		    }

		    retrieveMapHandlers.unshift(options.retrieveSourceMap);
		  }

		  // Support runtime transpilers that include inline source maps
		  if (options.hookRequire && !isInBrowser()) {
		    // Use dynamicRequire to avoid including in browser bundles
		    var Module = dynamicRequire(module, 'module');
		    var $compile = Module.prototype._compile;

		    if (!$compile.__sourceMapSupport) {
		      Module.prototype._compile = function(content, filename) {
		        fileContentsCache[filename] = content;
		        sourceMapCache[filename] = undefined;
		        return $compile.call(this, content, filename);
		      };

		      Module.prototype._compile.__sourceMapSupport = true;
		    }
		  }

		  // Configure options
		  if (!emptyCacheBetweenOperations) {
		    emptyCacheBetweenOperations = 'emptyCacheBetweenOperations' in options ?
		      options.emptyCacheBetweenOperations : false;
		  }

		  // Install the error reformatter
		  if (!errorFormatterInstalled) {
		    errorFormatterInstalled = true;
		    Error.prepareStackTrace = prepareStackTrace;
		  }

		  if (!uncaughtShimInstalled) {
		    var installHandler = 'handleUncaughtExceptions' in options ?
		      options.handleUncaughtExceptions : true;

		    // Do not override 'uncaughtException' with our own handler in Node.js
		    // Worker threads. Workers pass the error to the main thread as an event,
		    // rather than printing something to stderr and exiting.
		    try {
		      // We need to use `dynamicRequire` because `require` on it's own will be optimized by WebPack/Browserify.
		      var worker_threads = dynamicRequire(module, 'worker_threads');
		      if (worker_threads.isMainThread === false) {
		        installHandler = false;
		      }
		    } catch(e) {}

		    // Provide the option to not install the uncaught exception handler. This is
		    // to support other uncaught exception handlers (in test frameworks, for
		    // example). If this handler is not installed and there are no other uncaught
		    // exception handlers, uncaught exceptions will be caught by node's built-in
		    // exception handler and the process will still be terminated. However, the
		    // generated JavaScript code will be shown above the stack trace instead of
		    // the original source code.
		    if (installHandler && hasGlobalProcessEventEmitter()) {
		      uncaughtShimInstalled = true;
		      shimEmitUncaughtException();
		    }
		  }
		};

		exports.resetRetrieveHandlers = function() {
		  retrieveFileHandlers.length = 0;
		  retrieveMapHandlers.length = 0;

		  retrieveFileHandlers = originalRetrieveFileHandlers.slice(0);
		  retrieveMapHandlers = originalRetrieveMapHandlers.slice(0);

		  retrieveSourceMap = handlerExec(retrieveMapHandlers);
		  retrieveFile = handlerExec(retrieveFileHandlers);
		}; 
	} (sourceMapSupport, sourceMapSupport.exports));
	return sourceMapSupport.exports;
}

var hasRequiredRegister;

function requireRegister () {
	if (hasRequiredRegister) return register;
	hasRequiredRegister = 1;
	requireSourceMapSupport().install();
	return register;
}

requireRegister();

const getPrefixedLogger = (logPrefix) => {
    const prefixedLogger = log.getLogger(`${common.METICULOUS_LOGGER_NAME}/${logPrefix}`);
    prefixedLogger.setLevel(+(process.env["RUNNER_DEBUG"] ?? "0") ? log.levels.TRACE : log.levels.INFO);
    prefix.reg(log);
    prefix.apply(prefixedLogger, {
        template: `[${logPrefix}] %l:`,
    });
    return prefixedLogger;
};
const initLogger = () => {
    const logger = log.getLogger(common.METICULOUS_LOGGER_NAME);
    logger.setDefaultLevel(log.levels.INFO);
    if (+(process.env["RUNNER_DEBUG"] ?? "0")) {
        setLogLevel("trace");
    }
    return logger;
};
const setLogLevel = (logLevel) => {
    const logger = log.getLogger(common.METICULOUS_LOGGER_NAME);
    switch ((logLevel).toLocaleLowerCase()) {
        case "trace":
            logger.setLevel(log.levels.TRACE, false);
            break;
        case "debug":
            logger.setLevel(log.levels.DEBUG, false);
            break;
        case "info":
            logger.setLevel(log.levels.INFO, false);
            break;
        case "warn":
            logger.setLevel(log.levels.WARN, false);
            break;
        case "error":
            logger.setLevel(log.levels.ERROR, false);
            break;
        case "silent":
            logger.setLevel(log.levels.SILENT, false);
            break;
    }
};
const shortSha = (sha) => sha.slice(0, 7);

/**
 * Enriches Sentry context with GitHub Actions environment information
 * This should be called at the start of each workflow after Sentry is initialized
 */
function enrichSentryContextWithGitHubActionsContext() {
    try {
        const { GITHUB_REPOSITORY, GITHUB_RUN_ID, GITHUB_RUN_NUMBER, GITHUB_WORKFLOW, GITHUB_ACTION, GITHUB_ACTOR, GITHUB_REF, GITHUB_SHA, RUNNER_OS, RUNNER_ARCH, } = process.env;
        Sentry__namespace.setTags({
            github_repository: GITHUB_REPOSITORY,
            github_workflow: GITHUB_WORKFLOW,
            github_run_id: GITHUB_RUN_ID,
            runner_os: RUNNER_OS,
            runner_arch: RUNNER_ARCH,
        });
        Sentry__namespace.setContext("github_action", {
            repository: GITHUB_REPOSITORY,
            run_id: GITHUB_RUN_ID,
            run_number: GITHUB_RUN_NUMBER,
            workflow: GITHUB_WORKFLOW,
            action: GITHUB_ACTION,
            actor: GITHUB_ACTOR,
            ref: GITHUB_REF,
            sha: GITHUB_SHA,
        });
    }
    catch (e) {
        console.debug("Error enriching Sentry context with GitHub Actions context", e);
    }
}

/**
 * Get the base commit that we should compare the visual snapshots against, and the head commit to associate
 * the status check with.
 *
 * WARNING: The head commit here is _not_ guaranteed to be the one we have the code for! For a PR checked out
 * in the default way it will be the head of the PR branch, but the code checked out will be the temporary
 * merge commit. If you need the actual commit that we have the code for, use the `getActualCommitShaFromRepo`
 * function.
 */
const getBaseAndHeadCommitShas = async (event, options, logger) => {
    if (event.type === "pull_request") {
        const head = event.payload.pull_request.head.sha;
        const base = event.payload.pull_request.base.sha;
        const baseRef = event.payload.pull_request.base.ref;
        return {
            base: (await tryGetMergeBaseOfTemporaryMergeCommit(head, base, baseRef, logger)) ?? base,
            head,
        };
    }
    if (event.type === "push") {
        return {
            base: event.payload.before,
            head: event.payload.after,
        };
    }
    if (event.type === "workflow_dispatch") {
        return {
            base: null,
            head: github.context.sha,
        };
    }
    return assertNever(event);
};
const assertNever = (event) => {
    throw new Error("Unexpected event: " + JSON.stringify(event));
};
const tryGetMergeBaseOfHeadCommit = (pullRequestHeadSha, pullRequestBaseSha, baseRef, logger) => {
    try {
        markGitDirectoryAsSafe();
        // Only a single commit is fetched by the checkout action by default
        // (https://github.com/actions/checkout#checkout-v3)
        // We therefore run fetch with the `--unshallow` param to fetch the whole branch/commit ancestor chains, which merge-base needs
        node_child_process.execSync(`git fetch origin ${pullRequestHeadSha} --unshallow`);
        node_child_process.execSync(`git fetch origin ${baseRef}`);
        const mergeBase = node_child_process.execSync(`git merge-base ${pullRequestHeadSha} origin/${baseRef}`)
            .toString()
            .trim();
        if (!isValidGitSha(mergeBase)) {
            // Note: the GITHUB_SHA is always a merge commit, even if the merge is a no-op because the PR is up to date
            // So this should never happen
            logger.error(`Failed to get merge base of ${pullRequestHeadSha} and ${baseRef}: value returned by 'git merge-base' was not a valid git SHA ('${mergeBase}').` +
                `Using the base of the pull request instead (${pullRequestBaseSha}).`);
            return null;
        }
        return mergeBase;
    }
    catch (error) {
        logger.error(`Failed to get merge base of ${pullRequestHeadSha} and ${baseRef}. Error: ${error}. Using the base of the pull request instead (${pullRequestBaseSha}).`);
        return null;
    }
};
/**
 * Get the actual commit SHA that we have the code for.
 */
const getActualCommitShaFromRepo = () => {
    return node_child_process.execSync("git rev-list --max-count=1 HEAD").toString().trim();
};
const tryGetMergeBaseOfTemporaryMergeCommit = (pullRequestHeadSha, pullRequestBaseSha, pullRequestBaseRef, logger) => {
    const mergeCommitSha = process.env.GITHUB_SHA;
    if (mergeCommitSha == null) {
        logger.error(`No GITHUB_SHA environment var set, so can't work out true base of the merge commit. Using the base of the pull request instead (${pullRequestBaseSha}).`);
        return null;
    }
    try {
        markGitDirectoryAsSafe();
        const headCommitSha = getActualCommitShaFromRepo();
        if (headCommitSha !== mergeCommitSha) {
            logger.info(`The head commit SHA (${headCommitSha}) does not equal GITHUB_SHA environment variable (${mergeCommitSha}).
          This is likely because a custom ref has been passed to the 'actions/checkout' action. We're assuming therefore
          that the head commit SHA is not a temporary merge commit, but rather the head of the branch. Therefore we're
          using the branching point of the PR branch to compare the visual snapshots against, and not the base
          of GitHub's temporary merge commit.`);
            return tryGetMergeBaseOfHeadCommit(headCommitSha, pullRequestBaseSha, pullRequestBaseRef, logger);
        }
        // The GITHUB_SHA is always a merge commit for PRs
        const parents = node_child_process.execSync(`git cat-file -p ${mergeCommitSha}`)
            .toString()
            .split("\n")
            .filter((line) => line.startsWith("parent "))
            .map((line) => line.substring("parent ".length).trim());
        if (parents.length !== 2) {
            // Note: the GITHUB_SHA is always a merge commit, even if the merge is a no-op because the PR is up to date
            // So this should never happen
            logger.error(`GITHUB_SHA (${mergeCommitSha}) is not a merge commit, so can't work out true base of the merge commit. Using the base of the pull request instead.`);
            return null;
        }
        // The first parent is always the base, and the second parent is the head of the PR
        const mergeBaseSha = parents[0];
        const mergeHeadSha = parents[1];
        if (mergeHeadSha !== pullRequestHeadSha) {
            logger.error(`The second parent (${parents[1]}) of the GITHUB_SHA merge commit (${mergeCommitSha}) is not equal to the head of the PR (${pullRequestHeadSha}),
        so can not confidently determine the base of the merge commit to compare against. Using the base of the pull request instead (${pullRequestBaseSha}).`);
            return null;
        }
        return mergeBaseSha;
    }
    catch (e) {
        logger.error(`Error getting base of merge commit (${mergeCommitSha}). Using the base of the pull request instead (${pullRequestBaseSha}).`, e);
        return null;
    }
};
const markGitDirectoryAsSafe = () => {
    // The .git directory is owned by a different user. By default git therefore won't let us
    // run git commands on it in case that user has inserted malicious code into the .git directory,
    // which gets executed when we run a git command. However we trust github to not do that, so can
    // mark this directory as safe.
    // See https://medium.com/@thecodinganalyst/git-detect-dubious-ownership-in-repository-e7f33037a8f for more details
    node_child_process.execSync(`git config --global --add safe.directory "${process.cwd()}"`);
};
const isValidGitSha = (sha) => {
    return /^[a-f0-9]{40}$/.test(sha);
};

/*
 * Computes the HEAD commit SHA to use when creating a test run.

 * In a PR workflow this will by default be process.env.GITHUB_SHA (the temporary merge commit) or
 * sometimes the head commit of the PR.
 * Users can also explicitly provide the head commit SHA to use as input. This is useful when the action is not
 * run with the code checked out.
 * Our backend is responsible for computing the correct BASE commit to create the test run for.
 */
const getHeadCommitSha = async ({ headShaFromInput, logger, }) => {
    if (headShaFromInput != null && headShaFromInput.length > 0) {
        return { type: "success", sha: headShaFromInput };
    }
    try {
        return { type: "success", sha: await getActualCommitShaFromRepo() };
    }
    catch (error) {
        logger.error(`Failed to get HEAD commit SHA from repo. Error: ${error}. Reporting telemetry without a HEAD commit SHA.`);
        return { type: "error", error };
    }
};

const projectTargetSchema = Joi.object({
    "app-url": Joi.string().required(),
    "api-token": Joi.string().required(),
    skip: Joi.boolean().default(false).optional().label("skip"),
});
const projectsYamlSchema = Joi.object().pattern(Joi.string(), projectTargetSchema);
const parseProjectsYaml = (projectsYaml) => {
    const data = YAML.parse(projectsYaml);
    // Validate the parsed projects data.
    const { error, value } = projectsYamlSchema.validate(data, {
        abortEarly: false,
    });
    if (error) {
        throw new Error(`Invalid projects-yaml: ${error.message}`);
    }
    return Object.entries(value).map(([name, project]) => ({
        name,
        apiToken: project["api-token"],
        appUrl: project["app-url"],
        skip: project.skip,
    }));
};

const getInCloudActionInputs = () => {
    // The names, required value, and types should match that in action.yml
    const apiToken = core.getInput("api-token", { required: false });
    const githubToken = core.getInput("github-token", { required: true });
    const appUrl = core.getInput("app-url", { required: false });
    const headSha = core.getInput("head-sha");
    const secureTunnelHost = core.getInput("secure-tunnel-host", { required: false });
    const proxyAllUrls = core.getBooleanInput("proxy-all-urls", { required: false });
    const rewriteHostnameToAppUrl = core.getBooleanInput("rewrite-hostname-to-app-url", { required: false });
    const projectsYaml = core.getInput("projects-yaml", { required: false });
    if (projectsYaml) {
        if (apiToken || appUrl) {
            throw new Error("Cannot provide both 'projects-yaml' and 'api-token' or 'app-url'");
        }
        const projectTargets = parseProjectsYaml(projectsYaml);
        return {
            githubToken,
            headSha,
            projectTargets,
            secureTunnelHost,
            proxyAllUrls,
            rewriteHostnameToAppUrl,
        };
    }
    if (!apiToken || !appUrl) {
        throw new Error("Must provide either 'projects-yaml' or 'api-token' and 'app-url'");
    }
    return {
        githubToken,
        headSha,
        projectTargets: [
            {
                name: "default",
                apiToken,
                appUrl,
                skip: false,
            },
        ],
        secureTunnelHost,
        proxyAllUrls,
        rewriteHostnameToAppUrl,
    };
};

const throwIfCannotConnectToOrigin = async (appUrl) => {
    // Wait 1s, 2s, 4s, 8s, 16s, 32s, 64s for a total of just over 2 minutes
    const operation = retry__namespace.operation({
        retries: 7,
        factor: 2,
        minTimeout: 1000,
    });
    const url = new URL(appUrl);
    return new Promise((resolve, reject) => {
        operation.attempt(async () => {
            if (await canConnectTo(url)) {
                resolve();
                return;
            }
            const err = new Error(`Could not connect to '${appUrl}'. Please check:\n\n` +
                `1. The server running at '${appUrl}' has fully started by the time the Meticulous action starts. You may need to add a 'sleep 30' after starting the server to ensure that this is the case.\n` +
                `2. The server running at '${appUrl}' is using tcp instead of tcp6. You can use 'netstat -tulpen' to see what addresses and ports it is bound to.\n\n`);
            if (!operation.retry(err)) {
                reject(operation.mainError());
            }
        });
    });
};
const canConnectTo = async (url) => {
    try {
        const result = await fetchWithTimeout(url);
        return result.status !== 502;
    }
    catch (error) {
        return false;
    }
};
async function fetchWithTimeout(url) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(url, {
        signal: controller.signal,
    });
    clearTimeout(id);
    return response;
}

const METICULIOUS_APP_URL = "https://app.meticulous.ai";
const DOCS_URL = `${METICULIOUS_APP_URL}/docs/github-actions-v2`;
const METICULOUS_DEBUGGING_PR_TAG = "[meticulous debug]";

const isGithubPermissionsError = (error) => {
    const message = getErrorMessage(error);
    return (message.toLowerCase().includes("resource not accessible by integration") ||
        error?.status === 403);
};
const getErrorMessage = (error) => {
    const message = error?.message ?? "";
    return typeof message === "string" ? message : "";
};
const DEFAULT_FAILED_OCTOKIT_REQUEST_MESSAGE = `Please check www.githubstatus.com, and that you have setup the action correctly, including with the correct permissions: see ${DOCS_URL} for the correct setup.`;
const ALL_REQUIRED_PERMISSIONS = [
    "actions: write",
    "contents: read",
    "issues: write",
    "pull-requests: write",
    "statuses: read",
];
const getDetailedGitHubPermissionsError = (error, context) => {
    if (!isGithubPermissionsError(error)) {
        return getErrorMessage(error);
    }
    const acceptedPermissions = error?.response
        ?.headers?.["x-accepted-github-permissions"];
    const apiUrl = error?.response?.url;
    let message = "GitHub API Error: Resource not accessible by integration (403)\n\n";
    // Add specific context based on the operation
    switch (context.operation) {
        case "get_workflow_run":
            message += "Failed to retrieve workflow run information.\n";
            message += "This typically happens when:\n";
            message +=
                "1. The GitHub token doesn't have 'actions: read' permission\n";
            message += "2. The workflow is private and the token lacks access\n";
            break;
        case "trigger_workflow":
            message += "Failed to trigger workflow on base branch.\n";
            message += "This typically happens when:\n";
            message +=
                "1. The GitHub token doesn't have 'actions: write' permission\n";
            message +=
                "2. The workflow doesn't have 'workflow_dispatch' trigger enabled\n";
            message += "3. The branch protection rules prevent workflow dispatch\n";
            break;
        case "get_branch":
            message += "Failed to get branch information.\n";
            message += "This typically happens when:\n";
            message +=
                "1. The GitHub token doesn't have 'contents: read' permission\n";
            message +=
                "2. The branch is protected and requires additional permissions\n";
            break;
        case "comment":
            message += "Failed to create or update PR comment.\n";
            message += "This typically happens when:\n";
            message +=
                "1. The GitHub token doesn't have 'pull-requests: write' permission\n";
            message += "2. The repository has disabled PR comments\n";
            break;
    }
    message += "\n**To fix this issue:**\n\n";
    message += getCommonPermissionsErrorMessage();
    // Add workflow_dispatch requirement if needed
    if (context.operation === "trigger_workflow") {
        message +=
            "Also ensure your workflow has the 'workflow_dispatch' trigger:\n\n";
        message += "```yaml\n";
        message += "on:\n";
        message += "  pull_request: {}\n";
        message += "  push:\n";
        message += "    branches: [main, master]\n";
        message += "  workflow_dispatch: {}\n";
        message += "```\n\n";
    }
    // Add debugging information
    if (apiUrl) {
        message += `API endpoint that failed: ${apiUrl}\n`;
    }
    if (acceptedPermissions) {
        message += `Required GitHub permissions: ${acceptedPermissions}\n`;
    }
    return message;
};
const getCommonPermissionsErrorMessage = () => {
    const permissionLines = ALL_REQUIRED_PERMISSIONS.map((perm) => `  ${perm}`).join("\n");
    return `
If you're seeing this error, it's likely because your GitHub workflow is missing required permissions.

**Most common fix - Add ALL these permissions to your workflow:**

\`\`\`yaml
permissions:
${permissionLines}
\`\`\`


**Also ensure your workflow has the workflow_dispatch trigger:**

\`\`\`yaml
on:
  pull_request: {}
  push:
    branches: [main, master]
  workflow_dispatch: {}  # This line is required!
\`\`\`

**If you're still having issues, check:**
1. Your repository permissions allow the GitHub token to access actions
2. Branch protection rules aren't blocking workflow dispatch
3. The Meticulous GitHub app is properly connected to your repository

For complete setup instructions, see: ${DOCS_URL}
  `.trim();
};

// The GitHub REST API will not list a workflow run immediately after it has been dispatched
const LISTING_AFTER_DISPATCH_DELAY = luxon.Duration.fromObject({ seconds: 10 });
const WORKFLOW_RUN_UPDATE_STATUS_INTERVAL = luxon.Duration.fromObject({ seconds: 5 });
const WORKFLOW_RUN_SEARCH_COMMIT_INTERVAL = luxon.Duration.fromObject({ hours: 1 });
const GITHUB_DATE_FORMAT = "yyyy-MM-dd'T'HH:mm:ss'Z'";
const MAX_COMMITS_TO_SEARCH = 500;
const MAX_WORKFLOW_RUNS_TO_SEARCH = 500;
const getCurrentWorkflowId = async ({ context, octokit, }) => {
    const { owner, repo } = context.repo;
    const workflowRunId = context.runId;
    try {
        const { data } = await octokit.rest.actions.getWorkflowRun({
            owner,
            repo,
            run_id: workflowRunId,
        });
        const workflowId = data.workflow_id;
        return { workflowId };
    }
    catch (err) {
        if (isGithubPermissionsError(err)) {
            const detailedError = getDetailedGitHubPermissionsError(err, {
                operation: "get_workflow_run"});
            throw new Error(detailedError);
        }
        throw err;
    }
};
const startNewWorkflowRun = async ({ owner, repo, workflowId, ref, commitSha, octokit, logger, }) => {
    try {
        await octokit.rest.actions.createWorkflowDispatch({
            owner,
            repo,
            workflow_id: workflowId,
            ref,
        });
    }
    catch (err) {
        const message = err?.message ?? "";
        if (message.includes("Workflow does not have 'workflow_dispatch' trigger")) {
            logger.error(`Could not trigger a workflow run on commit ${shortSha(commitSha)} of the base branch (${ref}) to compare against, because there was no Meticulous workflow with the 'workflow_dispatch' trigger on the ${ref} branch.` +
                ` Visual snapshots of the new flows will be taken, but no comparisons will be made.` +
                ` If you haven't merged the PR to setup Meticulous in Github Actions to the ${ref} branch yet then this is expected.` +
                ` Otherwise please check that Meticulous is running on the ${ref} branch, that it has a 'workflow_dispatch' trigger, and has the appropiate permissions.` +
                ` See ${DOCS_URL} for the correct setup.`);
            logger.debug(err);
            return undefined;
        }
        if (isGithubPermissionsError(err)) {
            // https://docs.github.com/en/rest/overview/permissions-required-for-github-apps?apiVersion=2022-11-28#repository-permissions-for-actions
            const detailedError = getDetailedGitHubPermissionsError(err, {
                operation: "trigger_workflow"});
            logger.error(`Missing permission to trigger a workflow run on the base branch (${ref}).` +
                ` Visual snapshots of the new flows will be taken, but no comparisons will be made.\n\n${detailedError}`);
            logger.debug(err);
            return undefined;
        }
        logger.error(`Could not trigger a workflow run on commit ${shortSha(commitSha)} of the base branch (${ref}) to compare against.` +
            ` Visual snapshots of the new flows will be taken, but no comparisons will be made.` +
            ` Please check that Meticulous is running on the ${ref} branch, that it has a 'workflow_dispatch' trigger, and has the appropiate permissions.` +
            ` See ${DOCS_URL} for the correct setup.`, err);
        return undefined;
    }
    // Wait before listing again
    await delay(LISTING_AFTER_DISPATCH_DELAY);
    const newRun = await getPendingWorkflowRun({
        owner,
        repo,
        workflowId,
        commitSha,
        octokit,
        logger,
    });
    return newRun;
};
const waitForWorkflowCompletion = async ({ owner, repo, workflowRunId, octokit, timeout, isCancelled, logger, }) => {
    let workflowRun = null;
    const start = luxon.DateTime.now();
    while ((workflowRun == null || isPendingStatus(workflowRun.status)) &&
        luxon.DateTime.now().diff(start) < timeout) {
        if (isCancelled())
            return null;
        const workflowRunResult = await octokit.rest.actions.getWorkflowRun({
            owner,
            repo,
            run_id: workflowRunId,
        });
        workflowRun = workflowRunResult.data;
        logger.debug(JSON.stringify({
            id: workflowRun.id,
            status: workflowRun.status,
            conclusion: workflowRun.conclusion,
        }, null, 2));
        // Wait before listing again
        await delay(WORKFLOW_RUN_UPDATE_STATUS_INTERVAL);
    }
    return workflowRun;
};
/**
 * Searches for a pending workflow in the commit passed in or one of it's parents
 * within the last hour.
 */
const getPendingWorkflowRun = async ({ owner, repo, workflowId, commitSha, octokit, logger, }) => {
    try {
        const since = luxon.DateTime.utc()
            .minus(WORKFLOW_RUN_SEARCH_COMMIT_INTERVAL)
            .toFormat(GITHUB_DATE_FORMAT);
        const commitResponses = octokit.paginate.iterator(octokit.rest.repos.listCommits, {
            owner,
            repo,
            per_page: 100,
            sha: commitSha,
            since,
        });
        const commits = [];
        for await (const commitResponse of commitResponses) {
            commits.push(...commitResponse.data);
            if (commits.length >= MAX_COMMITS_TO_SEARCH)
                break;
        }
        const workflowRunsResponses = octokit.paginate.iterator(octokit.rest.actions.listWorkflowRuns, {
            owner,
            repo,
            workflow_id: workflowId,
            per_page: 100,
            created: `>${since}`,
        });
        const workflowRuns = [];
        for await (const workflowRunResponse of workflowRunsResponses) {
            workflowRuns.push(...workflowRunResponse.data);
            if (workflowRuns.length >= MAX_WORKFLOW_RUNS_TO_SEARCH)
                break;
        }
        let shaToCheck = commitSha;
        while (shaToCheck) {
            const workflowRunsForCommit = workflowRuns.filter(
            // Note we ignore runs on PR events because these are actually running on the temporary
            // merge commit created by GitHub so they are not useable for comparisons.
            (run) => run.head_sha === shaToCheck && run.event !== "pull_request");
            if (workflowRunsForCommit.length > 0) {
                // We've found a commit that we ran on. If there's a pending run, return it.
                // In any case we can stop searching.
                const pendingRun = workflowRunsForCommit.find((run) => isPendingStatus(run.status));
                if (pendingRun) {
                    return {
                        ...pendingRun,
                        workflowRunId: pendingRun.id,
                    };
                }
                return undefined;
            }
            // If we don't find a workflow on the commit passed in, we search through the parents as the
            // workflow may be selectively executed. Note we _always_ check the commit passed in first,
            // which may be one that's older than an hour ago but that we just triggered a workflow on.
            const commit = commits.find((c) => c.sha === shaToCheck);
            if (!commit) {
                // This must mean the commit is older than an hour ago, so we can stop searching.
                return undefined;
            }
            if (commit.parents.length === 0) {
                // We've reached the root commit, so we can stop searching.
                return undefined;
            }
            shaToCheck = commit.parents[0].sha;
        }
        return undefined;
    }
    catch (err) {
        logger.warn(`Encountered an error while searching for a pending workflow run: ${err}`);
        return undefined;
    }
};
const isPendingStatus = (status) => {
    return ["in_progress", "queued", "requested", "waiting"].some((pending) => pending === status);
};
const delay = async (delay) => {
    return new Promise((resolve) => setTimeout(resolve, delay.toMillis()));
};

const WORKFLOW_RUN_COMPLETION_TIMEOUT_ON_PULL_REQUEST = luxon.Duration.fromObject({
    minutes: 30,
});
luxon.Duration.fromObject({
    minutes: 10,
});
const POLL_FOR_BASE_TEST_RUN_INTERVAL = luxon.Duration.fromObject({
    seconds: 10,
});
const tryTriggerTestsWorkflowOnBase = async (opts) => {
    let isDone = false;
    const isCancelled = () => {
        return isDone;
    };
    const workflowRunPromise = waitOnWorkflowRun(opts, isCancelled);
    if (!opts.getBaseTestRun) {
        return workflowRunPromise;
    }
    const baseTestRunPromise = waitOnBaseTestRun(opts.getBaseTestRun, isCancelled);
    const result = await Promise.race([workflowRunPromise, baseTestRunPromise]);
    isDone = true;
    return result;
};
const waitOnWorkflowRun = async (opts, isCancelled) => {
    const { logger, event, base, context, octokit } = opts;
    const { owner, repo } = context.repo;
    const { workflowId } = await getCurrentWorkflowId({ context, octokit });
    const alreadyPending = await getPendingWorkflowRun({
        owner,
        repo,
        workflowId,
        commitSha: base,
        octokit,
        logger,
    });
    if (alreadyPending != null) {
        logger.info(`Waiting on workflow run on base commit (${base}) to compare against: ${alreadyPending.html_url}`);
        if (event.type === "pull_request") {
            await waitForWorkflowCompletionAndThrowIfFailed({
                owner,
                repo,
                workflowRunId: alreadyPending.workflowRunId,
                octokit,
                commitSha: base,
                timeout: WORKFLOW_RUN_COMPLETION_TIMEOUT_ON_PULL_REQUEST,
                isCancelled,
                logger,
            });
            return { baseTestRunExists: true };
        }
        // If we are not a PR event, then it's unlikely anyone will be looking at the comparisons. However,
        // it is very possible that someone is waiting for _us_ to complete. So let's not delay the workflow
        // and let's proceed without a base test run, skipping comparisons.
        return { baseTestRunExists: false };
    }
    // Running missing tests on base is only supported for Pull Request events
    if (event.type !== "pull_request") {
        return { baseTestRunExists: false };
    }
    // We can only trigger a workflow_run against the head of the base branch
    // This will give some spurious diffs if it's different from `base`, but it's the best we can do
    const baseRef = event.payload.pull_request.base.ref;
    logger.debug(JSON.stringify({ base, baseRef }, null, 2));
    const currentBaseSha = await getHeadCommitForRef({
        owner,
        repo,
        ref: baseRef,
        octokit,
        logger,
    });
    logger.debug(JSON.stringify({ owner, repo, base, baseRef, currentBaseSha }, null, 2));
    if (base !== currentBaseSha) {
        const message = `Meticulous tests on base commit ${base} haven't started running so we have nothing to compare against.
    In addition we were not able to trigger a run on ${base} since the '${baseRef}' branch is now pointing to ${currentBaseSha}.
    Therefore no diffs will be reported for this run. Re-running the tests may fix this.`;
        logger.warn(message);
        core.warning(message);
        return { baseTestRunExists: false };
    }
    const workflowRun = await startNewWorkflowRun({
        owner,
        repo,
        workflowId,
        ref: baseRef,
        commitSha: base,
        octokit,
        logger,
    });
    if (workflowRun == null) {
        const message = `Warning: Could not retrieve dispatched workflow run. Will not perform diffs against ${base}.`;
        logger.warn(message);
        core.warning(message);
        return { baseTestRunExists: false };
    }
    logger.info(`Waiting on workflow run: ${workflowRun.html_url}`);
    await waitForWorkflowCompletionAndThrowIfFailed({
        owner,
        repo,
        workflowRunId: workflowRun.workflowRunId,
        octokit,
        commitSha: base,
        timeout: WORKFLOW_RUN_COMPLETION_TIMEOUT_ON_PULL_REQUEST,
        isCancelled,
        logger,
    });
    return { baseTestRunExists: true };
};
const waitOnBaseTestRun = async (getBaseTestRun, isCancelled) => {
    let baseTestRun = await getBaseTestRun();
    while (!baseTestRun) {
        if (isCancelled()) {
            return { baseTestRunExists: false };
        }
        await new Promise((resolve) => setTimeout(resolve, POLL_FOR_BASE_TEST_RUN_INTERVAL.as("milliseconds")));
        baseTestRun = await getBaseTestRun();
    }
    return { baseTestRunExists: true };
};
const waitForWorkflowCompletionAndThrowIfFailed = async ({ commitSha, ...otherOpts }) => {
    const finalWorkflowRun = await waitForWorkflowCompletion(otherOpts);
    if (finalWorkflowRun == null || isPendingStatus(finalWorkflowRun.status)) {
        throw new Error(`Timed out while waiting for workflow run (${otherOpts.workflowRunId}) to complete.`);
    }
    if (finalWorkflowRun.status !== "completed" ||
        finalWorkflowRun.conclusion !== "success") {
        throw new Error(`Comparing against visual snapshots taken on ${commitSha}, but the corresponding workflow run [${finalWorkflowRun.id}] did not complete successfully. See: ${finalWorkflowRun.html_url}`);
    }
};
const getHeadCommitForRef = async ({ owner, repo, ref, octokit, logger, }) => {
    try {
        const result = await octokit.rest.repos.getBranch({
            owner,
            repo,
            branch: ref,
        });
        const commitSha = result.data.commit.sha;
        return commitSha;
    }
    catch (err) {
        if (isGithubPermissionsError(err)) {
            // https://docs.github.com/en/rest/overview/permissions-required-for-github-apps?apiVersion=2022-11-28#repository-permissions-for-contents
            const detailedError = getDetailedGitHubPermissionsError(err, {
                operation: "get_branch"});
            throw new Error(`Missing permission to get the head commit of the branch '${ref}'. This is required in order to correctly calculate the two commits to compare.\n\n${detailedError}`);
        }
        logger.error(`Unable to get head commit of branch '${ref}'. This is required in order to correctly calculate the two commits to compare. ${DEFAULT_FAILED_OCTOKIT_REQUEST_MESSAGE}`);
        throw err;
    }
};

const SHORT_SHA_LENGTH = 7;
const shortCommitSha = (sha) => sha.substring(0, SHORT_SHA_LENGTH);

const getCodeChangeEvent = (eventName, payload) => {
    if (eventName === "push") {
        return { type: "push", payload: payload };
    }
    if (eventName === "pull_request") {
        return { type: "pull_request", payload: payload };
    }
    if (eventName === "workflow_dispatch") {
        return {
            type: "workflow_dispatch",
            payload: payload,
        };
    }
    return null;
};

/**
 * Returns true if the running context is a debug PR test run.
 */
const isDebugPullRequestRun = (event) => {
    return (!!event &&
        event.type === "pull_request" &&
        event.payload.pull_request.title
            .toLowerCase()
            .includes(METICULOUS_DEBUGGING_PR_TAG));
};

const getOctokitOrFail = (githubToken) => {
    if (githubToken == null) {
        throw new Error("github-token is required");
    }
    try {
        return github.getOctokit(githubToken);
    }
    catch (err) {
        const logger = log.getLogger(common.METICULOUS_LOGGER_NAME);
        logger.error(err);
        throw new Error("Error connecting to GitHub. Did you specify a valid 'github-token'?");
    }
};

const getMeticulousCommentIdentifier = (testSuiteId) => `<!--- alwaysmeticulous/report-diffs-action/status-comment${testSuiteId ? "/" + testSuiteId : ""} -->`;
const updateStatusComment = async ({ octokit, event, owner, repo, body, shortHeadSha, testSuiteId, createIfDoesNotExist, logger, }) => {
    if (event.type !== "pull_request") {
        return;
    }
    // Check for existing comments
    try {
        const comments = await octokit.rest.issues.listComments({
            owner,
            repo,
            issue_number: event.payload.pull_request.number,
            per_page: 1000,
        });
        const commentIdentifier = getMeticulousCommentIdentifier(testSuiteId);
        const existingComment = comments.data.find((comment) => (comment.body ?? "").indexOf(commentIdentifier) > -1);
        const testSuiteDescription = testSuiteId
            ? `Test suite: ${testSuiteId}. `
            : "";
        const fullBody = `${body}\n\n<sub>${testSuiteDescription}Last updated for commit ${shortHeadSha}. This comment will update as new commits are pushed.</sub>${commentIdentifier}`;
        if (existingComment != null) {
            await octokit.rest.issues.updateComment({
                owner,
                repo,
                comment_id: existingComment.id,
                body: fullBody,
            });
        }
        else if (createIfDoesNotExist) {
            await octokit.rest.issues.createComment({
                owner,
                repo,
                issue_number: event.payload.pull_request.number,
                body: fullBody,
            });
        }
    }
    catch (err) {
        if (isGithubPermissionsError(err)) {
            // https://docs.github.com/en/rest/overview/permissions-required-for-github-apps?apiVersion=2022-11-28#repository-permissions-for-pull-requests
            const detailedError = getDetailedGitHubPermissionsError(err, {
                operation: "comment"});
            throw new Error(`Missing permission to list and post comments to the pull request #${event.payload.pull_request.number}.\n\n${detailedError}`);
        }
        logger.error(`Unable to post / update comment on PR #${event.payload.pull_request.number}. ${DEFAULT_FAILED_OCTOKIT_REQUEST_MESSAGE}`);
        throw err;
    }
};

const DEBUG_MODE_KEEP_TUNNEL_OPEN_DURATION = luxon.Duration.fromObject({
    minutes: 45,
});

const getCloudComputeBaseTestRun = async ({ apiToken, headCommitSha, }) => {
    const client$1 = client.createClient({ apiToken });
    return await client.getGitHubCloudReplayBaseTestRun({
        client: client$1,
        headCommitSha,
    });
};

const getPullRequestId = (event) => {
    if (!event || event.type !== "pull_request") {
        return null;
    }
    return event.payload.pull_request.number.toString();
};

const runOneTestRun = async ({ apiToken, appUrl, testRunId, githubToken, headSha, isSingleTestRunExecution, secureTunnelHost, proxyAllUrls, rewriteHostnameToAppUrl, }) => {
    const { payload } = github.context;
    const event = getCodeChangeEvent(github.context.eventName, payload);
    const { owner, repo } = github.context.repo;
    const pullRequestId = getPullRequestId(event);
    const isDebugPRRun = isDebugPullRequestRun(event);
    const octokit = getOctokitOrFail(githubToken);
    const logger = isSingleTestRunExecution
        ? log.getLogger(common.METICULOUS_LOGGER_NAME)
        : getPrefixedLogger(`Test Run ${testRunId}`);
    const apiClient = client.createClient({
        apiToken,
    });
    const project = await client.getProject(apiClient);
    if (!project) {
        throw new Error(`Could not retrieve project data${isSingleTestRunExecution ? "" : ` for project ${testRunId}`}. Is the API token correct?`);
    }
    logger.info(`Running tests for project ${project.organization.name}/${project.name} against app URL '${appUrl}' ${isSingleTestRunExecution ? "" : ` (test run ID ${testRunId})`}...`);
    if (event == null) {
        logger.warn(`Running report-diffs-action is only supported for 'push', \
      'pull_request' and 'workflow_dispatch' events, but was triggered \
      on a '${github.context.eventName}' event. Skipping execution.`);
        return;
    }
    // TODO: Remove me
    logger.warn("Head commit SHA: ", headSha);
    // Compute the base commit SHA to compare to for the HEAD commit.
    // This will usually be the merge base of the PR head and base commit. In some cases it can be an older main branch commit,
    // for example when running in a monorepo setup.
    const { baseCommitSha, baseTestRun } = await getCloudComputeBaseTestRun({
        apiToken,
        headCommitSha: headSha,
    });
    let shaToCompareAgainst = null;
    if (baseTestRun != null) {
        shaToCompareAgainst = baseCommitSha;
        logger.info(`Tests already exist for commit ${baseCommitSha} (${baseTestRun.id})`);
    }
    else {
        // We compute and use the base SHA from the code change event rather than the `baseCommitSha` computed above
        // as `tryTriggerTestsWorkflowOnBase` can only trigger workflow for the HEAD `main` branch commit.
        // `baseCommitSha` can be an older commit in a monorepo setup (in cases where we selectively run tests for a specific package).
        // In such cases we won't be able to trigger a workflow for the base commit SHA provided by the backend.
        // We will instead trigger test run for a newer base which is the base commit SHA from the code change event and
        // will use that as the base to compare against. This is safe as `codeChangeBase` is guaranteed to be the same
        // or newer commit to `baseCommitSha`.
        const { base: codeChangeBase } = await getBaseAndHeadCommitShas(event, {
            }, logger);
        if (codeChangeBase) {
            const { baseTestRunExists } = await tryTriggerTestsWorkflowOnBase({
                logger,
                event,
                base: codeChangeBase,
                getBaseTestRun: async () => {
                    const { baseTestRun } = await getCloudComputeBaseTestRun({
                        apiToken,
                        headCommitSha: headSha,
                    });
                    return baseTestRun;
                },
                context: github.context,
                octokit,
            });
            if (baseTestRunExists) {
                shaToCompareAgainst = codeChangeBase;
            }
        }
    }
    if (shaToCompareAgainst != null) {
        logger.info(`Comparing visual snapshots for the commit ${shortSha(headSha)}, against ${shortSha(shaToCompareAgainst)}`);
    }
    else {
        logger.info(`Generating visual snapshots for commit ${shortSha(headSha)}`);
    }
    await throwIfCannotConnectToOrigin(appUrl);
    const onTunnelCreated = ({ url, basicAuthUser, basicAuthPassword, }) => {
        logger.info(`Secure tunnel to ${appUrl} created: ${url}, user: ${basicAuthUser}, password: ${basicAuthPassword}`);
        if (isDebugPRRun) {
            updateStatusComment({
                octokit,
                event,
                owner,
                repo,
                body: `🤖 Meticulous is running in debug mode. Secure tunnel to ${appUrl} created: ${url} user: \`${basicAuthUser}\` password: \`${basicAuthPassword}\`.\n\n` +
                    `Tunnel will be live for up to ${DEBUG_MODE_KEEP_TUNNEL_OPEN_DURATION.toHuman()}. Cancel the workflow run to close the tunnel early.\n\n` +
                    `Please open this tunnel in your browser (and enter the username and password when prompted) and check that you are serving your application correctly.\n\n` +
                    `If you wish to run Meticulous tests locally against this tunnel using the Meticulous CLI then you can use the environment variables \`METICULOUS_TUNNEL_USERNAME\` and \`METICULOUS_TUNNEL_PASSWORD\`. For example:\n\n` +
                    `\`\`\`bash\n` +
                    `METICULOUS_TUNNEL_USERNAME="${basicAuthUser}" METICULOUS_TUNNEL_PASSWORD="${basicAuthPassword}" npx @alwaysmeticulous/cli simulate \\\n` +
                    `  --sessionId="<a session id to replay>" \\\n` +
                    `  --appUrl="${url}" \\\n` +
                    `  --apiToken="<your API token>"\n` +
                    `\`\`\`\n\n` +
                    `To find a test session to replay and to find your API token: visit the 'Selected Sessions' tab or 'All Sessions' tab on your [Meticulous project page](${METICULIOUS_APP_URL}), click on a session and select the 'Simulate' tab.`,
                testSuiteId: `__meticulous_debug_${testRunId}__`,
                shortHeadSha: shortCommitSha(headSha),
                createIfDoesNotExist: true,
                logger,
            }).catch((err) => {
                logger.error(err);
            });
        }
    };
    const keepTunnelOpenPromise = isDebugPRRun ? common.defer() : null;
    let keepTunnelOpenTimeout = null;
    let lastSeenNumberOfCompletedTestCases = 0;
    const onProgressUpdate = (testRun) => {
        if (!client.IN_PROGRESS_TEST_RUN_STATUS.includes(testRun.status) &&
            keepTunnelOpenPromise &&
            !keepTunnelOpenTimeout) {
            logger.info(`Test run execution completed. Keeping tunnel open for ${DEBUG_MODE_KEEP_TUNNEL_OPEN_DURATION.toHuman()}`);
            keepTunnelOpenTimeout = setTimeout(() => {
                keepTunnelOpenPromise.resolve();
            }, DEBUG_MODE_KEEP_TUNNEL_OPEN_DURATION.as("milliseconds"));
        }
        const numTestCases = testRun.configData.testCases?.length || 0;
        const completedTestCases = testRun.resultData?.results?.length || 0;
        if (completedTestCases != lastSeenNumberOfCompletedTestCases &&
            numTestCases) {
            logger.info(`Executed ${completedTestCases}/${numTestCases} test cases`);
            lastSeenNumberOfCompletedTestCases = completedTestCases;
        }
    };
    const onTunnelStillLocked = () => {
        logger.info("The test run has completed but additional tasks on the Meticulous platform are using this deployment, please keep this job running...");
    };
    const onTestRunCreated = (testRun) => {
        logger.info(`Test run created: ${testRun.url}`);
    };
    // We use MERGE_COMMIT_SHA as the deployment is created for the merge commit.
    await remoteReplayLauncher.executeRemoteTestRun({
        apiToken,
        appUrl,
        commitSha: headSha,
        environment: "github-actions",
        isLockable: true,
        proxyAllUrls,
        rewriteHostnameToAppUrl,
        onTunnelCreated,
        onTestRunCreated,
        onProgressUpdate,
        onTunnelStillLocked,
        ...(secureTunnelHost ? { secureTunnelHost } : {}),
        ...(keepTunnelOpenPromise
            ? { keepTunnelOpenPromise: keepTunnelOpenPromise.promise }
            : {}),
        ...(pullRequestId ? { pullRequestHostingProviderId: pullRequestId } : {}),
    });
};

const runMeticulousTestsCloudComputeAction = async () => {
    const logger = initLogger();
    // Init Sentry without sampling traces on the action run.
    // Children processes, (test run executions) will use
    // the global sample rate.
    await sentry.initSentry("report-diffs-action-cloud-compute-v1", 1.0);
    enrichSentryContextWithGitHubActionsContext();
    const failureMessage = await Sentry__namespace.startSpan({
        name: "report-diffs-action.runMeticulousTestsActionInCloud",
        op: "report-diffs-action.runMeticulousTestsActionInCloud",
    }, async (span) => {
        let failureMessage = "";
        const { projectTargets, headSha: headShaFromInput, githubToken, secureTunnelHost, proxyAllUrls, rewriteHostnameToAppUrl, } = getInCloudActionInputs();
        const headSha = await getHeadCommitSha({
            headShaFromInput,
            logger,
        });
        if (headSha.type === "error") {
            // We can't proceed if we don't know the commit SHA
            throw headSha.error;
        }
        const skippedTargets = projectTargets.filter((target) => target.skip);
        const projectTargetsToRun = projectTargets.filter((target) => !target.skip);
        // Single test run execution is a special case where we run a single test run with the "default" name.
        // This will be the case when the user provides `app-url` and `api-token` inputs directly.
        // This is used to simplify some of the logging and error handling.
        const isSingleTestRunExecution = projectTargets.length === 1 && projectTargets[0].name === "default";
        // Log skipped targets, if any
        if (skippedTargets.length > 0) {
            const skippedTargetNames = skippedTargets.map((target) => target.name);
            logger.info(`Skipping test runs for the following targets: ${skippedTargetNames.join(", ")}`);
        }
        (await Promise.allSettled(projectTargetsToRun.map((target) => runOneTestRun({
            testRunId: target.name,
            apiToken: target.apiToken,
            appUrl: target.appUrl,
            githubToken,
            headSha: headSha.sha,
            isSingleTestRunExecution,
            proxyAllUrls,
            rewriteHostnameToAppUrl,
            ...(secureTunnelHost ? { secureTunnelHost } : {}),
        }).catch((e) => {
            if (projectTargets.length > 1) {
                logger.error(`Failed to execute tests for ${target.name}`, e);
            }
            else {
                logger.error(e);
            }
            throw e;
        })))).forEach((result, index) => {
            if (result.status === "rejected") {
                const message = result.reason instanceof Error
                    ? result.reason.message
                    : `${result.reason}`;
                if (!isSingleTestRunExecution) {
                    failureMessage += `Test run ${projectTargetsToRun[index].name} failed: ${message}\n`;
                }
                else {
                    failureMessage = message;
                }
            }
        });
        if (failureMessage) {
            core.setFailed(failureMessage);
            span.setStatus({ code: 2, message: "unknown_error" });
            return failureMessage;
        }
        else {
            span.setStatus({ code: 1, message: "ok" });
        }
    });
    await Sentry__namespace.getClient()?.close(5000);
    process.exit(failureMessage ? 1 : 0);
};

runMeticulousTestsCloudComputeAction().catch(async (error) => {
    Sentry__namespace.captureException(error);
    const message = error instanceof Error ? error.message : `${error}`;
    core.setFailed(message);
    await Sentry__namespace.flush(5000); // Wait for Sentry to flush before exiting
    process.exit(1);
});
