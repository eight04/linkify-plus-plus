function getYoutubeId(url) {
	var match =
		url.match(/https?:\/\/www\.youtube\.com\/watch\?v=([^&]+)/) ||
		url.match(/https?:\/\/youtu\.be\/([^?]+)/);
	return match && match[1];
}


var embedMe = function() {

	var embedFunction = {
		image: function(url, element) {
			var obj;
			if (!config.useImg || !/^[^?#]+\.(jpg|png|gif|jpeg)($|[?#])/i.test(url)) {
				return null;
			}
			obj = document.createElement("img");
			obj.className = "embedme-image";
			obj.alt = url;
			obj.src = url;
			element = element.cloneNode(false);
			element.appendChild(obj);
			return element;
		},
		youtube: function(url) {
			var id, cont, wrap, obj;
			if (!config.useYT || !(id = getYoutubeId(url))) {
				return null;
			}
			cont = document.createElement("div");
			cont.className = "embedme-video";

			wrap = document.createElement("div");
			wrap.className = "embedme-video-wrap";
			cont.appendChild(wrap);

			obj = document.createElement("iframe");
			obj.className = "embedme-video-iframe";
			obj.src = "https://www.youtube.com/embed/" + id;
			obj.setAttribute("allowfullscreen", "true");
			obj.setAttribute("frameborder", "0");
			wrap.appendChild(obj);

			return cont;
		}
	};

	function embedContent(element) {
		var url = element.href, key, embed;

		if (!element.parentNode) {
			return;
		}

		for (key in embedFunction) {
			embed = embedFunction[key](url, element);
			if (embed) {
				embed.classList.add("embedme");
				element.parentNode.replaceChild(embed, element);
				return;
			}
		}
		//	element.classList.add("embedme-fail");
	}

	function embed(node) {
		var result, nodes = [], i, xpath;

		if (config.embedAll) {
			xpath = ".//a[not(*) and text() and @href and not(contains(@class, 'embedme'))]";
		} else {
			xpath = ".//a[not(*) and text() and @href and not(contains(@class, 'embedme')) and contains(@class, 'linkifyplus')]";
		}

		result = document.evaluate(xpath, node, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);

		for (i = 0; i < result.snapshotLength; i++) {
			nodes.push(result.snapshotItem(i));
		}

		loop(nodes, embedContent);
	}

	return {
		embed: embed
	};
}();

observeDocument(embedMe.embed);

function template(text, option) {
	var key;
	for (key in option) {
		text = text.split("@" + key).join(option[key]);
	}
	return text;
}

