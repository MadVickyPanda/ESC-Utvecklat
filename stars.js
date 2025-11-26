document.addEventListener("DOMContentLoaded", () => {

    let ratingMin = 0;
    let ratingMax = 5;

    const minStars = document.getElementById("ratingX");
    const maxStars = document.getElementById("ratingY");
    const resetBtn = document.getElementById("resetRating"); // We'll add this in HTML

    function activateStars(container, setValue) {
        if (!container) return;
        const stars = container.querySelectorAll("img");

        stars.forEach((star, i) => {
            star.addEventListener("click", () => {

                // highlight stars
                stars.forEach((s, j) => {
                    s.src = j <= i ? "img/images/Star 4.svg" : "img/images/Star 5.svg";
                });

                setValue(i + 1);

                // filter cards
                filterCardsByRating();
            });
        });
    }

    // attach click events to min/max stars
    activateStars(minStars, val => ratingMin = val);
    activateStars(maxStars, val => ratingMax = val);

    // function to filter cards
    function filterCardsByRating() {
        const cards = document.querySelectorAll("#cards-container .card");
        let anyVisible = false;

        cards.forEach(card => {
            const rating = Number(card.dataset.rating || 0);
            if (rating >= ratingMin && rating <= ratingMax) {
                card.style.display = ""; // show
                anyVisible = true;
            } else {
                card.style.display = "none"; // hide
            }
        });

        // show/hide "No match found"
        const noMatch = document.getElementById("noMatchMessage");
        if (noMatch) {
            noMatch.style.display = anyVisible ? "none" : "block";
        }
    }

    // reset function
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            // reset min/max rating
            ratingMin = 0;
            ratingMax = 5;

            // reset star visuals
            minStars.querySelectorAll("img").forEach(s => s.src = "img/images/Star 5.svg");
            maxStars.querySelectorAll("img").forEach(s => s.src = "img/images/Star 5.svg");

            // show all cards
            const cards = document.querySelectorAll("#cards-container .card");
            cards.forEach(card => card.style.display = "");

            // hide "No match found"
            const noMatch = document.getElementById("noMatchMessage");
            if (noMatch) noMatch.style.display = "none";
        });
    }

});
