let pay = null, loc = null, zone = "pp", province = "";
const PROVINCES = ["Banteay Meanchey","Battambang","Kampong Cham","Kampong Chhnang","Kampong Speu","Kampong Thom","Kampot","Kandal","Kep","Koh Kong","Kratie","Mondulkiri","Oddar Meanchey","Pailin","Preah Sihanouk","Preah Vihear","Prey Veng","Pursat","Ratanakiri","Siem Reap","Stung Treng","Svay Rieng","Takeo","Tbong Khmum"];
const delFee = () => { const d = shop.delivery || {}; const f = zone === "pp" ? d.phnomPenhFee : (d.provinceFees || {})[province]; return typeof f === "number" ? f : null; };
const deliveryTag = () => zone === "pp" ? "Phnom Penh" : "Province: " + (province || "?");
function renderDelivery(){
const box = $("delList"); box.textContent = "";
const opts = [["pp", "🏙️", "Phnom Penh", "Delivery inside Phnom Penh"], ["prov", "🚚", "Province", "Fee depends on the province"]];
for (const [v, ic, t, d] of opts){
const card = el("label", "paycard tpl del-" + v + (zone === v ? " on" : ""));
const r = el("input"); r.type = "radio"; r.name = "zone"; r.value = v; r.checked = zone === v;
r.onchange = () => { zone = v; renderCheckout(); };
const txt = el("div", "ptxt"); txt.append(el("strong", "", t), el("small", "", d));
card.append(r, el("span", "picon", ic), txt, el("span", "pcheck", "✓"));
if (v === "prov" && zone === "prov"){
const sel = el("select", "provsel"); sel.id = "provSel"; sel.setAttribute("aria-label", "Choose your province");
const o0 = el("option", "", "Choose your province…"); o0.value = ""; sel.appendChild(o0);
PROVINCES.forEach(p => { const o = el("option", "", p); o.value = p; sel.appendChild(o); });
sel.value = province;
sel.onclick = e => e.stopPropagation();
sel.onchange = () => { province = sel.value; renderCheckout(); };
card.appendChild(sel);
}
box.appendChild(card);
}
}

function renderCheckout(){
const box = $("lines"); box.textContent = "";
$("itemCount").textContent = "(" + count() + ")";
for (const [k, l] of Object.entries(cart)){
const p = product(l.id), u = unitPrice(p);
const row = el("div", "line"), t = el("div", "t");
t.appendChild(el("div", "lname", p.name));
const o = optText(l.opts); if (o) t.appendChild(el("small", "", o));
const sk = skuFor(p, l.opts); if (sk) t.appendChild(el("small", "", "Part No. " + sk));
t.appendChild(el("small", "", "(" + money(u) + ") x " + l.qty));
const right = el("div", "lr");
const del = el("button", "trash", "🗑"); del.type = "button"; del.setAttribute("aria-label", "Remove " + p.name);
del.onclick = () => { delete cart[k]; haptic(); refresh(); };
const q = el("div", "qty"), m = el("button", "", "−"), n = el("span", "", l.qty), pl = el("button", "", "+");
m.type = pl.type = "button"; m.setAttribute("aria-label", "Remove one"); pl.setAttribute("aria-label", "Add one");
m.onclick = () => { addToCart(l.id, l.opts, -1); refresh(); };
pl.onclick = () => { addToCart(l.id, l.opts, 1); refresh(); };
q.append(m, n, pl); right.append(del, q);
row.append(picture(p, "e"), t, right); box.appendChild(row);
}
renderDelivery();
const df = delFee(), fixed = df !== null, fee = fixed ? df : 0, total = itemsTotal();
const sums = $("sums"); sums.textContent = "";
[["Subtotal (" + count() + ")", money(total)], ["Delivery (" + deliveryTag() + ")", fixed ? money(fee) : (zone === "pp" ? "We\u2019ll confirm" : "Depends on province")]].forEach(([k, v]) => {
const r = el("div", "sum"); r.append(el("span", "", k), el("span", "", v)); sums.appendChild(r);
});
if (!fixed){
const n = el("p", "feenote", shop.deliveryNote || "We'll confirm the delivery fee after checking your address or map pin.");
n.style.cssText = "margin:6px 0 0;font-size:12.5px;color:var(--muted)";
sums.appendChild(n);
}
$("grand").textContent = money(total + fee) + (fixed ? "" : " + delivery");
renderPay();
}

function payOptions(){
const list = [];
list.push({ v: "transfer", i: "🏦", t: "Bank Transfer", d: shop.bank ? "Pay to our bank account, then send the receipt" : "We send the bank details in chat" });
list.push({ v: "cod", i: "💵", t: "Cash on Delivery", d: "Pay in cash when your order arrives" });
if (cardPayEnabled) list.push({ v: "card", t: "Card in Telegram", d: "Pay securely by card inside Telegram" });
return list;
}

function renderPay(){
const box = $("payList"); box.textContent = "";
const opts = payOptions();
if (!opts.some(o => o.v === pay)) pay = opts[0].v;
for (const o of opts){
const card = el("label", "paycard tpl pay-" + o.v + (pay === o.v ? " on" : ""));
const r = el("input"); r.type = "radio"; r.name = "pay"; r.value = o.v; r.checked = pay === o.v;
r.onchange = () => { pay = o.v; renderPay(); };
const txt = el("div", "ptxt"); txt.append(el("strong", "", o.t), el("small", "", o.d));
card.append(r, el("span", "picon", o.i || "💳"), txt, el("span", "pcheck", "✓"));
if (o.v === "transfer" && shop.bank && pay === "transfer"){
const b = shop.bank, acct = el("div", "bank");
acct.append(el("span", "bankname", b.name || "Bank"));
const num = el("span", "banknum", (b.accountName ? b.accountName + " · " : "") + (b.accountNumber || ""));
const copy = el("button", "copy", "Copy"); copy.type = "button";
copy.onclick = e => {
e.preventDefault();
const done = () => { copy.textContent = "Copied ✓"; setTimeout(() => copy.textContent = "Copy", 1500); };
const text = String(b.accountNumber || "");
const fallback = () => {
const ta = el("textarea"); ta.value = text; document.body.appendChild(ta); ta.select();
try { document.execCommand("copy"); done(); } catch {} ta.remove();
};
if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
};
acct.append(num, copy); card.appendChild(acct);
}
box.appendChild(card);
}
}
