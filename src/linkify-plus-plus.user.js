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
// @require https://greasyfork.org/scripts/7212-gm-config-eight-s-version/code/GM_config%20(eight's%20version).js?version=156587
// @grant       GM_addStyle
// @grant       GM_registerMenuCommand
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       unsafeWindow
// @compatible  firefox
// @compatible  chrome
// @compatible  opera
// ==/UserScript==

(function(){

var Linkifier = function(){
	// $inline.shortcut("tlds", "../tlds.json|parse:$&")
	var RE = {
			PROTOCOL: "([a-z][-a-z*]+://)?",
			USER: "(?:([\\w:.+-]+)@)?",
			DOMAIN_UNI: "([a-z0-9-.\\u00A0-\\uFFFF]+\\.[a-z0-9-$inline('tlds:chars')]{1,$inline('tlds:maxLength')})",
			DOMAIN: "([a-z0-9-.]+\\.[a-z0-9-]{1,$inline('tlds:maxLength')})",
			PORT: "(:\\d+\\b)?",
			PATH_UNI: "([/?#]\\S*)?",
			PATH: "([/?#][\\w-.~!$&*+;=:@%/?#(),'\\[\\]]*)?",
			MUSTACHE: "\\{\\{.+?\\}\\}"
		},
		TLD_TABLE = $inline("tlds:table|stringify");

	function regexEscape(text) {
		return text.replace(/[\[\]\\^-]/g, "\\$&");
	}
	
	function regexClone(regex) {
		var flags = "";
		if (regex.global) flags += "g";
		if (regex.multiline) flags += "m";
		if (regex.ignoreCase) flags += "i";
		return new RegExp(regex.source, flags);
	}
	
	function buildRegex({
		unicode = false, customRules = [], standalone = false,
		boundaryLeft, boundaryRight
	}) {
		var pattern = RE.PROTOCOL + RE.USER;
		
		if (unicode) {
			pattern += RE.DOMAIN_UNI + RE.PORT + RE.PATH_UNI;
		} else {
			pattern += RE.DOMAIN + RE.PORT + RE.PATH;
		}
		
		if (customRules.length) {
			pattern = "(?:" + pattern + "|(" + customRules.join("|") + "))";
		} else {
			pattern += "()";
		}
		
		var prefix, suffix, invalidSuffix;
		if (standalone) {
			if (boundaryLeft) {
				prefix = "((?:^|\\s)[" + regexEscape(boundaryLeft) + "]*?)";
			} else {
				prefix = "(^|\\s)";
			}
			if (boundaryRight) {
				suffix = "([" + regexEscape(boundaryRight) + "]*(?:$|\\s))";
			} else {
				suffix = "($|\\s)";
			}
			invalidSuffix = "[^\\s" + regexEscape(boundaryRight) + "]";
		} else {
			prefix = "(^|\\b|_)";
			suffix = "()";
		}
		
		pattern = prefix + pattern + suffix;
		
		return {
			url: new RegExp(pattern, "igm"),
			invalidSuffix: invalidSuffix && new RegExp(invalidSuffix),
			mustache: new RegExp(RE.MUSTACHE, "g")
		};
	}

	function pathStrip(m, re, repl) {
		var s = m.path.replace(re, repl);

		if (s == m.path) return;
		
		m.end -= m.path.length - s.length;
		m.suffix = m.path.slice(s.length) + m.suffix;
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
		m.path = s.slice(0, end);
		m.suffix = s.slice(end) + m.suffix;
	}

	function pathStripBrace(m, left, right) {
		var str = m.path,
			re = new RegExp("[\\" + left + "\\" + right + "]", "g"),
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
		m.path = str.slice(0, end);
		m.suffix = str.slice(end) + m.suffix;
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
	
	function isDomain(d) {
		return /^[^.-]/.test(d) && d.indexOf("..") < 0;
	}
	
	function inTLDS(domain) {
		var match = domain.match(/\.([^.]+)$/);
		if (!match) {
			return false;
		}
		var key = match[1].toLowerCase();
		return TLD_TABLE.hasOwnProperty(key);
	}

	class Linkifier {
		constructor(options) {
			this.config(options);
		}
		
		config({
			fuzzyIp = true, ignoreMustache = false,
			unicode, customRules, standalone, boundaryLeft, boundaryRight
		} = {}) {
			this.fuzzyIp = fuzzyIp;
			this.ignoreMustache = ignoreMustache;
			this.regex = buildRegex({
				unicode, customRules, standalone, boundaryLeft, boundaryRight
			});
		}
		
		*parse(text) {
			var {url, invalidSuffix, mustache} = this.regex;
				
			var mustacheMatch, mustacheRange;
			if (this.ignoreMustache) {
				mustache = regexClone(mustache);
				mustacheMatch = mustache.exec(text);
				if (mustacheMatch) {
					mustacheRange = {
						start: mustacheMatch.index,
						end: mustache.lastIndex
					};
				}
			}
			
			var urlMatch;
			url = regexClone(url);
			while ((urlMatch = url.exec(text))) {
				var result;
				if (urlMatch[7]) {
					// custom rules
					result = {
						start: urlMatch.index,
						end: url.lastIndex,
						
						text: urlMatch[0],
						url: urlMatch[0],
						
						custom: urlMatch[7]
					};
				} else {
					result = {
						start: urlMatch.index + urlMatch[1].length,
						end: url.lastIndex - urlMatch[8].length,
						
						text: null,
						url: null,
						
						prefix: urlMatch[1],
						protocol: urlMatch[2],
						user: urlMatch[3] || "",
						domain: urlMatch[4],
						port: urlMatch[5] || "",
						path: urlMatch[6] || "",
						custom: urlMatch[7],
						suffix: urlMatch[8]
					};
				}
				
				if (mustacheRange && mustacheRange.end <= result.start) {
					mustacheMatch = mustache.exec(text);
					if (mustacheMatch) {
						mustacheRange.start = mustacheMatch.index;
						mustacheRange.end = mustache.lastIndex;
					} else {
						mustacheRange = null;
					}
				}
				
				// ignore urls inside mustache pair
				if (mustacheRange && result.start < mustacheRange.end && result.end >= mustacheRange.start) {
					continue;
				}
				
				if (!result.custom) {
					// adjust path and suffix
					if (result.path) {
						// Strip BBCode
						pathStrip(result, /\[\/?(b|i|u|url|img|quote|code|size|color)\].*/i, "");
						
						// Strip braces
						pathStripBrace(result, "(", ")");
						pathStripBrace(result, "[", "]");
						pathStripBrace(result, "{", "}");
						
						// Strip quotes
						pathStripQuote(result, "'");
						pathStripQuote(result, '"');
						
						// Remove trailing ".,?"
						pathStrip(result, /(^|[^-_])[.,?]+$/, "$1");
					}
					
					// check suffix
					if (invalidSuffix && invalidSuffix.test(result.suffix)) {
						if (/\s$/.test(result.suffix)) {
							url.lastIndex--;
						}
						continue;
					}
					
					// check domain
					if (isIP(result.domain)) {
						if (!this.fuzzyIp && !result.protocol && !result.user && !result.path) {
							continue;
						}
					} else if (isDomain(result.domain)) {
						if (!inTLDS(result.domain)) {
							continue;
						}
					} else {
						continue;
					}
					
					// mailto protocol
					if (!result.protocol && result.user) {
						var matchMail = result.user.match(/^mailto:(.+)/);
						if (matchMail) {
							result.protocol = "mailto:";
							result.user = matchMail[1];
						}
					}

					// http alias
					if (result.protocol && result.protocol.match(/^(hxxp|h\*\*p|ttp)/)) {
						result.protocol = "http://";
					}

					// guess protocol
					if (!result.protocol) {
						var domainMatch;
						if ((domainMatch = result.domain.match(/^(ftp|irc)/))) {
							result.protocol = domainMatch[0] + "://";
						} else if (result.domain.match(/^(www|web)/)) {
							result.protocol = "http://";
						} else if (result.user && result.user.indexOf(":") < 0 && !result.path) {
							result.protocol = "mailto:";
						} else {
							result.protocol = "http://";
						}
					}

					// Create URL
					result.url = result.protocol + (result.user && result.user + "@") + result.domain + result.port + result.path;
					result.text = text.slice(result.start, result.end);
				}
				
				yield result;
			}
		}
	}
	
	return Linkifier;
}();

// Linkify Plus Plus core
var linkify = function(){
	
	class Pos {
		constructor(container, offset, i = 0) {
			this.container = container;
			this.offset = offset;
			this.i = i;
		}
		
		add(change) {
			var cont = this.container,
				offset = this.offset;

			this.i += change;
			
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
		}
		
		moveTo(offset) {
			this.add(offset - this.i);
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
			// range = document.createRange();
			range.setStartBefore(start);
		}
		range.setEndAfter(end);
		yield range;
	}

	function createFilter(customValidator) {
		return {
			acceptNode: function(node) {
				if (customValidator && !customValidator(node)) {
					return NodeFilter.FILTER_REJECT;
				}
				if (INVALID_TAGS[node.nodeName]) {
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
	
	return function(root, {
		linkifier, validator, maxRunTime = 100, timeout = 10000,
		newTab = true, embedImage = true
	}) {
		var filter = createFilter(validator),
			ranges = generateRanges(root, filter),
			linkifyStart = Date.now();
			
		function* createChunks() {
			for (var range of ranges) {
				var frag = null,
					pos = null,
					text = range.toString(),
					textRange = null;
				for (var result of linkifier.parse(text)) {
					if (!frag) {
						frag = document.createDocumentFragment();
						pos = new Pos(range.startContainer, range.startOffset);
						textRange = range.cloneRange();
					}
					// clone text
					pos.moveTo(result.start);
					textRange.setEnd(pos.container, pos.offset);
					frag.appendChild(cloneContents(textRange));
					
					// clone link
					textRange.collapse();
					pos.moveTo(result.end);
					textRange.setEnd(pos.container, pos.offset);

					var link = document.createElement("a");
					link.href = result.url;
					link.title = "Linkify Plus Plus";
					link.className = "linkifyplus";
					if (newTab) {
						link.target = "_blank";
					}
					var child;
					if (embedImage && /^[^?#]+\.(?:jpg|png|gif|jpeg)(?:$|[?#])/i.test(result.url)) {
						child = new Image;
						child.src = result.url;
						child.alt = result.text;
					} else {
						child = cloneContents(textRange);
					}
					link.appendChild(child);
					
					textRange.collapse();

					frag.appendChild(link);
					yield;
				}
				if (pos) {
					pos.moveTo(text.length);
					textRange.setEnd(pos.container, pos.offset);
					frag.appendChild(cloneContents(textRange));
					
					range.deleteContents();
					range.insertNode(frag);
				}
				yield;
			}
		}
		
		return new Promise(resolve => {
			var chunks = createChunks();
			function next(){
				var timeStart = Date.now(),
					now;
				do {
					if (chunks.next().done) {
						console.log(`Linkify finished in ${Date.now() - linkifyStart}ms`);
						resolve();
						return;
					}
				} while ((now = Date.now()) - timeStart < maxRunTime);
				
				if (now - linkifyStart > timeout) {
					console.log(`Max execution time exceeded: ${now - linkifyStart}ms`, root);
					resolve();
					return;
				}
				
				requestAnimationFrame(next);
			}
			requestAnimationFrame(next);
		});
	};
}();

var INVALID_TAGS = {
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

// Valid root node before linkifing
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
		if (!validator(node) || INVALID_TAGS[node.nodeName]) {
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

function selectorTest(selector) {
	try {
		document.documentElement.matches(selector);
	} catch (err) {
		alert(`[Linkify Plus Plus] the selector is invalid: ${selector}`);
		return false;
	}
	return true;
}

function createList(text) {
	text = text.trim();
	if (!text) {
		return null;
	}
	return text.split("\n");
}

// Limit contentType to "text/plain" or "text/html"
if (document.contentType != undefined && document.contentType != "text/plain" && document.contentType != "text/html") {
	return;
}

var options;

function linkifyRoot(root) {
	if (!validRoot(root, options.validator) && (!options.selector || !root.matches(options.selector))) {
		return;
	}
	
	if (root.LINKIFY) {
		root.LINKIFY_PENDING = true;
		return;
	}
	root.LINKIFY = true;
	
	linkify(root, options).then(() => {
		var p = Promise.resolve();
		if (options.selector) {
			for (var node of root.querySelectorAll(options.selector)) {
				p = p.then(linkify.bind(null, node, options));
			}
		}
		p.then(() => {
			root.LINKIFY = false;
			if (root.LINKIFY_PENDING) {
				root.LINKIFY_PENDING = false;
				linkifyRoot(root);
			}
		});
	});
}

// Program init
GM_config.setup({
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
}, function() {
	options = GM_config.get();
	if (options.selector && !selectorTest(options.selector)) {
		options.selector = null;
	}
	if (options.skipSelector && !selectorTest(options.skipSelector)) {
		options.skipSelector = null;
	}
	if (options.customRules) {
		options.customRules = createList(options.customRules);
	}
	options.validator = createValidator(options.skipSelector);
	options.fuzzyIp = options.ip;
	options.ignoreMustache = unsafeWindow.angular || unsafeWindow.Vue;
	options.embedImage = options.image;
	options.linkifier = new Linkifier(options);
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
		linkifyRoot(document.body);
	} else {
		for (var record of mutations) {
			if (record.addedNodes) {
				linkifyRoot(record.target);
			}
		}
	}

}).observe(document.body, {
	childList: true,
	subtree: true
});

linkifyRoot(document.body);

})();