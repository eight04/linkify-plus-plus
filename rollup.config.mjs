import dataurl from "dataurl";
import fs from "fs";
import usm from "userscript-meta-cli";
import glob from "tiny-glob";

import copy from 'rollup-plugin-copy-glob';
import cjs from "rollup-plugin-cjs-es";
import iife from "rollup-plugin-iife";
import json from "@rollup/plugin-json";
import output from "rollup-plugin-write-output";
import terser from "@rollup/plugin-terser";
import resolve from "@rollup/plugin-node-resolve";
import inject from "@rollup/plugin-inject";

const DEV = process.env.ROLLUP_WATCH;

function commonPlugins(cache) {
  return [
    resolve({
      dedupe: ["event-lite"]
    }),
    json(),
    cjs({nested: true, cache})
  ];
}

export default async () => [
  {
    input: await glob("src/extension/*.js"),
    output: {
      format: "es",
      dir: "dist-extension/js"
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
        exclude: ["**/*/browser-polyfill.js"],
        browser: "webextension-polyfill"
      }),
      iife(),
      output([
        {
          test: /(options|dialog)\.js$/,
          target: "dist-extension/$1.html",
          handle: (content, {htmlScripts}) => content.replace(/.*<\/body>/, `${htmlScripts}</body>`)
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
            content.content_scripts[0].exclude_globs = usm.getMeta().exclude;
            return content;
          }
        }
      ]),
      !DEV && terser({module: false})
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
      cleanMessages(),
      ...commonPlugins(false),
    ]
  }
];

function metaDataBlock() {
  const meta = usm.getMeta();
  meta.icon = dataurl.format({
    data: fs.readFileSync("src/static/icon.svg"),
    mimetype: "image/svg+xml"
  });
  return usm.stringify(meta);
}

function cleanMessages() {
  return {
    name: "clean-messages",
    transform: (code, id) => {
      if (!/messages.json/.test(id)) return;

      const message = JSON.parse(code);
      const newMessage = {};
      for (const [key, value] of Object.entries(message)) {
        if (value.placeholders) {
          value.message = value.message.replace(/\$\w+\$/g, m => {
            const name = m.slice(1, -1).toLowerCase();
            return value.placeholders[name].content;
          });
        }
        if (/^options/.test(key)) {
          newMessage[key] = value.message;
        } else if (/^pref/.test(key)) {
          newMessage[key[4].toLowerCase() + key.slice(5)] = value.message;
        }
      }
      return JSON.stringify(newMessage, null, 2);  
    }
  }
}
