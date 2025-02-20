// ==UserScript==
// @name Linkify Plus Plus
// @version 12.0.1
// @description Based on Linkify Plus. Turn plain text URLs into links.
// @license BSD-3-Clause
// @author eight04 <eight04@gmail.com>
// @homepageURL https://github.com/eight04/linkify-plus-plus
// @supportURL https://github.com/eight04/linkify-plus-plus/issues
// @namespace eight04.blogspot.com
// @include *
// @exclude https://www.google.*/search*
// @exclude https://www.google.*/webhp*
// @exclude https://music.google.com/*
// @exclude https://mail.google.com/*
// @exclude https://docs.google.com/*
// @exclude https://encrypted.google.com/*
// @exclude https://*101weiqi.com/*
// @exclude https://w3c*.github.io/*
// @exclude https://www.paypal.com/*
// @exclude https://term.ptt.cc/*
// @exclude https://mastodon.social/*
// @grant GM.getValue
// @grant GM.setValue
// @grant GM.deleteValue
// @grant GM_addStyle
// @grant GM_registerMenuCommand
// @grant GM_getValue
// @grant GM_setValue
// @grant GM_deleteValue
// @grant GM_addValueChangeListener
// @grant unsafeWindow
// @compatible firefox Tampermonkey latest
// @compatible chrome Tampermonkey latest
// @icon data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDE2IDE2Ij4gPHBhdGggZmlsbD0iIzRjNGM0ZCIgZD0iTTMuNSAxYS41LjUgMCAxIDAgMCAxSDR2OWgtLjVhLjUuNSAwIDAgMCAwIDFoNy44NTVhLjUuNSAwIDAgMCAuNDc1LS4xODQuNS41IDAgMCAwIC4xMDYtLjM5OFYxMC41YS41LjUgMCAxIDAtMSAwdi41SDZWMmguNWEuNS41IDAgMSAwIDAtMWgtM3oiLz4gPHBhdGggZmlsbD0iIzQ1YTFmZiIgZD0iTTIuNSAxNGExIDEgMCAxIDAgMCAyaDExYTEgMSAwIDEgMCAwLTJoLTExeiIvPiA8L3N2Zz4=
// ==/UserScript==

var optionsFuzzyIpLabel = "Match ambiguous IP addresses.";
var optionsIgnoreMustacheLabel = "Ignore URLs inside mustaches e.g. {{ ... }}.";
var optionsEmbedImageLabel = "Create an image element if the URL looks like an image file.";
var optionsEmbedImageExcludeElementLabel = "Exclude following elements. (CSS selector)";
var optionsUnicodeLabel = "Match unicode characters.";
var optionsMailLabel = "Match email address.";
var optionsNewTabLabel = "Open links in new tabs.";
var optionsStandaloneLabel = "The URL must be surrounded by whitespaces.";
var optionsLinkifierLabel = "Linkifier";
var optionsTriggerByPageLoadLabel = "Trigger on page load.";
var optionsTriggerByNewNodeLabel = "Trigger on dynamically created elements.";
var optionsTriggerByHoverLabel = "Trigger on mouse over.";
var optionsTriggerByClickLabel = "Trigger on mouse click.";
var optionsBoundaryLeftLabel = "Allowed characters between the whitespace and the link. (left side)";
var optionsBoundaryRightLabel = "Allowed characters between the whitespace and the link. (right side)";
var optionsExcludeElementLabel = "Do not linkify following elements. (CSS selector)";
var optionsIncludeElementLabel = "Always linkify following elements. Override above. (CSS selector)";
var optionsTimeoutLabel = "Max execution time. (ms)";
var optionsTimeoutHelp = "The script will terminate if it takes too long to convert the entire page.";
var optionsMaxRunTimeLabel = "Max script run time. (ms)";
var optionsMaxRunTimeHelp = "If the script takes too long to run, the process would be splitted into small chunks to avoid browser freeze.";
var optionsUrlMatcherLabel = "URL matcher";
var optionsCustomRulesLabel = "Custom rules. (RegExp per line)";
var currentScopeLabel = "Current domain";
var addScopeLabel = "Add new domain";
var addScopePrompt = "Add new domain";
var deleteScopeLabel = "Delete current domain";
var deleteScopeConfirm = "Delete domain $1?";
var learnMoreButton = "Learn more";
var importButton = "Import";
var importPrompt = "Paste settings";
var exportButton = "Export";
var exportPrompt = "Copy settings";
var translate = {
	optionsFuzzyIpLabel: optionsFuzzyIpLabel,
	optionsIgnoreMustacheLabel: optionsIgnoreMustacheLabel,
	optionsEmbedImageLabel: optionsEmbedImageLabel,
	optionsEmbedImageExcludeElementLabel: optionsEmbedImageExcludeElementLabel,
	optionsUnicodeLabel: optionsUnicodeLabel,
	optionsMailLabel: optionsMailLabel,
	optionsNewTabLabel: optionsNewTabLabel,
	optionsStandaloneLabel: optionsStandaloneLabel,
	optionsLinkifierLabel: optionsLinkifierLabel,
	optionsTriggerByPageLoadLabel: optionsTriggerByPageLoadLabel,
	optionsTriggerByNewNodeLabel: optionsTriggerByNewNodeLabel,
	optionsTriggerByHoverLabel: optionsTriggerByHoverLabel,
	optionsTriggerByClickLabel: optionsTriggerByClickLabel,
	optionsBoundaryLeftLabel: optionsBoundaryLeftLabel,
	optionsBoundaryRightLabel: optionsBoundaryRightLabel,
	optionsExcludeElementLabel: optionsExcludeElementLabel,
	optionsIncludeElementLabel: optionsIncludeElementLabel,
	optionsTimeoutLabel: optionsTimeoutLabel,
	optionsTimeoutHelp: optionsTimeoutHelp,
	optionsMaxRunTimeLabel: optionsMaxRunTimeLabel,
	optionsMaxRunTimeHelp: optionsMaxRunTimeHelp,
	optionsUrlMatcherLabel: optionsUrlMatcherLabel,
	optionsCustomRulesLabel: optionsCustomRulesLabel,
	currentScopeLabel: currentScopeLabel,
	addScopeLabel: addScopeLabel,
	addScopePrompt: addScopePrompt,
	deleteScopeLabel: deleteScopeLabel,
	deleteScopeConfirm: deleteScopeConfirm,
	learnMoreButton: learnMoreButton,
	importButton: importButton,
	importPrompt: importPrompt,
	exportButton: exportButton,
	exportPrompt: exportPrompt
};

/**
 * event-lite.js - Light-weight EventEmitter (less than 1KB when gzipped)
 *
 * @copyright Yusuke Kawasaki
 * @license MIT
 * @constructor
 * @see https://github.com/kawanet/event-lite
 * @see http://kawanet.github.io/event-lite/EventLite.html
 * @example
 * var EventLite = require("event-lite");
 *
 * function MyClass() {...}             // your class
 *
 * EventLite.mixin(MyClass.prototype);  // import event methods
 *
 * var obj = new MyClass();
 * obj.on("foo", function() {...});     // add event listener
 * obj.once("bar", function() {...});   // add one-time event listener
 * obj.emit("foo");                     // dispatch event
 * obj.emit("bar");                     // dispatch another event
 * obj.off("foo");                      // remove event listener
 */

function EventLite() {
  if (!(this instanceof EventLite)) return new EventLite();
}

// (function(EventLite) {
  // export the class for node.js
  // if ("undefined" !== typeof module) module.exports = EventLite;

  // property name to hold listeners
  var LISTENERS = "listeners";

  // methods to export
  var methods = {
    on: on,
    once: once,
    off: off,
    emit: emit
  };

  // mixin to self
  mixin(EventLite.prototype);

  // export mixin function
  EventLite.mixin = mixin;

  /**
   * Import on(), once(), off() and emit() methods into target object.
   *
   * @function EventLite.mixin
   * @param target {Prototype}
   */

  function mixin(target) {
    for (var key in methods) {
      target[key] = methods[key];
    }
    return target;
  }

  /**
   * Add an event listener.
   *
   * @function EventLite.prototype.on
   * @param type {string}
   * @param func {Function}
   * @returns {EventLite} Self for method chaining
   */

  function on(type, func) {
    getListeners(this, type).push(func);
    return this;
  }

  /**
   * Add one-time event listener.
   *
   * @function EventLite.prototype.once
   * @param type {string}
   * @param func {Function}
   * @returns {EventLite} Self for method chaining
   */

  function once(type, func) {
    var that = this;
    wrap.originalListener = func;
    getListeners(that, type).push(wrap);
    return that;

    function wrap() {
      off.call(that, type, wrap);
      func.apply(this, arguments);
    }
  }

  /**
   * Remove an event listener.
   *
   * @function EventLite.prototype.off
   * @param [type] {string}
   * @param [func] {Function}
   * @returns {EventLite} Self for method chaining
   */

  function off(type, func) {
    var that = this;
    var listners;
    if (!arguments.length) {
      delete that[LISTENERS];
    } else if (!func) {
      listners = that[LISTENERS];
      if (listners) {
        delete listners[type];
        if (!Object.keys(listners).length) return off.call(that);
      }
    } else {
      listners = getListeners(that, type, true);
      if (listners) {
        listners = listners.filter(ne);
        if (!listners.length) return off.call(that, type);
        that[LISTENERS][type] = listners;
      }
    }
    return that;

    function ne(test) {
      return test !== func && test.originalListener !== func;
    }
  }

  /**
   * Dispatch (trigger) an event.
   *
   * @function EventLite.prototype.emit
   * @param type {string}
   * @param [value] {*}
   * @returns {boolean} True when a listener received the event
   */

  function emit(type, value) {
    var that = this;
    var listeners = getListeners(that, type, true);
    if (!listeners) return false;
    var arglen = arguments.length;
    if (arglen === 1) {
      listeners.forEach(zeroarg);
    } else if (arglen === 2) {
      listeners.forEach(onearg);
    } else {
      var args = Array.prototype.slice.call(arguments, 1);
      listeners.forEach(moreargs);
    }
    return !!listeners.length;

    function zeroarg(func) {
      func.call(that);
    }

    function onearg(func) {
      func.call(that, value);
    }

    function moreargs(func) {
      func.apply(that, args);
    }
  }

  /**
   * @ignore
   */

  function getListeners(that, type, readonly) {
    if (readonly && !that[LISTENERS]) return;
    var listeners = that[LISTENERS] || (that[LISTENERS] = {});
    return listeners[type] || (listeners[type] = []);
  }

