const hamburger = document.getElementById('hamburger');
const popupMenu = document.getElementById('popupMenu');
const overlay = document.getElementById('overlay');
const closeBtn = document.getElementById('closeBtn');

hamburger.addEventListener('click', () => {
  popupMenu.classList.add('active');
  overlay.classList.add('active');
});

closeBtn.addEventListener('click', () => {
  popupMenu.classList.remove('active');
  overlay.classList.remove('active');
});

overlay.addEventListener('click', () => {
  popupMenu.classList.remove('active');
  overlay.classList.remove('active');
});