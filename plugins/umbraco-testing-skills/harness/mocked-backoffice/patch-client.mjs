#!/usr/bin/env node
/**
 * Apply / revert the "external example" support overlay on an Umbraco backoffice client.
 *
 * Usage (CLI):
 *   node patch-client.mjs <UMBRACO_CLIENT_PATH>            # apply
 *   node patch-client.mjs <UMBRACO_CLIENT_PATH> --revert   # revert
 *
 * Or import { applyExternalExampleSupport, revertExternalExampleSupport } from Playwright hooks.
 *
 * Behaviour:
 * - Detects clients that already support external examples (the marker string is present in
 *   the source, e.g. the CMS `external-extension-dev-support` branch) and NO-OPs that file.
 * - Otherwise backs up the original to `<file>.mocked-backoffice.bak`, injects the overlay,
 *   and records what it changed in `<client>/.mocked-backoffice-patched.json`.
 * - Revert restores only the files this tool patched, then removes backups + marker. It uses
 *   file backups (not git), so it never clobbers unrelated uncommitted client changes.
 */
import { readFileSync, writeFileSync, existsSync, copyFileSync, rmSync } from 'fs';
import { join, resolve } from 'path';
import { OVERLAY_FILES } from './external-example-support.mjs';

const MARKER = '.mocked-backoffice-patched.json';
const log = (m) => console.log(`[mocked-backoffice] ${m}`);

function normalizeEdits(entry) {
	return entry.edits ?? [{ find: entry.find, replace: entry.replace }];
}

export function applyExternalExampleSupport(clientPath) {
	if (!clientPath) throw new Error('UMBRACO_CLIENT_PATH is required to patch the backoffice client');
	const root = resolve(clientPath);
	if (!existsSync(root)) throw new Error(`Umbraco client not found at ${root}`);

	const markerPath = join(root, MARKER);
	if (existsSync(markerPath)) {
		log('client already patched by this harness — skipping apply');
		return { patched: [] };
	}

	const patched = [];
	for (const entry of OVERLAY_FILES) {
		const filePath = join(root, entry.file);
		if (!existsSync(filePath)) throw new Error(`Expected client file missing: ${filePath}`);
		let content = readFileSync(filePath, 'utf8');

		if (entry.marker && content.includes(entry.marker)) {
			log(`${entry.file}: external-example support already present — leaving as-is`);
			continue;
		}

		for (const { find, replace } of normalizeEdits(entry)) {
			if (!content.includes(find)) {
				throw new Error(
					`${entry.file}: injection anchor not found — the client version may differ from the ` +
						`overlay in external-example-support.js. Update the anchor.\nAnchor:\n${find}`,
				);
			}
			content = content.replace(find, replace);
		}

		copyFileSync(filePath, `${filePath}.mocked-backoffice.bak`);
		writeFileSync(filePath, content);
		patched.push(entry.file);
		log(`patched ${entry.file}`);
	}

	if (patched.length === 0) {
		log('nothing to patch (client already supports external examples) — leaving client untouched');
	} else {
		writeFileSync(markerPath, JSON.stringify({ patched }, null, 2));
	}
	return { patched };
}

export function revertExternalExampleSupport(clientPath) {
	if (!clientPath) return;
	const root = resolve(clientPath);
	const markerPath = join(root, MARKER);
	if (!existsSync(markerPath)) {
		log('no patch marker — nothing to revert');
		return;
	}
	const { patched = [] } = JSON.parse(readFileSync(markerPath, 'utf8'));
	for (const file of patched) {
		const filePath = join(root, file);
		const bak = `${filePath}.mocked-backoffice.bak`;
		if (existsSync(bak)) {
			copyFileSync(bak, filePath);
			rmSync(bak);
			log(`reverted ${file}`);
		}
	}
	rmSync(markerPath);
	log('revert complete — client source restored');
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
	const clientPath = process.argv[2] || process.env.UMBRACO_CLIENT_PATH;
	const revert = process.argv.includes('--revert');
	try {
		if (revert) revertExternalExampleSupport(clientPath);
		else applyExternalExampleSupport(clientPath);
	} catch (err) {
		console.error(`[mocked-backoffice] ${err.message}`);
		process.exit(1);
	}
}
