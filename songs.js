
'use strict';

const songs = [
  {
    title:  'Reflections',
    artist: 'The Neighbourhoud',
    src:    'Audio/The Neighbourhood - Reflections (Official Audio).mp3',
    art:    'Audio/Cover/Reflections.jpg',
    note:   'Just the vibe',
  },
  {
    title:  'Noble',
    artist: 'F3miii',
    src:    'Audio/F3miii - NOBLE (Audio).mp3',
    art:    'Audio/Cover/Noble.jpg',
    note:   'Come closer',
  },
  {
    title:  'Careless Whisper',
    artist: 'George Michael',
    src:    'Audio/Careless Whisper.mp3',
    art:    'Audio/Cover/CarelessWhisper.jpg',
    note:   'My song',
  },
  {
    title:  'Heather',
    artist: 'Conan Gray',
    src:    'Audio/Conan Gray - Heather (Audio).mp3',
    art:    'Audio/Cover/Heather.jpg',
    note:   '3rd of December',
  },
  {
    title:  'Flights Booked',
    artist: 'Drake',
    src:    'Audio/Drake - Flights Booked (Audio).mp3',
    art:    'Audio/Cover/FlightsBooked.jpg',
    note:   'Distance between us',
  },
  {
    title:  'American Boy',
    artist: 'Estelle',
    src:    'Audio/American Boy.mp3',
    art:    'Audio/Cover/AmericanBoy.jpg',
    note:   'Someday',
  },
];


const audio        = document.getElementById('audio');
const playerArt    = document.getElementById('playerArt');
const artGlow      = document.getElementById('artGlow');
const playerTrack  = document.getElementById('playerTrack');
const playerArtist = document.getElementById('playerArtist');
const progress     = document.getElementById('progress');
const timeElapsed  = document.getElementById('timeElapsed');
const timeDuration = document.getElementById('timeDuration');
const playBtn      = document.getElementById('playBtn');
const playIcon     = document.getElementById('playIcon');
const prevBtn      = document.getElementById('prevBtn');
const nextBtn      = document.getElementById('nextBtn');

/* volume adjuster */
const volumeSlider = document.getElementById('volume');
audio.volume = 0.5; // default to 50% on load
volumeSlider.addEventListener('input', () => { audio.volume = volumeSlider.value; });

const trackList    = document.getElementById('tracklistItems');
const colorCanvas  = document.getElementById('colorSampler');
const colorCtx     = colorCanvas.getContext('2d');

let currentIndex = 0;
let isPlaying    = false;

/* Format pour tes music jF*/
function formatTime(secs) {
  if (isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/* Sample color pour lalbum */
function sampleAlbumColour(imgEl) {
  try {
    colorCanvas.width  = 8;
    colorCanvas.height = 8;
    colorCtx.drawImage(imgEl, 0, 0, 8, 8);
    const d = colorCtx.getImageData(0, 0, 8, 8).data;
    let r = 0, g = 0, b = 0, count = 0;
    for (let i = 0; i < d.length; i += 4) {
      r += d[i]; g += d[i + 1]; b += d[i + 2]; count++;
    }
    r = Math.round(r / count);
    g = Math.round(g / count);
    b = Math.round(b / count);
    const wash = `rgba(${r}, ${g}, ${b}, 0.28)`;
    document.body.style.setProperty('--album-wash', wash);
    artGlow.style.background = `radial-gradient(circle, rgba(${r},${g},${b},.45), transparent 70%)`;
  } catch (_) {
   
    document.body.style.setProperty('--album-wash', 'rgba(199, 87, 111, 0.2)');
  }
}

/* track list */
function buildTrackList() {
  songs.forEach((song, i) => {
    const li = document.createElement('li');
    li.className = 'track-item';
    li.setAttribute('role', 'button');
    li.setAttribute('tabindex', '0');
    li.setAttribute('aria-label', `Play ${song.title} by ${song.artist}`);
    li.dataset.index = i;

    li.innerHTML = `
      <img class="track-art" src="${song.art}" alt="${song.title} album art" crossorigin="anonymous" />
      <div class="track-info">
        <p class="track-title">${song.title}</p>
        <p class="track-artist">${song.artist}</p>
      </div>
      <span class="track-note">${song.note}</span>
    `;

    li.addEventListener('click', () => loadSong(i, true));
    li.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); loadSong(i, true); }
    });

    trackList.appendChild(li);
  });
}