// })(EventLite);

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
    // storage,
    // ready,
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
    export: export_,
    has
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
  
  function has(key) {
    return currentCache.hasOwnProperty(key);
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

const keys = Object.keys;
function isBoolean(val) {
  return typeof val === "boolean"
}
function isElement(val) {
  return val && typeof val.nodeType === "number"
}
function isString(val) {
  return typeof val === "string"
}
function isNumber(val) {
  return typeof val === "number"
}
function isObject(val) {
  return typeof val === "object" ? val !== null : isFunction(val)
}
function isFunction(val) {
  return typeof val === "function"
}
function isArrayLike(obj) {
  return isObject(obj) && typeof obj.length === "number" && typeof obj.nodeType !== "number"
}
function forEach(value, fn) {
  if (!value) return

  for (const key of keys(value)) {
    fn(value[key], key);
  }
}
function isRef(maybeRef) {
  return isObject(maybeRef) && "current" in maybeRef
}

const isUnitlessNumber = {
  animationIterationCount: 0,
  borderImageOutset: 0,
  borderImageSlice: 0,
  borderImageWidth: 0,
  boxFlex: 0,
  boxFlexGroup: 0,
  boxOrdinalGroup: 0,
  columnCount: 0,
  columns: 0,
  flex: 0,
  flexGrow: 0,
  flexPositive: 0,
  flexShrink: 0,
  flexNegative: 0,
  flexOrder: 0,
  gridArea: 0,
  gridRow: 0,
  gridRowEnd: 0,
  gridRowSpan: 0,
  gridRowStart: 0,
  gridColumn: 0,
  gridColumnEnd: 0,
  gridColumnSpan: 0,
  gridColumnStart: 0,
  fontWeight: 0,
  lineClamp: 0,
  lineHeight: 0,
  opacity: 0,
  order: 0,
  orphans: 0,
  tabSize: 0,
  widows: 0,
  zIndex: 0,
  zoom: 0,
  fillOpacity: 0,
  floodOpacity: 0,
  stopOpacity: 0,
  strokeDasharray: 0,
  strokeDashoffset: 0,
  strokeMiterlimit: 0,
  strokeOpacity: 0,
  strokeWidth: 0,
};

function prefixKey(prefix, key) {
  return prefix + key.charAt(0).toUpperCase() + key.substring(1)
}

const prefixes = ["Webkit", "ms", "Moz", "O"];
keys(isUnitlessNumber).forEach((prop) => {
  prefixes.forEach((prefix) => {
    isUnitlessNumber[prefixKey(prefix, prop)] = 0;
  });
});

const SVGNamespace = "http://www.w3.org/2000/svg";
const XLinkNamespace = "http://www.w3.org/1999/xlink";
const XMLNamespace = "http://www.w3.org/XML/1998/namespace";

function isVisibleChild(value) {
  return !isBoolean(value) && value != null
}

function className(value) {
  if (Array.isArray(value)) {
    return value.map(className).filter(Boolean).join(" ")
  } else if (isObject(value)) {
    return keys(value)
      .filter((k) => value[k])
      .join(" ")
  } else if (isVisibleChild(value)) {
    return "" + value
  } else {
    return ""
  }
}
const svg = {
  animate: 0,
  circle: 0,
  clipPath: 0,
  defs: 0,
  desc: 0,
  ellipse: 0,
  feBlend: 0,
  feColorMatrix: 0,
  feComponentTransfer: 0,
  feComposite: 0,
  feConvolveMatrix: 0,
  feDiffuseLighting: 0,
  feDisplacementMap: 0,
  feDistantLight: 0,
  feFlood: 0,
  feFuncA: 0,
  feFuncB: 0,
  feFuncG: 0,
  feFuncR: 0,
  feGaussianBlur: 0,
  feImage: 0,
  feMerge: 0,
  feMergeNode: 0,
  feMorphology: 0,
  feOffset: 0,
  fePointLight: 0,
  feSpecularLighting: 0,
  feSpotLight: 0,
  feTile: 0,
  feTurbulence: 0,
  filter: 0,
  foreignObject: 0,
  g: 0,
  image: 0,
  line: 0,
  linearGradient: 0,
  marker: 0,
  mask: 0,
  metadata: 0,
  path: 0,
  pattern: 0,
  polygon: 0,
  polyline: 0,
  radialGradient: 0,
  rect: 0,
  stop: 0,
  svg: 0,
  switch: 0,
  symbol: 0,
  text: 0,
  textPath: 0,
  tspan: 0,
  use: 0,
  view: 0,
};
function createElement(tag, attr, ...children) {
  if (isString(attr) || Array.isArray(attr)) {
    children.unshift(attr);
    attr = {};
  }

  attr = attr || {};

  if (!attr.namespaceURI && svg[tag] === 0) {
    attr = { ...attr, namespaceURI: SVGNamespace };
  }

  if (attr.children != null && !children.length) {
({ children, ...attr } = attr);
  }

  let node;

  if (isString(tag)) {
    node = attr.namespaceURI
      ? document.createElementNS(attr.namespaceURI, tag)
      : document.createElement(tag);
    attributes(attr, node);
    appendChild(children, node);
  } else if (isFunction(tag)) {
    if (isObject(tag.defaultProps)) {
      attr = { ...tag.defaultProps, ...attr };
    }

    node = tag({ ...attr, children });
  }

  if (isRef(attr.ref)) {
    attr.ref.current = node;
  } else if (isFunction(attr.ref)) {
    attr.ref(node);
  }

  return node
}

function appendChild(child, node) {
  if (isArrayLike(child)) {
    appendChildren(child, node);
  } else if (isString(child) || isNumber(child)) {
    appendChildToNode(document.createTextNode(child), node);
  } else if (child === null) {
    appendChildToNode(document.createComment(""), node);
  } else if (isElement(child)) {
    appendChildToNode(child, node);
  }
}

function appendChildren(children, node) {
  for (const child of children) {
    appendChild(child, node);
  }

  return node
}

function appendChildToNode(child, node) {
  if (node instanceof window.HTMLTemplateElement) {
    node.content.appendChild(child);
  } else {
    node.appendChild(child);
  }
}

function normalizeAttribute(s) {
  return s.replace(/[A-Z\d]/g, (match) => ":" + match.toLowerCase())
}

function attribute(key, value, node) {
  switch (key) {
    case "xlinkActuate":
    case "xlinkArcrole":
    case "xlinkHref":
    case "xlinkRole":
    case "xlinkShow":
    case "xlinkTitle":
    case "xlinkType":
      attrNS(node, XLinkNamespace, normalizeAttribute(key), value);
      return

    case "xmlnsXlink":
      attr(node, normalizeAttribute(key), value);
      return

    case "xmlBase":
    case "xmlLang":
    case "xmlSpace":
      attrNS(node, XMLNamespace, normalizeAttribute(key), value);
      return
  }

  switch (key) {
    case "htmlFor":
      attr(node, "for", value);
      return

    case "dataset":
      forEach(value, (dataValue, dataKey) => {
        if (dataValue != null) {
          node.dataset[dataKey] = dataValue;
        }
      });
      return

    case "innerHTML":
    case "innerText":
    case "textContent":
      node[key] = value;
      return

    case "spellCheck":
      node.spellcheck = value;
      return

    case "class":
    case "className":
      if (isFunction(value)) {
        value(node);
      } else {
        attr(node, "class", className(value));
      }

      return

    case "ref":
    case "namespaceURI":
      return

    case "style":
      if (isObject(value)) {
        forEach(value, (val, key) => {
          if (isNumber(val) && isUnitlessNumber[key] !== 0) {
            node.style[key] = val + "px";
          } else {
            node.style[key] = val;
          }
        });
        return
      }
  }

  if (isFunction(value)) {
    if (key[0] === "o" && key[1] === "n") {
      const attribute = key.toLowerCase();

      if (node[attribute] == null) {
        node[attribute] = value;
      } else {
        node.addEventListener(key, value);
      }
    }
  } else if (value === true) {
    attr(node, key, "");
  } else if (value !== false && value != null) {
    attr(node, key, value);
  }
}

function attr(node, key, value) {
  node.setAttribute(key, value);
}

function attrNS(node, namespace, key, value) {
  node.setAttributeNS(namespace, key, value);
}

function attributes(attr, node) {
  for (const key of keys(attr)) {
    attribute(key, attr[key], node);
  }

  return node
}

function messageGetter({
  getMessage,
  DEFAULT
}) {
  return (key, params) => {
    const message = getMessage(key, params);
    if (message) return message;
    const defaultMessage = DEFAULT[key];
    if (!defaultMessage) return "";
    if (!params) return defaultMessage;

    if (!Array.isArray(params)) {
      params = [params];
    }

    return defaultMessage.replace(/\$(\d+)/g, (m, n) => params[n - 1]);
  };
}

function fallback(getMessage) {
  return messageGetter({
    getMessage,
    DEFAULT: {
      currentScopeLabel: "Current scope",
      addScopeLabel: "Add new scope",
      deleteScopeLabel: "Delete current scope",
      learnMoreButton: "Learn more",
      importButton: "Import",
      exportButton: "Export",
      addScopePrompt: "Add new scope",
      deleteScopeConfirm: "Delete scope $1?",
      importPrompt: "Paste settings",
      exportPrompt: "Copy settings"
    }
  });
}

const VALID_CONTROL = new Set(["import", "export", "scope-list", "add-scope", "delete-scope"]);

class DefaultMap extends Map {
  constructor(getDefault) {
    super();
    this.getDefault = getDefault;
  }

  get(key) {
    let item = super.get(key);

    if (!item) {
      item = this.getDefault();
      super.set(key, item);
    }

    return item;
  }

}

function bindInputs(pref, inputs) {
  const bounds = [];

  const onPrefChange = change => {
    for (const key in change) {
      if (!inputs.has(key)) {
        continue;
      }

      for (const input of inputs.get(key)) {
        updateInput(input, change[key]);
      }
    }
  };

  pref.on("change", onPrefChange);
  bounds.push(() => pref.off("change", onPrefChange));

  for (const [key, list] of inputs.entries()) {
    for (const input of list) {
      const evt = input.hasAttribute("realtime") ? "input" : "change";

      const onChange = () => updatePref(key, input);

      input.addEventListener(evt, onChange);
      bounds.push(() => input.removeEventListener(evt, onChange));
    }
  }

  onPrefChange(pref.getAll());
  return () => {
    for (const unbind of bounds) {
      unbind();
    }
  };

  function updatePref(key, input) {
    if (!input.checkValidity()) {
      return;
    }

    if (input.type === "checkbox") {
      pref.set(key, input.checked);
      return;
    }

    if (input.type === "radio") {
      if (input.checked) {
        pref.set(key, input.value);
      }

      return;
    }

    if (input.nodeName === "SELECT" && input.multiple) {
      pref.set(key, [...input.options].filter(o => o.selected).map(o => o.value));
      return;
    }

    if (input.type === "number" || input.type === "range") {
      pref.set(key, Number(input.value));
      return;
    }

    pref.set(key, input.value);
  }

  function updateInput(input, value) {
    if (input.nodeName === "INPUT" && input.type === "radio") {
      input.checked = input.value === value;
      return;
    }

    if (input.type === "checkbox") {
      input.checked = value;
      return;
    }

    if (input.nodeName === "SELECT" && input.multiple) {
      const checked = new Set(value);

      for (const option of input.options) {
        option.selected = checked.has(option.value);
      }

      return;
    }

    input.value = value;
  }
}

function bindFields(pref, fields) {
  const onPrefChange = change => {
    for (const key in change) {
      if (!fields.has(key)) {
        continue;
      }

      for (const field of fields.get(key)) {
        field.disabled = field.dataset.bindToValue ? field.dataset.bindToValue !== change[key] : !change[key];
      }
    }
  };

  pref.on("change", onPrefChange);
  onPrefChange(pref.getAll());
  return () => pref.off("change", onPrefChange);
}

function bindControls({
  pref,
  controls,
  alert: _alert = alert,
  confirm: _confirm = confirm,
  prompt: _prompt = prompt,
  getMessage = () => {},
  getNewScope = () => ""
}) {
  const CONTROL_METHODS = {
    "import": ["click", doImport],
    "export": ["click", doExport],
    "scope-list": ["change", updateCurrentScope],
    "add-scope": ["click", addScope],
    "delete-scope": ["click", deleteScope]
  };

  for (const type in CONTROL_METHODS) {
    for (const el of controls.get(type)) {
      el.addEventListener(CONTROL_METHODS[type][0], CONTROL_METHODS[type][1]);
    }
  }

  pref.on("scopeChange", updateCurrentScopeEl);
  pref.on("scopeListChange", updateScopeList);
  updateScopeList();
  updateCurrentScopeEl();

  const _ = fallback(getMessage);

  return unbind;

  function unbind() {
    pref.off("scopeChange", updateCurrentScopeEl);
    pref.off("scopeListChange", updateScopeList);

    for (const type in CONTROL_METHODS) {
      for (const el of controls.get(type)) {
        el.removeEventListener(CONTROL_METHODS[type][0], CONTROL_METHODS[type][1]);
      }
    }
  }

  async function doImport() {
    try {
      const input = await _prompt(_("importPrompt"));

      if (input == null) {
        return;
      }

      const settings = JSON.parse(input);
      return pref.import(settings);
    } catch (err) {
      await _alert(err.message);
    }
  }

  async function doExport() {
    try {
      const settings = await pref.export();
      await _prompt(_("exportPrompt"), JSON.stringify(settings));
    } catch (err) {
      await _alert(err.message);
    }
  }

  function updateCurrentScope(e) {
    pref.setCurrentScope(e.target.value);
  }

  async function addScope() {
    try {
      let scopeName = await _prompt(_("addScopePrompt"), getNewScope());

      if (scopeName == null) {
        return;
      }

      scopeName = scopeName.trim();

      if (!scopeName) {
        throw new Error("the value is empty");
      }

      await pref.addScope(scopeName);
      pref.setCurrentScope(scopeName);
    } catch (err) {
      await _alert(err.message);
    }
  }

  async function deleteScope() {
    try {
      const scopeName = pref.getCurrentScope();
      const result = await _confirm(_("deleteScopeConfirm", scopeName));

      if (result) {
        return pref.deleteScope(scopeName);
      }
    } catch (err) {
      await _alert(err.message);
    }
  }

  function updateCurrentScopeEl() {
    const scopeName = pref.getCurrentScope();

    for (const el of controls.get("scope-list")) {
      el.value = scopeName;
    }
  }

  function updateScopeList() {
    const scopeList = pref.getScopeList();

    for (const el of controls.get("scope-list")) {
      el.innerHTML = "";
      el.append(...scopeList.map(scope => {
        const option = document.createElement("option");
        option.value = scope;
        option.textContent = scope;
        return option;
      }));
    }
  }
}

function createBinding({
  pref,
  root,
  elements = root.querySelectorAll("input, textarea, select, fieldset, button"),
  keyPrefix = "pref-",
  controlPrefix = "webext-pref-",
  alert,
  confirm,
  prompt,
  getMessage,
  getNewScope
}) {
  const inputs = new DefaultMap(() => []);
  const fields = new DefaultMap(() => []);
  const controls = new DefaultMap(() => []);

  for (const element of elements) {
    const id = element.id && stripPrefix(element.id, keyPrefix);

    if (id && pref.has(id)) {
      inputs.get(id).push(element);
      continue;
    }

    if (element.nodeName === "INPUT" && element.type === "radio") {
      const name = element.name && stripPrefix(element.name, keyPrefix);

      if (name && pref.has(name)) {
        inputs.get(name).push(element);
        continue;
      }
    }

    if (element.nodeName === "FIELDSET" && element.dataset.bindTo) {
      fields.get(element.dataset.bindTo).push(element);
      continue;
    }

    const controlType = findControlType(element.classList);

    if (controlType) {
      controls.get(controlType).push(element);
    }
  }

  const bounds = [bindInputs(pref, inputs), bindFields(pref, fields), bindControls({
    pref,
    controls,
    alert,
    confirm,
    prompt,
    getMessage,
    getNewScope
  })];
  return () => {
    for (const unbind of bounds) {
      unbind();
    }
  };

  function stripPrefix(id, prefix) {
    if (!prefix) {
      return id;
    }

    return id.startsWith(prefix) ? id.slice(prefix.length) : "";
  }

  function findControlType(list) {
    for (const name of list) {
      const controlType = stripPrefix(name, controlPrefix);

      if (VALID_CONTROL.has(controlType)) {
        return controlType;
      }
    }
  }
}

function createUI({
  body,
  getMessage = () => {},
  toolbar = true,
  navbar = true,
  keyPrefix = "pref-",
  controlPrefix = "webext-pref-"
}) {
  const root = document.createDocumentFragment();

  const _ = fallback(getMessage);

  if (toolbar) {
    root.append(createToolbar());
  }

  if (navbar) {
    root.append(createNavbar());
  }

  root.append( /*#__PURE__*/createElement("div", {
    class: controlPrefix + "body"
  }, body.map(item => {
    if (!item.hLevel) {
      item.hLevel = 3;
    }

    return createItem(item);
  })));
  return root;

  function createToolbar() {
    return /*#__PURE__*/createElement("div", {
      class: controlPrefix + "toolbar"
    }, /*#__PURE__*/createElement("button", {
      type: "button",
      class: [controlPrefix + "import", "browser-style"]
    }, _("importButton")), /*#__PURE__*/createElement("button", {
      type: "button",
      class: [controlPrefix + "export", "browser-style"]
    }, _("exportButton")));
  }

  function createNavbar() {
    return /*#__PURE__*/createElement("div", {
      class: controlPrefix + "nav"
    }, /*#__PURE__*/createElement("select", {
      class: [controlPrefix + "scope-list", "browser-style"],
      title: _("currentScopeLabel")
    }), /*#__PURE__*/createElement("button", {
      type: "button",
      class: [controlPrefix + "delete-scope", "browser-style"],
      title: _("deleteScopeLabel")
    }, "\xD7"), /*#__PURE__*/createElement("button", {
      type: "button",
      class: [controlPrefix + "add-scope", "browser-style"],
      title: _("addScopeLabel")
    }, "+"));
  }

  function createItem(p) {
    if (p.type === "section") {
      return createSection(p);
    }

    if (p.type === "checkbox") {
      return createCheckbox(p);
    }

    if (p.type === "radiogroup") {
      return createRadioGroup(p);
    }

    return createInput(p);
  }

  function createInput(p) {
    const key = keyPrefix + p.key;
    let input;
    const onChange = p.validate ? e => {
      try {
        p.validate(e.target.value);
        e.target.setCustomValidity("");
      } catch (err) {
        e.target.setCustomValidity(err.message || String(err));
      }
    } : null;

    if (p.type === "select") {
      input = /*#__PURE__*/createElement("select", {
        multiple: p.multiple,
        class: "browser-style",
        id: key,
        onChange: onChange
      }, Object.entries(p.options).map(([value, label]) => /*#__PURE__*/createElement("option", {
        value: value
      }, label)));
    } else if (p.type === "textarea") {
      input = /*#__PURE__*/createElement("textarea", {
        rows: "8",
        class: "browser-style",
        id: key,
        onChange: onChange
      });
    } else {
      input = /*#__PURE__*/createElement("input", {
        type: p.type,
        id: key,
        onChange: onChange
      });
    }

    return /*#__PURE__*/createElement("div", {
      class: [`${controlPrefix}${p.type}`, "browser-style", p.className]
    }, /*#__PURE__*/createElement("label", {
      htmlFor: key
    }, p.label), p.learnMore && /*#__PURE__*/createElement(LearnMore, {
      url: p.learnMore
    }), input, p.help && /*#__PURE__*/createElement(Help, {
      content: p.help
    }));
  }

  function createRadioGroup(p) {
    return /*#__PURE__*/createElement("div", {
      class: [`${controlPrefix}${p.type}`, "browser-style", p.className]
    }, /*#__PURE__*/createElement("div", {
      class: controlPrefix + "radio-title"
    }, p.label), p.learnMore && /*#__PURE__*/createElement(LearnMore, {
      url: p.learnMore
    }), p.help && /*#__PURE__*/createElement(Help, {
      content: p.help
    }), p.children.map(c => {
      c.parentKey = p.key;
      return createCheckbox(inheritProp(p, c));
    }));
  }

  function Help({
    content
  }) {
    return /*#__PURE__*/createElement("p", {
      class: controlPrefix + "help"
    }, content);
  }

  function LearnMore({
    url
  }) {
    return /*#__PURE__*/createElement("a", {
      href: url,
      class: controlPrefix + "learn-more",
      target: "_blank",
      rel: "noopener noreferrer"
    }, _("learnMoreButton"));
  }

  function createCheckbox(p) {
    const id = p.parentKey ? `${keyPrefix}${p.parentKey}-${p.value}` : keyPrefix + p.key;
    return /*#__PURE__*/createElement("div", {
      class: [`${controlPrefix}${p.type}`, "browser-style", p.className]
    }, /*#__PURE__*/createElement("input", {
      type: p.type,
      id: id,
      name: p.parentKey ? keyPrefix + p.parentKey : null,
      value: p.value
    }), /*#__PURE__*/createElement("label", {
      htmlFor: id
    }, p.label), p.learnMore && /*#__PURE__*/createElement(LearnMore, {
      url: p.learnMore
    }), p.help && /*#__PURE__*/createElement(Help, {
      content: p.help
    }), p.children && /*#__PURE__*/createElement("fieldset", {
      class: controlPrefix + "checkbox-children",
      dataset: {
        bindTo: p.parentKey || p.key,
        bindToValue: p.value
      }
    }, p.children.map(c => createItem(inheritProp(p, c)))));
  }

  function createSection(p) {
    const Header = `h${p.hLevel}`;
    p.hLevel++;
    return (
      /*#__PURE__*/
      // FIXME: do we need browser-style for section?
      createElement("div", {
        class: [controlPrefix + p.type, p.className]
      }, /*#__PURE__*/createElement(Header, {
        class: controlPrefix + "header"
      }, p.label), p.help && /*#__PURE__*/createElement(Help, {
        content: p.help
      }), p.children && p.children.map(c => createItem(inheritProp(p, c))))
    );
  }

  function inheritProp(parent, child) {
    child.hLevel = parent.hLevel;
    return child;
  }
}

/* eslint-env greasemonkey */

function createGMStorage() {
  const setValue = typeof GM_setValue === "function" ?
    promisify(GM_setValue) : GM.setValue.bind(GM);
  const getValue = typeof GM_getValue === "function" ?
    promisify(GM_getValue) : GM.getValue.bind(GM);
  const deleteValue = typeof GM_deleteValue === "function" ?
    promisify(GM_deleteValue) : GM.deleteValue.bind(GM);
  const events = new EventLite;
  
  if (typeof GM_addValueChangeListener === "function") {
    GM_addValueChangeListener("webext-pref-message", (name, oldValue, newValue) => {
      const changes = JSON.parse(newValue);
      for (const key of Object.keys(changes)) {
        if (typeof changes[key] === "object" && changes[key].$undefined) {
          changes[key] = undefined;
        }
      }
      events.emit("change", changes);
    });
  }
  
  return Object.assign(events, {getMany, setMany, deleteMany});
  
  function getMany(keys) {
    return Promise.all(keys.map(k => 
      getValue(`webext-pref/${k}`)
        .then(value => [k, typeof value === "string" ? JSON.parse(value) : value])
    ))
      .then(entries => {
        const output = {};
        for (const [key, value] of entries) {
          output[key] = value;
        }
        return output;
      });
  }
  
  function setMany(changes) {
    return Promise.all(Object.entries(changes).map(([key, value]) => 
      setValue(`webext-pref/${key}`, JSON.stringify(value))
    ))
      .then(() => {
        if (typeof GM_addValueChangeListener === "function") {
          return setValue("webext-pref-message", JSON.stringify(changes));
        }
        events.emit("change", changes);
      });
  }
  
  function deleteMany(keys) {
    return Promise.all(keys.map(k => deleteValue(`webext-pref/${k}`)))
      .then(() => {
        if (typeof GM_addValueChangeListener === "function") {
          const changes = {};
          for (const key of keys) {
            changes[key] = {
              $undefined: true
            };
          }
          return setValue("webext-pref-message", JSON.stringify(changes));
        }
        const changes = {};
        for (const key of keys) {
          changes[key] = undefined;
        }
        events.emit("change", changes);
      });
  }
  
  function promisify(fn) {
    return (...args) => {
      try {
        return Promise.resolve(fn(...args));
      } catch (err) {
        return Promise.reject(err);
      }
    };
  }
}

/* eslint-env greasemonkey */

function GM_webextPref({
  default: default_,
  separator,
  css = "",
  ...options
}) {
  const pref = createPref(default_, separator);
  const initializing = pref.connect(createGMStorage());
  let isOpen = false;
  
  const registerMenu = 
    typeof GM_registerMenuCommand === "function" ? GM_registerMenuCommand :
    typeof GM !== "undefined" && GM && GM.registerMenuCommand ? GM.registerMenuCommand.bind(GM) :
    undefined;
    
  if (registerMenu) {
    registerMenu(`${getTitle()} - Configure`, openDialog);
  }
  
  return Object.assign(pref, {
    ready: () => initializing,
    openDialog
  });
  
  function openDialog() {
    if (isOpen) {
      return;
    }
    isOpen = true;
    
    let destroyView;
    
    const modal = document.createElement("div");
    modal.className = "webext-pref-modal";
    modal.onclick = () => {
      modal.classList.remove("webext-pref-modal-open");
      modal.addEventListener("transitionend", () => {
        if (destroyView) {
          destroyView();
        }
        modal.remove();
        isOpen = false;
      });
    };
    
    const style = document.createElement("style");
    style.textContent = "body{overflow:hidden}.webext-pref-modal{position:fixed;top:0;right:0;bottom:0;left:0;background:rgba(0,0,0,.5);overflow:auto;z-index:999999;opacity:0;transition:opacity .2s linear;display:flex}.webext-pref-modal-open{opacity:1}.webext-pref-modal::after,.webext-pref-modal::before{content:\"\";display:block;height:30px;visibility:hidden}.webext-pref-iframe-wrap{margin:auto}.webext-pref-iframe{margin:30px 0;display:inline-block;width:100%;max-width:100%;background:#fff;border-width:0;box-shadow:0 0 30px #000;transform:translateY(-20px);transition:transform .2s linear}.webext-pref-modal-open .webext-pref-iframe{transform:none}" + `
      body {
        padding-right: ${window.innerWidth - document.documentElement.offsetWidth}px;
      }
    `;
    
    const iframe = document.createElement("iframe");
    iframe.className = "webext-pref-iframe";
    iframe.srcdoc = `
      <html>
        <head>
          <style class="dialog-style"></style>
        </head>
        <body>
          <div class="dialog-body"></div>
        </body>
      </html>
    `;
    
    const wrap = document.createElement("div");
    wrap.className = "webext-pref-iframe-wrap";
    
    wrap.append(iframe);
    modal.append(style, wrap);
    document.body.appendChild(modal);
    
    iframe.onload = () => {
      iframe.onload = null;
      
      iframe.contentDocument.querySelector(".dialog-style").textContent = "body{display:inline-block;font-size:16px;font-family:sans-serif;white-space:nowrap;overflow:hidden;margin:0;color:#3d3d3d;line-height:1}input[type=number],input[type=text],select,textarea{display:block;width:100%;box-sizing:border-box;height:2em;font:inherit;padding:0 .3em;border:1px solid #9e9e9e;cursor:pointer}select[multiple],textarea{height:6em}input[type=number]:hover,input[type=text]:hover,select:hover,textarea:hover{border-color:#d5d5d5}input[type=number]:focus,input[type=text]:focus,select:focus,textarea:focus{cursor:auto;border-color:#3a93ee}textarea{line-height:1.5}input[type=checkbox],input[type=radio]{display:inline-block;width:1em;height:1em;font:inherit;margin:0}button{box-sizing:border-box;height:2em;font:inherit;border:1px solid #9e9e9e;cursor:pointer;background:0 0}button:hover{border-color:#d5d5d5}button:focus{border-color:#3a93ee}.dialog-body{margin:2em}.webext-pref-toolbar{display:flex;align-items:center;margin-bottom:1em}.dialog-title{font-size:1.34em;margin:0 2em 0 0;flex-grow:1}.webext-pref-toolbar button{font-size:.7em;margin-left:.5em}.webext-pref-nav{display:flex;margin-bottom:1em}.webext-pref-nav select{text-align:center;text-align-last:center}.webext-pref-nav button{width:2em}.webext-pref-number,.webext-pref-radiogroup,.webext-pref-select,.webext-pref-text,.webext-pref-textarea{margin:1em 0}.webext-pref-body>:first-child{margin-top:0}.webext-pref-body>:last-child{margin-bottom:0}.webext-pref-number>input,.webext-pref-select>select,.webext-pref-text>input,.webext-pref-textarea>textarea{margin:.3em 0}.webext-pref-checkbox,.webext-pref-radio{margin:.5em 0;padding-left:1.5em}.webext-pref-checkbox>input,.webext-pref-radio>input{margin-left:-1.5em;margin-right:.5em;vertical-align:middle}.webext-pref-checkbox>label,.webext-pref-radio>label{cursor:pointer;vertical-align:middle}.webext-pref-checkbox>label:hover,.webext-pref-radio>label:hover{color:#707070}.webext-pref-checkbox-children,.webext-pref-radio-children{margin:.7em 0 0;padding:0;border-width:0}.webext-pref-checkbox-children[disabled],.webext-pref-radio-children[disabled]{opacity:.5}.webext-pref-checkbox-children>:first-child,.webext-pref-radio-children>:first-child{margin-top:0}.webext-pref-checkbox-children>:last-child,.webext-pref-radio-children>:last-child{margin-bottom:0}.webext-pref-checkbox-children>:last-child>:last-child,.webext-pref-radio-children>:last-child>:last-child{margin-bottom:0}.webext-pref-help{color:#969696}.responsive{white-space:normal}.responsive .dialog-body{margin:1em}.responsive .webext-pref-toolbar{display:block}.responsive .dialog-title{margin:0 0 1em 0}.responsive .webext-pref-toolbar button{font-size:1em}.responsive .webext-pref-nav{display:block}" + css;
      
      const root = iframe.contentDocument.querySelector(".dialog-body");
      root.append(createUI(options));
      
      destroyView = createBinding({
        pref,
        root,
        ...options
      });
      
      const title = document.createElement("h2");
      title.className = "dialog-title";
      title.textContent = getTitle();
      iframe.contentDocument.querySelector(".webext-pref-toolbar").prepend(title);
      
      if (iframe.contentDocument.body.offsetWidth > modal.offsetWidth) {
        iframe.contentDocument.body.classList.add("responsive");
      }
      
      // calc iframe size
      iframe.style = `
        width: ${iframe.contentDocument.body.offsetWidth}px;
        height: ${iframe.contentDocument.body.scrollHeight}px;
      `;
      
      modal.classList.add("webext-pref-modal-open");
    };
  }
  
  function getTitle() {
    return typeof GM_info === "object" ?
      GM_info.script.name : GM.info.script.name;
  }
}

function prefDefault() {
  return {
    fuzzyIp: true,
    embedImage: true,
    embedImageExcludeElement: ".hljs, .highlight, .brush\\:",
    ignoreMustache: false,
    unicode: false,
    mail: true,
    newTab: false,
    standalone: false,
    boundaryLeft: "{[(\"'",
    boundaryRight: "'\")]},.;?!",
    excludeElement: ".highlight, .editbox, .brush\\:, .bdsug, .spreadsheetinfo",
    includeElement: "",
    timeout: 10000,
    triggerByPageLoad: false,
    triggerByNewNode: false,
    triggerByHover: true,
    triggerByClick: !supportHover(),
    maxRunTime: 100,
    customRules: "",
  };
}

function supportHover() {
  return window.matchMedia("(hover)").matches;
}

var prefBody = getMessage => {
  return [
    {
      type: "section",
      label: getMessage("optionsUrlMatcherLabel"),
      children: [
        {
          key: "fuzzyIp",
          type: "checkbox",
          label: getMessage("optionsFuzzyIpLabel")
        },
        {
          key: "ignoreMustache",
          type: "checkbox",
          label: getMessage("optionsIgnoreMustacheLabel")
        },
        {
          key: "unicode",
          type: "checkbox",
          label: getMessage("optionsUnicodeLabel")
        },
        {
          key: "mail",
          type: "checkbox",
          label: getMessage("optionsMailLabel")
        },
        {
          key: "standalone",
          type: "checkbox",
          label: getMessage("optionsStandaloneLabel"),
          children: [
            {
              key: "boundaryLeft",
              type: "text",
              label: getMessage("optionsBoundaryLeftLabel")
            },
            {
              key: "boundaryRight",
              type: "text",
              label: getMessage("optionsBoundaryRightLabel")
            }
          ]
        },
        {
          key: "customRules",
          type: "textarea",
          label: getMessage("optionsCustomRulesLabel"),
          learnMore: "https://github.com/eight04/linkify-plus-plus?tab=readme-ov-file#custom-rules"
        },

      ]
    },
    {
      type: "section",
      label: getMessage("optionsLinkifierLabel"),
      children: [
        {
          key: "triggerByPageLoad",
          type: "checkbox",
          label: getMessage("optionsTriggerByPageLoadLabel")
        },
        {
          key: "triggerByNewNode",
          type: "checkbox",
          label: getMessage("optionsTriggerByNewNodeLabel")
        },
        {
          key: "triggerByHover",
          type: "checkbox",
          label: getMessage("optionsTriggerByHoverLabel")
        },
        {
          key: "triggerByClick",
          type: "checkbox",
          label: getMessage("optionsTriggerByClickLabel")
        },
        {
          key: "embedImage",
          type: "checkbox",
          label: getMessage("optionsEmbedImageLabel"),
          children: [
            {
              key: "embedImageExcludeElement",
              type: "textarea",
              label: getMessage("optionsEmbedImageExcludeElementLabel"),
              validate: validateSelector
            }
          ]
        },
        {
          key: "newTab",
          type: "checkbox",
          label: getMessage("optionsNewTabLabel")
        },
        {
          key: "excludeElement",
          type: "textarea",
          label: getMessage("optionsExcludeElementLabel"),
          validate: validateSelector
        },
        {
          key: "includeElement",
          type: "textarea",
          label: getMessage("optionsIncludeElementLabel"),
          validate: validateSelector
        },
        {
          key: "timeout",
          type: "number",
          label: getMessage("optionsTimeoutLabel"),
          help: getMessage("optionsTimeoutHelp")
        },
        {
          key: "maxRunTime",
          type: "number",
          label: getMessage("optionsMaxRunTimeLabel"),
          help: getMessage("optionsMaxRunTimeHelp")
        },
      ]
    },
  ];
  
  function validateSelector(value) {
    if (value) {
      document.documentElement.matches(value);
    }
  }
};

var maxLength = 24;
var chars = "セール佛山ಭಾರತ集团在线한국ଭାରତভাৰতর八卦ישראלموقعবংল公司网站移动我爱你москвақзнлйт联通рбгеקוםファッションストアசிங்கபூர商标店城дию家電中文信国國娱乐భారత్ලංකා购物クラウドભારતभारतम्ोसंगठन餐厅络у香港食品飞利浦台湾灣手机الجزئرنیتبيپکسدغظحةڀ澳門닷컴شكგე构健康ไทย招聘фລາວみんなευλ世界書籍ഭാരതംਭਾਰਤ址넷コム游戏ö企业息صط广东இலைநதயாհայ新加坡ف政务";
var table = {
	aaa: true,
	aarp: true,
	abb: true,
	abbott: true,
	abbvie: true,
	abc: true,
	able: true,
	abogado: true,
	abudhabi: true,
	ac: true,
	academy: true,
	accountant: true,
	accountants: true,
	aco: true,
	actor: true,
	ad: true,
	adult: true,
	ae: true,
	aeg: true,
	aero: true,
	aetna: true,
	af: true,
	afl: true,
	africa: true,
	ag: true,
	agency: true,
	ai: true,
	aig: true,
	airbus: true,
	airforce: true,
	akdn: true,
	al: true,
	allfinanz: true,
	allstate: true,
	ally: true,
	alsace: true,
	alstom: true,
	am: true,
	amazon: true,
	americanexpress: true,
	amex: true,
	amfam: true,
	amica: true,
	amsterdam: true,
	analytics: true,
	android: true,
	anz: true,
	ao: true,
	apartments: true,
	app: true,
	apple: true,
	aq: true,
	aquarelle: true,
	ar: true,
	archi: true,
	army: true,
	arpa: true,
	art: true,
	arte: true,
	as: true,
	asia: true,
	associates: true,
	at: true,
	attorney: true,
	au: true,
	auction: true,
	audi: true,
	audio: true,
	auspost: true,
	auto: true,
	autos: true,
	aw: true,
	aws: true,
	ax: true,
	axa: true,
	az: true,
	azure: true,
	ba: true,
	baby: true,
	band: true,
	bank: true,
	bar: true,
	barcelona: true,
	barclaycard: true,
	barclays: true,
	bargains: true,
	basketball: true,
	bauhaus: true,
	bayern: true,
	bb: true,
	bbc: true,
	bbva: true,
	bcn: true,
	bd: true,
	be: true,
	beauty: true,
	beer: true,
	bentley: true,
	berlin: true,
	best: true,
	bet: true,
	bf: true,
	bg: true,
	bh: true,
	bi: true,
	bible: true,
	bid: true,
	bike: true,
	bing: true,
	bingo: true,
	bio: true,
	biz: true,
	bj: true,
	black: true,
	blackfriday: true,
	blog: true,
	bloomberg: true,
	blue: true,
	bm: true,
	bmw: true,
	bn: true,
	bnpparibas: true,
	bo: true,
	boats: true,
	bond: true,
	boo: true,
	bostik: true,
	boston: true,
	bot: true,
	boutique: true,
	box: true,
	br: true,
	bradesco: true,
	bridgestone: true,
	broadway: true,
	broker: true,
	brother: true,
	brussels: true,
	bs: true,
	bt: true,
	build: true,
	builders: true,
	business: true,
	buzz: true,
	bw: true,
	by: true,
	bz: true,
	bzh: true,
	ca: true,
	cab: true,
	cafe: true,
	cam: true,
	camera: true,
	camp: true,
	canon: true,
	capetown: true,
	capital: true,
	car: true,
	cards: true,
	care: true,
	career: true,
	careers: true,
	cars: true,
	casa: true,
	"case": true,
	cash: true,
	casino: true,
	cat: true,
	catering: true,
	catholic: true,
	cba: true,
	cbn: true,
	cc: true,
	cd: true,
	center: true,
	ceo: true,
	cern: true,
	cf: true,
	cfa: true,
	cfd: true,
	cg: true,
	ch: true,
	chanel: true,
	channel: true,
	charity: true,
	chase: true,
	chat: true,
	cheap: true,
	chintai: true,
	christmas: true,
	church: true,
	ci: true,
	cisco: true,
	citi: true,
	citic: true,
	city: true,
	ck: true,
	cl: true,
	claims: true,
	cleaning: true,
	click: true,
	clinic: true,
	clothing: true,
	cloud: true,
	club: true,
	clubmed: true,
	cm: true,
	cn: true,
	co: true,
	coach: true,
	codes: true,
	coffee: true,
	college: true,
	cologne: true,
	com: true,
	commbank: true,
	community: true,
	company: true,
	compare: true,
	computer: true,
	condos: true,
	construction: true,
	consulting: true,
	contact: true,
	contractors: true,
	cooking: true,
	cool: true,
	coop: true,
	corsica: true,
	country: true,
	coupons: true,
	courses: true,
	cpa: true,
	cr: true,
	credit: true,
	creditcard: true,
	creditunion: true,
	cricket: true,
	crown: true,
	crs: true,
	cruises: true,
	cu: true,
	cuisinella: true,
	cv: true,
	cw: true,
	cx: true,
	cy: true,
	cymru: true,
	cyou: true,
	cz: true,
	dad: true,
	dance: true,
	date: true,
	dating: true,
	day: true,
	de: true,
	deal: true,
	dealer: true,
	deals: true,
	degree: true,
	delivery: true,
	dell: true,
	deloitte: true,
	democrat: true,
	dental: true,
	dentist: true,
	desi: true,
	design: true,
	dev: true,
	dhl: true,
	diamonds: true,
	diet: true,
	digital: true,
	direct: true,
	directory: true,
	discount: true,
	discover: true,
	diy: true,
	dj: true,
	dk: true,
	dm: true,
	"do": true,
	doctor: true,
	dog: true,
	domains: true,
	download: true,
	dubai: true,
	dupont: true,
	durban: true,
	dvag: true,
	dz: true,
	earth: true,
	ec: true,
	eco: true,
	edeka: true,
	edu: true,
	education: true,
	ee: true,
	eg: true,
	email: true,
	emerck: true,
	energy: true,
	engineer: true,
	engineering: true,
	enterprises: true,
	equipment: true,
	er: true,
	ericsson: true,
	erni: true,
	es: true,
	esq: true,
	estate: true,
	et: true,
	eu: true,
	eurovision: true,
	eus: true,
	events: true,
	exchange: true,
	expert: true,
	exposed: true,
	express: true,
	extraspace: true,
	fage: true,
	fail: true,
	fairwinds: true,
	faith: true,
	family: true,
	fan: true,
	fans: true,
	farm: true,
	fashion: true,
	feedback: true,
	ferrero: true,
	fi: true,
	film: true,
	finance: true,
	financial: true,
	firmdale: true,
	fish: true,
	fishing: true,
	fit: true,
	fitness: true,
	fj: true,
	fk: true,
	flickr: true,
	flights: true,
	flir: true,
	florist: true,
	flowers: true,
	fm: true,
	fo: true,
	foo: true,
	food: true,
	football: true,
	ford: true,
	forex: true,
	forsale: true,
	forum: true,
	foundation: true,
	fox: true,
	fr: true,
	fresenius: true,
	frl: true,
	frogans: true,
	fujitsu: true,
	fun: true,
	fund: true,
	furniture: true,
	futbol: true,
	fyi: true,
	ga: true,
	gal: true,
	gallery: true,
	game: true,
	games: true,
	garden: true,
	gay: true,
	gd: true,
	gdn: true,
	ge: true,
	gea: true,
	gent: true,
	genting: true,
	gf: true,
	gg: true,
	gh: true,
	gi: true,
	gift: true,
	gifts: true,
	gives: true,
	giving: true,
	gl: true,
	glass: true,
	gle: true,
	global: true,
	globo: true,
	gm: true,
	gmail: true,
	gmbh: true,
	gmo: true,
	gmx: true,
	gn: true,
	godaddy: true,
	gold: true,
	golf: true,
	goog: true,
	google: true,
	gop: true,
	gov: true,
	gp: true,
	gq: true,
	gr: true,
	grainger: true,
	graphics: true,
	gratis: true,
	green: true,
	gripe: true,
	group: true,
	gs: true,
	gt: true,
	gu: true,
	gucci: true,
	guide: true,
	guitars: true,
	guru: true,
	gw: true,
	gy: true,
	hair: true,
	hamburg: true,
	haus: true,
	health: true,
	healthcare: true,
	help: true,
	helsinki: true,
	here: true,
	hermes: true,
	hiphop: true,
	hisamitsu: true,
	hitachi: true,
	hiv: true,
	hk: true,
	hm: true,
	hn: true,
	hockey: true,
	holdings: true,
	holiday: true,
	homes: true,
	honda: true,
	horse: true,
	hospital: true,
	host: true,
	hosting: true,
	hotmail: true,
	house: true,
	how: true,
	hr: true,
	hsbc: true,
	ht: true,
	hu: true,
	hyatt: true,
	hyundai: true,
	ice: true,
	icu: true,
	id: true,
	ie: true,
	ieee: true,
	ifm: true,
	ikano: true,
	il: true,
	im: true,
	imamat: true,
	immo: true,
	immobilien: true,
	"in": true,
	inc: true,
	industries: true,
	info: true,
	ing: true,
	ink: true,
	institute: true,
	insurance: true,
	insure: true,
	int: true,
	international: true,
	investments: true,
	io: true,
	ipiranga: true,
	iq: true,
	ir: true,
	irish: true,
	is: true,
	ismaili: true,
	ist: true,
	istanbul: true,
	it: true,
	itau: true,
	itv: true,
	jaguar: true,
	java: true,
	jcb: true,
	je: true,
	jetzt: true,
	jewelry: true,
	jio: true,
	jll: true,
	jm: true,
	jmp: true,
	jnj: true,
	jo: true,
	jobs: true,
	joburg: true,
	jp: true,
	jpmorgan: true,
	jprs: true,
	juegos: true,
	kaufen: true,
	ke: true,
	kfh: true,
	kg: true,
	kh: true,
	ki: true,
	kia: true,
	kids: true,
	kim: true,
	kitchen: true,
	kiwi: true,
	km: true,
	kn: true,
	koeln: true,
	komatsu: true,
	kp: true,
	kpmg: true,
	kpn: true,
	kr: true,
	krd: true,
	kred: true,
	kw: true,
	ky: true,
	kyoto: true,
	kz: true,
	la: true,
	lamborghini: true,
	lancaster: true,
	land: true,
	landrover: true,
	lanxess: true,
	lat: true,
	latrobe: true,
	law: true,
	lawyer: true,
	lb: true,
	lc: true,
	lease: true,
	leclerc: true,
	legal: true,
	lexus: true,
	lgbt: true,
	li: true,
	lidl: true,
	life: true,
	lifestyle: true,
	lighting: true,
	lilly: true,
	limited: true,
	limo: true,
	lincoln: true,
	link: true,
	live: true,
	living: true,
	lk: true,
	llc: true,
	loan: true,
	loans: true,
	locker: true,
	locus: true,
	lol: true,
	london: true,
	lotto: true,
	love: true,
	lr: true,
	ls: true,
	lt: true,
	ltd: true,
	ltda: true,
	lu: true,
	lundbeck: true,
	luxe: true,
	luxury: true,
	lv: true,
	ly: true,
	ma: true,
	madrid: true,
	maif: true,
	maison: true,
	makeup: true,
	man: true,
	management: true,
	mango: true,
	market: true,
	marketing: true,
	markets: true,
	marriott: true,
	mattel: true,
	mba: true,
	mc: true,
	md: true,
	me: true,
	med: true,
	media: true,
	meet: true,
	melbourne: true,
	meme: true,
	memorial: true,
	men: true,
	menu: true,
	mg: true,
	mh: true,
	miami: true,
	microsoft: true,
	mil: true,
	mini: true,
	mit: true,
	mk: true,
	ml: true,
	mlb: true,
	mm: true,
	mma: true,
	mn: true,
	mo: true,
	mobi: true,
	moda: true,
	moe: true,
	moi: true,
	mom: true,
	monash: true,
	money: true,
	monster: true,
	mortgage: true,
	moscow: true,
	motorcycles: true,
	mov: true,
	movie: true,
	mp: true,
	mq: true,
	mr: true,
	ms: true,
	mt: true,
	mtn: true,
	mtr: true,
	mu: true,
	museum: true,
	music: true,
	mv: true,
	mw: true,
	mx: true,
	my: true,
	mz: true,
	na: true,
	nab: true,
	nagoya: true,
	name: true,
	navy: true,
	nc: true,
	ne: true,
	nec: true,
	net: true,
	netbank: true,
	network: true,
	neustar: true,
	"new": true,
	news: true,
	next: true,
	nexus: true,
	nf: true,
	ng: true,
	ngo: true,
	nhk: true,
	ni: true,
	nico: true,
	nike: true,
	ninja: true,
	nissan: true,
	nl: true,
	no: true,
	nokia: true,
	now: true,
	nowruz: true,
	np: true,
	nr: true,
	nra: true,
	nrw: true,
	ntt: true,
	nu: true,
	nyc: true,
	nz: true,
	observer: true,
	office: true,
	okinawa: true,
	om: true,
	omega: true,
	one: true,
	ong: true,
	onl: true,
	online: true,
	ooo: true,
	oracle: true,
	orange: true,
	org: true,
	organic: true,
	osaka: true,
	otsuka: true,
	ovh: true,
	pa: true,
	page: true,
	panasonic: true,
	paris: true,
	partners: true,
	parts: true,
	party: true,
	pe: true,
	pet: true,
	pf: true,
	pfizer: true,
	pg: true,
	ph: true,
	pharmacy: true,
	phd: true,
	philips: true,
	photo: true,
	photography: true,
	photos: true,
	physio: true,
	pics: true,
	pictet: true,
	pictures: true,
	ping: true,
	pink: true,
	pioneer: true,
	pizza: true,
	pk: true,
	pl: true,
	place: true,
	play: true,
	plumbing: true,
	plus: true,
	pm: true,
	pn: true,
	pohl: true,
	poker: true,
	politie: true,
	porn: true,
	post: true,
	pr: true,
	praxi: true,
	press: true,
	prime: true,
	pro: true,
	productions: true,
	prof: true,
	promo: true,
	properties: true,
	property: true,
	protection: true,
	pru: true,
	prudential: true,
	ps: true,
	pt: true,
	pub: true,
	pw: true,
	pwc: true,
	py: true,
	qa: true,
	qpon: true,
	quebec: true,
	quest: true,
	racing: true,
	radio: true,
	re: true,
	realestate: true,
	realtor: true,
	realty: true,
	recipes: true,
	red: true,
	redstone: true,
	rehab: true,
	reise: true,
	reisen: true,
	reit: true,
	ren: true,
	rent: true,
	rentals: true,
	repair: true,
	report: true,
	republican: true,
	rest: true,
	restaurant: true,
	review: true,
	reviews: true,
	rexroth: true,
	rich: true,
	ricoh: true,
	rio: true,
	rip: true,
	ro: true,
	rocks: true,
	rodeo: true,
	rogers: true,
	rs: true,
	rsvp: true,
	ru: true,
	rugby: true,
	ruhr: true,
	run: true,
	rw: true,
	ryukyu: true,
	sa: true,
	saarland: true,
	sale: true,
	salon: true,
	samsung: true,
	sandvik: true,
	sandvikcoromant: true,
	sanofi: true,
	sap: true,
	sarl: true,
	saxo: true,
	sb: true,
	sbi: true,
	sbs: true,
	sc: true,
	scb: true,
	schaeffler: true,
	schmidt: true,
	school: true,
	schule: true,
	schwarz: true,
	science: true,
	scot: true,
	sd: true,
	se: true,
	seat: true,
	security: true,
	select: true,
	sener: true,
	services: true,
	seven: true,
	sew: true,
	sex: true,
	sexy: true,
	sfr: true,
	sg: true,
	sh: true,
	sharp: true,
	shell: true,
	shiksha: true,
	shoes: true,
	shop: true,
	shopping: true,
	show: true,
	si: true,
	singles: true,
	site: true,
	sk: true,
	ski: true,
	skin: true,
	sky: true,
	skype: true,
	sl: true,
	sm: true,
	smart: true,
	sn: true,
	sncf: true,
	so: true,
	soccer: true,
	social: true,
	softbank: true,
	software: true,
	sohu: true,
	solar: true,
	solutions: true,
	sony: true,
	soy: true,
	spa: true,
	space: true,
	sport: true,
	sr: true,
	srl: true,
	ss: true,
	st: true,
	stada: true,
	statebank: true,
	statefarm: true,
	stc: true,
	stockholm: true,
	storage: true,
	store: true,
	stream: true,
	studio: true,
	study: true,
	style: true,
	su: true,
	sucks: true,
	supplies: true,
	supply: true,
	support: true,
	surf: true,
	surgery: true,
	suzuki: true,
	sv: true,
	swatch: true,
	swiss: true,
	sx: true,
	sy: true,
	sydney: true,
	systems: true,
	sz: true,
	taipei: true,
	target: true,
	tatamotors: true,
	tatar: true,
	tattoo: true,
	tax: true,
	taxi: true,
	tc: true,
	td: true,
	team: true,
	tech: true,
	technology: true,
	tel: true,
	temasek: true,
	tennis: true,
	teva: true,
	tf: true,
	tg: true,
	th: true,
	theater: true,
	theatre: true,
	tickets: true,
	tienda: true,
	tips: true,
	tires: true,
	tirol: true,
	tj: true,
	tk: true,
	tl: true,
	tm: true,
	tn: true,
	to: true,
	today: true,
	tokyo: true,
	tools: true,
	top: true,
	toray: true,
	toshiba: true,
	total: true,
	tours: true,
	town: true,
	toyota: true,
	toys: true,
	tr: true,
	trade: true,
	trading: true,
	training: true,
	travel: true,
	travelers: true,
	trust: true,
	tt: true,
	tube: true,
	tui: true,
	tv: true,
	tvs: true,
	tw: true,
	tz: true,
	ua: true,
	ug: true,
	uk: true,
	unicom: true,
	university: true,
	uno: true,
	uol: true,
	us: true,
	uy: true,
	uz: true,
	va: true,
	vacations: true,
	vana: true,
	vanguard: true,
	vc: true,
	ve: true,
	vegas: true,
	ventures: true,
	versicherung: true,
	vet: true,
	vg: true,
	vi: true,
	viajes: true,
	video: true,
	vig: true,
	villas: true,
	vin: true,
	vip: true,
	vision: true,
	vivo: true,
	vlaanderen: true,
	vn: true,
	vodka: true,
	vote: true,
	voting: true,
	voto: true,
	voyage: true,
	vu: true,
	wales: true,
	walter: true,
	wang: true,
	watch: true,
	watches: true,
	webcam: true,
	weber: true,
	website: true,
	wed: true,
	wedding: true,
	weir: true,
	wf: true,
	whoswho: true,
	wien: true,
	wiki: true,
	williamhill: true,
	win: true,
	windows: true,
	wine: true,
	wme: true,
	woodside: true,
	work: true,
	works: true,
	world: true,
	ws: true,
	wtf: true,
	xbox: true,
	xin: true,
	"xn--1ck2e1b": true,
	"xn--1qqw23a": true,
	"xn--2scrj9c": true,
	"xn--3bst00m": true,
	"xn--3ds443g": true,
	"xn--3e0b707e": true,
	"xn--3hcrj9c": true,
	"xn--45br5cyl": true,
	"xn--45brj9c": true,
	"xn--45q11c": true,
	"xn--4dbrk0ce": true,
	"xn--4gbrim": true,
	"xn--54b7fta0cc": true,
	"xn--55qx5d": true,
	"xn--5tzm5g": true,
	"xn--6frz82g": true,
	"xn--6qq986b3xl": true,
	"xn--80adxhks": true,
	"xn--80ao21a": true,
	"xn--80asehdb": true,
	"xn--80aswg": true,
	"xn--8y0a063a": true,
	"xn--90a3ac": true,
	"xn--90ae": true,
	"xn--90ais": true,
	"xn--9dbq2a": true,
	"xn--bck1b9a5dre4c": true,
	"xn--c1avg": true,
	"xn--cck2b3b": true,
	"xn--clchc0ea0b2g2a9gcd": true,
	"xn--czr694b": true,
	"xn--czrs0t": true,
	"xn--czru2d": true,
	"xn--d1acj3b": true,
	"xn--d1alf": true,
	"xn--e1a4c": true,
	"xn--fct429k": true,
	"xn--fiq228c5hs": true,
	"xn--fiq64b": true,
	"xn--fiqs8s": true,
	"xn--fiqz9s": true,
	"xn--fjq720a": true,
	"xn--fpcrj9c3d": true,
	"xn--fzc2c9e2c": true,
	"xn--g2xx48c": true,
	"xn--gckr3f0f": true,
	"xn--gecrj9c": true,
	"xn--h2breg3eve": true,
	"xn--h2brj9c": true,
	"xn--h2brj9c8c": true,
	"xn--hxt814e": true,
	"xn--i1b6b1a6a2e": true,
	"xn--imr513n": true,
	"xn--io0a7i": true,
	"xn--j1amh": true,
	"xn--j6w193g": true,
	"xn--jvr189m": true,
	"xn--kcrx77d1x4a": true,
	"xn--kprw13d": true,
	"xn--kpry57d": true,
	"xn--kput3i": true,
	"xn--l1acc": true,
	"xn--lgbbat1ad8j": true,
	"xn--mgb9awbf": true,
	"xn--mgba3a4f16a": true,
	"xn--mgbaam7a8h": true,
	"xn--mgbab2bd": true,
	"xn--mgbah1a3hjkrd": true,
	"xn--mgbai9azgqp6j": true,
	"xn--mgbayh7gpa": true,
	"xn--mgbbh1a": true,
	"xn--mgbc0a9azcg": true,
	"xn--mgbca7dzdo": true,
	"xn--mgbcpq6gpa1a": true,
	"xn--mgberp4a5d4ar": true,
	"xn--mgbgu82a": true,
	"xn--mgbpl2fh": true,
	"xn--mgbtx2b": true,
	"xn--mix891f": true,
	"xn--mk1bu44c": true,
	"xn--ngbc5azd": true,
	"xn--ngbe9e0a": true,
	"xn--node": true,
	"xn--nqv7f": true,
	"xn--nyqy26a": true,
	"xn--o3cw4h": true,
	"xn--ogbpf8fl": true,
	"xn--otu796d": true,
	"xn--p1acf": true,
	"xn--p1ai": true,
	"xn--pgbs0dh": true,
	"xn--q7ce6a": true,
	"xn--q9jyb4c": true,
	"xn--qxa6a": true,
	"xn--qxam": true,
	"xn--rhqv96g": true,
	"xn--rovu88b": true,
	"xn--rvc1e0am3e": true,
	"xn--s9brj9c": true,
	"xn--ses554g": true,
	"xn--t60b56a": true,
	"xn--tckwe": true,
	"xn--unup4y": true,
	"xn--vermgensberatung-pwb": true,
	"xn--vhquv": true,
	"xn--vuq861b": true,
	"xn--wgbh1c": true,
	"xn--wgbl6a": true,
	"xn--xhq521b": true,
	"xn--xkc2al3hye2a": true,
	"xn--xkc2dl3a5ee0h": true,
	"xn--y9a3aq": true,
	"xn--yfro4i67o": true,
	"xn--ygbi2ammx": true,
	"xn--zfr164b": true,
	xxx: true,
	xyz: true,
	yachts: true,
	yahoo: true,
	yandex: true,
	ye: true,
	yodobashi: true,
	yoga: true,
	yokohama: true,
	youtube: true,
	yt: true,
	za: true,
	zappos: true,
	zara: true,
	zip: true,
	zm: true,
	zone: true,
	zuerich: true,
	zw: true,
	"セール": true,
	"佛山": true,
	"ಭಾರತ": true,
	"集团": true,
	"在线": true,
	"한국": true,
	"ଭାରତ": true,
	"ভাৰত": true,
	"ভারত": true,
	"八卦": true,
	"ישראל": true,
	"موقع": true,
	"বাংলা": true,
	"公司": true,
	"网站": true,
	"移动": true,
	"我爱你": true,
	"москва": true,
	"қаз": true,
	"онлайн": true,
	"сайт": true,
	"联通": true,
	"срб": true,
	"бг": true,
	"бел": true,
	"קום": true,
	"ファッション": true,
	"орг": true,
	"ストア": true,
	"சிங்கப்பூர்": true,
	"商标": true,
	"商店": true,
	"商城": true,
	"дети": true,
	"мкд": true,
	"ею": true,
	"家電": true,
	"中文网": true,
	"中信": true,
	"中国": true,
	"中國": true,
	"娱乐": true,
	"భారత్": true,
	"ලංකා": true,
	"购物": true,
	"クラウド": true,
	"ભારત": true,
	"भारतम्": true,
	"भारत": true,
	"भारोत": true,
	"网店": true,
	"संगठन": true,
	"餐厅": true,
	"网络": true,
	"укр": true,
	"香港": true,
	"食品": true,
	"飞利浦": true,
	"台湾": true,
	"台灣": true,
	"手机": true,
	"мон": true,
	"الجزائر": true,
	"عمان": true,
	"ایران": true,
	"امارات": true,
	"بازار": true,
	"موريتانيا": true,
	"پاکستان": true,
	"الاردن": true,
	"بارت": true,
	"المغرب": true,
	"ابوظبي": true,
	"البحرين": true,
	"السعودية": true,
	"ڀارت": true,
	"سودان": true,
	"عراق": true,
	"澳門": true,
	"닷컴": true,
	"شبكة": true,
	"بيتك": true,
	"გე": true,
	"机构": true,
	"健康": true,
	"ไทย": true,
	"سورية": true,
	"招聘": true,
	"рус": true,
	"рф": true,
	"تونس": true,
	"ລາວ": true,
	"みんな": true,
	"ευ": true,
	"ελ": true,
	"世界": true,
	"書籍": true,
	"ഭാരതം": true,
	"ਭਾਰਤ": true,
	"网址": true,
	"닷넷": true,
	"コム": true,
	"游戏": true,
	"vermögensberatung": true,
	"企业": true,
	"信息": true,
	"مصر": true,
	"قطر": true,
	"广东": true,
	"இலங்கை": true,
	"இந்தியா": true,
	"հայ": true,
	"新加坡": true,
	"فلسطين": true,
	"政务": true,
	onion: true
};

var RE = {
		PROTOCOL: "([a-z][-a-z*]+://)?",
		USER: "(?:([\\w:.+-]+)@)?",
		DOMAIN_UNI: `([a-z0-9-.\\u00A0-\\uFFFF]+\\.[a-z0-9-${chars}]{1,${maxLength}})`,
		DOMAIN: `([a-z0-9-.]+\\.[a-z0-9-]{1,${maxLength}})`,
		PORT: "(:\\d+\\b)?",
		PATH_UNI: "([/?#]\\S*)?",
		PATH: "([/?#][\\w-.~!$&*+;=:@%/?#(),'\\[\\]]*)?"
	},
	TLD_TABLE = table;

function regexEscape(text) {
	return text.replace(/[[\]\\^-]/g, "\\$&");
}

function buildRegex({
	unicode = false, customRules = [], standalone = false,
	boundaryLeft, boundaryRight
}) {
	var pattern = RE.PROTOCOL + RE.USER;
	
	if (unicode) {
		pattern += RE.DOMAIN_UNI + RE.PORT + RE.PATH_UNI;
	} else {
		pattern += RE.DOMAIN + RE.PORT + RE.PATH;
	}
	
	if (customRules.length) {
		pattern = "(?:(" + customRules.join("|") + ")|" + pattern + ")";
	} else {
		pattern = "()" + pattern;
	}
	
	var prefix, suffix, invalidSuffix;
	if (standalone) {
		if (boundaryLeft) {
			prefix = "((?:^|\\s)[" + regexEscape(boundaryLeft) + "]*?)";
		} else {
			prefix = "(^|\\s)";
		}
		if (boundaryRight) {
			suffix = "([" + regexEscape(boundaryRight) + "]*(?:$|\\s))";
		} else {
			suffix = "($|\\s)";
		}
		invalidSuffix = "[^\\s" + regexEscape(boundaryRight) + "]";
	} else {
		prefix = "(^|\\b|_)";
		suffix = "()";
	}
	
	pattern = prefix + pattern + suffix;
	
	return {
		url: new RegExp(pattern, "igm"),
		invalidSuffix: invalidSuffix && new RegExp(invalidSuffix),
		mustache: /\{\{[\s\S]+?\}\}/g
	};
}

function pathStrip(m, re, repl) {
	var s = m.path.replace(re, repl);

	if (s == m.path) return;
	
	m.end -= m.path.length - s.length;
	m.suffix = m.path.slice(s.length) + m.suffix;
	m.path = s;
}

function pathStripQuote(m, c) {
	var i = 0, s = m.path, end, pos = 0;
	
	if (!s.endsWith(c)) return;
	
	while ((pos = s.indexOf(c, pos)) >= 0) {
		if (i % 2) {
			end = null;
		} else {
			end = pos;
		}
		pos++;
		i++;
	}
	
	if (!end) return;
	
	m.end -= s.length - end;
	m.path = s.slice(0, end);
	m.suffix = s.slice(end) + m.suffix;
}

function pathStripBrace(m, left, right) {
	var str = m.path,
		re = new RegExp("[\\" + left + "\\" + right + "]", "g"),
		match, count = 0, end;

	// Match loop
	while ((match = re.exec(str))) {
		if (count % 2 == 0) {
			end = match.index;
			if (match[0] == right) {
				break;
			}
		} else {
			if (match[0] == left) {
				break;
			}
		}
		count++;
	}

	if (!match && count % 2 == 0) {
		return;
	}
	
	m.end -= m.path.length - end;
	m.path = str.slice(0, end);
	m.suffix = str.slice(end) + m.suffix;
}

function isIP(s) {
	var m, i;
	if (!(m = s.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/))) {
		return false;
	}
	for (i = 1; i < m.length; i++) {
		if (+m[i] > 255 || (m[i].length > 1 && m[i][0] == "0")) {
			return false;
		}
	}
	return true;
}

