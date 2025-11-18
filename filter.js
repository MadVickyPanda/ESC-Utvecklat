// Select all cards
const cardsContainer = document.getElementById('cards-container');

// Tag buttons
const tags = ['web', 'linux', 'cryptography', 'coding', 'someother', 'finaltag'];

// Keep track of active tags
let activeTags = [];

tags.forEach(tagId => {
    const btn = document.getElementById(tagId);
    if (btn) {
        btn.addEventListener('click', () => {
            // Toggle active class
            btn.classList.toggle('active');

            // Update activeTags array
            activeTags = tags.filter(id => {
                const b = document.getElementById(id);
                return b && b.classList.contains('active');
            });

            filterCards();
        });
    }
});

function filterCards() {
    const cards = cardsContainer.querySelectorAll('.card');

    cards.forEach(card => {
        let labels = card.dataset.labels;

        if (!labels) {
            card.style.display = 'none';
            return;
        }

        // Parse labels
        try {
            labels = JSON.parse(labels);
        } catch {
            labels = labels.split(',').map(l => l.trim());
        }

        // Show card only if it has all active tags
        const matchesAllTags = activeTags.every(tag => labels.includes(tag));

        card.style.display = matchesAllTags || activeTags.length === 0 ? '' : 'none';
    });
}
