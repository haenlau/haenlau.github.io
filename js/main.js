// js/main.js

// 补全缺失的 DOM 引用（避免报错）
const logo = document.getElementById('logo');
const closeEgg = document.getElementById('closeEgg');

const originalVolume = 0.7;
let tapCount = 0;
let audioUnlocked = false;
let isFading = false;

const music = document.getElementById('backgroundMusic');
const btnMusic = document.getElementById('musicToggle');
const egg = document.getElementById('egg');
const title = document.getElementById('eggTitle');
const desc = document.getElementById('eggDesc');
const forYou = document.getElementById('for-you');

btnMusic.textContent = 'Play';

const now = Date.now();
const last = localStorage.getItem('lastVisit');
if (last && (now - Number(last)) < 3600000) {
  title.textContent = "You're back";
  desc.textContent = "The silence missed you";
}
localStorage.setItem('lastVisit', now.toString());

// 检查是否在 22:00 - 23:59 之间（你原逻辑是 hour === 22）
function showForYouIfNeeded() {
  const now = new Date();
  const hour = now.getHours();
  if (hour === 22) {
    forYou.classList.add('show');
  } else {
    forYou.classList.remove('show');
  }
}

showForYouIfNeeded();
setInterval(showForYouIfNeeded, 60000);

document.addEventListener('click', e => {
  if (e.target.closest('.easter-egg')) return;
  tapCount++;
  if (tapCount === 3) {
    egg.style.display = 'flex';
    egg.classList.remove('closing');
    tapCount = 0;
  } else if (tapCount > 3) tapCount = 0;
});

btnMusic.addEventListener('click', () => {
  if (!audioUnlocked) {
    const p = music.play();
    if (p) p.then(() => {
      audioUnlocked = true;
      music.volume = originalVolume;
      btnMusic.textContent = 'Pause';
    }).catch(() => alert('Please interact first to enable audio.'));
  } else {
    if (music.paused) {
      music.play();
      btnMusic.textContent = 'Pause';
    } else {
      music.pause();
      btnMusic.textContent = 'Play';
    }
  }
});

document.addEventListener('visibilitychange', () => {
  if (isFading) return;
  if (document.hidden && !music.paused) {
    isFading = true;
    fadeOut(music, () => {
      music.pause();
      isFading = false;
    });
  } else if (!document.hidden && audioUnlocked && music.paused) {
    isFading = true;
    music.play();
    fadeIn(music, originalVolume, () => isFading = false);
  }
});

logo.addEventListener('click', () => {
  logo.classList.remove('breathe');
  requestAnimationFrame(() => logo.classList.add('breathe'));
});

closeEgg.addEventListener('click', () => {
  egg.classList.add('closing');
  if (!music.paused) {
    fadeOut(music, () => {
      music.pause();
      btnMusic.textContent = 'Play';
    });
  }
  setTimeout(() => {
    egg.style.display = 'none';
    music.volume = originalVolume;
  }, 600);
});

function fadeOut(audio, onEnd) {
  let vol = audio.volume;
  const step = () => {
    vol = Math.max(0, vol - 0.05);
    audio.volume = vol;
    if (vol > 0) requestAnimationFrame(step);
    else onEnd?.();
  };
  requestAnimationFrame(step);
}

function fadeIn(audio, targetVol, onEnd) {
  audio.volume = 0;
  let vol = 0;
  const step = () => {
    vol = Math.min(targetVol, vol + 0.05);
    audio.volume = vol;
    if (vol < targetVol) requestAnimationFrame(step);
    else onEnd?.();
  };
  requestAnimationFrame(step);
}