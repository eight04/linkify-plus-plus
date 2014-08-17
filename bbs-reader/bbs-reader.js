
var bbsReader = function(){
	"use strict";

	var quoteData = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;"
	};
	
	var quote = function(text){
		var key;
		for(key in quoteData){
			text = text.split(key).join(quoteData[key]);
		}
		return text;
	};

	var className = function(c){
		return "c" + c.fg + c.light + " b" + c.bg;
	};
	
	var extract = function(c){
		var i, ct = {light: null, fg: null, bg: null};
		c = c.split(";");
		for(i = 0; i < c.length; i++){
			if(c[i] == 0){
				ct = {light: 0, fg: 37, bg: 40};
			}else if (c[i] == 1){
				ct.light = 1;
			}else if (c[i] < 40){
				ct.fg = c[i];
			}else if (c[i] < 50){
				ct.bg = c[i];
			}
		}
		return ct;
	};

	var apply = function(colorState, ctrl){
		var newState = extract(ctrl), key, state = {};
		for(key in newState){
			if(newState[key] !== null){
				state[key] = newState[key];
			}else{
				state[key] = colorState[key];
			}
		}
		return state;
	};
	
	var parseLine = function(lineText){
		var m = null, 
			p = 0, 
			text = "<span>", 
			RE = /\x1B\[([\d\;]*?)m/g, 
			colorState = {
				light: 0,
				fg: 37,
				bg: 40
			};
			
		while(m = RE.exec(lineText)){
			colorState = apply(colorState, m[1]);
			text += quote(lineText.substring(p, m.index));
			text += '</span><span class="' + className(colorState) + '">';
			p = RE.lastIndex;
		}
		text += quote(lineText.substring(p)) + "</span>";
		return text;
	};
	
	var init = function(source){
		source = source.replace(/ /g, "\u00A0");
		source = source.replace(/\?\[[\d\;]*?m/g, "_"); //掉字
		var lines = source.split(/\r?\n/);
		var i;
		for (i = 0; i < lines.length; i++) {
			lines[i] = "<div class='line'>" + parseLine(lines[i]) + "</div>";
		}
		return lines.join("");
	};
	
	return init;
}();
