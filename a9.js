(function(){
if (!tg) return;
try { tg.setHeaderColor("#0f0f0f"); tg.setBackgroundColor("#0a0a0a"); if (tg.setBottomBarColor) tg.setBottomBarColor("#0f0f0f"); } catch {}
const set = tg.MainButton.setParams.bind(tg.MainButton);
tg.MainButton.setParams = p => set({ color: "#d4af37", text_color: "#111111", ...p });
})();
