import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createScene, fitCamera } from './scene.js';

const PLAY_SVG  = `<polygon points="0,0 10,6 0,12"/>`;
const PAUSE_SVG = `<rect x="1" y="0" width="3" height="12"/><rect x="6" y="0" width="3" height="12"/>`;

const loaderEl  = document.getElementById('loader');
const progEl    = document.getElementById('prog');
const subEl     = document.getElementById('loader-sub');
const scrubber  = document.getElementById('scrubber');
const timeLabel = document.getElementById('time-label');
const playBtn   = document.getElementById('play-btn');
const playIcon  = document.getElementById('play-icon');
const seqLabel  = document.getElementById('seq-label');

const canvas = document.createElement('canvas');
document.getElementById('app').appendChild(canvas);

const { renderer, scene, camera, controls } = createScene(canvas);

const clock  = new THREE.Clock();
const loader = new GLTFLoader();

let current   = null;
let mixer     = null;
let action    = null;
let duration  = 0;
let playing   = true;
let scrubbing = false;

function loadSequence(n) {
  loaderEl.classList.remove('hidden');
  progEl.style.width = '0%';
  subEl.textContent  = `séquence ${n}…`;
  seqLabel.textContent = String(n).padStart(2, '0');

  if (current) { scene.remove(current); current = null; }
  if (mixer)   { mixer.stopAllAction(); mixer = null; action = null; }

  loader.load(
    `./seq_glb/${n}.glb`,
    (gltf) => {
      current = gltf.scene;

      current.traverse(obj => {
        if (obj.isMesh) {
          obj.castShadow    = true;
          obj.receiveShadow = true;
          if (obj.material?.color) obj.material.color.multiplyScalar(0.95);
        }
      });

      scene.add(current);
      fitCamera(camera, controls, current);

      if (gltf.animations?.length > 0) {
        mixer    = new THREE.AnimationMixer(current);
        action   = mixer.clipAction(gltf.animations[0]);
        duration = gltf.animations[0].duration;
        action.play();
        playing = true;
        playIcon.innerHTML = PAUSE_SVG;
        scrubber.max = duration;
      } else {
        duration = 0;
      }

      progEl.style.width = '100%';
      setTimeout(() => loaderEl.classList.add('hidden'), 300);
    },
    (xhr) => {
      if (xhr.total) progEl.style.width = (xhr.loaded / xhr.total * 100).toFixed(0) + '%';
    },
    (err) => {
      subEl.textContent = `Erreur : ${n}.glb introuvable.`;
      console.error(err);
    }
  );
}

playBtn.addEventListener('click', () => {
  if (!action) return;
  playing = !playing;
  action.paused = !playing;
  playIcon.innerHTML = playing ? PAUSE_SVG : PLAY_SVG;
});

scrubber.addEventListener('mousedown',  () => { scrubbing = true; });
scrubber.addEventListener('touchstart', () => { scrubbing = true; }, { passive: true });
window.addEventListener('mouseup',  () => { scrubbing = false; });
window.addEventListener('touchend', () => { scrubbing = false; });

scrubber.addEventListener('input', () => {
  if (!mixer || !action) return;
  mixer.setTime(parseFloat(scrubber.value));
  timeLabel.textContent = parseFloat(scrubber.value).toFixed(1) + 's';
});

document.querySelectorAll('.seq-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.seq-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadSequence(btn.dataset.seq);
  });
});

loadSequence('1');

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  if (mixer && playing && !scrubbing) {
    mixer.update(delta);
    if (duration > 0) {
      const t = mixer.time % duration;
      scrubber.value = t;
      timeLabel.textContent = t.toFixed(1) + 's';
    }
  }

  controls.update();
  renderer.render(scene, camera);
}
animate();
