import {linkify} from "linkify-plus-plus-core";
import {validRoot, prepareDocument} from "./util.mjs";
import {processedNodes} from "./cache.mjs";

export default {
  key: "triggerByPageLoad",
  enable: async options => {
    await prepareDocument();
    if (!validRoot(document.body, options.validator)) {
      return;
    }
    processedNodes.add(document.body);
    await linkify({...options, root: document.body, recursive: true});
  },
  disable: () => {}
};
