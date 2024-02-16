import {linkify} from "linkify-plus-plus-core";
import {prepareDocument} from "./util.mjs";
import {processedNodes} from "./cache.mjs";

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
          if (processedNodes.has(node)) {
            continue;
          }
          processedNodes.add(node);
          processes++;
          linkify({...options, root: node, recursive: true})
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

export default {
  key: "triggerByNewNode",
  enable,
  disable
}
