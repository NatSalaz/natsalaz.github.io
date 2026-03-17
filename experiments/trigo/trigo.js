const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const slider = document.getElementById('slider');

let W, H, CX, CY, R;
let useRadians = false;
const degBtn = document.getElementById("degBtn");
const radBtn = document.getElementById("radBtn");

degBtn.onclick = () => {
  useRadians = false;
  degBtn.classList.add("active");
  radBtn.classList.remove("active");
  updateSliderLabels();
  draw(angleDeg);
};

radBtn.onclick = () => {
  useRadians = true;
  radBtn.classList.add("active");
  degBtn.classList.remove("active");
  updateSliderLabels();
  draw(angleDeg);
};
function resizeCanvas() {

  const wrap = document.getElementById("wrap");
  const rect = wrap.getBoundingClientRect();

  const size = Math.min(rect.width, rect.height);

  const dpr = window.devicePixelRatio || 1;

  canvas.width = size * dpr;
  canvas.height = size * dpr;

  canvas.style.width = size + "px";
  canvas.style.height = size + "px";

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  W = size;
  H = size;

  CX = W / 2;
  CY = H / 2;

  R = W * 0.38;

}

window.addEventListener("resize", () => {
  resizeCanvas();
  draw(angleDeg);
});

resizeCanvas();
let angleDeg = 0;
let dragging = false;

//Colours
const COL = {
  grid: '#dddddd',
  axis: '#aaaaaa',
  unit: '#aaaaaa',
  cos: '#1a56db',
  sin: '#e02020',
  tan: '#18a558',
  angle: '#000000',
  point: '#1a1a2e',
};

