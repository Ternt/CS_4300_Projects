import { default as gulls } from 'https://cbcdn.githack.com/charlieroberts/gulls/raw/branch/main/gulls.js'

class UI {
  init() {
    // initialize and append root UI container
    const main = document.getElementById('page-content');
    this.root = document.createElement('div');
    this.root.id = 'ui-container';
    this.root.className = 'ui-container';
    main.appendChild(this.root);

    // state of ui system in order to auto-generate ui element ids.
    this.dropdownCount = 0;
    this.sliderCount = 0;
    this.buttonCount = 0;
    this.textboxCount = 0;

    // initialize value map. This holds all the values that each ui 
    // element is manipulating.
    this.values = {};

    // initialize the parent stack.
    this.parentStack = [];

    return this;
  }

  currentParent() {
    return this.parentStack.length > 0 
      ? this.parentStack[this.parentStack.length - 1] 
      : this.root;
  }

  parentPush({ id, classOverrides } = {}) {
    const div = document.createElement('div');
    div.id = id ?? `parent-${this.parentStack.length}`;
    div.className = classOverrides ?? 'ui-element ui-parent';
    this.currentParent().appendChild(div);
    this.parentStack.push(div);
  }

  parentPop() {
    if (this.parentStack.length > 0) {
      this.parentStack.pop();
    }
  }

  dropdown({ options = [], id, cb, classOverrides } = {}) {
    this.dropdownCount += 1;
    const elementId = id ?? `dropdown-${this.dropdownCount}`;

    const select = document.createElement('select');
    select.id = elementId;
    select.className = classOverrides ?? 'ui-element ui-dropdown';

    options.forEach(({ name, value }) => {
      const option = document.createElement('option');
      option.textContent = name;
      option.value = value;
      select.appendChild(option);
    });

    select.addEventListener('change', (e) => {
      this.values[elementId] = e.target.value;
      if (cb) cb(e.target.value, this);
    });

    this.currentParent().appendChild(select);
  }

  setDropdownOptions({ id, options = [] } = {}) {
    const select = document.getElementById(id);
    if (!select) return;
    select.innerHTML = '';
    options.forEach(({ name, value }) => {
      const option = document.createElement('option');
      option.textContent = name;
      option.value = value;
      select.appendChild(option);
    });
    this.values[id] = select.value;
  }

  destroy() {
  }
};

class App {
  async init(title) {
    this.ui     = new UI().init();
    this.sg     = await gulls.init(true);
    this.frag   = await gulls.import('./frag.wgsl');
    this.shader = gulls.constants.vertex + this.frag;

    if (title) {
      const titleEl = document.createElement('div');
      titleEl.className = 'page-project-title';
      titleEl.textContent = title;
      document.body.appendChild(titleEl);
    }
  }

  async run() {

    const back = new Float32Array(this.sg.width * this.sg.height * 4);
    const feedback_t = this.sg.texture(back);
    const frameUniform = this.sg.uniform(0);
    const mouseUniform = this.sg.uniform([0, 0, 0]);
    const audioUniform = this.sg.uniform([0, 0, 0]);

    const render_pass = await this.sg.render({
      shader: this.shader,
      data: [
        this.sg.uniform([this.sg.width, this.sg.height]), // res       binding 0
        frameUniform,                                     // frame     binding 1
        mouseUniform,                                     // mouse     binding 2
        audioUniform,                                     // audio     binding 3
        this.sg.sampler(),                                // backSampler binding 4
        feedback_t,                                       // backBuffer  binding 5
      ],
      copy: feedback_t,
    });

    let frameCount = 0;
    const loop = async (timestamp) => {
      frameUniform.value = frameCount++;
      await this.sg.once(render_pass);
      window.requestAnimationFrame(loop);
    };

    window.requestAnimationFrame(loop);
  }
}

const app = new App();
await app.init('Audio Visualizer');
await app.run();
