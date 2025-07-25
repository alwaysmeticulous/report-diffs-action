// Jest global teardown
export default async (): Promise<void> => {
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
  
  // Give a moment for any remaining cleanup
  await new Promise(resolve => setTimeout(resolve, 100));
};