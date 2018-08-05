/* global $inline GM_webextPref */
const prefDefault = require("./lib/pref-default");
const prefBody = require("./lib/pref-body");
const {startLinkifyPlusPlus} = require("./lib/main");

function getMessageFactory() {
  const translate = $inline("../extension/_locale/en/message.json|cleanMessage");
  return key => translate[key];
}

startLinkifyPlusPlus(async () => {
  const pref = GM_webextPref({
    default: prefDefault(),
    body: prefBody(getMessageFactory())
  });
  await pref.ready();
  await pref.setCurrentScope(location.hostname);
  return pref;
});
