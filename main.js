const hamburger = document.getElementById("hamburger");
const popupMenu = document.getElementById("popupMenu");
const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("closeBtn");

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

const API_BASE = "https://lernia-sjj-assignments.vercel.app/api";
const API_CHALLENGES = `${API_BASE}/challenges`;
const API_AVAILABLE = `${API_BASE}/booking/available-times`;
const API_BOOKING = `${API_BASE}/booking/reservations`;

let allChallenges = [];
let selectedMinRating = 0;
let selectedMaxRating = 5;
let selectedTags = new Set();
let filterOnline = false;
let filterOnsite = false;
let searchText = "";

function createStars(rating) {
  const wrapper = document.createElement("span");
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement("span");
    star.classList.add("star-icon");
    if (i <= Math.round(rating)) {
      star.classList.add("filled");
    }
    star.textContent = "★";
    wrapper.appendChild(star);
  }
  return wrapper;
}

function renderChallenges(list, container) {
  container.innerHTML = "";

  list.forEach((challenge) => {
    const card = document.createElement("article");
    card.className = "challenge-card";

    const img = document.createElement("img");
    img.src = challenge.image;
    img.alt = challenge.title;

    const body = document.createElement("div");
    body.className = "challenge-body";

    const title = document.createElement("h3");
    title.className = "challenge-title";
    title.textContent = challenge.title;

    const meta = document.createElement("p");
    meta.className = "challenge-meta";
    meta.textContent = `${challenge.type} • ${challenge.minParticipants}-${challenge.maxParticipants} participants`;

    const ratingRow = document.createElement("div");
    ratingRow.className = "challenge-rating";
    const stars = createStars(challenge.rating);
    const ratingText = document.createElement("span");
    ratingText.textContent = ` ${challenge.rating.toFixed(1)} / 5`;
    ratingRow.appendChild(stars);
    ratingRow.appendChild(ratingText);

    const desc = document.createElement("p");
    desc.className = "challenge-description";
    desc.textContent = challenge.description;

    const bookBtn = document.createElement("button");
    bookBtn.className = "challenge-book-btn";
    bookBtn.textContent = "Book this room";
    bookBtn.addEventListener("click", () => {
      openBookingModal(challenge);
    });

    body.appendChild(title);
    body.appendChild(meta);
    body.appendChild(ratingRow);
    body.appendChild(desc);
    body.appendChild(bookBtn);

    card.appendChild(img);
    card.appendChild(body);
    container.appendChild(card);
  });
}

function applyFiltersAndRender() {
  const container = document.getElementById("allChallengesGrid");
  const noMatchesEl = document.getElementById("noMatchesMessage");
  if (!container) return;

  let filtered = [...allChallenges];

  if (filterOnline || filterOnsite) {
    filtered = filtered.filter((c) => {
      const type = String(c.type || "").toLowerCase();
      const isOnline = type.includes("online");
      const isOnsite = type.includes("site");
      if (filterOnline && !filterOnsite) return isOnline;
      if (!filterOnline && filterOnsite) return isOnsite;
      if (filterOnline && filterOnsite) return isOnline || isOnsite;
      return true;
    });
  }

  filtered = filtered.filter(
    (c) => c.rating >= selectedMinRating && c.rating <= selectedMaxRating
  );

  if (selectedTags.size > 0) {
    filtered = filtered.filter((c) => {
      const tags = c.labels || c.tags || [];
      const tagSet = new Set(tags);
      for (const t of selectedTags) {
        if (!tagSet.has(t)) return false;
      }
      return true;
    });
  }

  if (searchText.trim() !== "") {
    const q = searchText.toLowerCase();
    filtered = filtered.filter((c) => {
      const t = String(c.title || "").toLowerCase();
      const d = String(c.description || "").toLowerCase();
      return t.includes(q) || d.includes(q);
    });
  }

  renderChallenges(filtered, container);

  if (noMatchesEl) {
    noMatchesEl.hidden = filtered.length !== 0;
  }
}

