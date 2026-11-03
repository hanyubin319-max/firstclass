document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('#product-grid');
  const cards = [...document.querySelectorAll('.category-product')];
  const count = document.querySelector('#product-count');
  const categoryTitle = document.querySelector('#category-title');
  const empty = document.querySelector('#empty-products');
  const sort = document.querySelector('#product-sort');
  const setFilterWrap = document.querySelector('#set-filter-wrap');
  const setFilter = document.querySelector('#set-filter');
  const pagination = document.querySelector('#product-pagination');
  const topTabs = [...document.querySelectorAll('.category-tab')];
  const subTabs = [...document.querySelectorAll('.category-subtab')];
  const typeSubcategories = document.querySelector('#type-subcategories');
  const concernSubcategories = document.querySelector('#concern-subcategories');
  const skinSubcategories = document.querySelector('#skin-subcategories');

  let activeTitle = 'Best';
  let activeCategory = 'Best';
  let activeSubcategory = '';
  let currentPage = 1;

  function matchesCategory(card) {
    if (activeTitle === 'Best') return card.querySelector('.product-labels')?.textContent.includes('BEST');
    if (activeTitle === 'New') return card.querySelector('.product-labels')?.textContent.includes('NEW');
    if (activeTitle === '단품/세트') {
      const matchesProductType = card.dataset.productType === setFilter.value;
      const matchesSubcategory = !activeSubcategory || card.dataset.subcategory === activeSubcategory;
      return matchesProductType && matchesSubcategory;
    }
    if (activeTitle === '유형별' && activeSubcategory) return card.dataset.subcategory === activeSubcategory;
    if (activeTitle === '고민별' && activeSubcategory) return (card.dataset.concerns || '').split('|').includes(activeSubcategory);
    if (activeTitle === '피부타입별' && activeSubcategory) return (card.dataset.skinTypes || '').split('|').includes(activeSubcategory);
    if (activeTitle === '유형별' || activeTitle === '고민별' || activeTitle === '피부타입별') return true;
    return true;
  }

  function sortCards(visibleCards) {
    const mode = sort.value;
    const sorted = [...visibleCards];
    if (mode === 'newest') sorted.sort((a, b) => Number(b.dataset.date || 0) - Number(a.dataset.date || 0));
    if (mode === 'popular' || mode === 'recommended') sorted.sort((a, b) => Number(b.dataset.popularity || 0) - Number(a.dataset.popularity || 0));
    if (mode === 'price-low') sorted.sort((a, b) => Number(a.dataset.price || 0) - Number(b.dataset.price || 0));
    if (mode === 'price-high') sorted.sort((a, b) => Number(b.dataset.price || 0) - Number(a.dataset.price || 0));
    return sorted;
  }

  function renderProducts() {
    const visibleCards = sortCards(cards.filter(matchesCategory));
    cards.forEach(card => { card.hidden = !visibleCards.includes(card); });
    visibleCards.forEach(card => grid.appendChild(card));
    count.textContent = String(visibleCards.length);
    empty.hidden = visibleCards.length !== 0;
    grid.hidden = visibleCards.length === 0;
    categoryTitle.textContent = activeTitle;
    setFilterWrap.hidden = activeTitle !== '단품/세트';
    pagination.hidden = visibleCards.length === 0;
    // Until a page-size setting is chosen, all available products remain on one page.
    currentPage = 1;
    pagination.querySelector('[data-page="1"]').textContent = '1';
    pagination.querySelector('[data-page="1"]').classList.add('is-active');
    pagination.querySelector('[data-page="prev"]').disabled = true;
    pagination.querySelector('[data-page="next"]').disabled = true;
  }

  function selectTopCategory(tab) {
    activeTitle = tab.dataset.category;
    activeCategory = activeTitle;
    activeSubcategory = '';
    topTabs.forEach(item => {
      const selected = item === tab;
      item.classList.toggle('is-active', selected);
      item.setAttribute('aria-selected', String(selected));
    });
    typeSubcategories.hidden = activeTitle !== '유형별' && activeTitle !== '단품/세트';
    concernSubcategories.hidden = activeTitle !== '고민별';
    skinSubcategories.hidden = activeTitle !== '피부타입별';
    document.querySelector('#tab-type').setAttribute('aria-expanded', String(!typeSubcategories.hidden));
    document.querySelector('#tab-concern').setAttribute('aria-expanded', String(!concernSubcategories.hidden));
    document.querySelector('#tab-skin').setAttribute('aria-expanded', String(!skinSubcategories.hidden));
    subTabs.forEach(item => item.classList.remove('is-active'));
    setFilter.value = 'single';
    renderProducts();
  }

  topTabs.forEach(tab => tab.addEventListener('click', () => selectTopCategory(tab)));

  subTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      activeSubcategory = tab.dataset.subcategory;
      subTabs.forEach(item => item.classList.toggle('is-active', item === tab));
      renderProducts();
    });
  });

  setFilter.addEventListener('change', renderProducts);
  sort.addEventListener('change', renderProducts);

  pagination.addEventListener('click', event => {
    const pageButton = event.target.closest('button');
    if (!pageButton || pageButton.disabled) return;
    // Page size is not configured yet, so page navigation remains on page 1.
    currentPage = 1;
  });

  const categoryParams = new URLSearchParams(window.location.search);
  const requestedCategory = categoryParams.get('category');
  const matchingTopTab = topTabs.find(tab => tab.dataset.category === requestedCategory);
  const matchingSubTab = subTabs.find(tab => tab.dataset.subcategory === requestedCategory);
  if (matchingTopTab) {
    selectTopCategory(matchingTopTab);
  } else if (matchingSubTab) {
    const parentTab = matchingSubTab.closest('#type-subcategories') ? document.querySelector('#tab-type') : matchingSubTab.closest('#concern-subcategories') ? document.querySelector('#tab-concern') : document.querySelector('#tab-skin');
    selectTopCategory(parentTab);
    matchingSubTab.click();
  } else {
    selectTopCategory(document.querySelector('#tab-best'));
  }

  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('#main-nav');
  menuToggle?.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
  });
});