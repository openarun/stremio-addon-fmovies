const { addonBuilder } = require("stremio-addon-sdk")
const fetch = require("node-fetch");
// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/manifest.md
const manifest = {
	"id": "community.fmovies",
	"version": "0.1.0",
	"catalogs": [
		{
			"type": "movie",
			"id": "top",
			"name": "FMovies",
		},
	],
	"resources": [
		"catalog",
		"stream",
	],
	"types": [
		"movie",
	],
	"name": "FMovies",
	"description": "FMovies Stremio Addon.\nWatch movies in FullHD (1080p), HD (720p), SD (360p) from FMovies Sources",
	"logo": "https://i.imgur.com/Cwb4GYt.png"
}
const builder = new addonBuilder(manifest)

const getMovieCatalog = async (catalogID, type) => {
	let catalog = [];
	console.log(catalogID, type)
	switch (catalogID) {
		case "top":
			let resp = await fetch(`${process.env.API_URL}/top`)
			let stream_json = await resp.json()
			for (data of stream_json.data) {
				catalog.push({ id: data, type: type });
			}
			break
		default:
			catalog = []
			break
	}
	return Promise.resolve(catalog)
}


builder.defineCatalogHandler(({ type, id }) => {
	console.log(type, id)
	let results
	switch (type) {
		case "movie":
			results = getMovieCatalog(id, type);
			break
		default:
			results = []
			break
	}

	return results.then(items => ({
		metas: items
	}))

})


builder.defineStreamHandler(async ({ type, id }) => {

	if (type == "movie") {
		let stream_resp = await fetch(`${process.env.API_URL}/stream/${id}`)
		let stream_json = await stream_resp.json()
		if (stream_json && stream_json.data) {
			let metas = await stream_json.data;
			let streams = [];
			for (meta of metas) {
				for (i in meta.stream_links) {
					var standard;
					switch (i) {
<<<<<<< HEAD
						case "0":
							standard = "1080p (FHD)";
=======
						case "2":
							standard = "360p (SD)";
>>>>>>> 0c6f0f291b7cdd3d2ec522459da091418242c7dc
							break;
						case "1":
							standard = "720p (HD)";
							break;
<<<<<<< HEAD
						case "2":
							standard = "360p (SD)";
=======
						case "0":
							standard = "1080p (FHD)";
>>>>>>> 0c6f0f291b7cdd3d2ec522459da091418242c7dc
							break;
						default:
							standard = "";
					}
					streams.push({ title: `Title: ${meta.name} \n Quality: ${standard}`, url: meta.stream_links[i] })
				}
			}
			return Promise.resolve({ streams: streams })
		}
		return Promise.resolve({ streams: [] })
	}
	else {
		return Promise.resolve({ streams: [] })
	}

})

module.exports = builder.getInterface()