const API_BASE = "https://lernia-sjj-assignments.vercel.app/api/challenges";

let allChallengesCache = null;

async function fetchAllChallenges() {
  if (allChallengesCache) return allChallengesCache;

  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error("Failed to load challenges from API");
  const data = await res.json();
  allChallengesCache = Array.isArray(data.challenges) ? data.challenges : data;
  return allChallengesCache;
}

async function fetchAvailableTimes(challengeId, date) {
  const url = `${API_BASE}/${challengeId}/booking-times?date=${date}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load booking times");
  const data = await res.json();
  return data.slots || [];
}

function createOverlay() {
  const overlay = document.createElement("div");
  overlay.id = "booking-overlay";
  overlay.className = "booking-overlay booking-hidden";

  const modal = document.createElement("div");
  modal.className = "booking-modal";

  const closeBtn = document.createElement("button");
  closeBtn.id = "booking-close";
  closeBtn.className = "booking-close-button";
  closeBtn.textContent = "×";

  const header = document.createElement("div");
  header.id = "booking-header";
  header.className = "booking-header";

  const content = document.createElement("div");
  content.id = "booking-content";
  content.className = "booking-content";

  modal.appendChild(closeBtn);
  modal.appendChild(header);
  modal.appendChild(content);
  overlay.appendChild(modal);

  document.body.appendChild(overlay);

  closeBtn.addEventListener("click", () => {
    overlay.classList.add("booking-hidden");
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.classList.add("booking-hidden");
    }
  });

  return { overlay, header, content };
}

function formatStepHeader(step, title) {
  return `
    <div class="booking-step-indicator">Step ${step}/3</div>
    ${title ? `<div>${title}</div>` : ""}
  `;
}

function showStep1({ overlay, headerEl, contentEl, challenge, onNext }) {
  headerEl.innerHTML = `Book: ${challenge.title}`;
  contentEl.innerHTML = `
    ${formatStepHeader(1, "Choose date")}
    <div class="booking-field">
      <label for="booking-date">Date:</label>
      <input id="booking-date" type="date" />
    </div>
    <div id="booking-error" class="booking-error"></div>
    <div class="booking-buttons">
      <button id="booking-cancel" class="booking-button-secondary">Cancel</button>
      <button id="booking-next-1" class="booking-button-primary">Next</button>
    </div>
  `;

  const dateInput = contentEl.querySelector("#booking-date");
  const errorEl = contentEl.querySelector("#booking-error");
  const cancelBtn = contentEl.querySelector("#booking-cancel");
  const nextBtn = contentEl.querySelector("#booking-next-1");

  if (dateInput) {
    dateInput.addEventListener("input", () => {
      errorEl.textContent = "";
    });
    dateInput.addEventListener("change", () => {
      errorEl.textContent = "";
    });
  }

  cancelBtn.addEventListener("click", () => {
    overlay.classList.add("booking-hidden");
  });

  nextBtn.addEventListener("click", async () => {
    const date = dateInput.value;

    if (!date) {
      errorEl.textContent = "Välj ett datum innan du går vidare.";
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    if (date < today) {
      errorEl.textContent =
        "Du kan inte välja ett datum som redan har passerat.";
      return;
    }

    errorEl.textContent = "";

    let availableTimes = [];
    try {
      availableTimes = await fetchAvailableTimes(challenge.id, date);
    } catch (err) {
      console.error("API booking-times failed, using fallback times", err);
    }

    if (!availableTimes || !availableTimes.length) {
      availableTimes = ["18:00", "20:00", "22:00"];
    }

    onNext({ date, availableTimes });
  });
}

function showStep2({
  overlay,
  headerEl,
  contentEl,
  challenge,
  date,
  availableTimes,
  onBack,
  onNext,
}) {
  headerEl.innerHTML = `Book: ${challenge.title}`;
  const optionsTimes = availableTimes
    .map((t) => `<option value="${t}">${t}</option>`)
    .join("");

  const optionsParticipants = [];
  const min = challenge.minParticipants || 1;
  const max = challenge.maxParticipants || min;
  for (let p = min; p <= max; p++) {
    optionsParticipants.push(`<option value="${p}">${p}</option>`);
  }

  contentEl.innerHTML = `
    ${formatStepHeader(2, "Your details")}
    <div class="booking-field">
      <label for="booking-time">Time:</label>
      <select id="booking-time">${optionsTimes}</select>
    </div>
    <div class="booking-field">
      <label for="booking-participants">Participants:</label>
      <select id="booking-participants">
        ${optionsParticipants.join("")}
      </select>
    </div>
    <div class="booking-field">
      <label for="booking-name">Name:</label>
      <input id="booking-name" type="text" />
    </div>
    <div class="booking-field">
      <label for="booking-email">Email:</label>
      <input id="booking-email" type="email" />
    </div>
    <div id="booking-error" class="booking-error"></div>
    <div class="booking-buttons">
      <button id="booking-back" class="booking-button-secondary">Back</button>
      <button id="booking-next-2" class="booking-button-primary">Next</button>
    </div>
  `;

  const timeSelect = contentEl.querySelector("#booking-time");
  const participantsSelect = contentEl.querySelector("#booking-participants");
  const nameInput = contentEl.querySelector("#booking-name");
  const emailInput = contentEl.querySelector("#booking-email");
  const errorEl = contentEl.querySelector("#booking-error");
  const backBtn = contentEl.querySelector("#booking-back");
  const nextBtn = contentEl.querySelector("#booking-next-2");

  [timeSelect, participantsSelect, nameInput, emailInput].forEach((el) => {
    if (!el) return;
    el.addEventListener("input", () => {
      errorEl.textContent = "";
    });
    el.addEventListener("change", () => {
      errorEl.textContent = "";
    });
  });

  backBtn.addEventListener("click", () => {
    onBack();
  });

  nextBtn.addEventListener("click", () => {
    const time = timeSelect.value;
    const participants = participantsSelect.value;
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();

    if (!time || !participants || !name || !email) {
      errorEl.textContent = "Fyll i alla fält innan du går vidare.";
      return;
    }
    if (!email.includes("@")) {
      errorEl.textContent = "Ange en giltig e-postadress.";
      return;
    }

    errorEl.textContent = "";

    onNext({ time, participants, name, email });
  });
}

function showStep3({
  overlay,
  headerEl,
  contentEl,
  challenge,
  date,
  time,
  participants,
  name,
}) {
  headerEl.innerHTML = `Book: ${challenge.title}`;
  contentEl.innerHTML = `
    ${formatStepHeader(3, "Done")}
    <div class="booking-success">
      Thank you ${name}! Your booking for <strong>${challenge.title}</strong>
      on <strong>${date}</strong> at <strong>${time}</strong> with
      <strong>${participants}</strong> participants has been registered.
    </div>
    <div class="booking-buttons">
      <button id="booking-close-final" class="booking-button-primary">Close</button>
    </div>
  `;

  const closeBtn = contentEl.querySelector("#booking-close-final");
  closeBtn.addEventListener("click", () => {
    overlay.classList.add("booking-hidden");
  });
}

async function findChallengeForCard(card) {
  const titleEl = card.querySelector(".roomTitle");
  if (!titleEl) return null;

  const rawTitle = titleEl.textContent || "";
  const title = rawTitle.split("(")[0].trim();

  const challenges = await fetchAllChallenges();
  return challenges.find((ch) => ch.title === title) || null;
}

document.addEventListener("DOMContentLoaded", () => {
  const { overlay, header: headerEl, content: contentEl } = createOverlay();

  document.addEventListener("click", async (event) => {
    const button = event.target.closest(".cardBtn");
    if (!button) return;

    const card = button.closest(".card");
    if (!card) return;

    try {
      const challenge = await findChallengeForCard(card);
      if (!challenge) {
        alert("Could not find this challenge in API.");
        return;
      }

      overlay.classList.remove("booking-hidden");

      const state = { challenge };

      const goToStep1 = () => {
        showStep1({
          overlay,
          headerEl,
          contentEl,
          challenge,
          onNext: ({ date, availableTimes }) => {
            state.date = date;
            state.availableTimes = availableTimes;
            goToStep2();
          },
        });
      };

      const goToStep2 = () => {
        showStep2({
          overlay,
          headerEl,
          contentEl,
          challenge,
          date: state.date,
          availableTimes: state.availableTimes,
          onBack: goToStep1,
          onNext: ({ time, participants, name, email }) => {
            state.time = time;
            state.participants = participants;
            state.name = name;
            state.email = email;
            goToStep3();
          },
        });
      };

      const goToStep3 = () => {
        showStep3({
          overlay,
          headerEl,
          contentEl,
          challenge,
          date: state.date,
          time: state.time,
          participants: state.participants,
          name: state.name,
        });
      };

      goToStep1();
    } catch (err) {
      console.error(err);
      alert("Something went wrong when starting booking.");
    }
  });
});