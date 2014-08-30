// ==UserScript==
// @name        No Embed Youtube
// @description	replace embed iframe, object with anchor link.
// @namespace   eight04.blogspot.com
// @include     http*
// @exclude		http://www.youtube.com/*
// @exclude		https://www.youtube.com/*
// @version     1.2.4
// @grant       none
// ==/UserScript==

"use strict";

let xpath = "//iframe[contains(@src,'youtube.com/embed/')]|" +
	"//iframe[contains(@src,'youtube.com/v/')]|" +
	"//object[./param[contains(@value,'youtube.com/v/')]]|" +
	"//embed[contains(@src,'youtube.com/v/') and not(ancestor::object)]";
	
let unEmbed = function(node){
	let result = document.evaluate(
		xpath, node, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
	
	let element = null;
	var i = 0, j;
	
	while(element = result.snapshotItem(i++)){
	
		// iframe or embed
		let url = element.src;
		
		// object
		if(!url){
			for(j = 0; j < element.childNodes.length; j++){
				let pa = element.childNodes[j];
				if(pa.getAttribute("name") == "movie"){
					url = pa.getAttribute("value");
					break;
				}
			}
		}
		
		if(!url){
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

var thread = function(){
	var data = [],
		maxLoop = 50,
		pos = 0,
		loopCount = 0,
		started = false;
		
	var worker = function(){
		for (loopCount = 0; pos < data.length && loopCount < maxLoop; pos++, loopCount++) {
			unEmbed(data[pos]);
		}
	};
	
	var start = function(){
		if (started) return;
		
		started = true;
		
		worker();
		
		if (pos < data.length) {
			loopCount = 0;
			setTimeout(worker, 16);
		} else {
			started = false;
			data = [];
			pos = 0;
		}
	};
	
	var queue = function(node){
		data.push(node);
	};
	
	return {
		start: start,
		queue: queue
	};
}();

var observer = function(){
	// Observer
	
	new MutationObserver(function(mutations){
		var i, j, m;
		for(i = 0; i < mutations.length; i++){
			m = mutations[i];
			if(m.type != "childList"){
				return;
			}
			for(j = 0; j < m.addedNodes.length; j++){
				thread.queue(m.addedNodes[j]);
			}
		}
		thread.start();
	})
		.observe(document.body, {
			childList: true,
			subtree: true
		});
}();
