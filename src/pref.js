/* global pref */
const {createPref, createWebextStorage} = require("webext-pref");
const prefDefault = require("./lib/pref-default");

window.pref = createPref(prefDefault());
window.prefReady = pref.connect(createWebextStorage());
