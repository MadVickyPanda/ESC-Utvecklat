const hamburger = document.getElementById('hamburger');
const popupMenu = document.getElementById('popupMenu');
const closeBtn = document.getElementById('closeBtn');
const overlay = document.getElementById('overlay');

hamburger.addEventListener('click', () => {
  overlay.classList.add('active');
  setTimeout(() => {
    popupMenu.classList.add('active');
  }, 90);
});

closeBtn.addEventListener('click', closeMenu);
overlay.addEventListener('click', closeMenu);

function closeMenu() {
  popupMenu.classList.remove('active');
  setTimeout(() => {
    overlay.classList.remove('active');
  }, 90); 
}
