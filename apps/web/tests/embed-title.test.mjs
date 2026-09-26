import { test } from 'node:test';
import assert from 'node:assert/strict';
import { embedTitle } from '../src/lib/embed-title.ts';

test('short titles are preserved', () => {
  assert.equal(embedTitle('Competitive Programming with Zed'), 'Competitive Programming with Zed');
});

test('long titles end at the last complete word within the limit', () => {
  assert.equal(embedTitle('A guide to competitive programming with Zed and other useful tools', 35), 'A guide to competitive programming…');
});

test('a single long word does not spill beyond the limit', () => {
  assert.equal(embedTitle('Supercalifragilisticexpialidocious', 12), 'Supercalifr…');
});

test('extra whitespace does not create awkward wrapping', () => {
  assert.equal(embedTitle('  Working   with\nZed  ', 20), 'Working with Zed');
});
