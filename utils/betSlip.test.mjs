import assert from 'node:assert/strict';
import { test } from 'node:test';

import { isValidAmount, mergeBetRows } from './betSlip.ts';

test('only whole stakes of at least 1 are valid', () => {
    for (const bad of ['500.9', '1e3', ' ', '', '0', '-5', '5a']) assert.equal(isValidAmount(bad), false, bad);
    for (const good of ['500', '1', ' 20 ']) assert.equal(isValidAmount(good), true, good);
});

test('same number and origin is summed', () => {
    assert.deepEqual(mergeBetRows([
        { number: '12', amount: '100' },
        { number: '12', amount: '50' },
    ], 2), [{ number: '12', amount: 150, origin: 'direct' }]);
});

test('direct and reverse legs of one number stay apart', () => {
    assert.deepEqual(mergeBetRows([
        { number: '12', amount: '100' },
        { number: '12', amount: '100', isReverse: true },
        { number: '21', amount: '100', isReverse: true },
    ], 2), [
        { number: '12', amount: 100, origin: 'direct' },
        { number: '12', amount: 100, origin: 'reverse' },
        { number: '21', amount: 100, origin: 'reverse' },
    ]);
});

test('wrong length and invalid stakes are dropped, never sent', () => {
    assert.deepEqual(mergeBetRows([
        { number: '1', amount: '100' },
        { number: '123', amount: '100' },
        { number: '34', amount: '500.9' },
        { number: '', amount: '' },
    ], 2), []);
    assert.deepEqual(mergeBetRows([{ number: '123', amount: '100' }], 3), [{ number: '123', amount: 100, origin: 'direct' }]);
});
