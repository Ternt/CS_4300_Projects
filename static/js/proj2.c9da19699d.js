(() => {
"use strict";
var __webpack_modules__ = ({
94(module, __unused_rspack___webpack_exports__, __webpack_require__) {
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
        const controls = this.sg.uniform([
            0,
            0,
            0,
            0
        ], Uint32Array);
        const render_pass = await this.sg.render({
            shader: this.shader,
            data: [
                this.sg.uniform([
                    this.sg.width,
                    this.sg.height
                ]),
                this.sg.sampler(),
                controls,
                this.sg.video(Video.element)
            ]
        });
        const loop = async ()=>{
            controls.value = [
                Number(this.ui.values['algorithm'] ?? 0),
                Number(this.ui.values['algorithmView'] ?? 0),
                0,
                0
            ];
            await this.sg.once(render_pass);
            window.requestAnimationFrame(loop);
        };
        window.requestAnimationFrame(loop);
    }
}
async function execute() {
    const app = new App();
    await app.init('Edge Detection Algorithms');
    app.ui.parentPush({
        id: 'tool-bar',
        classOverrides: 'ui-toolbar'
    });
    const viewOptions = {
        0: [
            {
                name: 'None',
                value: 0
            }
        ],
        1: [
            {
                name: 'Edges Only',
                value: 0
            },
            {
                name: 'Convolution',
                value: 1
            }
        ],
        2: [
            {
                name: 'Edges Only',
                value: 0
            },
            {
                name: 'Convolution',
                value: 1
            }
        ]
    };
    app.ui.dropdown({
        options: [
            {
                name: 'None',
                value: 0
            },
            {
                name: 'Sobel',
                value: 1
            },
            {
                name: 'Prewitt',
                value: 2
            }
        ],
        id: 'algorithm',
        cb: (val, ui)=>{
            ui.setDropdownOptions({
                id: 'algorithmView',
                options: viewOptions[val]
            });
        }
    });
    // Set Sobel (value=1) as the default
    const algorithmEl = document.getElementById('algorithm');
    algorithmEl.value = '1';
    app.ui.values['algorithm'] = '1';
    app.ui.dropdown({
        options: viewOptions[1],
        id: 'algorithmView'
    }); // Sobel view options
    app.ui.parentPop();
    await app.run();
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
var __webpack_exports__ = __webpack_require__(94);
})()
;