document.addEventListener('DOMContentLoaded', () => {
  const filter = document.querySelector('#review-filter');
  const reviewList = document.querySelector('#review-list');
  const reviewCount = document.querySelector('#review-count');
  const searchOpenButton = document.querySelector('#review-search-open');
  const searchBar = document.querySelector('#review-searchbar');
  const searchInput = document.querySelector('#review-search-input');
  const searchCloseButton = document.querySelector('#review-search-close');

  function openReviewSearch() {
    if (!searchBar || !searchOpenButton || !searchInput) return;
    searchBar.hidden = false;
    searchOpenButton.hidden = true;
    searchInput.focus();
  }

  function closeReviewSearch() {
    if (!searchBar || !searchOpenButton || !searchInput) return;
    searchInput.value = '';
    searchBar.hidden = true;
    searchOpenButton.hidden = false;
    searchOpenButton.focus();
  }

  searchOpenButton?.addEventListener('click', openReviewSearch);
  searchCloseButton?.addEventListener('click', closeReviewSearch);
  searchInput?.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeReviewSearch();
  });


  // Event 페이지의 커스텀 드롭다운 동작을 Review 전용으로 복제
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

    const ratingOptions = [...select.options].filter(option => option.value !== '');
    const options = ratingOptions.map(option => {
      const rating = Number(option.value);
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'custom-select-option';
      item.dataset.value = option.value;
      item.setAttribute('role', 'option');
      item.setAttribute('aria-label', `별점 ${rating}점`);
      item.setAttribute('aria-selected', 'false');
      item.tabIndex = -1;

      for (let starIndex = 1; starIndex <= 5; starIndex++) {
        const star = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        star.setAttribute('viewBox', '0 0 24 24');
        star.setAttribute('aria-hidden', 'true');
        star.classList.add('review-rating-star', starIndex <= rating ? 'is-filled' : 'is-empty');

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9L12 2.5z');
        path.setAttribute('fill', 'currentColor');
        star.appendChild(path);
        item.appendChild(star);
      }

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
      trigger.textContent = '별점';
      options.forEach(item => {
        item.setAttribute('aria-selected', String(item.dataset.value === select.value));
      });
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

    trigger.addEventListener('click', () => {
      wrapper.classList.contains('is-open') ? closeMenu() : openMenu();
    });

    options.forEach((item, index) => {
      item.addEventListener('keydown', event => {
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
      });
    });

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

  enhanceSelect(filter);

  // 리뷰 게시물(.review-post)의 개수를 자동으로 표시
  function updateReviewCount() {
    if (!reviewList || !reviewCount) return;
    reviewCount.textContent = String(reviewList.querySelectorAll('.review-post').length);
  }

  updateReviewCount();

  if (reviewList && reviewCount) {
    const observer = new MutationObserver(updateReviewCount);
    observer.observe(reviewList, { childList: true, subtree: true });
  }
});
