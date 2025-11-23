const bookingApiBase = "https://lernia-sjj-assignments.vercel.app/api";

let bookingOverlayElement = null;
let bookingHeaderElement = null;
let bookingContentElement = null;
let bookingCloseButton = null;

let bookingCurrentChallengeId = null;
let bookingCurrentChallengeTitle = "";
let bookingMinParticipants = 1;
let bookingMaxParticipants = 8;
let bookingAvailableSlots = [];
let bookingSelectedDate = "";
let bookingCurrentStep = 1;

function initBooking() {
  bookingOverlayElement = document.getElementById("booking-overlay");
  bookingHeaderElement = document.getElementById("booking-header");
  bookingContentElement = document.getElementById("booking-content");
  bookingCloseButton = document.getElementById("booking-close");

  if (!bookingOverlayElement || !bookingHeaderElement || !bookingContentElement || !bookingCloseButton) {
    return;
  }

  bookingCloseButton.addEventListener("click", closeBookingModal);
  bookingOverlayElement.addEventListener("click", function (event) {
    if (event.target === bookingOverlayElement) {
      closeBookingModal();
    }
  });
}

document.addEventListener("click", function (event) {
  const button = event.target.closest(".book-button");
  if (!button) {
    return;
  }

  const id = parseInt(button.dataset.challengeId, 10);
  const title = button.dataset.challengeTitle || "";
  const min = parseInt(button.dataset.minParticipants, 10);
  const max = parseInt(button.dataset.maxParticipants, 10);

  bookingCurrentChallengeId = id;
  bookingCurrentChallengeTitle = title;
  bookingMinParticipants = isNaN(min) ? 1 : min;
  bookingMaxParticipants = isNaN(max) ? 8 : max;

  openBookingModal();
});

function openBookingModal() {
  if (!bookingOverlayElement) {
    return;
  }
  bookingCurrentStep = 1;
  bookingAvailableSlots = [];
  bookingSelectedDate = "";
  bookingOverlayElement.classList.remove("booking-hidden");
  renderBookingStep1();
}

function closeBookingModal() {
  if (!bookingOverlayElement) {
    return;
  }
  bookingOverlayElement.classList.add("booking-hidden");
}

function renderBookingStep1(errorMessage) {
  if (!bookingHeaderElement || !bookingContentElement) {
    return;
  }

  bookingHeaderElement.textContent = "Book: " + bookingCurrentChallengeTitle;

  let errorHtml = "";
  if (errorMessage) {
    errorHtml = '<div class="booking-error">' + errorMessage + "</div>";
  }

  bookingContentElement.innerHTML =
    '<div class="booking-step-indicator">Step 1 of 3</div>' +
    errorHtml +
    '<div class="booking-field">' +
    '<label for="booking-date-modal">Choose date</label>' +
    '<input id="booking-date-modal" type="date" />' +
    "</div>" +
    '<div class="booking-buttons">' +
    '<button id="booking-next-step-1" class="booking-button-primary">Next</button>' +
    "</div>";

  const nextButton = document.getElementById("booking-next-step-1");
  const dateInput = document.getElementById("booking-date-modal");

  if (dateInput) {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    dateInput.min = y + "-" + m + "-" + d;
  }

  if (nextButton) {
    nextButton.addEventListener("click", handleBookingStep1Next);
  }
}

async function handleBookingStep1Next() {
  const dateInput = document.getElementById("booking-date-modal");
  if (!dateInput) {
    return;
  }

  const dateValue = dateInput.value;
  if (!dateValue) {
    renderBookingStep1("Please choose a date.");
    return;
  }

  if (!bookingCurrentChallengeId) {
    renderBookingStep1("Missing challenge id.");
    return;
  }

  bookingSelectedDate = dateValue;
  renderBookingLoading("Loading available times...");

  try {
    const url =
      bookingApiBase +
      "/booking/available-times?date=" +
      encodeURIComponent(bookingSelectedDate) +
      "&challenge=" +
      encodeURIComponent(bookingCurrentChallengeId);

    const res = await fetch(url);
    const data = await res.json();

    if (!data.slots || !Array.isArray(data.slots) || data.slots.length === 0) {
      renderBookingStep1("No available times for this date. Please choose another date.");
      return;
    }

    bookingAvailableSlots = data.slots;
    bookingCurrentStep = 2;
    renderBookingStep2();
  } catch (error) {
    renderBookingStep1("Could not load available times. Please try again.");
  }
}

function renderBookingLoading(message) {
  if (!bookingHeaderElement || !bookingContentElement) {
    return;
  }

  bookingHeaderElement.textContent = "Book: " + bookingCurrentChallengeTitle;

  bookingContentElement.innerHTML =
    '<div class="booking-step-indicator">Please wait</div>' +
    "<div>" +
    message +
    "</div>";
}

