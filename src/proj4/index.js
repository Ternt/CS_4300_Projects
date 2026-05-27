import { default as gulls } from 'https://cbcdn.githack.com/charlieroberts/gulls/raw/branch/main/gulls.js';
import UI from '../modules/ui.js';

class App {
  async init(title) {
    if (!navigator.gpu) {
      document.getElementById('webgpu-error').style.display = 'flex';
      return false;
    }

    this.ui = new UI().init();

    this.sg = await gulls.init();
    this.render_shader  = await gulls.import('./frag.wgsl');
    this.compute_shader = await gulls.import('./compute.wgsl');

    this.trail_length = 16;
    this.frame  = this.sg.uniform(0);
    this.res    = this.sg.uniform([this.sg.width, this.sg.height]);
    this.spawn  = this.sg.uniform([0.0, 0.0, 0.0, 0.0]);

    this.NUM_PARTICLES = 64;
    this.STRIDE = 8 + this.trail_length * 2; // floats per particle in state1 buffer

    // state1: STRIDE floats per particle
    // [px, py, vx, vy, head, active, pad, pad, trailX0, trailY0, ...(TRAIL_LEN pairs)]
    const state1 = new Float32Array(this.NUM_PARTICLES * this.STRIDE);
    this.state1  = this.sg.buffer(state1);

    // state2: [life, r, g, b] per particle
    const state2 = new Float32Array(this.NUM_PARTICLES * 4);
    this.state2  = this.sg.buffer(state2);

    this.deathRate    = 2.0;
    this.speed        = 1.9;
    this.particleSize = 5.0;
    this.frequencyMs  = 1200;
    this.params       = this.sg.uniform([0.016, this.deathRate, this.speed, this.particleSize]);

    this._seed = 0;
    this._last = performance.now();

    this._initInput();
    this._initAutoFire();

    return true;
  }

  _screenToClip(clientX, clientY) {
    const canvas = document.querySelector('canvas.project-canvas') ?? document.querySelector('canvas');
    const rect = canvas.getBoundingClientRect();
    const nx   = ((clientX - rect.left) / rect.width)  *  2 - 1;
    const ny   = ((clientY - rect.top)  / rect.height) * -2 + 1;
    return [nx, ny];
  }

  _initInput() {
    const canvas = document.querySelector('canvas.project-canvas') ?? document.querySelector('canvas');
    canvas.addEventListener('click', (e) => {
      const [nx, ny] = this._screenToClip(e.clientX, e.clientY);
      this._fireTo(nx, ny);
    });
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const t = e.touches[0];
      const [nx, ny] = this._screenToClip(t.clientX, t.clientY);
      this._fireTo(nx, ny);
    }, { passive: false });
  }

  _initAutoFire() {
    this._autoTimer = setInterval(() => {
      const tx = -0.7 + Math.random() * 1.4;
      const ty = -0.2 + Math.random() * 0.8;
      this._fireTo(tx, ty);
    }, this.frequencyMs);
  }

  _setAutoFireFrequency(ms) {
    this.frequencyMs = ms;
    clearInterval(this._autoTimer);
    this._initAutoFire();
  }

  _fireTo(tx, ty) {
    this._seed++;
    this.spawn.value = [tx, ty, 1.0, this._seed];
    setTimeout(() => {
      this.spawn.value = [tx, ty, 0.0, this._seed];
    }, 32);
  }

  async run() {
    // Each particle renders TRAIL_LEN instances (lead + ghosts)
    const instanceCount = this.NUM_PARTICLES * this.trail_length;

    const render = await this.sg.render({
      shader: this.render_shader,
      data: [
        this.frame,
        this.res,
        this.state1,
        this.state2,
        this.params,
      ],
      onframe: () => {
        this.frame.value++;
        const now = performance.now();
        const dt  = Math.min((now - this._last) / 1000, 0.05);
        this._last = now;
        this.params.value = [dt, this.deathRate, this.speed, this.particleSize];
      },
      count: instanceCount,
      blend: true,
    });

    // Dispatch enough workgroups to cover all particles.
    // STRIDE > 4, so arrayLength(&state1)/STRIDE = NUM_PARTICLES.
    // One thread per particle: ceil(64/8) = 8 in each dim.
    const dc = Math.ceil(Math.sqrt(this.NUM_PARTICLES / 64)) + 1;

    const compute = this.sg.compute({
      shader: this.compute_shader,
      data: [
        this.res,
        this.state1,
        this.state2,
        this.spawn,
        this.params,
      ],
      dispatchCount: [dc, dc, 1],
    });

    this.sg.run(compute, render);
  }
}

export async function execute() {
  const app = new App();
  const ok  = await app.init('Fireworks');
  if (!ok) throw new Error('WebGPU unavailable');

  app.ui.parentPush({ id: 'app-project-title-root', classOverrides: 'app-project-title-root' });
  app.ui.textbox({
    text: 'Fireworks',
    classOverrides: 'app-project-title',
  });
  app.ui.parentPop();

  app.ui.parentPush({ id: 'app-params-menu', classOverrides: 'app-params-menu' });
  app.ui.slider({
    label: 'Trail Length',
    range: { min: 0, max: 32, value: 16, step: 1, sigFigs: 3 },
    cb: (val) => { app.trail_length = val; },
  });
  app.ui.slider({
    label: 'Particle Size',
    range: { min: 0.1, max: 5.0, value: 5.0, step: 0.1, sigFigs: 2 },
    cb: (val) => { app.particleSize = Number(val); },
  });
  app.ui.slider({
    label: 'Frequency',
    range: { min: 200, max: 3000, value: 1200, step: 100, sigFigs: 4 },
    cb: (val) => app._setAutoFireFrequency(Number(val)),
  });
  app.ui.slider({
    label: 'Death Rate',
    range: { min: 0.1, max: 3.0, value: 2.0, step: 0.05, sigFigs: 2 },
    cb: (val) => { app.deathRate = Number(val); },
  });
  app.ui.slider({
    label: 'Speed',
    range: { min: 0.1, max: 3.0, value: 1.9, step: 0.05, sigFigs: 2 },
    cb: (val) => { app.speed = Number(val); },
  });
  app.ui.parentPop();

  await app.run();
}
