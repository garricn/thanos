// Reuse type declaration from global-setup
declare global {
  var __TEARDOWN_MESSAGE__: string;
}

export default async function () {
  // Clean up any running services
  // Hint: `globalThis` is shared between setup and teardown.
  console.log(globalThis.__TEARDOWN_MESSAGE__);
}
