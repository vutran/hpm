const plugins = [];

const install = plugin => plugins.push(plugin);

const uninstall = plugin => {
	const index = plugins.indexOf(plugin);
	plugins.splice(index, 1);
};

module.exports = {
	plugins: plugins,
	install: install,
	uninstall: uninstall
};
