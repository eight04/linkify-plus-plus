// ==UserScript==
// @name        Select text inside a link like Opera
// @namespace   eight04.blogspot.com
// @description Disable link draging and select text.
// @include     http://*
// @include     https://*
// @version     3.0.1
// @grant		GM_addStyle
// @run-at      document-start
// ==/UserScript==

/**

With this script, you can force the firefox to select text inside links, 
instead of dragging them around. If you need to drag them, just hold the ctrl 
key when dragging.

![](https://i.imgur.com/f7TgRur.png)
![](https://i.imgur.com/NSqXG5n.png)

*	Version 3.0.1 (Aug 17, 2014)
	- Change the timing of uninit. Will uninit each time mouseup.
*	Version 3.0 (Aug 17, 2014)
	- Rewrite with my coding style.

 */

var force = {
	handleEvent: function(e){
		if(e.type == "click"){
			if(this.preventClick){
				e.preventDefault();
				e.stopPropagation();
				this.preventClick = false;
			}
		}else if(e.type == "mousedown"){
			if(e.button || e.ctrlKey || e.altKey || e.shiftKey){
				return;
			}
			if(e.target.nodeName == "IMG"){
				return;
			}
			var a = e.target;
			while(a.nodeName != "A" && a.nodeName != "HTML"){
				a = a.parentNode;
			}
			if(!a.href){
				return;
			}
			this.init(a);
		}else if(e.type == "mouseup"){
			if(!this.initialized){
				return;
			}

			if(getSelection().toString()){
				this.preventClick = true;
			}
			
			this.uninit();
		}
	},
	init: function(a){
		this.initialized = true;
		this.cached = a.getAttribute("draggable");
		this.link = a;
		
		a.classList.add("force-select");
		a.draggable = false;
	},
	uninit: function(){
		if(this.cached === null){
			this.link.removeAttribute("draggable");
		}else{
			this.link.draggable = this.cached;
		}
		this.link.classList.remove("force-select");
		
		this.initialized = false;
		this.cached = null;
		this.link = null;
	}
};

document.addEventListener("mousedown", force, false);
document.addEventListener("mouseup", force, false);
document.addEventListener("click", force, true);
document.addEventListener("DOMContentLoaded", function(){
	GM_addStyle(".force-select{ -moz-user-select: text!important; }");
}, false);
