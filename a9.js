(function(){
if (!tg) return;
try { tg.setHeaderColor("#ffffff"); tg.setBackgroundColor("#ffffff"); if (tg.setBottomBarColor) tg.setBottomBarColor("#ffffff"); } catch {}
const set = tg.MainButton.setParams.bind(tg.MainButton);
tg.MainButton.setParams = p => set({ color: "#111111", text_color: "#ffffff", ...p });
})();
