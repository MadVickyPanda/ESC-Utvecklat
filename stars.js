document.addEventListener("DOMContentLoaded", () => {

    let ratingMin = 0;
    let ratingMax = 5;

    const minStars = document.getElementById("ratingX");
    const maxStars = document.getElementById("ratingY");
    const resetBtn = document.getElementById("resetRating"); // reset button i HTML

    // Aktivera hover och klicka för att välja stjärna
    function activateStars(container, setValue) {
        if (!container) return;
        const stars = container.querySelectorAll("img");
        let currentRating = 0; // lagra vald rating

        stars.forEach((star, i) => {

            // hover highlight
            star.addEventListener("mouseenter", () => {
                stars.forEach((s, j) => {
                    s.src = j <= i ? "img/images/Star 4.svg" : "img/images/Star 5.svg";
                });
            });

            // Klicka för att välja rating
            star.addEventListener("click", () => {
                currentRating = i + 1;
                stars.forEach((s, j) => {
                    s.src = j < currentRating ? "img/images/Star 4.svg" : "img/images/Star 5.svg";
                });
                setValue(currentRating);
                filterCardsByRating();
            });
        });

        // Återställ den valda betygsstjärnan när musen lämnar
        container.addEventListener("mouseleave", () => {
            stars.forEach((s, j) => {
                s.src = j < currentRating ? "img/images/Star 4.svg" : "img/images/Star 5.svg";
            });
        });
    }

    // Aktivera min and max stars
    activateStars(minStars, val => ratingMin = val);
    activateStars(maxStars, val => ratingMax = val);

    // filter funktion
    function filterCardsByRating() {
        const cards = document.querySelectorAll("#cards-container .card");
        let anyVisible = false;

        cards.forEach(card => {
            const rating = Number(card.dataset.rating || 0);
            if (rating >= ratingMin && rating <= ratingMax) {
                card.style.display = "";
                anyVisible = true;
            } else {
                card.style.display = "none";
            }
        });

        const noMatch = document.getElementById("noMatchMessage");
        if (noMatch) noMatch.style.display = anyVisible ? "none" : "block";
    }

    // reset button funktion
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            // reset ratings
            ratingMin = 0;
            ratingMax = 5;

            // reset star visuals
            minStars.querySelectorAll("img").forEach(s => s.src = "img/images/Star 5.svg");
            maxStars.querySelectorAll("img").forEach(s => s.src = "img/images/Star 5.svg");

            // Visa alla kort
            const cards = document.querySelectorAll("#cards-container .card");
            cards.forEach(card => card.style.display = "");

            // göm "no match found"
            const noMatch = document.getElementById("noMatchMessage");
            if (noMatch) noMatch.style.display = "none";
        });
    }

});
