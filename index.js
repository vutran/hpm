#!/usr/bin/env node
const chalk = require('chalk');
const npmName = require('npm-name');
const program = require('commander');

const hyperTerm = require('./hyperterm');
const pkg = require('./package');

program
  .version(pkg.version)
  .option('install <plugin>', 'Install a plugin')
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
	npmName(plugin).then(available => {
		if (available) {
			console.error(chalk.red(`${plugin} not found on npm`));
			process.exit(1);
		}

		hyperTerm.install(plugin)
			.then(() => console.log(chalk.green(`${plugin} installed successfully!`)))
			.catch(err => {
				if (err === 'ALREADY_INSTALLED') {
					console.error(chalk.red(`${plugin} is already installed`));
				}
			});
	});
}
