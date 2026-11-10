const telegramPlaceOrder = placeOrder;
let sending = false;

function readOrderForm(){
const v = id => $(id).value.trim();
const name = v("fName"), phone = v("fPhone"), email = v("fEmail"), address = v("fAddr");
if (!name) return fail("Please enter your name.", "fName");
if (!/^[+\d][\d\s\-()]{5,}$/.test(phone)) return fail("Please enter a phone number we can call, for example +855 12 345 678.", "fPhone");
if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("That email address doesn't look right. Fix it or leave it empty.", "fEmail");
if (!address && !loc) return fail("Please enter your delivery address or add your location on the map.", "fAddr");
$("formErr").hidden = true;
try { localStorage.setItem("shop-details", JSON.stringify({ name, phone, email, address })); } catch {}
return {
v: 1,
items: lines().map(l => [l.id, l.qty, l.opts]),
name: name.slice(0, 80), phone: phone.slice(0, 30), email: email.slice(0, 120),
address: (address || (loc ? "Pinned on map (" + loc.label + ")" : "")).slice(0, 300),
note: v("fNote").slice(0, 200), pay: pay === "card" ? "cod" : pay,
...(loc ? { loc: { lat: loc.lat, lng: loc.lng, label: loc.label } } : {})
};
}

placeOrder = async function(){
if (inTelegram || !shop.orderApi) return telegramPlaceOrder();
if (sending) return;
const order = readOrderForm();
if (!order) return;
sending = true;
const btn = $("fallBtn"), label = btn.textContent;
btn.textContent = "Sending your order…"; btn.disabled = true;
try {
const r = await fetch(shop.orderApi, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(order) });
const res = await r.json().catch(() => ({}));
if (!r.ok || !res.ok) throw new Error(res.error || "We couldn't take your order right now. Please try again.");
for (const k of Object.keys(cart)) delete cart[k];
view = "catalog"; refresh();
showThanks(order, res);
} catch (e) {
fail(e.message === "Failed to fetch" ? "No connection. Check your internet and try again." : e.message);
} finally {
sending = false; btn.disabled = false; if (btn.textContent === "Sending your order…") btn.textContent = label;
}
};

function showThanks(order, res){
const old = $("thanks"); if (old) old.remove();
const box = el("div", "thanks"); box.id = "thanks"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true");
const card = el("div", "tcard");
card.append(el("div", "ticon", "✓"), el("h2", "", "Thank you, " + order.name.split(" ")[0] + "!"),
el("p", "tnum", "Order #" + res.id + " · " + money(res.total)));
card.appendChild(el("p", "", res.pay === "transfer"
? "Please transfer the total to the account below and add #" + res.id + " as the reference."
: "We'll call you on " + order.phone + " to confirm your delivery."));
if (res.pay === "transfer" && res.bank){
card.appendChild(el("pre", "tbank", res.bank));
const tgName = shop.company && shop.company.telegram ? shop.company.telegram.replace(/^@/, "") : "";
if (tgName){
const a = el("a", "tlink", "Send the receipt to @" + tgName + " on Telegram");
a.href = "https://t.me/" + tgName; a.target = "_blank"; a.rel = "noopener";
card.appendChild(a);
}
}
const back = el("button", "fmain", "Back to shop"); back.type = "button";
back.onclick = () => box.remove();
card.appendChild(back);
box.appendChild(card);
document.body.appendChild(box);
back.focus();
}

document.head.appendChild(Object.assign(document.createElement("style"), { textContent:
".thanks{position:fixed;inset:0;z-index:50;background:rgba(0,0,0,.45);display:grid;place-items:center;padding:16px}" +
".tcard{width:100%;max-width:380px;background:#fff;color:#111;border-radius:16px;padding:24px 20px;text-align:center;display:flex;flex-direction:column;gap:10px}" +
".tcard h2{margin:0;font-size:20px}.tcard p{margin:0;color:#444;line-height:1.4}" +
".ticon{width:56px;height:56px;margin:0 auto;border-radius:50%;background:#111;color:#fff;display:grid;place-items:center;font-size:28px;font-weight:800}" +
".tnum{font-weight:800;color:#111!important;font-size:17px}" +
".tbank{margin:0;padding:12px;border:1px solid #dcdcdc;border-radius:10px;background:#fafafa;font:600 14px/1.5 inherit;white-space:pre-wrap;text-align:left}" +
".tlink{color:#111;font-weight:700}.tcard .fmain{margin-top:6px;width:100%;padding:13px;border:0;border-radius:10px;font-weight:700;font-size:15px}"
}));

const baseChips4 = renderChips;
let siteChecked = false;
renderChips = function(){
baseChips4();
if (!siteChecked){ siteChecked = true; if (shop.orderApi) $("outside").hidden = true; }
};
