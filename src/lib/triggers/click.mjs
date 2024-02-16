import {linkify} from "linkify-plus-plus-core";
import {processedNodes} from "./cache.mjs";
import {validRoot} from "./util.mjs";

let options;

const EVENTS = [
  ["click", handle, {passive: true}],
]

function handle(e) {
  const el = e.target;
  if (validRoot(el, options.validator)) {
    processedNodes.add(el);
    linkify({...options, root: el, recursive: false});
  }
} 

function enable(_options) {
  options = _options;
  for (const [event, handler, options] of EVENTS) {
    document.addEventListener(event, handler, options);
  }
}

function disable() {
  for (const [event, handler, options] of EVENTS) {
    document.removeEventListener(event, handler, options);
  }
}

export default {
  key: "triggerByClick",
  enable,
  disable
}

