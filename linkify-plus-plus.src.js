// ==UserScript==
// @name        Linkify Plus Plus
// @version     3.6.3
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
// @require 	https://greasyfork.org/scripts/7212-gm-config-eight-s-version/code/GM_config%20(eight's%20version).js?version=46603
// @grant       GM_addStyle
// @grant       GM_registerMenuCommand
// @grant       GM_getValue
// @grant       GM_setValue
// ==/UserScript==

"use strict";

var config, re;

GM_config.init(
	"Linkify Plus Plus",
	{
		useImg: {
			label: "Embed images",
			type: "checkbox",
			default: true
		},
		classBlackList: {
			label: "Add classes to black-list (Separate by space)",
			type: "textarea",
			default: ""
		},
		classWhiteList: {
			label: "Add classes to white-list (Separate by space)",
			type: "textarea",
			default: ""
		},
		generateLog: {
			label: "Generate log (useful for debugging)",
			type: "checkbox",
			default: false
		},
		openInNewTab: {
			label: "Open link in new tab",
			type: "checkbox",
			default: false
		},
		useYT: {
			label: "Embed youtube video",
			type: "checkbox",
			default: false
		},
		ytWidth: {
			label: "Video width",
			type: "text",
			default: "560"
		},
		ytHeight: {
			label: "Video height",
			type: "text",
			default: "315"
		},
		embedAll: {
			label: "Enable embedding globally (It might mess up your page!)",
			type: "checkbox",
			default: false
		}
	}
);

GM_config.onclose = loadConfig;

loadConfig();

