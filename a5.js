let pay = null, loc = null;

function renderCheckout(){
const box = $("lines"); box.textContent = "";
$("itemCount").textContent = "(" + count() + ")";
for (const [k, l] of Object.entries(cart)){
const p = product(l.id), u = unitPrice(p);
const row = el("div", "line"), t = el("div", "t");
t.appendChild(el("div", "lname", p.name));
const o = optText(l.opts); if (o) t.appendChild(el("small", "", o));
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
const fee = shop.deliveryFee || 0, total = itemsTotal();
const sums = $("sums"); sums.textContent = "";
[["Subtotal (" + count() + ")", total], ["Delivery fee", fee]].forEach(([k, v]) => {
const r = el("div", "sum"); r.append(el("span", "", k), el("span", "", money(v))); sums.appendChild(r);
});
$("grand").textContent = money(total + fee);
renderPay();
}

function payOptions(){
const list = [];
if (shop.bank) list.push({ v: "transfer", t: "Direct bank transfer", d: "Pay to our bank account, then send the receipt in chat" });
else list.push({ v: "transfer", t: "Bank transfer", d: "We send the bank details in chat" });
list.push({ v: "cod", t: "Cash on delivery", d: "Pay when your order arrives" });
if (cardPayEnabled) list.push({ v: "card", t: "Card in Telegram", d: "Pay securely by card inside Telegram" });
return list;
}

function renderPay(){
const box = $("payList"); box.textContent = "";
const opts = payOptions();
if (!opts.some(o => o.v === pay)) pay = opts[0].v;
for (const o of opts){
const card = el("label", "paycard" + (pay === o.v ? " on" : ""));
const r = el("input"); r.type = "radio"; r.name = "pay"; r.value = o.v; r.checked = pay === o.v;
r.onchange = () => { pay = o.v; renderPay(); };
const txt = el("div", "ptxt"); txt.append(el("strong", "", o.t), el("small", "", o.d));
card.append(r, txt);
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
