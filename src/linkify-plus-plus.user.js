// ==UserScript==
// @name        Linkify Plus Plus
// @version     6.2.1
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
// @exclude		http://w3c*.github.io/*
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

// Linkify Plus Plus core
var linkify = function(){

	var urlRE = /\b([-a-z*]+:\/\/)?(?:([\w:.+-]+)@)?([a-z0-9-.\u00b7-\u2a6d6]+\.[a-z0-9-TLDS.charSet]{1,TLDS.maxLength})\b(:\d+)?([/?#]\S*)?|\{\{(.+?)\}\}/i,
		urlUnicodeRE =  /\b([-a-z*]+:\/\/)?(?:([\w:.+-]+)@)?([a-z0-9-.]+\.[a-z0-9-]{1,TLDS.maxLength})\b(:\d+)?([/?#][\w-.~!$&*+;=:@%/?#(),'\[\]]*)?|\{\{(.+?)\}\}/i,
		tlds = TLDS.set;

	function inTLDS(domain) {
		var match = domain.match(/\.([a-z0-9-]+)$/i);
		if (!match) {
			return false;
		}
		return match[1].toLowerCase() in tlds;
	}

	function createPos(cont, offset) {
		return {
			container: cont,
			offset: offset,
			add: function (change) {
				return posAdd(cont, offset, change);
			}
		};
	}

	function nextSibling(node) {
		while (!node.nextSibling && node.parentNode) {
			node = node.parentNode;
		}
		return node.nextSibling;
	}

	function posAdd(cont, offset, change) {
		// Currently we only support positive add

		// If the container is #text
		if (cont.nodeType == 3) {
			if (offset + change <= cont.nodeValue.length) {
				return createPos(cont, offset + change);
			} else {
				return posAdd(nextSibling(cont), 0, offset + change - cont.nodeValue.length)
			}
		}

		// If the container is empty
		if (!cont.textContent.length) {
			return posAdd(nextSibling(cont), 0, change)
		}

		// Otherwise it must have children
		return posAdd(cont.childNodes[offset], 0, change);
	}

	function* generateRanges(node, filter) {
		// Generate linkified ranges.
		var walker = document.createTreeWalker(
			node,
			NodeFilter.SHOW_TEXT + NodeFilter.SHOW_ELEMENT,
			filter
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
			yield range;

			end = start = current;
			range = document.createRange();
			range.setStartBefore(start);
		}
		range.setEndAfter(end);
		yield range;
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

	function createLink(url, child, newTab, useImage) {
		var cont = document.createElement("a");
		cont.href = url;
		cont.title = "Linkify Plus Plus";
		if (newTab) {
			cont.target = "_blank";
		}
		if (useImage && /^[^?#]+\.(?:jpg|png|gif|jpeg)(?:$|[?#])/i.test(url)) {
			child = new Image;
			child.src = url;
			child.alt = url;
		}
		cont.appendChild(child);
		cont.className = "linkifyplus";

		return cont;
	}

	function valid(node, ignoreTags, ignoreClasses) {

		// TODO: build cache on array?
		var tagRE = ignoreTags && createRe("^(" + ignoreTags.join("|") + ")$", "i"),
			classRE = ignoreClasses && createRe("(^|\\s)(" + ignoreClasses.join("|") + ")($|\\s)"),
			className = node.className;

		if (typeof className == "object") {
			className = className.baseVal;
		}
		if (tagRE && tagRE.test(node.nodeName)) {
			return false;
		}
		if (className && classRE && classRE.test(className)) {
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

	function createFilter(ignoreTags, ignoreClasses) {
		return {
			acceptNode: function(node) {
				if (!valid(node, ignoreTags, ignoreClasses)) {
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
	}

	function linkifyRange(range, newTab, image, unicode) {
		var m, mm, txt = range.toString(),
			face, protocol, user, domain, port, path, angular,
			url;

		if (!unicode) {
			m = urlRE.exec(txt);
		} else {
			m = urlUnicodeRE.exec(txt);
		}

		if (!m) {
			return null;
		}

		face = m[0];
		protocol = m[1] || "";
		user = m[2] || "";
		domain = m[3] || "";
		port = m[4] || "";
		path = m[5] || "";
		angular = m[6];

		var rangePos = createPos(range.startContainer, range.startOffset),
			nextPos;

		if (!angular && domain.indexOf("..") <= -1 && (isIP(domain) || inTLDS(domain))) {

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
				if ((mm = domain.match(/^(ftp|irc)/))) {
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

			// Create range to replace
			var urlPos = rangePos.add(m.index),
				urlEndPos = urlPos.add(face.length);

			var urlRange = document.createRange();
			urlRange.setStart(urlPos.container, urlPos.offset);
			urlRange.setEnd(urlEndPos.container, urlEndPos.offset);

			urlRange.insertNode(createLink(url, urlRange.extractContents(), newTab, image));

			nextPos = createPos(urlRange.endContainer, urlRange.endOffset);

		} else if (angular && !unsafeWindow.angular) {
			// Next start after "{{" if there is no window.angular
			nextPos = rangePos.add(m.index + 2);

		} else {
			nextPos = rangePos.add(m.index + face.length);
		}

		range.setStart(nextPos.container, nextPos.offset);

		return range;
	}

	function linkify(root, options) {
		var filter = createFilter(options.ignoreTags, options.ignoreClasses),
			ranges = generateRanges(root, filter),
			range;

		setTimeout(nextRange);

		function nextRange() {

			if (!range) {
				range = ranges.next().value;
			}

			if (!range) {
				if (options.done) {
					setTimeout(options.done);
				}
				return;
			}

			range = linkifyRange(range, options.newTab, options.image);

			setTimeout(nextRange);
		}

	}

	return {
		linkify: linkify,
		valid: valid
	};
}();

// Deliver que item to handler
function createQue(handler) {

	var que = [],
		running = false;

	function unshift(item) {
		que.unshift(item);
		if (!running) {
			start();
		}
	}

	function push(item) {
		que.push(item);
		if (!running) {
			start();
		}
	}

	function start() {
		running = true;
		setTimeout(next);
	}

	function next() {
		if (!que.length) {
			running = false;
			return;
		}

		var item = que.shift();

		// Array like object
		if (typeof item == "object" && Number.isInteger(item.length)) {
			que.unshift.apply(que, item);
			nextDone();
			return;
		}

		handler(item, nextDone);
	}

	function nextDone() {
		setTimeout(next);
	}

	function isRunning() {
		return running;
	}

	return {
		unshift: unshift,
		push: push,
		isRunning: isRunning,
		que: que
	};
}

// Working with GM_config
function initConfig(options, reloadHandler) {

	function reload() {
		reloadHandler(GM_config.get());
	}

	GM_config.init(GM_info.script.name, options);
	GM_config.onclose = reload;
	GM_registerMenuCommand(GM_info.script.name + " - Configure", GM_config.open);
	reload();
}

/*********************** Main section start *********************************/

var options, selectors, que = createQue(queHandler);

// Valid root node before sending to linkifyplus
function validRoot(node, options) {
	if (node.VALID !== undefined) {
		return node.VALID;
	}
	var cache = [], isValid;
	while (node != document.documentElement) {
		cache.push(node);
		if (!linkify.valid(node, options.ignoreTags, options.ignoreClasses)) {
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

// Get array from string
function getArray(s) {
	s = s.trim();
	if (!s) {
		return null;
	}
	return s.split(/\s+/);
}

// Main logic
function queHandler(item, done) {
	var target;

	if (item instanceof Element) {
		target = item;
	} else if (item instanceof MutationRecord && item.addedNodes.length) {
		target = item.target;
	}

	if (validRoot(target, options)) {
		linkify.linkify(target, {
			image: options.image,
			unicode: options.unicode,
			ignoreTags: options.ignoreTags,
			ignoreClasses: options.ignoreClasses,
			newTab: options.newTab,
			done: done
		});
	} else {
		done();
	}

	if (selectors) {
		que.unshift(target.querySelectorAll(selectors));
	}
}

// Program init
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
}, function(config){
	options = config;
	options.ignoreTags = getArray(options.ignoreTags);
	options.ignoreClasses = getArray(options.ignoreClasses);
	selectors = config.selectors.trim().replace(/\n/, ", ");
});

GM_addStyle(".linkifyplus img { max-width: 90%; }");

new MutationObserver(function(mutations){
	que.push(mutations);
}).observe(document.body, {
	childList: true,
	subtree: true
});

que.push(document.body);
