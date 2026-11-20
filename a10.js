let extrasDone = false;
const ICONS = {
phone: '<path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>',
tg: '<path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/>',
fb: '<path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.33-.04-1.56-.14-2.86-.14C11.93 2 10 3.66 10 6.7v2.8H7v4h3V22h4v-8.5z"/>',
tiktok: '<path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z"/>',
clock: '<path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>',
pin: '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/>',
info: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>'
};
function icon(name){
const s = el("span", "kicon ki-" + name);
s.innerHTML = '<svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" aria-hidden="true">' + ICONS[name] + "</svg>";
return s;
}

function renderContactCard(){
document.querySelectorAll(".cinfo, #companyInfo").forEach(n => n.remove());
const c = shop.company; if (!c) return;
const items = [];
for (const p of phonesOf(c)) items.push(["phone", p.label || "Call us", p.number, telHref(p.number)]);
for (const t of tgsOf(c)) items.push(["tg", t.label ? "Telegram · " + t.label : "Telegram", "@" + tgUser(t), "https://t.me/" + tgUser(t)]);
for (const f of fbsOf(c)) items.push(["fb", f.label ? "Facebook · " + f.label : "Facebook", "Visit our page", f.url]);
const tt = (c.tiktok || "").trim();
if (tt){ const ttName = tt.replace(/^https?:\/\/(www\.)?tiktok\.com\//, "").replace(/^@/, "").split(/[/?]/)[0]; items.push(["tiktok", "TikTok", "@" + ttName, "https://www.tiktok.com/@" + ttName]); }
if (c.hours) items.push(["clock", "Opening hours", c.hours, ""]);
if (c.address) items.push(["pin", c.map ? "Find us · Open in Google Maps ›" : "Find us", c.address, c.map || "", "wide"]);
if (c.about) items.push(["info", "About us", c.about, "", "wide"]);
if (!items.length) return;
const halves = items.filter(i => !i[4]);
if (halves.length % 2) halves[halves.length - 1][4] = "wide";
const card = el("div", "kcard"); card.id = "contactCard";
for (const [ic, label, value, href, wide] of items){
const row = href ? el("a", "kitem") : el("div", "kitem");
if (wide) row.classList.add("wide");
if (href){
row.href = href;
if (!href.startsWith("tel:")) row.onclick = e => { e.preventDefault(); openUrl(href); };
}
const txt = el("span", "ktxt");
txt.append(el("span", "klabel", label), el("span", "kval", value));
row.append(icon(ic), txt);
card.appendChild(row);
}
$("catalog").prepend(card);
}

const brandName = b => typeof b === "string" ? b : (b && b.name) || "";
function renderBrandRow(){
const list = (shop.brands && shop.brands.length ? shop.brands
: [...new Set(shop.products.map(p => p.brand).filter(Boolean))].sort());
if (!list.length) return;
const wrap = el("section", "brandsec"); wrap.id = "brandSec";
wrap.appendChild(el("h2", "bhead", "Shop by brand"));
const row = el("div", "brow");
const all = [{ name: "All", label: "All brands" }, ...list.map(b => ({ name: brandName(b), label: brandName(b), logo: typeof b === "object" ? b.logo : "" }))];
for (const b of all){
if (!b.name) continue;
const t = el("button", "btile"); t.type = "button"; t.dataset.brand = b.name;
const logo = el("span", "blogo");
if (b.logo){
const img = el("img"); img.src = b.logo; img.alt = "";
img.onerror = () => { img.remove(); logo.textContent = b.name.slice(0, 1).toUpperCase(); };
logo.appendChild(img);
} else logo.textContent = b.name === "All" ? "★" : b.name.split(/\s+/).filter(w => /^[\p{L}\p{N}]/u.test(w)).map(w => w[0]).join("").slice(0, 2).toUpperCase();
t.append(logo, el("span", "bname", b.label));
t.onclick = () => { brand = b.name; const s = $("brandSel"); if (s) s.value = brand; markBrand(); renderGrid(); };
row.appendChild(t);
}
wrap.appendChild(row);
$("grid").before(wrap);
}
function moveCategories(){
const bar = el("div", "catbar"); bar.style.margin = "2px 0 14px";
bar.append($("chips"), $("subchips"));
$("banners").after(bar);
}
function markBrand(){
document.querySelectorAll(".btile").forEach(t => t.setAttribute("aria-pressed", String(t.dataset.brand === brand)));
}

const baseChips3 = renderChips;
renderChips = function(){
baseChips3();
if (!extrasDone){ extrasDone = true; renderContactCard(); moveCategories(); renderBrandRow(); }
markBrand();
};
