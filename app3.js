const catName = c => typeof c === "string" ? c : c.name;
const subsOf = name => {
const c = (shop.categories || []).find(c => catName(c) === name);
return c && Array.isArray(c.subcategories) ? c.subcategories : [];
};
const brandsOf = () => shop.brands && shop.brands.length ? shop.brands
: [...new Set(shop.products.map(p => p.brand).filter(Boolean))].sort();

function chipRow(box, items, current, allLabel, pick){
box.textContent = "";
for (const v of ["All", ...items]){
const b = document.createElement("button"); b.type = "button"; b.className = "chip";
b.textContent = v === "All" ? allLabel : v;
b.setAttribute("aria-pressed", String(v === current));
b.onclick = () => pick(v);
box.appendChild(b);
}
}

function renderChips(){
chipRow($("chips"), (shop.categories || []).map(catName), cat, "All", v => { cat = v; sub = "All"; renderChips(); renderGrid(); });

let subBox = $("subchips");
if (!subBox){ subBox = document.createElement("div"); subBox.id = "subchips"; subBox.className = "chips sub"; $("chips").after(subBox); }
const subs = cat === "All" ? [] : subsOf(cat);
subBox.hidden = !subs.length;
if (subs.length) chipRow(subBox, subs, sub, "All " + cat, v => { sub = v; renderChips(); renderGrid(); });

const brands = brandsOf();
let sel = $("brandSel");
if (!sel && brands.length){
const row = document.createElement("div"); row.className = "titlebar";
$("shopName").before(row); row.appendChild($("shopName"));
sel = document.createElement("select"); sel.id = "brandSel"; sel.setAttribute("aria-label", "Filter by brand");
sel.onchange = () => { brand = sel.value; renderGrid(); };
row.appendChild(sel);
}
if (sel){
sel.textContent = "";
for (const v of ["All", ...brands]){
const o = document.createElement("option"); o.value = v; o.textContent = v === "All" ? "All brands" : v; sel.appendChild(o);
}
sel.value = brand;
}
}

function priceTag(p){
const wrap = document.createElement("div"); wrap.className = "price";
const now = document.createElement("span"); now.className = "now"; now.textContent = money(unitPrice(p));
wrap.appendChild(now);
if (onSale(p)){ const was = document.createElement("s"); was.className = "was"; was.textContent = money(p.price); wrap.appendChild(was); }
return wrap;
}

function renderGrid(){
const grid = $("grid"); grid.textContent = "";
const list = shop.products.filter(p =>
(cat === "All" || p.category === cat) &&
(sub === "All" || p.subcategory === sub) &&
(brand === "All" || p.brand === brand));
if (!list.length){ grid.innerHTML = '<div class="empty">No products match these filters yet.</div>'; return; }
for (const p of list){
const inCart = cart[p.id] || 0;
const card = document.createElement("div");
card.className = "card" + (p.inStock ? " tap" : " out") + (inCart ? " picked" : "");
const pic = picture(p, "pic");
if (onSale(p)){
const off = document.createElement("span"); off.className = "off";
off.textContent = "-" + Math.round((1 - p.discountPrice / p.price) * 100) + "%";
pic.appendChild(off);
}
if (inCart){ const b = document.createElement("span"); b.className = "count"; b.textContent = inCart; pic.appendChild(b); }
card.appendChild(pic);
if (p.brand){ const br = document.createElement("div"); br.className = "brand"; br.textContent = p.brand; card.appendChild(br); }
const name = document.createElement("div"); name.className = "name"; name.textContent = p.name;
const desc = document.createElement("div"); desc.className = "desc"; desc.textContent = p.description || "";
card.append(name, desc, priceTag(p));
if (!p.inStock){
const s = document.createElement("div"); s.className = "sold"; s.textContent = "Sold out"; card.appendChild(s);
} else {
card.setAttribute("role", "button"); card.tabIndex = 0;
card.setAttribute("aria-label", `Add ${p.name} to order`);
const add = () => { if ((cart[p.id] || 0) < 99){ cart[p.id] = (cart[p.id] || 0) + 1; haptic(); refresh(); } };
card.onclick = add;
card.onkeydown = e => { if (e.key === "Enter" || e.key === " "){ e.preventDefault(); add(); } };
if (inCart){
const q = document.createElement("div"); q.className = "qty";
const minus = document.createElement("button"); minus.type = "button"; minus.textContent = "−"; minus.setAttribute("aria-label", "Remove one " + p.name);
const n = document.createElement("span"); n.textContent = inCart;
const plus = document.createElement("button"); plus.type = "button"; plus.textContent = "+"; plus.setAttribute("aria-label", "Add one more " + p.name);
minus.onclick = e => { e.stopPropagation(); cart[p.id]--; if (!cart[p.id]) delete cart[p.id]; haptic(); refresh(); };
plus.onclick = e => { e.stopPropagation(); add(); };
q.append(minus, n, plus); card.appendChild(q);
}
}
grid.appendChild(card);
}
}
