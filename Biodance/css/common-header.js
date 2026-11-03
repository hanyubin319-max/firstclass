document.addEventListener('DOMContentLoaded', async () => {
  const mount = document.querySelector('[data-shared-header]');
  if (!mount) return;
  try {
    const response = await fetch('header.html');
    if (!response.ok) throw new Error('공통 메뉴바를 불러오지 못했습니다.');
    mount.outerHTML = await response.text();
  } catch (error) { console.error(error); return; }

  const siteHeader = document.querySelector('.site-header');
  const promoMessage = document.querySelector('#promo-message');
  const promoPrev = document.querySelector('.promo-prev');
  const promoNext = document.querySelector('.promo-next');
  const promoMessages = ['첫구매 반값 50% 혜택', '회원 가입 시 5천원 즉시사용 쿠폰'];
  let promoIndex = 0, promoTimer;
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
    if (!promoPrev || !promoNext) return;
    window.clearInterval(promoTimer);
    promoTimer = window.setInterval(() => showPromoMessage(promoIndex + 1), 7000);
  }
  promoPrev?.addEventListener('click', () => { showPromoMessage(promoIndex - 1); resetPromoTimer(); });
  promoNext?.addEventListener('click', () => { showPromoMessage(promoIndex + 1); resetPromoTimer(); });
  resetPromoTimer();

  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('#main-nav');
  const megaMenu = document.querySelector('#header-mega-menu');
  const menuLinks = [...(mainNav?.querySelectorAll('[data-menu]') || [])];
  const submenuLinks = [...(megaMenu?.querySelectorAll('[data-submenu]') || [])];
  function closeMegaMenu() {
    if (!megaMenu) return;
    megaMenu.hidden = true;
    megaMenu.classList.remove('is-open', 'product-active', 'biodance-active', 'community-active', 'new-active', 'event-active', 'has-secondary-open');
    menuLinks.forEach(link => { link.classList.remove('is-active'); link.setAttribute('aria-expanded', 'false'); });
  }
  function openMegaMenu(menuName, activeLink) {
    if (!megaMenu) return;
    megaMenu.hidden = false;
    megaMenu.classList.add('is-open');
    ['product','biodance','community','new','event'].forEach(name => megaMenu.classList.toggle(name + '-active', menuName === name));
    megaMenu.classList.remove('has-secondary-open');
    megaMenu.querySelectorAll('[data-panel]').forEach(panel => { panel.hidden = !['biodance','product','community','new','event'].includes(panel.dataset.panel); });
    megaMenu.querySelectorAll('.mega-secondary').forEach(panel => panel.hidden = true);
    megaMenu.querySelectorAll('[data-submenu]').forEach(item => item.classList.remove('is-active'));
    menuLinks.forEach(link => {
      const active = link === activeLink;
      link.classList.toggle('is-active', active);
      link.setAttribute('aria-expanded', String(active));
    });
  }
  function toggleSecondaryMenu(link) {
    const target = megaMenu?.querySelector('[data-panel="' + link.dataset.submenu + '"]');
    if (!target) return;
    const shouldOpen = target.hidden;
    megaMenu.querySelectorAll('.mega-secondary').forEach(panel => panel.hidden = true);
    target.hidden = !shouldOpen;
    megaMenu.classList.toggle('has-secondary-open', shouldOpen);
    megaMenu.querySelectorAll('[data-submenu]').forEach(item => item.classList.toggle('is-active', item === link));
  }
  menuLinks.forEach(link => {
    link.addEventListener('click', event => { if (link.dataset.noNavigation === 'true') event.preventDefault(); });
    link.addEventListener('mouseenter', () => { if (window.matchMedia('(min-width: 768px)').matches) openMegaMenu(link.dataset.menu, link); });
  });
  megaMenu?.querySelectorAll('[data-no-navigation="true"]').forEach(link => link.addEventListener('click', event => event.preventDefault()));
  submenuLinks.forEach(link => {
    const arrow = link.querySelector('span');
    if (!arrow) return;
    arrow.setAttribute('role', 'button'); arrow.setAttribute('tabindex', '0');
    arrow.setAttribute('aria-label', link.textContent.trim() + ' 하위 메뉴 열기');
    arrow.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); toggleSecondaryMenu(link); });
    arrow.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggleSecondaryMenu(link); } });
  });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMegaMenu(); });
  siteHeader?.addEventListener('mouseleave', closeMegaMenu);
  menuToggle?.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
    if (!isOpen) closeMegaMenu();
  });
});
