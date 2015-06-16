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
// @require https://greasyfork.org/scripts/7212-gm-config-eight-s-version/code/GM_config%20(eight's%20version).js?version=56964
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
			label: "Do not linkify url in these classes",
			type: "textarea",
			default: "highlight editbox brush: bdsug spreadsheetinfo"
		},
		generateLog: {
			label: "Generate log",
			type: "checkbox",
			default: false
		},
		openInNewTab: {
			label: "Open link in new tab",
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
	"AC":0,"ACADEMY":0,"ACTIVE":0,"AD":0,"AE":0,"AERO":0,"AF":0,"AG":0,"AGENCY":0,"AI":0,"AL":0,"ALSACE":0,"AM":0,"AN":0,"AO":0,"AQ":0,"AR":1,"ARCHI":0,"ARMY":0,"ARPA":0,"AS":0,"ASIA":0,"ASSOCIATES":0,"AT":0,"AU":2,"AUCTION":0,"AUDIO":0,"AUTOS":0,"AW":0,"AX":0,"AXA":0,"AZ":0,"BA":0,"BAR":0,"BARGAINS":0,"BAYERN":0,"BB":0,"BD":0,"BE":1,"BEER":0,"BERLIN":0,"BEST":0,"BF":0,"BG":0,"BH":0,"BI":0,"BID":0,"BIKE":0,"BIO":0,"BIZ":0,"BJ":0,"BLACK":0,"BLACKFRIDAY":0,"BLUE":0,"BM":0,"BN":0,"BNPPARIBAS":0,"BO":0,"BOUTIQUE":0,"BR":4,"BRUSSELS":0,"BS":0,"BT":0,"BUDAPEST":0,"BUILD":0,"BUILDERS":0,"BUSINESS":0,"BUZZ":0,"BV":0,"BW":0,"BY":0,"BZ":0,"BZH":0,"CA":1,"CAB":0,"CAMERA":0,"CAMP":0,"CAPETOWN":0,"CAPITAL":0,"CARAVAN":0,"CARDS":0,"CARE":0,"CAREERS":0,"CASA":0,"CASH":0,"CAT":0,"CATERING":0,"CC":0,"CD":0,"CENTER":0,"CEO":0,"CERN":0,"CF":0,"CG":0,"CH":1,"CHANNEL":0,"CHRISTMAS":0,"CHURCH":0,"CI":0,"CITY":0,"CK":0,"CL":0,"CLICK":0,"CLINIC":0,"CLOTHING":0,"CLUB":0,"CM":0,"CN":2,"CO":1,"CODES":0,"COFFEE":0,"COLOGNE":0,"COM":13,"COMMUNITY":0,"COMPANY":0,"COMPUTER":0,"CONDOS":0,"CONSTRUCTION":0,"CONSULTING":0,"CONTRACTORS":0,"COOKING":0,"COOL":0,"COOP":0,"COUNTRY":0,"CR":0,"CREDIT":0,"CREDITCARD":0,"CU":0,"CV":0,"CW":0,"CX":0,"CY":0,"CYMRU":0,"CZ":0,"DANCE":0,"DATING":0,"DAY":0,"DE":4,"DEALS":0,"DENTAL":0,"DESI":0,"DIAMONDS":0,"DIET":0,"DIGITAL":0,"DIRECT":0,"DIRECTORY":0,"DISCOUNT":0,"DJ":0,"DK":0,"DM":0,"DO":0,"DOMAINS":0,"DZ":0,"EC":0,"EDU":1,"EDUCATION":0,"EE":0,"EG":0,"EMAIL":0,"ENGINEER":0,"ENGINEERING":0,"ENTERPRISES":0,"EQUIPMENT":0,"ER":0,"ES":0,"ESTATE":0,"ET":0,"EU":0,"EUS":0,"EVENTS":0,"EXCHANGE":0,"EXPERT":0,"EXPOSED":0,"FAIL":0,"FARM":0,"FEEDBACK":0,"FI":0,"FISH":0,"FISHING":0,"FITNESS":0,"FJ":0,"FK":0,"FLORIST":0,"FLY":0,"FM":0,"FO":0,"FOO":0,"FORSALE":0,"FOUNDATION":0,"FR":2,"FRL":0,"FROGANS":0,"FUND":0,"FURNITURE":0,"FUTBOL":0,"GA":0,"GAL":0,"GALLERY":0,"GB":0,"GD":0,"GE":0,"GENT":0,"GF":0,"GG":0,"GH":0,"GI":0,"GIFT":0,"GIFTS":0,"GL":0,"GLASS":0,"GLOBAL":0,"GM":0,"GN":0,"GOP":0,"GOV":0,"GP":0,"GQ":0,"GR":0,"GRAPHICS":0,"GREEN":0,"GS":0,"GT":0,"GU":0,"GUIDE":0,"GURU":0,"GW":0,"GY":0,"HAMBURG":0,"HAUS":0,"HELP":0,"HERE":0,"HIV":0,"HK":0,"HM":0,"HN":0,"HOLDINGS":0,"HOLIDAY":0,"HOMES":0,"HORSE":0,"HOST":0,"HOSTING":0,"HOUSE":0,"HR":0,"HT":0,"HU":0,"ID":0,"IE":0,"IL":0,"IM":0,"IMMO":0,"IN":1,"INDUSTRIES":0,"INFO":0,"INK":0,"INSTITUTE":0,"INSURE":0,"INT":0,"INTERNATIONAL":0,"IO":0,"IQ":0,"IR":0,"IS":0,"IT":3,"JE":0,"JETZT":0,"JM":0,"JO":0,"JOBS":0,"JP":7,"KAUFEN":0,"KE":0,"KG":0,"KH":0,"KI":0,"KIM":0,"KITCHEN":0,"KIWI":0,"KM":0,"KN":0,"KOELN":0,"KP":0,"KR":0,"KRED":0,"KW":0,"KY":0,"KZ":0,"LA":0,"LAND":0,"LB":0,"LC":0,"LEASE":0,"LGBT":0,"LI":0,"LIFE":0,"LIGHTING":0,"LIMITED":0,"LIMO":0,"LINK":0,"LK":0,"LOANS":0,"LONDON":0,"LOTTO":0,"LR":0,"LS":0,"LT":0,"LTDA":0,"LU":0,"LUXE":0,"LV":0,"LY":0,"MA":0,"MAISON":0,"MANAGEMENT":0,"MARKET":0,"MARKETING":0,"MC":0,"MD":0,"ME":0,"MEDIA":0,"MEET":0,"MELBOURNE":0,"MENU":0,"MG":0,"MH":0,"MIAMI":0,"MIL":0,"MK":0,"ML":0,"MM":0,"MN":0,"MO":0,"MOBI":0,"MODA":0,"MOE":0,"MOSCOW":0,"MOTORCYCLES":0,"MP":0,"MQ":0,"MR":0,"MS":0,"MT":0,"MU":0,"MUSEUM":0,"MV":0,"MW":0,"MX":2,"MY":0,"MZ":0,"NA":0,"NAGOYA":0,"NAME":0,"NC":0,"NE":0,"NET":38,"NETWORK":0,"NEUSTAR":0,"NEW":0,"NEXUS":0,"NF":0,"NG":0,"NI":0,"NINJA":0,"NL":1,"NO":0,"NP":0,"NR":0,"NRA":0,"NRW":0,"NU":0,"NYC":0,"NZ":0,"OM":0,"ONG":0,"ONL":0,"OOO":0,"ORG":0,"ORGANIC":0,"OVH":0,"PA":0,"PARIS":0,"PARTNERS":0,"PARTS":0,"PE":0,"PF":0,"PG":0,"PH":0,"PHARMACY":0,"PHOTO":0,"PHOTOGRAPHY":0,"PHOTOS":0,"PICS":0,"PICTURES":0,"PINK":0,"PK":0,"PL":1,"PLACE":0,"PLUMBING":0,"PM":0,"PN":0,"POST":0,"PR":0,"PRAXI":0,"PRESS":0,"PRO":0,"PROD":0,"PRODUCTIONS":0,"PROPERTIES":0,"PS":0,"PT":0,"PUB":0,"PW":0,"PY":0,"QA":0,"QPON":0,"QUEBEC":0,"RE":0,"REALTOR":0,"RECIPES":0,"RED":0,"REISE":0,"REISEN":0,"RENTALS":0,"REPAIR":0,"REPORT":0,"REPUBLICAN":0,"REST":0,"RESTAURANT":0,"REVIEWS":0,"RICH":0,"RIO":0,"RO":0,"ROCKS":0,"RODEO":0,"RS":0,"RU":1,"RUHR":0,"RW":0,"SA":0,"SAARLAND":0,"SARL":0,"SB":0,"SC":0,"SCB":0,"SCOT":0,"SD":0,"SE":1,"SERVICES":0,"SEXY":0,"SG":0,"SH":0,"SHIKSHA":0,"SHOES":0,"SI":0,"SINGLES":0,"SK":0,"SL":0,"SM":0,"SN":0,"SO":0,"SOCIAL":0,"SOFTWARE":0,"SOLAR":0,"SOLUTIONS":0,"SOY":0,"SPACE":0,"SR":0,"ST":0,"SU":0,"SUPPLY":0,"SUPPORT":0,"SURF":0,"SV":0,"SX":0,"SY":0,"SYSTEMS":0,"SZ":0,"TATAR":0,"TATTOO":0,"TAX":0,"TC":0,"TD":0,"TECHNOLOGY":0,"TEL":0,"TF":0,"TG":0,"TH":0,"TIPS":0,"TIROL":0,"TJ":0,"TK":0,"TL":0,"TM":0,"TN":0,"TO":0,"TODAY":0,"TOKYO":0,"TOOLS":0,"TOWN":0,"TP":0,"TR":1,"TRADE":0,"TRAINING":0,"TRAVEL":0,"TT":0,"TV":0,"TW":1,"TZ":0,"UA":0,"UG":0,"UK":1,"UNIVERSITY":0,"UNKNOWN":0,"UNO":0,"US":0,"UY":0,"UZ":0,"VA":0,"VC":0,"VE":0,"VEGAS":0,"VENTURES":0,"VERSICHERUNG":0,"VG":0,"VI":0,"VILLAS":0,"VISION":0,"VLAANDEREN":0,"VN":0,"VODKA":0,"VOTE":0,"VOTING":0,"VOTO":0,"VOYAGE":0,"VU":0,"WANG":0,"WATCH":0,"WEBCAM":0,"WEBSITE":0,"WED":0,"WF":0,"WHOSWHO":0,"WIEN":0,"WIKI":0,"WILLIAMHILL":0,"WORK":0,"WORKS":0,"WORLD":0,"WS":0,"WTF":0,"XN--3DS443G":0,"XN--4GBRIM":0,"XN--55QX5D":0,"XN--6FRZ82G":0,"XN--80ADXHKS":0,"XN--80AO21A":0,"XN--80ASEHDB":0,"XN--80ASWG":0,"XN--C1AVG":0,"XN--D1ACJ3B":0,"XN--FIQ228C5HS":0,"XN--FIQS8S":0,"XN--FIQZ9S":0,"XN--I1B6B1A6A2E":0,"XN--J1AMH":0,"XN--J6W193G":0,"XN--KPRY57D":0,"XN--KPUT3I":0,"XN--MGBAAM7A8H":0,"XN--MGBERP4A5D4AR":0,"XN--NGBC5AZD":0,"XN--NQV7F":0,"XN--NQV7FS00EMA":0,"XN--P1ACF":0,"XN--P1AI":0,"XN--Q9JYB4C":0,"XN--RHQV96G":0,"XN--SES554G":0,"XXX":0,"XYZ":0,"YACHTS":0,"YANDEX":0,"YE":0,"YOKOHAMA":0,"YT":0,"ZA":0,"ZM":0,"ZONE":0,"ZW":0
};

