import { fetchChallenges } from "./API.js";

const hamburger = document.getElementById("hamburger");
const popupMenu = document.getElementById("popupMenu");
const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("closeBtn");
const cardsContainer = document.getElementById("cards-container");
const topThreeContainer = document.getElementById("top-three");
const footer = document.querySelector("footer");
footer.style.display = 'none';  
let allChallenges = []; // sparar alla för framtida filter/sortering om det behövs

//Startar ''applikationen'' vid webbsidans laddning
function startApp() {
  loadChallenges();
}

//laddar challenges från funktionen 'fetchChallenges' se "import"
function loadChallenges() {
  fetchChallenges()
    .then((challenges) => {
      allChallenges = challenges; // spara allt i en array

      if (topThreeContainer) {
        displayTopThree(allChallenges);
      }
      if (cardsContainer) {
        displayCards(allChallenges); //skickar data till display funtionen  
      }
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
      cardsContainer.innerHTML = "<p>Could not load challenges.</p>";
    });
}

function displayTopThree(challengesArray) {
  const topThreeContainer = document.getElementById("top-three");

  const topThreeChallenges = challengesArray.sort((a,b) => b.rating - a.rating).slice(0,3);

  topThreeContainer.innerHTML = "";

  topThreeChallenges.forEach((challenge) => {
    const card = createCard(challenge);
    topThreeContainer.appendChild(card);
  });
}

//DISPLAY FUNKTION
function displayCards(challengesArray) {
  cardsContainer.innerHTML = ""; // tömmer container innan det visas allt

  challengesArray.forEach((challenge) => {
    const card = createCard(challenge); //skapa varje kort
    cardsContainer.appendChild(card);
  });
}

//SKAPA KORT FUNKTION
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
  cardImage.src = data.image || "/img/images/hacker.png";
  cardImage.alt = `Image for ${data.title}`;
  cardImage.classList.add("imageCard");

  const container = document.createElement("div");
  container.classList.add("container");

  const cardTitle = document.createElement("h3");
  cardTitle.classList.add("roomTitle");
  cardTitle.textContent = `${data.title} (${data.type})`;

  //funktion specifikt för rating (kanske kan underlätta)
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
  bookButton.classList.add("cardBtn");
  bookButton.textContent = "Book this room";

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

// FUNKTION specifikt för rating-stars
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

document.addEventListener("DOMContentLoaded", function () {
  startApp(); 
});

//Kod för Filtrering med tags 
const tagIds = ["web", "linux", "cryptography", "coding", "someother", "finaltag"];
let activeTags = [];

// Click events för tag buttons
tagIds.forEach((tagId) => {
  const btn = document.getElementById(tagId);
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.preventDefault(); 
      btn.classList.toggle("active"); // toggle button style

      // Uppdaterad lista av aktiva taggar
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

// Funktion för att filtrera challenges baserad på activa tags 
function filterChallengesByTags() {
  if (activeTags.length === 0) {
    displayCards(allChallenges); // Visa alla om ingen tagg är aktiverad
    return;
  }

  const filtered = allChallenges.filter((challenge) => {
    let labels = challenge.labels || [];
    const labelsLower = labels.map((l) => l.toLowerCase());
    // Challenge måste innehålla alla aktiva taggar
    return activeTags.every((tag) => labelsLower.includes(tag));
  });

  displayCards(filtered); 
}

// Function för att filtrera challenges baserad på keyword
const searchinput = document.getElementById('typing');
const infoText = document.getElementById('info');
const infomessage = document.getElementById('infomessage');

infoText.textContent = "";
if (searchinput) {
    searchinput.addEventListener('keyup', e => {
        const currentvalue = e.target.value.trim().toLowerCase();
         const filtered = allChallenges.filter(challenge => {
         const title = String(challenge.title || '').toLowerCase();
            return title.includes(currentvalue);
        });

        displayCards(filtered);
        if(filtered.length === 0) {
             infomessage.style.display = 'block';    
             footer.style.display = 'block';  
             infoText.textContent = "No matching challenges";
    }
    else{
      footer.style.display = 'none';  
      infomessage.style.display = 'none';
 } });
        }