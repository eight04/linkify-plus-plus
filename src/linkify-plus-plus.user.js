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

// Regex creator
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

// Linkify Plus Plus core
var linkify = function(){

	var urlUnicodeRE = /\b([-a-z*]+:\/\/)?(?:([\w:.+-]+)@)?([a-z0-9-.\u00b7-\u2a6d6]+\.[a-z0-9-TLDS.charSet]{1,TLDS.maxLength})\b(:\d+)?([/?#]\S*)?|\{\{(.+?)\}\}/ig,
		urlRE =  /\b([-a-z*]+:\/\/)?(?:([\w:.+-]+)@)?([a-z0-9-.]+\.[a-z0-9-]{1,TLDS.maxLength})\b(:\d+)?([/?#][\w-.~!$&*+;=:@%/?#(),'\[\]]*)?|\{\{(.+?)\}\}/ig,
		tlds = TLDS.set,
		invalidTags = {
			A: true,
			NOSCRIPT: true,
			OPTION: true,
			SCRIPT: true,
			STYLE: true,
			TEXTAREA: true,
			SVG: true,
			CANVAS: true,
			BUTTON: true,
			SELECT: true,
			TEMPLATE: true,
			METER: true,
			PROGRESS: true,
			MATH: true,
			TIME: true
		};

	function inTLDS(domain) {
		var match = domain.match(/\.([a-z0-9-]+)$/i);
		if (!match) {
			return false;
		}
		return tlds[match[1].toLowerCase()];
	}

	function Pos(cont, offset) {
		this.container = cont;
		this.offset = offset;
	}

	Pos.prototype.add = function(change) {
		var cont = this.container,
			offset = this.offset;

		// If the container is #text.parentNode
		if (cont.childNodes.length) {
			cont = cont.childNodes[offset];
			offset = 0;
		}

		// If the container is #text
		while (cont) {
			if (cont.nodeType == 3) {
				if (!cont.LEN) {
					cont.LEN = cont.nodeValue.length;
				}
				if (offset + change <= cont.LEN) {
					this.container = cont;
					this.offset = offset + change;
					return;
				}
				change = offset + change - cont.LEN;
				offset = 0;
			}
			cont = cont.nextSibling;
		}
	};

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
			// range = document.createRange();
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

	function createFilter(customValidator) {
		return {
			acceptNode: function(node) {
				if (customValidator && !customValidator(node)) {
					return NodeFilter.FILTER_REJECT;
				}
				if (invalidTags[node.nodeName]) {
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

	function cloneContents(range) {
		if (range.startContainer == range.endContainer) {
			return document.createTextNode(range.toString());
		}
		return range.cloneContents();
	}

	function linkifySearch(search, newTab, image, re) {
		var m, mm,
			face, protocol, user, domain, port, path, angular,
			url, range;

		m = re.exec(search.text);

		if (!m) {
			if (search.frag) {
				// if there is something to replace

				// insert the text part
				range = document.createRange();
				range.setStart(search.pos.container, search.pos.offset);
				range.setEnd(search.range.endContainer, search.range.endOffset);
				search.frag.appendChild(cloneContents(range));

				// replace range
				search.range.deleteContents();
				search.range.insertNode(search.frag);
			}
			search.end = true;
			return;
		}

		face = m[0];
		protocol = m[1] || "";
		user = m[2] || "";
		domain = m[3] || "";
		port = m[4] || "";
		path = m[5] || "";
		angular = m[6];

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

			if (!search.frag) {
				search.frag = document.createDocumentFragment();
			}

			// A position to record where the range is working
			range = document.createRange();

			// the text part before search pos
			range.setStart(search.pos.container, search.pos.offset);
			search.pos.add(m.index - search.textIndex);
			range.setEnd(search.pos.container, search.pos.offset);

			search.frag.appendChild(cloneContents(range));

			// the url part
			range.setStart(search.pos.container, search.pos.offset);
			search.pos.add(face.length);
			range.setEnd(search.pos.container, search.pos.offset);

			search.frag.appendChild(createLink(url, cloneContents(range), newTab, image));

			// We have to set lastIndex manually if we had changed face.
			re.lastIndex = m.index + face.length;
			search.textIndex = re.lastIndex;

		} else if (angular && !unsafeWindow.angular) {
			// Next search start after "{{" if there is no window.angular
			re.lastIndex = m.index + 2;
		}

		return true;
	}

	function createSearch(range) {
		return {
			range: range.cloneRange(),
			originalRange: range.cloneRange(),
			text: range.toString(),
			pos: new Pos(range.startContainer, range.startOffset),
			textIndex: 0,
			lastIndex: 0,
			frag: null,
			end: false
		};
	}

	function linkify(root, options) {
		var filter = createFilter(options.validator),
			ranges = generateRanges(root, filter),
			search,
			re = options.unicode ? urlUnicodeRE : urlRE,
			maxRunTime = options.maxRunTime,
			timeout = options.timeout,
			ts = Date.now(), te;

		if (maxRunTime === undefined) {
			maxRunTime = 100;
		}

		if (timeout === undefined) {
			timeout = 10000;
		}

		nextSearch();

		function nextSearch() {
			te = Date.now();

			if (search) {
				re.lastIndex = search.lastIndex;
			}

			do {
				if (!search) {
					// Get new range and reset lastIndex
					var range = ranges.next().value;
					if (!range) {
						break;
					}
					search = createSearch(range);
					re.lastIndex = 0;
				}

				linkifySearch(search, options.newTab, options.image, re);

				if (search.end) {
					search = null;
				}

				// Over script max run time
				if (Date.now() - te > maxRunTime) {
					if (search) {
						search.lastIndex = re.lastIndex;
					}
					requestAnimationFrame(nextSearch);
					return;
				}

			} while (Date.now() - ts < timeout);

			if (search) {
				console.error("Max execution time exceeded: %sms, progress %s%%", Date.now() - ts, (search.lastIndex / search.text.length * 100).toFixed(2));
			}

			if (options.done) {
				options.done();
			}
		}
	}

	return {
		linkify: linkify,
		SKIP_TAGS: invalidTags
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
			if (item.length) {
				que.unshift.apply(que, item);
			}
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

// Valid root node before sending to linkifyplus
function validRoot(node, validator) {
	// Cache valid state in node.VALID
	if (node.VALID !== undefined) {
		return node.VALID;
	}

	// Loop through ancestor
	var cache = [], isValid;
	while (node != document.documentElement) {
		cache.push(node);

		// It is invalid if it has invalid ancestor
		if (!validator(node) || linkify.SKIP_TAGS[node.nodeName]) {
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

function createValidator(skipSelector) {
	return function(node) {
		if (skipSelector && node.matches && node.matches(skipSelector)) {
			return false;
		}
		if (node.contentEditable == "true" || node.contentEditable == "") {
			return false;
		}
		return true;
	}
}

function selectorTest(s, message) {
	try {
		document.documentElement.matches(s);
	} catch (err) {
		console.error("[%s] The selector is invalid", message);
		return "";
	}
	return s;
}

/*********************** Main section start *********************************/

(function(){
	// Limit contentType to "text/plain" or "text/html"
	if (document.contentType != undefined && document.contentType != "text/plain" && document.contentType != "text/html") {
		return;
	}

	var options, que = createQue(queHandler);

	// Recieve item from que
	function queHandler(item, done) {
		if (item instanceof MutationRecord && item.addedNodes.length) {
			// Use target instead of addedNodes. Using addedNodes will break textNode into different range.
			item = item.target;
		}

		if (item instanceof Element) {
			if (options.selector) {
				que.unshift(item.querySelectorAll(options.selector));
			}

			if (validRoot(item, options.validator) || options.selector && item.matches(options.selector)) {
				linkify.linkify(item, {
					image: options.image,
					unicode: options.unicode,
					validator: options.validator,
					newTab: options.newTab,
					maxRunTime: options.maxRunTime,
					timeout: options.timeout,
					done: done
				});
				return;
			}
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
		newTab: {
			label: "Open link in new tab",
			type: "checkbox",
			default: false
		},
		skipSelector: {
			label: "Do not linkify these elements. (CSS selector)",
			type: "textarea",
			default: ".highlight, .editbox, .brush\\:, .bdsug, .spreadsheetinfo"
		},
		selector: {
			label: "Always linkify these elements, override above. (CSS selector)",
			type: "textarea",
			default: ""
		},
		timeout: {
			label: "Max execution time (ms).",
			type: "number",
			default: 10000
		},
		maxRunTime: {
			label: "Max script run time (ms). If the script is freezing your browser, try to decrease this value.",
			type: "number",
			default: 100
		}
	}, function(_options){
		options = _options;
		options.selector = options.selector && selectorTest(options.selector, "Always linkify");
		options.skipSelector = options.skipSelector && selectorTest(options.skipSelector, "Do not linkify");
		options.validator = createValidator(options.skipSelector);
	});

	GM_addStyle(".linkifyplus img { max-width: 90%; }");

	new MutationObserver(function(mutations){
		// Filter out mutations generated by LPP
		var lastRecord = mutations[mutations.length - 1],
			nodes = lastRecord.addedNodes,
			i;

		if (nodes.length >= 2) {
			for (i = 0; i < 2; i++) {
				if (nodes[i].className == "linkifyplus") {
					return;
				}
			}
		}

		// Put mutations into que
		que.push(mutations);

	}).observe(document.body, {
		childList: true,
		subtree: true
	});

	que.push(document.body);

})();
