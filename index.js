#!/usr/bin/env node
'use strict';
const chalk = require('chalk');
const npmName = require('npm-name');
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
	return npmName(plugin).then(available => {
		if (available) {
			console.error(chalk.red(`${plugin} not found on npm`));
			process.exit(1);
		}

		hyperTerm.install(plugin)
			.then(() => console.log(chalk.green(`${plugin} installed successfully!`)))
			.catch(err => {
				if (err === 'ALREADY_INSTALLED') {
					console.error(chalk.red(`${plugin} is already installed`));
				} else {
					throw err;
				}
			});
	});
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

program.help();
