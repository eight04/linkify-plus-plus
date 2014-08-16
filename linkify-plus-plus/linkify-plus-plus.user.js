// ==UserScript==
// @name        Linkify Plus Plus
// @version     2.2.1
// @namespace   eight04.blogspot.com
// @description Based on Linkify Plus. Turn plain text URLs into links.
// @include     http*
// @exclude     http://www.google.tld/search*
// @exclude     https://www.google.tld/search*
// @exclude     http://music.google.com/*
// @exclude     https://music.google.com/*
// @exclude     http://mail.google.com/*
// @exclude     https://mail.google.com/*
// @exclude     http://docs.google.com/*
// @exclude     https://docs.google.com/*
// @exclude     http://mxr.mozilla.org/*
// @grant       GM_addStyle
// ==/UserScript==
//
// Copyright (c) 2011, Anthony Lieuallen
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// * Redistributions of source code must retain the above copyright notice, 
//   this list of conditions and the following disclaimer.
// * Redistributions in binary form must reproduce the above copyright notice, 
//   this list of conditions and the following disclaimer in the documentation 
//   and/or other materials provided with the distribution.
// * Neither the name of Anthony Lieuallen nor the names of its contributors 
//   may be used to endorse or promote products derived from this software 
//   without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" 
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE 
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE 
// ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE 
// LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR 
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF 
// SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS 
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
// CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) 
// ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE 
// POSSIBILITY OF SUCH DAMAGE.
//

/*******************************************************************************
Loosely based on the Linkify script located at:
  http://downloads.mozdev.org/greasemonkey/linkify.user.js

Version history:
 Version 2.2.1 (Aug 17, 2014):
  - Ignore .highlight container.
 Version 2.2 (Aug 15, 2014):
  - Add images support.
  - Use Observer instead of DOMNodeInserted.
 Version 2.1.4 (Aug 12, 2012):
  - Bug fix for when (only some) nodes have been removed from the document.
 Version 2.1.3 (Oct 24, 2011):
  - More excludes.
 Version 2.1.2:
  - Some bug fixes.
 Version 2.1.1:
  - Ignore certain "highlighter" script containers.
 Version 2.1:
  - Rewrite the regular expression to be more readable.
  - Fix trailing "." characters.
 Version 2.0.3:
  - Fix infinite recursion on X(HT)ML pages.
 Version 2.0.2:
  - Limit @include, for greater site/plugin compatibility.
 Version 2.0.1:
  - Fix aberrant 'mailto:' where it does not belong.
 Version 2.0:
  - Apply incrementally, so the browser does not hang on large pages.
  - Continually apply to new content added to the page (i.e. AJAX).
 Version 1.1.4:
  - Basic "don't screw up xml pretty printing" exception case
 Version 1.1.3:
  - Include "+" in the username of email addresses.
 Version 1.1.2:
  - Include "." in the username of email addresses.
 Version 1.1:
  - Fixed a big that caused the first link in a piece of text to
    be skipped (i.e. not linkified).
*******************************************************************************/

var notInTags = [
	  'a', 'code', 'head', 'noscript', 'option', 'script', 'style',
	  'title', 'textarea'];
var textNodeXpath =
  	".//text()[not(ancestor::"+notInTags.join(') and not(ancestor::')+")]";

var urlRE = /(\b|$)(?:[-a-z]+:\/\/|www\.(?!\.))[^\s'"<>(),\u0080-\uffff]+|\b[\w.%+-]+@[\w-.]+\.\w{2,4}\b/gi;
var queue = [];

/******************************************************************************/

linkifyContainer(document.body);

var observerHandler = function(mutations){
	var i, j;
	for(i = 0; i < mutations.length; i++){
		if(mutations[i].type != "childList"){
			continue;
		}
		// console.log(mutations[i]);
		for(j = 0; j < mutations[i].addedNodes.length; j++){
			linkifyContainer(mutations[i].addedNodes[j]);
		}
	}
};

var observerConfig = {
	childList: true,
	subtree: true
};

new MutationObserver(observerHandler, false)
	.observe(document.body, observerConfig);

/******************************************************************************/

var notInTagSet = function(){
	var o = {}, i;
	for(i = 0; i < notInTags.length; i++){
		o[ notInTags[i].toUpperCase() ] = true;
	}
	return o;
}();

var hasValidParent = function(node){
	while(node = node.parentNode){
		if ('PRE' == node.tagName && node.className){
			return false;
		}
		if (node.nodeName && node.nodeName in notInTagSet){
			return false;
		}
		if (node.classList && node.classList.contains("highlight")){
			return false;
		}
	}
	
	return true;
};

function linkifyContainer(container) {
	// Prevent infinite recursion, in case X(HT)ML documents with namespaces
	// break the XPath's attempt to do so.	(Don't evaluate spans we put our
	// classname into.)
	if (container.className && container.className.match(/\blinkifyplus\b/)) {
	  return;
	}
	
	if(container.nodeType && container.nodeType == 3){
		if(hasValidParent(container)){
			linkifyTextNode(container);
		}
		return;
	}

	var xpathResult = document.evaluate(
		  textNodeXpath, container, null,
		  XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);

	var i = 0;
	function continuation() {
		var node = null, counter = 0;
		while (node = xpathResult.snapshotItem(i++)) {
			if (!hasValidParent(node)) {
				continue;
			}
			
			linkifyTextNode(node);

			if (++counter > 50) {
				return setTimeout(continuation, 0);
			}
		}
	}
	setTimeout(continuation, 0);
}

function linkifyTextNode(node) {
	var i, l, m;
	var txt = node.textContent;
	var span = null;
	var p = 0;
	
	while (m = urlRE.exec(txt)) {
		if (null == span) {
			// Create a span to hold the new text with links in it.
			span = document.createElement('span');
			span.className = 'linkifyplus';
		}

		//get the link without trailing dots
		l = m[0].replace(/\.*$/, '');
		var lLen = l.length;
		//put in text up to the link
		span.appendChild(document.createTextNode(txt.substring(p, m.index)));
		//create a link and put it in the span
		a = document.createElement('a');
		a.className = 'linkifyplus';
        if(/(\.jpg|\.png|\.gif)$/i.test(l)){
            var img = document.createElement("img");
            img.src = l;
            a.appendChild(img);
        }else{
            a.appendChild(document.createTextNode(l));
        }
		
		if (l.indexOf(":/") < 0) {
			if (l.indexOf("@") > 0) {
				l = "mailto:" + l;
			} else {
				l = "http://" + l;
		  }
		}
		a.setAttribute('href', l);
		span.appendChild(a);
		//track insertion point
		p = m.index+lLen;
	}
	if (span) {
		//take the text after the last link
		span.appendChild(document.createTextNode(txt.substring(p, txt.length)));
		//replace the original text with the new span
		try {
			node.parentNode.replaceChild(span, node);
		} catch (e) {
			console.error(e);
			console.log(node);
		}
	}
}

if(window.GM_addStyle){
	GM_addStyle('\
	.linkifyplus img {\
		max-width: 100%;\
	}\
	');
}

