document.addEventListener('DOMContentLoaded', () => {
  const filter = document.querySelector('#review-filter');
  const reviewList = document.querySelector('#review-list');
  const reviewCount = document.querySelector('#review-count');
  const resetButton = document.querySelector('#review-filter-reset');
  const sortButtons = [...document.querySelectorAll('.review-sort-label[data-sort]')];
  const searchOpenButton = document.querySelector('#review-search-open');
  const searchBar = document.querySelector('#review-searchbar');
  const searchInput = document.querySelector('#review-search-input');
  const searchCloseButton = document.querySelector('#review-search-close');

  let sortValue = 'recommended';
  let hasInteracted = false;
  let isResetting = false;
  let nextOriginalOrder = 0;
  const originalOrder = new WeakMap();

  function updateResetButton() {
    if (resetButton) resetButton.hidden = !hasInteracted;
  }

  function markInteracted() {
    if (isResetting) return;
    hasInteracted = true;
    updateResetButton();
  }

  function createStar(filled, className = 'review-rating-star') {
    const star = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    star.setAttribute('viewBox', '0 0 24 24');
    star.setAttribute('aria-hidden', 'true');
    star.classList.add(className, filled ? 'is-filled' : 'is-empty');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9L12 2.5z');
    path.setAttribute('fill', 'currentColor');
    star.appendChild(path);
    return star;
  }

  function getPostRating(post) {
    const dataRating = Number(post.dataset.rating);
    if (Number.isFinite(dataRating) && dataRating > 0) return dataRating;

    const ratingText = post.querySelector('[data-rating], .review-rating, .review-post-rating')?.textContent || '';
    const matchedRating = ratingText.match(/[1-5](?:\.\d+)?/);
    return matchedRating ? Number(matchedRating[0]) : 0;
  }

  function getPostDate(post) {
    const dateValue = post.dataset.date || post.dataset.createdAt || '';
    const timestamp = Date.parse(dateValue);
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }

  function getPostRecommendation(post) {
    const value = post.dataset.recommendation || post.dataset.recommend || post.dataset.helpfulCount || '0';
    const score = Number(value);
    return Number.isFinite(score) ? score : 0;
  }

  function applyReviewControls() {
    if (!reviewList) return;

    const selectedRating = filter?.value || '';
    const searchQuery = searchInput?.value.trim().toLocaleLowerCase('ko-KR') || '';
    const posts = [...reviewList.querySelectorAll('.review-post:not(.review-post-demo)')];

    posts.forEach(post => {
      if (!originalOrder.has(post)) {
        originalOrder.set(post, nextOriginalOrder++);
      }

      const matchesRating = !selectedRating || getPostRating(post) === Number(selectedRating);
      const matchesSearch = !searchQuery || post.textContent.toLocaleLowerCase('ko-KR').includes(searchQuery);
      post.hidden = !(matchesRating && matchesSearch);
    });

    posts.sort((a, b) => {
      let difference = 0;
      if (sortValue === 'latest') {
        difference = getPostDate(b) - getPostDate(a);
      } else if (sortValue === 'rating') {
        difference = getPostRating(b) - getPostRating(a);
      } else {
        difference = getPostRecommendation(b) - getPostRecommendation(a);
      }
      return difference || originalOrder.get(a) - originalOrder.get(b);
    });

    const currentOrder = [...reviewList.querySelectorAll('.review-post')];
    const orderChanged = posts.some((post, index) => post !== currentOrder[index]);
    if (orderChanged) {
      posts.forEach(post => reviewList.appendChild(post));
    }
  }

  function updateSortButtons() {
    sortButtons.forEach(button => {
      const active = button.dataset.sort === sortValue;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function maskReviewAuthor(name) {
    const value = String(name || '').trim();
    if (!value) return '익명';
    if (value.includes('*')) return value;
    const characters = Array.from(value);
    return characters.length > 1 ? characters[0] + '*'.repeat(characters.length - 1) : '*';
  }

  function formatReviewDate(dateValue) {
    if (!dateValue) return '';
    const matched = String(dateValue).match(/^(\\d{4})-(\\d{2})-(\\d{2})$/);
    const date = matched
      ? new Date(Number(matched[1]), Number(matched[2]) - 1, Number(matched[3]))
      : new Date(dateValue);
    if (Number.isNaN(date.getTime())) return '';

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const targetStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const days = Math.max(0, Math.floor((todayStart - targetStart) / 86400000));

    if (days === 0) return '오늘 작성';
    if (days < 30) return `${days}일 전 작성`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months}개월 전 작성`;

    return `${Math.floor(months / 12)}년 전 작성`;
  }

  function renderReviewPostMetadata(post) {
    const author = post.dataset.author;
    const authorElement = post.querySelector('.review-post-author');
    if (authorElement && author) authorElement.textContent = maskReviewAuthor(author);

    const dateElement = post.querySelector('[data-review-date]');
    if (dateElement) {
      const relativeDate = formatReviewDate(dateElement.getAttribute('datetime') || post.dataset.date);
      if (relativeDate) dateElement.textContent = relativeDate;
    }

    const rating = Math.max(0, Math.min(5, Number(post.dataset.rating) || 0));
    const starContainer = post.querySelector('[data-review-stars]');
    if (starContainer) {
      starContainer.replaceChildren();
      starContainer.setAttribute('aria-label', `별점 ${rating}점`);
      for (let index = 1; index <= 5; index++) {
        starContainer.appendChild(createStar(index <= rating, 'review-post-star'));
      }
    }
  }

  document.querySelectorAll('.review-post').forEach(renderReviewPostMetadata);

  // Event 페이지와 같은 키보드 조작을 지원하는 별점 커스텀 드롭다운
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
        item.appendChild(createStar(starIndex <= rating));
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
      options.forEach(item => {
        item.setAttribute('aria-selected', String(item.dataset.value === select.value));
      });

      const rating = Number(select.value);
      trigger.replaceChildren();

      if (!select.value || !Number.isFinite(rating)) {
        trigger.textContent = '별점';
        trigger.setAttribute('aria-label', '별점 필터');
        return;
      }

      const stars = document.createElement('span');
      stars.className = 'review-trigger-stars';
      for (let starIndex = 1; starIndex <= 5; starIndex++) {
        stars.appendChild(createStar(starIndex <= rating, 'review-trigger-star'));
      }

      const ratingLabel = document.createElement('span');
      ratingLabel.className = 'review-trigger-rating';
      ratingLabel.textContent = `${rating}점`;
      trigger.append(stars, ratingLabel);
      trigger.setAttribute('aria-label', `별점 ${rating}점 필터`);
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

    select.addEventListener('change', () => {
      syncOptions();
      if (select.value) markInteracted();
      applyReviewControls();
    });

    select.classList.add('custom-select-native');
    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(trigger);
    wrapper.appendChild(menu);
    wrapper.appendChild(select);
    syncOptions();

    document.addEventListener('click', event => {
      if (!wrapper.contains(event.target)) closeMenu();
    });

    return { syncOptions };
  }

  const customSelect = enhanceSelect(filter);

  function openReviewSearch() {
    if (!searchBar || !searchOpenButton || !searchInput) return;
    searchBar.hidden = false;
    searchOpenButton.hidden = true;
    markInteracted();
    searchInput.focus();
  }

  function closeReviewSearch() {
    if (!searchBar || !searchOpenButton || !searchInput) return;
    searchInput.value = '';
    searchBar.hidden = true;
    searchOpenButton.hidden = false;
    applyReviewControls();
    searchOpenButton.focus();
  }

  searchOpenButton?.addEventListener('click', openReviewSearch);
  searchCloseButton?.addEventListener('click', closeReviewSearch);
  searchInput?.addEventListener('input', () => {
    if (searchInput.value.trim()) markInteracted();
    applyReviewControls();
  });
  searchInput?.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeReviewSearch();
  });

  sortButtons.forEach(button => {
    button.addEventListener('click', () => {
      sortValue = button.dataset.sort || 'recommended';
      updateSortButtons();
      markInteracted();
      applyReviewControls();
    });
  });

  resetButton?.addEventListener('click', () => {
    isResetting = true;
    if (filter) {
      filter.value = '';
      filter.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (searchInput) searchInput.value = '';
    if (searchBar) searchBar.hidden = true;
    if (searchOpenButton) searchOpenButton.hidden = false;

    sortValue = 'recommended';
    hasInteracted = false;
    updateSortButtons();
    customSelect?.syncOptions();
    applyReviewControls();
    updateResetButton();
    isResetting = false;
  });

  // 리뷰 게시물(.review-post)의 개수를 자동으로 표시
  function updateReviewCount() {
    if (!reviewList || !reviewCount) return;
    reviewCount.textContent = String(reviewList.querySelectorAll('.review-post:not(.review-post-demo)').length);
  }

  updateSortButtons();
  updateResetButton();
  applyReviewControls();
  updateReviewCount();

  if (reviewList && reviewCount) {
    const observer = new MutationObserver(() => {
      updateReviewCount();
      applyReviewControls();
    });
    observer.observe(reviewList, { childList: true, subtree: true });
  }
});