function valid(node) {
	var className = node.className;
	if (typeof className == "object") {
		className = className.baseVal;
	}
	if (re.excludingTag.test(node.nodeName)) {
		return false;
	}
	if (className && re.excludingClass.test(className)) {
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
		timeout,
		time;

	function start() {
		if (running) {
			return;
		}
		running = true;
		time = Date.now();
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
		if (config.generateLog) {
			console.log("Thread stop. Elapsed " + (Date.now() - time) + "ms");
		}
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
			if (que[0]) {
				que[0].IN_QUE = false;
			}
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
		'a', 'noscript', 'option', 'script', 'style', 'textarea', "svg", "canvas", "button", "select", "template", "meter", "progress", "math", "h1", "h2", "h3", "h4", "h5", "h6", "time"
	];

	var excludingClass = getArray(config.classBlackList);

	re = {
		excludingTag: new RegExp("^(" + excludingTag.join("|") + ")$", "i"),
		excludingClass: new RegExp("(^|\\s)(" + excludingClass.join("|") + ")($|\\s)")
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

GM_addStyle(".embedme-image{max-width:100%}.embedme-video{max-width:@ytWidthpx}.embedme-video-wrap{position:relative;padding-top:30px;padding-bottom:@ytRatio%}.embedme-video-iframe{position:absolute;top:0;left:0;width:100%;height:100%}");

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
