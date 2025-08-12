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
})({"konsU":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.QuickJSFFI = void 0;
/**
 * Low-level FFI bindings to QuickJS's Emscripten module.
 * See instead [[QuickJSContext]], the public Javascript interface exposed by this
 * library.
 *
 * @unstable The FFI interface is considered private and may change.
 */ class QuickJSFFI {
    constructor(module){
        this.module = module;
        /** Set at compile time. */ this.DEBUG = false;
        this.QTS_Throw = this.module.cwrap("QTS_Throw", "number", [
            "number",
            "number"
        ]);
        this.QTS_NewError = this.module.cwrap("QTS_NewError", "number", [
            "number"
        ]);
        this.QTS_RuntimeSetMemoryLimit = this.module.cwrap("QTS_RuntimeSetMemoryLimit", null, [
            "number",
            "number"
        ]);
        this.QTS_RuntimeComputeMemoryUsage = this.module.cwrap("QTS_RuntimeComputeMemoryUsage", "number", [
            "number",
            "number"
        ]);
        this.QTS_RuntimeDumpMemoryUsage = this.module.cwrap("QTS_RuntimeDumpMemoryUsage", "number", [
            "number"
        ]);
        this.QTS_RecoverableLeakCheck = this.module.cwrap("QTS_RecoverableLeakCheck", "number", []);
        this.QTS_BuildIsSanitizeLeak = this.module.cwrap("QTS_BuildIsSanitizeLeak", "number", []);
        this.QTS_RuntimeSetMaxStackSize = this.module.cwrap("QTS_RuntimeSetMaxStackSize", null, [
            "number",
            "number"
        ]);
        this.QTS_GetUndefined = this.module.cwrap("QTS_GetUndefined", "number", []);
        this.QTS_GetNull = this.module.cwrap("QTS_GetNull", "number", []);
        this.QTS_GetFalse = this.module.cwrap("QTS_GetFalse", "number", []);
        this.QTS_GetTrue = this.module.cwrap("QTS_GetTrue", "number", []);
        this.QTS_NewRuntime = this.module.cwrap("QTS_NewRuntime", "number", []);
        this.QTS_FreeRuntime = this.module.cwrap("QTS_FreeRuntime", null, [
            "number"
        ]);
        this.QTS_NewContext = this.module.cwrap("QTS_NewContext", "number", [
            "number"
        ]);
        this.QTS_FreeContext = this.module.cwrap("QTS_FreeContext", null, [
            "number"
        ]);
        this.QTS_FreeValuePointer = this.module.cwrap("QTS_FreeValuePointer", null, [
            "number",
            "number"
        ]);
        this.QTS_FreeValuePointerRuntime = this.module.cwrap("QTS_FreeValuePointerRuntime", null, [
            "number",
            "number"
        ]);
        this.QTS_FreeVoidPointer = this.module.cwrap("QTS_FreeVoidPointer", null, [
            "number",
            "number"
        ]);
        this.QTS_FreeCString = this.module.cwrap("QTS_FreeCString", null, [
            "number",
            "number"
        ]);
        this.QTS_DupValuePointer = this.module.cwrap("QTS_DupValuePointer", "number", [
            "number",
            "number"
        ]);
        this.QTS_NewObject = this.module.cwrap("QTS_NewObject", "number", [
            "number"
        ]);
        this.QTS_NewObjectProto = this.module.cwrap("QTS_NewObjectProto", "number", [
            "number",
            "number"
        ]);
        this.QTS_NewArray = this.module.cwrap("QTS_NewArray", "number", [
            "number"
        ]);
        this.QTS_NewFloat64 = this.module.cwrap("QTS_NewFloat64", "number", [
            "number",
            "number"
        ]);
        this.QTS_GetFloat64 = this.module.cwrap("QTS_GetFloat64", "number", [
            "number",
            "number"
        ]);
        this.QTS_NewString = this.module.cwrap("QTS_NewString", "number", [
            "number",
            "number"
        ]);
        this.QTS_GetString = this.module.cwrap("QTS_GetString", "number", [
            "number",
            "number"
        ]);
        this.QTS_NewSymbol = this.module.cwrap("QTS_NewSymbol", "number", [
            "number",
            "number",
            "number"
        ]);
        this.QTS_GetSymbolDescriptionOrKey = this.module.cwrap("QTS_GetSymbolDescriptionOrKey", "number", [
            "number",
            "number"
        ]);
        this.QTS_IsGlobalSymbol = this.module.cwrap("QTS_IsGlobalSymbol", "number", [
            "number",
            "number"
        ]);
        this.QTS_IsJobPending = this.module.cwrap("QTS_IsJobPending", "number", [
            "number"
        ]);
        this.QTS_ExecutePendingJob = this.module.cwrap("QTS_ExecutePendingJob", "number", [
            "number",
            "number",
            "number"
        ]);
        this.QTS_GetProp = this.module.cwrap("QTS_GetProp", "number", [
            "number",
            "number",
            "number"
        ]);
        this.QTS_SetProp = this.module.cwrap("QTS_SetProp", null, [
            "number",
            "number",
            "number",
            "number"
        ]);
        this.QTS_DefineProp = this.module.cwrap("QTS_DefineProp", null, [
            "number",
            "number",
            "number",
            "number",
            "number",
            "number",
            "boolean",
            "boolean",
            "boolean"
        ]);
        this.QTS_Call = this.module.cwrap("QTS_Call", "number", [
            "number",
            "number",
            "number",
            "number",
            "number"
        ]);
        this.QTS_ResolveException = this.module.cwrap("QTS_ResolveException", "number", [
            "number",
            "number"
        ]);
        this.QTS_Dump = this.module.cwrap("QTS_Dump", "number", [
            "number",
            "number"
        ]);
        this.QTS_Eval = this.module.cwrap("QTS_Eval", "number", [
            "number",
            "number",
            "string",
            "number",
            "number"
        ]);
        this.QTS_Typeof = this.module.cwrap("QTS_Typeof", "number", [
            "number",
            "number"
        ]);
        this.QTS_GetGlobalObject = this.module.cwrap("QTS_GetGlobalObject", "number", [
            "number"
        ]);
        this.QTS_NewPromiseCapability = this.module.cwrap("QTS_NewPromiseCapability", "number", [
            "number",
            "number"
        ]);
        this.QTS_TestStringArg = this.module.cwrap("QTS_TestStringArg", null, [
            "string"
        ]);
        this.QTS_BuildIsDebug = this.module.cwrap("QTS_BuildIsDebug", "number", []);
        this.QTS_BuildIsAsyncify = this.module.cwrap("QTS_BuildIsAsyncify", "number", []);
        this.QTS_NewFunction = this.module.cwrap("QTS_NewFunction", "number", [
            "number",
            "number",
            "string"
        ]);
        this.QTS_ArgvGetJSValueConstPointer = this.module.cwrap("QTS_ArgvGetJSValueConstPointer", "number", [
            "number",
            "number"
        ]);
        this.QTS_RuntimeEnableInterruptHandler = this.module.cwrap("QTS_RuntimeEnableInterruptHandler", null, [
            "number"
        ]);
        this.QTS_RuntimeDisableInterruptHandler = this.module.cwrap("QTS_RuntimeDisableInterruptHandler", null, [
            "number"
        ]);
        this.QTS_RuntimeEnableModuleLoader = this.module.cwrap("QTS_RuntimeEnableModuleLoader", null, [
            "number",
            "number"
        ]);
        this.QTS_RuntimeDisableModuleLoader = this.module.cwrap("QTS_RuntimeDisableModuleLoader", null, [
            "number"
        ]);
    }
}
exports.QuickJSFFI = QuickJSFFI;

},{}]},["konsU"], "konsU", "parcelRequired6b0", {})

//# sourceMappingURL=ffi.WASM_RELEASE_SYNC.2354c463.js.map