//Visibility state
const show = {
  cos: true,
  sin: true,
  tan: true,
  angle: true,
  grid: true,
};
//Wire checkboxes
['cos', 'sin', 'tan', 'angle', 'grid'].forEach(key => {
  const chk = document.getElementById('chk' + key.charAt(0).toUpperCase() + key.slice(1));
  chk.addEventListener('change', () => {
    show[key] = chk.checked;
    //Dim corresponding value card
    const card = document.getElementById('card' + key.charAt(0).toUpperCase() + key.slice(1));
    if (card) card.classList.toggle('hidden', !chk.checked);
    draw(angleDeg);
  });
});
function toRad(d) { return d * Math.PI / 180; }
function fmt(v) {
  return Math.abs(v) < 1e-10 ? '0.0000' : v.toFixed(4);
}
function fmtRad(d) {
  const table = [[0, '0'], [30, 'π/6'], [45, 'π/4'], [60, 'π/3'], [90, 'π/2'],
  [120, '2π/3'], [135, '3π/4'], [150, '5π/6'], [180, 'π'],
  [210, '7π/6'], [225, '5π/4'], [240, '4π/3'], [270, '3π/2'],
  [300, '5π/3'], [315, '7π/4'], [330, '11π/6'], [360, '2π']];
  for (const [deg, label] of table)
    if (Math.abs(d - deg) < 0.6) return label + ' rad';
  return toRad(d).toFixed(4) + ' rad';
}
function updateSliderLabels() {

  if (useRadians) {

    document.getElementById("lblStart").textContent = "0";
    document.getElementById("lbl90").textContent = "π/2";
    document.getElementById("lbl180").textContent = "π";
    document.getElementById("lbl270").textContent = "3π/2";
    document.getElementById("lbl360").textContent = "2π";

  } else {

    document.getElementById("lblStart").textContent = "0°";
    document.getElementById("lbl90").textContent = "90°";
    document.getElementById("lbl180").textContent = "180°";
    document.getElementById("lbl270").textContent = "270°";
    document.getElementById("lbl360").textContent = "360°";

  }

}
//Draw 
function draw(deg) {
  ctx.clearRect(0, 0, W, H);
  const rad = toRad(deg);
  const cosVal = Math.cos(rad);
  const sinVal = Math.sin(rad);
  //tan is undefined ONLY at exactly 90° and 270° (within half a slider step).
  //Use sinVal/cosVal for correct computation everywhere else.
  const degMod180 = ((deg % 180) + 180) % 180;   //in [0, 180)
  const isExactPole = Math.abs(degMod180 - 90) < 0.26;
  const tanVal = isExactPole ? NaN : sinVal / cosVal;
  //Point on unit circle (canvas coords)
  const px = CX + R * cosVal;
  const py = CY - R * sinVal;
  //Tangent line anchor: x = CX + R (right edge of circle)
  const TX = CX + R;               //x of the tangent line (canvas)
  //Grid 
  if (show.grid) {
    ctx.strokeStyle = COL.grid;
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    for (let r = R / 4; r <= R; r += R / 4) {
      ctx.beginPath(); ctx.arc(CX, CY, r, 0, Math.PI * 2); ctx.stroke();
    }
    for (let a = 0; a < 360; a += 30) {
      const rr = toRad(a);
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.lineTo(CX + R * Math.cos(rr), CY - R * Math.sin(rr));
      ctx.stroke();
    }
  }
  //Axes 
  ctx.strokeStyle = COL.axis;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([]);
  //x
  ctx.beginPath(); ctx.moveTo(20, CY); ctx.lineTo(W - 20, CY); ctx.stroke();
  //y
  ctx.beginPath(); ctx.moveTo(CX, 20); ctx.lineTo(CX, H - 20); ctx.stroke();
  //Arrowheads
  function arrowR(x, y) {
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 7, y - 4); ctx.lineTo(x - 7, y + 4);
    ctx.closePath(); ctx.fillStyle = COL.axis; ctx.fill();
  }
  function arrowU(x, y) {
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 4, y + 7); ctx.lineTo(x + 4, y + 7);
    ctx.closePath(); ctx.fillStyle = COL.axis; ctx.fill();
  }
  arrowR(W - 20, CY); arrowU(CX, 20);
  //Axis labels
  ctx.fillStyle = COL.axis;
  ctx.font = '13px DM Mono, monospace';
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('x', W - 16, CY + 4);
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('y', CX + 6, 24);
  //Degree labels every 30°
  if (show.grid) {
    ctx.fillStyle = '#505050';
    ctx.font = '9px DM Mono, monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    let lbls;

    if (useRadians) {

      lbls = {
        3: '0=2π',
        30: 'π/6',
        45: 'π/4',
        60: 'π/3',
        93: 'π/2',
        120: '2π/3',
        135: '3π/4',
        150: '5π/6',
        177: 'π',
        210: '7π/6',
        225: '5π/4',
        240: '4π/3',
        266: '3π/2',
        300: '5π/3',
        315: '7π/4',
        330: '11π/6',
      };

    } else {

      lbls = {
        3: '0',
        30: '30°',
        45: '45°',
        60: '60°',
        93: '90°',
        120: '120°',
        135: '135°',
        150: '150°',
        177: '180°',
        210: '210°',
        225: '225°',
        240: '240°',
        266: '270°',
        300: '300°',
        315: '315°',
        330: '330°'
      };

    }
    for (const [a, label] of Object.entries(lbls)) {
      const rr = toRad(Number(a));
      ctx.fillText(label, CX + (R + 16) * Math.cos(rr), CY - (R + 16) * Math.sin(rr));
    }
  }
  //Unit circle 
  ctx.strokeStyle = COL.unit;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([]);
  ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2); ctx.stroke();
  //1 label on x-axis 
  ctx.fillStyle = '#aab0cc';
  ctx.font = '10px DM Mono, monospace';
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillText('1', TX, CY + 4);
  if (show.tan) {
    //Prolongement du rayon au-delà de P, en pointillé vert 
    {
      let dx = cosVal, dy = -sinVal;
      //invert extension between ]90° ; 270°
      if (deg > 90 && deg < 270) {
        dx = -dx;
        dy = -dy;
      }
      //t pour aller de P jusqu'au bord du canvas
      let tMax = 1e6;
      if (Math.abs(dx) > 1e-9) tMax = Math.min(tMax, dx > 0 ? (W - 10 - px) / dx : (10 - px) / dx);
      if (Math.abs(dy) > 1e-9) tMax = Math.min(tMax, dy > 0 ? (H - 10 - py) / dy : (10 - py) / dy);
      tMax = Math.max(0, tMax);
      ctx.strokeStyle = COL.tan;
      ctx.lineWidth = 1.8;
      ctx.setLineDash([6, 5]);
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + tMax * dx, py + tMax * dy);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.setLineDash([]);
    }
    ctx.strokeStyle = COL.tan;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    ctx.globalAlpha = 0.20;
    ctx.beginPath();
    ctx.moveTo(TX, 10);
    ctx.lineTo(TX, H - 10);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.setLineDash([]);
    //Droite passant par O et P, étendue à l'infini 
    //Direction : (cosVal, -sinVal) en coords canvas
    //On cherche le t max pour sortir du canvas
    const dx = cosVal, dy = -sinVal;
    let tPos = 1e6, tNeg = 1e6;
    if (Math.abs(dx) > 1e-9) {
      tPos = Math.min(tPos, (W - 10 - CX) / dx, (10 - CX) / dx);
      tNeg = Math.min(tNeg, (W - 10 - CX) / -dx, (10 - CX) / -dx);
    }
    if (Math.abs(dy) > 1e-9) {
      tPos = Math.min(tPos, (H - 10 - CY) / dy, (10 - CY) / dy);
      tNeg = Math.min(tNeg, (H - 10 - CY) / -dy, (10 - CY) / -dy);
    }
    tPos = Math.max(0, tPos); tNeg = Math.max(0, tNeg);
    ctx.strokeStyle = COL.tan;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 5]);
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.moveTo(CX - tNeg * dx, CY - tNeg * dy);
    ctx.lineTo(CX + tPos * dx, CY + tPos * dy);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.setLineDash([]);
    //Segment tan : de (1,0) → (1, tan θ) 
    if (!isExactPole) {
      const TY = CY - R * tanVal;
      const clampedTY = Math.max(15, Math.min(H - 15, TY));
      const isClamped = Math.abs(TY - clampedTY) > 1;
      ctx.strokeStyle = COL.tan;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.moveTo(TX, CY);
      ctx.lineTo(TX, clampedTY);
      ctx.stroke();
      if (isClamped) {
        const dir = TY < CY ? -1 : 1;
        ctx.fillStyle = COL.tan;
        ctx.beginPath();
        ctx.moveTo(TX, clampedTY);
        ctx.lineTo(TX - 7, clampedTY - dir * 12);
        ctx.lineTo(TX + 7, clampedTY - dir * 12);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      //Point d'intersection
      ctx.fillStyle = COL.tan;
      ctx.beginPath();
      ctx.arc(TX, clampedTY, 5, 0, Math.PI * 2);
      ctx.fill();
      //Label "tan"
      ctx.fillStyle = COL.tan;
      ctx.font = 'italic 10px DM Mono, monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText('tan', TX + 8, (CY + clampedTY) / 2);
    }
  }
  //COSINUS 
  if (show.cos) {
    //Dashed drop to x-axis
    ctx.strokeStyle = COL.cos;
    ctx.lineWidth = 1.3;
    ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, CY); ctx.stroke();
    ctx.setLineDash([]);
    //Solid segment on x-axis
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(CX, CY); ctx.lineTo(px, CY); ctx.stroke();
    //Dots
    ctx.fillStyle = COL.cos;
    ctx.beginPath(); ctx.arc(px, CY, 4, 0, Math.PI * 2); ctx.fill();
    //Label
    ctx.fillStyle = COL.cos;
    ctx.font = 'italic 10px DM Mono, monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    if (Math.abs(px - CX) > 18)
      ctx.fillText('cos', CX + (px - CX) / 2, CY + 5);
  }
  //SINUS 
  if (show.sin) {
    //Dashed drop to y-axis
    ctx.strokeStyle = COL.sin;
    ctx.lineWidth = 1.3;
    ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(CX, py); ctx.stroke();
    ctx.setLineDash([]);
    //Solid segment on y-axis
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(CX, CY); ctx.lineTo(CX, py); ctx.stroke();
    //Dot
    ctx.fillStyle = COL.sin;
    ctx.beginPath(); ctx.arc(CX, py, 4, 0, Math.PI * 2); ctx.fill();
    //Label
    ctx.fillStyle = COL.sin;
    ctx.font = 'italic 10px DM Mono, monospace';
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    if (Math.abs(py - CY) > 18)
      ctx.fillText('sin', CX - 5, CY + (py - CY) / 2);
  }
  //Arc d'angle 
  if (show.angle) {
    ctx.strokeStyle = COL.angle;
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(CX, CY, 30, 0, -rad, rad > 0);
    ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.moveTo(CX, CY);
    ctx.arc(CX, CY, 28, 0, -rad, rad > 0);
    ctx.closePath();
    ctx.fill();
    //θ label
    const midRad = -rad / 2;
    ctx.fillStyle = COL.angle;
    ctx.font = 'italic 11px DM Mono, monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('θ', CX + 40 * Math.cos(midRad), CY + 40 * Math.sin(midRad));
  }
  //Radius line 
  ctx.strokeStyle = COL.angle;
  ctx.lineWidth = 2;
  ctx.setLineDash([]);
  ctx.beginPath(); ctx.moveTo(CX, CY); ctx.lineTo(px, py); ctx.stroke();
  //Point on circle 
  ctx.fillStyle = '#dce0f0';
  ctx.beginPath(); ctx.arc(px, py, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = COL.point;
  ctx.beginPath(); ctx.arc(px, py, 5.5, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
  //Update cards 
  if (useRadians) {
    document.getElementById('vAngleDeg').textContent =
      (toRad(deg)).toFixed(3) + " rad";
  } else {
    document.getElementById('vAngleDeg').textContent =
      Math.round(deg * 10) / 10 + "°";
  } if (useRadians) {
    document.getElementById('vAngleRad').textContent =
      (Math.round(deg * 10) / 10) + "°";
  } else {
    document.getElementById('vAngleRad').textContent =
      fmtRad(deg);
  } document.getElementById('vCos').textContent = fmt(cosVal);
  document.getElementById('vSin').textContent = fmt(sinVal);
  const tanEl = document.getElementById('vTan');
  const tanSub = document.getElementById('vTanSub');
  if (isExactPole) {
    //Determine sign
    tanEl.textContent = sinVal > 0 ? '+∞' : '−∞';
    tanSub.textContent = 'non définie';
  } else {
    tanEl.textContent = fmt(tanVal);
    tanSub.textContent = 'sin / cos';
  }
}
//Interaction 
function angleFromEvent(e) {
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (W / rect.width) - CX;
  const my = -((e.clientY - rect.top) * (H / rect.height) - CY);
  let d = Math.atan2(my, mx) * 180 / Math.PI;
  return d < 0 ? d + 360 : d;
}
function update(e) {
  angleDeg = angleFromEvent(e);
  slider.value = angleDeg;
  draw(angleDeg);
}
const wrap = document.getElementById('wrap');
wrap.addEventListener('mousedown', e => { dragging = true; update(e); });
window.addEventListener('mousemove', e => { if (dragging) update(e); });
window.addEventListener('mouseup', () => { dragging = false; });
wrap.addEventListener('touchstart', e => { e.preventDefault(); dragging = true; update(e.touches[0]); }, { passive: false });
window.addEventListener('touchmove', e => { if (dragging) { e.preventDefault(); update(e.touches[0]); } }, { passive: false });
window.addEventListener('touchend', () => { dragging = false; });
slider.addEventListener('input', () => { angleDeg = parseFloat(slider.value); draw(angleDeg); });
draw(0);