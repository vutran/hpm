# hpm [![Build Status](https://travis-ci.org/matheuss/hpm.svg?branch=master)](https://travis-ci.org/matheuss/hpm) [![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo) [![Coverage Status](https://coveralls.io/repos/github/matheuss/hpm/badge.svg?branch=master)](https://coveralls.io/github/matheuss/hpm?branch=master) [![codecov](https://codecov.io/gh/matheuss/hpm/branch/master/graph/badge.svg)](https://codecov.io/gh/matheuss/hpm)


✨ A plugin manager for HyperTerm ✨

<img src="screenshot.gif" width="629">

## Install

```
npm install -g hpm-cli
```

## Usage

```
❯ hpm --help

  Usage: hpm [options]

  Options:

    -h, --help             output usage information
    -V, --version          output the version number
    i, install <plugin>    Install a plugin
    u, uninstall <plugin>  Uninstall a plugin (aliases: rm, remove)
    ls, list               List installed plugins
```

## Upcoming
- [ ] Bulk commands (e.g. `hpm i hyperpower hyperyellow`)
- [ ] `hpm help`
- [ ] `hpm search <query>`
- [x] `hpm unistall <plugin>`
- [x] `hpm ls`

## Maybe
- [ ] `hpm init` (or something like that) that downloads HyperTerm for you
