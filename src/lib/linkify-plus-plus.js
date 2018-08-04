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
    options.matcher = new UrlMatcher(options);
    options.onlink = options.embedImageExcludeElement ? onlink : null;
  }
  
  function setup() {
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
      options.embedImage = options.image;
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

function startLinkifyPlusPlus(pref) {
  // Limit contentType to "text/plain" or "text/html"
  if (document.contentType != undefined && document.contentType != "text/plain" && document.contentType != "text/html") {
    return;
  }
  
  const {linkify, UrlMatcher, INVALID_TAGS} = linkifyPlusPlusCore;
  const BUFFER_SIZE = 100;
  const linkifyProcess = createLinkifyProcess(createOptions(pref));  
}

module.exports = {startLinkifyPlusPlus};
