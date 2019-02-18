import dataurl from "dataurl";
import fs from "fs";
import usm from "userscript-meta-cli";

import cjs from "rollup-plugin-cjs-es";
import iife from "rollup-plugin-iife";
import inline from "rollup-plugin-inline-js";
import json from "rollup-plugin-json";
import resolve from "rollup-plugin-node-resolve";

function base({
  output,
  plugins = [],
  cache,
  ...args
}) {
  return {
    output: {
      format: "es",
      ...output
    },
    plugins: [
      ...plugins,
      resolve(),
      json(),
      cjs({nested: true, cache})
    ],
    ...args
  };
}

export default [
  base({
    input: [
      "src/options.js",
      "src/content.js",
      "src/pref.js",
      "src/background.js"
    ],
    output: {
      dir: "extension/js",
      globals: {
        "event-lite": "EventLite"
      }
    },
    plugins: [
      iife()
    ],
    external: ["event-lite"],
    cache: ".extension.cjsescache"
  }),
  base({
    input: {
      "linkify-plus-plus.user": "src/userscript.js"
    },
    output: {
      banner: metaDataBlock(),
      dir: "dist"
    },
    plugins: [
      inline(),
      iife()
    ],
    external: ["linkify-plus-plus-core"],
    cache: ".userscript.cjsescache"
  })
];

function metaDataBlock() {
  const meta = usm.getMeta();
  meta.icon = dataurl.format({
    data: fs.readFileSync("extension/icon.svg"),
    mimetype: "image/svg+xml"
  });
  return usm.stringify(meta);
}
