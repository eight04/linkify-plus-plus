import glob from "glob";
import userscriptMeta from "userscript-meta-cli";
import resolve from "rollup-plugin-node-resolve";
import cjs from "rollup-plugin-cjs-es";

function base({
  output,
  ...args
}) {
  return {
    output: {
      format: "es",
      ...output
    },
    plugins: [
      resolve(),
      cjs()
    ],
    experimentalCodeSplitting: true,
    ...args
  };
}

export default [
  base({
    input: glob.sync("src/*.js", {ignore: "src/userscript.js"}),
    output: {
      dir: "extension/js",
      format: "es"
    }
  }),
  base({
    intro: userscriptMeta.getMeta(),
    input: {
      "linkify-plus-plus.user": "src/userscript.js"
    },
    output: {
      dir: "dist"
    }
  })
];
