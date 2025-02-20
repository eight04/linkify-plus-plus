import {linkifyRoot, prepareDocument} from "./util.mjs";
// import {processedNodes} from "./cache.mjs";

export default {
  key: "triggerByPageLoad",
  enable: async options => {
    await prepareDocument();
    await linkifyRoot(document.body, options);
  },
  disable: () => {}
};
