#!/usr/bin/env node
'use strict';
const {rename, writeFileSync} = require('fs');
const {homedir} = require('os');

const chalk = require('chalk');
const columnify = require('columnify');
const execa = require('execa');
const fileExists = require('file-exists');
const got = require('got');
const pify = require('pify');
const opn = require('opn');
const ora = require('ora');
const program = require('commander');
const updateNotifier = require('update-notifier');

const hyperTerm = require('./hyperterm');
const pkg = require('./package');

updateNotifier({pkg}).notify();

program
	.version(pkg.version)
	.option('i, install <plugin>', 'Install a plugin')
	.option('u, uninstall <plugin>', 'Uninstall a plugin (aliases: rm, remove)')
	.option('ls, list', 'List installed plugins')
	.option('s, search <query>', 'Search for plugins on npm')
	.option('ls-remote', 'List plugins available on npm')
	.option('d, docs <plugin>', 'Open the npm page of the <plguin>')
	.option('f, fork <plguin>', 'Forks a plugin from npm into your ~/.hyperterm_plugins/local')
	.parse(process.argv);

if (!hyperTerm.exists()) {
	let msg = chalk.red('You don\'t have HyperTerm installed! :(\n');
	msg += `${chalk.red('You are missing')} ${chalk.green('awesomeness')}`;
	msg += chalk.red(`.\n`);
	msg += chalk.green('Check it out: https://hyperterm.org/');
	console.error(msg);
	process.exit(1);
}

if (program.install) {
	const plugin = program.install;
	return hyperTerm.install(plugin)
		.then(() => console.log(chalk.green(`${plugin} installed successfully!`)))
		.catch(err => console.error(chalk.red(err)));
}

if (['rm', 'remove'].indexOf(program.args[0]) !== -1) {
	program.uninstall = program.args[1];
}
if (program.uninstall) {
	const plugin = program.uninstall;
	return hyperTerm.uninstall(plugin)
		.then(() => console.log(chalk.green(`${plugin} uninstalled successfully!`)))
		.catch(err => {
			if (err === 'NOT_INSTALLED') {
				console.error(chalk.red(`${plugin} is not installed`));
			} else {
				throw err;
			}
		});
}

if (program.list) {
	let plugins = hyperTerm.list();

	if (plugins) {
		console.log(plugins);
	} else {
		console.log(chalk.red(`No plugins installed yet.`));
	}
	process.exit(1);
}

const lsRemote = () => { // note that no errors are catched by thif function
	const URL = 'http://registry.npmjs.org/-/_view/byKeyword?startkey=[%22hyperterm%22]&endkey=[%22hyperterm%22,{}]&group_level=4';

	return got(URL)
		.then(response => JSON.parse(response.body).rows)
		.then(entries => entries.map(entry => entry.key))
		.then(entries => entries.map(entry => {
			return {name: entry[1], description: entry[2]};
		}))
		.then(entries => entries.map(entry => {
			entry.name = chalk.green(entry.name);
			return entry;
		}));
};

if (program.search) {
	const spinner = ora('Searching').start();
	const query = program.search.toLowerCase();

	return lsRemote(query)
		.then(entries => {
			return entries.filter(entry => {
				return entry.name.indexOf(query) !== -1 ||
					entry.description.toLowerCase().indexOf(query) !== -1;
			});
		})
		.then(entries => {
			spinner.stop();
			if (entries.length === 0) {
				console.error(`${chalk.red('✖')} Searching`);
				console.error(chalk.red(`Your search '${query}' did not match any plugins`));
				console.error(`${chalk.red('Try')} ${chalk.green('hpm ls-remote')}`);
				process.exit(1);
			} else {
				let msg = columnify(entries);

				console.log(`${chalk.green('✔')} Searching`);
				msg = msg.substring(msg.indexOf('\n') + 1); // remove header
				console.log(msg);
			}
		}).catch(err => {
			spinner.stop();
			console.error(`${chalk.red('✖')} Searching`);
			console.error(chalk.red(err)); // TODO
		});
}

if (program.lsRemote) {
	const spinner = ora('Searching').start();

	return lsRemote()
		.then(entries => {
			let msg = columnify(entries);

			spinner.stop();
			console.log(`${chalk.green('✔')} Searching`);

			msg = msg.substring(msg.indexOf('\n') + 1); // remove header
			console.log(msg);
		}).catch(err => {
			spinner.stop();
			console.error(`${chalk.red('✖')} Searching`);
			console.error(chalk.red(err)); // TODO
		});
}

if (program.docs) {
	return opn(`https://npmjs.com/package/${program.docs}`, {wait: false});
}

if (program.fork) {
	const spinner = ora('Installing').start();
	const plugin = program.fork;
	return hyperTerm.existsOnNpm(plugin).then(() => {
		if (hyperTerm.isInstalled(plugin, true)) {
			spinner.stop();
			console.error(`${chalk.red('✖')} Installing`);
			console.error(chalk.red(`${plugin} is already installed locally`));
			process.exit(1);
		}

		const folderName = `${homedir()}/.hyperterm_plugins/local`;
		const fileName = `${folderName}/package.json`;
		if (!fileExists(fileName)) {
			writeFileSync(fileName, '{"name": "hpm-placeholder"}', 'utf-8');
		}

		execa('npm', ['i', plugin], {cwd: folderName})
			.then(() => pify(rename)(`${folderName}/node_modules/${plugin}`, `${folderName}/${plugin}`))
			.then(() => hyperTerm.install(plugin, true))
			.then(() => {
				spinner.stop();
				console.log(`${chalk.green('✔')} Installing`);
				console.log(chalk.green(`${plugin} installed locally successfully!`));
				console.log(chalk.green(`Check ${folderName}/${plugin}`));
			})
			.catch(err => {
				spinner.stop();
				console.error(`${chalk.red('✖')} Installing`);
				console.error(chalk.red(err)); // TODO
			});
	}).catch(err => {
		spinner.stop();
		console.error(`${chalk.red('✖')} Installing`);
		if (err.code === 'NOT_FOUND_ON_NPM') {
			console.error(chalk.red(err.message));
		} else {
			console.error(chalk.red(err));
		}
		process.exit(1);
	});
}

program.help();
