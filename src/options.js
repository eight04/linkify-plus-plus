/* global pref prefReady browser */
const {createView} = require("webext-pref/lib/view");
const prefBody = require("./lib/pref-body");


prefReady.then(() => {
  let domain = "";
  
  createView({
    pref,
    body: prefBody(browser.i18n.getMessage),
    root: document.querySelector(".pref-root"),
    translate: {
      inputNewScopeName: "Add new domain"
    },
    getNewScope: () => domain
  });
  
  const port = browser.runtime.connect({
    name: "optionsPage"
  });
  port.onMessage.addListener(message => {
    if (message.method === "domainChange") {
      domain = message.domain;
      pref.setCurrentScope(pref.getScopeList().includes(domain) ? domain : "global");
    }
  });
});
