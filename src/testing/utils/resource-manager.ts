export class ResourceManager {
  private timers: Set<NodeJS.Timeout> = new Set();
  private intervals: Set<NodeJS.Timeout> = new Set();
  private abortControllers: Set<AbortController> = new Set();
  private promises: Set<Promise<any>> = new Set();
  private originalSetTimeout: typeof setTimeout;
  private originalSetInterval: typeof setInterval;
  private originalClearTimeout: typeof clearTimeout;
  private originalClearInterval: typeof clearInterval;
  private isTracking = false;

  constructor() {
    this.originalSetTimeout = global.setTimeout;
    this.originalSetInterval = global.setInterval;
    this.originalClearTimeout = global.clearTimeout;
    this.originalClearInterval = global.clearInterval;
  }

  startTracking(): void {
    if (this.isTracking) return;

    const self = this;

    // Override setTimeout to track timers
    global.setTimeout = function(callback: any, delay?: number, ...args: any[]): NodeJS.Timeout {
      const timer = self.originalSetTimeout(callback, delay, ...args);
      self.timers.add(timer);
      return timer;
    } as typeof setTimeout;

    // Override setInterval to track intervals
    global.setInterval = function(callback: any, delay?: number, ...args: any[]): NodeJS.Timeout {
      const interval = self.originalSetInterval(callback, delay, ...args);
      self.intervals.add(interval);
      return interval;
    } as typeof setInterval;

    // Override clearTimeout to stop tracking
    global.clearTimeout = function(timer: any): void {
      self.timers.delete(timer);
      self.originalClearTimeout(timer);
    };

    // Override clearInterval to stop tracking
    global.clearInterval = function(interval: any): void {
      self.intervals.delete(interval);
      self.originalClearInterval(interval);
    };

    this.isTracking = true;
  }

  stopTracking(): void {
    if (!this.isTracking) return;

    global.setTimeout = this.originalSetTimeout;
    global.setInterval = this.originalSetInterval;
    global.clearTimeout = this.originalClearTimeout;
    global.clearInterval = this.originalClearInterval;

    this.isTracking = false;
  }

  trackPromise<T>(promise: Promise<T>): Promise<T> {
    this.promises.add(promise);
    
    // Remove from tracking when settled
    promise.finally(() => {
      this.promises.delete(promise);
    });

    return promise;
  }

  createAbortController(): AbortController {
    const controller = new AbortController();
    this.abortControllers.add(controller);
    return controller;
  }

  async cleanup(): Promise<void> {
    // Stop tracking first to prevent new resources
    this.stopTracking();

    // Clear all timers - use both clearTimeout and clearInterval for safety
    this.timers.forEach(timer => {
      try {
        this.originalClearTimeout(timer);
        this.originalClearInterval(timer as any);
      } catch (error) {
        // Ignore errors clearing timers
      }
    });
    this.timers.clear();

    // Clear all intervals
    this.intervals.forEach(interval => {
      try {
        this.originalClearInterval(interval);
        this.originalClearTimeout(interval as any);
      } catch (error) {
        // Ignore errors clearing intervals
      }
    });
    this.intervals.clear();

    // Abort all pending operations
    this.abortControllers.forEach(controller => {
      try {
        controller.abort();
      } catch (error) {
        // Ignore errors aborting controllers
      }
    });
    this.abortControllers.clear();

    // Wait for remaining promises with timeout
    if (this.promises.size > 0) {
      try {
        const timeoutPromise = new Promise(resolve => {
          this.originalSetTimeout(resolve, 500); // Reduced timeout
        });

        await Promise.race([
          Promise.allSettled([...this.promises]),
          timeoutPromise
        ]);
      } catch (error) {
        // Ignore promise settlement errors
      }
    }
    this.promises.clear();

    // Force clear any remaining timers from the global timer list
    if (typeof (global as any)._getActiveHandles === 'function') {
      const handles = (global as any)._getActiveHandles();
      handles.forEach((handle: any) => {
        if (handle && typeof handle.close === 'function') {
          try {
            handle.close();
          } catch (error) {
            // Ignore errors
          }
        }
      });
    }
  }

  getActiveResourceCount(): {
    timers: number;
    intervals: number;
    promises: number;
    abortControllers: number;
  } {
    return {
      timers: this.timers.size,
      intervals: this.intervals.size,
      promises: this.promises.size,
      abortControllers: this.abortControllers.size,
    };
  }
}

// Global resource manager instance
export const globalResourceManager = new ResourceManager();