const {createPref, createWebextStorage} = require("webext-pref");
const prefDefault = require("./pref-default");

const pref = createPref(prefDefault());
pref.ready = pref.connect(createWebextStorage());

module.exports = pref;
