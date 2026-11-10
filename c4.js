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
function goCatalog(){ if (!$("locModal").hidden) return closeLoc(); view = "catalog"; refresh(); }

function fail(msg, field){
const err = $("formErr"); err.textContent = msg; err.hidden = false;
if (field) $(field).focus(); else err.scrollIntoView({ block: "center" });
}

function placeOrder(){
const v = id => $(id).value.trim();
const name = v("fName"), phone = v("fPhone"), email = v("fEmail"), address = v("fAddr");
if (!name) return fail("Please enter your name.", "fName");
if (!/^[+\d][\d\s\-()]{5,}$/.test(phone)) return fail("Please enter a phone number we can call, for example +855 12 345 678.", "fPhone");
if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("That email address doesn't look right. Fix it or leave it empty.", "fEmail");
if (!address && !loc) return fail("Please enter your delivery address or add your location on the map.", "fAddr");
$("formErr").hidden = true;
const order = {
v: 1,
items: lines().map(l => [l.id, l.qty, l.opts]),
name: name.slice(0, 80), phone: phone.slice(0, 30), email: email.slice(0, 120),
address: (address || (loc ? "Pinned on map (" + loc.label + ")" : "")).slice(0, 300),
note: v("fNote").slice(0, 200), pay,
...(loc ? { loc: { lat: loc.lat, lng: loc.lng, label: loc.label } } : {})
};
try { localStorage.setItem("shop-details", JSON.stringify({ name: order.name, phone: order.phone, email: order.email, address })); } catch {}
if (inTelegram){
try { tg.HapticFeedback.notificationOccurred("success"); } catch {}
tg.sendData(JSON.stringify(order)); // Telegram closes the shop and hands the order to the bot
} else {
fail("Preview only: this order was not sent. Open the shop from your Telegram bot to place real orders.");
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
$("moreBtn").onclick = goCatalog;
try {
const r = await fetch("products.json", { cache: "no-store" });
shop = await r.json();
} catch {
$("grid").textContent = ""; $("grid").appendChild(el("div", "empty", "The product list couldn't load. Close the shop and open it again.")); return;
}
document.title = shop.shopName; $("shopName").textContent = shop.shopName;
try {
const s = JSON.parse(localStorage.getItem("shop-details") || "null");
if (s){ $("fName").value = s.name || ""; $("fPhone").value = s.phone || ""; $("fEmail").value = s.email || ""; $("fAddr").value = s.address || ""; }
} catch {}
if (!$("fName").value && inTelegram && tg.initDataUnsafe && tg.initDataUnsafe.user){
const u = tg.initDataUnsafe.user; $("fName").value = [u.first_name, u.last_name].filter(Boolean).join(" ");
}
initLoc();
renderChips(); refresh();
}
start();
