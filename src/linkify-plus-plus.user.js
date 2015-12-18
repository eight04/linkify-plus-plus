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

	var urlUnicodeRE = /\b([-a-z*]+:\/\/)?(?:([\w:.+-]+)@)?([a-z0-9-.\u00b7-\u2a6d6]+\.[a-z0-9-TLDS.charSet]{1,TLDS.maxLength})\b(:\d+)?([/?#]\S*)?|\{\{(.+?)\}\}/ig,
		urlRE =  /\b([-a-z*]+:\/\/)?(?:([\w:.+-]+)@)?([a-z0-9-.]+\.[a-z0-9-]{1,TLDS.maxLength})\b(:\d+)?([/?#][\w-.~!$&*+;=:@%/?#(),'\[\]]*)?|\{\{(.+?)\}\}/ig,
		tlds = TLDS.set;

	function inTLDS(domain) {
		var match = domain.match(/\.([a-z0-9-]+)$/i);
		if (!match) {
			return false;
		}
		return match[1].toLowerCase() in tlds;
	}

	function Pos(cont, offset) {
		this.container = cont;
		this.offset = offset;
	}

	Pos.prototype.add = function(change) {
		return posAdd(this, this.container, this.offset, change);
	};

	function createPos(cont, offset) {
		return new Pos(cont, offset);
	}

	function posAdd(pos, cont, offset, change) {
		// If the container is #text.parentNode
		if (cont.childNodes.length) {
			cont = cont.childNodes[offset];
			offset = 0;
		}

		// If the container is #text
		while (cont) {
			if (cont.nodeType == 3) {
				if (offset + change <= cont.nodeValue.length) {
					pos.container = cont;
					pos.offset = offset + change;
					return;
				}
				change = offset + change - cont.nodeValue.length;
				offset = 0;
			}
			cont = cont.nextSibling;
		}
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
		var re = unicode ? urlUnicodeRE : urlRE,
			m, mm, txt, lastPos,
			face, protocol, user, domain, port, path, angular,
			url;

		// Is range.endContainer not changed?
		if (!range.TXT) {
			// It is a new range
			range.TXT = range.toString();
			re.lastIndex = 0;
		}
		txt = range.TXT;
		lastPos = re.lastIndex;

		m = re.exec(txt);

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

		// A position to record where the range is working
		var pos = createPos(range.startContainer, range.startOffset);

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

			var urlRange = document.createRange();

			pos.add(m.index - lastPos);
			urlRange.setStart(pos.container, pos.offset);

			pos.add(face.length);
			urlRange.setEnd(pos.container, pos.offset);

			urlRange.insertNode(createLink(url, urlRange.extractContents(), newTab, image));

			pos.container = urlRange.endContainer;
			pos.offset = urlRange.endOffset;

			// We have to set lastIndex manually if we had changed face.
			re.lastIndex = m.index + face.length;

		} else if (angular && !unsafeWindow.angular) {
			// Next start after "{{" if there is no window.angular
			pos.add(m.index + 2 - lastPos);
			re.lastIndex = m.index + 2;

		} else {
			pos.add(m.index + face.length - lastPos);
		}

		range.setStart(pos.container, pos.offset);

		return range;
	}

	function linkify(root, options) {
		var filter = createFilter(options.ignoreTags, options.ignoreClasses),
			ranges = generateRanges(root, filter),
			range,
			maxRunTime = options.maxRunTime,
			timeout = options.timeout,
			ts = Date.now(), te;

		if (maxRunTime === undefined) {
			maxRunTime = 100;
		}

		if (timeout === undefined) {
			timeout = 30000;
		}

		nextRange();

		function nextRange() {
			te = Date.now();

			do {
				if (!range) {
					range = ranges.next().value;
				}

				if (!range) {
					break;
				}

				range = linkifyRange(range, options.newTab, options.image, options.unicode);

				// Over script max run time
				if (Date.now() - te > maxRunTime) {
					requestAnimationFrame(nextRange);
					return;
				}

			} while (Date.now() - ts < timeout);

			if (!range) {
				console.log("Linkify finished in " + (Date.now() - ts) + "ms");
			} else {
				console.log("Linkify timeout in " + timeout + "ms");
			}

			if (options.done) {
				options.done();
			}
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
		requestAnimationFrame(next);
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
		requestAnimationFrame(next);
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

// Get array from string
function getArray(s) {
	s = s.trim();
	if (!s) {
		return null;
	}
	return s.split(/\s+/);
}

// Valid root node before sending to linkifyplus
function validRoot(node, options) {
	// Cache valid state in node.VALID
	if (node.VALID !== undefined) {
		return node.VALID;
	}

	// Loop through ancestor
	var cache = [], isValid;
	while (node != document.documentElement) {
		cache.push(node);

		// It is invalid if it has invalid ancestor
		if (!linkify.valid(node, options.ignoreTags, options.ignoreClasses)) {
			isValid = false;
			break;
		}

		// The node was removed from DOM tree
		if (!node.parentNode) {
			return false;
		}

		node = node.parentNode;

		if (node.VALID !== undefined) {
			isValid = node.VALID;
			break;
		}
	}

	// All ancestors are fine
	if (isValid === undefined) {
		isValid = true;
	}

	// Cache the result
	var i;
	for (i = 0; i < cache.length; i++) {
		cache[i].VALID = isValid;
	}

	return isValid;
}

/*********************** Main section start *********************************/

var options, selectors, que = createQue(queHandler);

// Recieve item from que
function queHandler(item, done) {
	if (item instanceof Element) {
		if (validRoot(item, options) || selectors && item.matches(selectors)) {
			linkify.linkify(item, {
				image: options.image,
				unicode: options.unicode,
				ignoreTags: options.ignoreTags,
				ignoreClasses: options.ignoreClasses,
				newTab: options.newTab,
				done: done
			});
		}

		if (selectors) {
			que.unshift(item.querySelectorAll(selectors));
		}

		return;
	}

	if (item instanceof MutationRecord && item.addedNodes.length) {
		que.unshift(item.addedNodes);
	}

	done();
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
	},
	timeout: {
		label: "Max execution time (ms). Linkify will stop if its execution time exceeds this value.",
		type: "number",
		default: 30000
	}
}, function(_options){
	options = _options;
	options.ignoreTags = getArray(options.ignoreTags);
	options.ignoreClasses = getArray(options.ignoreClasses);
	selectors = options.selectors.trim().replace(/\n/, ", ");
});

GM_addStyle(".linkifyplus img { max-width: 90%; }");

new MutationObserver(function(mutations){
	// Filter out mutations generated by LPP
	var lastRecord = mutations[mutations.length - 1];
	if (lastRecord.addedNodes.length && mutations[mutations.length - 1].addedNodes[0].className == "linkifyplus") {
		return;
	}

	// Put mutations into que
	que.push(mutations);

}).observe(document.body, {
	childList: true,
	subtree: true
});

que.push(document.body);
