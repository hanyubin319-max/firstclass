/* Switch the visual theme without changing page content or functionality. */
(() => {
  const themes = {
    claymorphism: { label: "클레이모피즘", file: "claymorphism.css" },
    popart: { label: "팝아트", file: "pop-art.css" },
    bauhaus: { label: "바우하우스", file: "bauhaus.css" },
    risograph: { label: "리소그래프", file: "risograph.css" },
    "grainy-gradient": { label: "그레이니 그라디언트", file: "grainy-gradient.css" },
    maximalism: { label: "맥시멀리즘", file: "maximalism.css" },
    propaganda: { label: "프로파간다 포스터", file: "propaganda.css" },
    glassmorphism: { label: "글래스모피즘", file: "glassmorphism.css" },
    minimalism: { label: "미니멀리즘", file: "minimalism.css" },
  };
  const selector = document.querySelector("#theme-select");
  const wrap = document.querySelector("#wrap");
  const stylesheet = document.querySelector("#theme-style");
  if (!selector || !wrap || !stylesheet) return;
  const initial = Object.keys(themes).find(key => wrap.classList.contains(key)) || "propaganda";
  selector.value = initial;
  selector.addEventListener("change", () => {
    const selected = selector.value;
    if (!themes[selected]) return;
    stylesheet.href = themes[selected].file;
    wrap.className = selected;
  });
})();
