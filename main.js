const hamburger = document.getElementById('hamburger');
const popupMenu = document.getElementById('popup-menu');
const closeBtn = document.getElementById('close-btn');
const overlay = document.getElementById('overlay');

hamburger.addEventListener('click', () => {
  // 1️⃣ Fade the page first
  overlay.classList.add('active');

  // 2️⃣ Show the menu after a short delay
  setTimeout(() => {
    popupMenu.classList.add('active');
  }, 90); // 200ms delay
});

closeBtn.addEventListener('click', closeMenu);
overlay.addEventListener('click', closeMenu);

function closeMenu() {
  // Hide menu first
  popupMenu.classList.remove('active');

  // Then fade the page back in
  setTimeout(() => {
    overlay.classList.remove('active');
  }, 200); // match the delay
}
