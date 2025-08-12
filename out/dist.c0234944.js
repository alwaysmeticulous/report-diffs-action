// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

(function (
  modules,
  entry,
  mainEntry,
  parcelRequireName,
  externals,
  distDir,
  publicUrl,
  devServer
) {
  /* eslint-disable no-undef */
  var globalObject =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
      ? global
      : {};
  /* eslint-enable no-undef */

  // Save the require from previous bundle to this closure if any
  var previousRequire =
    typeof globalObject[parcelRequireName] === 'function' &&
    globalObject[parcelRequireName];

  var importMap = previousRequire.i || {};
  var cache = previousRequire.cache || {};
  // Do not use `require` to prevent Webpack from trying to bundle this call
  var nodeRequire =
    typeof module !== 'undefined' &&
    typeof module.require === 'function' &&
    module.require.bind(module);

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        if (externals[name]) {
          return externals[name];
        }
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire =
          typeof globalObject[parcelRequireName] === 'function' &&
          globalObject[parcelRequireName];
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error("Cannot find module '" + name + "'");
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = (cache[name] = new newRequire.Module(name));

      modules[name][0].call(
        module.exports,
        localRequire,
        module,
        module.exports,
        globalObject
      );
    }

    return cache[name].exports;

    function localRequire(x) {
      var res = localRequire.resolve(x);
      return res === false ? {} : newRequire(res);
    }

    function resolve(x) {
      var id = modules[name][1][x];
      return id != null ? id : x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.require = nodeRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.distDir = distDir;
  newRequire.publicUrl = publicUrl;
  newRequire.devServer = devServer;
  newRequire.i = importMap;
  newRequire.register = function (id, exports) {
    modules[id] = [
      function (require, module) {
        module.exports = exports;
      },
      {},
    ];
  };

  // Only insert newRequire.load when it is actually used.
  // The code in this file is linted against ES5, so dynamic import is not allowed.
  // INSERT_LOAD_HERE

  Object.defineProperty(newRequire, 'root', {
    get: function () {
      return globalObject[parcelRequireName];
    },
  });

  globalObject[parcelRequireName] = newRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (mainEntry) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(mainEntry);

    // CommonJS
    if (typeof exports === 'object' && typeof module !== 'undefined') {
      module.exports = mainExports;

      // RequireJS
    } else if (typeof define === 'function' && define.amd) {
      define(function () {
        return mainExports;
      });
    }
  }
})({"5P7PQ":[function(require,module,exports,__globalThis) {
"use strict";
var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
        enumerable: true,
        get: function() {
            return m[k];
        }
    };
    Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", {
        enumerable: true,
        value: v
    });
} : function(o, v) {
    o["default"] = v;
});
var __importStar = this && this.__importStar || function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) {
        for(var k in mod)if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        "default": mod
    };
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PacProxyAgent = void 0;
const net = __importStar(require("da731351cd0e8efe"));
const tls = __importStar(require("8eb88a0395361f1"));
const crypto = __importStar(require("ea44c93bd07ed4e5"));
const events_1 = require("a179033ed7ea8dc0");
const debug_1 = __importDefault(require("2c658063b850b2b3"));
const url_1 = require("6477c0e9e989fa76");
const agent_base_1 = require("9ce439ac4cff0a88");
const get_uri_1 = require("cb1b64cf86031003");
const pac_resolver_1 = require("99afe1a41c5e1f6c");
const quickjs_emscripten_1 = require("d94f70502224b11c");
const debug = (0, debug_1.default)('pac-proxy-agent');
const setServernameFromNonIpHost = (options)=>{
    if (options.servername === undefined && options.host && !net.isIP(options.host)) return {
        ...options,
        servername: options.host
    };
    return options;
};
/**
 * The `PacProxyAgent` class.
 *
 * A few different "protocol" modes are supported (supported protocols are
 * backed by the `get-uri` module):
 *
 *   - "pac+data", "data" - refers to an embedded "data:" URI
 *   - "pac+file", "file" - refers to a local file
 *   - "pac+ftp", "ftp" - refers to a file located on an FTP server
 *   - "pac+http", "http" - refers to an HTTP endpoint
 *   - "pac+https", "https" - refers to an HTTPS endpoint
 */ class PacProxyAgent extends agent_base_1.Agent {
    constructor(uri, opts){
        super(opts);
        this.clearResolverPromise = ()=>{
            this.resolverPromise = undefined;
        };
        // Strip the "pac+" prefix
        const uriStr = typeof uri === 'string' ? uri : uri.href;
        this.uri = new url_1.URL(uriStr.replace(/^pac\+/i, ''));
        debug('Creating PacProxyAgent with URI %o', this.uri.href);
        // @ts-expect-error Not sure why TS is complaining here…
        this.opts = {
            ...opts
        };
        this.cache = undefined;
        this.resolver = undefined;
        this.resolverHash = '';
        this.resolverPromise = undefined;
        // For `PacResolver`
        if (!this.opts.filename) this.opts.filename = this.uri.href;
    }
    /**
     * Loads the PAC proxy file from the source if necessary, and returns
     * a generated `FindProxyForURL()` resolver function to use.
     */ getResolver() {
        if (!this.resolverPromise) {
            this.resolverPromise = this.loadResolver();
            this.resolverPromise.then(this.clearResolverPromise, this.clearResolverPromise);
        }
        return this.resolverPromise;
    }
    async loadResolver() {
        try {
            // (Re)load the contents of the PAC file URI
            const [qjs, code] = await Promise.all([
                (0, quickjs_emscripten_1.getQuickJS)(),
                this.loadPacFile()
            ]);
            // Create a sha1 hash of the JS code
            const hash = crypto.createHash('sha1').update(code).digest('hex');
            if (this.resolver && this.resolverHash === hash) {
                debug('Same sha1 hash for code - contents have not changed, reusing previous proxy resolver');
                return this.resolver;
            }
            // Cache the resolver
            debug('Creating new proxy resolver instance');
            this.resolver = (0, pac_resolver_1.createPacResolver)(qjs, code, this.opts);
            // Store that sha1 hash for future comparison purposes
            this.resolverHash = hash;
            return this.resolver;
        } catch (err) {
            if (this.resolver && err.code === 'ENOTMODIFIED') {
                debug('Got ENOTMODIFIED response, reusing previous proxy resolver');
                return this.resolver;
            }
            throw err;
        }
    }
    /**
     * Loads the contents of the PAC proxy file.
     *
     * @api private
     */ async loadPacFile() {
        debug('Loading PAC file: %o', this.uri);
        const rs = await (0, get_uri_1.getUri)(this.uri, {
            ...this.opts,
            cache: this.cache
        });
        debug('Got `Readable` instance for URI');
        this.cache = rs;
        const buf = await (0, agent_base_1.toBuffer)(rs);
        debug('Read %o byte PAC file from URI', buf.length);
        return buf.toString('utf8');
    }
    /**
     * Called when the node-core HTTP client library is creating a new HTTP request.
     */ async connect(req, opts) {
        const { secureEndpoint } = opts;
        const isWebSocket = req.getHeader('upgrade') === 'websocket';
        // First, get a generated `FindProxyForURL()` function,
        // either cached or retrieved from the source
        const resolver = await this.getResolver();
        // Calculate the `url` parameter
        const protocol = secureEndpoint ? 'https:' : 'http:';
        const host = opts.host && net.isIPv6(opts.host) ? `[${opts.host}]` : opts.host;
        const defaultPort = secureEndpoint ? 443 : 80;
        const url = Object.assign(new url_1.URL(req.path, `${protocol}//${host}`), defaultPort ? undefined : {
            port: opts.port
        });
        debug('url: %s', url);
        let result = await resolver(url);
        // Default to "DIRECT" if a falsey value was returned (or nothing)
        if (!result) result = 'DIRECT';
        const proxies = String(result).trim().split(/\s*;\s*/g).filter(Boolean);
        if (this.opts.fallbackToDirect && !proxies.includes('DIRECT')) proxies.push('DIRECT');
        for (const proxy of proxies){
            let agent = null;
            let socket = null;
            const [type, target] = proxy.split(/\s+/);
            debug('Attempting to use proxy: %o', proxy);
            if (type === 'DIRECT') {
                // Direct connection to the destination endpoint
                if (secureEndpoint) socket = tls.connect(setServernameFromNonIpHost(opts));
                else socket = net.connect(opts);
            } else if (type === 'SOCKS' || type === 'SOCKS5') {
                // Use a SOCKSv5h proxy
                const { SocksProxyAgent } = await Promise.resolve().then(function() {
                    return require("a2f8f105955203d");
                }).then((res)=>__importStar(res));
                agent = new SocksProxyAgent(`socks://${target}`, this.opts);
            } else if (type === 'SOCKS4') {
                // Use a SOCKSv4a proxy
                const { SocksProxyAgent } = await Promise.resolve().then(function() {
                    return require("a2f8f105955203d");
                }).then((res)=>__importStar(res));
                agent = new SocksProxyAgent(`socks4a://${target}`, this.opts);
            } else if (type === 'PROXY' || type === 'HTTP' || type === 'HTTPS') {
                // Use an HTTP or HTTPS proxy
                // http://dev.chromium.org/developers/design-documents/secure-web-proxy
                const proxyURL = `${type === 'HTTPS' ? 'https' : 'http'}://${target}`;
                if (secureEndpoint || isWebSocket) {
                    const { HttpsProxyAgent } = await Promise.resolve().then(function() {
                        return require("f6162c094df0da98");
                    }).then((res)=>__importStar(res));
                    agent = new HttpsProxyAgent(proxyURL, this.opts);
                } else {
                    const { HttpProxyAgent } = await Promise.resolve().then(function() {
                        return require("2c9431316e1219eb");
                    }).then((res)=>__importStar(res));
                    agent = new HttpProxyAgent(proxyURL, this.opts);
                }
            }
            try {
                if (socket) {
                    // "DIRECT" connection, wait for connection confirmation
                    await (0, events_1.once)(socket, 'connect');
                    req.emit('proxy', {
                        proxy,
                        socket
                    });
                    return socket;
                }
                if (agent) {
                    const s = await agent.connect(req, opts);
                    if (!(s instanceof net.Socket)) throw new Error('Expected a `net.Socket` to be returned from agent');
                    req.emit('proxy', {
                        proxy,
                        socket: s
                    });
                    return s;
                }
                throw new Error(`Could not determine proxy type for: ${proxy}`);
            } catch (err) {
                debug('Got error for proxy %o: %o', proxy, err);
                req.emit('proxy', {
                    proxy,
                    error: err
                });
            }
        }
        throw new Error(`Failed to establish a socket connection to proxies: ${JSON.stringify(proxies)}`);
    }
}
PacProxyAgent.protocols = [
    'pac+data',
    'pac+file',
    'pac+ftp',
    'pac+http',
    'pac+https'
];
exports.PacProxyAgent = PacProxyAgent;

},{"da731351cd0e8efe":"net","8eb88a0395361f1":"tls","ea44c93bd07ed4e5":"crypto","a179033ed7ea8dc0":"events","2c658063b850b2b3":"gxWnv","6477c0e9e989fa76":"url","9ce439ac4cff0a88":"g1zH3","cb1b64cf86031003":"9F98F","99afe1a41c5e1f6c":"eeovc","d94f70502224b11c":"iBLsu","a2f8f105955203d":"8rgQX","f6162c094df0da98":"lVhzc","2c9431316e1219eb":"fpQ3G"}],"9F98F":[function(require,module,exports,__globalThis) {
"use strict";
var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        "default": mod
    };
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getUri = exports.isValidProtocol = exports.protocols = void 0;
const debug_1 = __importDefault(require("c7c06167d86c26a7"));
// Built-in protocols
const data_1 = require("769261881842f101");
const file_1 = require("8754b67407c0ab6d");
const ftp_1 = require("cd338cbb9a2fa2d8");
const http_1 = require("38477576be28aa6e");
const https_1 = require("5a73770d6e5aec9");
const debug = (0, debug_1.default)('get-uri');
exports.protocols = {
    data: data_1.data,
    file: file_1.file,
    ftp: ftp_1.ftp,
    http: http_1.http,
    https: https_1.https
};
const VALID_PROTOCOLS = new Set(Object.keys(exports.protocols));
function isValidProtocol(p) {
    return VALID_PROTOCOLS.has(p);
}
exports.isValidProtocol = isValidProtocol;
/**
 * Async function that returns a `stream.Readable` instance that will output
 * the contents of the given URI.
 *
 * For caching purposes, you can pass in a `stream` instance from a previous
 * `getUri()` call as a `cache: stream` option, and if the destination has
 * not changed since the last time the endpoint was retreived then the callback
 * will be invoked with an Error object with `code` set to "ENOTMODIFIED" and
 * `null` for the "stream" instance argument. In this case, you can skip
 * retreiving the file again and continue to use the previous payload.
 *
 * @param {String} uri URI to retrieve
 * @param {Object} opts optional "options" object
 * @api public
 */ async function getUri(uri, opts) {
    debug('getUri(%o)', uri);
    if (!uri) throw new TypeError('Must pass in a URI to "getUri()"');
    const url = typeof uri === 'string' ? new URL(uri) : uri;
    // Strip trailing `:`
    const protocol = url.protocol.replace(/:$/, '');
    if (!isValidProtocol(protocol)) throw new TypeError(`Unsupported protocol "${protocol}" specified in URI: "${uri}"`);
    const getter = exports.protocols[protocol];
    return getter(url, opts);
}
exports.getUri = getUri;

},{"c7c06167d86c26a7":"gxWnv","769261881842f101":"4OVsq","8754b67407c0ab6d":"f2CvI","cd338cbb9a2fa2d8":"ekuhZ","38477576be28aa6e":"3c3N9","5a73770d6e5aec9":"8hp7l"}],"4OVsq":[function(require,module,exports,__globalThis) {
"use strict";
var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        "default": mod
    };
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.data = void 0;
const debug_1 = __importDefault(require("a43e910f150ebeb3"));
const stream_1 = require("3d63df71d2b83292");
const crypto_1 = require("39c69750b9824ad0");
const data_uri_to_buffer_1 = require("67b7d951f15fb7ed");
const notmodified_1 = __importDefault(require("e9d1fa3e5b5bfcad"));
const debug = (0, debug_1.default)('get-uri:data');
class DataReadable extends stream_1.Readable {
    constructor(hash, buf){
        super();
        this.push(buf);
        this.push(null);
        this.hash = hash;
    }
}
/**
 * Returns a Readable stream from a "data:" URI.
 */ const data = async ({ href: uri }, { cache } = {})=>{
    // need to create a SHA1 hash of the URI string, for cacheability checks
    // in future `getUri()` calls with the same data URI passed in.
    const shasum = (0, crypto_1.createHash)('sha1');
    shasum.update(uri);
    const hash = shasum.digest('hex');
    debug('generated SHA1 hash for "data:" URI: %o', hash);
    // check if the cache is the same "data:" URI that was previously passed in.
    if (cache?.hash === hash) {
        debug('got matching cache SHA1 hash: %o', hash);
        throw new notmodified_1.default();
    } else {
        debug('creating Readable stream from "data:" URI buffer');
        const { buffer } = (0, data_uri_to_buffer_1.dataUriToBuffer)(uri);
        return new DataReadable(hash, Buffer.from(buffer));
    }
};
exports.data = data;

},{"a43e910f150ebeb3":"gxWnv","3d63df71d2b83292":"stream","39c69750b9824ad0":"crypto","67b7d951f15fb7ed":"9taCk","e9d1fa3e5b5bfcad":"6jlj1"}],"9taCk":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.dataUriToBuffer = void 0;
function base64ToArrayBuffer(base64) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const bytes = [];
    for(let i = 0; i < base64.length; i += 4){
        const idx0 = chars.indexOf(base64.charAt(i));
        const idx1 = chars.indexOf(base64.charAt(i + 1));
        const idx2 = base64.charAt(i + 2) === '=' ? 0 : chars.indexOf(base64.charAt(i + 2));
        const idx3 = base64.charAt(i + 3) === '=' ? 0 : chars.indexOf(base64.charAt(i + 3));
        const bin0 = idx0 << 2 | idx1 >> 4;
        const bin1 = (idx1 & 15) << 4 | idx2 >> 2;
        const bin2 = (idx2 & 3) << 6 | idx3;
        bytes.push(bin0);
        if (base64.charAt(i + 2) !== '=') bytes.push(bin1);
        if (base64.charAt(i + 3) !== '=') bytes.push(bin2);
    }
    const buffer = new ArrayBuffer(bytes.length);
    const view = new Uint8Array(buffer);
    view.set(bytes);
    return buffer;
}
function stringToBuffer(str) {
    // Create a buffer with length equal to the string length
    const buffer = new ArrayBuffer(str.length);
    // Create a view to manipulate the buffer content
    const view = new Uint8Array(buffer);
    // Iterate over the string and populate the buffer with ASCII codes
    for(let i = 0; i < str.length; i++)view[i] = str.charCodeAt(i);
    return buffer;
}
/**
 * Returns a `Buffer` instance from the given data URI `uri`.
 *
 * @param {String} uri Data URI to turn into a Buffer instance
 */ function dataUriToBuffer(uri) {
    uri = String(uri);
    if (!/^data:/i.test(uri)) throw new TypeError('`uri` does not appear to be a Data URI (must begin with "data:")');
    // strip newlines
    uri = uri.replace(/\r?\n/g, '');
    // split the URI up into the "metadata" and the "data" portions
    const firstComma = uri.indexOf(',');
    if (firstComma === -1 || firstComma <= 4) throw new TypeError('malformed data: URI');
    // remove the "data:" scheme and parse the metadata
    const meta = uri.substring(5, firstComma).split(';');
    let charset = '';
    let base64 = false;
    const type = meta[0] || 'text/plain';
    let typeFull = type;
    for(let i = 1; i < meta.length; i++){
        if (meta[i] === 'base64') base64 = true;
        else if (meta[i]) {
            typeFull += `;${meta[i]}`;
            if (meta[i].indexOf('charset=') === 0) charset = meta[i].substring(8);
        }
    }
    // defaults to US-ASCII only if type is not provided
    if (!meta[0] && !charset.length) {
        typeFull += ';charset=US-ASCII';
        charset = 'US-ASCII';
    }
    // get the encoded data portion and decode URI-encoded chars
    const data = unescape(uri.substring(firstComma + 1));
    const buffer = base64 ? base64ToArrayBuffer(data) : stringToBuffer(data);
    return {
        type,
        typeFull,
        charset,
        buffer
    };
}
exports.dataUriToBuffer = dataUriToBuffer;

},{}],"6jlj1":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * Error subclass to use when the source has not been modified.
 *
 * @param {String} message optional "message" property to set
 * @api protected
 */ class NotModifiedError extends Error {
    constructor(message){
        super(message || 'Source has not been modified since the provied "cache", re-use previous results');
        this.code = 'ENOTMODIFIED';
    }
}
exports.default = NotModifiedError;

},{}],"f2CvI":[function(require,module,exports,__globalThis) {
"use strict";
var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        "default": mod
    };
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.file = void 0;
const debug_1 = __importDefault(require("6487557ddcf886fd"));
const fs_1 = require("efec722a27febb58");
const fs_extra_1 = require("4be1c751c1f4e9b7");
const notfound_1 = __importDefault(require("87cb3c7a5e22caba"));
const notmodified_1 = __importDefault(require("d0b748738ec187a7"));
const url_1 = require("1dcb7b01bb7f1bf0");
const debug = (0, debug_1.default)('get-uri:file');
/**
 * Returns a `fs.ReadStream` instance from a "file:" URI.
 */ const file = async ({ href: uri }, opts = {})=>{
    const { cache, flags = 'r', mode = 438 } = opts;
    try {
        // Convert URI → Path
        const filepath = (0, url_1.fileURLToPath)(uri);
        debug('Normalized pathname: %o', filepath);
        // `open()` first to get a file descriptor and ensure that the file
        // exists.
        const fd = await (0, fs_extra_1.open)(filepath, flags, mode);
        // Now `fstat()` to check the `mtime` and store the stat object for
        // the cache.
        const stat = await (0, fs_extra_1.fstat)(fd);
        // if a `cache` was provided, check if the file has not been modified
        if (cache && cache.stat && stat && isNotModified(cache.stat, stat)) throw new notmodified_1.default();
        // `fs.ReadStream` takes care of calling `fs.close()` on the
        // fd after it's done reading
        // @ts-expect-error `@types/node` doesn't allow `null` as file path :/
        const rs = (0, fs_1.createReadStream)(null, {
            autoClose: true,
            ...opts,
            fd
        });
        rs.stat = stat;
        return rs;
    } catch (err) {
        if (err.code === 'ENOENT') throw new notfound_1.default();
        throw err;
    }
};
exports.file = file;
// returns `true` if the `mtime` of the 2 stat objects are equal
function isNotModified(prev, curr) {
    return +prev.mtime === +curr.mtime;
}

},{"6487557ddcf886fd":"gxWnv","efec722a27febb58":"fs","4be1c751c1f4e9b7":"aZiXO","87cb3c7a5e22caba":"eUnhI","d0b748738ec187a7":"6jlj1","1dcb7b01bb7f1bf0":"url"}],"aZiXO":[function(require,module,exports,__globalThis) {
'use strict';
module.exports = Object.assign({}, // Export promiseified graceful-fs:
require("69014387b12c9e7f"), // Export extra methods:
require("aa41ca993d5075d0"), require("70da8016638a544"), require("76c22f12bb933e7e"), require("2e437404ed924596"), require("a3680cc5cd0857d3"), require("f4190b9fd69bfd4f"), require("ebed698971b79fb8"), require("8db78a07904d15ea"), require("7a06dd79f3bdfd4a"), require("c68dd2febbd0f5c9"), require("cb3b88ca17d1a852"));
// Export fs.promises as a getter property so that we don't trigger
// ExperimentalWarning before fs.promises is actually accessed.
const fs = require("52624daeb8e33dd");
if (Object.getOwnPropertyDescriptor(fs, 'promises')) Object.defineProperty(module.exports, 'promises', {
    get () {
        return fs.promises;
    }
});

},{"69014387b12c9e7f":"9iAOS","aa41ca993d5075d0":"fRiU4","70da8016638a544":"fADug","76c22f12bb933e7e":"7IpQH","2e437404ed924596":"kzJN6","a3680cc5cd0857d3":"3uFKL","f4190b9fd69bfd4f":"4pS5w","ebed698971b79fb8":"kavDg","8db78a07904d15ea":"2cCXb","7a06dd79f3bdfd4a":"lUdwg","c68dd2febbd0f5c9":"cOSta","cb3b88ca17d1a852":"k1WVQ","52624daeb8e33dd":"fs"}],"9iAOS":[function(require,module,exports,__globalThis) {
'use strict';
// This is adapted from https://github.com/normalize/mz
// Copyright (c) 2014-2016 Jonathan Ong me@jongleberry.com and Contributors
const u = require("7c19d06662e592c2").fromCallback;
const fs = require("4ac8b77667314542");
const api = [
    'access',
    'appendFile',
    'chmod',
    'chown',
    'close',
    'copyFile',
    'fchmod',
    'fchown',
    'fdatasync',
    'fstat',
    'fsync',
    'ftruncate',
    'futimes',
    'lchown',
    'lchmod',
    'link',
    'lstat',
    'mkdir',
    'mkdtemp',
    'open',
    'readFile',
    'readdir',
    'readlink',
    'realpath',
    'rename',
    'rmdir',
    'stat',
    'symlink',
    'truncate',
    'unlink',
    'utimes',
    'writeFile'
].filter((key)=>{
    // Some commands are not available on some systems. Ex:
    // fs.copyFile was added in Node.js v8.5.0
    // fs.mkdtemp was added in Node.js v5.10.0
    // fs.lchown is not available on at least some Linux
    return typeof fs[key] === 'function';
});
// Export all keys:
Object.keys(fs).forEach((key)=>{
    if (key === 'promises') // fs.promises is a getter property that triggers ExperimentalWarning
    // Don't re-export it here, the getter is defined in "lib/index.js"
    return;
    exports[key] = fs[key];
});
// Universalify async methods:
api.forEach((method)=>{
    exports[method] = u(fs[method]);
});
// We differ from mz/fs in that we still ship the old, broken, fs.exists()
// since we are a drop-in replacement for the native module
exports.exists = function(filename, callback) {
    if (typeof callback === 'function') return fs.exists(filename, callback);
    return new Promise((resolve)=>{
        return fs.exists(filename, resolve);
    });
};
// fs.read() & fs.write need special treatment due to multiple callback args
exports.read = function(fd, buffer, offset, length, position, callback) {
    if (typeof callback === 'function') return fs.read(fd, buffer, offset, length, position, callback);
    return new Promise((resolve, reject)=>{
        fs.read(fd, buffer, offset, length, position, (err, bytesRead, buffer)=>{
            if (err) return reject(err);
            resolve({
                bytesRead,
                buffer
            });
        });
    });
};
// Function signature can be
// fs.write(fd, buffer[, offset[, length[, position]]], callback)
// OR
// fs.write(fd, string[, position[, encoding]], callback)
// We need to handle both cases, so we use ...args
exports.write = function(fd, buffer, ...args) {
    if (typeof args[args.length - 1] === 'function') return fs.write(fd, buffer, ...args);
    return new Promise((resolve, reject)=>{
        fs.write(fd, buffer, ...args, (err, bytesWritten, buffer)=>{
            if (err) return reject(err);
            resolve({
                bytesWritten,
                buffer
            });
        });
    });
};
// fs.realpath.native only available in Node v9.2+
if (typeof fs.realpath.native === 'function') exports.realpath.native = u(fs.realpath.native);

},{"7c19d06662e592c2":"dPfZv","4ac8b77667314542":"73PYN"}],"dPfZv":[function(require,module,exports,__globalThis) {
'use strict';
exports.fromCallback = function(fn) {
    return Object.defineProperty(function() {
        if (typeof arguments[arguments.length - 1] === 'function') fn.apply(this, arguments);
        else return new Promise((resolve, reject)=>{
            arguments[arguments.length] = (err, res)=>{
                if (err) return reject(err);
                resolve(res);
            };
            arguments.length++;
            fn.apply(this, arguments);
        });
    }, 'name', {
        value: fn.name
    });
};
exports.fromPromise = function(fn) {
    return Object.defineProperty(function() {
        const cb = arguments[arguments.length - 1];
        if (typeof cb !== 'function') return fn.apply(this, arguments);
        else fn.apply(this, arguments).then((r)=>cb(null, r), cb);
    }, 'name', {
        value: fn.name
    });
};

},{}],"73PYN":[function(require,module,exports,__globalThis) {
var fs = require("37e02d8cd9c10867");
var polyfills = require("f54b221ec5302bef");
var legacy = require("ca4f81ac78cb59d9");
var clone = require("a57695ad9d4572ae");
var util = require("ef347c61d1e006de");
/* istanbul ignore next - node 0.x polyfill */ var gracefulQueue;
var previousSymbol;
/* istanbul ignore else - node 0.x polyfill */ if (typeof Symbol === 'function' && typeof Symbol.for === 'function') {
    gracefulQueue = Symbol.for('graceful-fs.queue');
    // This is used in testing by future versions
    previousSymbol = Symbol.for('graceful-fs.previous');
} else {
    gracefulQueue = '___graceful-fs.queue';
    previousSymbol = '___graceful-fs.previous';
}
function noop() {}
function publishQueue(context, queue) {
    Object.defineProperty(context, gracefulQueue, {
        get: function() {
            return queue;
        }
    });
}
var debug = noop;
if (util.debuglog) debug = util.debuglog('gfs4');
else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || '')) debug = function() {
    var m = util.format.apply(util, arguments);
    m = 'GFS4: ' + m.split(/\n/).join('\nGFS4: ');
    console.error(m);
};
// Once time initialization
if (!fs[gracefulQueue]) {
    // This queue can be shared by multiple loaded instances
    var queue = global[gracefulQueue] || [];
    publishQueue(fs, queue);
    // Patch fs.close/closeSync to shared queue version, because we need
    // to retry() whenever a close happens *anywhere* in the program.
    // This is essential when multiple graceful-fs instances are
    // in play at the same time.
    fs.close = function(fs$close) {
        function close(fd, cb) {
            return fs$close.call(fs, fd, function(err) {
                // This function uses the graceful-fs shared queue
                if (!err) resetQueue();
                if (typeof cb === 'function') cb.apply(this, arguments);
            });
        }
        Object.defineProperty(close, previousSymbol, {
            value: fs$close
        });
        return close;
    }(fs.close);
    fs.closeSync = function(fs$closeSync) {
        function closeSync(fd) {
            // This function uses the graceful-fs shared queue
            fs$closeSync.apply(fs, arguments);
            resetQueue();
        }
        Object.defineProperty(closeSync, previousSymbol, {
            value: fs$closeSync
        });
        return closeSync;
    }(fs.closeSync);
    if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || '')) process.on('exit', function() {
        debug(fs[gracefulQueue]);
        require("e880d6802d09f570").equal(fs[gracefulQueue].length, 0);
    });
}
if (!global[gracefulQueue]) publishQueue(global, fs[gracefulQueue]);
module.exports = patch(clone(fs));
if (process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !fs.__patched) {
    module.exports = patch(fs);
    fs.__patched = true;
}
function patch(fs) {
    // Everything that references the open() function needs to be in here
    polyfills(fs);
    fs.gracefulify = patch;
    fs.createReadStream = createReadStream;
    fs.createWriteStream = createWriteStream;
    var fs$readFile = fs.readFile;
    fs.readFile = readFile;
    function readFile(path, options, cb) {
        if (typeof options === 'function') cb = options, options = null;
        return go$readFile(path, options, cb);
        function go$readFile(path, options, cb, startTime) {
            return fs$readFile(path, options, function(err) {
                if (err && (err.code === 'EMFILE' || err.code === 'ENFILE')) enqueue([
                    go$readFile,
                    [
                        path,
                        options,
                        cb
                    ],
                    err,
                    startTime || Date.now(),
                    Date.now()
                ]);
                else if (typeof cb === 'function') cb.apply(this, arguments);
            });
        }
    }
    var fs$writeFile = fs.writeFile;
    fs.writeFile = writeFile;
    function writeFile(path, data, options, cb) {
        if (typeof options === 'function') cb = options, options = null;
        return go$writeFile(path, data, options, cb);
        function go$writeFile(path, data, options, cb, startTime) {
            return fs$writeFile(path, data, options, function(err) {
                if (err && (err.code === 'EMFILE' || err.code === 'ENFILE')) enqueue([
                    go$writeFile,
                    [
                        path,
                        data,
                        options,
                        cb
                    ],
                    err,
                    startTime || Date.now(),
                    Date.now()
                ]);
                else if (typeof cb === 'function') cb.apply(this, arguments);
            });
        }
    }
    var fs$appendFile = fs.appendFile;
    if (fs$appendFile) fs.appendFile = appendFile;
    function appendFile(path, data, options, cb) {
        if (typeof options === 'function') cb = options, options = null;
        return go$appendFile(path, data, options, cb);
        function go$appendFile(path, data, options, cb, startTime) {
            return fs$appendFile(path, data, options, function(err) {
                if (err && (err.code === 'EMFILE' || err.code === 'ENFILE')) enqueue([
                    go$appendFile,
                    [
                        path,
                        data,
                        options,
                        cb
                    ],
                    err,
                    startTime || Date.now(),
                    Date.now()
                ]);
                else if (typeof cb === 'function') cb.apply(this, arguments);
            });
        }
    }
    var fs$copyFile = fs.copyFile;
    if (fs$copyFile) fs.copyFile = copyFile;
    function copyFile(src, dest, flags, cb) {
        if (typeof flags === 'function') {
            cb = flags;
            flags = 0;
        }
        return go$copyFile(src, dest, flags, cb);
        function go$copyFile(src, dest, flags, cb, startTime) {
            return fs$copyFile(src, dest, flags, function(err) {
                if (err && (err.code === 'EMFILE' || err.code === 'ENFILE')) enqueue([
                    go$copyFile,
                    [
                        src,
                        dest,
                        flags,
                        cb
                    ],
                    err,
                    startTime || Date.now(),
                    Date.now()
                ]);
                else if (typeof cb === 'function') cb.apply(this, arguments);
            });
        }
    }
    var fs$readdir = fs.readdir;
    fs.readdir = readdir;
    var noReaddirOptionVersions = /^v[0-5]\./;
    function readdir(path, options, cb) {
        if (typeof options === 'function') cb = options, options = null;
        var go$readdir = noReaddirOptionVersions.test(process.version) ? function go$readdir(path, options, cb, startTime) {
            return fs$readdir(path, fs$readdirCallback(path, options, cb, startTime));
        } : function go$readdir(path, options, cb, startTime) {
            return fs$readdir(path, options, fs$readdirCallback(path, options, cb, startTime));
        };
        return go$readdir(path, options, cb);
        function fs$readdirCallback(path, options, cb, startTime) {
            return function(err, files) {
                if (err && (err.code === 'EMFILE' || err.code === 'ENFILE')) enqueue([
                    go$readdir,
                    [
                        path,
                        options,
                        cb
                    ],
                    err,
                    startTime || Date.now(),
                    Date.now()
                ]);
                else {
                    if (files && files.sort) files.sort();
                    if (typeof cb === 'function') cb.call(this, err, files);
                }
            };
        }
    }
    if (process.version.substr(0, 4) === 'v0.8') {
        var legStreams = legacy(fs);
        ReadStream = legStreams.ReadStream;
        WriteStream = legStreams.WriteStream;
    }
    var fs$ReadStream = fs.ReadStream;
    if (fs$ReadStream) {
        ReadStream.prototype = Object.create(fs$ReadStream.prototype);
        ReadStream.prototype.open = ReadStream$open;
    }
    var fs$WriteStream = fs.WriteStream;
    if (fs$WriteStream) {
        WriteStream.prototype = Object.create(fs$WriteStream.prototype);
        WriteStream.prototype.open = WriteStream$open;
    }
    Object.defineProperty(fs, 'ReadStream', {
        get: function() {
            return ReadStream;
        },
        set: function(val) {
            ReadStream = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(fs, 'WriteStream', {
        get: function() {
            return WriteStream;
        },
        set: function(val) {
            WriteStream = val;
        },
        enumerable: true,
        configurable: true
    });
    // legacy names
    var FileReadStream = ReadStream;
    Object.defineProperty(fs, 'FileReadStream', {
        get: function() {
            return FileReadStream;
        },
        set: function(val) {
            FileReadStream = val;
        },
        enumerable: true,
        configurable: true
    });
    var FileWriteStream = WriteStream;
    Object.defineProperty(fs, 'FileWriteStream', {
        get: function() {
            return FileWriteStream;
        },
        set: function(val) {
            FileWriteStream = val;
        },
        enumerable: true,
        configurable: true
    });
    function ReadStream(path, options) {
        if (this instanceof ReadStream) return fs$ReadStream.apply(this, arguments), this;
        else return ReadStream.apply(Object.create(ReadStream.prototype), arguments);
    }
    function ReadStream$open() {
        var that = this;
        open(that.path, that.flags, that.mode, function(err, fd) {
            if (err) {
                if (that.autoClose) that.destroy();
                that.emit('error', err);
            } else {
                that.fd = fd;
                that.emit('open', fd);
                that.read();
            }
        });
    }
    function WriteStream(path, options) {
        if (this instanceof WriteStream) return fs$WriteStream.apply(this, arguments), this;
        else return WriteStream.apply(Object.create(WriteStream.prototype), arguments);
    }
    function WriteStream$open() {
        var that = this;
        open(that.path, that.flags, that.mode, function(err, fd) {
            if (err) {
                that.destroy();
                that.emit('error', err);
            } else {
                that.fd = fd;
                that.emit('open', fd);
            }
        });
    }
    function createReadStream(path, options) {
        return new fs.ReadStream(path, options);
    }
    function createWriteStream(path, options) {
        return new fs.WriteStream(path, options);
    }
    var fs$open = fs.open;
    fs.open = open;
    function open(path, flags, mode, cb) {
        if (typeof mode === 'function') cb = mode, mode = null;
        return go$open(path, flags, mode, cb);
        function go$open(path, flags, mode, cb, startTime) {
            return fs$open(path, flags, mode, function(err, fd) {
                if (err && (err.code === 'EMFILE' || err.code === 'ENFILE')) enqueue([
                    go$open,
                    [
                        path,
                        flags,
                        mode,
                        cb
                    ],
                    err,
                    startTime || Date.now(),
                    Date.now()
                ]);
                else if (typeof cb === 'function') cb.apply(this, arguments);
            });
        }
    }
    return fs;
}
function enqueue(elem) {
    debug('ENQUEUE', elem[0].name, elem[1]);
    fs[gracefulQueue].push(elem);
    retry();
}
// keep track of the timeout between retry() calls
var retryTimer;
// reset the startTime and lastTime to now
// this resets the start of the 60 second overall timeout as well as the
// delay between attempts so that we'll retry these jobs sooner
function resetQueue() {
    var now = Date.now();
    for(var i = 0; i < fs[gracefulQueue].length; ++i)// entries that are only a length of 2 are from an older version, don't
    // bother modifying those since they'll be retried anyway.
    if (fs[gracefulQueue][i].length > 2) {
        fs[gracefulQueue][i][3] = now // startTime
        ;
        fs[gracefulQueue][i][4] = now // lastTime
        ;
    }
    // call retry to make sure we're actively processing the queue
    retry();
}
function retry() {
    // clear the timer and remove it to help prevent unintended concurrency
    clearTimeout(retryTimer);
    retryTimer = undefined;
    if (fs[gracefulQueue].length === 0) return;
    var elem = fs[gracefulQueue].shift();
    var fn = elem[0];
    var args = elem[1];
    // these items may be unset if they were added by an older graceful-fs
    var err = elem[2];
    var startTime = elem[3];
    var lastTime = elem[4];
    // if we don't have a startTime we have no way of knowing if we've waited
    // long enough, so go ahead and retry this item now
    if (startTime === undefined) {
        debug('RETRY', fn.name, args);
        fn.apply(null, args);
    } else if (Date.now() - startTime >= 60000) {
        // it's been more than 60 seconds total, bail now
        debug('TIMEOUT', fn.name, args);
        var cb = args.pop();
        if (typeof cb === 'function') cb.call(null, err);
    } else {
        // the amount of time between the last attempt and right now
        var sinceAttempt = Date.now() - lastTime;
        // the amount of time between when we first tried, and when we last tried
        // rounded up to at least 1
        var sinceStart = Math.max(lastTime - startTime, 1);
        // backoff. wait longer than the total time we've been retrying, but only
        // up to a maximum of 100ms
        var desiredDelay = Math.min(sinceStart * 1.2, 100);
        // it's been long enough since the last retry, do it again
        if (sinceAttempt >= desiredDelay) {
            debug('RETRY', fn.name, args);
            fn.apply(null, args.concat([
                startTime
            ]));
        } else // if we can't do this job yet, push it to the end of the queue
        // and let the next iteration check again
        fs[gracefulQueue].push(elem);
    }
    // schedule our next run if one isn't already scheduled
    if (retryTimer === undefined) retryTimer = setTimeout(retry, 0);
}

},{"37e02d8cd9c10867":"fs","f54b221ec5302bef":"3jKlp","ca4f81ac78cb59d9":"dEOr9","a57695ad9d4572ae":"l9TyI","ef347c61d1e006de":"util","e880d6802d09f570":"assert"}],"3jKlp":[function(require,module,exports,__globalThis) {
var constants = require("15203e2a9f56adec");
var origCwd = process.cwd;
var cwd = null;
var platform = process.env.GRACEFUL_FS_PLATFORM || process.platform;
process.cwd = function() {
    if (!cwd) cwd = origCwd.call(process);
    return cwd;
};
try {
    process.cwd();
} catch (er) {}
// This check is needed until node.js 12 is required
if (typeof process.chdir === 'function') {
    var chdir = process.chdir;
    process.chdir = function(d) {
        cwd = null;
        chdir.call(process, d);
    };
    if (Object.setPrototypeOf) Object.setPrototypeOf(process.chdir, chdir);
}
module.exports = patch;
function patch(fs) {
    // (re-)implement some things that are known busted or missing.
    // lchmod, broken prior to 0.6.2
    // back-port the fix here.
    if (constants.hasOwnProperty('O_SYMLINK') && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./)) patchLchmod(fs);
    // lutimes implementation, or no-op
    if (!fs.lutimes) patchLutimes(fs);
    // https://github.com/isaacs/node-graceful-fs/issues/4
    // Chown should not fail on einval or eperm if non-root.
    // It should not fail on enosys ever, as this just indicates
    // that a fs doesn't support the intended operation.
    fs.chown = chownFix(fs.chown);
    fs.fchown = chownFix(fs.fchown);
    fs.lchown = chownFix(fs.lchown);
    fs.chmod = chmodFix(fs.chmod);
    fs.fchmod = chmodFix(fs.fchmod);
    fs.lchmod = chmodFix(fs.lchmod);
    fs.chownSync = chownFixSync(fs.chownSync);
    fs.fchownSync = chownFixSync(fs.fchownSync);
    fs.lchownSync = chownFixSync(fs.lchownSync);
    fs.chmodSync = chmodFixSync(fs.chmodSync);
    fs.fchmodSync = chmodFixSync(fs.fchmodSync);
    fs.lchmodSync = chmodFixSync(fs.lchmodSync);
    fs.stat = statFix(fs.stat);
    fs.fstat = statFix(fs.fstat);
    fs.lstat = statFix(fs.lstat);
    fs.statSync = statFixSync(fs.statSync);
    fs.fstatSync = statFixSync(fs.fstatSync);
    fs.lstatSync = statFixSync(fs.lstatSync);
    // if lchmod/lchown do not exist, then make them no-ops
    if (fs.chmod && !fs.lchmod) {
        fs.lchmod = function(path, mode, cb) {
            if (cb) process.nextTick(cb);
        };
        fs.lchmodSync = function() {};
    }
    if (fs.chown && !fs.lchown) {
        fs.lchown = function(path, uid, gid, cb) {
            if (cb) process.nextTick(cb);
        };
        fs.lchownSync = function() {};
    }
    // on Windows, A/V software can lock the directory, causing this
    // to fail with an EACCES or EPERM if the directory contains newly
    // created files.  Try again on failure, for up to 60 seconds.
    // Set the timeout this long because some Windows Anti-Virus, such as Parity
    // bit9, may lock files for up to a minute, causing npm package install
    // failures. Also, take care to yield the scheduler. Windows scheduling gives
    // CPU to a busy looping process, which can cause the program causing the lock
    // contention to be starved of CPU by node, so the contention doesn't resolve.
    if (platform === "win32") fs.rename = typeof fs.rename !== 'function' ? fs.rename : function(fs$rename) {
        function rename(from, to, cb) {
            var start = Date.now();
            var backoff = 0;
            fs$rename(from, to, function CB(er) {
                if (er && (er.code === "EACCES" || er.code === "EPERM" || er.code === "EBUSY") && Date.now() - start < 60000) {
                    setTimeout(function() {
                        fs.stat(to, function(stater, st) {
                            if (stater && stater.code === "ENOENT") fs$rename(from, to, CB);
                            else cb(er);
                        });
                    }, backoff);
                    if (backoff < 100) backoff += 10;
                    return;
                }
                if (cb) cb(er);
            });
        }
        if (Object.setPrototypeOf) Object.setPrototypeOf(rename, fs$rename);
        return rename;
    }(fs.rename);
    // if read() returns EAGAIN, then just try it again.
    fs.read = typeof fs.read !== 'function' ? fs.read : function(fs$read) {
        function read(fd, buffer, offset, length, position, callback_) {
            var callback;
            if (callback_ && typeof callback_ === 'function') {
                var eagCounter = 0;
                callback = function(er, _, __) {
                    if (er && er.code === 'EAGAIN' && eagCounter < 10) {
                        eagCounter++;
                        return fs$read.call(fs, fd, buffer, offset, length, position, callback);
                    }
                    callback_.apply(this, arguments);
                };
            }
            return fs$read.call(fs, fd, buffer, offset, length, position, callback);
        }
        // This ensures `util.promisify` works as it does for native `fs.read`.
        if (Object.setPrototypeOf) Object.setPrototypeOf(read, fs$read);
        return read;
    }(fs.read);
    fs.readSync = typeof fs.readSync !== 'function' ? fs.readSync : function(fs$readSync) {
        return function(fd, buffer, offset, length, position) {
            var eagCounter = 0;
            while(true)try {
                return fs$readSync.call(fs, fd, buffer, offset, length, position);
            } catch (er) {
                if (er.code === 'EAGAIN' && eagCounter < 10) {
                    eagCounter++;
                    continue;
                }
                throw er;
            }
        };
    }(fs.readSync);
    function patchLchmod(fs) {
        fs.lchmod = function(path, mode, callback) {
            fs.open(path, constants.O_WRONLY | constants.O_SYMLINK, mode, function(err, fd) {
                if (err) {
                    if (callback) callback(err);
                    return;
                }
                // prefer to return the chmod error, if one occurs,
                // but still try to close, and report closing errors if they occur.
                fs.fchmod(fd, mode, function(err) {
                    fs.close(fd, function(err2) {
                        if (callback) callback(err || err2);
                    });
                });
            });
        };
        fs.lchmodSync = function(path, mode) {
            var fd = fs.openSync(path, constants.O_WRONLY | constants.O_SYMLINK, mode);
            // prefer to return the chmod error, if one occurs,
            // but still try to close, and report closing errors if they occur.
            var threw = true;
            var ret;
            try {
                ret = fs.fchmodSync(fd, mode);
                threw = false;
            } finally{
                if (threw) try {
                    fs.closeSync(fd);
                } catch (er) {}
                else fs.closeSync(fd);
            }
            return ret;
        };
    }
    function patchLutimes(fs) {
        if (constants.hasOwnProperty("O_SYMLINK") && fs.futimes) {
            fs.lutimes = function(path, at, mt, cb) {
                fs.open(path, constants.O_SYMLINK, function(er, fd) {
                    if (er) {
                        if (cb) cb(er);
                        return;
                    }
                    fs.futimes(fd, at, mt, function(er) {
                        fs.close(fd, function(er2) {
                            if (cb) cb(er || er2);
                        });
                    });
                });
            };
            fs.lutimesSync = function(path, at, mt) {
                var fd = fs.openSync(path, constants.O_SYMLINK);
                var ret;
                var threw = true;
                try {
                    ret = fs.futimesSync(fd, at, mt);
                    threw = false;
                } finally{
                    if (threw) try {
                        fs.closeSync(fd);
                    } catch (er) {}
                    else fs.closeSync(fd);
                }
                return ret;
            };
        } else if (fs.futimes) {
            fs.lutimes = function(_a, _b, _c, cb) {
                if (cb) process.nextTick(cb);
            };
            fs.lutimesSync = function() {};
        }
    }
    function chmodFix(orig) {
        if (!orig) return orig;
        return function(target, mode, cb) {
            return orig.call(fs, target, mode, function(er) {
                if (chownErOk(er)) er = null;
                if (cb) cb.apply(this, arguments);
            });
        };
    }
    function chmodFixSync(orig) {
        if (!orig) return orig;
        return function(target, mode) {
            try {
                return orig.call(fs, target, mode);
            } catch (er) {
                if (!chownErOk(er)) throw er;
            }
        };
    }
    function chownFix(orig) {
        if (!orig) return orig;
        return function(target, uid, gid, cb) {
            return orig.call(fs, target, uid, gid, function(er) {
                if (chownErOk(er)) er = null;
                if (cb) cb.apply(this, arguments);
            });
        };
    }
    function chownFixSync(orig) {
        if (!orig) return orig;
        return function(target, uid, gid) {
            try {
                return orig.call(fs, target, uid, gid);
            } catch (er) {
                if (!chownErOk(er)) throw er;
            }
        };
    }
    function statFix(orig) {
        if (!orig) return orig;
        // Older versions of Node erroneously returned signed integers for
        // uid + gid.
        return function(target, options, cb) {
            if (typeof options === 'function') {
                cb = options;
                options = null;
            }
            function callback(er, stats) {
                if (stats) {
                    if (stats.uid < 0) stats.uid += 0x100000000;
                    if (stats.gid < 0) stats.gid += 0x100000000;
                }
                if (cb) cb.apply(this, arguments);
            }
            return options ? orig.call(fs, target, options, callback) : orig.call(fs, target, callback);
        };
    }
    function statFixSync(orig) {
        if (!orig) return orig;
        // Older versions of Node erroneously returned signed integers for
        // uid + gid.
        return function(target, options) {
            var stats = options ? orig.call(fs, target, options) : orig.call(fs, target);
            if (stats) {
                if (stats.uid < 0) stats.uid += 0x100000000;
                if (stats.gid < 0) stats.gid += 0x100000000;
            }
            return stats;
        };
    }
    // ENOSYS means that the fs doesn't support the op. Just ignore
    // that, because it doesn't matter.
    //
    // if there's no getuid, or if getuid() is something other
    // than 0, and the error is EINVAL or EPERM, then just ignore
    // it.
    //
    // This specific case is a silent failure in cp, install, tar,
    // and most other unix tools that manage permissions.
    //
    // When running as root, or if other types of errors are
    // encountered, then it's strict.
    function chownErOk(er) {
        if (!er) return true;
        if (er.code === "ENOSYS") return true;
        var nonroot = !process.getuid || process.getuid() !== 0;
        if (nonroot) {
            if (er.code === "EINVAL" || er.code === "EPERM") return true;
        }
        return false;
    }
}

},{"15203e2a9f56adec":"constants"}],"dEOr9":[function(require,module,exports,__globalThis) {
var Stream = require("5c2a0c34136d004d").Stream;
module.exports = legacy;
function legacy(fs) {
    return {
        ReadStream: ReadStream,
        WriteStream: WriteStream
    };
    function ReadStream(path, options) {
        if (!(this instanceof ReadStream)) return new ReadStream(path, options);
        Stream.call(this);
        var self = this;
        this.path = path;
        this.fd = null;
        this.readable = true;
        this.paused = false;
        this.flags = 'r';
        this.mode = 438; /*=0666*/ 
        this.bufferSize = 65536;
        options = options || {};
        // Mixin options into this
        var keys = Object.keys(options);
        for(var index = 0, length = keys.length; index < length; index++){
            var key = keys[index];
            this[key] = options[key];
        }
        if (this.encoding) this.setEncoding(this.encoding);
        if (this.start !== undefined) {
            if ('number' !== typeof this.start) throw TypeError('start must be a Number');
            if (this.end === undefined) this.end = Infinity;
            else if ('number' !== typeof this.end) throw TypeError('end must be a Number');
            if (this.start > this.end) throw new Error('start must be <= end');
            this.pos = this.start;
        }
        if (this.fd !== null) {
            process.nextTick(function() {
                self._read();
            });
            return;
        }
        fs.open(this.path, this.flags, this.mode, function(err, fd) {
            if (err) {
                self.emit('error', err);
                self.readable = false;
                return;
            }
            self.fd = fd;
            self.emit('open', fd);
            self._read();
        });
    }
    function WriteStream(path, options) {
        if (!(this instanceof WriteStream)) return new WriteStream(path, options);
        Stream.call(this);
        this.path = path;
        this.fd = null;
        this.writable = true;
        this.flags = 'w';
        this.encoding = 'binary';
        this.mode = 438; /*=0666*/ 
        this.bytesWritten = 0;
        options = options || {};
        // Mixin options into this
        var keys = Object.keys(options);
        for(var index = 0, length = keys.length; index < length; index++){
            var key = keys[index];
            this[key] = options[key];
        }
        if (this.start !== undefined) {
            if ('number' !== typeof this.start) throw TypeError('start must be a Number');
            if (this.start < 0) throw new Error('start must be >= zero');
            this.pos = this.start;
        }
        this.busy = false;
        this._queue = [];
        if (this.fd === null) {
            this._open = fs.open;
            this._queue.push([
                this._open,
                this.path,
                this.flags,
                this.mode,
                undefined
            ]);
            this.flush();
        }
    }
}

},{"5c2a0c34136d004d":"stream"}],"l9TyI":[function(require,module,exports,__globalThis) {
'use strict';
module.exports = clone;
var getPrototypeOf = Object.getPrototypeOf || function(obj) {
    return obj.__proto__;
};
function clone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Object) var copy = {
        __proto__: getPrototypeOf(obj)
    };
    else var copy = Object.create(null);
    Object.getOwnPropertyNames(obj).forEach(function(key) {
        Object.defineProperty(copy, key, Object.getOwnPropertyDescriptor(obj, key));
    });
    return copy;
}

},{}],"fRiU4":[function(require,module,exports,__globalThis) {
'use strict';
module.exports = {
    copySync: require("118f445d7f26c757")
};

},{"118f445d7f26c757":"isBu7"}],"isBu7":[function(require,module,exports,__globalThis) {
'use strict';
const fs = require("16dcd2026ceb196f");
const path = require("adc26afc911987a2");
const mkdirpSync = require("b21e5f5c2cdfdd39").mkdirsSync;
const utimesSync = require("33cb26a330022b8").utimesMillisSync;
const stat = require("abfccea2b76993b");
function copySync(src, dest, opts) {
    if (typeof opts === 'function') opts = {
        filter: opts
    };
    opts = opts || {};
    opts.clobber = 'clobber' in opts ? !!opts.clobber : true // default to true for now
    ;
    opts.overwrite = 'overwrite' in opts ? !!opts.overwrite : opts.clobber // overwrite falls back to clobber
    ;
    // Warn about using preserveTimestamps on 32-bit node
    if (opts.preserveTimestamps && process.arch === 'ia32') console.warn(`fs-extra: Using the preserveTimestamps option in 32-bit node is not recommended;\n
    see https://github.com/jprichardson/node-fs-extra/issues/269`);
    const { srcStat, destStat } = stat.checkPathsSync(src, dest, 'copy');
    stat.checkParentPathsSync(src, srcStat, dest, 'copy');
    return handleFilterAndCopy(destStat, src, dest, opts);
}
function handleFilterAndCopy(destStat, src, dest, opts) {
    if (opts.filter && !opts.filter(src, dest)) return;
    const destParent = path.dirname(dest);
    if (!fs.existsSync(destParent)) mkdirpSync(destParent);
    return startCopy(destStat, src, dest, opts);
}
function startCopy(destStat, src, dest, opts) {
    if (opts.filter && !opts.filter(src, dest)) return;
    return getStats(destStat, src, dest, opts);
}
function getStats(destStat, src, dest, opts) {
    const statSync = opts.dereference ? fs.statSync : fs.lstatSync;
    const srcStat = statSync(src);
    if (srcStat.isDirectory()) return onDir(srcStat, destStat, src, dest, opts);
    else if (srcStat.isFile() || srcStat.isCharacterDevice() || srcStat.isBlockDevice()) return onFile(srcStat, destStat, src, dest, opts);
    else if (srcStat.isSymbolicLink()) return onLink(destStat, src, dest, opts);
}
function onFile(srcStat, destStat, src, dest, opts) {
    if (!destStat) return copyFile(srcStat, src, dest, opts);
    return mayCopyFile(srcStat, src, dest, opts);
}
function mayCopyFile(srcStat, src, dest, opts) {
    if (opts.overwrite) {
        fs.unlinkSync(dest);
        return copyFile(srcStat, src, dest, opts);
    } else if (opts.errorOnExist) throw new Error(`'${dest}' already exists`);
}
function copyFile(srcStat, src, dest, opts) {
    if (typeof fs.copyFileSync === 'function') {
        fs.copyFileSync(src, dest);
        fs.chmodSync(dest, srcStat.mode);
        if (opts.preserveTimestamps) return utimesSync(dest, srcStat.atime, srcStat.mtime);
        return;
    }
    return copyFileFallback(srcStat, src, dest, opts);
}
function copyFileFallback(srcStat, src, dest, opts) {
    const BUF_LENGTH = 65536;
    const _buff = require("68eb32168ed3e53")(BUF_LENGTH);
    const fdr = fs.openSync(src, 'r');
    const fdw = fs.openSync(dest, 'w', srcStat.mode);
    let pos = 0;
    while(pos < srcStat.size){
        const bytesRead = fs.readSync(fdr, _buff, 0, BUF_LENGTH, pos);
        fs.writeSync(fdw, _buff, 0, bytesRead);
        pos += bytesRead;
    }
    if (opts.preserveTimestamps) fs.futimesSync(fdw, srcStat.atime, srcStat.mtime);
    fs.closeSync(fdr);
    fs.closeSync(fdw);
}
function onDir(srcStat, destStat, src, dest, opts) {
    if (!destStat) return mkDirAndCopy(srcStat, src, dest, opts);
    if (destStat && !destStat.isDirectory()) throw new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`);
    return copyDir(src, dest, opts);
}
function mkDirAndCopy(srcStat, src, dest, opts) {
    fs.mkdirSync(dest);
    copyDir(src, dest, opts);
    return fs.chmodSync(dest, srcStat.mode);
}
function copyDir(src, dest, opts) {
    fs.readdirSync(src).forEach((item)=>copyDirItem(item, src, dest, opts));
}
function copyDirItem(item, src, dest, opts) {
    const srcItem = path.join(src, item);
    const destItem = path.join(dest, item);
    const { destStat } = stat.checkPathsSync(srcItem, destItem, 'copy');
    return startCopy(destStat, srcItem, destItem, opts);
}
function onLink(destStat, src, dest, opts) {
    let resolvedSrc = fs.readlinkSync(src);
    if (opts.dereference) resolvedSrc = path.resolve(process.cwd(), resolvedSrc);
    if (!destStat) return fs.symlinkSync(resolvedSrc, dest);
    else {
        let resolvedDest;
        try {
            resolvedDest = fs.readlinkSync(dest);
        } catch (err) {
            // dest exists and is a regular file or directory,
            // Windows may throw UNKNOWN error. If dest already exists,
            // fs throws error anyway, so no need to guard against it here.
            if (err.code === 'EINVAL' || err.code === 'UNKNOWN') return fs.symlinkSync(resolvedSrc, dest);
            throw err;
        }
        if (opts.dereference) resolvedDest = path.resolve(process.cwd(), resolvedDest);
        if (stat.isSrcSubdir(resolvedSrc, resolvedDest)) throw new Error(`Cannot copy '${resolvedSrc}' to a subdirectory of itself, '${resolvedDest}'.`);
        // prevent copy if src is a subdir of dest since unlinking
        // dest in this case would result in removing src contents
        // and therefore a broken symlink would be created.
        if (fs.statSync(dest).isDirectory() && stat.isSrcSubdir(resolvedDest, resolvedSrc)) throw new Error(`Cannot overwrite '${resolvedDest}' with '${resolvedSrc}'.`);
        return copyLink(resolvedSrc, dest);
    }
}
function copyLink(resolvedSrc, dest) {
    fs.unlinkSync(dest);
    return fs.symlinkSync(resolvedSrc, dest);
}
module.exports = copySync;

},{"16dcd2026ceb196f":"73PYN","adc26afc911987a2":"path","b21e5f5c2cdfdd39":"4pS5w","33cb26a330022b8":"a5HcO","abfccea2b76993b":"2g5m7","68eb32168ed3e53":"Ycfh9"}],"4pS5w":[function(require,module,exports,__globalThis) {
'use strict';
const u = require("7d55876fd0887333").fromCallback;
const mkdirs = u(require("b350276bf0868fa0"));
const mkdirsSync = require("5e67cdb9a0ed3c73");
module.exports = {
    mkdirs,
    mkdirsSync,
    // alias
    mkdirp: mkdirs,
    mkdirpSync: mkdirsSync,
    ensureDir: mkdirs,
    ensureDirSync: mkdirsSync
};

},{"7d55876fd0887333":"dPfZv","b350276bf0868fa0":"diNFR","5e67cdb9a0ed3c73":"gTcLK"}],"diNFR":[function(require,module,exports,__globalThis) {
'use strict';
const fs = require("93112a9a617856f2");
const path = require("7cf05c4a7fce7091");
const invalidWin32Path = require("b3d5d204118c342").invalidWin32Path;
const o777 = parseInt('0777', 8);
function mkdirs(p, opts, callback, made) {
    if (typeof opts === 'function') {
        callback = opts;
        opts = {};
    } else if (!opts || typeof opts !== 'object') opts = {
        mode: opts
    };
    if (process.platform === 'win32' && invalidWin32Path(p)) {
        const errInval = new Error(p + ' contains invalid WIN32 path characters.');
        errInval.code = 'EINVAL';
        return callback(errInval);
    }
    let mode = opts.mode;
    const xfs = opts.fs || fs;
    if (mode === undefined) mode = o777 & ~process.umask();
    if (!made) made = null;
    callback = callback || function() {};
    p = path.resolve(p);
    xfs.mkdir(p, mode, (er)=>{
        if (!er) {
            made = made || p;
            return callback(null, made);
        }
        switch(er.code){
            case 'ENOENT':
                if (path.dirname(p) === p) return callback(er);
                mkdirs(path.dirname(p), opts, (er, made)=>{
                    if (er) callback(er, made);
                    else mkdirs(p, opts, callback, made);
                });
                break;
            // In the case of any other error, just see if there's a dir
            // there already.  If so, then hooray!  If not, then something
            // is borked.
            default:
                xfs.stat(p, (er2, stat)=>{
                    // if the stat fails, then that's super weird.
                    // let the original error be the failure reason.
                    if (er2 || !stat.isDirectory()) callback(er, made);
                    else callback(null, made);
                });
                break;
        }
    });
}
module.exports = mkdirs;

},{"93112a9a617856f2":"73PYN","7cf05c4a7fce7091":"path","b3d5d204118c342":"8cEA9"}],"8cEA9":[function(require,module,exports,__globalThis) {
'use strict';
const path = require("3f2835253e86c33b");
// get drive on windows
function getRootPath(p) {
    p = path.normalize(path.resolve(p)).split(path.sep);
    if (p.length > 0) return p[0];
    return null;
}
// http://stackoverflow.com/a/62888/10333 contains more accurate
// TODO: expand to include the rest
const INVALID_PATH_CHARS = /[<>:"|?*]/;
function invalidWin32Path(p) {
    const rp = getRootPath(p);
    p = p.replace(rp, '');
    return INVALID_PATH_CHARS.test(p);
}
module.exports = {
    getRootPath,
    invalidWin32Path
};

},{"3f2835253e86c33b":"path"}],"gTcLK":[function(require,module,exports,__globalThis) {
'use strict';
const fs = require("c879c2c9e4cf0b8d");
const path = require("969f590eda179e36");
const invalidWin32Path = require("356346447b6375ca").invalidWin32Path;
const o777 = parseInt('0777', 8);
function mkdirsSync(p, opts, made) {
    if (!opts || typeof opts !== 'object') opts = {
        mode: opts
    };
    let mode = opts.mode;
    const xfs = opts.fs || fs;
    if (process.platform === 'win32' && invalidWin32Path(p)) {
        const errInval = new Error(p + ' contains invalid WIN32 path characters.');
        errInval.code = 'EINVAL';
        throw errInval;
    }
    if (mode === undefined) mode = o777 & ~process.umask();
    if (!made) made = null;
    p = path.resolve(p);
    try {
        xfs.mkdirSync(p, mode);
        made = made || p;
    } catch (err0) {
        if (err0.code === 'ENOENT') {
            if (path.dirname(p) === p) throw err0;
            made = mkdirsSync(path.dirname(p), opts, made);
            mkdirsSync(p, opts, made);
        } else {
            // In the case of any other error, just see if there's a dir there
            // already. If so, then hooray!  If not, then something is borked.
            let stat;
            try {
                stat = xfs.statSync(p);
            } catch (err1) {
                throw err0;
            }
            if (!stat.isDirectory()) throw err0;
        }
    }
    return made;
}
module.exports = mkdirsSync;

},{"c879c2c9e4cf0b8d":"73PYN","969f590eda179e36":"path","356346447b6375ca":"8cEA9"}],"a5HcO":[function(require,module,exports,__globalThis) {
'use strict';
const fs = require("f266a01c9713a4a");
const os = require("3f32ccb0a87d5224");
const path = require("f30775cbb5b25258");
// HFS, ext{2,3}, FAT do not, Node.js v0.10 does not
function hasMillisResSync() {
    let tmpfile = path.join('millis-test-sync' + Date.now().toString() + Math.random().toString().slice(2));
    tmpfile = path.join(os.tmpdir(), tmpfile);
    // 550 millis past UNIX epoch
    const d = new Date(1435410243862);
    fs.writeFileSync(tmpfile, 'https://github.com/jprichardson/node-fs-extra/pull/141');
    const fd = fs.openSync(tmpfile, 'r+');
    fs.futimesSync(fd, d, d);
    fs.closeSync(fd);
    return fs.statSync(tmpfile).mtime > 1435410243000;
}
function hasMillisRes(callback) {
    let tmpfile = path.join('millis-test' + Date.now().toString() + Math.random().toString().slice(2));
    tmpfile = path.join(os.tmpdir(), tmpfile);
    // 550 millis past UNIX epoch
    const d = new Date(1435410243862);
    fs.writeFile(tmpfile, 'https://github.com/jprichardson/node-fs-extra/pull/141', (err)=>{
        if (err) return callback(err);
        fs.open(tmpfile, 'r+', (err, fd)=>{
            if (err) return callback(err);
            fs.futimes(fd, d, d, (err)=>{
                if (err) return callback(err);
                fs.close(fd, (err)=>{
                    if (err) return callback(err);
                    fs.stat(tmpfile, (err, stats)=>{
                        if (err) return callback(err);
                        callback(null, stats.mtime > 1435410243000);
                    });
                });
            });
        });
    });
}
function timeRemoveMillis(timestamp) {
    if (typeof timestamp === 'number') return Math.floor(timestamp / 1000) * 1000;
    else if (timestamp instanceof Date) return new Date(Math.floor(timestamp.getTime() / 1000) * 1000);
    else throw new Error('fs-extra: timeRemoveMillis() unknown parameter type');
}
function utimesMillis(path, atime, mtime, callback) {
    // if (!HAS_MILLIS_RES) return fs.utimes(path, atime, mtime, callback)
    fs.open(path, 'r+', (err, fd)=>{
        if (err) return callback(err);
        fs.futimes(fd, atime, mtime, (futimesErr)=>{
            fs.close(fd, (closeErr)=>{
                if (callback) callback(futimesErr || closeErr);
            });
        });
    });
}
function utimesMillisSync(path, atime, mtime) {
    const fd = fs.openSync(path, 'r+');
    fs.futimesSync(fd, atime, mtime);
    return fs.closeSync(fd);
}
module.exports = {
    hasMillisRes,
    hasMillisResSync,
    timeRemoveMillis,
    utimesMillis,
    utimesMillisSync
};

},{"f266a01c9713a4a":"73PYN","3f32ccb0a87d5224":"os","f30775cbb5b25258":"path"}],"2g5m7":[function(require,module,exports,__globalThis) {
'use strict';
const fs = require("3b59a066d6bd7800");
const path = require("aa2c037a3ac0a2db");
const NODE_VERSION_MAJOR_WITH_BIGINT = 10;
const NODE_VERSION_MINOR_WITH_BIGINT = 5;
const NODE_VERSION_PATCH_WITH_BIGINT = 0;
const nodeVersion = process.versions.node.split('.');
const nodeVersionMajor = Number.parseInt(nodeVersion[0], 10);
const nodeVersionMinor = Number.parseInt(nodeVersion[1], 10);
const nodeVersionPatch = Number.parseInt(nodeVersion[2], 10);
function nodeSupportsBigInt() {
    if (nodeVersionMajor > NODE_VERSION_MAJOR_WITH_BIGINT) return true;
    else if (nodeVersionMajor === NODE_VERSION_MAJOR_WITH_BIGINT) {
        if (nodeVersionMinor > NODE_VERSION_MINOR_WITH_BIGINT) return true;
        else if (nodeVersionMinor === NODE_VERSION_MINOR_WITH_BIGINT) {
            if (nodeVersionPatch >= NODE_VERSION_PATCH_WITH_BIGINT) return true;
        }
    }
    return false;
}
function getStats(src, dest, cb) {
    if (nodeSupportsBigInt()) fs.stat(src, {
        bigint: true
    }, (err, srcStat)=>{
        if (err) return cb(err);
        fs.stat(dest, {
            bigint: true
        }, (err, destStat)=>{
            if (err) {
                if (err.code === 'ENOENT') return cb(null, {
                    srcStat,
                    destStat: null
                });
                return cb(err);
            }
            return cb(null, {
                srcStat,
                destStat
            });
        });
    });
    else fs.stat(src, (err, srcStat)=>{
        if (err) return cb(err);
        fs.stat(dest, (err, destStat)=>{
            if (err) {
                if (err.code === 'ENOENT') return cb(null, {
                    srcStat,
                    destStat: null
                });
                return cb(err);
            }
            return cb(null, {
                srcStat,
                destStat
            });
        });
    });
}
function getStatsSync(src, dest) {
    let srcStat, destStat;
    if (nodeSupportsBigInt()) srcStat = fs.statSync(src, {
        bigint: true
    });
    else srcStat = fs.statSync(src);
    try {
        if (nodeSupportsBigInt()) destStat = fs.statSync(dest, {
            bigint: true
        });
        else destStat = fs.statSync(dest);
    } catch (err) {
        if (err.code === 'ENOENT') return {
            srcStat,
            destStat: null
        };
        throw err;
    }
    return {
        srcStat,
        destStat
    };
}
function checkPaths(src, dest, funcName, cb) {
    getStats(src, dest, (err, stats)=>{
        if (err) return cb(err);
        const { srcStat, destStat } = stats;
        if (destStat && destStat.ino && destStat.dev && destStat.ino === srcStat.ino && destStat.dev === srcStat.dev) return cb(new Error('Source and destination must not be the same.'));
        if (srcStat.isDirectory() && isSrcSubdir(src, dest)) return cb(new Error(errMsg(src, dest, funcName)));
        return cb(null, {
            srcStat,
            destStat
        });
    });
}
function checkPathsSync(src, dest, funcName) {
    const { srcStat, destStat } = getStatsSync(src, dest);
    if (destStat && destStat.ino && destStat.dev && destStat.ino === srcStat.ino && destStat.dev === srcStat.dev) throw new Error('Source and destination must not be the same.');
    if (srcStat.isDirectory() && isSrcSubdir(src, dest)) throw new Error(errMsg(src, dest, funcName));
    return {
        srcStat,
        destStat
    };
}
// recursively check if dest parent is a subdirectory of src.
// It works for all file types including symlinks since it
// checks the src and dest inodes. It starts from the deepest
// parent and stops once it reaches the src parent or the root path.
function checkParentPaths(src, srcStat, dest, funcName, cb) {
    const srcParent = path.resolve(path.dirname(src));
    const destParent = path.resolve(path.dirname(dest));
    if (destParent === srcParent || destParent === path.parse(destParent).root) return cb();
    if (nodeSupportsBigInt()) fs.stat(destParent, {
        bigint: true
    }, (err, destStat)=>{
        if (err) {
            if (err.code === 'ENOENT') return cb();
            return cb(err);
        }
        if (destStat.ino && destStat.dev && destStat.ino === srcStat.ino && destStat.dev === srcStat.dev) return cb(new Error(errMsg(src, dest, funcName)));
        return checkParentPaths(src, srcStat, destParent, funcName, cb);
    });
    else fs.stat(destParent, (err, destStat)=>{
        if (err) {
            if (err.code === 'ENOENT') return cb();
            return cb(err);
        }
        if (destStat.ino && destStat.dev && destStat.ino === srcStat.ino && destStat.dev === srcStat.dev) return cb(new Error(errMsg(src, dest, funcName)));
        return checkParentPaths(src, srcStat, destParent, funcName, cb);
    });
}
function checkParentPathsSync(src, srcStat, dest, funcName) {
    const srcParent = path.resolve(path.dirname(src));
    const destParent = path.resolve(path.dirname(dest));
    if (destParent === srcParent || destParent === path.parse(destParent).root) return;
    let destStat;
    try {
        if (nodeSupportsBigInt()) destStat = fs.statSync(destParent, {
            bigint: true
        });
        else destStat = fs.statSync(destParent);
    } catch (err) {
        if (err.code === 'ENOENT') return;
        throw err;
    }
    if (destStat.ino && destStat.dev && destStat.ino === srcStat.ino && destStat.dev === srcStat.dev) throw new Error(errMsg(src, dest, funcName));
    return checkParentPathsSync(src, srcStat, destParent, funcName);
}
// return true if dest is a subdir of src, otherwise false.
// It only checks the path strings.
function isSrcSubdir(src, dest) {
    const srcArr = path.resolve(src).split(path.sep).filter((i)=>i);
    const destArr = path.resolve(dest).split(path.sep).filter((i)=>i);
    return srcArr.reduce((acc, cur, i)=>acc && destArr[i] === cur, true);
}
function errMsg(src, dest, funcName) {
    return `Cannot ${funcName} '${src}' to a subdirectory of itself, '${dest}'.`;
}
module.exports = {
    checkPaths,
    checkPathsSync,
    checkParentPaths,
    checkParentPathsSync,
    isSrcSubdir
};

},{"3b59a066d6bd7800":"73PYN","aa2c037a3ac0a2db":"path"}],"Ycfh9":[function(require,module,exports,__globalThis) {
'use strict';
/* eslint-disable node/no-deprecated-api */ module.exports = function(size) {
    if (typeof Buffer.allocUnsafe === 'function') try {
        return Buffer.allocUnsafe(size);
    } catch (e) {
        return new Buffer(size);
    }
    return new Buffer(size);
};

},{}],"fADug":[function(require,module,exports,__globalThis) {
'use strict';
const u = require("2c701b575482d25b").fromCallback;
module.exports = {
    copy: u(require("cfe3ecc9130278b7"))
};

},{"2c701b575482d25b":"dPfZv","cfe3ecc9130278b7":"gUpOk"}],"gUpOk":[function(require,module,exports,__globalThis) {
'use strict';
const fs = require("9d1db0ec29323d5b");
const path = require("f0f4e2f5bb766bf2");
const mkdirp = require("fc1be81907283018").mkdirs;
const pathExists = require("c755d33dc975e4e3").pathExists;
const utimes = require("ab23e6d832a1112c").utimesMillis;
const stat = require("b44230577f0cd582");
function copy(src, dest, opts, cb) {
    if (typeof opts === 'function' && !cb) {
        cb = opts;
        opts = {};
    } else if (typeof opts === 'function') opts = {
        filter: opts
    };
    cb = cb || function() {};
    opts = opts || {};
    opts.clobber = 'clobber' in opts ? !!opts.clobber : true // default to true for now
    ;
    opts.overwrite = 'overwrite' in opts ? !!opts.overwrite : opts.clobber // overwrite falls back to clobber
    ;
    // Warn about using preserveTimestamps on 32-bit node
    if (opts.preserveTimestamps && process.arch === 'ia32') console.warn(`fs-extra: Using the preserveTimestamps option in 32-bit node is not recommended;\n
    see https://github.com/jprichardson/node-fs-extra/issues/269`);
    stat.checkPaths(src, dest, 'copy', (err, stats)=>{
        if (err) return cb(err);
        const { srcStat, destStat } = stats;
        stat.checkParentPaths(src, srcStat, dest, 'copy', (err)=>{
            if (err) return cb(err);
            if (opts.filter) return handleFilter(checkParentDir, destStat, src, dest, opts, cb);
            return checkParentDir(destStat, src, dest, opts, cb);
        });
    });
}
function checkParentDir(destStat, src, dest, opts, cb) {
    const destParent = path.dirname(dest);
    pathExists(destParent, (err, dirExists)=>{
        if (err) return cb(err);
        if (dirExists) return startCopy(destStat, src, dest, opts, cb);
        mkdirp(destParent, (err)=>{
            if (err) return cb(err);
            return startCopy(destStat, src, dest, opts, cb);
        });
    });
}
function handleFilter(onInclude, destStat, src, dest, opts, cb) {
    Promise.resolve(opts.filter(src, dest)).then((include)=>{
        if (include) return onInclude(destStat, src, dest, opts, cb);
        return cb();
    }, (error)=>cb(error));
}
function startCopy(destStat, src, dest, opts, cb) {
    if (opts.filter) return handleFilter(getStats, destStat, src, dest, opts, cb);
    return getStats(destStat, src, dest, opts, cb);
}
function getStats(destStat, src, dest, opts, cb) {
    const stat = opts.dereference ? fs.stat : fs.lstat;
    stat(src, (err, srcStat)=>{
        if (err) return cb(err);
        if (srcStat.isDirectory()) return onDir(srcStat, destStat, src, dest, opts, cb);
        else if (srcStat.isFile() || srcStat.isCharacterDevice() || srcStat.isBlockDevice()) return onFile(srcStat, destStat, src, dest, opts, cb);
        else if (srcStat.isSymbolicLink()) return onLink(destStat, src, dest, opts, cb);
    });
}
function onFile(srcStat, destStat, src, dest, opts, cb) {
    if (!destStat) return copyFile(srcStat, src, dest, opts, cb);
    return mayCopyFile(srcStat, src, dest, opts, cb);
}
function mayCopyFile(srcStat, src, dest, opts, cb) {
    if (opts.overwrite) fs.unlink(dest, (err)=>{
        if (err) return cb(err);
        return copyFile(srcStat, src, dest, opts, cb);
    });
    else if (opts.errorOnExist) return cb(new Error(`'${dest}' already exists`));
    else return cb();
}
function copyFile(srcStat, src, dest, opts, cb) {
    if (typeof fs.copyFile === 'function') return fs.copyFile(src, dest, (err)=>{
        if (err) return cb(err);
        return setDestModeAndTimestamps(srcStat, dest, opts, cb);
    });
    return copyFileFallback(srcStat, src, dest, opts, cb);
}
function copyFileFallback(srcStat, src, dest, opts, cb) {
    const rs = fs.createReadStream(src);
    rs.on('error', (err)=>cb(err)).once('open', ()=>{
        const ws = fs.createWriteStream(dest, {
            mode: srcStat.mode
        });
        ws.on('error', (err)=>cb(err)).on('open', ()=>rs.pipe(ws)).once('close', ()=>setDestModeAndTimestamps(srcStat, dest, opts, cb));
    });
}
function setDestModeAndTimestamps(srcStat, dest, opts, cb) {
    fs.chmod(dest, srcStat.mode, (err)=>{
        if (err) return cb(err);
        if (opts.preserveTimestamps) return utimes(dest, srcStat.atime, srcStat.mtime, cb);
        return cb();
    });
}
function onDir(srcStat, destStat, src, dest, opts, cb) {
    if (!destStat) return mkDirAndCopy(srcStat, src, dest, opts, cb);
    if (destStat && !destStat.isDirectory()) return cb(new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`));
    return copyDir(src, dest, opts, cb);
}
function mkDirAndCopy(srcStat, src, dest, opts, cb) {
    fs.mkdir(dest, (err)=>{
        if (err) return cb(err);
        copyDir(src, dest, opts, (err)=>{
            if (err) return cb(err);
            return fs.chmod(dest, srcStat.mode, cb);
        });
    });
}
function copyDir(src, dest, opts, cb) {
    fs.readdir(src, (err, items)=>{
        if (err) return cb(err);
        return copyDirItems(items, src, dest, opts, cb);
    });
}
function copyDirItems(items, src, dest, opts, cb) {
    const item = items.pop();
    if (!item) return cb();
    return copyDirItem(items, item, src, dest, opts, cb);
}
function copyDirItem(items, item, src, dest, opts, cb) {
    const srcItem = path.join(src, item);
    const destItem = path.join(dest, item);
    stat.checkPaths(srcItem, destItem, 'copy', (err, stats)=>{
        if (err) return cb(err);
        const { destStat } = stats;
        startCopy(destStat, srcItem, destItem, opts, (err)=>{
            if (err) return cb(err);
            return copyDirItems(items, src, dest, opts, cb);
        });
    });
}
function onLink(destStat, src, dest, opts, cb) {
    fs.readlink(src, (err, resolvedSrc)=>{
        if (err) return cb(err);
        if (opts.dereference) resolvedSrc = path.resolve(process.cwd(), resolvedSrc);
        if (!destStat) return fs.symlink(resolvedSrc, dest, cb);
        else fs.readlink(dest, (err, resolvedDest)=>{
            if (err) {
                // dest exists and is a regular file or directory,
                // Windows may throw UNKNOWN error. If dest already exists,
                // fs throws error anyway, so no need to guard against it here.
                if (err.code === 'EINVAL' || err.code === 'UNKNOWN') return fs.symlink(resolvedSrc, dest, cb);
                return cb(err);
            }
            if (opts.dereference) resolvedDest = path.resolve(process.cwd(), resolvedDest);
            if (stat.isSrcSubdir(resolvedSrc, resolvedDest)) return cb(new Error(`Cannot copy '${resolvedSrc}' to a subdirectory of itself, '${resolvedDest}'.`));
            // do not copy if src is a subdir of dest since unlinking
            // dest in this case would result in removing src contents
            // and therefore a broken symlink would be created.
            if (destStat.isDirectory() && stat.isSrcSubdir(resolvedDest, resolvedSrc)) return cb(new Error(`Cannot overwrite '${resolvedDest}' with '${resolvedSrc}'.`));
            return copyLink(resolvedSrc, dest, cb);
        });
    });
}
function copyLink(resolvedSrc, dest, cb) {
    fs.unlink(dest, (err)=>{
        if (err) return cb(err);
        return fs.symlink(resolvedSrc, dest, cb);
    });
}
module.exports = copy;

},{"9d1db0ec29323d5b":"73PYN","f0f4e2f5bb766bf2":"path","fc1be81907283018":"4pS5w","c755d33dc975e4e3":"cOSta","ab23e6d832a1112c":"a5HcO","b44230577f0cd582":"2g5m7"}],"cOSta":[function(require,module,exports,__globalThis) {
'use strict';
const u = require("ab7ffa3df7dcf701").fromPromise;
const fs = require("80c0d2afacbb49c4");
function pathExists(path) {
    return fs.access(path).then(()=>true).catch(()=>false);
}
module.exports = {
    pathExists: u(pathExists),
    pathExistsSync: fs.existsSync
};

},{"ab7ffa3df7dcf701":"dPfZv","80c0d2afacbb49c4":"9iAOS"}],"7IpQH":[function(require,module,exports,__globalThis) {
'use strict';
const u = require("8f0f6e2e8d07f806").fromCallback;
const fs = require("18bfbdee5b740a50");
const path = require("159bd900ea283391");
const mkdir = require("814737fe733f2071");
const remove = require("7da7445b6aa7f8d2");
const emptyDir = u(function emptyDir(dir, callback) {
    callback = callback || function() {};
    fs.readdir(dir, (err, items)=>{
        if (err) return mkdir.mkdirs(dir, callback);
        items = items.map((item)=>path.join(dir, item));
        deleteItem();
        function deleteItem() {
            const item = items.pop();
            if (!item) return callback();
            remove.remove(item, (err)=>{
                if (err) return callback(err);
                deleteItem();
            });
        }
    });
});
function emptyDirSync(dir) {
    let items;
    try {
        items = fs.readdirSync(dir);
    } catch (err) {
        return mkdir.mkdirsSync(dir);
    }
    items.forEach((item)=>{
        item = path.join(dir, item);
        remove.removeSync(item);
    });
}
module.exports = {
    emptyDirSync,
    emptydirSync: emptyDirSync,
    emptyDir,
    emptydir: emptyDir
};

},{"8f0f6e2e8d07f806":"dPfZv","18bfbdee5b740a50":"73PYN","159bd900ea283391":"path","814737fe733f2071":"4pS5w","7da7445b6aa7f8d2":"k1WVQ"}],"k1WVQ":[function(require,module,exports,__globalThis) {
'use strict';
const u = require("152dd1da058b587c").fromCallback;
const rimraf = require("8bfb87fb46b26b9a");
module.exports = {
    remove: u(rimraf),
    removeSync: rimraf.sync
};

},{"152dd1da058b587c":"dPfZv","8bfb87fb46b26b9a":"jBfIK"}],"jBfIK":[function(require,module,exports,__globalThis) {
'use strict';
const fs = require("e497ec0b2ca02524");
const path = require("4b776068600a68ad");
const assert = require("fbc569294f89a482");
const isWindows = process.platform === 'win32';
function defaults(options) {
    const methods = [
        'unlink',
        'chmod',
        'stat',
        'lstat',
        'rmdir',
        'readdir'
    ];
    methods.forEach((m)=>{
        options[m] = options[m] || fs[m];
        m = m + 'Sync';
        options[m] = options[m] || fs[m];
    });
    options.maxBusyTries = options.maxBusyTries || 3;
}
function rimraf(p, options, cb) {
    let busyTries = 0;
    if (typeof options === 'function') {
        cb = options;
        options = {};
    }
    assert(p, 'rimraf: missing path');
    assert.strictEqual(typeof p, 'string', 'rimraf: path should be a string');
    assert.strictEqual(typeof cb, 'function', 'rimraf: callback function required');
    assert(options, 'rimraf: invalid options argument provided');
    assert.strictEqual(typeof options, 'object', 'rimraf: options should be object');
    defaults(options);
    rimraf_(p, options, function CB(er) {
        if (er) {
            if ((er.code === 'EBUSY' || er.code === 'ENOTEMPTY' || er.code === 'EPERM') && busyTries < options.maxBusyTries) {
                busyTries++;
                const time = busyTries * 100;
                // try again, with the same exact callback as this one.
                return setTimeout(()=>rimraf_(p, options, CB), time);
            }
            // already gone
            if (er.code === 'ENOENT') er = null;
        }
        cb(er);
    });
}
// Two possible strategies.
// 1. Assume it's a file.  unlink it, then do the dir stuff on EPERM or EISDIR
// 2. Assume it's a directory.  readdir, then do the file stuff on ENOTDIR
//
// Both result in an extra syscall when you guess wrong.  However, there
// are likely far more normal files in the world than directories.  This
// is based on the assumption that a the average number of files per
// directory is >= 1.
//
// If anyone ever complains about this, then I guess the strategy could
// be made configurable somehow.  But until then, YAGNI.
function rimraf_(p, options, cb) {
    assert(p);
    assert(options);
    assert(typeof cb === 'function');
    // sunos lets the root user unlink directories, which is... weird.
    // so we have to lstat here and make sure it's not a dir.
    options.lstat(p, (er, st)=>{
        if (er && er.code === 'ENOENT') return cb(null);
        // Windows can EPERM on stat.  Life is suffering.
        if (er && er.code === 'EPERM' && isWindows) return fixWinEPERM(p, options, er, cb);
        if (st && st.isDirectory()) return rmdir(p, options, er, cb);
        options.unlink(p, (er)=>{
            if (er) {
                if (er.code === 'ENOENT') return cb(null);
                if (er.code === 'EPERM') return isWindows ? fixWinEPERM(p, options, er, cb) : rmdir(p, options, er, cb);
                if (er.code === 'EISDIR') return rmdir(p, options, er, cb);
            }
            return cb(er);
        });
    });
}
function fixWinEPERM(p, options, er, cb) {
    assert(p);
    assert(options);
    assert(typeof cb === 'function');
    if (er) assert(er instanceof Error);
    options.chmod(p, 438, (er2)=>{
        if (er2) cb(er2.code === 'ENOENT' ? null : er);
        else options.stat(p, (er3, stats)=>{
            if (er3) cb(er3.code === 'ENOENT' ? null : er);
            else if (stats.isDirectory()) rmdir(p, options, er, cb);
            else options.unlink(p, cb);
        });
    });
}
function fixWinEPERMSync(p, options, er) {
    let stats;
    assert(p);
    assert(options);
    if (er) assert(er instanceof Error);
    try {
        options.chmodSync(p, 438);
    } catch (er2) {
        if (er2.code === 'ENOENT') return;
        else throw er;
    }
    try {
        stats = options.statSync(p);
    } catch (er3) {
        if (er3.code === 'ENOENT') return;
        else throw er;
    }
    if (stats.isDirectory()) rmdirSync(p, options, er);
    else options.unlinkSync(p);
}
function rmdir(p, options, originalEr, cb) {
    assert(p);
    assert(options);
    if (originalEr) assert(originalEr instanceof Error);
    assert(typeof cb === 'function');
    // try to rmdir first, and only readdir on ENOTEMPTY or EEXIST (SunOS)
    // if we guessed wrong, and it's not a directory, then
    // raise the original error.
    options.rmdir(p, (er)=>{
        if (er && (er.code === 'ENOTEMPTY' || er.code === 'EEXIST' || er.code === 'EPERM')) rmkids(p, options, cb);
        else if (er && er.code === 'ENOTDIR') cb(originalEr);
        else cb(er);
    });
}
function rmkids(p, options, cb) {
    assert(p);
    assert(options);
    assert(typeof cb === 'function');
    options.readdir(p, (er, files)=>{
        if (er) return cb(er);
        let n = files.length;
        let errState;
        if (n === 0) return options.rmdir(p, cb);
        files.forEach((f)=>{
            rimraf(path.join(p, f), options, (er)=>{
                if (errState) return;
                if (er) return cb(errState = er);
                if (--n === 0) options.rmdir(p, cb);
            });
        });
    });
}
// this looks simpler, and is strictly *faster*, but will
// tie up the JavaScript thread and fail on excessively
// deep directory trees.
function rimrafSync(p, options) {
    let st;
    options = options || {};
    defaults(options);
    assert(p, 'rimraf: missing path');
    assert.strictEqual(typeof p, 'string', 'rimraf: path should be a string');
    assert(options, 'rimraf: missing options');
    assert.strictEqual(typeof options, 'object', 'rimraf: options should be object');
    try {
        st = options.lstatSync(p);
    } catch (er) {
        if (er.code === 'ENOENT') return;
        // Windows can EPERM on stat.  Life is suffering.
        if (er.code === 'EPERM' && isWindows) fixWinEPERMSync(p, options, er);
    }
    try {
        // sunos lets the root user unlink directories, which is... weird.
        if (st && st.isDirectory()) rmdirSync(p, options, null);
        else options.unlinkSync(p);
    } catch (er) {
        if (er.code === 'ENOENT') return;
        else if (er.code === 'EPERM') return isWindows ? fixWinEPERMSync(p, options, er) : rmdirSync(p, options, er);
        else if (er.code !== 'EISDIR') throw er;
        rmdirSync(p, options, er);
    }
}
function rmdirSync(p, options, originalEr) {
    assert(p);
    assert(options);
    if (originalEr) assert(originalEr instanceof Error);
    try {
        options.rmdirSync(p);
    } catch (er) {
        if (er.code === 'ENOTDIR') throw originalEr;
        else if (er.code === 'ENOTEMPTY' || er.code === 'EEXIST' || er.code === 'EPERM') rmkidsSync(p, options);
        else if (er.code !== 'ENOENT') throw er;
    }
}
function rmkidsSync(p, options) {
    assert(p);
    assert(options);
    options.readdirSync(p).forEach((f)=>rimrafSync(path.join(p, f), options));
    if (isWindows) {
        // We only end up here once we got ENOTEMPTY at least once, and
        // at this point, we are guaranteed to have removed all the kids.
        // So, we know that it won't be ENOENT or ENOTDIR or anything else.
        // try really hard to delete stuff on windows, because it has a
        // PROFOUNDLY annoying habit of not closing handles promptly when
        // files are deleted, resulting in spurious ENOTEMPTY errors.
        const startTime = Date.now();
        do try {
            const ret = options.rmdirSync(p, options);
            return ret;
        } catch (er) {}
        while (Date.now() - startTime < 500); // give up after 500ms
    } else {
        const ret = options.rmdirSync(p, options);
        return ret;
    }
}
module.exports = rimraf;
rimraf.sync = rimrafSync;

},{"e497ec0b2ca02524":"73PYN","4b776068600a68ad":"path","fbc569294f89a482":"assert"}],"kzJN6":[function(require,module,exports,__globalThis) {
'use strict';
const file = require("88b176bf86856300");
const link = require("a154147f912456bf");
const symlink = require("f3315415dabc7c14");
module.exports = {
    // file
    createFile: file.createFile,
    createFileSync: file.createFileSync,
    ensureFile: file.createFile,
    ensureFileSync: file.createFileSync,
    // link
    createLink: link.createLink,
    createLinkSync: link.createLinkSync,
    ensureLink: link.createLink,
    ensureLinkSync: link.createLinkSync,
    // symlink
    createSymlink: symlink.createSymlink,
    createSymlinkSync: symlink.createSymlinkSync,
    ensureSymlink: symlink.createSymlink,
    ensureSymlinkSync: symlink.createSymlinkSync
};

},{"88b176bf86856300":"euFHr","a154147f912456bf":"ajhOP","f3315415dabc7c14":"17j1l"}],"euFHr":[function(require,module,exports,__globalThis) {
'use strict';
const u = require("850f0ccc477d0a7e").fromCallback;
const path = require("1cd5b949a81edf35");
const fs = require("90ce4076fa429f05");
const mkdir = require("ba61347311eee6a9");
const pathExists = require("31f8bc8df7a4f3fb").pathExists;
function createFile(file, callback) {
    function makeFile() {
        fs.writeFile(file, '', (err)=>{
            if (err) return callback(err);
            callback();
        });
    }
    fs.stat(file, (err, stats)=>{
        if (!err && stats.isFile()) return callback();
        const dir = path.dirname(file);
        pathExists(dir, (err, dirExists)=>{
            if (err) return callback(err);
            if (dirExists) return makeFile();
            mkdir.mkdirs(dir, (err)=>{
                if (err) return callback(err);
                makeFile();
            });
        });
    });
}
function createFileSync(file) {
    let stats;
    try {
        stats = fs.statSync(file);
    } catch (e) {}
    if (stats && stats.isFile()) return;
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) mkdir.mkdirsSync(dir);
    fs.writeFileSync(file, '');
}
module.exports = {
    createFile: u(createFile),
    createFileSync
};

},{"850f0ccc477d0a7e":"dPfZv","1cd5b949a81edf35":"path","90ce4076fa429f05":"73PYN","ba61347311eee6a9":"4pS5w","31f8bc8df7a4f3fb":"cOSta"}],"ajhOP":[function(require,module,exports,__globalThis) {
'use strict';
const u = require("1d3a26a2042f68d9").fromCallback;
const path = require("e03b816e2c509fda");
const fs = require("ca3dc388b8827074");
const mkdir = require("4b3e5f452b1f0443");
const pathExists = require("660e253caabd326b").pathExists;
function createLink(srcpath, dstpath, callback) {
    function makeLink(srcpath, dstpath) {
        fs.link(srcpath, dstpath, (err)=>{
            if (err) return callback(err);
            callback(null);
        });
    }
    pathExists(dstpath, (err, destinationExists)=>{
        if (err) return callback(err);
        if (destinationExists) return callback(null);
        fs.lstat(srcpath, (err)=>{
            if (err) {
                err.message = err.message.replace('lstat', 'ensureLink');
                return callback(err);
            }
            const dir = path.dirname(dstpath);
            pathExists(dir, (err, dirExists)=>{
                if (err) return callback(err);
                if (dirExists) return makeLink(srcpath, dstpath);
                mkdir.mkdirs(dir, (err)=>{
                    if (err) return callback(err);
                    makeLink(srcpath, dstpath);
                });
            });
        });
    });
}
function createLinkSync(srcpath, dstpath) {
    const destinationExists = fs.existsSync(dstpath);
    if (destinationExists) return undefined;
    try {
        fs.lstatSync(srcpath);
    } catch (err) {
        err.message = err.message.replace('lstat', 'ensureLink');
        throw err;
    }
    const dir = path.dirname(dstpath);
    const dirExists = fs.existsSync(dir);
    if (dirExists) return fs.linkSync(srcpath, dstpath);
    mkdir.mkdirsSync(dir);
    return fs.linkSync(srcpath, dstpath);
}
module.exports = {
    createLink: u(createLink),
    createLinkSync
};

},{"1d3a26a2042f68d9":"dPfZv","e03b816e2c509fda":"path","ca3dc388b8827074":"73PYN","4b3e5f452b1f0443":"4pS5w","660e253caabd326b":"cOSta"}],"17j1l":[function(require,module,exports,__globalThis) {
'use strict';
const u = require("ee569077431ee66d").fromCallback;
const path = require("2b008136f635a8da");
const fs = require("54212e34a26aec9a");
const _mkdirs = require("4b9c728b626cd844");
const mkdirs = _mkdirs.mkdirs;
const mkdirsSync = _mkdirs.mkdirsSync;
const _symlinkPaths = require("6df23f49adf4b64c");
const symlinkPaths = _symlinkPaths.symlinkPaths;
const symlinkPathsSync = _symlinkPaths.symlinkPathsSync;
const _symlinkType = require("7d37124fc3f01a84");
const symlinkType = _symlinkType.symlinkType;
const symlinkTypeSync = _symlinkType.symlinkTypeSync;
const pathExists = require("79277ef182acdf63").pathExists;
function createSymlink(srcpath, dstpath, type, callback) {
    callback = typeof type === 'function' ? type : callback;
    type = typeof type === 'function' ? false : type;
    pathExists(dstpath, (err, destinationExists)=>{
        if (err) return callback(err);
        if (destinationExists) return callback(null);
        symlinkPaths(srcpath, dstpath, (err, relative)=>{
            if (err) return callback(err);
            srcpath = relative.toDst;
            symlinkType(relative.toCwd, type, (err, type)=>{
                if (err) return callback(err);
                const dir = path.dirname(dstpath);
                pathExists(dir, (err, dirExists)=>{
                    if (err) return callback(err);
                    if (dirExists) return fs.symlink(srcpath, dstpath, type, callback);
                    mkdirs(dir, (err)=>{
                        if (err) return callback(err);
                        fs.symlink(srcpath, dstpath, type, callback);
                    });
                });
            });
        });
    });
}
function createSymlinkSync(srcpath, dstpath, type) {
    const destinationExists = fs.existsSync(dstpath);
    if (destinationExists) return undefined;
    const relative = symlinkPathsSync(srcpath, dstpath);
    srcpath = relative.toDst;
    type = symlinkTypeSync(relative.toCwd, type);
    const dir = path.dirname(dstpath);
    const exists = fs.existsSync(dir);
    if (exists) return fs.symlinkSync(srcpath, dstpath, type);
    mkdirsSync(dir);
    return fs.symlinkSync(srcpath, dstpath, type);
}
module.exports = {
    createSymlink: u(createSymlink),
    createSymlinkSync
};

},{"ee569077431ee66d":"dPfZv","2b008136f635a8da":"path","54212e34a26aec9a":"73PYN","4b9c728b626cd844":"4pS5w","6df23f49adf4b64c":"3jXkR","7d37124fc3f01a84":"i5uBI","79277ef182acdf63":"cOSta"}],"3jXkR":[function(require,module,exports,__globalThis) {
'use strict';
const path = require("e979ab86e3dd56ae");
const fs = require("210955694d50890b");
const pathExists = require("3f11c7189af60f3b").pathExists;
/**
 * Function that returns two types of paths, one relative to symlink, and one
 * relative to the current working directory. Checks if path is absolute or
 * relative. If the path is relative, this function checks if the path is
 * relative to symlink or relative to current working directory. This is an
 * initiative to find a smarter `srcpath` to supply when building symlinks.
 * This allows you to determine which path to use out of one of three possible
 * types of source paths. The first is an absolute path. This is detected by
 * `path.isAbsolute()`. When an absolute path is provided, it is checked to
 * see if it exists. If it does it's used, if not an error is returned
 * (callback)/ thrown (sync). The other two options for `srcpath` are a
 * relative url. By default Node's `fs.symlink` works by creating a symlink
 * using `dstpath` and expects the `srcpath` to be relative to the newly
 * created symlink. If you provide a `srcpath` that does not exist on the file
 * system it results in a broken symlink. To minimize this, the function
 * checks to see if the 'relative to symlink' source file exists, and if it
 * does it will use it. If it does not, it checks if there's a file that
 * exists that is relative to the current working directory, if does its used.
 * This preserves the expectations of the original fs.symlink spec and adds
 * the ability to pass in `relative to current working direcotry` paths.
 */ function symlinkPaths(srcpath, dstpath, callback) {
    if (path.isAbsolute(srcpath)) return fs.lstat(srcpath, (err)=>{
        if (err) {
            err.message = err.message.replace('lstat', 'ensureSymlink');
            return callback(err);
        }
        return callback(null, {
            'toCwd': srcpath,
            'toDst': srcpath
        });
    });
    else {
        const dstdir = path.dirname(dstpath);
        const relativeToDst = path.join(dstdir, srcpath);
        return pathExists(relativeToDst, (err, exists)=>{
            if (err) return callback(err);
            if (exists) return callback(null, {
                'toCwd': relativeToDst,
                'toDst': srcpath
            });
            else return fs.lstat(srcpath, (err)=>{
                if (err) {
                    err.message = err.message.replace('lstat', 'ensureSymlink');
                    return callback(err);
                }
                return callback(null, {
                    'toCwd': srcpath,
                    'toDst': path.relative(dstdir, srcpath)
                });
            });
        });
    }
}
function symlinkPathsSync(srcpath, dstpath) {
    let exists;
    if (path.isAbsolute(srcpath)) {
        exists = fs.existsSync(srcpath);
        if (!exists) throw new Error('absolute srcpath does not exist');
        return {
            'toCwd': srcpath,
            'toDst': srcpath
        };
    } else {
        const dstdir = path.dirname(dstpath);
        const relativeToDst = path.join(dstdir, srcpath);
        exists = fs.existsSync(relativeToDst);
        if (exists) return {
            'toCwd': relativeToDst,
            'toDst': srcpath
        };
        else {
            exists = fs.existsSync(srcpath);
            if (!exists) throw new Error('relative srcpath does not exist');
            return {
                'toCwd': srcpath,
                'toDst': path.relative(dstdir, srcpath)
            };
        }
    }
}
module.exports = {
    symlinkPaths,
    symlinkPathsSync
};

},{"e979ab86e3dd56ae":"path","210955694d50890b":"73PYN","3f11c7189af60f3b":"cOSta"}],"i5uBI":[function(require,module,exports,__globalThis) {
'use strict';
const fs = require("9cc4a34b126f1ab0");
function symlinkType(srcpath, type, callback) {
    callback = typeof type === 'function' ? type : callback;
    type = typeof type === 'function' ? false : type;
    if (type) return callback(null, type);
    fs.lstat(srcpath, (err, stats)=>{
        if (err) return callback(null, 'file');
        type = stats && stats.isDirectory() ? 'dir' : 'file';
        callback(null, type);
    });
}
function symlinkTypeSync(srcpath, type) {
    let stats;
    if (type) return type;
    try {
        stats = fs.lstatSync(srcpath);
    } catch (e) {
        return 'file';
    }
    return stats && stats.isDirectory() ? 'dir' : 'file';
}
module.exports = {
    symlinkType,
    symlinkTypeSync
};

},{"9cc4a34b126f1ab0":"73PYN"}],"3uFKL":[function(require,module,exports,__globalThis) {
'use strict';
const u = require("923e9b950720dce8").fromCallback;
const jsonFile = require("756ef4810f10103a");
jsonFile.outputJson = u(require("461930fdbbd84833"));
jsonFile.outputJsonSync = require("4b96271be9737be0");
// aliases
jsonFile.outputJSON = jsonFile.outputJson;
jsonFile.outputJSONSync = jsonFile.outputJsonSync;
jsonFile.writeJSON = jsonFile.writeJson;
jsonFile.writeJSONSync = jsonFile.writeJsonSync;
jsonFile.readJSON = jsonFile.readJson;
jsonFile.readJSONSync = jsonFile.readJsonSync;
module.exports = jsonFile;

},{"923e9b950720dce8":"dPfZv","756ef4810f10103a":"jMH9s","461930fdbbd84833":"5xEK8","4b96271be9737be0":"cwMM3"}],"jMH9s":[function(require,module,exports,__globalThis) {
'use strict';
const u = require("29e51e94098c9dc1").fromCallback;
const jsonFile = require("e7612ad85eff7b1b");
module.exports = {
    // jsonfile exports
    readJson: u(jsonFile.readFile),
    readJsonSync: jsonFile.readFileSync,
    writeJson: u(jsonFile.writeFile),
    writeJsonSync: jsonFile.writeFileSync
};

},{"29e51e94098c9dc1":"dPfZv","e7612ad85eff7b1b":"4CwBt"}],"4CwBt":[function(require,module,exports,__globalThis) {
var _fs;
try {
    _fs = require("7e60935c0592984f");
} catch (_) {
    _fs = require("2124c508a1ba4733");
}
function readFile(file, options, callback) {
    if (callback == null) {
        callback = options;
        options = {};
    }
    if (typeof options === 'string') options = {
        encoding: options
    };
    options = options || {};
    var fs = options.fs || _fs;
    var shouldThrow = true;
    if ('throws' in options) shouldThrow = options.throws;
    fs.readFile(file, options, function(err, data) {
        if (err) return callback(err);
        data = stripBom(data);
        var obj;
        try {
            obj = JSON.parse(data, options ? options.reviver : null);
        } catch (err2) {
            if (shouldThrow) {
                err2.message = file + ': ' + err2.message;
                return callback(err2);
            } else return callback(null, null);
        }
        callback(null, obj);
    });
}
function readFileSync(file, options) {
    options = options || {};
    if (typeof options === 'string') options = {
        encoding: options
    };
    var fs = options.fs || _fs;
    var shouldThrow = true;
    if ('throws' in options) shouldThrow = options.throws;
    try {
        var content = fs.readFileSync(file, options);
        content = stripBom(content);
        return JSON.parse(content, options.reviver);
    } catch (err) {
        if (shouldThrow) {
            err.message = file + ': ' + err.message;
            throw err;
        } else return null;
    }
}
function stringify(obj, options) {
    var spaces;
    var EOL = '\n';
    if (typeof options === 'object' && options !== null) {
        if (options.spaces) spaces = options.spaces;
        if (options.EOL) EOL = options.EOL;
    }
    var str = JSON.stringify(obj, options ? options.replacer : null, spaces);
    return str.replace(/\n/g, EOL) + EOL;
}
function writeFile(file, obj, options, callback) {
    if (callback == null) {
        callback = options;
        options = {};
    }
    options = options || {};
    var fs = options.fs || _fs;
    var str = '';
    try {
        str = stringify(obj, options);
    } catch (err) {
        // Need to return whether a callback was passed or not
        if (callback) callback(err, null);
        return;
    }
    fs.writeFile(file, str, options, callback);
}
function writeFileSync(file, obj, options) {
    options = options || {};
    var fs = options.fs || _fs;
    var str = stringify(obj, options);
    // not sure if fs.writeFileSync returns anything, but just in case
    return fs.writeFileSync(file, str, options);
}
function stripBom(content) {
    // we do this because JSON.parse would convert it to a utf8 string if encoding wasn't specified
    if (Buffer.isBuffer(content)) content = content.toString('utf8');
    content = content.replace(/^\uFEFF/, '');
    return content;
}
var jsonfile = {
    readFile: readFile,
    readFileSync: readFileSync,
    writeFile: writeFile,
    writeFileSync: writeFileSync
};
module.exports = jsonfile;

},{"7e60935c0592984f":"i5UXa","2124c508a1ba4733":"fs"}],"i5UXa":[function(require,module,exports,__globalThis) {
var fs = require("6ffca454cc8bad68");
var polyfills = require("45af397b52e4eede");
var legacy = require("8ab5b5f31cea6be9");
var clone = require("208064dbb066dd6f");
var util = require("58b2c4e4921da186");
/* istanbul ignore next - node 0.x polyfill */ var gracefulQueue;
var previousSymbol;
/* istanbul ignore else - node 0.x polyfill */ if (typeof Symbol === 'function' && typeof Symbol.for === 'function') {
    gracefulQueue = Symbol.for('graceful-fs.queue');
    // This is used in testing by future versions
    previousSymbol = Symbol.for('graceful-fs.previous');
} else {
    gracefulQueue = '___graceful-fs.queue';
    previousSymbol = '___graceful-fs.previous';
}
function noop() {}
function publishQueue(context, queue) {
    Object.defineProperty(context, gracefulQueue, {
        get: function() {
            return queue;
        }
    });
}
var debug = noop;
if (util.debuglog) debug = util.debuglog('gfs4');
else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || '')) debug = function() {
    var m = util.format.apply(util, arguments);
    m = 'GFS4: ' + m.split(/\n/).join('\nGFS4: ');
    console.error(m);
};
// Once time initialization
if (!fs[gracefulQueue]) {
    // This queue can be shared by multiple loaded instances
    var queue = global[gracefulQueue] || [];
    publishQueue(fs, queue);
    // Patch fs.close/closeSync to shared queue version, because we need
    // to retry() whenever a close happens *anywhere* in the program.
    // This is essential when multiple graceful-fs instances are
    // in play at the same time.
    fs.close = function(fs$close) {
        function close(fd, cb) {
            return fs$close.call(fs, fd, function(err) {
                // This function uses the graceful-fs shared queue
                if (!err) resetQueue();
                if (typeof cb === 'function') cb.apply(this, arguments);
            });
        }
        Object.defineProperty(close, previousSymbol, {
            value: fs$close
        });
        return close;
    }(fs.close);
    fs.closeSync = function(fs$closeSync) {
        function closeSync(fd) {
            // This function uses the graceful-fs shared queue
            fs$closeSync.apply(fs, arguments);
            resetQueue();
        }
        Object.defineProperty(closeSync, previousSymbol, {
            value: fs$closeSync
        });
        return closeSync;
    }(fs.closeSync);
    if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || '')) process.on('exit', function() {
        debug(fs[gracefulQueue]);
        require("d0789acf86c85d89").equal(fs[gracefulQueue].length, 0);
    });
}
if (!global[gracefulQueue]) publishQueue(global, fs[gracefulQueue]);
module.exports = patch(clone(fs));
if (process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !fs.__patched) {
    module.exports = patch(fs);
    fs.__patched = true;
}
function patch(fs) {
    // Everything that references the open() function needs to be in here
    polyfills(fs);
    fs.gracefulify = patch;
    fs.createReadStream = createReadStream;
    fs.createWriteStream = createWriteStream;
    var fs$readFile = fs.readFile;
    fs.readFile = readFile;
    function readFile(path, options, cb) {
        if (typeof options === 'function') cb = options, options = null;
        return go$readFile(path, options, cb);
        function go$readFile(path, options, cb, startTime) {
            return fs$readFile(path, options, function(err) {
                if (err && (err.code === 'EMFILE' || err.code === 'ENFILE')) enqueue([
                    go$readFile,
                    [
                        path,
                        options,
                        cb
                    ],
                    err,
                    startTime || Date.now(),
                    Date.now()
                ]);
                else if (typeof cb === 'function') cb.apply(this, arguments);
            });
        }
    }
    var fs$writeFile = fs.writeFile;
    fs.writeFile = writeFile;
    function writeFile(path, data, options, cb) {
        if (typeof options === 'function') cb = options, options = null;
        return go$writeFile(path, data, options, cb);
        function go$writeFile(path, data, options, cb, startTime) {
            return fs$writeFile(path, data, options, function(err) {
                if (err && (err.code === 'EMFILE' || err.code === 'ENFILE')) enqueue([
                    go$writeFile,
                    [
                        path,
                        data,
                        options,
                        cb
                    ],
                    err,
                    startTime || Date.now(),
                    Date.now()
                ]);
                else if (typeof cb === 'function') cb.apply(this, arguments);
            });
        }
    }
    var fs$appendFile = fs.appendFile;
    if (fs$appendFile) fs.appendFile = appendFile;
    function appendFile(path, data, options, cb) {
        if (typeof options === 'function') cb = options, options = null;
        return go$appendFile(path, data, options, cb);
        function go$appendFile(path, data, options, cb, startTime) {
            return fs$appendFile(path, data, options, function(err) {
                if (err && (err.code === 'EMFILE' || err.code === 'ENFILE')) enqueue([
                    go$appendFile,
                    [
                        path,
                        data,
                        options,
                        cb
                    ],
                    err,
                    startTime || Date.now(),
                    Date.now()
                ]);
                else if (typeof cb === 'function') cb.apply(this, arguments);
            });
        }
    }
    var fs$copyFile = fs.copyFile;
    if (fs$copyFile) fs.copyFile = copyFile;
    function copyFile(src, dest, flags, cb) {
        if (typeof flags === 'function') {
            cb = flags;
            flags = 0;
        }
        return go$copyFile(src, dest, flags, cb);
        function go$copyFile(src, dest, flags, cb, startTime) {
            return fs$copyFile(src, dest, flags, function(err) {
                if (err && (err.code === 'EMFILE' || err.code === 'ENFILE')) enqueue([
                    go$copyFile,
                    [
                        src,
                        dest,
                        flags,
                        cb
                    ],
                    err,
                    startTime || Date.now(),
                    Date.now()
                ]);
                else if (typeof cb === 'function') cb.apply(this, arguments);
            });
        }
    }
    var fs$readdir = fs.readdir;
    fs.readdir = readdir;
    var noReaddirOptionVersions = /^v[0-5]\./;
    function readdir(path, options, cb) {
        if (typeof options === 'function') cb = options, options = null;
        var go$readdir = noReaddirOptionVersions.test(process.version) ? function go$readdir(path, options, cb, startTime) {
            return fs$readdir(path, fs$readdirCallback(path, options, cb, startTime));
        } : function go$readdir(path, options, cb, startTime) {
            return fs$readdir(path, options, fs$readdirCallback(path, options, cb, startTime));
        };
        return go$readdir(path, options, cb);
        function fs$readdirCallback(path, options, cb, startTime) {
            return function(err, files) {
                if (err && (err.code === 'EMFILE' || err.code === 'ENFILE')) enqueue([
                    go$readdir,
                    [
                        path,
                        options,
                        cb
                    ],
                    err,
                    startTime || Date.now(),
                    Date.now()
                ]);
                else {
                    if (files && files.sort) files.sort();
                    if (typeof cb === 'function') cb.call(this, err, files);
                }
            };
        }
    }
    if (process.version.substr(0, 4) === 'v0.8') {
        var legStreams = legacy(fs);
        ReadStream = legStreams.ReadStream;
        WriteStream = legStreams.WriteStream;
    }
    var fs$ReadStream = fs.ReadStream;
    if (fs$ReadStream) {
        ReadStream.prototype = Object.create(fs$ReadStream.prototype);
        ReadStream.prototype.open = ReadStream$open;
    }
    var fs$WriteStream = fs.WriteStream;
    if (fs$WriteStream) {
        WriteStream.prototype = Object.create(fs$WriteStream.prototype);
        WriteStream.prototype.open = WriteStream$open;
    }
    Object.defineProperty(fs, 'ReadStream', {
        get: function() {
            return ReadStream;
        },
        set: function(val) {
            ReadStream = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(fs, 'WriteStream', {
        get: function() {
            return WriteStream;
        },
        set: function(val) {
            WriteStream = val;
        },
        enumerable: true,
        configurable: true
    });
    // legacy names
    var FileReadStream = ReadStream;
    Object.defineProperty(fs, 'FileReadStream', {
        get: function() {
            return FileReadStream;
        },
        set: function(val) {
            FileReadStream = val;
        },
        enumerable: true,
        configurable: true
    });
    var FileWriteStream = WriteStream;
    Object.defineProperty(fs, 'FileWriteStream', {
        get: function() {
            return FileWriteStream;
        },
        set: function(val) {
            FileWriteStream = val;
        },
        enumerable: true,
        configurable: true
    });
    function ReadStream(path, options) {
        if (this instanceof ReadStream) return fs$ReadStream.apply(this, arguments), this;
        else return ReadStream.apply(Object.create(ReadStream.prototype), arguments);
    }
    function ReadStream$open() {
        var that = this;
        open(that.path, that.flags, that.mode, function(err, fd) {
            if (err) {
                if (that.autoClose) that.destroy();
                that.emit('error', err);
            } else {
                that.fd = fd;
                that.emit('open', fd);
                that.read();
            }
        });
    }
    function WriteStream(path, options) {
        if (this instanceof WriteStream) return fs$WriteStream.apply(this, arguments), this;
        else return WriteStream.apply(Object.create(WriteStream.prototype), arguments);
    }
    function WriteStream$open() {
        var that = this;
        open(that.path, that.flags, that.mode, function(err, fd) {
            if (err) {
                that.destroy();
                that.emit('error', err);
            } else {
                that.fd = fd;
                that.emit('open', fd);
            }
        });
    }
    function createReadStream(path, options) {
        return new fs.ReadStream(path, options);
    }
    function createWriteStream(path, options) {
        return new fs.WriteStream(path, options);
    }
    var fs$open = fs.open;
    fs.open = open;
    function open(path, flags, mode, cb) {
        if (typeof mode === 'function') cb = mode, mode = null;
        return go$open(path, flags, mode, cb);
        function go$open(path, flags, mode, cb, startTime) {
            return fs$open(path, flags, mode, function(err, fd) {
                if (err && (err.code === 'EMFILE' || err.code === 'ENFILE')) enqueue([
                    go$open,
                    [
                        path,
                        flags,
                        mode,
                        cb
                    ],
                    err,
                    startTime || Date.now(),
                    Date.now()
                ]);
                else if (typeof cb === 'function') cb.apply(this, arguments);
            });
        }
    }
    return fs;
}
function enqueue(elem) {
    debug('ENQUEUE', elem[0].name, elem[1]);
    fs[gracefulQueue].push(elem);
    retry();
}
// keep track of the timeout between retry() calls
var retryTimer;
// reset the startTime and lastTime to now
// this resets the start of the 60 second overall timeout as well as the
// delay between attempts so that we'll retry these jobs sooner
function resetQueue() {
    var now = Date.now();
    for(var i = 0; i < fs[gracefulQueue].length; ++i)// entries that are only a length of 2 are from an older version, don't
    // bother modifying those since they'll be retried anyway.
    if (fs[gracefulQueue][i].length > 2) {
        fs[gracefulQueue][i][3] = now // startTime
        ;
        fs[gracefulQueue][i][4] = now // lastTime
        ;
    }
    // call retry to make sure we're actively processing the queue
    retry();
}
function retry() {
    // clear the timer and remove it to help prevent unintended concurrency
    clearTimeout(retryTimer);
    retryTimer = undefined;
    if (fs[gracefulQueue].length === 0) return;
    var elem = fs[gracefulQueue].shift();
    var fn = elem[0];
    var args = elem[1];
    // these items may be unset if they were added by an older graceful-fs
    var err = elem[2];
    var startTime = elem[3];
    var lastTime = elem[4];
    // if we don't have a startTime we have no way of knowing if we've waited
    // long enough, so go ahead and retry this item now
    if (startTime === undefined) {
        debug('RETRY', fn.name, args);
        fn.apply(null, args);
    } else if (Date.now() - startTime >= 60000) {
        // it's been more than 60 seconds total, bail now
        debug('TIMEOUT', fn.name, args);
        var cb = args.pop();
        if (typeof cb === 'function') cb.call(null, err);
    } else {
        // the amount of time between the last attempt and right now
        var sinceAttempt = Date.now() - lastTime;
        // the amount of time between when we first tried, and when we last tried
        // rounded up to at least 1
        var sinceStart = Math.max(lastTime - startTime, 1);
        // backoff. wait longer than the total time we've been retrying, but only
        // up to a maximum of 100ms
        var desiredDelay = Math.min(sinceStart * 1.2, 100);
        // it's been long enough since the last retry, do it again
        if (sinceAttempt >= desiredDelay) {
            debug('RETRY', fn.name, args);
            fn.apply(null, args.concat([
                startTime
            ]));
        } else // if we can't do this job yet, push it to the end of the queue
        // and let the next iteration check again
        fs[gracefulQueue].push(elem);
    }
    // schedule our next run if one isn't already scheduled
    if (retryTimer === undefined) retryTimer = setTimeout(retry, 0);
}

},{"6ffca454cc8bad68":"fs","45af397b52e4eede":"4blWd","8ab5b5f31cea6be9":"47A8m","208064dbb066dd6f":"1yWqU","58b2c4e4921da186":"util","d0789acf86c85d89":"assert"}],"4blWd":[function(require,module,exports,__globalThis) {
var constants = require("d3b419d8b616c6e3");
var origCwd = process.cwd;
var cwd = null;
var platform = process.env.GRACEFUL_FS_PLATFORM || process.platform;
process.cwd = function() {
    if (!cwd) cwd = origCwd.call(process);
    return cwd;
};
try {
    process.cwd();
} catch (er) {}
// This check is needed until node.js 12 is required
if (typeof process.chdir === 'function') {
    var chdir = process.chdir;
    process.chdir = function(d) {
        cwd = null;
        chdir.call(process, d);
    };
    if (Object.setPrototypeOf) Object.setPrototypeOf(process.chdir, chdir);
}
module.exports = patch;
function patch(fs) {
    // (re-)implement some things that are known busted or missing.
    // lchmod, broken prior to 0.6.2
    // back-port the fix here.
    if (constants.hasOwnProperty('O_SYMLINK') && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./)) patchLchmod(fs);
    // lutimes implementation, or no-op
    if (!fs.lutimes) patchLutimes(fs);
    // https://github.com/isaacs/node-graceful-fs/issues/4
    // Chown should not fail on einval or eperm if non-root.
    // It should not fail on enosys ever, as this just indicates
    // that a fs doesn't support the intended operation.
    fs.chown = chownFix(fs.chown);
    fs.fchown = chownFix(fs.fchown);
    fs.lchown = chownFix(fs.lchown);
    fs.chmod = chmodFix(fs.chmod);
    fs.fchmod = chmodFix(fs.fchmod);
    fs.lchmod = chmodFix(fs.lchmod);
    fs.chownSync = chownFixSync(fs.chownSync);
    fs.fchownSync = chownFixSync(fs.fchownSync);
    fs.lchownSync = chownFixSync(fs.lchownSync);
    fs.chmodSync = chmodFixSync(fs.chmodSync);
    fs.fchmodSync = chmodFixSync(fs.fchmodSync);
    fs.lchmodSync = chmodFixSync(fs.lchmodSync);
    fs.stat = statFix(fs.stat);
    fs.fstat = statFix(fs.fstat);
    fs.lstat = statFix(fs.lstat);
    fs.statSync = statFixSync(fs.statSync);
    fs.fstatSync = statFixSync(fs.fstatSync);
    fs.lstatSync = statFixSync(fs.lstatSync);
    // if lchmod/lchown do not exist, then make them no-ops
    if (fs.chmod && !fs.lchmod) {
        fs.lchmod = function(path, mode, cb) {
            if (cb) process.nextTick(cb);
        };
        fs.lchmodSync = function() {};
    }
    if (fs.chown && !fs.lchown) {
        fs.lchown = function(path, uid, gid, cb) {
            if (cb) process.nextTick(cb);
        };
        fs.lchownSync = function() {};
    }
    // on Windows, A/V software can lock the directory, causing this
    // to fail with an EACCES or EPERM if the directory contains newly
    // created files.  Try again on failure, for up to 60 seconds.
    // Set the timeout this long because some Windows Anti-Virus, such as Parity
    // bit9, may lock files for up to a minute, causing npm package install
    // failures. Also, take care to yield the scheduler. Windows scheduling gives
    // CPU to a busy looping process, which can cause the program causing the lock
    // contention to be starved of CPU by node, so the contention doesn't resolve.
    if (platform === "win32") fs.rename = typeof fs.rename !== 'function' ? fs.rename : function(fs$rename) {
        function rename(from, to, cb) {
            var start = Date.now();
            var backoff = 0;
            fs$rename(from, to, function CB(er) {
                if (er && (er.code === "EACCES" || er.code === "EPERM" || er.code === "EBUSY") && Date.now() - start < 60000) {
                    setTimeout(function() {
                        fs.stat(to, function(stater, st) {
                            if (stater && stater.code === "ENOENT") fs$rename(from, to, CB);
                            else cb(er);
                        });
                    }, backoff);
                    if (backoff < 100) backoff += 10;
                    return;
                }
                if (cb) cb(er);
            });
        }
        if (Object.setPrototypeOf) Object.setPrototypeOf(rename, fs$rename);
        return rename;
    }(fs.rename);
    // if read() returns EAGAIN, then just try it again.
    fs.read = typeof fs.read !== 'function' ? fs.read : function(fs$read) {
        function read(fd, buffer, offset, length, position, callback_) {
            var callback;
            if (callback_ && typeof callback_ === 'function') {
                var eagCounter = 0;
                callback = function(er, _, __) {
                    if (er && er.code === 'EAGAIN' && eagCounter < 10) {
                        eagCounter++;
                        return fs$read.call(fs, fd, buffer, offset, length, position, callback);
                    }
                    callback_.apply(this, arguments);
                };
            }
            return fs$read.call(fs, fd, buffer, offset, length, position, callback);
        }
        // This ensures `util.promisify` works as it does for native `fs.read`.
        if (Object.setPrototypeOf) Object.setPrototypeOf(read, fs$read);
        return read;
    }(fs.read);
    fs.readSync = typeof fs.readSync !== 'function' ? fs.readSync : function(fs$readSync) {
        return function(fd, buffer, offset, length, position) {
            var eagCounter = 0;
            while(true)try {
                return fs$readSync.call(fs, fd, buffer, offset, length, position);
            } catch (er) {
                if (er.code === 'EAGAIN' && eagCounter < 10) {
                    eagCounter++;
                    continue;
                }
                throw er;
            }
        };
    }(fs.readSync);
    function patchLchmod(fs) {
        fs.lchmod = function(path, mode, callback) {
            fs.open(path, constants.O_WRONLY | constants.O_SYMLINK, mode, function(err, fd) {
                if (err) {
                    if (callback) callback(err);
                    return;
                }
                // prefer to return the chmod error, if one occurs,
                // but still try to close, and report closing errors if they occur.
                fs.fchmod(fd, mode, function(err) {
                    fs.close(fd, function(err2) {
                        if (callback) callback(err || err2);
                    });
                });
            });
        };
        fs.lchmodSync = function(path, mode) {
            var fd = fs.openSync(path, constants.O_WRONLY | constants.O_SYMLINK, mode);
            // prefer to return the chmod error, if one occurs,
            // but still try to close, and report closing errors if they occur.
            var threw = true;
            var ret;
            try {
                ret = fs.fchmodSync(fd, mode);
                threw = false;
            } finally{
                if (threw) try {
                    fs.closeSync(fd);
                } catch (er) {}
                else fs.closeSync(fd);
            }
            return ret;
        };
    }
    function patchLutimes(fs) {
        if (constants.hasOwnProperty("O_SYMLINK") && fs.futimes) {
            fs.lutimes = function(path, at, mt, cb) {
                fs.open(path, constants.O_SYMLINK, function(er, fd) {
                    if (er) {
                        if (cb) cb(er);
                        return;
                    }
                    fs.futimes(fd, at, mt, function(er) {
                        fs.close(fd, function(er2) {
                            if (cb) cb(er || er2);
                        });
                    });
                });
            };
            fs.lutimesSync = function(path, at, mt) {
                var fd = fs.openSync(path, constants.O_SYMLINK);
                var ret;
                var threw = true;
                try {
                    ret = fs.futimesSync(fd, at, mt);
                    threw = false;
                } finally{
                    if (threw) try {
                        fs.closeSync(fd);
                    } catch (er) {}
                    else fs.closeSync(fd);
                }
                return ret;
            };
        } else if (fs.futimes) {
            fs.lutimes = function(_a, _b, _c, cb) {
                if (cb) process.nextTick(cb);
            };
            fs.lutimesSync = function() {};
        }
    }
    function chmodFix(orig) {
        if (!orig) return orig;
        return function(target, mode, cb) {
            return orig.call(fs, target, mode, function(er) {
                if (chownErOk(er)) er = null;
                if (cb) cb.apply(this, arguments);
            });
        };
    }
    function chmodFixSync(orig) {
        if (!orig) return orig;
        return function(target, mode) {
            try {
                return orig.call(fs, target, mode);
            } catch (er) {
                if (!chownErOk(er)) throw er;
            }
        };
    }
    function chownFix(orig) {
        if (!orig) return orig;
        return function(target, uid, gid, cb) {
            return orig.call(fs, target, uid, gid, function(er) {
                if (chownErOk(er)) er = null;
                if (cb) cb.apply(this, arguments);
            });
        };
    }
    function chownFixSync(orig) {
        if (!orig) return orig;
        return function(target, uid, gid) {
            try {
                return orig.call(fs, target, uid, gid);
            } catch (er) {
                if (!chownErOk(er)) throw er;
            }
        };
    }
    function statFix(orig) {
        if (!orig) return orig;
        // Older versions of Node erroneously returned signed integers for
        // uid + gid.
        return function(target, options, cb) {
            if (typeof options === 'function') {
                cb = options;
                options = null;
            }
            function callback(er, stats) {
                if (stats) {
                    if (stats.uid < 0) stats.uid += 0x100000000;
                    if (stats.gid < 0) stats.gid += 0x100000000;
                }
                if (cb) cb.apply(this, arguments);
            }
            return options ? orig.call(fs, target, options, callback) : orig.call(fs, target, callback);
        };
    }
    function statFixSync(orig) {
        if (!orig) return orig;
        // Older versions of Node erroneously returned signed integers for
        // uid + gid.
        return function(target, options) {
            var stats = options ? orig.call(fs, target, options) : orig.call(fs, target);
            if (stats) {
                if (stats.uid < 0) stats.uid += 0x100000000;
                if (stats.gid < 0) stats.gid += 0x100000000;
            }
            return stats;
        };
    }
    // ENOSYS means that the fs doesn't support the op. Just ignore
    // that, because it doesn't matter.
    //
    // if there's no getuid, or if getuid() is something other
    // than 0, and the error is EINVAL or EPERM, then just ignore
    // it.
    //
    // This specific case is a silent failure in cp, install, tar,
    // and most other unix tools that manage permissions.
    //
    // When running as root, or if other types of errors are
    // encountered, then it's strict.
    function chownErOk(er) {
        if (!er) return true;
        if (er.code === "ENOSYS") return true;
        var nonroot = !process.getuid || process.getuid() !== 0;
        if (nonroot) {
            if (er.code === "EINVAL" || er.code === "EPERM") return true;
        }
        return false;
    }
}

},{"d3b419d8b616c6e3":"constants"}],"47A8m":[function(require,module,exports,__globalThis) {
var Stream = require("bc29b518e991b190").Stream;
module.exports = legacy;
function legacy(fs) {
    return {
        ReadStream: ReadStream,
        WriteStream: WriteStream
    };
    function ReadStream(path, options) {
        if (!(this instanceof ReadStream)) return new ReadStream(path, options);
        Stream.call(this);
        var self = this;
        this.path = path;
        this.fd = null;
        this.readable = true;
        this.paused = false;
        this.flags = 'r';
        this.mode = 438; /*=0666*/ 
        this.bufferSize = 65536;
        options = options || {};
        // Mixin options into this
        var keys = Object.keys(options);
        for(var index = 0, length = keys.length; index < length; index++){
            var key = keys[index];
            this[key] = options[key];
        }
        if (this.encoding) this.setEncoding(this.encoding);
        if (this.start !== undefined) {
            if ('number' !== typeof this.start) throw TypeError('start must be a Number');
            if (this.end === undefined) this.end = Infinity;
            else if ('number' !== typeof this.end) throw TypeError('end must be a Number');
            if (this.start > this.end) throw new Error('start must be <= end');
            this.pos = this.start;
        }
        if (this.fd !== null) {
            process.nextTick(function() {
                self._read();
            });
            return;
        }
        fs.open(this.path, this.flags, this.mode, function(err, fd) {
            if (err) {
                self.emit('error', err);
                self.readable = false;
                return;
            }
            self.fd = fd;
            self.emit('open', fd);
            self._read();
        });
    }
    function WriteStream(path, options) {
        if (!(this instanceof WriteStream)) return new WriteStream(path, options);
        Stream.call(this);
        this.path = path;
        this.fd = null;
        this.writable = true;
        this.flags = 'w';
        this.encoding = 'binary';
        this.mode = 438; /*=0666*/ 
        this.bytesWritten = 0;
        options = options || {};
        // Mixin options into this
        var keys = Object.keys(options);
        for(var index = 0, length = keys.length; index < length; index++){
            var key = keys[index];
            this[key] = options[key];
        }
        if (this.start !== undefined) {
            if ('number' !== typeof this.start) throw TypeError('start must be a Number');
            if (this.start < 0) throw new Error('start must be >= zero');
            this.pos = this.start;
        }
        this.busy = false;
        this._queue = [];
        if (this.fd === null) {
            this._open = fs.open;
            this._queue.push([
                this._open,
                this.path,
                this.flags,
                this.mode,
                undefined
            ]);
            this.flush();
        }
    }
}

},{"bc29b518e991b190":"stream"}],"1yWqU":[function(require,module,exports,__globalThis) {
'use strict';
module.exports = clone;
var getPrototypeOf = Object.getPrototypeOf || function(obj) {
    return obj.__proto__;
};
function clone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Object) var copy = {
        __proto__: getPrototypeOf(obj)
    };
    else var copy = Object.create(null);
    Object.getOwnPropertyNames(obj).forEach(function(key) {
        Object.defineProperty(copy, key, Object.getOwnPropertyDescriptor(obj, key));
    });
    return copy;
}

},{}],"5xEK8":[function(require,module,exports,__globalThis) {
'use strict';
const path = require("4a04949ac8825fae");
const mkdir = require("5b52f2450006afdb");
const pathExists = require("26c8db412f67a109").pathExists;
const jsonFile = require("b7b9be028dc05cb7");
function outputJson(file, data, options, callback) {
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }
    const dir = path.dirname(file);
    pathExists(dir, (err, itDoes)=>{
        if (err) return callback(err);
        if (itDoes) return jsonFile.writeJson(file, data, options, callback);
        mkdir.mkdirs(dir, (err)=>{
            if (err) return callback(err);
            jsonFile.writeJson(file, data, options, callback);
        });
    });
}
module.exports = outputJson;

},{"4a04949ac8825fae":"path","5b52f2450006afdb":"4pS5w","26c8db412f67a109":"cOSta","b7b9be028dc05cb7":"jMH9s"}],"cwMM3":[function(require,module,exports,__globalThis) {
'use strict';
const fs = require("4ddeba2a1d9bd3ed");
const path = require("1fa68c83bbf94d67");
const mkdir = require("7cfd9f1e1574af73");
const jsonFile = require("d52df1644b79f6b6");
function outputJsonSync(file, data, options) {
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) mkdir.mkdirsSync(dir);
    jsonFile.writeJsonSync(file, data, options);
}
module.exports = outputJsonSync;

},{"4ddeba2a1d9bd3ed":"73PYN","1fa68c83bbf94d67":"path","7cfd9f1e1574af73":"4pS5w","d52df1644b79f6b6":"jMH9s"}],"kavDg":[function(require,module,exports,__globalThis) {
'use strict';
module.exports = {
    moveSync: require("d7620bc8471d78cc")
};

},{"d7620bc8471d78cc":"jORDd"}],"jORDd":[function(require,module,exports,__globalThis) {
'use strict';
const fs = require("438de57fe28cfad4");
const path = require("e9e1e259b252cada");
const copySync = require("ce13d0fe7e259389").copySync;
const removeSync = require("74dd9f0698e5eeec").removeSync;
const mkdirpSync = require("62a83d03aaffa900").mkdirpSync;
const stat = require("1fe487fc64f578cc");
function moveSync(src, dest, opts) {
    opts = opts || {};
    const overwrite = opts.overwrite || opts.clobber || false;
    const { srcStat } = stat.checkPathsSync(src, dest, 'move');
    stat.checkParentPathsSync(src, srcStat, dest, 'move');
    mkdirpSync(path.dirname(dest));
    return doRename(src, dest, overwrite);
}
function doRename(src, dest, overwrite) {
    if (overwrite) {
        removeSync(dest);
        return rename(src, dest, overwrite);
    }
    if (fs.existsSync(dest)) throw new Error('dest already exists.');
    return rename(src, dest, overwrite);
}
function rename(src, dest, overwrite) {
    try {
        fs.renameSync(src, dest);
    } catch (err) {
        if (err.code !== 'EXDEV') throw err;
        return moveAcrossDevice(src, dest, overwrite);
    }
}
function moveAcrossDevice(src, dest, overwrite) {
    const opts = {
        overwrite,
        errorOnExist: true
    };
    copySync(src, dest, opts);
    return removeSync(src);
}
module.exports = moveSync;

},{"438de57fe28cfad4":"73PYN","e9e1e259b252cada":"path","ce13d0fe7e259389":"fRiU4","74dd9f0698e5eeec":"k1WVQ","62a83d03aaffa900":"4pS5w","1fe487fc64f578cc":"2g5m7"}],"2cCXb":[function(require,module,exports,__globalThis) {
'use strict';
const u = require("82689688ee3fe7af").fromCallback;
module.exports = {
    move: u(require("aaf533696347067c"))
};

},{"82689688ee3fe7af":"dPfZv","aaf533696347067c":"bznJ7"}],"bznJ7":[function(require,module,exports,__globalThis) {
'use strict';
const fs = require("141496b0849bd442");
const path = require("abfe4310535ebd18");
const copy = require("89cf9d77a6e175c6").copy;
const remove = require("c9ff4c6c903bb6d1").remove;
const mkdirp = require("e032c6517514bec8").mkdirp;
const pathExists = require("fa1c3974e0e4df66").pathExists;
const stat = require("b01e0b07ca0cf760");
function move(src, dest, opts, cb) {
    if (typeof opts === 'function') {
        cb = opts;
        opts = {};
    }
    const overwrite = opts.overwrite || opts.clobber || false;
    stat.checkPaths(src, dest, 'move', (err, stats)=>{
        if (err) return cb(err);
        const { srcStat } = stats;
        stat.checkParentPaths(src, srcStat, dest, 'move', (err)=>{
            if (err) return cb(err);
            mkdirp(path.dirname(dest), (err)=>{
                if (err) return cb(err);
                return doRename(src, dest, overwrite, cb);
            });
        });
    });
}
function doRename(src, dest, overwrite, cb) {
    if (overwrite) return remove(dest, (err)=>{
        if (err) return cb(err);
        return rename(src, dest, overwrite, cb);
    });
    pathExists(dest, (err, destExists)=>{
        if (err) return cb(err);
        if (destExists) return cb(new Error('dest already exists.'));
        return rename(src, dest, overwrite, cb);
    });
}
function rename(src, dest, overwrite, cb) {
    fs.rename(src, dest, (err)=>{
        if (!err) return cb();
        if (err.code !== 'EXDEV') return cb(err);
        return moveAcrossDevice(src, dest, overwrite, cb);
    });
}
function moveAcrossDevice(src, dest, overwrite, cb) {
    const opts = {
        overwrite,
        errorOnExist: true
    };
    copy(src, dest, opts, (err)=>{
        if (err) return cb(err);
        return remove(src, cb);
    });
}
module.exports = move;

},{"141496b0849bd442":"73PYN","abfe4310535ebd18":"path","89cf9d77a6e175c6":"fADug","c9ff4c6c903bb6d1":"k1WVQ","e032c6517514bec8":"4pS5w","fa1c3974e0e4df66":"cOSta","b01e0b07ca0cf760":"2g5m7"}],"lUdwg":[function(require,module,exports,__globalThis) {
'use strict';
const u = require("72f9760952ca9378").fromCallback;
const fs = require("7901ac504be33894");
const path = require("305f9dba163d9445");
const mkdir = require("6bd09f361d1d4dc7");
const pathExists = require("b0b0e49948f86cfb").pathExists;
function outputFile(file, data, encoding, callback) {
    if (typeof encoding === 'function') {
        callback = encoding;
        encoding = 'utf8';
    }
    const dir = path.dirname(file);
    pathExists(dir, (err, itDoes)=>{
        if (err) return callback(err);
        if (itDoes) return fs.writeFile(file, data, encoding, callback);
        mkdir.mkdirs(dir, (err)=>{
            if (err) return callback(err);
            fs.writeFile(file, data, encoding, callback);
        });
    });
}
function outputFileSync(file, ...args) {
    const dir = path.dirname(file);
    if (fs.existsSync(dir)) return fs.writeFileSync(file, ...args);
    mkdir.mkdirsSync(dir);
    fs.writeFileSync(file, ...args);
}
module.exports = {
    outputFile: u(outputFile),
    outputFileSync
};

},{"72f9760952ca9378":"dPfZv","7901ac504be33894":"73PYN","305f9dba163d9445":"path","6bd09f361d1d4dc7":"4pS5w","b0b0e49948f86cfb":"cOSta"}],"eUnhI":[function(require,module,exports,__globalThis) {
"use strict";
/**
 * Error subclass to use when the source does not exist at the specified endpoint.
 *
 * @param {String} message optional "message" property to set
 * @api protected
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
class NotFoundError extends Error {
    constructor(message){
        super(message || 'File does not exist at the specified endpoint');
        this.code = 'ENOTFOUND';
    }
}
exports.default = NotFoundError;

},{}],"ekuhZ":[function(require,module,exports,__globalThis) {
"use strict";
var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        "default": mod
    };
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ftp = void 0;
const basic_ftp_1 = require("898fd0534f7285f6");
const stream_1 = require("58960887a4ff5bf8");
const path_1 = require("491e1b658f1b869");
const debug_1 = __importDefault(require("a12299284af3f749"));
const notfound_1 = __importDefault(require("5ef6fe20f3536c8e"));
const notmodified_1 = __importDefault(require("3749b92645284729"));
const debug = (0, debug_1.default)('get-uri:ftp');
/**
 * Returns a Readable stream from an "ftp:" URI.
 */ const ftp = async (url, opts = {})=>{
    const { cache } = opts;
    const filepath = decodeURIComponent(url.pathname);
    let lastModified;
    if (!filepath) throw new TypeError('No "pathname"!');
    const client = new basic_ftp_1.Client();
    try {
        const host = url.hostname || url.host || 'localhost';
        const port = parseInt(url.port || '0', 10) || 21;
        const user = url.username ? decodeURIComponent(url.username) : undefined;
        const password = url.password ? decodeURIComponent(url.password) : undefined;
        await client.access({
            host,
            port,
            user,
            password,
            ...opts
        });
        // first we have to figure out the Last Modified date.
        // try the MDTM command first, which is an optional extension command.
        try {
            lastModified = await client.lastMod(filepath);
        } catch (err) {
            // handle the "file not found" error code
            if (err.code === 550) throw new notfound_1.default();
        }
        if (!lastModified) {
            // Try to get the last modified date via the LIST command (uses
            // more bandwidth, but is more compatible with older FTP servers
            const list = await client.list((0, path_1.dirname)(filepath));
            // attempt to find the "entry" with a matching "name"
            const name = (0, path_1.basename)(filepath);
            const entry = list.find((e)=>e.name === name);
            if (entry) lastModified = entry.modifiedAt;
        }
        if (lastModified) {
            if (isNotModified()) throw new notmodified_1.default();
        } else throw new notfound_1.default();
        const stream = new stream_1.PassThrough();
        const rs = stream;
        client.downloadTo(stream, filepath).then((result)=>{
            debug(result.message);
            client.close();
        });
        rs.lastModified = lastModified;
        return rs;
    } catch (err) {
        client.close();
        throw err;
    }
    // called when `lastModified` is set, and a "cache" stream was provided
    function isNotModified() {
        if (cache?.lastModified && lastModified) return +cache.lastModified === +lastModified;
        return false;
    }
};
exports.ftp = ftp;

},{"898fd0534f7285f6":"kF2eq","58960887a4ff5bf8":"stream","491e1b658f1b869":"path","a12299284af3f749":"gxWnv","5ef6fe20f3536c8e":"eUnhI","3749b92645284729":"6jlj1"}],"kF2eq":[function(require,module,exports,__globalThis) {
"use strict";
var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
        enumerable: true,
        get: function() {
            return m[k];
        }
    };
    Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __exportStar = this && this.__exportStar || function(m, exports1) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports1, p)) __createBinding(exports1, m, p);
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.enterPassiveModeIPv6 = exports.enterPassiveModeIPv4 = void 0;
/**
 * Public API
 */ __exportStar(require("b1c576accb3ceae3"), exports);
__exportStar(require("1d7f543b918cb5bf"), exports);
__exportStar(require("e6ac8541201c2d3d"), exports);
__exportStar(require("944c09f9c4c11469"), exports);
__exportStar(require("c65c33b35d53d8d"), exports);
var transfer_1 = require("a54499c8675e690");
Object.defineProperty(exports, "enterPassiveModeIPv4", {
    enumerable: true,
    get: function() {
        return transfer_1.enterPassiveModeIPv4;
    }
});
Object.defineProperty(exports, "enterPassiveModeIPv6", {
    enumerable: true,
    get: function() {
        return transfer_1.enterPassiveModeIPv6;
    }
});

},{"b1c576accb3ceae3":"b5Url","1d7f543b918cb5bf":"kGOvN","e6ac8541201c2d3d":"5qjqA","944c09f9c4c11469":"eV6Ya","c65c33b35d53d8d":"5v5mP","a54499c8675e690":"h0jnw"}],"b5Url":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Client = void 0;
const fs_1 = require("c4216f9df743e6cc");
const path_1 = require("d77000995cd246f8");
const tls_1 = require("8a0a5c8d1bd383f8");
const util_1 = require("a5249acb38689333");
const FtpContext_1 = require("3be3f7387cb959ee");
const parseList_1 = require("9ae47729fa474e1d");
const ProgressTracker_1 = require("adc91663c44a0547");
const StringWriter_1 = require("69b0251adda1799f");
const parseListMLSD_1 = require("7a4b57fc3f28492a");
const netUtils_1 = require("3388f7d7d314453d");
const transfer_1 = require("58cfe6ae6cb5f71c");
const parseControlResponse_1 = require("15e5a95a094f7a");
// Use promisify to keep the library compatible with Node 8.
const fsReadDir = (0, util_1.promisify)(fs_1.readdir);
const fsMkDir = (0, util_1.promisify)(fs_1.mkdir);
const fsStat = (0, util_1.promisify)(fs_1.stat);
const fsOpen = (0, util_1.promisify)(fs_1.open);
const fsClose = (0, util_1.promisify)(fs_1.close);
const fsUnlink = (0, util_1.promisify)(fs_1.unlink);
const LIST_COMMANDS_DEFAULT = [
    "LIST -a",
    "LIST"
];
const LIST_COMMANDS_MLSD = [
    "MLSD",
    "LIST -a",
    "LIST"
];
/**
 * High-level API to interact with an FTP server.
 */ class Client {
    /**
     * Instantiate an FTP client.
     *
     * @param timeout  Timeout in milliseconds, use 0 for no timeout. Optional, default is 30 seconds.
     */ constructor(timeout = 30000){
        this.availableListCommands = LIST_COMMANDS_DEFAULT;
        this.ftp = new FtpContext_1.FTPContext(timeout);
        this.prepareTransfer = this._enterFirstCompatibleMode([
            transfer_1.enterPassiveModeIPv6,
            transfer_1.enterPassiveModeIPv4
        ]);
        this.parseList = parseList_1.parseList;
        this._progressTracker = new ProgressTracker_1.ProgressTracker();
    }
    /**
     * Close the client and all open socket connections.
     *
     * Close the client and all open socket connections. The client can’t be used anymore after calling this method,
     * you have to either reconnect with `access` or `connect` or instantiate a new instance to continue any work.
     * A client is also closed automatically if any timeout or connection error occurs.
     */ close() {
        this.ftp.close();
        this._progressTracker.stop();
    }
    /**
     * Returns true if the client is closed and can't be used anymore.
     */ get closed() {
        return this.ftp.closed;
    }
    /**
     * Connect (or reconnect) to an FTP server.
     *
     * This is an instance method and thus can be called multiple times during the lifecycle of a `Client`
     * instance. Whenever you do, the client is reset with a new control connection. This also implies that
     * you can reopen a `Client` instance that has been closed due to an error when reconnecting with this
     * method. In fact, reconnecting is the only way to continue using a closed `Client`.
     *
     * @param host  Host the client should connect to. Optional, default is "localhost".
     * @param port  Port the client should connect to. Optional, default is 21.
     */ connect(host = "localhost", port = 21) {
        this.ftp.reset();
        this.ftp.socket.connect({
            host,
            port,
            family: this.ftp.ipFamily
        }, ()=>this.ftp.log(`Connected to ${(0, netUtils_1.describeAddress)(this.ftp.socket)} (${(0, netUtils_1.describeTLS)(this.ftp.socket)})`));
        return this._handleConnectResponse();
    }
    /**
     * As `connect` but using implicit TLS. Implicit TLS is not an FTP standard and has been replaced by
     * explicit TLS. There are still FTP servers that support only implicit TLS, though.
     */ connectImplicitTLS(host = "localhost", port = 21, tlsOptions = {}) {
        this.ftp.reset();
        this.ftp.socket = (0, tls_1.connect)(port, host, tlsOptions, ()=>this.ftp.log(`Connected to ${(0, netUtils_1.describeAddress)(this.ftp.socket)} (${(0, netUtils_1.describeTLS)(this.ftp.socket)})`));
        this.ftp.tlsOptions = tlsOptions;
        return this._handleConnectResponse();
    }
    /**
     * Handles the first reponse by an FTP server after the socket connection has been established.
     */ _handleConnectResponse() {
        return this.ftp.handle(undefined, (res, task)=>{
            if (res instanceof Error) // The connection has been destroyed by the FTPContext at this point.
            task.reject(res);
            else if ((0, parseControlResponse_1.positiveCompletion)(res.code)) task.resolve(res);
            else // Don't stay connected but don't replace the socket yet by using reset()
            // so the user can inspect properties of this instance.
            task.reject(new FtpContext_1.FTPError(res));
        });
    }
    /**
     * Send an FTP command and handle the first response.
     */ send(command, ignoreErrorCodesDEPRECATED = false) {
        if (ignoreErrorCodesDEPRECATED) {
            this.ftp.log("Deprecated call using send(command, flag) with boolean flag to ignore errors. Use sendIgnoringError(command).");
            return this.sendIgnoringError(command);
        }
        return this.ftp.request(command);
    }
    /**
     * Send an FTP command and ignore an FTP error response. Any other kind of error or timeout will still reject the Promise.
     *
     * @param command
     */ sendIgnoringError(command) {
        return this.ftp.handle(command, (res, task)=>{
            if (res instanceof FtpContext_1.FTPError) task.resolve({
                code: res.code,
                message: res.message
            });
            else if (res instanceof Error) task.reject(res);
            else task.resolve(res);
        });
    }
    /**
     * Upgrade the current socket connection to TLS.
     *
     * @param options  TLS options as in `tls.connect(options)`, optional.
     * @param command  Set the authentication command. Optional, default is "AUTH TLS".
     */ async useTLS(options = {}, command = "AUTH TLS") {
        const ret = await this.send(command);
        this.ftp.socket = await (0, netUtils_1.upgradeSocket)(this.ftp.socket, options);
        this.ftp.tlsOptions = options; // Keep the TLS options for later data connections that should use the same options.
        this.ftp.log(`Control socket is using: ${(0, netUtils_1.describeTLS)(this.ftp.socket)}`);
        return ret;
    }
    /**
     * Login a user with a password.
     *
     * @param user  Username to use for login. Optional, default is "anonymous".
     * @param password  Password to use for login. Optional, default is "guest".
     */ login(user = "anonymous", password = "guest") {
        this.ftp.log(`Login security: ${(0, netUtils_1.describeTLS)(this.ftp.socket)}`);
        return this.ftp.handle("USER " + user, (res, task)=>{
            if (res instanceof Error) task.reject(res);
            else if ((0, parseControlResponse_1.positiveCompletion)(res.code)) task.resolve(res);
            else if (res.code === 331) this.ftp.send("PASS " + password);
            else task.reject(new FtpContext_1.FTPError(res));
        });
    }
    /**
     * Set the usual default settings.
     *
     * Settings used:
     * * Binary mode (TYPE I)
     * * File structure (STRU F)
     * * Additional settings for FTPS (PBSZ 0, PROT P)
     */ async useDefaultSettings() {
        const features = await this.features();
        // Use MLSD directory listing if possible. See https://tools.ietf.org/html/rfc3659#section-7.8:
        // "The presence of the MLST feature indicates that both MLST and MLSD are supported."
        const supportsMLSD = features.has("MLST");
        this.availableListCommands = supportsMLSD ? LIST_COMMANDS_MLSD : LIST_COMMANDS_DEFAULT;
        await this.send("TYPE I"); // Binary mode
        await this.sendIgnoringError("STRU F"); // Use file structure
        await this.sendIgnoringError("OPTS UTF8 ON"); // Some servers expect UTF-8 to be enabled explicitly and setting before login might not have worked.
        if (supportsMLSD) await this.sendIgnoringError("OPTS MLST type;size;modify;unique;unix.mode;unix.owner;unix.group;unix.ownername;unix.groupname;"); // Make sure MLSD listings include all we can parse
        if (this.ftp.hasTLS) {
            await this.sendIgnoringError("PBSZ 0"); // Set to 0 for TLS
            await this.sendIgnoringError("PROT P"); // Protect channel (also for data connections)
        }
    }
    /**
     * Convenience method that calls `connect`, `useTLS`, `login` and `useDefaultSettings`.
     *
     * This is an instance method and thus can be called multiple times during the lifecycle of a `Client`
     * instance. Whenever you do, the client is reset with a new control connection. This also implies that
     * you can reopen a `Client` instance that has been closed due to an error when reconnecting with this
     * method. In fact, reconnecting is the only way to continue using a closed `Client`.
     */ async access(options = {}) {
        var _a, _b;
        const useExplicitTLS = options.secure === true;
        const useImplicitTLS = options.secure === "implicit";
        let welcome;
        if (useImplicitTLS) welcome = await this.connectImplicitTLS(options.host, options.port, options.secureOptions);
        else welcome = await this.connect(options.host, options.port);
        if (useExplicitTLS) {
            // Fixes https://github.com/patrickjuchli/basic-ftp/issues/166 by making sure
            // host is set for any future data connection as well.
            const secureOptions = (_a = options.secureOptions) !== null && _a !== void 0 ? _a : {};
            secureOptions.host = (_b = secureOptions.host) !== null && _b !== void 0 ? _b : options.host;
            await this.useTLS(secureOptions);
        }
        // Set UTF-8 on before login in case there are non-ascii characters in user or password.
        // Note that this might not work before login depending on server.
        await this.sendIgnoringError("OPTS UTF8 ON");
        await this.login(options.user, options.password);
        await this.useDefaultSettings();
        return welcome;
    }
    /**
     * Get the current working directory.
     */ async pwd() {
        const res = await this.send("PWD");
        // The directory is part of the return message, for example:
        // 257 "/this/that" is current directory.
        const parsed = res.message.match(/"(.+)"/);
        if (parsed === null || parsed[1] === undefined) throw new Error(`Can't parse response to command 'PWD': ${res.message}`);
        return parsed[1];
    }
    /**
     * Get a description of supported features.
     *
     * This sends the FEAT command and parses the result into a Map where keys correspond to available commands
     * and values hold further information. Be aware that your FTP servers might not support this
     * command in which case this method will not throw an exception but just return an empty Map.
     */ async features() {
        const res = await this.sendIgnoringError("FEAT");
        const features = new Map();
        // Not supporting any special features will be reported with a single line.
        if (res.code < 400 && (0, parseControlResponse_1.isMultiline)(res.message)) // The first and last line wrap the multiline response, ignore them.
        res.message.split("\n").slice(1, -1).forEach((line)=>{
            // A typical lines looks like: " REST STREAM" or " MDTM".
            // Servers might not use an indentation though.
            const entry = line.trim().split(" ");
            features.set(entry[0], entry[1] || "");
        });
        return features;
    }
    /**
     * Set the working directory.
     */ async cd(path) {
        const validPath = await this.protectWhitespace(path);
        return this.send("CWD " + validPath);
    }
    /**
     * Switch to the parent directory of the working directory.
     */ async cdup() {
        return this.send("CDUP");
    }
    /**
     * Get the last modified time of a file. This is not supported by every FTP server, in which case
     * calling this method will throw an exception.
     */ async lastMod(path) {
        const validPath = await this.protectWhitespace(path);
        const res = await this.send(`MDTM ${validPath}`);
        const date = res.message.slice(4);
        return (0, parseListMLSD_1.parseMLSxDate)(date);
    }
    /**
     * Get the size of a file.
     */ async size(path) {
        const validPath = await this.protectWhitespace(path);
        const command = `SIZE ${validPath}`;
        const res = await this.send(command);
        // The size is part of the response message, for example: "213 555555". It's
        // possible that there is a commmentary appended like "213 5555, some commentary".
        const size = parseInt(res.message.slice(4), 10);
        if (Number.isNaN(size)) throw new Error(`Can't parse response to command '${command}' as a numerical value: ${res.message}`);
        return size;
    }
    /**
     * Rename a file.
     *
     * Depending on the FTP server this might also be used to move a file from one
     * directory to another by providing full paths.
     */ async rename(srcPath, destPath) {
        const validSrc = await this.protectWhitespace(srcPath);
        const validDest = await this.protectWhitespace(destPath);
        await this.send("RNFR " + validSrc);
        return this.send("RNTO " + validDest);
    }
    /**
     * Remove a file from the current working directory.
     *
     * You can ignore FTP error return codes which won't throw an exception if e.g.
     * the file doesn't exist.
     */ async remove(path, ignoreErrorCodes = false) {
        const validPath = await this.protectWhitespace(path);
        if (ignoreErrorCodes) return this.sendIgnoringError(`DELE ${validPath}`);
        return this.send(`DELE ${validPath}`);
    }
    /**
     * Report transfer progress for any upload or download to a given handler.
     *
     * This will also reset the overall transfer counter that can be used for multiple transfers. You can
     * also call the function without a handler to stop reporting to an earlier one.
     *
     * @param handler  Handler function to call on transfer progress.
     */ trackProgress(handler) {
        this._progressTracker.bytesOverall = 0;
        this._progressTracker.reportTo(handler);
    }
    /**
     * Upload data from a readable stream or a local file to a remote file.
     *
     * @param source  Readable stream or path to a local file.
     * @param toRemotePath  Path to a remote file to write to.
     */ async uploadFrom(source, toRemotePath, options = {}) {
        return this._uploadWithCommand(source, toRemotePath, "STOR", options);
    }
    /**
     * Upload data from a readable stream or a local file by appending it to an existing file. If the file doesn't
     * exist the FTP server should create it.
     *
     * @param source  Readable stream or path to a local file.
     * @param toRemotePath  Path to a remote file to write to.
     */ async appendFrom(source, toRemotePath, options = {}) {
        return this._uploadWithCommand(source, toRemotePath, "APPE", options);
    }
    /**
     * @protected
     */ async _uploadWithCommand(source, remotePath, command, options) {
        if (typeof source === "string") return this._uploadLocalFile(source, remotePath, command, options);
        return this._uploadFromStream(source, remotePath, command);
    }
    /**
     * @protected
     */ async _uploadLocalFile(localPath, remotePath, command, options) {
        const fd = await fsOpen(localPath, "r");
        const source = (0, fs_1.createReadStream)("", {
            fd,
            start: options.localStart,
            end: options.localEndInclusive,
            autoClose: false
        });
        try {
            return await this._uploadFromStream(source, remotePath, command);
        } finally{
            await ignoreError(()=>fsClose(fd));
        }
    }
    /**
     * @protected
     */ async _uploadFromStream(source, remotePath, command) {
        const onError = (err)=>this.ftp.closeWithError(err);
        source.once("error", onError);
        try {
            const validPath = await this.protectWhitespace(remotePath);
            await this.prepareTransfer(this.ftp);
            // Keep the keyword `await` or the `finally` clause below runs too early
            // and removes the event listener for the source stream too early.
            return await (0, transfer_1.uploadFrom)(source, {
                ftp: this.ftp,
                tracker: this._progressTracker,
                command,
                remotePath: validPath,
                type: "upload"
            });
        } finally{
            source.removeListener("error", onError);
        }
    }
    /**
     * Download a remote file and pipe its data to a writable stream or to a local file.
     *
     * You can optionally define at which position of the remote file you'd like to start
     * downloading. If the destination you provide is a file, the offset will be applied
     * to it as well. For example: To resume a failed download, you'd request the size of
     * the local, partially downloaded file and use that as the offset. Assuming the size
     * is 23, you'd download the rest using `downloadTo("local.txt", "remote.txt", 23)`.
     *
     * @param destination  Stream or path for a local file to write to.
     * @param fromRemotePath  Path of the remote file to read from.
     * @param startAt  Position within the remote file to start downloading at. If the destination is a file, this offset is also applied to it.
     */ async downloadTo(destination, fromRemotePath, startAt = 0) {
        if (typeof destination === "string") return this._downloadToFile(destination, fromRemotePath, startAt);
        return this._downloadToStream(destination, fromRemotePath, startAt);
    }
    /**
     * @protected
     */ async _downloadToFile(localPath, remotePath, startAt) {
        const appendingToLocalFile = startAt > 0;
        const fileSystemFlags = appendingToLocalFile ? "r+" : "w";
        const fd = await fsOpen(localPath, fileSystemFlags);
        const destination = (0, fs_1.createWriteStream)("", {
            fd,
            start: startAt,
            autoClose: false
        });
        try {
            return await this._downloadToStream(destination, remotePath, startAt);
        } catch (err) {
            const localFileStats = await ignoreError(()=>fsStat(localPath));
            const hasDownloadedData = localFileStats && localFileStats.size > 0;
            const shouldRemoveLocalFile = !appendingToLocalFile && !hasDownloadedData;
            if (shouldRemoveLocalFile) await ignoreError(()=>fsUnlink(localPath));
            throw err;
        } finally{
            await ignoreError(()=>fsClose(fd));
        }
    }
    /**
     * @protected
     */ async _downloadToStream(destination, remotePath, startAt) {
        const onError = (err)=>this.ftp.closeWithError(err);
        destination.once("error", onError);
        try {
            const validPath = await this.protectWhitespace(remotePath);
            await this.prepareTransfer(this.ftp);
            // Keep the keyword `await` or the `finally` clause below runs too early
            // and removes the event listener for the source stream too early.
            return await (0, transfer_1.downloadTo)(destination, {
                ftp: this.ftp,
                tracker: this._progressTracker,
                command: startAt > 0 ? `REST ${startAt}` : `RETR ${validPath}`,
                remotePath: validPath,
                type: "download"
            });
        } finally{
            destination.removeListener("error", onError);
            destination.end();
        }
    }
    /**
     * List files and directories in the current working directory, or from `path` if specified.
     *
     * @param [path]  Path to remote file or directory.
     */ async list(path = "") {
        const validPath = await this.protectWhitespace(path);
        let lastError;
        for (const candidate of this.availableListCommands){
            const command = validPath === "" ? candidate : `${candidate} ${validPath}`;
            await this.prepareTransfer(this.ftp);
            try {
                const parsedList = await this._requestListWithCommand(command);
                // Use successful candidate for all subsequent requests.
                this.availableListCommands = [
                    candidate
                ];
                return parsedList;
            } catch (err) {
                const shouldTryNext = err instanceof FtpContext_1.FTPError;
                if (!shouldTryNext) throw err;
                lastError = err;
            }
        }
        throw lastError;
    }
    /**
     * @protected
     */ async _requestListWithCommand(command) {
        const buffer = new StringWriter_1.StringWriter();
        await (0, transfer_1.downloadTo)(buffer, {
            ftp: this.ftp,
            tracker: this._progressTracker,
            command,
            remotePath: "",
            type: "list"
        });
        const text = buffer.getText(this.ftp.encoding);
        this.ftp.log(text);
        return this.parseList(text);
    }
    /**
     * Remove a directory and all of its content.
     *
     * @param remoteDirPath  The path of the remote directory to delete.
     * @example client.removeDir("foo") // Remove directory 'foo' using a relative path.
     * @example client.removeDir("foo/bar") // Remove directory 'bar' using a relative path.
     * @example client.removeDir("/foo/bar") // Remove directory 'bar' using an absolute path.
     * @example client.removeDir("/") // Remove everything.
     */ async removeDir(remoteDirPath) {
        return this._exitAtCurrentDirectory(async ()=>{
            await this.cd(remoteDirPath);
            await this.clearWorkingDir();
            if (remoteDirPath !== "/") {
                await this.cdup();
                await this.removeEmptyDir(remoteDirPath);
            }
        });
    }
    /**
     * Remove all files and directories in the working directory without removing
     * the working directory itself.
     */ async clearWorkingDir() {
        for (const file of (await this.list()))if (file.isDirectory) {
            await this.cd(file.name);
            await this.clearWorkingDir();
            await this.cdup();
            await this.removeEmptyDir(file.name);
        } else await this.remove(file.name);
    }
    /**
     * Upload the contents of a local directory to the remote working directory.
     *
     * This will overwrite existing files with the same names and reuse existing directories.
     * Unrelated files and directories will remain untouched. You can optionally provide a `remoteDirPath`
     * to put the contents inside a directory which will be created if necessary including all
     * intermediate directories. If you did provide a remoteDirPath the working directory will stay
     * the same as before calling this method.
     *
     * @param localDirPath  Local path, e.g. "foo/bar" or "../test"
     * @param [remoteDirPath]  Remote path of a directory to upload to. Working directory if undefined.
     */ async uploadFromDir(localDirPath, remoteDirPath) {
        return this._exitAtCurrentDirectory(async ()=>{
            if (remoteDirPath) await this.ensureDir(remoteDirPath);
            return await this._uploadToWorkingDir(localDirPath);
        });
    }
    /**
     * @protected
     */ async _uploadToWorkingDir(localDirPath) {
        const files = await fsReadDir(localDirPath);
        for (const file of files){
            const fullPath = (0, path_1.join)(localDirPath, file);
            const stats = await fsStat(fullPath);
            if (stats.isFile()) await this.uploadFrom(fullPath, file);
            else if (stats.isDirectory()) {
                await this._openDir(file);
                await this._uploadToWorkingDir(fullPath);
                await this.cdup();
            }
        }
    }
    /**
     * Download all files and directories of the working directory to a local directory.
     *
     * @param localDirPath  The local directory to download to.
     * @param remoteDirPath  Remote directory to download. Current working directory if not specified.
     */ async downloadToDir(localDirPath, remoteDirPath) {
        return this._exitAtCurrentDirectory(async ()=>{
            if (remoteDirPath) await this.cd(remoteDirPath);
            return await this._downloadFromWorkingDir(localDirPath);
        });
    }
    /**
     * @protected
     */ async _downloadFromWorkingDir(localDirPath) {
        await ensureLocalDirectory(localDirPath);
        for (const file of (await this.list())){
            const localPath = (0, path_1.join)(localDirPath, file.name);
            if (file.isDirectory) {
                await this.cd(file.name);
                await this._downloadFromWorkingDir(localPath);
                await this.cdup();
            } else if (file.isFile) await this.downloadTo(localPath, file.name);
        }
    }
    /**
     * Make sure a given remote path exists, creating all directories as necessary.
     * This function also changes the current working directory to the given path.
     */ async ensureDir(remoteDirPath) {
        // If the remoteDirPath was absolute go to root directory.
        if (remoteDirPath.startsWith("/")) await this.cd("/");
        const names = remoteDirPath.split("/").filter((name)=>name !== "");
        for (const name of names)await this._openDir(name);
    }
    /**
     * Try to create a directory and enter it. This will not raise an exception if the directory
     * couldn't be created if for example it already exists.
     * @protected
     */ async _openDir(dirName) {
        await this.sendIgnoringError("MKD " + dirName);
        await this.cd(dirName);
    }
    /**
     * Remove an empty directory, will fail if not empty.
     */ async removeEmptyDir(path) {
        const validPath = await this.protectWhitespace(path);
        return this.send(`RMD ${validPath}`);
    }
    /**
     * FTP servers can't handle filenames that have leading whitespace. This method transforms
     * a given path to fix that issue for most cases.
     */ async protectWhitespace(path) {
        if (!path.startsWith(" ")) return path;
        // Handle leading whitespace by prepending the absolute path:
        // " test.txt" while being in the root directory becomes "/ test.txt".
        const pwd = await this.pwd();
        const absolutePathPrefix = pwd.endsWith("/") ? pwd : pwd + "/";
        return absolutePathPrefix + path;
    }
    async _exitAtCurrentDirectory(func) {
        const userDir = await this.pwd();
        try {
            return await func();
        } finally{
            if (!this.closed) await ignoreError(()=>this.cd(userDir));
        }
    }
    /**
     * Try all available transfer strategies and pick the first one that works. Update `client` to
     * use the working strategy for all successive transfer requests.
     *
     * @returns a function that will try the provided strategies.
     */ _enterFirstCompatibleMode(strategies) {
        return async (ftp)=>{
            ftp.log("Trying to find optimal transfer strategy...");
            let lastError = undefined;
            for (const strategy of strategies)try {
                const res = await strategy(ftp);
                ftp.log("Optimal transfer strategy found.");
                this.prepareTransfer = strategy; // eslint-disable-line require-atomic-updates
                return res;
            } catch (err) {
                // Try the next candidate no matter the exact error. It's possible that a server
                // answered incorrectly to a strategy, for example a PASV answer to an EPSV.
                lastError = err;
            }
            throw new Error(`None of the available transfer strategies work. Last error response was '${lastError}'.`);
        };
    }
    /**
     * DEPRECATED, use `uploadFrom`.
     * @deprecated
     */ async upload(source, toRemotePath, options = {}) {
        this.ftp.log("Warning: upload() has been deprecated, use uploadFrom().");
        return this.uploadFrom(source, toRemotePath, options);
    }
    /**
     * DEPRECATED, use `appendFrom`.
     * @deprecated
     */ async append(source, toRemotePath, options = {}) {
        this.ftp.log("Warning: append() has been deprecated, use appendFrom().");
        return this.appendFrom(source, toRemotePath, options);
    }
    /**
     * DEPRECATED, use `downloadTo`.
     * @deprecated
     */ async download(destination, fromRemotePath, startAt = 0) {
        this.ftp.log("Warning: download() has been deprecated, use downloadTo().");
        return this.downloadTo(destination, fromRemotePath, startAt);
    }
    /**
     * DEPRECATED, use `uploadFromDir`.
     * @deprecated
     */ async uploadDir(localDirPath, remoteDirPath) {
        this.ftp.log("Warning: uploadDir() has been deprecated, use uploadFromDir().");
        return this.uploadFromDir(localDirPath, remoteDirPath);
    }
    /**
     * DEPRECATED, use `downloadToDir`.
     * @deprecated
     */ async downloadDir(localDirPath) {
        this.ftp.log("Warning: downloadDir() has been deprecated, use downloadToDir().");
        return this.downloadToDir(localDirPath);
    }
}
exports.Client = Client;
async function ensureLocalDirectory(path) {
    try {
        await fsStat(path);
    } catch (err) {
        await fsMkDir(path, {
            recursive: true
        });
    }
}
async function ignoreError(func) {
    try {
        return await func();
    } catch (err) {
        // Ignore
        return undefined;
    }
}

},{"c4216f9df743e6cc":"fs","d77000995cd246f8":"path","8a0a5c8d1bd383f8":"tls","a5249acb38689333":"util","3be3f7387cb959ee":"kGOvN","9ae47729fa474e1d":"eV6Ya","adc91663c44a0547":"3vH16","69b0251adda1799f":"l81m2","7a4b57fc3f28492a":"csSzK","3388f7d7d314453d":"3CJQ6","58cfe6ae6cb5f71c":"h0jnw","15e5a95a094f7a":"g7deG"}],"kGOvN":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.FTPContext = exports.FTPError = void 0;
const net_1 = require("52826a735f0971a0");
const parseControlResponse_1 = require("ef98b9420eacfa98");
/**
 * Describes an FTP server error response including the FTP response code.
 */ class FTPError extends Error {
    constructor(res){
        super(res.message);
        this.name = this.constructor.name;
        this.code = res.code;
    }
}
exports.FTPError = FTPError;
function doNothing() {
/** Do nothing */ }
/**
 * FTPContext holds the control and data sockets of an FTP connection and provides a
 * simplified way to interact with an FTP server, handle responses, errors and timeouts.
 *
 * It doesn't implement or use any FTP commands. It's only a foundation to make writing an FTP
 * client as easy as possible. You won't usually instantiate this, but use `Client`.
 */ class FTPContext {
    /**
     * Instantiate an FTP context.
     *
     * @param timeout - Timeout in milliseconds to apply to control and data connections. Use 0 for no timeout.
     * @param encoding - Encoding to use for control connection. UTF-8 by default. Use "latin1" for older servers.
     */ constructor(timeout = 0, encoding = "utf8"){
        this.timeout = timeout;
        /** Debug-level logging of all socket communication. */ this.verbose = false;
        /** IP version to prefer (4: IPv4, 6: IPv6, undefined: automatic). */ this.ipFamily = undefined;
        /** Options for TLS connections. */ this.tlsOptions = {};
        /** A multiline response might be received as multiple chunks. */ this._partialResponse = "";
        this._encoding = encoding;
        // Help Typescript understand that we do indeed set _socket in the constructor but use the setter method to do so.
        this._socket = this.socket = this._newSocket();
        this._dataSocket = undefined;
    }
    /**
     * Close the context.
     */ close() {
        // Internally, closing a context is always described with an error. If there is still a task running, it will
        // abort with an exception that the user closed the client during a task. If no task is running, no exception is
        // thrown but all newly submitted tasks after that will abort the exception that the client has been closed.
        // In addition the user will get a stack trace pointing to where exactly the client has been closed. So in any
        // case use _closingError to determine whether a context is closed. This also allows us to have a single code-path
        // for closing a context making the implementation easier.
        const message = this._task ? "User closed client during task" : "User closed client";
        const err = new Error(message);
        this.closeWithError(err);
    }
    /**
     * Close the context with an error.
     */ closeWithError(err) {
        // If this context already has been closed, don't overwrite the reason.
        if (this._closingError) return;
        this._closingError = err;
        // Close the sockets but don't fully reset this context to preserve `this._closingError`.
        this._closeControlSocket();
        this._closeSocket(this._dataSocket);
        // Give the user's task a chance to react, maybe cleanup resources.
        this._passToHandler(err);
        // The task might not have been rejected by the user after receiving the error.
        this._stopTrackingTask();
    }
    /**
     * Returns true if this context has been closed or hasn't been connected yet. You can reopen it with `access`.
     */ get closed() {
        return this.socket.remoteAddress === undefined || this._closingError !== undefined;
    }
    /**
     * Reset this contex and all of its state.
     */ reset() {
        this.socket = this._newSocket();
    }
    /**
     * Get the FTP control socket.
     */ get socket() {
        return this._socket;
    }
    /**
     * Set the socket for the control connection. This will only close the current control socket
     * if the new one is not an upgrade to the current one.
     */ set socket(socket) {
        // No data socket should be open in any case where the control socket is set or upgraded.
        this.dataSocket = undefined;
        // This being a reset, reset any other state apart from the socket.
        this.tlsOptions = {};
        this._partialResponse = "";
        if (this._socket) {
            const newSocketUpgradesExisting = socket.localPort === this._socket.localPort;
            if (newSocketUpgradesExisting) this._removeSocketListeners(this.socket);
            else this._closeControlSocket();
        }
        if (socket) {
            // Setting a completely new control socket is in essence something like a reset. That's
            // why we also close any open data connection above. We can go one step further and reset
            // a possible closing error. That means that a closed FTPContext can be "reopened" by
            // setting a new control socket.
            this._closingError = undefined;
            // Don't set a timeout yet. Timeout for control sockets is only active during a task, see handle() below.
            socket.setTimeout(0);
            socket.setEncoding(this._encoding);
            socket.setKeepAlive(true);
            socket.on("data", (data)=>this._onControlSocketData(data));
            // Server sending a FIN packet is treated as an error.
            socket.on("end", ()=>this.closeWithError(new Error("Server sent FIN packet unexpectedly, closing connection.")));
            // Control being closed without error by server is treated as an error.
            socket.on("close", (hadError)=>{
                if (!hadError) this.closeWithError(new Error("Server closed connection unexpectedly."));
            });
            this._setupDefaultErrorHandlers(socket, "control socket");
        }
        this._socket = socket;
    }
    /**
     * Get the current FTP data connection if present.
     */ get dataSocket() {
        return this._dataSocket;
    }
    /**
     * Set the socket for the data connection. This will automatically close the former data socket.
     */ set dataSocket(socket) {
        this._closeSocket(this._dataSocket);
        if (socket) {
            // Don't set a timeout yet. Timeout data socket should be activated when data transmission starts
            // and timeout on control socket is deactivated.
            socket.setTimeout(0);
            this._setupDefaultErrorHandlers(socket, "data socket");
        }
        this._dataSocket = socket;
    }
    /**
     * Get the currently used encoding.
     */ get encoding() {
        return this._encoding;
    }
    /**
     * Set the encoding used for the control socket.
     *
     * See https://nodejs.org/api/buffer.html#buffer_buffers_and_character_encodings for what encodings
     * are supported by Node.
     */ set encoding(encoding) {
        this._encoding = encoding;
        if (this.socket) this.socket.setEncoding(encoding);
    }
    /**
     * Send an FTP command without waiting for or handling the result.
     */ send(command) {
        const containsPassword = command.startsWith("PASS");
        const message = containsPassword ? "> PASS ###" : `> ${command}`;
        this.log(message);
        this._socket.write(command + "\r\n", this.encoding);
    }
    /**
     * Send an FTP command and handle the first response. Use this if you have a simple
     * request-response situation.
     */ request(command) {
        return this.handle(command, (res, task)=>{
            if (res instanceof Error) task.reject(res);
            else task.resolve(res);
        });
    }
    /**
     * Send an FTP command and handle any response until you resolve/reject. Use this if you expect multiple responses
     * to a request. This returns a Promise that will hold whatever the response handler passed on when resolving/rejecting its task.
     */ handle(command, responseHandler) {
        if (this._task) {
            const err = new Error("User launched a task while another one is still running. Forgot to use 'await' or '.then()'?");
            err.stack += `\nRunning task launched at: ${this._task.stack}`;
            this.closeWithError(err);
        // Don't return here, continue with returning the Promise that will then be rejected
        // because the context closed already. That way, users will receive an exception where
        // they called this method by mistake.
        }
        return new Promise((resolveTask, rejectTask)=>{
            this._task = {
                stack: new Error().stack || "Unknown call stack",
                responseHandler,
                resolver: {
                    resolve: (arg)=>{
                        this._stopTrackingTask();
                        resolveTask(arg);
                    },
                    reject: (err)=>{
                        this._stopTrackingTask();
                        rejectTask(err);
                    }
                }
            };
            if (this._closingError) {
                // This client has been closed. Provide an error that describes this one as being caused
                // by `_closingError`, include stack traces for both.
                const err = new Error(`Client is closed because ${this._closingError.message}`); // Type 'Error' is not correctly defined, doesn't have 'code'.
                err.stack += `\nClosing reason: ${this._closingError.stack}`;
                err.code = this._closingError.code !== undefined ? this._closingError.code : "0";
                this._passToHandler(err);
                return;
            }
            // Only track control socket timeout during the lifecycle of a task. This avoids timeouts on idle sockets,
            // the default socket behaviour which is not expected by most users.
            this.socket.setTimeout(this.timeout);
            if (command) this.send(command);
        });
    }
    /**
     * Log message if set to be verbose.
     */ log(message) {
        if (this.verbose) // tslint:disable-next-line no-console
        console.log(message);
    }
    /**
     * Return true if the control socket is using TLS. This does not mean that a session
     * has already been negotiated.
     */ get hasTLS() {
        return "encrypted" in this._socket;
    }
    /**
     * Removes reference to current task and handler. This won't resolve or reject the task.
     * @protected
     */ _stopTrackingTask() {
        // Disable timeout on control socket if there is no task active.
        this.socket.setTimeout(0);
        this._task = undefined;
    }
    /**
     * Handle incoming data on the control socket. The chunk is going to be of type `string`
     * because we let `socket` handle encoding with `setEncoding`.
     * @protected
     */ _onControlSocketData(chunk) {
        this.log(`< ${chunk}`);
        // This chunk might complete an earlier partial response.
        const completeResponse = this._partialResponse + chunk;
        const parsed = (0, parseControlResponse_1.parseControlResponse)(completeResponse);
        // Remember any incomplete remainder.
        this._partialResponse = parsed.rest;
        // Each response group is passed along individually.
        for (const message of parsed.messages){
            const code = parseInt(message.substr(0, 3), 10);
            const response = {
                code,
                message
            };
            const err = code >= 400 ? new FTPError(response) : undefined;
            this._passToHandler(err ? err : response);
        }
    }
    /**
     * Send the current handler a response. This is usually a control socket response
     * or a socket event, like an error or timeout.
     * @protected
     */ _passToHandler(response) {
        if (this._task) this._task.responseHandler(response, this._task.resolver);
    // Errors other than FTPError always close the client. If there isn't an active task to handle the error,
    // the next one submitted will receive it using `_closingError`.
    // There is only one edge-case: If there is an FTPError while no task is active, the error will be dropped.
    // But that means that the user sent an FTP command with no intention of handling the result. So why should the
    // error be handled? Maybe log it at least? Debug logging will already do that and the client stays useable after
    // FTPError. So maybe no need to do anything here.
    }
    /**
     * Setup all error handlers for a socket.
     * @protected
     */ _setupDefaultErrorHandlers(socket, identifier) {
        socket.once("error", (error)=>{
            error.message += ` (${identifier})`;
            this.closeWithError(error);
        });
        socket.once("close", (hadError)=>{
            if (hadError) this.closeWithError(new Error(`Socket closed due to transmission error (${identifier})`));
        });
        socket.once("timeout", ()=>{
            socket.destroy();
            this.closeWithError(new Error(`Timeout (${identifier})`));
        });
    }
    /**
     * Close the control socket. Sends QUIT, then FIN, and ignores any response or error.
     */ _closeControlSocket() {
        this._removeSocketListeners(this._socket);
        this._socket.on("error", doNothing);
        this.send("QUIT");
        this._closeSocket(this._socket);
    }
    /**
     * Close a socket. Sends FIN and ignores any error.
     * @protected
     */ _closeSocket(socket) {
        if (socket) {
            this._removeSocketListeners(socket);
            socket.on("error", doNothing);
            socket.on("timeout", ()=>socket.destroy());
            socket.setTimeout(this.timeout);
            socket.end();
        }
    }
    /**
     * Remove all default listeners for socket.
     * @protected
     */ _removeSocketListeners(socket) {
        socket.removeAllListeners();
        // Before Node.js 10.3.0, using `socket.removeAllListeners()` without any name did not work: https://github.com/nodejs/node/issues/20923.
        socket.removeAllListeners("timeout");
        socket.removeAllListeners("data");
        socket.removeAllListeners("end");
        socket.removeAllListeners("error");
        socket.removeAllListeners("close");
        socket.removeAllListeners("connect");
    }
    /**
     * Provide a new socket instance.
     *
     * Internal use only, replaced for unit tests.
     */ _newSocket() {
        return new net_1.Socket();
    }
}
exports.FTPContext = FTPContext;

},{"52826a735f0971a0":"net","ef98b9420eacfa98":"g7deG"}],"g7deG":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.positiveIntermediate = exports.positiveCompletion = exports.isMultiline = exports.isSingleLine = exports.parseControlResponse = void 0;
const LF = "\n";
/**
 * Parse an FTP control response as a collection of messages. A message is a complete
 * single- or multiline response. A response can also contain multiple multiline responses
 * that will each be represented by a message. A response can also be incomplete
 * and be completed on the next incoming data chunk for which case this function also
 * describes a `rest`. This function converts all CRLF to LF.
 */ function parseControlResponse(text) {
    const lines = text.split(/\r?\n/).filter(isNotBlank);
    const messages = [];
    let startAt = 0;
    let tokenRegex;
    for(let i = 0; i < lines.length; i++){
        const line = lines[i];
        // No group has been opened.
        if (!tokenRegex) {
            if (isMultiline(line)) {
                // Open a group by setting an expected token.
                const token = line.substr(0, 3);
                tokenRegex = new RegExp(`^${token}(?:$| )`);
                startAt = i;
            } else if (isSingleLine(line)) // Single lines can be grouped immediately.
            messages.push(line);
        } else if (tokenRegex.test(line)) {
            tokenRegex = undefined;
            messages.push(lines.slice(startAt, i + 1).join(LF));
        }
    }
    // The last group might not have been closed, report it as a rest.
    const rest = tokenRegex ? lines.slice(startAt).join(LF) + LF : "";
    return {
        messages,
        rest
    };
}
exports.parseControlResponse = parseControlResponse;
function isSingleLine(line) {
    return /^\d\d\d(?:$| )/.test(line);
}
exports.isSingleLine = isSingleLine;
function isMultiline(line) {
    return /^\d\d\d-/.test(line);
}
exports.isMultiline = isMultiline;
/**
 * Return true if an FTP return code describes a positive completion.
 */ function positiveCompletion(code) {
    return code >= 200 && code < 300;
}
exports.positiveCompletion = positiveCompletion;
/**
 * Return true if an FTP return code describes a positive intermediate response.
 */ function positiveIntermediate(code) {
    return code >= 300 && code < 400;
}
exports.positiveIntermediate = positiveIntermediate;
function isNotBlank(str) {
    return str.trim() !== "";
}

},{}],"eV6Ya":[function(require,module,exports,__globalThis) {
"use strict";
var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
        enumerable: true,
        get: function() {
            return m[k];
        }
    };
    Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", {
        enumerable: true,
        value: v
    });
} : function(o, v) {
    o["default"] = v;
});
var __importStar = this && this.__importStar || function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) {
        for(var k in mod)if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.parseList = void 0;
const dosParser = __importStar(require("589a787a77131ec7"));
const unixParser = __importStar(require("e11ae349d2f4470"));
const mlsdParser = __importStar(require("5e7eb359a4795593"));
/**
 * Available directory listing parsers. These are candidates that will be tested
 * in the order presented. The first candidate will be used to parse the whole list.
 */ const availableParsers = [
    dosParser,
    unixParser,
    mlsdParser // Keep MLSD last, may accept filename only
];
function firstCompatibleParser(line, parsers) {
    return parsers.find((parser)=>parser.testLine(line) === true);
}
function isNotBlank(str) {
    return str.trim() !== "";
}
function isNotMeta(str) {
    return !str.startsWith("total");
}
const REGEX_NEWLINE = /\r?\n/;
/**
 * Parse raw directory listing.
 */ function parseList(rawList) {
    const lines = rawList.split(REGEX_NEWLINE).filter(isNotBlank).filter(isNotMeta);
    if (lines.length === 0) return [];
    const testLine = lines[lines.length - 1];
    const parser = firstCompatibleParser(testLine, availableParsers);
    if (!parser) throw new Error("This library only supports MLSD, Unix- or DOS-style directory listing. Your FTP server seems to be using another format. You can see the transmitted listing when setting `client.ftp.verbose = true`. You can then provide a custom parser to `client.parseList`, see the documentation for details.");
    const files = lines.map(parser.parseLine).filter((info)=>info !== undefined);
    return parser.transformList(files);
}
exports.parseList = parseList;

},{"589a787a77131ec7":"fs0uc","e11ae349d2f4470":"hJCDo","5e7eb359a4795593":"csSzK"}],"fs0uc":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.transformList = exports.parseLine = exports.testLine = void 0;
const FileInfo_1 = require("591925a3ba9dce3");
/**
 * This parser is based on the FTP client library source code in Apache Commons Net provided
 * under the Apache 2.0 license. It has been simplified and rewritten to better fit the Javascript language.
 *
 * https://github.com/apache/commons-net/blob/master/src/main/java/org/apache/commons/net/ftp/parser/NTFTPEntryParser.java
 */ const RE_LINE = new RegExp("(\\S+)\\s+(\\S+)\\s+(?:(<DIR>)|([0-9]+))\\s+(\\S.*)" // First non-space followed by rest of line (name)
);
/**
 * Returns true if a given line might be a DOS-style listing.
 *
 * - Example: `12-05-96  05:03PM       <DIR>          myDir`
 */ function testLine(line) {
    return /^\d{2}/.test(line) && RE_LINE.test(line);
}
exports.testLine = testLine;
/**
 * Parse a single line of a DOS-style directory listing.
 */ function parseLine(line) {
    const groups = line.match(RE_LINE);
    if (groups === null) return undefined;
    const name = groups[5];
    if (name === "." || name === "..") return undefined;
    const file = new FileInfo_1.FileInfo(name);
    const fileType = groups[3];
    if (fileType === "<DIR>") {
        file.type = FileInfo_1.FileType.Directory;
        file.size = 0;
    } else {
        file.type = FileInfo_1.FileType.File;
        file.size = parseInt(groups[4], 10);
    }
    file.rawModifiedAt = groups[1] + " " + groups[2];
    return file;
}
exports.parseLine = parseLine;
function transformList(files) {
    return files;
}
exports.transformList = transformList;

},{"591925a3ba9dce3":"5qjqA"}],"5qjqA":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.FileInfo = exports.FileType = void 0;
var FileType;
(function(FileType) {
    FileType[FileType["Unknown"] = 0] = "Unknown";
    FileType[FileType["File"] = 1] = "File";
    FileType[FileType["Directory"] = 2] = "Directory";
    FileType[FileType["SymbolicLink"] = 3] = "SymbolicLink";
})(FileType = exports.FileType || (exports.FileType = {}));
/**
 * Describes a file, directory or symbolic link.
 */ class FileInfo {
    constructor(name){
        this.name = name;
        this.type = FileType.Unknown;
        this.size = 0;
        /**
         * Unparsed, raw modification date as a string.
         *
         * If `modifiedAt` is undefined, the FTP server you're connected to doesn't support the more modern
         * MLSD command for machine-readable directory listings. The older command LIST is then used returning
         * results that vary a lot between servers as the format hasn't been standardized. Here, directory listings
         * and especially modification dates were meant to be human-readable first.
         *
         * Be careful when still trying to parse this by yourself. Parsing dates from listings using LIST is
         * unreliable. This library decides to offer parsed dates only when they're absolutely reliable and safe to
         * use e.g. for comparisons.
         */ this.rawModifiedAt = "";
        /**
         * Parsed modification date.
         *
         * Available if the FTP server supports the MLSD command. Only MLSD guarantees dates than can be reliably
         * parsed with the correct timezone and a resolution down to seconds. See `rawModifiedAt` property for the unparsed
         * date that is always available.
         */ this.modifiedAt = undefined;
        /**
         * Unix permissions if present. If the underlying FTP server is not running on Unix this will be undefined.
         * If set, you might be able to edit permissions with the FTP command `SITE CHMOD`.
         */ this.permissions = undefined;
        /**
         * Hard link count if available.
         */ this.hardLinkCount = undefined;
        /**
         * Link name for symbolic links if available.
         */ this.link = undefined;
        /**
         * Unix group if available.
         */ this.group = undefined;
        /**
         * Unix user if available.
         */ this.user = undefined;
        /**
         * Unique ID if available.
         */ this.uniqueID = undefined;
        this.name = name;
    }
    get isDirectory() {
        return this.type === FileType.Directory;
    }
    get isSymbolicLink() {
        return this.type === FileType.SymbolicLink;
    }
    get isFile() {
        return this.type === FileType.File;
    }
    /**
     * Deprecated, legacy API. Use `rawModifiedAt` instead.
     * @deprecated
     */ get date() {
        return this.rawModifiedAt;
    }
    set date(rawModifiedAt) {
        this.rawModifiedAt = rawModifiedAt;
    }
}
FileInfo.UnixPermission = {
    Read: 4,
    Write: 2,
    Execute: 1
};
exports.FileInfo = FileInfo;

},{}],"hJCDo":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.transformList = exports.parseLine = exports.testLine = void 0;
const FileInfo_1 = require("1324c99d71e03335");
const JA_MONTH = "\u6708";
const JA_DAY = "\u65e5";
const JA_YEAR = "\u5e74";
/**
 * This parser is based on the FTP client library source code in Apache Commons Net provided
 * under the Apache 2.0 license. It has been simplified and rewritten to better fit the Javascript language.
 *
 * https://github.com/apache/commons-net/blob/master/src/main/java/org/apache/commons/net/ftp/parser/UnixFTPEntryParser.java
 *
 * Below is the regular expression used by this parser.
 *
 * Permissions:
 *    r   the file is readable
 *    w   the file is writable
 *    x   the file is executable
 *    -   the indicated permission is not granted
 *    L   mandatory locking occurs during access (the set-group-ID bit is
 *        on and the group execution bit is off)
 *    s   the set-user-ID or set-group-ID bit is on, and the corresponding
 *        user or group execution bit is also on
 *    S   undefined bit-state (the set-user-ID bit is on and the user
 *        execution bit is off)
 *    t   the 1000 (octal) bit, or sticky bit, is on [see chmod(1)], and
 *        execution is on
 *    T   the 1000 bit is turned on, and execution is off (undefined bit-
 *        state)
 *    e   z/OS external link bit
 *    Final letter may be appended:
 *    +   file has extended security attributes (e.g. ACL)
 *    Note: local listings on MacOSX also use '@'
 *    this is not allowed for here as does not appear to be shown by FTP servers
 *    {@code @}   file has extended attributes
 */ const RE_LINE = new RegExp("([bcdelfmpSs-])(((r|-)(w|-)([xsStTL-]))((r|-)(w|-)([xsStTL-]))((r|-)(w|-)([xsStTL-]?)))\\+?\\s*(\\d+)\\s+(?:(\\S+(?:\\s\\S+)*?)\\s+)?(?:(\\S+(?:\\s\\S+)*)\\s+)?(\\d+(?:,\\s*\\d+)?)\\s+((?:\\d+[-/]\\d+[-/]\\d+)|(?:\\S{3}\\s+\\d{1,2})|(?:\\d{1,2}\\s+\\S{3})|(?:\\d{1,2}" + JA_MONTH + "\\s+\\d{1,2}" + JA_DAY + ")" + ")" + "\\s+" // separator
 + "((?:\\d+(?::\\d+)?)|(?:\\d{4}" + JA_YEAR + "))" // (20)
 + "\\s" // separator
 + "(.*)"); // the rest (21)
/**
 * Returns true if a given line might be a Unix-style listing.
 *
 * - Example: `-rw-r--r--+   1 patrick  staff   1057 Dec 11 14:35 test.txt`
 */ function testLine(line) {
    return RE_LINE.test(line);
}
exports.testLine = testLine;
/**
 * Parse a single line of a Unix-style directory listing.
 */ function parseLine(line) {
    const groups = line.match(RE_LINE);
    if (groups === null) return undefined;
    const name = groups[21];
    if (name === "." || name === "..") return undefined;
    const file = new FileInfo_1.FileInfo(name);
    file.size = parseInt(groups[18], 10);
    file.user = groups[16];
    file.group = groups[17];
    file.hardLinkCount = parseInt(groups[15], 10);
    file.rawModifiedAt = groups[19] + " " + groups[20];
    file.permissions = {
        user: parseMode(groups[4], groups[5], groups[6]),
        group: parseMode(groups[8], groups[9], groups[10]),
        world: parseMode(groups[12], groups[13], groups[14])
    };
    // Set file type
    switch(groups[1].charAt(0)){
        case "d":
            file.type = FileInfo_1.FileType.Directory;
            break;
        case "e":
            file.type = FileInfo_1.FileType.SymbolicLink;
            break;
        case "l":
            file.type = FileInfo_1.FileType.SymbolicLink;
            break;
        case "b":
        case "c":
            file.type = FileInfo_1.FileType.File; // TODO change this if DEVICE_TYPE implemented
            break;
        case "f":
        case "-":
            file.type = FileInfo_1.FileType.File;
            break;
        default:
            // A 'whiteout' file is an ARTIFICIAL entry in any of several types of
            // 'translucent' filesystems, of which a 'union' filesystem is one.
            file.type = FileInfo_1.FileType.Unknown;
    }
    // Separate out the link name for symbolic links
    if (file.isSymbolicLink) {
        const end = name.indexOf(" -> ");
        if (end !== -1) {
            file.name = name.substring(0, end);
            file.link = name.substring(end + 4);
        }
    }
    return file;
}
exports.parseLine = parseLine;
function transformList(files) {
    return files;
}
exports.transformList = transformList;
function parseMode(r, w, x) {
    let value = 0;
    if (r !== "-") value += FileInfo_1.FileInfo.UnixPermission.Read;
    if (w !== "-") value += FileInfo_1.FileInfo.UnixPermission.Write;
    const execToken = x.charAt(0);
    if (execToken !== "-" && execToken.toUpperCase() !== execToken) value += FileInfo_1.FileInfo.UnixPermission.Execute;
    return value;
}

},{"1324c99d71e03335":"5qjqA"}],"csSzK":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.parseMLSxDate = exports.transformList = exports.parseLine = exports.testLine = void 0;
const FileInfo_1 = require("484accecec2bbc9d");
function parseSize(value, info) {
    info.size = parseInt(value, 10);
}
/**
 * Parsers for MLSD facts.
 */ const factHandlersByName = {
    "size": parseSize,
    "sizd": parseSize,
    "unique": (value, info)=>{
        info.uniqueID = value;
    },
    "modify": (value, info)=>{
        info.modifiedAt = parseMLSxDate(value);
        info.rawModifiedAt = info.modifiedAt.toISOString();
    },
    "type": (value, info)=>{
        // There seems to be confusion on how to handle symbolic links for Unix. RFC 3659 doesn't describe
        // this but mentions some examples using the syntax `type=OS.unix=slink:<target>`. But according to
        // an entry in the Errata (https://www.rfc-editor.org/errata/eid1500) this syntax can't be valid.
        // Instead it proposes to use `type=OS.unix=symlink` and to then list the actual target of the
        // symbolic link as another entry in the directory listing. The unique identifiers can then be used
        // to derive the connection between link(s) and target. We'll have to handle both cases as there
        // are differing opinions on how to deal with this. Here are some links on this topic:
        // - ProFTPD source: https://github.com/proftpd/proftpd/blob/56e6dfa598cbd4ef5c6cba439bcbcd53a63e3b21/modules/mod_facts.c#L531
        // - ProFTPD bug: http://bugs.proftpd.org/show_bug.cgi?id=3318
        // - ProFTPD statement: http://www.proftpd.org/docs/modules/mod_facts.html
        // – FileZilla bug: https://trac.filezilla-project.org/ticket/9310
        if (value.startsWith("OS.unix=slink")) {
            info.type = FileInfo_1.FileType.SymbolicLink;
            info.link = value.substr(value.indexOf(":") + 1);
            return 1 /* FactHandlerResult.Continue */ ;
        }
        switch(value){
            case "file":
                info.type = FileInfo_1.FileType.File;
                break;
            case "dir":
                info.type = FileInfo_1.FileType.Directory;
                break;
            case "OS.unix=symlink":
                info.type = FileInfo_1.FileType.SymbolicLink;
                break;
            case "cdir":
            case "pdir":
                return 2 /* FactHandlerResult.IgnoreFile */ ; // Don't include these entries in the listing
            default:
                info.type = FileInfo_1.FileType.Unknown;
        }
        return 1 /* FactHandlerResult.Continue */ ;
    },
    "unix.mode": (value, info)=>{
        const digits = value.substr(-3);
        info.permissions = {
            user: parseInt(digits[0], 10),
            group: parseInt(digits[1], 10),
            world: parseInt(digits[2], 10)
        };
    },
    "unix.ownername": (value, info)=>{
        info.user = value;
    },
    "unix.owner": (value, info)=>{
        if (info.user === undefined) info.user = value;
    },
    get "unix.uid" () {
        return this["unix.owner"];
    },
    "unix.groupname": (value, info)=>{
        info.group = value;
    },
    "unix.group": (value, info)=>{
        if (info.group === undefined) info.group = value;
    },
    get "unix.gid" () {
        return this["unix.group"];
    }
};
/**
 * Split a string once at the first position of a delimiter. For example
 * `splitStringOnce("a b c d", " ")` returns `["a", "b c d"]`.
 */ function splitStringOnce(str, delimiter) {
    const pos = str.indexOf(delimiter);
    const a = str.substr(0, pos);
    const b = str.substr(pos + delimiter.length);
    return [
        a,
        b
    ];
}
/**
 * Returns true if a given line might be part of an MLSD listing.
 *
 * - Example 1: `size=15227;type=dir;perm=el;modify=20190419065730; test one`
 * - Example 2: ` file name` (leading space)
 */ function testLine(line) {
    return /^\S+=\S+;/.test(line) || line.startsWith(" ");
}
exports.testLine = testLine;
/**
 * Parse single line as MLSD listing, see specification at https://tools.ietf.org/html/rfc3659#section-7.
 */ function parseLine(line) {
    const [packedFacts, name] = splitStringOnce(line, " ");
    if (name === "" || name === "." || name === "..") return undefined;
    const info = new FileInfo_1.FileInfo(name);
    const facts = packedFacts.split(";");
    for (const fact of facts){
        const [factName, factValue] = splitStringOnce(fact, "=");
        if (!factValue) continue;
        const factHandler = factHandlersByName[factName.toLowerCase()];
        if (!factHandler) continue;
        const result = factHandler(factValue, info);
        if (result === 2 /* FactHandlerResult.IgnoreFile */ ) return undefined;
    }
    return info;
}
exports.parseLine = parseLine;
function transformList(files) {
    // Create a map of all files that are not symbolic links by their unique ID
    const nonLinksByID = new Map();
    for (const file of files)if (!file.isSymbolicLink && file.uniqueID !== undefined) nonLinksByID.set(file.uniqueID, file);
    const resolvedFiles = [];
    for (const file of files){
        // Try to associate unresolved symbolic links with a target file/directory.
        if (file.isSymbolicLink && file.uniqueID !== undefined && file.link === undefined) {
            const target = nonLinksByID.get(file.uniqueID);
            if (target !== undefined) file.link = target.name;
        }
        // The target of a symbolic link is listed as an entry in the directory listing but might
        // have a path pointing outside of this directory. In that case we don't want this entry
        // to be part of the listing. We generally don't want these kind of entries at all.
        const isPartOfDirectory = !file.name.includes("/");
        if (isPartOfDirectory) resolvedFiles.push(file);
    }
    return resolvedFiles;
}
exports.transformList = transformList;
/**
 * Parse date as specified in https://tools.ietf.org/html/rfc3659#section-2.3.
 *
 * Message contains response code and modified time in the format: YYYYMMDDHHMMSS[.sss]
 * For example `19991005213102` or `19980615100045.014`.
 */ function parseMLSxDate(fact) {
    return new Date(Date.UTC(+fact.slice(0, 4), +fact.slice(4, 6) - 1, +fact.slice(6, 8), +fact.slice(8, 10), +fact.slice(10, 12), +fact.slice(12, 14), +fact.slice(15, 18) // Milliseconds
    ));
}
exports.parseMLSxDate = parseMLSxDate;

},{"484accecec2bbc9d":"5qjqA"}],"3vH16":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ProgressTracker = void 0;
/**
 * Tracks progress of one socket data transfer at a time.
 */ class ProgressTracker {
    constructor(){
        this.bytesOverall = 0;
        this.intervalMs = 500;
        this.onStop = noop;
        this.onHandle = noop;
    }
    /**
     * Register a new handler for progress info. Use `undefined` to disable reporting.
     */ reportTo(onHandle = noop) {
        this.onHandle = onHandle;
    }
    /**
     * Start tracking transfer progress of a socket.
     *
     * @param socket  The socket to observe.
     * @param name  A name associated with this progress tracking, e.g. a filename.
     * @param type  The type of the transfer, typically "upload" or "download".
     */ start(socket, name, type) {
        let lastBytes = 0;
        this.onStop = poll(this.intervalMs, ()=>{
            const bytes = socket.bytesRead + socket.bytesWritten;
            this.bytesOverall += bytes - lastBytes;
            lastBytes = bytes;
            this.onHandle({
                name,
                type,
                bytes,
                bytesOverall: this.bytesOverall
            });
        });
    }
    /**
     * Stop tracking transfer progress.
     */ stop() {
        this.onStop(false);
    }
    /**
     * Call the progress handler one more time, then stop tracking.
     */ updateAndStop() {
        this.onStop(true);
    }
}
exports.ProgressTracker = ProgressTracker;
/**
 * Starts calling a callback function at a regular interval. The first call will go out
 * immediately. The function returns a function to stop the polling.
 */ function poll(intervalMs, updateFunc) {
    const id = setInterval(updateFunc, intervalMs);
    const stopFunc = (stopWithUpdate)=>{
        clearInterval(id);
        if (stopWithUpdate) updateFunc();
        // Prevent repeated calls to stop calling handler.
        updateFunc = noop;
    };
    updateFunc();
    return stopFunc;
}
function noop() {}

},{}],"l81m2":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.StringWriter = void 0;
const stream_1 = require("81c77907bca2a6c2");
class StringWriter extends stream_1.Writable {
    constructor(){
        super(...arguments);
        this.buf = Buffer.alloc(0);
    }
    _write(chunk, _, callback) {
        if (chunk instanceof Buffer) {
            this.buf = Buffer.concat([
                this.buf,
                chunk
            ]);
            callback(null);
        } else callback(new Error("StringWriter expects chunks of type 'Buffer'."));
    }
    getText(encoding) {
        return this.buf.toString(encoding);
    }
}
exports.StringWriter = StringWriter;

},{"81c77907bca2a6c2":"stream"}],"3CJQ6":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ipIsPrivateV4Address = exports.upgradeSocket = exports.describeAddress = exports.describeTLS = void 0;
const tls_1 = require("8c75d1061bf236ce");
/**
 * Returns a string describing the encryption on a given socket instance.
 */ function describeTLS(socket) {
    if (socket instanceof tls_1.TLSSocket) {
        const protocol = socket.getProtocol();
        return protocol ? protocol : "Server socket or disconnected client socket";
    }
    return "No encryption";
}
exports.describeTLS = describeTLS;
/**
 * Returns a string describing the remote address of a socket.
 */ function describeAddress(socket) {
    if (socket.remoteFamily === "IPv6") return `[${socket.remoteAddress}]:${socket.remotePort}`;
    return `${socket.remoteAddress}:${socket.remotePort}`;
}
exports.describeAddress = describeAddress;
/**
 * Upgrade a socket connection with TLS.
 */ function upgradeSocket(socket, options) {
    return new Promise((resolve, reject)=>{
        const tlsOptions = Object.assign({}, options, {
            socket
        });
        const tlsSocket = (0, tls_1.connect)(tlsOptions, ()=>{
            const expectCertificate = tlsOptions.rejectUnauthorized !== false;
            if (expectCertificate && !tlsSocket.authorized) reject(tlsSocket.authorizationError);
            else {
                // Remove error listener added below.
                tlsSocket.removeAllListeners("error");
                resolve(tlsSocket);
            }
        }).once("error", (error)=>{
            reject(error);
        });
    });
}
exports.upgradeSocket = upgradeSocket;
/**
 * Returns true if an IP is a private address according to https://tools.ietf.org/html/rfc1918#section-3.
 * This will handle IPv4-mapped IPv6 addresses correctly but return false for all other IPv6 addresses.
 *
 * @param ip  The IP as a string, e.g. "192.168.0.1"
 */ function ipIsPrivateV4Address(ip = "") {
    // Handle IPv4-mapped IPv6 addresses like ::ffff:192.168.0.1
    if (ip.startsWith("::ffff:")) ip = ip.substr(7); // Strip ::ffff: prefix
    const octets = ip.split(".").map((o)=>parseInt(o, 10));
    return octets[0] === 10 // 10.0.0.0 - 10.255.255.255
     || octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31 // 172.16.0.0 - 172.31.255.255
     || octets[0] === 192 && octets[1] === 168 // 192.168.0.0 - 192.168.255.255
     || ip === "127.0.0.1";
}
exports.ipIsPrivateV4Address = ipIsPrivateV4Address;

},{"8c75d1061bf236ce":"tls"}],"h0jnw":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.downloadTo = exports.uploadFrom = exports.connectForPassiveTransfer = exports.parsePasvResponse = exports.enterPassiveModeIPv4 = exports.parseEpsvResponse = exports.enterPassiveModeIPv6 = void 0;
const netUtils_1 = require("a74e05d0b5155ee6");
const stream_1 = require("717f47ddcae344b1");
const tls_1 = require("d7737fd45d6cf49c");
const parseControlResponse_1 = require("ad85a31539b1aeb7");
/**
 * Prepare a data socket using passive mode over IPv6.
 */ async function enterPassiveModeIPv6(ftp) {
    const res = await ftp.request("EPSV");
    const port = parseEpsvResponse(res.message);
    if (!port) throw new Error("Can't parse EPSV response: " + res.message);
    const controlHost = ftp.socket.remoteAddress;
    if (controlHost === undefined) throw new Error("Control socket is disconnected, can't get remote address.");
    await connectForPassiveTransfer(controlHost, port, ftp);
    return res;
}
exports.enterPassiveModeIPv6 = enterPassiveModeIPv6;
/**
 * Parse an EPSV response. Returns only the port as in EPSV the host of the control connection is used.
 */ function parseEpsvResponse(message) {
    // Get port from EPSV response, e.g. "229 Entering Extended Passive Mode (|||6446|)"
    // Some FTP Servers such as the one on IBM i (OS/400) use ! instead of | in their EPSV response.
    const groups = message.match(/[|!]{3}(.+)[|!]/);
    if (groups === null || groups[1] === undefined) throw new Error(`Can't parse response to 'EPSV': ${message}`);
    const port = parseInt(groups[1], 10);
    if (Number.isNaN(port)) throw new Error(`Can't parse response to 'EPSV', port is not a number: ${message}`);
    return port;
}
exports.parseEpsvResponse = parseEpsvResponse;
/**
 * Prepare a data socket using passive mode over IPv4.
 */ async function enterPassiveModeIPv4(ftp) {
    const res = await ftp.request("PASV");
    const target = parsePasvResponse(res.message);
    if (!target) throw new Error("Can't parse PASV response: " + res.message);
    // If the host in the PASV response has a local address while the control connection hasn't,
    // we assume a NAT issue and use the IP of the control connection as the target for the data connection.
    // We can't always perform this replacement because it's possible (although unlikely) that the FTP server
    // indeed uses a different host for data connections.
    const controlHost = ftp.socket.remoteAddress;
    if ((0, netUtils_1.ipIsPrivateV4Address)(target.host) && controlHost && !(0, netUtils_1.ipIsPrivateV4Address)(controlHost)) target.host = controlHost;
    await connectForPassiveTransfer(target.host, target.port, ftp);
    return res;
}
exports.enterPassiveModeIPv4 = enterPassiveModeIPv4;
/**
 * Parse a PASV response.
 */ function parsePasvResponse(message) {
    // Get host and port from PASV response, e.g. "227 Entering Passive Mode (192,168,1,100,10,229)"
    const groups = message.match(/([-\d]+,[-\d]+,[-\d]+,[-\d]+),([-\d]+),([-\d]+)/);
    if (groups === null || groups.length !== 4) throw new Error(`Can't parse response to 'PASV': ${message}`);
    return {
        host: groups[1].replace(/,/g, "."),
        port: (parseInt(groups[2], 10) & 255) * 256 + (parseInt(groups[3], 10) & 255)
    };
}
exports.parsePasvResponse = parsePasvResponse;
function connectForPassiveTransfer(host, port, ftp) {
    return new Promise((resolve, reject)=>{
        let socket = ftp._newSocket();
        const handleConnErr = function(err) {
            err.message = "Can't open data connection in passive mode: " + err.message;
            reject(err);
        };
        const handleTimeout = function() {
            socket.destroy();
            reject(new Error(`Timeout when trying to open data connection to ${host}:${port}`));
        };
        socket.setTimeout(ftp.timeout);
        socket.on("error", handleConnErr);
        socket.on("timeout", handleTimeout);
        socket.connect({
            port,
            host,
            family: ftp.ipFamily
        }, ()=>{
            if (ftp.socket instanceof tls_1.TLSSocket) socket = (0, tls_1.connect)(Object.assign({}, ftp.tlsOptions, {
                socket,
                // Reuse the TLS session negotiated earlier when the control connection
                // was upgraded. Servers expect this because it provides additional
                // security: If a completely new session would be negotiated, a hacker
                // could guess the port and connect to the new data connection before we do
                // by just starting his/her own TLS session.
                session: ftp.socket.getSession()
            }));
            // Let the FTPContext listen to errors from now on, remove local handler.
            socket.removeListener("error", handleConnErr);
            socket.removeListener("timeout", handleTimeout);
            ftp.dataSocket = socket;
            resolve();
        });
    });
}
exports.connectForPassiveTransfer = connectForPassiveTransfer;
/**
 * Helps resolving/rejecting transfers.
 *
 * This is used internally for all FTP transfers. For example when downloading, the server might confirm
 * with "226 Transfer complete" when in fact the download on the data connection has not finished
 * yet. With all transfers we make sure that a) the result arrived and b) has been confirmed by
 * e.g. the control connection. We just don't know in which order this will happen.
 */ class TransferResolver {
    /**
     * Instantiate a TransferResolver
     */ constructor(ftp, progress){
        this.ftp = ftp;
        this.progress = progress;
        this.response = undefined;
        this.dataTransferDone = false;
    }
    /**
     * Mark the beginning of a transfer.
     *
     * @param name - Name of the transfer, usually the filename.
     * @param type - Type of transfer, usually "upload" or "download".
     */ onDataStart(name, type) {
        // Let the data socket be in charge of tracking timeouts during transfer.
        // The control socket sits idle during this time anyway and might provoke
        // a timeout unnecessarily. The control connection will take care
        // of timeouts again once data transfer is complete or failed.
        if (this.ftp.dataSocket === undefined) throw new Error("Data transfer should start but there is no data connection.");
        this.ftp.socket.setTimeout(0);
        this.ftp.dataSocket.setTimeout(this.ftp.timeout);
        this.progress.start(this.ftp.dataSocket, name, type);
    }
    /**
     * The data connection has finished the transfer.
     */ onDataDone(task) {
        this.progress.updateAndStop();
        // Hand-over timeout tracking back to the control connection. It's possible that
        // we don't receive the response over the control connection that the transfer is
        // done. In this case, we want to correctly associate the resulting timeout with
        // the control connection.
        this.ftp.socket.setTimeout(this.ftp.timeout);
        if (this.ftp.dataSocket) this.ftp.dataSocket.setTimeout(0);
        this.dataTransferDone = true;
        this.tryResolve(task);
    }
    /**
     * The control connection reports the transfer as finished.
     */ onControlDone(task, response) {
        this.response = response;
        this.tryResolve(task);
    }
    /**
     * An error has been reported and the task should be rejected.
     */ onError(task, err) {
        this.progress.updateAndStop();
        this.ftp.socket.setTimeout(this.ftp.timeout);
        this.ftp.dataSocket = undefined;
        task.reject(err);
    }
    /**
     * Control connection sent an unexpected request requiring a response from our part. We
     * can't provide that (because unknown) and have to close the contrext with an error because
     * the FTP server is now caught up in a state we can't resolve.
     */ onUnexpectedRequest(response) {
        const err = new Error(`Unexpected FTP response is requesting an answer: ${response.message}`);
        this.ftp.closeWithError(err);
    }
    tryResolve(task) {
        // To resolve, we need both control and data connection to report that the transfer is done.
        const canResolve = this.dataTransferDone && this.response !== undefined;
        if (canResolve) {
            this.ftp.dataSocket = undefined;
            task.resolve(this.response);
        }
    }
}
function uploadFrom(source, config) {
    const resolver = new TransferResolver(config.ftp, config.tracker);
    const fullCommand = `${config.command} ${config.remotePath}`;
    return config.ftp.handle(fullCommand, (res, task)=>{
        if (res instanceof Error) resolver.onError(task, res);
        else if (res.code === 150 || res.code === 125) {
            const dataSocket = config.ftp.dataSocket;
            if (!dataSocket) {
                resolver.onError(task, new Error("Upload should begin but no data connection is available."));
                return;
            }
            // If we are using TLS, we have to wait until the dataSocket issued
            // 'secureConnect'. If this hasn't happened yet, getCipher() returns undefined.
            const canUpload = "getCipher" in dataSocket ? dataSocket.getCipher() !== undefined : true;
            onConditionOrEvent(canUpload, dataSocket, "secureConnect", ()=>{
                config.ftp.log(`Uploading to ${(0, netUtils_1.describeAddress)(dataSocket)} (${(0, netUtils_1.describeTLS)(dataSocket)})`);
                resolver.onDataStart(config.remotePath, config.type);
                (0, stream_1.pipeline)(source, dataSocket, (err)=>{
                    if (err) resolver.onError(task, err);
                    else resolver.onDataDone(task);
                });
            });
        } else if ((0, parseControlResponse_1.positiveCompletion)(res.code)) resolver.onControlDone(task, res);
        else if ((0, parseControlResponse_1.positiveIntermediate)(res.code)) resolver.onUnexpectedRequest(res);
    // Ignore all other positive preliminary response codes (< 200)
    });
}
exports.uploadFrom = uploadFrom;
function downloadTo(destination, config) {
    if (!config.ftp.dataSocket) throw new Error("Download will be initiated but no data connection is available.");
    const resolver = new TransferResolver(config.ftp, config.tracker);
    return config.ftp.handle(config.command, (res, task)=>{
        if (res instanceof Error) resolver.onError(task, res);
        else if (res.code === 150 || res.code === 125) {
            const dataSocket = config.ftp.dataSocket;
            if (!dataSocket) {
                resolver.onError(task, new Error("Download should begin but no data connection is available."));
                return;
            }
            config.ftp.log(`Downloading from ${(0, netUtils_1.describeAddress)(dataSocket)} (${(0, netUtils_1.describeTLS)(dataSocket)})`);
            resolver.onDataStart(config.remotePath, config.type);
            (0, stream_1.pipeline)(dataSocket, destination, (err)=>{
                if (err) resolver.onError(task, err);
                else resolver.onDataDone(task);
            });
        } else if (res.code === 350) config.ftp.send("RETR " + config.remotePath);
        else if ((0, parseControlResponse_1.positiveCompletion)(res.code)) resolver.onControlDone(task, res);
        else if ((0, parseControlResponse_1.positiveIntermediate)(res.code)) resolver.onUnexpectedRequest(res);
    // Ignore all other positive preliminary response codes (< 200)
    });
}
exports.downloadTo = downloadTo;
/**
 * Calls a function immediately if a condition is met or subscribes to an event and calls
 * it once the event is emitted.
 *
 * @param condition  The condition to test.
 * @param emitter  The emitter to use if the condition is not met.
 * @param eventName  The event to subscribe to if the condition is not met.
 * @param action  The function to call.
 */ function onConditionOrEvent(condition, emitter, eventName, action) {
    if (condition === true) action();
    else emitter.once(eventName, ()=>action());
}

},{"a74e05d0b5155ee6":"3CJQ6","717f47ddcae344b1":"stream","d7737fd45d6cf49c":"tls","ad85a31539b1aeb7":"g7deG"}],"5v5mP":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});

},{}],"3c3N9":[function(require,module,exports,__globalThis) {
"use strict";
var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        "default": mod
    };
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.http = void 0;
const http_1 = __importDefault(require("1d096ee60ccb7844"));
const https_1 = __importDefault(require("4f44a173a78b4043"));
const events_1 = require("80f20aabc24f27d0");
const debug_1 = __importDefault(require("6db5382a7d0a9770"));
const http_error_1 = __importDefault(require("ba79db1a51bf0785"));
const notfound_1 = __importDefault(require("9082387d2a072b77"));
const notmodified_1 = __importDefault(require("94157ab128f745ea"));
const debug = (0, debug_1.default)('get-uri:http');
/**
 * Returns a Readable stream from an "http:" URI.
 */ const http = async (url, opts = {})=>{
    debug('GET %o', url.href);
    const cache = getCache(url, opts.cache);
    // first check the previous Expires and/or Cache-Control headers
    // of a previous response if a `cache` was provided
    if (cache && isFresh(cache) && typeof cache.statusCode === 'number') {
        // check for a 3xx "redirect" status code on the previous cache
        const type = cache.statusCode / 100 | 0;
        if (type === 3 && cache.headers.location) {
            debug('cached redirect');
            throw new Error('TODO: implement cached redirects!');
        }
        // otherwise we assume that it's the destination endpoint,
        // since there's nowhere else to redirect to
        throw new notmodified_1.default();
    }
    // 5 redirects allowed by default
    const maxRedirects = typeof opts.maxRedirects === 'number' ? opts.maxRedirects : 5;
    debug('allowing %o max redirects', maxRedirects);
    let mod;
    if (opts.http) {
        // the `https` module passed in from the "http.js" file
        mod = opts.http;
        debug('using secure `https` core module');
    } else {
        mod = http_1.default;
        debug('using `http` core module');
    }
    const options = {
        ...opts
    };
    // add "cache validation" headers if a `cache` was provided
    if (cache) {
        if (!options.headers) options.headers = {};
        const lastModified = cache.headers['last-modified'];
        if (lastModified) {
            options.headers['If-Modified-Since'] = lastModified;
            debug('added "If-Modified-Since" request header: %o', lastModified);
        }
        const etag = cache.headers.etag;
        if (etag) {
            options.headers['If-None-Match'] = etag;
            debug('added "If-None-Match" request header: %o', etag);
        }
    }
    const req = mod.get(url, options);
    const [res] = await (0, events_1.once)(req, 'response');
    const code = res.statusCode || 0;
    // assign a Date to this response for the "Cache-Control" delta calculation
    res.date = Date.now();
    res.parsed = url;
    debug('got %o response status code', code);
    // any 2xx response is a "success" code
    const type = code / 100 | 0;
    // check for a 3xx "redirect" status code
    const location = res.headers.location;
    if (type === 3 && location) {
        if (!opts.redirects) opts.redirects = [];
        const redirects = opts.redirects;
        if (redirects.length < maxRedirects) {
            debug('got a "redirect" status code with Location: %o', location);
            // flush this response - we're not going to use it
            res.resume();
            // hang on to this Response object for the "redirects" Array
            redirects.push(res);
            const newUri = new URL(location, url.href);
            debug('resolved redirect URL: %o', newUri.href);
            const left = maxRedirects - redirects.length;
            debug('%o more redirects allowed after this one', left);
            // check if redirecting to a different protocol
            if (newUri.protocol !== url.protocol) opts.http = newUri.protocol === 'https:' ? https_1.default : undefined;
            return (0, exports.http)(newUri, opts);
        }
    }
    // if we didn't get a 2xx "success" status code, then create an Error object
    if (type !== 2) {
        res.resume();
        if (code === 304) throw new notmodified_1.default();
        else if (code === 404) throw new notfound_1.default();
        // other HTTP-level error
        throw new http_error_1.default(code);
    }
    if (opts.redirects) // store a reference to the "redirects" Array on the Response object so that
    // they can be inspected during a subsequent call to GET the same URI
    res.redirects = opts.redirects;
    return res;
};
exports.http = http;
/**
 * Returns `true` if the provided cache's "freshness" is valid. That is, either
 * the Cache-Control header or Expires header values are still within the allowed
 * time period.
 *
 * @return {Boolean}
 * @api private
 */ function isFresh(cache) {
    let fresh = false;
    let expires = parseInt(cache.headers.expires || '', 10);
    const cacheControl = cache.headers['cache-control'];
    if (cacheControl) {
        // for Cache-Control rules, see: http://www.mnot.net/cache_docs/#CACHE-CONTROL
        debug('Cache-Control: %o', cacheControl);
        const parts = cacheControl.split(/,\s*?\b/);
        for(let i = 0; i < parts.length; i++){
            const part = parts[i];
            const subparts = part.split('=');
            const name = subparts[0];
            switch(name){
                case 'max-age':
                    expires = (cache.date || 0) + parseInt(subparts[1], 10) * 1000;
                    fresh = Date.now() < expires;
                    if (fresh) debug('cache is "fresh" due to previous %o Cache-Control param', part);
                    return fresh;
                case 'must-revalidate':
                    break;
                case 'no-cache':
                case 'no-store':
                    debug('cache is "stale" due to explicit %o Cache-Control param', name);
                    return false;
                default:
                    break;
            }
        }
    } else if (expires) {
        // for Expires rules, see: http://www.mnot.net/cache_docs/#EXPIRES
        debug('Expires: %o', expires);
        fresh = Date.now() < expires;
        if (fresh) debug('cache is "fresh" due to previous Expires response header');
        return fresh;
    }
    return false;
}
/**
 * Attempts to return a previous Response object from a previous GET call to the
 * same URI.
 *
 * @api private
 */ function getCache(url, cache) {
    if (cache) {
        if (cache.parsed && cache.parsed.href === url.href) return cache;
        if (cache.redirects) for(let i = 0; i < cache.redirects.length; i++){
            const c = getCache(url, cache.redirects[i]);
            if (c) return c;
        }
    }
    return null;
}

},{"1d096ee60ccb7844":"http","4f44a173a78b4043":"https","80f20aabc24f27d0":"events","6db5382a7d0a9770":"gxWnv","ba79db1a51bf0785":"5qtWR","9082387d2a072b77":"eUnhI","94157ab128f745ea":"6jlj1"}],"5qtWR":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const http_1 = require("99db85b284b3d064");
/**
 * Error subclass to use when an HTTP application error has occurred.
 */ class HTTPError extends Error {
    constructor(statusCode, message = http_1.STATUS_CODES[statusCode]){
        super(message);
        this.statusCode = statusCode;
        this.code = `E${String(message).toUpperCase().replace(/\s+/g, '')}`;
    }
}
exports.default = HTTPError;

},{"99db85b284b3d064":"http"}],"8hp7l":[function(require,module,exports,__globalThis) {
"use strict";
var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        "default": mod
    };
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.https = void 0;
const https_1 = __importDefault(require("7d2ea6f1307b92d1"));
const http_1 = require("205c834cbc19d5b5");
/**
 * Returns a Readable stream from an "https:" URI.
 */ const https = (url, opts)=>{
    return (0, http_1.http)(url, {
        ...opts,
        http: https_1.default
    });
};
exports.https = https;

},{"7d2ea6f1307b92d1":"https","205c834cbc19d5b5":"3c3N9"}],"eeovc":[function(require,module,exports,__globalThis) {
"use strict";
var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        "default": mod
    };
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.sandbox = exports.createPacResolver = void 0;
const degenerator_1 = require("da0e0eeb3a382f5d");
/**
 * Built-in PAC functions.
 */ const dateRange_1 = __importDefault(require("b40603cb6f881d5"));
const dnsDomainIs_1 = __importDefault(require("76ede2ab035bca67"));
const dnsDomainLevels_1 = __importDefault(require("fffe891e21883766"));
const dnsResolve_1 = __importDefault(require("88bdf81f63e7ca16"));
const isInNet_1 = __importDefault(require("f79c4dd1459b501c"));
const isPlainHostName_1 = __importDefault(require("4796c9626f5ade9f"));
const isResolvable_1 = __importDefault(require("e790d1183d3b7041"));
const localHostOrDomainIs_1 = __importDefault(require("f8343e4804fd0db7"));
const myIpAddress_1 = __importDefault(require("b3e3eaba8db8e04b"));
const shExpMatch_1 = __importDefault(require("8f5ffb9325acf05"));
const timeRange_1 = __importDefault(require("eab0630cc095687e"));
const weekdayRange_1 = __importDefault(require("9dfafea5b1dfccb4"));
/**
 * Returns an asynchronous `FindProxyForURL()` function
 * from the given JS string (from a PAC file).
 */ function createPacResolver(qjs, _str, _opts = {}) {
    const str = Buffer.isBuffer(_str) ? _str.toString('utf8') : _str;
    // The sandbox to use for the `vm` context.
    const context = {
        ...exports.sandbox,
        ..._opts.sandbox
    };
    // Construct the array of async function names to add `await` calls to.
    const names = Object.keys(context).filter((k)=>isAsyncFunction(context[k]));
    const opts = {
        filename: 'proxy.pac',
        names,
        ..._opts,
        sandbox: context
    };
    // Compile the JS `FindProxyForURL()` function into an async function.
    const resolver = (0, degenerator_1.compile)(qjs, str, 'FindProxyForURL', opts);
    function FindProxyForURL(url, _host) {
        const urlObj = typeof url === 'string' ? new URL(url) : url;
        const host = _host || urlObj.hostname;
        if (!host) throw new TypeError('Could not determine `host`');
        return resolver(urlObj.href, host);
    }
    Object.defineProperty(FindProxyForURL, 'toString', {
        value: ()=>resolver.toString(),
        enumerable: false
    });
    return FindProxyForURL;
}
exports.createPacResolver = createPacResolver;
exports.sandbox = Object.freeze({
    alert: (message = '')=>console.log('%s', message),
    dateRange: dateRange_1.default,
    dnsDomainIs: dnsDomainIs_1.default,
    dnsDomainLevels: dnsDomainLevels_1.default,
    dnsResolve: dnsResolve_1.default,
    isInNet: isInNet_1.default,
    isPlainHostName: isPlainHostName_1.default,
    isResolvable: isResolvable_1.default,
    localHostOrDomainIs: localHostOrDomainIs_1.default,
    myIpAddress: myIpAddress_1.default,
    shExpMatch: shExpMatch_1.default,
    timeRange: timeRange_1.default,
    weekdayRange: weekdayRange_1.default
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isAsyncFunction(v) {
    if (typeof v !== 'function') return false;
    // Native `AsyncFunction`
    if (v.constructor.name === 'AsyncFunction') return true;
    // TypeScript compiled
    if (String(v).indexOf('__awaiter(') !== -1) return true;
    // Legacy behavior - set `async` property on the function
    return Boolean(v.async);
}

},{"da0e0eeb3a382f5d":"8RM0N","b40603cb6f881d5":"8LEOS","76ede2ab035bca67":"hTMlB","fffe891e21883766":"bIWrF","88bdf81f63e7ca16":"8cfGT","f79c4dd1459b501c":"7M0oN","4796c9626f5ade9f":"dvkMq","e790d1183d3b7041":"29Lk5","f8343e4804fd0db7":"cMyLF","b3e3eaba8db8e04b":"jwZ0B","8f5ffb9325acf05":"bY2AC","eab0630cc095687e":"gK1y9","9dfafea5b1dfccb4":"iYyHB"}],"8RM0N":[function(require,module,exports,__globalThis) {
"use strict";
var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
        enumerable: true,
        get: function() {
            return m[k];
        }
    };
    Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __exportStar = this && this.__exportStar || function(m, exports1) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports1, p)) __createBinding(exports1, m, p);
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
__exportStar(require("131a164068c634d1"), exports);
__exportStar(require("85c4bfe74d13eefe"), exports);

},{"131a164068c634d1":"hZ2cD","85c4bfe74d13eefe":"kcNbE"}],"hZ2cD":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.degenerator = void 0;
const util_1 = require("fffab21d791510d1");
const escodegen_1 = require("ba7111d5f8b50429");
const esprima_1 = require("e9118b74205b9406");
const ast_types_1 = require("4c16d0e04d90fea1");
/**
 * Compiles sync JavaScript code into JavaScript with async Functions.
 *
 * @param {String} code JavaScript string to convert
 * @param {Array} names Array of function names to add `await` operators to
 * @return {String} Converted JavaScript string with async/await injected
 * @api public
 */ function degenerator(code, _names) {
    if (!Array.isArray(_names)) throw new TypeError('an array of async function "names" is required');
    // Duplicate the `names` array since it's rude to augment the user args
    const names = _names.slice(0);
    const ast = (0, esprima_1.parseScript)(code);
    // First pass is to find the `function` nodes and turn them into async or
    // generator functions only if their body includes `CallExpressions` to
    // function in `names`. We also add the names of the functions to the `names`
    // array. We'll iterate several time, as every iteration might add new items
    // to the `names` array, until no new names were added in the iteration.
    let lastNamesLength = 0;
    do {
        lastNamesLength = names.length;
        (0, ast_types_1.visit)(ast, {
            visitVariableDeclaration (path) {
                if (path.node.declarations) for(let i = 0; i < path.node.declarations.length; i++){
                    const declaration = path.node.declarations[i];
                    if (ast_types_1.namedTypes.VariableDeclarator.check(declaration) && ast_types_1.namedTypes.Identifier.check(declaration.init) && ast_types_1.namedTypes.Identifier.check(declaration.id) && checkName(declaration.init.name, names) && !checkName(declaration.id.name, names)) names.push(declaration.id.name);
                }
                return false;
            },
            visitAssignmentExpression (path) {
                if (ast_types_1.namedTypes.Identifier.check(path.node.left) && ast_types_1.namedTypes.Identifier.check(path.node.right) && checkName(path.node.right.name, names) && !checkName(path.node.left.name, names)) names.push(path.node.left.name);
                return false;
            },
            visitFunction (path) {
                if (path.node.id) {
                    let shouldDegenerate = false;
                    (0, ast_types_1.visit)(path.node, {
                        visitCallExpression (path) {
                            if (checkNames(path.node, names)) shouldDegenerate = true;
                            return false;
                        }
                    });
                    if (!shouldDegenerate) return false;
                    // Got a "function" expression/statement,
                    // convert it into an async function
                    path.node.async = true;
                    // Add function name to `names` array
                    if (!checkName(path.node.id.name, names)) names.push(path.node.id.name);
                }
                this.traverse(path);
            }
        });
    }while (lastNamesLength !== names.length);
    // Second pass is for adding `await` statements to any function
    // invocations that match the given `names` array.
    (0, ast_types_1.visit)(ast, {
        visitCallExpression (path) {
            if (checkNames(path.node, names)) {
                // A "function invocation" expression,
                // we need to inject an `AwaitExpression`
                const delegate = false;
                const { name, parent: { node: pNode } } = path;
                const expr = ast_types_1.builders.awaitExpression(path.node, delegate);
                if (ast_types_1.namedTypes.CallExpression.check(pNode)) pNode.arguments[name] = expr;
                else pNode[name] = expr;
            }
            this.traverse(path);
        }
    });
    return (0, escodegen_1.generate)(ast);
}
exports.degenerator = degenerator;
/**
 * Returns `true` if `node` has a matching name to one of the entries in the
 * `names` array.
 *
 * @param {types.Node} node
 * @param {Array} names Array of function names to return true for
 * @return {Boolean}
 * @api private
 */ function checkNames({ callee }, names) {
    let name;
    if (ast_types_1.namedTypes.Identifier.check(callee)) name = callee.name;
    else if (ast_types_1.namedTypes.MemberExpression.check(callee)) {
        if (ast_types_1.namedTypes.Identifier.check(callee.object) && ast_types_1.namedTypes.Identifier.check(callee.property)) name = `${callee.object.name}.${callee.property.name}`;
        else return false;
    } else if (ast_types_1.namedTypes.FunctionExpression.check(callee)) {
        if (callee.id) name = callee.id.name;
        else return false;
    } else throw new Error(`Don't know how to get name for: ${callee.type}`);
    return checkName(name, names);
}
function checkName(name, names) {
    // now that we have the `name`, check if any entries match in the `names` array
    for(let i = 0; i < names.length; i++){
        const n = names[i];
        if (util_1.types.isRegExp(n)) {
            if (n.test(name)) return true;
        } else if (name === n) return true;
    }
    return false;
}

},{"fffab21d791510d1":"util","ba7111d5f8b50429":"1jIgT","e9118b74205b9406":"8RH6f","4c16d0e04d90fea1":"kMWwa"}],"1jIgT":[function(require,module,exports,__globalThis) {
/*
  Copyright (C) 2012-2014 Yusuke Suzuki <utatane.tea@gmail.com>
  Copyright (C) 2015 Ingvar Stepanyan <me@rreverser.com>
  Copyright (C) 2014 Ivan Nikulin <ifaaan@gmail.com>
  Copyright (C) 2012-2013 Michael Ficarra <escodegen.copyright@michael.ficarra.me>
  Copyright (C) 2012-2013 Mathias Bynens <mathias@qiwi.be>
  Copyright (C) 2013 Irakli Gozalishvili <rfobic@gmail.com>
  Copyright (C) 2012 Robert Gust-Bardon <donate@robert.gust-bardon.org>
  Copyright (C) 2012 John Freeman <jfreeman08@gmail.com>
  Copyright (C) 2011-2012 Ariya Hidayat <ariya.hidayat@gmail.com>
  Copyright (C) 2012 Joost-Wim Boekesteijn <joost-wim@boekesteijn.nl>
  Copyright (C) 2012 Kris Kowal <kris.kowal@cixar.com>
  Copyright (C) 2012 Arpad Borsos <arpad.borsos@googlemail.com>
  Copyright (C) 2020 Apple Inc. All rights reserved.

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/ /*global exports:true, require:true, global:true*/ (function() {
    'use strict';
    var Syntax, Precedence, BinaryPrecedence, SourceNode, estraverse, esutils, base, indent, json, renumber, hexadecimal, quotes, escapeless, newline, space, parentheses, semicolons, safeConcatenation, directive, extra, parse, sourceMap, sourceCode, preserveBlankLines, FORMAT_MINIFY, FORMAT_DEFAULTS;
    estraverse = require("5b5c0717ac637391");
    esutils = require("95278b98f3235005");
    Syntax = estraverse.Syntax;
    // Generation is done by generateExpression.
    function isExpression(node) {
        return CodeGenerator.Expression.hasOwnProperty(node.type);
    }
    // Generation is done by generateStatement.
    function isStatement(node) {
        return CodeGenerator.Statement.hasOwnProperty(node.type);
    }
    Precedence = {
        Sequence: 0,
        Yield: 1,
        Assignment: 1,
        Conditional: 2,
        ArrowFunction: 2,
        Coalesce: 3,
        LogicalOR: 4,
        LogicalAND: 5,
        BitwiseOR: 6,
        BitwiseXOR: 7,
        BitwiseAND: 8,
        Equality: 9,
        Relational: 10,
        BitwiseSHIFT: 11,
        Additive: 12,
        Multiplicative: 13,
        Exponentiation: 14,
        Await: 15,
        Unary: 15,
        Postfix: 16,
        OptionalChaining: 17,
        Call: 18,
        New: 19,
        TaggedTemplate: 20,
        Member: 21,
        Primary: 22
    };
    BinaryPrecedence = {
        '??': Precedence.Coalesce,
        '||': Precedence.LogicalOR,
        '&&': Precedence.LogicalAND,
        '|': Precedence.BitwiseOR,
        '^': Precedence.BitwiseXOR,
        '&': Precedence.BitwiseAND,
        '==': Precedence.Equality,
        '!=': Precedence.Equality,
        '===': Precedence.Equality,
        '!==': Precedence.Equality,
        'is': Precedence.Equality,
        'isnt': Precedence.Equality,
        '<': Precedence.Relational,
        '>': Precedence.Relational,
        '<=': Precedence.Relational,
        '>=': Precedence.Relational,
        'in': Precedence.Relational,
        'instanceof': Precedence.Relational,
        '<<': Precedence.BitwiseSHIFT,
        '>>': Precedence.BitwiseSHIFT,
        '>>>': Precedence.BitwiseSHIFT,
        '+': Precedence.Additive,
        '-': Precedence.Additive,
        '*': Precedence.Multiplicative,
        '%': Precedence.Multiplicative,
        '/': Precedence.Multiplicative,
        '**': Precedence.Exponentiation
    };
    //Flags
    var F_ALLOW_IN = 1, F_ALLOW_CALL = 2, F_ALLOW_UNPARATH_NEW = 4, F_FUNC_BODY = 8, F_DIRECTIVE_CTX = 16, F_SEMICOLON_OPT = 32, F_FOUND_COALESCE = 64;
    //Expression flag sets
    //NOTE: Flag order:
    // F_ALLOW_IN
    // F_ALLOW_CALL
    // F_ALLOW_UNPARATH_NEW
    var E_FTT = F_ALLOW_CALL | F_ALLOW_UNPARATH_NEW, E_TTF = F_ALLOW_IN | F_ALLOW_CALL, E_TTT = F_ALLOW_IN | F_ALLOW_CALL | F_ALLOW_UNPARATH_NEW, E_TFF = F_ALLOW_IN, E_FFT = F_ALLOW_UNPARATH_NEW, E_TFT = F_ALLOW_IN | F_ALLOW_UNPARATH_NEW;
    //Statement flag sets
    //NOTE: Flag order:
    // F_ALLOW_IN
    // F_FUNC_BODY
    // F_DIRECTIVE_CTX
    // F_SEMICOLON_OPT
    var S_TFFF = F_ALLOW_IN, S_TFFT = F_ALLOW_IN | F_SEMICOLON_OPT, S_FFFF = 0x00, S_TFTF = F_ALLOW_IN | F_DIRECTIVE_CTX, S_TTFF = F_ALLOW_IN | F_FUNC_BODY;
    function getDefaultOptions() {
        // default options
        return {
            indent: null,
            base: null,
            parse: null,
            comment: false,
            format: {
                indent: {
                    style: '    ',
                    base: 0,
                    adjustMultilineComment: false
                },
                newline: '\n',
                space: ' ',
                json: false,
                renumber: false,
                hexadecimal: false,
                quotes: 'single',
                escapeless: false,
                compact: false,
                parentheses: true,
                semicolons: true,
                safeConcatenation: false,
                preserveBlankLines: false
            },
            moz: {
                comprehensionExpressionStartsWithAssignment: false,
                starlessGenerator: false
            },
            sourceMap: null,
            sourceMapRoot: null,
            sourceMapWithCode: false,
            directive: false,
            raw: true,
            verbatim: null,
            sourceCode: null
        };
    }
    function stringRepeat(str, num) {
        var result = '';
        for(num |= 0; num > 0; num >>>= 1, str += str)if (num & 1) result += str;
        return result;
    }
    function hasLineTerminator(str) {
        return /[\r\n]/g.test(str);
    }
    function endsWithLineTerminator(str) {
        var len = str.length;
        return len && esutils.code.isLineTerminator(str.charCodeAt(len - 1));
    }
    function merge(target, override) {
        var key;
        for(key in override)if (override.hasOwnProperty(key)) target[key] = override[key];
        return target;
    }
    function updateDeeply(target, override) {
        var key, val;
        function isHashObject(target) {
            return typeof target === 'object' && target instanceof Object && !(target instanceof RegExp);
        }
        for(key in override)if (override.hasOwnProperty(key)) {
            val = override[key];
            if (isHashObject(val)) {
                if (isHashObject(target[key])) updateDeeply(target[key], val);
                else target[key] = updateDeeply({}, val);
            } else target[key] = val;
        }
        return target;
    }
    function generateNumber(value) {
        var result, point, temp, exponent, pos;
        if (value !== value) throw new Error('Numeric literal whose value is NaN');
        if (value < 0 || value === 0 && 1 / value < 0) throw new Error('Numeric literal whose value is negative');
        if (value === 1 / 0) return json ? 'null' : renumber ? '1e400' : '1e+400';
        result = '' + value;
        if (!renumber || result.length < 3) return result;
        point = result.indexOf('.');
        if (!json && result.charCodeAt(0) === 0x30 /* 0 */  && point === 1) {
            point = 0;
            result = result.slice(1);
        }
        temp = result;
        result = result.replace('e+', 'e');
        exponent = 0;
        if ((pos = temp.indexOf('e')) > 0) {
            exponent = +temp.slice(pos + 1);
            temp = temp.slice(0, pos);
        }
        if (point >= 0) {
            exponent -= temp.length - point - 1;
            temp = +(temp.slice(0, point) + temp.slice(point + 1)) + '';
        }
        pos = 0;
        while(temp.charCodeAt(temp.length + pos - 1) === 0x30 /* 0 */ )--pos;
        if (pos !== 0) {
            exponent -= pos;
            temp = temp.slice(0, pos);
        }
        if (exponent !== 0) temp += 'e' + exponent;
        if ((temp.length < result.length || hexadecimal && value > 1e12 && Math.floor(value) === value && (temp = '0x' + value.toString(16)).length < result.length) && +temp === value) result = temp;
        return result;
    }
    // Generate valid RegExp expression.
    // This function is based on https://github.com/Constellation/iv Engine
    function escapeRegExpCharacter(ch, previousIsBackslash) {
        // not handling '\' and handling \u2028 or \u2029 to unicode escape sequence
        if ((ch & -2) === 0x2028) return (previousIsBackslash ? 'u' : '\\u') + (ch === 0x2028 ? '2028' : '2029');
        else if (ch === 10 || ch === 13) return (previousIsBackslash ? '' : '\\') + (ch === 10 ? 'n' : 'r');
        return String.fromCharCode(ch);
    }
    function generateRegExp(reg) {
        var match, result, flags, i, iz, ch, characterInBrack, previousIsBackslash;
        result = reg.toString();
        if (reg.source) {
            // extract flag from toString result
            match = result.match(/\/([^/]*)$/);
            if (!match) return result;
            flags = match[1];
            result = '';
            characterInBrack = false;
            previousIsBackslash = false;
            for(i = 0, iz = reg.source.length; i < iz; ++i){
                ch = reg.source.charCodeAt(i);
                if (!previousIsBackslash) {
                    if (characterInBrack) {
                        if (ch === 93) characterInBrack = false;
                    } else {
                        if (ch === 47) result += '\\';
                        else if (ch === 91) characterInBrack = true;
                    }
                    result += escapeRegExpCharacter(ch, previousIsBackslash);
                    previousIsBackslash = ch === 92; // \
                } else {
                    // if new RegExp("\\\n') is provided, create /\n/
                    result += escapeRegExpCharacter(ch, previousIsBackslash);
                    // prevent like /\\[/]/
                    previousIsBackslash = false;
                }
            }
            return '/' + result + '/' + flags;
        }
        return result;
    }
    function escapeAllowedCharacter(code, next) {
        var hex;
        if (code === 0x08 /* \b */ ) return '\\b';
        if (code === 0x0C /* \f */ ) return '\\f';
        if (code === 0x09 /* \t */ ) return '\\t';
        hex = code.toString(16).toUpperCase();
        if (json || code > 0xFF) return '\\u' + '0000'.slice(hex.length) + hex;
        else if (code === 0x0000 && !esutils.code.isDecimalDigit(next)) return '\\0';
        else if (code === 0x000B /* \v */ ) return '\\x0B';
        else return '\\x' + '00'.slice(hex.length) + hex;
    }
    function escapeDisallowedCharacter(code) {
        if (code === 0x5C /* \ */ ) return '\\\\';
        if (code === 0x0A /* \n */ ) return '\\n';
        if (code === 0x0D /* \r */ ) return '\\r';
        if (code === 0x2028) return '\\u2028';
        if (code === 0x2029) return '\\u2029';
        throw new Error('Incorrectly classified character');
    }
    function escapeDirective(str) {
        var i, iz, code, quote;
        quote = quotes === 'double' ? '"' : '\'';
        for(i = 0, iz = str.length; i < iz; ++i){
            code = str.charCodeAt(i);
            if (code === 0x27 /* ' */ ) {
                quote = '"';
                break;
            } else if (code === 0x22 /* " */ ) {
                quote = '\'';
                break;
            } else if (code === 0x5C /* \ */ ) ++i;
        }
        return quote + str + quote;
    }
    function escapeString(str) {
        var result = '', i, len, code, singleQuotes = 0, doubleQuotes = 0, single, quote;
        for(i = 0, len = str.length; i < len; ++i){
            code = str.charCodeAt(i);
            if (code === 0x27 /* ' */ ) ++singleQuotes;
            else if (code === 0x22 /* " */ ) ++doubleQuotes;
            else if (code === 0x2F /* / */  && json) result += '\\';
            else if (esutils.code.isLineTerminator(code) || code === 0x5C /* \ */ ) {
                result += escapeDisallowedCharacter(code);
                continue;
            } else if (!esutils.code.isIdentifierPartES5(code) && (json && code < 0x20 /* SP */  || !json && !escapeless && (code < 0x20 /* SP */  || code > 0x7E /* ~ */ ))) {
                result += escapeAllowedCharacter(code, str.charCodeAt(i + 1));
                continue;
            }
            result += String.fromCharCode(code);
        }
        single = !(quotes === 'double' || quotes === 'auto' && doubleQuotes < singleQuotes);
        quote = single ? '\'' : '"';
        if (!(single ? singleQuotes : doubleQuotes)) return quote + result + quote;
        str = result;
        result = quote;
        for(i = 0, len = str.length; i < len; ++i){
            code = str.charCodeAt(i);
            if (code === 0x27 /* ' */  && single || code === 0x22 /* " */  && !single) result += '\\';
            result += String.fromCharCode(code);
        }
        return result + quote;
    }
    /**
     * flatten an array to a string, where the array can contain
     * either strings or nested arrays
     */ function flattenToString(arr) {
        var i, iz, elem, result = '';
        for(i = 0, iz = arr.length; i < iz; ++i){
            elem = arr[i];
            result += Array.isArray(elem) ? flattenToString(elem) : elem;
        }
        return result;
    }
    /**
     * convert generated to a SourceNode when source maps are enabled.
     */ function toSourceNodeWhenNeeded(generated, node) {
        if (!sourceMap) {
            // with no source maps, generated is either an
            // array or a string.  if an array, flatten it.
            // if a string, just return it
            if (Array.isArray(generated)) return flattenToString(generated);
            else return generated;
        }
        if (node == null) {
            if (generated instanceof SourceNode) return generated;
            else node = {};
        }
        if (node.loc == null) return new SourceNode(null, null, sourceMap, generated, node.name || null);
        return new SourceNode(node.loc.start.line, node.loc.start.column, sourceMap === true ? node.loc.source || null : sourceMap, generated, node.name || null);
    }
    function noEmptySpace() {
        return space ? space : ' ';
    }
    function join(left, right) {
        var leftSource, rightSource, leftCharCode, rightCharCode;
        leftSource = toSourceNodeWhenNeeded(left).toString();
        if (leftSource.length === 0) return [
            right
        ];
        rightSource = toSourceNodeWhenNeeded(right).toString();
        if (rightSource.length === 0) return [
            left
        ];
        leftCharCode = leftSource.charCodeAt(leftSource.length - 1);
        rightCharCode = rightSource.charCodeAt(0);
        if ((leftCharCode === 0x2B /* + */  || leftCharCode === 0x2D /* - */ ) && leftCharCode === rightCharCode || esutils.code.isIdentifierPartES5(leftCharCode) && esutils.code.isIdentifierPartES5(rightCharCode) || leftCharCode === 0x2F /* / */  && rightCharCode === 0x69 /* i */ ) return [
            left,
            noEmptySpace(),
            right
        ];
        else if (esutils.code.isWhiteSpace(leftCharCode) || esutils.code.isLineTerminator(leftCharCode) || esutils.code.isWhiteSpace(rightCharCode) || esutils.code.isLineTerminator(rightCharCode)) return [
            left,
            right
        ];
        return [
            left,
            space,
            right
        ];
    }
    function addIndent(stmt) {
        return [
            base,
            stmt
        ];
    }
    function withIndent(fn) {
        var previousBase;
        previousBase = base;
        base += indent;
        fn(base);
        base = previousBase;
    }
    function calculateSpaces(str) {
        var i;
        for(i = str.length - 1; i >= 0; --i){
            if (esutils.code.isLineTerminator(str.charCodeAt(i))) break;
        }
        return str.length - 1 - i;
    }
    function adjustMultilineComment(value, specialBase) {
        var array, i, len, line, j, spaces, previousBase, sn;
        array = value.split(/\r\n|[\r\n]/);
        spaces = Number.MAX_VALUE;
        // first line doesn't have indentation
        for(i = 1, len = array.length; i < len; ++i){
            line = array[i];
            j = 0;
            while(j < line.length && esutils.code.isWhiteSpace(line.charCodeAt(j)))++j;
            if (spaces > j) spaces = j;
        }
        if (typeof specialBase !== 'undefined') {
            // pattern like
            // {
            //   var t = 20;  /*
            //                 * this is comment
            //                 */
            // }
            previousBase = base;
            if (array[1][spaces] === '*') specialBase += ' ';
            base = specialBase;
        } else {
            if (spaces & 1) // /*
            //  *
            //  */
            // If spaces are odd number, above pattern is considered.
            // We waste 1 space.
            --spaces;
            previousBase = base;
        }
        for(i = 1, len = array.length; i < len; ++i){
            sn = toSourceNodeWhenNeeded(addIndent(array[i].slice(spaces)));
            array[i] = sourceMap ? sn.join('') : sn;
        }
        base = previousBase;
        return array.join('\n');
    }
    function generateComment(comment, specialBase) {
        if (comment.type === 'Line') {
            if (endsWithLineTerminator(comment.value)) return '//' + comment.value;
            else {
                // Always use LineTerminator
                var result = '//' + comment.value;
                if (!preserveBlankLines) result += '\n';
                return result;
            }
        }
        if (extra.format.indent.adjustMultilineComment && /[\n\r]/.test(comment.value)) return adjustMultilineComment('/*' + comment.value + '*/', specialBase);
        return '/*' + comment.value + '*/';
    }
    function addComments(stmt, result) {
        var i, len, comment, save, tailingToStatement, specialBase, fragment, extRange, range, prevRange, prefix, infix, suffix, count;
        if (stmt.leadingComments && stmt.leadingComments.length > 0) {
            save = result;
            if (preserveBlankLines) {
                comment = stmt.leadingComments[0];
                result = [];
                extRange = comment.extendedRange;
                range = comment.range;
                prefix = sourceCode.substring(extRange[0], range[0]);
                count = (prefix.match(/\n/g) || []).length;
                if (count > 0) {
                    result.push(stringRepeat('\n', count));
                    result.push(addIndent(generateComment(comment)));
                } else {
                    result.push(prefix);
                    result.push(generateComment(comment));
                }
                prevRange = range;
                for(i = 1, len = stmt.leadingComments.length; i < len; i++){
                    comment = stmt.leadingComments[i];
                    range = comment.range;
                    infix = sourceCode.substring(prevRange[1], range[0]);
                    count = (infix.match(/\n/g) || []).length;
                    result.push(stringRepeat('\n', count));
                    result.push(addIndent(generateComment(comment)));
                    prevRange = range;
                }
                suffix = sourceCode.substring(range[1], extRange[1]);
                count = (suffix.match(/\n/g) || []).length;
                result.push(stringRepeat('\n', count));
            } else {
                comment = stmt.leadingComments[0];
                result = [];
                if (safeConcatenation && stmt.type === Syntax.Program && stmt.body.length === 0) result.push('\n');
                result.push(generateComment(comment));
                if (!endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) result.push('\n');
                for(i = 1, len = stmt.leadingComments.length; i < len; ++i){
                    comment = stmt.leadingComments[i];
                    fragment = [
                        generateComment(comment)
                    ];
                    if (!endsWithLineTerminator(toSourceNodeWhenNeeded(fragment).toString())) fragment.push('\n');
                    result.push(addIndent(fragment));
                }
            }
            result.push(addIndent(save));
        }
        if (stmt.trailingComments) {
            if (preserveBlankLines) {
                comment = stmt.trailingComments[0];
                extRange = comment.extendedRange;
                range = comment.range;
                prefix = sourceCode.substring(extRange[0], range[0]);
                count = (prefix.match(/\n/g) || []).length;
                if (count > 0) {
                    result.push(stringRepeat('\n', count));
                    result.push(addIndent(generateComment(comment)));
                } else {
                    result.push(prefix);
                    result.push(generateComment(comment));
                }
            } else {
                tailingToStatement = !endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString());
                specialBase = stringRepeat(' ', calculateSpaces(toSourceNodeWhenNeeded([
                    base,
                    result,
                    indent
                ]).toString()));
                for(i = 0, len = stmt.trailingComments.length; i < len; ++i){
                    comment = stmt.trailingComments[i];
                    if (tailingToStatement) {
                        // We assume target like following script
                        //
                        // var t = 20;  /**
                        //               * This is comment of t
                        //               */
                        if (i === 0) // first case
                        result = [
                            result,
                            indent
                        ];
                        else result = [
                            result,
                            specialBase
                        ];
                        result.push(generateComment(comment, specialBase));
                    } else result = [
                        result,
                        addIndent(generateComment(comment))
                    ];
                    if (i !== len - 1 && !endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) result = [
                        result,
                        '\n'
                    ];
                }
            }
        }
        return result;
    }
    function generateBlankLines(start, end, result) {
        var j, newlineCount = 0;
        for(j = start; j < end; j++)if (sourceCode[j] === '\n') newlineCount++;
        for(j = 1; j < newlineCount; j++)result.push(newline);
    }
    function parenthesize(text, current, should) {
        if (current < should) return [
            '(',
            text,
            ')'
        ];
        return text;
    }
    function generateVerbatimString(string) {
        var i, iz, result;
        result = string.split(/\r\n|\n/);
        for(i = 1, iz = result.length; i < iz; i++)result[i] = newline + base + result[i];
        return result;
    }
    function generateVerbatim(expr, precedence) {
        var verbatim, result, prec;
        verbatim = expr[extra.verbatim];
        if (typeof verbatim === 'string') result = parenthesize(generateVerbatimString(verbatim), Precedence.Sequence, precedence);
        else {
            // verbatim is object
            result = generateVerbatimString(verbatim.content);
            prec = verbatim.precedence != null ? verbatim.precedence : Precedence.Sequence;
            result = parenthesize(result, prec, precedence);
        }
        return toSourceNodeWhenNeeded(result, expr);
    }
    function CodeGenerator() {}
    // Helpers.
    CodeGenerator.prototype.maybeBlock = function(stmt, flags) {
        var result, noLeadingComment, that = this;
        noLeadingComment = !extra.comment || !stmt.leadingComments;
        if (stmt.type === Syntax.BlockStatement && noLeadingComment) return [
            space,
            this.generateStatement(stmt, flags)
        ];
        if (stmt.type === Syntax.EmptyStatement && noLeadingComment) return ';';
        withIndent(function() {
            result = [
                newline,
                addIndent(that.generateStatement(stmt, flags))
            ];
        });
        return result;
    };
    CodeGenerator.prototype.maybeBlockSuffix = function(stmt, result) {
        var ends = endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString());
        if (stmt.type === Syntax.BlockStatement && (!extra.comment || !stmt.leadingComments) && !ends) return [
            result,
            space
        ];
        if (ends) return [
            result,
            base
        ];
        return [
            result,
            newline,
            base
        ];
    };
    function generateIdentifier(node) {
        return toSourceNodeWhenNeeded(node.name, node);
    }
    function generateAsyncPrefix(node, spaceRequired) {
        return node.async ? 'async' + (spaceRequired ? noEmptySpace() : space) : '';
    }
    function generateStarSuffix(node) {
        var isGenerator = node.generator && !extra.moz.starlessGenerator;
        return isGenerator ? '*' + space : '';
    }
    function generateMethodPrefix(prop) {
        var func = prop.value, prefix = '';
        if (func.async) prefix += generateAsyncPrefix(func, !prop.computed);
        if (func.generator) // avoid space before method name
        prefix += generateStarSuffix(func) ? '*' : '';
        return prefix;
    }
    CodeGenerator.prototype.generatePattern = function(node, precedence, flags) {
        if (node.type === Syntax.Identifier) return generateIdentifier(node);
        return this.generateExpression(node, precedence, flags);
    };
    CodeGenerator.prototype.generateFunctionParams = function(node) {
        var i, iz, result, hasDefault;
        hasDefault = false;
        if (node.type === Syntax.ArrowFunctionExpression && !node.rest && (!node.defaults || node.defaults.length === 0) && node.params.length === 1 && node.params[0].type === Syntax.Identifier) // arg => { } case
        result = [
            generateAsyncPrefix(node, true),
            generateIdentifier(node.params[0])
        ];
        else {
            result = node.type === Syntax.ArrowFunctionExpression ? [
                generateAsyncPrefix(node, false)
            ] : [];
            result.push('(');
            if (node.defaults) hasDefault = true;
            for(i = 0, iz = node.params.length; i < iz; ++i){
                if (hasDefault && node.defaults[i]) // Handle default values.
                result.push(this.generateAssignment(node.params[i], node.defaults[i], '=', Precedence.Assignment, E_TTT));
                else result.push(this.generatePattern(node.params[i], Precedence.Assignment, E_TTT));
                if (i + 1 < iz) result.push(',' + space);
            }
            if (node.rest) {
                if (node.params.length) result.push(',' + space);
                result.push('...');
                result.push(generateIdentifier(node.rest));
            }
            result.push(')');
        }
        return result;
    };
    CodeGenerator.prototype.generateFunctionBody = function(node) {
        var result, expr;
        result = this.generateFunctionParams(node);
        if (node.type === Syntax.ArrowFunctionExpression) {
            result.push(space);
            result.push('=>');
        }
        if (node.expression) {
            result.push(space);
            expr = this.generateExpression(node.body, Precedence.Assignment, E_TTT);
            if (expr.toString().charAt(0) === '{') expr = [
                '(',
                expr,
                ')'
            ];
            result.push(expr);
        } else result.push(this.maybeBlock(node.body, S_TTFF));
        return result;
    };
    CodeGenerator.prototype.generateIterationForStatement = function(operator, stmt, flags) {
        var result = [
            'for' + (stmt.await ? noEmptySpace() + 'await' : '') + space + '('
        ], that = this;
        withIndent(function() {
            if (stmt.left.type === Syntax.VariableDeclaration) withIndent(function() {
                result.push(stmt.left.kind + noEmptySpace());
                result.push(that.generateStatement(stmt.left.declarations[0], S_FFFF));
            });
            else result.push(that.generateExpression(stmt.left, Precedence.Call, E_TTT));
            result = join(result, operator);
            result = [
                join(result, that.generateExpression(stmt.right, Precedence.Assignment, E_TTT)),
                ')'
            ];
        });
        result.push(this.maybeBlock(stmt.body, flags));
        return result;
    };
    CodeGenerator.prototype.generatePropertyKey = function(expr, computed) {
        var result = [];
        if (computed) result.push('[');
        result.push(this.generateExpression(expr, Precedence.Assignment, E_TTT));
        if (computed) result.push(']');
        return result;
    };
    CodeGenerator.prototype.generateAssignment = function(left, right, operator, precedence, flags) {
        if (Precedence.Assignment < precedence) flags |= F_ALLOW_IN;
        return parenthesize([
            this.generateExpression(left, Precedence.Call, flags),
            space + operator + space,
            this.generateExpression(right, Precedence.Assignment, flags)
        ], Precedence.Assignment, precedence);
    };
    CodeGenerator.prototype.semicolon = function(flags) {
        if (!semicolons && flags & F_SEMICOLON_OPT) return '';
        return ';';
    };
    // Statements.
    CodeGenerator.Statement = {
        BlockStatement: function(stmt, flags) {
            var range, content, result = [
                '{',
                newline
            ], that = this;
            withIndent(function() {
                // handle functions without any code
                if (stmt.body.length === 0 && preserveBlankLines) {
                    range = stmt.range;
                    if (range[1] - range[0] > 2) {
                        content = sourceCode.substring(range[0] + 1, range[1] - 1);
                        if (content[0] === '\n') result = [
                            '{'
                        ];
                        result.push(content);
                    }
                }
                var i, iz, fragment, bodyFlags;
                bodyFlags = S_TFFF;
                if (flags & F_FUNC_BODY) bodyFlags |= F_DIRECTIVE_CTX;
                for(i = 0, iz = stmt.body.length; i < iz; ++i){
                    if (preserveBlankLines) {
                        // handle spaces before the first line
                        if (i === 0) {
                            if (stmt.body[0].leadingComments) {
                                range = stmt.body[0].leadingComments[0].extendedRange;
                                content = sourceCode.substring(range[0], range[1]);
                                if (content[0] === '\n') result = [
                                    '{'
                                ];
                            }
                            if (!stmt.body[0].leadingComments) generateBlankLines(stmt.range[0], stmt.body[0].range[0], result);
                        }
                        // handle spaces between lines
                        if (i > 0) {
                            if (!stmt.body[i - 1].trailingComments && !stmt.body[i].leadingComments) generateBlankLines(stmt.body[i - 1].range[1], stmt.body[i].range[0], result);
                        }
                    }
                    if (i === iz - 1) bodyFlags |= F_SEMICOLON_OPT;
                    if (stmt.body[i].leadingComments && preserveBlankLines) fragment = that.generateStatement(stmt.body[i], bodyFlags);
                    else fragment = addIndent(that.generateStatement(stmt.body[i], bodyFlags));
                    result.push(fragment);
                    if (!endsWithLineTerminator(toSourceNodeWhenNeeded(fragment).toString())) {
                        if (preserveBlankLines && i < iz - 1) // don't add a new line if there are leading coments
                        // in the next statement
                        {
                            if (!stmt.body[i + 1].leadingComments) result.push(newline);
                        } else result.push(newline);
                    }
                    if (preserveBlankLines) {
                        // handle spaces after the last line
                        if (i === iz - 1) {
                            if (!stmt.body[i].trailingComments) generateBlankLines(stmt.body[i].range[1], stmt.range[1], result);
                        }
                    }
                }
            });
            result.push(addIndent('}'));
            return result;
        },
        BreakStatement: function(stmt, flags) {
            if (stmt.label) return 'break ' + stmt.label.name + this.semicolon(flags);
            return 'break' + this.semicolon(flags);
        },
        ContinueStatement: function(stmt, flags) {
            if (stmt.label) return 'continue ' + stmt.label.name + this.semicolon(flags);
            return 'continue' + this.semicolon(flags);
        },
        ClassBody: function(stmt, flags) {
            var result = [
                '{',
                newline
            ], that = this;
            withIndent(function(indent) {
                var i, iz;
                for(i = 0, iz = stmt.body.length; i < iz; ++i){
                    result.push(indent);
                    result.push(that.generateExpression(stmt.body[i], Precedence.Sequence, E_TTT));
                    if (i + 1 < iz) result.push(newline);
                }
            });
            if (!endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) result.push(newline);
            result.push(base);
            result.push('}');
            return result;
        },
        ClassDeclaration: function(stmt, flags) {
            var result, fragment;
            result = [
                'class'
            ];
            if (stmt.id) result = join(result, this.generateExpression(stmt.id, Precedence.Sequence, E_TTT));
            if (stmt.superClass) {
                fragment = join('extends', this.generateExpression(stmt.superClass, Precedence.Unary, E_TTT));
                result = join(result, fragment);
            }
            result.push(space);
            result.push(this.generateStatement(stmt.body, S_TFFT));
            return result;
        },
        DirectiveStatement: function(stmt, flags) {
            if (extra.raw && stmt.raw) return stmt.raw + this.semicolon(flags);
            return escapeDirective(stmt.directive) + this.semicolon(flags);
        },
        DoWhileStatement: function(stmt, flags) {
            // Because `do 42 while (cond)` is Syntax Error. We need semicolon.
            var result = join('do', this.maybeBlock(stmt.body, S_TFFF));
            result = this.maybeBlockSuffix(stmt.body, result);
            return join(result, [
                'while' + space + '(',
                this.generateExpression(stmt.test, Precedence.Sequence, E_TTT),
                ')' + this.semicolon(flags)
            ]);
        },
        CatchClause: function(stmt, flags) {
            var result, that = this;
            withIndent(function() {
                var guard;
                if (stmt.param) {
                    result = [
                        'catch' + space + '(',
                        that.generateExpression(stmt.param, Precedence.Sequence, E_TTT),
                        ')'
                    ];
                    if (stmt.guard) {
                        guard = that.generateExpression(stmt.guard, Precedence.Sequence, E_TTT);
                        result.splice(2, 0, ' if ', guard);
                    }
                } else result = [
                    'catch'
                ];
            });
            result.push(this.maybeBlock(stmt.body, S_TFFF));
            return result;
        },
        DebuggerStatement: function(stmt, flags) {
            return 'debugger' + this.semicolon(flags);
        },
        EmptyStatement: function(stmt, flags) {
            return ';';
        },
        ExportDefaultDeclaration: function(stmt, flags) {
            var result = [
                'export'
            ], bodyFlags;
            bodyFlags = flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF;
            // export default HoistableDeclaration[Default]
            // export default AssignmentExpression[In] ;
            result = join(result, 'default');
            if (isStatement(stmt.declaration)) result = join(result, this.generateStatement(stmt.declaration, bodyFlags));
            else result = join(result, this.generateExpression(stmt.declaration, Precedence.Assignment, E_TTT) + this.semicolon(flags));
            return result;
        },
        ExportNamedDeclaration: function(stmt, flags) {
            var result = [
                'export'
            ], bodyFlags, that = this;
            bodyFlags = flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF;
            // export VariableStatement
            // export Declaration[Default]
            if (stmt.declaration) return join(result, this.generateStatement(stmt.declaration, bodyFlags));
            // export ExportClause[NoReference] FromClause ;
            // export ExportClause ;
            if (stmt.specifiers) {
                if (stmt.specifiers.length === 0) result = join(result, '{' + space + '}');
                else if (stmt.specifiers[0].type === Syntax.ExportBatchSpecifier) result = join(result, this.generateExpression(stmt.specifiers[0], Precedence.Sequence, E_TTT));
                else {
                    result = join(result, '{');
                    withIndent(function(indent) {
                        var i, iz;
                        result.push(newline);
                        for(i = 0, iz = stmt.specifiers.length; i < iz; ++i){
                            result.push(indent);
                            result.push(that.generateExpression(stmt.specifiers[i], Precedence.Sequence, E_TTT));
                            if (i + 1 < iz) result.push(',' + newline);
                        }
                    });
                    if (!endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) result.push(newline);
                    result.push(base + '}');
                }
                if (stmt.source) result = join(result, [
                    'from' + space,
                    // ModuleSpecifier
                    this.generateExpression(stmt.source, Precedence.Sequence, E_TTT),
                    this.semicolon(flags)
                ]);
                else result.push(this.semicolon(flags));
            }
            return result;
        },
        ExportAllDeclaration: function(stmt, flags) {
            // export * FromClause ;
            return [
                'export' + space,
                '*' + space,
                'from' + space,
                // ModuleSpecifier
                this.generateExpression(stmt.source, Precedence.Sequence, E_TTT),
                this.semicolon(flags)
            ];
        },
        ExpressionStatement: function(stmt, flags) {
            var result, fragment;
            function isClassPrefixed(fragment) {
                var code;
                if (fragment.slice(0, 5) !== 'class') return false;
                code = fragment.charCodeAt(5);
                return code === 0x7B /* '{' */  || esutils.code.isWhiteSpace(code) || esutils.code.isLineTerminator(code);
            }
            function isFunctionPrefixed(fragment) {
                var code;
                if (fragment.slice(0, 8) !== 'function') return false;
                code = fragment.charCodeAt(8);
                return code === 0x28 /* '(' */  || esutils.code.isWhiteSpace(code) || code === 0x2A /* '*' */  || esutils.code.isLineTerminator(code);
            }
            function isAsyncPrefixed(fragment) {
                var code, i, iz;
                if (fragment.slice(0, 5) !== 'async') return false;
                if (!esutils.code.isWhiteSpace(fragment.charCodeAt(5))) return false;
                for(i = 6, iz = fragment.length; i < iz; ++i){
                    if (!esutils.code.isWhiteSpace(fragment.charCodeAt(i))) break;
                }
                if (i === iz) return false;
                if (fragment.slice(i, i + 8) !== 'function') return false;
                code = fragment.charCodeAt(i + 8);
                return code === 0x28 /* '(' */  || esutils.code.isWhiteSpace(code) || code === 0x2A /* '*' */  || esutils.code.isLineTerminator(code);
            }
            result = [
                this.generateExpression(stmt.expression, Precedence.Sequence, E_TTT)
            ];
            // 12.4 '{', 'function', 'class' is not allowed in this position.
            // wrap expression with parentheses
            fragment = toSourceNodeWhenNeeded(result).toString();
            if (fragment.charCodeAt(0) === 0x7B /* '{' */  || // ObjectExpression
            isClassPrefixed(fragment) || isFunctionPrefixed(fragment) || isAsyncPrefixed(fragment) || directive && flags & F_DIRECTIVE_CTX && stmt.expression.type === Syntax.Literal && typeof stmt.expression.value === 'string') result = [
                '(',
                result,
                ')' + this.semicolon(flags)
            ];
            else result.push(this.semicolon(flags));
            return result;
        },
        ImportDeclaration: function(stmt, flags) {
            // ES6: 15.2.1 valid import declarations:
            //     - import ImportClause FromClause ;
            //     - import ModuleSpecifier ;
            var result, cursor, that = this;
            // If no ImportClause is present,
            // this should be `import ModuleSpecifier` so skip `from`
            // ModuleSpecifier is StringLiteral.
            if (stmt.specifiers.length === 0) // import ModuleSpecifier ;
            return [
                'import',
                space,
                // ModuleSpecifier
                this.generateExpression(stmt.source, Precedence.Sequence, E_TTT),
                this.semicolon(flags)
            ];
            // import ImportClause FromClause ;
            result = [
                'import'
            ];
            cursor = 0;
            // ImportedBinding
            if (stmt.specifiers[cursor].type === Syntax.ImportDefaultSpecifier) {
                result = join(result, [
                    this.generateExpression(stmt.specifiers[cursor], Precedence.Sequence, E_TTT)
                ]);
                ++cursor;
            }
            if (stmt.specifiers[cursor]) {
                if (cursor !== 0) result.push(',');
                if (stmt.specifiers[cursor].type === Syntax.ImportNamespaceSpecifier) // NameSpaceImport
                result = join(result, [
                    space,
                    this.generateExpression(stmt.specifiers[cursor], Precedence.Sequence, E_TTT)
                ]);
                else {
                    // NamedImports
                    result.push(space + '{');
                    if (stmt.specifiers.length - cursor === 1) {
                        // import { ... } from "...";
                        result.push(space);
                        result.push(this.generateExpression(stmt.specifiers[cursor], Precedence.Sequence, E_TTT));
                        result.push(space + '}' + space);
                    } else {
                        // import {
                        //    ...,
                        //    ...,
                        // } from "...";
                        withIndent(function(indent) {
                            var i, iz;
                            result.push(newline);
                            for(i = cursor, iz = stmt.specifiers.length; i < iz; ++i){
                                result.push(indent);
                                result.push(that.generateExpression(stmt.specifiers[i], Precedence.Sequence, E_TTT));
                                if (i + 1 < iz) result.push(',' + newline);
                            }
                        });
                        if (!endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) result.push(newline);
                        result.push(base + '}' + space);
                    }
                }
            }
            result = join(result, [
                'from' + space,
                // ModuleSpecifier
                this.generateExpression(stmt.source, Precedence.Sequence, E_TTT),
                this.semicolon(flags)
            ]);
            return result;
        },
        VariableDeclarator: function(stmt, flags) {
            var itemFlags = flags & F_ALLOW_IN ? E_TTT : E_FTT;
            if (stmt.init) return [
                this.generateExpression(stmt.id, Precedence.Assignment, itemFlags),
                space,
                '=',
                space,
                this.generateExpression(stmt.init, Precedence.Assignment, itemFlags)
            ];
            return this.generatePattern(stmt.id, Precedence.Assignment, itemFlags);
        },
        VariableDeclaration: function(stmt, flags) {
            // VariableDeclarator is typed as Statement,
            // but joined with comma (not LineTerminator).
            // So if comment is attached to target node, we should specialize.
            var result, i, iz, node, bodyFlags, that = this;
            result = [
                stmt.kind
            ];
            bodyFlags = flags & F_ALLOW_IN ? S_TFFF : S_FFFF;
            function block() {
                node = stmt.declarations[0];
                if (extra.comment && node.leadingComments) {
                    result.push('\n');
                    result.push(addIndent(that.generateStatement(node, bodyFlags)));
                } else {
                    result.push(noEmptySpace());
                    result.push(that.generateStatement(node, bodyFlags));
                }
                for(i = 1, iz = stmt.declarations.length; i < iz; ++i){
                    node = stmt.declarations[i];
                    if (extra.comment && node.leadingComments) {
                        result.push(',' + newline);
                        result.push(addIndent(that.generateStatement(node, bodyFlags)));
                    } else {
                        result.push(',' + space);
                        result.push(that.generateStatement(node, bodyFlags));
                    }
                }
            }
            if (stmt.declarations.length > 1) withIndent(block);
            else block();
            result.push(this.semicolon(flags));
            return result;
        },
        ThrowStatement: function(stmt, flags) {
            return [
                join('throw', this.generateExpression(stmt.argument, Precedence.Sequence, E_TTT)),
                this.semicolon(flags)
            ];
        },
        TryStatement: function(stmt, flags) {
            var result, i, iz, guardedHandlers;
            result = [
                'try',
                this.maybeBlock(stmt.block, S_TFFF)
            ];
            result = this.maybeBlockSuffix(stmt.block, result);
            if (stmt.handlers) // old interface
            for(i = 0, iz = stmt.handlers.length; i < iz; ++i){
                result = join(result, this.generateStatement(stmt.handlers[i], S_TFFF));
                if (stmt.finalizer || i + 1 !== iz) result = this.maybeBlockSuffix(stmt.handlers[i].body, result);
            }
            else {
                guardedHandlers = stmt.guardedHandlers || [];
                for(i = 0, iz = guardedHandlers.length; i < iz; ++i){
                    result = join(result, this.generateStatement(guardedHandlers[i], S_TFFF));
                    if (stmt.finalizer || i + 1 !== iz) result = this.maybeBlockSuffix(guardedHandlers[i].body, result);
                }
                // new interface
                if (stmt.handler) {
                    if (Array.isArray(stmt.handler)) for(i = 0, iz = stmt.handler.length; i < iz; ++i){
                        result = join(result, this.generateStatement(stmt.handler[i], S_TFFF));
                        if (stmt.finalizer || i + 1 !== iz) result = this.maybeBlockSuffix(stmt.handler[i].body, result);
                    }
                    else {
                        result = join(result, this.generateStatement(stmt.handler, S_TFFF));
                        if (stmt.finalizer) result = this.maybeBlockSuffix(stmt.handler.body, result);
                    }
                }
            }
            if (stmt.finalizer) result = join(result, [
                'finally',
                this.maybeBlock(stmt.finalizer, S_TFFF)
            ]);
            return result;
        },
        SwitchStatement: function(stmt, flags) {
            var result, fragment, i, iz, bodyFlags, that = this;
            withIndent(function() {
                result = [
                    'switch' + space + '(',
                    that.generateExpression(stmt.discriminant, Precedence.Sequence, E_TTT),
                    ')' + space + '{' + newline
                ];
            });
            if (stmt.cases) {
                bodyFlags = S_TFFF;
                for(i = 0, iz = stmt.cases.length; i < iz; ++i){
                    if (i === iz - 1) bodyFlags |= F_SEMICOLON_OPT;
                    fragment = addIndent(this.generateStatement(stmt.cases[i], bodyFlags));
                    result.push(fragment);
                    if (!endsWithLineTerminator(toSourceNodeWhenNeeded(fragment).toString())) result.push(newline);
                }
            }
            result.push(addIndent('}'));
            return result;
        },
        SwitchCase: function(stmt, flags) {
            var result, fragment, i, iz, bodyFlags, that = this;
            withIndent(function() {
                if (stmt.test) result = [
                    join('case', that.generateExpression(stmt.test, Precedence.Sequence, E_TTT)),
                    ':'
                ];
                else result = [
                    'default:'
                ];
                i = 0;
                iz = stmt.consequent.length;
                if (iz && stmt.consequent[0].type === Syntax.BlockStatement) {
                    fragment = that.maybeBlock(stmt.consequent[0], S_TFFF);
                    result.push(fragment);
                    i = 1;
                }
                if (i !== iz && !endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) result.push(newline);
                bodyFlags = S_TFFF;
                for(; i < iz; ++i){
                    if (i === iz - 1 && flags & F_SEMICOLON_OPT) bodyFlags |= F_SEMICOLON_OPT;
                    fragment = addIndent(that.generateStatement(stmt.consequent[i], bodyFlags));
                    result.push(fragment);
                    if (i + 1 !== iz && !endsWithLineTerminator(toSourceNodeWhenNeeded(fragment).toString())) result.push(newline);
                }
            });
            return result;
        },
        IfStatement: function(stmt, flags) {
            var result, bodyFlags, semicolonOptional, that = this;
            withIndent(function() {
                result = [
                    'if' + space + '(',
                    that.generateExpression(stmt.test, Precedence.Sequence, E_TTT),
                    ')'
                ];
            });
            semicolonOptional = flags & F_SEMICOLON_OPT;
            bodyFlags = S_TFFF;
            if (semicolonOptional) bodyFlags |= F_SEMICOLON_OPT;
            if (stmt.alternate) {
                result.push(this.maybeBlock(stmt.consequent, S_TFFF));
                result = this.maybeBlockSuffix(stmt.consequent, result);
                if (stmt.alternate.type === Syntax.IfStatement) result = join(result, [
                    'else ',
                    this.generateStatement(stmt.alternate, bodyFlags)
                ]);
                else result = join(result, join('else', this.maybeBlock(stmt.alternate, bodyFlags)));
            } else result.push(this.maybeBlock(stmt.consequent, bodyFlags));
            return result;
        },
        ForStatement: function(stmt, flags) {
            var result, that = this;
            withIndent(function() {
                result = [
                    'for' + space + '('
                ];
                if (stmt.init) {
                    if (stmt.init.type === Syntax.VariableDeclaration) result.push(that.generateStatement(stmt.init, S_FFFF));
                    else {
                        // F_ALLOW_IN becomes false.
                        result.push(that.generateExpression(stmt.init, Precedence.Sequence, E_FTT));
                        result.push(';');
                    }
                } else result.push(';');
                if (stmt.test) {
                    result.push(space);
                    result.push(that.generateExpression(stmt.test, Precedence.Sequence, E_TTT));
                    result.push(';');
                } else result.push(';');
                if (stmt.update) {
                    result.push(space);
                    result.push(that.generateExpression(stmt.update, Precedence.Sequence, E_TTT));
                    result.push(')');
                } else result.push(')');
            });
            result.push(this.maybeBlock(stmt.body, flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF));
            return result;
        },
        ForInStatement: function(stmt, flags) {
            return this.generateIterationForStatement('in', stmt, flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF);
        },
        ForOfStatement: function(stmt, flags) {
            return this.generateIterationForStatement('of', stmt, flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF);
        },
        LabeledStatement: function(stmt, flags) {
            return [
                stmt.label.name + ':',
                this.maybeBlock(stmt.body, flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF)
            ];
        },
        Program: function(stmt, flags) {
            var result, fragment, i, iz, bodyFlags;
            iz = stmt.body.length;
            result = [
                safeConcatenation && iz > 0 ? '\n' : ''
            ];
            bodyFlags = S_TFTF;
            for(i = 0; i < iz; ++i){
                if (!safeConcatenation && i === iz - 1) bodyFlags |= F_SEMICOLON_OPT;
                if (preserveBlankLines) {
                    // handle spaces before the first line
                    if (i === 0) {
                        if (!stmt.body[0].leadingComments) generateBlankLines(stmt.range[0], stmt.body[i].range[0], result);
                    }
                    // handle spaces between lines
                    if (i > 0) {
                        if (!stmt.body[i - 1].trailingComments && !stmt.body[i].leadingComments) generateBlankLines(stmt.body[i - 1].range[1], stmt.body[i].range[0], result);
                    }
                }
                fragment = addIndent(this.generateStatement(stmt.body[i], bodyFlags));
                result.push(fragment);
                if (i + 1 < iz && !endsWithLineTerminator(toSourceNodeWhenNeeded(fragment).toString())) {
                    if (preserveBlankLines) {
                        if (!stmt.body[i + 1].leadingComments) result.push(newline);
                    } else result.push(newline);
                }
                if (preserveBlankLines) {
                    // handle spaces after the last line
                    if (i === iz - 1) {
                        if (!stmt.body[i].trailingComments) generateBlankLines(stmt.body[i].range[1], stmt.range[1], result);
                    }
                }
            }
            return result;
        },
        FunctionDeclaration: function(stmt, flags) {
            return [
                generateAsyncPrefix(stmt, true),
                'function',
                generateStarSuffix(stmt) || noEmptySpace(),
                stmt.id ? generateIdentifier(stmt.id) : '',
                this.generateFunctionBody(stmt)
            ];
        },
        ReturnStatement: function(stmt, flags) {
            if (stmt.argument) return [
                join('return', this.generateExpression(stmt.argument, Precedence.Sequence, E_TTT)),
                this.semicolon(flags)
            ];
            return [
                'return' + this.semicolon(flags)
            ];
        },
        WhileStatement: function(stmt, flags) {
            var result, that = this;
            withIndent(function() {
                result = [
                    'while' + space + '(',
                    that.generateExpression(stmt.test, Precedence.Sequence, E_TTT),
                    ')'
                ];
            });
            result.push(this.maybeBlock(stmt.body, flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF));
            return result;
        },
        WithStatement: function(stmt, flags) {
            var result, that = this;
            withIndent(function() {
                result = [
                    'with' + space + '(',
                    that.generateExpression(stmt.object, Precedence.Sequence, E_TTT),
                    ')'
                ];
            });
            result.push(this.maybeBlock(stmt.body, flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF));
            return result;
        }
    };
    merge(CodeGenerator.prototype, CodeGenerator.Statement);
    // Expressions.
    CodeGenerator.Expression = {
        SequenceExpression: function(expr, precedence, flags) {
            var result, i, iz;
            if (Precedence.Sequence < precedence) flags |= F_ALLOW_IN;
            result = [];
            for(i = 0, iz = expr.expressions.length; i < iz; ++i){
                result.push(this.generateExpression(expr.expressions[i], Precedence.Assignment, flags));
                if (i + 1 < iz) result.push(',' + space);
            }
            return parenthesize(result, Precedence.Sequence, precedence);
        },
        AssignmentExpression: function(expr, precedence, flags) {
            return this.generateAssignment(expr.left, expr.right, expr.operator, precedence, flags);
        },
        ArrowFunctionExpression: function(expr, precedence, flags) {
            return parenthesize(this.generateFunctionBody(expr), Precedence.ArrowFunction, precedence);
        },
        ConditionalExpression: function(expr, precedence, flags) {
            if (Precedence.Conditional < precedence) flags |= F_ALLOW_IN;
            return parenthesize([
                this.generateExpression(expr.test, Precedence.Coalesce, flags),
                space + '?' + space,
                this.generateExpression(expr.consequent, Precedence.Assignment, flags),
                space + ':' + space,
                this.generateExpression(expr.alternate, Precedence.Assignment, flags)
            ], Precedence.Conditional, precedence);
        },
        LogicalExpression: function(expr, precedence, flags) {
            if (expr.operator === '??') flags |= F_FOUND_COALESCE;
            return this.BinaryExpression(expr, precedence, flags);
        },
        BinaryExpression: function(expr, precedence, flags) {
            var result, leftPrecedence, rightPrecedence, currentPrecedence, fragment, leftSource;
            currentPrecedence = BinaryPrecedence[expr.operator];
            leftPrecedence = expr.operator === '**' ? Precedence.Postfix : currentPrecedence;
            rightPrecedence = expr.operator === '**' ? currentPrecedence : currentPrecedence + 1;
            if (currentPrecedence < precedence) flags |= F_ALLOW_IN;
            fragment = this.generateExpression(expr.left, leftPrecedence, flags);
            leftSource = fragment.toString();
            if (leftSource.charCodeAt(leftSource.length - 1) === 0x2F /* / */  && esutils.code.isIdentifierPartES5(expr.operator.charCodeAt(0))) result = [
                fragment,
                noEmptySpace(),
                expr.operator
            ];
            else result = join(fragment, expr.operator);
            fragment = this.generateExpression(expr.right, rightPrecedence, flags);
            if (expr.operator === '/' && fragment.toString().charAt(0) === '/' || expr.operator.slice(-1) === '<' && fragment.toString().slice(0, 3) === '!--') {
                // If '/' concats with '/' or `<` concats with `!--`, it is interpreted as comment start
                result.push(noEmptySpace());
                result.push(fragment);
            } else result = join(result, fragment);
            if (expr.operator === 'in' && !(flags & F_ALLOW_IN)) return [
                '(',
                result,
                ')'
            ];
            if ((expr.operator === '||' || expr.operator === '&&') && flags & F_FOUND_COALESCE) return [
                '(',
                result,
                ')'
            ];
            return parenthesize(result, currentPrecedence, precedence);
        },
        CallExpression: function(expr, precedence, flags) {
            var result, i, iz;
            // F_ALLOW_UNPARATH_NEW becomes false.
            result = [
                this.generateExpression(expr.callee, Precedence.Call, E_TTF)
            ];
            if (expr.optional) result.push('?.');
            result.push('(');
            for(i = 0, iz = expr['arguments'].length; i < iz; ++i){
                result.push(this.generateExpression(expr['arguments'][i], Precedence.Assignment, E_TTT));
                if (i + 1 < iz) result.push(',' + space);
            }
            result.push(')');
            if (!(flags & F_ALLOW_CALL)) return [
                '(',
                result,
                ')'
            ];
            return parenthesize(result, Precedence.Call, precedence);
        },
        ChainExpression: function(expr, precedence, flags) {
            if (Precedence.OptionalChaining < precedence) flags |= F_ALLOW_CALL;
            var result = this.generateExpression(expr.expression, Precedence.OptionalChaining, flags);
            return parenthesize(result, Precedence.OptionalChaining, precedence);
        },
        NewExpression: function(expr, precedence, flags) {
            var result, length, i, iz, itemFlags;
            length = expr['arguments'].length;
            // F_ALLOW_CALL becomes false.
            // F_ALLOW_UNPARATH_NEW may become false.
            itemFlags = flags & F_ALLOW_UNPARATH_NEW && !parentheses && length === 0 ? E_TFT : E_TFF;
            result = join('new', this.generateExpression(expr.callee, Precedence.New, itemFlags));
            if (!(flags & F_ALLOW_UNPARATH_NEW) || parentheses || length > 0) {
                result.push('(');
                for(i = 0, iz = length; i < iz; ++i){
                    result.push(this.generateExpression(expr['arguments'][i], Precedence.Assignment, E_TTT));
                    if (i + 1 < iz) result.push(',' + space);
                }
                result.push(')');
            }
            return parenthesize(result, Precedence.New, precedence);
        },
        MemberExpression: function(expr, precedence, flags) {
            var result, fragment;
            // F_ALLOW_UNPARATH_NEW becomes false.
            result = [
                this.generateExpression(expr.object, Precedence.Call, flags & F_ALLOW_CALL ? E_TTF : E_TFF)
            ];
            if (expr.computed) {
                if (expr.optional) result.push('?.');
                result.push('[');
                result.push(this.generateExpression(expr.property, Precedence.Sequence, flags & F_ALLOW_CALL ? E_TTT : E_TFT));
                result.push(']');
            } else {
                if (!expr.optional && expr.object.type === Syntax.Literal && typeof expr.object.value === 'number') {
                    fragment = toSourceNodeWhenNeeded(result).toString();
                    // When the following conditions are all true,
                    //   1. No floating point
                    //   2. Don't have exponents
                    //   3. The last character is a decimal digit
                    //   4. Not hexadecimal OR octal number literal
                    // we should add a floating point.
                    if (fragment.indexOf('.') < 0 && !/[eExX]/.test(fragment) && esutils.code.isDecimalDigit(fragment.charCodeAt(fragment.length - 1)) && !(fragment.length >= 2 && fragment.charCodeAt(0) === 48 // '0'
                    )) result.push(' ');
                }
                result.push(expr.optional ? '?.' : '.');
                result.push(generateIdentifier(expr.property));
            }
            return parenthesize(result, Precedence.Member, precedence);
        },
        MetaProperty: function(expr, precedence, flags) {
            var result;
            result = [];
            result.push(typeof expr.meta === "string" ? expr.meta : generateIdentifier(expr.meta));
            result.push('.');
            result.push(typeof expr.property === "string" ? expr.property : generateIdentifier(expr.property));
            return parenthesize(result, Precedence.Member, precedence);
        },
        UnaryExpression: function(expr, precedence, flags) {
            var result, fragment, rightCharCode, leftSource, leftCharCode;
            fragment = this.generateExpression(expr.argument, Precedence.Unary, E_TTT);
            if (space === '') result = join(expr.operator, fragment);
            else {
                result = [
                    expr.operator
                ];
                if (expr.operator.length > 2) // delete, void, typeof
                // get `typeof []`, not `typeof[]`
                result = join(result, fragment);
                else {
                    // Prevent inserting spaces between operator and argument if it is unnecessary
                    // like, `!cond`
                    leftSource = toSourceNodeWhenNeeded(result).toString();
                    leftCharCode = leftSource.charCodeAt(leftSource.length - 1);
                    rightCharCode = fragment.toString().charCodeAt(0);
                    if ((leftCharCode === 0x2B /* + */  || leftCharCode === 0x2D /* - */ ) && leftCharCode === rightCharCode || esutils.code.isIdentifierPartES5(leftCharCode) && esutils.code.isIdentifierPartES5(rightCharCode)) {
                        result.push(noEmptySpace());
                        result.push(fragment);
                    } else result.push(fragment);
                }
            }
            return parenthesize(result, Precedence.Unary, precedence);
        },
        YieldExpression: function(expr, precedence, flags) {
            var result;
            if (expr.delegate) result = 'yield*';
            else result = 'yield';
            if (expr.argument) result = join(result, this.generateExpression(expr.argument, Precedence.Yield, E_TTT));
            return parenthesize(result, Precedence.Yield, precedence);
        },
        AwaitExpression: function(expr, precedence, flags) {
            var result = join(expr.all ? 'await*' : 'await', this.generateExpression(expr.argument, Precedence.Await, E_TTT));
            return parenthesize(result, Precedence.Await, precedence);
        },
        UpdateExpression: function(expr, precedence, flags) {
            if (expr.prefix) return parenthesize([
                expr.operator,
                this.generateExpression(expr.argument, Precedence.Unary, E_TTT)
            ], Precedence.Unary, precedence);
            return parenthesize([
                this.generateExpression(expr.argument, Precedence.Postfix, E_TTT),
                expr.operator
            ], Precedence.Postfix, precedence);
        },
        FunctionExpression: function(expr, precedence, flags) {
            var result = [
                generateAsyncPrefix(expr, true),
                'function'
            ];
            if (expr.id) {
                result.push(generateStarSuffix(expr) || noEmptySpace());
                result.push(generateIdentifier(expr.id));
            } else result.push(generateStarSuffix(expr) || space);
            result.push(this.generateFunctionBody(expr));
            return result;
        },
        ArrayPattern: function(expr, precedence, flags) {
            return this.ArrayExpression(expr, precedence, flags, true);
        },
        ArrayExpression: function(expr, precedence, flags, isPattern) {
            var result, multiline, that = this;
            if (!expr.elements.length) return '[]';
            multiline = isPattern ? false : expr.elements.length > 1;
            result = [
                '[',
                multiline ? newline : ''
            ];
            withIndent(function(indent) {
                var i, iz;
                for(i = 0, iz = expr.elements.length; i < iz; ++i){
                    if (!expr.elements[i]) {
                        if (multiline) result.push(indent);
                        if (i + 1 === iz) result.push(',');
                    } else {
                        result.push(multiline ? indent : '');
                        result.push(that.generateExpression(expr.elements[i], Precedence.Assignment, E_TTT));
                    }
                    if (i + 1 < iz) result.push(',' + (multiline ? newline : space));
                }
            });
            if (multiline && !endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) result.push(newline);
            result.push(multiline ? base : '');
            result.push(']');
            return result;
        },
        RestElement: function(expr, precedence, flags) {
            return '...' + this.generatePattern(expr.argument);
        },
        ClassExpression: function(expr, precedence, flags) {
            var result, fragment;
            result = [
                'class'
            ];
            if (expr.id) result = join(result, this.generateExpression(expr.id, Precedence.Sequence, E_TTT));
            if (expr.superClass) {
                fragment = join('extends', this.generateExpression(expr.superClass, Precedence.Unary, E_TTT));
                result = join(result, fragment);
            }
            result.push(space);
            result.push(this.generateStatement(expr.body, S_TFFT));
            return result;
        },
        MethodDefinition: function(expr, precedence, flags) {
            var result, fragment;
            if (expr['static']) result = [
                'static' + space
            ];
            else result = [];
            if (expr.kind === 'get' || expr.kind === 'set') fragment = [
                join(expr.kind, this.generatePropertyKey(expr.key, expr.computed)),
                this.generateFunctionBody(expr.value)
            ];
            else fragment = [
                generateMethodPrefix(expr),
                this.generatePropertyKey(expr.key, expr.computed),
                this.generateFunctionBody(expr.value)
            ];
            return join(result, fragment);
        },
        Property: function(expr, precedence, flags) {
            if (expr.kind === 'get' || expr.kind === 'set') return [
                expr.kind,
                noEmptySpace(),
                this.generatePropertyKey(expr.key, expr.computed),
                this.generateFunctionBody(expr.value)
            ];
            if (expr.shorthand) {
                if (expr.value.type === "AssignmentPattern") return this.AssignmentPattern(expr.value, Precedence.Sequence, E_TTT);
                return this.generatePropertyKey(expr.key, expr.computed);
            }
            if (expr.method) return [
                generateMethodPrefix(expr),
                this.generatePropertyKey(expr.key, expr.computed),
                this.generateFunctionBody(expr.value)
            ];
            return [
                this.generatePropertyKey(expr.key, expr.computed),
                ':' + space,
                this.generateExpression(expr.value, Precedence.Assignment, E_TTT)
            ];
        },
        ObjectExpression: function(expr, precedence, flags) {
            var multiline, result, fragment, that = this;
            if (!expr.properties.length) return '{}';
            multiline = expr.properties.length > 1;
            withIndent(function() {
                fragment = that.generateExpression(expr.properties[0], Precedence.Sequence, E_TTT);
            });
            if (!multiline) {
                // issues 4
                // Do not transform from
                //   dejavu.Class.declare({
                //       method2: function () {}
                //   });
                // to
                //   dejavu.Class.declare({method2: function () {
                //       }});
                if (!hasLineTerminator(toSourceNodeWhenNeeded(fragment).toString())) return [
                    '{',
                    space,
                    fragment,
                    space,
                    '}'
                ];
            }
            withIndent(function(indent) {
                var i, iz;
                result = [
                    '{',
                    newline,
                    indent,
                    fragment
                ];
                if (multiline) {
                    result.push(',' + newline);
                    for(i = 1, iz = expr.properties.length; i < iz; ++i){
                        result.push(indent);
                        result.push(that.generateExpression(expr.properties[i], Precedence.Sequence, E_TTT));
                        if (i + 1 < iz) result.push(',' + newline);
                    }
                }
            });
            if (!endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) result.push(newline);
            result.push(base);
            result.push('}');
            return result;
        },
        AssignmentPattern: function(expr, precedence, flags) {
            return this.generateAssignment(expr.left, expr.right, '=', precedence, flags);
        },
        ObjectPattern: function(expr, precedence, flags) {
            var result, i, iz, multiline, property, that = this;
            if (!expr.properties.length) return '{}';
            multiline = false;
            if (expr.properties.length === 1) {
                property = expr.properties[0];
                if (property.type === Syntax.Property && property.value.type !== Syntax.Identifier) multiline = true;
            } else for(i = 0, iz = expr.properties.length; i < iz; ++i){
                property = expr.properties[i];
                if (property.type === Syntax.Property && !property.shorthand) {
                    multiline = true;
                    break;
                }
            }
            result = [
                '{',
                multiline ? newline : ''
            ];
            withIndent(function(indent) {
                var i, iz;
                for(i = 0, iz = expr.properties.length; i < iz; ++i){
                    result.push(multiline ? indent : '');
                    result.push(that.generateExpression(expr.properties[i], Precedence.Sequence, E_TTT));
                    if (i + 1 < iz) result.push(',' + (multiline ? newline : space));
                }
            });
            if (multiline && !endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) result.push(newline);
            result.push(multiline ? base : '');
            result.push('}');
            return result;
        },
        ThisExpression: function(expr, precedence, flags) {
            return 'this';
        },
        Super: function(expr, precedence, flags) {
            return 'super';
        },
        Identifier: function(expr, precedence, flags) {
            return generateIdentifier(expr);
        },
        ImportDefaultSpecifier: function(expr, precedence, flags) {
            return generateIdentifier(expr.id || expr.local);
        },
        ImportNamespaceSpecifier: function(expr, precedence, flags) {
            var result = [
                '*'
            ];
            var id = expr.id || expr.local;
            if (id) result.push(space + 'as' + noEmptySpace() + generateIdentifier(id));
            return result;
        },
        ImportSpecifier: function(expr, precedence, flags) {
            var imported = expr.imported;
            var result = [
                imported.name
            ];
            var local = expr.local;
            if (local && local.name !== imported.name) result.push(noEmptySpace() + 'as' + noEmptySpace() + generateIdentifier(local));
            return result;
        },
        ExportSpecifier: function(expr, precedence, flags) {
            var local = expr.local;
            var result = [
                local.name
            ];
            var exported = expr.exported;
            if (exported && exported.name !== local.name) result.push(noEmptySpace() + 'as' + noEmptySpace() + generateIdentifier(exported));
            return result;
        },
        Literal: function(expr, precedence, flags) {
            var raw;
            if (expr.hasOwnProperty('raw') && parse && extra.raw) try {
                raw = parse(expr.raw).body[0].expression;
                if (raw.type === Syntax.Literal) {
                    if (raw.value === expr.value) return expr.raw;
                }
            } catch (e) {
            // not use raw property
            }
            if (expr.regex) return '/' + expr.regex.pattern + '/' + expr.regex.flags;
            if (typeof expr.value === 'bigint') return expr.value.toString() + 'n';
            // `expr.value` can be null if `expr.bigint` exists. We need to check
            // `expr.bigint` first.
            if (expr.bigint) return expr.bigint + 'n';
            if (expr.value === null) return 'null';
            if (typeof expr.value === 'string') return escapeString(expr.value);
            if (typeof expr.value === 'number') return generateNumber(expr.value);
            if (typeof expr.value === 'boolean') return expr.value ? 'true' : 'false';
            return generateRegExp(expr.value);
        },
        GeneratorExpression: function(expr, precedence, flags) {
            return this.ComprehensionExpression(expr, precedence, flags);
        },
        ComprehensionExpression: function(expr, precedence, flags) {
            // GeneratorExpression should be parenthesized with (...), ComprehensionExpression with [...]
            // Due to https://bugzilla.mozilla.org/show_bug.cgi?id=883468 position of expr.body can differ in Spidermonkey and ES6
            var result, i, iz, fragment, that = this;
            result = expr.type === Syntax.GeneratorExpression ? [
                '('
            ] : [
                '['
            ];
            if (extra.moz.comprehensionExpressionStartsWithAssignment) {
                fragment = this.generateExpression(expr.body, Precedence.Assignment, E_TTT);
                result.push(fragment);
            }
            if (expr.blocks) withIndent(function() {
                for(i = 0, iz = expr.blocks.length; i < iz; ++i){
                    fragment = that.generateExpression(expr.blocks[i], Precedence.Sequence, E_TTT);
                    if (i > 0 || extra.moz.comprehensionExpressionStartsWithAssignment) result = join(result, fragment);
                    else result.push(fragment);
                }
            });
            if (expr.filter) {
                result = join(result, 'if' + space);
                fragment = this.generateExpression(expr.filter, Precedence.Sequence, E_TTT);
                result = join(result, [
                    '(',
                    fragment,
                    ')'
                ]);
            }
            if (!extra.moz.comprehensionExpressionStartsWithAssignment) {
                fragment = this.generateExpression(expr.body, Precedence.Assignment, E_TTT);
                result = join(result, fragment);
            }
            result.push(expr.type === Syntax.GeneratorExpression ? ')' : ']');
            return result;
        },
        ComprehensionBlock: function(expr, precedence, flags) {
            var fragment;
            if (expr.left.type === Syntax.VariableDeclaration) fragment = [
                expr.left.kind,
                noEmptySpace(),
                this.generateStatement(expr.left.declarations[0], S_FFFF)
            ];
            else fragment = this.generateExpression(expr.left, Precedence.Call, E_TTT);
            fragment = join(fragment, expr.of ? 'of' : 'in');
            fragment = join(fragment, this.generateExpression(expr.right, Precedence.Sequence, E_TTT));
            return [
                'for' + space + '(',
                fragment,
                ')'
            ];
        },
        SpreadElement: function(expr, precedence, flags) {
            return [
                '...',
                this.generateExpression(expr.argument, Precedence.Assignment, E_TTT)
            ];
        },
        TaggedTemplateExpression: function(expr, precedence, flags) {
            var itemFlags = E_TTF;
            if (!(flags & F_ALLOW_CALL)) itemFlags = E_TFF;
            var result = [
                this.generateExpression(expr.tag, Precedence.Call, itemFlags),
                this.generateExpression(expr.quasi, Precedence.Primary, E_FFT)
            ];
            return parenthesize(result, Precedence.TaggedTemplate, precedence);
        },
        TemplateElement: function(expr, precedence, flags) {
            // Don't use "cooked". Since tagged template can use raw template
            // representation. So if we do so, it breaks the script semantics.
            return expr.value.raw;
        },
        TemplateLiteral: function(expr, precedence, flags) {
            var result, i, iz;
            result = [
                '`'
            ];
            for(i = 0, iz = expr.quasis.length; i < iz; ++i){
                result.push(this.generateExpression(expr.quasis[i], Precedence.Primary, E_TTT));
                if (i + 1 < iz) {
                    result.push('${' + space);
                    result.push(this.generateExpression(expr.expressions[i], Precedence.Sequence, E_TTT));
                    result.push(space + '}');
                }
            }
            result.push('`');
            return result;
        },
        ModuleSpecifier: function(expr, precedence, flags) {
            return this.Literal(expr, precedence, flags);
        },
        ImportExpression: function(expr, precedence, flag) {
            return parenthesize([
                'import(',
                this.generateExpression(expr.source, Precedence.Assignment, E_TTT),
                ')'
            ], Precedence.Call, precedence);
        }
    };
    merge(CodeGenerator.prototype, CodeGenerator.Expression);
    CodeGenerator.prototype.generateExpression = function(expr, precedence, flags) {
        var result, type;
        type = expr.type || Syntax.Property;
        if (extra.verbatim && expr.hasOwnProperty(extra.verbatim)) return generateVerbatim(expr, precedence);
        result = this[type](expr, precedence, flags);
        if (extra.comment) result = addComments(expr, result);
        return toSourceNodeWhenNeeded(result, expr);
    };
    CodeGenerator.prototype.generateStatement = function(stmt, flags) {
        var result, fragment;
        result = this[stmt.type](stmt, flags);
        // Attach comments
        if (extra.comment) result = addComments(stmt, result);
        fragment = toSourceNodeWhenNeeded(result).toString();
        if (stmt.type === Syntax.Program && !safeConcatenation && newline === '' && fragment.charAt(fragment.length - 1) === '\n') result = sourceMap ? toSourceNodeWhenNeeded(result).replaceRight(/\s+$/, '') : fragment.replace(/\s+$/, '');
        return toSourceNodeWhenNeeded(result, stmt);
    };
    function generateInternal(node) {
        var codegen;
        codegen = new CodeGenerator();
        if (isStatement(node)) return codegen.generateStatement(node, S_TFFF);
        if (isExpression(node)) return codegen.generateExpression(node, Precedence.Sequence, E_TTT);
        throw new Error('Unknown node type: ' + node.type);
    }
    function generate(node, options) {
        var defaultOptions = getDefaultOptions(), result, pair;
        if (options != null) {
            // Obsolete options
            //
            //   `options.indent`
            //   `options.base`
            //
            // Instead of them, we can use `option.format.indent`.
            if (typeof options.indent === 'string') defaultOptions.format.indent.style = options.indent;
            if (typeof options.base === 'number') defaultOptions.format.indent.base = options.base;
            options = updateDeeply(defaultOptions, options);
            indent = options.format.indent.style;
            if (typeof options.base === 'string') base = options.base;
            else base = stringRepeat(indent, options.format.indent.base);
        } else {
            options = defaultOptions;
            indent = options.format.indent.style;
            base = stringRepeat(indent, options.format.indent.base);
        }
        json = options.format.json;
        renumber = options.format.renumber;
        hexadecimal = json ? false : options.format.hexadecimal;
        quotes = json ? 'double' : options.format.quotes;
        escapeless = options.format.escapeless;
        newline = options.format.newline;
        space = options.format.space;
        if (options.format.compact) newline = space = indent = base = '';
        parentheses = options.format.parentheses;
        semicolons = options.format.semicolons;
        safeConcatenation = options.format.safeConcatenation;
        directive = options.directive;
        parse = json ? null : options.parse;
        sourceMap = options.sourceMap;
        sourceCode = options.sourceCode;
        preserveBlankLines = options.format.preserveBlankLines && sourceCode !== null;
        extra = options;
        if (sourceMap) {
            if (!exports.browser) // We assume environment is node.js
            // And prevent from including source-map by browserify
            SourceNode = require("52d2be09daafce94").SourceNode;
            else SourceNode = global.sourceMap.SourceNode;
        }
        result = generateInternal(node);
        if (!sourceMap) {
            pair = {
                code: result.toString(),
                map: null
            };
            return options.sourceMapWithCode ? pair : pair.code;
        }
        pair = result.toStringWithSourceMap({
            file: options.file,
            sourceRoot: options.sourceMapRoot
        });
        if (options.sourceContent) pair.map.setSourceContent(options.sourceMap, options.sourceContent);
        if (options.sourceMapWithCode) return pair;
        return pair.map.toString();
    }
    FORMAT_MINIFY = {
        indent: {
            style: '',
            base: 0
        },
        renumber: true,
        hexadecimal: true,
        quotes: 'auto',
        escapeless: true,
        compact: true,
        parentheses: false,
        semicolons: false
    };
    FORMAT_DEFAULTS = getDefaultOptions().format;
    exports.version = require("40792dd4557f1d45").version;
    exports.generate = generate;
    exports.attachComments = estraverse.attachComments;
    exports.Precedence = updateDeeply({}, Precedence);
    exports.browser = false;
    exports.FORMAT_MINIFY = FORMAT_MINIFY;
    exports.FORMAT_DEFAULTS = FORMAT_DEFAULTS;
})(); /* vim: set sw=4 ts=4 et tw=80 : */ 

},{"5b5c0717ac637391":"6QjqD","95278b98f3235005":"lGmqJ","52d2be09daafce94":"aOV0D","40792dd4557f1d45":"jEkRn"}],"6QjqD":[function(require,module,exports,__globalThis) {
/*
  Copyright (C) 2012-2013 Yusuke Suzuki <utatane.tea@gmail.com>
  Copyright (C) 2012 Ariya Hidayat <ariya.hidayat@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/ /*jslint vars:false, bitwise:true*/ /*jshint indent:4*/ /*global exports:true*/ (function clone(exports1) {
    'use strict';
    var Syntax, VisitorOption, VisitorKeys, BREAK, SKIP, REMOVE;
    function deepCopy(obj) {
        var ret = {}, key, val;
        for(key in obj)if (obj.hasOwnProperty(key)) {
            val = obj[key];
            if (typeof val === 'object' && val !== null) ret[key] = deepCopy(val);
            else ret[key] = val;
        }
        return ret;
    }
    // based on LLVM libc++ upper_bound / lower_bound
    // MIT License
    function upperBound(array, func) {
        var diff, len, i, current;
        len = array.length;
        i = 0;
        while(len){
            diff = len >>> 1;
            current = i + diff;
            if (func(array[current])) len = diff;
            else {
                i = current + 1;
                len -= diff + 1;
            }
        }
        return i;
    }
    Syntax = {
        AssignmentExpression: 'AssignmentExpression',
        AssignmentPattern: 'AssignmentPattern',
        ArrayExpression: 'ArrayExpression',
        ArrayPattern: 'ArrayPattern',
        ArrowFunctionExpression: 'ArrowFunctionExpression',
        AwaitExpression: 'AwaitExpression',
        BlockStatement: 'BlockStatement',
        BinaryExpression: 'BinaryExpression',
        BreakStatement: 'BreakStatement',
        CallExpression: 'CallExpression',
        CatchClause: 'CatchClause',
        ChainExpression: 'ChainExpression',
        ClassBody: 'ClassBody',
        ClassDeclaration: 'ClassDeclaration',
        ClassExpression: 'ClassExpression',
        ComprehensionBlock: 'ComprehensionBlock',
        ComprehensionExpression: 'ComprehensionExpression',
        ConditionalExpression: 'ConditionalExpression',
        ContinueStatement: 'ContinueStatement',
        DebuggerStatement: 'DebuggerStatement',
        DirectiveStatement: 'DirectiveStatement',
        DoWhileStatement: 'DoWhileStatement',
        EmptyStatement: 'EmptyStatement',
        ExportAllDeclaration: 'ExportAllDeclaration',
        ExportDefaultDeclaration: 'ExportDefaultDeclaration',
        ExportNamedDeclaration: 'ExportNamedDeclaration',
        ExportSpecifier: 'ExportSpecifier',
        ExpressionStatement: 'ExpressionStatement',
        ForStatement: 'ForStatement',
        ForInStatement: 'ForInStatement',
        ForOfStatement: 'ForOfStatement',
        FunctionDeclaration: 'FunctionDeclaration',
        FunctionExpression: 'FunctionExpression',
        GeneratorExpression: 'GeneratorExpression',
        Identifier: 'Identifier',
        IfStatement: 'IfStatement',
        ImportExpression: 'ImportExpression',
        ImportDeclaration: 'ImportDeclaration',
        ImportDefaultSpecifier: 'ImportDefaultSpecifier',
        ImportNamespaceSpecifier: 'ImportNamespaceSpecifier',
        ImportSpecifier: 'ImportSpecifier',
        Literal: 'Literal',
        LabeledStatement: 'LabeledStatement',
        LogicalExpression: 'LogicalExpression',
        MemberExpression: 'MemberExpression',
        MetaProperty: 'MetaProperty',
        MethodDefinition: 'MethodDefinition',
        ModuleSpecifier: 'ModuleSpecifier',
        NewExpression: 'NewExpression',
        ObjectExpression: 'ObjectExpression',
        ObjectPattern: 'ObjectPattern',
        PrivateIdentifier: 'PrivateIdentifier',
        Program: 'Program',
        Property: 'Property',
        PropertyDefinition: 'PropertyDefinition',
        RestElement: 'RestElement',
        ReturnStatement: 'ReturnStatement',
        SequenceExpression: 'SequenceExpression',
        SpreadElement: 'SpreadElement',
        Super: 'Super',
        SwitchStatement: 'SwitchStatement',
        SwitchCase: 'SwitchCase',
        TaggedTemplateExpression: 'TaggedTemplateExpression',
        TemplateElement: 'TemplateElement',
        TemplateLiteral: 'TemplateLiteral',
        ThisExpression: 'ThisExpression',
        ThrowStatement: 'ThrowStatement',
        TryStatement: 'TryStatement',
        UnaryExpression: 'UnaryExpression',
        UpdateExpression: 'UpdateExpression',
        VariableDeclaration: 'VariableDeclaration',
        VariableDeclarator: 'VariableDeclarator',
        WhileStatement: 'WhileStatement',
        WithStatement: 'WithStatement',
        YieldExpression: 'YieldExpression'
    };
    VisitorKeys = {
        AssignmentExpression: [
            'left',
            'right'
        ],
        AssignmentPattern: [
            'left',
            'right'
        ],
        ArrayExpression: [
            'elements'
        ],
        ArrayPattern: [
            'elements'
        ],
        ArrowFunctionExpression: [
            'params',
            'body'
        ],
        AwaitExpression: [
            'argument'
        ],
        BlockStatement: [
            'body'
        ],
        BinaryExpression: [
            'left',
            'right'
        ],
        BreakStatement: [
            'label'
        ],
        CallExpression: [
            'callee',
            'arguments'
        ],
        CatchClause: [
            'param',
            'body'
        ],
        ChainExpression: [
            'expression'
        ],
        ClassBody: [
            'body'
        ],
        ClassDeclaration: [
            'id',
            'superClass',
            'body'
        ],
        ClassExpression: [
            'id',
            'superClass',
            'body'
        ],
        ComprehensionBlock: [
            'left',
            'right'
        ],
        ComprehensionExpression: [
            'blocks',
            'filter',
            'body'
        ],
        ConditionalExpression: [
            'test',
            'consequent',
            'alternate'
        ],
        ContinueStatement: [
            'label'
        ],
        DebuggerStatement: [],
        DirectiveStatement: [],
        DoWhileStatement: [
            'body',
            'test'
        ],
        EmptyStatement: [],
        ExportAllDeclaration: [
            'source'
        ],
        ExportDefaultDeclaration: [
            'declaration'
        ],
        ExportNamedDeclaration: [
            'declaration',
            'specifiers',
            'source'
        ],
        ExportSpecifier: [
            'exported',
            'local'
        ],
        ExpressionStatement: [
            'expression'
        ],
        ForStatement: [
            'init',
            'test',
            'update',
            'body'
        ],
        ForInStatement: [
            'left',
            'right',
            'body'
        ],
        ForOfStatement: [
            'left',
            'right',
            'body'
        ],
        FunctionDeclaration: [
            'id',
            'params',
            'body'
        ],
        FunctionExpression: [
            'id',
            'params',
            'body'
        ],
        GeneratorExpression: [
            'blocks',
            'filter',
            'body'
        ],
        Identifier: [],
        IfStatement: [
            'test',
            'consequent',
            'alternate'
        ],
        ImportExpression: [
            'source'
        ],
        ImportDeclaration: [
            'specifiers',
            'source'
        ],
        ImportDefaultSpecifier: [
            'local'
        ],
        ImportNamespaceSpecifier: [
            'local'
        ],
        ImportSpecifier: [
            'imported',
            'local'
        ],
        Literal: [],
        LabeledStatement: [
            'label',
            'body'
        ],
        LogicalExpression: [
            'left',
            'right'
        ],
        MemberExpression: [
            'object',
            'property'
        ],
        MetaProperty: [
            'meta',
            'property'
        ],
        MethodDefinition: [
            'key',
            'value'
        ],
        ModuleSpecifier: [],
        NewExpression: [
            'callee',
            'arguments'
        ],
        ObjectExpression: [
            'properties'
        ],
        ObjectPattern: [
            'properties'
        ],
        PrivateIdentifier: [],
        Program: [
            'body'
        ],
        Property: [
            'key',
            'value'
        ],
        PropertyDefinition: [
            'key',
            'value'
        ],
        RestElement: [
            'argument'
        ],
        ReturnStatement: [
            'argument'
        ],
        SequenceExpression: [
            'expressions'
        ],
        SpreadElement: [
            'argument'
        ],
        Super: [],
        SwitchStatement: [
            'discriminant',
            'cases'
        ],
        SwitchCase: [
            'test',
            'consequent'
        ],
        TaggedTemplateExpression: [
            'tag',
            'quasi'
        ],
        TemplateElement: [],
        TemplateLiteral: [
            'quasis',
            'expressions'
        ],
        ThisExpression: [],
        ThrowStatement: [
            'argument'
        ],
        TryStatement: [
            'block',
            'handler',
            'finalizer'
        ],
        UnaryExpression: [
            'argument'
        ],
        UpdateExpression: [
            'argument'
        ],
        VariableDeclaration: [
            'declarations'
        ],
        VariableDeclarator: [
            'id',
            'init'
        ],
        WhileStatement: [
            'test',
            'body'
        ],
        WithStatement: [
            'object',
            'body'
        ],
        YieldExpression: [
            'argument'
        ]
    };
    // unique id
    BREAK = {};
    SKIP = {};
    REMOVE = {};
    VisitorOption = {
        Break: BREAK,
        Skip: SKIP,
        Remove: REMOVE
    };
    function Reference(parent, key) {
        this.parent = parent;
        this.key = key;
    }
    Reference.prototype.replace = function replace(node) {
        this.parent[this.key] = node;
    };
    Reference.prototype.remove = function remove() {
        if (Array.isArray(this.parent)) {
            this.parent.splice(this.key, 1);
            return true;
        } else {
            this.replace(null);
            return false;
        }
    };
    function Element(node, path, wrap, ref) {
        this.node = node;
        this.path = path;
        this.wrap = wrap;
        this.ref = ref;
    }
    function Controller() {}
    // API:
    // return property path array from root to current node
    Controller.prototype.path = function path() {
        var i, iz, j, jz, result, element;
        function addToPath(result, path) {
            if (Array.isArray(path)) for(j = 0, jz = path.length; j < jz; ++j)result.push(path[j]);
            else result.push(path);
        }
        // root node
        if (!this.__current.path) return null;
        // first node is sentinel, second node is root element
        result = [];
        for(i = 2, iz = this.__leavelist.length; i < iz; ++i){
            element = this.__leavelist[i];
            addToPath(result, element.path);
        }
        addToPath(result, this.__current.path);
        return result;
    };
    // API:
    // return type of current node
    Controller.prototype.type = function() {
        var node = this.current();
        return node.type || this.__current.wrap;
    };
    // API:
    // return array of parent elements
    Controller.prototype.parents = function parents() {
        var i, iz, result;
        // first node is sentinel
        result = [];
        for(i = 1, iz = this.__leavelist.length; i < iz; ++i)result.push(this.__leavelist[i].node);
        return result;
    };
    // API:
    // return current node
    Controller.prototype.current = function current() {
        return this.__current.node;
    };
    Controller.prototype.__execute = function __execute(callback, element) {
        var previous, result;
        result = undefined;
        previous = this.__current;
        this.__current = element;
        this.__state = null;
        if (callback) result = callback.call(this, element.node, this.__leavelist[this.__leavelist.length - 1].node);
        this.__current = previous;
        return result;
    };
    // API:
    // notify control skip / break
    Controller.prototype.notify = function notify(flag) {
        this.__state = flag;
    };
    // API:
    // skip child nodes of current node
    Controller.prototype.skip = function() {
        this.notify(SKIP);
    };
    // API:
    // break traversals
    Controller.prototype['break'] = function() {
        this.notify(BREAK);
    };
    // API:
    // remove node
    Controller.prototype.remove = function() {
        this.notify(REMOVE);
    };
    Controller.prototype.__initialize = function(root, visitor) {
        this.visitor = visitor;
        this.root = root;
        this.__worklist = [];
        this.__leavelist = [];
        this.__current = null;
        this.__state = null;
        this.__fallback = null;
        if (visitor.fallback === 'iteration') this.__fallback = Object.keys;
        else if (typeof visitor.fallback === 'function') this.__fallback = visitor.fallback;
        this.__keys = VisitorKeys;
        if (visitor.keys) this.__keys = Object.assign(Object.create(this.__keys), visitor.keys);
    };
    function isNode(node) {
        if (node == null) return false;
        return typeof node === 'object' && typeof node.type === 'string';
    }
    function isProperty(nodeType, key) {
        return (nodeType === Syntax.ObjectExpression || nodeType === Syntax.ObjectPattern) && 'properties' === key;
    }
    function candidateExistsInLeaveList(leavelist, candidate) {
        for(var i = leavelist.length - 1; i >= 0; --i){
            if (leavelist[i].node === candidate) return true;
        }
        return false;
    }
    Controller.prototype.traverse = function traverse(root, visitor) {
        var worklist, leavelist, element, node, nodeType, ret, key, current, current2, candidates, candidate, sentinel;
        this.__initialize(root, visitor);
        sentinel = {};
        // reference
        worklist = this.__worklist;
        leavelist = this.__leavelist;
        // initialize
        worklist.push(new Element(root, null, null, null));
        leavelist.push(new Element(null, null, null, null));
        while(worklist.length){
            element = worklist.pop();
            if (element === sentinel) {
                element = leavelist.pop();
                ret = this.__execute(visitor.leave, element);
                if (this.__state === BREAK || ret === BREAK) return;
                continue;
            }
            if (element.node) {
                ret = this.__execute(visitor.enter, element);
                if (this.__state === BREAK || ret === BREAK) return;
                worklist.push(sentinel);
                leavelist.push(element);
                if (this.__state === SKIP || ret === SKIP) continue;
                node = element.node;
                nodeType = node.type || element.wrap;
                candidates = this.__keys[nodeType];
                if (!candidates) {
                    if (this.__fallback) candidates = this.__fallback(node);
                    else throw new Error('Unknown node type ' + nodeType + '.');
                }
                current = candidates.length;
                while((current -= 1) >= 0){
                    key = candidates[current];
                    candidate = node[key];
                    if (!candidate) continue;
                    if (Array.isArray(candidate)) {
                        current2 = candidate.length;
                        while((current2 -= 1) >= 0){
                            if (!candidate[current2]) continue;
                            if (candidateExistsInLeaveList(leavelist, candidate[current2])) continue;
                            if (isProperty(nodeType, candidates[current])) element = new Element(candidate[current2], [
                                key,
                                current2
                            ], 'Property', null);
                            else if (isNode(candidate[current2])) element = new Element(candidate[current2], [
                                key,
                                current2
                            ], null, null);
                            else continue;
                            worklist.push(element);
                        }
                    } else if (isNode(candidate)) {
                        if (candidateExistsInLeaveList(leavelist, candidate)) continue;
                        worklist.push(new Element(candidate, key, null, null));
                    }
                }
            }
        }
    };
    Controller.prototype.replace = function replace(root, visitor) {
        var worklist, leavelist, node, nodeType, target, element, current, current2, candidates, candidate, sentinel, outer, key;
        function removeElem(element) {
            var i, key, nextElem, parent;
            if (element.ref.remove()) {
                // When the reference is an element of an array.
                key = element.ref.key;
                parent = element.ref.parent;
                // If removed from array, then decrease following items' keys.
                i = worklist.length;
                while(i--){
                    nextElem = worklist[i];
                    if (nextElem.ref && nextElem.ref.parent === parent) {
                        if (nextElem.ref.key < key) break;
                        --nextElem.ref.key;
                    }
                }
            }
        }
        this.__initialize(root, visitor);
        sentinel = {};
        // reference
        worklist = this.__worklist;
        leavelist = this.__leavelist;
        // initialize
        outer = {
            root: root
        };
        element = new Element(root, null, null, new Reference(outer, 'root'));
        worklist.push(element);
        leavelist.push(element);
        while(worklist.length){
            element = worklist.pop();
            if (element === sentinel) {
                element = leavelist.pop();
                target = this.__execute(visitor.leave, element);
                // node may be replaced with null,
                // so distinguish between undefined and null in this place
                if (target !== undefined && target !== BREAK && target !== SKIP && target !== REMOVE) // replace
                element.ref.replace(target);
                if (this.__state === REMOVE || target === REMOVE) removeElem(element);
                if (this.__state === BREAK || target === BREAK) return outer.root;
                continue;
            }
            target = this.__execute(visitor.enter, element);
            // node may be replaced with null,
            // so distinguish between undefined and null in this place
            if (target !== undefined && target !== BREAK && target !== SKIP && target !== REMOVE) {
                // replace
                element.ref.replace(target);
                element.node = target;
            }
            if (this.__state === REMOVE || target === REMOVE) {
                removeElem(element);
                element.node = null;
            }
            if (this.__state === BREAK || target === BREAK) return outer.root;
            // node may be null
            node = element.node;
            if (!node) continue;
            worklist.push(sentinel);
            leavelist.push(element);
            if (this.__state === SKIP || target === SKIP) continue;
            nodeType = node.type || element.wrap;
            candidates = this.__keys[nodeType];
            if (!candidates) {
                if (this.__fallback) candidates = this.__fallback(node);
                else throw new Error('Unknown node type ' + nodeType + '.');
            }
            current = candidates.length;
            while((current -= 1) >= 0){
                key = candidates[current];
                candidate = node[key];
                if (!candidate) continue;
                if (Array.isArray(candidate)) {
                    current2 = candidate.length;
                    while((current2 -= 1) >= 0){
                        if (!candidate[current2]) continue;
                        if (isProperty(nodeType, candidates[current])) element = new Element(candidate[current2], [
                            key,
                            current2
                        ], 'Property', new Reference(candidate, current2));
                        else if (isNode(candidate[current2])) element = new Element(candidate[current2], [
                            key,
                            current2
                        ], null, new Reference(candidate, current2));
                        else continue;
                        worklist.push(element);
                    }
                } else if (isNode(candidate)) worklist.push(new Element(candidate, key, null, new Reference(node, key)));
            }
        }
        return outer.root;
    };
    function traverse(root, visitor) {
        var controller = new Controller();
        return controller.traverse(root, visitor);
    }
    function replace(root, visitor) {
        var controller = new Controller();
        return controller.replace(root, visitor);
    }
    function extendCommentRange(comment, tokens) {
        var target;
        target = upperBound(tokens, function search(token) {
            return token.range[0] > comment.range[0];
        });
        comment.extendedRange = [
            comment.range[0],
            comment.range[1]
        ];
        if (target !== tokens.length) comment.extendedRange[1] = tokens[target].range[0];
        target -= 1;
        if (target >= 0) comment.extendedRange[0] = tokens[target].range[1];
        return comment;
    }
    function attachComments(tree, providedComments, tokens) {
        // At first, we should calculate extended comment ranges.
        var comments = [], comment, len, i, cursor;
        if (!tree.range) throw new Error('attachComments needs range information');
        // tokens array is empty, we attach comments to tree as 'leadingComments'
        if (!tokens.length) {
            if (providedComments.length) {
                for(i = 0, len = providedComments.length; i < len; i += 1){
                    comment = deepCopy(providedComments[i]);
                    comment.extendedRange = [
                        0,
                        tree.range[0]
                    ];
                    comments.push(comment);
                }
                tree.leadingComments = comments;
            }
            return tree;
        }
        for(i = 0, len = providedComments.length; i < len; i += 1)comments.push(extendCommentRange(deepCopy(providedComments[i]), tokens));
        // This is based on John Freeman's implementation.
        cursor = 0;
        traverse(tree, {
            enter: function(node) {
                var comment;
                while(cursor < comments.length){
                    comment = comments[cursor];
                    if (comment.extendedRange[1] > node.range[0]) break;
                    if (comment.extendedRange[1] === node.range[0]) {
                        if (!node.leadingComments) node.leadingComments = [];
                        node.leadingComments.push(comment);
                        comments.splice(cursor, 1);
                    } else cursor += 1;
                }
                // already out of owned node
                if (cursor === comments.length) return VisitorOption.Break;
                if (comments[cursor].extendedRange[0] > node.range[1]) return VisitorOption.Skip;
            }
        });
        cursor = 0;
        traverse(tree, {
            leave: function(node) {
                var comment;
                while(cursor < comments.length){
                    comment = comments[cursor];
                    if (node.range[1] < comment.extendedRange[0]) break;
                    if (node.range[1] === comment.extendedRange[0]) {
                        if (!node.trailingComments) node.trailingComments = [];
                        node.trailingComments.push(comment);
                        comments.splice(cursor, 1);
                    } else cursor += 1;
                }
                // already out of owned node
                if (cursor === comments.length) return VisitorOption.Break;
                if (comments[cursor].extendedRange[0] > node.range[1]) return VisitorOption.Skip;
            }
        });
        return tree;
    }
    exports1.Syntax = Syntax;
    exports1.traverse = traverse;
    exports1.replace = replace;
    exports1.attachComments = attachComments;
    exports1.VisitorKeys = VisitorKeys;
    exports1.VisitorOption = VisitorOption;
    exports1.Controller = Controller;
    exports1.cloneEnvironment = function() {
        return clone({});
    };
    return exports1;
})(exports); /* vim: set sw=4 ts=4 et tw=80 : */ 

},{}],"lGmqJ":[function(require,module,exports,__globalThis) {
/*
  Copyright (C) 2013 Yusuke Suzuki <utatane.tea@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/ (function() {
    'use strict';
    exports.ast = require("635e464a0faa52f6");
    exports.code = require("ab412758b0cb3565");
    exports.keyword = require("c0f7d4d834ba5d0c");
})(); /* vim: set sw=4 ts=4 et tw=80 : */ 

},{"635e464a0faa52f6":"cO51x","ab412758b0cb3565":"9vcCJ","c0f7d4d834ba5d0c":"lxSt3"}],"cO51x":[function(require,module,exports,__globalThis) {
/*
  Copyright (C) 2013 Yusuke Suzuki <utatane.tea@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 'AS IS'
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/ (function() {
    'use strict';
    function isExpression(node) {
        if (node == null) return false;
        switch(node.type){
            case 'ArrayExpression':
            case 'AssignmentExpression':
            case 'BinaryExpression':
            case 'CallExpression':
            case 'ConditionalExpression':
            case 'FunctionExpression':
            case 'Identifier':
            case 'Literal':
            case 'LogicalExpression':
            case 'MemberExpression':
            case 'NewExpression':
            case 'ObjectExpression':
            case 'SequenceExpression':
            case 'ThisExpression':
            case 'UnaryExpression':
            case 'UpdateExpression':
                return true;
        }
        return false;
    }
    function isIterationStatement(node) {
        if (node == null) return false;
        switch(node.type){
            case 'DoWhileStatement':
            case 'ForInStatement':
            case 'ForStatement':
            case 'WhileStatement':
                return true;
        }
        return false;
    }
    function isStatement(node) {
        if (node == null) return false;
        switch(node.type){
            case 'BlockStatement':
            case 'BreakStatement':
            case 'ContinueStatement':
            case 'DebuggerStatement':
            case 'DoWhileStatement':
            case 'EmptyStatement':
            case 'ExpressionStatement':
            case 'ForInStatement':
            case 'ForStatement':
            case 'IfStatement':
            case 'LabeledStatement':
            case 'ReturnStatement':
            case 'SwitchStatement':
            case 'ThrowStatement':
            case 'TryStatement':
            case 'VariableDeclaration':
            case 'WhileStatement':
            case 'WithStatement':
                return true;
        }
        return false;
    }
    function isSourceElement(node) {
        return isStatement(node) || node != null && node.type === 'FunctionDeclaration';
    }
    function trailingStatement(node) {
        switch(node.type){
            case 'IfStatement':
                if (node.alternate != null) return node.alternate;
                return node.consequent;
            case 'LabeledStatement':
            case 'ForStatement':
            case 'ForInStatement':
            case 'WhileStatement':
            case 'WithStatement':
                return node.body;
        }
        return null;
    }
    function isProblematicIfStatement(node) {
        var current;
        if (node.type !== 'IfStatement') return false;
        if (node.alternate == null) return false;
        current = node.consequent;
        do {
            if (current.type === 'IfStatement') {
                if (current.alternate == null) return true;
            }
            current = trailingStatement(current);
        }while (current);
        return false;
    }
    module.exports = {
        isExpression: isExpression,
        isStatement: isStatement,
        isIterationStatement: isIterationStatement,
        isSourceElement: isSourceElement,
        isProblematicIfStatement: isProblematicIfStatement,
        trailingStatement: trailingStatement
    };
})(); /* vim: set sw=4 ts=4 et tw=80 : */ 

},{}],"9vcCJ":[function(require,module,exports,__globalThis) {
/*
  Copyright (C) 2013-2014 Yusuke Suzuki <utatane.tea@gmail.com>
  Copyright (C) 2014 Ivan Nikulin <ifaaan@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/ (function() {
    'use strict';
    var ES6Regex, ES5Regex, NON_ASCII_WHITESPACES, IDENTIFIER_START, IDENTIFIER_PART, ch;
    // See `tools/generate-identifier-regex.js`.
    ES5Regex = {
        // ECMAScript 5.1/Unicode v9.0.0 NonAsciiIdentifierStart:
        NonAsciiIdentifierStart: /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/,
        // ECMAScript 5.1/Unicode v9.0.0 NonAsciiIdentifierPart:
        NonAsciiIdentifierPart: /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B4\u08B6-\u08BD\u08D4-\u08E1\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C80-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D54-\u0D57\u0D5F-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFB-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/
    };
    ES6Regex = {
        // ECMAScript 6/Unicode v9.0.0 NonAsciiIdentifierStart:
        NonAsciiIdentifierStart: /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDF00-\uDF19]|\uD806[\uDCA0-\uDCDF\uDCFF\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F\uDFE0]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1]|\uD87E[\uDC00-\uDE1D]/,
        // ECMAScript 6/Unicode v9.0.0 NonAsciiIdentifierPart:
        NonAsciiIdentifierPart: /[\xAA\xB5\xB7\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B4\u08B6-\u08BD\u08D4-\u08E1\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C80-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D54-\u0D57\u0D5F-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1369-\u1371\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFB-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDCA-\uDDCC\uDDD0-\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE37\uDE3E\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF50\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC00-\uDC4A\uDC50-\uDC59\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDDD8-\uDDDD\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB7\uDEC0-\uDEC9\uDF00-\uDF19\uDF1D-\uDF2B\uDF30-\uDF39]|\uD806[\uDCA0-\uDCE9\uDCFF\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC36\uDC38-\uDC40\uDC50-\uDC59\uDC72-\uDC8F\uDC92-\uDCA7\uDCA9-\uDCB6]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F\uDFE0]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD838[\uDC00-\uDC06\uDC08-\uDC18\uDC1B-\uDC21\uDC23\uDC24\uDC26-\uDC2A]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6\uDD00-\uDD4A\uDD50-\uDD59]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF]/
    };
    function isDecimalDigit(ch) {
        return 0x30 <= ch && ch <= 0x39; // 0..9
    }
    function isHexDigit(ch) {
        return 0x30 <= ch && ch <= 0x39 || // 0..9
        0x61 <= ch && ch <= 0x66 || // a..f
        0x41 <= ch && ch <= 0x46; // A..F
    }
    function isOctalDigit(ch) {
        return ch >= 0x30 && ch <= 0x37; // 0..7
    }
    // 7.2 White Space
    NON_ASCII_WHITESPACES = [
        0x1680,
        0x2000,
        0x2001,
        0x2002,
        0x2003,
        0x2004,
        0x2005,
        0x2006,
        0x2007,
        0x2008,
        0x2009,
        0x200A,
        0x202F,
        0x205F,
        0x3000,
        0xFEFF
    ];
    function isWhiteSpace(ch) {
        return ch === 0x20 || ch === 0x09 || ch === 0x0B || ch === 0x0C || ch === 0xA0 || ch >= 0x1680 && NON_ASCII_WHITESPACES.indexOf(ch) >= 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator(ch) {
        return ch === 0x0A || ch === 0x0D || ch === 0x2028 || ch === 0x2029;
    }
    // 7.6 Identifier Names and Identifiers
    function fromCodePoint(cp) {
        if (cp <= 0xFFFF) return String.fromCharCode(cp);
        var cu1 = String.fromCharCode(Math.floor((cp - 0x10000) / 0x400) + 0xD800);
        var cu2 = String.fromCharCode((cp - 0x10000) % 0x400 + 0xDC00);
        return cu1 + cu2;
    }
    IDENTIFIER_START = new Array(0x80);
    for(ch = 0; ch < 0x80; ++ch)IDENTIFIER_START[ch] = ch >= 0x61 && ch <= 0x7A || // a..z
    ch >= 0x41 && ch <= 0x5A || // A..Z
    ch === 0x24 || ch === 0x5F; // $ (dollar) and _ (underscore)
    IDENTIFIER_PART = new Array(0x80);
    for(ch = 0; ch < 0x80; ++ch)IDENTIFIER_PART[ch] = ch >= 0x61 && ch <= 0x7A || // a..z
    ch >= 0x41 && ch <= 0x5A || // A..Z
    ch >= 0x30 && ch <= 0x39 || // 0..9
    ch === 0x24 || ch === 0x5F; // $ (dollar) and _ (underscore)
    function isIdentifierStartES5(ch) {
        return ch < 0x80 ? IDENTIFIER_START[ch] : ES5Regex.NonAsciiIdentifierStart.test(fromCodePoint(ch));
    }
    function isIdentifierPartES5(ch) {
        return ch < 0x80 ? IDENTIFIER_PART[ch] : ES5Regex.NonAsciiIdentifierPart.test(fromCodePoint(ch));
    }
    function isIdentifierStartES6(ch) {
        return ch < 0x80 ? IDENTIFIER_START[ch] : ES6Regex.NonAsciiIdentifierStart.test(fromCodePoint(ch));
    }
    function isIdentifierPartES6(ch) {
        return ch < 0x80 ? IDENTIFIER_PART[ch] : ES6Regex.NonAsciiIdentifierPart.test(fromCodePoint(ch));
    }
    module.exports = {
        isDecimalDigit: isDecimalDigit,
        isHexDigit: isHexDigit,
        isOctalDigit: isOctalDigit,
        isWhiteSpace: isWhiteSpace,
        isLineTerminator: isLineTerminator,
        isIdentifierStartES5: isIdentifierStartES5,
        isIdentifierPartES5: isIdentifierPartES5,
        isIdentifierStartES6: isIdentifierStartES6,
        isIdentifierPartES6: isIdentifierPartES6
    };
})(); /* vim: set sw=4 ts=4 et tw=80 : */ 

},{}],"lxSt3":[function(require,module,exports,__globalThis) {
/*
  Copyright (C) 2013 Yusuke Suzuki <utatane.tea@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/ (function() {
    'use strict';
    var code = require("b9157deceabd4e7");
    function isStrictModeReservedWordES6(id) {
        switch(id){
            case 'implements':
            case 'interface':
            case 'package':
            case 'private':
            case 'protected':
            case 'public':
            case 'static':
            case 'let':
                return true;
            default:
                return false;
        }
    }
    function isKeywordES5(id, strict) {
        // yield should not be treated as keyword under non-strict mode.
        if (!strict && id === 'yield') return false;
        return isKeywordES6(id, strict);
    }
    function isKeywordES6(id, strict) {
        if (strict && isStrictModeReservedWordES6(id)) return true;
        switch(id.length){
            case 2:
                return id === 'if' || id === 'in' || id === 'do';
            case 3:
                return id === 'var' || id === 'for' || id === 'new' || id === 'try';
            case 4:
                return id === 'this' || id === 'else' || id === 'case' || id === 'void' || id === 'with' || id === 'enum';
            case 5:
                return id === 'while' || id === 'break' || id === 'catch' || id === 'throw' || id === 'const' || id === 'yield' || id === 'class' || id === 'super';
            case 6:
                return id === 'return' || id === 'typeof' || id === 'delete' || id === 'switch' || id === 'export' || id === 'import';
            case 7:
                return id === 'default' || id === 'finally' || id === 'extends';
            case 8:
                return id === 'function' || id === 'continue' || id === 'debugger';
            case 10:
                return id === 'instanceof';
            default:
                return false;
        }
    }
    function isReservedWordES5(id, strict) {
        return id === 'null' || id === 'true' || id === 'false' || isKeywordES5(id, strict);
    }
    function isReservedWordES6(id, strict) {
        return id === 'null' || id === 'true' || id === 'false' || isKeywordES6(id, strict);
    }
    function isRestrictedWord(id) {
        return id === 'eval' || id === 'arguments';
    }
    function isIdentifierNameES5(id) {
        var i, iz, ch;
        if (id.length === 0) return false;
        ch = id.charCodeAt(0);
        if (!code.isIdentifierStartES5(ch)) return false;
        for(i = 1, iz = id.length; i < iz; ++i){
            ch = id.charCodeAt(i);
            if (!code.isIdentifierPartES5(ch)) return false;
        }
        return true;
    }
    function decodeUtf16(lead, trail) {
        return (lead - 0xD800) * 0x400 + (trail - 0xDC00) + 0x10000;
    }
    function isIdentifierNameES6(id) {
        var i, iz, ch, lowCh, check;
        if (id.length === 0) return false;
        check = code.isIdentifierStartES6;
        for(i = 0, iz = id.length; i < iz; ++i){
            ch = id.charCodeAt(i);
            if (0xD800 <= ch && ch <= 0xDBFF) {
                ++i;
                if (i >= iz) return false;
                lowCh = id.charCodeAt(i);
                if (!(0xDC00 <= lowCh && lowCh <= 0xDFFF)) return false;
                ch = decodeUtf16(ch, lowCh);
            }
            if (!check(ch)) return false;
            check = code.isIdentifierPartES6;
        }
        return true;
    }
    function isIdentifierES5(id, strict) {
        return isIdentifierNameES5(id) && !isReservedWordES5(id, strict);
    }
    function isIdentifierES6(id, strict) {
        return isIdentifierNameES6(id) && !isReservedWordES6(id, strict);
    }
    module.exports = {
        isKeywordES5: isKeywordES5,
        isKeywordES6: isKeywordES6,
        isReservedWordES5: isReservedWordES5,
        isReservedWordES6: isReservedWordES6,
        isRestrictedWord: isRestrictedWord,
        isIdentifierNameES5: isIdentifierNameES5,
        isIdentifierNameES6: isIdentifierNameES6,
        isIdentifierES5: isIdentifierES5,
        isIdentifierES6: isIdentifierES6
    };
})(); /* vim: set sw=4 ts=4 et tw=80 : */ 

},{"b9157deceabd4e7":"9vcCJ"}],"jEkRn":[function(require,module,exports,__globalThis) {
module.exports = JSON.parse("{\"name\":\"escodegen\",\"description\":\"ECMAScript code generator\",\"homepage\":\"http://github.com/estools/escodegen\",\"main\":\"escodegen.js\",\"bin\":{\"esgenerate\":\"./bin/esgenerate.js\",\"escodegen\":\"./bin/escodegen.js\"},\"files\":[\"LICENSE.BSD\",\"README.md\",\"bin\",\"escodegen.js\",\"package.json\"],\"version\":\"2.1.0\",\"engines\":{\"node\":\">=6.0\"},\"maintainers\":[{\"name\":\"Yusuke Suzuki\",\"email\":\"utatane.tea@gmail.com\",\"web\":\"http://github.com/Constellation\"}],\"repository\":{\"type\":\"git\",\"url\":\"http://github.com/estools/escodegen.git\"},\"dependencies\":{\"estraverse\":\"^5.2.0\",\"esutils\":\"^2.0.2\",\"esprima\":\"^4.0.1\"},\"optionalDependencies\":{\"source-map\":\"~0.6.1\"},\"devDependencies\":{\"acorn\":\"^8.0.4\",\"bluebird\":\"^3.4.7\",\"bower-registry-client\":\"^1.0.0\",\"chai\":\"^4.2.0\",\"chai-exclude\":\"^2.0.2\",\"commonjs-everywhere\":\"^0.9.7\",\"gulp\":\"^4.0.2\",\"gulp-eslint\":\"^6.0.0\",\"gulp-mocha\":\"^7.0.2\",\"minimist\":\"^1.2.5\",\"optionator\":\"^0.9.1\",\"semver\":\"^7.3.4\"},\"license\":\"BSD-2-Clause\",\"scripts\":{\"test\":\"gulp travis\",\"unit-test\":\"gulp test\",\"lint\":\"gulp lint\",\"release\":\"node tools/release.js\",\"build-min\":\"./node_modules/.bin/cjsify -ma path: tools/entry-point.js > escodegen.browser.min.js\",\"build\":\"./node_modules/.bin/cjsify -a path: tools/entry-point.js > escodegen.browser.js\"}}");

},{}],"8RH6f":[function(require,module,exports,__globalThis) {
(function webpackUniversalModuleDefinition(root, factory) {
    module.exports = factory();
})(this, function() {
    return /******/ function(modules) {
        /******/ // The module cache
        /******/ var installedModules = {};
        /******/ // The require function
        /******/ function __webpack_require__(moduleId) {
            /******/ // Check if module is in cache
            /* istanbul ignore if */ /******/ if (installedModules[moduleId]) /******/ return installedModules[moduleId].exports;
            /******/ // Create a new module (and put it into the cache)
            /******/ var module1 = installedModules[moduleId] = {
                /******/ exports: {},
                /******/ id: moduleId,
                /******/ loaded: false
            };
            /******/ // Execute the module function
            /******/ modules[moduleId].call(module1.exports, module1, module1.exports, __webpack_require__);
            /******/ // Flag the module as loaded
            /******/ module1.loaded = true;
            /******/ // Return the exports of the module
            /******/ return module1.exports;
        /******/ }
        /******/ // expose the modules object (__webpack_modules__)
        /******/ __webpack_require__.m = modules;
        /******/ // expose the module cache
        /******/ __webpack_require__.c = installedModules;
        /******/ // __webpack_public_path__
        /******/ __webpack_require__.p = "";
        /******/ // Load entry module and return exports
        /******/ return __webpack_require__(0);
    /******/ }([
        /* 0 */ /***/ function(module1, exports, __webpack_require__) {
            "use strict";
            /*
	  Copyright JS Foundation and other contributors, https://js.foundation/

	  Redistribution and use in source and binary forms, with or without
	  modification, are permitted provided that the following conditions are met:

	    * Redistributions of source code must retain the above copyright
	      notice, this list of conditions and the following disclaimer.
	    * Redistributions in binary form must reproduce the above copyright
	      notice, this list of conditions and the following disclaimer in the
	      documentation and/or other materials provided with the distribution.

	  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
	  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
	  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
	  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
	  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
	  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
	  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	*/ Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var comment_handler_1 = __webpack_require__(1);
            var jsx_parser_1 = __webpack_require__(3);
            var parser_1 = __webpack_require__(8);
            var tokenizer_1 = __webpack_require__(15);
            function parse(code, options, delegate) {
                var commentHandler = null;
                var proxyDelegate = function(node, metadata) {
                    if (delegate) delegate(node, metadata);
                    if (commentHandler) commentHandler.visit(node, metadata);
                };
                var parserDelegate = typeof delegate === 'function' ? proxyDelegate : null;
                var collectComment = false;
                if (options) {
                    collectComment = typeof options.comment === 'boolean' && options.comment;
                    var attachComment = typeof options.attachComment === 'boolean' && options.attachComment;
                    if (collectComment || attachComment) {
                        commentHandler = new comment_handler_1.CommentHandler();
                        commentHandler.attach = attachComment;
                        options.comment = true;
                        parserDelegate = proxyDelegate;
                    }
                }
                var isModule = false;
                if (options && typeof options.sourceType === 'string') isModule = options.sourceType === 'module';
                var parser;
                if (options && typeof options.jsx === 'boolean' && options.jsx) parser = new jsx_parser_1.JSXParser(code, options, parserDelegate);
                else parser = new parser_1.Parser(code, options, parserDelegate);
                var program = isModule ? parser.parseModule() : parser.parseScript();
                var ast = program;
                if (collectComment && commentHandler) ast.comments = commentHandler.comments;
                if (parser.config.tokens) ast.tokens = parser.tokens;
                if (parser.config.tolerant) ast.errors = parser.errorHandler.errors;
                return ast;
            }
            exports.parse = parse;
            function parseModule(code, options, delegate) {
                var parsingOptions = options || {};
                parsingOptions.sourceType = 'module';
                return parse(code, parsingOptions, delegate);
            }
            exports.parseModule = parseModule;
            function parseScript(code, options, delegate) {
                var parsingOptions = options || {};
                parsingOptions.sourceType = 'script';
                return parse(code, parsingOptions, delegate);
            }
            exports.parseScript = parseScript;
            function tokenize(code, options, delegate) {
                var tokenizer = new tokenizer_1.Tokenizer(code, options);
                var tokens;
                tokens = [];
                try {
                    while(true){
                        var token = tokenizer.getNextToken();
                        if (!token) break;
                        if (delegate) token = delegate(token);
                        tokens.push(token);
                    }
                } catch (e) {
                    tokenizer.errorHandler.tolerate(e);
                }
                if (tokenizer.errorHandler.tolerant) tokens.errors = tokenizer.errors();
                return tokens;
            }
            exports.tokenize = tokenize;
            var syntax_1 = __webpack_require__(2);
            exports.Syntax = syntax_1.Syntax;
            // Sync with *.json manifests.
            exports.version = '4.0.1';
        /***/ },
        /* 1 */ /***/ function(module1, exports, __webpack_require__) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var syntax_1 = __webpack_require__(2);
            var CommentHandler = function() {
                function CommentHandler() {
                    this.attach = false;
                    this.comments = [];
                    this.stack = [];
                    this.leading = [];
                    this.trailing = [];
                }
                CommentHandler.prototype.insertInnerComments = function(node, metadata) {
                    //  innnerComments for properties empty block
                    //  `function a() {/** comments **\/}`
                    if (node.type === syntax_1.Syntax.BlockStatement && node.body.length === 0) {
                        var innerComments = [];
                        for(var i = this.leading.length - 1; i >= 0; --i){
                            var entry = this.leading[i];
                            if (metadata.end.offset >= entry.start) {
                                innerComments.unshift(entry.comment);
                                this.leading.splice(i, 1);
                                this.trailing.splice(i, 1);
                            }
                        }
                        if (innerComments.length) node.innerComments = innerComments;
                    }
                };
                CommentHandler.prototype.findTrailingComments = function(metadata) {
                    var trailingComments = [];
                    if (this.trailing.length > 0) {
                        for(var i = this.trailing.length - 1; i >= 0; --i){
                            var entry_1 = this.trailing[i];
                            if (entry_1.start >= metadata.end.offset) trailingComments.unshift(entry_1.comment);
                        }
                        this.trailing.length = 0;
                        return trailingComments;
                    }
                    var entry = this.stack[this.stack.length - 1];
                    if (entry && entry.node.trailingComments) {
                        var firstComment = entry.node.trailingComments[0];
                        if (firstComment && firstComment.range[0] >= metadata.end.offset) {
                            trailingComments = entry.node.trailingComments;
                            delete entry.node.trailingComments;
                        }
                    }
                    return trailingComments;
                };
                CommentHandler.prototype.findLeadingComments = function(metadata) {
                    var leadingComments = [];
                    var target;
                    while(this.stack.length > 0){
                        var entry = this.stack[this.stack.length - 1];
                        if (entry && entry.start >= metadata.start.offset) {
                            target = entry.node;
                            this.stack.pop();
                        } else break;
                    }
                    if (target) {
                        var count = target.leadingComments ? target.leadingComments.length : 0;
                        for(var i = count - 1; i >= 0; --i){
                            var comment = target.leadingComments[i];
                            if (comment.range[1] <= metadata.start.offset) {
                                leadingComments.unshift(comment);
                                target.leadingComments.splice(i, 1);
                            }
                        }
                        if (target.leadingComments && target.leadingComments.length === 0) delete target.leadingComments;
                        return leadingComments;
                    }
                    for(var i = this.leading.length - 1; i >= 0; --i){
                        var entry = this.leading[i];
                        if (entry.start <= metadata.start.offset) {
                            leadingComments.unshift(entry.comment);
                            this.leading.splice(i, 1);
                        }
                    }
                    return leadingComments;
                };
                CommentHandler.prototype.visitNode = function(node, metadata) {
                    if (node.type === syntax_1.Syntax.Program && node.body.length > 0) return;
                    this.insertInnerComments(node, metadata);
                    var trailingComments = this.findTrailingComments(metadata);
                    var leadingComments = this.findLeadingComments(metadata);
                    if (leadingComments.length > 0) node.leadingComments = leadingComments;
                    if (trailingComments.length > 0) node.trailingComments = trailingComments;
                    this.stack.push({
                        node: node,
                        start: metadata.start.offset
                    });
                };
                CommentHandler.prototype.visitComment = function(node, metadata) {
                    var type = node.type[0] === 'L' ? 'Line' : 'Block';
                    var comment = {
                        type: type,
                        value: node.value
                    };
                    if (node.range) comment.range = node.range;
                    if (node.loc) comment.loc = node.loc;
                    this.comments.push(comment);
                    if (this.attach) {
                        var entry = {
                            comment: {
                                type: type,
                                value: node.value,
                                range: [
                                    metadata.start.offset,
                                    metadata.end.offset
                                ]
                            },
                            start: metadata.start.offset
                        };
                        if (node.loc) entry.comment.loc = node.loc;
                        node.type = type;
                        this.leading.push(entry);
                        this.trailing.push(entry);
                    }
                };
                CommentHandler.prototype.visit = function(node, metadata) {
                    if (node.type === 'LineComment') this.visitComment(node, metadata);
                    else if (node.type === 'BlockComment') this.visitComment(node, metadata);
                    else if (this.attach) this.visitNode(node, metadata);
                };
                return CommentHandler;
            }();
            exports.CommentHandler = CommentHandler;
        /***/ },
        /* 2 */ /***/ function(module1, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            exports.Syntax = {
                AssignmentExpression: 'AssignmentExpression',
                AssignmentPattern: 'AssignmentPattern',
                ArrayExpression: 'ArrayExpression',
                ArrayPattern: 'ArrayPattern',
                ArrowFunctionExpression: 'ArrowFunctionExpression',
                AwaitExpression: 'AwaitExpression',
                BlockStatement: 'BlockStatement',
                BinaryExpression: 'BinaryExpression',
                BreakStatement: 'BreakStatement',
                CallExpression: 'CallExpression',
                CatchClause: 'CatchClause',
                ClassBody: 'ClassBody',
                ClassDeclaration: 'ClassDeclaration',
                ClassExpression: 'ClassExpression',
                ConditionalExpression: 'ConditionalExpression',
                ContinueStatement: 'ContinueStatement',
                DoWhileStatement: 'DoWhileStatement',
                DebuggerStatement: 'DebuggerStatement',
                EmptyStatement: 'EmptyStatement',
                ExportAllDeclaration: 'ExportAllDeclaration',
                ExportDefaultDeclaration: 'ExportDefaultDeclaration',
                ExportNamedDeclaration: 'ExportNamedDeclaration',
                ExportSpecifier: 'ExportSpecifier',
                ExpressionStatement: 'ExpressionStatement',
                ForStatement: 'ForStatement',
                ForOfStatement: 'ForOfStatement',
                ForInStatement: 'ForInStatement',
                FunctionDeclaration: 'FunctionDeclaration',
                FunctionExpression: 'FunctionExpression',
                Identifier: 'Identifier',
                IfStatement: 'IfStatement',
                ImportDeclaration: 'ImportDeclaration',
                ImportDefaultSpecifier: 'ImportDefaultSpecifier',
                ImportNamespaceSpecifier: 'ImportNamespaceSpecifier',
                ImportSpecifier: 'ImportSpecifier',
                Literal: 'Literal',
                LabeledStatement: 'LabeledStatement',
                LogicalExpression: 'LogicalExpression',
                MemberExpression: 'MemberExpression',
                MetaProperty: 'MetaProperty',
                MethodDefinition: 'MethodDefinition',
                NewExpression: 'NewExpression',
                ObjectExpression: 'ObjectExpression',
                ObjectPattern: 'ObjectPattern',
                Program: 'Program',
                Property: 'Property',
                RestElement: 'RestElement',
                ReturnStatement: 'ReturnStatement',
                SequenceExpression: 'SequenceExpression',
                SpreadElement: 'SpreadElement',
                Super: 'Super',
                SwitchCase: 'SwitchCase',
                SwitchStatement: 'SwitchStatement',
                TaggedTemplateExpression: 'TaggedTemplateExpression',
                TemplateElement: 'TemplateElement',
                TemplateLiteral: 'TemplateLiteral',
                ThisExpression: 'ThisExpression',
                ThrowStatement: 'ThrowStatement',
                TryStatement: 'TryStatement',
                UnaryExpression: 'UnaryExpression',
                UpdateExpression: 'UpdateExpression',
                VariableDeclaration: 'VariableDeclaration',
                VariableDeclarator: 'VariableDeclarator',
                WhileStatement: 'WhileStatement',
                WithStatement: 'WithStatement',
                YieldExpression: 'YieldExpression'
            };
        /***/ },
        /* 3 */ /***/ function(module1, exports, __webpack_require__) {
            "use strict";
            /* istanbul ignore next */ var __extends = this && this.__extends || function() {
                var extendStatics = Object.setPrototypeOf || ({
                    __proto__: []
                }) instanceof Array && function(d, b) {
                    d.__proto__ = b;
                } || function(d, b) {
                    for(var p in b)if (b.hasOwnProperty(p)) d[p] = b[p];
                };
                return function(d, b) {
                    extendStatics(d, b);
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
                };
            }();
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var character_1 = __webpack_require__(4);
            var JSXNode = __webpack_require__(5);
            var jsx_syntax_1 = __webpack_require__(6);
            var Node = __webpack_require__(7);
            var parser_1 = __webpack_require__(8);
            var token_1 = __webpack_require__(13);
            var xhtml_entities_1 = __webpack_require__(14);
            token_1.TokenName[100 /* Identifier */ ] = 'JSXIdentifier';
            token_1.TokenName[101 /* Text */ ] = 'JSXText';
            // Fully qualified element name, e.g. <svg:path> returns "svg:path"
            function getQualifiedElementName(elementName) {
                var qualifiedName;
                switch(elementName.type){
                    case jsx_syntax_1.JSXSyntax.JSXIdentifier:
                        var id = elementName;
                        qualifiedName = id.name;
                        break;
                    case jsx_syntax_1.JSXSyntax.JSXNamespacedName:
                        var ns = elementName;
                        qualifiedName = getQualifiedElementName(ns.namespace) + ':' + getQualifiedElementName(ns.name);
                        break;
                    case jsx_syntax_1.JSXSyntax.JSXMemberExpression:
                        var expr = elementName;
                        qualifiedName = getQualifiedElementName(expr.object) + '.' + getQualifiedElementName(expr.property);
                        break;
                    /* istanbul ignore next */ default:
                        break;
                }
                return qualifiedName;
            }
            var JSXParser = function(_super) {
                __extends(JSXParser, _super);
                function JSXParser(code, options, delegate) {
                    return _super.call(this, code, options, delegate) || this;
                }
                JSXParser.prototype.parsePrimaryExpression = function() {
                    return this.match('<') ? this.parseJSXRoot() : _super.prototype.parsePrimaryExpression.call(this);
                };
                JSXParser.prototype.startJSX = function() {
                    // Unwind the scanner before the lookahead token.
                    this.scanner.index = this.startMarker.index;
                    this.scanner.lineNumber = this.startMarker.line;
                    this.scanner.lineStart = this.startMarker.index - this.startMarker.column;
                };
                JSXParser.prototype.finishJSX = function() {
                    // Prime the next lookahead.
                    this.nextToken();
                };
                JSXParser.prototype.reenterJSX = function() {
                    this.startJSX();
                    this.expectJSX('}');
                    // Pop the closing '}' added from the lookahead.
                    if (this.config.tokens) this.tokens.pop();
                };
                JSXParser.prototype.createJSXNode = function() {
                    this.collectComments();
                    return {
                        index: this.scanner.index,
                        line: this.scanner.lineNumber,
                        column: this.scanner.index - this.scanner.lineStart
                    };
                };
                JSXParser.prototype.createJSXChildNode = function() {
                    return {
                        index: this.scanner.index,
                        line: this.scanner.lineNumber,
                        column: this.scanner.index - this.scanner.lineStart
                    };
                };
                JSXParser.prototype.scanXHTMLEntity = function(quote) {
                    var result = '&';
                    var valid = true;
                    var terminated = false;
                    var numeric = false;
                    var hex = false;
                    while(!this.scanner.eof() && valid && !terminated){
                        var ch = this.scanner.source[this.scanner.index];
                        if (ch === quote) break;
                        terminated = ch === ';';
                        result += ch;
                        ++this.scanner.index;
                        if (!terminated) switch(result.length){
                            case 2:
                                // e.g. '&#123;'
                                numeric = ch === '#';
                                break;
                            case 3:
                                if (numeric) {
                                    // e.g. '&#x41;'
                                    hex = ch === 'x';
                                    valid = hex || character_1.Character.isDecimalDigit(ch.charCodeAt(0));
                                    numeric = numeric && !hex;
                                }
                                break;
                            default:
                                valid = valid && !(numeric && !character_1.Character.isDecimalDigit(ch.charCodeAt(0)));
                                valid = valid && !(hex && !character_1.Character.isHexDigit(ch.charCodeAt(0)));
                                break;
                        }
                    }
                    if (valid && terminated && result.length > 2) {
                        // e.g. '&#x41;' becomes just '#x41'
                        var str = result.substr(1, result.length - 2);
                        if (numeric && str.length > 1) result = String.fromCharCode(parseInt(str.substr(1), 10));
                        else if (hex && str.length > 2) result = String.fromCharCode(parseInt('0' + str.substr(1), 16));
                        else if (!numeric && !hex && xhtml_entities_1.XHTMLEntities[str]) result = xhtml_entities_1.XHTMLEntities[str];
                    }
                    return result;
                };
                // Scan the next JSX token. This replaces Scanner#lex when in JSX mode.
                JSXParser.prototype.lexJSX = function() {
                    var cp = this.scanner.source.charCodeAt(this.scanner.index);
                    // < > / : = { }
                    if (cp === 60 || cp === 62 || cp === 47 || cp === 58 || cp === 61 || cp === 123 || cp === 125) {
                        var value = this.scanner.source[this.scanner.index++];
                        return {
                            type: 7 /* Punctuator */ ,
                            value: value,
                            lineNumber: this.scanner.lineNumber,
                            lineStart: this.scanner.lineStart,
                            start: this.scanner.index - 1,
                            end: this.scanner.index
                        };
                    }
                    // " '
                    if (cp === 34 || cp === 39) {
                        var start = this.scanner.index;
                        var quote = this.scanner.source[this.scanner.index++];
                        var str = '';
                        while(!this.scanner.eof()){
                            var ch = this.scanner.source[this.scanner.index++];
                            if (ch === quote) break;
                            else if (ch === '&') str += this.scanXHTMLEntity(quote);
                            else str += ch;
                        }
                        return {
                            type: 8 /* StringLiteral */ ,
                            value: str,
                            lineNumber: this.scanner.lineNumber,
                            lineStart: this.scanner.lineStart,
                            start: start,
                            end: this.scanner.index
                        };
                    }
                    // ... or .
                    if (cp === 46) {
                        var n1 = this.scanner.source.charCodeAt(this.scanner.index + 1);
                        var n2 = this.scanner.source.charCodeAt(this.scanner.index + 2);
                        var value = n1 === 46 && n2 === 46 ? '...' : '.';
                        var start = this.scanner.index;
                        this.scanner.index += value.length;
                        return {
                            type: 7 /* Punctuator */ ,
                            value: value,
                            lineNumber: this.scanner.lineNumber,
                            lineStart: this.scanner.lineStart,
                            start: start,
                            end: this.scanner.index
                        };
                    }
                    // `
                    if (cp === 96) // Only placeholder, since it will be rescanned as a real assignment expression.
                    return {
                        type: 10 /* Template */ ,
                        value: '',
                        lineNumber: this.scanner.lineNumber,
                        lineStart: this.scanner.lineStart,
                        start: this.scanner.index,
                        end: this.scanner.index
                    };
                    // Identifer can not contain backslash (char code 92).
                    if (character_1.Character.isIdentifierStart(cp) && cp !== 92) {
                        var start = this.scanner.index;
                        ++this.scanner.index;
                        while(!this.scanner.eof()){
                            var ch = this.scanner.source.charCodeAt(this.scanner.index);
                            if (character_1.Character.isIdentifierPart(ch) && ch !== 92) ++this.scanner.index;
                            else if (ch === 45) // Hyphen (char code 45) can be part of an identifier.
                            ++this.scanner.index;
                            else break;
                        }
                        var id = this.scanner.source.slice(start, this.scanner.index);
                        return {
                            type: 100 /* Identifier */ ,
                            value: id,
                            lineNumber: this.scanner.lineNumber,
                            lineStart: this.scanner.lineStart,
                            start: start,
                            end: this.scanner.index
                        };
                    }
                    return this.scanner.lex();
                };
                JSXParser.prototype.nextJSXToken = function() {
                    this.collectComments();
                    this.startMarker.index = this.scanner.index;
                    this.startMarker.line = this.scanner.lineNumber;
                    this.startMarker.column = this.scanner.index - this.scanner.lineStart;
                    var token = this.lexJSX();
                    this.lastMarker.index = this.scanner.index;
                    this.lastMarker.line = this.scanner.lineNumber;
                    this.lastMarker.column = this.scanner.index - this.scanner.lineStart;
                    if (this.config.tokens) this.tokens.push(this.convertToken(token));
                    return token;
                };
                JSXParser.prototype.nextJSXText = function() {
                    this.startMarker.index = this.scanner.index;
                    this.startMarker.line = this.scanner.lineNumber;
                    this.startMarker.column = this.scanner.index - this.scanner.lineStart;
                    var start = this.scanner.index;
                    var text = '';
                    while(!this.scanner.eof()){
                        var ch = this.scanner.source[this.scanner.index];
                        if (ch === '{' || ch === '<') break;
                        ++this.scanner.index;
                        text += ch;
                        if (character_1.Character.isLineTerminator(ch.charCodeAt(0))) {
                            ++this.scanner.lineNumber;
                            if (ch === '\r' && this.scanner.source[this.scanner.index] === '\n') ++this.scanner.index;
                            this.scanner.lineStart = this.scanner.index;
                        }
                    }
                    this.lastMarker.index = this.scanner.index;
                    this.lastMarker.line = this.scanner.lineNumber;
                    this.lastMarker.column = this.scanner.index - this.scanner.lineStart;
                    var token = {
                        type: 101 /* Text */ ,
                        value: text,
                        lineNumber: this.scanner.lineNumber,
                        lineStart: this.scanner.lineStart,
                        start: start,
                        end: this.scanner.index
                    };
                    if (text.length > 0 && this.config.tokens) this.tokens.push(this.convertToken(token));
                    return token;
                };
                JSXParser.prototype.peekJSXToken = function() {
                    var state = this.scanner.saveState();
                    this.scanner.scanComments();
                    var next = this.lexJSX();
                    this.scanner.restoreState(state);
                    return next;
                };
                // Expect the next JSX token to match the specified punctuator.
                // If not, an exception will be thrown.
                JSXParser.prototype.expectJSX = function(value) {
                    var token = this.nextJSXToken();
                    if (token.type !== 7 /* Punctuator */  || token.value !== value) this.throwUnexpectedToken(token);
                };
                // Return true if the next JSX token matches the specified punctuator.
                JSXParser.prototype.matchJSX = function(value) {
                    var next = this.peekJSXToken();
                    return next.type === 7 /* Punctuator */  && next.value === value;
                };
                JSXParser.prototype.parseJSXIdentifier = function() {
                    var node = this.createJSXNode();
                    var token = this.nextJSXToken();
                    if (token.type !== 100 /* Identifier */ ) this.throwUnexpectedToken(token);
                    return this.finalize(node, new JSXNode.JSXIdentifier(token.value));
                };
                JSXParser.prototype.parseJSXElementName = function() {
                    var node = this.createJSXNode();
                    var elementName = this.parseJSXIdentifier();
                    if (this.matchJSX(':')) {
                        var namespace = elementName;
                        this.expectJSX(':');
                        var name_1 = this.parseJSXIdentifier();
                        elementName = this.finalize(node, new JSXNode.JSXNamespacedName(namespace, name_1));
                    } else if (this.matchJSX('.')) while(this.matchJSX('.')){
                        var object = elementName;
                        this.expectJSX('.');
                        var property = this.parseJSXIdentifier();
                        elementName = this.finalize(node, new JSXNode.JSXMemberExpression(object, property));
                    }
                    return elementName;
                };
                JSXParser.prototype.parseJSXAttributeName = function() {
                    var node = this.createJSXNode();
                    var attributeName;
                    var identifier = this.parseJSXIdentifier();
                    if (this.matchJSX(':')) {
                        var namespace = identifier;
                        this.expectJSX(':');
                        var name_2 = this.parseJSXIdentifier();
                        attributeName = this.finalize(node, new JSXNode.JSXNamespacedName(namespace, name_2));
                    } else attributeName = identifier;
                    return attributeName;
                };
                JSXParser.prototype.parseJSXStringLiteralAttribute = function() {
                    var node = this.createJSXNode();
                    var token = this.nextJSXToken();
                    if (token.type !== 8 /* StringLiteral */ ) this.throwUnexpectedToken(token);
                    var raw = this.getTokenRaw(token);
                    return this.finalize(node, new Node.Literal(token.value, raw));
                };
                JSXParser.prototype.parseJSXExpressionAttribute = function() {
                    var node = this.createJSXNode();
                    this.expectJSX('{');
                    this.finishJSX();
                    if (this.match('}')) this.tolerateError('JSX attributes must only be assigned a non-empty expression');
                    var expression = this.parseAssignmentExpression();
                    this.reenterJSX();
                    return this.finalize(node, new JSXNode.JSXExpressionContainer(expression));
                };
                JSXParser.prototype.parseJSXAttributeValue = function() {
                    return this.matchJSX('{') ? this.parseJSXExpressionAttribute() : this.matchJSX('<') ? this.parseJSXElement() : this.parseJSXStringLiteralAttribute();
                };
                JSXParser.prototype.parseJSXNameValueAttribute = function() {
                    var node = this.createJSXNode();
                    var name = this.parseJSXAttributeName();
                    var value = null;
                    if (this.matchJSX('=')) {
                        this.expectJSX('=');
                        value = this.parseJSXAttributeValue();
                    }
                    return this.finalize(node, new JSXNode.JSXAttribute(name, value));
                };
                JSXParser.prototype.parseJSXSpreadAttribute = function() {
                    var node = this.createJSXNode();
                    this.expectJSX('{');
                    this.expectJSX('...');
                    this.finishJSX();
                    var argument = this.parseAssignmentExpression();
                    this.reenterJSX();
                    return this.finalize(node, new JSXNode.JSXSpreadAttribute(argument));
                };
                JSXParser.prototype.parseJSXAttributes = function() {
                    var attributes = [];
                    while(!this.matchJSX('/') && !this.matchJSX('>')){
                        var attribute = this.matchJSX('{') ? this.parseJSXSpreadAttribute() : this.parseJSXNameValueAttribute();
                        attributes.push(attribute);
                    }
                    return attributes;
                };
                JSXParser.prototype.parseJSXOpeningElement = function() {
                    var node = this.createJSXNode();
                    this.expectJSX('<');
                    var name = this.parseJSXElementName();
                    var attributes = this.parseJSXAttributes();
                    var selfClosing = this.matchJSX('/');
                    if (selfClosing) this.expectJSX('/');
                    this.expectJSX('>');
                    return this.finalize(node, new JSXNode.JSXOpeningElement(name, selfClosing, attributes));
                };
                JSXParser.prototype.parseJSXBoundaryElement = function() {
                    var node = this.createJSXNode();
                    this.expectJSX('<');
                    if (this.matchJSX('/')) {
                        this.expectJSX('/');
                        var name_3 = this.parseJSXElementName();
                        this.expectJSX('>');
                        return this.finalize(node, new JSXNode.JSXClosingElement(name_3));
                    }
                    var name = this.parseJSXElementName();
                    var attributes = this.parseJSXAttributes();
                    var selfClosing = this.matchJSX('/');
                    if (selfClosing) this.expectJSX('/');
                    this.expectJSX('>');
                    return this.finalize(node, new JSXNode.JSXOpeningElement(name, selfClosing, attributes));
                };
                JSXParser.prototype.parseJSXEmptyExpression = function() {
                    var node = this.createJSXChildNode();
                    this.collectComments();
                    this.lastMarker.index = this.scanner.index;
                    this.lastMarker.line = this.scanner.lineNumber;
                    this.lastMarker.column = this.scanner.index - this.scanner.lineStart;
                    return this.finalize(node, new JSXNode.JSXEmptyExpression());
                };
                JSXParser.prototype.parseJSXExpressionContainer = function() {
                    var node = this.createJSXNode();
                    this.expectJSX('{');
                    var expression;
                    if (this.matchJSX('}')) {
                        expression = this.parseJSXEmptyExpression();
                        this.expectJSX('}');
                    } else {
                        this.finishJSX();
                        expression = this.parseAssignmentExpression();
                        this.reenterJSX();
                    }
                    return this.finalize(node, new JSXNode.JSXExpressionContainer(expression));
                };
                JSXParser.prototype.parseJSXChildren = function() {
                    var children = [];
                    while(!this.scanner.eof()){
                        var node = this.createJSXChildNode();
                        var token = this.nextJSXText();
                        if (token.start < token.end) {
                            var raw = this.getTokenRaw(token);
                            var child = this.finalize(node, new JSXNode.JSXText(token.value, raw));
                            children.push(child);
                        }
                        if (this.scanner.source[this.scanner.index] === '{') {
                            var container = this.parseJSXExpressionContainer();
                            children.push(container);
                        } else break;
                    }
                    return children;
                };
                JSXParser.prototype.parseComplexJSXElement = function(el) {
                    var stack = [];
                    while(!this.scanner.eof()){
                        el.children = el.children.concat(this.parseJSXChildren());
                        var node = this.createJSXChildNode();
                        var element = this.parseJSXBoundaryElement();
                        if (element.type === jsx_syntax_1.JSXSyntax.JSXOpeningElement) {
                            var opening = element;
                            if (opening.selfClosing) {
                                var child = this.finalize(node, new JSXNode.JSXElement(opening, [], null));
                                el.children.push(child);
                            } else {
                                stack.push(el);
                                el = {
                                    node: node,
                                    opening: opening,
                                    closing: null,
                                    children: []
                                };
                            }
                        }
                        if (element.type === jsx_syntax_1.JSXSyntax.JSXClosingElement) {
                            el.closing = element;
                            var open_1 = getQualifiedElementName(el.opening.name);
                            var close_1 = getQualifiedElementName(el.closing.name);
                            if (open_1 !== close_1) this.tolerateError('Expected corresponding JSX closing tag for %0', open_1);
                            if (stack.length > 0) {
                                var child = this.finalize(el.node, new JSXNode.JSXElement(el.opening, el.children, el.closing));
                                el = stack[stack.length - 1];
                                el.children.push(child);
                                stack.pop();
                            } else break;
                        }
                    }
                    return el;
                };
                JSXParser.prototype.parseJSXElement = function() {
                    var node = this.createJSXNode();
                    var opening = this.parseJSXOpeningElement();
                    var children = [];
                    var closing = null;
                    if (!opening.selfClosing) {
                        var el = this.parseComplexJSXElement({
                            node: node,
                            opening: opening,
                            closing: closing,
                            children: children
                        });
                        children = el.children;
                        closing = el.closing;
                    }
                    return this.finalize(node, new JSXNode.JSXElement(opening, children, closing));
                };
                JSXParser.prototype.parseJSXRoot = function() {
                    // Pop the opening '<' added from the lookahead.
                    if (this.config.tokens) this.tokens.pop();
                    this.startJSX();
                    var element = this.parseJSXElement();
                    this.finishJSX();
                    return element;
                };
                JSXParser.prototype.isStartOfExpression = function() {
                    return _super.prototype.isStartOfExpression.call(this) || this.match('<');
                };
                return JSXParser;
            }(parser_1.Parser);
            exports.JSXParser = JSXParser;
        /***/ },
        /* 4 */ /***/ function(module1, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            // See also tools/generate-unicode-regex.js.
            var Regex = {
                // Unicode v8.0.0 NonAsciiIdentifierStart:
                NonAsciiIdentifierStart: /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AD\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDF00-\uDF19]|\uD806[\uDCA0-\uDCDF\uDCFF\uDEC0-\uDEF8]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1]|\uD87E[\uDC00-\uDE1D]/,
                // Unicode v8.0.0 NonAsciiIdentifierPart:
                NonAsciiIdentifierPart: /[\xAA\xB5\xB7\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B4\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D5F-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1369-\u1371\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AD\uA7B0-\uA7B7\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDCA-\uDDCC\uDDD0-\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE37\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF50\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDDD8-\uDDDD\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB7\uDEC0-\uDEC9\uDF00-\uDF19\uDF1D-\uDF2B\uDF30-\uDF39]|\uD806[\uDCA0-\uDCE9\uDCFF\uDEC0-\uDEF8]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF]/
            };
            exports.Character = {
                /* tslint:disable:no-bitwise */ fromCodePoint: function(cp) {
                    return cp < 0x10000 ? String.fromCharCode(cp) : String.fromCharCode(0xD800 + (cp - 0x10000 >> 10)) + String.fromCharCode(0xDC00 + (cp - 0x10000 & 1023));
                },
                // https://tc39.github.io/ecma262/#sec-white-space
                isWhiteSpace: function(cp) {
                    return cp === 0x20 || cp === 0x09 || cp === 0x0B || cp === 0x0C || cp === 0xA0 || cp >= 0x1680 && [
                        0x1680,
                        0x2000,
                        0x2001,
                        0x2002,
                        0x2003,
                        0x2004,
                        0x2005,
                        0x2006,
                        0x2007,
                        0x2008,
                        0x2009,
                        0x200A,
                        0x202F,
                        0x205F,
                        0x3000,
                        0xFEFF
                    ].indexOf(cp) >= 0;
                },
                // https://tc39.github.io/ecma262/#sec-line-terminators
                isLineTerminator: function(cp) {
                    return cp === 0x0A || cp === 0x0D || cp === 0x2028 || cp === 0x2029;
                },
                // https://tc39.github.io/ecma262/#sec-names-and-keywords
                isIdentifierStart: function(cp) {
                    return cp === 0x24 || cp === 0x5F || cp >= 0x41 && cp <= 0x5A || cp >= 0x61 && cp <= 0x7A || cp === 0x5C || cp >= 0x80 && Regex.NonAsciiIdentifierStart.test(exports.Character.fromCodePoint(cp));
                },
                isIdentifierPart: function(cp) {
                    return cp === 0x24 || cp === 0x5F || cp >= 0x41 && cp <= 0x5A || cp >= 0x61 && cp <= 0x7A || cp >= 0x30 && cp <= 0x39 || cp === 0x5C || cp >= 0x80 && Regex.NonAsciiIdentifierPart.test(exports.Character.fromCodePoint(cp));
                },
                // https://tc39.github.io/ecma262/#sec-literals-numeric-literals
                isDecimalDigit: function(cp) {
                    return cp >= 0x30 && cp <= 0x39; // 0..9
                },
                isHexDigit: function(cp) {
                    return cp >= 0x30 && cp <= 0x39 || cp >= 0x41 && cp <= 0x46 || cp >= 0x61 && cp <= 0x66; // a..f
                },
                isOctalDigit: function(cp) {
                    return cp >= 0x30 && cp <= 0x37; // 0..7
                }
            };
        /***/ },
        /* 5 */ /***/ function(module1, exports, __webpack_require__) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var jsx_syntax_1 = __webpack_require__(6);
            /* tslint:disable:max-classes-per-file */ var JSXClosingElement = function() {
                function JSXClosingElement(name) {
                    this.type = jsx_syntax_1.JSXSyntax.JSXClosingElement;
                    this.name = name;
                }
                return JSXClosingElement;
            }();
            exports.JSXClosingElement = JSXClosingElement;
            var JSXElement = function() {
                function JSXElement(openingElement, children, closingElement) {
                    this.type = jsx_syntax_1.JSXSyntax.JSXElement;
                    this.openingElement = openingElement;
                    this.children = children;
                    this.closingElement = closingElement;
                }
                return JSXElement;
            }();
            exports.JSXElement = JSXElement;
            var JSXEmptyExpression = function() {
                function JSXEmptyExpression() {
                    this.type = jsx_syntax_1.JSXSyntax.JSXEmptyExpression;
                }
                return JSXEmptyExpression;
            }();
            exports.JSXEmptyExpression = JSXEmptyExpression;
            var JSXExpressionContainer = function() {
                function JSXExpressionContainer(expression) {
                    this.type = jsx_syntax_1.JSXSyntax.JSXExpressionContainer;
                    this.expression = expression;
                }
                return JSXExpressionContainer;
            }();
            exports.JSXExpressionContainer = JSXExpressionContainer;
            var JSXIdentifier = function() {
                function JSXIdentifier(name) {
                    this.type = jsx_syntax_1.JSXSyntax.JSXIdentifier;
                    this.name = name;
                }
                return JSXIdentifier;
            }();
            exports.JSXIdentifier = JSXIdentifier;
            var JSXMemberExpression = function() {
                function JSXMemberExpression(object, property) {
                    this.type = jsx_syntax_1.JSXSyntax.JSXMemberExpression;
                    this.object = object;
                    this.property = property;
                }
                return JSXMemberExpression;
            }();
            exports.JSXMemberExpression = JSXMemberExpression;
            var JSXAttribute = function() {
                function JSXAttribute(name, value) {
                    this.type = jsx_syntax_1.JSXSyntax.JSXAttribute;
                    this.name = name;
                    this.value = value;
                }
                return JSXAttribute;
            }();
            exports.JSXAttribute = JSXAttribute;
            var JSXNamespacedName = function() {
                function JSXNamespacedName(namespace, name) {
                    this.type = jsx_syntax_1.JSXSyntax.JSXNamespacedName;
                    this.namespace = namespace;
                    this.name = name;
                }
                return JSXNamespacedName;
            }();
            exports.JSXNamespacedName = JSXNamespacedName;
            var JSXOpeningElement = function() {
                function JSXOpeningElement(name, selfClosing, attributes) {
                    this.type = jsx_syntax_1.JSXSyntax.JSXOpeningElement;
                    this.name = name;
                    this.selfClosing = selfClosing;
                    this.attributes = attributes;
                }
                return JSXOpeningElement;
            }();
            exports.JSXOpeningElement = JSXOpeningElement;
            var JSXSpreadAttribute = function() {
                function JSXSpreadAttribute(argument) {
                    this.type = jsx_syntax_1.JSXSyntax.JSXSpreadAttribute;
                    this.argument = argument;
                }
                return JSXSpreadAttribute;
            }();
            exports.JSXSpreadAttribute = JSXSpreadAttribute;
            var JSXText = function() {
                function JSXText(value, raw) {
                    this.type = jsx_syntax_1.JSXSyntax.JSXText;
                    this.value = value;
                    this.raw = raw;
                }
                return JSXText;
            }();
            exports.JSXText = JSXText;
        /***/ },
        /* 6 */ /***/ function(module1, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            exports.JSXSyntax = {
                JSXAttribute: 'JSXAttribute',
                JSXClosingElement: 'JSXClosingElement',
                JSXElement: 'JSXElement',
                JSXEmptyExpression: 'JSXEmptyExpression',
                JSXExpressionContainer: 'JSXExpressionContainer',
                JSXIdentifier: 'JSXIdentifier',
                JSXMemberExpression: 'JSXMemberExpression',
                JSXNamespacedName: 'JSXNamespacedName',
                JSXOpeningElement: 'JSXOpeningElement',
                JSXSpreadAttribute: 'JSXSpreadAttribute',
                JSXText: 'JSXText'
            };
        /***/ },
        /* 7 */ /***/ function(module1, exports, __webpack_require__) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var syntax_1 = __webpack_require__(2);
            /* tslint:disable:max-classes-per-file */ var ArrayExpression = function() {
                function ArrayExpression(elements) {
                    this.type = syntax_1.Syntax.ArrayExpression;
                    this.elements = elements;
                }
                return ArrayExpression;
            }();
            exports.ArrayExpression = ArrayExpression;
            var ArrayPattern = function() {
                function ArrayPattern(elements) {
                    this.type = syntax_1.Syntax.ArrayPattern;
                    this.elements = elements;
                }
                return ArrayPattern;
            }();
            exports.ArrayPattern = ArrayPattern;
            var ArrowFunctionExpression = function() {
                function ArrowFunctionExpression(params, body, expression) {
                    this.type = syntax_1.Syntax.ArrowFunctionExpression;
                    this.id = null;
                    this.params = params;
                    this.body = body;
                    this.generator = false;
                    this.expression = expression;
                    this.async = false;
                }
                return ArrowFunctionExpression;
            }();
            exports.ArrowFunctionExpression = ArrowFunctionExpression;
            var AssignmentExpression = function() {
                function AssignmentExpression(operator, left, right) {
                    this.type = syntax_1.Syntax.AssignmentExpression;
                    this.operator = operator;
                    this.left = left;
                    this.right = right;
                }
                return AssignmentExpression;
            }();
            exports.AssignmentExpression = AssignmentExpression;
            var AssignmentPattern = function() {
                function AssignmentPattern(left, right) {
                    this.type = syntax_1.Syntax.AssignmentPattern;
                    this.left = left;
                    this.right = right;
                }
                return AssignmentPattern;
            }();
            exports.AssignmentPattern = AssignmentPattern;
            var AsyncArrowFunctionExpression = function() {
                function AsyncArrowFunctionExpression(params, body, expression) {
                    this.type = syntax_1.Syntax.ArrowFunctionExpression;
                    this.id = null;
                    this.params = params;
                    this.body = body;
                    this.generator = false;
                    this.expression = expression;
                    this.async = true;
                }
                return AsyncArrowFunctionExpression;
            }();
            exports.AsyncArrowFunctionExpression = AsyncArrowFunctionExpression;
            var AsyncFunctionDeclaration = function() {
                function AsyncFunctionDeclaration(id, params, body) {
                    this.type = syntax_1.Syntax.FunctionDeclaration;
                    this.id = id;
                    this.params = params;
                    this.body = body;
                    this.generator = false;
                    this.expression = false;
                    this.async = true;
                }
                return AsyncFunctionDeclaration;
            }();
            exports.AsyncFunctionDeclaration = AsyncFunctionDeclaration;
            var AsyncFunctionExpression = function() {
                function AsyncFunctionExpression(id, params, body) {
                    this.type = syntax_1.Syntax.FunctionExpression;
                    this.id = id;
                    this.params = params;
                    this.body = body;
                    this.generator = false;
                    this.expression = false;
                    this.async = true;
                }
                return AsyncFunctionExpression;
            }();
            exports.AsyncFunctionExpression = AsyncFunctionExpression;
            var AwaitExpression = function() {
                function AwaitExpression(argument) {
                    this.type = syntax_1.Syntax.AwaitExpression;
                    this.argument = argument;
                }
                return AwaitExpression;
            }();
            exports.AwaitExpression = AwaitExpression;
            var BinaryExpression = function() {
                function BinaryExpression(operator, left, right) {
                    var logical = operator === '||' || operator === '&&';
                    this.type = logical ? syntax_1.Syntax.LogicalExpression : syntax_1.Syntax.BinaryExpression;
                    this.operator = operator;
                    this.left = left;
                    this.right = right;
                }
                return BinaryExpression;
            }();
            exports.BinaryExpression = BinaryExpression;
            var BlockStatement = function() {
                function BlockStatement(body) {
                    this.type = syntax_1.Syntax.BlockStatement;
                    this.body = body;
                }
                return BlockStatement;
            }();
            exports.BlockStatement = BlockStatement;
            var BreakStatement = function() {
                function BreakStatement(label) {
                    this.type = syntax_1.Syntax.BreakStatement;
                    this.label = label;
                }
                return BreakStatement;
            }();
            exports.BreakStatement = BreakStatement;
            var CallExpression = function() {
                function CallExpression(callee, args) {
                    this.type = syntax_1.Syntax.CallExpression;
                    this.callee = callee;
                    this.arguments = args;
                }
                return CallExpression;
            }();
            exports.CallExpression = CallExpression;
            var CatchClause = function() {
                function CatchClause(param, body) {
                    this.type = syntax_1.Syntax.CatchClause;
                    this.param = param;
                    this.body = body;
                }
                return CatchClause;
            }();
            exports.CatchClause = CatchClause;
            var ClassBody = function() {
                function ClassBody(body) {
                    this.type = syntax_1.Syntax.ClassBody;
                    this.body = body;
                }
                return ClassBody;
            }();
            exports.ClassBody = ClassBody;
            var ClassDeclaration = function() {
                function ClassDeclaration(id, superClass, body) {
                    this.type = syntax_1.Syntax.ClassDeclaration;
                    this.id = id;
                    this.superClass = superClass;
                    this.body = body;
                }
                return ClassDeclaration;
            }();
            exports.ClassDeclaration = ClassDeclaration;
            var ClassExpression = function() {
                function ClassExpression(id, superClass, body) {
                    this.type = syntax_1.Syntax.ClassExpression;
                    this.id = id;
                    this.superClass = superClass;
                    this.body = body;
                }
                return ClassExpression;
            }();
            exports.ClassExpression = ClassExpression;
            var ComputedMemberExpression = function() {
                function ComputedMemberExpression(object, property) {
                    this.type = syntax_1.Syntax.MemberExpression;
                    this.computed = true;
                    this.object = object;
                    this.property = property;
                }
                return ComputedMemberExpression;
            }();
            exports.ComputedMemberExpression = ComputedMemberExpression;
            var ConditionalExpression = function() {
                function ConditionalExpression(test, consequent, alternate) {
                    this.type = syntax_1.Syntax.ConditionalExpression;
                    this.test = test;
                    this.consequent = consequent;
                    this.alternate = alternate;
                }
                return ConditionalExpression;
            }();
            exports.ConditionalExpression = ConditionalExpression;
            var ContinueStatement = function() {
                function ContinueStatement(label) {
                    this.type = syntax_1.Syntax.ContinueStatement;
                    this.label = label;
                }
                return ContinueStatement;
            }();
            exports.ContinueStatement = ContinueStatement;
            var DebuggerStatement = function() {
                function DebuggerStatement() {
                    this.type = syntax_1.Syntax.DebuggerStatement;
                }
                return DebuggerStatement;
            }();
            exports.DebuggerStatement = DebuggerStatement;
            var Directive = function() {
                function Directive(expression, directive) {
                    this.type = syntax_1.Syntax.ExpressionStatement;
                    this.expression = expression;
                    this.directive = directive;
                }
                return Directive;
            }();
            exports.Directive = Directive;
            var DoWhileStatement = function() {
                function DoWhileStatement(body, test) {
                    this.type = syntax_1.Syntax.DoWhileStatement;
                    this.body = body;
                    this.test = test;
                }
                return DoWhileStatement;
            }();
            exports.DoWhileStatement = DoWhileStatement;
            var EmptyStatement = function() {
                function EmptyStatement() {
                    this.type = syntax_1.Syntax.EmptyStatement;
                }
                return EmptyStatement;
            }();
            exports.EmptyStatement = EmptyStatement;
            var ExportAllDeclaration = function() {
                function ExportAllDeclaration(source) {
                    this.type = syntax_1.Syntax.ExportAllDeclaration;
                    this.source = source;
                }
                return ExportAllDeclaration;
            }();
            exports.ExportAllDeclaration = ExportAllDeclaration;
            var ExportDefaultDeclaration = function() {
                function ExportDefaultDeclaration(declaration) {
                    this.type = syntax_1.Syntax.ExportDefaultDeclaration;
                    this.declaration = declaration;
                }
                return ExportDefaultDeclaration;
            }();
            exports.ExportDefaultDeclaration = ExportDefaultDeclaration;
            var ExportNamedDeclaration = function() {
                function ExportNamedDeclaration(declaration, specifiers, source) {
                    this.type = syntax_1.Syntax.ExportNamedDeclaration;
                    this.declaration = declaration;
                    this.specifiers = specifiers;
                    this.source = source;
                }
                return ExportNamedDeclaration;
            }();
            exports.ExportNamedDeclaration = ExportNamedDeclaration;
            var ExportSpecifier = function() {
                function ExportSpecifier(local, exported) {
                    this.type = syntax_1.Syntax.ExportSpecifier;
                    this.exported = exported;
                    this.local = local;
                }
                return ExportSpecifier;
            }();
            exports.ExportSpecifier = ExportSpecifier;
            var ExpressionStatement = function() {
                function ExpressionStatement(expression) {
                    this.type = syntax_1.Syntax.ExpressionStatement;
                    this.expression = expression;
                }
                return ExpressionStatement;
            }();
            exports.ExpressionStatement = ExpressionStatement;
            var ForInStatement = function() {
                function ForInStatement(left, right, body) {
                    this.type = syntax_1.Syntax.ForInStatement;
                    this.left = left;
                    this.right = right;
                    this.body = body;
                    this.each = false;
                }
                return ForInStatement;
            }();
            exports.ForInStatement = ForInStatement;
            var ForOfStatement = function() {
                function ForOfStatement(left, right, body) {
                    this.type = syntax_1.Syntax.ForOfStatement;
                    this.left = left;
                    this.right = right;
                    this.body = body;
                }
                return ForOfStatement;
            }();
            exports.ForOfStatement = ForOfStatement;
            var ForStatement = function() {
                function ForStatement(init, test, update, body) {
                    this.type = syntax_1.Syntax.ForStatement;
                    this.init = init;
                    this.test = test;
                    this.update = update;
                    this.body = body;
                }
                return ForStatement;
            }();
            exports.ForStatement = ForStatement;
            var FunctionDeclaration = function() {
                function FunctionDeclaration(id, params, body, generator) {
                    this.type = syntax_1.Syntax.FunctionDeclaration;
                    this.id = id;
                    this.params = params;
                    this.body = body;
                    this.generator = generator;
                    this.expression = false;
                    this.async = false;
                }
                return FunctionDeclaration;
            }();
            exports.FunctionDeclaration = FunctionDeclaration;
            var FunctionExpression = function() {
                function FunctionExpression(id, params, body, generator) {
                    this.type = syntax_1.Syntax.FunctionExpression;
                    this.id = id;
                    this.params = params;
                    this.body = body;
                    this.generator = generator;
                    this.expression = false;
                    this.async = false;
                }
                return FunctionExpression;
            }();
            exports.FunctionExpression = FunctionExpression;
            var Identifier = function() {
                function Identifier(name) {
                    this.type = syntax_1.Syntax.Identifier;
                    this.name = name;
                }
                return Identifier;
            }();
            exports.Identifier = Identifier;
            var IfStatement = function() {
                function IfStatement(test, consequent, alternate) {
                    this.type = syntax_1.Syntax.IfStatement;
                    this.test = test;
                    this.consequent = consequent;
                    this.alternate = alternate;
                }
                return IfStatement;
            }();
            exports.IfStatement = IfStatement;
            var ImportDeclaration = function() {
                function ImportDeclaration(specifiers, source) {
                    this.type = syntax_1.Syntax.ImportDeclaration;
                    this.specifiers = specifiers;
                    this.source = source;
                }
                return ImportDeclaration;
            }();
            exports.ImportDeclaration = ImportDeclaration;
            var ImportDefaultSpecifier = function() {
                function ImportDefaultSpecifier(local) {
                    this.type = syntax_1.Syntax.ImportDefaultSpecifier;
                    this.local = local;
                }
                return ImportDefaultSpecifier;
            }();
            exports.ImportDefaultSpecifier = ImportDefaultSpecifier;
            var ImportNamespaceSpecifier = function() {
                function ImportNamespaceSpecifier(local) {
                    this.type = syntax_1.Syntax.ImportNamespaceSpecifier;
                    this.local = local;
                }
                return ImportNamespaceSpecifier;
            }();
            exports.ImportNamespaceSpecifier = ImportNamespaceSpecifier;
            var ImportSpecifier = function() {
                function ImportSpecifier(local, imported) {
                    this.type = syntax_1.Syntax.ImportSpecifier;
                    this.local = local;
                    this.imported = imported;
                }
                return ImportSpecifier;
            }();
            exports.ImportSpecifier = ImportSpecifier;
            var LabeledStatement = function() {
                function LabeledStatement(label, body) {
                    this.type = syntax_1.Syntax.LabeledStatement;
                    this.label = label;
                    this.body = body;
                }
                return LabeledStatement;
            }();
            exports.LabeledStatement = LabeledStatement;
            var Literal = function() {
                function Literal(value, raw) {
                    this.type = syntax_1.Syntax.Literal;
                    this.value = value;
                    this.raw = raw;
                }
                return Literal;
            }();
            exports.Literal = Literal;
            var MetaProperty = function() {
                function MetaProperty(meta, property) {
                    this.type = syntax_1.Syntax.MetaProperty;
                    this.meta = meta;
                    this.property = property;
                }
                return MetaProperty;
            }();
            exports.MetaProperty = MetaProperty;
            var MethodDefinition = function() {
                function MethodDefinition(key, computed, value, kind, isStatic) {
                    this.type = syntax_1.Syntax.MethodDefinition;
                    this.key = key;
                    this.computed = computed;
                    this.value = value;
                    this.kind = kind;
                    this.static = isStatic;
                }
                return MethodDefinition;
            }();
            exports.MethodDefinition = MethodDefinition;
            var Module = function() {
                function Module(body) {
                    this.type = syntax_1.Syntax.Program;
                    this.body = body;
                    this.sourceType = 'module';
                }
                return Module;
            }();
            exports.Module = Module;
            var NewExpression = function() {
                function NewExpression(callee, args) {
                    this.type = syntax_1.Syntax.NewExpression;
                    this.callee = callee;
                    this.arguments = args;
                }
                return NewExpression;
            }();
            exports.NewExpression = NewExpression;
            var ObjectExpression = function() {
                function ObjectExpression(properties) {
                    this.type = syntax_1.Syntax.ObjectExpression;
                    this.properties = properties;
                }
                return ObjectExpression;
            }();
            exports.ObjectExpression = ObjectExpression;
            var ObjectPattern = function() {
                function ObjectPattern(properties) {
                    this.type = syntax_1.Syntax.ObjectPattern;
                    this.properties = properties;
                }
                return ObjectPattern;
            }();
            exports.ObjectPattern = ObjectPattern;
            var Property = function() {
                function Property(kind, key, computed, value, method, shorthand) {
                    this.type = syntax_1.Syntax.Property;
                    this.key = key;
                    this.computed = computed;
                    this.value = value;
                    this.kind = kind;
                    this.method = method;
                    this.shorthand = shorthand;
                }
                return Property;
            }();
            exports.Property = Property;
            var RegexLiteral = function() {
                function RegexLiteral(value, raw, pattern, flags) {
                    this.type = syntax_1.Syntax.Literal;
                    this.value = value;
                    this.raw = raw;
                    this.regex = {
                        pattern: pattern,
                        flags: flags
                    };
                }
                return RegexLiteral;
            }();
            exports.RegexLiteral = RegexLiteral;
            var RestElement = function() {
                function RestElement(argument) {
                    this.type = syntax_1.Syntax.RestElement;
                    this.argument = argument;
                }
                return RestElement;
            }();
            exports.RestElement = RestElement;
            var ReturnStatement = function() {
                function ReturnStatement(argument) {
                    this.type = syntax_1.Syntax.ReturnStatement;
                    this.argument = argument;
                }
                return ReturnStatement;
            }();
            exports.ReturnStatement = ReturnStatement;
            var Script = function() {
                function Script(body) {
                    this.type = syntax_1.Syntax.Program;
                    this.body = body;
                    this.sourceType = 'script';
                }
                return Script;
            }();
            exports.Script = Script;
            var SequenceExpression = function() {
                function SequenceExpression(expressions) {
                    this.type = syntax_1.Syntax.SequenceExpression;
                    this.expressions = expressions;
                }
                return SequenceExpression;
            }();
            exports.SequenceExpression = SequenceExpression;
            var SpreadElement = function() {
                function SpreadElement(argument) {
                    this.type = syntax_1.Syntax.SpreadElement;
                    this.argument = argument;
                }
                return SpreadElement;
            }();
            exports.SpreadElement = SpreadElement;
            var StaticMemberExpression = function() {
                function StaticMemberExpression(object, property) {
                    this.type = syntax_1.Syntax.MemberExpression;
                    this.computed = false;
                    this.object = object;
                    this.property = property;
                }
                return StaticMemberExpression;
            }();
            exports.StaticMemberExpression = StaticMemberExpression;
            var Super = function() {
                function Super() {
                    this.type = syntax_1.Syntax.Super;
                }
                return Super;
            }();
            exports.Super = Super;
            var SwitchCase = function() {
                function SwitchCase(test, consequent) {
                    this.type = syntax_1.Syntax.SwitchCase;
                    this.test = test;
                    this.consequent = consequent;
                }
                return SwitchCase;
            }();
            exports.SwitchCase = SwitchCase;
            var SwitchStatement = function() {
                function SwitchStatement(discriminant, cases) {
                    this.type = syntax_1.Syntax.SwitchStatement;
                    this.discriminant = discriminant;
                    this.cases = cases;
                }
                return SwitchStatement;
            }();
            exports.SwitchStatement = SwitchStatement;
            var TaggedTemplateExpression = function() {
                function TaggedTemplateExpression(tag, quasi) {
                    this.type = syntax_1.Syntax.TaggedTemplateExpression;
                    this.tag = tag;
                    this.quasi = quasi;
                }
                return TaggedTemplateExpression;
            }();
            exports.TaggedTemplateExpression = TaggedTemplateExpression;
            var TemplateElement = function() {
                function TemplateElement(value, tail) {
                    this.type = syntax_1.Syntax.TemplateElement;
                    this.value = value;
                    this.tail = tail;
                }
                return TemplateElement;
            }();
            exports.TemplateElement = TemplateElement;
            var TemplateLiteral = function() {
                function TemplateLiteral(quasis, expressions) {
                    this.type = syntax_1.Syntax.TemplateLiteral;
                    this.quasis = quasis;
                    this.expressions = expressions;
                }
                return TemplateLiteral;
            }();
            exports.TemplateLiteral = TemplateLiteral;
            var ThisExpression = function() {
                function ThisExpression() {
                    this.type = syntax_1.Syntax.ThisExpression;
                }
                return ThisExpression;
            }();
            exports.ThisExpression = ThisExpression;
            var ThrowStatement = function() {
                function ThrowStatement(argument) {
                    this.type = syntax_1.Syntax.ThrowStatement;
                    this.argument = argument;
                }
                return ThrowStatement;
            }();
            exports.ThrowStatement = ThrowStatement;
            var TryStatement = function() {
                function TryStatement(block, handler, finalizer) {
                    this.type = syntax_1.Syntax.TryStatement;
                    this.block = block;
                    this.handler = handler;
                    this.finalizer = finalizer;
                }
                return TryStatement;
            }();
            exports.TryStatement = TryStatement;
            var UnaryExpression = function() {
                function UnaryExpression(operator, argument) {
                    this.type = syntax_1.Syntax.UnaryExpression;
                    this.operator = operator;
                    this.argument = argument;
                    this.prefix = true;
                }
                return UnaryExpression;
            }();
            exports.UnaryExpression = UnaryExpression;
            var UpdateExpression = function() {
                function UpdateExpression(operator, argument, prefix) {
                    this.type = syntax_1.Syntax.UpdateExpression;
                    this.operator = operator;
                    this.argument = argument;
                    this.prefix = prefix;
                }
                return UpdateExpression;
            }();
            exports.UpdateExpression = UpdateExpression;
            var VariableDeclaration = function() {
                function VariableDeclaration(declarations, kind) {
                    this.type = syntax_1.Syntax.VariableDeclaration;
                    this.declarations = declarations;
                    this.kind = kind;
                }
                return VariableDeclaration;
            }();
            exports.VariableDeclaration = VariableDeclaration;
            var VariableDeclarator = function() {
                function VariableDeclarator(id, init) {
                    this.type = syntax_1.Syntax.VariableDeclarator;
                    this.id = id;
                    this.init = init;
                }
                return VariableDeclarator;
            }();
            exports.VariableDeclarator = VariableDeclarator;
            var WhileStatement = function() {
                function WhileStatement(test, body) {
                    this.type = syntax_1.Syntax.WhileStatement;
                    this.test = test;
                    this.body = body;
                }
                return WhileStatement;
            }();
            exports.WhileStatement = WhileStatement;
            var WithStatement = function() {
                function WithStatement(object, body) {
                    this.type = syntax_1.Syntax.WithStatement;
                    this.object = object;
                    this.body = body;
                }
                return WithStatement;
            }();
            exports.WithStatement = WithStatement;
            var YieldExpression = function() {
                function YieldExpression(argument, delegate) {
                    this.type = syntax_1.Syntax.YieldExpression;
                    this.argument = argument;
                    this.delegate = delegate;
                }
                return YieldExpression;
            }();
            exports.YieldExpression = YieldExpression;
        /***/ },
        /* 8 */ /***/ function(module1, exports, __webpack_require__) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var assert_1 = __webpack_require__(9);
            var error_handler_1 = __webpack_require__(10);
            var messages_1 = __webpack_require__(11);
            var Node = __webpack_require__(7);
            var scanner_1 = __webpack_require__(12);
            var syntax_1 = __webpack_require__(2);
            var token_1 = __webpack_require__(13);
            var ArrowParameterPlaceHolder = 'ArrowParameterPlaceHolder';
            var Parser = function() {
                function Parser(code, options, delegate) {
                    if (options === void 0) options = {};
                    this.config = {
                        range: typeof options.range === 'boolean' && options.range,
                        loc: typeof options.loc === 'boolean' && options.loc,
                        source: null,
                        tokens: typeof options.tokens === 'boolean' && options.tokens,
                        comment: typeof options.comment === 'boolean' && options.comment,
                        tolerant: typeof options.tolerant === 'boolean' && options.tolerant
                    };
                    if (this.config.loc && options.source && options.source !== null) this.config.source = String(options.source);
                    this.delegate = delegate;
                    this.errorHandler = new error_handler_1.ErrorHandler();
                    this.errorHandler.tolerant = this.config.tolerant;
                    this.scanner = new scanner_1.Scanner(code, this.errorHandler);
                    this.scanner.trackComment = this.config.comment;
                    this.operatorPrecedence = {
                        ')': 0,
                        ';': 0,
                        ',': 0,
                        '=': 0,
                        ']': 0,
                        '||': 1,
                        '&&': 2,
                        '|': 3,
                        '^': 4,
                        '&': 5,
                        '==': 6,
                        '!=': 6,
                        '===': 6,
                        '!==': 6,
                        '<': 7,
                        '>': 7,
                        '<=': 7,
                        '>=': 7,
                        '<<': 8,
                        '>>': 8,
                        '>>>': 8,
                        '+': 9,
                        '-': 9,
                        '*': 11,
                        '/': 11,
                        '%': 11
                    };
                    this.lookahead = {
                        type: 2 /* EOF */ ,
                        value: '',
                        lineNumber: this.scanner.lineNumber,
                        lineStart: 0,
                        start: 0,
                        end: 0
                    };
                    this.hasLineTerminator = false;
                    this.context = {
                        isModule: false,
                        await: false,
                        allowIn: true,
                        allowStrictDirective: true,
                        allowYield: true,
                        firstCoverInitializedNameError: null,
                        isAssignmentTarget: false,
                        isBindingElement: false,
                        inFunctionBody: false,
                        inIteration: false,
                        inSwitch: false,
                        labelSet: {},
                        strict: false
                    };
                    this.tokens = [];
                    this.startMarker = {
                        index: 0,
                        line: this.scanner.lineNumber,
                        column: 0
                    };
                    this.lastMarker = {
                        index: 0,
                        line: this.scanner.lineNumber,
                        column: 0
                    };
                    this.nextToken();
                    this.lastMarker = {
                        index: this.scanner.index,
                        line: this.scanner.lineNumber,
                        column: this.scanner.index - this.scanner.lineStart
                    };
                }
                Parser.prototype.throwError = function(messageFormat) {
                    var values = [];
                    for(var _i = 1; _i < arguments.length; _i++)values[_i - 1] = arguments[_i];
                    var args = Array.prototype.slice.call(arguments, 1);
                    var msg = messageFormat.replace(/%(\d)/g, function(whole, idx) {
                        assert_1.assert(idx < args.length, 'Message reference must be in range');
                        return args[idx];
                    });
                    var index = this.lastMarker.index;
                    var line = this.lastMarker.line;
                    var column = this.lastMarker.column + 1;
                    throw this.errorHandler.createError(index, line, column, msg);
                };
                Parser.prototype.tolerateError = function(messageFormat) {
                    var values = [];
                    for(var _i = 1; _i < arguments.length; _i++)values[_i - 1] = arguments[_i];
                    var args = Array.prototype.slice.call(arguments, 1);
                    var msg = messageFormat.replace(/%(\d)/g, function(whole, idx) {
                        assert_1.assert(idx < args.length, 'Message reference must be in range');
                        return args[idx];
                    });
                    var index = this.lastMarker.index;
                    var line = this.scanner.lineNumber;
                    var column = this.lastMarker.column + 1;
                    this.errorHandler.tolerateError(index, line, column, msg);
                };
                // Throw an exception because of the token.
                Parser.prototype.unexpectedTokenError = function(token, message) {
                    var msg = message || messages_1.Messages.UnexpectedToken;
                    var value;
                    if (token) {
                        if (!message) {
                            msg = token.type === 2 /* EOF */  ? messages_1.Messages.UnexpectedEOS : token.type === 3 /* Identifier */  ? messages_1.Messages.UnexpectedIdentifier : token.type === 6 /* NumericLiteral */  ? messages_1.Messages.UnexpectedNumber : token.type === 8 /* StringLiteral */  ? messages_1.Messages.UnexpectedString : token.type === 10 /* Template */  ? messages_1.Messages.UnexpectedTemplate : messages_1.Messages.UnexpectedToken;
                            if (token.type === 4 /* Keyword */ ) {
                                if (this.scanner.isFutureReservedWord(token.value)) msg = messages_1.Messages.UnexpectedReserved;
                                else if (this.context.strict && this.scanner.isStrictModeReservedWord(token.value)) msg = messages_1.Messages.StrictReservedWord;
                            }
                        }
                        value = token.value;
                    } else value = 'ILLEGAL';
                    msg = msg.replace('%0', value);
                    if (token && typeof token.lineNumber === 'number') {
                        var index = token.start;
                        var line = token.lineNumber;
                        var lastMarkerLineStart = this.lastMarker.index - this.lastMarker.column;
                        var column = token.start - lastMarkerLineStart + 1;
                        return this.errorHandler.createError(index, line, column, msg);
                    } else {
                        var index = this.lastMarker.index;
                        var line = this.lastMarker.line;
                        var column = this.lastMarker.column + 1;
                        return this.errorHandler.createError(index, line, column, msg);
                    }
                };
                Parser.prototype.throwUnexpectedToken = function(token, message) {
                    throw this.unexpectedTokenError(token, message);
                };
                Parser.prototype.tolerateUnexpectedToken = function(token, message) {
                    this.errorHandler.tolerate(this.unexpectedTokenError(token, message));
                };
                Parser.prototype.collectComments = function() {
                    if (!this.config.comment) this.scanner.scanComments();
                    else {
                        var comments = this.scanner.scanComments();
                        if (comments.length > 0 && this.delegate) for(var i = 0; i < comments.length; ++i){
                            var e = comments[i];
                            var node = void 0;
                            node = {
                                type: e.multiLine ? 'BlockComment' : 'LineComment',
                                value: this.scanner.source.slice(e.slice[0], e.slice[1])
                            };
                            if (this.config.range) node.range = e.range;
                            if (this.config.loc) node.loc = e.loc;
                            var metadata = {
                                start: {
                                    line: e.loc.start.line,
                                    column: e.loc.start.column,
                                    offset: e.range[0]
                                },
                                end: {
                                    line: e.loc.end.line,
                                    column: e.loc.end.column,
                                    offset: e.range[1]
                                }
                            };
                            this.delegate(node, metadata);
                        }
                    }
                };
                // From internal representation to an external structure
                Parser.prototype.getTokenRaw = function(token) {
                    return this.scanner.source.slice(token.start, token.end);
                };
                Parser.prototype.convertToken = function(token) {
                    var t = {
                        type: token_1.TokenName[token.type],
                        value: this.getTokenRaw(token)
                    };
                    if (this.config.range) t.range = [
                        token.start,
                        token.end
                    ];
                    if (this.config.loc) t.loc = {
                        start: {
                            line: this.startMarker.line,
                            column: this.startMarker.column
                        },
                        end: {
                            line: this.scanner.lineNumber,
                            column: this.scanner.index - this.scanner.lineStart
                        }
                    };
                    if (token.type === 9 /* RegularExpression */ ) {
                        var pattern = token.pattern;
                        var flags = token.flags;
                        t.regex = {
                            pattern: pattern,
                            flags: flags
                        };
                    }
                    return t;
                };
                Parser.prototype.nextToken = function() {
                    var token = this.lookahead;
                    this.lastMarker.index = this.scanner.index;
                    this.lastMarker.line = this.scanner.lineNumber;
                    this.lastMarker.column = this.scanner.index - this.scanner.lineStart;
                    this.collectComments();
                    if (this.scanner.index !== this.startMarker.index) {
                        this.startMarker.index = this.scanner.index;
                        this.startMarker.line = this.scanner.lineNumber;
                        this.startMarker.column = this.scanner.index - this.scanner.lineStart;
                    }
                    var next = this.scanner.lex();
                    this.hasLineTerminator = token.lineNumber !== next.lineNumber;
                    if (next && this.context.strict && next.type === 3 /* Identifier */ ) {
                        if (this.scanner.isStrictModeReservedWord(next.value)) next.type = 4 /* Keyword */ ;
                    }
                    this.lookahead = next;
                    if (this.config.tokens && next.type !== 2 /* EOF */ ) this.tokens.push(this.convertToken(next));
                    return token;
                };
                Parser.prototype.nextRegexToken = function() {
                    this.collectComments();
                    var token = this.scanner.scanRegExp();
                    if (this.config.tokens) {
                        // Pop the previous token, '/' or '/='
                        // This is added from the lookahead token.
                        this.tokens.pop();
                        this.tokens.push(this.convertToken(token));
                    }
                    // Prime the next lookahead.
                    this.lookahead = token;
                    this.nextToken();
                    return token;
                };
                Parser.prototype.createNode = function() {
                    return {
                        index: this.startMarker.index,
                        line: this.startMarker.line,
                        column: this.startMarker.column
                    };
                };
                Parser.prototype.startNode = function(token, lastLineStart) {
                    if (lastLineStart === void 0) lastLineStart = 0;
                    var column = token.start - token.lineStart;
                    var line = token.lineNumber;
                    if (column < 0) {
                        column += lastLineStart;
                        line--;
                    }
                    return {
                        index: token.start,
                        line: line,
                        column: column
                    };
                };
                Parser.prototype.finalize = function(marker, node) {
                    if (this.config.range) node.range = [
                        marker.index,
                        this.lastMarker.index
                    ];
                    if (this.config.loc) {
                        node.loc = {
                            start: {
                                line: marker.line,
                                column: marker.column
                            },
                            end: {
                                line: this.lastMarker.line,
                                column: this.lastMarker.column
                            }
                        };
                        if (this.config.source) node.loc.source = this.config.source;
                    }
                    if (this.delegate) {
                        var metadata = {
                            start: {
                                line: marker.line,
                                column: marker.column,
                                offset: marker.index
                            },
                            end: {
                                line: this.lastMarker.line,
                                column: this.lastMarker.column,
                                offset: this.lastMarker.index
                            }
                        };
                        this.delegate(node, metadata);
                    }
                    return node;
                };
                // Expect the next token to match the specified punctuator.
                // If not, an exception will be thrown.
                Parser.prototype.expect = function(value) {
                    var token = this.nextToken();
                    if (token.type !== 7 /* Punctuator */  || token.value !== value) this.throwUnexpectedToken(token);
                };
                // Quietly expect a comma when in tolerant mode, otherwise delegates to expect().
                Parser.prototype.expectCommaSeparator = function() {
                    if (this.config.tolerant) {
                        var token = this.lookahead;
                        if (token.type === 7 /* Punctuator */  && token.value === ',') this.nextToken();
                        else if (token.type === 7 /* Punctuator */  && token.value === ';') {
                            this.nextToken();
                            this.tolerateUnexpectedToken(token);
                        } else this.tolerateUnexpectedToken(token, messages_1.Messages.UnexpectedToken);
                    } else this.expect(',');
                };
                // Expect the next token to match the specified keyword.
                // If not, an exception will be thrown.
                Parser.prototype.expectKeyword = function(keyword) {
                    var token = this.nextToken();
                    if (token.type !== 4 /* Keyword */  || token.value !== keyword) this.throwUnexpectedToken(token);
                };
                // Return true if the next token matches the specified punctuator.
                Parser.prototype.match = function(value) {
                    return this.lookahead.type === 7 /* Punctuator */  && this.lookahead.value === value;
                };
                // Return true if the next token matches the specified keyword
                Parser.prototype.matchKeyword = function(keyword) {
                    return this.lookahead.type === 4 /* Keyword */  && this.lookahead.value === keyword;
                };
                // Return true if the next token matches the specified contextual keyword
                // (where an identifier is sometimes a keyword depending on the context)
                Parser.prototype.matchContextualKeyword = function(keyword) {
                    return this.lookahead.type === 3 /* Identifier */  && this.lookahead.value === keyword;
                };
                // Return true if the next token is an assignment operator
                Parser.prototype.matchAssign = function() {
                    if (this.lookahead.type !== 7 /* Punctuator */ ) return false;
                    var op = this.lookahead.value;
                    return op === '=' || op === '*=' || op === '**=' || op === '/=' || op === '%=' || op === '+=' || op === '-=' || op === '<<=' || op === '>>=' || op === '>>>=' || op === '&=' || op === '^=' || op === '|=';
                };
                // Cover grammar support.
                //
                // When an assignment expression position starts with an left parenthesis, the determination of the type
                // of the syntax is to be deferred arbitrarily long until the end of the parentheses pair (plus a lookahead)
                // or the first comma. This situation also defers the determination of all the expressions nested in the pair.
                //
                // There are three productions that can be parsed in a parentheses pair that needs to be determined
                // after the outermost pair is closed. They are:
                //
                //   1. AssignmentExpression
                //   2. BindingElements
                //   3. AssignmentTargets
                //
                // In order to avoid exponential backtracking, we use two flags to denote if the production can be
                // binding element or assignment target.
                //
                // The three productions have the relationship:
                //
                //   BindingElements ⊆ AssignmentTargets ⊆ AssignmentExpression
                //
                // with a single exception that CoverInitializedName when used directly in an Expression, generates
                // an early error. Therefore, we need the third state, firstCoverInitializedNameError, to track the
                // first usage of CoverInitializedName and report it when we reached the end of the parentheses pair.
                //
                // isolateCoverGrammar function runs the given parser function with a new cover grammar context, and it does not
                // effect the current flags. This means the production the parser parses is only used as an expression. Therefore
                // the CoverInitializedName check is conducted.
                //
                // inheritCoverGrammar function runs the given parse function with a new cover grammar context, and it propagates
                // the flags outside of the parser. This means the production the parser parses is used as a part of a potential
                // pattern. The CoverInitializedName check is deferred.
                Parser.prototype.isolateCoverGrammar = function(parseFunction) {
                    var previousIsBindingElement = this.context.isBindingElement;
                    var previousIsAssignmentTarget = this.context.isAssignmentTarget;
                    var previousFirstCoverInitializedNameError = this.context.firstCoverInitializedNameError;
                    this.context.isBindingElement = true;
                    this.context.isAssignmentTarget = true;
                    this.context.firstCoverInitializedNameError = null;
                    var result = parseFunction.call(this);
                    if (this.context.firstCoverInitializedNameError !== null) this.throwUnexpectedToken(this.context.firstCoverInitializedNameError);
                    this.context.isBindingElement = previousIsBindingElement;
                    this.context.isAssignmentTarget = previousIsAssignmentTarget;
                    this.context.firstCoverInitializedNameError = previousFirstCoverInitializedNameError;
                    return result;
                };
                Parser.prototype.inheritCoverGrammar = function(parseFunction) {
                    var previousIsBindingElement = this.context.isBindingElement;
                    var previousIsAssignmentTarget = this.context.isAssignmentTarget;
                    var previousFirstCoverInitializedNameError = this.context.firstCoverInitializedNameError;
                    this.context.isBindingElement = true;
                    this.context.isAssignmentTarget = true;
                    this.context.firstCoverInitializedNameError = null;
                    var result = parseFunction.call(this);
                    this.context.isBindingElement = this.context.isBindingElement && previousIsBindingElement;
                    this.context.isAssignmentTarget = this.context.isAssignmentTarget && previousIsAssignmentTarget;
                    this.context.firstCoverInitializedNameError = previousFirstCoverInitializedNameError || this.context.firstCoverInitializedNameError;
                    return result;
                };
                Parser.prototype.consumeSemicolon = function() {
                    if (this.match(';')) this.nextToken();
                    else if (!this.hasLineTerminator) {
                        if (this.lookahead.type !== 2 /* EOF */  && !this.match('}')) this.throwUnexpectedToken(this.lookahead);
                        this.lastMarker.index = this.startMarker.index;
                        this.lastMarker.line = this.startMarker.line;
                        this.lastMarker.column = this.startMarker.column;
                    }
                };
                // https://tc39.github.io/ecma262/#sec-primary-expression
                Parser.prototype.parsePrimaryExpression = function() {
                    var node = this.createNode();
                    var expr;
                    var token, raw;
                    switch(this.lookahead.type){
                        case 3 /* Identifier */ :
                            if ((this.context.isModule || this.context.await) && this.lookahead.value === 'await') this.tolerateUnexpectedToken(this.lookahead);
                            expr = this.matchAsyncFunction() ? this.parseFunctionExpression() : this.finalize(node, new Node.Identifier(this.nextToken().value));
                            break;
                        case 6 /* NumericLiteral */ :
                        case 8 /* StringLiteral */ :
                            if (this.context.strict && this.lookahead.octal) this.tolerateUnexpectedToken(this.lookahead, messages_1.Messages.StrictOctalLiteral);
                            this.context.isAssignmentTarget = false;
                            this.context.isBindingElement = false;
                            token = this.nextToken();
                            raw = this.getTokenRaw(token);
                            expr = this.finalize(node, new Node.Literal(token.value, raw));
                            break;
                        case 1 /* BooleanLiteral */ :
                            this.context.isAssignmentTarget = false;
                            this.context.isBindingElement = false;
                            token = this.nextToken();
                            raw = this.getTokenRaw(token);
                            expr = this.finalize(node, new Node.Literal(token.value === 'true', raw));
                            break;
                        case 5 /* NullLiteral */ :
                            this.context.isAssignmentTarget = false;
                            this.context.isBindingElement = false;
                            token = this.nextToken();
                            raw = this.getTokenRaw(token);
                            expr = this.finalize(node, new Node.Literal(null, raw));
                            break;
                        case 10 /* Template */ :
                            expr = this.parseTemplateLiteral();
                            break;
                        case 7 /* Punctuator */ :
                            switch(this.lookahead.value){
                                case '(':
                                    this.context.isBindingElement = false;
                                    expr = this.inheritCoverGrammar(this.parseGroupExpression);
                                    break;
                                case '[':
                                    expr = this.inheritCoverGrammar(this.parseArrayInitializer);
                                    break;
                                case '{':
                                    expr = this.inheritCoverGrammar(this.parseObjectInitializer);
                                    break;
                                case '/':
                                case '/=':
                                    this.context.isAssignmentTarget = false;
                                    this.context.isBindingElement = false;
                                    this.scanner.index = this.startMarker.index;
                                    token = this.nextRegexToken();
                                    raw = this.getTokenRaw(token);
                                    expr = this.finalize(node, new Node.RegexLiteral(token.regex, raw, token.pattern, token.flags));
                                    break;
                                default:
                                    expr = this.throwUnexpectedToken(this.nextToken());
                            }
                            break;
                        case 4 /* Keyword */ :
                            if (!this.context.strict && this.context.allowYield && this.matchKeyword('yield')) expr = this.parseIdentifierName();
                            else if (!this.context.strict && this.matchKeyword('let')) expr = this.finalize(node, new Node.Identifier(this.nextToken().value));
                            else {
                                this.context.isAssignmentTarget = false;
                                this.context.isBindingElement = false;
                                if (this.matchKeyword('function')) expr = this.parseFunctionExpression();
                                else if (this.matchKeyword('this')) {
                                    this.nextToken();
                                    expr = this.finalize(node, new Node.ThisExpression());
                                } else if (this.matchKeyword('class')) expr = this.parseClassExpression();
                                else expr = this.throwUnexpectedToken(this.nextToken());
                            }
                            break;
                        default:
                            expr = this.throwUnexpectedToken(this.nextToken());
                    }
                    return expr;
                };
                // https://tc39.github.io/ecma262/#sec-array-initializer
                Parser.prototype.parseSpreadElement = function() {
                    var node = this.createNode();
                    this.expect('...');
                    var arg = this.inheritCoverGrammar(this.parseAssignmentExpression);
                    return this.finalize(node, new Node.SpreadElement(arg));
                };
                Parser.prototype.parseArrayInitializer = function() {
                    var node = this.createNode();
                    var elements = [];
                    this.expect('[');
                    while(!this.match(']')){
                        if (this.match(',')) {
                            this.nextToken();
                            elements.push(null);
                        } else if (this.match('...')) {
                            var element = this.parseSpreadElement();
                            if (!this.match(']')) {
                                this.context.isAssignmentTarget = false;
                                this.context.isBindingElement = false;
                                this.expect(',');
                            }
                            elements.push(element);
                        } else {
                            elements.push(this.inheritCoverGrammar(this.parseAssignmentExpression));
                            if (!this.match(']')) this.expect(',');
                        }
                    }
                    this.expect(']');
                    return this.finalize(node, new Node.ArrayExpression(elements));
                };
                // https://tc39.github.io/ecma262/#sec-object-initializer
                Parser.prototype.parsePropertyMethod = function(params) {
                    this.context.isAssignmentTarget = false;
                    this.context.isBindingElement = false;
                    var previousStrict = this.context.strict;
                    var previousAllowStrictDirective = this.context.allowStrictDirective;
                    this.context.allowStrictDirective = params.simple;
                    var body = this.isolateCoverGrammar(this.parseFunctionSourceElements);
                    if (this.context.strict && params.firstRestricted) this.tolerateUnexpectedToken(params.firstRestricted, params.message);
                    if (this.context.strict && params.stricted) this.tolerateUnexpectedToken(params.stricted, params.message);
                    this.context.strict = previousStrict;
                    this.context.allowStrictDirective = previousAllowStrictDirective;
                    return body;
                };
                Parser.prototype.parsePropertyMethodFunction = function() {
                    var isGenerator = false;
                    var node = this.createNode();
                    var previousAllowYield = this.context.allowYield;
                    this.context.allowYield = true;
                    var params = this.parseFormalParameters();
                    var method = this.parsePropertyMethod(params);
                    this.context.allowYield = previousAllowYield;
                    return this.finalize(node, new Node.FunctionExpression(null, params.params, method, isGenerator));
                };
                Parser.prototype.parsePropertyMethodAsyncFunction = function() {
                    var node = this.createNode();
                    var previousAllowYield = this.context.allowYield;
                    var previousAwait = this.context.await;
                    this.context.allowYield = false;
                    this.context.await = true;
                    var params = this.parseFormalParameters();
                    var method = this.parsePropertyMethod(params);
                    this.context.allowYield = previousAllowYield;
                    this.context.await = previousAwait;
                    return this.finalize(node, new Node.AsyncFunctionExpression(null, params.params, method));
                };
                Parser.prototype.parseObjectPropertyKey = function() {
                    var node = this.createNode();
                    var token = this.nextToken();
                    var key;
                    switch(token.type){
                        case 8 /* StringLiteral */ :
                        case 6 /* NumericLiteral */ :
                            if (this.context.strict && token.octal) this.tolerateUnexpectedToken(token, messages_1.Messages.StrictOctalLiteral);
                            var raw = this.getTokenRaw(token);
                            key = this.finalize(node, new Node.Literal(token.value, raw));
                            break;
                        case 3 /* Identifier */ :
                        case 1 /* BooleanLiteral */ :
                        case 5 /* NullLiteral */ :
                        case 4 /* Keyword */ :
                            key = this.finalize(node, new Node.Identifier(token.value));
                            break;
                        case 7 /* Punctuator */ :
                            if (token.value === '[') {
                                key = this.isolateCoverGrammar(this.parseAssignmentExpression);
                                this.expect(']');
                            } else key = this.throwUnexpectedToken(token);
                            break;
                        default:
                            key = this.throwUnexpectedToken(token);
                    }
                    return key;
                };
                Parser.prototype.isPropertyKey = function(key, value) {
                    return key.type === syntax_1.Syntax.Identifier && key.name === value || key.type === syntax_1.Syntax.Literal && key.value === value;
                };
                Parser.prototype.parseObjectProperty = function(hasProto) {
                    var node = this.createNode();
                    var token = this.lookahead;
                    var kind;
                    var key = null;
                    var value = null;
                    var computed = false;
                    var method = false;
                    var shorthand = false;
                    var isAsync = false;
                    if (token.type === 3 /* Identifier */ ) {
                        var id = token.value;
                        this.nextToken();
                        computed = this.match('[');
                        isAsync = !this.hasLineTerminator && id === 'async' && !this.match(':') && !this.match('(') && !this.match('*') && !this.match(',');
                        key = isAsync ? this.parseObjectPropertyKey() : this.finalize(node, new Node.Identifier(id));
                    } else if (this.match('*')) this.nextToken();
                    else {
                        computed = this.match('[');
                        key = this.parseObjectPropertyKey();
                    }
                    var lookaheadPropertyKey = this.qualifiedPropertyName(this.lookahead);
                    if (token.type === 3 /* Identifier */  && !isAsync && token.value === 'get' && lookaheadPropertyKey) {
                        kind = 'get';
                        computed = this.match('[');
                        key = this.parseObjectPropertyKey();
                        this.context.allowYield = false;
                        value = this.parseGetterMethod();
                    } else if (token.type === 3 /* Identifier */  && !isAsync && token.value === 'set' && lookaheadPropertyKey) {
                        kind = 'set';
                        computed = this.match('[');
                        key = this.parseObjectPropertyKey();
                        value = this.parseSetterMethod();
                    } else if (token.type === 7 /* Punctuator */  && token.value === '*' && lookaheadPropertyKey) {
                        kind = 'init';
                        computed = this.match('[');
                        key = this.parseObjectPropertyKey();
                        value = this.parseGeneratorMethod();
                        method = true;
                    } else {
                        if (!key) this.throwUnexpectedToken(this.lookahead);
                        kind = 'init';
                        if (this.match(':') && !isAsync) {
                            if (!computed && this.isPropertyKey(key, '__proto__')) {
                                if (hasProto.value) this.tolerateError(messages_1.Messages.DuplicateProtoProperty);
                                hasProto.value = true;
                            }
                            this.nextToken();
                            value = this.inheritCoverGrammar(this.parseAssignmentExpression);
                        } else if (this.match('(')) {
                            value = isAsync ? this.parsePropertyMethodAsyncFunction() : this.parsePropertyMethodFunction();
                            method = true;
                        } else if (token.type === 3 /* Identifier */ ) {
                            var id = this.finalize(node, new Node.Identifier(token.value));
                            if (this.match('=')) {
                                this.context.firstCoverInitializedNameError = this.lookahead;
                                this.nextToken();
                                shorthand = true;
                                var init = this.isolateCoverGrammar(this.parseAssignmentExpression);
                                value = this.finalize(node, new Node.AssignmentPattern(id, init));
                            } else {
                                shorthand = true;
                                value = id;
                            }
                        } else this.throwUnexpectedToken(this.nextToken());
                    }
                    return this.finalize(node, new Node.Property(kind, key, computed, value, method, shorthand));
                };
                Parser.prototype.parseObjectInitializer = function() {
                    var node = this.createNode();
                    this.expect('{');
                    var properties = [];
                    var hasProto = {
                        value: false
                    };
                    while(!this.match('}')){
                        properties.push(this.parseObjectProperty(hasProto));
                        if (!this.match('}')) this.expectCommaSeparator();
                    }
                    this.expect('}');
                    return this.finalize(node, new Node.ObjectExpression(properties));
                };
                // https://tc39.github.io/ecma262/#sec-template-literals
                Parser.prototype.parseTemplateHead = function() {
                    assert_1.assert(this.lookahead.head, 'Template literal must start with a template head');
                    var node = this.createNode();
                    var token = this.nextToken();
                    var raw = token.value;
                    var cooked = token.cooked;
                    return this.finalize(node, new Node.TemplateElement({
                        raw: raw,
                        cooked: cooked
                    }, token.tail));
                };
                Parser.prototype.parseTemplateElement = function() {
                    if (this.lookahead.type !== 10 /* Template */ ) this.throwUnexpectedToken();
                    var node = this.createNode();
                    var token = this.nextToken();
                    var raw = token.value;
                    var cooked = token.cooked;
                    return this.finalize(node, new Node.TemplateElement({
                        raw: raw,
                        cooked: cooked
                    }, token.tail));
                };
                Parser.prototype.parseTemplateLiteral = function() {
                    var node = this.createNode();
                    var expressions = [];
                    var quasis = [];
                    var quasi = this.parseTemplateHead();
                    quasis.push(quasi);
                    while(!quasi.tail){
                        expressions.push(this.parseExpression());
                        quasi = this.parseTemplateElement();
                        quasis.push(quasi);
                    }
                    return this.finalize(node, new Node.TemplateLiteral(quasis, expressions));
                };
                // https://tc39.github.io/ecma262/#sec-grouping-operator
                Parser.prototype.reinterpretExpressionAsPattern = function(expr) {
                    switch(expr.type){
                        case syntax_1.Syntax.Identifier:
                        case syntax_1.Syntax.MemberExpression:
                        case syntax_1.Syntax.RestElement:
                        case syntax_1.Syntax.AssignmentPattern:
                            break;
                        case syntax_1.Syntax.SpreadElement:
                            expr.type = syntax_1.Syntax.RestElement;
                            this.reinterpretExpressionAsPattern(expr.argument);
                            break;
                        case syntax_1.Syntax.ArrayExpression:
                            expr.type = syntax_1.Syntax.ArrayPattern;
                            for(var i = 0; i < expr.elements.length; i++)if (expr.elements[i] !== null) this.reinterpretExpressionAsPattern(expr.elements[i]);
                            break;
                        case syntax_1.Syntax.ObjectExpression:
                            expr.type = syntax_1.Syntax.ObjectPattern;
                            for(var i = 0; i < expr.properties.length; i++)this.reinterpretExpressionAsPattern(expr.properties[i].value);
                            break;
                        case syntax_1.Syntax.AssignmentExpression:
                            expr.type = syntax_1.Syntax.AssignmentPattern;
                            delete expr.operator;
                            this.reinterpretExpressionAsPattern(expr.left);
                            break;
                        default:
                            break;
                    }
                };
                Parser.prototype.parseGroupExpression = function() {
                    var expr;
                    this.expect('(');
                    if (this.match(')')) {
                        this.nextToken();
                        if (!this.match('=>')) this.expect('=>');
                        expr = {
                            type: ArrowParameterPlaceHolder,
                            params: [],
                            async: false
                        };
                    } else {
                        var startToken = this.lookahead;
                        var params = [];
                        if (this.match('...')) {
                            expr = this.parseRestElement(params);
                            this.expect(')');
                            if (!this.match('=>')) this.expect('=>');
                            expr = {
                                type: ArrowParameterPlaceHolder,
                                params: [
                                    expr
                                ],
                                async: false
                            };
                        } else {
                            var arrow = false;
                            this.context.isBindingElement = true;
                            expr = this.inheritCoverGrammar(this.parseAssignmentExpression);
                            if (this.match(',')) {
                                var expressions = [];
                                this.context.isAssignmentTarget = false;
                                expressions.push(expr);
                                while(this.lookahead.type !== 2 /* EOF */ ){
                                    if (!this.match(',')) break;
                                    this.nextToken();
                                    if (this.match(')')) {
                                        this.nextToken();
                                        for(var i = 0; i < expressions.length; i++)this.reinterpretExpressionAsPattern(expressions[i]);
                                        arrow = true;
                                        expr = {
                                            type: ArrowParameterPlaceHolder,
                                            params: expressions,
                                            async: false
                                        };
                                    } else if (this.match('...')) {
                                        if (!this.context.isBindingElement) this.throwUnexpectedToken(this.lookahead);
                                        expressions.push(this.parseRestElement(params));
                                        this.expect(')');
                                        if (!this.match('=>')) this.expect('=>');
                                        this.context.isBindingElement = false;
                                        for(var i = 0; i < expressions.length; i++)this.reinterpretExpressionAsPattern(expressions[i]);
                                        arrow = true;
                                        expr = {
                                            type: ArrowParameterPlaceHolder,
                                            params: expressions,
                                            async: false
                                        };
                                    } else expressions.push(this.inheritCoverGrammar(this.parseAssignmentExpression));
                                    if (arrow) break;
                                }
                                if (!arrow) expr = this.finalize(this.startNode(startToken), new Node.SequenceExpression(expressions));
                            }
                            if (!arrow) {
                                this.expect(')');
                                if (this.match('=>')) {
                                    if (expr.type === syntax_1.Syntax.Identifier && expr.name === 'yield') {
                                        arrow = true;
                                        expr = {
                                            type: ArrowParameterPlaceHolder,
                                            params: [
                                                expr
                                            ],
                                            async: false
                                        };
                                    }
                                    if (!arrow) {
                                        if (!this.context.isBindingElement) this.throwUnexpectedToken(this.lookahead);
                                        if (expr.type === syntax_1.Syntax.SequenceExpression) for(var i = 0; i < expr.expressions.length; i++)this.reinterpretExpressionAsPattern(expr.expressions[i]);
                                        else this.reinterpretExpressionAsPattern(expr);
                                        var parameters = expr.type === syntax_1.Syntax.SequenceExpression ? expr.expressions : [
                                            expr
                                        ];
                                        expr = {
                                            type: ArrowParameterPlaceHolder,
                                            params: parameters,
                                            async: false
                                        };
                                    }
                                }
                                this.context.isBindingElement = false;
                            }
                        }
                    }
                    return expr;
                };
                // https://tc39.github.io/ecma262/#sec-left-hand-side-expressions
                Parser.prototype.parseArguments = function() {
                    this.expect('(');
                    var args = [];
                    if (!this.match(')')) while(true){
                        var expr = this.match('...') ? this.parseSpreadElement() : this.isolateCoverGrammar(this.parseAssignmentExpression);
                        args.push(expr);
                        if (this.match(')')) break;
                        this.expectCommaSeparator();
                        if (this.match(')')) break;
                    }
                    this.expect(')');
                    return args;
                };
                Parser.prototype.isIdentifierName = function(token) {
                    return token.type === 3 /* Identifier */  || token.type === 4 /* Keyword */  || token.type === 1 /* BooleanLiteral */  || token.type === 5 /* NullLiteral */ ;
                };
                Parser.prototype.parseIdentifierName = function() {
                    var node = this.createNode();
                    var token = this.nextToken();
                    if (!this.isIdentifierName(token)) this.throwUnexpectedToken(token);
                    return this.finalize(node, new Node.Identifier(token.value));
                };
                Parser.prototype.parseNewExpression = function() {
                    var node = this.createNode();
                    var id = this.parseIdentifierName();
                    assert_1.assert(id.name === 'new', 'New expression must start with `new`');
                    var expr;
                    if (this.match('.')) {
                        this.nextToken();
                        if (this.lookahead.type === 3 /* Identifier */  && this.context.inFunctionBody && this.lookahead.value === 'target') {
                            var property = this.parseIdentifierName();
                            expr = new Node.MetaProperty(id, property);
                        } else this.throwUnexpectedToken(this.lookahead);
                    } else {
                        var callee = this.isolateCoverGrammar(this.parseLeftHandSideExpression);
                        var args = this.match('(') ? this.parseArguments() : [];
                        expr = new Node.NewExpression(callee, args);
                        this.context.isAssignmentTarget = false;
                        this.context.isBindingElement = false;
                    }
                    return this.finalize(node, expr);
                };
                Parser.prototype.parseAsyncArgument = function() {
                    var arg = this.parseAssignmentExpression();
                    this.context.firstCoverInitializedNameError = null;
                    return arg;
                };
                Parser.prototype.parseAsyncArguments = function() {
                    this.expect('(');
                    var args = [];
                    if (!this.match(')')) while(true){
                        var expr = this.match('...') ? this.parseSpreadElement() : this.isolateCoverGrammar(this.parseAsyncArgument);
                        args.push(expr);
                        if (this.match(')')) break;
                        this.expectCommaSeparator();
                        if (this.match(')')) break;
                    }
                    this.expect(')');
                    return args;
                };
                Parser.prototype.parseLeftHandSideExpressionAllowCall = function() {
                    var startToken = this.lookahead;
                    var maybeAsync = this.matchContextualKeyword('async');
                    var previousAllowIn = this.context.allowIn;
                    this.context.allowIn = true;
                    var expr;
                    if (this.matchKeyword('super') && this.context.inFunctionBody) {
                        expr = this.createNode();
                        this.nextToken();
                        expr = this.finalize(expr, new Node.Super());
                        if (!this.match('(') && !this.match('.') && !this.match('[')) this.throwUnexpectedToken(this.lookahead);
                    } else expr = this.inheritCoverGrammar(this.matchKeyword('new') ? this.parseNewExpression : this.parsePrimaryExpression);
                    while(true){
                        if (this.match('.')) {
                            this.context.isBindingElement = false;
                            this.context.isAssignmentTarget = true;
                            this.expect('.');
                            var property = this.parseIdentifierName();
                            expr = this.finalize(this.startNode(startToken), new Node.StaticMemberExpression(expr, property));
                        } else if (this.match('(')) {
                            var asyncArrow = maybeAsync && startToken.lineNumber === this.lookahead.lineNumber;
                            this.context.isBindingElement = false;
                            this.context.isAssignmentTarget = false;
                            var args = asyncArrow ? this.parseAsyncArguments() : this.parseArguments();
                            expr = this.finalize(this.startNode(startToken), new Node.CallExpression(expr, args));
                            if (asyncArrow && this.match('=>')) {
                                for(var i = 0; i < args.length; ++i)this.reinterpretExpressionAsPattern(args[i]);
                                expr = {
                                    type: ArrowParameterPlaceHolder,
                                    params: args,
                                    async: true
                                };
                            }
                        } else if (this.match('[')) {
                            this.context.isBindingElement = false;
                            this.context.isAssignmentTarget = true;
                            this.expect('[');
                            var property = this.isolateCoverGrammar(this.parseExpression);
                            this.expect(']');
                            expr = this.finalize(this.startNode(startToken), new Node.ComputedMemberExpression(expr, property));
                        } else if (this.lookahead.type === 10 /* Template */  && this.lookahead.head) {
                            var quasi = this.parseTemplateLiteral();
                            expr = this.finalize(this.startNode(startToken), new Node.TaggedTemplateExpression(expr, quasi));
                        } else break;
                    }
                    this.context.allowIn = previousAllowIn;
                    return expr;
                };
                Parser.prototype.parseSuper = function() {
                    var node = this.createNode();
                    this.expectKeyword('super');
                    if (!this.match('[') && !this.match('.')) this.throwUnexpectedToken(this.lookahead);
                    return this.finalize(node, new Node.Super());
                };
                Parser.prototype.parseLeftHandSideExpression = function() {
                    assert_1.assert(this.context.allowIn, 'callee of new expression always allow in keyword.');
                    var node = this.startNode(this.lookahead);
                    var expr = this.matchKeyword('super') && this.context.inFunctionBody ? this.parseSuper() : this.inheritCoverGrammar(this.matchKeyword('new') ? this.parseNewExpression : this.parsePrimaryExpression);
                    while(true){
                        if (this.match('[')) {
                            this.context.isBindingElement = false;
                            this.context.isAssignmentTarget = true;
                            this.expect('[');
                            var property = this.isolateCoverGrammar(this.parseExpression);
                            this.expect(']');
                            expr = this.finalize(node, new Node.ComputedMemberExpression(expr, property));
                        } else if (this.match('.')) {
                            this.context.isBindingElement = false;
                            this.context.isAssignmentTarget = true;
                            this.expect('.');
                            var property = this.parseIdentifierName();
                            expr = this.finalize(node, new Node.StaticMemberExpression(expr, property));
                        } else if (this.lookahead.type === 10 /* Template */  && this.lookahead.head) {
                            var quasi = this.parseTemplateLiteral();
                            expr = this.finalize(node, new Node.TaggedTemplateExpression(expr, quasi));
                        } else break;
                    }
                    return expr;
                };
                // https://tc39.github.io/ecma262/#sec-update-expressions
                Parser.prototype.parseUpdateExpression = function() {
                    var expr;
                    var startToken = this.lookahead;
                    if (this.match('++') || this.match('--')) {
                        var node = this.startNode(startToken);
                        var token = this.nextToken();
                        expr = this.inheritCoverGrammar(this.parseUnaryExpression);
                        if (this.context.strict && expr.type === syntax_1.Syntax.Identifier && this.scanner.isRestrictedWord(expr.name)) this.tolerateError(messages_1.Messages.StrictLHSPrefix);
                        if (!this.context.isAssignmentTarget) this.tolerateError(messages_1.Messages.InvalidLHSInAssignment);
                        var prefix = true;
                        expr = this.finalize(node, new Node.UpdateExpression(token.value, expr, prefix));
                        this.context.isAssignmentTarget = false;
                        this.context.isBindingElement = false;
                    } else {
                        expr = this.inheritCoverGrammar(this.parseLeftHandSideExpressionAllowCall);
                        if (!this.hasLineTerminator && this.lookahead.type === 7 /* Punctuator */ ) {
                            if (this.match('++') || this.match('--')) {
                                if (this.context.strict && expr.type === syntax_1.Syntax.Identifier && this.scanner.isRestrictedWord(expr.name)) this.tolerateError(messages_1.Messages.StrictLHSPostfix);
                                if (!this.context.isAssignmentTarget) this.tolerateError(messages_1.Messages.InvalidLHSInAssignment);
                                this.context.isAssignmentTarget = false;
                                this.context.isBindingElement = false;
                                var operator = this.nextToken().value;
                                var prefix = false;
                                expr = this.finalize(this.startNode(startToken), new Node.UpdateExpression(operator, expr, prefix));
                            }
                        }
                    }
                    return expr;
                };
                // https://tc39.github.io/ecma262/#sec-unary-operators
                Parser.prototype.parseAwaitExpression = function() {
                    var node = this.createNode();
                    this.nextToken();
                    var argument = this.parseUnaryExpression();
                    return this.finalize(node, new Node.AwaitExpression(argument));
                };
                Parser.prototype.parseUnaryExpression = function() {
                    var expr;
                    if (this.match('+') || this.match('-') || this.match('~') || this.match('!') || this.matchKeyword('delete') || this.matchKeyword('void') || this.matchKeyword('typeof')) {
                        var node = this.startNode(this.lookahead);
                        var token = this.nextToken();
                        expr = this.inheritCoverGrammar(this.parseUnaryExpression);
                        expr = this.finalize(node, new Node.UnaryExpression(token.value, expr));
                        if (this.context.strict && expr.operator === 'delete' && expr.argument.type === syntax_1.Syntax.Identifier) this.tolerateError(messages_1.Messages.StrictDelete);
                        this.context.isAssignmentTarget = false;
                        this.context.isBindingElement = false;
                    } else if (this.context.await && this.matchContextualKeyword('await')) expr = this.parseAwaitExpression();
                    else expr = this.parseUpdateExpression();
                    return expr;
                };
                Parser.prototype.parseExponentiationExpression = function() {
                    var startToken = this.lookahead;
                    var expr = this.inheritCoverGrammar(this.parseUnaryExpression);
                    if (expr.type !== syntax_1.Syntax.UnaryExpression && this.match('**')) {
                        this.nextToken();
                        this.context.isAssignmentTarget = false;
                        this.context.isBindingElement = false;
                        var left = expr;
                        var right = this.isolateCoverGrammar(this.parseExponentiationExpression);
                        expr = this.finalize(this.startNode(startToken), new Node.BinaryExpression('**', left, right));
                    }
                    return expr;
                };
                // https://tc39.github.io/ecma262/#sec-exp-operator
                // https://tc39.github.io/ecma262/#sec-multiplicative-operators
                // https://tc39.github.io/ecma262/#sec-additive-operators
                // https://tc39.github.io/ecma262/#sec-bitwise-shift-operators
                // https://tc39.github.io/ecma262/#sec-relational-operators
                // https://tc39.github.io/ecma262/#sec-equality-operators
                // https://tc39.github.io/ecma262/#sec-binary-bitwise-operators
                // https://tc39.github.io/ecma262/#sec-binary-logical-operators
                Parser.prototype.binaryPrecedence = function(token) {
                    var op = token.value;
                    var precedence;
                    if (token.type === 7 /* Punctuator */ ) precedence = this.operatorPrecedence[op] || 0;
                    else if (token.type === 4 /* Keyword */ ) precedence = op === 'instanceof' || this.context.allowIn && op === 'in' ? 7 : 0;
                    else precedence = 0;
                    return precedence;
                };
                Parser.prototype.parseBinaryExpression = function() {
                    var startToken = this.lookahead;
                    var expr = this.inheritCoverGrammar(this.parseExponentiationExpression);
                    var token = this.lookahead;
                    var prec = this.binaryPrecedence(token);
                    if (prec > 0) {
                        this.nextToken();
                        this.context.isAssignmentTarget = false;
                        this.context.isBindingElement = false;
                        var markers = [
                            startToken,
                            this.lookahead
                        ];
                        var left = expr;
                        var right = this.isolateCoverGrammar(this.parseExponentiationExpression);
                        var stack = [
                            left,
                            token.value,
                            right
                        ];
                        var precedences = [
                            prec
                        ];
                        while(true){
                            prec = this.binaryPrecedence(this.lookahead);
                            if (prec <= 0) break;
                            // Reduce: make a binary expression from the three topmost entries.
                            while(stack.length > 2 && prec <= precedences[precedences.length - 1]){
                                right = stack.pop();
                                var operator = stack.pop();
                                precedences.pop();
                                left = stack.pop();
                                markers.pop();
                                var node = this.startNode(markers[markers.length - 1]);
                                stack.push(this.finalize(node, new Node.BinaryExpression(operator, left, right)));
                            }
                            // Shift.
                            stack.push(this.nextToken().value);
                            precedences.push(prec);
                            markers.push(this.lookahead);
                            stack.push(this.isolateCoverGrammar(this.parseExponentiationExpression));
                        }
                        // Final reduce to clean-up the stack.
                        var i = stack.length - 1;
                        expr = stack[i];
                        var lastMarker = markers.pop();
                        while(i > 1){
                            var marker = markers.pop();
                            var lastLineStart = lastMarker && lastMarker.lineStart;
                            var node = this.startNode(marker, lastLineStart);
                            var operator = stack[i - 1];
                            expr = this.finalize(node, new Node.BinaryExpression(operator, stack[i - 2], expr));
                            i -= 2;
                            lastMarker = marker;
                        }
                    }
                    return expr;
                };
                // https://tc39.github.io/ecma262/#sec-conditional-operator
                Parser.prototype.parseConditionalExpression = function() {
                    var startToken = this.lookahead;
                    var expr = this.inheritCoverGrammar(this.parseBinaryExpression);
                    if (this.match('?')) {
                        this.nextToken();
                        var previousAllowIn = this.context.allowIn;
                        this.context.allowIn = true;
                        var consequent = this.isolateCoverGrammar(this.parseAssignmentExpression);
                        this.context.allowIn = previousAllowIn;
                        this.expect(':');
                        var alternate = this.isolateCoverGrammar(this.parseAssignmentExpression);
                        expr = this.finalize(this.startNode(startToken), new Node.ConditionalExpression(expr, consequent, alternate));
                        this.context.isAssignmentTarget = false;
                        this.context.isBindingElement = false;
                    }
                    return expr;
                };
                // https://tc39.github.io/ecma262/#sec-assignment-operators
                Parser.prototype.checkPatternParam = function(options, param) {
                    switch(param.type){
                        case syntax_1.Syntax.Identifier:
                            this.validateParam(options, param, param.name);
                            break;
                        case syntax_1.Syntax.RestElement:
                            this.checkPatternParam(options, param.argument);
                            break;
                        case syntax_1.Syntax.AssignmentPattern:
                            this.checkPatternParam(options, param.left);
                            break;
                        case syntax_1.Syntax.ArrayPattern:
                            for(var i = 0; i < param.elements.length; i++)if (param.elements[i] !== null) this.checkPatternParam(options, param.elements[i]);
                            break;
                        case syntax_1.Syntax.ObjectPattern:
                            for(var i = 0; i < param.properties.length; i++)this.checkPatternParam(options, param.properties[i].value);
                            break;
                        default:
                            break;
                    }
                    options.simple = options.simple && param instanceof Node.Identifier;
                };
                Parser.prototype.reinterpretAsCoverFormalsList = function(expr) {
                    var params = [
                        expr
                    ];
                    var options;
                    var asyncArrow = false;
                    switch(expr.type){
                        case syntax_1.Syntax.Identifier:
                            break;
                        case ArrowParameterPlaceHolder:
                            params = expr.params;
                            asyncArrow = expr.async;
                            break;
                        default:
                            return null;
                    }
                    options = {
                        simple: true,
                        paramSet: {}
                    };
                    for(var i = 0; i < params.length; ++i){
                        var param = params[i];
                        if (param.type === syntax_1.Syntax.AssignmentPattern) {
                            if (param.right.type === syntax_1.Syntax.YieldExpression) {
                                if (param.right.argument) this.throwUnexpectedToken(this.lookahead);
                                param.right.type = syntax_1.Syntax.Identifier;
                                param.right.name = 'yield';
                                delete param.right.argument;
                                delete param.right.delegate;
                            }
                        } else if (asyncArrow && param.type === syntax_1.Syntax.Identifier && param.name === 'await') this.throwUnexpectedToken(this.lookahead);
                        this.checkPatternParam(options, param);
                        params[i] = param;
                    }
                    if (this.context.strict || !this.context.allowYield) for(var i = 0; i < params.length; ++i){
                        var param = params[i];
                        if (param.type === syntax_1.Syntax.YieldExpression) this.throwUnexpectedToken(this.lookahead);
                    }
                    if (options.message === messages_1.Messages.StrictParamDupe) {
                        var token = this.context.strict ? options.stricted : options.firstRestricted;
                        this.throwUnexpectedToken(token, options.message);
                    }
                    return {
                        simple: options.simple,
                        params: params,
                        stricted: options.stricted,
                        firstRestricted: options.firstRestricted,
                        message: options.message
                    };
                };
                Parser.prototype.parseAssignmentExpression = function() {
                    var expr;
                    if (!this.context.allowYield && this.matchKeyword('yield')) expr = this.parseYieldExpression();
                    else {
                        var startToken = this.lookahead;
                        var token = startToken;
                        expr = this.parseConditionalExpression();
                        if (token.type === 3 /* Identifier */  && token.lineNumber === this.lookahead.lineNumber && token.value === 'async') {
                            if (this.lookahead.type === 3 /* Identifier */  || this.matchKeyword('yield')) {
                                var arg = this.parsePrimaryExpression();
                                this.reinterpretExpressionAsPattern(arg);
                                expr = {
                                    type: ArrowParameterPlaceHolder,
                                    params: [
                                        arg
                                    ],
                                    async: true
                                };
                            }
                        }
                        if (expr.type === ArrowParameterPlaceHolder || this.match('=>')) {
                            // https://tc39.github.io/ecma262/#sec-arrow-function-definitions
                            this.context.isAssignmentTarget = false;
                            this.context.isBindingElement = false;
                            var isAsync = expr.async;
                            var list = this.reinterpretAsCoverFormalsList(expr);
                            if (list) {
                                if (this.hasLineTerminator) this.tolerateUnexpectedToken(this.lookahead);
                                this.context.firstCoverInitializedNameError = null;
                                var previousStrict = this.context.strict;
                                var previousAllowStrictDirective = this.context.allowStrictDirective;
                                this.context.allowStrictDirective = list.simple;
                                var previousAllowYield = this.context.allowYield;
                                var previousAwait = this.context.await;
                                this.context.allowYield = true;
                                this.context.await = isAsync;
                                var node = this.startNode(startToken);
                                this.expect('=>');
                                var body = void 0;
                                if (this.match('{')) {
                                    var previousAllowIn = this.context.allowIn;
                                    this.context.allowIn = true;
                                    body = this.parseFunctionSourceElements();
                                    this.context.allowIn = previousAllowIn;
                                } else body = this.isolateCoverGrammar(this.parseAssignmentExpression);
                                var expression = body.type !== syntax_1.Syntax.BlockStatement;
                                if (this.context.strict && list.firstRestricted) this.throwUnexpectedToken(list.firstRestricted, list.message);
                                if (this.context.strict && list.stricted) this.tolerateUnexpectedToken(list.stricted, list.message);
                                expr = isAsync ? this.finalize(node, new Node.AsyncArrowFunctionExpression(list.params, body, expression)) : this.finalize(node, new Node.ArrowFunctionExpression(list.params, body, expression));
                                this.context.strict = previousStrict;
                                this.context.allowStrictDirective = previousAllowStrictDirective;
                                this.context.allowYield = previousAllowYield;
                                this.context.await = previousAwait;
                            }
                        } else if (this.matchAssign()) {
                            if (!this.context.isAssignmentTarget) this.tolerateError(messages_1.Messages.InvalidLHSInAssignment);
                            if (this.context.strict && expr.type === syntax_1.Syntax.Identifier) {
                                var id = expr;
                                if (this.scanner.isRestrictedWord(id.name)) this.tolerateUnexpectedToken(token, messages_1.Messages.StrictLHSAssignment);
                                if (this.scanner.isStrictModeReservedWord(id.name)) this.tolerateUnexpectedToken(token, messages_1.Messages.StrictReservedWord);
                            }
                            if (!this.match('=')) {
                                this.context.isAssignmentTarget = false;
                                this.context.isBindingElement = false;
                            } else this.reinterpretExpressionAsPattern(expr);
                            token = this.nextToken();
                            var operator = token.value;
                            var right = this.isolateCoverGrammar(this.parseAssignmentExpression);
                            expr = this.finalize(this.startNode(startToken), new Node.AssignmentExpression(operator, expr, right));
                            this.context.firstCoverInitializedNameError = null;
                        }
                    }
                    return expr;
                };
                // https://tc39.github.io/ecma262/#sec-comma-operator
                Parser.prototype.parseExpression = function() {
                    var startToken = this.lookahead;
                    var expr = this.isolateCoverGrammar(this.parseAssignmentExpression);
                    if (this.match(',')) {
                        var expressions = [];
                        expressions.push(expr);
                        while(this.lookahead.type !== 2 /* EOF */ ){
                            if (!this.match(',')) break;
                            this.nextToken();
                            expressions.push(this.isolateCoverGrammar(this.parseAssignmentExpression));
                        }
                        expr = this.finalize(this.startNode(startToken), new Node.SequenceExpression(expressions));
                    }
                    return expr;
                };
                // https://tc39.github.io/ecma262/#sec-block
                Parser.prototype.parseStatementListItem = function() {
                    var statement;
                    this.context.isAssignmentTarget = true;
                    this.context.isBindingElement = true;
                    if (this.lookahead.type === 4 /* Keyword */ ) switch(this.lookahead.value){
                        case 'export':
                            if (!this.context.isModule) this.tolerateUnexpectedToken(this.lookahead, messages_1.Messages.IllegalExportDeclaration);
                            statement = this.parseExportDeclaration();
                            break;
                        case 'import':
                            if (!this.context.isModule) this.tolerateUnexpectedToken(this.lookahead, messages_1.Messages.IllegalImportDeclaration);
                            statement = this.parseImportDeclaration();
                            break;
                        case 'const':
                            statement = this.parseLexicalDeclaration({
                                inFor: false
                            });
                            break;
                        case 'function':
                            statement = this.parseFunctionDeclaration();
                            break;
                        case 'class':
                            statement = this.parseClassDeclaration();
                            break;
                        case 'let':
                            statement = this.isLexicalDeclaration() ? this.parseLexicalDeclaration({
                                inFor: false
                            }) : this.parseStatement();
                            break;
                        default:
                            statement = this.parseStatement();
                            break;
                    }
                    else statement = this.parseStatement();
                    return statement;
                };
                Parser.prototype.parseBlock = function() {
                    var node = this.createNode();
                    this.expect('{');
                    var block = [];
                    while(true){
                        if (this.match('}')) break;
                        block.push(this.parseStatementListItem());
                    }
                    this.expect('}');
                    return this.finalize(node, new Node.BlockStatement(block));
                };
                // https://tc39.github.io/ecma262/#sec-let-and-const-declarations
                Parser.prototype.parseLexicalBinding = function(kind, options) {
                    var node = this.createNode();
                    var params = [];
                    var id = this.parsePattern(params, kind);
                    if (this.context.strict && id.type === syntax_1.Syntax.Identifier) {
                        if (this.scanner.isRestrictedWord(id.name)) this.tolerateError(messages_1.Messages.StrictVarName);
                    }
                    var init = null;
                    if (kind === 'const') {
                        if (!this.matchKeyword('in') && !this.matchContextualKeyword('of')) {
                            if (this.match('=')) {
                                this.nextToken();
                                init = this.isolateCoverGrammar(this.parseAssignmentExpression);
                            } else this.throwError(messages_1.Messages.DeclarationMissingInitializer, 'const');
                        }
                    } else if (!options.inFor && id.type !== syntax_1.Syntax.Identifier || this.match('=')) {
                        this.expect('=');
                        init = this.isolateCoverGrammar(this.parseAssignmentExpression);
                    }
                    return this.finalize(node, new Node.VariableDeclarator(id, init));
                };
                Parser.prototype.parseBindingList = function(kind, options) {
                    var list = [
                        this.parseLexicalBinding(kind, options)
                    ];
                    while(this.match(',')){
                        this.nextToken();
                        list.push(this.parseLexicalBinding(kind, options));
                    }
                    return list;
                };
                Parser.prototype.isLexicalDeclaration = function() {
                    var state = this.scanner.saveState();
                    this.scanner.scanComments();
                    var next = this.scanner.lex();
                    this.scanner.restoreState(state);
                    return next.type === 3 /* Identifier */  || next.type === 7 /* Punctuator */  && next.value === '[' || next.type === 7 /* Punctuator */  && next.value === '{' || next.type === 4 /* Keyword */  && next.value === 'let' || next.type === 4 /* Keyword */  && next.value === 'yield';
                };
                Parser.prototype.parseLexicalDeclaration = function(options) {
                    var node = this.createNode();
                    var kind = this.nextToken().value;
                    assert_1.assert(kind === 'let' || kind === 'const', 'Lexical declaration must be either let or const');
                    var declarations = this.parseBindingList(kind, options);
                    this.consumeSemicolon();
                    return this.finalize(node, new Node.VariableDeclaration(declarations, kind));
                };
                // https://tc39.github.io/ecma262/#sec-destructuring-binding-patterns
                Parser.prototype.parseBindingRestElement = function(params, kind) {
                    var node = this.createNode();
                    this.expect('...');
                    var arg = this.parsePattern(params, kind);
                    return this.finalize(node, new Node.RestElement(arg));
                };
                Parser.prototype.parseArrayPattern = function(params, kind) {
                    var node = this.createNode();
                    this.expect('[');
                    var elements = [];
                    while(!this.match(']'))if (this.match(',')) {
                        this.nextToken();
                        elements.push(null);
                    } else {
                        if (this.match('...')) {
                            elements.push(this.parseBindingRestElement(params, kind));
                            break;
                        } else elements.push(this.parsePatternWithDefault(params, kind));
                        if (!this.match(']')) this.expect(',');
                    }
                    this.expect(']');
                    return this.finalize(node, new Node.ArrayPattern(elements));
                };
                Parser.prototype.parsePropertyPattern = function(params, kind) {
                    var node = this.createNode();
                    var computed = false;
                    var shorthand = false;
                    var method = false;
                    var key;
                    var value;
                    if (this.lookahead.type === 3 /* Identifier */ ) {
                        var keyToken = this.lookahead;
                        key = this.parseVariableIdentifier();
                        var init = this.finalize(node, new Node.Identifier(keyToken.value));
                        if (this.match('=')) {
                            params.push(keyToken);
                            shorthand = true;
                            this.nextToken();
                            var expr = this.parseAssignmentExpression();
                            value = this.finalize(this.startNode(keyToken), new Node.AssignmentPattern(init, expr));
                        } else if (!this.match(':')) {
                            params.push(keyToken);
                            shorthand = true;
                            value = init;
                        } else {
                            this.expect(':');
                            value = this.parsePatternWithDefault(params, kind);
                        }
                    } else {
                        computed = this.match('[');
                        key = this.parseObjectPropertyKey();
                        this.expect(':');
                        value = this.parsePatternWithDefault(params, kind);
                    }
                    return this.finalize(node, new Node.Property('init', key, computed, value, method, shorthand));
                };
                Parser.prototype.parseObjectPattern = function(params, kind) {
                    var node = this.createNode();
                    var properties = [];
                    this.expect('{');
                    while(!this.match('}')){
                        properties.push(this.parsePropertyPattern(params, kind));
                        if (!this.match('}')) this.expect(',');
                    }
                    this.expect('}');
                    return this.finalize(node, new Node.ObjectPattern(properties));
                };
                Parser.prototype.parsePattern = function(params, kind) {
                    var pattern;
                    if (this.match('[')) pattern = this.parseArrayPattern(params, kind);
                    else if (this.match('{')) pattern = this.parseObjectPattern(params, kind);
                    else {
                        if (this.matchKeyword('let') && (kind === 'const' || kind === 'let')) this.tolerateUnexpectedToken(this.lookahead, messages_1.Messages.LetInLexicalBinding);
                        params.push(this.lookahead);
                        pattern = this.parseVariableIdentifier(kind);
                    }
                    return pattern;
                };
                Parser.prototype.parsePatternWithDefault = function(params, kind) {
                    var startToken = this.lookahead;
                    var pattern = this.parsePattern(params, kind);
                    if (this.match('=')) {
                        this.nextToken();
                        var previousAllowYield = this.context.allowYield;
                        this.context.allowYield = true;
                        var right = this.isolateCoverGrammar(this.parseAssignmentExpression);
                        this.context.allowYield = previousAllowYield;
                        pattern = this.finalize(this.startNode(startToken), new Node.AssignmentPattern(pattern, right));
                    }
                    return pattern;
                };
                // https://tc39.github.io/ecma262/#sec-variable-statement
                Parser.prototype.parseVariableIdentifier = function(kind) {
                    var node = this.createNode();
                    var token = this.nextToken();
                    if (token.type === 4 /* Keyword */  && token.value === 'yield') {
                        if (this.context.strict) this.tolerateUnexpectedToken(token, messages_1.Messages.StrictReservedWord);
                        else if (!this.context.allowYield) this.throwUnexpectedToken(token);
                    } else if (token.type !== 3 /* Identifier */ ) {
                        if (this.context.strict && token.type === 4 /* Keyword */  && this.scanner.isStrictModeReservedWord(token.value)) this.tolerateUnexpectedToken(token, messages_1.Messages.StrictReservedWord);
                        else if (this.context.strict || token.value !== 'let' || kind !== 'var') this.throwUnexpectedToken(token);
                    } else if ((this.context.isModule || this.context.await) && token.type === 3 /* Identifier */  && token.value === 'await') this.tolerateUnexpectedToken(token);
                    return this.finalize(node, new Node.Identifier(token.value));
                };
                Parser.prototype.parseVariableDeclaration = function(options) {
                    var node = this.createNode();
                    var params = [];
                    var id = this.parsePattern(params, 'var');
                    if (this.context.strict && id.type === syntax_1.Syntax.Identifier) {
                        if (this.scanner.isRestrictedWord(id.name)) this.tolerateError(messages_1.Messages.StrictVarName);
                    }
                    var init = null;
                    if (this.match('=')) {
                        this.nextToken();
                        init = this.isolateCoverGrammar(this.parseAssignmentExpression);
                    } else if (id.type !== syntax_1.Syntax.Identifier && !options.inFor) this.expect('=');
                    return this.finalize(node, new Node.VariableDeclarator(id, init));
                };
                Parser.prototype.parseVariableDeclarationList = function(options) {
                    var opt = {
                        inFor: options.inFor
                    };
                    var list = [];
                    list.push(this.parseVariableDeclaration(opt));
                    while(this.match(',')){
                        this.nextToken();
                        list.push(this.parseVariableDeclaration(opt));
                    }
                    return list;
                };
                Parser.prototype.parseVariableStatement = function() {
                    var node = this.createNode();
                    this.expectKeyword('var');
                    var declarations = this.parseVariableDeclarationList({
                        inFor: false
                    });
                    this.consumeSemicolon();
                    return this.finalize(node, new Node.VariableDeclaration(declarations, 'var'));
                };
                // https://tc39.github.io/ecma262/#sec-empty-statement
                Parser.prototype.parseEmptyStatement = function() {
                    var node = this.createNode();
                    this.expect(';');
                    return this.finalize(node, new Node.EmptyStatement());
                };
                // https://tc39.github.io/ecma262/#sec-expression-statement
                Parser.prototype.parseExpressionStatement = function() {
                    var node = this.createNode();
                    var expr = this.parseExpression();
                    this.consumeSemicolon();
                    return this.finalize(node, new Node.ExpressionStatement(expr));
                };
                // https://tc39.github.io/ecma262/#sec-if-statement
                Parser.prototype.parseIfClause = function() {
                    if (this.context.strict && this.matchKeyword('function')) this.tolerateError(messages_1.Messages.StrictFunction);
                    return this.parseStatement();
                };
                Parser.prototype.parseIfStatement = function() {
                    var node = this.createNode();
                    var consequent;
                    var alternate = null;
                    this.expectKeyword('if');
                    this.expect('(');
                    var test = this.parseExpression();
                    if (!this.match(')') && this.config.tolerant) {
                        this.tolerateUnexpectedToken(this.nextToken());
                        consequent = this.finalize(this.createNode(), new Node.EmptyStatement());
                    } else {
                        this.expect(')');
                        consequent = this.parseIfClause();
                        if (this.matchKeyword('else')) {
                            this.nextToken();
                            alternate = this.parseIfClause();
                        }
                    }
                    return this.finalize(node, new Node.IfStatement(test, consequent, alternate));
                };
                // https://tc39.github.io/ecma262/#sec-do-while-statement
                Parser.prototype.parseDoWhileStatement = function() {
                    var node = this.createNode();
                    this.expectKeyword('do');
                    var previousInIteration = this.context.inIteration;
                    this.context.inIteration = true;
                    var body = this.parseStatement();
                    this.context.inIteration = previousInIteration;
                    this.expectKeyword('while');
                    this.expect('(');
                    var test = this.parseExpression();
                    if (!this.match(')') && this.config.tolerant) this.tolerateUnexpectedToken(this.nextToken());
                    else {
                        this.expect(')');
                        if (this.match(';')) this.nextToken();
                    }
                    return this.finalize(node, new Node.DoWhileStatement(body, test));
                };
                // https://tc39.github.io/ecma262/#sec-while-statement
                Parser.prototype.parseWhileStatement = function() {
                    var node = this.createNode();
                    var body;
                    this.expectKeyword('while');
                    this.expect('(');
                    var test = this.parseExpression();
                    if (!this.match(')') && this.config.tolerant) {
                        this.tolerateUnexpectedToken(this.nextToken());
                        body = this.finalize(this.createNode(), new Node.EmptyStatement());
                    } else {
                        this.expect(')');
                        var previousInIteration = this.context.inIteration;
                        this.context.inIteration = true;
                        body = this.parseStatement();
                        this.context.inIteration = previousInIteration;
                    }
                    return this.finalize(node, new Node.WhileStatement(test, body));
                };
                // https://tc39.github.io/ecma262/#sec-for-statement
                // https://tc39.github.io/ecma262/#sec-for-in-and-for-of-statements
                Parser.prototype.parseForStatement = function() {
                    var init = null;
                    var test = null;
                    var update = null;
                    var forIn = true;
                    var left, right;
                    var node = this.createNode();
                    this.expectKeyword('for');
                    this.expect('(');
                    if (this.match(';')) this.nextToken();
                    else {
                        if (this.matchKeyword('var')) {
                            init = this.createNode();
                            this.nextToken();
                            var previousAllowIn = this.context.allowIn;
                            this.context.allowIn = false;
                            var declarations = this.parseVariableDeclarationList({
                                inFor: true
                            });
                            this.context.allowIn = previousAllowIn;
                            if (declarations.length === 1 && this.matchKeyword('in')) {
                                var decl = declarations[0];
                                if (decl.init && (decl.id.type === syntax_1.Syntax.ArrayPattern || decl.id.type === syntax_1.Syntax.ObjectPattern || this.context.strict)) this.tolerateError(messages_1.Messages.ForInOfLoopInitializer, 'for-in');
                                init = this.finalize(init, new Node.VariableDeclaration(declarations, 'var'));
                                this.nextToken();
                                left = init;
                                right = this.parseExpression();
                                init = null;
                            } else if (declarations.length === 1 && declarations[0].init === null && this.matchContextualKeyword('of')) {
                                init = this.finalize(init, new Node.VariableDeclaration(declarations, 'var'));
                                this.nextToken();
                                left = init;
                                right = this.parseAssignmentExpression();
                                init = null;
                                forIn = false;
                            } else {
                                init = this.finalize(init, new Node.VariableDeclaration(declarations, 'var'));
                                this.expect(';');
                            }
                        } else if (this.matchKeyword('const') || this.matchKeyword('let')) {
                            init = this.createNode();
                            var kind = this.nextToken().value;
                            if (!this.context.strict && this.lookahead.value === 'in') {
                                init = this.finalize(init, new Node.Identifier(kind));
                                this.nextToken();
                                left = init;
                                right = this.parseExpression();
                                init = null;
                            } else {
                                var previousAllowIn = this.context.allowIn;
                                this.context.allowIn = false;
                                var declarations = this.parseBindingList(kind, {
                                    inFor: true
                                });
                                this.context.allowIn = previousAllowIn;
                                if (declarations.length === 1 && declarations[0].init === null && this.matchKeyword('in')) {
                                    init = this.finalize(init, new Node.VariableDeclaration(declarations, kind));
                                    this.nextToken();
                                    left = init;
                                    right = this.parseExpression();
                                    init = null;
                                } else if (declarations.length === 1 && declarations[0].init === null && this.matchContextualKeyword('of')) {
                                    init = this.finalize(init, new Node.VariableDeclaration(declarations, kind));
                                    this.nextToken();
                                    left = init;
                                    right = this.parseAssignmentExpression();
                                    init = null;
                                    forIn = false;
                                } else {
                                    this.consumeSemicolon();
                                    init = this.finalize(init, new Node.VariableDeclaration(declarations, kind));
                                }
                            }
                        } else {
                            var initStartToken = this.lookahead;
                            var previousAllowIn = this.context.allowIn;
                            this.context.allowIn = false;
                            init = this.inheritCoverGrammar(this.parseAssignmentExpression);
                            this.context.allowIn = previousAllowIn;
                            if (this.matchKeyword('in')) {
                                if (!this.context.isAssignmentTarget || init.type === syntax_1.Syntax.AssignmentExpression) this.tolerateError(messages_1.Messages.InvalidLHSInForIn);
                                this.nextToken();
                                this.reinterpretExpressionAsPattern(init);
                                left = init;
                                right = this.parseExpression();
                                init = null;
                            } else if (this.matchContextualKeyword('of')) {
                                if (!this.context.isAssignmentTarget || init.type === syntax_1.Syntax.AssignmentExpression) this.tolerateError(messages_1.Messages.InvalidLHSInForLoop);
                                this.nextToken();
                                this.reinterpretExpressionAsPattern(init);
                                left = init;
                                right = this.parseAssignmentExpression();
                                init = null;
                                forIn = false;
                            } else {
                                if (this.match(',')) {
                                    var initSeq = [
                                        init
                                    ];
                                    while(this.match(',')){
                                        this.nextToken();
                                        initSeq.push(this.isolateCoverGrammar(this.parseAssignmentExpression));
                                    }
                                    init = this.finalize(this.startNode(initStartToken), new Node.SequenceExpression(initSeq));
                                }
                                this.expect(';');
                            }
                        }
                    }
                    if (typeof left === 'undefined') {
                        if (!this.match(';')) test = this.parseExpression();
                        this.expect(';');
                        if (!this.match(')')) update = this.parseExpression();
                    }
                    var body;
                    if (!this.match(')') && this.config.tolerant) {
                        this.tolerateUnexpectedToken(this.nextToken());
                        body = this.finalize(this.createNode(), new Node.EmptyStatement());
                    } else {
                        this.expect(')');
                        var previousInIteration = this.context.inIteration;
                        this.context.inIteration = true;
                        body = this.isolateCoverGrammar(this.parseStatement);
                        this.context.inIteration = previousInIteration;
                    }
                    return typeof left === 'undefined' ? this.finalize(node, new Node.ForStatement(init, test, update, body)) : forIn ? this.finalize(node, new Node.ForInStatement(left, right, body)) : this.finalize(node, new Node.ForOfStatement(left, right, body));
                };
                // https://tc39.github.io/ecma262/#sec-continue-statement
                Parser.prototype.parseContinueStatement = function() {
                    var node = this.createNode();
                    this.expectKeyword('continue');
                    var label = null;
                    if (this.lookahead.type === 3 /* Identifier */  && !this.hasLineTerminator) {
                        var id = this.parseVariableIdentifier();
                        label = id;
                        var key = '$' + id.name;
                        if (!Object.prototype.hasOwnProperty.call(this.context.labelSet, key)) this.throwError(messages_1.Messages.UnknownLabel, id.name);
                    }
                    this.consumeSemicolon();
                    if (label === null && !this.context.inIteration) this.throwError(messages_1.Messages.IllegalContinue);
                    return this.finalize(node, new Node.ContinueStatement(label));
                };
                // https://tc39.github.io/ecma262/#sec-break-statement
                Parser.prototype.parseBreakStatement = function() {
                    var node = this.createNode();
                    this.expectKeyword('break');
                    var label = null;
                    if (this.lookahead.type === 3 /* Identifier */  && !this.hasLineTerminator) {
                        var id = this.parseVariableIdentifier();
                        var key = '$' + id.name;
                        if (!Object.prototype.hasOwnProperty.call(this.context.labelSet, key)) this.throwError(messages_1.Messages.UnknownLabel, id.name);
                        label = id;
                    }
                    this.consumeSemicolon();
                    if (label === null && !this.context.inIteration && !this.context.inSwitch) this.throwError(messages_1.Messages.IllegalBreak);
                    return this.finalize(node, new Node.BreakStatement(label));
                };
                // https://tc39.github.io/ecma262/#sec-return-statement
                Parser.prototype.parseReturnStatement = function() {
                    if (!this.context.inFunctionBody) this.tolerateError(messages_1.Messages.IllegalReturn);
                    var node = this.createNode();
                    this.expectKeyword('return');
                    var hasArgument = !this.match(';') && !this.match('}') && !this.hasLineTerminator && this.lookahead.type !== 2 /* EOF */  || this.lookahead.type === 8 /* StringLiteral */  || this.lookahead.type === 10 /* Template */ ;
                    var argument = hasArgument ? this.parseExpression() : null;
                    this.consumeSemicolon();
                    return this.finalize(node, new Node.ReturnStatement(argument));
                };
                // https://tc39.github.io/ecma262/#sec-with-statement
                Parser.prototype.parseWithStatement = function() {
                    if (this.context.strict) this.tolerateError(messages_1.Messages.StrictModeWith);
                    var node = this.createNode();
                    var body;
                    this.expectKeyword('with');
                    this.expect('(');
                    var object = this.parseExpression();
                    if (!this.match(')') && this.config.tolerant) {
                        this.tolerateUnexpectedToken(this.nextToken());
                        body = this.finalize(this.createNode(), new Node.EmptyStatement());
                    } else {
                        this.expect(')');
                        body = this.parseStatement();
                    }
                    return this.finalize(node, new Node.WithStatement(object, body));
                };
                // https://tc39.github.io/ecma262/#sec-switch-statement
                Parser.prototype.parseSwitchCase = function() {
                    var node = this.createNode();
                    var test;
                    if (this.matchKeyword('default')) {
                        this.nextToken();
                        test = null;
                    } else {
                        this.expectKeyword('case');
                        test = this.parseExpression();
                    }
                    this.expect(':');
                    var consequent = [];
                    while(true){
                        if (this.match('}') || this.matchKeyword('default') || this.matchKeyword('case')) break;
                        consequent.push(this.parseStatementListItem());
                    }
                    return this.finalize(node, new Node.SwitchCase(test, consequent));
                };
                Parser.prototype.parseSwitchStatement = function() {
                    var node = this.createNode();
                    this.expectKeyword('switch');
                    this.expect('(');
                    var discriminant = this.parseExpression();
                    this.expect(')');
                    var previousInSwitch = this.context.inSwitch;
                    this.context.inSwitch = true;
                    var cases = [];
                    var defaultFound = false;
                    this.expect('{');
                    while(true){
                        if (this.match('}')) break;
                        var clause = this.parseSwitchCase();
                        if (clause.test === null) {
                            if (defaultFound) this.throwError(messages_1.Messages.MultipleDefaultsInSwitch);
                            defaultFound = true;
                        }
                        cases.push(clause);
                    }
                    this.expect('}');
                    this.context.inSwitch = previousInSwitch;
                    return this.finalize(node, new Node.SwitchStatement(discriminant, cases));
                };
                // https://tc39.github.io/ecma262/#sec-labelled-statements
                Parser.prototype.parseLabelledStatement = function() {
                    var node = this.createNode();
                    var expr = this.parseExpression();
                    var statement;
                    if (expr.type === syntax_1.Syntax.Identifier && this.match(':')) {
                        this.nextToken();
                        var id = expr;
                        var key = '$' + id.name;
                        if (Object.prototype.hasOwnProperty.call(this.context.labelSet, key)) this.throwError(messages_1.Messages.Redeclaration, 'Label', id.name);
                        this.context.labelSet[key] = true;
                        var body = void 0;
                        if (this.matchKeyword('class')) {
                            this.tolerateUnexpectedToken(this.lookahead);
                            body = this.parseClassDeclaration();
                        } else if (this.matchKeyword('function')) {
                            var token = this.lookahead;
                            var declaration = this.parseFunctionDeclaration();
                            if (this.context.strict) this.tolerateUnexpectedToken(token, messages_1.Messages.StrictFunction);
                            else if (declaration.generator) this.tolerateUnexpectedToken(token, messages_1.Messages.GeneratorInLegacyContext);
                            body = declaration;
                        } else body = this.parseStatement();
                        delete this.context.labelSet[key];
                        statement = new Node.LabeledStatement(id, body);
                    } else {
                        this.consumeSemicolon();
                        statement = new Node.ExpressionStatement(expr);
                    }
                    return this.finalize(node, statement);
                };
                // https://tc39.github.io/ecma262/#sec-throw-statement
                Parser.prototype.parseThrowStatement = function() {
                    var node = this.createNode();
                    this.expectKeyword('throw');
                    if (this.hasLineTerminator) this.throwError(messages_1.Messages.NewlineAfterThrow);
                    var argument = this.parseExpression();
                    this.consumeSemicolon();
                    return this.finalize(node, new Node.ThrowStatement(argument));
                };
                // https://tc39.github.io/ecma262/#sec-try-statement
                Parser.prototype.parseCatchClause = function() {
                    var node = this.createNode();
                    this.expectKeyword('catch');
                    this.expect('(');
                    if (this.match(')')) this.throwUnexpectedToken(this.lookahead);
                    var params = [];
                    var param = this.parsePattern(params);
                    var paramMap = {};
                    for(var i = 0; i < params.length; i++){
                        var key = '$' + params[i].value;
                        if (Object.prototype.hasOwnProperty.call(paramMap, key)) this.tolerateError(messages_1.Messages.DuplicateBinding, params[i].value);
                        paramMap[key] = true;
                    }
                    if (this.context.strict && param.type === syntax_1.Syntax.Identifier) {
                        if (this.scanner.isRestrictedWord(param.name)) this.tolerateError(messages_1.Messages.StrictCatchVariable);
                    }
                    this.expect(')');
                    var body = this.parseBlock();
                    return this.finalize(node, new Node.CatchClause(param, body));
                };
                Parser.prototype.parseFinallyClause = function() {
                    this.expectKeyword('finally');
                    return this.parseBlock();
                };
                Parser.prototype.parseTryStatement = function() {
                    var node = this.createNode();
                    this.expectKeyword('try');
                    var block = this.parseBlock();
                    var handler = this.matchKeyword('catch') ? this.parseCatchClause() : null;
                    var finalizer = this.matchKeyword('finally') ? this.parseFinallyClause() : null;
                    if (!handler && !finalizer) this.throwError(messages_1.Messages.NoCatchOrFinally);
                    return this.finalize(node, new Node.TryStatement(block, handler, finalizer));
                };
                // https://tc39.github.io/ecma262/#sec-debugger-statement
                Parser.prototype.parseDebuggerStatement = function() {
                    var node = this.createNode();
                    this.expectKeyword('debugger');
                    this.consumeSemicolon();
                    return this.finalize(node, new Node.DebuggerStatement());
                };
                // https://tc39.github.io/ecma262/#sec-ecmascript-language-statements-and-declarations
                Parser.prototype.parseStatement = function() {
                    var statement;
                    switch(this.lookahead.type){
                        case 1 /* BooleanLiteral */ :
                        case 5 /* NullLiteral */ :
                        case 6 /* NumericLiteral */ :
                        case 8 /* StringLiteral */ :
                        case 10 /* Template */ :
                        case 9 /* RegularExpression */ :
                            statement = this.parseExpressionStatement();
                            break;
                        case 7 /* Punctuator */ :
                            var value = this.lookahead.value;
                            if (value === '{') statement = this.parseBlock();
                            else if (value === '(') statement = this.parseExpressionStatement();
                            else if (value === ';') statement = this.parseEmptyStatement();
                            else statement = this.parseExpressionStatement();
                            break;
                        case 3 /* Identifier */ :
                            statement = this.matchAsyncFunction() ? this.parseFunctionDeclaration() : this.parseLabelledStatement();
                            break;
                        case 4 /* Keyword */ :
                            switch(this.lookahead.value){
                                case 'break':
                                    statement = this.parseBreakStatement();
                                    break;
                                case 'continue':
                                    statement = this.parseContinueStatement();
                                    break;
                                case 'debugger':
                                    statement = this.parseDebuggerStatement();
                                    break;
                                case 'do':
                                    statement = this.parseDoWhileStatement();
                                    break;
                                case 'for':
                                    statement = this.parseForStatement();
                                    break;
                                case 'function':
                                    statement = this.parseFunctionDeclaration();
                                    break;
                                case 'if':
                                    statement = this.parseIfStatement();
                                    break;
                                case 'return':
                                    statement = this.parseReturnStatement();
                                    break;
                                case 'switch':
                                    statement = this.parseSwitchStatement();
                                    break;
                                case 'throw':
                                    statement = this.parseThrowStatement();
                                    break;
                                case 'try':
                                    statement = this.parseTryStatement();
                                    break;
                                case 'var':
                                    statement = this.parseVariableStatement();
                                    break;
                                case 'while':
                                    statement = this.parseWhileStatement();
                                    break;
                                case 'with':
                                    statement = this.parseWithStatement();
                                    break;
                                default:
                                    statement = this.parseExpressionStatement();
                                    break;
                            }
                            break;
                        default:
                            statement = this.throwUnexpectedToken(this.lookahead);
                    }
                    return statement;
                };
                // https://tc39.github.io/ecma262/#sec-function-definitions
                Parser.prototype.parseFunctionSourceElements = function() {
                    var node = this.createNode();
                    this.expect('{');
                    var body = this.parseDirectivePrologues();
                    var previousLabelSet = this.context.labelSet;
                    var previousInIteration = this.context.inIteration;
                    var previousInSwitch = this.context.inSwitch;
                    var previousInFunctionBody = this.context.inFunctionBody;
                    this.context.labelSet = {};
                    this.context.inIteration = false;
                    this.context.inSwitch = false;
                    this.context.inFunctionBody = true;
                    while(this.lookahead.type !== 2 /* EOF */ ){
                        if (this.match('}')) break;
                        body.push(this.parseStatementListItem());
                    }
                    this.expect('}');
                    this.context.labelSet = previousLabelSet;
                    this.context.inIteration = previousInIteration;
                    this.context.inSwitch = previousInSwitch;
                    this.context.inFunctionBody = previousInFunctionBody;
                    return this.finalize(node, new Node.BlockStatement(body));
                };
                Parser.prototype.validateParam = function(options, param, name) {
                    var key = '$' + name;
                    if (this.context.strict) {
                        if (this.scanner.isRestrictedWord(name)) {
                            options.stricted = param;
                            options.message = messages_1.Messages.StrictParamName;
                        }
                        if (Object.prototype.hasOwnProperty.call(options.paramSet, key)) {
                            options.stricted = param;
                            options.message = messages_1.Messages.StrictParamDupe;
                        }
                    } else if (!options.firstRestricted) {
                        if (this.scanner.isRestrictedWord(name)) {
                            options.firstRestricted = param;
                            options.message = messages_1.Messages.StrictParamName;
                        } else if (this.scanner.isStrictModeReservedWord(name)) {
                            options.firstRestricted = param;
                            options.message = messages_1.Messages.StrictReservedWord;
                        } else if (Object.prototype.hasOwnProperty.call(options.paramSet, key)) {
                            options.stricted = param;
                            options.message = messages_1.Messages.StrictParamDupe;
                        }
                    }
                    /* istanbul ignore next */ if (typeof Object.defineProperty === 'function') Object.defineProperty(options.paramSet, key, {
                        value: true,
                        enumerable: true,
                        writable: true,
                        configurable: true
                    });
                    else options.paramSet[key] = true;
                };
                Parser.prototype.parseRestElement = function(params) {
                    var node = this.createNode();
                    this.expect('...');
                    var arg = this.parsePattern(params);
                    if (this.match('=')) this.throwError(messages_1.Messages.DefaultRestParameter);
                    if (!this.match(')')) this.throwError(messages_1.Messages.ParameterAfterRestParameter);
                    return this.finalize(node, new Node.RestElement(arg));
                };
                Parser.prototype.parseFormalParameter = function(options) {
                    var params = [];
                    var param = this.match('...') ? this.parseRestElement(params) : this.parsePatternWithDefault(params);
                    for(var i = 0; i < params.length; i++)this.validateParam(options, params[i], params[i].value);
                    options.simple = options.simple && param instanceof Node.Identifier;
                    options.params.push(param);
                };
                Parser.prototype.parseFormalParameters = function(firstRestricted) {
                    var options;
                    options = {
                        simple: true,
                        params: [],
                        firstRestricted: firstRestricted
                    };
                    this.expect('(');
                    if (!this.match(')')) {
                        options.paramSet = {};
                        while(this.lookahead.type !== 2 /* EOF */ ){
                            this.parseFormalParameter(options);
                            if (this.match(')')) break;
                            this.expect(',');
                            if (this.match(')')) break;
                        }
                    }
                    this.expect(')');
                    return {
                        simple: options.simple,
                        params: options.params,
                        stricted: options.stricted,
                        firstRestricted: options.firstRestricted,
                        message: options.message
                    };
                };
                Parser.prototype.matchAsyncFunction = function() {
                    var match = this.matchContextualKeyword('async');
                    if (match) {
                        var state = this.scanner.saveState();
                        this.scanner.scanComments();
                        var next = this.scanner.lex();
                        this.scanner.restoreState(state);
                        match = state.lineNumber === next.lineNumber && next.type === 4 /* Keyword */  && next.value === 'function';
                    }
                    return match;
                };
                Parser.prototype.parseFunctionDeclaration = function(identifierIsOptional) {
                    var node = this.createNode();
                    var isAsync = this.matchContextualKeyword('async');
                    if (isAsync) this.nextToken();
                    this.expectKeyword('function');
                    var isGenerator = isAsync ? false : this.match('*');
                    if (isGenerator) this.nextToken();
                    var message;
                    var id = null;
                    var firstRestricted = null;
                    if (!identifierIsOptional || !this.match('(')) {
                        var token = this.lookahead;
                        id = this.parseVariableIdentifier();
                        if (this.context.strict) {
                            if (this.scanner.isRestrictedWord(token.value)) this.tolerateUnexpectedToken(token, messages_1.Messages.StrictFunctionName);
                        } else {
                            if (this.scanner.isRestrictedWord(token.value)) {
                                firstRestricted = token;
                                message = messages_1.Messages.StrictFunctionName;
                            } else if (this.scanner.isStrictModeReservedWord(token.value)) {
                                firstRestricted = token;
                                message = messages_1.Messages.StrictReservedWord;
                            }
                        }
                    }
                    var previousAllowAwait = this.context.await;
                    var previousAllowYield = this.context.allowYield;
                    this.context.await = isAsync;
                    this.context.allowYield = !isGenerator;
                    var formalParameters = this.parseFormalParameters(firstRestricted);
                    var params = formalParameters.params;
                    var stricted = formalParameters.stricted;
                    firstRestricted = formalParameters.firstRestricted;
                    if (formalParameters.message) message = formalParameters.message;
                    var previousStrict = this.context.strict;
                    var previousAllowStrictDirective = this.context.allowStrictDirective;
                    this.context.allowStrictDirective = formalParameters.simple;
                    var body = this.parseFunctionSourceElements();
                    if (this.context.strict && firstRestricted) this.throwUnexpectedToken(firstRestricted, message);
                    if (this.context.strict && stricted) this.tolerateUnexpectedToken(stricted, message);
                    this.context.strict = previousStrict;
                    this.context.allowStrictDirective = previousAllowStrictDirective;
                    this.context.await = previousAllowAwait;
                    this.context.allowYield = previousAllowYield;
                    return isAsync ? this.finalize(node, new Node.AsyncFunctionDeclaration(id, params, body)) : this.finalize(node, new Node.FunctionDeclaration(id, params, body, isGenerator));
                };
                Parser.prototype.parseFunctionExpression = function() {
                    var node = this.createNode();
                    var isAsync = this.matchContextualKeyword('async');
                    if (isAsync) this.nextToken();
                    this.expectKeyword('function');
                    var isGenerator = isAsync ? false : this.match('*');
                    if (isGenerator) this.nextToken();
                    var message;
                    var id = null;
                    var firstRestricted;
                    var previousAllowAwait = this.context.await;
                    var previousAllowYield = this.context.allowYield;
                    this.context.await = isAsync;
                    this.context.allowYield = !isGenerator;
                    if (!this.match('(')) {
                        var token = this.lookahead;
                        id = !this.context.strict && !isGenerator && this.matchKeyword('yield') ? this.parseIdentifierName() : this.parseVariableIdentifier();
                        if (this.context.strict) {
                            if (this.scanner.isRestrictedWord(token.value)) this.tolerateUnexpectedToken(token, messages_1.Messages.StrictFunctionName);
                        } else {
                            if (this.scanner.isRestrictedWord(token.value)) {
                                firstRestricted = token;
                                message = messages_1.Messages.StrictFunctionName;
                            } else if (this.scanner.isStrictModeReservedWord(token.value)) {
                                firstRestricted = token;
                                message = messages_1.Messages.StrictReservedWord;
                            }
                        }
                    }
                    var formalParameters = this.parseFormalParameters(firstRestricted);
                    var params = formalParameters.params;
                    var stricted = formalParameters.stricted;
                    firstRestricted = formalParameters.firstRestricted;
                    if (formalParameters.message) message = formalParameters.message;
                    var previousStrict = this.context.strict;
                    var previousAllowStrictDirective = this.context.allowStrictDirective;
                    this.context.allowStrictDirective = formalParameters.simple;
                    var body = this.parseFunctionSourceElements();
                    if (this.context.strict && firstRestricted) this.throwUnexpectedToken(firstRestricted, message);
                    if (this.context.strict && stricted) this.tolerateUnexpectedToken(stricted, message);
                    this.context.strict = previousStrict;
                    this.context.allowStrictDirective = previousAllowStrictDirective;
                    this.context.await = previousAllowAwait;
                    this.context.allowYield = previousAllowYield;
                    return isAsync ? this.finalize(node, new Node.AsyncFunctionExpression(id, params, body)) : this.finalize(node, new Node.FunctionExpression(id, params, body, isGenerator));
                };
                // https://tc39.github.io/ecma262/#sec-directive-prologues-and-the-use-strict-directive
                Parser.prototype.parseDirective = function() {
                    var token = this.lookahead;
                    var node = this.createNode();
                    var expr = this.parseExpression();
                    var directive = expr.type === syntax_1.Syntax.Literal ? this.getTokenRaw(token).slice(1, -1) : null;
                    this.consumeSemicolon();
                    return this.finalize(node, directive ? new Node.Directive(expr, directive) : new Node.ExpressionStatement(expr));
                };
                Parser.prototype.parseDirectivePrologues = function() {
                    var firstRestricted = null;
                    var body = [];
                    while(true){
                        var token = this.lookahead;
                        if (token.type !== 8 /* StringLiteral */ ) break;
                        var statement = this.parseDirective();
                        body.push(statement);
                        var directive = statement.directive;
                        if (typeof directive !== 'string') break;
                        if (directive === 'use strict') {
                            this.context.strict = true;
                            if (firstRestricted) this.tolerateUnexpectedToken(firstRestricted, messages_1.Messages.StrictOctalLiteral);
                            if (!this.context.allowStrictDirective) this.tolerateUnexpectedToken(token, messages_1.Messages.IllegalLanguageModeDirective);
                        } else if (!firstRestricted && token.octal) firstRestricted = token;
                    }
                    return body;
                };
                // https://tc39.github.io/ecma262/#sec-method-definitions
                Parser.prototype.qualifiedPropertyName = function(token) {
                    switch(token.type){
                        case 3 /* Identifier */ :
                        case 8 /* StringLiteral */ :
                        case 1 /* BooleanLiteral */ :
                        case 5 /* NullLiteral */ :
                        case 6 /* NumericLiteral */ :
                        case 4 /* Keyword */ :
                            return true;
                        case 7 /* Punctuator */ :
                            return token.value === '[';
                        default:
                            break;
                    }
                    return false;
                };
                Parser.prototype.parseGetterMethod = function() {
                    var node = this.createNode();
                    var isGenerator = false;
                    var previousAllowYield = this.context.allowYield;
                    this.context.allowYield = !isGenerator;
                    var formalParameters = this.parseFormalParameters();
                    if (formalParameters.params.length > 0) this.tolerateError(messages_1.Messages.BadGetterArity);
                    var method = this.parsePropertyMethod(formalParameters);
                    this.context.allowYield = previousAllowYield;
                    return this.finalize(node, new Node.FunctionExpression(null, formalParameters.params, method, isGenerator));
                };
                Parser.prototype.parseSetterMethod = function() {
                    var node = this.createNode();
                    var isGenerator = false;
                    var previousAllowYield = this.context.allowYield;
                    this.context.allowYield = !isGenerator;
                    var formalParameters = this.parseFormalParameters();
                    if (formalParameters.params.length !== 1) this.tolerateError(messages_1.Messages.BadSetterArity);
                    else if (formalParameters.params[0] instanceof Node.RestElement) this.tolerateError(messages_1.Messages.BadSetterRestParameter);
                    var method = this.parsePropertyMethod(formalParameters);
                    this.context.allowYield = previousAllowYield;
                    return this.finalize(node, new Node.FunctionExpression(null, formalParameters.params, method, isGenerator));
                };
                Parser.prototype.parseGeneratorMethod = function() {
                    var node = this.createNode();
                    var isGenerator = true;
                    var previousAllowYield = this.context.allowYield;
                    this.context.allowYield = true;
                    var params = this.parseFormalParameters();
                    this.context.allowYield = false;
                    var method = this.parsePropertyMethod(params);
                    this.context.allowYield = previousAllowYield;
                    return this.finalize(node, new Node.FunctionExpression(null, params.params, method, isGenerator));
                };
                // https://tc39.github.io/ecma262/#sec-generator-function-definitions
                Parser.prototype.isStartOfExpression = function() {
                    var start = true;
                    var value = this.lookahead.value;
                    switch(this.lookahead.type){
                        case 7 /* Punctuator */ :
                            start = value === '[' || value === '(' || value === '{' || value === '+' || value === '-' || value === '!' || value === '~' || value === '++' || value === '--' || value === '/' || value === '/='; // regular expression literal
                            break;
                        case 4 /* Keyword */ :
                            start = value === 'class' || value === 'delete' || value === 'function' || value === 'let' || value === 'new' || value === 'super' || value === 'this' || value === 'typeof' || value === 'void' || value === 'yield';
                            break;
                        default:
                            break;
                    }
                    return start;
                };
                Parser.prototype.parseYieldExpression = function() {
                    var node = this.createNode();
                    this.expectKeyword('yield');
                    var argument = null;
                    var delegate = false;
                    if (!this.hasLineTerminator) {
                        var previousAllowYield = this.context.allowYield;
                        this.context.allowYield = false;
                        delegate = this.match('*');
                        if (delegate) {
                            this.nextToken();
                            argument = this.parseAssignmentExpression();
                        } else if (this.isStartOfExpression()) argument = this.parseAssignmentExpression();
                        this.context.allowYield = previousAllowYield;
                    }
                    return this.finalize(node, new Node.YieldExpression(argument, delegate));
                };
                // https://tc39.github.io/ecma262/#sec-class-definitions
                Parser.prototype.parseClassElement = function(hasConstructor) {
                    var token = this.lookahead;
                    var node = this.createNode();
                    var kind = '';
                    var key = null;
                    var value = null;
                    var computed = false;
                    var method = false;
                    var isStatic = false;
                    var isAsync = false;
                    if (this.match('*')) this.nextToken();
                    else {
                        computed = this.match('[');
                        key = this.parseObjectPropertyKey();
                        var id = key;
                        if (id.name === 'static' && (this.qualifiedPropertyName(this.lookahead) || this.match('*'))) {
                            token = this.lookahead;
                            isStatic = true;
                            computed = this.match('[');
                            if (this.match('*')) this.nextToken();
                            else key = this.parseObjectPropertyKey();
                        }
                        if (token.type === 3 /* Identifier */  && !this.hasLineTerminator && token.value === 'async') {
                            var punctuator = this.lookahead.value;
                            if (punctuator !== ':' && punctuator !== '(' && punctuator !== '*') {
                                isAsync = true;
                                token = this.lookahead;
                                key = this.parseObjectPropertyKey();
                                if (token.type === 3 /* Identifier */  && token.value === 'constructor') this.tolerateUnexpectedToken(token, messages_1.Messages.ConstructorIsAsync);
                            }
                        }
                    }
                    var lookaheadPropertyKey = this.qualifiedPropertyName(this.lookahead);
                    if (token.type === 3 /* Identifier */ ) {
                        if (token.value === 'get' && lookaheadPropertyKey) {
                            kind = 'get';
                            computed = this.match('[');
                            key = this.parseObjectPropertyKey();
                            this.context.allowYield = false;
                            value = this.parseGetterMethod();
                        } else if (token.value === 'set' && lookaheadPropertyKey) {
                            kind = 'set';
                            computed = this.match('[');
                            key = this.parseObjectPropertyKey();
                            value = this.parseSetterMethod();
                        }
                    } else if (token.type === 7 /* Punctuator */  && token.value === '*' && lookaheadPropertyKey) {
                        kind = 'init';
                        computed = this.match('[');
                        key = this.parseObjectPropertyKey();
                        value = this.parseGeneratorMethod();
                        method = true;
                    }
                    if (!kind && key && this.match('(')) {
                        kind = 'init';
                        value = isAsync ? this.parsePropertyMethodAsyncFunction() : this.parsePropertyMethodFunction();
                        method = true;
                    }
                    if (!kind) this.throwUnexpectedToken(this.lookahead);
                    if (kind === 'init') kind = 'method';
                    if (!computed) {
                        if (isStatic && this.isPropertyKey(key, 'prototype')) this.throwUnexpectedToken(token, messages_1.Messages.StaticPrototype);
                        if (!isStatic && this.isPropertyKey(key, 'constructor')) {
                            if (kind !== 'method' || !method || value && value.generator) this.throwUnexpectedToken(token, messages_1.Messages.ConstructorSpecialMethod);
                            if (hasConstructor.value) this.throwUnexpectedToken(token, messages_1.Messages.DuplicateConstructor);
                            else hasConstructor.value = true;
                            kind = 'constructor';
                        }
                    }
                    return this.finalize(node, new Node.MethodDefinition(key, computed, value, kind, isStatic));
                };
                Parser.prototype.parseClassElementList = function() {
                    var body = [];
                    var hasConstructor = {
                        value: false
                    };
                    this.expect('{');
                    while(!this.match('}'))if (this.match(';')) this.nextToken();
                    else body.push(this.parseClassElement(hasConstructor));
                    this.expect('}');
                    return body;
                };
                Parser.prototype.parseClassBody = function() {
                    var node = this.createNode();
                    var elementList = this.parseClassElementList();
                    return this.finalize(node, new Node.ClassBody(elementList));
                };
                Parser.prototype.parseClassDeclaration = function(identifierIsOptional) {
                    var node = this.createNode();
                    var previousStrict = this.context.strict;
                    this.context.strict = true;
                    this.expectKeyword('class');
                    var id = identifierIsOptional && this.lookahead.type !== 3 /* Identifier */  ? null : this.parseVariableIdentifier();
                    var superClass = null;
                    if (this.matchKeyword('extends')) {
                        this.nextToken();
                        superClass = this.isolateCoverGrammar(this.parseLeftHandSideExpressionAllowCall);
                    }
                    var classBody = this.parseClassBody();
                    this.context.strict = previousStrict;
                    return this.finalize(node, new Node.ClassDeclaration(id, superClass, classBody));
                };
                Parser.prototype.parseClassExpression = function() {
                    var node = this.createNode();
                    var previousStrict = this.context.strict;
                    this.context.strict = true;
                    this.expectKeyword('class');
                    var id = this.lookahead.type === 3 /* Identifier */  ? this.parseVariableIdentifier() : null;
                    var superClass = null;
                    if (this.matchKeyword('extends')) {
                        this.nextToken();
                        superClass = this.isolateCoverGrammar(this.parseLeftHandSideExpressionAllowCall);
                    }
                    var classBody = this.parseClassBody();
                    this.context.strict = previousStrict;
                    return this.finalize(node, new Node.ClassExpression(id, superClass, classBody));
                };
                // https://tc39.github.io/ecma262/#sec-scripts
                // https://tc39.github.io/ecma262/#sec-modules
                Parser.prototype.parseModule = function() {
                    this.context.strict = true;
                    this.context.isModule = true;
                    this.scanner.isModule = true;
                    var node = this.createNode();
                    var body = this.parseDirectivePrologues();
                    while(this.lookahead.type !== 2 /* EOF */ )body.push(this.parseStatementListItem());
                    return this.finalize(node, new Node.Module(body));
                };
                Parser.prototype.parseScript = function() {
                    var node = this.createNode();
                    var body = this.parseDirectivePrologues();
                    while(this.lookahead.type !== 2 /* EOF */ )body.push(this.parseStatementListItem());
                    return this.finalize(node, new Node.Script(body));
                };
                // https://tc39.github.io/ecma262/#sec-imports
                Parser.prototype.parseModuleSpecifier = function() {
                    var node = this.createNode();
                    if (this.lookahead.type !== 8 /* StringLiteral */ ) this.throwError(messages_1.Messages.InvalidModuleSpecifier);
                    var token = this.nextToken();
                    var raw = this.getTokenRaw(token);
                    return this.finalize(node, new Node.Literal(token.value, raw));
                };
                // import {<foo as bar>} ...;
                Parser.prototype.parseImportSpecifier = function() {
                    var node = this.createNode();
                    var imported;
                    var local;
                    if (this.lookahead.type === 3 /* Identifier */ ) {
                        imported = this.parseVariableIdentifier();
                        local = imported;
                        if (this.matchContextualKeyword('as')) {
                            this.nextToken();
                            local = this.parseVariableIdentifier();
                        }
                    } else {
                        imported = this.parseIdentifierName();
                        local = imported;
                        if (this.matchContextualKeyword('as')) {
                            this.nextToken();
                            local = this.parseVariableIdentifier();
                        } else this.throwUnexpectedToken(this.nextToken());
                    }
                    return this.finalize(node, new Node.ImportSpecifier(local, imported));
                };
                // {foo, bar as bas}
                Parser.prototype.parseNamedImports = function() {
                    this.expect('{');
                    var specifiers = [];
                    while(!this.match('}')){
                        specifiers.push(this.parseImportSpecifier());
                        if (!this.match('}')) this.expect(',');
                    }
                    this.expect('}');
                    return specifiers;
                };
                // import <foo> ...;
                Parser.prototype.parseImportDefaultSpecifier = function() {
                    var node = this.createNode();
                    var local = this.parseIdentifierName();
                    return this.finalize(node, new Node.ImportDefaultSpecifier(local));
                };
                // import <* as foo> ...;
                Parser.prototype.parseImportNamespaceSpecifier = function() {
                    var node = this.createNode();
                    this.expect('*');
                    if (!this.matchContextualKeyword('as')) this.throwError(messages_1.Messages.NoAsAfterImportNamespace);
                    this.nextToken();
                    var local = this.parseIdentifierName();
                    return this.finalize(node, new Node.ImportNamespaceSpecifier(local));
                };
                Parser.prototype.parseImportDeclaration = function() {
                    if (this.context.inFunctionBody) this.throwError(messages_1.Messages.IllegalImportDeclaration);
                    var node = this.createNode();
                    this.expectKeyword('import');
                    var src;
                    var specifiers = [];
                    if (this.lookahead.type === 8 /* StringLiteral */ ) // import 'foo';
                    src = this.parseModuleSpecifier();
                    else {
                        if (this.match('{')) // import {bar}
                        specifiers = specifiers.concat(this.parseNamedImports());
                        else if (this.match('*')) // import * as foo
                        specifiers.push(this.parseImportNamespaceSpecifier());
                        else if (this.isIdentifierName(this.lookahead) && !this.matchKeyword('default')) {
                            // import foo
                            specifiers.push(this.parseImportDefaultSpecifier());
                            if (this.match(',')) {
                                this.nextToken();
                                if (this.match('*')) // import foo, * as foo
                                specifiers.push(this.parseImportNamespaceSpecifier());
                                else if (this.match('{')) // import foo, {bar}
                                specifiers = specifiers.concat(this.parseNamedImports());
                                else this.throwUnexpectedToken(this.lookahead);
                            }
                        } else this.throwUnexpectedToken(this.nextToken());
                        if (!this.matchContextualKeyword('from')) {
                            var message = this.lookahead.value ? messages_1.Messages.UnexpectedToken : messages_1.Messages.MissingFromClause;
                            this.throwError(message, this.lookahead.value);
                        }
                        this.nextToken();
                        src = this.parseModuleSpecifier();
                    }
                    this.consumeSemicolon();
                    return this.finalize(node, new Node.ImportDeclaration(specifiers, src));
                };
                // https://tc39.github.io/ecma262/#sec-exports
                Parser.prototype.parseExportSpecifier = function() {
                    var node = this.createNode();
                    var local = this.parseIdentifierName();
                    var exported = local;
                    if (this.matchContextualKeyword('as')) {
                        this.nextToken();
                        exported = this.parseIdentifierName();
                    }
                    return this.finalize(node, new Node.ExportSpecifier(local, exported));
                };
                Parser.prototype.parseExportDeclaration = function() {
                    if (this.context.inFunctionBody) this.throwError(messages_1.Messages.IllegalExportDeclaration);
                    var node = this.createNode();
                    this.expectKeyword('export');
                    var exportDeclaration;
                    if (this.matchKeyword('default')) {
                        // export default ...
                        this.nextToken();
                        if (this.matchKeyword('function')) {
                            // export default function foo () {}
                            // export default function () {}
                            var declaration = this.parseFunctionDeclaration(true);
                            exportDeclaration = this.finalize(node, new Node.ExportDefaultDeclaration(declaration));
                        } else if (this.matchKeyword('class')) {
                            // export default class foo {}
                            var declaration = this.parseClassDeclaration(true);
                            exportDeclaration = this.finalize(node, new Node.ExportDefaultDeclaration(declaration));
                        } else if (this.matchContextualKeyword('async')) {
                            // export default async function f () {}
                            // export default async function () {}
                            // export default async x => x
                            var declaration = this.matchAsyncFunction() ? this.parseFunctionDeclaration(true) : this.parseAssignmentExpression();
                            exportDeclaration = this.finalize(node, new Node.ExportDefaultDeclaration(declaration));
                        } else {
                            if (this.matchContextualKeyword('from')) this.throwError(messages_1.Messages.UnexpectedToken, this.lookahead.value);
                            // export default {};
                            // export default [];
                            // export default (1 + 2);
                            var declaration = this.match('{') ? this.parseObjectInitializer() : this.match('[') ? this.parseArrayInitializer() : this.parseAssignmentExpression();
                            this.consumeSemicolon();
                            exportDeclaration = this.finalize(node, new Node.ExportDefaultDeclaration(declaration));
                        }
                    } else if (this.match('*')) {
                        // export * from 'foo';
                        this.nextToken();
                        if (!this.matchContextualKeyword('from')) {
                            var message = this.lookahead.value ? messages_1.Messages.UnexpectedToken : messages_1.Messages.MissingFromClause;
                            this.throwError(message, this.lookahead.value);
                        }
                        this.nextToken();
                        var src = this.parseModuleSpecifier();
                        this.consumeSemicolon();
                        exportDeclaration = this.finalize(node, new Node.ExportAllDeclaration(src));
                    } else if (this.lookahead.type === 4 /* Keyword */ ) {
                        // export var f = 1;
                        var declaration = void 0;
                        switch(this.lookahead.value){
                            case 'let':
                            case 'const':
                                declaration = this.parseLexicalDeclaration({
                                    inFor: false
                                });
                                break;
                            case 'var':
                            case 'class':
                            case 'function':
                                declaration = this.parseStatementListItem();
                                break;
                            default:
                                this.throwUnexpectedToken(this.lookahead);
                        }
                        exportDeclaration = this.finalize(node, new Node.ExportNamedDeclaration(declaration, [], null));
                    } else if (this.matchAsyncFunction()) {
                        var declaration = this.parseFunctionDeclaration();
                        exportDeclaration = this.finalize(node, new Node.ExportNamedDeclaration(declaration, [], null));
                    } else {
                        var specifiers = [];
                        var source = null;
                        var isExportFromIdentifier = false;
                        this.expect('{');
                        while(!this.match('}')){
                            isExportFromIdentifier = isExportFromIdentifier || this.matchKeyword('default');
                            specifiers.push(this.parseExportSpecifier());
                            if (!this.match('}')) this.expect(',');
                        }
                        this.expect('}');
                        if (this.matchContextualKeyword('from')) {
                            // export {default} from 'foo';
                            // export {foo} from 'foo';
                            this.nextToken();
                            source = this.parseModuleSpecifier();
                            this.consumeSemicolon();
                        } else if (isExportFromIdentifier) {
                            // export {default}; // missing fromClause
                            var message = this.lookahead.value ? messages_1.Messages.UnexpectedToken : messages_1.Messages.MissingFromClause;
                            this.throwError(message, this.lookahead.value);
                        } else // export {foo};
                        this.consumeSemicolon();
                        exportDeclaration = this.finalize(node, new Node.ExportNamedDeclaration(null, specifiers, source));
                    }
                    return exportDeclaration;
                };
                return Parser;
            }();
            exports.Parser = Parser;
        /***/ },
        /* 9 */ /***/ function(module1, exports) {
            "use strict";
            // Ensure the condition is true, otherwise throw an error.
            // This is only to have a better contract semantic, i.e. another safety net
            // to catch a logic error. The condition shall be fulfilled in normal case.
            // Do NOT use this to enforce a certain condition on any user input.
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            function assert(condition, message) {
                /* istanbul ignore if */ if (!condition) throw new Error('ASSERT: ' + message);
            }
            exports.assert = assert;
        /***/ },
        /* 10 */ /***/ function(module1, exports) {
            "use strict";
            /* tslint:disable:max-classes-per-file */ Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var ErrorHandler = function() {
                function ErrorHandler() {
                    this.errors = [];
                    this.tolerant = false;
                }
                ErrorHandler.prototype.recordError = function(error) {
                    this.errors.push(error);
                };
                ErrorHandler.prototype.tolerate = function(error) {
                    if (this.tolerant) this.recordError(error);
                    else throw error;
                };
                ErrorHandler.prototype.constructError = function(msg, column) {
                    var error = new Error(msg);
                    try {
                        throw error;
                    } catch (base) {
                        /* istanbul ignore else */ if (Object.create && Object.defineProperty) {
                            error = Object.create(base);
                            Object.defineProperty(error, 'column', {
                                value: column
                            });
                        }
                    }
                    /* istanbul ignore next */ return error;
                };
                ErrorHandler.prototype.createError = function(index, line, col, description) {
                    var msg = 'Line ' + line + ': ' + description;
                    var error = this.constructError(msg, col);
                    error.index = index;
                    error.lineNumber = line;
                    error.description = description;
                    return error;
                };
                ErrorHandler.prototype.throwError = function(index, line, col, description) {
                    throw this.createError(index, line, col, description);
                };
                ErrorHandler.prototype.tolerateError = function(index, line, col, description) {
                    var error = this.createError(index, line, col, description);
                    if (this.tolerant) this.recordError(error);
                    else throw error;
                };
                return ErrorHandler;
            }();
            exports.ErrorHandler = ErrorHandler;
        /***/ },
        /* 11 */ /***/ function(module1, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            // Error messages should be identical to V8.
            exports.Messages = {
                BadGetterArity: 'Getter must not have any formal parameters',
                BadSetterArity: 'Setter must have exactly one formal parameter',
                BadSetterRestParameter: 'Setter function argument must not be a rest parameter',
                ConstructorIsAsync: 'Class constructor may not be an async method',
                ConstructorSpecialMethod: 'Class constructor may not be an accessor',
                DeclarationMissingInitializer: 'Missing initializer in %0 declaration',
                DefaultRestParameter: 'Unexpected token =',
                DuplicateBinding: 'Duplicate binding %0',
                DuplicateConstructor: 'A class may only have one constructor',
                DuplicateProtoProperty: 'Duplicate __proto__ fields are not allowed in object literals',
                ForInOfLoopInitializer: '%0 loop variable declaration may not have an initializer',
                GeneratorInLegacyContext: 'Generator declarations are not allowed in legacy contexts',
                IllegalBreak: 'Illegal break statement',
                IllegalContinue: 'Illegal continue statement',
                IllegalExportDeclaration: 'Unexpected token',
                IllegalImportDeclaration: 'Unexpected token',
                IllegalLanguageModeDirective: 'Illegal \'use strict\' directive in function with non-simple parameter list',
                IllegalReturn: 'Illegal return statement',
                InvalidEscapedReservedWord: 'Keyword must not contain escaped characters',
                InvalidHexEscapeSequence: 'Invalid hexadecimal escape sequence',
                InvalidLHSInAssignment: 'Invalid left-hand side in assignment',
                InvalidLHSInForIn: 'Invalid left-hand side in for-in',
                InvalidLHSInForLoop: 'Invalid left-hand side in for-loop',
                InvalidModuleSpecifier: 'Unexpected token',
                InvalidRegExp: 'Invalid regular expression',
                LetInLexicalBinding: 'let is disallowed as a lexically bound name',
                MissingFromClause: 'Unexpected token',
                MultipleDefaultsInSwitch: 'More than one default clause in switch statement',
                NewlineAfterThrow: 'Illegal newline after throw',
                NoAsAfterImportNamespace: 'Unexpected token',
                NoCatchOrFinally: 'Missing catch or finally after try',
                ParameterAfterRestParameter: 'Rest parameter must be last formal parameter',
                Redeclaration: '%0 \'%1\' has already been declared',
                StaticPrototype: 'Classes may not have static property named prototype',
                StrictCatchVariable: 'Catch variable may not be eval or arguments in strict mode',
                StrictDelete: 'Delete of an unqualified identifier in strict mode.',
                StrictFunction: 'In strict mode code, functions can only be declared at top level or inside a block',
                StrictFunctionName: 'Function name may not be eval or arguments in strict mode',
                StrictLHSAssignment: 'Assignment to eval or arguments is not allowed in strict mode',
                StrictLHSPostfix: 'Postfix increment/decrement may not have eval or arguments operand in strict mode',
                StrictLHSPrefix: 'Prefix increment/decrement may not have eval or arguments operand in strict mode',
                StrictModeWith: 'Strict mode code may not include a with statement',
                StrictOctalLiteral: 'Octal literals are not allowed in strict mode.',
                StrictParamDupe: 'Strict mode function may not have duplicate parameter names',
                StrictParamName: 'Parameter name eval or arguments is not allowed in strict mode',
                StrictReservedWord: 'Use of future reserved word in strict mode',
                StrictVarName: 'Variable name may not be eval or arguments in strict mode',
                TemplateOctalLiteral: 'Octal literals are not allowed in template strings.',
                UnexpectedEOS: 'Unexpected end of input',
                UnexpectedIdentifier: 'Unexpected identifier',
                UnexpectedNumber: 'Unexpected number',
                UnexpectedReserved: 'Unexpected reserved word',
                UnexpectedString: 'Unexpected string',
                UnexpectedTemplate: 'Unexpected quasi %0',
                UnexpectedToken: 'Unexpected token %0',
                UnexpectedTokenIllegal: 'Unexpected token ILLEGAL',
                UnknownLabel: 'Undefined label \'%0\'',
                UnterminatedRegExp: 'Invalid regular expression: missing /'
            };
        /***/ },
        /* 12 */ /***/ function(module1, exports, __webpack_require__) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var assert_1 = __webpack_require__(9);
            var character_1 = __webpack_require__(4);
            var messages_1 = __webpack_require__(11);
            function hexValue(ch) {
                return '0123456789abcdef'.indexOf(ch.toLowerCase());
            }
            function octalValue(ch) {
                return '01234567'.indexOf(ch);
            }
            var Scanner = function() {
                function Scanner(code, handler) {
                    this.source = code;
                    this.errorHandler = handler;
                    this.trackComment = false;
                    this.isModule = false;
                    this.length = code.length;
                    this.index = 0;
                    this.lineNumber = code.length > 0 ? 1 : 0;
                    this.lineStart = 0;
                    this.curlyStack = [];
                }
                Scanner.prototype.saveState = function() {
                    return {
                        index: this.index,
                        lineNumber: this.lineNumber,
                        lineStart: this.lineStart
                    };
                };
                Scanner.prototype.restoreState = function(state) {
                    this.index = state.index;
                    this.lineNumber = state.lineNumber;
                    this.lineStart = state.lineStart;
                };
                Scanner.prototype.eof = function() {
                    return this.index >= this.length;
                };
                Scanner.prototype.throwUnexpectedToken = function(message) {
                    if (message === void 0) message = messages_1.Messages.UnexpectedTokenIllegal;
                    return this.errorHandler.throwError(this.index, this.lineNumber, this.index - this.lineStart + 1, message);
                };
                Scanner.prototype.tolerateUnexpectedToken = function(message) {
                    if (message === void 0) message = messages_1.Messages.UnexpectedTokenIllegal;
                    this.errorHandler.tolerateError(this.index, this.lineNumber, this.index - this.lineStart + 1, message);
                };
                // https://tc39.github.io/ecma262/#sec-comments
                Scanner.prototype.skipSingleLineComment = function(offset) {
                    var comments = [];
                    var start, loc;
                    if (this.trackComment) {
                        comments = [];
                        start = this.index - offset;
                        loc = {
                            start: {
                                line: this.lineNumber,
                                column: this.index - this.lineStart - offset
                            },
                            end: {}
                        };
                    }
                    while(!this.eof()){
                        var ch = this.source.charCodeAt(this.index);
                        ++this.index;
                        if (character_1.Character.isLineTerminator(ch)) {
                            if (this.trackComment) {
                                loc.end = {
                                    line: this.lineNumber,
                                    column: this.index - this.lineStart - 1
                                };
                                var entry = {
                                    multiLine: false,
                                    slice: [
                                        start + offset,
                                        this.index - 1
                                    ],
                                    range: [
                                        start,
                                        this.index - 1
                                    ],
                                    loc: loc
                                };
                                comments.push(entry);
                            }
                            if (ch === 13 && this.source.charCodeAt(this.index) === 10) ++this.index;
                            ++this.lineNumber;
                            this.lineStart = this.index;
                            return comments;
                        }
                    }
                    if (this.trackComment) {
                        loc.end = {
                            line: this.lineNumber,
                            column: this.index - this.lineStart
                        };
                        var entry = {
                            multiLine: false,
                            slice: [
                                start + offset,
                                this.index
                            ],
                            range: [
                                start,
                                this.index
                            ],
                            loc: loc
                        };
                        comments.push(entry);
                    }
                    return comments;
                };
                Scanner.prototype.skipMultiLineComment = function() {
                    var comments = [];
                    var start, loc;
                    if (this.trackComment) {
                        comments = [];
                        start = this.index - 2;
                        loc = {
                            start: {
                                line: this.lineNumber,
                                column: this.index - this.lineStart - 2
                            },
                            end: {}
                        };
                    }
                    while(!this.eof()){
                        var ch = this.source.charCodeAt(this.index);
                        if (character_1.Character.isLineTerminator(ch)) {
                            if (ch === 0x0D && this.source.charCodeAt(this.index + 1) === 0x0A) ++this.index;
                            ++this.lineNumber;
                            ++this.index;
                            this.lineStart = this.index;
                        } else if (ch === 0x2A) {
                            // Block comment ends with '*/'.
                            if (this.source.charCodeAt(this.index + 1) === 0x2F) {
                                this.index += 2;
                                if (this.trackComment) {
                                    loc.end = {
                                        line: this.lineNumber,
                                        column: this.index - this.lineStart
                                    };
                                    var entry = {
                                        multiLine: true,
                                        slice: [
                                            start + 2,
                                            this.index - 2
                                        ],
                                        range: [
                                            start,
                                            this.index
                                        ],
                                        loc: loc
                                    };
                                    comments.push(entry);
                                }
                                return comments;
                            }
                            ++this.index;
                        } else ++this.index;
                    }
                    // Ran off the end of the file - the whole thing is a comment
                    if (this.trackComment) {
                        loc.end = {
                            line: this.lineNumber,
                            column: this.index - this.lineStart
                        };
                        var entry = {
                            multiLine: true,
                            slice: [
                                start + 2,
                                this.index
                            ],
                            range: [
                                start,
                                this.index
                            ],
                            loc: loc
                        };
                        comments.push(entry);
                    }
                    this.tolerateUnexpectedToken();
                    return comments;
                };
                Scanner.prototype.scanComments = function() {
                    var comments;
                    if (this.trackComment) comments = [];
                    var start = this.index === 0;
                    while(!this.eof()){
                        var ch = this.source.charCodeAt(this.index);
                        if (character_1.Character.isWhiteSpace(ch)) ++this.index;
                        else if (character_1.Character.isLineTerminator(ch)) {
                            ++this.index;
                            if (ch === 0x0D && this.source.charCodeAt(this.index) === 0x0A) ++this.index;
                            ++this.lineNumber;
                            this.lineStart = this.index;
                            start = true;
                        } else if (ch === 0x2F) {
                            ch = this.source.charCodeAt(this.index + 1);
                            if (ch === 0x2F) {
                                this.index += 2;
                                var comment = this.skipSingleLineComment(2);
                                if (this.trackComment) comments = comments.concat(comment);
                                start = true;
                            } else if (ch === 0x2A) {
                                this.index += 2;
                                var comment = this.skipMultiLineComment();
                                if (this.trackComment) comments = comments.concat(comment);
                            } else break;
                        } else if (start && ch === 0x2D) {
                            // U+003E is '>'
                            if (this.source.charCodeAt(this.index + 1) === 0x2D && this.source.charCodeAt(this.index + 2) === 0x3E) {
                                // '-->' is a single-line comment
                                this.index += 3;
                                var comment = this.skipSingleLineComment(3);
                                if (this.trackComment) comments = comments.concat(comment);
                            } else break;
                        } else if (ch === 0x3C && !this.isModule) {
                            if (this.source.slice(this.index + 1, this.index + 4) === '!--') {
                                this.index += 4; // `<!--`
                                var comment = this.skipSingleLineComment(4);
                                if (this.trackComment) comments = comments.concat(comment);
                            } else break;
                        } else break;
                    }
                    return comments;
                };
                // https://tc39.github.io/ecma262/#sec-future-reserved-words
                Scanner.prototype.isFutureReservedWord = function(id) {
                    switch(id){
                        case 'enum':
                        case 'export':
                        case 'import':
                        case 'super':
                            return true;
                        default:
                            return false;
                    }
                };
                Scanner.prototype.isStrictModeReservedWord = function(id) {
                    switch(id){
                        case 'implements':
                        case 'interface':
                        case 'package':
                        case 'private':
                        case 'protected':
                        case 'public':
                        case 'static':
                        case 'yield':
                        case 'let':
                            return true;
                        default:
                            return false;
                    }
                };
                Scanner.prototype.isRestrictedWord = function(id) {
                    return id === 'eval' || id === 'arguments';
                };
                // https://tc39.github.io/ecma262/#sec-keywords
                Scanner.prototype.isKeyword = function(id) {
                    switch(id.length){
                        case 2:
                            return id === 'if' || id === 'in' || id === 'do';
                        case 3:
                            return id === 'var' || id === 'for' || id === 'new' || id === 'try' || id === 'let';
                        case 4:
                            return id === 'this' || id === 'else' || id === 'case' || id === 'void' || id === 'with' || id === 'enum';
                        case 5:
                            return id === 'while' || id === 'break' || id === 'catch' || id === 'throw' || id === 'const' || id === 'yield' || id === 'class' || id === 'super';
                        case 6:
                            return id === 'return' || id === 'typeof' || id === 'delete' || id === 'switch' || id === 'export' || id === 'import';
                        case 7:
                            return id === 'default' || id === 'finally' || id === 'extends';
                        case 8:
                            return id === 'function' || id === 'continue' || id === 'debugger';
                        case 10:
                            return id === 'instanceof';
                        default:
                            return false;
                    }
                };
                Scanner.prototype.codePointAt = function(i) {
                    var cp = this.source.charCodeAt(i);
                    if (cp >= 0xD800 && cp <= 0xDBFF) {
                        var second = this.source.charCodeAt(i + 1);
                        if (second >= 0xDC00 && second <= 0xDFFF) {
                            var first = cp;
                            cp = (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
                        }
                    }
                    return cp;
                };
                Scanner.prototype.scanHexEscape = function(prefix) {
                    var len = prefix === 'u' ? 4 : 2;
                    var code = 0;
                    for(var i = 0; i < len; ++i){
                        if (!this.eof() && character_1.Character.isHexDigit(this.source.charCodeAt(this.index))) code = code * 16 + hexValue(this.source[this.index++]);
                        else return null;
                    }
                    return String.fromCharCode(code);
                };
                Scanner.prototype.scanUnicodeCodePointEscape = function() {
                    var ch = this.source[this.index];
                    var code = 0;
                    // At least, one hex digit is required.
                    if (ch === '}') this.throwUnexpectedToken();
                    while(!this.eof()){
                        ch = this.source[this.index++];
                        if (!character_1.Character.isHexDigit(ch.charCodeAt(0))) break;
                        code = code * 16 + hexValue(ch);
                    }
                    if (code > 0x10FFFF || ch !== '}') this.throwUnexpectedToken();
                    return character_1.Character.fromCodePoint(code);
                };
                Scanner.prototype.getIdentifier = function() {
                    var start = this.index++;
                    while(!this.eof()){
                        var ch = this.source.charCodeAt(this.index);
                        if (ch === 0x5C) {
                            // Blackslash (U+005C) marks Unicode escape sequence.
                            this.index = start;
                            return this.getComplexIdentifier();
                        } else if (ch >= 0xD800 && ch < 0xDFFF) {
                            // Need to handle surrogate pairs.
                            this.index = start;
                            return this.getComplexIdentifier();
                        }
                        if (character_1.Character.isIdentifierPart(ch)) ++this.index;
                        else break;
                    }
                    return this.source.slice(start, this.index);
                };
                Scanner.prototype.getComplexIdentifier = function() {
                    var cp = this.codePointAt(this.index);
                    var id = character_1.Character.fromCodePoint(cp);
                    this.index += id.length;
                    // '\u' (U+005C, U+0075) denotes an escaped character.
                    var ch;
                    if (cp === 0x5C) {
                        if (this.source.charCodeAt(this.index) !== 0x75) this.throwUnexpectedToken();
                        ++this.index;
                        if (this.source[this.index] === '{') {
                            ++this.index;
                            ch = this.scanUnicodeCodePointEscape();
                        } else {
                            ch = this.scanHexEscape('u');
                            if (ch === null || ch === '\\' || !character_1.Character.isIdentifierStart(ch.charCodeAt(0))) this.throwUnexpectedToken();
                        }
                        id = ch;
                    }
                    while(!this.eof()){
                        cp = this.codePointAt(this.index);
                        if (!character_1.Character.isIdentifierPart(cp)) break;
                        ch = character_1.Character.fromCodePoint(cp);
                        id += ch;
                        this.index += ch.length;
                        // '\u' (U+005C, U+0075) denotes an escaped character.
                        if (cp === 0x5C) {
                            id = id.substr(0, id.length - 1);
                            if (this.source.charCodeAt(this.index) !== 0x75) this.throwUnexpectedToken();
                            ++this.index;
                            if (this.source[this.index] === '{') {
                                ++this.index;
                                ch = this.scanUnicodeCodePointEscape();
                            } else {
                                ch = this.scanHexEscape('u');
                                if (ch === null || ch === '\\' || !character_1.Character.isIdentifierPart(ch.charCodeAt(0))) this.throwUnexpectedToken();
                            }
                            id += ch;
                        }
                    }
                    return id;
                };
                Scanner.prototype.octalToDecimal = function(ch) {
                    // \0 is not octal escape sequence
                    var octal = ch !== '0';
                    var code = octalValue(ch);
                    if (!this.eof() && character_1.Character.isOctalDigit(this.source.charCodeAt(this.index))) {
                        octal = true;
                        code = code * 8 + octalValue(this.source[this.index++]);
                        // 3 digits are only allowed when string starts
                        // with 0, 1, 2, 3
                        if ('0123'.indexOf(ch) >= 0 && !this.eof() && character_1.Character.isOctalDigit(this.source.charCodeAt(this.index))) code = code * 8 + octalValue(this.source[this.index++]);
                    }
                    return {
                        code: code,
                        octal: octal
                    };
                };
                // https://tc39.github.io/ecma262/#sec-names-and-keywords
                Scanner.prototype.scanIdentifier = function() {
                    var type;
                    var start = this.index;
                    // Backslash (U+005C) starts an escaped character.
                    var id = this.source.charCodeAt(start) === 0x5C ? this.getComplexIdentifier() : this.getIdentifier();
                    // There is no keyword or literal with only one character.
                    // Thus, it must be an identifier.
                    if (id.length === 1) type = 3 /* Identifier */ ;
                    else if (this.isKeyword(id)) type = 4 /* Keyword */ ;
                    else if (id === 'null') type = 5 /* NullLiteral */ ;
                    else if (id === 'true' || id === 'false') type = 1 /* BooleanLiteral */ ;
                    else type = 3 /* Identifier */ ;
                    if (type !== 3 /* Identifier */  && start + id.length !== this.index) {
                        var restore = this.index;
                        this.index = start;
                        this.tolerateUnexpectedToken(messages_1.Messages.InvalidEscapedReservedWord);
                        this.index = restore;
                    }
                    return {
                        type: type,
                        value: id,
                        lineNumber: this.lineNumber,
                        lineStart: this.lineStart,
                        start: start,
                        end: this.index
                    };
                };
                // https://tc39.github.io/ecma262/#sec-punctuators
                Scanner.prototype.scanPunctuator = function() {
                    var start = this.index;
                    // Check for most common single-character punctuators.
                    var str = this.source[this.index];
                    switch(str){
                        case '(':
                        case '{':
                            if (str === '{') this.curlyStack.push('{');
                            ++this.index;
                            break;
                        case '.':
                            ++this.index;
                            if (this.source[this.index] === '.' && this.source[this.index + 1] === '.') {
                                // Spread operator: ...
                                this.index += 2;
                                str = '...';
                            }
                            break;
                        case '}':
                            ++this.index;
                            this.curlyStack.pop();
                            break;
                        case ')':
                        case ';':
                        case ',':
                        case '[':
                        case ']':
                        case ':':
                        case '?':
                        case '~':
                            ++this.index;
                            break;
                        default:
                            // 4-character punctuator.
                            str = this.source.substr(this.index, 4);
                            if (str === '>>>=') this.index += 4;
                            else {
                                // 3-character punctuators.
                                str = str.substr(0, 3);
                                if (str === '===' || str === '!==' || str === '>>>' || str === '<<=' || str === '>>=' || str === '**=') this.index += 3;
                                else {
                                    // 2-character punctuators.
                                    str = str.substr(0, 2);
                                    if (str === '&&' || str === '||' || str === '==' || str === '!=' || str === '+=' || str === '-=' || str === '*=' || str === '/=' || str === '++' || str === '--' || str === '<<' || str === '>>' || str === '&=' || str === '|=' || str === '^=' || str === '%=' || str === '<=' || str === '>=' || str === '=>' || str === '**') this.index += 2;
                                    else {
                                        // 1-character punctuators.
                                        str = this.source[this.index];
                                        if ('<>=!+-*%&|^/'.indexOf(str) >= 0) ++this.index;
                                    }
                                }
                            }
                    }
                    if (this.index === start) this.throwUnexpectedToken();
                    return {
                        type: 7 /* Punctuator */ ,
                        value: str,
                        lineNumber: this.lineNumber,
                        lineStart: this.lineStart,
                        start: start,
                        end: this.index
                    };
                };
                // https://tc39.github.io/ecma262/#sec-literals-numeric-literals
                Scanner.prototype.scanHexLiteral = function(start) {
                    var num = '';
                    while(!this.eof()){
                        if (!character_1.Character.isHexDigit(this.source.charCodeAt(this.index))) break;
                        num += this.source[this.index++];
                    }
                    if (num.length === 0) this.throwUnexpectedToken();
                    if (character_1.Character.isIdentifierStart(this.source.charCodeAt(this.index))) this.throwUnexpectedToken();
                    return {
                        type: 6 /* NumericLiteral */ ,
                        value: parseInt('0x' + num, 16),
                        lineNumber: this.lineNumber,
                        lineStart: this.lineStart,
                        start: start,
                        end: this.index
                    };
                };
                Scanner.prototype.scanBinaryLiteral = function(start) {
                    var num = '';
                    var ch;
                    while(!this.eof()){
                        ch = this.source[this.index];
                        if (ch !== '0' && ch !== '1') break;
                        num += this.source[this.index++];
                    }
                    if (num.length === 0) // only 0b or 0B
                    this.throwUnexpectedToken();
                    if (!this.eof()) {
                        ch = this.source.charCodeAt(this.index);
                        /* istanbul ignore else */ if (character_1.Character.isIdentifierStart(ch) || character_1.Character.isDecimalDigit(ch)) this.throwUnexpectedToken();
                    }
                    return {
                        type: 6 /* NumericLiteral */ ,
                        value: parseInt(num, 2),
                        lineNumber: this.lineNumber,
                        lineStart: this.lineStart,
                        start: start,
                        end: this.index
                    };
                };
                Scanner.prototype.scanOctalLiteral = function(prefix, start) {
                    var num = '';
                    var octal = false;
                    if (character_1.Character.isOctalDigit(prefix.charCodeAt(0))) {
                        octal = true;
                        num = '0' + this.source[this.index++];
                    } else ++this.index;
                    while(!this.eof()){
                        if (!character_1.Character.isOctalDigit(this.source.charCodeAt(this.index))) break;
                        num += this.source[this.index++];
                    }
                    if (!octal && num.length === 0) // only 0o or 0O
                    this.throwUnexpectedToken();
                    if (character_1.Character.isIdentifierStart(this.source.charCodeAt(this.index)) || character_1.Character.isDecimalDigit(this.source.charCodeAt(this.index))) this.throwUnexpectedToken();
                    return {
                        type: 6 /* NumericLiteral */ ,
                        value: parseInt(num, 8),
                        octal: octal,
                        lineNumber: this.lineNumber,
                        lineStart: this.lineStart,
                        start: start,
                        end: this.index
                    };
                };
                Scanner.prototype.isImplicitOctalLiteral = function() {
                    // Implicit octal, unless there is a non-octal digit.
                    // (Annex B.1.1 on Numeric Literals)
                    for(var i = this.index + 1; i < this.length; ++i){
                        var ch = this.source[i];
                        if (ch === '8' || ch === '9') return false;
                        if (!character_1.Character.isOctalDigit(ch.charCodeAt(0))) return true;
                    }
                    return true;
                };
                Scanner.prototype.scanNumericLiteral = function() {
                    var start = this.index;
                    var ch = this.source[start];
                    assert_1.assert(character_1.Character.isDecimalDigit(ch.charCodeAt(0)) || ch === '.', 'Numeric literal must start with a decimal digit or a decimal point');
                    var num = '';
                    if (ch !== '.') {
                        num = this.source[this.index++];
                        ch = this.source[this.index];
                        // Hex number starts with '0x'.
                        // Octal number starts with '0'.
                        // Octal number in ES6 starts with '0o'.
                        // Binary number in ES6 starts with '0b'.
                        if (num === '0') {
                            if (ch === 'x' || ch === 'X') {
                                ++this.index;
                                return this.scanHexLiteral(start);
                            }
                            if (ch === 'b' || ch === 'B') {
                                ++this.index;
                                return this.scanBinaryLiteral(start);
                            }
                            if (ch === 'o' || ch === 'O') return this.scanOctalLiteral(ch, start);
                            if (ch && character_1.Character.isOctalDigit(ch.charCodeAt(0))) {
                                if (this.isImplicitOctalLiteral()) return this.scanOctalLiteral(ch, start);
                            }
                        }
                        while(character_1.Character.isDecimalDigit(this.source.charCodeAt(this.index)))num += this.source[this.index++];
                        ch = this.source[this.index];
                    }
                    if (ch === '.') {
                        num += this.source[this.index++];
                        while(character_1.Character.isDecimalDigit(this.source.charCodeAt(this.index)))num += this.source[this.index++];
                        ch = this.source[this.index];
                    }
                    if (ch === 'e' || ch === 'E') {
                        num += this.source[this.index++];
                        ch = this.source[this.index];
                        if (ch === '+' || ch === '-') num += this.source[this.index++];
                        if (character_1.Character.isDecimalDigit(this.source.charCodeAt(this.index))) while(character_1.Character.isDecimalDigit(this.source.charCodeAt(this.index)))num += this.source[this.index++];
                        else this.throwUnexpectedToken();
                    }
                    if (character_1.Character.isIdentifierStart(this.source.charCodeAt(this.index))) this.throwUnexpectedToken();
                    return {
                        type: 6 /* NumericLiteral */ ,
                        value: parseFloat(num),
                        lineNumber: this.lineNumber,
                        lineStart: this.lineStart,
                        start: start,
                        end: this.index
                    };
                };
                // https://tc39.github.io/ecma262/#sec-literals-string-literals
                Scanner.prototype.scanStringLiteral = function() {
                    var start = this.index;
                    var quote = this.source[start];
                    assert_1.assert(quote === '\'' || quote === '"', 'String literal must starts with a quote');
                    ++this.index;
                    var octal = false;
                    var str = '';
                    while(!this.eof()){
                        var ch = this.source[this.index++];
                        if (ch === quote) {
                            quote = '';
                            break;
                        } else if (ch === '\\') {
                            ch = this.source[this.index++];
                            if (!ch || !character_1.Character.isLineTerminator(ch.charCodeAt(0))) switch(ch){
                                case 'u':
                                    if (this.source[this.index] === '{') {
                                        ++this.index;
                                        str += this.scanUnicodeCodePointEscape();
                                    } else {
                                        var unescaped_1 = this.scanHexEscape(ch);
                                        if (unescaped_1 === null) this.throwUnexpectedToken();
                                        str += unescaped_1;
                                    }
                                    break;
                                case 'x':
                                    var unescaped = this.scanHexEscape(ch);
                                    if (unescaped === null) this.throwUnexpectedToken(messages_1.Messages.InvalidHexEscapeSequence);
                                    str += unescaped;
                                    break;
                                case 'n':
                                    str += '\n';
                                    break;
                                case 'r':
                                    str += '\r';
                                    break;
                                case 't':
                                    str += '\t';
                                    break;
                                case 'b':
                                    str += '\b';
                                    break;
                                case 'f':
                                    str += '\f';
                                    break;
                                case 'v':
                                    str += '\x0B';
                                    break;
                                case '8':
                                case '9':
                                    str += ch;
                                    this.tolerateUnexpectedToken();
                                    break;
                                default:
                                    if (ch && character_1.Character.isOctalDigit(ch.charCodeAt(0))) {
                                        var octToDec = this.octalToDecimal(ch);
                                        octal = octToDec.octal || octal;
                                        str += String.fromCharCode(octToDec.code);
                                    } else str += ch;
                                    break;
                            }
                            else {
                                ++this.lineNumber;
                                if (ch === '\r' && this.source[this.index] === '\n') ++this.index;
                                this.lineStart = this.index;
                            }
                        } else if (character_1.Character.isLineTerminator(ch.charCodeAt(0))) break;
                        else str += ch;
                    }
                    if (quote !== '') {
                        this.index = start;
                        this.throwUnexpectedToken();
                    }
                    return {
                        type: 8 /* StringLiteral */ ,
                        value: str,
                        octal: octal,
                        lineNumber: this.lineNumber,
                        lineStart: this.lineStart,
                        start: start,
                        end: this.index
                    };
                };
                // https://tc39.github.io/ecma262/#sec-template-literal-lexical-components
                Scanner.prototype.scanTemplate = function() {
                    var cooked = '';
                    var terminated = false;
                    var start = this.index;
                    var head = this.source[start] === '`';
                    var tail = false;
                    var rawOffset = 2;
                    ++this.index;
                    while(!this.eof()){
                        var ch = this.source[this.index++];
                        if (ch === '`') {
                            rawOffset = 1;
                            tail = true;
                            terminated = true;
                            break;
                        } else if (ch === '$') {
                            if (this.source[this.index] === '{') {
                                this.curlyStack.push('${');
                                ++this.index;
                                terminated = true;
                                break;
                            }
                            cooked += ch;
                        } else if (ch === '\\') {
                            ch = this.source[this.index++];
                            if (!character_1.Character.isLineTerminator(ch.charCodeAt(0))) switch(ch){
                                case 'n':
                                    cooked += '\n';
                                    break;
                                case 'r':
                                    cooked += '\r';
                                    break;
                                case 't':
                                    cooked += '\t';
                                    break;
                                case 'u':
                                    if (this.source[this.index] === '{') {
                                        ++this.index;
                                        cooked += this.scanUnicodeCodePointEscape();
                                    } else {
                                        var restore = this.index;
                                        var unescaped_2 = this.scanHexEscape(ch);
                                        if (unescaped_2 !== null) cooked += unescaped_2;
                                        else {
                                            this.index = restore;
                                            cooked += ch;
                                        }
                                    }
                                    break;
                                case 'x':
                                    var unescaped = this.scanHexEscape(ch);
                                    if (unescaped === null) this.throwUnexpectedToken(messages_1.Messages.InvalidHexEscapeSequence);
                                    cooked += unescaped;
                                    break;
                                case 'b':
                                    cooked += '\b';
                                    break;
                                case 'f':
                                    cooked += '\f';
                                    break;
                                case 'v':
                                    cooked += '\v';
                                    break;
                                default:
                                    if (ch === '0') {
                                        if (character_1.Character.isDecimalDigit(this.source.charCodeAt(this.index))) // Illegal: \01 \02 and so on
                                        this.throwUnexpectedToken(messages_1.Messages.TemplateOctalLiteral);
                                        cooked += '\0';
                                    } else if (character_1.Character.isOctalDigit(ch.charCodeAt(0))) // Illegal: \1 \2
                                    this.throwUnexpectedToken(messages_1.Messages.TemplateOctalLiteral);
                                    else cooked += ch;
                                    break;
                            }
                            else {
                                ++this.lineNumber;
                                if (ch === '\r' && this.source[this.index] === '\n') ++this.index;
                                this.lineStart = this.index;
                            }
                        } else if (character_1.Character.isLineTerminator(ch.charCodeAt(0))) {
                            ++this.lineNumber;
                            if (ch === '\r' && this.source[this.index] === '\n') ++this.index;
                            this.lineStart = this.index;
                            cooked += '\n';
                        } else cooked += ch;
                    }
                    if (!terminated) this.throwUnexpectedToken();
                    if (!head) this.curlyStack.pop();
                    return {
                        type: 10 /* Template */ ,
                        value: this.source.slice(start + 1, this.index - rawOffset),
                        cooked: cooked,
                        head: head,
                        tail: tail,
                        lineNumber: this.lineNumber,
                        lineStart: this.lineStart,
                        start: start,
                        end: this.index
                    };
                };
                // https://tc39.github.io/ecma262/#sec-literals-regular-expression-literals
                Scanner.prototype.testRegExp = function(pattern, flags) {
                    // The BMP character to use as a replacement for astral symbols when
                    // translating an ES6 "u"-flagged pattern to an ES5-compatible
                    // approximation.
                    // Note: replacing with '\uFFFF' enables false positives in unlikely
                    // scenarios. For example, `[\u{1044f}-\u{10440}]` is an invalid
                    // pattern that would not be detected by this substitution.
                    var astralSubstitute = '\uFFFF';
                    var tmp = pattern;
                    var self = this;
                    if (flags.indexOf('u') >= 0) tmp = tmp.replace(/\\u\{([0-9a-fA-F]+)\}|\\u([a-fA-F0-9]{4})/g, function($0, $1, $2) {
                        var codePoint = parseInt($1 || $2, 16);
                        if (codePoint > 0x10FFFF) self.throwUnexpectedToken(messages_1.Messages.InvalidRegExp);
                        if (codePoint <= 0xFFFF) return String.fromCharCode(codePoint);
                        return astralSubstitute;
                    }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, astralSubstitute);
                    // First, detect invalid regular expressions.
                    try {
                        RegExp(tmp);
                    } catch (e) {
                        this.throwUnexpectedToken(messages_1.Messages.InvalidRegExp);
                    }
                    // Return a regular expression object for this pattern-flag pair, or
                    // `null` in case the current environment doesn't support the flags it
                    // uses.
                    try {
                        return new RegExp(pattern, flags);
                    } catch (exception) {
                        /* istanbul ignore next */ return null;
                    }
                };
                Scanner.prototype.scanRegExpBody = function() {
                    var ch = this.source[this.index];
                    assert_1.assert(ch === '/', 'Regular expression literal must start with a slash');
                    var str = this.source[this.index++];
                    var classMarker = false;
                    var terminated = false;
                    while(!this.eof()){
                        ch = this.source[this.index++];
                        str += ch;
                        if (ch === '\\') {
                            ch = this.source[this.index++];
                            // https://tc39.github.io/ecma262/#sec-literals-regular-expression-literals
                            if (character_1.Character.isLineTerminator(ch.charCodeAt(0))) this.throwUnexpectedToken(messages_1.Messages.UnterminatedRegExp);
                            str += ch;
                        } else if (character_1.Character.isLineTerminator(ch.charCodeAt(0))) this.throwUnexpectedToken(messages_1.Messages.UnterminatedRegExp);
                        else if (classMarker) {
                            if (ch === ']') classMarker = false;
                        } else {
                            if (ch === '/') {
                                terminated = true;
                                break;
                            } else if (ch === '[') classMarker = true;
                        }
                    }
                    if (!terminated) this.throwUnexpectedToken(messages_1.Messages.UnterminatedRegExp);
                    // Exclude leading and trailing slash.
                    return str.substr(1, str.length - 2);
                };
                Scanner.prototype.scanRegExpFlags = function() {
                    var str = '';
                    var flags = '';
                    while(!this.eof()){
                        var ch = this.source[this.index];
                        if (!character_1.Character.isIdentifierPart(ch.charCodeAt(0))) break;
                        ++this.index;
                        if (ch === '\\' && !this.eof()) {
                            ch = this.source[this.index];
                            if (ch === 'u') {
                                ++this.index;
                                var restore = this.index;
                                var char = this.scanHexEscape('u');
                                if (char !== null) {
                                    flags += char;
                                    for(str += '\\u'; restore < this.index; ++restore)str += this.source[restore];
                                } else {
                                    this.index = restore;
                                    flags += 'u';
                                    str += '\\u';
                                }
                                this.tolerateUnexpectedToken();
                            } else {
                                str += '\\';
                                this.tolerateUnexpectedToken();
                            }
                        } else {
                            flags += ch;
                            str += ch;
                        }
                    }
                    return flags;
                };
                Scanner.prototype.scanRegExp = function() {
                    var start = this.index;
                    var pattern = this.scanRegExpBody();
                    var flags = this.scanRegExpFlags();
                    var value = this.testRegExp(pattern, flags);
                    return {
                        type: 9 /* RegularExpression */ ,
                        value: '',
                        pattern: pattern,
                        flags: flags,
                        regex: value,
                        lineNumber: this.lineNumber,
                        lineStart: this.lineStart,
                        start: start,
                        end: this.index
                    };
                };
                Scanner.prototype.lex = function() {
                    if (this.eof()) return {
                        type: 2 /* EOF */ ,
                        value: '',
                        lineNumber: this.lineNumber,
                        lineStart: this.lineStart,
                        start: this.index,
                        end: this.index
                    };
                    var cp = this.source.charCodeAt(this.index);
                    if (character_1.Character.isIdentifierStart(cp)) return this.scanIdentifier();
                    // Very common: ( and ) and ;
                    if (cp === 0x28 || cp === 0x29 || cp === 0x3B) return this.scanPunctuator();
                    // String literal starts with single quote (U+0027) or double quote (U+0022).
                    if (cp === 0x27 || cp === 0x22) return this.scanStringLiteral();
                    // Dot (.) U+002E can also start a floating-point number, hence the need
                    // to check the next character.
                    if (cp === 0x2E) {
                        if (character_1.Character.isDecimalDigit(this.source.charCodeAt(this.index + 1))) return this.scanNumericLiteral();
                        return this.scanPunctuator();
                    }
                    if (character_1.Character.isDecimalDigit(cp)) return this.scanNumericLiteral();
                    // Template literals start with ` (U+0060) for template head
                    // or } (U+007D) for template middle or template tail.
                    if (cp === 0x60 || cp === 0x7D && this.curlyStack[this.curlyStack.length - 1] === '${') return this.scanTemplate();
                    // Possible identifier start in a surrogate pair.
                    if (cp >= 0xD800 && cp < 0xDFFF) {
                        if (character_1.Character.isIdentifierStart(this.codePointAt(this.index))) return this.scanIdentifier();
                    }
                    return this.scanPunctuator();
                };
                return Scanner;
            }();
            exports.Scanner = Scanner;
        /***/ },
        /* 13 */ /***/ function(module1, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            exports.TokenName = {};
            exports.TokenName[1 /* BooleanLiteral */ ] = 'Boolean';
            exports.TokenName[2 /* EOF */ ] = '<end>';
            exports.TokenName[3 /* Identifier */ ] = 'Identifier';
            exports.TokenName[4 /* Keyword */ ] = 'Keyword';
            exports.TokenName[5 /* NullLiteral */ ] = 'Null';
            exports.TokenName[6 /* NumericLiteral */ ] = 'Numeric';
            exports.TokenName[7 /* Punctuator */ ] = 'Punctuator';
            exports.TokenName[8 /* StringLiteral */ ] = 'String';
            exports.TokenName[9 /* RegularExpression */ ] = 'RegularExpression';
            exports.TokenName[10 /* Template */ ] = 'Template';
        /***/ },
        /* 14 */ /***/ function(module1, exports) {
            "use strict";
            // Generated by generate-xhtml-entities.js. DO NOT MODIFY!
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            exports.XHTMLEntities = {
                quot: '\u0022',
                amp: '\u0026',
                apos: '\u0027',
                gt: '\u003E',
                nbsp: '\u00A0',
                iexcl: '\u00A1',
                cent: '\u00A2',
                pound: '\u00A3',
                curren: '\u00A4',
                yen: '\u00A5',
                brvbar: '\u00A6',
                sect: '\u00A7',
                uml: '\u00A8',
                copy: '\u00A9',
                ordf: '\u00AA',
                laquo: '\u00AB',
                not: '\u00AC',
                shy: '\u00AD',
                reg: '\u00AE',
                macr: '\u00AF',
                deg: '\u00B0',
                plusmn: '\u00B1',
                sup2: '\u00B2',
                sup3: '\u00B3',
                acute: '\u00B4',
                micro: '\u00B5',
                para: '\u00B6',
                middot: '\u00B7',
                cedil: '\u00B8',
                sup1: '\u00B9',
                ordm: '\u00BA',
                raquo: '\u00BB',
                frac14: '\u00BC',
                frac12: '\u00BD',
                frac34: '\u00BE',
                iquest: '\u00BF',
                Agrave: '\u00C0',
                Aacute: '\u00C1',
                Acirc: '\u00C2',
                Atilde: '\u00C3',
                Auml: '\u00C4',
                Aring: '\u00C5',
                AElig: '\u00C6',
                Ccedil: '\u00C7',
                Egrave: '\u00C8',
                Eacute: '\u00C9',
                Ecirc: '\u00CA',
                Euml: '\u00CB',
                Igrave: '\u00CC',
                Iacute: '\u00CD',
                Icirc: '\u00CE',
                Iuml: '\u00CF',
                ETH: '\u00D0',
                Ntilde: '\u00D1',
                Ograve: '\u00D2',
                Oacute: '\u00D3',
                Ocirc: '\u00D4',
                Otilde: '\u00D5',
                Ouml: '\u00D6',
                times: '\u00D7',
                Oslash: '\u00D8',
                Ugrave: '\u00D9',
                Uacute: '\u00DA',
                Ucirc: '\u00DB',
                Uuml: '\u00DC',
                Yacute: '\u00DD',
                THORN: '\u00DE',
                szlig: '\u00DF',
                agrave: '\u00E0',
                aacute: '\u00E1',
                acirc: '\u00E2',
                atilde: '\u00E3',
                auml: '\u00E4',
                aring: '\u00E5',
                aelig: '\u00E6',
                ccedil: '\u00E7',
                egrave: '\u00E8',
                eacute: '\u00E9',
                ecirc: '\u00EA',
                euml: '\u00EB',
                igrave: '\u00EC',
                iacute: '\u00ED',
                icirc: '\u00EE',
                iuml: '\u00EF',
                eth: '\u00F0',
                ntilde: '\u00F1',
                ograve: '\u00F2',
                oacute: '\u00F3',
                ocirc: '\u00F4',
                otilde: '\u00F5',
                ouml: '\u00F6',
                divide: '\u00F7',
                oslash: '\u00F8',
                ugrave: '\u00F9',
                uacute: '\u00FA',
                ucirc: '\u00FB',
                uuml: '\u00FC',
                yacute: '\u00FD',
                thorn: '\u00FE',
                yuml: '\u00FF',
                OElig: '\u0152',
                oelig: '\u0153',
                Scaron: '\u0160',
                scaron: '\u0161',
                Yuml: '\u0178',
                fnof: '\u0192',
                circ: '\u02C6',
                tilde: '\u02DC',
                Alpha: '\u0391',
                Beta: '\u0392',
                Gamma: '\u0393',
                Delta: '\u0394',
                Epsilon: '\u0395',
                Zeta: '\u0396',
                Eta: '\u0397',
                Theta: '\u0398',
                Iota: '\u0399',
                Kappa: '\u039A',
                Lambda: '\u039B',
                Mu: '\u039C',
                Nu: '\u039D',
                Xi: '\u039E',
                Omicron: '\u039F',
                Pi: '\u03A0',
                Rho: '\u03A1',
                Sigma: '\u03A3',
                Tau: '\u03A4',
                Upsilon: '\u03A5',
                Phi: '\u03A6',
                Chi: '\u03A7',
                Psi: '\u03A8',
                Omega: '\u03A9',
                alpha: '\u03B1',
                beta: '\u03B2',
                gamma: '\u03B3',
                delta: '\u03B4',
                epsilon: '\u03B5',
                zeta: '\u03B6',
                eta: '\u03B7',
                theta: '\u03B8',
                iota: '\u03B9',
                kappa: '\u03BA',
                lambda: '\u03BB',
                mu: '\u03BC',
                nu: '\u03BD',
                xi: '\u03BE',
                omicron: '\u03BF',
                pi: '\u03C0',
                rho: '\u03C1',
                sigmaf: '\u03C2',
                sigma: '\u03C3',
                tau: '\u03C4',
                upsilon: '\u03C5',
                phi: '\u03C6',
                chi: '\u03C7',
                psi: '\u03C8',
                omega: '\u03C9',
                thetasym: '\u03D1',
                upsih: '\u03D2',
                piv: '\u03D6',
                ensp: '\u2002',
                emsp: '\u2003',
                thinsp: '\u2009',
                zwnj: '\u200C',
                zwj: '\u200D',
                lrm: '\u200E',
                rlm: '\u200F',
                ndash: '\u2013',
                mdash: '\u2014',
                lsquo: '\u2018',
                rsquo: '\u2019',
                sbquo: '\u201A',
                ldquo: '\u201C',
                rdquo: '\u201D',
                bdquo: '\u201E',
                dagger: '\u2020',
                Dagger: '\u2021',
                bull: '\u2022',
                hellip: '\u2026',
                permil: '\u2030',
                prime: '\u2032',
                Prime: '\u2033',
                lsaquo: '\u2039',
                rsaquo: '\u203A',
                oline: '\u203E',
                frasl: '\u2044',
                euro: '\u20AC',
                image: '\u2111',
                weierp: '\u2118',
                real: '\u211C',
                trade: '\u2122',
                alefsym: '\u2135',
                larr: '\u2190',
                uarr: '\u2191',
                rarr: '\u2192',
                darr: '\u2193',
                harr: '\u2194',
                crarr: '\u21B5',
                lArr: '\u21D0',
                uArr: '\u21D1',
                rArr: '\u21D2',
                dArr: '\u21D3',
                hArr: '\u21D4',
                forall: '\u2200',
                part: '\u2202',
                exist: '\u2203',
                empty: '\u2205',
                nabla: '\u2207',
                isin: '\u2208',
                notin: '\u2209',
                ni: '\u220B',
                prod: '\u220F',
                sum: '\u2211',
                minus: '\u2212',
                lowast: '\u2217',
                radic: '\u221A',
                prop: '\u221D',
                infin: '\u221E',
                ang: '\u2220',
                and: '\u2227',
                or: '\u2228',
                cap: '\u2229',
                cup: '\u222A',
                int: '\u222B',
                there4: '\u2234',
                sim: '\u223C',
                cong: '\u2245',
                asymp: '\u2248',
                ne: '\u2260',
                equiv: '\u2261',
                le: '\u2264',
                ge: '\u2265',
                sub: '\u2282',
                sup: '\u2283',
                nsub: '\u2284',
                sube: '\u2286',
                supe: '\u2287',
                oplus: '\u2295',
                otimes: '\u2297',
                perp: '\u22A5',
                sdot: '\u22C5',
                lceil: '\u2308',
                rceil: '\u2309',
                lfloor: '\u230A',
                rfloor: '\u230B',
                loz: '\u25CA',
                spades: '\u2660',
                clubs: '\u2663',
                hearts: '\u2665',
                diams: '\u2666',
                lang: '\u27E8',
                rang: '\u27E9'
            };
        /***/ },
        /* 15 */ /***/ function(module1, exports, __webpack_require__) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var error_handler_1 = __webpack_require__(10);
            var scanner_1 = __webpack_require__(12);
            var token_1 = __webpack_require__(13);
            var Reader = function() {
                function Reader() {
                    this.values = [];
                    this.curly = this.paren = -1;
                }
                // A function following one of those tokens is an expression.
                Reader.prototype.beforeFunctionExpression = function(t) {
                    return [
                        '(',
                        '{',
                        '[',
                        'in',
                        'typeof',
                        'instanceof',
                        'new',
                        'return',
                        'case',
                        'delete',
                        'throw',
                        'void',
                        // assignment operators
                        '=',
                        '+=',
                        '-=',
                        '*=',
                        '**=',
                        '/=',
                        '%=',
                        '<<=',
                        '>>=',
                        '>>>=',
                        '&=',
                        '|=',
                        '^=',
                        ',',
                        // binary/unary operators
                        '+',
                        '-',
                        '*',
                        '**',
                        '/',
                        '%',
                        '++',
                        '--',
                        '<<',
                        '>>',
                        '>>>',
                        '&',
                        '|',
                        '^',
                        '!',
                        '~',
                        '&&',
                        '||',
                        '?',
                        ':',
                        '===',
                        '==',
                        '>=',
                        '<=',
                        '<',
                        '>',
                        '!=',
                        '!=='
                    ].indexOf(t) >= 0;
                };
                // Determine if forward slash (/) is an operator or part of a regular expression
                // https://github.com/mozilla/sweet.js/wiki/design
                Reader.prototype.isRegexStart = function() {
                    var previous = this.values[this.values.length - 1];
                    var regex = previous !== null;
                    switch(previous){
                        case 'this':
                        case ']':
                            regex = false;
                            break;
                        case ')':
                            var keyword = this.values[this.paren - 1];
                            regex = keyword === 'if' || keyword === 'while' || keyword === 'for' || keyword === 'with';
                            break;
                        case '}':
                            // Dividing a function by anything makes little sense,
                            // but we have to check for that.
                            regex = false;
                            if (this.values[this.curly - 3] === 'function') {
                                // Anonymous function, e.g. function(){} /42
                                var check = this.values[this.curly - 4];
                                regex = check ? !this.beforeFunctionExpression(check) : false;
                            } else if (this.values[this.curly - 4] === 'function') {
                                // Named function, e.g. function f(){} /42/
                                var check = this.values[this.curly - 5];
                                regex = check ? !this.beforeFunctionExpression(check) : true;
                            }
                            break;
                        default:
                            break;
                    }
                    return regex;
                };
                Reader.prototype.push = function(token) {
                    if (token.type === 7 /* Punctuator */  || token.type === 4 /* Keyword */ ) {
                        if (token.value === '{') this.curly = this.values.length;
                        else if (token.value === '(') this.paren = this.values.length;
                        this.values.push(token.value);
                    } else this.values.push(null);
                };
                return Reader;
            }();
            var Tokenizer = function() {
                function Tokenizer(code, config) {
                    this.errorHandler = new error_handler_1.ErrorHandler();
                    this.errorHandler.tolerant = config ? typeof config.tolerant === 'boolean' && config.tolerant : false;
                    this.scanner = new scanner_1.Scanner(code, this.errorHandler);
                    this.scanner.trackComment = config ? typeof config.comment === 'boolean' && config.comment : false;
                    this.trackRange = config ? typeof config.range === 'boolean' && config.range : false;
                    this.trackLoc = config ? typeof config.loc === 'boolean' && config.loc : false;
                    this.buffer = [];
                    this.reader = new Reader();
                }
                Tokenizer.prototype.errors = function() {
                    return this.errorHandler.errors;
                };
                Tokenizer.prototype.getNextToken = function() {
                    if (this.buffer.length === 0) {
                        var comments = this.scanner.scanComments();
                        if (this.scanner.trackComment) for(var i = 0; i < comments.length; ++i){
                            var e = comments[i];
                            var value = this.scanner.source.slice(e.slice[0], e.slice[1]);
                            var comment = {
                                type: e.multiLine ? 'BlockComment' : 'LineComment',
                                value: value
                            };
                            if (this.trackRange) comment.range = e.range;
                            if (this.trackLoc) comment.loc = e.loc;
                            this.buffer.push(comment);
                        }
                        if (!this.scanner.eof()) {
                            var loc = void 0;
                            if (this.trackLoc) loc = {
                                start: {
                                    line: this.scanner.lineNumber,
                                    column: this.scanner.index - this.scanner.lineStart
                                },
                                end: {}
                            };
                            var startRegex = this.scanner.source[this.scanner.index] === '/' && this.reader.isRegexStart();
                            var token = startRegex ? this.scanner.scanRegExp() : this.scanner.lex();
                            this.reader.push(token);
                            var entry = {
                                type: token_1.TokenName[token.type],
                                value: this.scanner.source.slice(token.start, token.end)
                            };
                            if (this.trackRange) entry.range = [
                                token.start,
                                token.end
                            ];
                            if (this.trackLoc) {
                                loc.end = {
                                    line: this.scanner.lineNumber,
                                    column: this.scanner.index - this.scanner.lineStart
                                };
                                entry.loc = loc;
                            }
                            if (token.type === 9 /* RegularExpression */ ) {
                                var pattern = token.pattern;
                                var flags = token.flags;
                                entry.regex = {
                                    pattern: pattern,
                                    flags: flags
                                };
                            }
                            this.buffer.push(entry);
                        }
                    }
                    return this.buffer.shift();
                };
                return Tokenizer;
            }();
            exports.Tokenizer = Tokenizer;
        /***/ }
    ]);
});

},{}],"kMWwa":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.visit = exports.use = exports.Type = exports.someField = exports.PathVisitor = exports.Path = exports.NodePath = exports.namedTypes = exports.getSupertypeNames = exports.getFieldValue = exports.getFieldNames = exports.getBuilderName = exports.finalize = exports.eachField = exports.defineMethod = exports.builtInTypes = exports.builders = exports.astNodesAreEquivalent = void 0;
var tslib_1 = require("637f5b1db83e3eda");
var fork_1 = tslib_1.__importDefault(require("1d9148fb785fa038"));
var core_1 = tslib_1.__importDefault(require("4b0e49c9c7e4942b"));
var es6_1 = tslib_1.__importDefault(require("4ac6595d5e9415d0"));
var es7_1 = tslib_1.__importDefault(require("aecb3568ddcf515b"));
var es2020_1 = tslib_1.__importDefault(require("26ae1a439901bd20"));
var jsx_1 = tslib_1.__importDefault(require("4bd2c2ff79e3ecec"));
var flow_1 = tslib_1.__importDefault(require("3760b529e708121d"));
var esprima_1 = tslib_1.__importDefault(require("c8149299afffae10"));
var babel_1 = tslib_1.__importDefault(require("46562e3128664371"));
var typescript_1 = tslib_1.__importDefault(require("6a837f1b02503bc9"));
var es_proposals_1 = tslib_1.__importDefault(require("d25ff40c2b30084d"));
var namedTypes_1 = require("e72b1d3873179373");
Object.defineProperty(exports, "namedTypes", {
    enumerable: true,
    get: function() {
        return namedTypes_1.namedTypes;
    }
});
var _a = fork_1.default([
    // This core module of AST types captures ES5 as it is parsed today by
    // git://github.com/ariya/esprima.git#master.
    core_1.default,
    // Feel free to add to or remove from this list of extension modules to
    // configure the precise type hierarchy that you need.
    es6_1.default,
    es7_1.default,
    es2020_1.default,
    jsx_1.default,
    flow_1.default,
    esprima_1.default,
    babel_1.default,
    typescript_1.default,
    es_proposals_1.default
]), astNodesAreEquivalent = _a.astNodesAreEquivalent, builders = _a.builders, builtInTypes = _a.builtInTypes, defineMethod = _a.defineMethod, eachField = _a.eachField, finalize = _a.finalize, getBuilderName = _a.getBuilderName, getFieldNames = _a.getFieldNames, getFieldValue = _a.getFieldValue, getSupertypeNames = _a.getSupertypeNames, n = _a.namedTypes, NodePath = _a.NodePath, Path = _a.Path, PathVisitor = _a.PathVisitor, someField = _a.someField, Type = _a.Type, use = _a.use, visit = _a.visit;
exports.astNodesAreEquivalent = astNodesAreEquivalent;
exports.builders = builders;
exports.builtInTypes = builtInTypes;
exports.defineMethod = defineMethod;
exports.eachField = eachField;
exports.finalize = finalize;
exports.getBuilderName = getBuilderName;
exports.getFieldNames = getFieldNames;
exports.getFieldValue = getFieldValue;
exports.getSupertypeNames = getSupertypeNames;
exports.NodePath = NodePath;
exports.Path = Path;
exports.PathVisitor = PathVisitor;
exports.someField = someField;
exports.Type = Type;
exports.use = use;
exports.visit = visit;
// Populate the exported fields of the namedTypes namespace, while still
// retaining its member types.
Object.assign(namedTypes_1.namedTypes, n);

},{"637f5b1db83e3eda":"ao9yO","1d9148fb785fa038":"hv5qt","4b0e49c9c7e4942b":"j3uvl","4ac6595d5e9415d0":"lEmvD","aecb3568ddcf515b":"cv0ap","26ae1a439901bd20":"66ZXa","4bd2c2ff79e3ecec":"5LqcL","3760b529e708121d":"9Lg0j","c8149299afffae10":"dtjdj","46562e3128664371":"6X39G","6a837f1b02503bc9":"96Gm8","d25ff40c2b30084d":"ffVka","e72b1d3873179373":"99uyq"}],"ao9yO":[function(require,module,exports,__globalThis) {
/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */ /* global Reflect, Promise, SuppressedError, Symbol */ var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "__extends", ()=>__extends);
parcelHelpers.export(exports, "__assign", ()=>__assign);
parcelHelpers.export(exports, "__rest", ()=>__rest);
parcelHelpers.export(exports, "__decorate", ()=>__decorate);
parcelHelpers.export(exports, "__param", ()=>__param);
parcelHelpers.export(exports, "__esDecorate", ()=>__esDecorate);
parcelHelpers.export(exports, "__runInitializers", ()=>__runInitializers);
parcelHelpers.export(exports, "__propKey", ()=>__propKey);
parcelHelpers.export(exports, "__setFunctionName", ()=>__setFunctionName);
parcelHelpers.export(exports, "__metadata", ()=>__metadata);
parcelHelpers.export(exports, "__awaiter", ()=>__awaiter);
parcelHelpers.export(exports, "__generator", ()=>__generator);
parcelHelpers.export(exports, "__createBinding", ()=>__createBinding);
parcelHelpers.export(exports, "__exportStar", ()=>__exportStar);
parcelHelpers.export(exports, "__values", ()=>__values);
parcelHelpers.export(exports, "__read", ()=>__read);
/** @deprecated */ parcelHelpers.export(exports, "__spread", ()=>__spread);
/** @deprecated */ parcelHelpers.export(exports, "__spreadArrays", ()=>__spreadArrays);
parcelHelpers.export(exports, "__spreadArray", ()=>__spreadArray);
parcelHelpers.export(exports, "__await", ()=>__await);
parcelHelpers.export(exports, "__asyncGenerator", ()=>__asyncGenerator);
parcelHelpers.export(exports, "__asyncDelegator", ()=>__asyncDelegator);
parcelHelpers.export(exports, "__asyncValues", ()=>__asyncValues);
parcelHelpers.export(exports, "__makeTemplateObject", ()=>__makeTemplateObject);
parcelHelpers.export(exports, "__importStar", ()=>__importStar);
parcelHelpers.export(exports, "__importDefault", ()=>__importDefault);
parcelHelpers.export(exports, "__classPrivateFieldGet", ()=>__classPrivateFieldGet);
parcelHelpers.export(exports, "__classPrivateFieldSet", ()=>__classPrivateFieldSet);
parcelHelpers.export(exports, "__classPrivateFieldIn", ()=>__classPrivateFieldIn);
parcelHelpers.export(exports, "__addDisposableResource", ()=>__addDisposableResource);
parcelHelpers.export(exports, "__disposeResources", ()=>__disposeResources);
var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || ({
        __proto__: []
    }) instanceof Array && function(d, b) {
        d.__proto__ = b;
    } || function(d, b) {
        for(var p in b)if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
    };
    return extendStatics(d, b);
};
function __extends(d, b) {
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() {
        this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for(var s, i = 1, n = arguments.length; i < n; i++){
            s = arguments[i];
            for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
function __rest(s, e) {
    var t = {};
    for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function") {
        for(var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++)if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
    }
    return t;
}
function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function __param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
function __esDecorate(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) {
        if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
        return f;
    }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for(var i = decorators.length - 1; i >= 0; i--){
        var context = {};
        for(var p in contextIn)context[p] = p === "access" ? {} : contextIn[p];
        for(var p in contextIn.access)context.access[p] = contextIn.access[p];
        context.addInitializer = function(f) {
            if (done) throw new TypeError("Cannot add initializers after decoration has completed");
            extraInitializers.push(accept(f || null));
        };
        var result = (0, decorators[i])(kind === "accessor" ? {
            get: descriptor.get,
            set: descriptor.set
        } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        } else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
}
function __runInitializers(thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for(var i = 0; i < initializers.length; i++)value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    return useValue ? value : void 0;
}
function __propKey(x) {
    return typeof x === "symbol" ? x : "".concat(x);
}
function __setFunctionName(f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", {
        configurable: true,
        value: prefix ? "".concat(prefix, " ", name) : name
    });
}
function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}
function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
            resolve(value);
        });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}
function __generator(thisArg, body) {
    var _ = {
        label: 0,
        sent: function() {
            if (t[0] & 1) throw t[1];
            return t[1];
        },
        trys: [],
        ops: []
    }, f, y, t, g;
    return g = {
        next: verb(0),
        "throw": verb(1),
        "return": verb(2)
    }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
    }), g;
    function verb(n) {
        return function(v) {
            return step([
                n,
                v
            ]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while(g && (g = 0, op[0] && (_ = 0)), _)try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [
                op[0] & 2,
                t.value
            ];
            switch(op[0]){
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [
                        0
                    ];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [
                6,
                e
            ];
            y = 0;
        } finally{
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
}
var __createBinding = Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
        enumerable: true,
        get: function() {
            return m[k];
        }
    };
    Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
};
function __exportStar(m, o) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
}
function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function() {
            if (o && i >= o.length) o = void 0;
            return {
                value: o && o[i++],
                done: !o
            };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while((n === void 0 || n-- > 0) && !(r = i.next()).done)ar.push(r.value);
    } catch (error) {
        e = {
            error: error
        };
    } finally{
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        } finally{
            if (e) throw e.error;
        }
    }
    return ar;
}
function __spread() {
    for(var ar = [], i = 0; i < arguments.length; i++)ar = ar.concat(__read(arguments[i]));
    return ar;
}
function __spreadArrays() {
    for(var s = 0, i = 0, il = arguments.length; i < il; i++)s += arguments[i].length;
    for(var r = Array(s), k = 0, i = 0; i < il; i++)for(var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)r[k] = a[j];
    return r;
}
function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) {
        for(var i = 0, l = from.length, ar; i < l; i++)if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}
function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
}
function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
        return this;
    }, i;
    function verb(n) {
        if (g[n]) i[n] = function(v) {
            return new Promise(function(a, b) {
                q.push([
                    n,
                    v,
                    a,
                    b
                ]) > 1 || resume(n, v);
            });
        };
    }
    function resume(n, v) {
        try {
            step(g[n](v));
        } catch (e) {
            settle(q[0][3], e);
        }
    }
    function step(r) {
        r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
    }
    function fulfill(value) {
        resume("next", value);
    }
    function reject(value) {
        resume("throw", value);
    }
    function settle(f, v) {
        if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]);
    }
}
function __asyncDelegator(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function(e) {
        throw e;
    }), verb("return"), i[Symbol.iterator] = function() {
        return this;
    }, i;
    function verb(n, f) {
        i[n] = o[n] ? function(v) {
            return (p = !p) ? {
                value: __await(o[n](v)),
                done: false
            } : f ? f(v) : v;
        } : f;
    }
}
function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
        return this;
    }, i);
    function verb(n) {
        i[n] = o[n] && function(v) {
            return new Promise(function(resolve, reject) {
                v = o[n](v), settle(resolve, reject, v.done, v.value);
            });
        };
    }
    function settle(resolve, reject, d, v) {
        Promise.resolve(v).then(function(v) {
            resolve({
                value: v,
                done: d
            });
        }, reject);
    }
}
function __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) Object.defineProperty(cooked, "raw", {
        value: raw
    });
    else cooked.raw = raw;
    return cooked;
}
var __setModuleDefault = Object.create ? function(o, v) {
    Object.defineProperty(o, "default", {
        enumerable: true,
        value: v
    });
} : function(o, v) {
    o["default"] = v;
};
function __importStar(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) {
        for(var k in mod)if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
}
function __importDefault(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
}
function __classPrivateFieldGet(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}
function __classPrivateFieldSet(receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}
function __classPrivateFieldIn(state, receiver) {
    if (receiver === null || typeof receiver !== "object" && typeof receiver !== "function") throw new TypeError("Cannot use 'in' operator on non-object");
    return typeof state === "function" ? receiver === state : state.has(receiver);
}
function __addDisposableResource(env, value, async) {
    if (value !== null && value !== void 0) {
        if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
        var dispose;
        if (async) {
            if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
            dispose = value[Symbol.asyncDispose];
        }
        if (dispose === void 0) {
            if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
            dispose = value[Symbol.dispose];
        }
        if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
        env.stack.push({
            value: value,
            dispose: dispose,
            async: async
        });
    } else if (async) env.stack.push({
        async: true
    });
    return value;
}
var _SuppressedError = typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};
function __disposeResources(env) {
    function fail(e) {
        env.error = env.hasError ? new _SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
        env.hasError = true;
    }
    function next() {
        while(env.stack.length){
            var rec = env.stack.pop();
            try {
                var result = rec.dispose && rec.dispose.call(rec.value);
                if (rec.async) return Promise.resolve(result).then(next, function(e) {
                    fail(e);
                    return next();
                });
            } catch (e) {
                fail(e);
            }
        }
        if (env.hasError) throw env.error;
    }
    return next();
}
exports.default = {
    __extends: __extends,
    __assign: __assign,
    __rest: __rest,
    __decorate: __decorate,
    __param: __param,
    __metadata: __metadata,
    __awaiter: __awaiter,
    __generator: __generator,
    __createBinding: __createBinding,
    __exportStar: __exportStar,
    __values: __values,
    __read: __read,
    __spread: __spread,
    __spreadArrays: __spreadArrays,
    __spreadArray: __spreadArray,
    __await: __await,
    __asyncGenerator: __asyncGenerator,
    __asyncDelegator: __asyncDelegator,
    __asyncValues: __asyncValues,
    __makeTemplateObject: __makeTemplateObject,
    __importStar: __importStar,
    __importDefault: __importDefault,
    __classPrivateFieldGet: __classPrivateFieldGet,
    __classPrivateFieldSet: __classPrivateFieldSet,
    __classPrivateFieldIn: __classPrivateFieldIn,
    __addDisposableResource: __addDisposableResource,
    __disposeResources: __disposeResources
};

},{"@parcel/transformer-js/src/esmodule-helpers.js":"04zWK"}],"hv5qt":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
var tslib_1 = require("dad399eb1c410e5c");
var types_1 = tslib_1.__importDefault(require("9d165eee9d758391"));
var path_visitor_1 = tslib_1.__importDefault(require("1c71e51514779ff5"));
var equiv_1 = tslib_1.__importDefault(require("b122274aecd03479"));
var path_1 = tslib_1.__importDefault(require("ec0b010951a3f3ce"));
var node_path_1 = tslib_1.__importDefault(require("52819d9c030ab222"));
function default_1(defs) {
    var fork = createFork();
    var types = fork.use(types_1.default);
    defs.forEach(fork.use);
    types.finalize();
    var PathVisitor = fork.use(path_visitor_1.default);
    return {
        Type: types.Type,
        builtInTypes: types.builtInTypes,
        namedTypes: types.namedTypes,
        builders: types.builders,
        defineMethod: types.defineMethod,
        getFieldNames: types.getFieldNames,
        getFieldValue: types.getFieldValue,
        eachField: types.eachField,
        someField: types.someField,
        getSupertypeNames: types.getSupertypeNames,
        getBuilderName: types.getBuilderName,
        astNodesAreEquivalent: fork.use(equiv_1.default),
        finalize: types.finalize,
        Path: fork.use(path_1.default),
        NodePath: fork.use(node_path_1.default),
        PathVisitor: PathVisitor,
        use: fork.use,
        visit: PathVisitor.visit
    };
}
exports.default = default_1;
function createFork() {
    var used = [];
    var usedResult = [];
    function use(plugin) {
        var idx = used.indexOf(plugin);
        if (idx === -1) {
            idx = used.length;
            used.push(plugin);
            usedResult[idx] = plugin(fork);
        }
        return usedResult[idx];
    }
    var fork = {
        use: use
    };
    return fork;
}
module.exports = exports["default"];

},{"dad399eb1c410e5c":"ao9yO","9d165eee9d758391":"jL4It","1c71e51514779ff5":"cfHMO","b122274aecd03479":"4ZP5n","ec0b010951a3f3ce":"hafEX","52819d9c030ab222":"eJCfZ"}],"jL4It":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Def = void 0;
var tslib_1 = require("dc5a100d5613a862");
var Op = Object.prototype;
var objToStr = Op.toString;
var hasOwn = Op.hasOwnProperty;
var BaseType = /** @class */ function() {
    function BaseType() {}
    BaseType.prototype.assert = function(value, deep) {
        if (!this.check(value, deep)) {
            var str = shallowStringify(value);
            throw new Error(str + " does not match type " + this);
        }
        return true;
    };
    BaseType.prototype.arrayOf = function() {
        var elemType = this;
        return new ArrayType(elemType);
    };
    return BaseType;
}();
var ArrayType = /** @class */ function(_super) {
    tslib_1.__extends(ArrayType, _super);
    function ArrayType(elemType) {
        var _this = _super.call(this) || this;
        _this.elemType = elemType;
        _this.kind = "ArrayType";
        return _this;
    }
    ArrayType.prototype.toString = function() {
        return "[" + this.elemType + "]";
    };
    ArrayType.prototype.check = function(value, deep) {
        var _this = this;
        return Array.isArray(value) && value.every(function(elem) {
            return _this.elemType.check(elem, deep);
        });
    };
    return ArrayType;
}(BaseType);
var IdentityType = /** @class */ function(_super) {
    tslib_1.__extends(IdentityType, _super);
    function IdentityType(value) {
        var _this = _super.call(this) || this;
        _this.value = value;
        _this.kind = "IdentityType";
        return _this;
    }
    IdentityType.prototype.toString = function() {
        return String(this.value);
    };
    IdentityType.prototype.check = function(value, deep) {
        var result = value === this.value;
        if (!result && typeof deep === "function") deep(this, value);
        return result;
    };
    return IdentityType;
}(BaseType);
var ObjectType = /** @class */ function(_super) {
    tslib_1.__extends(ObjectType, _super);
    function ObjectType(fields) {
        var _this = _super.call(this) || this;
        _this.fields = fields;
        _this.kind = "ObjectType";
        return _this;
    }
    ObjectType.prototype.toString = function() {
        return "{ " + this.fields.join(", ") + " }";
    };
    ObjectType.prototype.check = function(value, deep) {
        return objToStr.call(value) === objToStr.call({}) && this.fields.every(function(field) {
            return field.type.check(value[field.name], deep);
        });
    };
    return ObjectType;
}(BaseType);
var OrType = /** @class */ function(_super) {
    tslib_1.__extends(OrType, _super);
    function OrType(types) {
        var _this = _super.call(this) || this;
        _this.types = types;
        _this.kind = "OrType";
        return _this;
    }
    OrType.prototype.toString = function() {
        return this.types.join(" | ");
    };
    OrType.prototype.check = function(value, deep) {
        return this.types.some(function(type) {
            return type.check(value, deep);
        });
    };
    return OrType;
}(BaseType);
var PredicateType = /** @class */ function(_super) {
    tslib_1.__extends(PredicateType, _super);
    function PredicateType(name, predicate) {
        var _this = _super.call(this) || this;
        _this.name = name;
        _this.predicate = predicate;
        _this.kind = "PredicateType";
        return _this;
    }
    PredicateType.prototype.toString = function() {
        return this.name;
    };
    PredicateType.prototype.check = function(value, deep) {
        var result = this.predicate(value, deep);
        if (!result && typeof deep === "function") deep(this, value);
        return result;
    };
    return PredicateType;
}(BaseType);
var Def = /** @class */ function() {
    function Def(type, typeName) {
        this.type = type;
        this.typeName = typeName;
        this.baseNames = [];
        this.ownFields = Object.create(null);
        // Includes own typeName. Populated during finalization.
        this.allSupertypes = Object.create(null);
        // Linear inheritance hierarchy. Populated during finalization.
        this.supertypeList = [];
        // Includes inherited fields.
        this.allFields = Object.create(null);
        // Non-hidden keys of allFields.
        this.fieldNames = [];
        // This property will be overridden as true by individual Def instances
        // when they are finalized.
        this.finalized = false;
        // False by default until .build(...) is called on an instance.
        this.buildable = false;
        this.buildParams = [];
    }
    Def.prototype.isSupertypeOf = function(that) {
        if (that instanceof Def) {
            if (this.finalized !== true || that.finalized !== true) throw new Error("");
            return hasOwn.call(that.allSupertypes, this.typeName);
        } else throw new Error(that + " is not a Def");
    };
    Def.prototype.checkAllFields = function(value, deep) {
        var allFields = this.allFields;
        if (this.finalized !== true) throw new Error("" + this.typeName);
        function checkFieldByName(name) {
            var field = allFields[name];
            var type = field.type;
            var child = field.getValue(value);
            return type.check(child, deep);
        }
        return value !== null && typeof value === "object" && Object.keys(allFields).every(checkFieldByName);
    };
    Def.prototype.bases = function() {
        var supertypeNames = [];
        for(var _i = 0; _i < arguments.length; _i++)supertypeNames[_i] = arguments[_i];
        var bases = this.baseNames;
        if (this.finalized) {
            if (supertypeNames.length !== bases.length) throw new Error("");
            for(var i = 0; i < supertypeNames.length; i++){
                if (supertypeNames[i] !== bases[i]) throw new Error("");
            }
            return this;
        }
        supertypeNames.forEach(function(baseName) {
            // This indexOf lookup may be O(n), but the typical number of base
            // names is very small, and indexOf is a native Array method.
            if (bases.indexOf(baseName) < 0) bases.push(baseName);
        });
        return this; // For chaining.
    };
    return Def;
}();
exports.Def = Def;
var Field = /** @class */ function() {
    function Field(name, type, defaultFn, hidden) {
        this.name = name;
        this.type = type;
        this.defaultFn = defaultFn;
        this.hidden = !!hidden;
    }
    Field.prototype.toString = function() {
        return JSON.stringify(this.name) + ": " + this.type;
    };
    Field.prototype.getValue = function(obj) {
        var value = obj[this.name];
        if (typeof value !== "undefined") return value;
        if (typeof this.defaultFn === "function") value = this.defaultFn.call(obj);
        return value;
    };
    return Field;
}();
function shallowStringify(value) {
    if (Array.isArray(value)) return "[" + value.map(shallowStringify).join(", ") + "]";
    if (value && typeof value === "object") return "{ " + Object.keys(value).map(function(key) {
        return key + ": " + value[key];
    }).join(", ") + " }";
    return JSON.stringify(value);
}
function typesPlugin(_fork) {
    var Type = {
        or: function() {
            var types = [];
            for(var _i = 0; _i < arguments.length; _i++)types[_i] = arguments[_i];
            return new OrType(types.map(function(type) {
                return Type.from(type);
            }));
        },
        from: function(value, name) {
            if (value instanceof ArrayType || value instanceof IdentityType || value instanceof ObjectType || value instanceof OrType || value instanceof PredicateType) return value;
            // The Def type is used as a helper for constructing compound
            // interface types for AST nodes.
            if (value instanceof Def) return value.type;
            // Support [ElemType] syntax.
            if (isArray.check(value)) {
                if (value.length !== 1) throw new Error("only one element type is permitted for typed arrays");
                return new ArrayType(Type.from(value[0]));
            }
            // Support { someField: FieldType, ... } syntax.
            if (isObject.check(value)) return new ObjectType(Object.keys(value).map(function(name) {
                return new Field(name, Type.from(value[name], name));
            }));
            if (typeof value === "function") {
                var bicfIndex = builtInCtorFns.indexOf(value);
                if (bicfIndex >= 0) return builtInCtorTypes[bicfIndex];
                if (typeof name !== "string") throw new Error("missing name");
                return new PredicateType(name, value);
            }
            // As a last resort, toType returns a type that matches any value that
            // is === from. This is primarily useful for literal values like
            // toType(null), but it has the additional advantage of allowing
            // toType to be a total function.
            return new IdentityType(value);
        },
        // Define a type whose name is registered in a namespace (the defCache) so
        // that future definitions will return the same type given the same name.
        // In particular, this system allows for circular and forward definitions.
        // The Def object d returned from Type.def may be used to configure the
        // type d.type by calling methods such as d.bases, d.build, and d.field.
        def: function(typeName) {
            return hasOwn.call(defCache, typeName) ? defCache[typeName] : defCache[typeName] = new DefImpl(typeName);
        },
        hasDef: function(typeName) {
            return hasOwn.call(defCache, typeName);
        }
    };
    var builtInCtorFns = [];
    var builtInCtorTypes = [];
    function defBuiltInType(name, example) {
        var objStr = objToStr.call(example);
        var type = new PredicateType(name, function(value) {
            return objToStr.call(value) === objStr;
        });
        if (example && typeof example.constructor === "function") {
            builtInCtorFns.push(example.constructor);
            builtInCtorTypes.push(type);
        }
        return type;
    }
    // These types check the underlying [[Class]] attribute of the given
    // value, rather than using the problematic typeof operator. Note however
    // that no subtyping is considered; so, for instance, isObject.check
    // returns false for [], /./, new Date, and null.
    var isString = defBuiltInType("string", "truthy");
    var isFunction = defBuiltInType("function", function() {});
    var isArray = defBuiltInType("array", []);
    var isObject = defBuiltInType("object", {});
    var isRegExp = defBuiltInType("RegExp", /./);
    var isDate = defBuiltInType("Date", new Date());
    var isNumber = defBuiltInType("number", 3);
    var isBoolean = defBuiltInType("boolean", true);
    var isNull = defBuiltInType("null", null);
    var isUndefined = defBuiltInType("undefined", undefined);
    var builtInTypes = {
        string: isString,
        function: isFunction,
        array: isArray,
        object: isObject,
        RegExp: isRegExp,
        Date: isDate,
        number: isNumber,
        boolean: isBoolean,
        null: isNull,
        undefined: isUndefined
    };
    // In order to return the same Def instance every time Type.def is called
    // with a particular name, those instances need to be stored in a cache.
    var defCache = Object.create(null);
    function defFromValue(value) {
        if (value && typeof value === "object") {
            var type = value.type;
            if (typeof type === "string" && hasOwn.call(defCache, type)) {
                var d = defCache[type];
                if (d.finalized) return d;
            }
        }
        return null;
    }
    var DefImpl = /** @class */ function(_super) {
        tslib_1.__extends(DefImpl, _super);
        function DefImpl(typeName) {
            var _this = _super.call(this, new PredicateType(typeName, function(value, deep) {
                return _this.check(value, deep);
            }), typeName) || this;
            return _this;
        }
        DefImpl.prototype.check = function(value, deep) {
            if (this.finalized !== true) throw new Error("prematurely checking unfinalized type " + this.typeName);
            // A Def type can only match an object value.
            if (value === null || typeof value !== "object") return false;
            var vDef = defFromValue(value);
            if (!vDef) {
                // If we couldn't infer the Def associated with the given value,
                // and we expected it to be a SourceLocation or a Position, it was
                // probably just missing a "type" field (because Esprima does not
                // assign a type property to such nodes). Be optimistic and let
                // this.checkAllFields make the final decision.
                if (this.typeName === "SourceLocation" || this.typeName === "Position") return this.checkAllFields(value, deep);
                // Calling this.checkAllFields for any other type of node is both
                // bad for performance and way too forgiving.
                return false;
            }
            // If checking deeply and vDef === this, then we only need to call
            // checkAllFields once. Calling checkAllFields is too strict when deep
            // is false, because then we only care about this.isSupertypeOf(vDef).
            if (deep && vDef === this) return this.checkAllFields(value, deep);
            // In most cases we rely exclusively on isSupertypeOf to make O(1)
            // subtyping determinations. This suffices in most situations outside
            // of unit tests, since interface conformance is checked whenever new
            // instances are created using builder functions.
            if (!this.isSupertypeOf(vDef)) return false;
            // The exception is when deep is true; then, we recursively check all
            // fields.
            if (!deep) return true;
            // Use the more specific Def (vDef) to perform the deep check, but
            // shallow-check fields defined by the less specific Def (this).
            return vDef.checkAllFields(value, deep) && this.checkAllFields(value, false);
        };
        DefImpl.prototype.build = function() {
            var _this = this;
            var buildParams = [];
            for(var _i = 0; _i < arguments.length; _i++)buildParams[_i] = arguments[_i];
            // Calling Def.prototype.build multiple times has the effect of merely
            // redefining this property.
            this.buildParams = buildParams;
            if (this.buildable) // If this Def is already buildable, update self.buildParams and
            // continue using the old builder function.
            return this;
            // Every buildable type will have its "type" field filled in
            // automatically. This includes types that are not subtypes of Node,
            // like SourceLocation, but that seems harmless (TODO?).
            this.field("type", String, function() {
                return _this.typeName;
            });
            // Override Dp.buildable for this Def instance.
            this.buildable = true;
            var addParam = function(built, param, arg, isArgAvailable) {
                if (hasOwn.call(built, param)) return;
                var all = _this.allFields;
                if (!hasOwn.call(all, param)) throw new Error("" + param);
                var field = all[param];
                var type = field.type;
                var value;
                if (isArgAvailable) value = arg;
                else if (field.defaultFn) // Expose the partially-built object to the default
                // function as its `this` object.
                value = field.defaultFn.call(built);
                else {
                    var message = "no value or default function given for field " + JSON.stringify(param) + " of " + _this.typeName + "(" + _this.buildParams.map(function(name) {
                        return all[name];
                    }).join(", ") + ")";
                    throw new Error(message);
                }
                if (!type.check(value)) throw new Error(shallowStringify(value) + " does not match field " + field + " of type " + _this.typeName);
                built[param] = value;
            };
            // Calling the builder function will construct an instance of the Def,
            // with positional arguments mapped to the fields original passed to .build.
            // If not enough arguments are provided, the default value for the remaining fields
            // will be used.
            var builder = function() {
                var args = [];
                for(var _i = 0; _i < arguments.length; _i++)args[_i] = arguments[_i];
                var argc = args.length;
                if (!_this.finalized) throw new Error("attempting to instantiate unfinalized type " + _this.typeName);
                var built = Object.create(nodePrototype);
                _this.buildParams.forEach(function(param, i) {
                    if (i < argc) addParam(built, param, args[i], true);
                    else addParam(built, param, null, false);
                });
                Object.keys(_this.allFields).forEach(function(param) {
                    // Use the default value.
                    addParam(built, param, null, false);
                });
                // Make sure that the "type" field was filled automatically.
                if (built.type !== _this.typeName) throw new Error("");
                return built;
            };
            // Calling .from on the builder function will construct an instance of the Def,
            // using field values from the passed object. For fields missing from the passed object,
            // their default value will be used.
            builder.from = function(obj) {
                if (!_this.finalized) throw new Error("attempting to instantiate unfinalized type " + _this.typeName);
                var built = Object.create(nodePrototype);
                Object.keys(_this.allFields).forEach(function(param) {
                    if (hasOwn.call(obj, param)) addParam(built, param, obj[param], true);
                    else addParam(built, param, null, false);
                });
                // Make sure that the "type" field was filled automatically.
                if (built.type !== _this.typeName) throw new Error("");
                return built;
            };
            Object.defineProperty(builders, getBuilderName(this.typeName), {
                enumerable: true,
                value: builder
            });
            return this;
        };
        // The reason fields are specified using .field(...) instead of an object
        // literal syntax is somewhat subtle: the object literal syntax would
        // support only one key and one value, but with .field(...) we can pass
        // any number of arguments to specify the field.
        DefImpl.prototype.field = function(name, type, defaultFn, hidden) {
            if (this.finalized) {
                console.error("Ignoring attempt to redefine field " + JSON.stringify(name) + " of finalized type " + JSON.stringify(this.typeName));
                return this;
            }
            this.ownFields[name] = new Field(name, Type.from(type), defaultFn, hidden);
            return this; // For chaining.
        };
        DefImpl.prototype.finalize = function() {
            var _this = this;
            // It's not an error to finalize a type more than once, but only the
            // first call to .finalize does anything.
            if (!this.finalized) {
                var allFields = this.allFields;
                var allSupertypes = this.allSupertypes;
                this.baseNames.forEach(function(name) {
                    var def = defCache[name];
                    if (def instanceof Def) {
                        def.finalize();
                        extend(allFields, def.allFields);
                        extend(allSupertypes, def.allSupertypes);
                    } else {
                        var message = "unknown supertype name " + JSON.stringify(name) + " for subtype " + JSON.stringify(_this.typeName);
                        throw new Error(message);
                    }
                });
                // TODO Warn if fields are overridden with incompatible types.
                extend(allFields, this.ownFields);
                allSupertypes[this.typeName] = this;
                this.fieldNames.length = 0;
                for(var fieldName in allFields)if (hasOwn.call(allFields, fieldName) && !allFields[fieldName].hidden) this.fieldNames.push(fieldName);
                // Types are exported only once they have been finalized.
                Object.defineProperty(namedTypes, this.typeName, {
                    enumerable: true,
                    value: this.type
                });
                this.finalized = true;
                // A linearization of the inheritance hierarchy.
                populateSupertypeList(this.typeName, this.supertypeList);
                if (this.buildable && this.supertypeList.lastIndexOf("Expression") >= 0) wrapExpressionBuilderWithStatement(this.typeName);
            }
        };
        return DefImpl;
    }(Def);
    // Note that the list returned by this function is a copy of the internal
    // supertypeList, *without* the typeName itself as the first element.
    function getSupertypeNames(typeName) {
        if (!hasOwn.call(defCache, typeName)) throw new Error("");
        var d = defCache[typeName];
        if (d.finalized !== true) throw new Error("");
        return d.supertypeList.slice(1);
    }
    // Returns an object mapping from every known type in the defCache to the
    // most specific supertype whose name is an own property of the candidates
    // object.
    function computeSupertypeLookupTable(candidates) {
        var table = {};
        var typeNames = Object.keys(defCache);
        var typeNameCount = typeNames.length;
        for(var i = 0; i < typeNameCount; ++i){
            var typeName = typeNames[i];
            var d = defCache[typeName];
            if (d.finalized !== true) throw new Error("" + typeName);
            for(var j = 0; j < d.supertypeList.length; ++j){
                var superTypeName = d.supertypeList[j];
                if (hasOwn.call(candidates, superTypeName)) {
                    table[typeName] = superTypeName;
                    break;
                }
            }
        }
        return table;
    }
    var builders = Object.create(null);
    // This object is used as prototype for any node created by a builder.
    var nodePrototype = {};
    // Call this function to define a new method to be shared by all AST
    // nodes. The replaced method (if any) is returned for easy wrapping.
    function defineMethod(name, func) {
        var old = nodePrototype[name];
        // Pass undefined as func to delete nodePrototype[name].
        if (isUndefined.check(func)) delete nodePrototype[name];
        else {
            isFunction.assert(func);
            Object.defineProperty(nodePrototype, name, {
                enumerable: true,
                configurable: true,
                value: func
            });
        }
        return old;
    }
    function getBuilderName(typeName) {
        return typeName.replace(/^[A-Z]+/, function(upperCasePrefix) {
            var len = upperCasePrefix.length;
            switch(len){
                case 0:
                    return "";
                // If there's only one initial capital letter, just lower-case it.
                case 1:
                    return upperCasePrefix.toLowerCase();
                default:
                    // If there's more than one initial capital letter, lower-case
                    // all but the last one, so that XMLDefaultDeclaration (for
                    // example) becomes xmlDefaultDeclaration.
                    return upperCasePrefix.slice(0, len - 1).toLowerCase() + upperCasePrefix.charAt(len - 1);
            }
        });
    }
    function getStatementBuilderName(typeName) {
        typeName = getBuilderName(typeName);
        return typeName.replace(/(Expression)?$/, "Statement");
    }
    var namedTypes = {};
    // Like Object.keys, but aware of what fields each AST type should have.
    function getFieldNames(object) {
        var d = defFromValue(object);
        if (d) return d.fieldNames.slice(0);
        if ("type" in object) throw new Error("did not recognize object of type " + JSON.stringify(object.type));
        return Object.keys(object);
    }
    // Get the value of an object property, taking object.type and default
    // functions into account.
    function getFieldValue(object, fieldName) {
        var d = defFromValue(object);
        if (d) {
            var field = d.allFields[fieldName];
            if (field) return field.getValue(object);
        }
        return object && object[fieldName];
    }
    // Iterate over all defined fields of an object, including those missing
    // or undefined, passing each field name and effective value (as returned
    // by getFieldValue) to the callback. If the object has no corresponding
    // Def, the callback will never be called.
    function eachField(object, callback, context) {
        getFieldNames(object).forEach(function(name) {
            callback.call(this, name, getFieldValue(object, name));
        }, context);
    }
    // Similar to eachField, except that iteration stops as soon as the
    // callback returns a truthy value. Like Array.prototype.some, the final
    // result is either true or false to indicates whether the callback
    // returned true for any element or not.
    function someField(object, callback, context) {
        return getFieldNames(object).some(function(name) {
            return callback.call(this, name, getFieldValue(object, name));
        }, context);
    }
    // Adds an additional builder for Expression subtypes
    // that wraps the built Expression in an ExpressionStatements.
    function wrapExpressionBuilderWithStatement(typeName) {
        var wrapperName = getStatementBuilderName(typeName);
        // skip if the builder already exists
        if (builders[wrapperName]) return;
        // the builder function to wrap with builders.ExpressionStatement
        var wrapped = builders[getBuilderName(typeName)];
        // skip if there is nothing to wrap
        if (!wrapped) return;
        var builder = function() {
            var args = [];
            for(var _i = 0; _i < arguments.length; _i++)args[_i] = arguments[_i];
            return builders.expressionStatement(wrapped.apply(builders, args));
        };
        builder.from = function() {
            var args = [];
            for(var _i = 0; _i < arguments.length; _i++)args[_i] = arguments[_i];
            return builders.expressionStatement(wrapped.from.apply(builders, args));
        };
        builders[wrapperName] = builder;
    }
    function populateSupertypeList(typeName, list) {
        list.length = 0;
        list.push(typeName);
        var lastSeen = Object.create(null);
        for(var pos = 0; pos < list.length; ++pos){
            typeName = list[pos];
            var d = defCache[typeName];
            if (d.finalized !== true) throw new Error("");
            // If we saw typeName earlier in the breadth-first traversal,
            // delete the last-seen occurrence.
            if (hasOwn.call(lastSeen, typeName)) delete list[lastSeen[typeName]];
            // Record the new index of the last-seen occurrence of typeName.
            lastSeen[typeName] = pos;
            // Enqueue the base names of this type.
            list.push.apply(list, d.baseNames);
        }
        // Compaction loop to remove array holes.
        for(var to = 0, from = to, len = list.length; from < len; ++from)if (hasOwn.call(list, from)) list[to++] = list[from];
        list.length = to;
    }
    function extend(into, from) {
        Object.keys(from).forEach(function(name) {
            into[name] = from[name];
        });
        return into;
    }
    function finalize() {
        Object.keys(defCache).forEach(function(name) {
            defCache[name].finalize();
        });
    }
    return {
        Type: Type,
        builtInTypes: builtInTypes,
        getSupertypeNames: getSupertypeNames,
        computeSupertypeLookupTable: computeSupertypeLookupTable,
        builders: builders,
        defineMethod: defineMethod,
        getBuilderName: getBuilderName,
        getStatementBuilderName: getStatementBuilderName,
        namedTypes: namedTypes,
        getFieldNames: getFieldNames,
        getFieldValue: getFieldValue,
        eachField: eachField,
        someField: someField,
        finalize: finalize
    };
}
exports.default = typesPlugin;

},{"dc5a100d5613a862":"ao9yO"}],"cfHMO":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
var tslib_1 = require("2685cba67a6dc285");
var types_1 = tslib_1.__importDefault(require("ecc0ad31f90c3894"));
var node_path_1 = tslib_1.__importDefault(require("4b0f6422070a7d78"));
var hasOwn = Object.prototype.hasOwnProperty;
function pathVisitorPlugin(fork) {
    var types = fork.use(types_1.default);
    var NodePath = fork.use(node_path_1.default);
    var isArray = types.builtInTypes.array;
    var isObject = types.builtInTypes.object;
    var isFunction = types.builtInTypes.function;
    var undefined;
    var PathVisitor = function PathVisitor() {
        if (!(this instanceof PathVisitor)) throw new Error("PathVisitor constructor cannot be invoked without 'new'");
        // Permanent state.
        this._reusableContextStack = [];
        this._methodNameTable = computeMethodNameTable(this);
        this._shouldVisitComments = hasOwn.call(this._methodNameTable, "Block") || hasOwn.call(this._methodNameTable, "Line");
        this.Context = makeContextConstructor(this);
        // State reset every time PathVisitor.prototype.visit is called.
        this._visiting = false;
        this._changeReported = false;
    };
    function computeMethodNameTable(visitor) {
        var typeNames = Object.create(null);
        for(var methodName in visitor)if (/^visit[A-Z]/.test(methodName)) typeNames[methodName.slice("visit".length)] = true;
        var supertypeTable = types.computeSupertypeLookupTable(typeNames);
        var methodNameTable = Object.create(null);
        var typeNameKeys = Object.keys(supertypeTable);
        var typeNameCount = typeNameKeys.length;
        for(var i = 0; i < typeNameCount; ++i){
            var typeName = typeNameKeys[i];
            methodName = "visit" + supertypeTable[typeName];
            if (isFunction.check(visitor[methodName])) methodNameTable[typeName] = methodName;
        }
        return methodNameTable;
    }
    PathVisitor.fromMethodsObject = function fromMethodsObject(methods) {
        if (methods instanceof PathVisitor) return methods;
        if (!isObject.check(methods)) // An empty visitor?
        return new PathVisitor;
        var Visitor = function Visitor() {
            if (!(this instanceof Visitor)) throw new Error("Visitor constructor cannot be invoked without 'new'");
            PathVisitor.call(this);
        };
        var Vp = Visitor.prototype = Object.create(PVp);
        Vp.constructor = Visitor;
        extend(Vp, methods);
        extend(Visitor, PathVisitor);
        isFunction.assert(Visitor.fromMethodsObject);
        isFunction.assert(Visitor.visit);
        return new Visitor;
    };
    function extend(target, source) {
        for(var property in source)if (hasOwn.call(source, property)) target[property] = source[property];
        return target;
    }
    PathVisitor.visit = function visit(node, methods) {
        return PathVisitor.fromMethodsObject(methods).visit(node);
    };
    var PVp = PathVisitor.prototype;
    PVp.visit = function() {
        if (this._visiting) throw new Error("Recursively calling visitor.visit(path) resets visitor state. Try this.visit(path) or this.traverse(path) instead.");
        // Private state that needs to be reset before every traversal.
        this._visiting = true;
        this._changeReported = false;
        this._abortRequested = false;
        var argc = arguments.length;
        var args = new Array(argc);
        for(var i = 0; i < argc; ++i)args[i] = arguments[i];
        if (!(args[0] instanceof NodePath)) args[0] = new NodePath({
            root: args[0]
        }).get("root");
        // Called with the same arguments as .visit.
        this.reset.apply(this, args);
        var didNotThrow;
        try {
            var root = this.visitWithoutReset(args[0]);
            didNotThrow = true;
        } finally{
            this._visiting = false;
            if (!didNotThrow && this._abortRequested) // If this.visitWithoutReset threw an exception and
            // this._abortRequested was set to true, return the root of
            // the AST instead of letting the exception propagate, so that
            // client code does not have to provide a try-catch block to
            // intercept the AbortRequest exception.  Other kinds of
            // exceptions will propagate without being intercepted and
            // rethrown by a catch block, so their stacks will accurately
            // reflect the original throwing context.
            return args[0].value;
        }
        return root;
    };
    PVp.AbortRequest = function AbortRequest() {};
    PVp.abort = function() {
        var visitor = this;
        visitor._abortRequested = true;
        var request = new visitor.AbortRequest();
        // If you decide to catch this exception and stop it from propagating,
        // make sure to call its cancel method to avoid silencing other
        // exceptions that might be thrown later in the traversal.
        request.cancel = function() {
            visitor._abortRequested = false;
        };
        throw request;
    };
    PVp.reset = function(_path /*, additional arguments */ ) {
    // Empty stub; may be reassigned or overridden by subclasses.
    };
    PVp.visitWithoutReset = function(path) {
        if (this instanceof this.Context) // Since this.Context.prototype === this, there's a chance we
        // might accidentally call context.visitWithoutReset. If that
        // happens, re-invoke the method against context.visitor.
        return this.visitor.visitWithoutReset(path);
        if (!(path instanceof NodePath)) throw new Error("");
        var value = path.value;
        var methodName = value && typeof value === "object" && typeof value.type === "string" && this._methodNameTable[value.type];
        if (methodName) {
            var context = this.acquireContext(path);
            try {
                return context.invokeVisitorMethod(methodName);
            } finally{
                this.releaseContext(context);
            }
        } else // If there was no visitor method to call, visit the children of
        // this node generically.
        return visitChildren(path, this);
    };
    function visitChildren(path, visitor) {
        if (!(path instanceof NodePath)) throw new Error("");
        if (!(visitor instanceof PathVisitor)) throw new Error("");
        var value = path.value;
        if (isArray.check(value)) path.each(visitor.visitWithoutReset, visitor);
        else if (!isObject.check(value)) ;
        else {
            var childNames = types.getFieldNames(value);
            // The .comments field of the Node type is hidden, so we only
            // visit it if the visitor defines visitBlock or visitLine, and
            // value.comments is defined.
            if (visitor._shouldVisitComments && value.comments && childNames.indexOf("comments") < 0) childNames.push("comments");
            var childCount = childNames.length;
            var childPaths = [];
            for(var i = 0; i < childCount; ++i){
                var childName = childNames[i];
                if (!hasOwn.call(value, childName)) value[childName] = types.getFieldValue(value, childName);
                childPaths.push(path.get(childName));
            }
            for(var i = 0; i < childCount; ++i)visitor.visitWithoutReset(childPaths[i]);
        }
        return path.value;
    }
    PVp.acquireContext = function(path) {
        if (this._reusableContextStack.length === 0) return new this.Context(path);
        return this._reusableContextStack.pop().reset(path);
    };
    PVp.releaseContext = function(context) {
        if (!(context instanceof this.Context)) throw new Error("");
        this._reusableContextStack.push(context);
        context.currentPath = null;
    };
    PVp.reportChanged = function() {
        this._changeReported = true;
    };
    PVp.wasChangeReported = function() {
        return this._changeReported;
    };
    function makeContextConstructor(visitor) {
        function Context(path) {
            if (!(this instanceof Context)) throw new Error("");
            if (!(this instanceof PathVisitor)) throw new Error("");
            if (!(path instanceof NodePath)) throw new Error("");
            Object.defineProperty(this, "visitor", {
                value: visitor,
                writable: false,
                enumerable: true,
                configurable: false
            });
            this.currentPath = path;
            this.needToCallTraverse = true;
            Object.seal(this);
        }
        if (!(visitor instanceof PathVisitor)) throw new Error("");
        // Note that the visitor object is the prototype of Context.prototype,
        // so all visitor methods are inherited by context objects.
        var Cp = Context.prototype = Object.create(visitor);
        Cp.constructor = Context;
        extend(Cp, sharedContextProtoMethods);
        return Context;
    }
    // Every PathVisitor has a different this.Context constructor and
    // this.Context.prototype object, but those prototypes can all use the
    // same reset, invokeVisitorMethod, and traverse function objects.
    var sharedContextProtoMethods = Object.create(null);
    sharedContextProtoMethods.reset = function reset(path) {
        if (!(this instanceof this.Context)) throw new Error("");
        if (!(path instanceof NodePath)) throw new Error("");
        this.currentPath = path;
        this.needToCallTraverse = true;
        return this;
    };
    sharedContextProtoMethods.invokeVisitorMethod = function invokeVisitorMethod(methodName) {
        if (!(this instanceof this.Context)) throw new Error("");
        if (!(this.currentPath instanceof NodePath)) throw new Error("");
        var result = this.visitor[methodName].call(this, this.currentPath);
        if (result === false) // Visitor methods return false to indicate that they have handled
        // their own traversal needs, and we should not complain if
        // this.needToCallTraverse is still true.
        this.needToCallTraverse = false;
        else if (result !== undefined) {
            // Any other non-undefined value returned from the visitor method
            // is interpreted as a replacement value.
            this.currentPath = this.currentPath.replace(result)[0];
            if (this.needToCallTraverse) // If this.traverse still hasn't been called, visit the
            // children of the replacement node.
            this.traverse(this.currentPath);
        }
        if (this.needToCallTraverse !== false) throw new Error("Must either call this.traverse or return false in " + methodName);
        var path = this.currentPath;
        return path && path.value;
    };
    sharedContextProtoMethods.traverse = function traverse(path, newVisitor) {
        if (!(this instanceof this.Context)) throw new Error("");
        if (!(path instanceof NodePath)) throw new Error("");
        if (!(this.currentPath instanceof NodePath)) throw new Error("");
        this.needToCallTraverse = false;
        return visitChildren(path, PathVisitor.fromMethodsObject(newVisitor || this.visitor));
    };
    sharedContextProtoMethods.visit = function visit(path, newVisitor) {
        if (!(this instanceof this.Context)) throw new Error("");
        if (!(path instanceof NodePath)) throw new Error("");
        if (!(this.currentPath instanceof NodePath)) throw new Error("");
        this.needToCallTraverse = false;
        return PathVisitor.fromMethodsObject(newVisitor || this.visitor).visitWithoutReset(path);
    };
    sharedContextProtoMethods.reportChanged = function reportChanged() {
        this.visitor.reportChanged();
    };
    sharedContextProtoMethods.abort = function abort() {
        this.needToCallTraverse = false;
        this.visitor.abort();
    };
    return PathVisitor;
}
exports.default = pathVisitorPlugin;
module.exports = exports["default"];

},{"2685cba67a6dc285":"ao9yO","ecc0ad31f90c3894":"jL4It","4b0f6422070a7d78":"eJCfZ"}],"eJCfZ":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
var tslib_1 = require("df2b9b32cfd0e157");
var types_1 = tslib_1.__importDefault(require("637c66c6ce4fe427"));
var path_1 = tslib_1.__importDefault(require("d574f23a90a75c6b"));
var scope_1 = tslib_1.__importDefault(require("3fbdec97b5dd7916"));
function nodePathPlugin(fork) {
    var types = fork.use(types_1.default);
    var n = types.namedTypes;
    var b = types.builders;
    var isNumber = types.builtInTypes.number;
    var isArray = types.builtInTypes.array;
    var Path = fork.use(path_1.default);
    var Scope = fork.use(scope_1.default);
    var NodePath = function NodePath(value, parentPath, name) {
        if (!(this instanceof NodePath)) throw new Error("NodePath constructor cannot be invoked without 'new'");
        Path.call(this, value, parentPath, name);
    };
    var NPp = NodePath.prototype = Object.create(Path.prototype, {
        constructor: {
            value: NodePath,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    Object.defineProperties(NPp, {
        node: {
            get: function() {
                Object.defineProperty(this, "node", {
                    configurable: true,
                    value: this._computeNode()
                });
                return this.node;
            }
        },
        parent: {
            get: function() {
                Object.defineProperty(this, "parent", {
                    configurable: true,
                    value: this._computeParent()
                });
                return this.parent;
            }
        },
        scope: {
            get: function() {
                Object.defineProperty(this, "scope", {
                    configurable: true,
                    value: this._computeScope()
                });
                return this.scope;
            }
        }
    });
    NPp.replace = function() {
        delete this.node;
        delete this.parent;
        delete this.scope;
        return Path.prototype.replace.apply(this, arguments);
    };
    NPp.prune = function() {
        var remainingNodePath = this.parent;
        this.replace();
        return cleanUpNodesAfterPrune(remainingNodePath);
    };
    // The value of the first ancestor Path whose value is a Node.
    NPp._computeNode = function() {
        var value = this.value;
        if (n.Node.check(value)) return value;
        var pp = this.parentPath;
        return pp && pp.node || null;
    };
    // The first ancestor Path whose value is a Node distinct from this.node.
    NPp._computeParent = function() {
        var value = this.value;
        var pp = this.parentPath;
        if (!n.Node.check(value)) {
            while(pp && !n.Node.check(pp.value))pp = pp.parentPath;
            if (pp) pp = pp.parentPath;
        }
        while(pp && !n.Node.check(pp.value))pp = pp.parentPath;
        return pp || null;
    };
    // The closest enclosing scope that governs this node.
    NPp._computeScope = function() {
        var value = this.value;
        var pp = this.parentPath;
        var scope = pp && pp.scope;
        if (n.Node.check(value) && Scope.isEstablishedBy(value)) scope = new Scope(this, scope);
        return scope || null;
    };
    NPp.getValueProperty = function(name) {
        return types.getFieldValue(this.value, name);
    };
    /**
     * Determine whether this.node needs to be wrapped in parentheses in order
     * for a parser to reproduce the same local AST structure.
     *
     * For instance, in the expression `(1 + 2) * 3`, the BinaryExpression
     * whose operator is "+" needs parentheses, because `1 + 2 * 3` would
     * parse differently.
     *
     * If assumeExpressionContext === true, we don't worry about edge cases
     * like an anonymous FunctionExpression appearing lexically first in its
     * enclosing statement and thus needing parentheses to avoid being parsed
     * as a FunctionDeclaration with a missing name.
     */ NPp.needsParens = function(assumeExpressionContext) {
        var pp = this.parentPath;
        if (!pp) return false;
        var node = this.value;
        // Only expressions need parentheses.
        if (!n.Expression.check(node)) return false;
        // Identifiers never need parentheses.
        if (node.type === "Identifier") return false;
        while(!n.Node.check(pp.value)){
            pp = pp.parentPath;
            if (!pp) return false;
        }
        var parent = pp.value;
        switch(node.type){
            case "UnaryExpression":
            case "SpreadElement":
            case "SpreadProperty":
                return parent.type === "MemberExpression" && this.name === "object" && parent.object === node;
            case "BinaryExpression":
            case "LogicalExpression":
                switch(parent.type){
                    case "CallExpression":
                        return this.name === "callee" && parent.callee === node;
                    case "UnaryExpression":
                    case "SpreadElement":
                    case "SpreadProperty":
                        return true;
                    case "MemberExpression":
                        return this.name === "object" && parent.object === node;
                    case "BinaryExpression":
                    case "LogicalExpression":
                        var n_1 = node;
                        var po = parent.operator;
                        var pp_1 = PRECEDENCE[po];
                        var no = n_1.operator;
                        var np = PRECEDENCE[no];
                        if (pp_1 > np) return true;
                        if (pp_1 === np && this.name === "right") {
                            if (parent.right !== n_1) throw new Error("Nodes must be equal");
                            return true;
                        }
                    default:
                        return false;
                }
            case "SequenceExpression":
                switch(parent.type){
                    case "ForStatement":
                        // Although parentheses wouldn't hurt around sequence
                        // expressions in the head of for loops, traditional style
                        // dictates that e.g. i++, j++ should not be wrapped with
                        // parentheses.
                        return false;
                    case "ExpressionStatement":
                        return this.name !== "expression";
                    default:
                        // Otherwise err on the side of overparenthesization, adding
                        // explicit exceptions above if this proves overzealous.
                        return true;
                }
            case "YieldExpression":
                switch(parent.type){
                    case "BinaryExpression":
                    case "LogicalExpression":
                    case "UnaryExpression":
                    case "SpreadElement":
                    case "SpreadProperty":
                    case "CallExpression":
                    case "MemberExpression":
                    case "NewExpression":
                    case "ConditionalExpression":
                    case "YieldExpression":
                        return true;
                    default:
                        return false;
                }
            case "Literal":
                return parent.type === "MemberExpression" && isNumber.check(node.value) && this.name === "object" && parent.object === node;
            case "AssignmentExpression":
            case "ConditionalExpression":
                switch(parent.type){
                    case "UnaryExpression":
                    case "SpreadElement":
                    case "SpreadProperty":
                    case "BinaryExpression":
                    case "LogicalExpression":
                        return true;
                    case "CallExpression":
                        return this.name === "callee" && parent.callee === node;
                    case "ConditionalExpression":
                        return this.name === "test" && parent.test === node;
                    case "MemberExpression":
                        return this.name === "object" && parent.object === node;
                    default:
                        return false;
                }
            default:
                if (parent.type === "NewExpression" && this.name === "callee" && parent.callee === node) return containsCallExpression(node);
        }
        if (assumeExpressionContext !== true && !this.canBeFirstInStatement() && this.firstInStatement()) return true;
        return false;
    };
    function isBinary(node) {
        return n.BinaryExpression.check(node) || n.LogicalExpression.check(node);
    }
    // @ts-ignore 'isUnaryLike' is declared but its value is never read. [6133]
    function isUnaryLike(node) {
        return n.UnaryExpression.check(node) || n.SpreadElement && n.SpreadElement.check(node) || n.SpreadProperty && n.SpreadProperty.check(node);
    }
    var PRECEDENCE = {};
    [
        [
            "||"
        ],
        [
            "&&"
        ],
        [
            "|"
        ],
        [
            "^"
        ],
        [
            "&"
        ],
        [
            "==",
            "===",
            "!=",
            "!=="
        ],
        [
            "<",
            ">",
            "<=",
            ">=",
            "in",
            "instanceof"
        ],
        [
            ">>",
            "<<",
            ">>>"
        ],
        [
            "+",
            "-"
        ],
        [
            "*",
            "/",
            "%"
        ]
    ].forEach(function(tier, i) {
        tier.forEach(function(op) {
            PRECEDENCE[op] = i;
        });
    });
    function containsCallExpression(node) {
        if (n.CallExpression.check(node)) return true;
        if (isArray.check(node)) return node.some(containsCallExpression);
        if (n.Node.check(node)) return types.someField(node, function(_name, child) {
            return containsCallExpression(child);
        });
        return false;
    }
    NPp.canBeFirstInStatement = function() {
        var node = this.node;
        return !n.FunctionExpression.check(node) && !n.ObjectExpression.check(node);
    };
    NPp.firstInStatement = function() {
        return firstInStatement(this);
    };
    function firstInStatement(path) {
        for(var node, parent; path.parent; path = path.parent){
            node = path.node;
            parent = path.parent.node;
            if (n.BlockStatement.check(parent) && path.parent.name === "body" && path.name === 0) {
                if (parent.body[0] !== node) throw new Error("Nodes must be equal");
                return true;
            }
            if (n.ExpressionStatement.check(parent) && path.name === "expression") {
                if (parent.expression !== node) throw new Error("Nodes must be equal");
                return true;
            }
            if (n.SequenceExpression.check(parent) && path.parent.name === "expressions" && path.name === 0) {
                if (parent.expressions[0] !== node) throw new Error("Nodes must be equal");
                continue;
            }
            if (n.CallExpression.check(parent) && path.name === "callee") {
                if (parent.callee !== node) throw new Error("Nodes must be equal");
                continue;
            }
            if (n.MemberExpression.check(parent) && path.name === "object") {
                if (parent.object !== node) throw new Error("Nodes must be equal");
                continue;
            }
            if (n.ConditionalExpression.check(parent) && path.name === "test") {
                if (parent.test !== node) throw new Error("Nodes must be equal");
                continue;
            }
            if (isBinary(parent) && path.name === "left") {
                if (parent.left !== node) throw new Error("Nodes must be equal");
                continue;
            }
            if (n.UnaryExpression.check(parent) && !parent.prefix && path.name === "argument") {
                if (parent.argument !== node) throw new Error("Nodes must be equal");
                continue;
            }
            return false;
        }
        return true;
    }
    /**
     * Pruning certain nodes will result in empty or incomplete nodes, here we clean those nodes up.
     */ function cleanUpNodesAfterPrune(remainingNodePath) {
        if (n.VariableDeclaration.check(remainingNodePath.node)) {
            var declarations = remainingNodePath.get('declarations').value;
            if (!declarations || declarations.length === 0) return remainingNodePath.prune();
        } else if (n.ExpressionStatement.check(remainingNodePath.node)) {
            if (!remainingNodePath.get('expression').value) return remainingNodePath.prune();
        } else if (n.IfStatement.check(remainingNodePath.node)) cleanUpIfStatementAfterPrune(remainingNodePath);
        return remainingNodePath;
    }
    function cleanUpIfStatementAfterPrune(ifStatement) {
        var testExpression = ifStatement.get('test').value;
        var alternate = ifStatement.get('alternate').value;
        var consequent = ifStatement.get('consequent').value;
        if (!consequent && !alternate) {
            var testExpressionStatement = b.expressionStatement(testExpression);
            ifStatement.replace(testExpressionStatement);
        } else if (!consequent && alternate) {
            var negatedTestExpression = b.unaryExpression('!', testExpression, true);
            if (n.UnaryExpression.check(testExpression) && testExpression.operator === '!') negatedTestExpression = testExpression.argument;
            ifStatement.get("test").replace(negatedTestExpression);
            ifStatement.get("consequent").replace(alternate);
            ifStatement.get("alternate").replace();
        }
    }
    return NodePath;
}
exports.default = nodePathPlugin;
module.exports = exports["default"];

},{"df2b9b32cfd0e157":"ao9yO","637c66c6ce4fe427":"jL4It","d574f23a90a75c6b":"hafEX","3fbdec97b5dd7916":"gRerQ"}],"hafEX":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
var tslib_1 = require("896a852c11f7a0ac");
var types_1 = tslib_1.__importDefault(require("3d9038cdc5135329"));
var Op = Object.prototype;
var hasOwn = Op.hasOwnProperty;
function pathPlugin(fork) {
    var types = fork.use(types_1.default);
    var isArray = types.builtInTypes.array;
    var isNumber = types.builtInTypes.number;
    var Path = function Path(value, parentPath, name) {
        if (!(this instanceof Path)) throw new Error("Path constructor cannot be invoked without 'new'");
        if (parentPath) {
            if (!(parentPath instanceof Path)) throw new Error("");
        } else {
            parentPath = null;
            name = null;
        }
        // The value encapsulated by this Path, generally equal to
        // parentPath.value[name] if we have a parentPath.
        this.value = value;
        // The immediate parent Path of this Path.
        this.parentPath = parentPath;
        // The name of the property of parentPath.value through which this
        // Path's value was reached.
        this.name = name;
        // Calling path.get("child") multiple times always returns the same
        // child Path object, for both performance and consistency reasons.
        this.__childCache = null;
    };
    var Pp = Path.prototype;
    function getChildCache(path) {
        // Lazily create the child cache. This also cheapens cache
        // invalidation, since you can just reset path.__childCache to null.
        return path.__childCache || (path.__childCache = Object.create(null));
    }
    function getChildPath(path, name) {
        var cache = getChildCache(path);
        var actualChildValue = path.getValueProperty(name);
        var childPath = cache[name];
        if (!hasOwn.call(cache, name) || // Ensure consistency between cache and reality.
        childPath.value !== actualChildValue) childPath = cache[name] = new path.constructor(actualChildValue, path, name);
        return childPath;
    }
    // This method is designed to be overridden by subclasses that need to
    // handle missing properties, etc.
    Pp.getValueProperty = function getValueProperty(name) {
        return this.value[name];
    };
    Pp.get = function get() {
        var names = [];
        for(var _i = 0; _i < arguments.length; _i++)names[_i] = arguments[_i];
        var path = this;
        var count = names.length;
        for(var i = 0; i < count; ++i)path = getChildPath(path, names[i]);
        return path;
    };
    Pp.each = function each(callback, context) {
        var childPaths = [];
        var len = this.value.length;
        var i = 0;
        // Collect all the original child paths before invoking the callback.
        for(var i = 0; i < len; ++i)if (hasOwn.call(this.value, i)) childPaths[i] = this.get(i);
        // Invoke the callback on just the original child paths, regardless of
        // any modifications made to the array by the callback. I chose these
        // semantics over cleverly invoking the callback on new elements because
        // this way is much easier to reason about.
        context = context || this;
        for(i = 0; i < len; ++i)if (hasOwn.call(childPaths, i)) callback.call(context, childPaths[i]);
    };
    Pp.map = function map(callback, context) {
        var result = [];
        this.each(function(childPath) {
            result.push(callback.call(this, childPath));
        }, context);
        return result;
    };
    Pp.filter = function filter(callback, context) {
        var result = [];
        this.each(function(childPath) {
            if (callback.call(this, childPath)) result.push(childPath);
        }, context);
        return result;
    };
    function emptyMoves() {}
    function getMoves(path, offset, start, end) {
        isArray.assert(path.value);
        if (offset === 0) return emptyMoves;
        var length = path.value.length;
        if (length < 1) return emptyMoves;
        var argc = arguments.length;
        if (argc === 2) {
            start = 0;
            end = length;
        } else if (argc === 3) {
            start = Math.max(start, 0);
            end = length;
        } else {
            start = Math.max(start, 0);
            end = Math.min(end, length);
        }
        isNumber.assert(start);
        isNumber.assert(end);
        var moves = Object.create(null);
        var cache = getChildCache(path);
        for(var i = start; i < end; ++i)if (hasOwn.call(path.value, i)) {
            var childPath = path.get(i);
            if (childPath.name !== i) throw new Error("");
            var newIndex = i + offset;
            childPath.name = newIndex;
            moves[newIndex] = childPath;
            delete cache[i];
        }
        delete cache.length;
        return function() {
            for(var newIndex in moves){
                var childPath = moves[newIndex];
                if (childPath.name !== +newIndex) throw new Error("");
                cache[newIndex] = childPath;
                path.value[newIndex] = childPath.value;
            }
        };
    }
    Pp.shift = function shift() {
        var move = getMoves(this, -1);
        var result = this.value.shift();
        move();
        return result;
    };
    Pp.unshift = function unshift() {
        var args = [];
        for(var _i = 0; _i < arguments.length; _i++)args[_i] = arguments[_i];
        var move = getMoves(this, args.length);
        var result = this.value.unshift.apply(this.value, args);
        move();
        return result;
    };
    Pp.push = function push() {
        var args = [];
        for(var _i = 0; _i < arguments.length; _i++)args[_i] = arguments[_i];
        isArray.assert(this.value);
        delete getChildCache(this).length;
        return this.value.push.apply(this.value, args);
    };
    Pp.pop = function pop() {
        isArray.assert(this.value);
        var cache = getChildCache(this);
        delete cache[this.value.length - 1];
        delete cache.length;
        return this.value.pop();
    };
    Pp.insertAt = function insertAt(index) {
        var argc = arguments.length;
        var move = getMoves(this, argc - 1, index);
        if (move === emptyMoves && argc <= 1) return this;
        index = Math.max(index, 0);
        for(var i = 1; i < argc; ++i)this.value[index + i - 1] = arguments[i];
        move();
        return this;
    };
    Pp.insertBefore = function insertBefore() {
        var args = [];
        for(var _i = 0; _i < arguments.length; _i++)args[_i] = arguments[_i];
        var pp = this.parentPath;
        var argc = args.length;
        var insertAtArgs = [
            this.name
        ];
        for(var i = 0; i < argc; ++i)insertAtArgs.push(args[i]);
        return pp.insertAt.apply(pp, insertAtArgs);
    };
    Pp.insertAfter = function insertAfter() {
        var args = [];
        for(var _i = 0; _i < arguments.length; _i++)args[_i] = arguments[_i];
        var pp = this.parentPath;
        var argc = args.length;
        var insertAtArgs = [
            this.name + 1
        ];
        for(var i = 0; i < argc; ++i)insertAtArgs.push(args[i]);
        return pp.insertAt.apply(pp, insertAtArgs);
    };
    function repairRelationshipWithParent(path) {
        if (!(path instanceof Path)) throw new Error("");
        var pp = path.parentPath;
        if (!pp) // Orphan paths have no relationship to repair.
        return path;
        var parentValue = pp.value;
        var parentCache = getChildCache(pp);
        // Make sure parentCache[path.name] is populated.
        if (parentValue[path.name] === path.value) parentCache[path.name] = path;
        else if (isArray.check(parentValue)) {
            // Something caused path.name to become out of date, so attempt to
            // recover by searching for path.value in parentValue.
            var i = parentValue.indexOf(path.value);
            if (i >= 0) parentCache[path.name = i] = path;
        } else {
            // If path.value disagrees with parentValue[path.name], and
            // path.name is not an array index, let path.value become the new
            // parentValue[path.name] and update parentCache accordingly.
            parentValue[path.name] = path.value;
            parentCache[path.name] = path;
        }
        if (parentValue[path.name] !== path.value) throw new Error("");
        if (path.parentPath.get(path.name) !== path) throw new Error("");
        return path;
    }
    Pp.replace = function replace(replacement) {
        var results = [];
        var parentValue = this.parentPath.value;
        var parentCache = getChildCache(this.parentPath);
        var count = arguments.length;
        repairRelationshipWithParent(this);
        if (isArray.check(parentValue)) {
            var originalLength = parentValue.length;
            var move = getMoves(this.parentPath, count - 1, this.name + 1);
            var spliceArgs = [
                this.name,
                1
            ];
            for(var i = 0; i < count; ++i)spliceArgs.push(arguments[i]);
            var splicedOut = parentValue.splice.apply(parentValue, spliceArgs);
            if (splicedOut[0] !== this.value) throw new Error("");
            if (parentValue.length !== originalLength - 1 + count) throw new Error("");
            move();
            if (count === 0) {
                delete this.value;
                delete parentCache[this.name];
                this.__childCache = null;
            } else {
                if (parentValue[this.name] !== replacement) throw new Error("");
                if (this.value !== replacement) {
                    this.value = replacement;
                    this.__childCache = null;
                }
                for(i = 0; i < count; ++i)results.push(this.parentPath.get(this.name + i));
                if (results[0] !== this) throw new Error("");
            }
        } else if (count === 1) {
            if (this.value !== replacement) this.__childCache = null;
            this.value = parentValue[this.name] = replacement;
            results.push(this);
        } else if (count === 0) {
            delete parentValue[this.name];
            delete this.value;
            this.__childCache = null;
        // Leave this path cached as parentCache[this.name], even though
        // it no longer has a value defined.
        } else throw new Error("Could not replace path");
        return results;
    };
    return Path;
}
exports.default = pathPlugin;
module.exports = exports["default"];

},{"896a852c11f7a0ac":"ao9yO","3d9038cdc5135329":"jL4It"}],"gRerQ":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
var tslib_1 = require("67f997874b54be2");
var types_1 = tslib_1.__importDefault(require("d10dcf8aad44f2e8"));
var hasOwn = Object.prototype.hasOwnProperty;
function scopePlugin(fork) {
    var types = fork.use(types_1.default);
    var Type = types.Type;
    var namedTypes = types.namedTypes;
    var Node = namedTypes.Node;
    var Expression = namedTypes.Expression;
    var isArray = types.builtInTypes.array;
    var b = types.builders;
    var Scope = function Scope(path, parentScope) {
        if (!(this instanceof Scope)) throw new Error("Scope constructor cannot be invoked without 'new'");
        ScopeType.assert(path.value);
        var depth;
        if (parentScope) {
            if (!(parentScope instanceof Scope)) throw new Error("");
            depth = parentScope.depth + 1;
        } else {
            parentScope = null;
            depth = 0;
        }
        Object.defineProperties(this, {
            path: {
                value: path
            },
            node: {
                value: path.value
            },
            isGlobal: {
                value: !parentScope,
                enumerable: true
            },
            depth: {
                value: depth
            },
            parent: {
                value: parentScope
            },
            bindings: {
                value: {}
            },
            types: {
                value: {}
            }
        });
    };
    var scopeTypes = [
        // Program nodes introduce global scopes.
        namedTypes.Program,
        // Function is the supertype of FunctionExpression,
        // FunctionDeclaration, ArrowExpression, etc.
        namedTypes.Function,
        // In case you didn't know, the caught parameter shadows any variable
        // of the same name in an outer scope.
        namedTypes.CatchClause
    ];
    var ScopeType = Type.or.apply(Type, scopeTypes);
    Scope.isEstablishedBy = function(node) {
        return ScopeType.check(node);
    };
    var Sp = Scope.prototype;
    // Will be overridden after an instance lazily calls scanScope.
    Sp.didScan = false;
    Sp.declares = function(name) {
        this.scan();
        return hasOwn.call(this.bindings, name);
    };
    Sp.declaresType = function(name) {
        this.scan();
        return hasOwn.call(this.types, name);
    };
    Sp.declareTemporary = function(prefix) {
        if (prefix) {
            if (!/^[a-z$_]/i.test(prefix)) throw new Error("");
        } else prefix = "t$";
        // Include this.depth in the name to make sure the name does not
        // collide with any variables in nested/enclosing scopes.
        prefix += this.depth.toString(36) + "$";
        this.scan();
        var index = 0;
        while(this.declares(prefix + index))++index;
        var name = prefix + index;
        return this.bindings[name] = types.builders.identifier(name);
    };
    Sp.injectTemporary = function(identifier, init) {
        identifier || (identifier = this.declareTemporary());
        var bodyPath = this.path.get("body");
        if (namedTypes.BlockStatement.check(bodyPath.value)) bodyPath = bodyPath.get("body");
        bodyPath.unshift(b.variableDeclaration("var", [
            b.variableDeclarator(identifier, init || null)
        ]));
        return identifier;
    };
    Sp.scan = function(force) {
        if (force || !this.didScan) {
            for(var name in this.bindings)// Empty out this.bindings, just in cases.
            delete this.bindings[name];
            scanScope(this.path, this.bindings, this.types);
            this.didScan = true;
        }
    };
    Sp.getBindings = function() {
        this.scan();
        return this.bindings;
    };
    Sp.getTypes = function() {
        this.scan();
        return this.types;
    };
    function scanScope(path, bindings, scopeTypes) {
        var node = path.value;
        ScopeType.assert(node);
        if (namedTypes.CatchClause.check(node)) {
            // A catch clause establishes a new scope but the only variable
            // bound in that scope is the catch parameter. Any other
            // declarations create bindings in the outer scope.
            var param = path.get("param");
            if (param.value) addPattern(param, bindings);
        } else recursiveScanScope(path, bindings, scopeTypes);
    }
    function recursiveScanScope(path, bindings, scopeTypes) {
        var node = path.value;
        if (path.parent && namedTypes.FunctionExpression.check(path.parent.node) && path.parent.node.id) addPattern(path.parent.get("id"), bindings);
        if (!node) ;
        else if (isArray.check(node)) path.each(function(childPath) {
            recursiveScanChild(childPath, bindings, scopeTypes);
        });
        else if (namedTypes.Function.check(node)) {
            path.get("params").each(function(paramPath) {
                addPattern(paramPath, bindings);
            });
            recursiveScanChild(path.get("body"), bindings, scopeTypes);
        } else if (namedTypes.TypeAlias && namedTypes.TypeAlias.check(node) || namedTypes.InterfaceDeclaration && namedTypes.InterfaceDeclaration.check(node) || namedTypes.TSTypeAliasDeclaration && namedTypes.TSTypeAliasDeclaration.check(node) || namedTypes.TSInterfaceDeclaration && namedTypes.TSInterfaceDeclaration.check(node)) addTypePattern(path.get("id"), scopeTypes);
        else if (namedTypes.VariableDeclarator.check(node)) {
            addPattern(path.get("id"), bindings);
            recursiveScanChild(path.get("init"), bindings, scopeTypes);
        } else if (node.type === "ImportSpecifier" || node.type === "ImportNamespaceSpecifier" || node.type === "ImportDefaultSpecifier") addPattern(// Esprima used to use the .name field to refer to the local
        // binding identifier for ImportSpecifier nodes, but .id for
        // ImportNamespaceSpecifier and ImportDefaultSpecifier nodes.
        // ESTree/Acorn/ESpree use .local for all three node types.
        path.get(node.local ? "local" : node.name ? "name" : "id"), bindings);
        else if (Node.check(node) && !Expression.check(node)) types.eachField(node, function(name, child) {
            var childPath = path.get(name);
            if (!pathHasValue(childPath, child)) throw new Error("");
            recursiveScanChild(childPath, bindings, scopeTypes);
        });
    }
    function pathHasValue(path, value) {
        if (path.value === value) return true;
        // Empty arrays are probably produced by defaults.emptyArray, in which
        // case is makes sense to regard them as equivalent, if not ===.
        if (Array.isArray(path.value) && path.value.length === 0 && Array.isArray(value) && value.length === 0) return true;
        return false;
    }
    function recursiveScanChild(path, bindings, scopeTypes) {
        var node = path.value;
        if (!node || Expression.check(node)) ;
        else if (namedTypes.FunctionDeclaration.check(node) && node.id !== null) addPattern(path.get("id"), bindings);
        else if (namedTypes.ClassDeclaration && namedTypes.ClassDeclaration.check(node)) addPattern(path.get("id"), bindings);
        else if (ScopeType.check(node)) {
            if (namedTypes.CatchClause.check(node) && // TODO Broaden this to accept any pattern.
            namedTypes.Identifier.check(node.param)) {
                var catchParamName = node.param.name;
                var hadBinding = hasOwn.call(bindings, catchParamName);
                // Any declarations that occur inside the catch body that do
                // not have the same name as the catch parameter should count
                // as bindings in the outer scope.
                recursiveScanScope(path.get("body"), bindings, scopeTypes);
                // If a new binding matching the catch parameter name was
                // created while scanning the catch body, ignore it because it
                // actually refers to the catch parameter and not the outer
                // scope that we're currently scanning.
                if (!hadBinding) delete bindings[catchParamName];
            }
        } else recursiveScanScope(path, bindings, scopeTypes);
    }
    function addPattern(patternPath, bindings) {
        var pattern = patternPath.value;
        namedTypes.Pattern.assert(pattern);
        if (namedTypes.Identifier.check(pattern)) {
            if (hasOwn.call(bindings, pattern.name)) bindings[pattern.name].push(patternPath);
            else bindings[pattern.name] = [
                patternPath
            ];
        } else if (namedTypes.AssignmentPattern && namedTypes.AssignmentPattern.check(pattern)) addPattern(patternPath.get('left'), bindings);
        else if (namedTypes.ObjectPattern && namedTypes.ObjectPattern.check(pattern)) patternPath.get('properties').each(function(propertyPath) {
            var property = propertyPath.value;
            if (namedTypes.Pattern.check(property)) addPattern(propertyPath, bindings);
            else if (namedTypes.Property.check(property)) addPattern(propertyPath.get('value'), bindings);
            else if (namedTypes.SpreadProperty && namedTypes.SpreadProperty.check(property)) addPattern(propertyPath.get('argument'), bindings);
        });
        else if (namedTypes.ArrayPattern && namedTypes.ArrayPattern.check(pattern)) patternPath.get('elements').each(function(elementPath) {
            var element = elementPath.value;
            if (namedTypes.Pattern.check(element)) addPattern(elementPath, bindings);
            else if (namedTypes.SpreadElement && namedTypes.SpreadElement.check(element)) addPattern(elementPath.get("argument"), bindings);
        });
        else if (namedTypes.PropertyPattern && namedTypes.PropertyPattern.check(pattern)) addPattern(patternPath.get('pattern'), bindings);
        else if (namedTypes.SpreadElementPattern && namedTypes.SpreadElementPattern.check(pattern) || namedTypes.SpreadPropertyPattern && namedTypes.SpreadPropertyPattern.check(pattern)) addPattern(patternPath.get('argument'), bindings);
    }
    function addTypePattern(patternPath, types) {
        var pattern = patternPath.value;
        namedTypes.Pattern.assert(pattern);
        if (namedTypes.Identifier.check(pattern)) {
            if (hasOwn.call(types, pattern.name)) types[pattern.name].push(patternPath);
            else types[pattern.name] = [
                patternPath
            ];
        }
    }
    Sp.lookup = function(name) {
        for(var scope = this; scope; scope = scope.parent)if (scope.declares(name)) break;
        return scope;
    };
    Sp.lookupType = function(name) {
        for(var scope = this; scope; scope = scope.parent)if (scope.declaresType(name)) break;
        return scope;
    };
    Sp.getGlobalScope = function() {
        var scope = this;
        while(!scope.isGlobal)scope = scope.parent;
        return scope;
    };
    return Scope;
}
exports.default = scopePlugin;
module.exports = exports["default"];

},{"67f997874b54be2":"ao9yO","d10dcf8aad44f2e8":"jL4It"}],"4ZP5n":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
var tslib_1 = require("511ca79cfdda6b4f");
var types_1 = tslib_1.__importDefault(require("7f44260a45b92c30"));
function default_1(fork) {
    var types = fork.use(types_1.default);
    var getFieldNames = types.getFieldNames;
    var getFieldValue = types.getFieldValue;
    var isArray = types.builtInTypes.array;
    var isObject = types.builtInTypes.object;
    var isDate = types.builtInTypes.Date;
    var isRegExp = types.builtInTypes.RegExp;
    var hasOwn = Object.prototype.hasOwnProperty;
    function astNodesAreEquivalent(a, b, problemPath) {
        if (isArray.check(problemPath)) problemPath.length = 0;
        else problemPath = null;
        return areEquivalent(a, b, problemPath);
    }
    astNodesAreEquivalent.assert = function(a, b) {
        var problemPath = [];
        if (!astNodesAreEquivalent(a, b, problemPath)) {
            if (problemPath.length === 0) {
                if (a !== b) throw new Error("Nodes must be equal");
            } else throw new Error("Nodes differ in the following path: " + problemPath.map(subscriptForProperty).join(""));
        }
    };
    function subscriptForProperty(property) {
        if (/[_$a-z][_$a-z0-9]*/i.test(property)) return "." + property;
        return "[" + JSON.stringify(property) + "]";
    }
    function areEquivalent(a, b, problemPath) {
        if (a === b) return true;
        if (isArray.check(a)) return arraysAreEquivalent(a, b, problemPath);
        if (isObject.check(a)) return objectsAreEquivalent(a, b, problemPath);
        if (isDate.check(a)) return isDate.check(b) && +a === +b;
        if (isRegExp.check(a)) return isRegExp.check(b) && a.source === b.source && a.global === b.global && a.multiline === b.multiline && a.ignoreCase === b.ignoreCase;
        return a == b;
    }
    function arraysAreEquivalent(a, b, problemPath) {
        isArray.assert(a);
        var aLength = a.length;
        if (!isArray.check(b) || b.length !== aLength) {
            if (problemPath) problemPath.push("length");
            return false;
        }
        for(var i = 0; i < aLength; ++i){
            if (problemPath) problemPath.push(i);
            if (i in a !== i in b) return false;
            if (!areEquivalent(a[i], b[i], problemPath)) return false;
            if (problemPath) {
                var problemPathTail = problemPath.pop();
                if (problemPathTail !== i) throw new Error("" + problemPathTail);
            }
        }
        return true;
    }
    function objectsAreEquivalent(a, b, problemPath) {
        isObject.assert(a);
        if (!isObject.check(b)) return false;
        // Fast path for a common property of AST nodes.
        if (a.type !== b.type) {
            if (problemPath) problemPath.push("type");
            return false;
        }
        var aNames = getFieldNames(a);
        var aNameCount = aNames.length;
        var bNames = getFieldNames(b);
        var bNameCount = bNames.length;
        if (aNameCount === bNameCount) {
            for(var i = 0; i < aNameCount; ++i){
                var name = aNames[i];
                var aChild = getFieldValue(a, name);
                var bChild = getFieldValue(b, name);
                if (problemPath) problemPath.push(name);
                if (!areEquivalent(aChild, bChild, problemPath)) return false;
                if (problemPath) {
                    var problemPathTail = problemPath.pop();
                    if (problemPathTail !== name) throw new Error("" + problemPathTail);
                }
            }
            return true;
        }
        if (!problemPath) return false;
        // Since aNameCount !== bNameCount, we need to find some name that's
        // missing in aNames but present in bNames, or vice-versa.
        var seenNames = Object.create(null);
        for(i = 0; i < aNameCount; ++i)seenNames[aNames[i]] = true;
        for(i = 0; i < bNameCount; ++i){
            name = bNames[i];
            if (!hasOwn.call(seenNames, name)) {
                problemPath.push(name);
                return false;
            }
            delete seenNames[name];
        }
        for(name in seenNames){
            problemPath.push(name);
            break;
        }
        return false;
    }
    return astNodesAreEquivalent;
}
exports.default = default_1;
module.exports = exports["default"];

},{"511ca79cfdda6b4f":"ao9yO","7f44260a45b92c30":"jL4It"}],"j3uvl":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
var tslib_1 = require("10ec86f0dd17df89");
var types_1 = tslib_1.__importDefault(require("3372d8b03b3cb512"));
var shared_1 = tslib_1.__importDefault(require("a1bf05b3a8ed2c95"));
function default_1(fork) {
    var types = fork.use(types_1.default);
    var Type = types.Type;
    var def = Type.def;
    var or = Type.or;
    var shared = fork.use(shared_1.default);
    var defaults = shared.defaults;
    var geq = shared.geq;
    // Abstract supertype of all syntactic entities that are allowed to have a
    // .loc field.
    def("Printable").field("loc", or(def("SourceLocation"), null), defaults["null"], true);
    def("Node").bases("Printable").field("type", String).field("comments", or([
        def("Comment")
    ], null), defaults["null"], true);
    def("SourceLocation").field("start", def("Position")).field("end", def("Position")).field("source", or(String, null), defaults["null"]);
    def("Position").field("line", geq(1)).field("column", geq(0));
    def("File").bases("Node").build("program", "name").field("program", def("Program")).field("name", or(String, null), defaults["null"]);
    def("Program").bases("Node").build("body").field("body", [
        def("Statement")
    ]);
    def("Function").bases("Node").field("id", or(def("Identifier"), null), defaults["null"]).field("params", [
        def("Pattern")
    ]).field("body", def("BlockStatement")).field("generator", Boolean, defaults["false"]).field("async", Boolean, defaults["false"]);
    def("Statement").bases("Node");
    // The empty .build() here means that an EmptyStatement can be constructed
    // (i.e. it's not abstract) but that it needs no arguments.
    def("EmptyStatement").bases("Statement").build();
    def("BlockStatement").bases("Statement").build("body").field("body", [
        def("Statement")
    ]);
    // TODO Figure out how to silently coerce Expressions to
    // ExpressionStatements where a Statement was expected.
    def("ExpressionStatement").bases("Statement").build("expression").field("expression", def("Expression"));
    def("IfStatement").bases("Statement").build("test", "consequent", "alternate").field("test", def("Expression")).field("consequent", def("Statement")).field("alternate", or(def("Statement"), null), defaults["null"]);
    def("LabeledStatement").bases("Statement").build("label", "body").field("label", def("Identifier")).field("body", def("Statement"));
    def("BreakStatement").bases("Statement").build("label").field("label", or(def("Identifier"), null), defaults["null"]);
    def("ContinueStatement").bases("Statement").build("label").field("label", or(def("Identifier"), null), defaults["null"]);
    def("WithStatement").bases("Statement").build("object", "body").field("object", def("Expression")).field("body", def("Statement"));
    def("SwitchStatement").bases("Statement").build("discriminant", "cases", "lexical").field("discriminant", def("Expression")).field("cases", [
        def("SwitchCase")
    ]).field("lexical", Boolean, defaults["false"]);
    def("ReturnStatement").bases("Statement").build("argument").field("argument", or(def("Expression"), null));
    def("ThrowStatement").bases("Statement").build("argument").field("argument", def("Expression"));
    def("TryStatement").bases("Statement").build("block", "handler", "finalizer").field("block", def("BlockStatement")).field("handler", or(def("CatchClause"), null), function() {
        return this.handlers && this.handlers[0] || null;
    }).field("handlers", [
        def("CatchClause")
    ], function() {
        return this.handler ? [
            this.handler
        ] : [];
    }, true) // Indicates this field is hidden from eachField iteration.
    .field("guardedHandlers", [
        def("CatchClause")
    ], defaults.emptyArray).field("finalizer", or(def("BlockStatement"), null), defaults["null"]);
    def("CatchClause").bases("Node").build("param", "guard", "body")// https://github.com/tc39/proposal-optional-catch-binding
    .field("param", or(def("Pattern"), null), defaults["null"]).field("guard", or(def("Expression"), null), defaults["null"]).field("body", def("BlockStatement"));
    def("WhileStatement").bases("Statement").build("test", "body").field("test", def("Expression")).field("body", def("Statement"));
    def("DoWhileStatement").bases("Statement").build("body", "test").field("body", def("Statement")).field("test", def("Expression"));
    def("ForStatement").bases("Statement").build("init", "test", "update", "body").field("init", or(def("VariableDeclaration"), def("Expression"), null)).field("test", or(def("Expression"), null)).field("update", or(def("Expression"), null)).field("body", def("Statement"));
    def("ForInStatement").bases("Statement").build("left", "right", "body").field("left", or(def("VariableDeclaration"), def("Expression"))).field("right", def("Expression")).field("body", def("Statement"));
    def("DebuggerStatement").bases("Statement").build();
    def("Declaration").bases("Statement");
    def("FunctionDeclaration").bases("Function", "Declaration").build("id", "params", "body").field("id", def("Identifier"));
    def("FunctionExpression").bases("Function", "Expression").build("id", "params", "body");
    def("VariableDeclaration").bases("Declaration").build("kind", "declarations").field("kind", or("var", "let", "const")).field("declarations", [
        def("VariableDeclarator")
    ]);
    def("VariableDeclarator").bases("Node").build("id", "init").field("id", def("Pattern")).field("init", or(def("Expression"), null), defaults["null"]);
    def("Expression").bases("Node");
    def("ThisExpression").bases("Expression").build();
    def("ArrayExpression").bases("Expression").build("elements").field("elements", [
        or(def("Expression"), null)
    ]);
    def("ObjectExpression").bases("Expression").build("properties").field("properties", [
        def("Property")
    ]);
    // TODO Not in the Mozilla Parser API, but used by Esprima.
    def("Property").bases("Node") // Want to be able to visit Property Nodes.
    .build("kind", "key", "value").field("kind", or("init", "get", "set")).field("key", or(def("Literal"), def("Identifier"))).field("value", def("Expression"));
    def("SequenceExpression").bases("Expression").build("expressions").field("expressions", [
        def("Expression")
    ]);
    var UnaryOperator = or("-", "+", "!", "~", "typeof", "void", "delete");
    def("UnaryExpression").bases("Expression").build("operator", "argument", "prefix").field("operator", UnaryOperator).field("argument", def("Expression"))// Esprima doesn't bother with this field, presumably because it's
    // always true for unary operators.
    .field("prefix", Boolean, defaults["true"]);
    var BinaryOperator = or("==", "!=", "===", "!==", "<", "<=", ">", ">=", "<<", ">>", ">>>", "+", "-", "*", "/", "%", "**", "&", "|", "^", "in", "instanceof");
    def("BinaryExpression").bases("Expression").build("operator", "left", "right").field("operator", BinaryOperator).field("left", def("Expression")).field("right", def("Expression"));
    var AssignmentOperator = or("=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "|=", "^=", "&=");
    def("AssignmentExpression").bases("Expression").build("operator", "left", "right").field("operator", AssignmentOperator).field("left", or(def("Pattern"), def("MemberExpression"))).field("right", def("Expression"));
    var UpdateOperator = or("++", "--");
    def("UpdateExpression").bases("Expression").build("operator", "argument", "prefix").field("operator", UpdateOperator).field("argument", def("Expression")).field("prefix", Boolean);
    var LogicalOperator = or("||", "&&");
    def("LogicalExpression").bases("Expression").build("operator", "left", "right").field("operator", LogicalOperator).field("left", def("Expression")).field("right", def("Expression"));
    def("ConditionalExpression").bases("Expression").build("test", "consequent", "alternate").field("test", def("Expression")).field("consequent", def("Expression")).field("alternate", def("Expression"));
    def("NewExpression").bases("Expression").build("callee", "arguments").field("callee", def("Expression"))// The Mozilla Parser API gives this type as [or(def("Expression"),
    // null)], but null values don't really make sense at the call site.
    // TODO Report this nonsense.
    .field("arguments", [
        def("Expression")
    ]);
    def("CallExpression").bases("Expression").build("callee", "arguments").field("callee", def("Expression"))// See comment for NewExpression above.
    .field("arguments", [
        def("Expression")
    ]);
    def("MemberExpression").bases("Expression").build("object", "property", "computed").field("object", def("Expression")).field("property", or(def("Identifier"), def("Expression"))).field("computed", Boolean, function() {
        var type = this.property.type;
        if (type === 'Literal' || type === 'MemberExpression' || type === 'BinaryExpression') return true;
        return false;
    });
    def("Pattern").bases("Node");
    def("SwitchCase").bases("Node").build("test", "consequent").field("test", or(def("Expression"), null)).field("consequent", [
        def("Statement")
    ]);
    def("Identifier").bases("Expression", "Pattern").build("name").field("name", String).field("optional", Boolean, defaults["false"]);
    def("Literal").bases("Expression").build("value").field("value", or(String, Boolean, null, Number, RegExp)).field("regex", or({
        pattern: String,
        flags: String
    }, null), function() {
        if (this.value instanceof RegExp) {
            var flags = "";
            if (this.value.ignoreCase) flags += "i";
            if (this.value.multiline) flags += "m";
            if (this.value.global) flags += "g";
            return {
                pattern: this.value.source,
                flags: flags
            };
        }
        return null;
    });
    // Abstract (non-buildable) comment supertype. Not a Node.
    def("Comment").bases("Printable").field("value", String)// A .leading comment comes before the node, whereas a .trailing
    // comment comes after it. These two fields should not both be true,
    // but they might both be false when the comment falls inside a node
    // and the node has no children for the comment to lead or trail,
    // e.g. { /*dangling*/ }.
    .field("leading", Boolean, defaults["true"]).field("trailing", Boolean, defaults["false"]);
}
exports.default = default_1;
module.exports = exports["default"];

},{"10ec86f0dd17df89":"ao9yO","3372d8b03b3cb512":"jL4It","a1bf05b3a8ed2c95":"cIgjo"}],"cIgjo":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
var tslib_1 = require("ec5859128ebb7508");
var types_1 = tslib_1.__importDefault(require("6334393558ccf86"));
function default_1(fork) {
    var types = fork.use(types_1.default);
    var Type = types.Type;
    var builtin = types.builtInTypes;
    var isNumber = builtin.number;
    // An example of constructing a new type with arbitrary constraints from
    // an existing type.
    function geq(than) {
        return Type.from(function(value) {
            return isNumber.check(value) && value >= than;
        }, isNumber + " >= " + than);
    }
    // Default value-returning functions that may optionally be passed as a
    // third argument to Def.prototype.field.
    var defaults = {
        // Functions were used because (among other reasons) that's the most
        // elegant way to allow for the emptyArray one always to give a new
        // array instance.
        "null": function() {
            return null;
        },
        "emptyArray": function() {
            return [];
        },
        "false": function() {
            return false;
        },
        "true": function() {
            return true;
        },
        "undefined": function() {},
        "use strict": function() {
            return "use strict";
        }
    };
    var naiveIsPrimitive = Type.or(builtin.string, builtin.number, builtin.boolean, builtin.null, builtin.undefined);
    var isPrimitive = Type.from(function(value) {
        if (value === null) return true;
        var type = typeof value;
        if (type === "object" || type === "function") return false;
        return true;
    }, naiveIsPrimitive.toString());
    return {
        geq: geq,
        defaults: defaults,
        isPrimitive: isPrimitive
    };
}
exports.default = default_1;
module.exports = exports["default"];

},{"ec5859128ebb7508":"ao9yO","6334393558ccf86":"jL4It"}],"lEmvD":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
var tslib_1 = require("ec54cfba352a2cde");
var core_1 = tslib_1.__importDefault(require("aa0e14c7cf1d14f"));
var types_1 = tslib_1.__importDefault(require("d9c26780fe8d1993"));
var shared_1 = tslib_1.__importDefault(require("3fd49ab735db27eb"));
function default_1(fork) {
    fork.use(core_1.default);
    var types = fork.use(types_1.default);
    var def = types.Type.def;
    var or = types.Type.or;
    var defaults = fork.use(shared_1.default).defaults;
    def("Function").field("generator", Boolean, defaults["false"]).field("expression", Boolean, defaults["false"]).field("defaults", [
        or(def("Expression"), null)
    ], defaults.emptyArray)// TODO This could be represented as a RestElement in .params.
    .field("rest", or(def("Identifier"), null), defaults["null"]);
    // The ESTree way of representing a ...rest parameter.
    def("RestElement").bases("Pattern").build("argument").field("argument", def("Pattern")).field("typeAnnotation", or(def("TypeAnnotation"), def("TSTypeAnnotation"), null), defaults["null"]);
    def("SpreadElementPattern").bases("Pattern").build("argument").field("argument", def("Pattern"));
    def("FunctionDeclaration").build("id", "params", "body", "generator", "expression");
    def("FunctionExpression").build("id", "params", "body", "generator", "expression");
    // The Parser API calls this ArrowExpression, but Esprima and all other
    // actual parsers use ArrowFunctionExpression.
    def("ArrowFunctionExpression").bases("Function", "Expression").build("params", "body", "expression")// The forced null value here is compatible with the overridden
    // definition of the "id" field in the Function interface.
    .field("id", null, defaults["null"])// Arrow function bodies are allowed to be expressions.
    .field("body", or(def("BlockStatement"), def("Expression")))// The current spec forbids arrow generators, so I have taken the
    // liberty of enforcing that. TODO Report this.
    .field("generator", false, defaults["false"]);
    def("ForOfStatement").bases("Statement").build("left", "right", "body").field("left", or(def("VariableDeclaration"), def("Pattern"))).field("right", def("Expression")).field("body", def("Statement"));
    def("YieldExpression").bases("Expression").build("argument", "delegate").field("argument", or(def("Expression"), null)).field("delegate", Boolean, defaults["false"]);
    def("GeneratorExpression").bases("Expression").build("body", "blocks", "filter").field("body", def("Expression")).field("blocks", [
        def("ComprehensionBlock")
    ]).field("filter", or(def("Expression"), null));
    def("ComprehensionExpression").bases("Expression").build("body", "blocks", "filter").field("body", def("Expression")).field("blocks", [
        def("ComprehensionBlock")
    ]).field("filter", or(def("Expression"), null));
    def("ComprehensionBlock").bases("Node").build("left", "right", "each").field("left", def("Pattern")).field("right", def("Expression")).field("each", Boolean);
    def("Property").field("key", or(def("Literal"), def("Identifier"), def("Expression"))).field("value", or(def("Expression"), def("Pattern"))).field("method", Boolean, defaults["false"]).field("shorthand", Boolean, defaults["false"]).field("computed", Boolean, defaults["false"]);
    def("ObjectProperty").field("shorthand", Boolean, defaults["false"]);
    def("PropertyPattern").bases("Pattern").build("key", "pattern").field("key", or(def("Literal"), def("Identifier"), def("Expression"))).field("pattern", def("Pattern")).field("computed", Boolean, defaults["false"]);
    def("ObjectPattern").bases("Pattern").build("properties").field("properties", [
        or(def("PropertyPattern"), def("Property"))
    ]);
    def("ArrayPattern").bases("Pattern").build("elements").field("elements", [
        or(def("Pattern"), null)
    ]);
    def("MethodDefinition").bases("Declaration").build("kind", "key", "value", "static").field("kind", or("constructor", "method", "get", "set")).field("key", def("Expression")).field("value", def("Function")).field("computed", Boolean, defaults["false"]).field("static", Boolean, defaults["false"]);
    def("SpreadElement").bases("Node").build("argument").field("argument", def("Expression"));
    def("ArrayExpression").field("elements", [
        or(def("Expression"), def("SpreadElement"), def("RestElement"), null)
    ]);
    def("NewExpression").field("arguments", [
        or(def("Expression"), def("SpreadElement"))
    ]);
    def("CallExpression").field("arguments", [
        or(def("Expression"), def("SpreadElement"))
    ]);
    // Note: this node type is *not* an AssignmentExpression with a Pattern on
    // the left-hand side! The existing AssignmentExpression type already
    // supports destructuring assignments. AssignmentPattern nodes may appear
    // wherever a Pattern is allowed, and the right-hand side represents a
    // default value to be destructured against the left-hand side, if no
    // value is otherwise provided. For example: default parameter values.
    def("AssignmentPattern").bases("Pattern").build("left", "right").field("left", def("Pattern")).field("right", def("Expression"));
    var ClassBodyElement = or(def("MethodDefinition"), def("VariableDeclarator"), def("ClassPropertyDefinition"), def("ClassProperty"));
    def("ClassProperty").bases("Declaration").build("key").field("key", or(def("Literal"), def("Identifier"), def("Expression"))).field("computed", Boolean, defaults["false"]);
    def("ClassPropertyDefinition") // static property
    .bases("Declaration").build("definition")// Yes, Virginia, circular definitions are permitted.
    .field("definition", ClassBodyElement);
    def("ClassBody").bases("Declaration").build("body").field("body", [
        ClassBodyElement
    ]);
    def("ClassDeclaration").bases("Declaration").build("id", "body", "superClass").field("id", or(def("Identifier"), null)).field("body", def("ClassBody")).field("superClass", or(def("Expression"), null), defaults["null"]);
    def("ClassExpression").bases("Expression").build("id", "body", "superClass").field("id", or(def("Identifier"), null), defaults["null"]).field("body", def("ClassBody")).field("superClass", or(def("Expression"), null), defaults["null"]);
    // Specifier and ModuleSpecifier are abstract non-standard types
    // introduced for definitional convenience.
    def("Specifier").bases("Node");
    // This supertype is shared/abused by both def/babel.js and
    // def/esprima.js. In the future, it will be possible to load only one set
    // of definitions appropriate for a given parser, but until then we must
    // rely on default functions to reconcile the conflicting AST formats.
    def("ModuleSpecifier").bases("Specifier")// This local field is used by Babel/Acorn. It should not technically
    // be optional in the Babel/Acorn AST format, but it must be optional
    // in the Esprima AST format.
    .field("local", or(def("Identifier"), null), defaults["null"])// The id and name fields are used by Esprima. The id field should not
    // technically be optional in the Esprima AST format, but it must be
    // optional in the Babel/Acorn AST format.
    .field("id", or(def("Identifier"), null), defaults["null"]).field("name", or(def("Identifier"), null), defaults["null"]);
    // Like ModuleSpecifier, except type:"ImportSpecifier" and buildable.
    // import {<id [as name]>} from ...;
    def("ImportSpecifier").bases("ModuleSpecifier").build("id", "name");
    // import <* as id> from ...;
    def("ImportNamespaceSpecifier").bases("ModuleSpecifier").build("id");
    // import <id> from ...;
    def("ImportDefaultSpecifier").bases("ModuleSpecifier").build("id");
    def("ImportDeclaration").bases("Declaration").build("specifiers", "source", "importKind").field("specifiers", [
        or(def("ImportSpecifier"), def("ImportNamespaceSpecifier"), def("ImportDefaultSpecifier"))
    ], defaults.emptyArray).field("source", def("Literal")).field("importKind", or("value", "type"), function() {
        return "value";
    });
    def("TaggedTemplateExpression").bases("Expression").build("tag", "quasi").field("tag", def("Expression")).field("quasi", def("TemplateLiteral"));
    def("TemplateLiteral").bases("Expression").build("quasis", "expressions").field("quasis", [
        def("TemplateElement")
    ]).field("expressions", [
        def("Expression")
    ]);
    def("TemplateElement").bases("Node").build("value", "tail").field("value", {
        "cooked": String,
        "raw": String
    }).field("tail", Boolean);
}
exports.default = default_1;
module.exports = exports["default"];

},{"ec54cfba352a2cde":"ao9yO","aa0e14c7cf1d14f":"j3uvl","d9c26780fe8d1993":"jL4It","3fd49ab735db27eb":"cIgjo"}],"cv0ap":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
var tslib_1 = require("8beb448707e33cfd");
var es6_1 = tslib_1.__importDefault(require("d27682859c4c0cb"));
var types_1 = tslib_1.__importDefault(require("a770b66fbf94fb8d"));
var shared_1 = tslib_1.__importDefault(require("cca76d1c733e693e"));
function default_1(fork) {
    fork.use(es6_1.default);
    var types = fork.use(types_1.default);
    var def = types.Type.def;
    var or = types.Type.or;
    var defaults = fork.use(shared_1.default).defaults;
    def("Function").field("async", Boolean, defaults["false"]);
    def("SpreadProperty").bases("Node").build("argument").field("argument", def("Expression"));
    def("ObjectExpression").field("properties", [
        or(def("Property"), def("SpreadProperty"), def("SpreadElement"))
    ]);
    def("SpreadPropertyPattern").bases("Pattern").build("argument").field("argument", def("Pattern"));
    def("ObjectPattern").field("properties", [
        or(def("Property"), def("PropertyPattern"), def("SpreadPropertyPattern"))
    ]);
    def("AwaitExpression").bases("Expression").build("argument", "all").field("argument", or(def("Expression"), null)).field("all", Boolean, defaults["false"]);
}
exports.default = default_1;
module.exports = exports["default"];

},{"8beb448707e33cfd":"ao9yO","d27682859c4c0cb":"lEmvD","a770b66fbf94fb8d":"jL4It","cca76d1c733e693e":"cIgjo"}],"66ZXa":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
var tslib_1 = require("da24376170bdb274");
var es7_1 = tslib_1.__importDefault(require("3bb033364d77ad9b"));
var types_1 = tslib_1.__importDefault(require("b2e82e609851edfa"));
function default_1(fork) {
    fork.use(es7_1.default);
    var types = fork.use(types_1.default);
    var def = types.Type.def;
    def("ImportExpression").bases("Expression").build("source").field("source", def("Expression"));
}
exports.default = default_1;
module.exports = exports["default"];

},{"da24376170bdb274":"ao9yO","3bb033364d77ad9b":"cv0ap","b2e82e609851edfa":"jL4It"}],"5LqcL":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
var tslib_1 = require("5a640c2704d8d384");
var es7_1 = tslib_1.__importDefault(require("ad7d13db3493115f"));
var types_1 = tslib_1.__importDefault(require("8d02e7559eef4894"));
var shared_1 = tslib_1.__importDefault(require("1f3c4b2ab184d227"));
function default_1(fork) {
    fork.use(es7_1.default);
    var types = fork.use(types_1.default);
    var def = types.Type.def;
    var or = types.Type.or;
    var defaults = fork.use(shared_1.default).defaults;
    def("JSXAttribute").bases("Node").build("name", "value").field("name", or(def("JSXIdentifier"), def("JSXNamespacedName"))).field("value", or(def("Literal"), def("JSXExpressionContainer"), null // attr= or just attr
    ), defaults["null"]);
    def("JSXIdentifier").bases("Identifier").build("name").field("name", String);
    def("JSXNamespacedName").bases("Node").build("namespace", "name").field("namespace", def("JSXIdentifier")).field("name", def("JSXIdentifier"));
    def("JSXMemberExpression").bases("MemberExpression").build("object", "property").field("object", or(def("JSXIdentifier"), def("JSXMemberExpression"))).field("property", def("JSXIdentifier")).field("computed", Boolean, defaults.false);
    var JSXElementName = or(def("JSXIdentifier"), def("JSXNamespacedName"), def("JSXMemberExpression"));
    def("JSXSpreadAttribute").bases("Node").build("argument").field("argument", def("Expression"));
    var JSXAttributes = [
        or(def("JSXAttribute"), def("JSXSpreadAttribute"))
    ];
    def("JSXExpressionContainer").bases("Expression").build("expression").field("expression", def("Expression"));
    def("JSXElement").bases("Expression").build("openingElement", "closingElement", "children").field("openingElement", def("JSXOpeningElement")).field("closingElement", or(def("JSXClosingElement"), null), defaults["null"]).field("children", [
        or(def("JSXElement"), def("JSXExpressionContainer"), def("JSXFragment"), def("JSXText"), def("Literal") // TODO Esprima should return JSXText instead.
        )
    ], defaults.emptyArray).field("name", JSXElementName, function() {
        // Little-known fact: the `this` object inside a default function
        // is none other than the partially-built object itself, and any
        // fields initialized directly from builder function arguments
        // (like openingElement, closingElement, and children) are
        // guaranteed to be available.
        return this.openingElement.name;
    }, true) // hidden from traversal
    .field("selfClosing", Boolean, function() {
        return this.openingElement.selfClosing;
    }, true) // hidden from traversal
    .field("attributes", JSXAttributes, function() {
        return this.openingElement.attributes;
    }, true); // hidden from traversal
    def("JSXOpeningElement").bases("Node") // TODO Does this make sense? Can't really be an JSXElement.
    .build("name", "attributes", "selfClosing").field("name", JSXElementName).field("attributes", JSXAttributes, defaults.emptyArray).field("selfClosing", Boolean, defaults["false"]);
    def("JSXClosingElement").bases("Node") // TODO Same concern.
    .build("name").field("name", JSXElementName);
    def("JSXFragment").bases("Expression").build("openingElement", "closingElement", "children").field("openingElement", def("JSXOpeningFragment")).field("closingElement", def("JSXClosingFragment")).field("children", [
        or(def("JSXElement"), def("JSXExpressionContainer"), def("JSXFragment"), def("JSXText"), def("Literal") // TODO Esprima should return JSXText instead.
        )
    ], defaults.emptyArray);
    def("JSXOpeningFragment").bases("Node") // TODO Same concern.
    .build();
    def("JSXClosingFragment").bases("Node") // TODO Same concern.
    .build();
    def("JSXText").bases("Literal").build("value").field("value", String);
    def("JSXEmptyExpression").bases("Expression").build();
    // This PR has caused many people issues, but supporting it seems like a
    // good idea anyway: https://github.com/babel/babel/pull/4988
    def("JSXSpreadChild").bases("Expression").build("expression").field("expression", def("Expression"));
}
exports.default = default_1;
module.exports = exports["default"];

},{"5a640c2704d8d384":"ao9yO","ad7d13db3493115f":"cv0ap","8d02e7559eef4894":"jL4It","1f3c4b2ab184d227":"cIgjo"}],"9Lg0j":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
var tslib_1 = require("d98884e9566950a4");
var es7_1 = tslib_1.__importDefault(require("bc91d879e805d1f"));
var type_annotations_1 = tslib_1.__importDefault(require("164a45e0a1b9b155"));
var types_1 = tslib_1.__importDefault(require("c1633a9e94a8038e"));
var shared_1 = tslib_1.__importDefault(require("118ebd641e103598"));
function default_1(fork) {
    fork.use(es7_1.default);
    fork.use(type_annotations_1.default);
    var types = fork.use(types_1.default);
    var def = types.Type.def;
    var or = types.Type.or;
    var defaults = fork.use(shared_1.default).defaults;
    // Base types
    def("Flow").bases("Node");
    def("FlowType").bases("Flow");
    // Type annotations
    def("AnyTypeAnnotation").bases("FlowType").build();
    def("EmptyTypeAnnotation").bases("FlowType").build();
    def("MixedTypeAnnotation").bases("FlowType").build();
    def("VoidTypeAnnotation").bases("FlowType").build();
    def("NumberTypeAnnotation").bases("FlowType").build();
    def("NumberLiteralTypeAnnotation").bases("FlowType").build("value", "raw").field("value", Number).field("raw", String);
    // Babylon 6 differs in AST from Flow
    // same as NumberLiteralTypeAnnotation
    def("NumericLiteralTypeAnnotation").bases("FlowType").build("value", "raw").field("value", Number).field("raw", String);
    def("StringTypeAnnotation").bases("FlowType").build();
    def("StringLiteralTypeAnnotation").bases("FlowType").build("value", "raw").field("value", String).field("raw", String);
    def("BooleanTypeAnnotation").bases("FlowType").build();
    def("BooleanLiteralTypeAnnotation").bases("FlowType").build("value", "raw").field("value", Boolean).field("raw", String);
    def("TypeAnnotation").bases("Node").build("typeAnnotation").field("typeAnnotation", def("FlowType"));
    def("NullableTypeAnnotation").bases("FlowType").build("typeAnnotation").field("typeAnnotation", def("FlowType"));
    def("NullLiteralTypeAnnotation").bases("FlowType").build();
    def("NullTypeAnnotation").bases("FlowType").build();
    def("ThisTypeAnnotation").bases("FlowType").build();
    def("ExistsTypeAnnotation").bases("FlowType").build();
    def("ExistentialTypeParam").bases("FlowType").build();
    def("FunctionTypeAnnotation").bases("FlowType").build("params", "returnType", "rest", "typeParameters").field("params", [
        def("FunctionTypeParam")
    ]).field("returnType", def("FlowType")).field("rest", or(def("FunctionTypeParam"), null)).field("typeParameters", or(def("TypeParameterDeclaration"), null));
    def("FunctionTypeParam").bases("Node").build("name", "typeAnnotation", "optional").field("name", def("Identifier")).field("typeAnnotation", def("FlowType")).field("optional", Boolean);
    def("ArrayTypeAnnotation").bases("FlowType").build("elementType").field("elementType", def("FlowType"));
    def("ObjectTypeAnnotation").bases("FlowType").build("properties", "indexers", "callProperties").field("properties", [
        or(def("ObjectTypeProperty"), def("ObjectTypeSpreadProperty"))
    ]).field("indexers", [
        def("ObjectTypeIndexer")
    ], defaults.emptyArray).field("callProperties", [
        def("ObjectTypeCallProperty")
    ], defaults.emptyArray).field("inexact", or(Boolean, void 0), defaults["undefined"]).field("exact", Boolean, defaults["false"]).field("internalSlots", [
        def("ObjectTypeInternalSlot")
    ], defaults.emptyArray);
    def("Variance").bases("Node").build("kind").field("kind", or("plus", "minus"));
    var LegacyVariance = or(def("Variance"), "plus", "minus", null);
    def("ObjectTypeProperty").bases("Node").build("key", "value", "optional").field("key", or(def("Literal"), def("Identifier"))).field("value", def("FlowType")).field("optional", Boolean).field("variance", LegacyVariance, defaults["null"]);
    def("ObjectTypeIndexer").bases("Node").build("id", "key", "value").field("id", def("Identifier")).field("key", def("FlowType")).field("value", def("FlowType")).field("variance", LegacyVariance, defaults["null"]);
    def("ObjectTypeCallProperty").bases("Node").build("value").field("value", def("FunctionTypeAnnotation")).field("static", Boolean, defaults["false"]);
    def("QualifiedTypeIdentifier").bases("Node").build("qualification", "id").field("qualification", or(def("Identifier"), def("QualifiedTypeIdentifier"))).field("id", def("Identifier"));
    def("GenericTypeAnnotation").bases("FlowType").build("id", "typeParameters").field("id", or(def("Identifier"), def("QualifiedTypeIdentifier"))).field("typeParameters", or(def("TypeParameterInstantiation"), null));
    def("MemberTypeAnnotation").bases("FlowType").build("object", "property").field("object", def("Identifier")).field("property", or(def("MemberTypeAnnotation"), def("GenericTypeAnnotation")));
    def("UnionTypeAnnotation").bases("FlowType").build("types").field("types", [
        def("FlowType")
    ]);
    def("IntersectionTypeAnnotation").bases("FlowType").build("types").field("types", [
        def("FlowType")
    ]);
    def("TypeofTypeAnnotation").bases("FlowType").build("argument").field("argument", def("FlowType"));
    def("ObjectTypeSpreadProperty").bases("Node").build("argument").field("argument", def("FlowType"));
    def("ObjectTypeInternalSlot").bases("Node").build("id", "value", "optional", "static", "method").field("id", def("Identifier")).field("value", def("FlowType")).field("optional", Boolean).field("static", Boolean).field("method", Boolean);
    def("TypeParameterDeclaration").bases("Node").build("params").field("params", [
        def("TypeParameter")
    ]);
    def("TypeParameterInstantiation").bases("Node").build("params").field("params", [
        def("FlowType")
    ]);
    def("TypeParameter").bases("FlowType").build("name", "variance", "bound").field("name", String).field("variance", LegacyVariance, defaults["null"]).field("bound", or(def("TypeAnnotation"), null), defaults["null"]);
    def("ClassProperty").field("variance", LegacyVariance, defaults["null"]);
    def("ClassImplements").bases("Node").build("id").field("id", def("Identifier")).field("superClass", or(def("Expression"), null), defaults["null"]).field("typeParameters", or(def("TypeParameterInstantiation"), null), defaults["null"]);
    def("InterfaceTypeAnnotation").bases("FlowType").build("body", "extends").field("body", def("ObjectTypeAnnotation")).field("extends", or([
        def("InterfaceExtends")
    ], null), defaults["null"]);
    def("InterfaceDeclaration").bases("Declaration").build("id", "body", "extends").field("id", def("Identifier")).field("typeParameters", or(def("TypeParameterDeclaration"), null), defaults["null"]).field("body", def("ObjectTypeAnnotation")).field("extends", [
        def("InterfaceExtends")
    ]);
    def("DeclareInterface").bases("InterfaceDeclaration").build("id", "body", "extends");
    def("InterfaceExtends").bases("Node").build("id").field("id", def("Identifier")).field("typeParameters", or(def("TypeParameterInstantiation"), null), defaults["null"]);
    def("TypeAlias").bases("Declaration").build("id", "typeParameters", "right").field("id", def("Identifier")).field("typeParameters", or(def("TypeParameterDeclaration"), null)).field("right", def("FlowType"));
    def("OpaqueType").bases("Declaration").build("id", "typeParameters", "impltype", "supertype").field("id", def("Identifier")).field("typeParameters", or(def("TypeParameterDeclaration"), null)).field("impltype", def("FlowType")).field("supertype", def("FlowType"));
    def("DeclareTypeAlias").bases("TypeAlias").build("id", "typeParameters", "right");
    def("DeclareOpaqueType").bases("TypeAlias").build("id", "typeParameters", "supertype");
    def("TypeCastExpression").bases("Expression").build("expression", "typeAnnotation").field("expression", def("Expression")).field("typeAnnotation", def("TypeAnnotation"));
    def("TupleTypeAnnotation").bases("FlowType").build("types").field("types", [
        def("FlowType")
    ]);
    def("DeclareVariable").bases("Statement").build("id").field("id", def("Identifier"));
    def("DeclareFunction").bases("Statement").build("id").field("id", def("Identifier"));
    def("DeclareClass").bases("InterfaceDeclaration").build("id");
    def("DeclareModule").bases("Statement").build("id", "body").field("id", or(def("Identifier"), def("Literal"))).field("body", def("BlockStatement"));
    def("DeclareModuleExports").bases("Statement").build("typeAnnotation").field("typeAnnotation", def("TypeAnnotation"));
    def("DeclareExportDeclaration").bases("Declaration").build("default", "declaration", "specifiers", "source").field("default", Boolean).field("declaration", or(def("DeclareVariable"), def("DeclareFunction"), def("DeclareClass"), def("FlowType"), null)).field("specifiers", [
        or(def("ExportSpecifier"), def("ExportBatchSpecifier"))
    ], defaults.emptyArray).field("source", or(def("Literal"), null), defaults["null"]);
    def("DeclareExportAllDeclaration").bases("Declaration").build("source").field("source", or(def("Literal"), null), defaults["null"]);
    def("FlowPredicate").bases("Flow");
    def("InferredPredicate").bases("FlowPredicate").build();
    def("DeclaredPredicate").bases("FlowPredicate").build("value").field("value", def("Expression"));
    def("CallExpression").field("typeArguments", or(null, def("TypeParameterInstantiation")), defaults["null"]);
    def("NewExpression").field("typeArguments", or(null, def("TypeParameterInstantiation")), defaults["null"]);
}
exports.default = default_1;
module.exports = exports["default"];

},{"d98884e9566950a4":"ao9yO","bc91d879e805d1f":"cv0ap","164a45e0a1b9b155":"as00b","c1633a9e94a8038e":"jL4It","118ebd641e103598":"cIgjo"}],"as00b":[function(require,module,exports,__globalThis) {
"use strict";
/**
 * Type annotation defs shared between Flow and TypeScript.
 * These defs could not be defined in ./flow.ts or ./typescript.ts directly
 * because they use the same name.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
var tslib_1 = require("673131f254a66853");
var types_1 = tslib_1.__importDefault(require("55f761fe2cf08b79"));
var shared_1 = tslib_1.__importDefault(require("b9dfaf02de900ac4"));
function default_1(fork) {
    var types = fork.use(types_1.default);
    var def = types.Type.def;
    var or = types.Type.or;
    var defaults = fork.use(shared_1.default).defaults;
    var TypeAnnotation = or(def("TypeAnnotation"), def("TSTypeAnnotation"), null);
    var TypeParamDecl = or(def("TypeParameterDeclaration"), def("TSTypeParameterDeclaration"), null);
    def("Identifier").field("typeAnnotation", TypeAnnotation, defaults["null"]);
    def("ObjectPattern").field("typeAnnotation", TypeAnnotation, defaults["null"]);
    def("Function").field("returnType", TypeAnnotation, defaults["null"]).field("typeParameters", TypeParamDecl, defaults["null"]);
    def("ClassProperty").build("key", "value", "typeAnnotation", "static").field("value", or(def("Expression"), null)).field("static", Boolean, defaults["false"]).field("typeAnnotation", TypeAnnotation, defaults["null"]);
    [
        "ClassDeclaration",
        "ClassExpression"
    ].forEach(function(typeName) {
        def(typeName).field("typeParameters", TypeParamDecl, defaults["null"]).field("superTypeParameters", or(def("TypeParameterInstantiation"), def("TSTypeParameterInstantiation"), null), defaults["null"]).field("implements", or([
            def("ClassImplements")
        ], [
            def("TSExpressionWithTypeArguments")
        ]), defaults.emptyArray);
    });
}
exports.default = default_1;
module.exports = exports["default"];

},{"673131f254a66853":"ao9yO","55f761fe2cf08b79":"jL4It","b9dfaf02de900ac4":"cIgjo"}],"dtjdj":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
var tslib_1 = require("a2c4131da2c06dcf");
var es7_1 = tslib_1.__importDefault(require("e827221ee59769da"));
var types_1 = tslib_1.__importDefault(require("3fceeabde4c72a05"));
var shared_1 = tslib_1.__importDefault(require("7f018827705272f2"));
function default_1(fork) {
    fork.use(es7_1.default);
    var types = fork.use(types_1.default);
    var defaults = fork.use(shared_1.default).defaults;
    var def = types.Type.def;
    var or = types.Type.or;
    def("VariableDeclaration").field("declarations", [
        or(def("VariableDeclarator"), def("Identifier") // Esprima deviation.
        )
    ]);
    def("Property").field("value", or(def("Expression"), def("Pattern") // Esprima deviation.
    ));
    def("ArrayPattern").field("elements", [
        or(def("Pattern"), def("SpreadElement"), null)
    ]);
    def("ObjectPattern").field("properties", [
        or(def("Property"), def("PropertyPattern"), def("SpreadPropertyPattern"), def("SpreadProperty") // Used by Esprima.
        )
    ]);
    // Like ModuleSpecifier, except type:"ExportSpecifier" and buildable.
    // export {<id [as name]>} [from ...];
    def("ExportSpecifier").bases("ModuleSpecifier").build("id", "name");
    // export <*> from ...;
    def("ExportBatchSpecifier").bases("Specifier").build();
    def("ExportDeclaration").bases("Declaration").build("default", "declaration", "specifiers", "source").field("default", Boolean).field("declaration", or(def("Declaration"), def("Expression"), null)).field("specifiers", [
        or(def("ExportSpecifier"), def("ExportBatchSpecifier"))
    ], defaults.emptyArray).field("source", or(def("Literal"), null), defaults["null"]);
    def("Block").bases("Comment").build("value", /*optional:*/ "leading", "trailing");
    def("Line").bases("Comment").build("value", /*optional:*/ "leading", "trailing");
}
exports.default = default_1;
module.exports = exports["default"];

},{"a2c4131da2c06dcf":"ao9yO","e827221ee59769da":"cv0ap","3fceeabde4c72a05":"jL4It","7f018827705272f2":"cIgjo"}],"6X39G":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
var tslib_1 = require("bdceec8e5204a630");
var babel_core_1 = tslib_1.__importDefault(require("28906046069dcc18"));
var flow_1 = tslib_1.__importDefault(require("d7cacfc89374b14f"));
function default_1(fork) {
    fork.use(babel_core_1.default);
    fork.use(flow_1.default);
}
exports.default = default_1;
module.exports = exports["default"];

},{"bdceec8e5204a630":"ao9yO","28906046069dcc18":"77moI","d7cacfc89374b14f":"9Lg0j"}],"77moI":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
var tslib_1 = require("16764da708ee1c1f");
var types_1 = tslib_1.__importDefault(require("105e1248641bfdd6"));
var shared_1 = tslib_1.__importDefault(require("73ea0b980e7a6bef"));
var es7_1 = tslib_1.__importDefault(require("36553e5dc5fbfbc"));
function default_1(fork) {
    fork.use(es7_1.default);
    var types = fork.use(types_1.default);
    var defaults = fork.use(shared_1.default).defaults;
    var def = types.Type.def;
    var or = types.Type.or;
    def("Noop").bases("Statement").build();
    def("DoExpression").bases("Expression").build("body").field("body", [
        def("Statement")
    ]);
    def("Super").bases("Expression").build();
    def("BindExpression").bases("Expression").build("object", "callee").field("object", or(def("Expression"), null)).field("callee", def("Expression"));
    def("Decorator").bases("Node").build("expression").field("expression", def("Expression"));
    def("Property").field("decorators", or([
        def("Decorator")
    ], null), defaults["null"]);
    def("MethodDefinition").field("decorators", or([
        def("Decorator")
    ], null), defaults["null"]);
    def("MetaProperty").bases("Expression").build("meta", "property").field("meta", def("Identifier")).field("property", def("Identifier"));
    def("ParenthesizedExpression").bases("Expression").build("expression").field("expression", def("Expression"));
    def("ImportSpecifier").bases("ModuleSpecifier").build("imported", "local").field("imported", def("Identifier"));
    def("ImportDefaultSpecifier").bases("ModuleSpecifier").build("local");
    def("ImportNamespaceSpecifier").bases("ModuleSpecifier").build("local");
    def("ExportDefaultDeclaration").bases("Declaration").build("declaration").field("declaration", or(def("Declaration"), def("Expression")));
    def("ExportNamedDeclaration").bases("Declaration").build("declaration", "specifiers", "source").field("declaration", or(def("Declaration"), null)).field("specifiers", [
        def("ExportSpecifier")
    ], defaults.emptyArray).field("source", or(def("Literal"), null), defaults["null"]);
    def("ExportSpecifier").bases("ModuleSpecifier").build("local", "exported").field("exported", def("Identifier"));
    def("ExportNamespaceSpecifier").bases("Specifier").build("exported").field("exported", def("Identifier"));
    def("ExportDefaultSpecifier").bases("Specifier").build("exported").field("exported", def("Identifier"));
    def("ExportAllDeclaration").bases("Declaration").build("exported", "source").field("exported", or(def("Identifier"), null)).field("source", def("Literal"));
    def("CommentBlock").bases("Comment").build("value", /*optional:*/ "leading", "trailing");
    def("CommentLine").bases("Comment").build("value", /*optional:*/ "leading", "trailing");
    def("Directive").bases("Node").build("value").field("value", def("DirectiveLiteral"));
    def("DirectiveLiteral").bases("Node", "Expression").build("value").field("value", String, defaults["use strict"]);
    def("InterpreterDirective").bases("Node").build("value").field("value", String);
    def("BlockStatement").bases("Statement").build("body").field("body", [
        def("Statement")
    ]).field("directives", [
        def("Directive")
    ], defaults.emptyArray);
    def("Program").bases("Node").build("body").field("body", [
        def("Statement")
    ]).field("directives", [
        def("Directive")
    ], defaults.emptyArray).field("interpreter", or(def("InterpreterDirective"), null), defaults["null"]);
    // Split Literal
    def("StringLiteral").bases("Literal").build("value").field("value", String);
    def("NumericLiteral").bases("Literal").build("value").field("value", Number).field("raw", or(String, null), defaults["null"]).field("extra", {
        rawValue: Number,
        raw: String
    }, function getDefault() {
        return {
            rawValue: this.value,
            raw: this.value + ""
        };
    });
    def("BigIntLiteral").bases("Literal").build("value")// Only String really seems appropriate here, since BigInt values
    // often exceed the limits of JS numbers.
    .field("value", or(String, Number)).field("extra", {
        rawValue: String,
        raw: String
    }, function getDefault() {
        return {
            rawValue: String(this.value),
            raw: this.value + "n"
        };
    });
    def("NullLiteral").bases("Literal").build().field("value", null, defaults["null"]);
    def("BooleanLiteral").bases("Literal").build("value").field("value", Boolean);
    def("RegExpLiteral").bases("Literal").build("pattern", "flags").field("pattern", String).field("flags", String).field("value", RegExp, function() {
        return new RegExp(this.pattern, this.flags);
    });
    var ObjectExpressionProperty = or(def("Property"), def("ObjectMethod"), def("ObjectProperty"), def("SpreadProperty"), def("SpreadElement"));
    // Split Property -> ObjectProperty and ObjectMethod
    def("ObjectExpression").bases("Expression").build("properties").field("properties", [
        ObjectExpressionProperty
    ]);
    // ObjectMethod hoist .value properties to own properties
    def("ObjectMethod").bases("Node", "Function").build("kind", "key", "params", "body", "computed").field("kind", or("method", "get", "set")).field("key", or(def("Literal"), def("Identifier"), def("Expression"))).field("params", [
        def("Pattern")
    ]).field("body", def("BlockStatement")).field("computed", Boolean, defaults["false"]).field("generator", Boolean, defaults["false"]).field("async", Boolean, defaults["false"]).field("accessibility", or(def("Literal"), null), defaults["null"]).field("decorators", or([
        def("Decorator")
    ], null), defaults["null"]);
    def("ObjectProperty").bases("Node").build("key", "value").field("key", or(def("Literal"), def("Identifier"), def("Expression"))).field("value", or(def("Expression"), def("Pattern"))).field("accessibility", or(def("Literal"), null), defaults["null"]).field("computed", Boolean, defaults["false"]);
    var ClassBodyElement = or(def("MethodDefinition"), def("VariableDeclarator"), def("ClassPropertyDefinition"), def("ClassProperty"), def("ClassPrivateProperty"), def("ClassMethod"), def("ClassPrivateMethod"));
    // MethodDefinition -> ClassMethod
    def("ClassBody").bases("Declaration").build("body").field("body", [
        ClassBodyElement
    ]);
    def("ClassMethod").bases("Declaration", "Function").build("kind", "key", "params", "body", "computed", "static").field("key", or(def("Literal"), def("Identifier"), def("Expression")));
    def("ClassPrivateMethod").bases("Declaration", "Function").build("key", "params", "body", "kind", "computed", "static").field("key", def("PrivateName"));
    [
        "ClassMethod",
        "ClassPrivateMethod"
    ].forEach(function(typeName) {
        def(typeName).field("kind", or("get", "set", "method", "constructor"), function() {
            return "method";
        }).field("body", def("BlockStatement")).field("computed", Boolean, defaults["false"]).field("static", or(Boolean, null), defaults["null"]).field("abstract", or(Boolean, null), defaults["null"]).field("access", or("public", "private", "protected", null), defaults["null"]).field("accessibility", or("public", "private", "protected", null), defaults["null"]).field("decorators", or([
            def("Decorator")
        ], null), defaults["null"]).field("optional", or(Boolean, null), defaults["null"]);
    });
    def("ClassPrivateProperty").bases("ClassProperty").build("key", "value").field("key", def("PrivateName")).field("value", or(def("Expression"), null), defaults["null"]);
    def("PrivateName").bases("Expression", "Pattern").build("id").field("id", def("Identifier"));
    var ObjectPatternProperty = or(def("Property"), def("PropertyPattern"), def("SpreadPropertyPattern"), def("SpreadProperty"), def("ObjectProperty"), def("RestProperty") // Babel 6
    );
    // Split into RestProperty and SpreadProperty
    def("ObjectPattern").bases("Pattern").build("properties").field("properties", [
        ObjectPatternProperty
    ]).field("decorators", or([
        def("Decorator")
    ], null), defaults["null"]);
    def("SpreadProperty").bases("Node").build("argument").field("argument", def("Expression"));
    def("RestProperty").bases("Node").build("argument").field("argument", def("Expression"));
    def("ForAwaitStatement").bases("Statement").build("left", "right", "body").field("left", or(def("VariableDeclaration"), def("Expression"))).field("right", def("Expression")).field("body", def("Statement"));
    // The callee node of a dynamic import(...) expression.
    def("Import").bases("Expression").build();
}
exports.default = default_1;
module.exports = exports["default"];

},{"16764da708ee1c1f":"ao9yO","105e1248641bfdd6":"jL4It","73ea0b980e7a6bef":"cIgjo","36553e5dc5fbfbc":"cv0ap"}],"96Gm8":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
var tslib_1 = require("1d043666b49345a4");
var babel_core_1 = tslib_1.__importDefault(require("4b1717cde8f6c423"));
var type_annotations_1 = tslib_1.__importDefault(require("b615f963851a4bdd"));
var types_1 = tslib_1.__importDefault(require("99dc2096982b64d9"));
var shared_1 = tslib_1.__importDefault(require("25e9e520e2ed15a1"));
function default_1(fork) {
    // Since TypeScript is parsed by Babylon, include the core Babylon types
    // but omit the Flow-related types.
    fork.use(babel_core_1.default);
    fork.use(type_annotations_1.default);
    var types = fork.use(types_1.default);
    var n = types.namedTypes;
    var def = types.Type.def;
    var or = types.Type.or;
    var defaults = fork.use(shared_1.default).defaults;
    var StringLiteral = types.Type.from(function(value, deep) {
        if (n.StringLiteral && n.StringLiteral.check(value, deep)) return true;
        if (n.Literal && n.Literal.check(value, deep) && typeof value.value === "string") return true;
        return false;
    }, "StringLiteral");
    def("TSType").bases("Node");
    var TSEntityName = or(def("Identifier"), def("TSQualifiedName"));
    def("TSTypeReference").bases("TSType", "TSHasOptionalTypeParameterInstantiation").build("typeName", "typeParameters").field("typeName", TSEntityName);
    // An abstract (non-buildable) base type that provide a commonly-needed
    // optional .typeParameters field.
    def("TSHasOptionalTypeParameterInstantiation").field("typeParameters", or(def("TSTypeParameterInstantiation"), null), defaults["null"]);
    // An abstract (non-buildable) base type that provide a commonly-needed
    // optional .typeParameters field.
    def("TSHasOptionalTypeParameters").field("typeParameters", or(def("TSTypeParameterDeclaration"), null, void 0), defaults["null"]);
    // An abstract (non-buildable) base type that provide a commonly-needed
    // optional .typeAnnotation field.
    def("TSHasOptionalTypeAnnotation").field("typeAnnotation", or(def("TSTypeAnnotation"), null), defaults["null"]);
    def("TSQualifiedName").bases("Node").build("left", "right").field("left", TSEntityName).field("right", TSEntityName);
    def("TSAsExpression").bases("Expression", "Pattern").build("expression", "typeAnnotation").field("expression", def("Expression")).field("typeAnnotation", def("TSType")).field("extra", or({
        parenthesized: Boolean
    }, null), defaults["null"]);
    def("TSNonNullExpression").bases("Expression", "Pattern").build("expression").field("expression", def("Expression"));
    [
        "TSAnyKeyword",
        "TSBigIntKeyword",
        "TSBooleanKeyword",
        "TSNeverKeyword",
        "TSNullKeyword",
        "TSNumberKeyword",
        "TSObjectKeyword",
        "TSStringKeyword",
        "TSSymbolKeyword",
        "TSUndefinedKeyword",
        "TSUnknownKeyword",
        "TSVoidKeyword",
        "TSThisType"
    ].forEach(function(keywordType) {
        def(keywordType).bases("TSType").build();
    });
    def("TSArrayType").bases("TSType").build("elementType").field("elementType", def("TSType"));
    def("TSLiteralType").bases("TSType").build("literal").field("literal", or(def("NumericLiteral"), def("StringLiteral"), def("BooleanLiteral"), def("TemplateLiteral"), def("UnaryExpression")));
    [
        "TSUnionType",
        "TSIntersectionType"
    ].forEach(function(typeName) {
        def(typeName).bases("TSType").build("types").field("types", [
            def("TSType")
        ]);
    });
    def("TSConditionalType").bases("TSType").build("checkType", "extendsType", "trueType", "falseType").field("checkType", def("TSType")).field("extendsType", def("TSType")).field("trueType", def("TSType")).field("falseType", def("TSType"));
    def("TSInferType").bases("TSType").build("typeParameter").field("typeParameter", def("TSTypeParameter"));
    def("TSParenthesizedType").bases("TSType").build("typeAnnotation").field("typeAnnotation", def("TSType"));
    var ParametersType = [
        or(def("Identifier"), def("RestElement"), def("ArrayPattern"), def("ObjectPattern"))
    ];
    [
        "TSFunctionType",
        "TSConstructorType"
    ].forEach(function(typeName) {
        def(typeName).bases("TSType", "TSHasOptionalTypeParameters", "TSHasOptionalTypeAnnotation").build("parameters").field("parameters", ParametersType);
    });
    def("TSDeclareFunction").bases("Declaration", "TSHasOptionalTypeParameters").build("id", "params", "returnType").field("declare", Boolean, defaults["false"]).field("async", Boolean, defaults["false"]).field("generator", Boolean, defaults["false"]).field("id", or(def("Identifier"), null), defaults["null"]).field("params", [
        def("Pattern")
    ])// tSFunctionTypeAnnotationCommon
    .field("returnType", or(def("TSTypeAnnotation"), def("Noop"), null), defaults["null"]);
    def("TSDeclareMethod").bases("Declaration", "TSHasOptionalTypeParameters").build("key", "params", "returnType").field("async", Boolean, defaults["false"]).field("generator", Boolean, defaults["false"]).field("params", [
        def("Pattern")
    ])// classMethodOrPropertyCommon
    .field("abstract", Boolean, defaults["false"]).field("accessibility", or("public", "private", "protected", void 0), defaults["undefined"]).field("static", Boolean, defaults["false"]).field("computed", Boolean, defaults["false"]).field("optional", Boolean, defaults["false"]).field("key", or(def("Identifier"), def("StringLiteral"), def("NumericLiteral"), // Only allowed if .computed is true.
    def("Expression")))// classMethodOrDeclareMethodCommon
    .field("kind", or("get", "set", "method", "constructor"), function getDefault() {
        return "method";
    }).field("access", or("public", "private", "protected", void 0), defaults["undefined"]).field("decorators", or([
        def("Decorator")
    ], null), defaults["null"])// tSFunctionTypeAnnotationCommon
    .field("returnType", or(def("TSTypeAnnotation"), def("Noop"), null), defaults["null"]);
    def("TSMappedType").bases("TSType").build("typeParameter", "typeAnnotation").field("readonly", or(Boolean, "+", "-"), defaults["false"]).field("typeParameter", def("TSTypeParameter")).field("optional", or(Boolean, "+", "-"), defaults["false"]).field("typeAnnotation", or(def("TSType"), null), defaults["null"]);
    def("TSTupleType").bases("TSType").build("elementTypes").field("elementTypes", [
        or(def("TSType"), def("TSNamedTupleMember"))
    ]);
    def("TSNamedTupleMember").bases("TSType").build("label", "elementType", "optional").field("label", def("Identifier")).field("optional", Boolean, defaults["false"]).field("elementType", def("TSType"));
    def("TSRestType").bases("TSType").build("typeAnnotation").field("typeAnnotation", def("TSType"));
    def("TSOptionalType").bases("TSType").build("typeAnnotation").field("typeAnnotation", def("TSType"));
    def("TSIndexedAccessType").bases("TSType").build("objectType", "indexType").field("objectType", def("TSType")).field("indexType", def("TSType"));
    def("TSTypeOperator").bases("TSType").build("operator").field("operator", String).field("typeAnnotation", def("TSType"));
    def("TSTypeAnnotation").bases("Node").build("typeAnnotation").field("typeAnnotation", or(def("TSType"), def("TSTypeAnnotation")));
    def("TSIndexSignature").bases("Declaration", "TSHasOptionalTypeAnnotation").build("parameters", "typeAnnotation").field("parameters", [
        def("Identifier")
    ]) // Length === 1
    .field("readonly", Boolean, defaults["false"]);
    def("TSPropertySignature").bases("Declaration", "TSHasOptionalTypeAnnotation").build("key", "typeAnnotation", "optional").field("key", def("Expression")).field("computed", Boolean, defaults["false"]).field("readonly", Boolean, defaults["false"]).field("optional", Boolean, defaults["false"]).field("initializer", or(def("Expression"), null), defaults["null"]);
    def("TSMethodSignature").bases("Declaration", "TSHasOptionalTypeParameters", "TSHasOptionalTypeAnnotation").build("key", "parameters", "typeAnnotation").field("key", def("Expression")).field("computed", Boolean, defaults["false"]).field("optional", Boolean, defaults["false"]).field("parameters", ParametersType);
    def("TSTypePredicate").bases("TSTypeAnnotation", "TSType").build("parameterName", "typeAnnotation", "asserts").field("parameterName", or(def("Identifier"), def("TSThisType"))).field("typeAnnotation", or(def("TSTypeAnnotation"), null), defaults["null"]).field("asserts", Boolean, defaults["false"]);
    [
        "TSCallSignatureDeclaration",
        "TSConstructSignatureDeclaration"
    ].forEach(function(typeName) {
        def(typeName).bases("Declaration", "TSHasOptionalTypeParameters", "TSHasOptionalTypeAnnotation").build("parameters", "typeAnnotation").field("parameters", ParametersType);
    });
    def("TSEnumMember").bases("Node").build("id", "initializer").field("id", or(def("Identifier"), StringLiteral)).field("initializer", or(def("Expression"), null), defaults["null"]);
    def("TSTypeQuery").bases("TSType").build("exprName").field("exprName", or(TSEntityName, def("TSImportType")));
    // Inferred from Babylon's tsParseTypeMember method.
    var TSTypeMember = or(def("TSCallSignatureDeclaration"), def("TSConstructSignatureDeclaration"), def("TSIndexSignature"), def("TSMethodSignature"), def("TSPropertySignature"));
    def("TSTypeLiteral").bases("TSType").build("members").field("members", [
        TSTypeMember
    ]);
    def("TSTypeParameter").bases("Identifier").build("name", "constraint", "default").field("name", String).field("constraint", or(def("TSType"), void 0), defaults["undefined"]).field("default", or(def("TSType"), void 0), defaults["undefined"]);
    def("TSTypeAssertion").bases("Expression", "Pattern").build("typeAnnotation", "expression").field("typeAnnotation", def("TSType")).field("expression", def("Expression")).field("extra", or({
        parenthesized: Boolean
    }, null), defaults["null"]);
    def("TSTypeParameterDeclaration").bases("Declaration").build("params").field("params", [
        def("TSTypeParameter")
    ]);
    def("TSTypeParameterInstantiation").bases("Node").build("params").field("params", [
        def("TSType")
    ]);
    def("TSEnumDeclaration").bases("Declaration").build("id", "members").field("id", def("Identifier")).field("const", Boolean, defaults["false"]).field("declare", Boolean, defaults["false"]).field("members", [
        def("TSEnumMember")
    ]).field("initializer", or(def("Expression"), null), defaults["null"]);
    def("TSTypeAliasDeclaration").bases("Declaration", "TSHasOptionalTypeParameters").build("id", "typeAnnotation").field("id", def("Identifier")).field("declare", Boolean, defaults["false"]).field("typeAnnotation", def("TSType"));
    def("TSModuleBlock").bases("Node").build("body").field("body", [
        def("Statement")
    ]);
    def("TSModuleDeclaration").bases("Declaration").build("id", "body").field("id", or(StringLiteral, TSEntityName)).field("declare", Boolean, defaults["false"]).field("global", Boolean, defaults["false"]).field("body", or(def("TSModuleBlock"), def("TSModuleDeclaration"), null), defaults["null"]);
    def("TSImportType").bases("TSType", "TSHasOptionalTypeParameterInstantiation").build("argument", "qualifier", "typeParameters").field("argument", StringLiteral).field("qualifier", or(TSEntityName, void 0), defaults["undefined"]);
    def("TSImportEqualsDeclaration").bases("Declaration").build("id", "moduleReference").field("id", def("Identifier")).field("isExport", Boolean, defaults["false"]).field("moduleReference", or(TSEntityName, def("TSExternalModuleReference")));
    def("TSExternalModuleReference").bases("Declaration").build("expression").field("expression", StringLiteral);
    def("TSExportAssignment").bases("Statement").build("expression").field("expression", def("Expression"));
    def("TSNamespaceExportDeclaration").bases("Declaration").build("id").field("id", def("Identifier"));
    def("TSInterfaceBody").bases("Node").build("body").field("body", [
        TSTypeMember
    ]);
    def("TSExpressionWithTypeArguments").bases("TSType", "TSHasOptionalTypeParameterInstantiation").build("expression", "typeParameters").field("expression", TSEntityName);
    def("TSInterfaceDeclaration").bases("Declaration", "TSHasOptionalTypeParameters").build("id", "body").field("id", TSEntityName).field("declare", Boolean, defaults["false"]).field("extends", or([
        def("TSExpressionWithTypeArguments")
    ], null), defaults["null"]).field("body", def("TSInterfaceBody"));
    def("TSParameterProperty").bases("Pattern").build("parameter").field("accessibility", or("public", "private", "protected", void 0), defaults["undefined"]).field("readonly", Boolean, defaults["false"]).field("parameter", or(def("Identifier"), def("AssignmentPattern")));
    def("ClassProperty").field("access", or("public", "private", "protected", void 0), defaults["undefined"]);
    // Defined already in es6 and babel-core.
    def("ClassBody").field("body", [
        or(def("MethodDefinition"), def("VariableDeclarator"), def("ClassPropertyDefinition"), def("ClassProperty"), def("ClassPrivateProperty"), def("ClassMethod"), def("ClassPrivateMethod"), // Just need to add these types:
        def("TSDeclareMethod"), TSTypeMember)
    ]);
}
exports.default = default_1;
module.exports = exports["default"];

},{"1d043666b49345a4":"ao9yO","4b1717cde8f6c423":"77moI","b615f963851a4bdd":"as00b","99dc2096982b64d9":"jL4It","25e9e520e2ed15a1":"cIgjo"}],"ffVka":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
var tslib_1 = require("d6f2545b19e5b0b");
var types_1 = tslib_1.__importDefault(require("cceb3cbf21287364"));
var shared_1 = tslib_1.__importDefault(require("7c93abe19c1b5cc0"));
var core_1 = tslib_1.__importDefault(require("7e4841104b7296f5"));
function default_1(fork) {
    fork.use(core_1.default);
    var types = fork.use(types_1.default);
    var Type = types.Type;
    var def = types.Type.def;
    var or = Type.or;
    var shared = fork.use(shared_1.default);
    var defaults = shared.defaults;
    // https://github.com/tc39/proposal-optional-chaining
    // `a?.b` as per https://github.com/estree/estree/issues/146
    def("OptionalMemberExpression").bases("MemberExpression").build("object", "property", "computed", "optional").field("optional", Boolean, defaults["true"]);
    // a?.b()
    def("OptionalCallExpression").bases("CallExpression").build("callee", "arguments", "optional").field("optional", Boolean, defaults["true"]);
    // https://github.com/tc39/proposal-nullish-coalescing
    // `a ?? b` as per https://github.com/babel/babylon/pull/761/files
    var LogicalOperator = or("||", "&&", "??");
    def("LogicalExpression").field("operator", LogicalOperator);
}
exports.default = default_1;
module.exports = exports["default"];

},{"d6f2545b19e5b0b":"ao9yO","cceb3cbf21287364":"jL4It","7c93abe19c1b5cc0":"cIgjo","7e4841104b7296f5":"j3uvl"}],"99uyq":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.namedTypes = void 0;
var namedTypes;
namedTypes = exports.namedTypes || (exports.namedTypes = {});

},{}],"kcNbE":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.compile = void 0;
const util_1 = require("b63459da0d1c7b26");
const degenerator_1 = require("f54431851f44cc01");
function compile(qjs, code, returnName, options = {}) {
    const compiled = (0, degenerator_1.degenerator)(code, options.names ?? []);
    const vm = qjs.newContext();
    // Add functions to global
    if (options.sandbox) for (const [name, value] of Object.entries(options.sandbox)){
        if (typeof value !== 'function') throw new Error(`Expected a "function" for sandbox property \`${name}\`, but got "${typeof value}"`);
        const fnHandle = vm.newFunction(name, (...args)=>{
            const result = value(...args.map((arg)=>quickJSHandleToHost(vm, arg)));
            vm.runtime.executePendingJobs();
            return hostToQuickJSHandle(vm, result);
        });
        fnHandle.consume((handle)=>vm.setProp(vm.global, name, handle));
    }
    const fnResult = vm.evalCode(`${compiled};${returnName}`, options.filename);
    const fn = vm.unwrapResult(fnResult);
    const t = vm.typeof(fn);
    if (t !== 'function') throw new Error(`Expected a "function" named \`${returnName}\` to be defined, but got "${t}"`);
    const r = async function(...args) {
        let promiseHandle;
        let resolvedHandle;
        try {
            const result = vm.callFunction(fn, vm.undefined, ...args.map((arg)=>hostToQuickJSHandle(vm, arg)));
            promiseHandle = vm.unwrapResult(result);
            const resolvedResultP = vm.resolvePromise(promiseHandle);
            vm.runtime.executePendingJobs();
            const resolvedResult = await resolvedResultP;
            resolvedHandle = vm.unwrapResult(resolvedResult);
            return quickJSHandleToHost(vm, resolvedHandle);
        } catch (err) {
            if (err && typeof err === 'object' && 'cause' in err && err.cause) {
                if (typeof err.cause === 'object' && 'stack' in err.cause && 'name' in err.cause && 'message' in err.cause && typeof err.cause.stack === 'string' && typeof err.cause.name === 'string' && typeof err.cause.message === 'string') // QuickJS Error `stack` does not include the name +
                // message, so patch those in to behave more like V8
                err.cause.stack = `${err.cause.name}: ${err.cause.message}\n${err.cause.stack}`;
                throw err.cause;
            }
            throw err;
        } finally{
            promiseHandle?.dispose();
            resolvedHandle?.dispose();
        }
    };
    Object.defineProperty(r, 'toString', {
        value: ()=>compiled,
        enumerable: false
    });
    return r;
}
exports.compile = compile;
function quickJSHandleToHost(vm, val) {
    return vm.dump(val);
}
function hostToQuickJSHandle(vm, val) {
    if (typeof val === 'undefined') return vm.undefined;
    else if (val === null) return vm.null;
    else if (typeof val === 'string') return vm.newString(val);
    else if (typeof val === 'number') return vm.newNumber(val);
    else if (typeof val === 'bigint') return vm.newBigInt(val);
    else if (typeof val === 'boolean') return val ? vm.true : vm.false;
    else if (util_1.types.isPromise(val)) {
        const promise = vm.newPromise();
        promise.settled.then(vm.runtime.executePendingJobs);
        val.then((r)=>{
            promise.resolve(hostToQuickJSHandle(vm, r));
        }, (err)=>{
            promise.reject(hostToQuickJSHandle(vm, err));
        });
        return promise.handle;
    } else if (util_1.types.isNativeError(val)) return vm.newError(val);
    throw new Error(`Unsupported value: ${val}`);
}

},{"b63459da0d1c7b26":"util","f54431851f44cc01":"hZ2cD"}],"8LEOS":[function(require,module,exports,__globalThis) {
"use strict";
/**
 * If only a single value is specified (from each category: day, month, year), the
 * function returns a true value only on days that match that specification. If
 * both values are specified, the result is true between those times, including
 * bounds.
 *
 * Even though the examples don't show, the "GMT" parameter can be specified
 * in any of the 9 different call profiles, always as the last parameter.
 *
 * Examples:
 *
 * ``` js
 * dateRange(1)
 * true on the first day of each month, local timezone.
 *
 * dateRange(1, "GMT")
 * true on the first day of each month, GMT timezone.
 *
 * dateRange(1, 15)
 * true on the first half of each month.
 *
 * dateRange(24, "DEC")
 * true on 24th of December each year.
 *
 * dateRange(24, "DEC", 1995)
 * true on 24th of December, 1995.
 *
 * dateRange("JAN", "MAR")
 * true on the first quarter of the year.
 *
 * dateRange(1, "JUN", 15, "AUG")
 * true from June 1st until August 15th, each year (including June 1st and August
 * 15th).
 *
 * dateRange(1, "JUN", 15, 1995, "AUG", 1995)
 * true from June 1st, 1995, until August 15th, same year.
 *
 * dateRange("OCT", 1995, "MAR", 1996)
 * true from October 1995 until March 1996 (including the entire month of October
 * 1995 and March 1996).
 *
 * dateRange(1995)
 * true during the entire year 1995.
 *
 * dateRange(1995, 1997)
 * true from beginning of year 1995 until the end of year 1997.
 * ```
 *
 * dateRange(day)
 * dateRange(day1, day2)
 * dateRange(mon)
 * dateRange(month1, month2)
 * dateRange(year)
 * dateRange(year1, year2)
 * dateRange(day1, month1, day2, month2)
 * dateRange(month1, year1, month2, year2)
 * dateRange(day1, month1, year1, day2, month2, year2)
 * dateRange(day1, month1, year1, day2, month2, year2, gmt)
 *
 * @param {String} day is the day of month between 1 and 31 (as an integer).
 * @param {String} month is one of the month strings: JAN FEB MAR APR MAY JUN JUL AUG SEP OCT NOV DEC
 * @param {String} year is the full year number, for example 1995 (but not 95). Integer.
 * @param {String} gmt is either the string "GMT", which makes time comparison occur in GMT timezone; if left unspecified, times are taken to be in the local timezone.
 * @return {Boolean}
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
function dateRange() {
    // TODO: implement me!
    return false;
}
exports.default = dateRange;

},{}],"hTMlB":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * Returns true iff the domain of hostname matches.
 *
 * Examples:
 *
 * ``` js
 * dnsDomainIs("www.netscape.com", ".netscape.com")
 *   // is true.
 *
 * dnsDomainIs("www", ".netscape.com")
 *   // is false.
 *
 * dnsDomainIs("www.mcom.com", ".netscape.com")
 *   // is false.
 * ```
 *
 *
 * @param {String} host is the hostname from the URL.
 * @param {String} domain is the domain name to test the hostname against.
 * @return {Boolean} true iff the domain of the hostname matches.
 */ function dnsDomainIs(host, domain) {
    host = String(host);
    domain = String(domain);
    return host.substr(domain.length * -1) === domain;
}
exports.default = dnsDomainIs;

},{}],"bIWrF":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * Returns the number (integer) of DNS domain levels (number of dots) in the
 * hostname.
 *
 * Examples:
 *
 * ``` js
 * dnsDomainLevels("www")
 *   // returns 0.
 * dnsDomainLevels("www.netscape.com")
 *   // returns 2.
 * ```
 *
 * @param {String} host is the hostname from the URL.
 * @return {Number} number of domain levels
 */ function dnsDomainLevels(host) {
    const match = String(host).match(/\./g);
    let levels = 0;
    if (match) levels = match.length;
    return levels;
}
exports.default = dnsDomainLevels;

},{}],"8cfGT":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const util_1 = require("2b90515e56f5665f");
/**
 * Resolves the given DNS hostname into an IP address, and returns it in the dot
 * separated format as a string.
 *
 * Example:
 *
 * ``` js
 * dnsResolve("home.netscape.com")
 *   // returns the string "198.95.249.79".
 * ```
 *
 * @param {String} host hostname to resolve
 * @return {String} resolved IP address
 */ async function dnsResolve(host) {
    const family = 4;
    try {
        const r = await (0, util_1.dnsLookup)(host, {
            family
        });
        if (typeof r === 'string') return r;
    } catch (err) {
    // @ignore
    }
    return null;
}
exports.default = dnsResolve;

},{"2b90515e56f5665f":"65onw"}],"65onw":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isGMT = exports.dnsLookup = void 0;
const dns_1 = require("6452ca69f0e6d06f");
function dnsLookup(host, opts) {
    return new Promise((resolve, reject)=>{
        (0, dns_1.lookup)(host, opts, (err, res)=>{
            if (err) reject(err);
            else resolve(res);
        });
    });
}
exports.dnsLookup = dnsLookup;
function isGMT(v) {
    return v === 'GMT';
}
exports.isGMT = isGMT;

},{"6452ca69f0e6d06f":"dns"}],"7M0oN":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const netmask_1 = require("1631f66ec913728f");
const util_1 = require("dea43c9b3fc3ab70");
/**
 * True iff the IP address of the host matches the specified IP address pattern.
 *
 * Pattern and mask specification is done the same way as for SOCKS configuration.
 *
 * Examples:
 *
 * ``` js
 * isInNet(host, "198.95.249.79", "255.255.255.255")
 *   // is true iff the IP address of host matches exactly 198.95.249.79.
 *
 * isInNet(host, "198.95.0.0", "255.255.0.0")
 *   // is true iff the IP address of the host matches 198.95.*.*.
 * ```
 *
 * @param {String} host a DNS hostname, or IP address. If a hostname is passed,
 *   it will be resoved into an IP address by this function.
 * @param {String} pattern an IP address pattern in the dot-separated format mask.
 * @param {String} mask for the IP address pattern informing which parts of the
 *   IP address should be matched against. 0 means ignore, 255 means match.
 * @return {Boolean}
 */ async function isInNet(host, pattern, mask) {
    const family = 4;
    try {
        const ip = await (0, util_1.dnsLookup)(host, {
            family
        });
        if (typeof ip === 'string') {
            const netmask = new netmask_1.Netmask(pattern, mask);
            return netmask.contains(ip);
        }
    } catch (err) {
    // ignore
    }
    return false;
}
exports.default = isInNet;

},{"1631f66ec913728f":"1E6dh","dea43c9b3fc3ab70":"65onw"}],"1E6dh":[function(require,module,exports,__globalThis) {
// Generated by CoffeeScript 1.12.7
(function() {
    var Netmask, atob, chr, chr0, chrA, chra, ip2long, long2ip;
    long2ip = function(long) {
        var a, b, c, d;
        a = (long & -16777216) >>> 24;
        b = (long & 16711680) >>> 16;
        c = (long & 65280) >>> 8;
        d = long & 0xff;
        return [
            a,
            b,
            c,
            d
        ].join('.');
    };
    ip2long = function(ip) {
        var b, c, i, j, n, ref;
        b = [];
        for(i = j = 0; j <= 3; i = ++j){
            if (ip.length === 0) break;
            if (i > 0) {
                if (ip[0] !== '.') throw new Error('Invalid IP');
                ip = ip.substring(1);
            }
            ref = atob(ip), n = ref[0], c = ref[1];
            ip = ip.substring(c);
            b.push(n);
        }
        if (ip.length !== 0) throw new Error('Invalid IP');
        switch(b.length){
            case 1:
                if (b[0] > 0xFFFFFFFF) throw new Error('Invalid IP');
                return b[0] >>> 0;
            case 2:
                if (b[0] > 0xFF || b[1] > 0xFFFFFF) throw new Error('Invalid IP');
                return (b[0] << 24 | b[1]) >>> 0;
            case 3:
                if (b[0] > 0xFF || b[1] > 0xFF || b[2] > 0xFFFF) throw new Error('Invalid IP');
                return (b[0] << 24 | b[1] << 16 | b[2]) >>> 0;
            case 4:
                if (b[0] > 0xFF || b[1] > 0xFF || b[2] > 0xFF || b[3] > 0xFF) throw new Error('Invalid IP');
                return (b[0] << 24 | b[1] << 16 | b[2] << 8 | b[3]) >>> 0;
            default:
                throw new Error('Invalid IP');
        }
    };
    chr = function(b) {
        return b.charCodeAt(0);
    };
    chr0 = chr('0');
    chra = chr('a');
    chrA = chr('A');
    atob = function(s) {
        var base, dmax, i, n, start;
        n = 0;
        base = 10;
        dmax = '9';
        i = 0;
        if (s.length > 1 && s[i] === '0') {
            if (s[i + 1] === 'x' || s[i + 1] === 'X') {
                i += 2;
                base = 16;
            } else if ('0' <= s[i + 1] && s[i + 1] <= '9') {
                i++;
                base = 8;
                dmax = '7';
            }
        }
        start = i;
        while(i < s.length){
            if ('0' <= s[i] && s[i] <= dmax) n = n * base + (chr(s[i]) - chr0) >>> 0;
            else if (base === 16) {
                if ('a' <= s[i] && s[i] <= 'f') n = n * base + (10 + chr(s[i]) - chra) >>> 0;
                else if ('A' <= s[i] && s[i] <= 'F') n = n * base + (10 + chr(s[i]) - chrA) >>> 0;
                else break;
            } else break;
            if (n > 0xFFFFFFFF) throw new Error('too large');
            i++;
        }
        if (i === start) throw new Error('empty octet');
        return [
            n,
            i
        ];
    };
    Netmask = function() {
        function Netmask(net, mask) {
            var error, i, j, ref;
            if (typeof net !== 'string') throw new Error("Missing `net' parameter");
            if (!mask) ref = net.split('/', 2), net = ref[0], mask = ref[1];
            if (!mask) mask = 32;
            if (typeof mask === 'string' && mask.indexOf('.') > -1) {
                try {
                    this.maskLong = ip2long(mask);
                } catch (error1) {
                    error = error1;
                    throw new Error("Invalid mask: " + mask);
                }
                for(i = j = 32; j >= 0; i = --j)if (this.maskLong === 0xffffffff << 32 - i >>> 0) {
                    this.bitmask = i;
                    break;
                }
            } else if (mask || mask === 0) {
                this.bitmask = parseInt(mask, 10);
                this.maskLong = 0;
                if (this.bitmask > 0) this.maskLong = 0xffffffff << 32 - this.bitmask >>> 0;
            } else throw new Error("Invalid mask: empty");
            try {
                this.netLong = (ip2long(net) & this.maskLong) >>> 0;
            } catch (error1) {
                error = error1;
                throw new Error("Invalid net address: " + net);
            }
            if (!(this.bitmask <= 32)) throw new Error("Invalid mask for ip4: " + mask);
            this.size = Math.pow(2, 32 - this.bitmask);
            this.base = long2ip(this.netLong);
            this.mask = long2ip(this.maskLong);
            this.hostmask = long2ip(~this.maskLong);
            this.first = this.bitmask <= 30 ? long2ip(this.netLong + 1) : this.base;
            this.last = this.bitmask <= 30 ? long2ip(this.netLong + this.size - 2) : long2ip(this.netLong + this.size - 1);
            this.broadcast = this.bitmask <= 30 ? long2ip(this.netLong + this.size - 1) : void 0;
        }
        Netmask.prototype.contains = function(ip) {
            if (typeof ip === 'string' && (ip.indexOf('/') > 0 || ip.split('.').length !== 4)) ip = new Netmask(ip);
            if (ip instanceof Netmask) return this.contains(ip.base) && this.contains(ip.broadcast || ip.last);
            else return (ip2long(ip) & this.maskLong) >>> 0 === (this.netLong & this.maskLong) >>> 0;
        };
        Netmask.prototype.next = function(count) {
            if (count == null) count = 1;
            return new Netmask(long2ip(this.netLong + this.size * count), this.mask);
        };
        Netmask.prototype.forEach = function(fn) {
            var index, lastLong, long;
            long = ip2long(this.first);
            lastLong = ip2long(this.last);
            index = 0;
            while(long <= lastLong){
                fn(long2ip(long), long, index);
                index++;
                long++;
            }
        };
        Netmask.prototype.toString = function() {
            return this.base + "/" + this.bitmask;
        };
        return Netmask;
    }();
    exports.ip2long = ip2long;
    exports.long2ip = long2ip;
    exports.Netmask = Netmask;
}).call(this);

},{}],"dvkMq":[function(require,module,exports,__globalThis) {
"use strict";
/**
 * True iff there is no domain name in the hostname (no dots).
 *
 * Examples:
 *
 * ``` js
 * isPlainHostName("www")
 *   // is true.
 *
 * isPlainHostName("www.netscape.com")
 *   // is false.
 * ```
 *
 * @param {String} host The hostname from the URL (excluding port number).
 * @return {Boolean}
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
function isPlainHostName(host) {
    return !/\./.test(host);
}
exports.default = isPlainHostName;

},{}],"29Lk5":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const util_1 = require("c1062579846e8904");
/**
 * Tries to resolve the hostname. Returns true if succeeds.
 *
 * @param {String} host is the hostname from the URL.
 * @return {Boolean}
 */ async function isResolvable(host) {
    const family = 4;
    try {
        if (await (0, util_1.dnsLookup)(host, {
            family
        })) return true;
    } catch (err) {
    // ignore
    }
    return false;
}
exports.default = isResolvable;

},{"c1062579846e8904":"65onw"}],"cMyLF":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * Is true if the hostname matches exactly the specified hostname, or if there is
 * no domain name part in the hostname, but the unqualified hostname matches.
 *
 * Examples:
 *
 * ``` js
 * localHostOrDomainIs("www.netscape.com", "www.netscape.com")
 *   // is true (exact match).
 *
 * localHostOrDomainIs("www", "www.netscape.com")
 *   // is true (hostname match, domain not specified).
 *
 * localHostOrDomainIs("www.mcom.com", "www.netscape.com")
 *   // is false (domain name mismatch).
 *
 * localHostOrDomainIs("home.netscape.com", "www.netscape.com")
 *   // is false (hostname mismatch).
 * ```
 *
 * @param {String} host the hostname from the URL.
 * @param {String} hostdom fully qualified hostname to match against.
 * @return {Boolean}
 */ function localHostOrDomainIs(host, hostdom) {
    const parts = host.split('.');
    const domparts = hostdom.split('.');
    let matches = true;
    for(let i = 0; i < parts.length; i++)if (parts[i] !== domparts[i]) {
        matches = false;
        break;
    }
    return matches;
}
exports.default = localHostOrDomainIs;

},{}],"jwZ0B":[function(require,module,exports,__globalThis) {
"use strict";
var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        "default": mod
    };
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
const ip_1 = require("f4645cc70b65b31d");
const net_1 = __importDefault(require("56aa18fb036d6ff7"));
/**
 * Returns the IP address of the host that the Navigator is running on, as
 * a string in the dot-separated integer format.
 *
 * Example:
 *
 * ``` js
 * myIpAddress()
 *   // would return the string "198.95.249.79" if you were running the
 *   // Navigator on that host.
 * ```
 *
 * @return {String} external IP address
 */ async function myIpAddress() {
    return new Promise((resolve, reject)=>{
        // 8.8.8.8:53 is "Google Public DNS":
        // https://developers.google.com/speed/public-dns/
        const socket = net_1.default.connect({
            host: '8.8.8.8',
            port: 53
        });
        const onError = ()=>{
            // if we fail to access Google DNS (as in firewall blocks access),
            // fallback to querying IP locally
            resolve(ip_1.ip.address());
        };
        socket.once('error', onError);
        socket.once('connect', ()=>{
            socket.removeListener('error', onError);
            const addr = socket.address();
            socket.destroy();
            if (typeof addr === 'string') resolve(addr);
            else if (addr.address) resolve(addr.address);
            else reject(new Error('Expected a `string`'));
        });
    });
}
exports.default = myIpAddress;

},{"f4645cc70b65b31d":"2PWha","56aa18fb036d6ff7":"net"}],"2PWha":[function(require,module,exports,__globalThis) {
"use strict";
var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        "default": mod
    };
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ip = void 0;
const os_1 = __importDefault(require("77a9ac28a9c22e84"));
exports.ip = {
    address () {
        const interfaces = os_1.default.networkInterfaces();
        // Default to `ipv4`
        const family = normalizeFamily();
        const all = Object.values(interfaces).map((addrs = [])=>{
            const addresses = addrs.filter((details)=>{
                const detailsFamily = normalizeFamily(details.family);
                if (detailsFamily !== family || exports.ip.isLoopback(details.address)) return false;
                return true;
            });
            return addresses.length ? addresses[0].address : undefined;
        }).filter(Boolean);
        return !all.length ? exports.ip.loopback(family) : all[0];
    },
    isLoopback (addr) {
        return /^(::f{4}:)?127\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})/.test(addr) || /^fe80::1$/.test(addr) || /^::1$/.test(addr) || /^::$/.test(addr);
    },
    loopback (family) {
        // Default to `ipv4`
        family = normalizeFamily(family);
        if (family !== 'ipv4' && family !== 'ipv6') throw new Error('family must be ipv4 or ipv6');
        return family === 'ipv4' ? '127.0.0.1' : 'fe80::1';
    }
};
function normalizeFamily(family) {
    if (family === 4) return 'ipv4';
    if (family === 6) return 'ipv6';
    return family ? family.toLowerCase() : 'ipv4';
}

},{"77a9ac28a9c22e84":"os"}],"bY2AC":[function(require,module,exports,__globalThis) {
"use strict";
/**
 * Returns true if the string matches the specified shell
 * expression.
 *
 * Actually, currently the patterns are shell expressions,
 * not regular expressions.
 *
 * Examples:
 *
 * ``` js
 * shExpMatch("http://home.netscape.com/people/ari/index.html", "*\/ari/*")
 *   // is true.
 *
 * shExpMatch("http://home.netscape.com/people/montulli/index.html", "*\/ari/*")
 *   // is false.
 * ```
 *
 * @param {String} str is any string to compare (e.g. the URL, or the hostname).
 * @param {String} shexp is a shell expression to compare against.
 * @return {Boolean} true if the string matches the shell expression.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
function shExpMatch(str, shexp) {
    const re = toRegExp(shexp);
    return re.test(str);
}
exports.default = shExpMatch;
/**
 * Converts a "shell expression" to a JavaScript RegExp.
 *
 * @api private
 */ function toRegExp(str) {
    str = String(str).replace(/\./g, '\\.').replace(/\?/g, '.').replace(/\*/g, '.*');
    return new RegExp(`^${str}$`);
}

},{}],"gK1y9":[function(require,module,exports,__globalThis) {
"use strict";
/**
 * True during (or between) the specified time(s).
 *
 * Even though the examples don't show it, this parameter may be present in
 * each of the different parameter profiles, always as the last parameter.
 *
 *
 * Examples:
 *
 * ``` js
 * timerange(12)
 * true from noon to 1pm.
 *
 * timerange(12, 13)
 * same as above.
 *
 * timerange(12, "GMT")
 * true from noon to 1pm, in GMT timezone.
 *
 * timerange(9, 17)
 * true from 9am to 5pm.
 *
 * timerange(8, 30, 17, 00)
 * true from 8:30am to 5:00pm.
 *
 * timerange(0, 0, 0, 0, 0, 30)
 * true between midnight and 30 seconds past midnight.
 * ```
 *
 * timeRange(hour)
 * timeRange(hour1, hour2)
 * timeRange(hour1, min1, hour2, min2)
 * timeRange(hour1, min1, sec1, hour2, min2, sec2)
 * timeRange(hour1, min1, sec1, hour2, min2, sec2, gmt)
 *
 * @param {String} hour is the hour from 0 to 23. (0 is midnight, 23 is 11 pm.)
 * @param {String} min minutes from 0 to 59.
 * @param {String} sec seconds from 0 to 59.
 * @param {String} gmt either the string "GMT" for GMT timezone, or not specified, for local timezone.
 * @return {Boolean}
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
function timeRange() {
    // eslint-disable-next-line prefer-rest-params
    const args = Array.prototype.slice.call(arguments);
    const lastArg = args.pop();
    const useGMTzone = lastArg === 'GMT';
    const currentDate = new Date();
    if (!useGMTzone) args.push(lastArg);
    let result = false;
    const noOfArgs = args.length;
    const numericArgs = args.map((n)=>parseInt(n, 10));
    // timeRange(hour)
    if (noOfArgs === 1) result = getCurrentHour(useGMTzone, currentDate) === numericArgs[0];
    else if (noOfArgs === 2) {
        const currentHour = getCurrentHour(useGMTzone, currentDate);
        result = numericArgs[0] <= currentHour && currentHour < numericArgs[1];
    // timeRange(hour1, min1, hour2, min2)
    } else if (noOfArgs === 4) result = valueInRange(secondsElapsedToday(numericArgs[0], numericArgs[1], 0), secondsElapsedToday(getCurrentHour(useGMTzone, currentDate), getCurrentMinute(useGMTzone, currentDate), 0), secondsElapsedToday(numericArgs[2], numericArgs[3], 59));
    else if (noOfArgs === 6) result = valueInRange(secondsElapsedToday(numericArgs[0], numericArgs[1], numericArgs[2]), secondsElapsedToday(getCurrentHour(useGMTzone, currentDate), getCurrentMinute(useGMTzone, currentDate), getCurrentSecond(useGMTzone, currentDate)), secondsElapsedToday(numericArgs[3], numericArgs[4], numericArgs[5]));
    return result;
}
exports.default = timeRange;
function secondsElapsedToday(hh, mm, ss) {
    return hh * 3600 + mm * 60 + ss;
}
function getCurrentHour(gmt, currentDate) {
    return gmt ? currentDate.getUTCHours() : currentDate.getHours();
}
function getCurrentMinute(gmt, currentDate) {
    return gmt ? currentDate.getUTCMinutes() : currentDate.getMinutes();
}
function getCurrentSecond(gmt, currentDate) {
    return gmt ? currentDate.getUTCSeconds() : currentDate.getSeconds();
}
// start <= value <= finish
function valueInRange(start, value, finish) {
    return start <= value && value <= finish;
}

},{}],"iYyHB":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const util_1 = require("ccaf9a8c872bd684");
const weekdays = [
    'SUN',
    'MON',
    'TUE',
    'WED',
    'THU',
    'FRI',
    'SAT'
];
/**
 * Only the first parameter is mandatory. Either the second, the third, or both
 * may be left out.
 *
 * If only one parameter is present, the function yeilds a true value on the
 * weekday that the parameter represents. If the string "GMT" is specified as
 * a second parameter, times are taken to be in GMT, otherwise in local timezone.
 *
 * If both wd1 and wd1 are defined, the condition is true if the current weekday
 * is in between those two weekdays. Bounds are inclusive. If the "GMT" parameter
 * is specified, times are taken to be in GMT, otherwise the local timezone is
 * used.
 *
 * Valid "weekday strings" are:
 *
 *     SUN MON TUE WED THU FRI SAT
 *
 * Examples:
 *
 * ``` js
 * weekdayRange("MON", "FRI")
 * true Monday trhough Friday (local timezone).
 *
 * weekdayRange("MON", "FRI", "GMT")
 * same as above, but GMT timezone.
 *
 * weekdayRange("SAT")
 * true on Saturdays local time.
 *
 * weekdayRange("SAT", "GMT")
 * true on Saturdays GMT time.
 *
 * weekdayRange("FRI", "MON")
 * true Friday through Monday (note, order does matter!).
 * ```
 *
 *
 * @param {String} wd1 one of the weekday strings.
 * @param {String} wd2 one of the weekday strings.
 * @param {String} gmt is either the string: GMT or is left out.
 * @return {Boolean}
 */ function weekdayRange(wd1, wd2, gmt) {
    let useGMTzone = false;
    let wd1Index = -1;
    let wd2Index = -1;
    let wd2IsGmt = false;
    if ((0, util_1.isGMT)(gmt)) useGMTzone = true;
    else if ((0, util_1.isGMT)(wd2)) {
        useGMTzone = true;
        wd2IsGmt = true;
    }
    wd1Index = weekdays.indexOf(wd1);
    if (!wd2IsGmt && isWeekday(wd2)) wd2Index = weekdays.indexOf(wd2);
    const todaysDay = getTodaysDay(useGMTzone);
    let result;
    if (wd2Index < 0) result = todaysDay === wd1Index;
    else if (wd1Index <= wd2Index) result = valueInRange(wd1Index, todaysDay, wd2Index);
    else result = valueInRange(wd1Index, todaysDay, 6) || valueInRange(0, todaysDay, wd2Index);
    return result;
}
exports.default = weekdayRange;
function getTodaysDay(gmt) {
    return gmt ? new Date().getUTCDay() : new Date().getDay();
}
// start <= value <= finish
function valueInRange(start, value, finish) {
    return start <= value && value <= finish;
}
function isWeekday(v) {
    if (!v) return false;
    return weekdays.includes(v);
}

},{"ccaf9a8c872bd684":"65onw"}],"iBLsu":[function(require,module,exports,__globalThis) {
"use strict";
var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
        enumerable: true,
        get: function() {
            return m[k];
        }
    };
    Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", {
        enumerable: true,
        value: v
    });
} : function(o, v) {
    o["default"] = v;
});
var __exportStar = this && this.__exportStar || function(m, exports1) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports1, p)) __createBinding(exports1, m, p);
};
var __importStar = this && this.__importStar || function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) {
        for(var k in mod)if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.shouldInterruptAfterDeadline = exports.newAsyncContext = exports.newAsyncRuntime = exports.getQuickJSSync = exports.getQuickJS = exports.errors = exports.RELEASE_SYNC = exports.RELEASE_ASYNC = exports.DEBUG_SYNC = exports.DEBUG_ASYNC = exports.newQuickJSAsyncWASMModule = exports.newQuickJSWASMModule = void 0;
// Build variants
const variants_1 = require("2b6c82f6681d2b56");
Object.defineProperty(exports, "newQuickJSWASMModule", {
    enumerable: true,
    get: function() {
        return variants_1.newQuickJSWASMModule;
    }
});
Object.defineProperty(exports, "newQuickJSAsyncWASMModule", {
    enumerable: true,
    get: function() {
        return variants_1.newQuickJSAsyncWASMModule;
    }
});
Object.defineProperty(exports, "DEBUG_ASYNC", {
    enumerable: true,
    get: function() {
        return variants_1.DEBUG_ASYNC;
    }
});
Object.defineProperty(exports, "DEBUG_SYNC", {
    enumerable: true,
    get: function() {
        return variants_1.DEBUG_SYNC;
    }
});
Object.defineProperty(exports, "RELEASE_ASYNC", {
    enumerable: true,
    get: function() {
        return variants_1.RELEASE_ASYNC;
    }
});
Object.defineProperty(exports, "RELEASE_SYNC", {
    enumerable: true,
    get: function() {
        return variants_1.RELEASE_SYNC;
    }
});
// Export helpers
__exportStar(require("74744dbbcf439712"), exports);
__exportStar(require("e24a8a4580957f6d"), exports);
/** Collects the informative errors this library may throw. */ exports.errors = __importStar(require("670de8b32a86bb4c"));
__exportStar(require("523492111ef0c472"), exports);
__exportStar(require("4ebf148f597dc5cb"), exports);
let singleton = undefined;
let singletonPromise = undefined;
/**
 * Get a shared singleton {@link QuickJSWASMModule}. Use this to evaluate code
 * or create Javascript environments.
 *
 * This is the top-level entrypoint for the quickjs-emscripten library.
 *
 * If you need strictest possible isolation guarantees, you may create a
 * separate {@link QuickJSWASMModule} via {@link newQuickJSWASMModule}.
 *
 * To work with the asyncified version of this library, see these functions:
 *
 * - {@link newAsyncRuntime}.
 * - {@link newAsyncContext}.
 * - {@link newQuickJSAsyncWASMModule}.
 */ async function getQuickJS() {
    singletonPromise ?? (singletonPromise = (0, variants_1.newQuickJSWASMModule)().then((instance)=>{
        singleton = instance;
        return instance;
    }));
    return await singletonPromise;
}
exports.getQuickJS = getQuickJS;
/**
 * Provides synchronous access to the shared {@link QuickJSWASMModule} instance returned by {@link getQuickJS}, as long as
 * least once.
 * @throws If called before `getQuickJS` resolves.
 */ function getQuickJSSync() {
    if (!singleton) throw new Error("QuickJS not initialized. Await getQuickJS() at least once.");
    return singleton;
}
exports.getQuickJSSync = getQuickJSSync;
/**
 * Create a new [[QuickJSAsyncRuntime]] in a separate WebAssembly module.
 *
 * Each runtime is isolated in a separate WebAssembly module, so that errors in
 * one runtime cannot contaminate another runtime, and each runtime can execute
 * an asynchronous action without conflicts.
 *
 * Note that there is a hard limit on the number of WebAssembly modules in older
 * versions of v8:
 * https://bugs.chromium.org/p/v8/issues/detail?id=12076
 */ async function newAsyncRuntime(options) {
    const module = await (0, variants_1.newQuickJSAsyncWASMModule)();
    return module.newRuntime(options);
}
exports.newAsyncRuntime = newAsyncRuntime;
/**
 * Create a new [[QuickJSAsyncContext]] (with an associated runtime) in an
 * separate WebAssembly module.
 *
 * Each context is isolated in a separate WebAssembly module, so that errors in
 * one runtime cannot contaminate another runtime, and each runtime can execute
 * an asynchronous action without conflicts.
 *
 * Note that there is a hard limit on the number of WebAssembly modules in older
 * versions of v8:
 * https://bugs.chromium.org/p/v8/issues/detail?id=12076
 */ async function newAsyncContext(options) {
    const module = await (0, variants_1.newQuickJSAsyncWASMModule)();
    return module.newContext(options);
}
exports.newAsyncContext = newAsyncContext;
/**
 * Returns an interrupt handler that interrupts Javascript execution after a deadline time.
 *
 * @param deadline - Interrupt execution if it's still running after this time.
 *   Number values are compared against `Date.now()`
 */ function shouldInterruptAfterDeadline(deadline) {
    const deadlineAsNumber = typeof deadline === "number" ? deadline : deadline.getTime();
    return function() {
        return Date.now() > deadlineAsNumber;
    };
}
exports.shouldInterruptAfterDeadline = shouldInterruptAfterDeadline;

},{"2b6c82f6681d2b56":"1OXkf","74744dbbcf439712":"lXcUH","e24a8a4580957f6d":"lGIpe","670de8b32a86bb4c":"7YGVe","523492111ef0c472":"2uHMB","4ebf148f597dc5cb":"mmb5j"}],"1OXkf":[function(require,module,exports,__globalThis) {
"use strict";
var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
        enumerable: true,
        get: function() {
            return m[k];
        }
    };
    Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", {
        enumerable: true,
        value: v
    });
} : function(o, v) {
    o["default"] = v;
});
var __importStar = this && this.__importStar || function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) {
        for(var k in mod)if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.RELEASE_ASYNC = exports.DEBUG_ASYNC = exports.RELEASE_SYNC = exports.DEBUG_SYNC = exports.memoizePromiseFactory = exports.newQuickJSAsyncWASMModule = exports.newQuickJSWASMModule = void 0;
const esmHelpers_1 = require("c5af8b741cb0ff48");
/**
 * Create a new, completely isolated WebAssembly module containing the QuickJS library.
 * See the documentation on [[QuickJSWASMModule]].
 *
 * Note that there is a hard limit on the number of WebAssembly modules in older
 * versions of v8:
 * https://bugs.chromium.org/p/v8/issues/detail?id=12076
 */ async function newQuickJSWASMModule(/**
 * Optionally, pass a {@link SyncBuildVariant} to construct a different WebAssembly module.
 */ variant = exports.RELEASE_SYNC) {
    const [wasmModuleLoader, QuickJSFFI, { QuickJSWASMModule }] = await Promise.all([
        variant.importModuleLoader(),
        variant.importFFI(),
        Promise.resolve().then(function() {
            return require("97e578aa45855bd2");
        }).then((res)=>__importStar(res)).then(esmHelpers_1.unwrapTypescript)
    ]);
    const wasmModule = await wasmModuleLoader();
    wasmModule.type = "sync";
    const ffi = new QuickJSFFI(wasmModule);
    return new QuickJSWASMModule(wasmModule, ffi);
}
exports.newQuickJSWASMModule = newQuickJSWASMModule;
/**
 * Create a new, completely isolated WebAssembly module containing a version of the QuickJS library
 * compiled with Emscripten's [ASYNCIFY](https://emscripten.org/docs/porting/asyncify.html) transform.
 *
 * This version of the library offers features that enable synchronous code
 * inside the VM to interact with asynchronous code in the host environment.
 * See the documentation on [[QuickJSAsyncWASMModule]], [[QuickJSAsyncRuntime]],
 * and [[QuickJSAsyncContext]].
 *
 * Note that there is a hard limit on the number of WebAssembly modules in older
 * versions of v8:
 * https://bugs.chromium.org/p/v8/issues/detail?id=12076
 */ async function newQuickJSAsyncWASMModule(/**
 * Optionally, pass a {@link AsyncBuildVariant} to construct a different WebAssembly module.
 */ variant = exports.RELEASE_ASYNC) {
    const [wasmModuleLoader, QuickJSAsyncFFI, { QuickJSAsyncWASMModule }] = await Promise.all([
        variant.importModuleLoader(),
        variant.importFFI(),
        Promise.resolve().then(function() {
            return require("e760c2d438be23b9");
        }).then((res)=>__importStar(res)).then(esmHelpers_1.unwrapTypescript)
    ]);
    const wasmModule = await wasmModuleLoader();
    wasmModule.type = "async";
    const ffi = new QuickJSAsyncFFI(wasmModule);
    return new QuickJSAsyncWASMModule(wasmModule, ffi);
}
exports.newQuickJSAsyncWASMModule = newQuickJSAsyncWASMModule;
/**
 * Helper intended to memoize the creation of a WebAssembly module.
 * ```typescript
 * const getDebugModule = memoizePromiseFactory(() => newQuickJSWASMModule(DEBUG_SYNC))
 * ```
 */ function memoizePromiseFactory(fn) {
    let promise;
    return ()=>{
        return promise ?? (promise = fn());
    };
}
exports.memoizePromiseFactory = memoizePromiseFactory;
/**
 * This build variant is compiled with `-fsanitize=leak`. It instruments all
 * memory allocations and when combined with sourcemaps, can present stack trace
 * locations where memory leaks occur.
 *
 * See [[TestQuickJSWASMModule]] which provides access to the leak sanitizer via
 * {@link TestQuickJSWASMModule.assertNoMemoryAllocated}.
 *
 * The downside is that it's 100-1000x slower than the other variants.
 * Suggested use case: automated testing, regression testing, and interactive
 * debugging.
 */ exports.DEBUG_SYNC = {
    type: "sync",
    async importFFI () {
        throw new Error("not implemented");
    // const mod = await import("./generated/ffi.WASM_DEBUG_SYNC.js")
    // return unwrapTypescript(mod).QuickJSFFI
    },
    async importModuleLoader () {
        throw new Error("not implemented");
    // const mod = await import("./generated/emscripten-module.WASM_DEBUG_SYNC.js")
    // return unwrapJavascript(mod).default
    }
};
/**
 * This is the default (synchronous) build variant.
 * {@link getQuickJS} returns a memoized instance of this build variant.
 */ exports.RELEASE_SYNC = {
    type: "sync",
    async importFFI () {
        const mod = await Promise.resolve().then(function() {
            return require("2d853f7d6b4f84a");
        }).then((res)=>__importStar(res));
        return (0, esmHelpers_1.unwrapTypescript)(mod).QuickJSFFI;
    },
    async importModuleLoader () {
        const mod = await Promise.resolve().then(function() {
            return require("8260d0cda46d9ad3");
        }).then((res)=>__importStar(res));
        return (0, esmHelpers_1.unwrapJavascript)(mod);
    }
};
/**
 * The async debug build variant may or may not have the sanitizer enabled.
 * It does print a lot of debug logs.
 *
 * Suggested use case: interactive debugging only.
 */ exports.DEBUG_ASYNC = {
    type: "async",
    async importFFI () {
        throw new Error("not implemented");
    // const mod = await import("./generated/ffi.WASM_DEBUG_ASYNCIFY.js")
    // return unwrapTypescript(mod).QuickJSAsyncFFI
    },
    async importModuleLoader () {
        throw new Error("not implemented");
    // const mod = await import("./generated/emscripten-module.WASM_DEBUG_ASYNCIFY.js")
    // return unwrapJavascript(mod).default
    }
};
/**
 * This is the default asyncified build variant.
 */ exports.RELEASE_ASYNC = {
    type: "async",
    async importFFI () {
        throw new Error("not implemented");
    // const mod = await import("./generated/ffi.WASM_RELEASE_ASYNCIFY.js")
    // return unwrapTypescript(mod).QuickJSAsyncFFI
    },
    async importModuleLoader () {
        throw new Error("not implemented");
    // const mod = await import("./generated/emscripten-module.WASM_RELEASE_ASYNCIFY.js")
    // return unwrapJavascript(mod).default
    }
};

},{"c5af8b741cb0ff48":"hg3C2","97e578aa45855bd2":"kP48E","e760c2d438be23b9":"7rsZO","2d853f7d6b4f84a":"konsU","8260d0cda46d9ad3":"k1AID"}],"hg3C2":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.unwrapJavascript = exports.unwrapTypescript = void 0;
/** Typescript thinks import('...js/.d.ts') needs mod.default.default */ function fakeUnwrapDefault(mod) {
    // console.log("fakeUnwrapDefault", mod)
    return mod.default;
}
/** Typescript thinks import('...ts') doesn't need mod.default.default, but does */ function actualUnwrapDefault(mod) {
    // console.log("actualUnwrapDefault", mod)
    const maybeUnwrap = mod.default;
    return maybeUnwrap ?? mod;
}
// I'm not sure if this behavior is needed in all runtimes,
// or just for mocha + ts-node.
exports.unwrapTypescript = actualUnwrapDefault;
exports.unwrapJavascript = fakeUnwrapDefault;

},{}],"lXcUH":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isFail = exports.isSuccess = void 0;
function isSuccess(successOrFail) {
    return "error" in successOrFail === false;
}
exports.isSuccess = isSuccess;
function isFail(successOrFail) {
    return "error" in successOrFail === true;
}
exports.isFail = isFail;

},{}],"lGIpe":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Scope = exports.WeakLifetime = exports.StaticLifetime = exports.Lifetime = void 0;
const asyncify_helpers_1 = require("389e59439cc6eba6");
const debug_1 = require("2f0d2596d2702794");
const errors_1 = require("87a32df74a470e9e");
/**
 * A lifetime prevents access to a value after the lifetime has been
 * [[dispose]]ed.
 *
 * Typically, quickjs-emscripten uses Lifetimes to protect C memory pointers.
 */ class Lifetime {
    /**
     * When the Lifetime is disposed, it will call `disposer(_value)`. Use the
     * disposer function to implement whatever cleanup needs to happen at the end
     * of `value`'s lifetime.
     *
     * `_owner` is not used or controlled by the lifetime. It's just metadata for
     * the creator.
     */ constructor(_value, copier, disposer, _owner){
        this._value = _value;
        this.copier = copier;
        this.disposer = disposer;
        this._owner = _owner;
        this._alive = true;
        this._constructorStack = debug_1.QTS_DEBUG ? new Error("Lifetime constructed").stack : undefined;
    }
    get alive() {
        return this._alive;
    }
    /**
     * The value this Lifetime protects. You must never retain the value - it
     * may become invalid, leading to memory errors.
     *
     * @throws If the lifetime has been [[dispose]]d already.
     */ get value() {
        this.assertAlive();
        return this._value;
    }
    get owner() {
        return this._owner;
    }
    get dupable() {
        return !!this.copier;
    }
    /**
     * Create a new handle pointing to the same [[value]].
     */ dup() {
        this.assertAlive();
        if (!this.copier) throw new Error("Non-dupable lifetime");
        return new Lifetime(this.copier(this._value), this.copier, this.disposer, this._owner);
    }
    consume(map) {
        this.assertAlive();
        const result = map(this);
        this.dispose();
        return result;
    }
    /**
     * Dispose of [[value]] and perform cleanup.
     */ dispose() {
        this.assertAlive();
        if (this.disposer) this.disposer(this._value);
        this._alive = false;
    }
    assertAlive() {
        if (!this.alive) {
            if (this._constructorStack) throw new errors_1.QuickJSUseAfterFree(`Lifetime not alive\n${this._constructorStack}\nLifetime used`);
            throw new errors_1.QuickJSUseAfterFree("Lifetime not alive");
        }
    }
}
exports.Lifetime = Lifetime;
/**
 * A Lifetime that lives forever. Used for constants.
 */ class StaticLifetime extends Lifetime {
    constructor(value, owner){
        super(value, undefined, undefined, owner);
    }
    // Static lifetime doesn't need a copier to be copiable
    get dupable() {
        return true;
    }
    // Copy returns the same instance.
    dup() {
        return this;
    }
    // Dispose does nothing.
    dispose() {}
}
exports.StaticLifetime = StaticLifetime;
/**
 * A Lifetime that does not own its `value`. A WeakLifetime never calls its
 * `disposer` function, but can be `dup`ed to produce regular lifetimes that
 * do.
 *
 * Used for function arguments.
 */ class WeakLifetime extends Lifetime {
    constructor(value, copier, disposer, owner){
        // We don't care if the disposer doesn't support freeing T
        super(value, copier, disposer, owner);
    }
    dispose() {
        this._alive = false;
    }
}
exports.WeakLifetime = WeakLifetime;
function scopeFinally(scope, blockError) {
    // console.log('scopeFinally', scope, blockError)
    let disposeError;
    try {
        scope.dispose();
    } catch (error) {
        disposeError = error;
    }
    if (blockError && disposeError) {
        Object.assign(blockError, {
            message: `${blockError.message}\n Then, failed to dispose scope: ${disposeError.message}`,
            disposeError
        });
        throw blockError;
    }
    if (blockError || disposeError) throw blockError || disposeError;
}
/**
 * Scope helps reduce the burden of manually tracking and disposing of
 * Lifetimes. See [[withScope]]. and [[withScopeAsync]].
 */ class Scope {
    constructor(){
        this._disposables = new Lifetime(new Set());
    }
    /**
     * Run `block` with a new Scope instance that will be disposed after the block returns.
     * Inside `block`, call `scope.manage` on each lifetime you create to have the lifetime
     * automatically disposed after the block returns.
     *
     * @warning Do not use with async functions. Instead, use [[withScopeAsync]].
     */ static withScope(block) {
        const scope = new Scope();
        let blockError;
        try {
            return block(scope);
        } catch (error) {
            blockError = error;
            throw error;
        } finally{
            scopeFinally(scope, blockError);
        }
    }
    static withScopeMaybeAsync(_this, block) {
        return (0, asyncify_helpers_1.maybeAsync)(undefined, function*(awaited) {
            const scope = new Scope();
            let blockError;
            try {
                return yield* awaited.of(block.call(_this, awaited, scope));
            } catch (error) {
                blockError = error;
                throw error;
            } finally{
                scopeFinally(scope, blockError);
            }
        });
    }
    /**
     * Run `block` with a new Scope instance that will be disposed after the
     * block's returned promise settles. Inside `block`, call `scope.manage` on each
     * lifetime you create to have the lifetime automatically disposed after the
     * block returns.
     */ static async withScopeAsync(block) {
        const scope = new Scope();
        let blockError;
        try {
            return await block(scope);
        } catch (error) {
            blockError = error;
            throw error;
        } finally{
            scopeFinally(scope, blockError);
        }
    }
    /**
     * Track `lifetime` so that it is disposed when this scope is disposed.
     */ manage(lifetime) {
        this._disposables.value.add(lifetime);
        return lifetime;
    }
    get alive() {
        return this._disposables.alive;
    }
    dispose() {
        const lifetimes = Array.from(this._disposables.value.values()).reverse();
        for (const lifetime of lifetimes)if (lifetime.alive) lifetime.dispose();
        this._disposables.dispose();
    }
}
exports.Scope = Scope;

},{"389e59439cc6eba6":"5nzJy","2f0d2596d2702794":"2VzQq","87a32df74a470e9e":"7YGVe"}],"5nzJy":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.awaitEachYieldedPromise = exports.maybeAsync = exports.maybeAsyncFn = void 0;
function* awaitYield(value) {
    return yield value;
}
function awaitYieldOf(generator) {
    return awaitYield(awaitEachYieldedPromise(generator));
}
const AwaitYield = awaitYield;
AwaitYield.of = awaitYieldOf;
/**
 * Create a function that may or may not be async, using a generator
 *
 * Within the generator, call `yield* awaited(maybePromise)` to await a value
 * that may or may not be a promise.
 *
 * If the inner function never yields a promise, it will return synchronously.
 */ function maybeAsyncFn(that, fn) {
    return (...args)=>{
        const generator = fn.call(that, AwaitYield, ...args);
        return awaitEachYieldedPromise(generator);
    };
}
exports.maybeAsyncFn = maybeAsyncFn;
class Example {
    constructor(){
        this.maybeAsyncMethod = maybeAsyncFn(this, function*(awaited, a) {
            yield* awaited(new Promise((resolve)=>setTimeout(resolve, a)));
            return 5;
        });
    }
}
function maybeAsync(that, startGenerator) {
    const generator = startGenerator.call(that, AwaitYield);
    return awaitEachYieldedPromise(generator);
}
exports.maybeAsync = maybeAsync;
function awaitEachYieldedPromise(gen) {
    function handleNextStep(step) {
        if (step.done) return step.value;
        if (step.value instanceof Promise) return step.value.then((value)=>handleNextStep(gen.next(value)), (error)=>handleNextStep(gen.throw(error)));
        return handleNextStep(gen.next(step.value));
    }
    return handleNextStep(gen.next());
}
exports.awaitEachYieldedPromise = awaitEachYieldedPromise;

},{}],"2VzQq":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.debugLog = exports.QTS_DEBUG = void 0;
exports.QTS_DEBUG = Boolean(typeof process === "object" && process.env.QTS_DEBUG);
exports.debugLog = exports.QTS_DEBUG ? console.log.bind(console) : ()=>{};

},{}],"7YGVe":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.QuickJSMemoryLeakDetected = exports.QuickJSAsyncifySuspended = exports.QuickJSAsyncifyError = exports.QuickJSNotImplemented = exports.QuickJSUseAfterFree = exports.QuickJSWrongOwner = exports.QuickJSUnwrapError = void 0;
/**
 * Error thrown if [[QuickJSContext.unwrapResult]] unwraps an error value that isn't an object.
 */ class QuickJSUnwrapError extends Error {
    constructor(cause, context){
        super(String(cause));
        this.cause = cause;
        this.context = context;
        this.name = "QuickJSUnwrapError";
    }
}
exports.QuickJSUnwrapError = QuickJSUnwrapError;
class QuickJSWrongOwner extends Error {
    constructor(){
        super(...arguments);
        this.name = "QuickJSWrongOwner";
    }
}
exports.QuickJSWrongOwner = QuickJSWrongOwner;
class QuickJSUseAfterFree extends Error {
    constructor(){
        super(...arguments);
        this.name = "QuickJSUseAfterFree";
    }
}
exports.QuickJSUseAfterFree = QuickJSUseAfterFree;
class QuickJSNotImplemented extends Error {
    constructor(){
        super(...arguments);
        this.name = "QuickJSNotImplemented";
    }
}
exports.QuickJSNotImplemented = QuickJSNotImplemented;
class QuickJSAsyncifyError extends Error {
    constructor(){
        super(...arguments);
        this.name = "QuickJSAsyncifyError";
    }
}
exports.QuickJSAsyncifyError = QuickJSAsyncifyError;
class QuickJSAsyncifySuspended extends Error {
    constructor(){
        super(...arguments);
        this.name = "QuickJSAsyncifySuspended";
    }
}
exports.QuickJSAsyncifySuspended = QuickJSAsyncifySuspended;
class QuickJSMemoryLeakDetected extends Error {
    constructor(){
        super(...arguments);
        this.name = "QuickJSMemoryLeakDetected";
    }
}
exports.QuickJSMemoryLeakDetected = QuickJSMemoryLeakDetected;

},{}],"2uHMB":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.QuickJSDeferredPromise = void 0;
/**
 * QuickJSDeferredPromise wraps a QuickJS promise [[handle]] and allows
 * [[resolve]]ing or [[reject]]ing that promise. Use it to bridge asynchronous
 * code on the host to APIs inside a QuickJSContext.
 *
 * Managing the lifetime of promises is tricky. There are three
 * [[QuickJSHandle]]s inside of each deferred promise object: (1) the promise
 * itself, (2) the `resolve` callback, and (3) the `reject` callback.
 *
 * - If the promise will be fulfilled before the end of it's [[owner]]'s lifetime,
 *   the only cleanup necessary is `deferred.handle.dispose()`, because
 *   calling [[resolve]] or [[reject]] will dispose of both callbacks automatically.
 *
 * - As the return value of a [[VmFunctionImplementation]], return [[handle]],
 *   and ensure that either [[resolve]] or [[reject]] will be called. No other
 *   clean-up is necessary.
 *
 * - In other cases, call [[dispose]], which will dispose [[handle]] as well as the
 *   QuickJS handles that back [[resolve]] and [[reject]]. For this object,
 *   [[dispose]] is idempotent.
 */ class QuickJSDeferredPromise {
    /**
     * Use [[QuickJSContext.newPromise]] to create a new promise instead of calling
     * this constructor directly.
     * @unstable
     */ constructor(args){
        /**
         * Resolve [[handle]] with the given value, if any.
         * Calling this method after calling [[dispose]] is a no-op.
         *
         * Note that after resolving a promise, you may need to call
         * [[QuickJSContext.executePendingJobs]] to propagate the result to the promise's
         * callbacks.
         */ this.resolve = (value)=>{
            if (!this.resolveHandle.alive) return;
            this.context.unwrapResult(this.context.callFunction(this.resolveHandle, this.context.undefined, value || this.context.undefined)).dispose();
            this.disposeResolvers();
            this.onSettled();
        };
        /**
         * Reject [[handle]] with the given value, if any.
         * Calling this method after calling [[dispose]] is a no-op.
         *
         * Note that after rejecting a promise, you may need to call
         * [[QuickJSContext.executePendingJobs]] to propagate the result to the promise's
         * callbacks.
         */ this.reject = (value)=>{
            if (!this.rejectHandle.alive) return;
            this.context.unwrapResult(this.context.callFunction(this.rejectHandle, this.context.undefined, value || this.context.undefined)).dispose();
            this.disposeResolvers();
            this.onSettled();
        };
        this.dispose = ()=>{
            if (this.handle.alive) this.handle.dispose();
            this.disposeResolvers();
        };
        this.context = args.context;
        this.owner = args.context.runtime;
        this.handle = args.promiseHandle;
        this.settled = new Promise((resolve)=>{
            this.onSettled = resolve;
        });
        this.resolveHandle = args.resolveHandle;
        this.rejectHandle = args.rejectHandle;
    }
    get alive() {
        return this.handle.alive || this.resolveHandle.alive || this.rejectHandle.alive;
    }
    disposeResolvers() {
        if (this.resolveHandle.alive) this.resolveHandle.dispose();
        if (this.rejectHandle.alive) this.rejectHandle.dispose();
    }
}
exports.QuickJSDeferredPromise = QuickJSDeferredPromise;

},{}],"mmb5j":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TestQuickJSWASMModule = void 0;
const errors_1 = require("a2b25189250eeda6");
const lifetime_1 = require("aa5d34754f9cd8dd");
/**
 * A test wrapper of [[QuickJSWASMModule]] that keeps a reference to each
 * context or runtime created.
 *
 * Call [[disposeAll]] to reset these sets and calls `dispose` on any left alive
 * (which may throw an error).
 *
 * Call [[assertNoMemoryAllocated]] at the end of a test, when you expect that you've
 * freed all the memory you've ever allocated.
 */ class TestQuickJSWASMModule {
    constructor(parent){
        this.parent = parent;
        this.contexts = new Set();
        this.runtimes = new Set();
    }
    newRuntime(options) {
        const runtime = this.parent.newRuntime({
            ...options,
            ownedLifetimes: [
                new lifetime_1.Lifetime(undefined, undefined, ()=>this.runtimes.delete(runtime)),
                ...options?.ownedLifetimes ?? []
            ]
        });
        this.runtimes.add(runtime);
        return runtime;
    }
    newContext(options) {
        const context = this.parent.newContext({
            ...options,
            ownedLifetimes: [
                new lifetime_1.Lifetime(undefined, undefined, ()=>this.contexts.delete(context)),
                ...options?.ownedLifetimes ?? []
            ]
        });
        this.contexts.add(context);
        return context;
    }
    evalCode(code, options) {
        return this.parent.evalCode(code, options);
    }
    disposeAll() {
        const allDisposables = [
            ...this.contexts,
            ...this.runtimes
        ];
        this.runtimes.clear();
        this.contexts.clear();
        allDisposables.forEach((d)=>{
            if (d.alive) d.dispose();
        });
    }
    assertNoMemoryAllocated() {
        const leaksDetected = this.getFFI().QTS_RecoverableLeakCheck();
        if (leaksDetected) // Note: this is currently only available when building from source
        // with debug builds.
        throw new errors_1.QuickJSMemoryLeakDetected("Leak sanitizer detected un-freed memory");
        if (this.contexts.size > 0) throw new errors_1.QuickJSMemoryLeakDetected(`${this.contexts.size} contexts leaked`);
        if (this.runtimes.size > 0) throw new errors_1.QuickJSMemoryLeakDetected(`${this.runtimes.size} runtimes leaked`);
    }
    /** @private */ getFFI() {
        return this.parent.getFFI();
    }
}
exports.TestQuickJSWASMModule = TestQuickJSWASMModule;

},{"a2b25189250eeda6":"7YGVe","aa5d34754f9cd8dd":"lGIpe"}]},["5P7PQ"], "5P7PQ", "parcelRequired6b0", {})

//# sourceMappingURL=dist.c0234944.js.map
