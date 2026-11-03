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
    if (activeTitle === 'Best') return card.querySelector('.product-labels')?.textContent.includes('BEST');
    if (activeTitle === 'New') return card.querySelector('.product-labels')?.textContent.includes('NEW');
    if (activeTitle === '단품/세트') {
      const matchesProductType = setFilter.value === 'all' || card.dataset.productType === setFilter.value;
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



  const promoMessage = document.querySelector('#promo-message');
  const promoPrev = document.querySelector('.promo-prev');
  const promoNext = document.querySelector('.promo-next');
  const promoMessages = ['첫구매 반값 50% 혜택', '회원 가입 시 5천원 즉시사용 쿠폰'];
  let promoIndex = 0;
  let promoTimer;

  function showPromoMessage(nextIndex) {
    if (!promoMessage) return;
    promoMessage.classList.add('is-changing');
    window.setTimeout(() => {
      promoIndex = (nextIndex + promoMessages.length) % promoMessages.length;
      promoMessage.textContent = promoMessages[promoIndex];
      promoMessage.classList.remove('is-changing');
    }, 250);
  }

  function resetPromoTimer() {
    if (!promoMessage || !promoPrev || !promoNext) return;
    window.clearInterval(promoTimer);
    promoTimer = window.setInterval(() => showPromoMessage(promoIndex + 1), 7000);
  }

  promoPrev?.addEventListener('click', () => {
    showPromoMessage(promoIndex - 1);
    resetPromoTimer();
  });
  promoNext?.addEventListener('click', () => {
    showPromoMessage(promoIndex + 1);
    resetPromoTimer();
  });
  resetPromoTimer();

  const siteHeader = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('#main-nav');
  const megaMenu = document.querySelector('#header-mega-menu');
  const menuLinks = mainNav?.querySelectorAll('[data-menu]') || [];
  const submenuLinks = megaMenu?.querySelectorAll('[data-submenu]') || [];

  function closeMegaMenu() {
    if (!megaMenu) return;
    megaMenu.hidden = true;
    megaMenu.classList.remove('is-open', 'product-active', 'biodance-active', 'community-active', 'new-active', 'event-active', 'has-secondary-open');
    menuLinks.forEach(link => {
      link.classList.remove('is-active');
      link.setAttribute('aria-expanded', 'false');
    });
  }

  function openMegaMenu(menuName, activeLink) {
    if (!megaMenu) return;
    megaMenu.hidden = false;
    megaMenu.classList.add('is-open');
    megaMenu.classList.toggle('product-active', menuName === 'product');
    megaMenu.classList.toggle('biodance-active', menuName === 'biodance');
    megaMenu.classList.toggle('community-active', menuName === 'community');
    megaMenu.classList.toggle('new-active', menuName === 'new');
    megaMenu.classList.toggle('event-active', menuName === 'event');
    megaMenu.classList.remove('has-secondary-open');
    megaMenu.querySelectorAll('[data-panel]').forEach(panel => {
      panel.hidden = !['biodance', 'product', 'community', 'new', 'event'].includes(panel.dataset.panel);
    });
    megaMenu.querySelectorAll('.mega-secondary').forEach(panel => panel.hidden = true);
    megaMenu.querySelectorAll('[data-submenu]').forEach(item => item.classList.remove('is-active'));
    menuLinks.forEach(link => {
      const active = link === activeLink;
      link.classList.toggle('is-active', active);
      link.setAttribute('aria-expanded', String(active));
    });
  }

  mainNav?.querySelectorAll('a:not([data-menu])').forEach(link => {
    link.addEventListener('click', () => {
      megaMenu?.classList.remove('has-secondary-open');
      megaMenu?.querySelectorAll('.mega-secondary').forEach(panel => panel.hidden = true);
    });
  });

  menuLinks.forEach(link => {
    link.addEventListener('click', event => {
      if (link.dataset.noNavigation === 'true') event.preventDefault();
    });
    link.addEventListener('mouseenter', () => {
      if (window.matchMedia('(min-width: 768px)').matches) openMegaMenu(link.dataset.menu, link);
    });
  });

  function toggleSecondaryMenu(link) {
    const target = megaMenu?.querySelector('[data-panel="' + link.dataset.submenu + '"]');
    if (!target) return;
    const shouldOpen = target.hidden;
    megaMenu.querySelectorAll('.mega-secondary').forEach(panel => panel.hidden = true);
    target.hidden = !shouldOpen;
    megaMenu.classList.toggle('has-secondary-open', shouldOpen);
    megaMenu.querySelectorAll('[data-submenu]').forEach(item => item.classList.toggle('is-active', item === link));
  }

  megaMenu?.querySelectorAll('[data-no-navigation="true"]').forEach(link => {
    link.addEventListener('click', event => event.preventDefault());
  });

  submenuLinks.forEach(link => {
    const arrow = link.querySelector('span');
    if (!arrow) return;
    arrow.setAttribute('role', 'button');
    arrow.setAttribute('tabindex', '0');
    arrow.setAttribute('aria-label', link.textContent.trim() + ' 하위 메뉴 열기');
    arrow.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      toggleSecondaryMenu(link);
    });
    arrow.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleSecondaryMenu(link);
      }
    });
  });

  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header')) closeMegaMenu();
  });

  // Close the expanded mega menu when the pointer leaves the entire header area.
  siteHeader?.addEventListener('mouseleave', closeMegaMenu);

  menuToggle?.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
    if (!isOpen) closeMegaMenu();
  });

});