// ==UserScript==
// @name        Linkify Plus Plus
// @version     3.4.1
// @namespace   eight04.blogspot.com
// @description Based on Linkify Plus. Turn plain text URLs into links.
// @include     http*
// @exclude     http://www.google.*/search*
// @exclude     https://www.google.*/search*
// @exclude     http://www.google.*/webhp*
// @exclude     https://www.google.*/webhp*
// @exclude     http://music.google.*/*
// @exclude     https://music.google.*/*
// @exclude     http://mail.google.*/*
// @exclude     https://mail.google.*/*
// @exclude     http://docs.google.*/*
// @exclude     https://docs.google.*/*
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
		"meter", "progress", "math", "h1", "h2", "h3", "h4", "h5", "h6", "time"
	],
	excludingClass: [
		"highlight", "editbox", "code", "brush:", "bdsug"
	],
	includingClass: [
		"bbcode_code"
	],
	useImg: true,
	generateLog: false
};

configInit();

// 1=protocol, 2=user, 3=domain, 4=port, 5=path
var urlRE = /\b([-a-z*]+:\/\/)?(?:([\w:.+-]+)@)?([a-z0-9-.]+\.[a-z0-9-]+)\b(:\d+)?([/?#][\w-.~!$&*+;=:@%/?#(),]*)?/gi;

var re = {
	excludingTag: new RegExp("^(" + config.excludingTag.join("|") + ")$", "i"),
	excludingClass: new RegExp("(^|\\s)(" + config.excludingClass.join("|") + ")($|\\s)"),
	includingClass: new RegExp("(^|\\s)(" + config.includingClass.join("|") + ")($|\\s)")
};

var tlds = {
	// @@TLDS
};

function valid(node) {
	return node.nodeType == 1 &&
		(!re.excludingTag.test(node.nodeName) &&
		!re.excludingClass.test(node.className) ||
		re.includingClass.test(node.className)) &&
		node.contentEditable != "true" &&
		node.className.indexOf("linkifyplus") < 0;
}

function validRoot(node) {
	var cache = node;
	while (node.parentNode != document.documentElement) {
		// Check if the node is valid
		if (!valid(node) || node.LINKIFY_INVALID) {
			cache.LINKIFY_INVALID = true;
			return false;
		}
		// The node was detached from DOM tree
		if (!node.parentNode) {
			return false;
		}
		node = node.parentNode;
	}
	return true;
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
			traverser.running = false;
			return;
		}

		if (!root.childNodes || !root.childNodes.length || !validRoot(root)) {
			root.inTraverserQueue = false;
			setTimeout(traverser.container, 0);
			return;
		}

		var state = {
			currentNode: root.childNodes[0],
			lastMove: 1,	// 1=down, 2=left, 3=up
			loopCount: 0,
			timeStart: Date.now()
		};

		function traverse(){
			var i = 0, child, sibling, parent;

			while (state.currentNode != root) {

				// Remove wbr and merge textnode
				if (state.currentNode.nodeType == 3) {
					while (state.currentNode.nextSibling &&
							(state.currentNode.nextSibling.nodeType == 3 ||
							state.currentNode.nextSibling.nodeName == "WBR")) {
						state.currentNode.nodeValue += state.currentNode.nextSibling.nodeValue || "";
						remove(state.currentNode.nextSibling);
					}
				}

				// Cache node for transfer
				child = state.currentNode.childNodes[0];
				sibling = state.currentNode.nextSibling;
				parent = state.currentNode.parentNode;

				// Remove wbr and merge textnode
				if (state.currentNode.nodeType == 3) {
					linkifyTextNode(state.currentNode);
				}

				// State transfer
				if (valid(state.currentNode) && state.lastMove != 3 && child) {
					state.currentNode = child;
					state.lastMove = 1;
				} else if (sibling) {
					state.currentNode = sibling;
					state.lastMove = 2;
				} else if (parent) {
					state.currentNode = parent;
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

			if (config.generateLog) {
				if (state.currentNode != root) {
					console.log("Traversal terminated! Last node: ", state.currentNode);
				} else {
					console.log(
						"Traversal end! Traversed %d nodes in %dms.",
						state.loopCount + 1,
						Date.now() - state.timeStart
					);
				}
			}

			root.inTraverserQueue = false;
			setTimeout(traverser.container);
		}
		setTimeout(traverse, 0);
	},
	add: function(node) {
		if (node.inTraverserQueue) {
			return;
		}
		node.inTraverserQueue = true;
		traverser.queue.push(node);
	}
};

function configInit(){
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
			},
			generateLog: {
				label: "Generate log (useful for debugging):",
				type: "checkbox",
				default: false
			},
			openInNewTab: {
				label: "Open link in new tab:",
				type: "checkbox",
				default: false
			},
			useYT: {
				label: "Embed youtube video:",
				type: "checkbox",
				default: false
			},
			ytWidth: {
				label: "Video width:",
				type: "text",
				default: "560"
			},
			ytHeight: {
				label: "Video height:",
				type: "text",
				default: "315"
			}
		},
		"@@CSS_CONFIG"
	);
	config.useImg = GM_config.get("useImg", true);
	config.includingClass = config.includingClass.concat(
		getArray(GM_config.get("classWhiteList", ""))
	);
	config.excludingClass = config.excludingClass.concat(
		getArray(GM_config.get("classBlackList", ""))
	);
	config.generateLog = GM_config.get("generateLog", false);
	config.openInNewTab = GM_config.get("openInNewTab", false);
	config.useYT = GM_config.get("useYT", false);
	config.ytWidth = +GM_config.get("ytWidth");
	config.ytHeight = +GM_config.get("ytHeight");
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

