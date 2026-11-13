import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';
import { createInitialState } from '../src/systems/gameState.ts';
import { recipes } from '../src/data/recipes.ts';
import { getItem } from '../src/data/items.ts';
import { browseRecipes, recipeLocked, recipeSubcategory, recipeImprovesGear, RECIPE_PAGE_SIZE } from '../src/systems/craftingBrowser.ts';
import { canCraft } from '../src/systems/craftingProcessing.ts';
import { CraftingRecipeBrowser } from '../src/components/CraftingRecipeBrowser.tsx';
import { CraftingDetailSheet } from '../src/components/CraftingDetailSheet.tsx';

const options = { category:'All', subcategory:'All', query:'', ready:false, district:false, upgrades:false, favoritesOnly:false, favorites:[], showLocked:true, sort:'level', direction:'asc' };
test('recipe browser hides locked recipes while keeping missing-material recipes discoverable',()=>{
  const state=createInitialState(), visible=browseRecipes(state,{...options,showLocked:false});
  assert.ok(visible.length>0);
  assert.ok(visible.every(r=>!recipeLocked(state,r)));
  assert.ok(visible.some(r=>!canCraft(state,r)));
  assert.equal(browseRecipes(state,options).length,recipes.length);
});
test('category, equipment subcategory, search and favorites compose correctly',()=>{
  const state=createInitialState();
  const weapon=recipes.find(r=>r.category==='Weapons');
  const filtered=browseRecipes(state,{...options,category:'Weapons',subcategory:recipeSubcategory(weapon),query:weapon.name,favoritesOnly:true,favorites:[weapon.id]});
  assert.deepEqual(filtered.map(r=>r.id),[weapon.id]);
  assert.ok(browseRecipes(state,{...options,category:'Armor',subcategory:'chest'}).every(r=>getItem(r.outputItemId)?.slot==='chest'));
});
test('ready and current-district filters use actual game requirements',()=>{
  const state=createInitialState();
  assert.ok(browseRecipes(state,{...options,ready:true}).every(r=>canCraft(state,r)));
  state.selectedDistrict='rustYards';
  const local=browseRecipes(state,{...options,district:true});
  assert.ok(local.length>0);
  assert.ok(local.every(r=>!r.requiredDistrict||r.requiredDistrict==='rustYards'));
});
test('gear filter excludes non-equipment and the currently equipped item',()=>{
  const state=createInitialState();
  const weapon=recipes.find(r=>getItem(r.outputItemId)?.type==='Weapon');
  state.equippedGear.weapon=weapon.outputItemId;
  assert.equal(recipeImprovesGear(state,weapon),false);
  assert.ok(browseRecipes(state,{...options,upgrades:true}).every(r=>['Weapon','Armor','Cyberware'].includes(getItem(r.outputItemId)?.type)));
});
test('recipe pages render no more than fifteen rows with separate favorite controls',()=>{
  const original=globalThis.localStorage;
  globalThis.localStorage={getItem:key=>key.endsWith('crafting-show-locked')?'true':null,setItem(){}};
  try{
    const html=render(createElement(CraftingRecipeBrowser,{state:createInitialState(),onSelect(){},icon(){return null;}}));
    assert.equal((html.match(/class="recipe-select"/g)??[]).length,RECIPE_PAGE_SIZE);
    assert.equal((html.match(/class="recipe-favorite"/g)??[]).length,RECIPE_PAGE_SIZE);
    assert.match(html,/Recipe pages/);
    assert.match(html,/Show locked recipes/);
    assert.doesNotMatch(html,/NaN|undefined/);
  }finally{globalThis.localStorage=original;}
});
test('mobile recipe detail sheet exposes a modal and a clear return action',()=>{
  const original=globalThis.window;
  globalThis.window={matchMedia:()=>({matches:true})};
  try{
    const html=render(createElement(CraftingDetailSheet,{open:true,onClose(){},className:'crafting-detail-panel'},'Recipe requirements'));
    assert.match(html,/aria-modal="true"/);
    assert.match(html,/Back to recipes/);
    assert.match(html,/Recipe requirements/);
  }finally{globalThis.window=original;}
});

test('inventory details open a labeled dialog even on desktop, without changing the crafting default',()=>{
  const original=globalThis.window;
  globalThis.window={matchMedia:()=>({matches:false})};
  try{
    const props={
      onClose(){},
      className:'panel runner-item-inspector',
      title:'Item details',
      backLabel:'Back to inventory',
      dialogLabel:'Selected inventory item',
      modalOnDesktop:true,
    };
    const closed=render(createElement(CraftingDetailSheet,{...props,open:false},'Item actions'));
    assert.match(closed,/inventory-detail-layer/);
    assert.doesNotMatch(closed,/aria-modal="true"/);
    const open=render(createElement(CraftingDetailSheet,{...props,open:true},'Item actions'));
    assert.match(open,/aria-modal="true"/);
    assert.match(open,/role="dialog"/);
    assert.match(open,/Selected inventory item/);
    assert.match(open,/Back to inventory/);
    assert.match(open,/Item actions/);
  }finally{globalThis.window=original;}
});
