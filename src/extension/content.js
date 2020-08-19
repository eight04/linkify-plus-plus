const {startLinkifyPlusPlus} = require("../lib/main");
const pref = require("../lib/extension-pref");

startLinkifyPlusPlus(async () => {
  await pref.ready;
  await pref.setCurrentScope(location.hostname);
  return pref;
});
