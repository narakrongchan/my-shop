let bannersDone = false, bannerTimer = null;

function activeBanners(){
const today = new Date().toISOString().slice(0, 10);
return (shop.banners || []).filter(b => b && (!b.until || b.until >= today) && (!b.from || b.from <= today));
}

function bannerTap(b){
if (b.product && product(b.product)) return openProduct(b.product);
if (b.category){ cat = b.category; sub = "All"; renderChips(); renderGrid(); return; }
if (b.link && /^https:\/\//.test(b.link)){
if (inTelegram && tg.openLink) tg.openLink(b.link); else window.open(b.link, "_blank", "noopener");
}
}

function renderBanners(){
const list = activeBanners(), box = $("banners");
box.textContent = ""; box.hidden = !list.length;
if (!list.length) return;
const track = el("div", "btrack"), dots = el("div", "bdots");
list.forEach((b, i) => {
const slide = el("button", "bslide"); slide.type = "button";
slide.setAttribute("aria-label", b.title || "Promotion");
if (b.image){
const img = el("img"); img.src = b.image; img.alt = b.title || "Promotion"; img.loading = i ? "lazy" : "eager";
slide.appendChild(img);
} else {
slide.classList.add("btext");
slide.style.setProperty("--bc", b.color || "var(--brandc)");
if (b.badge) slide.appendChild(el("span", "bbadge", b.badge));
slide.appendChild(el("strong", "", b.title || ""));
if (b.text) slide.appendChild(el("span", "bsub", b.text));
if (b.product || b.category || b.link) slide.appendChild(el("span", "bcta", (b.button || "Shop now") + " ›"));
if (b.emoji) slide.appendChild(el("span", "bemoji", b.emoji));
}
slide.onclick = () => bannerTap(b);
track.appendChild(slide);
const d = el("span", "bdot" + (i ? "" : " on")); dots.appendChild(d);
});
box.append(track);
if (list.length > 1) box.appendChild(dots);
const at = () => Math.round(track.scrollLeft / track.clientWidth);
track.onscroll = () => [...dots.children].forEach((d, i) => d.classList.toggle("on", i === at()));
clearInterval(bannerTimer);
if (list.length > 1 && !matchMedia("(prefers-reduced-motion: reduce)").matches){
let paused = false;
track.addEventListener("pointerdown", () => { paused = true; });
bannerTimer = setInterval(() => {
if (paused || box.offsetParent === null) return;
const next = (at() + 1) % list.length;
track.scrollTo({ left: next * track.clientWidth, behavior: "smooth" });
}, 4500);
}
}

const baseChips = renderChips;
renderChips = function(){ baseChips(); if (!bannersDone){ bannersDone = true; renderBanners(); } };
