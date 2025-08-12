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
})({"kP48E":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.QuickJSWASMModule = exports.applyModuleEvalRuntimeOptions = exports.applyBaseRuntimeOptions = exports.QuickJSModuleCallbacks = void 0;
const debug_1 = require("1247ef72a38c1daf");
const errors_1 = require("d68c8006516a58b7");
const lifetime_1 = require("3e94ed68be82a0f6");
const runtime_1 = require("8f250f9d36dd59eb");
const types_1 = require("8bf1c4c9e4378412");
class QuickJSEmscriptenModuleCallbacks {
    constructor(args){
        this.callFunction = args.callFunction;
        this.shouldInterrupt = args.shouldInterrupt;
        this.loadModuleSource = args.loadModuleSource;
        this.normalizeModule = args.normalizeModule;
    }
}
/**
 * We use static functions per module to dispatch runtime or context calls from
 * C to the host.  This class manages the indirection from a specific runtime or
 * context pointer to the appropriate callback handler.
 *
 * @private
 */ class QuickJSModuleCallbacks {
    constructor(module){
        this.contextCallbacks = new Map();
        this.runtimeCallbacks = new Map();
        this.suspendedCount = 0;
        this.cToHostCallbacks = new QuickJSEmscriptenModuleCallbacks({
            callFunction: (asyncify, ctx, this_ptr, argc, argv, fn_id)=>this.handleAsyncify(asyncify, ()=>{
                    try {
                        const vm = this.contextCallbacks.get(ctx);
                        if (!vm) throw new Error(`QuickJSContext(ctx = ${ctx}) not found for C function call "${fn_id}"`);
                        return vm.callFunction(ctx, this_ptr, argc, argv, fn_id);
                    } catch (error) {
                        console.error("[C to host error: returning null]", error);
                        return 0;
                    }
                }),
            shouldInterrupt: (asyncify, rt)=>this.handleAsyncify(asyncify, ()=>{
                    try {
                        const vm = this.runtimeCallbacks.get(rt);
                        if (!vm) throw new Error(`QuickJSRuntime(rt = ${rt}) not found for C interrupt`);
                        return vm.shouldInterrupt(rt);
                    } catch (error) {
                        console.error("[C to host interrupt: returning error]", error);
                        return 1;
                    }
                }),
            loadModuleSource: (asyncify, rt, ctx, moduleName)=>this.handleAsyncify(asyncify, ()=>{
                    try {
                        const runtimeCallbacks = this.runtimeCallbacks.get(rt);
                        if (!runtimeCallbacks) throw new Error(`QuickJSRuntime(rt = ${rt}) not found for C module loader`);
                        const loadModule = runtimeCallbacks.loadModuleSource;
                        if (!loadModule) throw new Error(`QuickJSRuntime(rt = ${rt}) does not support module loading`);
                        return loadModule(rt, ctx, moduleName);
                    } catch (error) {
                        console.error("[C to host module loader error: returning null]", error);
                        return 0;
                    }
                }),
            normalizeModule: (asyncify, rt, ctx, moduleBaseName, moduleName)=>this.handleAsyncify(asyncify, ()=>{
                    try {
                        const runtimeCallbacks = this.runtimeCallbacks.get(rt);
                        if (!runtimeCallbacks) throw new Error(`QuickJSRuntime(rt = ${rt}) not found for C module loader`);
                        const normalizeModule = runtimeCallbacks.normalizeModule;
                        if (!normalizeModule) throw new Error(`QuickJSRuntime(rt = ${rt}) does not support module loading`);
                        return normalizeModule(rt, ctx, moduleBaseName, moduleName);
                    } catch (error) {
                        console.error("[C to host module loader error: returning null]", error);
                        return 0;
                    }
                })
        });
        this.module = module;
        this.module.callbacks = this.cToHostCallbacks;
    }
    setRuntimeCallbacks(rt, callbacks) {
        this.runtimeCallbacks.set(rt, callbacks);
    }
    deleteRuntime(rt) {
        this.runtimeCallbacks.delete(rt);
    }
    setContextCallbacks(ctx, callbacks) {
        this.contextCallbacks.set(ctx, callbacks);
    }
    deleteContext(ctx) {
        this.contextCallbacks.delete(ctx);
    }
    handleAsyncify(asyncify, fn) {
        if (asyncify) // We must always call asyncify.handleSync around our function.
        // This allows asyncify to resume suspended execution on the second call.
        // Asyncify internally can detect sync behavior, and avoid suspending.
        return asyncify.handleSleep((done)=>{
            try {
                const result = fn();
                if (!(result instanceof Promise)) {
                    (0, debug_1.debugLog)("asyncify.handleSleep: not suspending:", result);
                    done(result);
                    return;
                }
                // Is promise, we intend to suspend.
                if (this.suspended) throw new errors_1.QuickJSAsyncifyError(`Already suspended at: ${this.suspended.stack}\nAttempted to suspend at:`);
                else {
                    this.suspended = new errors_1.QuickJSAsyncifySuspended(`(${this.suspendedCount++})`);
                    (0, debug_1.debugLog)("asyncify.handleSleep: suspending:", this.suspended);
                }
                result.then((resolvedResult)=>{
                    this.suspended = undefined;
                    (0, debug_1.debugLog)("asyncify.handleSleep: resolved:", resolvedResult);
                    done(resolvedResult);
                }, (error)=>{
                    (0, debug_1.debugLog)("asyncify.handleSleep: rejected:", error);
                    console.error("QuickJS: cannot handle error in suspended function", error);
                    this.suspended = undefined;
                });
            } catch (error) {
                (0, debug_1.debugLog)("asyncify.handleSleep: error:", error);
                this.suspended = undefined;
                throw error;
            }
        });
        // No asyncify - we should never return a promise.
        const value = fn();
        if (value instanceof Promise) throw new Error("Promise return value not supported in non-asyncify context.");
        return value;
    }
}
exports.QuickJSModuleCallbacks = QuickJSModuleCallbacks;
/**
 * Process RuntimeOptions and apply them to a QuickJSRuntime.
 * @private
 */ function applyBaseRuntimeOptions(runtime, options) {
    if (options.interruptHandler) runtime.setInterruptHandler(options.interruptHandler);
    if (options.maxStackSizeBytes !== undefined) runtime.setMaxStackSize(options.maxStackSizeBytes);
    if (options.memoryLimitBytes !== undefined) runtime.setMemoryLimit(options.memoryLimitBytes);
}
exports.applyBaseRuntimeOptions = applyBaseRuntimeOptions;
/**
 * Process ModuleEvalOptions and apply them to a QuickJSRuntime.
 * @private
 */ function applyModuleEvalRuntimeOptions(runtime, options) {
    if (options.moduleLoader) runtime.setModuleLoader(options.moduleLoader);
    if (options.shouldInterrupt) runtime.setInterruptHandler(options.shouldInterrupt);
    if (options.memoryLimitBytes !== undefined) runtime.setMemoryLimit(options.memoryLimitBytes);
    if (options.maxStackSizeBytes !== undefined) runtime.setMaxStackSize(options.maxStackSizeBytes);
}
exports.applyModuleEvalRuntimeOptions = applyModuleEvalRuntimeOptions;
/**
 * This class presents a Javascript interface to QuickJS, a Javascript interpreter
 * that supports EcmaScript 2020 (ES2020).
 *
 * It wraps a single WebAssembly module containing the QuickJS library and
 * associated helper C code. WebAssembly modules are completely isolated from
 * each other by the host's WebAssembly runtime. Separate WebAssembly modules
 * have the most isolation guarantees possible with this library.
 *
 * The simplest way to start running code is {@link evalCode}. This shortcut
 * method will evaluate Javascript safely and return the result as a native
 * Javascript value.
 *
 * For more control over the execution environment, or to interact with values
 * inside QuickJS, create a context with {@link newContext} or a runtime with
 * {@link newRuntime}.
 */ class QuickJSWASMModule {
    /** @private */ constructor(module, ffi){
        this.module = module;
        this.ffi = ffi;
        this.callbacks = new QuickJSModuleCallbacks(module);
    }
    /**
     * Create a runtime.
     * Use the runtime to set limits on CPU and memory usage and configure module
     * loading for one or more [[QuickJSContext]]s inside the runtime.
     */ newRuntime(options = {}) {
        const rt = new lifetime_1.Lifetime(this.ffi.QTS_NewRuntime(), undefined, (rt_ptr)=>{
            this.callbacks.deleteRuntime(rt_ptr);
            this.ffi.QTS_FreeRuntime(rt_ptr);
        });
        const runtime = new runtime_1.QuickJSRuntime({
            module: this.module,
            callbacks: this.callbacks,
            ffi: this.ffi,
            rt
        });
        applyBaseRuntimeOptions(runtime, options);
        if (options.moduleLoader) runtime.setModuleLoader(options.moduleLoader);
        return runtime;
    }
    /**
     * A simplified API to create a new [[QuickJSRuntime]] and a
     * [[QuickJSContext]] inside that runtime at the same time. The runtime will
     * be disposed when the context is disposed.
     */ newContext(options = {}) {
        const runtime = this.newRuntime();
        const context = runtime.newContext({
            ...options,
            ownedLifetimes: (0, types_1.concat)(runtime, options.ownedLifetimes)
        });
        runtime.context = context;
        return context;
    }
    /**
     * One-off evaluate code without needing to create a [[QuickJSRuntime]] or
     * [[QuickJSContext]] explicitly.
     *
     * To protect against infinite loops, use the `shouldInterrupt` option. The
     * [[shouldInterruptAfterDeadline]] function will create a time-based deadline.
     *
     * If you need more control over how the code executes, create a
     * [[QuickJSRuntime]] (with [[newRuntime]]) or a [[QuickJSContext]] (with
     * [[newContext]] or [[QuickJSRuntime.newContext]]), and use its
     * [[QuickJSContext.evalCode]] method.
     *
     * Asynchronous callbacks may not run during the first call to `evalCode`. If
     * you need to work with async code inside QuickJS, create a runtime and use
     * [[QuickJSRuntime.executePendingJobs]].
     *
     * @returns The result is coerced to a native Javascript value using JSON
     * serialization, so properties and values unsupported by JSON will be dropped.
     *
     * @throws If `code` throws during evaluation, the exception will be
     * converted into a native Javascript value and thrown.
     *
     * @throws if `options.shouldInterrupt` interrupted execution, will throw a Error
     * with name `"InternalError"` and  message `"interrupted"`.
     */ evalCode(code, options = {}) {
        return lifetime_1.Scope.withScope((scope)=>{
            const vm = scope.manage(this.newContext());
            applyModuleEvalRuntimeOptions(vm.runtime, options);
            const result = vm.evalCode(code, "eval.js");
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
    /**
     * Get a low-level interface to the QuickJS functions in this WebAssembly
     * module.
     * @experimental
     * @unstable No warranty is provided with this API. It could change at any time.
     * @private
     */ getFFI() {
        return this.ffi;
    }
}
exports.QuickJSWASMModule = QuickJSWASMModule;

},{"1247ef72a38c1daf":"2VzQq","d68c8006516a58b7":"7YGVe","3e94ed68be82a0f6":"lGIpe","8f250f9d36dd59eb":"8lVAz","8bf1c4c9e4378412":"kF6qe"}],"8lVAz":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.QuickJSRuntime = void 0;
const asyncify_helpers_1 = require("a315967a2ce4b8f9");
const context_1 = require("f5f329979240e3fe");
const debug_1 = require("d2e275927eff09e1");
const errors_1 = require("50e4339fb385c3dd");
const lifetime_1 = require("dc40c94203fca27f");
const memory_1 = require("933a8fb2be0bc2af");
const types_1 = require("de67e449a694abc5");
/**
 * A runtime represents a Javascript runtime corresponding to an object heap.
 * Several runtimes can exist at the same time but they cannot exchange objects.
 * Inside a given runtime, no multi-threading is supported.
 *
 * You can think of separate runtimes like different domains in a browser, and
 * the contexts within a runtime like the different windows open to the same
 * domain.
 *
 * Create a runtime via {@link QuickJSWASMModule.newRuntime}.
 *
 * You should create separate runtime instances for untrusted code from
 * different sources for isolation. However, stronger isolation is also
 * available (at the cost of memory usage), by creating separate WebAssembly
 * modules to further isolate untrusted code.
 * See {@link newQuickJSWASMModule}.
 *
 * Implement memory and CPU constraints with [[setInterruptHandler]]
 * (called regularly while the interpreter runs), [[setMemoryLimit]], and
 * [[setMaxStackSize]].
 * Use [[computeMemoryUsage]] or [[dumpMemoryUsage]] to guide memory limit
 * tuning.
 *
 * Configure ES module loading with [[setModuleLoader]].
 */ class QuickJSRuntime {
    /** @private */ constructor(args){
        /** @private */ this.scope = new lifetime_1.Scope();
        /** @private */ this.contextMap = new Map();
        this.cToHostCallbacks = {
            shouldInterrupt: (rt)=>{
                if (rt !== this.rt.value) throw new Error("QuickJSContext instance received C -> JS interrupt with mismatched rt");
                const fn = this.interruptHandler;
                if (!fn) throw new Error("QuickJSContext had no interrupt handler");
                return fn(this) ? 1 : 0;
            },
            loadModuleSource: (0, asyncify_helpers_1.maybeAsyncFn)(this, function*(awaited, rt, ctx, moduleName) {
                const moduleLoader = this.moduleLoader;
                if (!moduleLoader) throw new Error("Runtime has no module loader");
                if (rt !== this.rt.value) throw new Error("Runtime pointer mismatch");
                const context = this.contextMap.get(ctx) ?? this.newContext({
                    contextPointer: ctx
                });
                try {
                    const result = yield* awaited(moduleLoader(moduleName, context));
                    if (typeof result === "object" && "error" in result && result.error) {
                        (0, debug_1.debugLog)("cToHostLoadModule: loader returned error", result.error);
                        throw result.error;
                    }
                    const moduleSource = typeof result === "string" ? result : "value" in result ? result.value : result;
                    return this.memory.newHeapCharPointer(moduleSource).value;
                } catch (error) {
                    (0, debug_1.debugLog)("cToHostLoadModule: caught error", error);
                    context.throw(error);
                    return 0;
                }
            }),
            normalizeModule: (0, asyncify_helpers_1.maybeAsyncFn)(this, function*(awaited, rt, ctx, baseModuleName, moduleNameRequest) {
                const moduleNormalizer = this.moduleNormalizer;
                if (!moduleNormalizer) throw new Error("Runtime has no module normalizer");
                if (rt !== this.rt.value) throw new Error("Runtime pointer mismatch");
                const context = this.contextMap.get(ctx) ?? this.newContext({
                    /* TODO: Does this happen? Are we responsible for disposing? I don't think so */ contextPointer: ctx
                });
                try {
                    const result = yield* awaited(moduleNormalizer(baseModuleName, moduleNameRequest, context));
                    if (typeof result === "object" && "error" in result && result.error) {
                        (0, debug_1.debugLog)("cToHostNormalizeModule: normalizer returned error", result.error);
                        throw result.error;
                    }
                    const name = typeof result === "string" ? result : result.value;
                    return context.getMemory(this.rt.value).newHeapCharPointer(name).value;
                } catch (error) {
                    (0, debug_1.debugLog)("normalizeModule: caught error", error);
                    context.throw(error);
                    return 0;
                }
            })
        };
        args.ownedLifetimes?.forEach((lifetime)=>this.scope.manage(lifetime));
        this.module = args.module;
        this.memory = new memory_1.ModuleMemory(this.module);
        this.ffi = args.ffi;
        this.rt = args.rt;
        this.callbacks = args.callbacks;
        this.scope.manage(this.rt);
        this.callbacks.setRuntimeCallbacks(this.rt.value, this.cToHostCallbacks);
        this.executePendingJobs = this.executePendingJobs.bind(this);
    }
    get alive() {
        return this.scope.alive;
    }
    dispose() {
        return this.scope.dispose();
    }
    newContext(options = {}) {
        if (options.intrinsics && options.intrinsics !== types_1.DefaultIntrinsics) throw new Error("TODO: Custom intrinsics are not supported yet");
        const ctx = new lifetime_1.Lifetime(options.contextPointer || this.ffi.QTS_NewContext(this.rt.value), undefined, (ctx_ptr)=>{
            this.contextMap.delete(ctx_ptr);
            this.callbacks.deleteContext(ctx_ptr);
            this.ffi.QTS_FreeContext(ctx_ptr);
        });
        const context = new context_1.QuickJSContext({
            module: this.module,
            ctx,
            ffi: this.ffi,
            rt: this.rt,
            ownedLifetimes: options.ownedLifetimes,
            runtime: this,
            callbacks: this.callbacks
        });
        this.contextMap.set(ctx.value, context);
        return context;
    }
    /**
     * Set the loader for EcmaScript modules requested by any context in this
     * runtime.
     *
     * The loader can be removed with [[removeModuleLoader]].
     */ setModuleLoader(moduleLoader, moduleNormalizer) {
        this.moduleLoader = moduleLoader;
        this.moduleNormalizer = moduleNormalizer;
        this.ffi.QTS_RuntimeEnableModuleLoader(this.rt.value, this.moduleNormalizer ? 1 : 0);
    }
    /**
     * Remove the the loader set by [[setModuleLoader]]. This disables module loading.
     */ removeModuleLoader() {
        this.moduleLoader = undefined;
        this.ffi.QTS_RuntimeDisableModuleLoader(this.rt.value);
    }
    // Runtime management -------------------------------------------------------
    /**
     * In QuickJS, promises and async functions create pendingJobs. These do not execute
     * immediately and need to be run by calling [[executePendingJobs]].
     *
     * @return true if there is at least one pendingJob queued up.
     */ hasPendingJob() {
        return Boolean(this.ffi.QTS_IsJobPending(this.rt.value));
    }
    /**
     * Set a callback which is regularly called by the QuickJS engine when it is
     * executing code. This callback can be used to implement an execution
     * timeout.
     *
     * The interrupt handler can be removed with [[removeInterruptHandler]].
     */ setInterruptHandler(cb) {
        const prevInterruptHandler = this.interruptHandler;
        this.interruptHandler = cb;
        if (!prevInterruptHandler) this.ffi.QTS_RuntimeEnableInterruptHandler(this.rt.value);
    }
    /**
     * Remove the interrupt handler, if any.
     * See [[setInterruptHandler]].
     */ removeInterruptHandler() {
        if (this.interruptHandler) {
            this.ffi.QTS_RuntimeDisableInterruptHandler(this.rt.value);
            this.interruptHandler = undefined;
        }
    }
    /**
     * Execute pendingJobs on the runtime until `maxJobsToExecute` jobs are
     * executed (default all pendingJobs), the queue is exhausted, or the runtime
     * encounters an exception.
     *
     * In QuickJS, promises and async functions *inside the runtime* create
     * pendingJobs. These do not execute immediately and need to triggered to run.
     *
     * @param maxJobsToExecute - When negative, run all pending jobs. Otherwise execute
     * at most `maxJobsToExecute` before returning.
     *
     * @return On success, the number of executed jobs. On error, the exception
     * that stopped execution, and the context it occurred in. Note that
     * executePendingJobs will not normally return errors thrown inside async
     * functions or rejected promises. Those errors are available by calling
     * [[resolvePromise]] on the promise handle returned by the async function.
     */ executePendingJobs(maxJobsToExecute = -1) {
        const ctxPtrOut = this.memory.newMutablePointerArray(1);
        const valuePtr = this.ffi.QTS_ExecutePendingJob(this.rt.value, maxJobsToExecute ?? -1, ctxPtrOut.value.ptr);
        const ctxPtr = ctxPtrOut.value.typedArray[0];
        ctxPtrOut.dispose();
        if (ctxPtr === 0) {
            // No jobs executed.
            this.ffi.QTS_FreeValuePointerRuntime(this.rt.value, valuePtr);
            return {
                value: 0
            };
        }
        const context = this.contextMap.get(ctxPtr) ?? this.newContext({
            contextPointer: ctxPtr
        });
        const resultValue = context.getMemory(this.rt.value).heapValueHandle(valuePtr);
        const typeOfRet = context.typeof(resultValue);
        if (typeOfRet === "number") {
            const executedJobs = context.getNumber(resultValue);
            resultValue.dispose();
            return {
                value: executedJobs
            };
        } else {
            const error = Object.assign(resultValue, {
                context
            });
            return {
                error
            };
        }
    }
    /**
     * Set the max memory this runtime can allocate.
     * To remove the limit, set to `-1`.
     */ setMemoryLimit(limitBytes) {
        if (limitBytes < 0 && limitBytes !== -1) throw new Error("Cannot set memory limit to negative number. To unset, pass -1");
        this.ffi.QTS_RuntimeSetMemoryLimit(this.rt.value, limitBytes);
    }
    /**
     * Compute memory usage for this runtime. Returns the result as a handle to a
     * JSValue object. Use [[QuickJSContext.dump]] to convert to a native object.
     * Calling this method will allocate more memory inside the runtime. The information
     * is accurate as of just before the call to `computeMemoryUsage`.
     * For a human-digestible representation, see [[dumpMemoryUsage]].
     */ computeMemoryUsage() {
        const serviceContextMemory = this.getSystemContext().getMemory(this.rt.value);
        return serviceContextMemory.heapValueHandle(this.ffi.QTS_RuntimeComputeMemoryUsage(this.rt.value, serviceContextMemory.ctx.value));
    }
    /**
     * @returns a human-readable description of memory usage in this runtime.
     * For programmatic access to this information, see [[computeMemoryUsage]].
     */ dumpMemoryUsage() {
        return this.memory.consumeHeapCharPointer(this.ffi.QTS_RuntimeDumpMemoryUsage(this.rt.value));
    }
    /**
     * Set the max stack size for this runtime, in bytes.
     * To remove the limit, set to `0`.
     */ setMaxStackSize(stackSize) {
        if (stackSize < 0) throw new Error("Cannot set memory limit to negative number. To unset, pass 0.");
        this.ffi.QTS_RuntimeSetMaxStackSize(this.rt.value, stackSize);
    }
    /**
     * Assert that `handle` is owned by this runtime.
     * @throws QuickJSWrongOwner if owned by a different runtime.
     */ assertOwned(handle) {
        if (handle.owner && handle.owner.rt !== this.rt) throw new errors_1.QuickJSWrongOwner(`Handle is not owned by this runtime: ${handle.owner.rt.value} != ${this.rt.value}`);
    }
    getSystemContext() {
        if (!this.context) // We own this context and should dispose of it.
        this.context = this.scope.manage(this.newContext());
        return this.context;
    }
}
exports.QuickJSRuntime = QuickJSRuntime;

},{"a315967a2ce4b8f9":"5nzJy","f5f329979240e3fe":"9Pcha","d2e275927eff09e1":"2VzQq","50e4339fb385c3dd":"7YGVe","dc40c94203fca27f":"lGIpe","933a8fb2be0bc2af":"73ydf","de67e449a694abc5":"kF6qe"}],"9Pcha":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.QuickJSContext = void 0;
const debug_1 = require("cbb831b936b4a48");
const deferred_promise_1 = require("d76d4ccfbcd779e5");
const errors_1 = require("d816b51d8e87768c");
const lifetime_1 = require("9ea32ad70116dd42");
const memory_1 = require("9f83d166e510b007");
const types_1 = require("8d5aa18a80862f9a");
/**
 * @private
 */ class ContextMemory extends memory_1.ModuleMemory {
    /** @private */ constructor(args){
        super(args.module);
        this.scope = new lifetime_1.Scope();
        this.copyJSValue = (ptr)=>{
            return this.ffi.QTS_DupValuePointer(this.ctx.value, ptr);
        };
        this.freeJSValue = (ptr)=>{
            this.ffi.QTS_FreeValuePointer(this.ctx.value, ptr);
        };
        args.ownedLifetimes?.forEach((lifetime)=>this.scope.manage(lifetime));
        this.owner = args.owner;
        this.module = args.module;
        this.ffi = args.ffi;
        this.rt = args.rt;
        this.ctx = this.scope.manage(args.ctx);
    }
    get alive() {
        return this.scope.alive;
    }
    dispose() {
        return this.scope.dispose();
    }
    /**
     * Track `lifetime` so that it is disposed when this scope is disposed.
     */ manage(lifetime) {
        return this.scope.manage(lifetime);
    }
    consumeJSCharPointer(ptr) {
        const str = this.module.UTF8ToString(ptr);
        this.ffi.QTS_FreeCString(this.ctx.value, ptr);
        return str;
    }
    heapValueHandle(ptr) {
        return new lifetime_1.Lifetime(ptr, this.copyJSValue, this.freeJSValue, this.owner);
    }
}
/**
 * QuickJSContext wraps a QuickJS Javascript context (JSContext*) within a
 * runtime. The contexts within the same runtime may exchange objects freely.
 * You can think of separate runtimes like different domains in a browser, and
 * the contexts within a runtime like the different windows open to the same
 * domain. The {@link runtime} references the context's runtime.
 *
 * This class's methods return {@link QuickJSHandle}, which wrap C pointers (JSValue*).
 * It's the caller's responsibility to call `.dispose()` on any
 * handles you create to free memory once you're done with the handle.
 *
 * Use {@link QuickJSRuntime.newContext} or {@link QuickJSWASMModule.newContext}
 * to create a new QuickJSContext.
 *
 * Create QuickJS values inside the interpreter with methods like
 * [[newNumber]], [[newString]], [[newArray]], [[newObject]],
 * [[newFunction]], and [[newPromise]].
 *
 * Call [[setProp]] or [[defineProp]] to customize objects. Use those methods
 * with [[global]] to expose the values you create to the interior of the
 * interpreter, so they can be used in [[evalCode]].
 *
 * Use [[evalCode]] or [[callFunction]] to execute Javascript inside the VM. If
 * you're using asynchronous code inside the QuickJSContext, you may need to also
 * call [[executePendingJobs]]. Executing code inside the runtime returns a
 * result object representing successful execution or an error. You must dispose
 * of any such results to avoid leaking memory inside the VM.
 *
 * Implement memory and CPU constraints at the runtime level, using [[runtime]].
 * See {@link QuickJSRuntime} for more information.
 *
 */ // TODO: Manage own callback registration
class QuickJSContext {
    /**
     * Use {@link QuickJS.createVm} to create a QuickJSContext instance.
     */ constructor(args){
        /** @private */ this._undefined = undefined;
        /** @private */ this._null = undefined;
        /** @private */ this._false = undefined;
        /** @private */ this._true = undefined;
        /** @private */ this._global = undefined;
        /** @private */ this._BigInt = undefined;
        /** @private */ this.fnNextId = -32768; // min value of signed 16bit int used by Quickjs
        /** @private */ this.fnMaps = new Map();
        /**
         * @hidden
         */ this.cToHostCallbacks = {
            callFunction: (ctx, this_ptr, argc, argv, fn_id)=>{
                if (ctx !== this.ctx.value) throw new Error("QuickJSContext instance received C -> JS call with mismatched ctx");
                const fn = this.getFunction(fn_id);
                if (!fn) // this "throw" is not catch-able from the TS side. could we somehow handle this higher up?
                throw new Error(`QuickJSContext had no callback with id ${fn_id}`);
                return lifetime_1.Scope.withScopeMaybeAsync(this, function*(awaited, scope) {
                    const thisHandle = scope.manage(new lifetime_1.WeakLifetime(this_ptr, this.memory.copyJSValue, this.memory.freeJSValue, this.runtime));
                    const argHandles = new Array(argc);
                    for(let i = 0; i < argc; i++){
                        const ptr = this.ffi.QTS_ArgvGetJSValueConstPointer(argv, i);
                        argHandles[i] = scope.manage(new lifetime_1.WeakLifetime(ptr, this.memory.copyJSValue, this.memory.freeJSValue, this.runtime));
                    }
                    try {
                        const result = yield* awaited(fn.apply(thisHandle, argHandles));
                        if (result) {
                            if ("error" in result && result.error) {
                                (0, debug_1.debugLog)("throw error", result.error);
                                throw result.error;
                            }
                            const handle = scope.manage(result instanceof lifetime_1.Lifetime ? result : result.value);
                            return this.ffi.QTS_DupValuePointer(this.ctx.value, handle.value);
                        }
                        return 0;
                    } catch (error) {
                        return this.errorToHandle(error).consume((errorHandle)=>this.ffi.QTS_Throw(this.ctx.value, errorHandle.value));
                    }
                });
            }
        };
        this.runtime = args.runtime;
        this.module = args.module;
        this.ffi = args.ffi;
        this.rt = args.rt;
        this.ctx = args.ctx;
        this.memory = new ContextMemory({
            ...args,
            owner: this.runtime
        });
        args.callbacks.setContextCallbacks(this.ctx.value, this.cToHostCallbacks);
        this.dump = this.dump.bind(this);
        this.getString = this.getString.bind(this);
        this.getNumber = this.getNumber.bind(this);
        this.resolvePromise = this.resolvePromise.bind(this);
    }
    // @implement Disposable ----------------------------------------------------
    get alive() {
        return this.memory.alive;
    }
    /**
     * Dispose of this VM's underlying resources.
     *
     * @throws Calling this method without disposing of all created handles
     * will result in an error.
     */ dispose() {
        this.memory.dispose();
    }
    // Globals ------------------------------------------------------------------
    /**
     * [`undefined`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined).
     */ get undefined() {
        if (this._undefined) return this._undefined;
        // Undefined is a constant, immutable value in QuickJS.
        const ptr = this.ffi.QTS_GetUndefined();
        return this._undefined = new lifetime_1.StaticLifetime(ptr);
    }
    /**
     * [`null`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null).
     */ get null() {
        if (this._null) return this._null;
        // Null is a constant, immutable value in QuickJS.
        const ptr = this.ffi.QTS_GetNull();
        return this._null = new lifetime_1.StaticLifetime(ptr);
    }
    /**
     * [`true`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/true).
     */ get true() {
        if (this._true) return this._true;
        // True is a constant, immutable value in QuickJS.
        const ptr = this.ffi.QTS_GetTrue();
        return this._true = new lifetime_1.StaticLifetime(ptr);
    }
    /**
     * [`false`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/false).
     */ get false() {
        if (this._false) return this._false;
        // False is a constant, immutable value in QuickJS.
        const ptr = this.ffi.QTS_GetFalse();
        return this._false = new lifetime_1.StaticLifetime(ptr);
    }
    /**
     * [`global`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects).
     * A handle to the global object inside the interpreter.
     * You can set properties to create global variables.
     */ get global() {
        if (this._global) return this._global;
        // The global is a JSValue, but since it's lifetime is as long as the VM's,
        // we should manage it.
        const ptr = this.ffi.QTS_GetGlobalObject(this.ctx.value);
        // Automatically clean up this reference when we dispose
        this.memory.manage(this.memory.heapValueHandle(ptr));
        // This isn't technically a static lifetime, but since it has the same
        // lifetime as the VM, it's okay to fake one since when the VM is
        // disposed, no other functions will accept the value.
        this._global = new lifetime_1.StaticLifetime(ptr, this.runtime);
        return this._global;
    }
    // New values ---------------------------------------------------------------
    /**
     * Converts a Javascript number into a QuickJS value.
     */ newNumber(num) {
        return this.memory.heapValueHandle(this.ffi.QTS_NewFloat64(this.ctx.value, num));
    }
    /**
     * Create a QuickJS [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) value.
     */ newString(str) {
        const ptr = this.memory.newHeapCharPointer(str).consume((charHandle)=>this.ffi.QTS_NewString(this.ctx.value, charHandle.value));
        return this.memory.heapValueHandle(ptr);
    }
    /**
     * Create a QuickJS [symbol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol) value.
     * No two symbols created with this function will be the same value.
     */ newUniqueSymbol(description) {
        const key = (typeof description === "symbol" ? description.description : description) ?? "";
        const ptr = this.memory.newHeapCharPointer(key).consume((charHandle)=>this.ffi.QTS_NewSymbol(this.ctx.value, charHandle.value, 0));
        return this.memory.heapValueHandle(ptr);
    }
    /**
     * Get a symbol from the [global registry](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol#shared_symbols_in_the_global_symbol_registry) for the given key.
     * All symbols created with the same key will be the same value.
     */ newSymbolFor(key) {
        const description = (typeof key === "symbol" ? key.description : key) ?? "";
        const ptr = this.memory.newHeapCharPointer(description).consume((charHandle)=>this.ffi.QTS_NewSymbol(this.ctx.value, charHandle.value, 1));
        return this.memory.heapValueHandle(ptr);
    }
    /**
     * Create a QuickJS [bigint](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) value.
     */ newBigInt(num) {
        if (!this._BigInt) {
            const bigIntHandle = this.getProp(this.global, "BigInt");
            this.memory.manage(bigIntHandle);
            this._BigInt = new lifetime_1.StaticLifetime(bigIntHandle.value, this.runtime);
        }
        const bigIntHandle = this._BigInt;
        const asString = String(num);
        return this.newString(asString).consume((handle)=>this.unwrapResult(this.callFunction(bigIntHandle, this.undefined, handle)));
    }
    /**
     * `{}`.
     * Create a new QuickJS [object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer).
     *
     * @param prototype - Like [`Object.create`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create).
     */ newObject(prototype) {
        if (prototype) this.runtime.assertOwned(prototype);
        const ptr = prototype ? this.ffi.QTS_NewObjectProto(this.ctx.value, prototype.value) : this.ffi.QTS_NewObject(this.ctx.value);
        return this.memory.heapValueHandle(ptr);
    }
    /**
     * `[]`.
     * Create a new QuickJS [array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array).
     */ newArray() {
        const ptr = this.ffi.QTS_NewArray(this.ctx.value);
        return this.memory.heapValueHandle(ptr);
    }
    newPromise(value) {
        const deferredPromise = lifetime_1.Scope.withScope((scope)=>{
            const mutablePointerArray = scope.manage(this.memory.newMutablePointerArray(2));
            const promisePtr = this.ffi.QTS_NewPromiseCapability(this.ctx.value, mutablePointerArray.value.ptr);
            const promiseHandle = this.memory.heapValueHandle(promisePtr);
            const [resolveHandle, rejectHandle] = Array.from(mutablePointerArray.value.typedArray).map((jsvaluePtr)=>this.memory.heapValueHandle(jsvaluePtr));
            return new deferred_promise_1.QuickJSDeferredPromise({
                context: this,
                promiseHandle,
                resolveHandle,
                rejectHandle
            });
        });
        if (value && typeof value === "function") value = new Promise(value);
        if (value) Promise.resolve(value).then(deferredPromise.resolve, (error)=>error instanceof lifetime_1.Lifetime ? deferredPromise.reject(error) : this.newError(error).consume(deferredPromise.reject));
        return deferredPromise;
    }
    /**
     * Convert a Javascript function into a QuickJS function value.
     * See [[VmFunctionImplementation]] for more details.
     *
     * A [[VmFunctionImplementation]] should not free its arguments or its return
     * value. A VmFunctionImplementation should also not retain any references to
     * its return value.
     *
     * To implement an async function, create a promise with [[newPromise]], then
     * return the deferred promise handle from `deferred.handle` from your
     * function implementation:
     *
     * ```
     * const deferred = vm.newPromise()
     * someNativeAsyncFunction().then(deferred.resolve)
     * return deferred.handle
     * ```
     */ newFunction(name, fn) {
        const fnId = ++this.fnNextId;
        this.setFunction(fnId, fn);
        return this.memory.heapValueHandle(this.ffi.QTS_NewFunction(this.ctx.value, fnId, name));
    }
    newError(error) {
        const errorHandle = this.memory.heapValueHandle(this.ffi.QTS_NewError(this.ctx.value));
        if (error && typeof error === "object") {
            if (error.name !== undefined) this.newString(error.name).consume((handle)=>this.setProp(errorHandle, "name", handle));
            if (error.message !== undefined) this.newString(error.message).consume((handle)=>this.setProp(errorHandle, "message", handle));
        } else if (typeof error === "string") this.newString(error).consume((handle)=>this.setProp(errorHandle, "message", handle));
        else if (error !== undefined) // This isn't supported in the type signature but maybe it will make life easier.
        this.newString(String(error)).consume((handle)=>this.setProp(errorHandle, "message", handle));
        return errorHandle;
    }
    // Read values --------------------------------------------------------------
    /**
     * `typeof` operator. **Not** [standards compliant](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof).
     *
     * @remarks
     * Does not support BigInt values correctly.
     */ typeof(handle) {
        this.runtime.assertOwned(handle);
        return this.memory.consumeHeapCharPointer(this.ffi.QTS_Typeof(this.ctx.value, handle.value));
    }
    /**
     * Converts `handle` into a Javascript number.
     * @returns `NaN` on error, otherwise a `number`.
     */ getNumber(handle) {
        this.runtime.assertOwned(handle);
        return this.ffi.QTS_GetFloat64(this.ctx.value, handle.value);
    }
    /**
     * Converts `handle` to a Javascript string.
     */ getString(handle) {
        this.runtime.assertOwned(handle);
        return this.memory.consumeJSCharPointer(this.ffi.QTS_GetString(this.ctx.value, handle.value));
    }
    /**
     * Converts `handle` into a Javascript symbol. If the symbol is in the global
     * registry in the guest, it will be created with Symbol.for on the host.
     */ getSymbol(handle) {
        this.runtime.assertOwned(handle);
        const key = this.memory.consumeJSCharPointer(this.ffi.QTS_GetSymbolDescriptionOrKey(this.ctx.value, handle.value));
        const isGlobal = this.ffi.QTS_IsGlobalSymbol(this.ctx.value, handle.value);
        return isGlobal ? Symbol.for(key) : Symbol(key);
    }
    /**
     * Converts `handle` to a Javascript bigint.
     */ getBigInt(handle) {
        this.runtime.assertOwned(handle);
        const asString = this.getString(handle);
        return BigInt(asString);
    }
    /**
     * `Promise.resolve(value)`.
     * Convert a handle containing a Promise-like value inside the VM into an
     * actual promise on the host.
     *
     * @remarks
     * You may need to call [[executePendingJobs]] to ensure that the promise is resolved.
     *
     * @param promiseLikeHandle - A handle to a Promise-like value with a `.then(onSuccess, onError)` method.
     */ resolvePromise(promiseLikeHandle) {
        this.runtime.assertOwned(promiseLikeHandle);
        const vmResolveResult = lifetime_1.Scope.withScope((scope)=>{
            const vmPromise = scope.manage(this.getProp(this.global, "Promise"));
            const vmPromiseResolve = scope.manage(this.getProp(vmPromise, "resolve"));
            return this.callFunction(vmPromiseResolve, vmPromise, promiseLikeHandle);
        });
        if (vmResolveResult.error) return Promise.resolve(vmResolveResult);
        return new Promise((resolve)=>{
            lifetime_1.Scope.withScope((scope)=>{
                const resolveHandle = scope.manage(this.newFunction("resolve", (value)=>{
                    resolve({
                        value: value && value.dup()
                    });
                }));
                const rejectHandle = scope.manage(this.newFunction("reject", (error)=>{
                    resolve({
                        error: error && error.dup()
                    });
                }));
                const promiseHandle = scope.manage(vmResolveResult.value);
                const promiseThenHandle = scope.manage(this.getProp(promiseHandle, "then"));
                this.unwrapResult(this.callFunction(promiseThenHandle, promiseHandle, resolveHandle, rejectHandle)).dispose();
            });
        });
    }
    // Properties ---------------------------------------------------------------
    /**
     * `handle[key]`.
     * Get a property from a JSValue.
     *
     * @param key - The property may be specified as a JSValue handle, or as a
     * Javascript string (which will be converted automatically).
     */ getProp(handle, key) {
        this.runtime.assertOwned(handle);
        const ptr = this.borrowPropertyKey(key).consume((quickJSKey)=>this.ffi.QTS_GetProp(this.ctx.value, handle.value, quickJSKey.value));
        const result = this.memory.heapValueHandle(ptr);
        return result;
    }
    /**
     * `handle[key] = value`.
     * Set a property on a JSValue.
     *
     * @remarks
     * Note that the QuickJS authors recommend using [[defineProp]] to define new
     * properties.
     *
     * @param key - The property may be specified as a JSValue handle, or as a
     * Javascript string or number (which will be converted automatically to a JSValue).
     */ setProp(handle, key, value) {
        this.runtime.assertOwned(handle);
        // free newly allocated value if key was a string or number. No-op if string was already
        // a QuickJS handle.
        this.borrowPropertyKey(key).consume((quickJSKey)=>this.ffi.QTS_SetProp(this.ctx.value, handle.value, quickJSKey.value, value.value));
    }
    /**
     * [`Object.defineProperty(handle, key, descriptor)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty).
     *
     * @param key - The property may be specified as a JSValue handle, or as a
     * Javascript string or number (which will be converted automatically to a JSValue).
     */ defineProp(handle, key, descriptor) {
        this.runtime.assertOwned(handle);
        lifetime_1.Scope.withScope((scope)=>{
            const quickJSKey = scope.manage(this.borrowPropertyKey(key));
            const value = descriptor.value || this.undefined;
            const configurable = Boolean(descriptor.configurable);
            const enumerable = Boolean(descriptor.enumerable);
            const hasValue = Boolean(descriptor.value);
            const get = descriptor.get ? scope.manage(this.newFunction(descriptor.get.name, descriptor.get)) : this.undefined;
            const set = descriptor.set ? scope.manage(this.newFunction(descriptor.set.name, descriptor.set)) : this.undefined;
            this.ffi.QTS_DefineProp(this.ctx.value, handle.value, quickJSKey.value, value.value, get.value, set.value, configurable, enumerable, hasValue);
        });
    }
    // Evaluation ---------------------------------------------------------------
    /**
     * [`func.call(thisVal, ...args)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call).
     * Call a JSValue as a function.
     *
     * See [[unwrapResult]], which will throw if the function returned an error, or
     * return the result handle directly. If evaluation returned a handle containing
     * a promise, use [[resolvePromise]] to convert it to a native promise and
     * [[executePendingJobs]] to finish evaluating the promise.
     *
     * @returns A result. If the function threw synchronously, `result.error` be a
     * handle to the exception. Otherwise `result.value` will be a handle to the
     * value.
     */ callFunction(func, thisVal, ...args) {
        this.runtime.assertOwned(func);
        const resultPtr = this.memory.toPointerArray(args).consume((argsArrayPtr)=>this.ffi.QTS_Call(this.ctx.value, func.value, thisVal.value, args.length, argsArrayPtr.value));
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
     * Like [`eval(code)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval#Description).
     * Evaluates the Javascript source `code` in the global scope of this VM.
     * When working with async code, you many need to call [[executePendingJobs]]
     * to execute callbacks pending after synchronous evaluation returns.
     *
     * See [[unwrapResult]], which will throw if the function returned an error, or
     * return the result handle directly. If evaluation returned a handle containing
     * a promise, use [[resolvePromise]] to convert it to a native promise and
     * [[executePendingJobs]] to finish evaluating the promise.
     *
     * *Note*: to protect against infinite loops, provide an interrupt handler to
     * [[setInterruptHandler]]. You can use [[shouldInterruptAfterDeadline]] to
     * create a time-based deadline.
     *
     * @returns The last statement's value. If the code threw synchronously,
     * `result.error` will be a handle to the exception. If execution was
     * interrupted, the error will have name `InternalError` and message
     * `interrupted`.
     */ evalCode(code, filename = "eval.js", /**
     * If no options are passed, a heuristic will be used to detect if `code` is
     * an ES module.
     *
     * See [[EvalFlags]] for number semantics.
     */ options) {
        const detectModule = options === undefined ? 1 : 0;
        const flags = (0, types_1.evalOptionsToFlags)(options);
        const resultPtr = this.memory.newHeapCharPointer(code).consume((charHandle)=>this.ffi.QTS_Eval(this.ctx.value, charHandle.value, filename, detectModule, flags));
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
     * Throw an error in the VM, interrupted whatever current execution is in progress when execution resumes.
     * @experimental
     */ throw(error) {
        return this.errorToHandle(error).consume((handle)=>this.ffi.QTS_Throw(this.ctx.value, handle.value));
    }
    /**
     * @private
     */ borrowPropertyKey(key) {
        if (typeof key === "number") return this.newNumber(key);
        if (typeof key === "string") return this.newString(key);
        // key is already a JSValue, but we're borrowing it. Return a static handle
        // for internal use only.
        return new lifetime_1.StaticLifetime(key.value, this.runtime);
    }
    /**
     * @private
     */ getMemory(rt) {
        if (rt === this.rt.value) return this.memory;
        else throw new Error("Private API. Cannot get memory from a different runtime");
    }
    // Utilities ----------------------------------------------------------------
    /**
     * Dump a JSValue to Javascript in a best-effort fashion.
     * Returns `handle.toString()` if it cannot be serialized to JSON.
     */ dump(handle) {
        this.runtime.assertOwned(handle);
        const type = this.typeof(handle);
        if (type === "string") return this.getString(handle);
        else if (type === "number") return this.getNumber(handle);
        else if (type === "bigint") return this.getBigInt(handle);
        else if (type === "undefined") return undefined;
        else if (type === "symbol") return this.getSymbol(handle);
        const str = this.memory.consumeJSCharPointer(this.ffi.QTS_Dump(this.ctx.value, handle.value));
        try {
            return JSON.parse(str);
        } catch (err) {
            return str;
        }
    }
    /**
     * Unwrap a SuccessOrFail result such as a [[VmCallResult]] or a
     * [[ExecutePendingJobsResult]], where the fail branch contains a handle to a QuickJS error value.
     * If the result is a success, returns the value.
     * If the result is an error, converts the error to a native object and throws the error.
     */ unwrapResult(result) {
        if (result.error) {
            const context = "context" in result.error ? result.error.context : this;
            const cause = result.error.consume((error)=>this.dump(error));
            if (cause && typeof cause === "object" && typeof cause.message === "string") {
                const { message, name, stack } = cause;
                const exception = new errors_1.QuickJSUnwrapError("");
                const hostStack = exception.stack;
                if (typeof name === "string") exception.name = cause.name;
                if (typeof stack === "string") exception.stack = `${name}: ${message}\n${cause.stack}Host: ${hostStack}`;
                Object.assign(exception, {
                    cause,
                    context,
                    message
                });
                throw exception;
            }
            throw new errors_1.QuickJSUnwrapError(cause, context);
        }
        return result.value;
    }
    /** @private */ getFunction(fn_id) {
        const map_id = fn_id >> 8;
        const fnMap = this.fnMaps.get(map_id);
        if (!fnMap) return undefined;
        return fnMap.get(fn_id);
    }
    /** @private */ setFunction(fn_id, handle) {
        const map_id = fn_id >> 8;
        let fnMap = this.fnMaps.get(map_id);
        if (!fnMap) {
            fnMap = new Map();
            this.fnMaps.set(map_id, fnMap);
        }
        return fnMap.set(fn_id, handle);
    }
    errorToHandle(error) {
        if (error instanceof lifetime_1.Lifetime) return error;
        return this.newError(error);
    }
}
exports.QuickJSContext = QuickJSContext;

},{"cbb831b936b4a48":"2VzQq","d76d4ccfbcd779e5":"2uHMB","d816b51d8e87768c":"7YGVe","9ea32ad70116dd42":"lGIpe","9f83d166e510b007":"73ydf","8d5aa18a80862f9a":"kF6qe"}],"73ydf":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ModuleMemory = void 0;
const lifetime_1 = require("b8a3a6df232698f5");
/**
 * @private
 */ class ModuleMemory {
    constructor(module){
        this.module = module;
    }
    toPointerArray(handleArray) {
        const typedArray = new Int32Array(handleArray.map((handle)=>handle.value));
        const numBytes = typedArray.length * typedArray.BYTES_PER_ELEMENT;
        const ptr = this.module._malloc(numBytes);
        var heapBytes = new Uint8Array(this.module.HEAPU8.buffer, ptr, numBytes);
        heapBytes.set(new Uint8Array(typedArray.buffer));
        return new lifetime_1.Lifetime(ptr, undefined, (ptr)=>this.module._free(ptr));
    }
    newMutablePointerArray(length) {
        const zeros = new Int32Array(new Array(length).fill(0));
        const numBytes = zeros.length * zeros.BYTES_PER_ELEMENT;
        const ptr = this.module._malloc(numBytes);
        const typedArray = new Int32Array(this.module.HEAPU8.buffer, ptr, length);
        typedArray.set(zeros);
        return new lifetime_1.Lifetime({
            typedArray,
            ptr
        }, undefined, (value)=>this.module._free(value.ptr));
    }
    newHeapCharPointer(string) {
        const numBytes = this.module.lengthBytesUTF8(string) + 1;
        const ptr = this.module._malloc(numBytes);
        this.module.stringToUTF8(string, ptr, numBytes);
        return new lifetime_1.Lifetime(ptr, undefined, (value)=>this.module._free(value));
    }
    consumeHeapCharPointer(ptr) {
        const str = this.module.UTF8ToString(ptr);
        this.module._free(ptr);
        return str;
    }
}
exports.ModuleMemory = ModuleMemory;

},{"b8a3a6df232698f5":"lGIpe"}],"kF6qe":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.concat = exports.evalOptionsToFlags = exports.DefaultIntrinsics = void 0;
const types_ffi_1 = require("21f161b9617f16fc");
const UnstableSymbol = Symbol("Unstable");
// For informational purposes
const DefaultIntrinsicsList = [
    "BaseObjects",
    "Date",
    "Eval",
    "StringNormalize",
    "RegExp",
    "JSON",
    "Proxy",
    "MapSet",
    "TypedArrays",
    "Promise"
];
/**
 * Work in progress.
 */ exports.DefaultIntrinsics = Symbol("DefaultIntrinsics");
/** Convert [[ContextEvalOptions]] to a bitfield flags */ function evalOptionsToFlags(evalOptions) {
    if (typeof evalOptions === "number") return evalOptions;
    if (evalOptions === undefined) return 0;
    const { type, strict, strip, compileOnly, backtraceBarrier } = evalOptions;
    let flags = 0;
    if (type === "global") flags |= types_ffi_1.EvalFlags.JS_EVAL_TYPE_GLOBAL;
    if (type === "module") flags |= types_ffi_1.EvalFlags.JS_EVAL_TYPE_MODULE;
    if (strict) flags |= types_ffi_1.EvalFlags.JS_EVAL_FLAG_STRICT;
    if (strip) flags |= types_ffi_1.EvalFlags.JS_EVAL_FLAG_STRIP;
    if (compileOnly) flags |= types_ffi_1.EvalFlags.JS_EVAL_FLAG_COMPILE_ONLY;
    if (backtraceBarrier) flags |= types_ffi_1.EvalFlags.JS_EVAL_FLAG_BACKTRACE_BARRIER;
    return flags;
}
exports.evalOptionsToFlags = evalOptionsToFlags;
function concat(...values) {
    let result = [];
    for (const value of values)if (value !== undefined) result = result.concat(value);
    return result;
}
exports.concat = concat;

},{"21f161b9617f16fc":"7RvMi"}],"7RvMi":[function(require,module,exports,__globalThis) {
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.EvalFlags = exports.assertSync = void 0;
function assertSync(fn) {
    return function mustBeSync(...args) {
        const result = fn(...args);
        if (result && typeof result === "object" && result instanceof Promise) throw new Error("Function unexpectedly returned a Promise");
        return result;
    };
}
exports.assertSync = assertSync;
/** Bitfield options for JS_Eval() C function. */ exports.EvalFlags = {
    /** global code (default) */ JS_EVAL_TYPE_GLOBAL: 0,
    /** module code */ JS_EVAL_TYPE_MODULE: 1,
    /** direct call (internal use) */ JS_EVAL_TYPE_DIRECT: 2,
    /** indirect call (internal use) */ JS_EVAL_TYPE_INDIRECT: 3,
    JS_EVAL_TYPE_MASK: 3,
    /** force 'strict' mode */ JS_EVAL_FLAG_STRICT: 8,
    /** force 'strip' mode */ JS_EVAL_FLAG_STRIP: 16,
    /**
     * compile but do not run. The result is an object with a
     * JS_TAG_FUNCTION_BYTECODE or JS_TAG_MODULE tag. It can be executed
     * with JS_EvalFunction().
     */ JS_EVAL_FLAG_COMPILE_ONLY: 32,
    /** don't include the stack frames before this eval in the Error() backtraces */ JS_EVAL_FLAG_BACKTRACE_BARRIER: 64
};

},{}]},["kP48E"], "kP48E", "parcelRequired6b0", {})

//# sourceMappingURL=module.569ad374.js.map
