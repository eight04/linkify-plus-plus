/* eslint-env node */
var request = require("request").defaults({
		headers: {
			"User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:52.0) Gecko/20100101 Firefox/52.0"
		}
	}),
	cheerio = require("cheerio"),
	punycode = require("punycode");
	
function rp(url) {
	return new Promise((resolve, reject) => {
		request(url, (err, res, body) => {
			if (err) {
				reject(err);
			} else {
				resolve(body);
			}
		});
	});
}

Promise.all([
	rp("http://data.iana.org/TLD/tlds-alpha-by-domain.txt"),
	rp("http://research.domaintools.com/statistics/tld-counts/")
]).then(function([tlds, statistic]) {
	var $ = cheerio.load(statistic),
		tldCount = {};
		
	$("#tld-counts tbody").children().each(function(){
		var name = $(this).data("key"),
			amount = $(this).find(".amount").text().replace(/,/g, "");
			
		if (amount == "N/A") {
			amount = 0;
		}
			
		tldCount[name] = +amount;
	});
	
	tlds = tlds.split("\n")
		.map(line => line.toLowerCase())
		.filter(
			line => 
				line 
				&& line[0] != "#" 
				&& (tldCount[line] > 2 || tldCount[line] == undefined)
		);
	
	tlds = tlds.concat(
		tlds.filter(tld => tld.startsWith("xn--"))
			.map(tld => punycode.decode(tld.substr(4)))
	);

	var repl = {
		"TLDS.maxLength": tlds.reduce(
			(max, tld) => tld.length > max ? tld.length : max,
			0
		),
		
		"TLDS.charSet": [...tlds.reduce(
			(s, tld) => {
				for (let c of tld) {
					if (c.charCodeAt(0) >= 128) {
						s.add(c);
					}
				}
				return s;
			},
			new Set
		)].join(""),
		
		"TLDS.tldSet": JSON.stringify(tlds.reduce(
			(o, tld) => {
				o[tld] = true;
				return o;
			},
			{}
		))
	};

	console.log(JSON.stringify(repl, null, "\t"));
});