function buildRatingWidget(elementId, isMin) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.innerHTML = "";
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement("span");
    star.classList.add("star-icon");
    star.textContent = "★";
    star.addEventListener("click", () => {
      if (isMin) {
        selectedMinRating = i;
      } else {
        selectedMaxRating = i;
      }
      updateRatingWidgetVisual("minRatingWidget", selectedMinRating);
      updateRatingWidgetVisual("maxRatingWidget", selectedMaxRating);
    });
    el.appendChild(star);
  }
  updateRatingWidgetVisual(
    elementId,
    isMin ? selectedMinRating : selectedMaxRating
  );
}

function updateRatingWidgetVisual(elementId, value) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const stars = el.querySelectorAll(".star-icon");
  stars.forEach((star, index) => {
    if (index < value) {
      star.classList.add("filled");
    } else {
      star.classList.remove("filled");
    }
  });
}

function buildTagList() {
  const tagContainer = document.getElementById("tagList");
  if (!tagContainer) return;

  const allTags = new Set();
  allChallenges.forEach((c) => {
    const tags = c.labels || c.tags || [];
    tags.forEach((t) => allTags.add(t));
  });

  tagContainer.innerHTML = "";

  Array.from(allTags).forEach((tag) => {
    const span = document.createElement("span");
    span.className = "tag-pill";
    span.textContent = tag;
    span.addEventListener("click", () => {
      if (selectedTags.has(tag)) {
        selectedTags.delete(tag);
        span.classList.remove("active");
      } else {
        selectedTags.add(tag);
        span.classList.add("active");
      }
    });
    tagContainer.appendChild(span);
  });
}

function setupFilters() {
  const toggleBtn = document.getElementById("toggleFilters");
  const panel = document.getElementById("filterPanel");
  const onlineCb = document.getElementById("filterOnline");
  const onsiteCb = document.getElementById("filterOnsite");
  const searchInput = document.getElementById("searchText");
  const applyBtn = document.getElementById("applyFilters");

  if (toggleBtn && panel) {
    toggleBtn.addEventListener("click", () => {
      panel.hidden = !panel.hidden;
    });
  }

  if (onlineCb) {
    onlineCb.addEventListener("change", () => {
      filterOnline = onlineCb.checked;
    });
  }

  if (onsiteCb) {
    onsiteCb.addEventListener("change", () => {
      filterOnsite = onsiteCb.checked;
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchText = e.target.value;
    });
  }

  if (applyBtn) {
    applyBtn.addEventListener("click", () => {
      applyFiltersAndRender();
    });
  }

  buildRatingWidget("minRatingWidget", true);
  buildRatingWidget("maxRatingWidget", false);
  buildTagList();
}

async function loadChallenges() {
  try {
    const res = await fetch(API_CHALLENGES);
    if (!res.ok) throw new Error("Failed to load challenges");
    const data = await res.json();
    allChallenges = data.challenges || [];

    const popularContainer = document.getElementById("popularChallenges");
    if (popularContainer) {
      const sorted = [...allChallenges].sort((a, b) => b.rating - a.rating);
      const top3 = sorted.slice(0, 3);
      renderChallenges(top3, popularContainer);
    }

    const allContainer = document.getElementById("allChallengesGrid");
    if (allContainer) {
      setupFilters();
      applyFiltersAndRender();
    }
  } catch (err) {
    console.error(err);
  }
}

const bookingBackdrop = document.getElementById("bookingBackdrop");
const bookingClose = document.getElementById("bookingClose");
const bookingCloseFinal = document.getElementById("bookingCloseFinal");
const bookingStep1 = document.getElementById("bookingStep1");
const bookingStep2 = document.getElementById("bookingStep2");
const bookingStep3 = document.getElementById("bookingStep3");
const bookingRoomTitle = document.getElementById("bookingRoomTitle");
const bookingSummaryStep2 = document.getElementById("bookingSummaryStep2");
const bookingThankYou = document.getElementById("bookingThankYou");
const bookingDateInput = document.getElementById("bookingDate");
const bookingError1 = document.getElementById("bookingError1");
const bookingError2 = document.getElementById("bookingError2");
const bookingNext1 = document.getElementById("bookingNext1");
const bookingNext2 = document.getElementById("bookingNext2");
const bookingNameInput = document.getElementById("bookingName");
const bookingEmailInput = document.getElementById("bookingEmail");
const bookingTimeSelect = document.getElementById("bookingTime");
const bookingParticipantsSelect = document.getElementById(
  "bookingParticipants"
);

