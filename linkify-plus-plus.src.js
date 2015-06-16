// ==UserScript==
// @name        Linkify Plus Plus
// @version     4.0.1
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
	var className = node.className;
	if (typeof className == "object") {
		className = className.baseVal;
	}
	if (re.excludingTag.test(node.nodeName)) {
		return false;
	}
	if (re.excludingClass.test(className)) {
		return false;
	}
	if (node.contentEditable == "true" || node.contentEditable == "") {
		return false;
	}
	return true;
}

var nodeFilter = {
	acceptNode: function(node) {
		if (!valid(node)) {
			return NodeFilter.FILTER_REJECT;
		}
		if (node.nodeName == "WBR") {
			return NodeFilter.FILTER_ACCEPT;
		}
		if (node.nodeType == 3) {
			return NodeFilter.FILTER_ACCEPT;
		}
		return NodeFilter.FILTER_SKIP;
	}
};

function createThread(iter) {
	var running = false,
		timeout;

	function start() {
		if (running) {
			return;
		}
		running = true;
		next();
	}

	function next() {
		var count = 0, done;
		while (!(done = iter.next().done) && count < 50) {
			count++;
		}
		if (!done) {
			timeout = setTimeout(next);
		} else {
			stop();
		}
	}

	function stop() {
		running = false;
		clearTimeout(timeout);
	}

	return {
		start: start,
		stop: stop
	};
}

function validRoot(node) {
	var cache = node;
	while (node.parentNode != document.documentElement) {
		if (node.IS_VALID) {
			cache.IS_VALID = true;
			return true;
		}
		// Check if the node is valid
		if (node.INVALID || !valid(node)) {
			cache.INVALID = true;
			return false;
		}
		// The node was detached from DOM tree
		if (!node.parentNode) {
			return false;
		}
		node = node.parentNode;
	}
	cache.IS_VALID = true;
	return true;
}

var queIterer = function(){
	var que = [];

	function add(item) {
		if (que.length) {
			que[que.length - 1].IS_LAST = false;
		}
		item.IS_LAST = true;
		item.IN_QUE = true;
		que.push(item);
	}

	function next() {
		if (!que[0]) {
			return {
				value: undefined,
				done: true
			};
		}
		var item = que[0].next();
		if (item.done) {
			que.shift();
			que[0].IN_QUE = false;
		}
		return {
			value: item,
			done: false
		};
	}

	function drop(item) {
		var i;
		for (i = 0; i < que.length; i++) {
			if (que[i] == item) {
				que.splice(i, 1);
				que[que.length - 1].IS_LAST = false;
				que.push(item);
				item.IS_LAST = true;
				item.IN_QUE = true;
				break;
			}
		}
	}

	return {
		que: que,
		add: add,
		drop: drop,
		next: next
	};
}();

