module.exports = async function () {
  // Put clean up logic here (e.g. stopping services, docker-compose, etc.).
  // Hint: `globalThis` is shared between setup and teardown.
  // eslint-disable-next-line no-console
  console.log(globalThis.__TEARDOWN_MESSAGE__);
};
