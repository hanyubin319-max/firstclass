document.addEventListener('DOMContentLoaded', () => {
  const filter = document.querySelector('#review-filter');
  const reviewList = document.querySelector('#review-list');

  // Number image and video labels on both desktop and mobile.
  const updateReviewMediaLabels = () => {
    document.querySelectorAll('.review-post-media-grid').forEach(grid => {
      let imageIndex = 0;
      let videoIndex = 0;
      grid.querySelectorAll('.review-post-media-item').forEach(item => {
        const label = item.querySelector('span');
        if (!label) return;
        if (item.classList.contains('is-video')) {
          label.textContent = `동영상${++videoIndex}`;
        } else {
          label.textContent = `이미지${++imageIndex}`;
        }
      });
    });
  };
  updateReviewMediaLabels();
  const reviewCount = document.querySelector('#review-count');
  const resetButton = document.querySelector('#review-filter-reset');
  const sortButtons = [...document.querySelectorAll('.review-sort-label[data-sort]')];
  const searchOpenButton = document.querySelector('#review-search-open');
  const searchBar = document.querySelector('#review-searchbar');
  const searchInput = document.querySelector('#review-search-input');
  const searchCloseButton = document.querySelector('#review-search-close');
  const pagination = document.querySelector('#review-pagination');
  const policyModal = document.querySelector('#review-policy-modal');
  const policyDialog = policyModal?.querySelector('.review-policy-dialog');
  const policyPanels = [...(policyModal?.querySelectorAll('[data-policy-panel]') || [])];
  const policyTextFrame = document.querySelector('#review-policy-text-frame');
  const policyScrollTrack = document.querySelector('#review-policy-scroll-track');
  const policyScrollThumb = document.querySelector('#review-policy-scroll-thumb');
  const policyScrollUp = document.querySelector('#review-policy-scroll-up');
  const policyScrollDown = document.querySelector('#review-policy-scroll-down');
  const policyCloseButton = document.querySelector('#review-policy-close');
  let policyPreviousFocus = null;
  let policyThumbDrag = null;
  let policyScrollPosition = 0;

  const pageSize = 9;
  let currentPage = 1;
  let totalPages = 1;
  let sortValue = 'latest';
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

  // Event 페이지와 동일하게 9개씩 나누고 필터/정렬 결과를 페이지에 표시
  function renderPagination(pageCount) {
    if (!pagination) return;

    pagination.replaceChildren();

    const previous = document.createElement('button');
    previous.type = 'button';
    previous.className = 'pagination-arrow';
    previous.dataset.page = 'prev';
    previous.setAttribute('aria-label', '이전 페이지');
    previous.disabled = currentPage === 1;
    pagination.appendChild(previous);

    for (let page = 1; page <= pageCount; page++) {
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
    next.disabled = currentPage === pageCount;
    pagination.appendChild(next);
    pagination.hidden = false;
  }

  function applyReviewControls() {
    if (!reviewList) return;

    const selectedRating = filter?.value || '';
    const searchQuery = searchInput?.value.trim().toLocaleLowerCase('ko-KR') || '';
    const posts = [...reviewList.querySelectorAll('.review-post')];

    posts.forEach(post => {
      if (!originalOrder.has(post)) {
        originalOrder.set(post, nextOriginalOrder++);
      }
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

    const filteredPosts = posts.filter(post => {
      const matchesRating = !selectedRating || getPostRating(post) === Number(selectedRating);
      const matchesSearch = !searchQuery || post.textContent.toLocaleLowerCase('ko-KR').includes(searchQuery);
      return matchesRating && matchesSearch;
    });

    totalPages = Math.max(1, Math.ceil(filteredPosts.length / pageSize));
    currentPage = Math.min(currentPage, totalPages);

    const startIndex = (currentPage - 1) * pageSize;
    const visiblePosts = new Set(filteredPosts.slice(startIndex, startIndex + pageSize));
    posts.forEach(post => {
      post.hidden = !visiblePosts.has(post);
    });

    renderPagination(totalPages);
  }

  pagination?.addEventListener('click', event => {
    const button = event.target.closest('button[data-page]');
    if (!button || button.disabled) return;

    if (button.dataset.page === 'prev') currentPage--;
    else if (button.dataset.page === 'next') currentPage++;
    else currentPage = Number(button.dataset.page);

    currentPage = Math.max(1, Math.min(currentPage, totalPages));
    applyReviewControls();
  });

  // Policy dialogs: each link opens its matching message in the shared modal.
  function updatePolicyScrollbar() {
    if (!policyTextFrame || !policyScrollTrack || !policyScrollThumb) return;

    const viewportHeight = policyTextFrame.clientHeight;
    const contentHeight = policyTextFrame.scrollHeight;
    const maxScroll = Math.max(0, contentHeight - viewportHeight);
    const trackHeight = policyScrollTrack.clientHeight;
    const thumbHeight = maxScroll > 0
      ? Math.max(24, trackHeight * viewportHeight / contentHeight)
      : trackHeight;
    const maxThumbTop = Math.max(0, trackHeight - thumbHeight);
    const thumbTop = maxScroll > 0 ? (policyTextFrame.scrollTop / maxScroll) * maxThumbTop : 0;

    policyScrollThumb.style.height = `${thumbHeight}px`;
    policyScrollThumb.style.transform = `translateY(${thumbTop}px)`;
    if (policyScrollUp) policyScrollUp.disabled = maxScroll <= 0 || policyTextFrame.scrollTop <= 0;
    if (policyScrollDown) policyScrollDown.disabled = maxScroll <= 0 || policyTextFrame.scrollTop >= maxScroll - 1;
  }

  function openPolicyModal(policyName, trigger) {
    if (!policyModal || !policyTextFrame) return;

    const activePanel = policyPanels.find(panel => panel.dataset.policyPanel === policyName);
    if (!activePanel) return;

    policyPreviousFocus = trigger || document.activeElement;
    policyScrollPosition = window.scrollY || window.pageYOffset || 0;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${policyScrollPosition}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    policyPanels.forEach(panel => {
      panel.hidden = panel !== activePanel;
    });

    const heading = activePanel.querySelector('h2');
    if (heading && policyDialog) {
      policyDialog.setAttribute('aria-labelledby', heading.id);
      policyDialog.classList.toggle('is-compact-policy', policyName !== 'review');
      policyDialog.classList.toggle('is-review-policy', policyName === 'review');
    }

    policyModal.hidden = false;
    document.body.classList.add('is-review-policy-open');
    policyTextFrame.scrollTop = 0;
    window.requestAnimationFrame(() => {
      updatePolicyScrollbar();
      policyTextFrame.focus({ preventScroll: true });
    });
  }

  function closePolicyModal() {
    if (!policyModal || policyModal.hidden) return;
    policyModal.hidden = true;
    document.body.classList.remove('is-review-policy-open');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    window.scrollTo(0, policyScrollPosition);
    policyThumbDrag = null;
    if (policyPreviousFocus && typeof policyPreviousFocus.focus === 'function') {
      policyPreviousFocus.focus();
    }
  }

  document.querySelectorAll('[data-policy-open]').forEach(button => {
    button.addEventListener('click', () => openPolicyModal(button.dataset.policyOpen, button));
  });

  policyCloseButton?.addEventListener('click', closePolicyModal);
  policyModal?.addEventListener('click', event => {
    if (event.target === policyModal) closePolicyModal();
  });
  document.addEventListener('keydown', event => {
    if (!policyModal || policyModal.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closePolicyModal();
    }
  });

  policyTextFrame?.addEventListener('scroll', updatePolicyScrollbar, { passive: true });
  window.addEventListener('resize', updatePolicyScrollbar);

  policyScrollUp?.addEventListener('click', () => {
    policyTextFrame?.scrollBy({ top: -100, behavior: 'smooth' });
  });
  policyScrollDown?.addEventListener('click', () => {
    policyTextFrame?.scrollBy({ top: 100, behavior: 'smooth' });
  });

  policyScrollTrack?.addEventListener('click', event => {
    if (!policyTextFrame) return;
    if (event.target === policyScrollThumb) return;
    const rect = policyScrollTrack.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    policyTextFrame.scrollTop = ratio * (policyTextFrame.scrollHeight - policyTextFrame.clientHeight);
  });

  policyScrollThumb?.addEventListener('pointerdown', event => {
    if (!policyScrollTrack || !policyTextFrame) return;
    event.preventDefault();
    const thumbRect = policyScrollThumb.getBoundingClientRect();
    policyThumbDrag = {
      pointerId: event.pointerId,
      offsetY: event.clientY - thumbRect.top
    };
    policyScrollThumb.setPointerCapture(event.pointerId);
  });
  policyScrollThumb?.addEventListener('pointermove', event => {
    if (!policyThumbDrag || event.pointerId !== policyThumbDrag.pointerId) return;
    const trackRect = policyScrollTrack.getBoundingClientRect();
    const thumbHeight = policyScrollThumb.getBoundingClientRect().height;
    const maxThumbTop = Math.max(0, trackRect.height - thumbHeight);
    const nextTop = Math.max(0, Math.min(maxThumbTop, event.clientY - trackRect.top - policyThumbDrag.offsetY));
    const ratio = maxThumbTop > 0 ? nextTop / maxThumbTop : 0;
    policyTextFrame.scrollTop = ratio * (policyTextFrame.scrollHeight - policyTextFrame.clientHeight);
  });
  const stopPolicyThumbDrag = event => {
    if (policyThumbDrag && event.pointerId === policyThumbDrag.pointerId) policyThumbDrag = null;
  };
  policyScrollThumb?.addEventListener('pointerup', stopPolicyThumbDrag);
  policyScrollThumb?.addEventListener('pointercancel', stopPolicyThumbDrag);

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
    const matched = String(dateValue).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const date = matched
      ? new Date(Number(matched[1]), Number(matched[2]) - 1, Number(matched[3]))
      : new Date(dateValue);
    if (Number.isNaN(date.getTime())) return '';

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const targetStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const days = Math.max(0, Math.floor((todayStart - targetStart) / 86400000));

    if (days === 0) return '오늘 작성';

    let months = (today.getFullYear() - date.getFullYear()) * 12;
    months += today.getMonth() - date.getMonth();
    if (today.getDate() < date.getDate()) months -= 1;

    if (months >= 12) return `${Math.floor(months / 12)}년 전 작성`;
    if (months >= 1) return `${months}개월 전 작성`;
    return `${days}일 전 작성`;
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

  // 게시물당 작성자가 선택한 세부 카테고리는 최대 5개까지만 표시
  function enforceReviewKeywordLimit(root = document) {
    root.querySelectorAll('.review-post-keywords').forEach(group => {
      const limit = Number(group.dataset.maxSelections) || 5;
      const keywords = [...group.querySelectorAll('.review-post-keyword')];
      keywords.forEach((keyword, index) => {
        keyword.hidden = index >= limit;
      });
    });
  }

  enforceReviewKeywordLimit(reviewList || document);

  function updateReviewMoreButtons(root = document) {
    root.querySelectorAll('.review-post-text-frame').forEach(frame => {
      const text = frame.querySelector('.review-post-body-text');
      const button = frame.querySelector('.review-post-more');
      if (!text || !button) return;

      // 미리보기와 전체 글이 분리된 리뷰는 더보기 버튼을 항상 표시
      if (text.querySelector('.review-post-preview') && text.querySelector('.review-post-full')) {
        button.hidden = false;
        return;
      }

      const measure = text.cloneNode(true);
      measure.style.position = 'absolute';
      measure.style.visibility = 'hidden';
      measure.style.display = 'block';
      measure.style.width = `${text.clientWidth}px`;
      measure.style.height = 'auto';
      measure.style.maxHeight = 'none';
      measure.style.overflow = 'visible';
      measure.style.webkitLineClamp = 'unset';
      measure.style.margin = '0';
      frame.appendChild(measure);
      const fullHeight = measure.getBoundingClientRect().height;
      measure.remove();

      button.hidden = fullHeight <= 44;
    });
  }

  updateReviewMoreButtons(reviewList || document);
  window.addEventListener('resize', () => updateReviewMoreButtons(reviewList || document));

  reviewList?.querySelectorAll('.review-post-action.is-reply').forEach(replyToggle => {
    const post = replyToggle.closest('.review-post');
    const replyFrame = post?.querySelector('.review-post-reply-frame');
    const replyWriterFrame = post?.querySelector('.review-post-writer-frame');
    const postInnerFrame = post?.querySelector('.review-post-inner');

    replyToggle.addEventListener('click', () => {
      const expanded = replyToggle.getAttribute('aria-expanded') !== 'true';
      replyToggle.setAttribute('aria-expanded', String(expanded));
      if (replyFrame) replyFrame.hidden = !expanded;
      if (replyWriterFrame) replyWriterFrame.hidden = !expanded;
      postInnerFrame?.classList.toggle('is-reply-open', expanded);
    });
  });

  // Review media gallery: supports both real media files and layout placeholder tiles.
  let mediaLightbox = null;
  let mediaLightboxScrollY = 0;

  function closeMediaLightbox() {
    if (!mediaLightbox) return;
    mediaLightbox.remove();
    mediaLightbox = null;
    document.body.classList.remove('is-review-media-open');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    window.scrollTo(0, mediaLightboxScrollY);
  }

  function getReviewMedia(item) {
    return item?.querySelector('video, iframe, img:not(.review-post-media-play)') || null;
  }

  function isReviewVideo(item, source = getReviewMedia(item)) {
    return source?.tagName === 'VIDEO' || source?.tagName === 'IFRAME'
      || Boolean(item?.querySelector('.review-post-media-play'))
      || /동영상|video/i.test(item?.textContent || '');
  }

  function addVideoPlayIndicator(target) {
    const play = document.createElement('img');
    play.className = 'review-media-lightbox-video-play';
    play.src = '../img/play%20button.svg';
    play.alt = '';
    play.setAttribute('aria-hidden', 'true');
    target.appendChild(play);
  }

  function renderLightboxMedia(stage, item) {
    stage.replaceChildren();
    const source = getReviewMedia(item);
    if (source) {
      const enlarged = source.cloneNode(true);
      enlarged.removeAttribute('width');
      enlarged.removeAttribute('height');
      enlarged.removeAttribute('class');
      if (enlarged.tagName === 'VIDEO') {
        enlarged.controls = true;
        enlarged.autoplay = true;
        enlarged.playsInline = true;
      }
      stage.appendChild(enlarged);
      return;
    }

    // The current review demo contains placeholder tiles without image/video URLs.
    // Keep the clicked tile visible rather than silently refusing to open the viewer.
    const placeholder = item.cloneNode(true);
    placeholder.classList.add('review-media-lightbox-placeholder');
    placeholder.querySelector('.review-post-media-play')?.remove();
    stage.appendChild(placeholder);
  }

  reviewList?.addEventListener('click', event => {
    const mediaItem = event.target.closest('.review-post-media-item');
    if (!mediaItem || !reviewList.contains(mediaItem)) return;
    event.preventDefault();

    const mediaGrid = mediaItem.closest('.review-post-media-grid');
    const mediaItems = [...(mediaGrid?.querySelectorAll('.review-post-media-item') || [])];
    if (!mediaItems.length) return;

    closeMediaLightbox();
    mediaLightboxScrollY = window.scrollY || window.pageYOffset || 0;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${mediaLightboxScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    mediaLightbox = document.createElement('div');
    mediaLightbox.className = 'review-media-lightbox';
    mediaLightbox.setAttribute('role', 'dialog');
    mediaLightbox.setAttribute('aria-modal', 'true');
    mediaLightbox.setAttribute('aria-label', '리뷰 사진 및 동영상 자세히 보기');

    // iOS Safari can still scroll the page behind a fixed modal; cancel touch
    // movement on the full-screen overlay while the viewer is open.
    mediaLightbox.addEventListener('touchmove', touchEvent => {
      touchEvent.preventDefault();
    }, { passive: false });

    const gallery = document.createElement('div');
    gallery.className = 'review-media-lightbox-gallery';
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'review-media-lightbox-close';
    closeButton.setAttribute('aria-label', '닫기');
    const closeIcon = document.createElement('img');
    closeIcon.src = '../img/x.svg';
    closeIcon.alt = '';
    closeIcon.setAttribute('aria-hidden', 'true');
    closeButton.appendChild(closeIcon);

    const stage = document.createElement('div');
    stage.className = 'review-media-lightbox-stage';
    const thumbnails = document.createElement('div');
    thumbnails.className = 'review-media-lightbox-thumbnails';
    thumbnails.setAttribute('aria-label', '미디어 썸네일');

    let thumbnailStart = 0;
    let selectedIndex = Math.max(0, mediaItems.indexOf(mediaItem));

    const mobileGallery = window.matchMedia('(max-width: 700px)');

    function renderThumbnails() {
      thumbnails.replaceChildren();
      // Desktop shows every thumbnail; only mobile uses a three-item window.
      const visibleItems = mobileGallery.matches
        ? mediaItems.slice(thumbnailStart, thumbnailStart + 3)
        : mediaItems;

      visibleItems.forEach((item, visibleIndex) => {
        const index = mobileGallery.matches ? thumbnailStart + visibleIndex : visibleIndex;
        const source = getReviewMedia(item);
        const thumbnail = document.createElement('button');
        thumbnail.type = 'button';
        thumbnail.className = 'review-media-lightbox-thumbnail';
        thumbnail.setAttribute('aria-label', `미디어 ${index + 1} 보기`);
        thumbnail.setAttribute('aria-pressed', String(index === selectedIndex));

        if (source) {
          const preview = source.cloneNode(true);
          preview.removeAttribute('class');
          preview.removeAttribute('width');
          preview.removeAttribute('height');
          preview.removeAttribute('controls');
          preview.removeAttribute('autoplay');
          preview.muted = true;
          preview.setAttribute('aria-hidden', 'true');
          thumbnail.appendChild(preview);
        } else {
          const preview = item.cloneNode(true);
          preview.classList.add('review-media-lightbox-thumbnail-placeholder');
          preview.querySelector('.review-post-media-play')?.remove();
          thumbnail.appendChild(preview);
        }
        if (isReviewVideo(item, source)) addVideoPlayIndicator(thumbnail);

        if (index === selectedIndex) {
          thumbnail.classList.add('is-selected');
        }

        thumbnail.addEventListener('click', () => {
          selectedIndex = index;
          renderLightboxMedia(stage, item);

          // Advance the three-thumbnail window on mobile only.
          if (mobileGallery.matches) {
            if (index === thumbnailStart + 2 && thumbnailStart + 3 < mediaItems.length) {
              thumbnailStart = Math.min(index, mediaItems.length - 3);
            } else if (index === thumbnailStart && thumbnailStart > 0) {
              thumbnailStart = Math.max(0, index - 2);
            }
          }
          renderThumbnails();
        });
        thumbnails.appendChild(thumbnail);
      });
    }

    renderThumbnails();
    mobileGallery.addEventListener('change', () => {
      thumbnailStart = 0;
      renderThumbnails();
    });
    renderLightboxMedia(stage, mediaItems[selectedIndex]);

    stage.appendChild(closeButton);
    gallery.append(stage, thumbnails);
    mediaLightbox.appendChild(gallery);
    document.body.appendChild(mediaLightbox);
    document.body.classList.add('is-review-media-open');
    closeButton.addEventListener('click', closeMediaLightbox);
    mediaLightbox.addEventListener('click', lightboxEvent => {
      if (lightboxEvent.target === mediaLightbox) closeMediaLightbox();
    });
    closeButton.focus();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mediaLightbox) closeMediaLightbox();
  });

  reviewList?.addEventListener('click', event => {
    const button = event.target.closest('.review-post-more');
    if (!button) return;

    const post = button.closest('.review-post');
    const frame = post?.querySelector('.review-post-text-frame');
    if (!frame) return;

    const expanded = frame.classList.toggle('is-expanded');
    const preview = frame.querySelector('.review-post-preview');
    const full = frame.querySelector('.review-post-full');
    if (preview && full) {
      preview.hidden = expanded;
      full.hidden = !expanded;
    }
    const label = button.querySelector('span');
    if (label) label.textContent = expanded ? '접기' : '더보기';
    button.setAttribute('aria-expanded', String(expanded));
  });

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

      trigger.textContent = `${rating}점`;
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
      currentPage = 1;
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

  // Mobile keeps the search pill open; returning to desktop restores the closed search state.
  function syncMobileReviewSearch() {
    if (!searchBar || !searchOpenButton) return;

    const isMobile = window.matchMedia('(max-width: 700px)').matches;
    if (isMobile) {
      searchBar.hidden = false;
      searchOpenButton.hidden = true;
      return;
    }

    searchInput.value = '';
    searchBar.hidden = true;
    searchOpenButton.hidden = false;
  }

  syncMobileReviewSearch();
  window.addEventListener('resize', syncMobileReviewSearch);

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
    currentPage = 1;
    applyReviewControls();
    searchOpenButton.focus();
  }

  searchOpenButton?.addEventListener('click', openReviewSearch);
  searchCloseButton?.addEventListener('click', closeReviewSearch);
  searchInput?.addEventListener('input', () => {
    if (searchInput.value.trim()) markInteracted();
    currentPage = 1;
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
      currentPage = 1;
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

    sortValue = 'latest';
    currentPage = 1;
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
    reviewCount.textContent = String(reviewList.querySelectorAll('.review-post').length);
  }

  updateSortButtons();
  updateResetButton();
  applyReviewControls();
  updateReviewCount();

  if (reviewList && reviewCount) {
    const observer = new MutationObserver(() => {
      updateReviewCount();
      applyReviewControls();
      enforceReviewKeywordLimit(reviewList);
    });
    observer.observe(reviewList, { childList: true, subtree: true });
  }
});
