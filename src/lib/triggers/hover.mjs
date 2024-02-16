import {linkify} from "linkify-plus-plus-core";
import {processedNodes} from "./cache.mjs";
import {validRoot} from "./util.mjs";

let options;

const EVENTS = [
  // catch the first mousemove event since mouseover doesn't fire at page refresh
  ["mousemove", handle, {passive: true, once: true}],
  ["mouseover", handle, {passive: true}]
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
  key: "triggerByHover",
  enable,
  disable
}
