function mainButton(){
let text = "", show = false;
if (view === "catalog" && count()){ text = "View order · " + money(itemsTotal()); show = true; }
if (view === "product"){
const p = product(current);
if (p && p.inStock){ text = "Add to cart · " + money(unitPrice(p)); show = true; }
}
if (view === "checkout"){ text = "Place order · " + money(itemsTotal() + (shop.deliveryFee || 0)); show = true; }
if (inTelegram){
if (show) tg.MainButton.setParams({ text, is_visible: true, is_active: true }); else tg.MainButton.hide();
if (view === "catalog") tg.BackButton.hide(); else tg.BackButton.show();
} else {
$("fallbar").hidden = !show && view === "catalog";
$("fallBtn").hidden = !show; $("fallBtn").textContent = text;
$("fallBack").hidden = view === "catalog";
}
}

function refresh(){
if (view === "checkout" && !count()) view = "catalog";
if (view === "product" && !product(current)) view = "catalog";
for (const s of ["catalog", "product", "checkout"]) $(s).hidden = view !== s;
$("top").hidden = view !== "catalog";
if (view === "catalog") renderGrid();
else if (view === "product") renderProduct();
else renderCheckout();
mainButton();
}

function goCheckout(){ $("toast").hidden = true; view = "checkout"; refresh(); window.scrollTo(0, 0); }
function goCatalog(){ view = "catalog"; refresh(); }

function placeOrder(){
const name = $("fName").value.trim(), phone = $("fPhone").value.trim(), address = $("fAddr").value.trim();
const err = $("formErr");
if (!name || !phone || !address){ err.textContent = "Please fill in your name, phone number and delivery address."; err.hidden = false; return; }
if (!/^[+\d][\d\s\-()]{5,}$/.test(phone)){ err.textContent = "That phone number doesn't look right. Use digits, for example +66 81 234 5678."; err.hidden = false; return; }
err.hidden = true;
const order = {
v: 1,
items: lines().map(l => [l.id, l.qty, l.opts]),
name: name.slice(0, 80), phone: phone.slice(0, 30), address: address.slice(0, 300),
note: $("fNote").value.trim().slice(0, 200), pay: $("fPay").value
};
try { localStorage.setItem("shop-details", JSON.stringify({ name: order.name, phone: order.phone, address: order.address })); } catch {}
if (inTelegram){
try { tg.HapticFeedback.notificationOccurred("success"); } catch {}
tg.sendData(JSON.stringify(order)); // Telegram closes the shop and hands the order to the bot
} else {
$("outside").textContent = "Preview only: this order was not sent. Open the shop from your Telegram bot to place real orders.";
$("outside").hidden = false; window.scrollTo(0, document.body.scrollHeight);
}
}

function onMain(){
if (view === "catalog") goCheckout();
else if (view === "product") addCurrent();
else placeOrder();
}

async function start(){
if (inTelegram){
tg.ready(); tg.expand();
tg.MainButton.onClick(onMain);
tg.BackButton.onClick(goCatalog);
} else {
$("outside").hidden = false;
$("fallBtn").onclick = onMain;
}
$("fallBack").onclick = goCatalog;
$("backBtn").onclick = goCatalog;
try {
const r = await fetch("products.json", { cache: "no-store" });
shop = await r.json();
} catch {
$("grid").textContent = ""; $("grid").appendChild(el("div", "empty", "The product list couldn't load. Close the shop and open it again.")); return;
}
document.title = shop.shopName; $("shopName").textContent = shop.shopName;
const pay = $("fPay");
const opts = [["cod", "Cash on delivery"], ["transfer", "Bank transfer (details sent in chat)"]];
if (cardPayEnabled) opts.unshift(["card", "Pay by card in Telegram"]);
for (const [v, t] of opts){ const o = el("option", "", t); o.value = v; pay.appendChild(o); }
try {
const saved = JSON.parse(localStorage.getItem("shop-details") || "null");
if (saved){ $("fName").value = saved.name || ""; $("fPhone").value = saved.phone || ""; $("fAddr").value = saved.address || ""; }
} catch {}
if (!$("fName").value && inTelegram && tg.initDataUnsafe && tg.initDataUnsafe.user){
const u = tg.initDataUnsafe.user; $("fName").value = [u.first_name, u.last_name].filter(Boolean).join(" ");
}
renderChips(); refresh();
}
start();
