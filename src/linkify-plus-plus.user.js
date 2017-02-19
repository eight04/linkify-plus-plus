// ==UserScript==
// @name        Linkify Plus Plus
// @version     $inline("../package.json|parse:version")
// @namespace   eight04.blogspot.com
// @description Based on Linkify Plus. Turn plain text URLs into links.
// @include     *
// @exclude     https://www.google.*/search*
// @exclude     https://www.google.*/webhp*
// @exclude     https://music.google.com/*
// @exclude     https://mail.google.com/*
// @exclude     https://docs.google.com/*
// @exclude     https://encrypted.google.com/*
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

var MAX_RUN_TIME = 100;

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

	// $inline.shortcut("tlds", "../tlds.json|parse:$&")
	var RE = {
			PROTOCOL: "([a-z][-a-z*]+://)?",
			USER: "(?:([\\w:.+-]+)@)?",
			DOMAIN_UNI: "([a-z0-9-.\\u00A0-\\uFFFF]+\\.[a-z0-9-$inline('tlds:chars')]{1,$inline('tlds:maxLength')}})",
			DOMAIN: "([a-z0-9-.]+\\.[a-z0-9-]{1,$inline('tlds:maxLength')})",
			PORT: "(:\\d+\\b)?",
			PATH_UNI: "([/?#]\\S*)?",
			PATH: "([/?#][\\w-.~!$&*+;=:@%/?#(),'\\[\\]]*)?",
			MOUSTACHE: "\\{\\{(.+?)\\}\\}"
		},
		TOKENS = ["face", "angular", "prefix", "protocol", "user", "domain", "port", "path", "custom", "suffix"],
		tlds = $inline("tlds:table"),
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

	function reCharsetEscape(text) {
		return text.replace(/[\[\]\\^-]/g, "\\$&");
	}
	
	function buildRe(o) {
		var re = Object.assign({}, RE);
		
		if (o.unicode) {
			re.DOMAIN = re.DOMAIN_UNI;
			re.PATH = re.PATH_UNI;
		}
		
		if (o.customRules && o.customRules.length) {
			re.CUSTOM = "(" + o.customRules.join("|") + ")";
		}
		
		if (o.standalone) {
			if (o.boundaryLeft) {
				re.PREFIX = "((?:^|\\s)[" + reCharsetEscape(o.boundaryLeft) + "]*?)";
			} else {
				re.PREFIX = "(^|\\s)";
			}
			if (o.boundaryRight) {
				re.SUFFIX = "([" + reCharsetEscape(o.boundaryRight) + "]*(?:$|\\s))";
			} else {
				re.SUFFIX = "($|\\s)";
			}
			re.INVALID_SUFFIX = "[^\\s" + reCharsetEscape(o.boundaryRight) + "]";
		} else {
			re.PREFIX = "(^|\\b|_)";
			re.SUFFIX = "()";
		}
		
		var pattern = re.PROTOCOL + re.USER + re.DOMAIN + re.PORT + re.PATH;
		if (re.CUSTOM) {
			pattern = re.PREFIX + "(?:" + pattern + "|" + re.CUSTOM + ")" + re.SUFFIX;
		} else {
			pattern = re.PREFIX + pattern + "()" + re.SUFFIX;
		}
		pattern = re.MOUSTACHE + "|" + pattern;
		
		return {
			url: createRe(pattern, "igm"),
			invalidSuffix: re.INVALID_SUFFIX && createRe(re.INVALID_SUFFIX)
		};
	}

	function inTLDS(domain) {
		var match = domain.match(/\.([^.]+)$/);
		if (!match) {
			return false;
		}
		var key = match[1].toLowerCase();
		return tlds.hasOwnProperty(key);
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
	
	function pathStrip(m, re, repl) {
		var s = m.path.replace(re, repl);

		if (s == m.path) return;
		
		m.end -= m.path.length - s.length;
		m.suffix = m.path.substr(s.length) + m.suffix;
		m.path = s;
	}
	
	function pathStripQuote(m, c) {
		var i = 0, s = m.path, end, pos = 0;
		
		if (!s.endsWith(c)) return;
		
		while ((pos = s.indexOf(c, pos)) >= 0) {
			if (i % 2) {
				end = null;
			} else {
				end = pos;
			}
			pos++;
			i++;
		}
		
		if (!end) return;
		
		m.end -= s.length - end;
		m.path = s.substr(0, end);
		m.suffix = s.substr(end) + m.suffix;
	}

	function pathStripBrace(m, left, right) {
		var str = m.path,
			re = createRe("[\\" + left + "\\" + right + "]", "g"),
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
			return;
		}
		
		m.end -= m.path.length - end;
		m.path = str.substr(0, end);
		m.suffix = str.substr(end) + m.suffix;
	}

	function createLink(url, child, o) {
		var cont = document.createElement("a");
		cont.href = url;
		cont.title = "Linkify Plus Plus";
		if (o.newTab) {
			cont.target = "_blank";
		}
		if (o.useImage && /^[^?#]+\.(?:jpg|png|gif|jpeg)(?:$|[?#])/i.test(url)) {
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
	
	function buildUrlMatch(m) {
		var i;
		for (i = 0; i < TOKENS.length; i++) {
			m[TOKENS[i]] = m[i] || "";
		}
		m.start = m.prefix.length;
		m.end = m.face.length - m.suffix.length;
	}
	
	function validMatch(m, o) {
		if (m.custom) {
			return true;
		}
		
		if (isIP(m.domain)) {
			return o.ip || m.protocol || m.user || /\D/.test(m.path);
		}
		
		if (isDomain(m.domain)) {
			return inTLDS(m.domain);
		}
		
		return false;
	}
	
	function isDomain(d) {
		return /^[^.-]/.test(d) && d.indexOf("..") < 0;
	}
	
	function inMoustache(m) {
		return m.angular || m.prefix.indexOf("{{") >= 0 && m.suffix.indexOf("}}") >= 0;
	}

	function linkifySearch(search, options, re) {
		var m, mm,
			url, range;

		m = re.url.exec(search.text);
		
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
		
		buildUrlMatch(m);
		
		// Redistribute suffix
		if (m.path) {
			// Remove trailing ".,?"
			pathStrip(m, /(^|[^-_])[.,?]+$/, "$1");

			// Strip trailing '
			pathStripQuote(m, "'");
			pathStripQuote(m, '"');
			
			// Strip parens "()"
			pathStripBrace(m, "(", ")");
			pathStripBrace(m, "[", "]");
			pathStripBrace(m, "{", "}");
			
			// Strip BBCode
			pathStrip(m, /\[\/?(b|i|u|url|img|quote|code|size|color)\].*/i, "");
		}
			
		// check suffix
		if (options.standalone && re.invalidSuffix.test(m.suffix)) {
			if (/\s$/.test(m.suffix)) {
				re.url.lastIndex--;
			}
			return;
		}
		
		// Moustache check
		if (inMoustache(m)) {
			if (unsafeWindow.angular || unsafeWindow.Vue) {
				// ignore urls surrounded by {{}}
				return;
			} else {
				// Next search start after "{{" if there is no window.angular
				re.url.lastIndex = m.index + 2;
			}
		}
		
		if (!validMatch(m, options)) {
			return;
		}
		
		if (m.custom) {
			url = m.custom;
			
		} else {
			// Guess protocol
			if (!m.protocol && m.user && (mm = m.user.match(/^mailto:(.+)/))) {
				m.protocol = "mailto:";
				m.user = mm[1];
			}

			if (m.protocol && m.protocol.match(/^(hxxp|h\*\*p|ttp)/)) {
				m.protocol = "http://";
			}

			if (!m.protocol) {
				if ((mm = m.domain.match(/^(ftp|irc)/))) {
					m.protocol = mm[0] + "://";
				} else if (m.domain.match(/^(www|web)/)) {
					m.protocol = "http://";
				} else if (m.user && m.user.indexOf(":") < 0 && !m.path) {
					m.protocol = "mailto:";
				} else {
					m.protocol = "http://";
				}
			}

			// Create URL
			url = m.protocol + (m.user && m.user + "@") + m.domain + m.port + m.path;
		}
		
		if (!search.frag) {
			search.frag = document.createDocumentFragment();
		}
		
		// A position to record where the range is working
		range = document.createRange();

		// the text part before search pos
		range.setStart(search.pos.container, search.pos.offset);
		search.pos.add(m.index + m.start - search.textIndex);
		range.setEnd(search.pos.container, search.pos.offset);

		search.frag.appendChild(cloneContents(range));

		// the url part
		range.setStart(search.pos.container, search.pos.offset);
		search.pos.add(m.end - m.start);
		range.setEnd(search.pos.container, search.pos.offset);

		search.frag.appendChild(createLink(url, cloneContents(range), options));

		// We have to set lastIndex manually if we had changed face.
		if (/\s$/.test(m.suffix)) {
			re.url.lastIndex--;
		}
		search.textIndex = m.index + m.end;
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
			re = buildRe(options),
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
				re.url.lastIndex = search.lastIndex;
			}

			do {
				if (!search) {
					// Get new range and reset lastIndex
					var range = ranges.next().value;
					if (!range) {
						break;
					}
					search = createSearch(range);
					re.url.lastIndex = 0;
				}

				linkifySearch(search, options, re);

				if (search.end) {
					search = null;
				}

				// Over script max run time
				if (Date.now() - te > maxRunTime) {
					if (search) {
						search.lastIndex = re.url.lastIndex;
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

		handler(que.shift(), nextDone);
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
	};
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

function each(list, handler, done) {
	var i = 0, maxRunTime = +MAX_RUN_TIME;

	requestAnimationFrame(next);
	function next() {
		var te = Date.now();
		do {
			if (i >= list.length) {
				if (done) {
					done();
				}
				return;
			}



			handler(list[i++]);
		} while (Date.now() - te < maxRunTime);
		requestAnimationFrame(next);
	}
}

function isArray(item) {
	return typeof item == "object" && Number.isInteger(item.length);
}

/*********************** Main section start *********************************/

(function(){
	// Limit contentType to "text/plain" or "text/html"
	if (document.contentType != undefined && document.contentType != "text/plain" && document.contentType != "text/html") {
		return;
	}

	var options, que = createQue(queHandler);

	function handleArray(item, done) {
		if (item[0] instanceof MutationRecord) {
			each(item, pushRecord, done);
		} else if (item[0] instanceof Element) {
			each(item, pushRoot, done);
		} else {
			console.error("Unknown array", item);
			done();
		}
	}

	function handleElement(item, done) {
		if (options.selector) {
			each(item.querySelectorAll(options.selector), pushRoot, linkifyRoot);
		} else {
			linkifyRoot();
		}

		function linkifyRoot() {
			item.IN_QUE = false;

			if (
				validRoot(item, options.validator) ||
				options.selector &&
				item.matches(options.selector)
			) {
				linkify.linkify(
					item,
					Object.assign({done: done}, options)
				);
			} else {
				done();
			}
		}
	}

	// Recieve item from que
	function queHandler(item, done) {
		if (isArray(item)) {
			if (item.length) {
				handleArray(item, done);
			} else {
				done();
			}
		}

		if (item instanceof Element) {
			handleElement(item, done);
		}
	}

	function pushRoot(root) {
		if (!root.IN_QUE) {
			root.IN_QUE = true;
			que.push(root);
		}
	}

	function pushRecord(record){
		if (record.addedNodes.length) {
			pushRoot(record.target);
		}
	}
	
	function createList(text) {
		text = text.trim();
		if (!text) {
			return null;
		}
		return text.split("\n");
	}

	// Program init
	initConfig({
		ip: {
			label: "Match 4 digits IP",
			type: "checkbox",
			default: true
		},
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
		standalone: {
			label: "URL must be surrounded by whitespace",
			type: "checkbox",
			default: false
		},
		boundaryLeft: {
			label: "Boundary characters between whitespace and URL (left)",
			type: "text",
			default: "{[(\"'"
		},
		boundaryRight: {
			label: "Boundary characters between whitespace and URL (right)",
			type: "text",
			default: "'\")]},.;?!"
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
		},
		customRules: {
			label: "Custom rules. One pattern per line. (RegExp)",
			type: "textarea",
			default: ""
		}
	}, function(_options){
		options = _options;
		options.selector = options.selector && selectorTest(options.selector, "Always linkify");
		options.skipSelector = options.skipSelector && selectorTest(options.skipSelector, "Do not linkify");
		options.validator = createValidator(options.skipSelector);
		options.customRules = options.customRules && createList(options.customRules);
		MAX_RUN_TIME = options.maxRunTime;
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

		if (mutations.length > 100) {
			// Do not use mutations when too big
			pushRoot(document.body);
		} else {
			// Put mutations into que
			que.unshift(mutations);
		}

	}).observe(document.body, {
		childList: true,
		subtree: true
	});

	pushRoot(document.body);

})();
