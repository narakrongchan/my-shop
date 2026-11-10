let map = null, pin = null, picked = null, pickLabel = "Home", leafletP = null, searchT = null;

function loadLeaflet(){
if (window.L) return Promise.resolve();
if (leafletP) return leafletP;
leafletP = new Promise((ok, fail) => {
const css = el("link"); css.rel = "stylesheet";
css.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
document.head.appendChild(css);
const s = el("script"); s.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
s.onload = ok; s.onerror = () => { leafletP = null; fail(); };
document.head.appendChild(s);
});
return leafletP;
}

function setPin(lat, lng, zoom){
picked = { lat: +lat.toFixed(6), lng: +lng.toFixed(6) };
if (!pin){
const icon = L.divIcon({ className: "", html: '<div class="mpin"></div>', iconSize: [28, 28], iconAnchor: [14, 28] });
pin = L.marker([lat, lng], { icon, draggable: true }).addTo(map);
pin.on("dragend", () => { const p = pin.getLatLng(); setPin(p.lat, p.lng); });
} else pin.setLatLng([lat, lng]);
if (zoom) map.setView([lat, lng], zoom);
$("locCoords").textContent = "📍 " + picked.lat + ", " + picked.lng;
}

async function openLoc(){
$("locModal").hidden = false; $("locErr").hidden = true;
pickLabel = (loc && loc.label) || "Home"; $("locLabel").value = ""; renderLabels();
try { await loadLeaflet(); } catch { $("locErr").textContent = "The map couldn't load. Check your connection and try again."; $("locErr").hidden = false; return; }
const mc = shop.mapCenter || [11.5564, 104.9282]; // default: Phnom Penh
const c = loc || picked || { lat: mc[0], lng: mc[1] };
if (!map){
map = L.map("map", { zoomControl: true, attributionControl: true }).setView([c.lat, c.lng], 14);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap" }).addTo(map);
map.on("click", e => setPin(e.latlng.lat, e.latlng.lng));
}
setTimeout(() => { map.invalidateSize(); setPin(c.lat, c.lng, 15); }, 60);
}

function closeLoc(){ $("locModal").hidden = true; }

function search(q){
clearTimeout(searchT);
const list = $("locResults");
if (q.trim().length < 3){ list.textContent = ""; return; }
searchT = setTimeout(async () => {
try {
const cc = shop.mapCountry ? "&countrycodes=" + encodeURIComponent(shop.mapCountry) : "";
const r = await fetch("https://nominatim.openstreetmap.org/search?format=json&limit=5" + cc + "&q=" + encodeURIComponent(q));
const items = await r.json(); list.textContent = "";
if (!items.length){ list.appendChild(el("li", "none", "No places found. Try another name, or tap the map.")); return; }
for (const it of items){
const li = el("li", "", it.display_name);
li.onclick = () => { setPin(+it.lat, +it.lon, 16); list.textContent = ""; $("locSearch").value = it.display_name.split(",")[0]; };
list.appendChild(li);
}
} catch { list.textContent = ""; list.appendChild(el("li", "none", "Search isn't available right now. Tap the map to place the pin.")); }
}, 500);
}

function useMyLocation(){
const err = $("locErr");
if (!navigator.geolocation){ err.textContent = "Your phone didn't share a location. Tap the map instead."; err.hidden = false; return; }
navigator.geolocation.getCurrentPosition(
p => { err.hidden = true; setPin(p.coords.latitude, p.coords.longitude, 17); },
() => { err.textContent = "Location access was blocked. Tap the map to place the pin instead."; err.hidden = false; },
{ enableHighAccuracy: true, timeout: 10000 });
}

function renderLabels(){
const row = $("locChips"); row.textContent = "";
for (const v of ["Home", "Work"]){
const b = el("button", "ochip", v); b.type = "button";
b.setAttribute("aria-pressed", String(pickLabel === v));
b.onclick = () => { pickLabel = v; $("locLabel").value = ""; renderLabels(); };
row.appendChild(b);
}
}

async function saveLoc(){
if (!picked){ $("locErr").textContent = "Tap the map to place the pin first."; $("locErr").hidden = false; return; }
const custom = $("locLabel").value.trim().slice(0, 30);
loc = { lat: picked.lat, lng: picked.lng, label: custom || pickLabel || "Home" };
try { localStorage.setItem("shop-loc", JSON.stringify(loc)); } catch {}
showLoc(); closeLoc();
if (!$("fAddr").value.trim()){
try {
const r = await fetch("https://nominatim.openstreetmap.org/reverse?format=json&zoom=18&lat=" + loc.lat + "&lon=" + loc.lng);
const j = await r.json(); if (j.display_name && !$("fAddr").value.trim()) $("fAddr").value = j.display_name;
} catch {}
}
}

function showLoc(){
const box = $("locSet");
box.hidden = !loc; $("locBtn").textContent = loc ? "Change" : "⊕ Add location";
if (loc) box.textContent = "📍 " + loc.label + " · " + loc.lat + ", " + loc.lng;
}

function initLoc(){
try { loc = JSON.parse(localStorage.getItem("shop-loc") || "null"); } catch {}
showLoc();
$("locBtn").onclick = openLoc;
$("locClose").onclick = closeLoc;
$("locModal").onclick = e => { if (e.target.id === "locModal") closeLoc(); };
$("locSearch").oninput = e => search(e.target.value);
$("locMe").onclick = useMyLocation;
$("locSave").onclick = saveLoc;
$("locLabel").oninput = () => { if ($("locLabel").value.trim()){ pickLabel = ""; renderLabels(); } };
}
