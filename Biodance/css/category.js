document.addEventListener('DOMContentLoaded', () => {
  const tabs = [...document.querySelectorAll('.category-tab')];
  const grid = document.querySelector('#product-grid');
  const cards = [...document.querySelectorAll('.category-product')];
  const count = document.querySelector('#product-count');
  const categoryTitle = document.querySelector('#category-title');
  const empty = document.querySelector('#empty-products');
  const sort = document.querySelector('#product-sort');
  let activeCategory = 'all';\n  let activeTitle = 'Best';\n  const typeSubcategories = document.querySelector('#type-subcategories');\n  const concernSubcategories = document.querySelector('#concern-subcategories');\n  const topTabs = [...document.querySelectorAll('.category-tab')];\n  const subTabs = [...document.querySelectorAll('.category-subtab')];

  function renderProducts() {
    const visibleCards = cards.filter(card => activeCategory === 'all' || card.dataset.category === activeCategory);
    cards.forEach(card => { card.hidden = !visibleCards.includes(card); });
    if (sort.value === 'name') {
      visibleCards.sort((a, b) => a.dataset.name.localeCompare(b.dataset.name, 'ko'));
      visibleCards.forEach(card => grid.appendChild(card));
    } else {
      cards.forEach(card => grid.appendChild(card));
    }
    count.textContent = String(visibleCards.length);
    empty.hidden = visibleCards.length !== 0;
    grid.hidden = visibleCards.length === 0;
    const activeTab = tabs.find(tab => tab.dataset.category === activeCategory);
    categoryTitle.textContent = activeTab.textContent.trim();
    grid.setAttribute('aria-labelledby', activeTab.id);
  }

  function selectTopCategory(tab, title = tab.dataset.category) {
    activeTitle = title;
    topTabs.forEach(item => {
      const selected = item === tab;
      item.classList.toggle('is-active', selected);
      item.setAttribute('aria-selected', String(selected));
    });
    typeSubcategories.hidden = tab.dataset.category !== '유형별';
    concernSubcategories.hidden = tab.dataset.category !== '고민별';
    document.querySelector('#tab-type').setAttribute('aria-expanded', String(!typeSubcategories.hidden));
    document.querySelector('#tab-concern').setAttribute('aria-expanded', String(!concernSubcategories.hidden));
    subTabs.forEach(item => item.classList.remove('is-active'));
    renderProducts();
  }

  topTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      activeCategory = 'all';
      selectTopCategory(tab);
    });
  });

  subTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      activeCategory = 'all';
      subTabs.forEach(item => item.classList.toggle('is-active', item === tab));
      activeTitle = tab.dataset.subcategory;
      categoryTitle.textContent = activeTitle;
      renderProducts();
    });
  });

  const categoryParams = new URLSearchParams(window.location.search);
  const requestedCategory = categoryParams.get('category');
  const matchingTopTab = topTabs.find(tab => tab.dataset.category === requestedCategory);
  const matchingSubTab = subTabs.find(tab => tab.dataset.subcategory === requestedCategory);
  if (matchingTopTab) {
    selectTopCategory(matchingTopTab);
  } else if (matchingSubTab) {
    const parentTab = matchingSubTab.closest('#type-subcategories') ? document.querySelector('#tab-type') : document.querySelector('#tab-concern');
    selectTopCategory(parentTab);
    matchingSubTab.click();
  }
  sort.addEventListener('change', renderProducts);

  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('#main-nav');
  menuToggle?.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
  });
  renderProducts();
});