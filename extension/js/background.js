/* eslint-env webextensions */
let domain = "";
const ports = new Set;

browser.runtime.onConnect.addListener(port => {
  if (port.name !== "optionsPage" || port.error) {
    return;
  }
  ports.add(port);
  port.onDisconnect.addListener(() => ports.delete(port));
  port.postMessage({method: "domainChange", domain});
});

browser.browserAction.onClicked.addListener(tab => {
  const url = new URL(tab.url);
  domain = url.hostname;
  for (const port of ports) {
    port.postMessage({method: "domainChange", domain});
  }
  browser.runtime.openOptionsPage();
});
