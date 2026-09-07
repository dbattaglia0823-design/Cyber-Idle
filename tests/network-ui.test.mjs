import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CityTab, DistrictHub, MoreTab, CharacterTab } from '../src/App.tsx';
import { DistrictMap } from '../src/components/DistrictMap.tsx';
import { createInitialState, chooseStartingPath } from '../src/systems/gameState.ts';
import { districts } from '../src/data/districts.ts';

const stateForUi = () => chooseStartingPath(createInitialState(), 'streetborn');

test('Map opens on the district directory with training accessible separately', () => {
  const html = renderToStaticMarkup(createElement(CityTab, { state: stateForUi(), openRequest: null, notices: [] }));
  assert.match(html, /class="rpg-hero"/);
  assert.ok(html.includes("NEON<span>//</span><br/>CITY"));
  assert.match(html, /aria-label="Map sections"/);
  assert.match(html, /Training &amp; supplies/);
  assert.match(html, /aria-label="City districts"/);
  assert.doesNotMatch(html, /class="runner-guide"/);
  assert.doesNotMatch(html, /NaN|undefined/);
});

test('city directory exposes every district and keeps locked access visible', () => {
  const html = renderToStaticMarkup(createElement(DistrictMap, { state: stateForUi(), activeDistrictId: null, onOpenDistrict() {} }));
  const directory = html.split('aria-label="City districts">')[1]?.split('</nav>')[0];
  assert.ok(directory);
  assert.equal((directory.match(/<button /g) ?? []).length, 8);
  for (const district of districts) assert.ok(directory.includes(district.name));
  assert.equal((directory.match(/Access locked/g) ?? []).length, 7);
  assert.match(html, /Enter District/);
});

test('every district uses the Main hero and horizontal skill tabs', () => {
  const state = stateForUi();
  for (const district of districts) state.districts[district.id].unlocked = true;
  for (const district of districts) {
    const html = renderToStaticMarkup(createElement(DistrictHub, { state, districtId: district.id, activeActivity: null, openCategoryRequest: null }));
    assert.match(html, /aria-label="District activities"/);
    assert.match(html, /class="rpg-hero"/);
    assert.match(html, /district-primary-tabs/);
    assert.ok(html.includes("DISTRICT / COMPLETION"));
    assert.match(html, /Services/);
    assert.doesNotMatch(html, /network-mobile-navigation|network-sidebar/);
    assert.match(html, /Back to city/);
    assert.match(html, /District intel/);
    assert.doesNotMatch(html, /district-tab-stack|NaN|undefined/);
  }
});

test('all personal terminal sections render inside the shared shell', () => {
  for (const section of ['story', 'companions', 'itemIndex', 'simCache', 'settings']) {
    const html = renderToStaticMarkup(createElement(MoreTab, { state: stateForUi(), section, exported: '', importPayload: '', saveSlots: [], activeSaveSlot: 1 }));
    assert.match(html, /Your network/);
    assert.match(html, /aria-label="Menu sections"/);
    assert.match(html, /network-disclosure/);
    assert.doesNotMatch(html, /NaN|undefined/);
  }
});


test('Character centralizes gear, implants, progression, recovery and presets', () => {
  for (const section of ['gear', 'cyberware', 'attributes', 'health', 'presets']) {
    const html = renderToStaticMarkup(createElement(CharacterTab, { state: stateForUi(), section }));
    assert.match(html, /aria-label="Character workspace"/);
    assert.match(html, /Gear &amp; inventory/);
    assert.match(html, /Attributes &amp; perks/);
    assert.match(html, /runner-vitals/);
    assert.equal((html.match(/aria-pressed="true"/g) ?? []).length >= 1, true);
    assert.doesNotMatch(html, /NaN|undefined|Infinity/);
    if (section === 'gear') {
      assert.match(html, /Equipped gear/);
      assert.match(html, /Search inventory/);
      assert.match(html, /aria-label="Selected item"/);
      assert.match(html, /Resources &amp; currencies/);
      assert.match(html, /runner-stash-layout/);
    }
    if (section === 'presets') assert.match(html, /Best Combat/);
    if (section === 'health') assert.match(html, /Auto Heal/);
    if (section === 'attributes') assert.match(html, /Allocate point/);
  }
});
