const { addonBuilder } = require("stremio-addon-sdk")
const fetch = require("node-fetch");
// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/manifest.md
const manifest = {
	"id": "community.fmovies",
	"version": "0.0.8",
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
	"description": "FMovies.to Stremio Addon.\n Watch movies in high quality HD, SD from FMovies Sources",
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
			let streams =[];
			for(meta of metas){
				for (i in meta.stream_links){
					streams.push({ title: "Title: " + meta.name+"\n"+i==0?"360p":i==1?"720p":i==2?"1080p":"", url: meta.stream_links[i]})
				}
			}
			return Promise.resolve({ streams: { title: "Title: " + meta.name + "\nVidCloud HD ", url: meta.stream_link } })
		}
		return Promise.resolve({ streams: [] })
	}
	else {
		return Promise.resolve({ streams: [] })
	}

})

module.exports = builder.getInterface()