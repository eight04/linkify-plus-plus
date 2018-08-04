/* global pref prefReady */
const {startLinkifyPlusPlus} = require("./lib/linkify-plus-plus");
prefReady
  .then(() => pref.setCurrentScope(location.hostname))
  .then(() => startLinkifyPlusPlus(pref));
