document.addEventListener('DOMContentLoaded', () => {
  const filter = document.querySelector('#event-filter');
  const count = document.querySelector('#event-count');
  const list = document.querySelector('#event-list');
  if (!filter || !count || !list) return;

  // 상품 서브페이지와 동일한 커스텀 드롭다운 UI
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
  enhanceSelect(filter);

  // 임시 이벤트 9개를 진행중/종료로 임의 분류
  const events = [
    { title: '바이오던스 공식몰 단독 혜택', status: 'ongoing' },
    { title: '신제품 출시 기념 이벤트', status: 'ongoing' },
    { title: '리뷰 작성 감사 이벤트', status: 'ongoing' },
    { title: '첫 구매 고객 특별 혜택', status: 'ongoing' },
    { title: '바이오던스 베스트 상품 이벤트', status: 'ongoing' },
    { title: '멤버십 회원 전용 이벤트', status: 'ongoing' },
    { title: '수분 케어 특별 프로모션', status: 'ongoing' },
    { title: '공식몰 신규 가입 이벤트', status: 'ended' },
    { title: '바이오던스 스페셜 기프트', status: 'ended' },
    { title: '시즌 한정 특별 이벤트', status: 'ended' },
    { title: '친구 추천 감사 이벤트', status: 'ended' },
    { title: '베스트 리뷰어 선정 이벤트', status: 'ended' },
    { title: '봄맞이 스킨케어 프로모션', status: 'ended' },
    { title: '브랜드 론칭 기념 이벤트', status: 'ended' },
    { title: '멤버십 웰컴 혜택', status: 'ended' },
    { title: '구매 고객 사은품 이벤트', status: 'ended' },
    { title: '바이오던스 럭키 드로우', status: 'ended' }
  ];
  const pagination = document.querySelector('#event-pagination');
  const pageSize = 9;
  let currentPage = 1;

  function renderPagination(totalPages) {
    pagination.replaceChildren();
    const previous = document.createElement('button');
    previous.type = 'button';
    previous.className = 'pagination-arrow';
    previous.dataset.page = 'prev';
    previous.setAttribute('aria-label', '이전 페이지');
    previous.disabled = currentPage === 1;
    pagination.appendChild(previous);

    for (let page = 1; page <= totalPages; page++) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'pagination-number' + (page === currentPage ? ' is-active' : '');
      button.dataset.page = String(page);
      button.textContent = String(page);
      if (page === currentPage) button.setAttribute('aria-current', 'page');
      pagination.appendChild(button);
    }

    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'pagination-arrow';
    next.dataset.page = 'next';
    next.setAttribute('aria-label', '다음 페이지');
    next.disabled = currentPage === totalPages;
    pagination.appendChild(next);
    pagination.hidden = false;
  }

  function renderEvents() {
    const filtered = events.filter(event => filter.value === 'all' || event.status === filter.value);
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    currentPage = Math.min(currentPage, totalPages);
    const start = (currentPage - 1) * pageSize;
    const visible = filtered.slice(start, start + pageSize);
    count.textContent = String(filtered.length);
    list.replaceChildren();

    visible.forEach(event => {
      const item = document.createElement('article');
      item.className = 'event-card';
      const imageArea = document.createElement('div');
      imageArea.className = 'event-card-image';
      imageArea.setAttribute('aria-label', '이벤트 이미지 삽입 영역');
      const imageLabel = document.createElement('span');
      imageLabel.textContent = 'IMAGE';
      const imageHelp = document.createElement('small');
      imageHelp.textContent = '이미지 삽입 영역';
      imageArea.append(imageLabel, imageHelp);
      const title = document.createElement('p');
      title.className = 'event-card-title';
      title.textContent = event.title;
      item.append(imageArea, title);
      list.appendChild(item);
    });
    renderPagination(totalPages);
  }

  filter.addEventListener('change', () => {
    currentPage = 1;
    renderEvents();
  });
  pagination.addEventListener('click', event => {
    const button = event.target.closest('button[data-page]');
    if (!button || button.disabled) return;
    const totalPages = Math.max(1, Math.ceil(events.filter(item => filter.value === 'all' || item.status === filter.value).length / pageSize));
    if (button.dataset.page === 'prev') currentPage--;
    else if (button.dataset.page === 'next') currentPage++;
    else currentPage = Number(button.dataset.page);
    currentPage = Math.max(1, Math.min(currentPage, totalPages));
    renderEvents();
  });
  renderEvents();
});
