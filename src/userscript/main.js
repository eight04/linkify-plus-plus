/* global $inline GM_webextPref */
const prefDefault = require("../shared/pref-default");
const prefBody = require("../shared/pref-body");
const {startLinkifyPlusPlus} = require("../shared/main");

function getMessageFactory() {
  const translate = $inline("../../extension/_locales/en/messages.json|cleanMessage|indent");
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
