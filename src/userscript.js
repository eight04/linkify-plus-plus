// const {createPref, createConfigDialog, createGMStorage} = require("webext-pref");

const prefDefault = require("./lib/pref-default");
const prefBody = require("./lib/pref-body");
const {startLinkifyPlusPlus} = require("./lib/linkify-plus-plus");

function getMessageFactory() {
  const translate = $inline("../extension/_locale/en/message.json|cleanMessage");
  return key => translate["options" + key[0].toUpperCase() + key.slice(1) + "Label"];
}

function main() {
  const pref = GM_webextPref({
    default: prefDefault(),
    body: prefBody(getMessageFactory())
  })
  const linkifyPlusPlus = createLinkifyPlusPlus();
  if (!linkifyPlusPlus) {
    return;
  }
  const pref = createPref(getPrefDefault(), createGMStorage());
  pref.on("change", updateConfig);
  pref.ready()
    .then(() => {
      if (pref.listScopes().includes(location.hostname)) {
        pref.setCurrentScope(location.hostname);
      }
      updateConfig();
      linkifyPlusPlus.start();
    });
    
  GM_addStyle($inline("../node_modules/webext-pref/dialog.css|cssmin|stringify"));
  const configDialog = createConfigDialog({
    title: "Linkify Plus Plus",
    pref,
    view: getPrefView(getLabelFactory())
  });
  unsafeWindow.LPPConfig = configDialog.open;
  if (typeof GM_registerMenuCommand === "function") {
    GM_registerMenuCommand("Linkify Plus Plus - Configure", configDialog.open);
  }
  
  function updateConfig() {
    linkifyPlusPlus.updateConfig(pref.get())
  }
}

main();
