let companyDone = false;

function openUrl(url){
if (/^https:\/\/t\.me\//.test(url) && inTelegram && tg.openTelegramLink) return tg.openTelegramLink(url);
if (/^https:\/\//.test(url) && inTelegram && tg.openLink) return tg.openLink(url);
window.open(url, "_blank", "noopener");
}

function renderCompany(){
const c = shop.company; if (!c) return;
const name = c.name || shop.shopName;
document.title = name;
const h1 = $("shopName"); h1.textContent = ""; h1.classList.add("chead");
const logo = el("span", "clogo");
if (c.logo){ const img = el("img"); img.src = c.logo; img.alt = ""; img.onerror = () => { img.remove(); logo.textContent = name.slice(0, 1); }; logo.appendChild(img); }
else logo.textContent = name.trim().slice(0, 1).toUpperCase();
const txt = el("span", "ctxt");
txt.appendChild(el("span", "cname", name));
if (c.tagline) txt.appendChild(el("span", "ctag", c.tagline));
h1.append(logo, txt);

const rows = [];
if (c.phone) rows.push(["📞", c.phone, "tel:" + c.phone.replace(/[^\d+]/g, "")]);
if (c.telegram) rows.push(["💬", "@" + c.telegram.replace(/^@/, ""), "https://t.me/" + c.telegram.replace(/^@/, "")]);
if (c.facebook) rows.push(["👍", "Facebook", c.facebook]);
if (c.address) rows.push(["📍", c.address, c.map || ""]);
if (c.hours) rows.push(["🕘", c.hours, ""]);
if (c.about) rows.push(["ℹ️", c.about, ""]);
if (!rows.length) return;

const btn = el("button", "cinfo", "i"); btn.type = "button";
btn.setAttribute("aria-label", "Contact and shop details"); btn.setAttribute("aria-expanded", "false");
h1.appendChild(btn);
const panel = el("div", "cpanel"); panel.id = "companyInfo"; panel.hidden = true;
for (const [icon, label, href] of rows){
const row = href ? el("a", "crow") : el("div", "crow");
if (href){
row.href = href;
if (!href.startsWith("tel:")) row.onclick = e => { e.preventDefault(); openUrl(href); };
}
row.append(el("span", "cicon", icon), el("span", "", label));
if (href) row.appendChild(el("span", "cgo", "›"));
panel.appendChild(row);
}
(h1.closest(".titlebar") || h1).after(panel);
btn.onclick = () => { panel.hidden = !panel.hidden; btn.setAttribute("aria-expanded", String(!panel.hidden)); };
}

const baseChips2 = renderChips;
renderChips = function(){ baseChips2(); if (!companyDone){ companyDone = true; renderCompany(); } };