function inTLDS(domain) {
	var match = domain.match(/\.([^.]+)$/);
	if (!match) {
		return false;
	}
	var key = match[1].toLowerCase();
  // eslint-disable-next-line no-prototype-builtins
	return TLD_TABLE.hasOwnProperty(key);
}

class UrlMatcher {
	constructor(options = {}) {
		this.options = options;
		this.regex = buildRegex(options);
	}
	
	*match(text) {
		var {
				fuzzyIp = true,
				ignoreMustache = false,
        mail = true
			} = this.options,
			{
				url,
				invalidSuffix,
				mustache
			} = this.regex,
			urlLastIndex, mustacheLastIndex;
			
		mustache.lastIndex = 0;
		url.lastIndex = 0;
		
		var mustacheMatch, mustacheRange;
		if (ignoreMustache) {
			mustacheMatch = mustache.exec(text);
			if (mustacheMatch) {
				mustacheRange = {
					start: mustacheMatch.index,
					end: mustache.lastIndex
				};
			}
		}
		
		var urlMatch;
		while ((urlMatch = url.exec(text))) {
      const result = {
        start: 0,
        end: 0,
        
        text: "",
        url: "",
        
        prefix: urlMatch[1],
        custom: urlMatch[2],
        protocol: urlMatch[3],
        auth: urlMatch[4] || "",
        domain: urlMatch[5],
        port: urlMatch[6] || "",
        path: urlMatch[7] || "",
        suffix: urlMatch[8]
      };
      
      if (result.custom) {
        result.start = urlMatch.index;
        result.end = url.lastIndex;
        result.text = result.url = urlMatch[0];
			} else {
        
        result.start = urlMatch.index + result.prefix.length;
        result.end = url.lastIndex - result.suffix.length;
			}
			
			if (mustacheRange && mustacheRange.end <= result.start) {
				mustacheMatch = mustache.exec(text);
				if (mustacheMatch) {
					mustacheRange.start = mustacheMatch.index;
					mustacheRange.end = mustache.lastIndex;
				} else {
					mustacheRange = null;
				}
			}
			
			// ignore urls inside mustache pair
			if (mustacheRange && result.start < mustacheRange.end && result.end >= mustacheRange.start) {
				continue;
			}
			
			if (!result.custom) {
				// adjust path and suffix
				if (result.path) {
					// Strip BBCode
					pathStrip(result, /\[\/?(b|i|u|url|img|quote|code|size|color)\].*/i, "");
					
					// Strip braces
					pathStripBrace(result, "(", ")");
					pathStripBrace(result, "[", "]");
					pathStripBrace(result, "{", "}");
					
					// Strip quotes
					pathStripQuote(result, "'");
					pathStripQuote(result, '"');
					
					// Remove trailing ".,?"
					pathStrip(result, /(^|[^-_])[.,?]+$/, "$1");
				}
				
				// check suffix
				if (invalidSuffix && invalidSuffix.test(result.suffix)) {
					if (/\s$/.test(result.suffix)) {
						url.lastIndex--;
					}
					continue;
				}
        
        // ignore fuzzy ip
				if (!fuzzyIp && isIP(result.domain) &&
            !result.protocol && !result.auth && !result.path) {
          continue;
        }
        
				// mailto protocol
				if (!result.protocol && result.auth) {
					var matchMail = result.auth.match(/^mailto:(.+)/);
					if (matchMail) {
						result.protocol = "mailto:";
						result.auth = matchMail[1];
					}
				}

				// http alias
				if (result.protocol && result.protocol.match(/^(hxxp|h\*\*p|ttp)/)) {
					result.protocol = "http://";
				}

				// guess protocol
				if (!result.protocol) {
					var domainMatch;
					if ((domainMatch = result.domain.match(/^(ftp|irc)/))) {
						result.protocol = domainMatch[0] + "://";
					} else if (result.domain.match(/^(www|web)/)) {
						result.protocol = "http://";
					} else if (result.auth && result.auth.indexOf(":") < 0 && !result.path) {
						result.protocol = "mailto:";
					} else {
						result.protocol = "http://";
					}
				}
        
        // ignore mail
        if (!mail && result.protocol === "mailto:") {
          continue;
        }
        
				// verify domain
        if (!isIP(result.domain)) {
          if (/^(http|https|mailto)/.test(result.protocol) && !inTLDS(result.domain)) {
            continue;
          }
          
          const invalidLabel = getInvalidLabel(result.domain);
          if (invalidLabel) {
            url.lastIndex = urlMatch.index + invalidLabel.index + 1;
            continue;
          }
        }

				// Create URL
				result.url = result.protocol + (result.auth && result.auth + "@") + result.domain + result.port + result.path;
				result.text = text.slice(result.start, result.end);
			}
			
			// since regex is shared with other parse generators, cache lastIndex position and restore later
			mustacheLastIndex = mustache.lastIndex;
			urlLastIndex = url.lastIndex;
			
			yield result;
			
			url.lastIndex = urlLastIndex;
			mustache.lastIndex = mustacheLastIndex;
		}
	}
}

