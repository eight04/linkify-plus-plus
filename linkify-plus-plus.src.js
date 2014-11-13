// ==UserScript==
// @name        Linkify Plus Plus
// @version     2.5.0
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

var config = {
	excludingTag: [
		'a', 'code', 'head', 'noscript', 'option', 'script', 'style',
		'title', 'textarea', "svg", "canvas", "button", "select", "template",
		"meter", "progress", "math", "h1", "h2", "h3", "h4", "h5", "h6"
	],
	excludingClass: [
		"highlight", "editbox", "code", "brush:", "bdsug"
	],
	includingClass: [
		"bbcode_code"
	],
	useImg: true
};

configInit(config);

// 1=protocol, 2=user, 3=domain, 4=port, 5=path
var urlRE = /\b([-a-z*]+:\/\/)?(?:([\w:\.]+)@)?([a-z0-9-.]+\.[a-z0-9-]+)\b(:\d+)?([/?#][\w-.~!$&*+;=:@%/?#()]*)?/gi;

var re = {
	excludingTag: new RegExp(config.excludingTag.join("|"), "i"),
	excludingClass: new RegExp(config.excludingClass.join("|")),
	includingClass: new RegExp(config.includingClass.join("|"))
};

//console.log(re);

var tlds = {
	// @@TLDS
};

function valid(node) {
	return !re.excludingTag.test(node.nodeName) &&
		!re.excludingClass.test(node.className) ||
		re.includingClass.test(node.className) &&
		node.className.indexOf("linkifyplus") < 0;
}

var traverser = {
	queue: [],
	running: false,
	start: function(){
		if (traverser.running) {
			return;
		}
		traverser.running = true;
		traverser.container();
	},
	container: function(){
		var root = traverser.queue.shift();

		if (!root) {
			console.log("Traverser queue is empty! Traverser stop.");
			traverser.running = false;
			return;
		}

		if (!root.childNodes || !root.childNodes.length || !valid(root)) {
			console.log("Invalid root: ", root);
			setTimeout(traverser.container, 0);
			return;
		}

		console.log("Traverse start! Root node is %o", root);

		// remove wbr element
		removeWBR(root);

		var state = {
			currentNode: root.childNodes[0],
			lastMove: 1,	// 1=down, 2=left, 3=up
			loopCount: 0,
			timeStart: Date.now()
		};

		function traverse(){
			var i = 0;
			while (state.currentNode != root) {

//				console.log(state.currentNode, valid(state.currentNode), state.lastMove);

				if (state.currentNode.nodeType == 3) {
					linkifyTextNode(state.currentNode);
				}

				// State transfer
				if (state.currentNode.childNodes.length &&
					state.lastMove != 3 && valid(state.currentNode)) {

					state.currentNode = state.currentNode.childNodes[0];
					state.lastMove = 1;

				} else if (state.currentNode.nextSibling) {

					state.currentNode = state.currentNode.nextSibling;
					state.lastMove = 2;

				} else if (state.currentNode.parentNode) {

					state.currentNode = state.currentNode.parentNode;
					state.lastMove = 3;

				} else {
					break;
				}

				// Loop counter
				i++;
				state.loopCount++;
				if (i > 50) {
					setTimeout(traverse, 0);
					return;
				}
			}
			console.log(
				"Traverse complete! Took %dms. Traversed %d nodes. Last node is %o",
				Date.now() - state.timeStart,
				state.loopCount + 1,
				state.currentNode
			);
			traverser.container();
		}
		setTimeout(traverse, 0);
	}
};

function configInit(config){
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
		"@@CSS"
	);
	config.useImg = GM_config.get("useImg", true);
	config.includingClass = config.includingClass.concat(
		getArray(GM_config.get("classWhiteList", ""))
	);
	config.excludingClass = config.excludingClass.concat(
		getArray(GM_config.get("classBlackList", ""))
	);
}

function getArray(s) {
	s = s.trim();
	if (!s) {
		return [];
	}
	return s.split(/\s+/);
}

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
		if (/(\.jpg|\.png|\.gif)$/i.test(path) && config.useImg) {
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

//var linkifyDelay = function(){
//	var time = 3000, timer = null;
//
//	var delay = {
//		waiting: false,
//		delay: function(){
//			clearTimeout(timer);
//			timer = setTimeout(delay.linkify, time);
//			delay.waiting = true;
//		},
//		linkify: function(){
//			linkifyContainer(document.body);
//			delay.waiting = false;
//		}
//	};
//
//	return delay;
//}();

var observer = {
	handler: function(mutations){

		console.log("Cought mutations! Total %d mutations.", mutations.length);

		var i;

		for (i = 0; i < mutations.length; i++) {
			if (!mutations[i].addedNodes.length) {
				continue;
			}

			traverser.queue.push(mutations[i].target);
		}

		traverser.start();
	},
	config: {
		childList: true,
		subtree: true
	}
};

GM_addStyle("@CSS");

GM_registerMenuCommand("Linkify Plus Plus - Configure", function(){
	GM_config.open();
});

traverser.queue.push(document.body);
traverser.start();
new MutationObserver(observer.handler, false).observe(document.body, observer.config);
