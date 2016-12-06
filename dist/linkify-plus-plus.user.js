// ==UserScript==
// @name        Linkify Plus Plus
// @version     7.3.1
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

	var urlUnicodeRE = /(?:\b|_)([-a-z*]+:\/\/)?(?:([\w:.+-]+)@)?([a-z0-9-.\u00b7-\u2a6d6]+\.[a-z0-9-セール佛山慈善集团在线한국八卦موقعবাংল公司香格里拉网站移动我爱你москвақзтлинйрбгеファッションストア삼성சிங்கபூர商标城дю新闻家電中文信国國ලංකාクラウドભારતभारत店संगठन餐厅络у港食品飞利浦台湾灣手机الجزئرنیتبدسيةكث澳門닷컴شგე构健康ไทยфみんなελ世界書籍址넷コム天主教息嘉大酒صط广东இலைநதயாհայ加坡ف]{1,22})\b(:\d+)?([/?#]\S*)?|\{\{(.+?)\}\}/ig,
		urlRE =  /(?:\b|_)([-a-z*]+:\/\/)?(?:([\w:.+-]+)@)?([a-z0-9-.]+\.[a-z0-9-]{1,22})\b(:\d+)?([/?#][\w-.~!$&*+;=:@%/?#(),'\[\]]*)?|\{\{(.+?)\}\}/ig,
		tlds = {"aarp":true,"abb":true,"abbott":true,"abc":true,"abogado":true,"ac":true,"academy":true,"accenture":true,"accountant":true,"accountants":true,"aco":true,"active":true,"actor":true,"ad":true,"adult":true,"ae":true,"aeg":true,"aero":true,"af":true,"afamilycompany":true,"afl":true,"ag":true,"agency":true,"ai":true,"aig":true,"airbus":true,"airforce":true,"al":true,"alsace":true,"am":true,"amica":true,"amsterdam":true,"ao":true,"apartments":true,"aq":true,"aquarelle":true,"ar":true,"archi":true,"army":true,"arpa":true,"art":true,"arte":true,"as":true,"asia":true,"associates":true,"at":true,"attorney":true,"au":true,"auction":true,"audi":true,"audio":true,"auto":true,"autos":true,"aw":true,"aws":true,"ax":true,"axa":true,"az":true,"azure":true,"ba":true,"baby":true,"baidu":true,"band":true,"bank":true,"bar":true,"barcelona":true,"barclaycard":true,"barclays":true,"bargains":true,"bayern":true,"bb":true,"bbva":true,"bd":true,"be":true,"beer":true,"bentley":true,"berlin":true,"best":true,"bet":true,"bf":true,"bg":true,"bh":true,"bi":true,"bible":true,"bid":true,"bike":true,"bing":true,"bingo":true,"bio":true,"biz":true,"bj":true,"black":true,"blackfriday":true,"blanco":true,"blog":true,"bloomberg":true,"blue":true,"bm":true,"bms":true,"bmw":true,"bn":true,"bnpparibas":true,"bo":true,"boats":true,"bosch":true,"boston":true,"boutique":true,"box":true,"br":true,"bradesco":true,"bridgestone":true,"broadway":true,"broker":true,"brother":true,"brussels":true,"bs":true,"bt":true,"bugatti":true,"build":true,"builders":true,"business":true,"buzz":true,"bw":true,"by":true,"bz":true,"bzh":true,"ca":true,"cab":true,"cafe":true,"cam":true,"camera":true,"camp":true,"cancerresearch":true,"canon":true,"capetown":true,"capital":true,"car":true,"cards":true,"care":true,"career":true,"careers":true,"cars":true,"casa":true,"cash":true,"casino":true,"cat":true,"catering":true,"catholic":true,"cba":true,"cc":true,"cd":true,"center":true,"ceo":true,"cern":true,"cf":true,"cfa":true,"cfd":true,"cg":true,"ch":true,"chanel":true,"chase":true,"chat":true,"cheap":true,"christmas":true,"church":true,"ci":true,"cisco":true,"citic":true,"city":true,"ck":true,"cl":true,"claims":true,"cleaning":true,"click":true,"clinic":true,"clothing":true,"cloud":true,"club":true,"clubmed":true,"cm":true,"cn":true,"co":true,"coach":true,"codes":true,"coffee":true,"college":true,"cologne":true,"com":true,"community":true,"company":true,"computer":true,"condos":true,"construction":true,"consulting":true,"contractors":true,"cooking":true,"cool":true,"coop":true,"corsica":true,"country":true,"coupons":true,"courses":true,"cr":true,"credit":true,"creditcard":true,"cricket":true,"crown":true,"crs":true,"cruise":true,"cruises":true,"csc":true,"cu":true,"cv":true,"cw":true,"cx":true,"cy":true,"cymru":true,"cz":true,"dabur":true,"dance":true,"date":true,"dating":true,"de":true,"deals":true,"degree":true,"delivery":true,"dell":true,"deloitte":true,"democrat":true,"dental":true,"dentist":true,"desi":true,"design":true,"dhl":true,"diamonds":true,"diet":true,"digital":true,"direct":true,"directory":true,"discount":true,"dj":true,"dk":true,"dm":true,"dnp":true,"do":true,"doctor":true,"dog":true,"domains":true,"download":true,"dubai":true,"duck":true,"durban":true,"dvag":true,"dz":true,"earth":true,"ec":true,"eco":true,"edeka":true,"edu":true,"education":true,"ee":true,"eg":true,"email":true,"emerck":true,"energy":true,"engineer":true,"engineering":true,"enterprises":true,"equipment":true,"er":true,"ericsson":true,"erni":true,"es":true,"estate":true,"et":true,"eu":true,"eurovision":true,"eus":true,"events":true,"everbank":true,"exchange":true,"expert":true,"exposed":true,"express":true,"extraspace":true,"fage":true,"fail":true,"fairwinds":true,"faith":true,"family":true,"fan":true,"fans":true,"farm":true,"fashion":true,"feedback":true,"ferrero":true,"fi":true,"film":true,"finance":true,"financial":true,"firmdale":true,"fish":true,"fishing":true,"fit":true,"fitness":true,"fj":true,"fk":true,"flights":true,"florist":true,"flowers":true,"fm":true,"fo":true,"foo":true,"football":true,"forex":true,"forsale":true,"forum":true,"foundation":true,"fox":true,"fr":true,"frl":true,"frogans":true,"fund":true,"furniture":true,"futbol":true,"fyi":true,"ga":true,"gal":true,"gallery":true,"game":true,"games":true,"garden":true,"gd":true,"gdn":true,"ge":true,"gent":true,"genting":true,"gf":true,"gg":true,"gh":true,"gi":true,"gift":true,"gifts":true,"gives":true,"gl":true,"glade":true,"glass":true,"global":true,"globo":true,"gm":true,"gmail":true,"gmbh":true,"gmo":true,"gn":true,"gold":true,"golf":true,"goog":true,"google":true,"gop":true,"gov":true,"gp":true,"gq":true,"gr":true,"graphics":true,"gratis":true,"green":true,"gripe":true,"group":true,"gs":true,"gt":true,"gu":true,"guardian":true,"gucci":true,"guide":true,"guitars":true,"guru":true,"gw":true,"gy":true,"hair":true,"hamburg":true,"haus":true,"healthcare":true,"help":true,"here":true,"hiphop":true,"hitachi":true,"hiv":true,"hk":true,"hm":true,"hn":true,"hockey":true,"holdings":true,"holiday":true,"homes":true,"horse":true,"host":true,"hosting":true,"hoteles":true,"hotmail":true,"house":true,"how":true,"hr":true,"ht":true,"hu":true,"ice":true,"id":true,"ie":true,"ifm":true,"il":true,"im":true,"immo":true,"immobilien":true,"in":true,"industries":true,"info":true,"ink":true,"institute":true,"insurance":true,"insure":true,"int":true,"international":true,"investments":true,"io":true,"ipiranga":true,"iq":true,"ir":true,"irish":true,"is":true,"iselect":true,"ist":true,"istanbul":true,"it":true,"itv":true,"jaguar":true,"java":true,"jcb":true,"je":true,"jetzt":true,"jewelry":true,"jll":true,"jm":true,"jmp":true,"jo":true,"jobs":true,"joburg":true,"jp":true,"jprs":true,"juegos":true,"kaufen":true,"ke":true,"kerryhotels":true,"kg":true,"kh":true,"ki":true,"kim":true,"kinder":true,"kitchen":true,"kiwi":true,"km":true,"kn":true,"koeln":true,"komatsu":true,"kp":true,"kpn":true,"kr":true,"krd":true,"kred":true,"kw":true,"ky":true,"kyoto":true,"kz":true,"la":true,"ladbrokes":true,"lamborghini":true,"lancaster":true,"land":true,"landrover":true,"lat":true,"latrobe":true,"law":true,"lawyer":true,"lb":true,"lc":true,"lease":true,"leclerc":true,"legal":true,"lego":true,"lgbt":true,"li":true,"liaison":true,"lidl":true,"life":true,"lighting":true,"limited":true,"limo":true,"linde":true,"link":true,"lipsy":true,"live":true,"lk":true,"loan":true,"loans":true,"lol":true,"london":true,"lotto":true,"love":true,"lr":true,"ls":true,"lt":true,"ltd":true,"ltda":true,"lu":true,"lundbeck":true,"lupin":true,"luxury":true,"lv":true,"ly":true,"ma":true,"maif":true,"maison":true,"makeup":true,"man":true,"management":true,"mango":true,"market":true,"marketing":true,"markets":true,"marriott":true,"mba":true,"mc":true,"md":true,"me":true,"med":true,"media":true,"melbourne":true,"memorial":true,"men":true,"menu":true,"mg":true,"mh":true,"miami":true,"microsoft":true,"mil":true,"mini":true,"mk":true,"ml":true,"mm":true,"mma":true,"mn":true,"mo":true,"mobi":true,"moda":true,"moe":true,"moi":true,"mom":true,"monash":true,"money":true,"mortgage":true,"moscow":true,"moto":true,"motorcycles":true,"movie":true,"mp":true,"mq":true,"mr":true,"ms":true,"mt":true,"mtn":true,"mtr":true,"mu":true,"museum":true,"mv":true,"mw":true,"mx":true,"my":true,"mz":true,"na":true,"nadex":true,"nagoya":true,"name":true,"navy":true,"nc":true,"ne":true,"nec":true,"net":true,"network":true,"neustar":true,"new":true,"news":true,"next":true,"nextdirect":true,"nf":true,"ng":true,"ngo":true,"ni":true,"nico":true,"nikon":true,"ninja":true,"nissay":true,"nl":true,"no":true,"nokia":true,"norton":true,"np":true,"nr":true,"nra":true,"nrw":true,"ntt":true,"nu":true,"nyc":true,"nz":true,"obi":true,"off":true,"okinawa":true,"om":true,"omega":true,"one":true,"ong":true,"onl":true,"online":true,"ooo":true,"oracle":true,"orange":true,"org":true,"organic":true,"osaka":true,"otsuka":true,"ovh":true,"pa":true,"page":true,"paris":true,"partners":true,"parts":true,"party":true,"pe":true,"pet":true,"pf":true,"pg":true,"ph":true,"pharmacy":true,"philips":true,"photo":true,"photography":true,"photos":true,"physio":true,"pics":true,"pictet":true,"pictures":true,"pink":true,"pizza":true,"pk":true,"pl":true,"place":true,"plumbing":true,"plus":true,"pm":true,"pn":true,"pnc":true,"poker":true,"porn":true,"post":true,"pr":true,"praxi":true,"press":true,"pro":true,"productions":true,"promo":true,"properties":true,"property":true,"protection":true,"ps":true,"pt":true,"pub":true,"pw":true,"py":true,"qa":true,"qpon":true,"quebec":true,"racing":true,"raid":true,"re":true,"realtor":true,"realty":true,"recipes":true,"red":true,"redstone":true,"rehab":true,"reise":true,"reisen":true,"reit":true,"ren":true,"rent":true,"rentals":true,"repair":true,"report":true,"republican":true,"rest":true,"restaurant":true,"review":true,"reviews":true,"rexroth":true,"rich":true,"ricoh":true,"rio":true,"rip":true,"rmit":true,"ro":true,"rocks":true,"rodeo":true,"rs":true,"ru":true,"ruhr":true,"run":true,"rw":true,"rwe":true,"ryukyu":true,"sa":true,"saarland":true,"sale":true,"salon":true,"samsung":true,"sandvik":true,"sandvikcoromant":true,"sanofi":true,"sap":true,"sarl":true,"saxo":true,"sb":true,"sbs":true,"sc":true,"sca":true,"scb":true,"schmidt":true,"school":true,"schule":true,"schwarz":true,"science":true,"scjohnson":true,"scot":true,"sd":true,"se":true,"seat":true,"security":true,"sener":true,"services":true,"seven":true,"sew":true,"sex":true,"sexy":true,"sfr":true,"sg":true,"sh":true,"shangrila":true,"shell":true,"shiksha":true,"shoes":true,"shop":true,"shopping":true,"show":true,"shriram":true,"si":true,"singles":true,"site":true,"sk":true,"ski":true,"skin":true,"sky":true,"skype":true,"sl":true,"sm":true,"sn":true,"sncf":true,"so":true,"soccer":true,"social":true,"software":true,"sohu":true,"solar":true,"solutions":true,"sony":true,"soy":true,"space":true,"spreadbetting":true,"sr":true,"srl":true,"st":true,"stada":true,"statoil":true,"stc":true,"storage":true,"store":true,"stream":true,"studio":true,"study":true,"style":true,"su":true,"sucks":true,"supplies":true,"supply":true,"support":true,"surf":true,"surgery":true,"suzuki":true,"sv":true,"swatch":true,"swiss":true,"sx":true,"sy":true,"sydney":true,"symantec":true,"systems":true,"sz":true,"taipei":true,"tatamotors":true,"tatar":true,"tattoo":true,"tax":true,"taxi":true,"tc":true,"td":true,"team":true,"tech":true,"technology":true,"tel":true,"tennis":true,"teva":true,"tf":true,"tg":true,"th":true,"theater":true,"theatre":true,"tickets":true,"tienda":true,"tiffany":true,"tips":true,"tires":true,"tirol":true,"tj":true,"tk":true,"tl":true,"tm":true,"tn":true,"to":true,"today":true,"tokyo":true,"tools":true,"top":true,"toray":true,"total":true,"tours":true,"town":true,"toyota":true,"toys":true,"tr":true,"trade":true,"trading":true,"training":true,"travel":true,"travelers":true,"trust":true,"tt":true,"tube":true,"tv":true,"tw":true,"tz":true,"ua":true,"ubs":true,"ug":true,"uk":true,"university":true,"uno":true,"uol":true,"us":true,"uy":true,"uz":true,"va":true,"vacations":true,"vc":true,"ve":true,"vegas":true,"ventures":true,"versicherung":true,"vet":true,"vg":true,"vi":true,"viajes":true,"video":true,"villas":true,"vin":true,"vip":true,"vision":true,"vistaprint":true,"vlaanderen":true,"vn":true,"vodka":true,"volkswagen":true,"vote":true,"voting":true,"voto":true,"voyage":true,"vu":true,"wales":true,"walter":true,"wang":true,"warman":true,"watch":true,"webcam":true,"weber":true,"website":true,"wed":true,"wedding":true,"weir":true,"wf":true,"whoswho":true,"wien":true,"wiki":true,"williamhill":true,"win":true,"windows":true,"wine":true,"wme":true,"work":true,"works":true,"world":true,"ws":true,"wtf":true,"xbox":true,"xin":true,"xn--1ck2e1b":true,"xn--1qqw23a":true,"xn--30rr7y":true,"xn--3bst00m":true,"xn--3ds443g":true,"xn--3e0b707e":true,"xn--45q11c":true,"xn--4gbrim":true,"xn--54b7fta0cc":true,"xn--55qx5d":true,"xn--5su34j936bgsg":true,"xn--5tzm5g":true,"xn--6frz82g":true,"xn--6qq986b3xl":true,"xn--80adxhks":true,"xn--80ao21a":true,"xn--80aqecdr1a":true,"xn--80asehdb":true,"xn--80aswg":true,"xn--90a3ac":true,"xn--90ae":true,"xn--90ais":true,"xn--bck1b9a5dre4c":true,"xn--c1avg":true,"xn--cck2b3b":true,"xn--cg4bki":true,"xn--clchc0ea0b2g2a9gcd":true,"xn--czr694b":true,"xn--czru2d":true,"xn--d1acj3b":true,"xn--d1alf":true,"xn--e1a4c":true,"xn--efvy88h":true,"xn--fct429k":true,"xn--fiq228c5hs":true,"xn--fiq64b":true,"xn--fiqs8s":true,"xn--fiqz9s":true,"xn--fzc2c9e2c":true,"xn--gckr3f0f":true,"xn--gecrj9c":true,"xn--h2brj9c":true,"xn--hxt814e":true,"xn--i1b6b1a6a2e":true,"xn--imr513n":true,"xn--io0a7i":true,"xn--j1amh":true,"xn--j6w193g":true,"xn--jvr189m":true,"xn--kcrx77d1x4a":true,"xn--kprw13d":true,"xn--kpry57d":true,"xn--kput3i":true,"xn--l1acc":true,"xn--lgbbat1ad8j":true,"xn--mgb9awbf":true,"xn--mgba3a4f16a":true,"xn--mgbaam7a8h":true,"xn--mgbab2bd":true,"xn--mgbayh7gpa":true,"xn--mgberp4a5d4ar":true,"xn--mgbi4ecexp":true,"xn--mgbtx2b":true,"xn--mix891f":true,"xn--mk1bu44c":true,"xn--ngbc5azd":true,"xn--node":true,"xn--nqv7f":true,"xn--nyqy26a":true,"xn--o3cw4h":true,"xn--ogbpf8fl":true,"xn--p1acf":true,"xn--p1ai":true,"xn--pgbs0dh":true,"xn--q9jyb4c":true,"xn--qxam":true,"xn--rhqv96g":true,"xn--rovu88b":true,"xn--ses554g":true,"xn--t60b56a":true,"xn--tckwe":true,"xn--tiq49xqyj":true,"xn--vuq861b":true,"xn--w4r85el8fhu5dnra":true,"xn--wgbh1c":true,"xn--wgbl6a":true,"xn--xhq521b":true,"xn--xkc2al3hye2a":true,"xn--xkc2dl3a5ee0h":true,"xn--y9a3aq":true,"xn--yfro4i67o":true,"xn--ygbi2ammx":true,"xperia":true,"xxx":true,"xyz":true,"yachts":true,"yandex":true,"ye":true,"yoga":true,"yokohama":true,"yt":true,"za":true,"zm":true,"zone":true,"zw":true,"セール":true,"佛山":true,"慈善":true,"集团":true,"在线":true,"한국":true,"八卦":true,"موقع":true,"বাংলা":true,"公司":true,"香格里拉":true,"网站":true,"移动":true,"我爱你":true,"москва":true,"қаз":true,"католик":true,"онлайн":true,"сайт":true,"срб":true,"бг":true,"бел":true,"ファッション":true,"орг":true,"ストア":true,"삼성":true,"சிங்கப்பூர்":true,"商标":true,"商城":true,"дети":true,"мкд":true,"ею":true,"新闻":true,"家電":true,"中文网":true,"中信":true,"中国":true,"中國":true,"ලංකා":true,"クラウド":true,"ભારત":true,"भारत":true,"网店":true,"संगठन":true,"餐厅":true,"网络":true,"укр":true,"香港":true,"食品":true,"飞利浦":true,"台湾":true,"台灣":true,"手机":true,"мон":true,"الجزائر":true,"عمان":true,"ایران":true,"امارات":true,"بازار":true,"الاردن":true,"السعودية":true,"كاثوليك":true,"عراق":true,"澳門":true,"닷컴":true,"شبكة":true,"გე":true,"机构":true,"健康":true,"ไทย":true,"سورية":true,"рус":true,"рф":true,"تونس":true,"みんな":true,"ελ":true,"世界":true,"書籍":true,"网址":true,"닷넷":true,"コム":true,"天主教":true,"信息":true,"嘉里大酒店":true,"مصر":true,"قطر":true,"广东":true,"இலங்கை":true,"இந்தியா":true,"հայ":true,"新加坡":true,"فلسطين":true},
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
		m.face = m[0];
		m.protocol = m[1] || "";
		m.user = m[2] || "";
		m.domain = m[3] || "";
		m.port = m[4] || "";
		m.path = m[5] || "";
		m.angular = m[6];
		m.custom = m[7];		
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
		return /^[a-z]/i.test(d) && d.indexOf("..") < 0;
	}

	function linkifySearch(search, options, re) {
		var m, mm,
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
		
		buildUrlMatch(m);
		
		if (m.angular) {
			if (unsafeWindow.angular || unsafeWindow.Vue) {
				// ignore urls surrounded by {{}}
				return;
			} else {
				// Next search start after "{{" if there is no window.angular
				re.lastIndex = m.index + 2;
			}
		}
		
		if (!validMatch(m, options)) {
			console.log(m.face, options.ip, m.domain);
			return;
		}
		
		if (m.custom) {
			url = m.custom;
			
		} else {
			// Remove leading "_"
			if (m.face[0] == "_") {
				m.face = m.face.substr(1);
				m.index++;
			}
			
			if (m.path) {
				// Remove trailing ".,?"
				m.face = m.face.replace(/[.,?]*$/, '');
				m.path = m.path.replace(/[.,?]*$/, '');

				// Strip parens "()"
				m.face = stripSingleSymbol(m.face, "(", ")");
				m.path = stripSingleSymbol(m.path, "(", ")");

				// Strip bracket "[]"
				m.face = stripSingleSymbol(m.face, "[", "]");
				m.path = stripSingleSymbol(m.path, "[", "]");

				// Strip BBCode
				m.face = m.face.replace(/\[\/?(b|i|u|url|img|quote|code|size|color)\].*/i, "");
				m.path = m.path.replace(/\[\/?(b|i|u|url|img|quote|code|size|color)\].*/i, "");
			}

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
		search.pos.add(m.index - search.textIndex);
		range.setEnd(search.pos.container, search.pos.offset);

		search.frag.appendChild(cloneContents(range));

		// the url part
		range.setStart(search.pos.container, search.pos.offset);
		search.pos.add(m.face.length);
		range.setEnd(search.pos.container, search.pos.offset);

		search.frag.appendChild(createLink(url, cloneContents(range), options));

		// We have to set lastIndex manually if we had changed face.
		re.lastIndex = m.index + m.face.length;
		search.textIndex = re.lastIndex;
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
	
	// function reEscape(text) {
		// return text.replace(/[-\[\]\/{}()*+?.\\^$|]/g, "\\$&");
	// }
	
	function buildRe(unicode, customRules) {
		var re = unicode ? urlUnicodeRE : urlRE;
		if (!customRules || !customRules.length) {
			return re;
		}
		re = createRe(re.source + "|(" + customRules.join("|") + ")", "ig");
		return re;
	}

	function linkify(root, options) {
		var filter = createFilter(options.validator),
			ranges = generateRanges(root, filter),
			search,
			re = buildRe(options.unicode, options.customRules),
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

				linkifySearch(search, options, re);

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