function getInvalidLabel(domain) {
  // https://tools.ietf.org/html/rfc1035
  // https://serverfault.com/questions/638260/is-it-valid-for-a-hostname-to-start-with-a-digit
  let index = 0;
  const parts = domain.split(".");
  for (const part of parts) {
    if (
      !part ||
      part.startsWith("-") ||
      part.endsWith("-")
    ) {
      return {
        index,
        value: part
      };
    }
    index += part.length + 1;
  }
}

/* eslint-env browser */


var INVALID_TAGS = {
	a: true,
	noscript: true,
	option: true,
	script: true,
	style: true,
	textarea: true,
	svg: true,
	canvas: true,
	button: true,
	select: true,
	template: true,
	meter: true,
	progress: true,
	math: true,
	time: true
};

class Pos {
	constructor(container, offset, i = 0) {
		this.container = container;
		this.offset = offset;
		this.i = i;
	}
	
	add(change) {
		var cont = this.container,
			offset = this.offset;

		this.i += change;
		
		// If the container is #text.parentNode
		if (cont.childNodes.length) {
			cont = cont.childNodes[offset];
			offset = 0;
		}

		// If the container is #text
		while (cont) {
			if (cont.nodeType == 3) {
				if (!cont.LEN) {
					cont.LEN = cont.nodeValue.length;
				}
				if (offset + change <= cont.LEN) {
					this.container = cont;
					this.offset = offset + change;
					return;
				}
				change = offset + change - cont.LEN;
				offset = 0;
			}
			cont = cont.nextSibling;
		}
	}
	
