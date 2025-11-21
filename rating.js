// rating.js
// Simple rating widget: renders stars based on data-rating and supports optional interactive mode.

(function () {
  // render static stars into container
  function renderStatic(container, rating) {
    container.innerHTML = '';
    const r = Math.max(0, Math.min(5, Math.floor(Number(rating) || 0)));
    for (let i = 1; i <= 5; i++) {
      const span = document.createElement('span');
      span.className = 'star-icon' + (i <= r ? ' filled' : '');
      span.textContent = '★';
      span.setAttribute('data-value', i);
      container.appendChild(span);
    }
  }

  // make a container interactive (clickable to set rating)
  function makeInteractive(container, initial) {
    let value = Math.max(0, Math.min(5, Math.floor(Number(initial) || 0)));
    renderStatic(container, value);

    const stars = Array.from(container.querySelectorAll('.star-icon'));
    function update(v) {
      value = v;
      stars.forEach(s => {
        const sv = Number(s.getAttribute('data-value'));
        s.classList.toggle('filled', sv <= value);
      });
      container.setAttribute('data-rating', value);
      // dispatch event so app can listen: container.addEventListener('rating-change', ...)
      container.dispatchEvent(new CustomEvent('rating-change', { detail: { rating: value } }));
    }

    stars.forEach(s => {
      const v = Number(s.getAttribute('data-value'));
      s.style.cursor = 'pointer';
      s.addEventListener('click', () => update(v));
      s.addEventListener('mouseenter', () => {
        stars.forEach(st => st.classList.toggle('hover', Number(st.getAttribute('data-value')) <= v));
      });
    });

    container.addEventListener('mouseleave', () => {
      stars.forEach(st => st.classList.remove('hover'));
    });

    // expose helper
    container.getRatingValue = () => value;
    container.setRatingValue = (v) => update(Math.max(0, Math.min(5, Math.floor(Number(v) || 0))));
  }

  // Init on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.rating-stars').forEach(el => {
      const r = Math.max(0, Math.min(5, parseInt(el.dataset.rating, 10) || 0));
      renderStatic(el, r);
      // If you want interactivity on some elements, set data-interactive="true" in HTML
      if (el.dataset.interactive === 'true') {
        makeInteractive(el, r);
      }
    });
  });

  // Public API
  window.Rating = {
    render: renderStatic,
    makeInteractive: makeInteractive
  };
})();