function renderBookingStep2(errorMessage) {
  if (!bookingHeaderElement || !bookingContentElement) {
    return;
  }

  bookingHeaderElement.textContent = "Book: " + bookingCurrentChallengeTitle;

  let errorHtml = "";
  if (errorMessage) {
    errorHtml = '<div class="booking-error">' + errorMessage + "</div>";
  }

  const timeOptions = bookingAvailableSlots
    .map(function (slot) {
      return '<option value="' + slot + '">' + slot + "</option>";
    })
    .join("");

  const participantOptions = [];
  for (let p = bookingMinParticipants; p <= bookingMaxParticipants; p++) {
    participantOptions.push('<option value="' + p + '">' + p + "</option>");
  }

  bookingContentElement.innerHTML =
    '<div class="booking-step-indicator">Step 2 of 3</div>' +
    errorHtml +
    '<div class="booking-field">' +
    '<label for="booking-name-modal">Name</label>' +
    '<input id="booking-name-modal" type="text" />' +
    "</div>" +
    '<div class="booking-field">' +
    '<label for="booking-email-modal">E-mail</label>' +
    '<input id="booking-email-modal" type="email" />' +
    "</div>" +
    '<div class="booking-field">' +
    '<label for="booking-time-modal">Time</label>' +
    '<select id="booking-time-modal">' +
    timeOptions +
    "</select>" +
    "</div>" +
    '<div class="booking-field">' +
    '<label for="booking-participants-modal">Participants</label>' +
    '<select id="booking-participants-modal">' +
    participantOptions.join("") +
    "</select>" +
    "</div>" +
    '<div class="booking-buttons">' +
    '<button id="booking-back-step-2" class="booking-button-secondary">Back</button>' +
    '<button id="booking-next-step-2" class="booking-button-primary">Next</button>' +
    "</div>";

  const nextButton = document.getElementById("booking-next-step-2");
  const backButton = document.getElementById("booking-back-step-2");

  if (backButton) {
    backButton.addEventListener("click", function () {
      bookingCurrentStep = 1;
      renderBookingStep1();
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", handleBookingStep2Next);
  }
}

async function handleBookingStep2Next() {
  const nameInput = document.getElementById("booking-name-modal");
  const emailInput = document.getElementById("booking-email-modal");
  const timeSelect = document.getElementById("booking-time-modal");
  const participantsSelect = document.getElementById("booking-participants-modal");

  if (!nameInput || !emailInput || !timeSelect || !participantsSelect) {
    return;
  }

  const nameValue = nameInput.value.trim();
  const emailValue = emailInput.value.trim();
  const timeValue = timeSelect.value;
  const participantsValue = parseInt(participantsSelect.value, 10);

  if (!nameValue || !emailValue || !timeValue || !participantsValue) {
    renderBookingStep2("Please fill in all fields.");
    return;
  }

  if (!bookingSelectedDate || !bookingCurrentChallengeId) {
    renderBookingStep1("Something went wrong. Please start again.");
    bookingCurrentStep = 1;
    return;
  }

  renderBookingLoading("Sending booking...");

  try {
    const res = await fetch(bookingApiBase + "/booking/reservations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        challenge: bookingCurrentChallengeId,
        name: nameValue,
        email: emailValue,
        date: bookingSelectedDate,
        time: timeValue,
        participants: participantsValue
      })
    });

    const data = await res.json();

    if (data.status !== "ok") {
      renderBookingStep2("Booking failed. Please check your data and try again.");
      bookingCurrentStep = 2;
      return;
    }

    bookingCurrentStep = 3;
    renderBookingStep3(nameValue);
  } catch (error) {
    renderBookingStep2("Could not send booking. Please try again.");
  }
}

function renderBookingStep3(name) {
  if (!bookingHeaderElement || !bookingContentElement) {
    return;
  }

  bookingHeaderElement.textContent = "Booking confirmed";

  bookingContentElement.innerHTML =
    '<div class="booking-step-indicator">Step 3 of 3</div>' +
    '<div class="booking-success">Thank you, ' +
    name +
    '! Your booking request has been sent.</div>' +
    '<div class="booking-buttons">' +
    '<button id="booking-close-final" class="booking-button-primary">Close</button>' +
    "</div>";

  const closeFinalButton = document.getElementById("booking-close-final");
  if (closeFinalButton) {
    closeFinalButton.addEventListener("click", closeBookingModal);
  }
}

document.addEventListener("DOMContentLoaded", initBooking);