import { processedNodes, nodeValidationCache } from "./cache.mjs";
export function validRoot(node, validator) {
  if (processedNodes.has(node)) {
    return false;
  }
  return getValidation(node);

  function getValidation(p) {
    if (!p.parentNode) {
      return false;
    }
    let r = nodeValidationCache.get(p);
    if (r === undefined) {
      if (validator.isIncluded(p)) {
        r = true;
      } else if (validator.isExcluded(p)) {
        r = false;
      } else if (p.parentNode != document.documentElement) {
        r = getValidation(p.parentNode);
      } else {
        r = true;
      }
      nodeValidationCache.set(p, r);
    }
    return r;
  }
}

export function prepareDocument() {
  // wait till everything is ready
  return prepareBody().then(prepareApp);
  
  function prepareApp() {
    const appRoot = document.querySelector("[data-server-rendered]");
    if (!appRoot) {
      return;
    }
    return new Promise(resolve => {
      const onChange = () => {
        if (!appRoot.hasAttribute("data-server-rendered")) {
          resolve();
          observer.disconnect();
        }
      };
      const observer = new MutationObserver(onChange);
      observer.observe(appRoot, {attributes: true});
    });
  }
  
  function prepareBody() {
    if (document.readyState !== "loading") {
      return Promise.resolve();
    }
    return new Promise(resolve => {
      // https://github.com/Tampermonkey/tampermonkey/issues/485
      document.addEventListener("DOMContentLoaded", resolve, {once: true});
    });
  }
}
