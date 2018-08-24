// ==UserScript==
// @name Linkify Plus Plus
// @version 8.2.2
// @description Based on Linkify Plus. Turn plain text URLs into links.
// @license BSD-3-Clause
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
// @exclude http://mxr.mozilla.org/*
// @exclude http://w3c*.github.io/*
// @require https://greasyfork.org/scripts/27630-linkify-plus-plus-core/code/linkify-plus-plus-core.js?version=213494
// @require https://greasyfork.org/scripts/371339-gm-webextpref/code/GM_webextPref.js?version=622261
// @grant GM.getValue
// @grant GM.setValue
// @grant GM_addStyle
// @grant GM_registerMenuCommand
// @grant GM_getValue
// @grant GM_setValue
// @grant GM_addValueChangeListener
// @grant unsafeWindow
// @compatible firefox Tampermonkey latest
// @compatible chrome Tampermonkey latest
// @icon data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDE2IDE2Ij4gPHBhdGggZmlsbD0iY29udGV4dC1maWxsIiBmaWxsLW9wYWNpdHk9ImNvbnRleHQtZmlsbC1vcGFjaXR5IiBkPSJNMy41IDFhLjUuNSAwIDEgMCAwIDFINHY5aC0uNWEuNS41IDAgMCAwIDAgMWg3Ljg1NWEuNS41IDAgMCAwIC40NzUtLjE4NC41LjUgMCAwIDAgLjEwNi0uMzk4VjEwLjVhLjUuNSAwIDEgMC0xIDB2LjVINlYyaC41YS41LjUgMCAxIDAgMC0xaC0zeiIvPiA8cGF0aCBmaWxsPSIjNDVhMWZmIiBmaWxsLW9wYWNpdHk9ImNvbnRleHQtZmlsbC1vcGFjaXR5IiBkPSJNMi41IDE0YTEgMSAwIDEgMCAwIDJoMTFhMSAxIDAgMSAwIDAtMmgtMTF6Ii8+IDwvc3ZnPg==
// ==/UserScript==



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

var prefBody = getMessage => {
  return [
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
      key: "embedImage",
      type: "checkbox",
      label: getMessage("optionsEmbedImageLabel"),
      children: [
        {
          key: "embedImageExcludeElement",
          type: "textarea",
          label: getMessage("optionsEmbedImageExcludeElementLabel"),
          parse: validateSelector
        }
      ]
    },
    {
      key: "unicode",
      type: "checkbox",
      label: getMessage("optionsUnicodeLabel")
    },
    {
      key: "newTab",
      type: "checkbox",
      label: getMessage("optionsNewTabLabel")
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
      key: "excludeElement",
      type: "textarea",
      label: getMessage("optionsExcludeElementLabel"),
      parse: validateSelector
    },
    {
      key: "includeElement",
      type: "textarea",
      label: getMessage("optionsIncludeElementLabel"),
      parse: validateSelector
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
    {
      key: "customRules",
      type: "textarea",
      label: getMessage("optionsCustomRulesLabel"),
      parse: value => {
        value = value.trim();
        if (!value) {
          return [];
        }
        return value.split(/\s*\n\s*/g);
      },
      format: value => value.join("\n")
    }
  ];
  
  function validateSelector(value) {
    document.documentElement.matches(value);
    return value;
  }
};

// Valid root node before linkifing
function validRoot(node, validator) {
  // Cache valid state in node.VALID
  if (node.VALID !== undefined) {
    return node.VALID;
  }

  // Loop through ancestor
  var cache = [], isValid;
  while (node != document.documentElement) {
    cache.push(node);

    // It is invalid if it has invalid ancestor
    if (!validator(node) || linkifyPlusPlusCore.INVALID_TAGS[node.nodeName]) {
      isValid = false;
      break;
    }

    // The node was removed from DOM tree
    if (!node.parentNode) {
      return false;
    }

    node = node.parentNode;

    if (node.VALID !== undefined) {
      isValid = node.VALID;
      break;
    }
  }

  // All ancestors are fine
  if (isValid === undefined) {
    isValid = true;
  }

  // Cache the result
  var i;
  for (i = 0; i < cache.length; i++) {
    cache[i].VALID = isValid;
  }

  return isValid;
}

