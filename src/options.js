const {createView} = require("webext-pref");
const prefBody = require("./lib/pref-body");

prefReady.then(() => {
  createView({
    pref,
    body: prefBody(browser.i18n.getMessage),
    root: document.querySelector(".pref-root")
  });
});
