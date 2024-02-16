/* global $inline */
const translate = require("../static/_locales/en/messages.json"); // default
const GM_webextPref = require("gm-webext-pref");
const prefDefault = require("../lib/pref-default");
const prefBody = require("../lib/pref-body");
const {startLinkifyPlusPlus} = require("../lib/main");

function getMessageFactory() {
  return (key, params) => {
    if (!params) {
      return translate[key];
    }
    if (!Array.isArray(params)) {
      params = [params];
    }
    return translate[key].replace(/\$\d/g, m => {
      const index = Number(m.slice(1));
      return params[index - 1];
    });
  };
}

startLinkifyPlusPlus(async () => {
  const getMessage = getMessageFactory();
  const pref = GM_webextPref({
    default: prefDefault(),
    body: prefBody(getMessage),
    getMessage,
    getNewScope: () => location.hostname
  });
  await pref.ready();
  await pref.setCurrentScope(location.hostname);
  return pref;
});
