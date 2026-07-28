#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { readFileSync, realpathSync } from 'node:fs';
import { resolve } from 'node:path';

const EXPECTED_ROLE = 'engine';
const EXPECTED_REPOSITORY = 'dyan-premeq/Saki-For-BlogPremeq';
const root = realpathSync(resolve(process.cwd()));

function fail(message) {
	console.error(`Repository identity check failed: ${message}`);
	console.error('Run this command from the website engine repository root.');
	process.exit(1);
}

let manifest;
try {
	manifest = JSON.parse(readFileSync(resolve(root, 'repo-role.json'), 'utf8'));
} catch (error) {
	fail(`cannot read repo-role.json (${error instanceof Error ? error.message : String(error)})`);
}

if (manifest.role !== EXPECTED_ROLE || manifest.repository !== EXPECTED_REPOSITORY) {
	fail(
		`repo-role.json must declare role=${EXPECTED_ROLE} and repository=${EXPECTED_REPOSITORY}`,
	);
}

function git(...args) {
	return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

let gitRoot;
try {
	gitRoot = realpathSync(git('rev-parse', '--show-toplevel'));
} catch {
	fail('this directory is not a Git worktree');
}

if (gitRoot !== root) {
	fail(`Git worktree root is ${gitRoot}, not ${root}`);
}

let origin;
try {
	origin = git('remote', 'get-url', 'origin');
} catch {
	fail('the origin remote is missing');
}

function normalizeGitHubRepository(remote) {
	const scpMatch = /^git@github\.com:(.+?)(?:\.git)?$/.exec(remote);
	if (scpMatch) return scpMatch[1];

	try {
		const url = new URL(remote);
		if (url.hostname.toLowerCase() !== 'github.com') return null;
		return url.pathname.replace(/^\//, '').replace(/\.git$/, '');
	} catch {
		return null;
	}
}

const repository = normalizeGitHubRepository(origin);
if (repository?.toLowerCase() !== EXPECTED_REPOSITORY.toLowerCase()) {
	fail(`origin points to ${origin}, expected ${EXPECTED_REPOSITORY}`);
}

console.log(`Repository identity: ${EXPECTED_ROLE} (${EXPECTED_REPOSITORY})`);
