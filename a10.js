let extrasDone = false;
const ICONS = {
phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
tg: '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/>',
fb: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
pin: '<path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>'
};
function icon(name){
const s = el("span", "kicon");
s.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[name] + "</svg>";
return s;
}

function renderContactCard(){
document.querySelectorAll(".cinfo, #companyInfo").forEach(n => n.remove());
const c = shop.company; if (!c) return;
const items = [];
const tgName = (c.telegram || "").replace(/^@/, "");
if (c.phone) items.push(["phone", "Call us", c.phone, "tel:" + c.phone.replace(/[^\d+]/g, "")]);
if (tgName) items.push(["tg", "Telegram", "@" + tgName, "https://t.me/" + tgName]);
if (c.facebook) items.push(["fb", "Facebook", "Visit our page", c.facebook]);
if (c.hours) items.push(["clock", "Opening hours", c.hours, ""]);
if (c.address) items.push(["pin", "Find us", c.address, c.map || "", "wide"]);
if (c.about) items.push(["info", "About us", c.about, "", "wide"]);
if (!items.length) return;
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
} else logo.textContent = b.name === "All" ? "★" : b.name.split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();
t.append(logo, el("span", "bname", b.label));
t.onclick = () => { brand = b.name; const s = $("brandSel"); if (s) s.value = brand; markBrand(); renderGrid(); };
row.appendChild(t);
}
wrap.appendChild(row);
$("grid").before(wrap);
}
function markBrand(){
document.querySelectorAll(".btile").forEach(t => t.setAttribute("aria-pressed", String(t.dataset.brand === brand)));
}

const baseChips3 = renderChips;
renderChips = function(){
baseChips3();
if (!extrasDone){ extrasDone = true; renderContactCard(); renderBrandRow(); }
markBrand();
};
