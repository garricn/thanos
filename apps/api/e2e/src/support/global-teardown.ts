/* eslint-disable */
// Reuse type declaration from global-setup
declare global {
  var __TEARDOWN_MESSAGE__: string;
}

export default async function () {
  // Put clean up logic here (e.g. stopping services, docker-compose, etc.).
  // Hint: `globalThis` is shared between setup and teardown.
  console.log(globalThis.__TEARDOWN_MESSAGE__);
}
