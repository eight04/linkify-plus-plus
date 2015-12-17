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

	var urlRE = /\b([-a-z*]+:\/\/)?(?:([\w:.+-]+)@)?([a-z0-9-.\u00b7-\u2a6d6]+\.[a-z0-9-कॉम佛山慈善集团在线한국点看คอมভারত八卦موقع公益司移动我爱你москвақзнлйтрбеקום时尚淡马锡гनेट삼성சிங்கபூர商标店城ди新闻工行ك中文网信国國娱乐谷歌భారత్ලංකාભારતभारतसंगठ餐厅络у香港飞利浦台湾灣手机الجزئرنیتبدھغسية닷컴政府شგე构组织健康ไทยф大拿みんなグール世界ਭਾਰਤ址넷コム游戏ö企业息صط广东இலைநதயாհայ加坡ف务]{1,24})\b(:\d+)?([/?#]\S*)?|\{\{(.+?)\}\}/i,
		urlUnicodeRE =  /\b([-a-z*]+:\/\/)?(?:([\w:.+-]+)@)?([a-z0-9-.]+\.[a-z0-9-]{1,24})\b(:\d+)?([/?#][\w-.~!$&*+;=:@%/?#(),'\[\]]*)?|\{\{(.+?)\}\}/i,
		tlds = {"aaa":true,"abb":true,"abbott":true,"abogado":true,"ac":true,"academy":true,"accenture":true,"accountant":true,"accountants":true,"aco":true,"active":true,"actor":true,"ad":true,"ads":true,"adult":true,"ae":true,"aeg":true,"aero":true,"af":true,"afl":true,"ag":true,"agency":true,"ai":true,"aig":true,"airforce":true,"airtel":true,"al":true,"allfinanz":true,"alsace":true,"am":true,"amica":true,"amsterdam":true,"android":true,"ao":true,"apartments":true,"app":true,"aq":true,"aquarelle":true,"ar":true,"archi":true,"army":true,"arpa":true,"as":true,"asia":true,"associates":true,"at":true,"attorney":true,"au":true,"auction":true,"audio":true,"auto":true,"autos":true,"aw":true,"ax":true,"axa":true,"az":true,"azure":true,"ba":true,"band":true,"bank":true,"bar":true,"barcelona":true,"barclaycard":true,"barclays":true,"bargains":true,"bauhaus":true,"bayern":true,"bb":true,"bbc":true,"bbva":true,"bcn":true,"bd":true,"be":true,"beer":true,"bentley":true,"berlin":true,"best":true,"bet":true,"bf":true,"bg":true,"bh":true,"bharti":true,"bi":true,"bible":true,"bid":true,"bike":true,"bing":true,"bingo":true,"bio":true,"biz":true,"bj":true,"black":true,"blackfriday":true,"bloomberg":true,"blue":true,"bm":true,"bms":true,"bmw":true,"bn":true,"bnl":true,"bnpparibas":true,"bo":true,"boats":true,"bom":true,"bond":true,"boo":true,"boots":true,"boutique":true,"br":true,"bradesco":true,"bridgestone":true,"broker":true,"brother":true,"brussels":true,"bs":true,"bt":true,"budapest":true,"build":true,"builders":true,"business":true,"buzz":true,"bv":true,"bw":true,"by":true,"bz":true,"bzh":true,"ca":true,"cab":true,"cafe":true,"cal":true,"camera":true,"camp":true,"cancerresearch":true,"canon":true,"capetown":true,"capital":true,"car":true,"caravan":true,"cards":true,"care":true,"career":true,"careers":true,"cars":true,"cartier":true,"casa":true,"cash":true,"casino":true,"cat":true,"catering":true,"cba":true,"cbn":true,"cc":true,"cd":true,"ceb":true,"center":true,"ceo":true,"cern":true,"cf":true,"cfa":true,"cfd":true,"cg":true,"ch":true,"chanel":true,"channel":true,"chat":true,"cheap":true,"chloe":true,"christmas":true,"chrome":true,"church":true,"ci":true,"cisco":true,"citic":true,"city":true,"ck":true,"cl":true,"claims":true,"cleaning":true,"click":true,"clinic":true,"clothing":true,"cloud":true,"club":true,"clubmed":true,"cm":true,"cn":true,"co":true,"coach":true,"codes":true,"coffee":true,"college":true,"cologne":true,"com":true,"commbank":true,"community":true,"company":true,"computer":true,"condos":true,"construction":true,"consulting":true,"contractors":true,"cooking":true,"cool":true,"coop":true,"corsica":true,"country":true,"coupons":true,"courses":true,"cr":true,"credit":true,"creditcard":true,"cricket":true,"crown":true,"crs":true,"cruises":true,"csc":true,"cu":true,"cuisinella":true,"cv":true,"cw":true,"cx":true,"cy":true,"cymru":true,"cyou":true,"cz":true,"dabur":true,"dad":true,"dance":true,"date":true,"dating":true,"datsun":true,"day":true,"dclk":true,"de":true,"deals":true,"degree":true,"delivery":true,"delta":true,"democrat":true,"dental":true,"dentist":true,"desi":true,"design":true,"dev":true,"diamonds":true,"diet":true,"digital":true,"direct":true,"directory":true,"discount":true,"dj":true,"dk":true,"dm":true,"dnp":true,"do":true,"docs":true,"dog":true,"doha":true,"domains":true,"doosan":true,"download":true,"drive":true,"durban":true,"dvag":true,"dz":true,"earth":true,"eat":true,"ec":true,"edu":true,"education":true,"ee":true,"eg":true,"email":true,"emerck":true,"energy":true,"engineer":true,"engineering":true,"enterprises":true,"epson":true,"equipment":true,"er":true,"erni":true,"es":true,"esq":true,"estate":true,"et":true,"eu":true,"eurovision":true,"eus":true,"events":true,"everbank":true,"exchange":true,"expert":true,"exposed":true,"express":true,"fage":true,"fail":true,"faith":true,"family":true,"fan":true,"fans":true,"farm":true,"fashion":true,"feedback":true,"fi":true,"film":true,"final":true,"finance":true,"financial":true,"firmdale":true,"fish":true,"fishing":true,"fit":true,"fitness":true,"fj":true,"fk":true,"flights":true,"florist":true,"flowers":true,"flsmidth":true,"fly":true,"fm":true,"fo":true,"foo":true,"football":true,"forex":true,"forsale":true,"forum":true,"foundation":true,"fr":true,"frl":true,"frogans":true,"fund":true,"furniture":true,"futbol":true,"fyi":true,"ga":true,"gal":true,"gallery":true,"game":true,"garden":true,"gb":true,"gbiz":true,"gd":true,"gdn":true,"ge":true,"gea":true,"gent":true,"genting":true,"gf":true,"gg":true,"ggee":true,"gh":true,"gi":true,"gift":true,"gifts":true,"gives":true,"giving":true,"gl":true,"glass":true,"gle":true,"global":true,"globo":true,"gm":true,"gmail":true,"gmo":true,"gmx":true,"gn":true,"gold":true,"goldpoint":true,"golf":true,"goo":true,"goog":true,"google":true,"gop":true,"gov":true,"gp":true,"gq":true,"gr":true,"graphics":true,"gratis":true,"green":true,"gripe":true,"group":true,"gs":true,"gt":true,"gu":true,"guge":true,"guide":true,"guitars":true,"guru":true,"gw":true,"gy":true,"hamburg":true,"hangout":true,"haus":true,"healthcare":true,"help":true,"here":true,"hermes":true,"hiphop":true,"hitachi":true,"hiv":true,"hk":true,"hm":true,"hn":true,"hockey":true,"holdings":true,"holiday":true,"homedepot":true,"homes":true,"honda":true,"horse":true,"host":true,"hosting":true,"hoteles":true,"hotmail":true,"house":true,"how":true,"hr":true,"hsbc":true,"ht":true,"hu":true,"hyundai":true,"ibm":true,"icbc":true,"ice":true,"icu":true,"id":true,"ie":true,"ifm":true,"iinet":true,"il":true,"im":true,"immo":true,"immobilien":true,"in":true,"industries":true,"infiniti":true,"info":true,"ing":true,"ink":true,"institute":true,"insure":true,"int":true,"international":true,"investments":true,"io":true,"ipiranga":true,"iq":true,"ir":true,"irish":true,"is":true,"ist":true,"istanbul":true,"it":true,"itau":true,"iwc":true,"java":true,"jcb":true,"je":true,"jetzt":true,"jewelry":true,"jlc":true,"jll":true,"jm":true,"jo":true,"jobs":true,"joburg":true,"jp":true,"jprs":true,"juegos":true,"kaufen":true,"kddi":true,"ke":true,"kg":true,"kh":true,"ki":true,"kia":true,"kim":true,"kitchen":true,"kiwi":true,"km":true,"kn":true,"koeln":true,"komatsu":true,"kp":true,"kr":true,"krd":true,"kred":true,"kw":true,"ky":true,"kyoto":true,"kz":true,"la":true,"lacaixa":true,"lancaster":true,"land":true,"lasalle":true,"lat":true,"latrobe":true,"law":true,"lawyer":true,"lb":true,"lc":true,"lds":true,"lease":true,"leclerc":true,"legal":true,"lexus":true,"lgbt":true,"li":true,"liaison":true,"lidl":true,"life":true,"lighting":true,"limited":true,"limo":true,"linde":true,"link":true,"live":true,"lixil":true,"lk":true,"loan":true,"loans":true,"lol":true,"london":true,"lotte":true,"lotto":true,"love":true,"lr":true,"ls":true,"lt":true,"ltd":true,"ltda":true,"lu":true,"lupin":true,"luxe":true,"luxury":true,"lv":true,"ly":true,"ma":true,"madrid":true,"maif":true,"maison":true,"man":true,"management":true,"mango":true,"market":true,"marketing":true,"markets":true,"marriott":true,"mba":true,"mc":true,"md":true,"me":true,"media":true,"meet":true,"melbourne":true,"meme":true,"memorial":true,"men":true,"menu":true,"mg":true,"mh":true,"miami":true,"microsoft":true,"mil":true,"mini":true,"mk":true,"ml":true,"mm":true,"mma":true,"mn":true,"mo":true,"mobi":true,"moda":true,"moe":true,"mom":true,"monash":true,"money":true,"montblanc":true,"mormon":true,"mortgage":true,"moscow":true,"motorcycles":true,"mov":true,"movie":true,"movistar":true,"mp":true,"mq":true,"mr":true,"ms":true,"mt":true,"mtn":true,"mtpc":true,"mu":true,"museum":true,"mv":true,"mw":true,"mx":true,"my":true,"mz":true,"na":true,"nadex":true,"nagoya":true,"name":true,"navy":true,"nc":true,"ne":true,"nec":true,"net":true,"netbank":true,"network":true,"neustar":true,"new":true,"news":true,"nexus":true,"nf":true,"ng":true,"ngo":true,"nhk":true,"ni":true,"nico":true,"ninja":true,"nissan":true,"nl":true,"no":true,"nokia":true,"np":true,"nr":true,"nra":true,"nrw":true,"ntt":true,"nu":true,"nyc":true,"nz":true,"obi":true,"office":true,"okinawa":true,"om":true,"omega":true,"one":true,"ong":true,"onl":true,"online":true,"ooo":true,"oracle":true,"orange":true,"org":true,"organic":true,"osaka":true,"otsuka":true,"ovh":true,"pa":true,"page":true,"panerai":true,"paris":true,"partners":true,"parts":true,"party":true,"pe":true,"pet":true,"pf":true,"pg":true,"ph":true,"pharmacy":true,"philips":true,"photo":true,"photography":true,"photos":true,"physio":true,"piaget":true,"pics":true,"pictet":true,"pictures":true,"pink":true,"pizza":true,"pk":true,"pl":true,"place":true,"play":true,"plumbing":true,"plus":true,"pm":true,"pn":true,"pohl":true,"poker":true,"porn":true,"post":true,"pr":true,"praxi":true,"press":true,"pro":true,"prod":true,"productions":true,"prof":true,"properties":true,"property":true,"protection":true,"ps":true,"pt":true,"pub":true,"pw":true,"py":true,"qa":true,"qpon":true,"quebec":true,"racing":true,"re":true,"realtor":true,"realty":true,"recipes":true,"red":true,"redstone":true,"rehab":true,"reise":true,"reisen":true,"reit":true,"ren":true,"rent":true,"rentals":true,"repair":true,"report":true,"republican":true,"rest":true,"restaurant":true,"review":true,"reviews":true,"rich":true,"ricoh":true,"rio":true,"rip":true,"ro":true,"rocks":true,"rodeo":true,"rs":true,"rsvp":true,"ru":true,"ruhr":true,"run":true,"rw":true,"ryukyu":true,"sa":true,"saarland":true,"sakura":true,"sale":true,"samsung":true,"sandvik":true,"sandvikcoromant":true,"sanofi":true,"sap":true,"sarl":true,"saxo":true,"sb":true,"sc":true,"sca":true,"scb":true,"schmidt":true,"scholarships":true,"school":true,"schule":true,"schwarz":true,"science":true,"scor":true,"scot":true,"sd":true,"se":true,"seat":true,"security":true,"seek":true,"sener":true,"services":true,"seven":true,"sew":true,"sex":true,"sexy":true,"sg":true,"sh":true,"shiksha":true,"shoes":true,"show":true,"shriram":true,"si":true,"singles":true,"site":true,"sj":true,"sk":true,"ski":true,"sky":true,"skype":true,"sl":true,"sm":true,"sn":true,"sncf":true,"so":true,"soccer":true,"social":true,"software":true,"sohu":true,"solar":true,"solutions":true,"sony":true,"soy":true,"space":true,"spiegel":true,"spreadbetting":true,"sr":true,"srl":true,"st":true,"stada":true,"starhub":true,"statoil":true,"stc":true,"stcgroup":true,"stockholm":true,"studio":true,"study":true,"style":true,"su":true,"sucks":true,"supplies":true,"supply":true,"support":true,"surf":true,"surgery":true,"suzuki":true,"sv":true,"swatch":true,"swiss":true,"sx":true,"sy":true,"sydney":true,"systems":true,"sz":true,"taipei":true,"tatamotors":true,"tatar":true,"tattoo":true,"tax":true,"taxi":true,"tc":true,"td":true,"team":true,"tech":true,"technology":true,"tel":true,"telefonica":true,"temasek":true,"tennis":true,"tf":true,"tg":true,"th":true,"thd":true,"theater":true,"theatre":true,"tickets":true,"tienda":true,"tips":true,"tires":true,"tirol":true,"tj":true,"tk":true,"tl":true,"tm":true,"tn":true,"to":true,"today":true,"tokyo":true,"tools":true,"top":true,"toray":true,"toshiba":true,"tours":true,"town":true,"toyota":true,"toys":true,"tr":true,"trade":true,"trading":true,"training":true,"travel":true,"trust":true,"tt":true,"tui":true,"tv":true,"tw":true,"tz":true,"ua":true,"ubs":true,"ug":true,"uk":true,"university":true,"uno":true,"uol":true,"us":true,"uy":true,"uz":true,"va":true,"vacations":true,"vc":true,"ve":true,"vegas":true,"ventures":true,"versicherung":true,"vet":true,"vg":true,"vi":true,"viajes":true,"video":true,"villas":true,"vin":true,"vision":true,"vista":true,"vistaprint":true,"viva":true,"vlaanderen":true,"vn":true,"vodka":true,"vote":true,"voting":true,"voto":true,"voyage":true,"vu":true,"wales":true,"walter":true,"wang":true,"watch":true,"webcam":true,"website":true,"wed":true,"wedding":true,"weir":true,"wf":true,"whoswho":true,"wien":true,"wiki":true,"williamhill":true,"win":true,"windows":true,"wine":true,"wme":true,"work":true,"works":true,"world":true,"ws":true,"wtc":true,"wtf":true,"xbox":true,"xerox":true,"xin":true,"xn--11b4c3d":true,"xn--1qqw23a":true,"xn--30rr7y":true,"xn--3bst00m":true,"xn--3ds443g":true,"xn--3e0b707e":true,"xn--3pxu8k":true,"xn--42c2d9a":true,"xn--45brj9c":true,"xn--45q11c":true,"xn--4gbrim":true,"xn--55qw42g":true,"xn--55qx5d":true,"xn--6frz82g":true,"xn--6qq986b3xl":true,"xn--80adxhks":true,"xn--80ao21a":true,"xn--80asehdb":true,"xn--80aswg":true,"xn--90a3ac":true,"xn--90ais":true,"xn--9dbq2a":true,"xn--9et52u":true,"xn--b4w605ferd":true,"xn--c1avg":true,"xn--c2br7g":true,"xn--cg4bki":true,"xn--clchc0ea0b2g2a9gcd":true,"xn--czr694b":true,"xn--czrs0t":true,"xn--czru2d":true,"xn--d1acj3b":true,"xn--d1alf":true,"xn--efvy88h":true,"xn--estv75g":true,"xn--fhbei":true,"xn--fiq228c5hs":true,"xn--fiq64b":true,"xn--fiqs8s":true,"xn--fiqz9s":true,"xn--fjq720a":true,"xn--flw351e":true,"xn--fpcrj9c3d":true,"xn--fzc2c9e2c":true,"xn--gecrj9c":true,"xn--h2brj9c":true,"xn--hxt814e":true,"xn--i1b6b1a6a2e":true,"xn--imr513n":true,"xn--io0a7i":true,"xn--j1aef":true,"xn--j1amh":true,"xn--j6w193g":true,"xn--kcrx77d1x4a":true,"xn--kprw13d":true,"xn--kpry57d":true,"xn--kput3i":true,"xn--l1acc":true,"xn--lgbbat1ad8j":true,"xn--mgb9awbf":true,"xn--mgba3a4f16a":true,"xn--mgbaam7a8h":true,"xn--mgbab2bd":true,"xn--mgbayh7gpa":true,"xn--mgbbh1a71e":true,"xn--mgbc0a9azcg":true,"xn--mgberp4a5d4ar":true,"xn--mgbpl2fh":true,"xn--mgbx4cd0ab":true,"xn--mk1bu44c":true,"xn--mxtq1m":true,"xn--ngbc5azd":true,"xn--node":true,"xn--nqv7f":true,"xn--nqv7fs00ema":true,"xn--nyqy26a":true,"xn--o3cw4h":true,"xn--ogbpf8fl":true,"xn--p1acf":true,"xn--p1ai":true,"xn--pgbs0dh":true,"xn--pssy2u":true,"xn--q9jyb4c":true,"xn--qcka1pmc":true,"xn--rhqv96g":true,"xn--s9brj9c":true,"xn--ses554g":true,"xn--t60b56a":true,"xn--tckwe":true,"xn--unup4y":true,"xn--vermgensberater-ctb":true,"xn--vermgensberatung-pwb":true,"xn--vhquv":true,"xn--vuq861b":true,"xn--wgbh1c":true,"xn--wgbl6a":true,"xn--xhq521b":true,"xn--xkc2al3hye2a":true,"xn--xkc2dl3a5ee0h":true,"xn--y9a3aq":true,"xn--yfro4i67o":true,"xn--ygbi2ammx":true,"xn--zfr164b":true,"xperia":true,"xxx":true,"xyz":true,"yachts":true,"yandex":true,"ye":true,"yodobashi":true,"yoga":true,"yokohama":true,"youtube":true,"yt":true,"za":true,"zip":true,"zm":true,"zone":true,"zuerich":true,"zw":true,"कॉम":true,"佛山":true,"慈善":true,"集团":true,"在线":true,"한국":true,"点看":true,"คอม":true,"ভারত":true,"八卦":true,"موقع":true,"公益":true,"公司":true,"移动":true,"我爱你":true,"москва":true,"қаз":true,"онлайн":true,"сайт":true,"срб":true,"бел":true,"קום":true,"时尚":true,"淡马锡":true,"орг":true,"नेट":true,"삼성":true,"சிங்கப்பூர்":true,"商标":true,"商店":true,"商城":true,"дети":true,"мкд":true,"新闻":true,"工行":true,"كوم":true,"中文网":true,"中信":true,"中国":true,"中國":true,"娱乐":true,"谷歌":true,"భారత్":true,"ලංකා":true,"ભારત":true,"भारत":true,"网店":true,"संगठन":true,"餐厅":true,"网络":true,"ком":true,"укр":true,"香港":true,"飞利浦":true,"台湾":true,"台灣":true,"手机":true,"мон":true,"الجزائر":true,"عمان":true,"ایران":true,"امارات":true,"بازار":true,"الاردن":true,"بھارت":true,"المغرب":true,"السعودية":true,"سودان":true,"مليسيا":true,"닷컴":true,"政府":true,"شبكة":true,"გე":true,"机构":true,"组织机构":true,"健康":true,"ไทย":true,"سورية":true,"рус":true,"рф":true,"تونس":true,"大拿":true,"みんな":true,"グーグル":true,"世界":true,"ਭਾਰਤ":true,"网址":true,"닷넷":true,"コム":true,"游戏":true,"vermögensberater":true,"vermögensberatung":true,"企业":true,"信息":true,"مصر":true,"قطر":true,"广东":true,"இலங்கை":true,"இந்தியா":true,"հայ":true,"新加坡":true,"فلسطين":true,"政务":true};

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

		requestAnimationFrame(nextRange);

		function nextRange() {

			if (!range) {
				range = ranges.next().value;
			}

			if (!range) {
				if (options.done) {
					requestAnimationFrame(options.done);
				}
				return;
			}

			range = linkifyRange(range, options.newTab, options.image);

			requestAnimationFrame(nextRange);
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
	}
}, function(config){
	options = config;
	options.ignoreTags = getArray(options.ignoreTags);
	options.ignoreClasses = getArray(options.ignoreClasses);
	selectors = config.selectors.trim().replace(/\n/, ", ");
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
