/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
	mount: {
		src: { url: '/', static: false, resolve: true },
		static: { url: '/', static: true, resolve: false },
	},
	plugins: ['snowpack-plugin-glslify'],
	routes: [
		/* Enable an SPA Fallback in development: */
		// {"match": "routes", "src": ".*", "dest": "/index.html"},
	],
	optimize: {
		bundle: true,
		minify: true,
		target: 'es2018',
	},
	packageOptions: {},
	devOptions: {},
	buildOptions: {},
}
