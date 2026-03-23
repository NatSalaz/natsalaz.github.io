import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const PLAY_SVG = `<polygon points="0,0 10,6 0,12"/>`;
const PAUSE_SVG = `<rect x="1" y="0" width="3" height="12"/><rect x="6" y="0" width="3" height="12"/>`;

const loaderEl = document.getElementById('loader');
const progEl = document.getElementById('prog');
const subEl = document.getElementById('loader-sub');
const scrubber = document.getElementById('scrubber');
const timeLabel = document.getElementById('time-label');
const playBtn = document.getElementById('play-btn');
const playIcon = document.getElementById('play-icon');
const seqLabel = document.getElementById('seq-label');

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4;
document.getElementById('app').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x06100f);
scene.fog = new THREE.FogExp2(0x06100f, 0.05);

const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.01, 100);
camera.position.set(0, 1.2, 4.5);

scene.add(new THREE.AmbientLight(0xffffff, 1.8));

const key = new THREE.DirectionalLight(0xffffff, 4.0);
key.position.set(3, 6, 4);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
scene.add(key);

const fill = new THREE.DirectionalLight(0xaaddff, 1.5);
fill.position.set(-4, 3, 2);
scene.add(fill);

const back = new THREE.DirectionalLight(0xffffff, 1.0);
back.position.set(0, 3, -4);
scene.add(back);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(12, 12),
  new THREE.MeshStandardMaterial({ color: 0x0a1e1c, roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const grid = new THREE.GridHelper(12, 24, 0x1a3a36, 0x0f2420);
grid.position.y = 0.001;
scene.add(grid);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 1;
controls.maxDistance = 20;
controls.target.set(0, 0.9, 0);
controls.update();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();
const loader = new GLTFLoader();

let current = null;
let mixer = null;
let action = null;
let duration = 0;
let playing = true;
let scrubbing = false;

function fitCamera(object) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  object.position.x -= center.x;
  object.position.z -= center.z;

  const fov = camera.fov * (Math.PI / 180);
  const dist = (Math.max(size.x, size.y, size.z) / (2 * Math.tan(fov / 2))) * 1.6;

  camera.position.set(0, size.y * 0.55, dist);
  controls.target.set(0, size.y * 0.45, 0);
  controls.update();
}

function loadSequence(n) {
  loaderEl.classList.remove('hidden');
  progEl.style.width = '0%';
  subEl.textContent = `séquence ${n}…`;
  seqLabel.textContent = String(n).padStart(2, '0');

  if (current) { scene.remove(current); current = null; }
  if (mixer) { mixer.stopAllAction(); mixer = null; action = null; }

  loader.load(
    `./seq_glb/${n}.glb`,
    (gltf) => {
      current = gltf.scene;

      current.traverse(obj => {
        if (obj.isMesh) {
          obj.castShadow = true;
          obj.receiveShadow = true;
        }
      });

      scene.add(current);
      fitCamera(current);

      if (gltf.animations?.length > 0) {
        mixer = new THREE.AnimationMixer(current);
        action = mixer.clipAction(gltf.animations[0]);
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

scrubber.addEventListener('mousedown', () => { scrubbing = true; });
scrubber.addEventListener('touchstart', () => { scrubbing = true; }, { passive: true });
window.addEventListener('mouseup', () => { scrubbing = false; });
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