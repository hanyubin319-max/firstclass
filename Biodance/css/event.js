document.addEventListener('DOMContentLoaded', () => {
  const filter = document.querySelector('#event-filter');
  const count = document.querySelector('#event-count');
  const list = document.querySelector('#event-list');
  const empty = document.querySelector('#event-empty');
  if (!filter || !count || !list || !empty) return;

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

  // 이벤트 데이터를 추가할 때 status를 ongoing 또는 ended로 지정합니다.
  const events = [];
  function renderEvents() {
    const visible = events.filter(event => filter.value === 'all' || event.status === filter.value);
    count.textContent = String(visible.length);
    list.replaceChildren();
    const placeholderTitles = [
      '바이오던스 혜택',
      '신상품 무료 체험단',
      '선물 주기 이벤트',
      '공식몰 단독 특별 혜택',
      '바이오던스 리뷰 이벤트',
      '봄맞이 스페셜 이벤트',
      '신제품 출시 기념',
      '회원 전용 할인 혜택',
      '바이오던스와 함께하는 이벤트'
    ];
    const cards = visible.length ? visible : (filter.value === 'all' ? placeholderTitles.map(title => ({ title })) : []);
    cards.forEach(event => {
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
    empty.hidden = visible.length > 0;
    empty.textContent = filter.value === 'ended' ? '종료된 이벤트가 없습니다.' : '진행 중인 이벤트가 없습니다.';
  }
  filter.addEventListener('change', renderEvents);
  renderEvents();
});