(() => {
"use strict";
var __webpack_modules__ = ({
480(module, __unused_rspack___webpack_exports__, __webpack_require__) {
__webpack_require__.a(module, async function (__rspack_load_async_deps, __rspack_async_done) { try {
/* import */ var https_cbcdn_githack_com_charlieroberts_gulls_raw_branch_main_gulls_js__rspack_import_0 = __webpack_require__(54);
var __rspack_async_deps = __rspack_load_async_deps([https_cbcdn_githack_com_charlieroberts_gulls_raw_branch_main_gulls_js__rspack_import_0]);
https_cbcdn_githack_com_charlieroberts_gulls_raw_branch_main_gulls_js__rspack_import_0 = (__rspack_async_deps.then ? (await __rspack_async_deps)() : __rspack_async_deps)[0];

class App {
    async init(title) {
        if (!navigator.gpu) {
            document.getElementById('webgpu-error').style.display = 'flex';
            return false;
        }
        this.ui = new UI().init();
        this.sg = await gulls.init();
        this.render_shader = await gulls.import('./frag.wgsl');
        this.compute_shader = await gulls.import('./compute.wgsl');
        this.trail_length = 16;
        this.frame = this.sg.uniform(0);
        this.res = this.sg.uniform([
            this.sg.width,
            this.sg.height
        ]);
        this.spawn = this.sg.uniform([
            0.0,
            0.0,
            0.0,
            0.0
        ]);
        this.NUM_PARTICLES = 64;
        this.STRIDE = 8 + this.trail_length * 2; // floats per particle in state1 buffer
        // state1: STRIDE floats per particle
        // [px, py, vx, vy, head, active, pad, pad, trailX0, trailY0, ...(TRAIL_LEN pairs)]
        const state1 = new Float32Array(this.NUM_PARTICLES * this.STRIDE);
        this.state1 = this.sg.buffer(state1);
        // state2: [life, r, g, b] per particle
        const state2 = new Float32Array(this.NUM_PARTICLES * 4);
        this.state2 = this.sg.buffer(state2);
        this.deathRate = 2.0;
        this.speed = 1.9;
        this.particleSize = 5.0;
        this.frequencyMs = 1200;
        this.params = this.sg.uniform([
            0.016,
            this.deathRate,
            this.speed,
            this.particleSize
        ]);
        this._seed = 0;
        this._last = performance.now();
        this._initInput();
        this._initAutoFire();
        return true;
    }
    _screenToClip(clientX, clientY) {
        const canvas = document.querySelector('canvas.project-canvas') ?? document.querySelector('canvas');
        const rect = canvas.getBoundingClientRect();
        const nx = (clientX - rect.left) / rect.width * 2 - 1;
        const ny = (clientY - rect.top) / rect.height * -2 + 1;
        return [
            nx,
            ny
        ];
    }
    _initInput() {
        const canvas = document.querySelector('canvas.project-canvas') ?? document.querySelector('canvas');
        canvas.addEventListener('click', (e)=>{
            const [nx, ny] = this._screenToClip(e.clientX, e.clientY);
            this._fireTo(nx, ny);
        });
        canvas.addEventListener('touchstart', (e)=>{
            e.preventDefault();
            const t = e.touches[0];
            const [nx, ny] = this._screenToClip(t.clientX, t.clientY);
            this._fireTo(nx, ny);
        }, {
            passive: false
        });
    }
    _initAutoFire() {
        this._autoTimer = setInterval(()=>{
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
        this.spawn.value = [
            tx,
            ty,
            1.0,
            this._seed
        ];
        setTimeout(()=>{
            this.spawn.value = [
                tx,
                ty,
                0.0,
                this._seed
            ];
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
                this.params
            ],
            onframe: ()=>{
                this.frame.value++;
                const now = performance.now();
                const dt = Math.min((now - this._last) / 1000, 0.05);
                this._last = now;
                this.params.value = [
                    dt,
                    this.deathRate,
                    this.speed,
                    this.particleSize
                ];
            },
            count: instanceCount,
            blend: true
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
                this.params
            ],
            dispatchCount: [
                dc,
                dc,
                1
            ]
        });
        this.sg.run(compute, render);
    }
}
async function execute() {
    const app = new App();
    const ok = await app.init('Fireworks');
    if (!ok) throw new Error('WebGPU unavailable');
    app.ui.parentPush({
        id: 'app-project-title-root',
        classOverrides: 'app-project-title-root'
    });
    app.ui.textbox({
        text: 'Fireworks',
        classOverrides: 'app-project-title'
    });
    app.ui.parentPop();
    app.ui.parentPush({
        id: 'app-params-menu',
        classOverrides: 'app-params-menu'
    });
    app.ui.slider({
        label: 'Trail Length',
        range: {
            min: 0,
            max: 32,
            value: 16,
            step: 1,
            sigFigs: 3
        },
        cb: (val)=>{
            app.trail_length = val;
        }
    });
    app.ui.slider({
        label: 'Particle Size',
        range: {
            min: 0.1,
            max: 5.0,
            value: 5.0,
            step: 0.1,
            sigFigs: 2
        },
        cb: (val)=>{
            app.particleSize = Number(val);
        }
    });
    app.ui.slider({
        label: 'Frequency',
        range: {
            min: 200,
            max: 3000,
            value: 1200,
            step: 100,
            sigFigs: 4
        },
        cb: (val)=>app._setAutoFireFrequency(Number(val))
    });
    app.ui.slider({
        label: 'Death Rate',
        range: {
            min: 0.1,
            max: 3.0,
            value: 2.0,
            step: 0.05,
            sigFigs: 2
        },
        cb: (val)=>{
            app.deathRate = Number(val);
        }
    });
    app.ui.slider({
        label: 'Speed',
        range: {
            min: 0.1,
            max: 3.0,
            value: 1.9,
            step: 0.05,
            sigFigs: 2
        },
        cb: (val)=>{
            app.speed = Number(val);
        }
    });
    app.ui.parentPop();
    await app.run();
}

__rspack_async_done();
} catch(e) { __rspack_async_done(e); } });

},
54(module) {
module.exports = import("https://cbcdn.githack.com/charlieroberts/gulls/raw/branch/main/gulls.js").then(function(module) { return module; });

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
var __webpack_exports__ = __webpack_require__(480);
})()
;