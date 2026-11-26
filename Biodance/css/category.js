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
  const promotionSubcategories = document.querySelector('#promotion-subcategories');

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

  function configureSortForCategory() {
    const isAllProducts = activeTitle === '전체상품';
    const newestOption = [...sort.options].find(option => option.value === 'newest');
    if (newestOption) newestOption.textContent = isAllProducts ? '최신순' : '신상품';
    [...sort.options].forEach(option => {
      option.hidden = isAllProducts
        ? !['newest', 'oldest'].includes(option.value)
        : option.value === 'oldest';
    });
    const customMenu = sort.parentElement.querySelector('.custom-select-menu');
    if (customMenu) {
      [...customMenu.children].forEach(item => {
        item.hidden = isAllProducts
          ? !['newest', 'oldest'].includes(item.dataset.value)
          : item.dataset.value === 'oldest';
        if (item.dataset.value === 'newest') item.textContent = isAllProducts ? '최신순' : '신상품';
      });
    }
    if (isAllProducts) sort.value = 'newest';
    else if (sort.value === 'oldest') sort.value = 'recommended';
    sort.dispatchEvent(new Event('change'));
  }

  let activeTitle = 'Best';
  let activeCategory = 'Best';
  let activeSubcategory = '';
  let currentPage = 1;

  function matchesCategory(card) {
    if (activeTitle === '전체상품') return true;
    if (activeTitle === 'Promotion' && activeSubcategory === "Woni's Pick") {
      return Boolean(card.querySelector('.product-label.label-woni-pick'));
    }
    if (card.dataset.topCategory !== activeTitle) return false;
    if (activeTitle === '단품/세트') {
      return setFilter.value === 'all' || card.dataset.productType === setFilter.value;
    }
    if (activeTitle === 'Promotion') {
      return Boolean(activeSubcategory) && card.dataset.promotionGroup === activeSubcategory;
    }
    if (activeTitle === '공식몰 단독기획') return card.dataset.topCategory === activeTitle;
    if (activeSubcategory) {
      const values = (card.dataset[activeTitle === '유형별' ? 'subcategory' : activeTitle === '고민별' ? 'concerns' : 'skinTypes'] || '').split('|');
      return values.includes(activeSubcategory);
    }
    return true;
  }

  function sortCards(visibleCards) {
    const mode = sort.value;
    const sorted = [...visibleCards];
    if (mode === 'newest') sorted.sort((a, b) => {
      const aIsNew = [...a.querySelectorAll('.product-label')].some(label => label.textContent.trim().toUpperCase() === 'NEW');
      const bIsNew = [...b.querySelectorAll('.product-label')].some(label => label.textContent.trim().toUpperCase() === 'NEW');
      if (aIsNew !== bIsNew) return aIsNew ? -1 : 1;
      return Number(b.dataset.date || 0) - Number(a.dataset.date || 0);
    });
    if (mode === 'oldest') sorted.sort((a, b) => Number(a.dataset.date || 0) - Number(b.dataset.date || 0));
    if (mode === 'popular' || mode === 'recommended') sorted.sort((a, b) => Number(b.dataset.popularity || 0) - Number(a.dataset.popularity || 0));
    if (mode === 'price-low') sorted.sort((a, b) => Number(a.dataset.price || 0) - Number(b.dataset.price || 0));
    if (mode === 'price-high') sorted.sort((a, b) => Number(b.dataset.price || 0) - Number(a.dataset.price || 0));
    return sorted;
  }

  function renderProducts() {
    const isAllProducts = activeTitle === '전체상품';
    const allowedSorts = isAllProducts ? ['newest', 'oldest'] : ['recommended', 'newest', 'popular', 'price-low', 'price-high'];
    [...sort.options].forEach(option => { option.hidden = !allowedSorts.includes(option.value); });
    const customSort = sort.closest('.custom-select');
    if (customSort) {
      customSort.querySelectorAll('.custom-select-option').forEach(option => { option.hidden = !allowedSorts.includes(option.dataset.value); });
    }
    if (!allowedSorts.includes(sort.value)) {
      sort.value = isAllProducts ? 'newest' : 'recommended';
      const selectedOption = sort.selectedOptions[0];
      const trigger = customSort?.querySelector('.custom-select-trigger');
      if (trigger && selectedOption) trigger.textContent = selectedOption.textContent;
    }

    const filteredCards = sortCards(cards.filter(matchesCategory));
    const columns = Math.max(1, getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length);
    const pageSize = columns * 5;
    const totalPages = Math.max(1, Math.ceil(filteredCards.length / pageSize));
    currentPage = Math.min(Math.max(1, currentPage), totalPages);
    const pageCards = filteredCards.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    cards.forEach(card => { card.hidden = !pageCards.includes(card); });
    pageCards.forEach(card => grid.appendChild(card));
    count.textContent = String(filteredCards.length);
    empty.hidden = filteredCards.length !== 0;
    grid.hidden = filteredCards.length === 0;
    categoryTitle.textContent = activeTitle;
    setFilterWrap.hidden = activeTitle !== '단품/세트';

    pagination.hidden = filteredCards.length === 0;
    if (filteredCards.length > 0) {
      const pageButtons = [];
      const prev = document.createElement('button');
      prev.type = 'button';
      prev.className = 'pagination-arrow';
      prev.dataset.page = 'prev';
      prev.setAttribute('aria-label', '이전 페이지');
      prev.disabled = currentPage === 1;
      pageButtons.push(prev);

      for (let page = 1; page <= totalPages; page++) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'pagination-number' + (page === currentPage ? ' is-active' : '');
        button.dataset.page = String(page);
        button.textContent = String(page);
        if (page === currentPage) button.setAttribute('aria-current', 'page');
        pageButtons.push(button);
      }

      const next = document.createElement('button');
      next.type = 'button';
      next.className = 'pagination-arrow';
      next.dataset.page = 'next';
      next.setAttribute('aria-label', '다음 페이지');
      next.disabled = currentPage === totalPages;
      pageButtons.push(next);
      pagination.replaceChildren(...pageButtons);
    }
  }

  function selectTopCategory(tab) {
    currentPage = 1;
    activeTitle = tab.dataset.category;
    activeCategory = activeTitle;
    configureSortForCategory();
    activeSubcategory = '';
    topTabs.forEach(item => {
      const selected = item === tab;
      item.classList.toggle('is-active', selected);
      item.setAttribute('aria-selected', String(selected));
    });
    typeSubcategories.hidden = activeTitle !== '유형별' && activeTitle !== '단품/세트';
    concernSubcategories.hidden = activeTitle !== '고민별';
    skinSubcategories.hidden = activeTitle !== '피부타입별';
    promotionSubcategories.hidden = activeTitle !== 'Promotion';
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
      currentPage = 1;
      activeSubcategory = tab.dataset.subcategory;
      subTabs.forEach(item => item.classList.toggle('is-active', item === tab));
      renderProducts();
    });
  });

  pagination.addEventListener('click', event => {
    const button = event.target.closest('button[data-page]');
    if (!button || button.disabled) return;
    const page = button.dataset.page;
    if (page === 'prev') currentPage = Math.max(1, currentPage - 1);
    else if (page === 'next') currentPage += 1;
    else currentPage = Number(page);
    renderProducts();
  });

  setFilter.addEventListener('change', () => { currentPage = 1; renderProducts(); });
  sort.addEventListener('change', () => { currentPage = 1; renderProducts(); });


  const categoryParams = new URLSearchParams(window.location.search);
  const requestedCategory = categoryParams.get('category');
  const matchingTopTab = topTabs.find(tab => tab.dataset.category === requestedCategory);
  const matchingSubTab = subTabs.find(tab => tab.dataset.subcategory === requestedCategory);
  if (requestedCategory === '전체상품') {
    activeTitle = '전체상품';
    activeCategory = activeTitle;
    configureSortForCategory();
    activeSubcategory = '';
    topTabs.forEach(item => {
      item.classList.remove('is-active');
      item.setAttribute('aria-selected', 'false');
    });
    typeSubcategories.hidden = true;
    concernSubcategories.hidden = true;
    skinSubcategories.hidden = true;
    promotionSubcategories.hidden = true;
    renderProducts();
  } else if (matchingTopTab) {
    selectTopCategory(matchingTopTab);
  } else if (matchingSubTab) {
    const parentTab = matchingSubTab.closest('#type-subcategories') ? document.querySelector('#tab-type') : matchingSubTab.closest('#concern-subcategories') ? document.querySelector('#tab-concern') : matchingSubTab.closest('#skin-subcategories') ? document.querySelector('#tab-skin') : topTabs.find(tab => tab.dataset.category === 'Promotion');
    selectTopCategory(parentTab);
    matchingSubTab.click();
  } else {
    selectTopCategory(document.querySelector('#tab-best'));
  }



});
