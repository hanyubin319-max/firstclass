document.addEventListener("DOMContentLoaded", () => {
  const ratingBlocks = document.querySelectorAll(".new-product-rating[data-review-count]");

  ratingBlocks.forEach((rating) => {
    const reviewCount = rating.dataset.reviewCount;
    const countText = rating.querySelector(".new-rating-count");

    if (!countText || !reviewCount) return;

    countText.textContent = `(${Number(reviewCount.replace(/,/g, "")).toLocaleString("ko-KR")})`;
    rating.setAttribute("aria-label", `별점 5.0, 리뷰 ${Number(reviewCount.replace(/,/g, "")).toLocaleString("ko-KR")}개`);
  });
});
