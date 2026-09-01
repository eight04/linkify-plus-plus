const browser = require("webextension-polyfill");
const {createUI, createBinding} = require("webext-pref-ui");
const {createDialogService} = require("webext-dialog");

const prefBody = require("../lib/pref-body");
const pref = require("../lib/extension-pref");

const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const dialog = createDialogService({
  path: "dialog.html",
  getMessage: key => browser.i18n.getMessage(`dialog${cap(key)}`)
});

function cap(s) {
  return s[0].toUpperCase() + s.slice(1);
}

pref.ready.then(() => {
  let domain = "";
  
  const root = document.querySelector(".pref-root");
  
  const getMessage = (key, params) => browser.i18n.getMessage(`pref${cap(key)}`, params);
  
  root.append(createUI({
    body: prefBody(browser.i18n.getMessage),
    getMessage
  }));

  // NOTE: webext-dialog is not supported on mobile, so we don't pass dialog options to createBinding on mobile
  const dialogOptions = isMobile ? {} : {
    alert: dialog.alert,
    confirm: dialog.confirm,
    prompt: dialog.prompt
  };
  
  createBinding({
    pref,
    root,
    getNewScope: () => domain,
    getMessage,
    ...dialogOptions
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
