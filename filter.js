const cardsContainer = document.getElementById('cards-container');
const tags = ['web', 'linux', 'cryptography', 'coding', 'someother', 'finaltag'];
let activeTags = [];

tags.forEach(tagId => {
    const btn = document.getElementById(tagId);
    if (btn) {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
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


        try {
            labels = JSON.parse(labels);
        } catch {
            labels = labels.split(',').map(l => l.trim());
        }

        const matchesAllTags = activeTags.every(tag => labels.includes(tag));
        card.style.display = matchesAllTags || activeTags.length === 0 ? '' : 'none';
    });
}
