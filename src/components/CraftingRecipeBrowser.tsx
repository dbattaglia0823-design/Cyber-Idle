import { useEffect, useRef, type ReactNode } from "react";
import { recipes, legacyRecipeAliases } from "../data/recipes";
import { getItem } from "../data/items";
import { districts } from "../data/districts";
import { skillNames } from "../data/skills";
import { useRememberedState } from "./useUiPreferences";
import { browseRecipes, recipeLocked, recipeSubcategory, RECIPE_PAGE_SIZE } from "../systems/craftingBrowser";
import { canCraft } from "../systems/craftingProcessing";
import type { GameState, ItemDefinition } from "../types";

const label = (text: string) => text.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, s => s.toUpperCase());
export function CraftingRecipeBrowser({ state, selected, onSelect, icon, requested, requestToken }: { state: GameState; selected?: string; onSelect: (id: string) => void; icon: (item: ItemDefinition) => ReactNode; requested?: string | null; requestToken?: number }) {
  const categories = ["All", ...new Set(recipes.map(r => r.category))];
  const [category, setCategory] = useRememberedState("crafting-filter", "All", categories);
  const [sub, setSub] = useRememberedState("crafting-subcategory", "All");
  const [variant, setVariant] = useRememberedState("crafting-variant", "All", ["All", "Power", "Rapid", "Precision"]);
  const [query, setQuery] = useRememberedState("crafting-query", "");
  const [ready, setReady] = useRememberedState("crafting-ready", false);
  const [local, setLocal] = useRememberedState("crafting-local", false);
  const [upgrades, setUpgrades] = useRememberedState("crafting-stat-upgrades", false);
  const [favoritesOnly, setFavoritesOnly] = useRememberedState("crafting-favorites-only", false);
  const [favoriteIds, setFavoriteIds] = useRememberedState("crafting-favorite-ids", "");
  const [showLocked, setShowLocked] = useRememberedState("crafting-show-locked", false);
  const [sort, setSort] = useRememberedState("crafting-sort", "level", ["level","rarity","duration","name"]);
  const [direction, setDirection] = useRememberedState("crafting-direction", "asc", ["asc","desc"]);
  const [storedPage, setPage] = useRememberedState("crafting-page", 1);
  const list = useRef<HTMLDivElement>(null);
  const browser = useRef<HTMLElement>(null);
  useEffect(()=>{
    const header=document.querySelector(".topbar");
    if(!header||typeof ResizeObserver==="undefined")return;
    const observer=new ResizeObserver(()=>{
      const fixed=["sticky","fixed"].includes(getComputedStyle(header).position);
      browser.current?.style.setProperty("--craft-header-offset", `${fixed?header.getBoundingClientRect().height+8:8}px`);
    });observer.observe(header);return()=>observer.disconnect();
  },[]);
  const favorites = [...new Set(favoriteIds.split("|").filter(Boolean).map(id=>legacyRecipeAliases[id] ?? id))];
  const subcategories = ["All", ...new Set(recipes.filter(r => r.category === category).map(recipeSubcategory).filter(s => s !== "All"))];
  const validSub = subcategories.includes(sub) ? sub : "All";
  const visible = browseRecipes(state, { variant, category, subcategory: validSub, query, ready, district: local, upgrades, favoritesOnly, favorites, showLocked, sort, direction });
  const pages = Math.max(1, Math.ceil(visible.length / RECIPE_PAGE_SIZE));
  const page = Math.min(pages, Math.max(1, Number.isFinite(storedPage) ? Math.floor(storedPage) : 1));
  useEffect(() => { if (page !== storedPage) setPage(page); }, [page, storedPage]);
  useEffect(() => {
    if (!requested) return;
    setVariant("All"); setCategory("All"); setSub("All"); setQuery(""); setReady(false); setLocal(false); setUpgrades(false); setFavoritesOnly(false); setShowLocked(true);
    const all = browseRecipes(state, { category:"All", subcategory:"All", query:"", ready:false, district:false, upgrades:false, favoritesOnly:false, favorites:[], showLocked:true, sort, direction });
    setPage(Math.floor(Math.max(0, all.findIndex(r => r.id === (legacyRecipeAliases[requested] ?? requested))) / RECIPE_PAGE_SIZE)+1);
  }, [requested, requestToken]);
  const change = <T,>(setter: (value: T) => void, value: T) => { setter(value); setPage(1); };
  const reset = () => { setVariant("All"); setCategory("All"); setSub("All"); setQuery(""); setReady(false); setLocal(false); setUpgrades(false); setFavoritesOnly(false); setShowLocked(false); setPage(1); };
  const goPage=(next:number)=>{setPage(next);requestAnimationFrame(()=>list.current?.scrollIntoView({block:"start",behavior:"instant"}));};
  return <section ref={browser} className="recipe-browser" aria-label="Recipe browser">
    <div className="recipe-browser-tools"><select aria-label="Weapon variant" value={variant} onChange={e=>change(setVariant,e.target.value)}>{["All","Power","Rapid","Precision"].map(value=><option key={value} value={value}>{value === "All" ? "All variants" : value}</option>)}</select><input type="search" aria-label="Search recipes" placeholder="Search recipes" value={query} onChange={e => change(setQuery,e.target.value)}/><details className="recipe-filter-menu"><summary>Filters{[category!=="All",validSub!=="All",ready,local,upgrades,favoritesOnly,showLocked].filter(Boolean).length ? " •" : ""}</summary><div>
      <label>Category<select value={category} onChange={e => { change(setCategory,e.target.value);setSub("All"); }}>{categories.map(c => <option key={c}>{c}</option>)}</select></label>
      {subcategories.length>1 && <label>{category === "Weapons" ? "Weapon class" : "Equipment slot"}<select value={validSub} onChange={e => change(setSub,e.target.value)}>{subcategories.map(s => <option key={s} value={s}>{label(s)}</option>)}</select></label>}
      <label><input type="checkbox" checked={local} onChange={e=>change(setLocal,e.target.checked)}/>Current district · {districts.find(d=>d.id===state.selectedDistrict)?.name}</label>
      <label><input type="checkbox" checked={upgrades} onChange={e=>change(setUpgrades,e.target.checked)}/>Upgrades equipped gear</label>
      {upgrades && <small>At least one higher stat; compare tradeoffs in details.</small>}
      <label><input type="checkbox" checked={showLocked} onChange={e=>change(setShowLocked,e.target.checked)}/>Show locked recipes</label>
      <label>Sort<select value={sort} onChange={e=>change(setSort,e.target.value)}>{["level","rarity","duration","name"].map(s=><option value={s} key={s}>{label(s)}</option>)}</select></label>
      <button className="secondary-button" onClick={()=>change(setDirection,direction==="asc"?"desc":"asc")}>{direction==="asc"?"Ascending ↑":"Descending ↓"}</button><button className="secondary-button" onClick={reset}>Reset filters</button><button className="primary-button" onClick={event=>{const menu=event.currentTarget.closest("details");menu?.removeAttribute("open");menu?.querySelector("summary")?.focus();}}>Done</button>
    </div></details></div>
    <div className="recipe-quick-filters"><label><input type="checkbox" checked={ready} onChange={e=>change(setReady,e.target.checked)}/>Ready to craft</label><label><input type="checkbox" checked={favoritesOnly} onChange={e=>change(setFavoritesOnly,e.target.checked)}/>Favorites</label><span>{visible.length} recipe{visible.length===1?"":"s"}</span></div>
    <p className="recipe-category-label">{category}{validSub!=="All"?` · ${label(validSub)}`:""}</p>
    <div ref={list} className="crafting-recipe-list compact-recipe-list" tabIndex={-1}>
      {visible.slice((page-1)*RECIPE_PAGE_SIZE,page*RECIPE_PAGE_SIZE).map(recipe=>{
        const output=getItem(recipe.outputItemId), locked=recipeLocked(state,recipe), active=state.activeCraft?.recipeId===recipe.id;
        const status=active?"Crafting":locked?"Locked":canCraft(state,recipe)?"Ready":"Missing materials";
        const favorite=favorites.includes(recipe.id);
        return <div className={`compact-recipe-row rarity-${(output?.rarity??"Common").toLowerCase()} ${selected===recipe.id?"selected":""}`} key={recipe.id}>
          <button className="recipe-select" aria-pressed={selected===recipe.id} onClick={()=>onSelect(recipe.id)}>{output?icon(output):<span>◇</span>}<span><strong>{recipe.name}</strong><small>{output?.rarity??"Common"} · {skillNames[recipe.requiredSkill]} {recipe.requiredLevel}</small><em className={status==="Ready"?"ready":locked?"locked":""}>{status}</em></span><span aria-hidden="true">›</span></button>
          <button className="recipe-favorite" aria-label={`${favorite?"Unfavorite":"Favorite"} ${recipe.name}`} aria-pressed={favorite} onClick={()=>setFavoriteIds(current=>{const ids=[...new Set(current.split("|").filter(Boolean).map(id=>legacyRecipeAliases[id] ?? id))];return(ids.includes(recipe.id)?ids.filter(id=>id!==recipe.id):[...ids,recipe.id]).join("|");})}>{favorite?"★":"☆"}</button>
        </div>;
      })}
      {!visible.length && <div className="recipe-empty"><p>No matching recipes.</p><button className="secondary-button" onClick={reset}>Reset filters</button>{!showLocked && <button className="secondary-button" onClick={()=>change(setShowLocked,true)}>Show locked recipes</button>}</div>}
    </div>
    <nav className="recipe-pagination" aria-label="Recipe pages"><button className="secondary-button" disabled={page===1} onClick={()=>goPage(page-1)}>Previous</button><span>Page {page} / {pages}</span><button className="secondary-button" disabled={page===pages} onClick={()=>goPage(page+1)}>Next</button></nav>
  </section>;
}
