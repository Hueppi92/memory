import '/src/scss/base/main.scss';
import '/src/scss/pages/start.scss';
import '/src/scss/components/_card.scss';





init()

function flipCard() {
    const fieldRef = document.getElementById('field')
    if(fieldRef) {
        fieldRef.addEventListener('click', e => {
          const card = (e.target as HTMLElement ) .closest('.card') as HTMLButtonElement
          if(card) {
            card.classList.toggle('is-flipped')
          }})
    }
}

function renderCards() {}

function init() {
    renderCards();
    flipCard();
}
