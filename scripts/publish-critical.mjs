#!/usr/bin/env node
/**
 * Publishes a CRITICAL OTA update to the production channel, then tells the
 * backend so every older bundle is force-reloaded onto it.
 *
 *   npm run update:critical -- --group <preview-update-group-id> --message "fix odds"
 *       republishes a group already tested on the preview channel (preferred)
 *   npm run update:critical -- --message "fix odds"
 *       builds and publishes the current working tree straight to production
 *
 * Needs OTA_PUBLISH_TOKEN (must match the backend's) in the environment or in
 * .env.local. OTA_API_BASE_URL overrides the production API.
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { parseArgs } from 'node:util';

if (existsSync('.env.local')) {
    process.loadEnvFile('.env.local');
}

const API_BASE_URL = process.env.OTA_API_BASE_URL ?? 'https://api.zarmani108.uk/api/v1';
const TOKEN = process.env.OTA_PUBLISH_TOKEN;

const { values } = parseArgs({
    options: {
        group: { type: 'string' },
        message: { type: 'string' },
    },
});

function fail(message) {
    console.error(`\n✖ ${message}`);
    process.exit(1);
}

// Checked before publishing: an update that goes out but is never marked
// critical silently becomes an ordinary, optional one.
if (!TOKEN) {
    fail('OTA_PUBLISH_TOKEN is not set (export it or put it in .env.local).');
}
if (!values.message) {
    fail('--message is required.');
}

const easArgs = values.group
    ? ['update:republish', '--group', values.group, '--destination-channel', 'production']
    : ['update', '--channel', 'production'];
easArgs.push('--message', `[critical] ${values.message}`, '--non-interactive', '--json');

console.log(`→ eas ${easArgs.join(' ')}`);
const eas = spawnSync('eas', easArgs, { encoding: 'utf8', stdio: ['inherit', 'pipe', 'inherit'] });

if (eas.error?.code === 'ENOENT') {
    fail('eas CLI not found. Install it with: npm install -g eas-cli');
}
if (eas.status !== 0) {
    fail(`eas exited with status ${eas.status}. Nothing was published to the backend.`);
}

let updates;
try {
    updates = JSON.parse(eas.stdout.slice(eas.stdout.indexOf('[')));
} catch {
    console.error(eas.stdout);
    fail('Could not parse eas --json output. Set the minimum by hand in the dashboard.');
}

// One update per platform; the newest createdAt covers them all.
const createdAtMs = Math.max(...updates.map((update) => Date.parse(update.createdAt)));
if (!Number.isFinite(createdAtMs)) {
    fail('eas output had no createdAt. Set the minimum by hand in the dashboard.');
}
const otaMinCreatedAt = new Date(createdAtMs).toISOString();

console.log(`→ PUT ${API_BASE_URL}/ota/min-version  ota_min_created_at=${otaMinCreatedAt}`);
const response = await fetch(`${API_BASE_URL}/ota/min-version`, {
    method: 'PUT',
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ ota_min_created_at: otaMinCreatedAt }),
}).catch((error) => fail(`Backend unreachable: ${error.message}`));

if (!response.ok) {
    fail(
        `Backend answered ${response.status}: ${await response.text()}\n` +
        `  The update IS published but NOT forced. Set ${otaMinCreatedAt} in the dashboard.`,
    );
}

console.log(`\n✔ Critical update published (group ${updates[0]?.group}); older bundles will reload onto it.`);
