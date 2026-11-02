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
    nature3d: { label: "3D 네이처 어드벤처", file: "nature-adventure.css" },
    organic: { label: "오가닉 매거진", file: "organic-magazine.css" },
    yellowposter: { label: "옐로우 일러스트 포스터", file: "yellow-poster.css" },
    geometric: { label: "블루 지오메트릭", file: "blue-geometric.css" },
    seoullight: { label: "서울라이트 디지털 서브컬처", file: "seoul-light.css" },
    kda2026: { label: "코리아 퍼블릭 디자인 2026", file: "korea-public-design.css" },
    y2kcollage: { label: "Y2K 언더그라운드 콜라주", file: "y2k-collage.css" },
    heritage2029: { label: "컨템포러리 한국 헤리티지", file: "korean-heritage.css" },
    painterly: { label: "페인터리 플로럴", file: "painterly-floral.css" }
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
