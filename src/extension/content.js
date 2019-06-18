const {startLinkifyPlusPlus} = require("../shared/main");
const pref = require("./pref");

startLinkifyPlusPlus(async () => {
  await pref.ready;
  await pref.setCurrentScope(location.hostname);
  return pref;
});
