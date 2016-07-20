'use strict';
const fs = require('fs');
const os = require('os');

const pify = require('pify');

const fileName = `${os.homedir()}/.hyperterm.js`;

let contents;
try {
	contents = require(fileName);
} catch (err) {
	throw err;
}

function exists() {
	return contents !== undefined;
}

function isInstalled(plugin) {
	return contents.plugins.indexOf(plugin) > -1;
}

function install(plugin) {
	return new Promise((resolve, reject) => {
		if (isInstalled(plugin)) {
			return reject('ALREADY_INSTALLED');
		}
		pify(fs.readFile)(fileName, 'utf8').then(data => {
			const lastInstalledPlugin = getLastInstalledPlugin();
			if (lastInstalledPlugin) {
				return data.replace(`'${lastInstalledPlugin}'`,
									`'${lastInstalledPlugin}', '${plugin}'`);
			}
			return data.replace('plugins: [],', `plugins: ['${plugin}'],`);
		}).then(data => pify(fs.writeFile)(fileName, data, 'utf8'))
			.then(resolve)
			.catch(err => reject(err));
	});
}

function getLastInstalledPlugin() {
	return contents.plugins[contents.plugins.length - 1];
}

function uninstall(plugin) {
	return new Promise((resolve, reject) => {
		if (!isInstalled(plugin)) {
			return reject('NOT_INSTALLED');
		}

		const regex = new RegExp(`,?\\s?'${plugin}',?\\s?`);
		pify(fs.readFile)(fileName, 'utf8')
			.then(data => data.replace(regex, ''))
			.then(data => pify(fs.writeFile)(fileName, data, 'utf8'))
			.then(resolve)
			.catch(err => reject(err));
	});
}

function list() {
	let plugins = contents.plugins;

	if (Array.isArray(plugins) && plugins.length > 0) {
		return plugins.join('\n');
	}
	return false;
}

module.exports.exists = exists;
module.exports.isInstalled = isInstalled;
module.exports.install = install;
module.exports.uninstall = uninstall;
module.exports.list = list;
