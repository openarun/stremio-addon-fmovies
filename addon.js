const { addonBuilder } = require("stremio-addon-sdk")
const fetch = require("node-fetch");
// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/manifest.md
const manifest = {
	"id": "community.fmovies",
	"version": "0.0.5",
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
	"description": "FMovies.to Stremio Addon.\n Watch movies in high quality from FMovies Sources"
}
const builder = new addonBuilder(manifest)

const getMovieCatalog = (catalogID, type) => {
	let catalog;

	switch (catalogID) {
		case "top":
			catalog = [

			]
			break
		default:
			catalog = []
			break
	}
	return Promise.resolve(catalog)

}


builder.defineCatalogHandler(({ type, id }) => {

	let results
	switch (type) {
		case "movie":
			results = getMovieCatalog(id, type)
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
			let meta = await stream_json.data[0];
			return Promise.resolve({ streams: [{ title: "Title: " + meta.name + "\nVidCloud HD ", url: meta.stream_link }] })
		}
		return Promise.resolve({ streams:[]})
	}
	else {
		return Promise.resolve({ streams: [] })
	}

})

module.exports = builder.getInterface()