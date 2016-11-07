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

	var urlUnicodeRE = /(?:\b|_)([-a-z*]+:\/\/)?(?:([\w:.+-]+)@)?([a-z0-9-.\u00b7-\u2a6d6]+\.[a-z0-9-कॉमセール佛山慈善集团在线한국大众汽车点看คอมভারত八卦موقعবংল公益司香格里拉网站移动我爱你москвақзнлйт联通рбгеקום时尚微博淡马锡ファッションनेटストア삼성சிங்கபூர商标店城диюポイ新闻工行家電ك中文信国國娱乐谷歌భారత్ලංකා訊盈科购物クラウドભારત販भारतसंगठ餐厅络у港诺基亚食品飞利浦台湾灣手表机الجزئرنیيتبدھغظسةه澳門닷컴政府شგე构组织健康ไทยф珠宝拿みんなグελ世界書籍ਭਾਰਤ址넷コム游戏ö企业息嘉酒صط广东இலைநதயாհայ加坡ف务]{1,24})\b(:\d+)?([/?#]\S*)?|\{\{(.+?)\}\}/ig,
		urlRE =  /(?:\b|_)([-a-z*]+:\/\/)?(?:([\w:.+-]+)@)?([a-z0-9-.]+\.[a-z0-9-]{1,24})\b(:\d+)?([/?#][\w-.~!$&*+;=:@%/?#(),'\[\]]*)?|\{\{(.+?)\}\}/ig,
		tlds = {"aaa":true,"aarp":true,"abarth":true,"abb":true,"abbott":true,"abbvie":true,"abc":true,"able":true,"abogado":true,"abudhabi":true,"ac":true,"academy":true,"accenture":true,"accountant":true,"accountants":true,"aco":true,"active":true,"actor":true,"ad":true,"adac":true,"ads":true,"adult":true,"ae":true,"aeg":true,"aero":true,"aetna":true,"af":true,"afamilycompany":true,"afl":true,"ag":true,"agakhan":true,"agency":true,"ai":true,"aig":true,"aigo":true,"airbus":true,"airforce":true,"airtel":true,"akdn":true,"al":true,"alfaromeo":true,"alibaba":true,"alipay":true,"allfinanz":true,"allstate":true,"ally":true,"alsace":true,"alstom":true,"am":true,"americanexpress":true,"americanfamily":true,"amex":true,"amfam":true,"amica":true,"amsterdam":true,"analytics":true,"android":true,"anquan":true,"anz":true,"ao":true,"aol":true,"apartments":true,"app":true,"apple":true,"aq":true,"aquarelle":true,"ar":true,"aramco":true,"archi":true,"army":true,"arpa":true,"art":true,"arte":true,"as":true,"asda":true,"asia":true,"associates":true,"at":true,"athleta":true,"attorney":true,"au":true,"auction":true,"audi":true,"audible":true,"audio":true,"auspost":true,"author":true,"auto":true,"autos":true,"avianca":true,"aw":true,"aws":true,"ax":true,"axa":true,"az":true,"azure":true,"ba":true,"baby":true,"baidu":true,"banamex":true,"bananarepublic":true,"band":true,"bank":true,"bar":true,"barcelona":true,"barclaycard":true,"barclays":true,"barefoot":true,"bargains":true,"baseball":true,"basketball":true,"bauhaus":true,"bayern":true,"bb":true,"bbc":true,"bbt":true,"bbva":true,"bcg":true,"bcn":true,"bd":true,"be":true,"beats":true,"beauty":true,"beer":true,"bentley":true,"berlin":true,"best":true,"bestbuy":true,"bet":true,"bf":true,"bg":true,"bh":true,"bharti":true,"bi":true,"bible":true,"bid":true,"bike":true,"bing":true,"bingo":true,"bio":true,"biz":true,"bj":true,"black":true,"blackfriday":true,"blanco":true,"blockbuster":true,"blog":true,"bloomberg":true,"blue":true,"bm":true,"bms":true,"bmw":true,"bn":true,"bnl":true,"bnpparibas":true,"bo":true,"boats":true,"boehringer":true,"bofa":true,"bom":true,"bond":true,"boo":true,"book":true,"booking":true,"boots":true,"bosch":true,"bostik":true,"bot":true,"boutique":true,"br":true,"bradesco":true,"bridgestone":true,"broadway":true,"broker":true,"brother":true,"brussels":true,"bs":true,"bt":true,"budapest":true,"bugatti":true,"build":true,"builders":true,"business":true,"buy":true,"buzz":true,"bv":true,"bw":true,"by":true,"bz":true,"bzh":true,"ca":true,"cab":true,"cafe":true,"cal":true,"call":true,"calvinklein":true,"cam":true,"camera":true,"camp":true,"cancerresearch":true,"canon":true,"capetown":true,"capital":true,"capitalone":true,"car":true,"caravan":true,"cards":true,"care":true,"career":true,"careers":true,"cars":true,"cartier":true,"casa":true,"case":true,"caseih":true,"cash":true,"casino":true,"cat":true,"catering":true,"cba":true,"cbn":true,"cbre":true,"cbs":true,"cc":true,"cd":true,"ceb":true,"center":true,"ceo":true,"cern":true,"cf":true,"cfa":true,"cfd":true,"cg":true,"ch":true,"chanel":true,"channel":true,"chase":true,"chat":true,"cheap":true,"chintai":true,"chloe":true,"christmas":true,"chrome":true,"chrysler":true,"church":true,"ci":true,"cipriani":true,"circle":true,"cisco":true,"citadel":true,"citi":true,"citic":true,"city":true,"cityeats":true,"ck":true,"cl":true,"claims":true,"cleaning":true,"click":true,"clinic":true,"clinique":true,"clothing":true,"cloud":true,"club":true,"clubmed":true,"cm":true,"cn":true,"co":true,"coach":true,"codes":true,"coffee":true,"college":true,"cologne":true,"com":true,"comcast":true,"commbank":true,"community":true,"company":true,"compare":true,"computer":true,"comsec":true,"condos":true,"construction":true,"consulting":true,"contact":true,"contractors":true,"cooking":true,"cookingchannel":true,"cool":true,"coop":true,"corsica":true,"country":true,"coupon":true,"coupons":true,"courses":true,"cr":true,"credit":true,"creditcard":true,"creditunion":true,"cricket":true,"crown":true,"crs":true,"cruises":true,"csc":true,"cu":true,"cuisinella":true,"cv":true,"cw":true,"cx":true,"cy":true,"cymru":true,"cyou":true,"cz":true,"dabur":true,"dad":true,"dance":true,"date":true,"dating":true,"datsun":true,"day":true,"dclk":true,"dds":true,"de":true,"deal":true,"dealer":true,"deals":true,"degree":true,"delivery":true,"dell":true,"deloitte":true,"delta":true,"democrat":true,"dental":true,"dentist":true,"desi":true,"design":true,"dev":true,"dhl":true,"diamonds":true,"diet":true,"digital":true,"direct":true,"directory":true,"discount":true,"discover":true,"dish":true,"diy":true,"dj":true,"dk":true,"dm":true,"dnp":true,"do":true,"docs":true,"doctor":true,"dodge":true,"dog":true,"doha":true,"domains":true,"dot":true,"download":true,"drive":true,"dtv":true,"dubai":true,"duck":true,"dunlop":true,"duns":true,"dupont":true,"durban":true,"dvag":true,"dvr":true,"dz":true,"earth":true,"eat":true,"ec":true,"eco":true,"edeka":true,"edu":true,"education":true,"ee":true,"eg":true,"email":true,"emerck":true,"energy":true,"engineer":true,"engineering":true,"enterprises":true,"epost":true,"epson":true,"equipment":true,"er":true,"ericsson":true,"erni":true,"es":true,"esq":true,"estate":true,"esurance":true,"et":true,"eu":true,"eurovision":true,"eus":true,"events":true,"everbank":true,"exchange":true,"expert":true,"exposed":true,"express":true,"extraspace":true,"fage":true,"fail":true,"fairwinds":true,"faith":true,"family":true,"fan":true,"fans":true,"farm":true,"farmers":true,"fashion":true,"fast":true,"fedex":true,"feedback":true,"ferrari":true,"ferrero":true,"fi":true,"fiat":true,"fidelity":true,"fido":true,"film":true,"final":true,"finance":true,"financial":true,"fire":true,"firestone":true,"firmdale":true,"fish":true,"fishing":true,"fit":true,"fitness":true,"fj":true,"fk":true,"flickr":true,"flights":true,"flir":true,"florist":true,"flowers":true,"fly":true,"fm":true,"fo":true,"foo":true,"foodnetwork":true,"football":true,"ford":true,"forex":true,"forsale":true,"forum":true,"foundation":true,"fox":true,"fr":true,"fresenius":true,"frl":true,"frogans":true,"frontdoor":true,"frontier":true,"ftr":true,"fujitsu":true,"fujixerox":true,"fund":true,"furniture":true,"futbol":true,"fyi":true,"ga":true,"gal":true,"gallery":true,"gallo":true,"gallup":true,"game":true,"games":true,"gap":true,"garden":true,"gb":true,"gbiz":true,"gd":true,"gdn":true,"ge":true,"gea":true,"gent":true,"genting":true,"george":true,"gf":true,"gg":true,"ggee":true,"gh":true,"gi":true,"gift":true,"gifts":true,"gives":true,"giving":true,"gl":true,"glade":true,"glass":true,"gle":true,"global":true,"globo":true,"gm":true,"gmail":true,"gmbh":true,"gmo":true,"gmx":true,"gn":true,"godaddy":true,"gold":true,"goldpoint":true,"golf":true,"goo":true,"goodhands":true,"goodyear":true,"goog":true,"google":true,"gop":true,"got":true,"gov":true,"gp":true,"gq":true,"gr":true,"grainger":true,"graphics":true,"gratis":true,"green":true,"gripe":true,"group":true,"gs":true,"gt":true,"gu":true,"guardian":true,"gucci":true,"guge":true,"guide":true,"guitars":true,"guru":true,"gw":true,"gy":true,"hamburg":true,"hangout":true,"haus":true,"hbo":true,"hdfc":true,"hdfcbank":true,"health":true,"healthcare":true,"help":true,"helsinki":true,"here":true,"hermes":true,"hgtv":true,"hiphop":true,"hisamitsu":true,"hitachi":true,"hiv":true,"hk":true,"hkt":true,"hm":true,"hn":true,"hockey":true,"holdings":true,"holiday":true,"homedepot":true,"homegoods":true,"homes":true,"homesense":true,"honda":true,"honeywell":true,"horse":true,"host":true,"hosting":true,"hot":true,"hoteles":true,"hotmail":true,"house":true,"how":true,"hr":true,"hsbc":true,"ht":true,"htc":true,"hu":true,"hughes":true,"hyatt":true,"hyundai":true,"ibm":true,"icbc":true,"ice":true,"icu":true,"id":true,"ie":true,"ieee":true,"ifm":true,"iinet":true,"ikano":true,"il":true,"im":true,"imamat":true,"imdb":true,"immo":true,"immobilien":true,"in":true,"industries":true,"infiniti":true,"info":true,"ing":true,"ink":true,"institute":true,"insurance":true,"insure":true,"int":true,"intel":true,"international":true,"intuit":true,"investments":true,"io":true,"ipiranga":true,"iq":true,"ir":true,"irish":true,"is":true,"iselect":true,"ismaili":true,"ist":true,"istanbul":true,"it":true,"itau":true,"itv":true,"iveco":true,"iwc":true,"jaguar":true,"java":true,"jcb":true,"jcp":true,"je":true,"jeep":true,"jetzt":true,"jewelry":true,"jlc":true,"jll":true,"jm":true,"jmp":true,"jnj":true,"jo":true,"jobs":true,"joburg":true,"jot":true,"joy":true,"jp":true,"jpmorgan":true,"jprs":true,"juegos":true,"juniper":true,"kaufen":true,"kddi":true,"ke":true,"kerryhotels":true,"kerrylogistics":true,"kerryproperties":true,"kfh":true,"kg":true,"kh":true,"ki":true,"kia":true,"kim":true,"kinder":true,"kindle":true,"kitchen":true,"kiwi":true,"km":true,"kn":true,"koeln":true,"komatsu":true,"kosher":true,"kp":true,"kpmg":true,"kpn":true,"kr":true,"krd":true,"kred":true,"kuokgroup":true,"kw":true,"ky":true,"kyoto":true,"kz":true,"la":true,"lacaixa":true,"ladbrokes":true,"lamborghini":true,"lamer":true,"lancaster":true,"lancia":true,"lancome":true,"land":true,"landrover":true,"lanxess":true,"lasalle":true,"lat":true,"latino":true,"latrobe":true,"law":true,"lawyer":true,"lb":true,"lc":true,"lds":true,"lease":true,"leclerc":true,"lefrak":true,"legal":true,"lego":true,"lexus":true,"lgbt":true,"li":true,"liaison":true,"lidl":true,"life":true,"lifeinsurance":true,"lifestyle":true,"lighting":true,"like":true,"lilly":true,"limited":true,"limo":true,"lincoln":true,"linde":true,"link":true,"lipsy":true,"live":true,"living":true,"lixil":true,"lk":true,"loan":true,"loans":true,"locker":true,"locus":true,"loft":true,"lol":true,"london":true,"lotte":true,"lotto":true,"love":true,"lpl":true,"lplfinancial":true,"lr":true,"ls":true,"lt":true,"ltd":true,"ltda":true,"lu":true,"lundbeck":true,"lupin":true,"luxe":true,"luxury":true,"lv":true,"ly":true,"ma":true,"macys":true,"madrid":true,"maif":true,"maison":true,"makeup":true,"man":true,"management":true,"mango":true,"market":true,"marketing":true,"markets":true,"marriott":true,"marshalls":true,"maserati":true,"mattel":true,"mba":true,"mc":true,"mcd":true,"mcdonalds":true,"mckinsey":true,"md":true,"me":true,"med":true,"media":true,"meet":true,"melbourne":true,"meme":true,"memorial":true,"men":true,"menu":true,"meo":true,"metlife":true,"mg":true,"mh":true,"miami":true,"microsoft":true,"mil":true,"mini":true,"mint":true,"mit":true,"mitsubishi":true,"mk":true,"ml":true,"mlb":true,"mls":true,"mm":true,"mma":true,"mn":true,"mo":true,"mobi":true,"mobily":true,"moda":true,"moe":true,"moi":true,"mom":true,"monash":true,"money":true,"monster":true,"montblanc":true,"mopar":true,"mormon":true,"mortgage":true,"moscow":true,"motorcycles":true,"mov":true,"movie":true,"movistar":true,"mp":true,"mq":true,"mr":true,"ms":true,"msd":true,"mt":true,"mtn":true,"mtpc":true,"mtr":true,"mu":true,"museum":true,"mutual":true,"mutuelle":true,"mv":true,"mw":true,"mx":true,"my":true,"mz":true,"na":true,"nab":true,"nadex":true,"nagoya":true,"name":true,"nationwide":true,"natura":true,"navy":true,"nba":true,"nc":true,"ne":true,"nec":true,"net":true,"netbank":true,"netflix":true,"network":true,"neustar":true,"new":true,"newholland":true,"news":true,"next":true,"nextdirect":true,"nexus":true,"nf":true,"nfl":true,"ng":true,"ngo":true,"nhk":true,"ni":true,"nico":true,"nike":true,"nikon":true,"ninja":true,"nissan":true,"nissay":true,"nl":true,"no":true,"nokia":true,"northwesternmutual":true,"norton":true,"now":true,"nowruz":true,"nowtv":true,"np":true,"nr":true,"nra":true,"nrw":true,"ntt":true,"nu":true,"nyc":true,"nz":true,"obi":true,"observer":true,"off":true,"office":true,"okinawa":true,"olayan":true,"olayangroup":true,"oldnavy":true,"ollo":true,"om":true,"omega":true,"one":true,"ong":true,"onl":true,"online":true,"onyourside":true,"ooo":true,"open":true,"oracle":true,"orange":true,"org":true,"organic":true,"orientexpress":true,"origins":true,"osaka":true,"otsuka":true,"ott":true,"ovh":true,"pa":true,"page":true,"pamperedchef":true,"panasonic":true,"panerai":true,"paris":true,"pars":true,"partners":true,"parts":true,"party":true,"passagens":true,"pay":true,"pccw":true,"pe":true,"pet":true,"pf":true,"pfizer":true,"pg":true,"ph":true,"pharmacy":true,"philips":true,"photo":true,"photography":true,"photos":true,"physio":true,"piaget":true,"pics":true,"pictet":true,"pictures":true,"pid":true,"pin":true,"ping":true,"pink":true,"pioneer":true,"pizza":true,"pk":true,"pl":true,"place":true,"play":true,"playstation":true,"plumbing":true,"plus":true,"pm":true,"pn":true,"pnc":true,"pohl":true,"poker":true,"politie":true,"porn":true,"post":true,"pr":true,"pramerica":true,"praxi":true,"press":true,"prime":true,"pro":true,"prod":true,"productions":true,"prof":true,"progressive":true,"promo":true,"properties":true,"property":true,"protection":true,"pru":true,"prudential":true,"ps":true,"pt":true,"pub":true,"pw":true,"pwc":true,"py":true,"qa":true,"qpon":true,"quebec":true,"quest":true,"qvc":true,"racing":true,"radio":true,"raid":true,"re":true,"read":true,"realestate":true,"realtor":true,"realty":true,"recipes":true,"red":true,"redstone":true,"redumbrella":true,"rehab":true,"reise":true,"reisen":true,"reit":true,"ren":true,"rent":true,"rentals":true,"repair":true,"report":true,"republican":true,"rest":true,"restaurant":true,"review":true,"reviews":true,"rexroth":true,"rich":true,"richardli":true,"ricoh":true,"rightathome":true,"rio":true,"rip":true,"ro":true,"rocher":true,"rocks":true,"rodeo":true,"rogers":true,"room":true,"rs":true,"rsvp":true,"ru":true,"ruhr":true,"run":true,"rw":true,"rwe":true,"ryukyu":true,"sa":true,"saarland":true,"safe":true,"safety":true,"sakura":true,"sale":true,"salon":true,"samsclub":true,"samsung":true,"sandvik":true,"sandvikcoromant":true,"sanofi":true,"sap":true,"sapo":true,"sarl":true,"sas":true,"save":true,"saxo":true,"sb":true,"sbi":true,"sbs":true,"sc":true,"sca":true,"scb":true,"schaeffler":true,"schmidt":true,"scholarships":true,"school":true,"schule":true,"schwarz":true,"science":true,"scjohnson":true,"scor":true,"scot":true,"sd":true,"se":true,"seat":true,"secure":true,"security":true,"seek":true,"select":true,"sener":true,"services":true,"ses":true,"seven":true,"sew":true,"sex":true,"sexy":true,"sfr":true,"sg":true,"sh":true,"shangrila":true,"sharp":true,"shaw":true,"shell":true,"shia":true,"shiksha":true,"shoes":true,"shop":true,"shopping":true,"shouji":true,"show":true,"showtime":true,"shriram":true,"si":true,"silk":true,"sina":true,"singles":true,"site":true,"sj":true,"sk":true,"ski":true,"skin":true,"sky":true,"skype":true,"sl":true,"sling":true,"sm":true,"smart":true,"smile":true,"sn":true,"sncf":true,"so":true,"soccer":true,"social":true,"softbank":true,"software":true,"sohu":true,"solar":true,"solutions":true,"song":true,"sony":true,"soy":true,"space":true,"spiegel":true,"spot":true,"spreadbetting":true,"sr":true,"srl":true,"srt":true,"st":true,"stada":true,"staples":true,"star":true,"starhub":true,"statebank":true,"statefarm":true,"statoil":true,"stc":true,"stcgroup":true,"stockholm":true,"storage":true,"store":true,"stream":true,"studio":true,"study":true,"style":true,"su":true,"sucks":true,"supplies":true,"supply":true,"support":true,"surf":true,"surgery":true,"suzuki":true,"sv":true,"swatch":true,"swiftcover":true,"swiss":true,"sx":true,"sy":true,"sydney":true,"symantec":true,"systems":true,"sz":true,"tab":true,"taipei":true,"talk":true,"taobao":true,"target":true,"tatamotors":true,"tatar":true,"tattoo":true,"tax":true,"taxi":true,"tc":true,"tci":true,"td":true,"tdk":true,"team":true,"tech":true,"technology":true,"tel":true,"telecity":true,"telefonica":true,"temasek":true,"tennis":true,"teva":true,"tf":true,"tg":true,"th":true,"thd":true,"theater":true,"theatre":true,"tiaa":true,"tickets":true,"tienda":true,"tiffany":true,"tips":true,"tires":true,"tirol":true,"tj":true,"tjmaxx":true,"tjx":true,"tk":true,"tkmaxx":true,"tl":true,"tm":true,"tmall":true,"tn":true,"to":true,"today":true,"tokyo":true,"tools":true,"top":true,"toray":true,"toshiba":true,"total":true,"tours":true,"town":true,"toyota":true,"toys":true,"tr":true,"trade":true,"trading":true,"training":true,"travel":true,"travelchannel":true,"travelers":true,"travelersinsurance":true,"trust":true,"trv":true,"tt":true,"tube":true,"tui":true,"tunes":true,"tushu":true,"tv":true,"tvs":true,"tw":true,"tz":true,"ua":true,"ubank":true,"ubs":true,"uconnect":true,"ug":true,"uk":true,"unicom":true,"university":true,"uno":true,"uol":true,"ups":true,"us":true,"uy":true,"uz":true,"va":true,"vacations":true,"vana":true,"vanguard":true,"vc":true,"ve":true,"vegas":true,"ventures":true,"verisign":true,"versicherung":true,"vet":true,"vg":true,"vi":true,"viajes":true,"video":true,"vig":true,"viking":true,"villas":true,"vin":true,"vip":true,"virgin":true,"visa":true,"vision":true,"vista":true,"vistaprint":true,"viva":true,"vivo":true,"vlaanderen":true,"vn":true,"vodka":true,"volkswagen":true,"volvo":true,"vote":true,"voting":true,"voto":true,"voyage":true,"vu":true,"vuelos":true,"wales":true,"walmart":true,"walter":true,"wang":true,"wanggou":true,"warman":true,"watch":true,"watches":true,"weather":true,"weatherchannel":true,"webcam":true,"weber":true,"website":true,"wed":true,"wedding":true,"weibo":true,"weir":true,"wf":true,"whoswho":true,"wien":true,"wiki":true,"williamhill":true,"win":true,"windows":true,"wine":true,"winners":true,"wme":true,"wolterskluwer":true,"woodside":true,"work":true,"works":true,"world":true,"wow":true,"ws":true,"wtc":true,"wtf":true,"xbox":true,"xerox":true,"xfinity":true,"xihuan":true,"xin":true,"xn--11b4c3d":true,"xn--1ck2e1b":true,"xn--1qqw23a":true,"xn--30rr7y":true,"xn--3bst00m":true,"xn--3ds443g":true,"xn--3e0b707e":true,"xn--3oq18vl8pn36a":true,"xn--3pxu8k":true,"xn--42c2d9a":true,"xn--45brj9c":true,"xn--45q11c":true,"xn--4gbrim":true,"xn--54b7fta0cc":true,"xn--55qw42g":true,"xn--55qx5d":true,"xn--5su34j936bgsg":true,"xn--5tzm5g":true,"xn--6frz82g":true,"xn--6qq986b3xl":true,"xn--80adxhks":true,"xn--80ao21a":true,"xn--80asehdb":true,"xn--80aswg":true,"xn--8y0a063a":true,"xn--90a3ac":true,"xn--90ae":true,"xn--90ais":true,"xn--9dbq2a":true,"xn--9et52u":true,"xn--9krt00a":true,"xn--b4w605ferd":true,"xn--bck1b9a5dre4c":true,"xn--c1avg":true,"xn--c2br7g":true,"xn--cck2b3b":true,"xn--cg4bki":true,"xn--clchc0ea0b2g2a9gcd":true,"xn--czr694b":true,"xn--czrs0t":true,"xn--czru2d":true,"xn--d1acj3b":true,"xn--d1alf":true,"xn--e1a4c":true,"xn--eckvdtc9d":true,"xn--efvy88h":true,"xn--estv75g":true,"xn--fct429k":true,"xn--fhbei":true,"xn--fiq228c5hs":true,"xn--fiq64b":true,"xn--fiqs8s":true,"xn--fiqz9s":true,"xn--fjq720a":true,"xn--flw351e":true,"xn--fpcrj9c3d":true,"xn--fzc2c9e2c":true,"xn--fzys8d69uvgm":true,"xn--g2xx48c":true,"xn--gckr3f0f":true,"xn--gecrj9c":true,"xn--gk3at1e":true,"xn--h2brj9c":true,"xn--hxt814e":true,"xn--i1b6b1a6a2e":true,"xn--imr513n":true,"xn--io0a7i":true,"xn--j1aef":true,"xn--j1amh":true,"xn--j6w193g":true,"xn--jlq61u9w7b":true,"xn--jvr189m":true,"xn--kcrx77d1x4a":true,"xn--kprw13d":true,"xn--kpry57d":true,"xn--kpu716f":true,"xn--kput3i":true,"xn--l1acc":true,"xn--lgbbat1ad8j":true,"xn--mgb9awbf":true,"xn--mgba3a3ejt":true,"xn--mgba3a4f16a":true,"xn--mgba7c0bbn0a":true,"xn--mgbaam7a8h":true,"xn--mgbab2bd":true,"xn--mgbayh7gpa":true,"xn--mgbb9fbpob":true,"xn--mgbbh1a71e":true,"xn--mgbc0a9azcg":true,"xn--mgbca7dzdo":true,"xn--mgberp4a5d4ar":true,"xn--mgbpl2fh":true,"xn--mgbt3dhd":true,"xn--mgbtx2b":true,"xn--mgbx4cd0ab":true,"xn--mix891f":true,"xn--mk1bu44c":true,"xn--mxtq1m":true,"xn--ngbc5azd":true,"xn--ngbe9e0a":true,"xn--node":true,"xn--nqv7f":true,"xn--nqv7fs00ema":true,"xn--nyqy26a":true,"xn--o3cw4h":true,"xn--ogbpf8fl":true,"xn--p1acf":true,"xn--p1ai":true,"xn--pbt977c":true,"xn--pgbs0dh":true,"xn--pssy2u":true,"xn--q9jyb4c":true,"xn--qcka1pmc":true,"xn--qxam":true,"xn--rhqv96g":true,"xn--rovu88b":true,"xn--s9brj9c":true,"xn--ses554g":true,"xn--t60b56a":true,"xn--tckwe":true,"xn--unup4y":true,"xn--vermgensberater-ctb":true,"xn--vermgensberatung-pwb":true,"xn--vhquv":true,"xn--vuq861b":true,"xn--w4r85el8fhu5dnra":true,"xn--w4rs40l":true,"xn--wgbh1c":true,"xn--wgbl6a":true,"xn--xhq521b":true,"xn--xkc2al3hye2a":true,"xn--xkc2dl3a5ee0h":true,"xn--y9a3aq":true,"xn--yfro4i67o":true,"xn--ygbi2ammx":true,"xn--zfr164b":true,"xperia":true,"xxx":true,"xyz":true,"yachts":true,"yahoo":true,"yamaxun":true,"yandex":true,"ye":true,"yodobashi":true,"yoga":true,"yokohama":true,"you":true,"youtube":true,"yt":true,"yun":true,"za":true,"zappos":true,"zara":true,"zero":true,"zip":true,"zippo":true,"zm":true,"zone":true,"zuerich":true,"zw":true,"कॉम":true,"セール":true,"佛山":true,"慈善":true,"集团":true,"在线":true,"한국":true,"大众汽车":true,"点看":true,"คอม":true,"ভারত":true,"八卦":true,"موقع":true,"বাংলা":true,"公益":true,"公司":true,"香格里拉":true,"网站":true,"移动":true,"我爱你":true,"москва":true,"қаз":true,"онлайн":true,"сайт":true,"联通":true,"срб":true,"бг":true,"бел":true,"קום":true,"时尚":true,"微博":true,"淡马锡":true,"ファッション":true,"орг":true,"नेट":true,"ストア":true,"삼성":true,"சிங்கப்பூர்":true,"商标":true,"商店":true,"商城":true,"дети":true,"мкд":true,"ею":true,"ポイント":true,"新闻":true,"工行":true,"家電":true,"كوم":true,"中文网":true,"中信":true,"中国":true,"中國":true,"娱乐":true,"谷歌":true,"భారత్":true,"ලංකා":true,"電訊盈科":true,"购物":true,"クラウド":true,"ભારત":true,"通販":true,"भारत":true,"网店":true,"संगठन":true,"餐厅":true,"网络":true,"ком":true,"укр":true,"香港":true,"诺基亚":true,"食品":true,"飞利浦":true,"台湾":true,"台灣":true,"手表":true,"手机":true,"мон":true,"الجزائر":true,"عمان":true,"ارامكو":true,"ایران":true,"العليان":true,"امارات":true,"بازار":true,"الاردن":true,"موبايلي":true,"بھارت":true,"المغرب":true,"ابوظبي":true,"السعودية":true,"سودان":true,"همراه":true,"عراق":true,"مليسيا":true,"澳門":true,"닷컴":true,"政府":true,"شبكة":true,"بيتك":true,"გე":true,"机构":true,"组织机构":true,"健康":true,"ไทย":true,"سورية":true,"рус":true,"рф":true,"珠宝":true,"تونس":true,"大拿":true,"みんな":true,"グーグル":true,"ελ":true,"世界":true,"書籍":true,"ਭਾਰਤ":true,"网址":true,"닷넷":true,"コム":true,"游戏":true,"vermögensberater":true,"vermögensberatung":true,"企业":true,"信息":true,"嘉里大酒店":true,"嘉里":true,"مصر":true,"قطر":true,"广东":true,"இலங்கை":true,"இந்தியா":true,"հայ":true,"新加坡":true,"فلسطين":true,"政务":true},
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
			face, protocol, user, domain, port, path, angular, custom,
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
		custom = m[7];
		
		if (!angular && domain.indexOf("..") <= -1 && (isIP(domain) || inTLDS(domain)) || custom) {
			
			if (custom) {
				url = custom;
				
			} else {
				// Remove leading "_"
				if (face[0] == "_") {
					face = face.substr(1);
					m.index++;
				}
				
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
				linkify.linkify(item, {
					image: options.image,
					unicode: options.unicode,
					validator: options.validator,
					newTab: options.newTab,
					maxRunTime: options.maxRunTime,
					timeout: options.timeout,
					customRules: options.customRules,
					done: done
				});

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

