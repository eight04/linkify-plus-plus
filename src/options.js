/* eslint-env webextensions */
/* global pref prefReady */
const {createView} = require("webext-pref/lib/view");
const prefBody = require("./lib/pref-body");

prefReady.then(() => {
  let domain = "";
  
  createView({
    pref,
    body: prefBody(browser.i18n.getMessage),
    root: document.querySelector(".pref-root"),
    getNewScope: () => domain,
    getMessage: (key, params) => {
      return browser.i18n.getMessage(`pref${key[0].toUpperCase()}${key.slice(1)}`, params);
    },
    alert: createDialog("alert"),
    confirm: createDialog("confirm"),
    prompt: createDialog("prompt")
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
  
  function createDialog(type) {
    if (/Chrome\/\d+/.test(navigator.userAgent)) {
      return async (...args) => chrome.extension.getBackgroundPage()[type](...args);
    }
  }
});
