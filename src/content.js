/* global pref prefReady */
const {startLinkifyPlusPlus} = require("./lib/main");

startLinkifyPlusPlus(async () => {
  await prefReady;
  await pref.setCurrentScope(location.hostname);
  return pref;
});
