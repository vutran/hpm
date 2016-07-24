import {homedir} from 'os';

import test from 'ava';
import mockFs from 'mock-fs';
import isCi from 'is-ci';

let api = require('../hyperterm');

test.before(async t => {
	if (api.exists() && !isCi) {
		// it is ok to have HyperTerm if you are not Travis
	} else {
		// Travis can't have HyperTerm
		t.is(false, api.exists());
		await t.throws(api.install('🦁'));
		await t.throws(api.uninstall('🦁'));
	}

	// if !isCi(), we need to mock the files because they do not exist.
	// if  isCi(), we need to mock the files to do not spoil the config

	mockFs({
		[`${homedir()}/.hyperterm.js`]: 'module.exports = {plugins: []};'
	});

	delete require.cache[require.resolve('../hyperterm')];
	delete require.cache[require.resolve('../hyperterm')];
	api = require('../hyperterm');

	t.is(true, api.exists());
});

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
		t.true(api.isInstalled('🦁'));
	});
});

test.serial('install another plugin', t => {
	return api.install('🦄').then(() => {
		t.true(api.isInstalled('🦄'));
	});
});

test.serial('list installed plugins', t => {
	const list = api.list();
	t.true(list.endsWith('🦁\n🦄'));
});

test.serial('try to install a plugin that is already installed', async t => {
	const err = await t.throws(api.install('🦁'));
	t.is(err, 'ALREADY_INSTALLED');
});

test.serial('uninstall a plugin', t => {
	return api.uninstall('🦁').then(() => {
		t.false(api.isInstalled('🦁'));
	});
});

test.serial('uninstall another plugin', t => {
	return api.uninstall('🦄').then(() => {
		t.false(api.isInstalled('🦄'));
	});
});

test.serial('try to unistall a plugin that is not installed', async t => {
	const err = await t.throws(api.uninstall('🦁'));
	t.is(err, 'NOT_INSTALLED');
});
