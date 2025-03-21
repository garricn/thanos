/* eslint-disable */
// Add type declaration to global scope
declare global {
  var __TEARDOWN_MESSAGE__: string;
}

export default async function () {
  // Start services that the app needs to run
  console.log('\nSetting up...\n');

  // Hint: Use `globalThis` to pass variables to global teardown.
  globalThis.__TEARDOWN_MESSAGE__ = '\nTearing down...\n';
}