let currentBookingChallenge = null;
let currentBookingDate = "";
let currentAvailableSlots = [];

function resetBookingModal() {
  if (!bookingBackdrop) return;
  bookingStep1.hidden = false;
  bookingStep2.hidden = true;
  bookingStep3.hidden = true;
  bookingError1.textContent = "";
  bookingError2.textContent = "";
  bookingDateInput.value = "";
  bookingNameInput.value = "";
  bookingEmailInput.value = "";
  bookingTimeSelect.innerHTML = "";
  bookingParticipantsSelect.innerHTML = "";
  currentAvailableSlots = [];
}

function openBookingModal(challenge) {
  if (!bookingBackdrop) return;
  currentBookingChallenge = challenge;
  currentBookingDate = "";
  resetBookingModal();

  bookingRoomTitle.textContent = `Book: ${challenge.title}`;

  for (let i = challenge.minParticipants; i <= challenge.maxParticipants; i++) {
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = `${i} participants`;
    bookingParticipantsSelect.appendChild(opt);
  }

  bookingBackdrop.hidden = false;
}

function closeBookingModal() {
  if (!bookingBackdrop) return;
  bookingBackdrop.hidden = true;
}

async function handleBookingNext1() {
  if (!bookingDateInput || !currentBookingChallenge) return;
  const dateValue = bookingDateInput.value;
  if (!dateValue) {
    bookingError1.textContent = "Please choose a date.";
    return;
  }

  bookingError1.textContent = "";
  currentBookingDate = dateValue;

  try {
    const params = new URLSearchParams({
      date: dateValue,
      challenge: String(currentBookingChallenge.id),
    });
    const res = await fetch(`${API_AVAILABLE}?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to load available times");
    const data = await res.json();
    const slots = data.slots || [];

    bookingTimeSelect.innerHTML = "";
    currentAvailableSlots = slots;

    if (slots.length === 0) {
      bookingError1.textContent = "No available times for that date.";
      return;
    }

    slots.forEach((slot) => {
      const opt = document.createElement("option");
      opt.value = slot;
      opt.textContent = slot;
      bookingTimeSelect.appendChild(opt);
    });

    bookingSummaryStep2.textContent = `${currentBookingChallenge.title} on ${currentBookingDate}`;
    bookingStep1.hidden = true;
    bookingStep2.hidden = false;
  } catch (err) {
    console.error(err);
    bookingError1.textContent = "Could not load available times.";
  }
}

async function handleBookingNext2() {
  if (!currentBookingChallenge) return;

  const name = bookingNameInput.value.trim();
  const email = bookingEmailInput.value.trim();
  const time = bookingTimeSelect.value;
  const participants = bookingParticipantsSelect.value;

  if (!name || !email || !time || !participants) {
    bookingError2.textContent = "Please fill in all fields.";
    return;
  }

  if (!email.includes("@")) {
    bookingError2.textContent = "Please enter a valid e-mail.";
    return;
  }

  bookingError2.textContent = "";

  const payload = {
    challenge: currentBookingChallenge.id,
    name,
    email,
    date: currentBookingDate,
    time,
    participants: Number(participants),
  };

  try {
    const res = await fetch(API_BOOKING, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Booking failed");
    const data = await res.json();

    bookingStep2.hidden = true;
    bookingStep3.hidden = false;
    bookingThankYou.textContent = `Thank you, ${data.booking.name}! Your booking for "${currentBookingChallenge.title}" on ${data.booking.date} at ${data.booking.time} for ${data.booking.participants} participants is confirmed.`;
  } catch (err) {
    console.error(err);
    bookingError2.textContent = "Could not complete the booking.";
  }
}

if (bookingNext1) {
  bookingNext1.addEventListener("click", handleBookingNext1);
}
if (bookingNext2) {
  bookingNext2.addEventListener("click", handleBookingNext2);
}
if (bookingClose) {
  bookingClose.addEventListener("click", closeBookingModal);
}
if (bookingCloseFinal) {
  bookingCloseFinal.addEventListener("click", closeBookingModal);
}
if (bookingBackdrop) {
  bookingBackdrop.addEventListener("click", (e) => {
    if (e.target === bookingBackdrop) {
      closeBookingModal();
    }
  });
}

loadChallenges();