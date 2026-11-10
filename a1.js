const tg = window.Telegram && window.Telegram.WebApp;
const inTelegram = !!(tg && tg.initData);
const params = new URLSearchParams(location.search);
const cardPayEnabled = params.get("pay") === "1";
const $ = id => document.getElementById(id);

let shop = null, cat = "All", sub = "All", brand = "All", view = "catalog", current = null, chosen = {};
const cart = {}; // key -> { id, qty, opts }

const money = n => (shop.currencySymbol || "") + n.toFixed(2);
const product = id => shop.products.find(p => p.id === id);
const onSale = p => typeof p.discountPrice === "number" && p.discountPrice > 0 && p.discountPrice < p.price;
const unitPrice = p => onSale(p) ? p.discountPrice : p.price;
const photos = p => (Array.isArray(p.images) && p.images.length ? p.images : [p.image]).filter(Boolean);
const optNames = p => Object.keys(p.options || {}).filter(k => Array.isArray(p.options[k]) && p.options[k].length);
const optText = o => Object.entries(o || {}).map(([k, v]) => k + ": " + v).join(", ");
const keyOf = (id, o) => id + "|" + optNames(product(id)).map(k => o[k]).join("|");
const lines = () => Object.values(cart);
const qtyOf = id => lines().filter(l => l.id === id).reduce((a, l) => a + l.qty, 0);
const itemsTotal = () => lines().reduce((s, l) => s + unitPrice(product(l.id)) * l.qty, 0);
const count = () => lines().reduce((a, l) => a + l.qty, 0);

function haptic(){ try { tg && tg.HapticFeedback.selectionChanged(); } catch {} }

function el(tag, cls, text){
const e = document.createElement(tag);
if (cls) e.className = cls;
if (text != null) e.textContent = text;
return e;
}

function addToCart(id, opts, n){
const k = keyOf(id, opts);
const l = cart[k] || (cart[k] = { id, qty: 0, opts: { ...opts } });
l.qty = Math.min(99, l.qty + n);
if (l.qty <= 0) delete cart[k];
haptic();
}

function picture(p, cls, src){
const box = el("div", cls);
const s = src || photos(p)[0];
const emoji = () => { box.classList.remove("has-img"); box.textContent = p.emoji || "🛍️"; };
if (s){
const img = el("img"); img.src = s; img.alt = p.name; img.loading = "lazy"; img.onerror = emoji;
box.classList.add("has-img"); box.appendChild(img);
} else emoji();
return box;
}

const offBadge = p => onSale(p) ? el("span", "off", Math.round((1 - p.discountPrice / p.price) * 100) + "%") : null;

function priceTag(p){
const w = el("div", "price");
if (onSale(p)) w.append(el("s", "was", money(p.price)));
w.append(el("span", "now", money(unitPrice(p))));
return w;
}

function toast(text, action){
const t = $("toast"); t.textContent = text; t.hidden = false;
t.onclick = action || null; t.classList.toggle("act", !!action);
clearTimeout(toast.h); toast.h = setTimeout(() => t.hidden = true, 2600);
}
