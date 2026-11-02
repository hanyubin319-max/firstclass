/* Switch the visual theme without changing page content or functionality. */
(() => {
  const themes = {
    claymorphism: { label: "클레이모피즘", file: "claymorphism.css" },
    bauhaus: { label: "바우하우스", file: "bauhaus.css" },
    "y2k-chrome": { label: "Y2K Chrome", file: "y2k-chrome.css" },
  };
  const selector = document.querySelector("#theme-select");
  const wrap = document.querySelector("#wrap");
  const stylesheet = document.querySelector("#theme-style");
  if (!selector || !wrap || !stylesheet) return;
  const initial = Object.keys(themes).find(key => wrap.classList.contains(key)) || "claymorphism";
  selector.value = initial;
  stylesheet.href = themes[initial].file;
  wrap.className = initial;
  selector.addEventListener("change", () => {
    const selected = selector.value;
    if (!themes[selected]) return;
    stylesheet.href = themes[selected].file;
    wrap.className = selected;
  });
})();