/* update for active, kinda broken lol */
function updateTrackList() {
  document.querySelectorAll('.track-item').forEach((el, i) => {
    el.classList.toggle('active', i === currentIndex);
  });
}

/* song payload */
function loadSong(index, autoplay = false) {
  currentIndex = index;
  const song   = songs[index];

  playerTrack.textContent  = song.title;
  playerArtist.textContent = song.artist;
  audio.src                = song.src;

  // Art
  playerArt.style.opacity = '0';
  const tempImg = new Image();
  tempImg.crossOrigin = 'anonymous';
  tempImg.onload = () => {
    playerArt.src           = song.art;
    playerArt.style.opacity = '1';
    sampleAlbumColour(tempImg);
  };
  tempImg.onerror = () => {
    playerArt.src           = song.art;
    playerArt.style.opacity = '1';
  };
  tempImg.src = song.art;

  // Reset progress
  progress.value = 0;
  progress.style.setProperty('--prog', '0%');
  timeElapsed.textContent  = '0:00';
  timeDuration.textContent = '0:00';

  updateTrackList();

  if (autoplay) playSong();
  else          pauseSong();
}

/* play button */
function playSong() {
  audio.play().catch(() => {});
  isPlaying = true;
  playIcon.className = 'fa-solid fa-pause';
  playerArt.classList.add('playing');
}

/* pause button */
function pauseSong() {
  audio.pause();
  isPlaying = false;
  playIcon.className = 'fa-solid fa-play';
  playerArt.classList.remove('playing');
}

/* toggle play/pause */
function togglePlay() {
  if (isPlaying) pauseSong();
  else           playSong();
}

/* next/prev */
function nextSong() { loadSong((currentIndex + 1) % songs.length, isPlaying); }
function prevSong() { loadSong((currentIndex - 1 + songs.length) % songs.length, isPlaying); }

/* audio event */
audio.addEventListener('timeupdate', () => {
  if (audio.duration) {
    const pct = (audio.currentTime / audio.duration) * 100;
    progress.value = audio.currentTime;
    progress.style.setProperty('--prog', `${pct}%`);
    timeElapsed.textContent = formatTime(audio.currentTime);
  }
});

audio.addEventListener('loadedmetadata', () => {
  progress.max = audio.duration;
  timeDuration.textContent = formatTime(audio.duration);
});

audio.addEventListener('ended', () => nextSong());

/* not done, seek for audio */
progress.addEventListener('input', () => {
  audio.currentTime = progress.value;
  const pct = audio.duration ? (progress.value / audio.duration) * 100 : 0;
  progress.style.setProperty('--prog', `${pct}%`);
});

/* event when button */
playBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', nextSong);
prevBtn.addEventListener('click', prevSong);

/* initialise */
buildTrackList();
loadSong(0);

/* sparkles */
(() => {
  const canvas = document.getElementById('sparkles');
  const ctx    = canvas.getContext('2d');

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const PINK  = 'rgba(243, 179, 190,';
  const PETAL = 'rgba(199, 87, 111,';
  const DEEP  = 'rgba(122, 0, 37,';
  const WHITE = 'rgba(255, 248, 249,';

  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function rand(a, b) { return a + Math.random() * (b - a); }

  function createParticle() {
    const colors = [PINK, PETAL, DEEP, WHITE];
    return {
      x:            rand(0, W),
      y:            rand(H * .2, H),
      r:            rand(.8, 2.8),
      speed:        rand(.25, .75),
      opacity:      rand(.25, .8),
      drift:        rand(-.4, .4),
      color:        colors[Math.floor(Math.random() * colors.length)],
      twinkle:      rand(0, Math.PI * 2),
      twinkleSpeed: rand(.02, .06),
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: 55 }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (const p of particles) {
      p.twinkle += p.twinkleSpeed;
      const alpha = p.opacity * (.6 + .4 * Math.sin(p.twinkle));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `${p.color}${alpha.toFixed(2)})`;
      ctx.fill();
      p.y -= p.speed;
      p.x += p.drift;
      if (p.y < -10 || p.x < -10 || p.x > W + 10) {
        Object.assign(p, createParticle(), { y: H + 10 });
      }
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  init();
  draw();
})();
