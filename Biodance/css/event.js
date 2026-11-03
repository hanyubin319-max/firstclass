document.addEventListener('DOMContentLoaded', () => {
  const filter = document.querySelector('#event-filter');
  const count = document.querySelector('#event-count');
  const list = document.querySelector('#event-list');
  const empty = document.querySelector('#event-empty');
  if (!filter || !count || !list || !empty) return;

  // 이벤트 데이터를 추가할 때 status를 ongoing 또는 ended로 지정합니다.
  const events = [];
  function renderEvents() {
    const visible = events.filter(event => filter.value === 'all' || event.status === filter.value);
    count.textContent = String(visible.length);
    list.replaceChildren();
    visible.forEach(event => {
      const item = document.createElement('article');
      item.className = 'event-card';
      item.textContent = event.title;
      list.appendChild(item);
    });
    empty.hidden = visible.length > 0;
    empty.textContent = filter.value === 'ended' ? '종료된 이벤트가 없습니다.' : '진행 중인 이벤트가 없습니다.';
  }
  filter.addEventListener('change', renderEvents);
  renderEvents();
});