import glob from "glob";
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
    input: glob.sync("src/*.js"),
    output: {
      dir: "extension/js",
      format: "es"
    }
  }),
  base({
    input: "src/userscript.js",
    output: {
      file: "dist/linkify-plus-plus.user.js",
    }
  })
];
