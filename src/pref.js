/* global pref */
const {createPref} = require("webext-pref/lib/pref");
const {createWebextStorage} = require("webext-pref/lib/storage");
const prefDefault = require("./lib/pref-default");

window.pref = createPref(prefDefault());
window.prefReady = pref.connect(createWebextStorage());
