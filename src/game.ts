import '/src/scss/base/main.scss';
import '/src/scss/pages/game.scss';

init();

function init() {
    const fieldRef = document.getElementById('field');
    if (!fieldRef) {
        return;
    }

    fieldRef.addEventListener('click', (e) => {
        const card = (e.target as HTMLElement).closest('.card') as HTMLButtonElement | null;
        if (card) {
            card.classList.toggle('is-flipped');
        }
    });
}
