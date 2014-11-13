// ==UserScript==
// @name        Linkify Plus Plus
// @version     2.4.3
// @namespace   eight04.blogspot.com
// @description Based on Linkify Plus. Turn plain text URLs into links.
// @include     http*
// @exclude     http://www.google.tld/search*
// @exclude     https://www.google.tld/search*
// @exclude     http://music.google.com/*
// @exclude     https://music.google.com/*
// @exclude     http://mail.google.com/*
// @exclude     https://mail.google.com/*
// @exclude     http://docs.google.com/*
// @exclude     https://docs.google.com/*
// @exclude     http://mxr.mozilla.org/*
// @require 	https://greasyfork.org/scripts/1884-gm-config/code/GM_config.js?version=4836
// @grant       GM_addStyle
// @grant       GM_registerMenuCommand
// @grant       GM_getValue
// @grant       GM_setValue
// ==/UserScript==

"use strict";

var notInTags = [
	'a', 'code', 'head', 'noscript', 'option', 'script', 'style',
	'title', 'textarea', "svg", "canvas", "button", "select", "template",
	"meter", "progress", "math", "h1", "h2", "h3", "h4", "h5", "h6"
];

var notInClasses = ["highlight", "editbox", "code", "brush:", "bdsug"];

GM_config.init(
	"Linkify Plus Plus",
	{
		useImg: {
			label: "Parse image url to <img>:",
			type: "checkbox",
			default: true
		},
		classBlackList: {
			label: "Add classes to black-list (Separate by space):",
			type: "textarea",
			default: ""
		},
		classWhiteList: {
			label: "Add classes to white-list (Separate by space):",
			type: "textarea",
			default: ""
		}
	},
	"@@__CSS__"
);

var useImg = GM_config.get("useImg", true),
	xPathRule = "",
	classWhiteList = GM_config.get("classWhiteList", "");

var classBlackList = GM_config.get("classBlackList", "").trim().split(/\s+/);
classWhiteList = classWhiteList.trim().split(/\s+/);

if (classBlackList[0]) {
	notInClasses = notInClasses.concat(classBlackList);
}

notInTags.push("*[contains(@class, '" + notInClasses.join("') or contains(@class, '") + "')]");

// Exclude tags and classes
xPathRule += "not(ancestor::" + notInTags.join(') and not(ancestor::') + ")";

// Exclude contenteditable
xPathRule += " and not(ancestor::*[@contenteditable='true'])";

// Include white list
if (classWhiteList[0]) {
	xPathRule += " or ancestor::*[contains(@class, '" + classWhiteList.join("') or contains(@class, '") + "')]";
}

// Exclude linkifyplus to prevent recursive linkify
xPathRule += " and not(ancestor::*[contains(@class, 'linkifyplus')])";

var textNodeXpath =	".//text()[" + xPathRule + "]";

//console.log(textNodeXpath);

