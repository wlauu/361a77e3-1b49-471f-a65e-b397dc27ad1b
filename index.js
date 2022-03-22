#!/usr/bin/env node

/**
 * acerCodingChallenge
 * Generate an assessment report for a given student ID and report type.
 *
 * @author Wen Lau <https://github.com/wlauu/361a77e3-1b49-471f-a65e-b397dc27ad1b>
 */

const init = require('./utils/init');
const cli = require('./utils/cli');
const log = require('./utils/log');

const input = cli.input;
const flags = cli.flags;
const { clear, debug } = flags;

(async () => {
	init({ clear });
	input.includes(`help`) && cli.showHelp(0);
	debug && log(flags);
})();
