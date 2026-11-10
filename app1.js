const tg = window.Telegram && window.Telegram.WebApp;
const inTelegram = !!(tg && tg.initData);
const params = new URLSearchParams(location.search);
const cardPayEnabled = params.get("pay") === "1";
const $ = id => document.getElementById(id);

let shop = null, cat = "All", view = "catalog";
const cart = {}; // productId -> qty

const money = n => (shop.currencySymbol || "") + n.toFixed(2);
const product = id => shop.products.find(p => p.id === id);
const onSale = p => typeof p.discountPrice === "number" && p.discountPrice > 0 && p.discountPrice < p.price;
const unitPrice = p => onSale(p) ? p.discountPrice : p.price;
const itemsTotal = () => Object.entries(cart).reduce((s,[id,q]) => s + unitPrice(product(id)) * q, 0);
const count = () => Object.values(cart).reduce((a,b) => a+b, 0);

function haptic(){ try { tg && tg.HapticFeedback.selectionChanged(); } catch {} }

function renderChips(){
const box = $("chips"); box.textContent = "";
for (const c of ["All", ...shop.categories]){
const b = document.createElement("button"); b.className = "chip"; b.textContent = c;
b.setAttribute("aria-pressed", String(c === cat));
b.onclick = () => { cat = c; renderChips(); renderGrid(); };
box.appendChild(b);
}
}

function priceTag(p){
const wrap = document.createElement("div"); wrap.className = "price";
if (onSale(p)){
const now = document.createElement("span"); now.className = "now"; now.textContent = money(p.discountPrice);
const was = document.createElement("s"); was.className = "was"; was.textContent = money(p.price);
wrap.append(now, was);
} else {
const now = document.createElement("span"); now.textContent = money(p.price);
wrap.appendChild(now);
}
return wrap;
}

function renderGrid(){
const grid = $("grid"); grid.textContent = "";
const list = shop.products.filter(p => cat === "All" || p.category === cat);
if (!list.length){ grid.innerHTML = '<div class="empty">No products in this category yet.</div>'; return; }
for (const p of list){
const inCart = cart[p.id] || 0;
const card = document.createElement("div");
card.className = "card" + (p.inStock ? " tap" : " out") + (inCart ? " picked" : "");
const pic = document.createElement("div"); pic.className = "pic"; pic.textContent = p.emoji || "🛍️";
if (onSale(p)){
const off = document.createElement("span"); off.className = "off";
off.textContent = "-" + Math.round((1 - p.discountPrice / p.price) * 100) + "%";
pic.appendChild(off);
}
if (inCart){ const b = document.createElement("span"); b.className = "count"; b.textContent = inCart; pic.appendChild(b); }
const name = document.createElement("div"); name.className = "name"; name.textContent = p.name;
const desc = document.createElement("div"); desc.className = "desc"; desc.textContent = p.description || "";
card.append(pic, name, desc, priceTag(p));
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

function renderCheckout(){
const lines = $("lines"); lines.textContent = "";
for (const [id,q] of Object.entries(cart)){
const p = product(id), u = unitPrice(p);
const row = document.createElement("div"); row.className = "line";
const e = document.createElement("span"); e.className = "e"; e.textContent = p.emoji || "🛍️";
const t = document.createElement("div"); t.className = "t";
const b = document.createElement("div"); b.textContent = p.name;
const s = document.createElement("small"); s.textContent = `${q} × ${money(u)}` + (onSale(p) ? ` (was ${money(p.price)})` : "");
t.append(b, s);
const amt = document.createElement("strong"); amt.textContent = money(u * q);
row.append(e, t, amt); lines.appendChild(row);
}
const fee = shop.deliveryFee || 0, sub = itemsTotal();
$("sums").innerHTML = "";
[["Items", sub], ["Delivery", fee], ["Total", sub + fee]].forEach(([k,v],i) => {
const r = document.createElement("div"); r.className = "sum" + (i === 2 ? " total" : "");
const a = document.createElement("span"); a.textContent = k;
const b = document.createElement("span"); b.textContent = money(v);
r.append(a, b); $("sums").appendChild(r);
});
}

