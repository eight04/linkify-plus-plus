const {createPref} = require("webext-pref/lib/pref");
const {createWebextStorage} = require("webext-pref/lib/storage");
const prefDefault = require("./lib/pref-default");

const pref = createPref(prefDefault());
pref.ready = pref.connect(createWebextStorage());

module.exports = pref;