// 1=protocol, 2=user, 3=domain, 4=port, 5=path
var urlRE = /\b([-a-z*]+:\/\/)?(?:([\w:\.]+)@)?([a-z0-9-.]+\.[a-z0-9-]+)\b(:\d+)?([/?#][\w-.~!$&*+;=:@%/?#()]*)?/gi;

// generated from http://data.iana.org/TLD/tlds-alpha-by-domain.txt
var tlds = {
	// @@TLDS
};

function remove(node) {
	node.parentNode.removeChild(node);
}

function removeWBR(node) {
	var l = node.querySelectorAll("wbr"), i, p, t, n;

	for (i = 0; i < l.length; i++) {
		t = l[i];
		p = t.previousSibling;
		n = t.nextSibling;

		if (p && n && p.nodeType == 3 && n.nodeType == 3) {
			p.nodeValue += n.nodeValue;
			remove(n);
		}

		remove(t);
	}
}

function isIP(s) {
	var m, i;
	if (!(m = s.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/))) {
		return false;
	}
	for (i = 1; i < m.length; i++) {
		if (m[i] * 1 > 255 || (m[i].length > 1 && m[i][0] == "0")) {
			return false;
		}
	}
	return true;
}

function inAngular(text, start, end) {
	if (!unsafeWindow.angular) {
		return false;
	}

	var l, r;
	l = text.lastIndexOf("{{", start);
	r = text.lastIndexOf("}}", start);
	if (l < r || l < 0) {
		return false;
	}

	l = text.indexOf("{{", end);
	r = text.indexOf("}}", end);
	if (l > 0 && l < r || r < 0) {
		return false;
	}

	return true;
}

function stripSingleParenthesis(str) {
	var i, pos, c = ")";
	for (i = 0; i < str.length; i++) {
		if (str[i] == "(") {
			if (c != ")") {
				return str.substring(0, pos);
			}
			pos = i;
			c = "(";
		}
		if (str[i] == ")") {
			if (c != "(") {
				return str.substring(0, i);
			}
			pos = i;
			c = ")";
		}
	}
	if (c != ")") {
		return str.substring(0, pos);
	}
	return str;
}

function imgFailed(){
	this.parentNode.textContent = this.alt;
	this.error = null;
}

function linkifyTextNode(node) {
	if (!node.parentNode){
		return;
	}
	var l, m, mm;
	var txt = node.textContent;
	var span = null;
	var p = 0;
	var protocol, user, domain, port, path;
	var a, img, url;

	while (m = urlRE.exec(txt)) {
		protocol = m[1] || "";
		user = m[2] || "";
		domain = m[3] || "";
		port = m[4] || "";
		path = m[5] || "";


		// valid domain
		if (domain.indexOf("..") > -1) {
			continue;
		}
		if (!isIP(domain) && (mm = domain.match(/\.([a-z0-9-]+)$/i)) && !tlds[mm[1].toUpperCase()]) {
			continue;
		}

		// angular directive
		if (!protocol && !user && !port && !path && inAngular(txt, m.index, urlRE.lastIndex)) {
			continue;
		}

		if (!span) {
			// Create a span to hold the new text with links in it.
			span = document.createElement('span');
			span.className = 'linkifyplus';
		}

		l = m[0];

		// get the link without trailing dots
		l = l.replace(/\.*$/, '');
		path = path.replace(/\.*$/, '');

		// Get the link without single parenthesis
		l = stripSingleParenthesis(l);
		path = stripSingleParenthesis(path);

		if (!protocol && user && (mm = user.match(/^mailto:(.+)/))) {
			protocol = "mailto:";
			user = mm[1];
		}

		if (protocol && protocol.match(/^(hxxp|h\*\*p|ttp)/)) {
			protocol = "http://";
		}

		//put in text up to the link
		span.appendChild(document.createTextNode(txt.substring(p, m.index)));
		//create a link and put it in the span
		a = document.createElement('a');
		a.className = 'linkifyplus';
		if (/(\.jpg|\.png|\.gif)$/i.test(path) && useImg) {
			img = document.createElement("img");
			img.alt = l;
			img.onerror = imgFailed;
			a.appendChild(img);
		} else {
			a.appendChild(document.createTextNode(l));
		}

		if (!protocol) {
			if (mm = domain.match(/^(ftp|irc)/)) {
				protocol = mm[0] + "://";
			} else if (domain.match(/^(www|web)/)) {
				protocol = "http://";
			} else if (user && user.indexOf(":") < 0 && !path) {
				protocol = "mailto:";
			} else {
				protocol = "http://";
			}
		}
		url = protocol + (user ? user + "@" : "") + domain + port + path;
		a.setAttribute('href', url);
		if (img) {
			img.src = url;
			img = null;
		}
		span.appendChild(a);
		//track insertion point
		p = m.index + l.length;
	}
	if (span) {
		//take the text after the last link
		span.appendChild(document.createTextNode(txt.substring(p, txt.length)));
		//replace the original text with the new span
		node.parentNode.replaceChild(span, node);
	}
}

function linkifyContainer(container) {
	if (container.nodeType && container.nodeType == 3) {
		container = container.parentNode;
	}

	// Prevent infinite recursion, in case X(HT)ML documents with namespaces
	// break the XPath's attempt to do so.	(Don't evaluate spans we put our
	// classname into.)
	if (container.className && container.className.match(/\blinkifyplus\b/)) {
		return;
	}

	// remove wbr element
	removeWBR(container);

	var xpathResult = document.evaluate(
		textNodeXpath, container, null,
		XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null
	);

	var i = 0;
	function continuation() {
		var node = null, counter = 0;
		while (node = xpathResult.snapshotItem(i++)) {
			linkifyTextNode(node);
			// setTimeout(linkifyTextNode, 0, node);

			if (++counter > 50) {
				return setTimeout(continuation, 0);
			}
		}
	}
	setTimeout(continuation, 0);
}

var linkifyDelay = function(){
	var time = 3000, timer = null;

	var delay = {
		waiting: false,
		delay: function(){
			clearTimeout(timer);
			timer = setTimeout(delay.linkify, time);
			delay.waiting = true;
		},
		linkify: function(){
			linkifyContainer(document.body);
			delay.waiting = false;
		}
	};

	return delay;
}();

var observerHandler = function(mutations){
	var i;

	if (mutations.length > 10 || linkifyDelay.waiting) {
		linkifyDelay.delay();
		return;
	}

	for (i = 0; i < mutations.length; i++) {
		if (mutations[i].type != "childList") {
			continue;
		}

		if (!mutations[i].addedNodes.length) {
			continue;
		}

		linkifyContainer(mutations[i].target);
	}
};

var observerConfig = {
	childList: true,
	subtree: true
};


GM_addStyle(
	".linkifyplus img {\
		max-width: 100%;\
	}\
	#GM_config {\
		border-radius: 1em;\
		box-shadow: 0 0 1em black;\
		border: 1px solid grey!important;\
	}"
);

GM_registerMenuCommand("Linkify Plus Plus - Configure", function(){
	GM_config.open();
});


linkifyContainer(document.body);

new MutationObserver(observerHandler, false)
	.observe(document.body, observerConfig);
