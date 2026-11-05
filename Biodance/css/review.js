document.addEventListener('DOMContentLoaded', () => {
  const filter = document.querySelector('#review-filter');
  const reviewList = document.querySelector('#review-list');
  const reviewCount = document.querySelector('#review-count');

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

    const options = [...select.options].map(option => {
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
