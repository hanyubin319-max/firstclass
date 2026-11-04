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

  // Allow desktop users to scroll the overflowing category row by dragging with the mouse.
  const categoryTabs = document.querySelector('.category-tabs');
  if (categoryTabs) {
    const updateCategoryTabAlignment = () => {
      categoryTabs.classList.toggle('has-overflow', categoryTabs.scrollWidth > categoryTabs.clientWidth + 1);
    };
    updateCategoryTabAlignment();
    window.addEventListener('resize', updateCategoryTabAlignment);
    if ('ResizeObserver' in window) {
      const categoryTabsObserver = new ResizeObserver(updateCategoryTabAlignment);
      categoryTabsObserver.observe(categoryTabs);
      [...categoryTabs.children].forEach(tab => categoryTabsObserver.observe(tab));
    }

    let isDragging = false;
    let startX = 0;
    let startScrollLeft = 0;
    let dragged = false;

    categoryTabs.addEventListener('mousedown', event => {
      if (event.button !== 0 || categoryTabs.scrollWidth <= categoryTabs.clientWidth) return;
      isDragging = true;
      dragged = false;
      startX = event.pageX;
      startScrollLeft = categoryTabs.scrollLeft;
      categoryTabs.classList.add('is-dragging');
    });

    window.addEventListener('mousemove', event => {
      if (!isDragging) return;
      const distance = event.pageX - startX;
      if (Math.abs(distance) > 3) dragged = true;
      categoryTabs.scrollLeft = startScrollLeft - distance;
    });

    window.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      categoryTabs.classList.remove('is-dragging');
    });

    categoryTabs.addEventListener('click', event => {
      if (!dragged) return;
      event.preventDefault();
      event.stopPropagation();
      dragged = false;
    }, true);
  }
  const subTabs = [...document.querySelectorAll('.category-subtab')];
  const typeSubcategories = document.querySelector('#type-subcategories');
  const concernSubcategories = document.querySelector('#concern-subcategories');
  const skinSubcategories = document.querySelector('#skin-subcategories');

  // Replace native select menus with accessible custom dropdowns so option hover/selection can use the brand mint.
  function enhanceSelect(select) {
    if (!select) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select';
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'custom-select-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    const menu = document.createElement('div');
    menu.className = 'custom-select-menu';
    menu.setAttribute('role', 'listbox');
    const options = [...select.options].map((option, index) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'custom-select-option';
      item.textContent = option.textContent;
      item.dataset.value = option.value;
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', String(option.selected));
      item.tabIndex = -1;
      item.addEventListener('click', () => {
        select.value = option.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        closeMenu();
        trigger.focus();
      });
      menu.appendChild(item);
      return item;
    });
    function syncOptions() {
      const selected = select.selectedOptions[0];
      trigger.textContent = selected ? selected.textContent : '';
      // Re-append the visual arrow after updating the button label.
      trigger.classList.toggle('has-value', Boolean(selected));
      options.forEach(item => item.setAttribute('aria-selected', String(item.dataset.value === select.value)));
    }
    function openMenu() {
      wrapper.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      const selectedIndex = Math.max(0, options.findIndex(item => item.dataset.value === select.value));
      options[selectedIndex]?.focus();
    }
    function closeMenu() {
      wrapper.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    }
    trigger.addEventListener('click', () => wrapper.classList.contains('is-open') ? closeMenu() : openMenu());
    options.forEach((item, index) => item.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const next = (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
        options[next].focus();
      } else if (event.key === 'Escape') {
        closeMenu();
        trigger.focus();
      } else if (event.key === 'Tab') {
        closeMenu();
      }
    }));
    trigger.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openMenu();
      }
    });
    select.addEventListener('change', syncOptions);
    select.classList.add('custom-select-native');
    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(trigger);
    wrapper.appendChild(menu);
    wrapper.appendChild(select);
    syncOptions();
    document.addEventListener('click', event => {
      if (!wrapper.contains(event.target)) closeMenu();
    });
  }
  enhanceSelect(sort);
  enhanceSelect(setFilter);

  let activeTitle = 'Best';
  let activeCategory = 'Best';
  let activeSubcategory = '';
  let currentPage = 1;

  function matchesCategory(card) {
    if (card.dataset.topCategory !== activeTitle) return false;
    if (activeTitle === '단품/세트') {
      const matchesProductType = setFilter.value === 'all' || card.dataset.productType === setFilter.value;
      return matchesProductType && (!activeSubcategory || card.dataset.subcategory === activeSubcategory);
    }
    if (activeTitle === '유형별' && activeSubcategory) return card.dataset.subcategory === activeSubcategory;
    if (activeTitle === '고민별' && activeSubcategory) return (card.dataset.concerns || '').split('|').includes(activeSubcategory);
    if (activeTitle === '피부타입별' && activeSubcategory) return (card.dataset.skinTypes || '').split('|').includes(activeSubcategory);
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
    setFilter.value = activeTitle === '단품/세트' ? 'all' : 'single';
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



});
