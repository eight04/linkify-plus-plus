
function start(){

	function Element(name, attributes){
		var ele = document.createElement(name);
		for(var att in attributes){
			ele.setAttribute(att, attributes[att]);
		}
		return ele;
	}
	
	function Text(s){
		var t = document.createTextNode(s);
		return t;
	}
	
	var canvas = document.querySelector("#bbsContainer");
	var source = document.querySelector("#bbsSource").value;
	console.log(source);
	canvas.innerHTML = "";	// clear output
	
	source = source.replace(/ /g, "\u00A0");
	source = source.replace(/\?\[[\d\;]*?m/g, "_"); //掉字
	var lines = source.split(/\r?\n/);
	console.log(lines);
	var i;
	for (i = 0; i < lines.length; i++) {
		// var line = document.createElement("div");
		// line.className = "line";
		var line = Element("div", {class: "line"});
		var texts = lines[i].split(/\x1B\[[\d\;]*?m/);
		var controls = lines[i].match(/\x1B\[[\d\;]*?m/g);
		if (!controls){
			line.appendChild(Text(texts));
		}else{
			var ctClasses = [];
			var lightenFlag = 0;
			var color = 37;
			var bgColor = 40;
			for (var j = 0; j < controls.length; j++) {
				var cs = controls[j].substr(2, controls[j].length - 3);
				cs = cs.split(/\;/);
				for (var k = 0; k < cs.length; k++) {
					cs[k] *= 1;
					if (cs[k] == "")
						lightenFlag = 0, color = 37, bgColor = 40;
					else if (cs[k] < 2)
						lightenFlag = cs[k];
					else if (cs[k] < 40)
						color = cs[k];
					else if (cs[k] < 50)
						bgColor = cs[k];
				}
				ctClasses[j] = "c" + color + lightenFlag + " b" + bgColor;
			}

			for (var j = 0; j < texts.length; j++) {
				var tt = document.createTextNode(texts[j]);
				var tp = document.createElement("span");
				tp.className = ctClasses[j - 1] ? ctClasses[j - 1] : "";

				tp.appendChild(tt);
				line.appendChild(tp);
			}
		}
		canvas.appendChild(line);
	}
}