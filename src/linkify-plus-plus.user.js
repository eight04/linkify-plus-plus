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
// @require     https://greasyfork.org/scripts/7212-gm-config-eight-s-version/code/GM_config%20(eight's%20version).js?version=57385
// @grant       GM_addStyle
// @grant       GM_registerMenuCommand
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       unsafeWindow
// ==/UserScript==

"use strict";

var config,
	re = {
		image: /^[^?#]+\.(?:jpg|png|gif|jpeg)(?:$|[?#])/i
	},
	tlds = TLDS.set,
	selectors;

GM_config.init(
	"Linkify Plus Plus",
	{
		image: {
			label: "Embed images",
			type: "checkbox",
			default: true
		},
		unicode: {
			label: "Allow non-ascii character",
			type: "checkbox",
			default: false
		},
		ignoreTags: {
			label: "Do not linkify urls in these tags",
			type: "textarea",
			default: "a noscript option script style textarea svg canvas button select template meter progress math h1 h2 h3 h4 h5 h6 time code"
		},
		ignoreClasses: {
			label: "Do not linkify urls in these classes",
			type: "textarea",
			default: "highlight editbox brush: bdsug spreadsheetinfo"
		},
		selectors: {
			label: "Always linkify these elements. One CSS selector per line.",
			type: "textarea",
			default: ""
		},
		log: {
			label: "Generate log",
			type: "checkbox",
			default: false
		},
		newTab: {
			label: "Open link in new tab",
			type: "checkbox",
			default: false
		}
	}
);

GM_config.onclose = loadConfig;

loadConfig();

function loadConfig(){
	config = GM_config.get();

	selectors = config.selectors.trim().replace(/\n/, ", ");

	var arr;

	arr = getArray(config.ignoreTags);
	if (arr) {
		re.ignoreTags = new RegExp("^(" + arr.join("|") + ")$", "i");
	} else {
		re.ignoreTags = null;
	}

	arr = getArray(config.ignoreClasses);
	if (arr) {
		re.ignoreClasses = new RegExp("(^|\\s)(" + arr.join("|") + ")($|\\s)");
	} else {
		re.ignoreClasses = null;
	}

	// 1=protocol, 2=user, 3=domain, 4=port, 5=path, 6=angular source
	if (config.unicode) {
		re.url = /\b([-a-z*]+:\/\/)?(?:([\w:.+-]+)@)?([a-z0-9-.\u00b7-\u2a6d6]+\.[a-z0-9-TLDS.charSet]{1,TLDS.maxLength})\b(:\d+)?([/?#]\S*)?|\{\{(.+?)\}\}/gi;
	} else {
		re.url = /\b([-a-z*]+:\/\/)?(?:([\w:.+-]+)@)?([a-z0-9-.]+\.[a-z0-9-]{1,TLDS.maxLength})\b(:\d+)?([/?#][\w-.~!$&*+;=:@%/?#(),'\[\]]*)?|\{\{(.+?)\}\}/gi;
	}
}

function valid(node) {
	var className = node.className;
	if (typeof className == "object") {
		className = className.baseVal;
	}
	if (re.ignoreTags && re.ignoreTags.test(node.nodeName)) {
		return false;
	}
	if (className && re.ignoreClasses && re.ignoreClasses.test(className)) {
		return false;
	}
	if (node.contentEditable == "true" || node.contentEditable == "") {
		return false;
	}
	if (className && className.indexOf("linkifyplus") >= 0) {
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
		timeout,
		time,
		chunks;

	function start() {
		if (running) {
			return;
		}
		chunks = 0;
		running = true;
		time = Date.now();
		next();
	}

	function next() {
		chunks++;
		var count = 0, done;
		while (!(done = iter.next().done) && count < 20) {
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
		if (config.log) {
			console.log("Thread stop. Elapsed " + (Date.now() - time) + "ms in " + chunks + " chunks.");
		}
	}

	return {
		start: start,
		stop: stop
	};
}

function validRoot(node) {
	if (node.VALID !== undefined) {
		return node.VALID;
	}
	var cache = [], isValid;
	while (node != document.documentElement) {
		cache.push(node);
		if (!valid(node)) {
			isValid = false;
			break;
		}
		if (!node.parentNode) {
			return false;
		}
		node = node.parentNode;
		if (node.VALID !== undefined) {
			isValid = node.VALID;
			break;
		}
	}
	if (isValid === undefined) {
		isValid = true;
	}
	var i;
	for (i = 0; i < cache.length; i++) {
		cache[i].VALID = isValid;
	}
	return isValid;
}

var queIterer = function(){
	var que = [];

	function add(item) {
		item.root.IS_LAST = true;
		item.root.IN_QUE = true;
		item.root.IS_FIRST = false;

		if (que.length) {
			que[que.length - 1].root.IS_LAST = false;
		}

		if (!que.length) {
			item.root.IS_FIRST = true;
		}

		que.push(item);
	}

	function next() {
		if (!que.length) {
			return {
				value: undefined,
				done: true
			};
		}
		var item = que[0].next();
		if (item.done) {
			que[0].root.IN_QUE = false;
			que[0].root.IS_LAST = false;
			que[0].root.IS_FIRST = false;
			que.shift();
			if (que.length) {
				que[0].root.IS_FIRST = true;
			}
			return next();
		}
		return item;
	}

	function drop(node) {
		if (que.length < 2) {
			return;
		}
		var i, item;
		for (i = 1; i < que.length; i++) {
			if (que[i].root == node) {
				item = que[i];
				que[que.length - 1].root.IS_LAST = false;
				que.splice(i, 1);
				que.push(item);
				item.root.IS_LAST = true;
				break;
			}
		}
	}

	return {
		add: add,
		drop: drop,
		next: next
	};
}();

function getArray(s) {
	s = s.trim();
	if (!s) {
		return null;
	}
	return s.split(/\s+/);
}

function isIP(s) {
	var m, i;
	if (!(m = s.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/))) {
		return false;
	}
	for (i = 1; i < m.length; i++) {
		if (+m[i] > 255 || (m[i].length > 1 && m[i][0] == "0")) {
			return false;
		}
	}
	return true;
}

function stripSingleSymbol(str, left, right) {
	var reStr = "[\\" + left + "\\" + right + "]",
		reObj, match, count = 0, end;

	// Cache regex
	if (!(reStr in re)) {
		re[reStr] = new RegExp(reStr, "g");
	}
	reObj = re[reStr];

	// Match loop
	while ((match = reObj.exec(str))) {
		if (count % 2 == 0) {
			end = match.index;
			if (match[0] == right) {
				break;
			}
		} else {
			if (match[0] == left) {
				break;
			}
		}
		count++;
	}

	if (!match && count % 2 == 0) {
		return str;
	}

	return str.substr(0, end);
}

function createLink(url, child) {
	var cont = document.createElement("a");
	cont.href = url;
	cont.title = "Linkify Plus Plus";
	if (config.newTab) {
		cont.target = "_blank";
	}
	if (config.image && re.image.test(url)) {
		child = new Image;
		child.src = url;
	}
	cont.appendChild(child);
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

	while (m = re.url.exec(txt)) {
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
				re.url.lastIndex = m.index + 2;
			}
			continue;
		}

		// domain shouldn't contain connected dots
		if (domain.indexOf("..") > -1) {
			continue;
		}

		// valid IP address
		if (!isIP(domain) && (mm = domain.match(/\.([a-z0-9-]+)$/i)) && !(mm[1].toLowerCase() in tlds)) {
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
			// Remove trailing dots and comma
			face = face.replace(/[.,]*$/, '');
			path = path.replace(/[.,]*$/, '');

			// Strip parens "()"
			face = stripSingleSymbol(face, "(", ")");
			path = stripSingleSymbol(path, "(", ")");

			// Strip bracket "[]"
			face = stripSingleSymbol(face, "[", "]");
			path = stripSingleSymbol(path, "[", "]");
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

		re.url.lastIndex = m.index + face.length;
		lastIndex = re.url.lastIndex;

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
			if (next && current.nextSibling == next) {
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

GM_registerMenuCommand("Linkify Plus Plus - Configure", function(){
	GM_config.open();
});

function addToQue(node) {
	if (!node.IN_QUE || node.IS_FIRST) {
		queIterer.add(createTreeWalker(node));
	} else if (!node.IS_LAST) {
		queIterer.drop(node);
	}
}

GM_addStyle(".linkifyplus img { max-width: 90%; }");

observeDocument(function(node){
	if (validRoot(node)) {
		addToQue(node);
	}
	if (selectors) {
		Array.prototype.forEach.call(node.querySelectorAll(selectors), addToQue);
	}
	thread.start();
});
