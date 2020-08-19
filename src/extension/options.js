/* eslint-env webextensions */
const {createUI, createBinding} = require("webext-pref-ui");
const prefBody = require("../lib/pref-body");
const pref = require("../lib/extension-pref");

pref.ready.then(() => {
  let domain = "";
  
  const root = document.querySelector(".pref-root");
  
  root.append(createUI({
    body,
    getMessage
  }));
  
  createBinding({
    pref,
    root,
    getNewScope: () => domain,
    getMessage,
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
  
  function getMessage(key, params) {
    return browser.i18n.getMessage(`pref${key[0].toUpperCase()}${key.slice(1)}`, params);
  }
});
