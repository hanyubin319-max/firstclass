document.addEventListener('DOMContentLoaded', async () => {
  const mount = document.querySelector('[data-shared-header]');
  if (!mount) return;
  try {
    const response = await fetch('header.html');
    if (!response.ok) throw new Error('공통 메뉴바를 불러오지 못했습니다.');
    mount.outerHTML = await response.text();
  } catch (error) { console.error(error); return; }

  const siteHeader = document.querySelector('.site-header');

  // A fixed header leaves normal document flow, so reserve its exact height.
  if (siteHeader && !siteHeader.previousElementSibling?.classList.contains('site-header-spacer')) {
    const spacer = document.createElement('div');
    spacer.className = 'site-header-spacer';
    spacer.setAttribute('aria-hidden', 'true');
    spacer.style.width = '100%';
    spacer.style.height = siteHeader.getBoundingClientRect().height + 'px';
    siteHeader.parentNode.insertBefore(spacer, siteHeader);

    const syncHeaderSpacer = () => {
      spacer.style.height = siteHeader.getBoundingClientRect().height + 'px';
    };
    syncHeaderSpacer();
    if ('ResizeObserver' in window) {
      new ResizeObserver(syncHeaderSpacer).observe(siteHeader);
    } else {
      window.addEventListener('resize', syncHeaderSpacer);
    }
  }
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
  // Mobile Plus buttons expand the matching submenu directly below each top-level item.
  function buildMobileSubmenu(menuName) {
    const panel = document.createElement('div');
    panel.className = 'mobile-submenu-panel';
    panel.dataset.mobilePanel = menuName;

    const sourcePanel = megaMenu?.querySelector('[data-panel="' + menuName + '"]');
    if (menuName === 'product') {
      // Keep the existing Product lower menu only; omit its three extra secondary submenu panels.
      const primary = megaMenu?.querySelector('.mega-primary');
      if (primary) panel.append(primary.cloneNode(true));
    } else if (sourcePanel) {
      panel.append(sourcePanel.cloneNode(true));
    }
    return panel;
  }

  menuLinks.forEach(link => {
    const plus = link.querySelector('.main-nav-plus');
    if (!plus) return;
    plus.setAttribute('role', 'button');
    plus.setAttribute('tabindex', '0');
    plus.setAttribute('aria-label', link.textContent.trim() + ' 하위 메뉴 열기');
    const toggleMobileSubmenu = event => {
      if (!window.matchMedia('(max-width: 700px)').matches) return;
      event.preventDefault();
      event.stopPropagation();
      const existing = link.nextElementSibling?.classList.contains('mobile-submenu-panel')
        ? link.nextElementSibling : null;
      const isOpening = !existing || existing.hidden;
      mainNav.querySelectorAll('.mobile-submenu-panel').forEach(panel => panel.remove());
      menuLinks.forEach(item => {
        item.setAttribute('aria-expanded', 'false');
        item.classList.remove('is-active');
        const icon = item.querySelector('.main-nav-plus');
        if (icon) icon.setAttribute('aria-label', item.textContent.trim() + ' 하위 메뉴 열기');
      });
      if (isOpening) {
        const panel = buildMobileSubmenu(link.dataset.menu);
        link.insertAdjacentElement('afterend', panel);
        link.setAttribute('aria-expanded', 'true');
        link.classList.add('is-active');
        plus.setAttribute('aria-label', link.textContent.trim() + ' 하위 메뉴 닫기');
      }
    };
    plus.addEventListener('click', toggleMobileSubmenu);
    plus.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') toggleMobileSubmenu(event);
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
  function closeMobileMenu() {
    if (!mainNav || !menuToggle) return;
    mainNav.classList.remove('is-open');
    mainNav.querySelectorAll('.mobile-submenu-panel').forEach(panel => panel.remove());
    menuLinks.forEach(link => { link.setAttribute('aria-expanded', 'false'); link.classList.remove('is-active'); });
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', '메뉴 열기');
    closeMegaMenu();
  }

  // Clear mobile-only injected panels when returning to tablet/desktop width.
  const resetMobileSubmenusOnDesktop = () => {
    if (!window.matchMedia('(min-width: 701px)').matches || !mainNav) return;
    mainNav.querySelectorAll('.mobile-submenu-panel').forEach(panel => panel.remove());
    menuLinks.forEach(link => {
      link.setAttribute('aria-expanded', 'false');
      const plus = link.querySelector('.main-nav-plus');
      if (plus) plus.setAttribute('aria-label', link.textContent.trim() + ' 하위 메뉴 열기');
    });
    closeMegaMenu();
  };
  window.addEventListener('resize', resetMobileSubmenusOnDesktop);
  resetMobileSubmenusOnDesktop();

  // On mobile, tapping anywhere outside the navigation and menu button closes it.
  document.addEventListener('click', event => {
    const clickedInsideNav = event.target.closest('#main-nav');
    const clickedMenuButton = event.target.closest('.menu-toggle');
    if (window.matchMedia('(max-width: 767px)').matches && !clickedInsideNav && !clickedMenuButton) {
      closeMobileMenu();
    }
    if (!event.target.closest('.site-header')) closeMegaMenu();
  });
  siteHeader?.addEventListener('mouseleave', () => {
    if (window.matchMedia('(min-width: 768px)').matches) closeMegaMenu();
  });
  menuToggle?.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
    if (!isOpen) {
      mainNav.querySelectorAll('.mobile-submenu-panel').forEach(panel => panel.remove());
      menuLinks.forEach(link => { link.setAttribute('aria-expanded', 'false'); link.classList.remove('is-active'); });
      closeMegaMenu();
    }
  });
});
