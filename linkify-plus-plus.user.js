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
// @require https://greasyfork.org/scripts/7212-gm-config-eight-s-version/code/GM_config%20(eight's%20version).js?version=156587
// @require https://greasyfork.org/scripts/27630-linkify-plus-plus-core/code/linkify-plus-plus-core.js?version=213494
// @grant GM_addStyle
// @grant GM_registerMenuCommand
// @grant GM_getValue
// @grant GM_setValue
// @grant unsafeWindow
// @compatible firefox Tampermonkey latest
// @compatible chrome Tampermonkey latest
// ==/UserScript==

/* globals GM_config */

(function(){

// Limit contentType to "text/plain" or "text/html"
if (document.contentType != undefined && document.contentType != "text/plain" && document.contentType != "text/html") {
	return;
}

var {linkify, UrlMatcher, INVALID_TAGS} = window.linkifyPlusPlusCore;

const BUFFER_SIZE = 100;

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
		if (!validator(node) || INVALID_TAGS[node.nodeName]) {
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

function createValidator({selector, skipSelector}) {
	return function(node) {
		if (node.isContentEditable) {
			return false;
		}
		if (selector && node.matches && node.matches(selector)) {
			return true;
		}
		if (skipSelector && node.matches && node.matches(skipSelector)) {
			return false;
		}
		return true;
	};
}

function selectorTest(selector) {
	try {
		document.documentElement.matches(selector);
	} catch (err) {
		alert(`Invalid selector: ${selector}`);
		return false;
	}
	return true;
}

function createList(text) {
	text = text.trim();
	if (!text) {
		return null;
	}
	return text.split("\n");
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

function createLinkifyProcess(options) {
  const buffer = createBuffer(BUFFER_SIZE);
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
    
    linkify(root, options)
      .then(() => {
        var p = Promise.resolve();
        if (options.selector) {
          for (var node of root.querySelectorAll(options.selector)) {
            p = p.then(linkify.bind(null, node, options));
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

function createOptions() {
  const options = {};
  setup();
  return options;
  
  function setup() {
    GM_config.setup({
      ip: {
        label: "Match 4 digits IP",
        type: "checkbox",
        default: true
      },
      image: {
        label: "Embed images",
        type: "checkbox",
        default: true
      },
      imageSkipSelector: {
        label: "Don't embed images under following elements",
        type: "textarea",
        default: ".hljs, .highlight, .brush\\:"
      },
      unicode: {
        label: "Allow non-ascii character",
        type: "checkbox",
        default: false
      },
      newTab: {
        label: "Open link in new tab",
        type: "checkbox",
        default: false
      },
      standalone: {
        label: "URL must be surrounded by whitespace",
        type: "checkbox",
        default: false
      },
      boundaryLeft: {
        label: "Boundary characters between whitespace and URL (left)",
        type: "text",
        default: "{[(\"'"
      },
      boundaryRight: {
        label: "Boundary characters between whitespace and URL (right)",
        type: "text",
        default: "'\")]},.;?!"
      },
      skipSelector: {
        label: "Do not linkify these elements. (CSS selector)",
        type: "textarea",
        default: ".highlight, .editbox, .brush\\:, .bdsug, .spreadsheetinfo"
      },
      selector: {
        label: "Always linkify these elements, override above. (CSS selector)",
        type: "textarea",
        default: ""
      },
      timeout: {
        label: "Max execution time (ms).",
        type: "number",
        default: 10000
      },
      maxRunTime: {
        label: "Max script run time (ms). If the script is freezing your browser, try to decrease this value.",
        type: "number",
        default: 100
      },
      customRules: {
        label: "Custom rules. One pattern per line. (RegExp)",
        type: "textarea",
        default: ""
      }
    }, function() {
      Object.assign(options, GM_config.get());
      if (options.selector && !selectorTest(options.selector)) {
        options.selector = null;
      }
      if (options.skipSelector && !selectorTest(options.skipSelector)) {
        options.skipSelector = null;
      }
      if (options.customRules) {
        options.customRules = createList(options.customRules);
      }
      options.validator = createValidator(options);
      options.fuzzyIp = options.ip;
      options.ignoreMustache = unsafeWindow.angular || unsafeWindow.Vue;
      options.embedImage = options.image;
      options.matcher = new UrlMatcher(options);
      options.onlink = options.imageSkipSelector ? onlink : null;
    });
  }
  
  function onlink({link, range, content}) {
    if (link.childNodes[0].nodeName != "IMG") return;
    
    var parent = range.startContainer;
    // it might be a text node
    if (!parent.closest) {
      parent = parent.parentNode;
    }
    if (!parent.closest(options.imageSkipSelector)) return;
    // remove image
    link.innerHTML = "";
    link.appendChild(content);
  }
}

// Program init
GM_addStyle(".linkifyplus img { max-width: 90%; }");
const linkifyProcess = createLinkifyProcess(createOptions());
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

function init() {
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  linkifyProcess.process(document.body);
}

function prepare() {
  // wait till everything is ready
  return Promise.all([prepareApp(), prepareBody()]);
  
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
    if (document.body) {
      return;
    }
    return new Promise(resolve => {
      // https://github.com/Tampermonkey/tampermonkey/issues/485
      document.addEventListener("DOMContentLoaded", resolve, {once: true});
    });
  }
}

prepare().then(init);

})();
