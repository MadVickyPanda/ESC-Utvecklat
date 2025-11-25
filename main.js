import { fetchChallenges } from "./API.js";

const hamburger = document.getElementById("hamburger");
const popupMenu = document.getElementById("popupMenu");
const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("closeBtn");

const cardsContainer = document.getElementById("cards-container");
const topThreeContainer = document.getElementById("top-three");

let allChallenges = [];
let activeTags = [];

initHamburger();
initTags();
initBookingForm();
startApp();

function initHamburger() {
  if (hamburger && popupMenu && overlay && closeBtn) {
    hamburger.addEventListener("click", () => {
      popupMenu.classList.add("active");
      overlay.classList.add("active");
    });

    closeBtn.addEventListener("click", () => {
      popupMenu.classList.remove("active");
      overlay.classList.remove("active");
    });

    overlay.addEventListener("click", () => {
      popupMenu.classList.remove("active");
      overlay.classList.remove("active");
    });
  }
}

async function startApp() {
  try {
    const data = await fetchChallenges();
    allChallenges = Array.isArray(data.challenges) ? data.challenges : data;

    if (topThreeContainer) {
      const topThree = [...allChallenges]
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 3);
      displayCards(topThree, topThreeContainer);
    }

    if (cardsContainer) {
      displayCards(allChallenges, cardsContainer);
    }
  } catch (error) {
    if (cardsContainer) {
      cardsContainer.innerHTML = "<p>Could not load challenges.</p>";
    }
    console.error(error);
  }
}

function displayCards(challengesArray, container) {
  if (!container) return;
  container.innerHTML = "";
  challengesArray.forEach((challenge) => {
    const card = createCard(challenge);
    container.appendChild(card);
  });
}

function createCard(data) {
  const card = document.createElement("div");
  card.classList.add("card");

  card.dataset.id = data.id;
  card.dataset.type = data.type;
  card.dataset.title = data.title;
  card.dataset.description = data.description;
  card.dataset.minParticipants = data.minParticipants;
  card.dataset.maxParticipants = data.maxParticipants;
  card.dataset.rating = data.rating;
  card.dataset.labels = data.labels;

  const cardImage = document.createElement("img");
  cardImage.src = data.image || "img/images/hacker.png";
  cardImage.alt = `Image for ${data.title}`;
  cardImage.classList.add("imageCard");

  const container = document.createElement("div");
  container.classList.add("container");

  const cardTitle = document.createElement("h3");
  cardTitle.classList.add("roomTitle");
  cardTitle.textContent = `${data.title} (${data.type})`;

  const starContainer = createStarContainer(Number(data.rating) || 0);

  const participants = document.createElement("p");
  participants.classList.add("participants");
  participants.textContent =
    data.minParticipants === data.maxParticipants
      ? `${data.maxParticipants} participants`
      : `${data.minParticipants}-${data.maxParticipants} participants`;

  const roomInfo = document.createElement("p");
  roomInfo.classList.add("roomInfo");
  roomInfo.innerHTML = data.description;

  const btnDiv = document.createElement("div");
  btnDiv.classList.add("btnDiv");

  const bookButton = document.createElement("button");
  bookButton.classList.add("cardBtn", "book-button");
  bookButton.textContent = "Book this room";
  bookButton.dataset.challengeId = data.id;
  bookButton.dataset.challengeTitle = data.title;
  bookButton.dataset.minParticipants = data.minParticipants;
  bookButton.dataset.maxParticipants = data.maxParticipants;

  btnDiv.appendChild(bookButton);
  container.appendChild(cardTitle);
  container.appendChild(starContainer);
  container.appendChild(participants);
  container.appendChild(roomInfo);
  container.appendChild(btnDiv);

  card.appendChild(cardImage);
  card.appendChild(container);

  return card;
}

function handleBookClick() {
  if (
    window.location.pathname.endsWith("index.html") ||
    window.location.pathname === "/" ||
    window.location.pathname === ""
  ) {
    const bookingSection = document.getElementById("booking");
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: "smooth" });
    }
  } else {
    window.location.href = "index.html#booking";
  }
}

function createStarContainer(rating) {
  const starContainer = document.createElement("div");
  starContainer.classList.add("star");

  for (let i = 0; i < 5; i++) {
    const starImage = document.createElement("img");
    starImage.src =
      i < rating ? "img/images/Star 4.svg" : "img/images/Star 5.svg";
    starImage.width = 23;
    starImage.height = 26;
    starContainer.appendChild(starImage);
  }

  return starContainer;
}

function initTags() {
  const tagIds = [
    "web",
    "linux",
    "cryptography",
    "coding",
    "someother",
    "finaltag",
  ];
  activeTags = [];

  tagIds.forEach((tagId) => {
    const btn = document.getElementById(tagId);
    if (btn) {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        btn.classList.toggle("active");

        activeTags = tagIds
          .filter((id) => {
            const b = document.getElementById(id);
            return b && b.classList.contains("active");
          })
          .map((tag) => tag.toLowerCase());

        filterChallengesByTags();
      });
    }
  });
}

function filterChallengesByTags() {
  if (!cardsContainer) return;

  if (activeTags.length === 0) {
    displayCards(allChallenges, cardsContainer);
    return;
  }

  const filtered = allChallenges.filter((challenge) => {
    const labels = challenge.labels || [];
    const labelsLower = labels.map((l) => l.toLowerCase());
    return activeTags.every((tag) => labelsLower.includes(tag));
  });

  displayCards(filtered, cardsContainer);
}

function initBookingForm() {
  const form = document.getElementById("booking-form");
  if (!form) return;

  const dateInput = document.getElementById("booking-date");
  const participantsInput = document.getElementById("booking-participants");
  const nameInput = document.getElementById("booking-name");
  const emailInput = document.getElementById("booking-email");
  const message = document.getElementById("booking-message");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (
      !dateInput ||
      !participantsInput ||
      !nameInput ||
      !emailInput ||
      !message
    )
      return;

    const date = dateInput.value;
    const participants = participantsInput.value;
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();

    if (!date || !participants || !name || !email) {
      message.textContent = "Please fill in all fields.";
      message.classList.remove("booking-message--success");
      return;
    }

    if (!email.includes("@")) {
      message.textContent = "Please enter a valid email.";
      message.classList.remove("booking-message--success");
      return;
    }

    message.textContent = `Thank you ${name}! Your booking for ${date} with ${participants} participants has been registered.`;
    message.classList.add("booking-message--success");

    form.reset();
  });
}
