document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("booking-overlay");
  const headerEl = document.getElementById("booking-header");
  const contentEl = document.getElementById("booking-content");
  const closeBtn = document.getElementById("booking-close");

  if (!overlay || !headerEl || !contentEl || !closeBtn) {
    return;
  }

  let currentBooking = null;

  function resetModal() {
    headerEl.textContent = "";
    contentEl.innerHTML = "";
    currentBooking = null;
  }

  function closeModal() {
    overlay.classList.add("booking-hidden");
    resetModal();
  }

  async function fetchAvailableTimes(challengeId, date) {
    try {
      const res = await fetch(
        `https://lernia-sjj-assignments.vercel.app/api/booking-times?challenge=${encodeURIComponent(
          challengeId
        )}&date=${encodeURIComponent(date)}`
      );
      if (!res.ok) {
        throw new Error("HTTP error");
      }
      const data = await res.json();
      if (Array.isArray(data.times)) {
        return data.times;
      }
      if (Array.isArray(data.slots)) {
        return data.slots;
      }
      return [];
    } catch (e) {
      return ["10:00", "14:00", "18:00"];
    }
  }

  function renderStep1() {
    contentEl.innerHTML = `
      <form id="booking-step1-form" class="booking-form">
        <div class="booking-step-indicator">Step 1/3 – Choose date</div>
        <div class="booking-field">
          <label>
            Date:
            <input type="date" id="booking-step1-date" required>
          </label>
        </div>
        <div id="booking-step1-message" class="booking-error"></div>
        <div class="booking-buttons">
          <button type="button" class="booking-button-secondary" id="booking-step1-cancel">
            Cancel
          </button>
          <button type="submit" class="booking-button-primary">
            Next
          </button>
        </div>
      </form>
    `;

    const form = document.getElementById("booking-step1-form");
    const msg = document.getElementById("booking-step1-message");
    const cancelBtn = document.getElementById("booking-step1-cancel");

    cancelBtn.addEventListener("click", () => {
      closeModal();
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const dateInput = document.getElementById("booking-step1-date");
      const date = dateInput.value;

      if (!date) {
        msg.textContent = "Please choose a date.";
        msg.className = "booking-error";
        return;
      }

      msg.textContent = "Loading available times...";
      msg.className = "booking-error";

      const times = await fetchAvailableTimes(currentBooking.id, date);

      currentBooking.date = date;
      currentBooking.times = times.length ? times : ["10:00", "14:00", "18:00"];

      renderStep2();
    });
  }

  function renderStep2() {
    const minP = Number.isFinite(currentBooking.minParticipants)
      ? currentBooking.minParticipants
      : 1;
    const maxP = Number.isFinite(currentBooking.maxParticipants)
      ? currentBooking.maxParticipants
      : 10;

    const participantsOptions = [];
    for (let i = minP; i <= maxP; i++) {
      participantsOptions.push(`<option value="${i}">${i}</option>`);
    }

    const timeOptions = currentBooking.times
      .map((t) => `<option value="${t}">${t}</option>`)
      .join("");

    contentEl.innerHTML = `
      <form id="booking-step2-form" class="booking-form">
        <div class="booking-step-indicator">Step 2/3 – Your details</div>

        <div class="booking-field">
          <label>
            Time:
            <select id="booking-step2-time" required>
              ${timeOptions}
            </select>
          </label>
        </div>

        <div class="booking-field">
          <label>
            Participants:
            <select id="booking-step2-participants" required>
              ${participantsOptions.join("")}
            </select>
          </label>
        </div>

        <div class="booking-field">
          <label>
            Name:
            <input type="text" id="booking-step2-name" required>
          </label>
        </div>

        <div class="booking-field">
          <label>
            Email:
            <input type="email" id="booking-step2-email" required>
          </label>
        </div>

        <div id="booking-step2-message" class="booking-error"></div>

        <div class="booking-buttons">
          <button type="button" class="booking-button-secondary" id="booking-step2-back">
            Back
          </button>
          <button type="submit" class="booking-button-primary">
            Next
          </button>
        </div>
      </form>
    `;

    const form = document.getElementById("booking-step2-form");
    const msg = document.getElementById("booking-step2-message");
    const backBtn = document.getElementById("booking-step2-back");

    backBtn.addEventListener("click", () => {
      renderStep1();
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const time = document.getElementById("booking-step2-time").value;
      const participants =
        document.getElementById("booking-step2-participants").value;
      const name = document.getElementById("booking-step2-name").value.trim();
      const email = document.getElementById("booking-step2-email").value.trim();

      if (!time || !participants || !name || !email) {
        msg.textContent = "Please fill in all fields.";
        msg.className = "booking-error";
        return;
      }

      if (!email.includes("@")) {
        msg.textContent = "Please enter a valid email.";
        msg.className = "booking-error";
        return;
      }

      currentBooking.time = time;
      currentBooking.participants = participants;
      currentBooking.name = name;
      currentBooking.email = email;

      renderStep3();
    });
  }

  function renderStep3() {
    const { title, date, time, participants, name } = currentBooking;

    contentEl.innerHTML = `
      <div class="booking-success">
        <div class="booking-step-indicator">Step 3/3 – Done</div>
        <p>
          Thank you ${name}! Your booking for <strong>${title}</strong> on
          <strong>${date}</strong> at <strong>${time}</strong> with
          <strong>${participants}</strong> participants has been registered.
        </p>
        <div class="booking-buttons">
          <button type="button" class="booking-button-primary" id="booking-step3-close">
            Close
          </button>
        </div>
      </div>
    `;

    const closeStepBtn = document.getElementById("booking-step3-close");
    closeStepBtn.addEventListener("click", () => {
      closeModal();
    });
  }

  function openModal(options) {
    currentBooking = {
      id: options.id,
      title: options.title,
      minParticipants: options.minParticipants,
      maxParticipants: options.maxParticipants,
      date: "",
      times: [],
      time: "",
      participants: "",
      name: "",
      email: "",
    };

    overlay.classList.remove("booking-hidden");
    headerEl.textContent = `Book: ${options.title}`;
    renderStep1();
  }

  closeBtn.addEventListener("click", closeModal);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closeModal();
    }
  });

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".book-button");
    if (!btn) return;

    const title = btn.dataset.challengeTitle || "Escape room";
    const minParticipants = parseInt(btn.dataset.minParticipants || "1", 10);
    const maxParticipants = parseInt(btn.dataset.maxParticipants || "10", 10);
    const id = btn.dataset.challengeId || "";

    openModal({ id, title, minParticipants, maxParticipants });
  });
});