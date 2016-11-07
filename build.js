var fs = require("fs"),
	punycode = require("punycode");

var tlds = fs.readFileSync("tlds.txt", "utf8")
	.split("\n")
	.map(line => line.toLowerCase())
	.filter(line => line && line[0] != "#");
	
tlds = tlds.concat(
	tlds.filter(tld => tld.startsWith("xn--"))
		.map(tld => punycode.decode(tld.substr(4)))
)

var repl = {};

repl.maxLength = tlds.reduce(
	(max, tld) => tld.length > max ? tld.length : max,
	0
);

repl.charSet = [...tlds.reduce(
	(s, tld) => {
		for (let c of tld) {
			if (c.charCodeAt(0) >= 128) {
				s.add(c);
			}
		}
		return s;
	},
	new Set
)].join("");

repl.tldSet = JSON.stringify(tlds.reduce(
	(o, tld) => {
		o[tld] = true;
		return o;
	},
	{}
));

console.log(fs.readFileSync("src/linkify-plus-plus.user.js", "utf8").replace(
	/TLDS\.(\w+)/g,
	(match, name) => name in repl ? repl[name] : match
));
