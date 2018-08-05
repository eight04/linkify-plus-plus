

function createPref(DEFAULT) {
  let storage;
  let currentScope = "global";
  let scopeList = ["global"];
  const events = new EventLite;
  const globalCache = {};
  let scopedCache = {};
  let currentCache = Object.assign({}, DEFAULT);
  let initializing;
  
  return Object.assign(events, {
    storage,
    ready,
    connect,
    disconnect,
    get,
    getAll,
    set,
    getCurrentScope,
    setCurrentScope,
    addScope,
    deleteScope,
    getScopeList
  });
  
  function connect(_storage) {
    storage = _storage;
    initializing = storage.getMany(
      Object.keys(DEFAULT).map(k => `global/${k}`).concat(["scopeList"])
    )
      .then(updateCache);
    storage.on("change", updateCache);
    return initializing;
  }
  
  function disconnect() {
    storage.off("change", updateCache);
    storage = null;
  }
  
  function updateCache(changes, rebuildCache = false) {
    if (changes.scopeList) {
      scopeList = changes.scopeList;
      events.emit("scopeListChange", scopeList);
      if (!scopeList.includes(currentScope)) {
        return setCurrentScope("global");
      }
    }
    const changedKeys = new Set;
    for (const [key, value] of Object.entries(changes)) {
      const [scope, realKey] = key.startsWith("global/") ? ["global", key.slice(7)] :
        key.startsWith(`${currentScope}/`) ? [currentScope, key.slice(currentScope.length + 1)] :
          [null, null];
      if (!scope || DEFAULT[realKey] == null) {
        continue;
      }
      if (scope === "global") {
        changedKeys.add(realKey);
        globalCache[realKey] = value;
      }
      if (scope === currentScope) {
        changedKeys.add(realKey);
        scopedCache[realKey] = value;
      }
    }
    if (rebuildCache) {
      Object.keys(DEFAULT).forEach(k => changedKeys.add(k));
    }
    const realChanges = {};
    let isChanged = false;
    for (const key of changedKeys) {
      const value = scopedCache[key] != null ? scopedCache[key] :
        globalCache[key] != null ? globalCache[key] :
        DEFAULT[key];
      if (currentCache[key] !== value) {
        realChanges[key] = value;
        currentCache[key] = value;
        isChanged = true;
      }
    }
    if (isChanged) {
      events.emit("change", realChanges);
    }
  }
  
  function ready() {
    return initializing;
  }
  
  function get(key) {
    return currentCache[key];
  }
  
  function getAll() {
    return Object.assign({}, currentCache);
  }
  
  function set(key, value) {
    return storage.set(`${currentScope}/${key}`, value);
  }
  
  function getCurrentScope() {
    return currentScope;
  }
  
  function setCurrentScope(newScope) {
    if (currentScope === newScope) {
      return Promise.resolve(true);
    }
    if (!scopeList.includes(newScope)) {
      return Promise.resolve(false);
    }
    return storage.getMany(Object.keys(DEFAULT).map(k => `${newScope}/${k}`))
      .then(changes => {
        currentScope = newScope;
        scopedCache = {};
        events.emit("scopeChange", currentScope);
        updateCache(changes, true);
        return true;
      });
  }
  
  function addScope(scope) {
    if (scopeList.includes(scope)) {
      return Promise.reject(new Error(`${scope} already exists`));
    }
    return storage.set("scopeList", scopeList.concat([scope]));
  }
  
  function deleteScope(scope) {
    if (scope === "global") {
      return Promise.reject(new Error(`cannot delete global`));
    }
    return storage.set("scopeList", scopeList.filter(s => s != scope));
  }
  
  function getScopeList() {
    return scopeList;
  }
}

/* global browser chrome */

function promisify(func) {
  return (...args) =>
    new Promise((resolve, reject) => {
      func(...args, (...results) => {
        if (chrome.runtime.error) {
          reject(chrome.runtime.error);
          return;
        }
        if (results.length <= 1) {
          resolve(results[0]);
          return;
        }
        resolve(results);
      });
    });
}

function createWebextStorage(area = "local") {
  const events = new EventLite;
  const addListener = typeof browser === "object" ?
    browser.storage.onChanged.addListener.bind(browser.storage.onChanged) :
    chrome.storage.onChanged.addListener.bind(chrome.storage.onChanged);
  const removeListener = typeof browser === "object" ?
    browser.storage.onChanged.removeListener.bind(browser.storage.onChanged) :
    chrome.storage.onChanged.removeListener.bind(chrome.storage.onChanged);
  const storageGet = typeof browser === "object" ?
    browser.storage[area].get.bind(browser.storage[area]) : 
    promisify(chrome.storage[area].get.bind(chrome.storage[area]));
  const storageSet = typeof browser === "object" ?
    browser.storage[area].set.bind(browser.storage[area]) :
    promisify(chrome.storage[area].set.bind(chrome.storage[area]));
  addListener(onChange);
  return Object.assign(events, {getMany, set, destroy});
  
  function destroy() {
    removeListener(onChange);
  }
  
  function getMany(keys) {
    return storageGet(keys.map(k => `webext-pref/${k}`))
      .then(changes => {
        const o = {};
        for (const [key, value] of Object.entries(changes)) {
          if (key.startsWith("webext-pref/")) {
            o[key.slice(12)] = value;
          }
        }
        return o;
      });
  }
  
  function set(key, value) {
    return storageSet({
      [`webext-pref/${key}`]: value
    });
  }
  
  function onChange(changes, _area) {
    if (_area !== area) {
      return;
    }
    const realChanges = {};
    for (const [key, {newValue}] of Object.entries(changes)) {
      if (key.startsWith("webext-pref/")) {
        realChanges[key.slice(12)] = newValue;
      }
    }
    events.emit("change", realChanges);
  }
}

function prefDefault() {
  return {
    fuzzyIp: true,
    embedImage: true,
    embedImageExcludeElement: ".hljs, .highlight, .brush\\:",
    ignoreMustache: false,
    unicode: false,
    newTab: false,
    standalone: false,
    boundaryLeft: "{[(\"'",
    boundaryRight: "'\")]},.;?!",
    excludeElement: ".highlight, .editbox, .brush\\:, .bdsug, .spreadsheetinfo",
    includeElement: "",
    timeout: 10000,
    maxRunTime: 100,
    customRules: [],
  };
}

/* global pref */

window.pref = createPref(prefDefault());
window.prefReady = pref.connect(createWebextStorage());
