require("./module.569ad374.js");
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
})({"7rsZO":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.QuickJSAsyncWASMModule = void 0;
const errors_1 = require("a94d3fe3873303bb");
const lifetime_1 = require("4b4f6514b1f93b32");
const module_1 = require("b1dbbd9ae5cd65fd");
const runtime_asyncify_1 = require("429682e12eb02964");
/**
 * Asyncified version of [[QuickJSWASMModule]].
 *
 * Due to limitations of Emscripten's ASYNCIFY process, only a single async
 * function call can happen at a time across the entire WebAssembly module.
 *
 * That means that all runtimes, contexts, functions, etc created inside this
 * WebAssembly are limited to a single concurrent async action.
 * **Multiple concurrent async actions is an error.**
 *
 * To allow for multiple concurrent async actions, you must create multiple WebAssembly
 * modules.
 */ class QuickJSAsyncWASMModule extends module_1.QuickJSWASMModule {
    /** @private */ constructor(module, ffi){
        super(module, ffi);
        this.ffi = ffi;
        this.module = module;
    }
    /**
     * Create a new async runtime inside this WebAssembly module. All runtimes inside a
     * module are limited to a single async call at a time. For multiple
     * concurrent async actions, create multiple WebAssembly modules.
     */ newRuntime(options = {}) {
        const rt = new lifetime_1.Lifetime(this.ffi.QTS_NewRuntime(), undefined, (rt_ptr)=>{
            this.callbacks.deleteRuntime(rt_ptr);
            this.ffi.QTS_FreeRuntime(rt_ptr);
        });
        const runtime = new runtime_asyncify_1.QuickJSAsyncRuntime({
            module: this.module,
            ffi: this.ffi,
            rt,
            callbacks: this.callbacks
        });
        (0, module_1.applyBaseRuntimeOptions)(runtime, options);
        if (options.moduleLoader) runtime.setModuleLoader(options.moduleLoader);
        return runtime;
    }
    /**
     * A simplified API to create a new [[QuickJSRuntime]] and a
     * [[QuickJSContext]] inside that runtime at the same time. The runtime will
     * be disposed when the context is disposed.
     */ newContext(options = {}) {
        const runtime = this.newRuntime();
        const lifetimes = options.ownedLifetimes ? options.ownedLifetimes.concat([
            runtime
        ]) : [
            runtime
        ];
        const context = runtime.newContext({
            ...options,
            ownedLifetimes: lifetimes
        });
        runtime.context = context;
        return context;
    }
    /** Synchronous evalCode is not supported. */ evalCode() {
        throw new errors_1.QuickJSNotImplemented("QuickJSWASMModuleAsyncify.evalCode: use evalCodeAsync instead");
    }
    /**
     * One-off evaluate code without needing to create a [[QuickJSRuntimeAsync]] or
     * [[QuickJSContextSync]] explicitly.
     *
     * This version allows for asynchronous Ecmascript module loading.
     *
     * Note that only a single async action can occur at a time inside the entire WebAssembly module.
     * **Multiple concurrent async actions is an error.**
     *
     * See the documentation for [[QuickJSWASMModule.evalCode]] for more details.
     */ evalCodeAsync(code, options) {
        // TODO: we should really figure out generator for the Promise monad...
        return lifetime_1.Scope.withScopeAsync(async (scope)=>{
            const vm = scope.manage(this.newContext());
            (0, module_1.applyModuleEvalRuntimeOptions)(vm.runtime, options);
            const result = await vm.evalCodeAsync(code, "eval.js");
            if (options.memoryLimitBytes !== undefined) // Remove memory limit so we can dump the result without exceeding it.
            vm.runtime.setMemoryLimit(-1);
            if (result.error) {
                const error = vm.dump(scope.manage(result.error));
                throw error;
            }
            const value = vm.dump(scope.manage(result.value));
            return value;
        });
    }
}
exports.QuickJSAsyncWASMModule = QuickJSAsyncWASMModule;

},{"a94d3fe3873303bb":"7YGVe","4b4f6514b1f93b32":"lGIpe","b1dbbd9ae5cd65fd":"kP48E","429682e12eb02964":"i6sDT"}],"i6sDT":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.QuickJSAsyncRuntime = void 0;
const _1 = require("8abd610fd88eb7e5");
const context_asyncify_1 = require("28ca6ebc068f103b");
const runtime_1 = require("ffdd7f869b7b2c7c");
const types_1 = require("ababf3f95f064919");
class QuickJSAsyncRuntime extends runtime_1.QuickJSRuntime {
    /** @private */ constructor(args){
        super(args);
    }
    newContext(options = {}) {
        if (options.intrinsics && options.intrinsics !== types_1.DefaultIntrinsics) throw new Error("TODO: Custom intrinsics are not supported yet");
        const ctx = new _1.Lifetime(this.ffi.QTS_NewContext(this.rt.value), undefined, (ctx_ptr)=>{
            this.contextMap.delete(ctx_ptr);
            this.callbacks.deleteContext(ctx_ptr);
            this.ffi.QTS_FreeContext(ctx_ptr);
        });
        const context = new context_asyncify_1.QuickJSAsyncContext({
            module: this.module,
            ctx,
            ffi: this.ffi,
            rt: this.rt,
            ownedLifetimes: [],
            runtime: this,
            callbacks: this.callbacks
        });
        this.contextMap.set(ctx.value, context);
        return context;
    }
    setModuleLoader(moduleLoader, moduleNormalizer) {
        super.setModuleLoader(moduleLoader, moduleNormalizer);
    }
    /**
     * Set the max stack size for this runtime in bytes.
     * To remove the limit, set to `0`.
     *
     * Setting this limit also adjusts the global `ASYNCIFY_STACK_SIZE` for the entire {@link QuickJSAsyncWASMModule}.
     * See the [pull request](https://github.com/justjake/quickjs-emscripten/pull/114) for more details.
     */ setMaxStackSize(stackSize) {
        return super.setMaxStackSize(stackSize);
    }
}
exports.QuickJSAsyncRuntime = QuickJSAsyncRuntime;

},{"8abd610fd88eb7e5":"iBLsu","28ca6ebc068f103b":"8t7p9","ffdd7f869b7b2c7c":"8lVAz","ababf3f95f064919":"kF6qe"}],"8t7p9":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.QuickJSAsyncContext = void 0;
const context_1 = require("2dfcee59703784ff");
const debug_1 = require("9cf1cf21806b07e9");
const types_1 = require("b40f47c132e3ae41");
/**
 * Asyncified version of [[QuickJSContext]].
 *
 * *Asyncify* allows normally synchronous code to wait for asynchronous Promises
 * or callbacks. The asyncified version of QuickJSContext can wait for async
 * host functions as though they were synchronous.
 */ class QuickJSAsyncContext extends context_1.QuickJSContext {
    /**
     * Asyncified version of [[evalCode]].
     */ async evalCodeAsync(code, filename = "eval.js", /** See [[EvalFlags]] for number semantics */ options) {
        const detectModule = options === undefined ? 1 : 0;
        const flags = (0, types_1.evalOptionsToFlags)(options);
        let resultPtr = 0;
        try {
            resultPtr = await this.memory.newHeapCharPointer(code).consume((charHandle)=>this.ffi.QTS_Eval_MaybeAsync(this.ctx.value, charHandle.value, filename, detectModule, flags));
        } catch (error) {
            (0, debug_1.debugLog)("QTS_Eval_MaybeAsync threw", error);
            throw error;
        }
        const errorPtr = this.ffi.QTS_ResolveException(this.ctx.value, resultPtr);
        if (errorPtr) {
            this.ffi.QTS_FreeValuePointer(this.ctx.value, resultPtr);
            return {
                error: this.memory.heapValueHandle(errorPtr)
            };
        }
        return {
            value: this.memory.heapValueHandle(resultPtr)
        };
    }
    /**
     * Similar to [[newFunction]].
     * Convert an async host Javascript function into a synchronous QuickJS function value.
     *
     * Whenever QuickJS calls this function, the VM's stack will be unwound while
     * waiting the async function to complete, and then restored when the returned
     * promise resolves.
     *
     * Asyncified functions must never call other asyncified functions or
     * `import`, even indirectly, because the stack cannot be unwound twice.
     *
     * See [Emscripten's docs on Asyncify](https://emscripten.org/docs/porting/asyncify.html).
     */ newAsyncifiedFunction(name, fn) {
        return this.newFunction(name, fn);
    }
}
exports.QuickJSAsyncContext = QuickJSAsyncContext;

},{"2dfcee59703784ff":"9Pcha","9cf1cf21806b07e9":"2VzQq","b40f47c132e3ae41":"kF6qe"}]},["7rsZO"], "7rsZO", "parcelRequired6b0", {})

//# sourceMappingURL=module-asyncify.d625e428.js.map
