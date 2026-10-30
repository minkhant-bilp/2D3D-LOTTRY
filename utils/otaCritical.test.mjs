import assert from 'node:assert/strict';
import { test } from 'node:test';

import { shouldForce } from './otaCritical.ts';

const MIN = Date.parse('2026-10-30T08:15:42.123Z');

test('never forces without an available update (no reload loop)', () => {
    assert.equal(shouldForce(false, new Date(MIN - 1000), MIN), false);
});

test('never forces when no minimum is set', () => {
    assert.equal(shouldForce(true, new Date(MIN - 1000), null), false);
});

test('forces a bundle older than the minimum', () => {
    assert.equal(shouldForce(true, new Date(MIN - 1), MIN), true);
});

test('does not force the bundle that set the minimum', () => {
    assert.equal(shouldForce(true, new Date(MIN), MIN), false);
});

test('treats a bundle without createdAt as oldest', () => {
    assert.equal(shouldForce(true, null, MIN), true);
});
