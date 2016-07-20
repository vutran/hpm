import {homedir} from 'os';

import test from 'ava';
import mockFs from 'mock-fs';

mockFs({
	[`${homedir()}/.hyperterm.js`]: 'module.exports = {plugins: []};'
});
require('mock-require')(`${require('os').homedir()}/.hyperterm.js`, './_hyperterm-mocker');

const api = require('../hyperterm');
const hyperTermMocker = require('./_hyperterm-mocker');

test.after(() => {
	mockFs.restore();
});

test('check if hyperterm is installed', t => {
	t.true(api.exists());
});

test.serial('check if a plugin is not installed', t => {
	t.false(api.isInstalled('🦁'));
});

test.serial('install a plugin', t => {
	return api.install('🦁').then(() => {
		hyperTermMocker.install('🦁');
		t.true(api.isInstalled('🦁'));
	});
});

test.serial('list installed plugins', t => {
	const list = api.list();
	t.is(list, '🦁');
});

test.serial('try to install a plugin that is already installed', async t => {
	const err = await t.throws(api.install('🦁'));
	t.is(err, 'ALREADY_INSTALLED');
});

test.serial('uninstall a plugin', t => {
	return api.uninstall('🦁').then(() => {
		hyperTermMocker.uninstall('🦁');
		t.false(api.isInstalled('🦁'));
	});
});

test.serial('try to unistall a plugin that is not installed', async t => {
	const err = await t.throws(api.uninstall('🦁'));
	t.is(err, 'NOT_INSTALLED');
});