function loadConfig(){
	config = GM_config.get();

	var excludingTag = [
		'a', 'code', 'head', 'noscript', 'option', 'script', 'style',
		'title', 'textarea', "svg", "canvas", "button", "select", "template",
		"meter", "progress", "math", "h1", "h2", "h3", "h4", "h5", "h6", "time"
	];

	var excludingClass = [
		"highlight", "editbox", "code", "brush:", "bdsug", "spreadsheetinfo", "linkifyplus"
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

function createLink(url, text) {
	var cont;

	cont = document.createElement("a");
	cont.href = url;
	if (config.openInNewTab) {
		cont.target = "_blank";
	}
	cont.appendChild(text);
	cont.className = "linkifyplus";

	return cont;
}

function replaceRange(range, nodes) {
	var i, j;

	// Get text targets
	var targets = [],
		list = range.startContainer.childNodes,
		offset = 0,
		endOffset = 0;
	for (i = range.startOffset; i < range.endOffset; i++) {
		if (list[i].nodeType == 3) {
			endOffset = offset + list[i].nodeValue.length;
		}
		targets.push({
			offset: offset,
			endOffset: endOffset,
			node: list[i]
		});
		offset = endOffset;
	}

	// Compare offset with range position
	var subRange = document.createRange(),
		frag = document.createDocumentFragment(),
		text;
	for (i = 0, j = 0; i < nodes.length; i++) {
		// Create sub range
		while (nodes[i].start >= targets[j].endOffset) {
			j++;
		}
		subRange.setStart(targets[j].node, nodes[i].start - targets[j].offset);
		while (nodes[i].end > targets[j].endOffset) {
			j++;
		}
		subRange.setEnd(targets[j].node, nodes[i].end - targets[j].offset);

		// Create text and link
		text = subRange.cloneContents();
		if (nodes[i].type == "string") {
			frag.appendChild(text);
		} else {
			frag.appendChild(createLink(nodes[i].url, text));
		}
	}
	subRange.detach();

	// Replace range
	range.deleteContents();
	range.insertNode(frag);
}

function linkifyTextNode(range) {
	var m, mm,
		txt = range.toString(),
		nodes = [],
		lastIndex = 0;
	var face, protocol, user, domain, port, path, angular;
	var url, linkified = false;

	while (m = urlRE.exec(txt)) {
		face = m[0];
		protocol = m[1] || "";
		user = m[2] || "";
		domain = m[3] || "";
		port = m[4] || "";
		path = m[5] || "";
		angular = m[6];

		// Skip angular source
		if (angular) {
			if (!unsafeWindow.angular) {
				urlRE.lastIndex = m.index + 2;
			}
			continue;
		}

		// domain shouldn't contain connected dots
		if (domain.indexOf("..") > -1) {
			continue;
		}

		// valid IP address
		if (!isIP(domain) && (mm = domain.match(/\.([a-z0-9-]+)$/i)) && !(mm[1].toUpperCase() in tlds)) {
			continue;
		}

		// Insert text
		if (m.index > lastIndex) {
			nodes.push({
				start: lastIndex,
				end: m.index,
				type: "string"
			});
		}

		if (path) {
			// get the link without trailing dots and comma
			face = face.replace(/[.,]*$/, '');
			path = path.replace(/[.,]*$/, '');

			// Get the link without single parenthesis
			face = stripSingleParenthesis(face);
			path = stripSingleParenthesis(path);
		}

		// Guess protocol
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

		// Create URL
		url = protocol + (user && user + "@") + domain + port + path;

		urlRE.lastIndex = m.index + face.length;
		lastIndex = urlRE.lastIndex;

		nodes.push({
			start: m.index,
			end: lastIndex,
			type: "anchor",
			url: url
		});

		linkified = true;
	}

	if (!linkified) {
		return;
	}

	if (txt.length > lastIndex) {
		nodes.push({
			start: lastIndex,
			end: txt.length,
			type: "string"
		});
	}

	replaceRange(range, nodes);
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

function createTreeWalker(node) {
	var walker = document.createTreeWalker(
		node,
		NodeFilter.SHOW_TEXT + NodeFilter.SHOW_ELEMENT,
		nodeFilter
	), current, next;

	function nextRange() {
		current = next || walker.nextNode();
		if (!current) {
			return null;
		}
		var range = document.createRange();
		range.setStartBefore(current);
		range.setEndAfter(current);
		while (true) {
			next = walker.nextNode();
			if (current.nextSibling == next) {
				range.setEndAfter(next);
			} else {
				return range;
			}
			current = next;
		}
	}

	node.WALKER = {
		next: function() {
			var range = nextRange();
			if (range) {
				linkifyTextNode(range);
			}
			return {
				value: range,
				done: !range
			};
		}
	};

	return node.WALKER;
}

var thread = createThread(queIterer);

GM_addStyle(template("@@CSS", {
	ytWidth: config.ytWidth,
	ytRatio: (config.ytHeight / config.ytWidth) * 100
}));

GM_registerMenuCommand("Linkify Plus Plus - Configure", function(){
	GM_config.open();
});

observeDocument(function(node){
	if (!validRoot(node)) {
		return;
	}
	if (!node.IN_QUE) {
		queIterer.add(createTreeWalker(node));
	} else if (!node.IS_LAST) {
		queIterer.drop(node.WALKER);
	}
	thread.start();
});
