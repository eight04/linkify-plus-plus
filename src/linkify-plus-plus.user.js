// ==UserScript==
// @name        Linkify Plus Plus
// @version     6.2.0
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
// @compatible  firefox
// @compatible  chrome
// @compatible  opera
// ==/UserScript==

"use strict";

var config,
	re = {
		image: /^[^?#]+\.(?:jpg|png|gif|jpeg)(?:$|[?#])/i
	},
	tlds = TLDS.set,
	selectors,
	que = [],
	thread = createThread(queGen);

initConfig({
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
	newTab: {
		label: "Open link in new tab",
		type: "checkbox",
		default: false
	}
});

function initConfig(options) {
	GM_config.init(GM_info.script.name, options);
	GM_config.onclose = loadConfig;
	loadConfig();
	GM_registerMenuCommand(GM_info.script.name + " - Configure", GM_config.open);
}

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

function createThread(gen, done) {
	var running = false,
		timeout,
		chunks,
		iter;

	function start(param) {
		if (running) {
			return;
		}
		chunks = 0;
		running = true;
		iter = gen(param);
		timeout = setTimeout(next);
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
		if (done) {
			done();
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

function queAdd(node) {
	if (node.QUE_COUNT === undefined) {
		node.QUE_COUNT = 0;
	}

	node.QUE_COUNT++;
	que.push(node);
}

function* queGen () {
	// Generate linkified range from que.
	var node;
	while ((node = que.shift())) {
		node.QUE_COUNT--;
		if (node.QUE_COUNT > 0) {
			continue;
		}
		yield* createTreeWalker(node);
	}
}

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

var createRe = function(){
	var pool = {};

	return function (str, flags) {
		if (!(str in pool)) {
			pool[str] = new RegExp(str, flags);
		}
		// Reset RE
		pool[str].lastIndex = 0;
		return pool[str];
	};
}();

function stripSingleSymbol(str, left, right) {
	var re = createRe("[\\" + left + "\\" + right + "]", "g"),
		match, count = 0, end;

	// Match loop
	while ((match = re.exec(str))) {
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
		child.alt = url;
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
	var url;

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
			// Remove trailing ".,?"
			face = face.replace(/[.,?]*$/, '');
			path = path.replace(/[.,?]*$/, '');

			// Strip parens "()"
			face = stripSingleSymbol(face, "(", ")");
			path = stripSingleSymbol(path, "(", ")");

			// Strip bracket "[]"
			face = stripSingleSymbol(face, "[", "]");
			path = stripSingleSymbol(path, "[", "]");

			// Strip BBCode
			face = face.replace(/\[\/?(b|i|u|url|img|quote|code|size|color)\].*/i, "");
			path = path.replace(/\[\/?(b|i|u|url|img|quote|code|size|color)\].*/i, "");
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
	}

	if (!nodes.length) {
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

function* createTreeWalker(node) {
	// Generate linkified ranges.
	var walker = document.createTreeWalker(
		node,
		NodeFilter.SHOW_TEXT + NodeFilter.SHOW_ELEMENT,
		nodeFilter
	), start, end, current, range;

	end = start = walker.nextNode();
	if (!start) {
		return;
	}
	range = document.createRange();
	range.setStartBefore(start);
	while ((current = walker.nextNode())) {
		if (end.nextSibling == current) {
			end = current;
			continue;
		}
		range.setEndAfter(end);
		yield linkifyTextNode(range);

		end = start = current;
		range = document.createRange();
		range.setStartBefore(start);
	}
	range.setEndAfter(end);
	yield linkifyTextNode(range);
}

function* mutationGen(mutations) {
	// Generate nodes
	var i;
	for (i = 0; i < mutations.length; i++) {
		if (mutations[i].addedNodes.length) {
			yield processNode(mutations[i].target);
		}
	}
}

function processNode(node) {
	if (validRoot(node)) {
		queAdd(node);
	}
	if (selectors) {
		Array.prototype.forEach.call(node.querySelectorAll(selectors), queAdd);
	}
}

GM_addStyle(".linkifyplus img { max-width: 90%; }");

new MutationObserver(function(mutations){
	createThread(mutationGen, thread.start).start(mutations);
}).observe(document.body, {
	childList: true,
	subtree: true
});

processNode(document.body);
thread.start();
