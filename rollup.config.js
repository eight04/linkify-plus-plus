import dataurl from "dataurl";
import fs from "fs";
import usm from "userscript-meta-cli";
import glob from "tiny-glob";

import copy from 'rollup-plugin-copy-glob';
import cjs from "rollup-plugin-cjs-es";
import iife from "rollup-plugin-iife";
import inline from "rollup-plugin-inline-js";
import json from "rollup-plugin-json";
import output from "rollup-plugin-write-output";
import resolve from "@rollup/plugin-node-resolve";
import inject from "@rollup/plugin-inject";

function commonPlugins(cache) {
  return [
    resolve(),
    json(),
    cjs({nested: true, cache})
  ];
}

export default async () => [
  {
    input: await glob("src/extension/*.js"),
    output: {
      format: "es",
      dir: "dist-extension"
    },
    plugins: [
      copy([
        {
          files: "src/static/**/*",
          dest: "dist-extension"
        }
      ]),
      ...commonPlugins(),
      inject({
        browser: "webextension-polyfill"
      }),
      iife(),
      output([
        {
          test: /options\.js$/,
          target: "dist-extension/options.html",
          handle: (content, {htmlScripts}) => content.replace("</body>", `${htmlScripts}</body>`)
        },
        {
          test: /background\.js$/,
          target: "dist-extension/manifest.json",
          handle: (content, {scripts}) => {
            content.background.scripts = scripts;
            return content;
          }
        },
        {
          test: /content\.js$/,
          target: "dist-extension/manifest.json",
          handle: (content, {scripts}) => {
            content.content_scripts[0].js = scripts;
            return content;
          }
        }
      ])
    ]
  },
  {
    input: {
      "linkify-plus-plus.user": "src/userscript/index.js"
    },
    output: {
      format: "es",
      banner: metaDataBlock(),
      dir: "dist"
    },
    plugins: [
      ...commonPlugins(false),
      inline()
    ]
  }
];

function metaDataBlock() {
  const meta = usm.getMeta();
  meta.icon = dataurl.format({
    data: fs.readFileSync("extension/icon.svg"),
    mimetype: "image/svg+xml"
  });
  return usm.stringify(meta);
}
