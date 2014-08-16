// ==UserScript==
// @name        Grease Info
// @version     1.1.2
// @namespace   eight04.blogspot.com
// @description Parse markdown info in userjs.
// @include     https://greasyfork.org/scripts/*
// @require     https://code.jquery.com/jquery-1.11.1.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/marked/0.3.2/marked.min.js
// @grant       GM_xmlhttpRequest
// ==/UserScript==

/***********************************markdown************************************
# Grease Info

Experiment implementation!

## Version History
*   Version 1.1.2 (Aug 17, 2014)
	- Add doxygen comment style support.
*	Version 1.1.1 (Aug 16, 2014)
	- Update this history.
*	Version 1.1 (Aug 16, 2014)
	- Add markdown support.
*	Version 1.0 (Aug 16, 2014)
	- First release.
*******************************************************************************/

var url, jsraw, info, parsedInfo;

var draw = function(){
	// console.log(info);
	$("#script-content").append(
		'<div id="additional-info">\
			<h3>Author\'s Description</h3>\
			<div></div>\
		</div>'
	);
	$("#additional-info>div").html(parsedInfo);
};

var parseDoxy = function(source){
	var doxyRE = /^ \*(\s|$)/, list, i, usingDoxy = true;
	
	list = source.split(/\r?\n/);
	if(list.length > 1){
		for(i = 1; i < list.length; i++){
			if(!doxyRE.test(list[i])){
				usingDoxy = false;
				break;
			}
		}
	}
	if(usingDoxy)){
		source = source.split(doxyRE).join("");
	}
	return source;
};

var parse = function(){
	var RE = /\/\*[* \t]+\r?\n([\u0000-\uffff]+?)\r?\n[* \t]*\*\//m;
	var m = RE.exec(jsraw);
	info = parseDoxy(m[1]);
	parsedInfo = marked(info);
	
	draw();
};

var getJS = function(){
	// console.log(url);
	var success = function(res){
		jsraw = res.responseText;
		parse();
	};
	
	GM_xmlhttpRequest({
		method: "GET",
		onload: success,
		url: url
	});
};

var checkJS = function(){
	if(!$(".install-link").length || $("#additional-info").length){
		return;
	}
	url = $(".install-link").prop("href");
	getJS();
};

checkJS();
