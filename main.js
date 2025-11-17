// Startsida

const hamburger = document.getElementById('hamburger');
const popupMenu = document.getElementById('popupMenu');
const overlay = document.getElementById('overlay');
const closeBtn = document.getElementById('closeBtn');
let topThreeChallenges = [];

fetch('challenges.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    const cardsContainer = document.getElementById('cards-container');
    cardsContainer.style.display = 'grid';
    cardsContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
    cardsContainer.style.gap = '1.25rem';
    cardsContainer.style.padding = '1rem';
    cardsContainer.style.justifyItems = 'center';
    // topThreeChallenges = data.challenges.sort((a, b) => b.rating - a.rating).slice(0, 3);
    // console.log(topThreeChallenges);
    function createCard(data) {
      const card = document.createElement('div');
      card.classList.add('card');
      card.dataset.id = data.id;
      card.dataset.type = data.type;
      card.dataset.title = data.title;
      card.dataset.description = data.description;
      card.dataset.minParticipants = data.minParticipants;
      card.dataset.maxParticipants = data.maxParticipants;
      card.dataset.rating = data.rating;
      card.dataset.labels = data.labels;
      const cardImage = document.createElement('img');
      cardImage.src = '/img/images/hacker.png';
      cardImage.alt = `Image for ${data.title}`;
      cardImage.classList.add('imageCard');

      const container = document.createElement('div');
      container.classList.add('container');

      const cardTitle = document.createElement('h3');
      cardTitle.classList.add('roomTitle');
      cardTitle.textContent = `${data.title} (${data.type})`;

      const starContainer = document.createElement('div');
      starContainer.classList.add('star');
      for (let i = 0; i < 5; i++) {
        const starImage = document.createElement('img');
        starImage.src = i < data.rating ? 'img/images/Star 4.svg' : 'img/images/Star 5.svg';
        starImage.width = 23;
        starImage.height = 26;
        starContainer.appendChild(starImage);
      }

      const participants = document.createElement('p');
      participants.classList.add('participants');
      if (data.minParticipants === data.maxParticipants) {
        participants.textContent = `${data.maxParticipants} participants`;
      } else {
        participants.textContent = `${data.minParticipants}-${data.maxParticipants} participants`;
      }

      const roomInfo = document.createElement('p');
      roomInfo.classList.add('roomInfo');
      roomInfo.innerHTML = `${data.description}`;

      const btnDiv = document.createElement('div');
      btnDiv.classList.add('btnDiv');
      const bookButton = document.createElement('button');
      bookButton.classList.add('cardBtn');
      bookButton.textContent = 'Book this room';
      btnDiv.appendChild(bookButton);

      container.appendChild(cardTitle);
      container.appendChild(starContainer);
      container.appendChild(participants);
      container.appendChild(roomInfo);
      container.appendChild(btnDiv);

      card.appendChild(cardImage);
      card.appendChild(container);

      cardsContainer.appendChild(card);
    }

    data.challenges.forEach(createCard);
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });

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

