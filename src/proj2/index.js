import { default as gulls } from 'https://cbcdn.githack.com/charlieroberts/gulls/raw/branch/main/gulls.js'
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

app.ui.parentPush({ id: 'tool-bar', classOverrides: 'ui-toolbar' });
{
  app.ui.textbox({
    text: "This little animation requires the track 'Hide (CS01 Version)' by Dorian Concept. If you have the MP3, upload it here then press play.",
    classOverrides: "page-notice",
  });
  app.ui.fileUpload({
    label: 'Load Audio',
    id: 'audio-file',
    accept: 'audio/*',
    cb: (file, ui) => {
      const url = URL.createObjectURL(file);
      const audio = new Audio(url);
      audio.play();
    }
  });
}
app.ui.parentPop();

await app.run();
