import { default as gulls } from 'https://cbcdn.githack.com/charlieroberts/gulls/raw/branch/main/gulls.js'
import { default as Video } from 'https://cbcdn.githack.com/charlieroberts/gulls/raw/branch/main/helpers/video.js'
import UI from '../modules/ui.js';

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
    await Video.init();

    const controls = this.sg.uniform([0, 0, 0, 0], Uint32Array);

    const render_pass = await this.sg.render({
      shader: this.shader,
      data: [
        this.sg.uniform([this.sg.width, this.sg.height]),
        this.sg.sampler(),
        controls,
        this.sg.video(Video.element),
      ],
    });

    const loop = async () => {
      controls.value = [
        Number(this.ui.values['algorithm']     ?? 0),
        Number(this.ui.values['algorithmView'] ?? 0),
        0, 0
      ];
      await this.sg.once(render_pass);
      window.requestAnimationFrame(loop);
    };

    window.requestAnimationFrame(loop);
  }
}

const app = new App();
await app.init('Edge Detection Algorithms');

app.ui.parentPush({ id: 'tool-bar', classOverrides: 'ui-toolbar' });
  const viewOptions = {
    0: [{ name: 'None', value: 0 }],
    1: [
      { name: 'Edges Only',  value: 0 },
      { name: 'Convolution', value: 1 },
    ],
    2: [
      { name: 'Edges Only',  value: 0 },
      { name: 'Convolution', value: 1 },
    ],
  };
  app.ui.dropdown({
    options: [
      { name: 'None',  value: 0 },
      { name: 'Sobel', value: 1 },
      { name: 'Prewitt', value: 2 },
    ],
    id: 'algorithm',
    cb: (val, ui) => { ui.setDropdownOptions({ id: 'algorithmView', options: viewOptions[val] }); }
  });
  app.ui.dropdown({ options: viewOptions[0], id: 'algorithmView' });
app.ui.parentPop();

await app.run();
