// ==UserScript==
// @name        No Embed Youtube
// @description	replace embed iframe, object with anchor link.
// @namespace   eight04.blogspot.com
// @include     http*
// @exclude		http://www.youtube.com/*
// @exclude		https://www.youtube.com/*
// @version     1.2.1
// @grant       none
// ==/UserScript==

"use strict";

let xpath = "//iframe[contains(@src,'youtube.com/embed/')]|" +
	"//iframe[contains(@src,'youtube.com/v/')]|" +
	"//object[./param[contains(@value,'youtube.com/v/')]]|" +
	"//embed[contains(@src,'youtube.com/v/') and not(ancestor::object)]";

var performance = {
	snapShot: 0,
	unembed; 0
};
setInterval(function(){console.log(performance)}, 1000);
	
let unEmbed = function(node){
	
	let result = document.evaluate(
		xpath, node, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
	
	let i = 0;
	let element = null;
	
	while(element = result.snapshotItem(i++)){
		performance.snapshot++;
	
		// iframe or embed
		let url = element.src;
		
		// object
		if(!url){
			for(let i = 0; i < element.childNodes.length; i++){
				let pa = element.childNodes[i];
				if(pa.getAttribute("name") == "movie"){
					url = pa.getAttribute("value");
					break;
				}
			}
		}
		
		if(!url){
			console.log("can't find url!", element);
			continue;
		}
		
		let id = url.match(/(embed|v)\/(.+?)(\?|&|$)/)[2];
		let a = document.createElement("a");
		let pageUrl = "http://www.youtube.com/watch?v=" + id;
		a.appendChild(document.createTextNode(pageUrl));
		a.setAttribute("href", pageUrl.replace("http:", ""));
		a.setAttribute("target", "_blank");
		a.className = "unembed";
		
		element.parentNode.replaceChild(a, element);
	}
};

unEmbed(document.documentElement);

var observer = function(){
	new MutationObserver(function(mutations){
		var i, j, m;
		for(i = 0; i < mutations.length; i++){
			m = mutations[i];
			if(m.type != "childList"){
				return;
			}
			for(var j = 0; j < m.addedNodes.length; j++){
				unEmbed(m.addedNodes[j]);
			}
		}
	})
		.observe(document.body, {
			childList: true,
			subtree: true
		});
}();

