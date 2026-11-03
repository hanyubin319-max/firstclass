document.addEventListener('DOMContentLoaded', () => {
  const tabs = [...document.querySelectorAll('.category-tab')];
  const grid = document.querySelector('#product-grid');
  const cards = [...document.querySelectorAll('.category-product')];
  const count = document.querySelector('#product-count');
  const empty = document.querySelector('#empty-products');
  const sort = document.querySelector('#product-sort');
  let activeCategory = 'all';

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
    grid.setAttribute('aria-labelledby', activeTab.id);
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      activeCategory = tab.dataset.category;
      tabs.forEach(item => {
        const selected = item === tab;
        item.classList.toggle('is-active', selected);
        item.setAttribute('aria-selected', String(selected));
        item.tabIndex = selected ? 0 : -1;
      });
      renderProducts();
    });
    tab.addEventListener('keydown', event => {
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      tabs[next].focus();
      tabs[next].click();
    });
  });
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