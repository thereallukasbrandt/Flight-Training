'use strict';

// Add teaching content here when a lesson is ready. Both stall types share one entry.
const lessons = [
  { title: 'Steep Turns', description: 'A dedicated space to unpack the maneuver, explore it visually, and bring the pieces together.', type: 'AIRWORK', art: 'steep' },
  { title: 'Power-On / Power-Off Stalls', description: 'One combined lesson for power-on and power-off stalls, with room to explore each and compare them.', type: 'COMBINED LESSON', art: 'stalls' },
  { title: 'Power-Off 180', description: 'A dedicated space for the briefing, an interactive visualization, and a guided scenario debrief.', type: 'PRECISION MANEUVER', art: 'landing' },
  { title: 'Eights on Pylons', description: 'A dedicated space to take the figure-eight apart and build a visual understanding of the maneuver.', type: 'GROUND REFERENCE', art: 'pylons' },
  { title: 'Dutch Rolls', description: 'A dedicated space for a closer look at the maneuver through a briefing, visualization, and debrief.', type: 'AIRWORK', art: 'rolls' },
  { title: 'Turns Around a Point', description: 'A dedicated space to explore the maneuver, connect the details, and work through a scenario.', type: 'GROUND REFERENCE', art: 'point' }
];

// Decorative card motifs, not flight paths or training diagrams.
const artwork = {
  steep: '<ellipse cx="160" cy="66" rx="94" ry="34" transform="rotate(-15 160 66)"/><ellipse cx="160" cy="66" rx="65" ry="22" transform="rotate(-15 160 66)" opacity=".25"/><path d="m215 30 25 3-11 5-5 12Z" fill="#83efd1"/><path d="M160 15v101" stroke-dasharray="3 6" opacity=".2"/>',
  stalls: '<path d="M45 91c40 0 56-53 89-53 27 0 20 50 47 50 38 0 45-42 92-42"/><path d="m128 37 17 4-8 6-3 9Z" fill="#83efd1"/><path d="M45 106h228M45 18v88" opacity=".2"/><path d="M134 43v63M182 88v18" stroke-dasharray="3 6" opacity=".3"/>',
  landing: '<path d="M78 33h96c62 0 62 61 0 61h-56" stroke-dasharray="5 5"/><path d="m131 94 11-5-3 5 3 5Z" fill="#83efd1"/><rect x="48" y="80" width="58" height="27" rx="1"/><path d="M53 93h48M56 85v16M99 85v16" opacity=".5"/><path d="M45 116h229" opacity=".15"/>',
  pylons: '<path d="M64 65c0-54 65-50 96 0s96 54 96 0-65-50-96 0-96 54-96 0Z"/><circle cx="105" cy="65" r="4" fill="#83efd1"/><circle cx="215" cy="65" r="4" fill="#83efd1"/><path d="M105 40v50M215 40v50" stroke-dasharray="3 5" opacity=".2"/>',
  rolls: '<path d="M38 68c28-56 53-56 81 0s53 56 81 0 53-56 81 0"/><path d="M38 68h244" stroke-dasharray="3 6" opacity=".3"/><path d="m148 58 28 20m-14-16-10 14" stroke-width="2"/><circle cx="162" cy="68" r="3" fill="#83efd1"/>',
  point: '<ellipse cx="160" cy="66" rx="80" ry="43"/><circle cx="160" cy="66" r="5" fill="#83efd1"/><path d="M160 19v94M71 66h178" stroke-dasharray="3 7" opacity=".2"/><path d="m230 39 13 8-9 1-3 8Z" fill="#83efd1"/><path d="M160 66 231 47" stroke-dasharray="3 6" opacity=".35"/>'
};

const cards = document.getElementById('cards');
const search = document.getElementById('search');
const dialog = document.getElementById('lesson-dialog');
let lastTrigger = null;

function renderLessons() {
  const query = search.value.trim().toLowerCase();
  const visible = lessons.map((lesson, index) => ({ ...lesson, index }))
    .filter(lesson => `${lesson.title} ${lesson.type} ${lesson.description}`.toLowerCase().includes(query));
  cards.replaceChildren();
  for (const lesson of visible) {
    const number = String(lesson.index + 1).padStart(2, '0');
    const article = document.createElement('article');
    article.className = 'card';
    article.innerHTML = `<div class="card-visual" aria-hidden="true"><span class="code">M / ${number}</span><svg viewBox="0 0 320 130" fill="none" stroke="#83efd1" stroke-width="1.3">${artwork[lesson.art]}</svg></div><div class="card-content"><div class="card-top"><span class="category">Maneuvers</span><span class="status">PLANNED</span></div><h3></h3><p></p><div class="card-bottom"><span>${lesson.type}</span><button data-index="${lesson.index}">Preview lesson <span aria-hidden="true">→</span></button></div></div>`;
    article.querySelector('h3').textContent = lesson.title;
    article.querySelector('.card-content > p').textContent = lesson.description;
    article.querySelector('button').setAttribute('aria-label', `Preview ${lesson.title}`);
    cards.append(article);
  }
  if (!visible.length) {
    const message = document.createElement('p');
    message.className = 'empty';
    message.textContent = 'No matching maneuvers. Try another search or clear the search field.';
    cards.append(message);
  }
  document.getElementById('lesson-count').textContent = `${String(visible.length).padStart(2, '0')} lesson spaces / Content coming soon`;
}

