import {UrlMatcher, INVALID_TAGS} from "linkify-plus-plus-core";

import triggers from "./triggers/index.mjs";
import {processedNodes} from "./triggers/cache.mjs";

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

export async function startLinkifyPlusPlus(getPref) {
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

