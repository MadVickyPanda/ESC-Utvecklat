async function fetchChallenges() {
  const API_URL = "https://lernia-sjj-assignments.vercel.app/api/challenges";
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  return data.challenges;
}

const hamburger = document.getElementById("hamburger");
const popupMenu = document.getElementById("popupMenu");
const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("closeBtn");

let cardsContainer = null;
let allChallenges = [];
let activeTags = [];
let currentChallengeId = null;
let currentChallenge = null;
let availableSlots = [];

document.addEventListener("DOMContentLoaded", () => {
  cardsContainer = document.getElementById("cards-container");
  startApp();
  initBooking();
  initTags();
  initHamburger();
});

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

function startApp() {
  if (!cardsContainer) return;
  loadChallenges();
}

function loadChallenges() {
  fetchChallenges()
    .then((challenges) => {
      allChallenges = challenges;
      window.challenges = allChallenges;
      displayCards(allChallenges);
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
      if (cardsContainer) {
        cardsContainer.innerHTML = "<p>Could not load challenges.</p>";
      }
    });
}

function displayCards(challengesArray) {
  if (!cardsContainer) return;

  cardsContainer.innerHTML = "";

  challengesArray.forEach((challenge) => {
    const card = createCard(challenge);
    cardsContainer.appendChild(card);
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
  bookButton.classList.add("cardBtn", "book-btn");
  bookButton.textContent = "Book this room";
  bookButton.dataset.challengeId = data.id;
  bookButton.dataset.challengeTitle = data.title;

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
  const tagIds = ["web", "linux", "cryptography", "coding", "someother", "finaltag"];
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
    displayCards(allChallenges);
    return;
  }

  const filtered = allChallenges.filter((challenge) => {
    let labels = challenge.labels || [];
    const labelsLower = labels.map((l) => l.toLowerCase());
    return activeTags.every((tag) => labelsLower.includes(tag));
  });

  displayCards(filtered);
}

function initBooking() {
  const modal = document.getElementById("booking-modal");
  if (!modal) return;

  const closeBtnBooking = document.getElementById("booking-close");
  const closeBtn3 = document.getElementById("booking-close-3");

  document.body.addEventListener("click", (event) => {
    const btn = event.target.closest(".book-btn");
    if (!btn) return;

    const id = Number(btn.dataset.challengeId);
    const title = btn.dataset.challengeTitle || "Selected challenge";

    currentChallengeId = id;
    const titleElement = document.getElementById("booking-challenge-title");
    if (titleElement) {
      titleElement.textContent = title;
    }

    if (Array.isArray(window.challenges)) {
      currentChallenge = window.challenges.find((c) => c.id === id) || null;
    }

    openBookingModal();
  });

  if (closeBtnBooking) closeBtnBooking.addEventListener("click", closeBookingModal);
  if (closeBtn3) closeBtn3.addEventListener("click", closeBookingModal);

  const backdrop = modal.querySelector(".booking-modal__backdrop");
  if (backdrop) backdrop.addEventListener("click", closeBookingModal);

  setupBookingSteps();
}

function openBookingModal() {
  const modal = document.getElementById("booking-modal");
  if (!modal) return;
  modal.classList.remove("hidden");
  showStep(1);
}

function closeBookingModal() {
  const modal = document.getElementById("booking-modal");
  if (!modal) return;
  modal.classList.add("hidden");
}

function setupBookingSteps() {
  const step1Next = document.getElementById("booking-next-1");
  const dateInput = document.getElementById("booking-date");
  const error1 = document.getElementById("booking-step-1-error");

  if (step1Next) {
    step1Next.addEventListener("click", async () => {
      if (!error1 || !dateInput) return;

      error1.textContent = "";

      const date = dateInput.value;
      if (!date) {
        error1.textContent = "Please choose a date.";
        return;
      }

      try {
        const res = await fetch(
          `https://lernia-sjj-assignments.vercel.app/api/booking/available-times?date=${date}&challenge=${currentChallengeId}`
        );

        if (!res.ok) {
          throw new Error("Failed to load available times.");
        }

        const data = await res.json();
        availableSlots = data.slots;

        if (!availableSlots || availableSlots.length === 0) {
          error1.textContent = "No available times for this date.";
          return;
        }

        fillTimeSelect();
        fillParticipantsSelect();

        showStep(2);
      } catch (err) {
        console.error(err);
        error1.textContent = "Something went wrong. Please try again.";
      }
    });
  }

  const step2Back = document.getElementById("booking-back-2");
  if (step2Back) {
    step2Back.addEventListener("click", () => showStep(1));
  }

  const step2Next = document.getElementById("booking-next-2");
  const error2 = document.getElementById("booking-step-2-error");

  if (step2Next) {
    step2Next.addEventListener("click", async () => {
      if (!error2) return;

      error2.textContent = "";

      const dateInput2 = document.getElementById("booking-date");
      const timeSelect = document.getElementById("booking-time");
      const participantsSelect = document.getElementById("booking-participants");
      const nameInput = document.getElementById("booking-name");
      const emailInput = document.getElementById("booking-email");

      if (!dateInput2 || !timeSelect || !participantsSelect || !nameInput || !emailInput) {
        error2.textContent = "Please fill in all fields.";
        return;
      }

      const date = dateInput2.value;
      const time = timeSelect.value;
      const participants = Number(participantsSelect.value);
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();

      if (!date || !time || !participants || !name || !email) {
        error2.textContent = "Please fill in all fields.";
        return;
      }

      if (!email.includes("@")) {
        error2.textContent = "Please enter a valid email.";
        return;
      }

      try {
        const res = await fetch(
          "https://lernia-sjj-assignments.vercel.app/api/booking/reservations",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              challenge: currentChallengeId,
              name,
              email,
              date,
              time,
              participants,
            }),
          }
        );

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error("Booking failed:", errorData);
          throw new Error("Booking failed");
        }

        const data = await res.json();
        console.log("Booking response:", data);

        showStep(3);
      } catch (err) {
        console.error(err);
        error2.textContent = "Could not complete booking. Please try again.";
      }
    });
  }
}

function showStep(stepNumber) {
  const steps = document.querySelectorAll(".booking-step");
  steps.forEach((step) => step.classList.add("hidden"));

  const active = document.getElementById(`booking-step-${stepNumber}`);
  if (active) active.classList.remove("hidden");
}

function fillTimeSelect() {
  const select = document.getElementById("booking-time");
  if (!select) return;
  select.innerHTML = "";

  availableSlots.forEach((slot) => {
    const option = document.createElement("option");
    option.value = slot;
    option.textContent = slot;
    select.appendChild(option);
  });
}

function fillParticipantsSelect() {
  const select = document.getElementById("booking-participants");
  if (!select) return;
  select.innerHTML = "";

  let min = 1;
  let max = 6;

  if (currentChallenge) {
    if (typeof currentChallenge.minParticipants === "number") {
      min = currentChallenge.minParticipants;
    }
    if (typeof currentChallenge.maxParticipants === "number") {
      max = currentChallenge.maxParticipants;
    }
  }

  for (let i = min; i <= max; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = i;
    select.appendChild(option);
  }
}