function getYoutubeId(url) {
	var match =
		url.match(/https?:\/\/www\.youtube\.com\/watch\?v=([^&]+)/) ||
		url.match(/https?:\/\/youtu\.be\/([^?]+)/);
	return match && match[1];
}

function createLink(text, url) {
	var id, cont, obj, wrap;

	if (config.useYT && (id = getYoutubeId(url))) {
		cont = document.createElement("div");
		cont.className = "linkifyplus-video";

		wrap = document.createElement("div");
		wrap.className = "linkifyplus-video-wrap";
		cont.appendChild(wrap);

		obj = document.createElement("iframe");
		obj.className = "linkifyplus-video-iframe";
		obj.src = "https://www.youtube.com/embed/" + id;
		obj.setAttribute("allowfullscreen", "true");
		obj.setAttribute("frameborder", "0");
		wrap.appendChild(obj);

	} else {
		cont = document.createElement("a");
		cont.href = url;
		if (config.openInNewTab) {
			cont.target = "_blank";
		}
		if (config.useImg && /(\.jpg|\.png|\.gif)$/i.test(url)) {
			obj = document.createElement("img");
			obj.className = "linkifyplus-image";
			obj.alt = text;
			obj.onerror = imgFailed;
			obj.src = url;
		} else {
			obj = document.createTextNode(text);
		}
		cont.appendChild(obj);
	}

	cont.classList.add("linkifyplus");
	return cont;
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
	var a, url;

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

		// get the link without trailing dots and comma
		l = l.replace(/[.,]*$/, '');
		path = path.replace(/[.,]*$/, '');

		// Get the link without single parenthesis
		l = stripSingleParenthesis(l);
		path = stripSingleParenthesis(path);

		// Guess protocol and create url
		if (!protocol && user && (mm = user.match(/^mailto:(.+)/))) {
			protocol = "mailto:";
			user = mm[1];
		}

		if (protocol && protocol.match(/^(hxxp|h\*\*p|ttp)/)) {
			protocol = "http://";
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

		//put in text up to the link
		span.appendChild(document.createTextNode(txt.substring(p, m.index)));

		//create a link and put it in the span
		a = createLink(l, url);
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

function template(text, option) {
	var key;
	for (key in option) {
		text = text.split("@" + key).join(option[key]);
	}
	return text;
}

var observer = {
	handler: function(mutations){

		var i;

		for (i = 0; i < mutations.length; i++) {
			if (!mutations[i].addedNodes.length) {
				continue;
			}

			traverser.add(mutations[i].target);
		}

		traverser.start();
	},
	config: {
		childList: true,
		subtree: true
	}
};

GM_addStyle(template("@@CSS", {
	ytWidth: config.ytWidth,
	ytRatio: (config.ytHeight / config.ytWidth) * 100
}));

GM_registerMenuCommand("Linkify Plus Plus - Configure", function(){
	GM_config.open();
});

traverser.add(document.body);
traverser.start();
new MutationObserver(observer.handler, false).observe(document.body, observer.config);