// 1=protocol, 2=user, 3=domain, 4=port, 5=path, 6=angular source
var urlRE = /\b([-a-z*]+:\/\/)?(?:([\w:.+-]+)@)?([a-z0-9-.]+\.[a-z0-9-]+)\b(:\d+)?([/?#][\w-.~!$&*+;=:@%/?#(),]*)?|\{\{(.+?)\}\}/gi;

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
			var i = 0, child, sibling, parent, removed;

			while (state.currentNode != root) {

				// Remove wbr and merge textnode
				if (state.currentNode.nodeType == 3) {
					removed = false;
					while (state.currentNode.nextSibling &&
							(state.currentNode.nextSibling.nodeType == 3 ||
							state.currentNode.nextSibling.nodeName == "WBR")) {
						state.currentNode.nodeValue += state.currentNode.nextSibling.nodeValue || "";
						remove(state.currentNode.nextSibling);
						removed = true;
					}
					if (removed) {
						state.currentNode.parentNode.classList.add("linkifyplus-wbr-removed");
					}
				}

				// Cache node for transfer
				child = state.currentNode.childNodes[0];
				sibling = state.currentNode.nextSibling;
				parent = state.currentNode.parentNode;

				// Linkify
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

function loadConfig(){
	config = GM_config.get();

	var excludingTag = [
		'a', 'code', 'head', 'noscript', 'option', 'script', 'style',
		'title', 'textarea', "svg", "canvas", "button", "select", "template",
		"meter", "progress", "math", "h1", "h2", "h3", "h4", "h5", "h6", "time"
	];

	var excludingClass = [
		"highlight", "editbox", "code", "brush:", "bdsug", "spreadsheetinfo"
	].concat(getArray(config.classBlackList));

	var includingClass = [
		"bbcode_code"
	].concat(getArray(config.classWhiteList));

	re = {
		excludingTag: new RegExp("^(" + excludingTag.join("|") + ")$", "i"),
		excludingClass: new RegExp("(^|\\s)(" + excludingClass.join("|") + ")($|\\s)"),
		includingClass: new RegExp("(^|\\s)(" + includingClass.join("|") + ")($|\\s)")
	};
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

function getYoutubeId(url) {
	var match =
		url.match(/https?:\/\/www\.youtube\.com\/watch\?v=([^&]+)/) ||
		url.match(/https?:\/\/youtu\.be\/([^?]+)/);
	return match && match[1];
}

function createLink(text, url) {
	var cont;

	cont = document.createElement("a");
	cont.href = url;
	if (config.openInNewTab) {
		cont.target = "_blank";
	}
	cont.appendChild(document.createTextNode(text));
	cont.className = "linkifyplus";

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
		// Skip angular source
		if (m[6]) {
			if (!unsafeWindow.angular) {
				urlRE.lastIndex = m.index + 2;
			}
			continue;
		}

		protocol = m[1] || "";
		user = m[2] || "";
		domain = m[3] || "";
		port = m[4] || "";
		path = m[5] || "";

		// domain shouldn't contain connected dots
		if (domain.indexOf("..") > -1) {
			continue;
		}

		// valid IP address
		if (!isIP(domain) && (mm = domain.match(/\.([a-z0-9-]+)$/i)) && !(mm[1].toUpperCase() in tlds)) {
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

function observeDocument(callback) {

	callback(document.body);

	new MutationObserver(function(mutations){
		var i;
		for (i = 0; i < mutations.length; i++) {
			if (!mutations[i].addedNodes.length) {
				continue;
			}
			callback(mutations[i].target);
		}
	}).observe(document.body, {
		childList: true,
		subtree: true
	});
}

function loop(list, callback) {
	var i = 0,
		len = list.length;

	function chunk() {
		var j;
		for (j = 0; j < 50 && i < len; i++, j++) {
			callback(list[i]);
		}
		if (i < len) {
			setTimeout(chunk);
		}
	}

	setTimeout(chunk);
}

var embedFunction = {
	image: function(url, element) {
		var obj;
		if (!config.useImg || !/^[^?#]+\.(jpg|png|gif|jpeg)($|[?#])/i.test(url)) {
			return null;
		}
		obj = document.createElement("img");
		obj.className = "embedme-image";
		obj.alt = url;
		obj.src = url;
		element = element.cloneNode(false);
		element.appendChild(obj);
		return element;
	},
	youtube: function(url) {
		var id, cont, wrap, obj;
		if (!config.useYT || !(id = getYoutubeId(url))) {
			return null;
		}
		cont = document.createElement("div");
		cont.className = "embedme-video";

		wrap = document.createElement("div");
		wrap.className = "embedme-video-wrap";
		cont.appendChild(wrap);

		obj = document.createElement("iframe");
		obj.className = "embedme-video-iframe";
		obj.src = "https://www.youtube.com/embed/" + id;
		obj.setAttribute("allowfullscreen", "true");
		obj.setAttribute("frameborder", "0");
		wrap.appendChild(obj);

		return cont;
	}
};

function embedContent(element) {
	var url = element.href, key, embed;

	if (!element.parentNode) {
		return;
	}

	for (key in embedFunction) {
		embed = embedFunction[key](url, element);
		if (embed) {
			embed.classList.add("embedme");
			element.parentNode.replaceChild(embed, element);
			return;
		}
	}
//	element.classList.add("embedme-fail");
}

function embedMe(node) {
	var result, nodes = [], i, xpath;

	if (config.embedAll) {
		xpath = ".//a[not(*) and text() and @href and not(contains(@class, 'embedme'))]";
	} else {
		xpath = ".//a[not(*) and text() and @href and not(contains(@class, 'embedme')) and contains(@class, 'linkifyplus')]";
	}

	result = document.evaluate(xpath, node, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);

	for (i = 0; i < result.snapshotLength; i++) {
		nodes.push(result.snapshotItem(i));
	}

	loop(nodes, embedContent);
}

GM_addStyle(template("@@CSS", {
	ytWidth: config.ytWidth,
	ytRatio: (config.ytHeight / config.ytWidth) * 100
}));

GM_registerMenuCommand("Linkify Plus Plus - Configure", function(){
	GM_config.open();
});

observeDocument(function(node){
	traverser.add(node);
	traverser.start();
});

observeDocument(embedMe);
