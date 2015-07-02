// ==UserScript==
// @name        Linkify Plus Plus
// @version     6.0.0
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
	tlds = {"ac":0,"academy":0,"active":0,"ad":0,"ae":0,"aero":0,"af":0,"ag":0,"agency":0,"ai":0,"al":0,"alsace":0,"am":0,"an":0,"ao":0,"aq":0,"ar":1,"archi":0,"army":0,"arpa":0,"as":0,"asia":0,"associates":0,"at":0,"au":2,"auction":0,"audio":0,"autos":0,"aw":0,"ax":0,"axa":0,"az":0,"ba":0,"bar":0,"bargains":0,"bayern":0,"bb":0,"bd":0,"be":1,"beer":0,"berlin":0,"best":0,"bf":0,"bg":0,"bh":0,"bi":0,"bid":0,"bike":0,"bio":0,"biz":0,"bj":0,"black":0,"blackfriday":0,"blue":0,"bm":0,"bn":0,"bnpparibas":0,"bo":0,"boutique":0,"br":4,"brussels":0,"bs":0,"bt":0,"budapest":0,"build":0,"builders":0,"business":0,"buzz":0,"bv":0,"bw":0,"by":0,"bz":0,"bzh":0,"ca":1,"cab":0,"camera":0,"camp":0,"capetown":0,"capital":0,"caravan":0,"cards":0,"care":0,"careers":0,"casa":0,"cash":0,"cat":0,"catering":0,"cc":0,"cd":0,"center":0,"ceo":0,"cern":0,"cf":0,"cg":0,"ch":1,"channel":0,"christmas":0,"church":0,"ci":0,"city":0,"ck":0,"cl":0,"click":0,"clinic":0,"clothing":0,"club":0,"cm":0,"cn":2,"co":1,"codes":0,"coffee":0,"cologne":0,"com":13,"community":0,"company":0,"computer":0,"condos":0,"construction":0,"consulting":0,"contractors":0,"cooking":0,"cool":0,"coop":0,"country":0,"cr":0,"credit":0,"creditcard":0,"cu":0,"cv":0,"cw":0,"cx":0,"cy":0,"cymru":0,"cz":0,"dance":0,"dating":0,"day":0,"de":4,"deals":0,"dental":0,"desi":0,"diamonds":0,"diet":0,"digital":0,"direct":0,"directory":0,"discount":0,"dj":0,"dk":0,"dm":0,"do":0,"domains":0,"dz":0,"ec":0,"edu":1,"education":0,"ee":0,"eg":0,"email":0,"engineer":0,"engineering":0,"enterprises":0,"equipment":0,"er":0,"es":0,"estate":0,"et":0,"eu":0,"eus":0,"events":0,"exchange":0,"expert":0,"exposed":0,"fail":0,"farm":0,"feedback":0,"fi":0,"fish":0,"fishing":0,"fitness":0,"fj":0,"fk":0,"florist":0,"fly":0,"fm":0,"fo":0,"foo":0,"forsale":0,"foundation":0,"fr":2,"frl":0,"frogans":0,"fund":0,"furniture":0,"futbol":0,"ga":0,"gal":0,"gallery":0,"gb":0,"gd":0,"ge":0,"gent":0,"gf":0,"gg":0,"gh":0,"gi":0,"gift":0,"gifts":0,"gl":0,"glass":0,"global":0,"gm":0,"gn":0,"gop":0,"gov":0,"gp":0,"gq":0,"gr":0,"graphics":0,"green":0,"gs":0,"gt":0,"gu":0,"guide":0,"guru":0,"gw":0,"gy":0,"hamburg":0,"haus":0,"help":0,"here":0,"hiv":0,"hk":0,"hm":0,"hn":0,"holdings":0,"holiday":0,"homes":0,"horse":0,"host":0,"hosting":0,"house":0,"hr":0,"ht":0,"hu":0,"id":0,"ie":0,"il":0,"im":0,"immo":0,"in":1,"industries":0,"info":0,"ink":0,"institute":0,"insure":0,"int":0,"international":0,"io":0,"iq":0,"ir":0,"is":0,"it":3,"je":0,"jetzt":0,"jm":0,"jo":0,"jobs":0,"jp":7,"kaufen":0,"ke":0,"kg":0,"kh":0,"ki":0,"kim":0,"kitchen":0,"kiwi":0,"km":0,"kn":0,"koeln":0,"kp":0,"kr":0,"kred":0,"kw":0,"ky":0,"kz":0,"la":0,"land":0,"lb":0,"lc":0,"lease":0,"lgbt":0,"li":0,"life":0,"lighting":0,"limited":0,"limo":0,"link":0,"lk":0,"loans":0,"london":0,"lotto":0,"lr":0,"ls":0,"lt":0,"ltda":0,"lu":0,"luxe":0,"lv":0,"ly":0,"ma":0,"maison":0,"management":0,"market":0,"marketing":0,"mc":0,"md":0,"me":0,"media":0,"meet":0,"melbourne":0,"menu":0,"mg":0,"mh":0,"miami":0,"mil":0,"mk":0,"ml":0,"mm":0,"mn":0,"mo":0,"mobi":0,"moda":0,"moe":0,"moscow":0,"motorcycles":0,"mp":0,"mq":0,"mr":0,"ms":0,"mt":0,"mu":0,"museum":0,"mv":0,"mw":0,"mx":2,"my":0,"mz":0,"na":0,"nagoya":0,"name":0,"nc":0,"ne":0,"net":38,"network":0,"neustar":0,"new":0,"nexus":0,"nf":0,"ng":0,"ni":0,"ninja":0,"nl":1,"no":0,"np":0,"nr":0,"nra":0,"nrw":0,"nu":0,"nyc":0,"nz":0,"om":0,"ong":0,"onl":0,"ooo":0,"org":0,"organic":0,"ovh":0,"pa":0,"paris":0,"partners":0,"parts":0,"pe":0,"pf":0,"pg":0,"ph":0,"pharmacy":0,"photo":0,"photography":0,"photos":0,"pics":0,"pictures":0,"pink":0,"pk":0,"pl":1,"place":0,"plumbing":0,"pm":0,"pn":0,"post":0,"pr":0,"praxi":0,"press":0,"pro":0,"prod":0,"productions":0,"properties":0,"ps":0,"pt":0,"pub":0,"pw":0,"py":0,"qa":0,"qpon":0,"quebec":0,"re":0,"realtor":0,"recipes":0,"red":0,"reise":0,"reisen":0,"rentals":0,"repair":0,"report":0,"republican":0,"rest":0,"restaurant":0,"reviews":0,"rich":0,"rio":0,"ro":0,"rocks":0,"rodeo":0,"rs":0,"ru":1,"ruhr":0,"rw":0,"sa":0,"saarland":0,"sarl":0,"sb":0,"sc":0,"scb":0,"scot":0,"sd":0,"se":1,"services":0,"sexy":0,"sg":0,"sh":0,"shiksha":0,"shoes":0,"si":0,"singles":0,"sk":0,"sl":0,"sm":0,"sn":0,"so":0,"social":0,"software":0,"solar":0,"solutions":0,"soy":0,"space":0,"sr":0,"st":0,"su":0,"supply":0,"support":0,"surf":0,"sv":0,"sx":0,"sy":0,"systems":0,"sz":0,"tatar":0,"tattoo":0,"tax":0,"tc":0,"td":0,"technology":0,"tel":0,"tf":0,"tg":0,"th":0,"tips":0,"tirol":0,"tj":0,"tk":0,"tl":0,"tm":0,"tn":0,"to":0,"today":0,"tokyo":0,"tools":0,"town":0,"tp":0,"tr":1,"trade":0,"training":0,"travel":0,"tt":0,"tv":0,"tw":1,"tz":0,"ua":0,"ug":0,"uk":1,"university":0,"unknown":0,"uno":0,"us":0,"uy":0,"uz":0,"va":0,"vc":0,"ve":0,"vegas":0,"ventures":0,"versicherung":0,"vg":0,"vi":0,"villas":0,"vision":0,"vlaanderen":0,"vn":0,"vodka":0,"vote":0,"voting":0,"voto":0,"voyage":0,"vu":0,"wang":0,"watch":0,"webcam":0,"website":0,"wed":0,"wf":0,"whoswho":0,"wien":0,"wiki":0,"williamhill":0,"work":0,"works":0,"world":0,"ws":0,"wtf":0,"xn--3ds443g":0,"xn--4gbrim":0,"xn--55qx5d":0,"xn--6frz82g":0,"xn--80adxhks":0,"xn--80ao21a":0,"xn--80asehdb":0,"xn--80aswg":0,"xn--c1avg":0,"xn--d1acj3b":0,"xn--fiq228c5hs":0,"xn--fiqs8s":0,"xn--fiqz9s":0,"xn--i1b6b1a6a2e":0,"xn--j1amh":0,"xn--j6w193g":0,"xn--kpry57d":0,"xn--kput3i":0,"xn--mgbaam7a8h":0,"xn--mgberp4a5d4ar":0,"xn--ngbc5azd":0,"xn--nqv7f":0,"xn--nqv7fs00ema":0,"xn--p1acf":0,"xn--p1ai":0,"xn--q9jyb4c":0,"xn--rhqv96g":0,"xn--ses554g":0,"xxx":0,"xyz":0,"yachts":0,"yandex":0,"ye":0,"yokohama":0,"yt":0,"za":0,"zm":0,"zone":0,"zw":0,"在线":0,"موقع":0,"公司":0,"移动":0,"москва":0,"қаз":0,"онлайн":0,"сайт":0,"орг":0,"дети":0,"中文网":0,"中国":0,"中國":0,"संगठन":0,"укр":0,"香港":0,"台灣":0,"手机":0,"امارات":0,"السعودية":0,"شبكة":0,"机构":0,"组织机构":0,"рус":0,"рф":0,"みんな":0,"世界":0,"网址":0},
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
		re.url = /\b([-a-z*]+:\/\/)?(?:([\w:.+-]+)@)?([a-z0-9-.\u00b7-\u2a6d6]+\.[a-z0-9-авгдезийклмнорстуфқابةتدرسشعقكلمويंगठनसなみん世中公动台司国國在址手文机构港灣界移线组织网香]{1,17})\b(:\d+)?([/?#]\S*)?|\{\{(.+?)\}\}/gi;
	} else {
		re.url = /\b([-a-z*]+:\/\/)?(?:([\w:.+-]+)@)?([a-z0-9-.]+\.[a-z0-9-]{1,17})\b(:\d+)?([/?#][\w-.~!$&*+;=:@%/?#(),'\[\]]*)?|\{\{(.+?)\}\}/gi;
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
