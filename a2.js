const catName = c => typeof c === "string" ? c : c.name;
const subsOf = name => {
const c = (shop.categories || []).find(c => catName(c) === name);
return c && Array.isArray(c.subcategories) ? c.subcategories : [];
};
const brandsOf = () => shop.brands && shop.brands.length ? shop.brands
: [...new Set(shop.products.map(p => p.brand).filter(Boolean))].sort();

function chipRow(box, items, cur, allLabel, pick){
box.textContent = "";
for (const v of ["All", ...items]){
const b = el("button", "chip", v === "All" ? allLabel : v); b.type = "button";
b.setAttribute("aria-pressed", String(v === cur));
b.onclick = () => pick(v);
box.appendChild(b);
}
}

function renderChips(){
chipRow($("chips"), (shop.categories || []).map(catName), cat, "All", v => { cat = v; sub = "All"; renderChips(); renderGrid(); });
let sb = $("subchips");
if (!sb){ sb = el("div", "chips sub"); sb.id = "subchips"; $("chips").after(sb); }
const subs = cat === "All" ? [] : subsOf(cat);
sb.hidden = !subs.length;
if (subs.length) chipRow(sb, subs, sub, "All " + cat, v => { sub = v; renderChips(); renderGrid(); });
const brands = brandsOf();
let sel = $("brandSel");
if (!sel && brands.length){
const row = el("div", "titlebar");
$("shopName").before(row); row.appendChild($("shopName"));
sel = el("select"); sel.id = "brandSel"; sel.setAttribute("aria-label", "Filter by brand");
sel.onchange = () => { brand = sel.value; renderGrid(); };
row.appendChild(sel);
}
if (sel){
sel.textContent = "";
for (const v of ["All", ...brands]){ const o = el("option", "", v === "All" ? "All brands" : v); o.value = v; sel.appendChild(o); }
sel.value = brand;
}
}

function cardFor(p){
const n = qtyOf(p.id);
const card = el("div", "card" + (p.inStock ? "" : " out") + (n ? " picked" : ""));
card.setAttribute("role", "button"); card.tabIndex = 0;
card.setAttribute("aria-label", "View " + p.name);
card.onclick = () => openProduct(p.id);
card.onkeydown = e => { if (e.key === "Enter"){ e.preventDefault(); openProduct(p.id); } };
const pic = picture(p, "pic");
const off = offBadge(p); if (off) pic.appendChild(off);
if (n) pic.appendChild(el("span", "count", n));
if (p.inStock){
const plus = el("button", "plus", "+"); plus.type = "button";
plus.setAttribute("aria-label", "Add " + p.name);
plus.onclick = e => {
e.stopPropagation();
if (optNames(p).length) return openProduct(p.id);
addToCart(p.id, {}, 1); refresh();
};
pic.appendChild(plus);
} else pic.appendChild(el("span", "soldtag", "Sold out"));
card.appendChild(pic);
const info = el("div", "info");
if (p.brand) info.appendChild(el("div", "brand", p.brand));
info.append(el("div", "name", p.name), priceTag(p));
card.appendChild(info);
return card;
}

function renderGrid(){
const grid = $("grid"); grid.textContent = "";
const list = shop.products.filter(p =>
(cat === "All" || p.category === cat) &&
(sub === "All" || p.subcategory === sub) &&
(brand === "All" || p.brand === brand));
if (!list.length){ grid.appendChild(el("div", "empty", "No products match these filters yet.")); return; }
list.forEach(p => grid.appendChild(cardFor(p)));
}