function createValidator({includeElement, excludeElement}) {
  return function(node) {
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
}

function createBuffer(size) {
  const set = new Set;
  const buff = Array(size);
  const eventBus = document.createElement("span");
  let start = 0;
  let end = 0;
  return {push, eventBus, shift};
  
  function push(item) {
    if (set.has(item)) {
      return;
    }
    if (set.size && start === end) {
      // overflow
      eventBus.dispatchEvent(new CustomEvent("overflow"));
      set.clear();
      return;
    }
    set.add(item);
    buff[end] = item;
    end = (end + 1) % size;
    eventBus.dispatchEvent(new CustomEvent("add"));
  }
  
  function shift() {
    if (!set.size) {
      return;
    }
    const item = buff[start];
    set.delete(item);
    buff[start] = null;
    start = (start + 1) % size;
    return item;
  }
}

function createLinkifyProcess({options, bufferSize}) {
  const buffer = createBuffer(bufferSize);
  let overflowed = false;
  let started = false;
  buffer.eventBus.addEventListener("add", start);
  buffer.eventBus.addEventListener("overflow", () => overflowed = true);
  return {process};
  
  function process(root) {
    if (overflowed) {
      return false
    }
    if (validRoot(root, options.validator)) {
      buffer.push(root);
    }
    return true;
  }
  
  function start() {
    if (started) {
      return;
    }
    started = true;
    deque();
  }
  
  function deque() {
    let root;
    if (overflowed) {
      root = document.body;
      overflowed = false;
    } else {
      root = buffer.shift();
    }
    if (!root) {
      started = false;
      return;
    }
    
    linkifyPlusPlusCore.linkify(root, options)
      .then(() => {
        var p = Promise.resolve();
        if (options.includeElement) {
          for (var node of root.querySelectorAll(options.includeElement)) {
            p = p.then(linkifyPlusPlusCore.linkify.bind(null, node, options));
          }
        }
        return p;
      })
      .catch(err => {
        console.error(err);
      })
      .then(deque);
  }
}

function createOptions(pref) {
  const options = {};
  pref.on("change", update);
  update(pref.getAll());
  return options;
  
  function update(changes) {
    Object.assign(options, changes);
    if (changes.includeElement != null || changes.excludeElement != null) {
      options.validator = createValidator(options);
    }
    options.matcher = new linkifyPlusPlusCore.UrlMatcher(options);
    options.onlink = options.embedImageExcludeElement ? onlink : null;
  }
  
  function onlink({link, range, content}) {
    if (link.childNodes[0].nodeName != "IMG" || !options.embedImageExcludeElement) {
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
  // Limit contentType to "text/plain" or "text/html"
  if (
    document.contentType !== undefined &&
    document.contentType != "text/plain" &&
    document.contentType != "text/html"
  ) {
    return;
  }
  
  const pref = await getPref();
  const linkifyProcess = createLinkifyProcess({
    options: createOptions(pref),
    bufferSize: 100
  });  
  const observer = new MutationObserver(function(mutations){
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
      if (record.addedNodes.length) {
        if (!linkifyProcess.process(record.target)) {
          // it's full
          break;
        }
      }
    }
  });
  await prepareDocument();
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  linkifyProcess.process(document.body);    
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

/* global $inline GM_webextPref */

function getMessageFactory() {
  const translate = {
    "optionsFuzzyIpLabel": "Match IP with only 4 digits.",
    "optionsIgnoreMustacheLabel": "Ignore URLs inside mustaches e.g. {{ ... }}.",
    "optionsEmbedImageLabel": "Embed images.",
    "optionsEmbedImageExcludeElementLabel": "Exclude following elements. (CSS selector)",
    "optionsUnicodeLabel": "Match unicode characters.",
    "optionsNewTabLabel": "Open links in new tabs.",
    "optionsStandaloneLabel": "The link must be surrounded by whitespaces.",
    "optionsBoundaryLeftLabel": "Allowed characters between the whitespace and the link. (left side)",
    "optionsBoundaryRightLabel": "Allowed characters between the whitespace and the link. (right side)",
    "optionsExcludeElementLabel": "Do not linkify following elements. (CSS selector)",
    "optionsIncludeElementLabel": "Always linkify following elements. Override above. (CSS selector)",
    "optionsTimeoutLabel": "Max executation time. (ms)",
    "optionsTimeoutHelp": "The script will terminate if it takes too long to convert the entire page.",
    "optionsMaxRunTimeLabel": "Max script run time. (ms)",
    "optionsMaxRunTimeHelp": "Split the process into small chunks to avoid freezing the browser.",
    "optionsCustomRulesLabel": "Custom rules. (RegExp per line)",
    "addScopePrompt": "Add new domain",
    "deleteScopeConfirm": "Delete domain $1?",
    "learnMoreButton": "Learn more",
    "importButton": "Import",
    "importPrompt": "Paste settings",
    "exportButton": "Export",
    "exportPrompt": "Copy settings"
  };
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
