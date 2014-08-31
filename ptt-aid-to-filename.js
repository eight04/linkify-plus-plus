var table = function(){
	var table = {}, i;

	for (i = 0; i < 10; i++) {
		table[i.toString()] = i;
	}

	for (i = 0; i < 26; i++) {
		table[String.fromCharCode(i + 65)] = i + 10;
	}

	for (i = 0; i < 26; i++) {
		table[String.fromCharCode(i + 97)] = i + 36
	}

	table["-"] = 62;
	table["_"] = 63;
	
	return table;
}();

function zpad(s, n) {
	var k = n - s.length;
	if (k > 0) {
		return Array(k + 1).join("0");
	}
	return s;
}

function aidu2fn(aids){
	var l = aids.length;
	var type = (aids[0] >> 20) & 0xf;
	var v1 = ((aids[0] << 12) | (aids[1] >> 12)) & 0xffffffff;
	var v2 = aids[1] & 0xfff;
	
	var c = type ? "G" : "M";
	var fn = c + "." + v1 + ".A." + zpad(v2.toString(16), 3).toUpperCase();
	return fn;
}

function aidc2aidu(aidc){
	var i = 0, aidu = 0, v, aids = [];
	if (!aidc) return;
	while (i < aidc.length) {
		if (aidc[i] == "@") {
			break;
		}
		v = table[aidc[i]];
		if (v === undefined) {
			return 0;
		}
		aidu = aidu << 6;
		aidu = aidu | (v & 0x3f);
		if (i == 3 || i == 7) {
			aids.push(aidu);
			aidu = 0;
		}
		i++;
	}
  return aids;
}

function test(){
	var aidc = "1K0NIu-h";
	var aids = aidc2aidu(aidc);
	var fn = aidu2fn(aids);
	console.log(aidc, aids, fn);
}

test();