	moveTo(offset) {
		this.add(offset - this.i);
	}
}

function cloneContents(range) {
	if (range.startContainer == range.endContainer) {
		return document.createTextNode(range.toString());
	}
	return range.cloneContents();
}

var DEFAULT_OPTIONS = {
	maxRunTime: 100,
	timeout: 10000,
	newTab: true,
	noOpener: true,
	embedImage: true,
  recursive: true,
};

class Linkifier extends EventLite {
	constructor(root, options = {}) {
		super();
		if (!(root instanceof Node)) {
			options = root;
			root = options.root;
		}
		this.root = root;
		this.options = Object.assign({}, DEFAULT_OPTIONS, options);
		this.aborted = false;
	}
	start() {
		var time = Date.now,
			startTime = time(),
			chunks = this.generateChunks();
			
		var next = () => {
			if (this.aborted) {
				this.emit("error", new Error("Aborted"));
				return;
			}
			var chunkStart = time(),
				now;
				
			do {
				if (chunks.next().done) {
					this.emit("complete", time() - startTime);
					return;
				}
			} while ((now = time()) - chunkStart < this.options.maxRunTime);
			
			if (now - startTime > this.options.timeout) {
				this.emit("error", new Error(`max execution time exceeded: ${now - startTime}, on ${this.root}`));
				return;
			}
			
			setTimeout(next);
		};
			
		setTimeout(next);
	}
	abort() {
		this.aborted = true;
	}
	*generateRanges() {
		var {validator, recursive} = this.options;
		var filter = {
			acceptNode: function(node) {
				if (validator && !validator(node)) {
					return NodeFilter.FILTER_REJECT;
				}
				if (INVALID_TAGS[node.localName]) {
					return NodeFilter.FILTER_REJECT;
				}
				if (node.localName == "wbr") {
					return NodeFilter.FILTER_ACCEPT;
				}
				if (node.nodeType == 3) {
					return NodeFilter.FILTER_ACCEPT;
				}
				return recursive ? NodeFilter.FILTER_SKIP : NodeFilter.FILTER_REJECT;
			}
		};
		// Generate linkified ranges.
		var walker = document.createTreeWalker(
			this.root,
			NodeFilter.SHOW_TEXT + NodeFilter.SHOW_ELEMENT,
			filter
		), start, end, current, range;

		end = start = walker.nextNode();
		if (!start) {
			return;
		}
		range = document.createRange();
		range.setStartBefore(start);
		while ((current = walker.nextNode())) {
			if (end.nextSibling == current) {
				end = current;
				continue;
			}
			range.setEndAfter(end);
			yield range;

			end = start = current;
			range.setStartBefore(start);
		}
		range.setEndAfter(end);
		yield range;
	}
	*generateChunks() {
		var {matcher} = this.options;
		for (var range of this.generateRanges()) {
			var frag = null,
				pos = null,
				text = range.toString(),
				textRange = null;
			for (var result of matcher.match(text)) {
				if (!frag) {
					frag = document.createDocumentFragment();
					pos = new Pos(range.startContainer, range.startOffset);
					textRange = range.cloneRange();
				}
				// clone text
				pos.moveTo(result.start);
				textRange.setEnd(pos.container, pos.offset);
				frag.appendChild(cloneContents(textRange));
				
				// clone link
				textRange.collapse();
				pos.moveTo(result.end);
				textRange.setEnd(pos.container, pos.offset);
				
				var content = cloneContents(textRange),
					link = this.buildLink(result, content);

				textRange.collapse();

				frag.appendChild(link);
				this.emit("link", {link, range, result, content});
			}
			if (pos) {
				pos.moveTo(text.length);
				textRange.setEnd(pos.container, pos.offset);
				frag.appendChild(cloneContents(textRange));
				
				range.deleteContents();
				range.insertNode(frag);
			}
			yield;
		}
	}
	buildLink(result, content) {
		var {newTab, embedImage, noOpener} = this.options;
		var link = document.createElement("a");
		link.href = result.url;
		link.title = "Linkify Plus Plus";
		link.className = "linkifyplus";
		if (newTab) {
			link.target = "_blank";
		}
		if (noOpener) {
			link.rel = "noopener";
		}
		var child;
		if (embedImage && /^[^?#]+\.(?:jpg|jpeg|png|apng|gif|svg|webp)(?:$|[?#])/i.test(result.url)) {
			child = new Image;
			child.src = result.url;
			child.alt = result.text;
		} else {
			child = content;
		}
		link.appendChild(child);
		return link;
	}
}

function linkify(...args) {
	return new Promise((resolve, reject) => {
		var linkifier = new Linkifier(...args);
		linkifier.on("error", reject);
		linkifier.on("complete", resolve);
		for (var key of Object.keys(linkifier.options)) {
			if (key.startsWith("on")) {
				linkifier.on(key.slice(2), linkifier.options[key]);
			}
		}
		linkifier.start();
	});
}

const processedNodes = new WeakSet;
const nodeValidationCache = new WeakMap; // Node -> boolean

async function linkifyRoot(root, options, useIncludeElement = true) {
  if (validRoot(root, options.validator)) {
    processedNodes.add(root);
    await linkify({...options, root, recursive: true});
  }
  if (options.includeElement && useIncludeElement) {
    for (const el of root.querySelectorAll(options.includeElement)) {
      await linkifyRoot(el, options, false);
    }
  }
}

function validRoot(node, validator) {
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

function prepareDocument() {
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

// import {processedNodes} from "./cache.mjs";

var load = {
  key: "triggerByPageLoad",
  enable: async options => {
    await prepareDocument();
    await linkifyRoot(document.body, options);
  },
  disable: () => {}
};

let options$1;

const EVENTS$1 = [
  ["click", handle$1, {passive: true}],
];

function handle$1(e) {
  const el = e.target;
  if (validRoot(el, options$1.validator)) {
    processedNodes.add(el);
    linkify({...options$1, root: el, recursive: false});
  }
} 

function enable$2(_options) {
  options$1 = _options;
  for (const [event, handler, options] of EVENTS$1) {
    document.addEventListener(event, handler, options);
  }
}

function disable$2() {
  for (const [event, handler, options] of EVENTS$1) {
    document.removeEventListener(event, handler, options);
  }
}

var click = {
  key: "triggerByClick",
  enable: enable$2,
  disable: disable$2
};

let options;

const EVENTS = [
  // catch the first mousemove event since mouseover doesn't fire at page refresh
  ["mousemove", handle, {passive: true, once: true}],
  ["mouseover", handle, {passive: true}]
];

function handle(e) {
  const el = e.target;
  if (validRoot(el, options.validator)) {
    processedNodes.add(el);
    linkify({...options, root: el, recursive: false});
  }
} 

function enable$1(_options) {
  options = _options;
  for (const [event, handler, options] of EVENTS) {
    document.addEventListener(event, handler, options);
  }
}

function disable$1() {
  for (const [event, handler, options] of EVENTS) {
    document.removeEventListener(event, handler, options);
  }
}

var hover = {
  key: "triggerByHover",
  enable: enable$1,
  disable: disable$1
};

const MAX_PROCESSES = 100;
let processes = 0;
let observer;

async function enable(options) {
  await prepareDocument();
  observer = new MutationObserver(function(mutations){
    // Filter out mutations generated by LPP
    var lastRecord = mutations[mutations.length - 1],
      nodes = lastRecord.addedNodes,
      i;

    if (nodes.length >= 2) {
      for (i = 0; i < 2; i++) {
        if (nodes[i].className == "linkifyplus") {
          return;
        }
      }
    }

    for (var record of mutations) {
      for (const node of record.addedNodes) {
        if (node.nodeType === 1 && !processedNodes.has(node)) {
          if (processes >= MAX_PROCESSES) {
            throw new Error("Too many processes");
          }
          processes++;
          linkifyRoot(node, options)
            .finally(() => {
              processes--;
            });
        }
      }
    }
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

async function disable() {
  await prepareDocument();
  observer && observer.disconnect();
}

var mutation = {
  key: "triggerByNewNode",
  enable,
  disable
};

var triggers = [load, click, hover, mutation];

function createValidator({includeElement, excludeElement}) {
  const f = function(node) {
    if (processedNodes.has(node)) {
      return false;
    }

    if (node.isContentEditable) {
      return false;
    }

    if (node.matches) {
      if (includeElement && node.matches(includeElement)) {
        return true;
      }
      if (excludeElement && node.matches(excludeElement)) {
        return false;
      }
    }
    return true;
  };
  f.isIncluded = node => {
    return includeElement && node.matches(includeElement);
  };
  f.isExcluded = node => {
    if (INVALID_TAGS[node.localName]) {
      return true;
    }
    return excludeElement && node.matches(excludeElement);
  };
  return f;
}

function stringToList(value) {
  value = value.trim();
  if (!value) {
    return [];
  }
  return value.split(/\s*\n\s*/g);  
}

function createOptions(pref) {
  const options = {};
  pref.on("change", update);
  update(pref.getAll());
  return options;
  
  function update(changes) {
    Object.assign(options, changes);
    options.validator = createValidator(options);
    if (typeof options.customRules === "string") {
      options.customRules = stringToList(options.customRules);
    }
    options.matcher = new UrlMatcher(options);
    options.onlink = options.embedImageExcludeElement ? onlink : null;
  }
  
  function onlink({link, range, content}) {
    if (link.childNodes[0].localName !== "img" || !options.embedImageExcludeElement) {
      return;
    }
    
    var parent = range.startContainer;
    // it might be a text node
    if (!parent.closest) {
      parent = parent.parentNode;
    }
    if (!parent.closest(options.embedImageExcludeElement)) return;
    // remove image
    link.innerHTML = "";
    link.appendChild(content);
  }
}

async function startLinkifyPlusPlus(getPref) {
  // Limit contentType to specific content type
  if (
    document.contentType &&
    !["text/plain", "text/html", "application/xhtml+xml"].includes(document.contentType)
  ) {
    return;
  }
  
  const pref = await getPref();
  const options = createOptions(pref);
  for (const trigger of triggers) {
    if (pref.get(trigger.key)) {
      trigger.enable(options);
    }
  }
  pref.on("change", changes => {
    for (const trigger of triggers) {
      if (changes[trigger.key] === true) {
        trigger.enable(options);
      }
      if (changes[trigger.key] === false) {
        trigger.disable();
      }
    }
  });
}

function getMessageFactory() {
  return (key, params) => {
    if (!params) {
      return translate[key];
    }
    if (!Array.isArray(params)) {
      params = [params];
    }
    return translate[key].replace(/\$\d/g, m => {
      const index = Number(m.slice(1));
      return params[index - 1];
    });
  };
}

startLinkifyPlusPlus(async () => {
  const getMessage = getMessageFactory();
  const pref = GM_webextPref({
    default: prefDefault(),
    body: prefBody(getMessage),
    getMessage,
    getNewScope: () => location.hostname
  });
  await pref.ready();
  await pref.setCurrentScope(location.hostname);
  return pref;
});
