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
	"AC":true,"ACADEMY":false,"ACTIVE":false,"AD":true,"AE":true,"AERO":true,"AF":true,"AG":true,"AGENCY":false,"AI":true,"AL":true,"ALSACE":false,"AM":true,"AN":true,"AO":true,"AQ":true,"AR":true,"ARCHI":false,"ARMY":false,"ARPA":true,"AS":true,"ASIA":true,"ASSOCIATES":false,"AT":true,"AU":true,"AUCTION":false,"AUDIO":false,"AUTOS":false,"AW":true,"AX":true,"AXA":false,"AZ":true,"BA":true,"BAR":false,"BARGAINS":false,"BAYERN":false,"BB":true,"BD":true,"BE":true,"BEER":false,"BERLIN":false,"BEST":false,"BF":true,"BG":true,"BH":true,"BI":true,"BID":false,"BIKE":false,"BIO":false,"BIZ":true,"BJ":true,"BLACK":false,"BLACKFRIDAY":false,"BLUE":false,"BM":true,"BN":true,"BNPPARIBAS":false,"BO":true,"BOUTIQUE":false,"BR":true,"BRUSSELS":false,"BS":true,"BT":true,"BUDAPEST":false,"BUILD":false,"BUILDERS":false,"BUSINESS":false,"BUZZ":false,"BV":false,"BW":true,"BY":true,"BZ":true,"BZH":false,"CA":true,"CAB":false,"CAMERA":false,"CAMP":true,"CAPETOWN":false,"CAPITAL":false,"CARAVAN":false,"CARDS":false,"CARE":false,"CAREERS":false,"CASA":false,"CASH":false,"CAT":true,"CATERING":false,"CC":true,"CD":true,"CENTER":true,"CEO":false,"CERN":false,"CF":true,"CG":false,"CH":true,"CHANNEL":false,"CHRISTMAS":false,"CHURCH":false,"CI":true,"CITY":false,"CK":true,"CL":true,"CLICK":false,"CLINIC":false,"CLOTHING":false,"CLUB":true,"CM":true,"CN":true,"CO":true,"CODES":false,"COFFEE":false,"COLOGNE":false,"COM":true,"COMMUNITY":false,"COMPANY":false,"COMPUTER":false,"CONDOS":false,"CONSTRUCTION":false,"CONSULTING":false,"CONTRACTORS":false,"COOKING":false,"COOL":false,"COOP":true,"COUNTRY":false,"CR":true,"CREDIT":false,"CREDITCARD":false,"CU":true,"CV":true,"CW":true,"CX":true,"CY":true,"CYMRU":false,"CZ":true,"DANCE":false,"DATING":false,"DAY":false,"DE":true,"DEALS":false,"DENTAL":false,"DESI":false,"DIAMONDS":false,"DIET":false,"DIGITAL":false,"DIRECT":false,"DIRECTORY":false,"DISCOUNT":false,"DJ":true,"DK":true,"DM":true,"DO":true,"DOMAINS":false,"DZ":true,"EC":true,"EDU":true,"EDUCATION":false,"EE":true,"EG":true,"EMAIL":true,"ENGINEER":false,"ENGINEERING":false,"ENTERPRISES":false,"EQUIPMENT":false,"ER":true,"ES":true,"ESTATE":false,"ET":true,"EU":true,"EUS":false,"EVENTS":false,"EXCHANGE":true,"EXPERT":false,"EXPOSED":false,"FAIL":false,"FARM":false,"FEEDBACK":false,"FI":true,"FISH":false,"FISHING":false,"FITNESS":false,"FJ":true,"FK":true,"FLORIST":false,"FLY":false,"FM":true,"FO":true,"FOO":false,"FORSALE":false,"FOUNDATION":false,"FR":true,"FRL":false,"FROGANS":false,"FUND":false,"FURNITURE":false,"FUTBOL":false,"GA":true,"GAL":false,"GALLERY":false,"GB":false,"GD":true,"GE":true,"GENT":false,"GF":true,"GG":true,"GH":true,"GI":true,"GIFT":false,"GIFTS":false,"GL":true,"GLASS":false,"GLOBAL":true,"GM":true,"GN":false,"GOP":false,"GOV":true,"GP":true,"GQ":true,"GR":true,"GRAPHICS":false,"GREEN":false,"GS":true,"GT":true,"GU":false,"GUIDE":false,"GURU":true,"GW":false,"GY":true,"HAMBURG":false,"HAUS":false,"HELP":false,"HERE":false,"HIV":false,"HK":true,"HM":true,"HN":true,"HOLDINGS":false,"HOLIDAY":false,"HOMES":false,"HORSE":false,"HOST":true,"HOSTING":true,"HOUSE":false,"HR":true,"HT":true,"HU":true,"ID":true,"IE":true,"IL":true,"IM":true,"IMMO":false,"IN":true,"INDUSTRIES":false,"INFO":true,"INK":false,"INSTITUTE":false,"INSURE":false,"INT":true,"INTERNATIONAL":false,"IO":true,"IQ":false,"IR":true,"IS":true,"IT":true,"JE":true,"JETZT":false,"JM":true,"JO":true,"JOBS":false,"JP":true,"KAUFEN":false,"KE":true,"KG":true,"KH":true,"KI":false,"KIM":false,"KITCHEN":false,"KIWI":false,"KM":false,"KN":false,"KOELN":false,"KP":false,"KR":true,"KRED":false,"KW":true,"KY":true,"KZ":true,"LA":true,"LAND":false,"LB":true,"LC":true,"LEASE":false,"LGBT":false,"LI":true,"LIFE":false,"LIGHTING":false,"LIMITED":false,"LIMO":false,"LINK":true,"LK":true,"LOANS":false,"LONDON":true,"LOTTO":false,"LR":true,"LS":true,"LT":true,"LTDA":false,"LU":true,"LUXE":false,"LV":true,"LY":true,"MA":true,"MAISON":false,"MANAGEMENT":false,"MARKET":false,"MARKETING":false,"MC":true,"MD":true,"ME":true,"MEDIA":false,"MEET":false,"MELBOURNE":false,"MENU":false,"MG":true,"MH":true,"MIAMI":false,"MIL":true,"MK":true,"ML":true,"MM":true,"MN":true,"MO":true,"MOBI":true,"MODA":false,"MOE":true,"MOSCOW":false,"MOTORCYCLES":false,"MP":false,"MQ":false,"MR":false,"MS":true,"MT":true,"MU":true,"MUSEUM":false,"MV":true,"MW":true,"MX":true,"MY":true,"MZ":true,"NA":true,"NAGOYA":false,"NAME":true,"NC":true,"NE":true,"NET":true,"NETWORK":true,"NEUSTAR":false,"NEW":false,"NEXUS":false,"NF":true,"NG":true,"NI":true,"NINJA":true,"NL":true,"NO":true,"NP":true,"NR":true,"NRA":false,"NRW":false,"NU":true,"NYC":false,"NZ":true,"OM":true,"ONG":false,"ONL":false,"OOO":false,"ORG":true,"ORGANIC":false,"OVH":true,"PA":true,"PARIS":false,"PARTNERS":false,"PARTS":false,"PE":true,"PF":true,"PG":true,"PH":true,"PHARMACY":false,"PHOTO":false,"PHOTOGRAPHY":false,"PHOTOS":false,"PICS":false,"PICTURES":false,"PINK":false,"PK":true,"PL":true,"PLACE":false,"PLUMBING":false,"PM":true,"PN":false,"POST":false,"PR":true,"PRAXI":false,"PRESS":false,"PRO":true,"PROD":true,"PRODUCTIONS":false,"PROPERTIES":false,"PS":true,"PT":true,"PUB":false,"PW":true,"PY":true,"QA":true,"QPON":false,"QUEBEC":false,"RE":true,"REALTOR":false,"RECIPES":false,"RED":true,"REISE":false,"REISEN":false,"RENTALS":false,"REPAIR":false,"REPORT":false,"REPUBLICAN":false,"REST":false,"RESTAURANT":false,"REVIEWS":false,"RICH":false,"RIO":false,"RO":true,"ROCKS":true,"RODEO":false,"RS":true,"RU":true,"RUHR":false,"RW":true,"SA":true,"SAARLAND":false,"SARL":false,"SB":true,"SC":true,"SCB":false,"SCOT":false,"SD":true,"SE":true,"SERVICES":false,"SEXY":false,"SG":true,"SH":true,"SHIKSHA":false,"SHOES":false,"SI":true,"SINGLES":false,"SK":true,"SL":true,"SM":true,"SN":true,"SO":true,"SOCIAL":false,"SOFTWARE":false,"SOLAR":false,"SOLUTIONS":true,"SOY":false,"SPACE":false,"SR":true,"ST":true,"SU":true,"SUPPLY":false,"SUPPORT":false,"SURF":false,"SV":true,"SX":true,"SY":true,"SYSTEMS":true,"SZ":true,"TATAR":false,"TATTOO":false,"TAX":false,"TC":true,"TD":false,"TECHNOLOGY":true,"TEL":false,"TF":true,"TG":true,"TH":true,"TIPS":false,"TIROL":false,"TJ":true,"TK":true,"TL":true,"TM":true,"TN":true,"TO":true,"TODAY":false,"TOKYO":false,"TOOLS":false,"TOWN":false,"TP":true,"TR":true,"TRADE":false,"TRAINING":false,"TRAVEL":true,"TT":true,"TV":true,"TW":true,"TZ":true,"UA":true,"UG":true,"UK":true,"UNIVERSITY":false,"UNKNOWN":true,"UNO":false,"US":true,"UY":true,"UZ":true,"VA":true,"VC":true,"VE":true,"VEGAS":false,"VENTURES":false,"VERSICHERUNG":false,"VG":true,"VI":true,"VILLAS":false,"VISION":false,"VLAANDEREN":false,"VN":true,"VODKA":false,"VOTE":false,"VOTING":false,"VOTO":false,"VOYAGE":false,"VU":true,"WANG":false,"WATCH":false,"WEBCAM":false,"WEBSITE":true,"WED":false,"WF":true,"WHOSWHO":false,"WIEN":false,"WIKI":false,"WILLIAMHILL":false,"WORK":false,"WORKS":false,"WORLD":false,"WS":true,"WTF":false,"XN--3DS443G":false,"XN--4GBRIM":false,"XN--55QX5D":false,"XN--6FRZ82G":false,"XN--80ADXHKS":false,"XN--80AO21A":false,"XN--80ASEHDB":false,"XN--80ASWG":false,"XN--C1AVG":false,"XN--D1ACJ3B":false,"XN--FIQ228C5HS":false,"XN--FIQS8S":false,"XN--FIQZ9S":false,"XN--I1B6B1A6A2E":false,"XN--J1AMH":false,"XN--J6W193G":false,"XN--KPRY57D":false,"XN--KPUT3I":false,"XN--MGBAAM7A8H":false,"XN--MGBERP4A5D4AR":false,"XN--NGBC5AZD":false,"XN--NQV7F":false,"XN--NQV7FS00EMA":false,"XN--P1ACF":false,"XN--P1AI":true,"XN--Q9JYB4C":false,"XN--RHQV96G":false,"XN--SES554G":false,"XXX":true,"XYZ":true,"YACHTS":false,"YANDEX":false,"YE":true,"YOKOHAMA":false,"YT":false,"ZA":true,"ZM":true,"ZONE":true,"ZW":true
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
