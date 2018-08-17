/* global pref prefReady browser */
const {createView} = require("webext-pref/lib/view");
const prefBody = require("./lib/pref-body");

prefReady.then(() => {
  createView({
    pref,
    body: prefBody(browser.i18n.getMessage),
    root: document.querySelector(".pref-root"),
    translate: {
      inputNewScopeName: "Add new domain"
    },
    getNewScope: () => "www.example.com"
  });
});
