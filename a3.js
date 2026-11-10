function openProduct(id){
const p = product(id); if (!p) return;
current = id; chosen = {};
optNames(p).forEach(k => { if (p.options[k].length === 1) chosen[k] = p.options[k][0]; });
view = "product"; refresh(); window.scrollTo(0, 0);
}

function renderProduct(){
const p = product(current), box = $("product"); box.textContent = "";
const imgs = photos(p);

const gal = el("div", "gallery"), track = el("div", "track");
(imgs.length ? imgs : [""]).forEach(src => track.appendChild(picture(p, "slide", src)));
gal.appendChild(track);
const off = offBadge(p); if (off) gal.appendChild(off);
if (imgs.length > 1){
const counter = el("span", "counter", "1 / " + imgs.length);
const go = d => track.scrollBy({ left: d * track.clientWidth, behavior: "smooth" });
const prev = el("button", "arrow prev", "‹"), next = el("button", "arrow next", "›");
prev.type = next.type = "button";
prev.setAttribute("aria-label", "Previous photo"); next.setAttribute("aria-label", "Next photo");
prev.onclick = () => go(-1); next.onclick = () => go(1);
track.onscroll = () => { counter.textContent = (Math.round(track.scrollLeft / track.clientWidth) + 1) + " / " + imgs.length; };
gal.append(prev, next, counter);
}
box.appendChild(gal);

const info = el("div", "pinfo");
if (p.brand) info.appendChild(el("div", "brand", p.brand));
info.appendChild(el("h2", "pname", p.name));
const pr = priceTag(p); pr.classList.add("pbox"); info.appendChild(pr);
if (p.description) info.appendChild(el("p", "pdesc", p.description));
for (const k of optNames(p)){
const g = el("div", "opt"); g.appendChild(el("div", "optlabel", k));
const row = el("div", "optrow");
for (const v of p.options[k]){
const b = el("button", "ochip", v); b.type = "button";
b.setAttribute("aria-pressed", String(chosen[k] === v));
b.onclick = () => { chosen[k] = v; renderProduct(); };
row.appendChild(b);
}
g.appendChild(row); info.appendChild(g);
}
if (!p.inStock) info.appendChild(el("div", "sold", "Sold out"));
const err = el("p", "err"); err.id = "optErr"; err.hidden = true; info.appendChild(err);
box.appendChild(info);

let rel = shop.products.filter(x => x.id !== p.id && x.category === p.category);
if (rel.length < 2) rel = shop.products.filter(x => x.id !== p.id);
if (rel.length){
box.appendChild(el("h3", "relhead", "Related products"));
const g = el("div", "grid"); rel.slice(0, 8).forEach(x => g.appendChild(cardFor(x)));
box.appendChild(g);
}
}

function addCurrent(){
const p = product(current); if (!p || !p.inStock) return;
const miss = optNames(p).filter(k => !chosen[k]);
if (miss.length){ const e = $("optErr"); e.textContent = "Please choose " + miss.join(" and ").toLowerCase() + "."; e.hidden = false; return; }
addToCart(p.id, chosen, 1);
try { tg && tg.HapticFeedback.notificationOccurred("success"); } catch {}
refresh();
toast("Added to cart · View order ›", goCheckout);
}

function renderCheckout(){
const box = $("lines"); box.textContent = "";
for (const [k, l] of Object.entries(cart)){
const p = product(l.id), u = unitPrice(p);
const row = el("div", "line"), t = el("div", "t");
t.appendChild(el("div", "", p.name));
const o = optText(l.opts); if (o) t.appendChild(el("small", "", o));
t.appendChild(el("small", "", money(u) + (onSale(p) ? " (was " + money(p.price) + ")" : "")));
const right = el("div", "lr");
right.appendChild(el("strong", "", money(u * l.qty)));
const q = el("div", "qty"), m = el("button", "", "−"), n = el("span", "", l.qty), pl = el("button", "", "+");
m.type = pl.type = "button"; m.setAttribute("aria-label", "Remove one"); pl.setAttribute("aria-label", "Add one");
m.onclick = () => { addToCart(l.id, l.opts, -1); refresh(); };
pl.onclick = () => { addToCart(l.id, l.opts, 1); refresh(); };
q.append(m, n, pl); right.appendChild(q);
row.append(picture(p, "e"), t, right); box.appendChild(row);
}
const fee = shop.deliveryFee || 0, total = itemsTotal();
const sums = $("sums"); sums.textContent = "";
[["Items", total], ["Delivery", fee], ["Total", total + fee]].forEach(([k, v], i) => {
const r = el("div", "sum" + (i === 2 ? " total" : "")); r.append(el("span", "", k), el("span", "", money(v))); sums.appendChild(r);
});
}
