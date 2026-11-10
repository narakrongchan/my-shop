const tg = window.Telegram && window.Telegram.WebApp;
const inTelegram = !!(tg && tg.initData);
const params = new URLSearchParams(location.search);
const cardPayEnabled = params.get("pay") === "1";
const $ = id => document.getElementById(id);

let shop = null, cat = "All", sub = "All", brand = "All", view = "catalog";
const cart = {};

const money = n => (shop.currencySymbol || "") + n.toFixed(2);
const product = id => shop.products.find(p => p.id === id);
const onSale = p => typeof p.discountPrice === "number" && p.discountPrice > 0 && p.discountPrice < p.price;
const unitPrice = p => onSale(p) ? p.discountPrice : p.price;
const itemsTotal = () => Object.entries(cart).reduce((s,[id,q]) => s + unitPrice(product(id)) * q, 0);
const count = () => Object.values(cart).reduce((a,b) => a+b, 0);

function haptic(){ try { tg && tg.HapticFeedback.selectionChanged(); } catch {} }

function picture(p, cls){
const box = document.createElement("div"); box.className = cls;
const emoji = () => { box.classList.remove("has-img"); box.textContent = p.emoji || "🛍️"; };
if (p.image){
const img = document.createElement("img");
img.src = p.image; img.alt = p.name; img.loading = "lazy"; img.decoding = "async";
img.onerror = emoji;
box.classList.add("has-img"); box.appendChild(img);
} else emoji();
return box;
}

function renderCheckout(){
const lines = $("lines"); lines.textContent = "";
for (const [id,q] of Object.entries(cart)){
const p = product(id), u = unitPrice(p);
const row = document.createElement("div"); row.className = "line";
const t = document.createElement("div"); t.className = "t";
const b = document.createElement("div"); b.textContent = p.name;
const s = document.createElement("small"); s.textContent = `${q} × ${money(u)}` + (onSale(p) ? ` (was ${money(p.price)})` : "");
t.append(b, s);
const amt = document.createElement("strong"); amt.textContent = money(u * q);
row.append(picture(p, "e"), t, amt); lines.appendChild(row);
}
const fee = shop.deliveryFee || 0, total = itemsTotal();
$("sums").innerHTML = "";
[["Items", total], ["Delivery", fee], ["Total", total + fee]].forEach(([k,v],i) => {
const r = document.createElement("div"); r.className = "sum" + (i === 2 ? " total" : "");
const a = document.createElement("span"); a.textContent = k;
const b = document.createElement("span"); b.textContent = money(v);
r.append(a, b); $("sums").appendChild(r);
});
}
