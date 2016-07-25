'use strict';
// require('mock-fs')({
// 	[`/Users/matheus/.hyperterm.js`]: 'module.exports = {plugins: []};'
// });
const fs = require('fs');
const os = require('os');

const pify = require('pify');
const recast = require('recast');

const fileName = `${os.homedir()}/.hyperterm.js`;

let fileContents;
let parsedFile;
let plugins;
let localPlugins;

try {
	fileContents = fs.readFileSync(fileName, 'utf8');

	parsedFile = recast.parse(fileContents);

	const properties = parsedFile.program.body[0].expression.right.properties;
	plugins = properties.find(property => {
		return property.key.name === 'plugins';
	}).value.elements;

	localPlugins = properties.find(property => {
		return property.key.name === 'localPlugins';
	}).value.elements;
} catch (err) {
	if (err.code !== 'ENOENT') { // ENOENT === !exists()
		throw err;
	}
}

function exists() {
	return fileContents !== undefined;
}

function isInstalled(plugin, locally) {
	const array = locally ? localPlugins : plugins;
	if (array && Array.isArray(array)) {
		return array.find(entry => entry.value === plugin) !== undefined;
	}
	return false;
}

function save() {
	return pify(fs.writeFile)(fileName, recast.print(parsedFile).code, 'utf8');
}

function install(plugin, locally) {
	const array = locally ? localPlugins : plugins;
	return new Promise((resolve, reject) => {
		if (isInstalled(plugin, locally)) {
			return reject('ALREADY_INSTALLED');
		}

		array.push(recast.types.builders.literal(plugin));
		save().then(resolve).catch(err => reject(err));
	});
}

function uninstall(plugin) {
	return new Promise((resolve, reject) => {
		if (!isInstalled(plugin)) {
			return reject('NOT_INSTALLED');
		}

		const index = plugins.findIndex(entry => entry.value === plugin);
		plugins.splice(index, 1);
		save().then(resolve).catch(err => reject(err));
	});
}

function list() {
	if (Array.isArray(plugins)) {
		return plugins.map(plugin => plugin.value).join('\n');
	}
	return false;
}

module.exports.exists = exists;
module.exports.isInstalled = isInstalled;
module.exports.install = install;
module.exports.uninstall = uninstall;
module.exports.list = list;
