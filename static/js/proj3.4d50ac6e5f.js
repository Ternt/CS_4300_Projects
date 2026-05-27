(() => {
"use strict";
var __webpack_modules__ = ({
661(module, __unused_rspack___webpack_exports__, __webpack_require__) {
__webpack_require__.a(module, async function (__rspack_load_async_deps, __rspack_async_done) { try {
/* import */ var https_cbcdn_githack_com_charlieroberts_gulls_raw_branch_main_gulls_js__rspack_import_0 = __webpack_require__(54);
/* import */ var https_cbcdn_githack_com_charlieroberts_gulls_raw_branch_main_helpers_video_js__rspack_import_1 = __webpack_require__(938);
var __rspack_async_deps = __rspack_load_async_deps([https_cbcdn_githack_com_charlieroberts_gulls_raw_branch_main_gulls_js__rspack_import_0, https_cbcdn_githack_com_charlieroberts_gulls_raw_branch_main_helpers_video_js__rspack_import_1]);
([https_cbcdn_githack_com_charlieroberts_gulls_raw_branch_main_gulls_js__rspack_import_0, https_cbcdn_githack_com_charlieroberts_gulls_raw_branch_main_helpers_video_js__rspack_import_1] = __rspack_async_deps.then ? (await __rspack_async_deps)() : __rspack_async_deps);


class App {
    async init(title) {
        this.ui = new UI().init();
        this.sg = await gulls.init(true);
        this.frag = await gulls.import('./frag.wgsl');
        this.compute = await gulls.import('./compute.wgsl');
        this.shader = gulls.constants.vertex + this.frag;
        this.playing = false;
        if (title) {
            const titleEl = document.createElement('div');
            titleEl.className = 'page-project-title';
            titleEl.textContent = title;
            document.body.appendChild(titleEl);
        }
        this.initState();
    }
    initState() {
        let gridInitType = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 'center';
        const w = window.innerWidth;
        const h = window.innerHeight;
        const initState = new Float32Array(w * h * 2);
        for(let y = 0; y < h; y++){
            for(let x = 0; x < w; x++){
                const idx = (y * w + x) * 2;
                initState[idx] = 1.0;
                if (gridInitType === 'center') {
                    const dx = x - w / 2;
                    const dy = y - h / 2;
                    initState[idx + 1] = Math.abs(dx) < 20 && Math.abs(dy) < 20 ? 1.0 : 0.0;
                } else if (gridInitType === 'random') {
                    initState[idx + 1] = Math.random() < 0.05 ? 1.0 : 0.0;
                }
            }
        }
        this.currState = this.sg.buffer(initState);
        this.nextState = this.sg.buffer(initState);
        this.res = this.sg.uniform([
            w,
            h
        ]);
        if (!this.feed) {
            this.feed = this.sg.uniform(.041);
            this.kill = this.sg.uniform(.062);
            this.dA = this.sg.uniform(1.0);
            this.dB = this.sg.uniform(0.5);
        }
    }
    async restart() {
        this.initState(this.initType ?? 'center');
        this.computePass = await this.sg.compute({
            shader: this.compute,
            data: [
                this.res,
                this.feed,
                this.kill,
                this.dA,
                this.dB,
                this.sg.pingpong(this.currState, this.nextState)
            ],
            dispatchCount: [
                Math.round(gulls.width / 8),
                Math.round(gulls.height / 8),
                1
            ],
            times: 25
        });
        this.renderPass = await this.sg.render({
            shader: this.shader,
            data: [
                this.res,
                this.sg.pingpong(this.currState, this.nextState)
            ]
        });
        await this.sg.once(this.renderPass);
    }
    async run() {
        this.computePass = await this.sg.compute({
            shader: this.compute,
            data: [
                this.res,
                this.feed,
                this.kill,
                this.dA,
                this.dB,
                this.sg.pingpong(this.currState, this.nextState)
            ],
            dispatchCount: [
                Math.round(gulls.width / 8),
                Math.round(gulls.height / 8),
                1
            ],
            times: 25
        });
        this.renderPass = await this.sg.render({
            shader: this.shader,
            data: [
                this.res,
                this.sg.pingpong(this.currState, this.nextState)
            ]
        });
        const frame = async ()=>{
            if (this.playing) {
                await this.sg.once(this.computePass, this.renderPass);
            }
            window.requestAnimationFrame(frame);
        };
        window.requestAnimationFrame(frame);
    }
}
const presets = (/* unused pure expression or super */ null && ([
    {
        feed: 0.055,
        kill: 0.062,
        dA: 1.0,
        dB: 0.5,
        initType: 'center'
    },
    {
        feed: 0.018,
        kill: 0.051,
        dA: 1.0,
        dB: 0.5,
        initType: 'center'
    },
    {
        feed: 0.0369,
        kill: 0.0642,
        dA: 1.12,
        dB: 0.3944,
        initType: 'random'
    },
    {
        feed: 0.046,
        kill: 0.063,
        dA: 1.0,
        dB: 0.5,
        initType: 'random'
    }
]));
async function execute() {
    const app = new App();
    await app.init('Reaction Diffusion');
    app.ui.parentPush({
        id: 'app-params-menu',
        classOverrides: 'app-params-menu'
    });
    app.ui.parentPush({
        classOverrides: 'app-preset-dropdown'
    });
    app.ui.text({
        text: 'Presets:'
    });
    app.ui.dropdown({
        options: [
            {
                name: 'Stripes/Coral',
                value: 0
            },
            {
                name: 'Spirals/Worms',
                value: 1
            },
            {
                name: 'Inverse Bubbles',
                value: 2
            },
            {
                name: 'Scattered Worms',
                value: 3
            }
        ],
        cb: async (val)=>{
            const { feed, kill, dA, dB, initType } = presets[val];
            app.initType = initType;
            await app.restart();
            app.feed.value = feed;
            app.kill.value = kill;
            app.dA.value = dA;
            app.dB.value = dB;
            const feedInput = document.querySelector('#slider-1-input');
            const killInput = document.querySelector('#slider-2-input');
            const dAInput = document.querySelector('#slider-3-input');
            const dBInput = document.querySelector('#slider-4-input');
            feedInput.value = feed;
            killInput.value = kill;
            dAInput.value = dA;
            dBInput.value = dB;
            feedInput.dispatchEvent(new Event('input'));
            killInput.dispatchEvent(new Event('input'));
            dAInput.dispatchEvent(new Event('input'));
            dBInput.dispatchEvent(new Event('input'));
            const initDropdown = document.querySelector('#dropdown-2');
            if (initDropdown) initDropdown.value = initType;
            app.playing = true;
            playBtn.textContent = 'Pause';
        }
    });
    app.ui.parentPop();
    app.ui.parentPush({
        classOverrides: 'app-preset-dropdown'
    });
    app.ui.text({
        text: 'Init:'
    });
    app.ui.dropdown({
        options: [
            {
                name: 'Center',
                value: 'center'
            },
            {
                name: 'Random',
                value: 'random'
            }
        ],
        cb: async (val)=>{
            app.initType = val;
            await app.restart();
            app.playing = true;
            playBtn.textContent = 'Pause';
        }
    });
    app.ui.parentPop();
    app.ui.slider({
        label: 'Feed',
        range: {
            min: 0.01,
            max: 0.08,
            value: .041,
            step: 0.0001,
            sigFigs: 5
        },
        cb: (val)=>{
            app.feed.value = val;
        }
    });
    app.ui.slider({
        label: 'Kill',
        range: {
            min: 0.045,
            max: 0.07,
            value: .062,
            step: 0.0001,
            sigFigs: 5
        },
        cb: (val)=>{
            app.kill.value = val;
        }
    });
    app.ui.slider({
        label: 'dA',
        range: {
            min: 0.0,
            max: 2.0,
            value: 1.0,
            step: 0.0001,
            sigFigs: 5
        },
        cb: (val)=>{
            app.dA.value = val;
        }
    });
    app.ui.slider({
        label: 'dB',
        range: {
            min: 0.0,
            max: 2.0,
            value: 0.5,
            step: 0.0001,
            sigFigs: 5
        },
        cb: (val)=>{
            app.dB.value = val;
        }
    });
    app.ui.parentPush({
        classOverrides: 'app-controls'
    });
    const playBtn = app.ui.button({
        label: 'Pause',
        cb: ()=>{
            app.playing = !app.playing;
            playBtn.textContent = app.playing ? 'Pause' : 'Start';
        }
    });
    app.ui.button({
        label: 'Reset',
        cb: async ()=>{
            await app.restart();
            app.playing = true;
            playBtn.textContent = 'Pause';
        }
    });
    app.ui.parentPop();
    app.ui.parentPop();
    await app.run();
    // Auto-start the simulation
    app.playing = true;
}

__rspack_async_done();
} catch(e) { __rspack_async_done(e); } });

},
54(module) {
module.exports = import("https://cbcdn.githack.com/charlieroberts/gulls/raw/branch/main/gulls.js").then(function(module) { return module; });

},
938(module) {
module.exports = import("https://cbcdn.githack.com/charlieroberts/gulls/raw/branch/main/helpers/video.js").then(function(module) { return module; });

},

});
// The module cache
var __webpack_module_cache__ = {};

// The require function
function __webpack_require__(moduleId) {

// Check if module is in cache
var cachedModule = __webpack_module_cache__[moduleId];
if (cachedModule !== undefined) {
return cachedModule.exports;
}
// Create a new module (and put it into the cache)
var module = (__webpack_module_cache__[moduleId] = {
exports: {}
});
// Execute the module function
__webpack_modules__[moduleId](module, module.exports, __webpack_require__);

// Return the exports of the module
return module.exports;

}

// webpack/runtime/async_module
(() => {
var hasSymbol = typeof Symbol === "function";
var rspackQueues = hasSymbol ? Symbol("rspack queues") : "__rspack_queues";
var rspackExports = __webpack_require__.aE = hasSymbol ? Symbol("rspack exports") : "__webpack_exports__";
var rspackError = hasSymbol ? Symbol("rspack error") : "__rspack_error";
var rspackDone = hasSymbol ? Symbol("rspack done") : "__rspack_done";
var rspackDefer = __webpack_require__.zS = hasSymbol ? Symbol("rspack defer") : "__rspack_defer";
__webpack_require__.zT = (asyncDeps) => {
	var hasUnresolvedAsyncSubgraph = asyncDeps.some((id) => {
		var cache = __webpack_module_cache__[id];
		return !cache || cache[rspackDone] === false;
	});
	if (hasUnresolvedAsyncSubgraph) {
		return ({ then(onFulfilled, onRejected) { return Promise.all(asyncDeps.map(__webpack_require__)).then(onFulfilled, onRejected) } });
	}
}
var resolveQueue = (queue) => {
	if (queue && queue.d < 1) {
		queue.d = 1;
    	queue.forEach((fn) => (fn.r--));
		queue.forEach((fn) => (fn.r-- ? fn.r++ : fn()));
	}
}
var wrapDeps = (deps) => {
	return deps.map((dep) => {
		if (dep !== null && typeof dep === "object") {
			if(!dep[rspackQueues] && dep[rspackDefer]) {
				var asyncDeps = __webpack_require__.zT(dep[rspackDefer]);
				if (asyncDeps) {
					var d = dep;
					dep = {
						then(onFulfilled, onRejected) {
							asyncDeps.then(() => (onFulfilled(d)), onRejected);
						}
					};
				} else return dep;
			}
			if (dep[rspackQueues]) return dep;
			if (dep.then) {
				var queue = [];
				queue.d = 0;
				dep.then((r) => {
					obj[rspackExports] = r;
					resolveQueue(queue);
				},(e) => {
					obj[rspackError] = e;
					resolveQueue(queue);
				});
				var obj = {};
				obj[rspackDefer] = false;
				obj[rspackQueues] = (fn) => (fn(queue));
				return obj;
			}
		}
		var ret = {};
		ret[rspackQueues] = () => {};
		ret[rspackExports] = dep;
		return ret;
	});
};
__webpack_require__.a = (module, body, hasAwait) => {
	var queue;
	hasAwait && ((queue = []).d = -1);
	var depQueues = new Set();
	var exports = module.exports;
	var currentDeps;
	var outerResolve;
	var reject;
	var promise = new Promise((resolve, rej) => {
		reject = rej;
		outerResolve = resolve;
	});
	promise[rspackExports] = exports;
	promise[rspackQueues] = (fn) => { queue && fn(queue), depQueues.forEach(fn), promise["catch"](() => {}); };
	module.exports = promise;
	var handle = (deps) => {
		currentDeps = wrapDeps(deps);
		var fn;
		var getResult = () => {
			return currentDeps.map((d) => {
				if(d[rspackDefer]) return d;
				if (d[rspackError]) throw d[rspackError];
				return d[rspackExports];
			});
		}
		var promise = new Promise((resolve) => {
			fn = () => (resolve(getResult));
			fn.r = 0;
			var fnQueue = (q) => (q !== queue && !depQueues.has(q) && (depQueues.add(q), q && !q.d && (fn.r++, q.push(fn))));
			currentDeps.map((dep) => (dep[rspackDefer] || dep[rspackQueues](fnQueue)));
		});
		return fn.r ? promise : getResult();
	};
	var done = (err) => ((err ? reject(promise[rspackError] = err) : outerResolve(exports)), resolveQueue(queue), promise[rspackDone] = true);
	body(handle, done);
	queue && queue.d < 0 && (queue.d = 0);
};
})();
// startup
// Load entry module and return exports
// This entry module used 'module' so it can't be inlined
var __webpack_exports__ = __webpack_require__(661);
})()
;