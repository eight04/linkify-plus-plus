import {linkify} from "linkify-plus-plus-core";
import {validRoot, prepareDocument} from "./util.mjs";
import {processedNodes} from "./cache.mjs";

export default {
  key: "triggerByPageLoad",
  enable: async options => {
    await prepareDocument();
    if (validRoot(document.body, options.validator)) {
      processedNodes.add(document.body);
      await linkify({...options, root: document.body, recursive: true});
    }
    if (options.includeElement) {
      for (const el of document.querySelectorAll(options.includeElement)) {
        processedNodes.add(el);
        await linkify({...options, root: el, recursive: true});
      }
    }
  },
  disable: () => {}
};