search.addEventListener('input', renderLessons);
cards.addEventListener('click', event => {
  const trigger = event.target.closest('button[data-index]');
  if (!trigger) return;
  const lesson = lessons[Number(trigger.dataset.index)];
  lastTrigger = trigger;
  document.getElementById('dialog-title').textContent = lesson.title;
  document.getElementById('dialog-category').textContent = `Maneuvers / M${String(Number(trigger.dataset.index) + 1).padStart(2, '0')}`;
  document.getElementById('dialog-description').textContent = lesson.description;
  dialog.showModal();
  document.body.classList.add('modal-open');
});
dialog.querySelectorAll('.close, .close-lesson').forEach(button => button.addEventListener('click', () => dialog.close()));
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  lastTrigger?.focus();
});

const menu = document.querySelector('.menu');
const nav = document.getElementById('navlinks');
function closeMenu() {
  nav.classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
}
menu.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav.classList.contains('open')) {
    closeMenu();
    menu.focus();
  }
});

// Scroll-linked photographic parallax. Only schedule work when input changes.
const hero = document.querySelector('.hero-scroll');
const sticky = document.querySelector('.hero-sticky');
const raptor = document.getElementById('raptor-image');
const cloudOne = document.querySelector('.cloud-one');
const cloudTwo = document.querySelector('.cloud-two');
const ring = document.querySelector('.scene-ring');
const progressBar = document.getElementById('scene-progress');
const phase = document.getElementById('scene-phase');
const motionButton = document.getElementById('motion-toggle');
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
let motionPaused = motionPreference.matches;
let frozenProgress = 0;
let displayedProgress = 0;
let framePending = false;
let currentPhase = -1;
const phases = ['01 / EXPLORE', '02 / VISUALIZE', '03 / APPLY'];

function renderScene() {
  framePending = false;
  const distance = Math.max(1, hero.offsetHeight - sticky.offsetHeight);
  const progress = Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / distance));
  const nextPhase = Math.min(2, Math.floor(progress * 3));
  if (nextPhase !== currentPhase) {
    phase.textContent = phases[nextPhase];
    currentPhase = nextPhase;
  }
  progressBar.style.transform = `scaleX(${progress})`;
  const p = motionPaused ? frozenProgress : progress;
  displayedProgress = p;
  const mobile = window.innerWidth <= 760;
  const horizontal = mobile ? 4 - p * 7 : 1 - p * 10;
  const vertical = mobile ? -p * 5 : -p * 7;
  const roll = -10 + p * 29;
  const yaw = -9 + p * 22;
  const scale = 1.02 + p * (mobile ? 0.06 : 0.14);
  raptor.style.transform = `translate3d(${horizontal}%, ${vertical}%, 0) rotate(${roll}deg) rotateY(${yaw}deg) scale(${scale})`;
  cloudOne.style.transform = `translate3d(${-p * 60}px, ${p * 70}px, 0)`;
  cloudTwo.style.transform = `translate3d(${p * 80}px, ${-p * 50}px, 0)`;
  ring.style.transform = `rotate(${-p * 35}deg) scale(${1 + p * 0.08})`;
}
function scheduleScene() {
  if (framePending) return;
  framePending = true;
  requestAnimationFrame(renderScene);
}
function updateMotionButton() {
  motionButton.setAttribute('aria-pressed', String(motionPaused));
  motionButton.textContent = motionPaused ? 'Enable motion' : 'Pause motion';
  scheduleScene();
}
motionButton.addEventListener('click', () => {
  if (!motionPaused) frozenProgress = displayedProgress;
  motionPaused = !motionPaused;
  updateMotionButton();
});
motionPreference.addEventListener('change', event => {
  frozenProgress = 0;
  motionPaused = event.matches;
  updateMotionButton();
});
window.addEventListener('scroll', scheduleScene, { passive: true });
window.addEventListener('resize', scheduleScene, { passive: true });
window.addEventListener('pageshow', scheduleScene);
updateMotionButton();
renderLessons();
