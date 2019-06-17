var pref = (function () {


function createPref(DEFAULT, sep = "/") {
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
    getScopeList,
    import: import_,
    export: export_
  });
  
  function import_(input) {
    const newScopeList = input.scopeList || scopeList.slice();
    const scopes = new Set(newScopeList);
    if (!scopes.has("global")) {
      throw new Error("invalid scopeList");
    }
    const changes = {
      scopeList: newScopeList
    };
    for (const [scopeName, scope] of Object.entries(input.scopes)) {
      if (!scopes.has(scopeName)) {
        continue;
      }
      for (const [key, value] of Object.entries(scope)) {
        if (DEFAULT[key] == undefined) {
          continue;
        }
        changes[`${scopeName}${sep}${key}`] = value;
      }
    }
    return storage.setMany(changes);
  }
  
  function export_() {
    const keys = [];
    for (const scope of scopeList) {
      keys.push(...Object.keys(DEFAULT).map(k => `${scope}${sep}${k}`));
    }
    keys.push("scopeList");
    return storage.getMany(keys)
      .then(changes => {
        const _scopeList = changes.scopeList || scopeList.slice();
        const scopes = new Set(_scopeList);
        const output = {
          scopeList: _scopeList,
          scopes: {}
        };
        for (const [key, value] of Object.entries(changes)) {
          const sepIndex = key.indexOf(sep);
          if (sepIndex < 0) {
            continue;
          }
          const scope = key.slice(0, sepIndex);
          const realKey = key.slice(sepIndex + sep.length);
          if (!scopes.has(scope)) {
            continue;
          }
          if (DEFAULT[realKey] == undefined) {
            continue;
          }
          if (!output.scopes[scope]) {
            output.scopes[scope] = {};
          }
          output.scopes[scope][realKey] = value;
        }
        return output;
      });
  }
  
  function connect(_storage) {
    storage = _storage;
    initializing = storage.getMany(
      Object.keys(DEFAULT).map(k => `global${sep}${k}`).concat(["scopeList"])
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
      const [scope, realKey] = key.startsWith(`global${sep}`) ? ["global", key.slice(6 + sep.length)] :
        key.startsWith(`${currentScope}${sep}`) ? [currentScope, key.slice(currentScope.length + sep.length)] :
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
    return storage.setMany({
      [`${currentScope}${sep}${key}`]: value
    });
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
    return storage.getMany(Object.keys(DEFAULT).map(k => `${newScope}${sep}${k}`))
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
    if (scope.includes(sep)) {
      return Promise.reject(new Error(`invalid word: ${sep}`));
    }
    return storage.setMany({
      scopeList: scopeList.concat([scope])
    });
  }
  
  function deleteScope(scope) {
    if (scope === "global") {
      return Promise.reject(new Error(`cannot delete global`));
    }
    return Promise.all([
      storage.setMany({
        scopeList: scopeList.filter(s => s != scope)
      }),
      storage.deleteMany(Object.keys(DEFAULT).map(k => `${scope}${sep}${k}`))
    ]);
  }
  
  function getScopeList() {
    return scopeList;
  }
}

/* global chrome */
function promisify(func) {
  return (...args) =>
    new Promise((resolve, reject) => {
      func(...args, (...results) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
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

/* global browser chrome */

function createWebextStorage(area = "local", prefix = "webext-pref/") {
  const events = new EventLite;
  
  const ON_CHANGED = ["addListener", "removeListener"].reduce((output, key) => {
    output[key] = typeof browser === "object" ?
      browser.storage.onChanged[key].bind(browser.storage.onChanged) :
      chrome.storage.onChanged[key].bind(chrome.storage.onChanged);
    return output;
  }, {});
  
  const METHODS = ["get", "set", "remove"].reduce((output, key) => {
    output[key] = typeof browser === "object" ?
      browser.storage[area][key].bind(browser.storage[area]) : 
      promisify(chrome.storage[area][key].bind(chrome.storage[area]));
    return output;
  }, {});
  
  ON_CHANGED.addListener(onChange);
  
  return Object.assign(events, {getMany, setMany, deleteMany, destroy});
  
  function destroy() {
    ON_CHANGED.removeListener(onChange);
  }
  
  function getMany(keys) {
    return METHODS.get(keys.map(k => prefix + k))
      .then(changes => {
        const o = {};
        for (const [key, value] of Object.entries(changes)) {
          if (key.startsWith(prefix)) {
            o[key.slice(prefix.length)] = value;
          }
        }
        return o;
      });
  }
  
  function setMany(options) {
    const newOptions = {};
    for (const [key, value] of Object.entries(options)) {
      newOptions[prefix + key] = value;
    }
    return METHODS.set(newOptions);
  }
  
  function deleteMany(keys) {
    return METHODS.remove(keys.map(k => prefix + k));
  }
  
  function onChange(changes, _area) {
    if (_area !== area) {
      return;
    }
    const realChanges = {};
    for (const [key, {newValue}] of Object.entries(changes)) {
      if (key.startsWith(prefix)) {
        realChanges[key.slice(prefix.length)] = newValue;
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
    customRules: "",
  };
}

const pref = createPref(prefDefault());
pref.ready = pref.connect(createWebextStorage());


return pref;
})();
