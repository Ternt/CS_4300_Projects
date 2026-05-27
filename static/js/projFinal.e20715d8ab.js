(() => {
"use strict";
var __webpack_modules__ = ({
612(__unused_rspack_module, __unused_rspack___webpack_exports__, __webpack_require__) {
/* import */ var _gameObject_js__rspack_import_0 = __webpack_require__(533);
/* import */ var _transform_js__rspack_import_1 = __webpack_require__(515);


class Camera extends _gameObject_js__rspack_import_0/* ["default"] */.A {
    constructor(name){
        super(name);
        this.fov = Math.PI / 4;
        this.aspect = window.innerWidth / window.innerHeight;
        this.near = 0.1;
        this.far = 1000.0;
        window.addEventListener('resize', ()=>{
            this.aspect = window.innerWidth / window.innerHeight;
        });
    }
    projectionMatrix() {
        const f = 1.0 / Math.tan(this.fov / 2);
        const nf = 1.0 / (this.near - this.far);
        return [
            f / this.aspect,
            0,
            0,
            0,
            0,
            f,
            0,
            0,
            0,
            0,
            this.far * nf,
            -1,
            0,
            0,
            this.far * this.near * nf,
            0
        ];
    }
    viewMatrix() {
        return Camera._invertMat4(this.worldMatrix());
    }
    projectionMatrixF32() {
        return new Float32Array(this.projectionMatrix());
    }
    viewMatrixF32() {
        return new Float32Array(this.viewMatrix());
    }
    viewMatrixFromPlayer(player) {
        const px = player.transform.position[0];
        const py = player.transform.position[1] + this.transform.position[1];
        const pz = player.transform.position[2];
        const yaw = player.yaw;
        const pitch = player.pitch;
        const cy = Math.cos(yaw), sy = Math.sin(yaw);
        const cp = Math.cos(pitch), sp = Math.sin(pitch);
        const rx = cy, ry = 0, rz = -sy;
        const ux = sy * sp, uy = cp, uz = cy * sp;
        const fx = -sy * cp, fy = sp, fz = -cy * cp;
        return new Float32Array([
            rx,
            ux,
            -fx,
            0,
            ry,
            uy,
            -fy,
            0,
            rz,
            uz,
            -fz,
            0,
            -(rx * px + ry * py + rz * pz),
            -(ux * px + uy * py + uz * pz),
            fx * px + fy * py + fz * pz,
            1
        ]);
    }
    static _invertMat4(m) {
        const out = new Array(16);
        const a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3], a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7], a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11], a30 = m[12], a31 = m[13], a32 = m[14], a33 = m[15];
        const b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10;
        const b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12;
        const b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30;
        const b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
        let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        if (!det) return _transform_js__rspack_import_1/* ["default"].identity */.A.identity();
        det = 1.0 / det;
        out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
        out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
        out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
        out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
        out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
        out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
        out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
        out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
        out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
        out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
        out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
        out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
        out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
        out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
        out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
        out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
        return out;
    }
}


},
533(__unused_rspack_module, __webpack_exports__, __webpack_require__) {

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  A: () => (/* binding */ GameObject)
});

// EXTERNAL MODULE: ./src/projFinal/engine/transform.js
var transform = __webpack_require__(515);
;// CONCATENATED MODULE: ./src/projFinal/engine/mesh.js
class VertexInput {
    constructor(position, normal, uv){
        this.position = Array.isArray(position) ? position : [
            0,
            0,
            0
        ];
        this.normal = Array.isArray(normal) ? normal : [
            0,
            1,
            0
        ];
        this.uv = Array.isArray(uv) ? uv : [
            0,
            0
        ];
    }
    toF32() {
        return new Float32Array([
            ...this.position,
            ...this.normal,
            ...this.uv
        ]);
    }
    static byteSize() {
        return 8 * Float32Array.BYTES_PER_ELEMENT;
    }
}
class Mesh {
    constructor(vertices = [], images = []){
        this.vertices = vertices;
        this.images = images;
        this.emissiveFactor = [
            0,
            0,
            0
        ];
        this.emissiveImage = null;
    }
    toF32() {
        const out = new Float32Array(this.vertices.length * 8);
        this.vertices.forEach((v, i)=>out.set(v.toF32(), i * 8));
        return out;
    }
    get vertexCount() {
        return this.vertices.length;
    }
}

;// CONCATENATED MODULE: ./src/projFinal/engine/gameObject.js


class GameObject {
    constructor(name, mesh = null){
        this.name = name;
        this.transform = new transform/* ["default"] */.A();
        this.parent = null;
        this.children = [];
        this.mesh = mesh instanceof Mesh ? mesh : null;
        this.localMatrix = null;
    }
    localMatrixData() {
        return this.localMatrix ?? this.transform.toMatrix();
    }
    worldMatrix() {
        const local = this.localMatrixData();
        if (this.parent) {
            return transform/* ["default"].multiply */.A.multiply(this.parent.worldMatrix(), local);
        }
        return local;
    }
    worldMatrixF32() {
        return new Float32Array(this.worldMatrix());
    }
    addChild(child) {
        child.parent = this;
        this.children.push(child);
        return child;
    }
}


},
402(module, __unused_rspack___webpack_exports__, __webpack_require__) {
__webpack_require__.a(module, async function (__rspack_load_async_deps, __rspack_async_done) { try {
/* import */ var https_cdn_jsdelivr_net_npm_dimforge_rapier3d_compat_0_19_3_esm__rspack_import_0 = __webpack_require__(900);
var __rspack_async_deps = __rspack_load_async_deps([https_cdn_jsdelivr_net_npm_dimforge_rapier3d_compat_0_19_3_esm__rspack_import_0]);
https_cdn_jsdelivr_net_npm_dimforge_rapier3d_compat_0_19_3_esm__rspack_import_0 = (__rspack_async_deps.then ? (await __rspack_async_deps)() : __rspack_async_deps)[0];
class Physics {
    async init() {
        await RAPIER.init();
        this.world = new RAPIER.World({
            x: 0,
            y: -9.81,
            z: 0
        });
        this.bodies = new Map();
        this.RAPIER = RAPIER;
        return this;
    }
    addStatic(gameObject) {
        const desc = RAPIER.RigidBodyDesc.fixed();
        const body = this.world.createRigidBody(desc);
        this._addTrimeshCollider(body, gameObject);
        this.bodies.set(gameObject, body);
        return body;
    }
    addDynamic(gameObject) {
        let mass = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1.0;
        const pos = gameObject.transform.position;
        const desc = RAPIER.RigidBodyDesc.dynamic().setTranslation(pos[0], pos[1], pos[2]).setAdditionalMass(mass);
        const body = this.world.createRigidBody(desc);
        this._addTrimeshCollider(body, gameObject);
        this.bodies.set(gameObject, body);
        return body;
    }
    addKinematic(gameObject) {
        const pos = gameObject.transform.position;
        const controller = this.world.createCharacterController(0.01);
        controller.setApplyImpulsesToDynamicBodies(true);
        controller.setSlideEnabled(true);
        controller.setMaxSlopeClimbAngle(45 * Math.PI / 180);
        controller.setMinSlopeSlideAngle(30 * Math.PI / 180);
        controller.enableAutostep(0.3, 0.1, true);
        controller.enableSnapToGround(0.3);
        const bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(pos[0], pos[1], pos[2]);
        const body = this.world.createRigidBody(bodyDesc);
        // Read dimensions from the game object if available, fall back to defaults
        const halfHeight = gameObject.capsuleHalfHeight ?? 0.9;
        const radius = gameObject.capsuleRadius ?? 0.4;
        const colliderDesc = RAPIER.ColliderDesc.capsule(halfHeight, radius);
        const collider = this.world.createCollider(colliderDesc, body);
        const handle = {
            body,
            controller,
            collider
        };
        this.bodies.set(gameObject, handle);
        return handle;
    }
    addBox(gameObject) {
        let halfExtents = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [
            0.5,
            0.5,
            0.5
        ], dynamic = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
        const pos = gameObject.transform.position;
        const desc = dynamic ? RAPIER.RigidBodyDesc.dynamic().setTranslation(pos[0], pos[1], pos[2]) : RAPIER.RigidBodyDesc.fixed().setTranslation(pos[0], pos[1], pos[2]);
        const body = this.world.createRigidBody(desc);
        const colliderDesc = RAPIER.ColliderDesc.cuboid(...halfExtents);
        this.world.createCollider(colliderDesc, body);
        this.bodies.set(gameObject, body);
        return body;
    }
    _addTrimeshCollider(body, gameObject) {
        if (!gameObject.mesh) return;
        const verts = gameObject.mesh.vertices;
        const worldMat = gameObject.worldMatrix();
        const positions = new Float32Array(verts.length * 3);
        const indices = new Uint32Array(verts.length);
        verts.forEach((v, i)=>{
            const x = v.position[0], y = v.position[1], z = v.position[2];
            positions[i * 3] = worldMat[0] * x + worldMat[4] * y + worldMat[8] * z + worldMat[12];
            positions[i * 3 + 1] = worldMat[1] * x + worldMat[5] * y + worldMat[9] * z + worldMat[13];
            positions[i * 3 + 2] = worldMat[2] * x + worldMat[6] * y + worldMat[10] * z + worldMat[14];
            indices[i] = i;
        });
        const colliderDesc = RAPIER.ColliderDesc.trimesh(positions, indices);
        this.world.createCollider(colliderDesc, body);
    }
    moveKinematic(gameObject, desiredTranslation, dt) {
        const handle = this.bodies.get(gameObject);
        if (!handle || !handle.controller) return;
        const { body, controller, collider } = handle;
        const move = {
            x: desiredTranslation[0],
            y: desiredTranslation[1],
            z: desiredTranslation[2]
        };
        controller.computeColliderMovement(collider, move);
        const corrected = controller.computedMovement();
        const current = body.translation();
        body.setNextKinematicTranslation({
            x: current.x + corrected.x,
            y: current.y + corrected.y,
            z: current.z + corrected.z
        });
    }
    step(dt) {
        this.world.timestep = Math.min(dt, 0.05);
        this.world.step();
        for (const [gameObject, handle] of this.bodies){
            const body = handle.body ?? handle;
            if (!body.isDynamic()) continue;
            const t = body.translation();
            const r = body.rotation();
            gameObject.localMatrix = _quatTranslationToMat4([
                r.x,
                r.y,
                r.z,
                r.w
            ], [
                t.x,
                t.y,
                t.z
            ]);
        }
    }
    getTranslation(gameObject) {
        const handle = this.bodies.get(gameObject);
        if (!handle) return null;
        const body = handle.body ?? handle;
        return body.translation();
    }
    remove(gameObject) {
        const handle = this.bodies.get(gameObject);
        if (!handle) return;
        const body = handle.body ?? handle;
        if (handle.controller) this.world.removeCharacterController(handle.controller);
        this.world.removeRigidBody(body);
        this.bodies.delete(gameObject);
    }
}
function _quatTranslationToMat4(q, t) {
    const [x, y, z, w] = q;
    const [tx, ty, tz] = t;
    const x2 = x + x, y2 = y + y, z2 = z + z;
    const xx = x * x2, xy = x * y2, xz = x * z2;
    const yy = y * y2, yz = y * z2, zz = z * z2;
    const wx = w * x2, wy = w * y2, wz = w * z2;
    return new Float32Array([
        1 - (yy + zz),
        xy + wz,
        xz - wy,
        0,
        xy - wz,
        1 - (xx + zz),
        yz + wx,
        0,
        xz + wy,
        yz - wx,
        1 - (xx + yy),
        0,
        tx,
        ty,
        tz,
        1
    ]);
}

__rspack_async_done();
} catch(e) { __rspack_async_done(e); } });

},
710(__unused_rspack_module, __unused_rspack___webpack_exports__, __webpack_require__) {
/* import */ var _gameObject_js__rspack_import_0 = __webpack_require__(533);

class Player extends _gameObject_js__rspack_import_0/* ["default"] */.A {
    constructor(name){
        super(name);
        this.lookSpeed = 0.002;
        this.keys = {};
        this.yaw = 0;
        this.pitch = 0;
        this.isPointerLocked = false;
        this.physicsBody = null;
        this.velX = 0;
        this.velY = 0;
        this.velZ = 0;
        this.rate = 6.0;
        this.mult = 90;
        this.grav = 30.0;
        this.jumpVel = 9.4375;
        this.capsuleHalfHeight = 1.3;
        this.capsuleRadius = 0.4;
        this.eyeHeight = 2.5;
        this._addInput();
    }
    _addInput() {
        window.addEventListener('keydown', (e)=>{
            this.keys[e.code] = true;
        });
        window.addEventListener('keyup', (e)=>{
            this.keys[e.code] = false;
        });
        window.addEventListener('click', (e)=>{
            if (!this.isPointerLocked && !e.target.closest('#ui-container')) {
                document.body.requestPointerLock();
            }
        });
        document.addEventListener('pointerlockchange', ()=>{
            this.isPointerLocked = document.pointerLockElement === document.body;
        });
        window.addEventListener('mousemove', (e)=>{
            if (!this.isPointerLocked) return;
            this.yaw -= e.movementX * this.lookSpeed;
            this.pitch -= e.movementY * this.lookSpeed;
            this.pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, this.pitch));
        });
    }
    update(dt, physics) {
        const handle = physics.bodies.get(this);
        const controller = handle?.controller;
        const grounded = controller ? controller.computedGrounded() : false;
        const time = Math.min(dt, 0.05);
        const rate = this.rate;
        const drag = Math.exp(-time * rate);
        const diff = 1.0 - drag;
        const yaw = this.yaw;
        const cos = Math.cos(yaw);
        const sin = Math.sin(yaw);
        let dirX = 0, dirZ = 0;
        if (this.keys['KeyW'] || this.keys['ArrowUp']) dirZ -= 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) dirZ += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) dirX -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) dirX += 1;
        if (grounded && this.keys['ShiftLeft']) {
            this.mult = 45;
            this.rate = 15.0;
        } else if (!this.keys['ShiftLeft']) {
            this.mult = 90;
            this.rate = 6.0;
        }
        const norm = dirX * dirX + dirZ * dirZ;
        let accX = 0, accZ = 0;
        if (norm > 0) {
            const inv = 1.0 / Math.sqrt(norm);
            accX = this.mult * (cos * dirX + sin * dirZ) * inv;
            accZ = this.mult * (-sin * dirX + cos * dirZ) * inv;
        }
        this.velX -= this.velX * diff;
        this.velZ -= this.velZ * diff;
        this.velX += diff * accX / rate;
        this.velZ += diff * accZ / rate;
        if (grounded && this.velY <= 0) {
            this.velY = 0;
            if (this.keys['Space']) {
                this.velY = this.jumpVel;
            }
        } else {
            this.velY -= this.grav * time;
            this.velY = Math.max(this.velY, -40);
        }
        const moveX = (time - diff / rate) * accX / rate + diff * this.velX / rate;
        const moveZ = (time - diff / rate) * accZ / rate + diff * this.velZ / rate;
        const moveY = this.velY * time;
        physics.moveKinematic(this, [
            moveX,
            moveY,
            moveZ
        ], time);
        // Read back what the controller actually allowed
        const corrected = handle?.controller?.computedMovement();
        if (corrected && this.velY > 0) {
            const expectedY = moveY;
            const correctedY = corrected.y;
            // If the controller blocked most of the upward movement, we hit a ceiling
            if (Math.abs(correctedY) < Math.abs(expectedY) * 0.1) {
                this.velY = 0;
            }
        }
        const t = physics.getTranslation(this);
        if (t) this.transform.position = [
            t.x,
            t.y,
            t.z
        ];
    }
}


},
156(__unused_rspack_module, __unused_rspack___webpack_exports__, __webpack_require__) {
/* import */ var _camera_js__rspack_import_0 = __webpack_require__(612);


class Renderer {
    static CLUSTER_X = (/* unused pure expression or super */ null && (16));
    static CLUSTER_Y = (/* unused pure expression or super */ null && (9));
    static CLUSTER_Z = (/* unused pure expression or super */ null && (24));
    static MAX_LIGHTS_PER_CLUSTER = (/* unused pure expression or super */ null && (100));
    static TOTAL_CLUSTERS = (/* unused pure expression or super */ null && (16 * 9 * 24));
    static MAX_LIGHTS = (/* unused pure expression or super */ null && (256));
    constructor(wgpu, shaders){
        this.wgpu = wgpu;
        this.shaders = shaders;
        this.cameraBuf = null;
        this.clusterBuf = null;
        this.lightListBuf = null;
        this.lightGridBuf = null;
        this.lightsBuf = null;
        this.lightCountBuf = null;
        this.lights = [];
        this.clusterPipeline = null;
        this.clusterBG = null;
        this.assignPipeline = null;
        this.assignBG = null;
        this.fragLightBGL = null;
        this.fragLightBG = null;
        this.pipeline = null;
        this.bgl = null;
        this.bindGroups = [];
        this.nodeRanges = [];
        this.uniformBufs = [];
        this.texFlagBufs = [];
        this.emissiveFlagBufs = [];
        this.instanceBufs = [];
        this.posBuf = this.norBuf = this.uvBuf = null;
        this.gpuTextures = [];
        this.emissiveTextures = [];
        this.fallbackTexture = null;
        this.fallbackBlackTexture = null;
        this.sampler = null;
    }
    async init() {
        this._initClusterBuffers();
        this._uploadLights();
        await this._buildClusterPipelines();
        this.fallbackTexture = this.wgpu.createFallbackTexture();
        this.fallbackBlackTexture = this.wgpu.createFallbackTexture([
            0,
            0,
            0,
            255
        ]);
        this.sampler = this.wgpu.createSampler();
    }
    _initClusterBuffers() {
        const { wgpu } = this;
        const TC = Renderer.TOTAL_CLUSTERS;
        const ML = Renderer.MAX_LIGHTS_PER_CLUSTER;
        this.cameraBuf = wgpu.createEmptyBuffer(208, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST);
        this.clusterBuf = wgpu.createEmptyBuffer(TC * 32, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST);
        this.lightListBuf = wgpu.createEmptyBuffer(TC * ML * 4, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST);
        this.lightGridBuf = wgpu.createEmptyBuffer(TC * 8, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST);
        this.lightsBuf = wgpu.createEmptyBuffer(Renderer.MAX_LIGHTS * 48, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST);
        this.lightCountBuf = wgpu.createEmptyBuffer(4, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST);
        this.debugModeBuf = wgpu.createEmptyBuffer(4, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST);
        // write 0 (no debug) by default
        wgpu.writeBuffer(this.debugModeBuf, new Uint32Array([
            0
        ]));
    }
    setDebugMode(mode) {
        this.wgpu.writeBuffer(this.debugModeBuf, new Uint32Array([
            mode
        ]));
    }
    setLights(lights) {
        this.lights = lights;
        this._uploadLights();
    }
    _uploadLights() {
        const count = this.lights.length;
        if (count > 0) {
            const data = new Float32Array(count * 12);
            this.lights.forEach((l, i)=>{
                const base = i * 12;
                // position.xyz + position.w (radius)
                data[base + 0] = l.position[0];
                data[base + 1] = l.position[1];
                data[base + 2] = l.position[2];
                data[base + 3] = l.position[3] ?? 8.0; // radius — was never set before!
                // color.rgb + color.w (intensity)
                data[base + 4] = l.color[0];
                data[base + 5] = l.color[1];
                data[base + 6] = l.color[2];
                data[base + 7] = l.color[3] ?? 1.0; // intensity — was never set before!
                // attn
                data[base + 8] = l.attn?.[0] ?? 1.0;
                data[base + 9] = l.attn?.[1] ?? 0.2;
                data[base + 10] = l.attn?.[2] ?? 0.04;
                data[base + 11] = 0.0;
            });
            this.wgpu.writeBuffer(this.lightsBuf, data);
        }
        this.wgpu.writeBuffer(this.lightCountBuf, new Uint32Array([
            count
        ]));
    }
    writeCameraUniform(camera, player, canvas) {
        const view = camera.viewMatrixFromPlayer(player);
        const proj = camera.projectionMatrixF32();
        const invProj = new Float32Array(Camera._invertMat4(Array.from(proj)));
        const data = new Float32Array(52);
        data.set(view, 0);
        data.set(proj, 16);
        data.set(invProj, 32);
        data[48] = camera.near;
        data[49] = camera.far;
        data[50] = canvas.width;
        data[51] = canvas.height;
        this.wgpu.writeBuffer(this.cameraBuf, data);
    }
    async _buildClusterPipelines() {
        const { device } = this.wgpu;
        const clusterBGL = device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: {
                        type: 'uniform'
                    }
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: {
                        type: 'storage'
                    }
                }
            ]
        });
        this.clusterBG = device.createBindGroup({
            layout: clusterBGL,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.cameraBuf
                    }
                },
                {
                    binding: 1,
                    resource: {
                        buffer: this.clusterBuf
                    }
                }
            ]
        });
        this.clusterPipeline = device.createComputePipeline({
            layout: device.createPipelineLayout({
                bindGroupLayouts: [
                    clusterBGL
                ]
            }),
            compute: {
                module: this.wgpu.createShaderModule(this.shaders.cluster),
                entryPoint: 'cs'
            }
        });
        const assignBGL = device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: {
                        type: 'uniform'
                    }
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: {
                        type: 'read-only-storage'
                    }
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: {
                        type: 'read-only-storage'
                    }
                },
                {
                    binding: 3,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: {
                        type: 'uniform'
                    }
                },
                {
                    binding: 4,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: {
                        type: 'storage'
                    }
                },
                {
                    binding: 5,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: {
                        type: 'storage'
                    }
                }
            ]
        });
        this.assignBG = device.createBindGroup({
            layout: assignBGL,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.cameraBuf
                    }
                },
                {
                    binding: 1,
                    resource: {
                        buffer: this.clusterBuf
                    }
                },
                {
                    binding: 2,
                    resource: {
                        buffer: this.lightsBuf
                    }
                },
                {
                    binding: 3,
                    resource: {
                        buffer: this.lightCountBuf
                    }
                },
                {
                    binding: 4,
                    resource: {
                        buffer: this.lightGridBuf
                    }
                },
                {
                    binding: 5,
                    resource: {
                        buffer: this.lightListBuf
                    }
                }
            ]
        });
        this.assignPipeline = device.createComputePipeline({
            layout: device.createPipelineLayout({
                bindGroupLayouts: [
                    assignBGL
                ]
            }),
            compute: {
                module: this.wgpu.createShaderModule(this.shaders.lightAssign),
                entryPoint: 'cs'
            }
        });
        this.fragLightBGL = device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {
                        type: 'uniform'
                    }
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {
                        type: 'read-only-storage'
                    }
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {
                        type: 'uniform'
                    }
                },
                {
                    binding: 3,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {
                        type: 'read-only-storage'
                    }
                },
                {
                    binding: 4,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {
                        type: 'read-only-storage'
                    }
                },
                {
                    binding: 5,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {
                        type: 'uniform'
                    }
                }
            ]
        });
        this.fragLightBG = device.createBindGroup({
            layout: this.fragLightBGL,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.cameraBuf
                    }
                },
                {
                    binding: 1,
                    resource: {
                        buffer: this.lightsBuf
                    }
                },
                {
                    binding: 2,
                    resource: {
                        buffer: this.lightCountBuf
                    }
                },
                {
                    binding: 3,
                    resource: {
                        buffer: this.lightGridBuf
                    }
                },
                {
                    binding: 4,
                    resource: {
                        buffer: this.lightListBuf
                    }
                },
                {
                    binding: 5,
                    resource: {
                        buffer: this.debugModeBuf
                    }
                }
            ]
        });
    }
    extractEmissiveLights() {
        const lights = [];
        for (const { node } of this.nodeRanges){
            const factor = node.mesh.emissiveFactor;
            if (!factor || factor[0] === 0 && factor[1] === 0 && factor[2] === 0) continue;
            // Compute world-space bounding box from vertex positions
            const verts = node.mesh.vertices;
            const wm = node.worldMatrix();
            let minX = Infinity, minY = Infinity, minZ = Infinity;
            let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
            for (const v of verts){
                const [lx, ly, lz] = v.position;
                // Transform to world space
                const wx = wm[0] * lx + wm[4] * ly + wm[8] * lz + wm[12];
                const wy = wm[1] * lx + wm[5] * ly + wm[9] * lz + wm[13];
                const wz = wm[2] * lx + wm[6] * ly + wm[10] * lz + wm[14];
                if (wx < minX) minX = wx;
                if (wx > maxX) maxX = wx;
                if (wy < minY) minY = wy;
                if (wy > maxY) maxY = wy;
                if (wz < minZ) minZ = wz;
                if (wz > maxZ) maxZ = wz;
            }
            const cx = (minX + maxX) / 2;
            const cy = (minY + maxY) / 2;
            const cz = (minZ + maxZ) / 2;
            // Radius = half diagonal of bounding box + padding so light reaches surroundings
            const dx = maxX - minX, dy = maxY - minY, dz = maxZ - minZ;
            const meshRadius = Math.sqrt(dx * dx + dy * dy + dz * dz) / 2;
            const lightRadius = meshRadius + 15.0; // how far the light reaches beyond the mesh
            const intensity = 0.01;
            const color = [
                factor[0],
                factor[1],
                factor[2]
            ];
            // For long thin fixtures, spawn multiple point lights along the length
            const longestAxis = dx > dy && dx > dz ? 0 : dy > dz ? 1 : 2;
            const span = [
                dx,
                dy,
                dz
            ][longestAxis];
            const numSamples = Math.max(1, Math.round(span / 4.0)); // one light every ~2 units
            for(let s = 0; s < numSamples; s++){
                const t = numSamples === 1 ? 0.5 : s / (numSamples - 1);
                const pos = [
                    cx,
                    cy,
                    cz
                ];
                if (longestAxis === 0) pos[0] = minX + t * dx;
                if (longestAxis === 1) pos[1] = minY + t * dy;
                if (longestAxis === 2) pos[2] = minZ + t * dz;
                lights.push({
                    position: [
                        ...pos,
                        lightRadius
                    ],
                    color: [
                        ...color,
                        intensity
                    ],
                    attn: [
                        1.0,
                        0.8,
                        0.18,
                        0.0
                    ]
                });
            }
        }
        return lights;
    }
    async loadMesh(meshNodes) {
        const { wgpu } = this;
        this.meshNodes = meshNodes;
        let totalVerts = 0;
        meshNodes.forEach((n)=>totalVerts += n.mesh.vertexCount);
        const posAll = new Float32Array(totalVerts * 3);
        const norAll = new Float32Array(totalVerts * 3);
        const uvAll = new Float32Array(totalVerts * 2);
        this.nodeRanges = [];
        let offset = 0;
        for (const node of meshNodes){
            const verts = node.mesh.vertices;
            verts.forEach((v, i)=>{
                posAll.set(v.position, (offset + i) * 3);
                norAll.set(v.normal, (offset + i) * 3);
                uvAll.set(v.uv, (offset + i) * 2);
            });
            this.nodeRanges.push({
                node,
                start: offset,
                count: verts.length
            });
            offset += verts.length;
        }
        this.posBuf = wgpu.createBuffer(posAll, GPUBufferUsage.STORAGE);
        this.norBuf = wgpu.createBuffer(norAll, GPUBufferUsage.STORAGE);
        this.uvBuf = wgpu.createBuffer(uvAll, GPUBufferUsage.STORAGE);
        this.uniformBufs = meshNodes.map(()=>wgpu.createEmptyBuffer(224, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST));
        this.texFlagBufs = meshNodes.map(()=>wgpu.createEmptyBuffer(4, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST));
        this.emissiveFlagBufs = meshNodes.map(()=>wgpu.createEmptyBuffer(4, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST));
        this.instanceBufs = meshNodes.map((node)=>{
            const matrices = node.instanceMatrices ?? Transform.identity();
            return wgpu.createBuffer(matrices, GPUBufferUsage.STORAGE);
        });
        this.gpuTextures = await Promise.all(meshNodes.map(async (node)=>{
            const img = node.mesh.images?.[0];
            return img ? wgpu.createTextureFromBitmap(img) : null;
        }));
        this.emissiveTextures = await Promise.all(meshNodes.map(async (node)=>{
            const img = node.mesh.emissiveImage;
            return img ? wgpu.createTextureFromBitmap(img) : null;
        }));
        await this._buildMeshPipeline();
    }
    async _buildMeshPipeline() {
        const { device, format } = this.wgpu;
        const vertModule = this.wgpu.createShaderModule(this.shaders.vert);
        const fragModule = this.wgpu.createShaderModule(this.shaders.frag);
        this.bgl = device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                    buffer: {
                        type: 'uniform'
                    }
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {
                        type: 'read-only-storage'
                    }
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {
                        type: 'read-only-storage'
                    }
                },
                {
                    binding: 3,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {
                        type: 'read-only-storage'
                    }
                },
                {
                    binding: 4,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {
                        sampleType: 'float'
                    }
                },
                {
                    binding: 5,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: {}
                },
                {
                    binding: 6,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {
                        type: 'uniform'
                    }
                },
                {
                    binding: 7,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {
                        sampleType: 'float'
                    }
                },
                {
                    binding: 8,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {
                        type: 'uniform'
                    }
                },
                {
                    binding: 9,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {
                        type: 'read-only-storage'
                    }
                }
            ]
        });
        this.bindGroups = this.uniformBufs.map((uniformBuf, i)=>{
            const albedoTex = this.gpuTextures[i] ?? this.fallbackTexture;
            const emissiveTex = this.emissiveTextures[i] ?? this.fallbackBlackTexture;
            const hasAlbedo = this.gpuTextures[i] ? 1 : 0;
            const hasEmissive = this.emissiveTextures[i] ? 1 : 0;
            this.wgpu.writeBuffer(this.texFlagBufs[i], new Uint32Array([
                hasAlbedo
            ]));
            this.wgpu.writeBuffer(this.emissiveFlagBufs[i], new Uint32Array([
                hasEmissive
            ]));
            return device.createBindGroup({
                layout: this.bgl,
                entries: [
                    {
                        binding: 0,
                        resource: {
                            buffer: uniformBuf
                        }
                    },
                    {
                        binding: 1,
                        resource: {
                            buffer: this.posBuf
                        }
                    },
                    {
                        binding: 2,
                        resource: {
                            buffer: this.norBuf
                        }
                    },
                    {
                        binding: 3,
                        resource: {
                            buffer: this.uvBuf
                        }
                    },
                    {
                        binding: 4,
                        resource: albedoTex.createView()
                    },
                    {
                        binding: 5,
                        resource: this.sampler
                    },
                    {
                        binding: 6,
                        resource: {
                            buffer: this.texFlagBufs[i]
                        }
                    },
                    {
                        binding: 7,
                        resource: emissiveTex.createView()
                    },
                    {
                        binding: 8,
                        resource: {
                            buffer: this.emissiveFlagBufs[i]
                        }
                    },
                    {
                        binding: 9,
                        resource: {
                            buffer: this.instanceBufs[i]
                        }
                    }
                ]
            });
        });
        this.pipeline = device.createRenderPipeline({
            layout: device.createPipelineLayout({
                bindGroupLayouts: [
                    this.bgl,
                    this.fragLightBGL
                ]
            }),
            vertex: {
                module: vertModule,
                entryPoint: 'vs'
            },
            fragment: {
                module: fragModule,
                entryPoint: 'fs',
                targets: [
                    {
                        format,
                        blend: {
                            color: {
                                srcFactor: 'src-alpha',
                                dstFactor: 'one-minus-src-alpha',
                                operation: 'add'
                            },
                            alpha: {
                                srcFactor: 'one',
                                dstFactor: 'zero',
                                operation: 'add'
                            }
                        }
                    }
                ]
            },
            primitive: {
                topology: 'triangle-list',
                cullMode: 'back',
                frontFace: 'ccw'
            },
            depthStencil: {
                format: 'depth32float',
                depthWriteEnabled: true,
                depthCompare: 'less'
            }
        });
    }
    writeNodeUniform(uniformBuf, modelMatrix, emissiveFactor, camera, player) {
        const data = new Float32Array(56);
        data.set(modelMatrix, 0);
        data.set(camera.viewMatrixFromPlayer(player), 16);
        data.set(camera.projectionMatrixF32(), 32);
        data.set(emissiveFactor, 48);
        data[51] = 0.0;
        this.wgpu.writeBuffer(uniformBuf, data);
    }
    frame(camera, player, colliderDebug) {
        if (!this.pipeline || !this.nodeRanges.length) return;
        const { wgpu } = this;
        const { device } = wgpu;
        this.nodeRanges.forEach((param, i)=>{
            let { node } = param;
            this.writeNodeUniform(this.uniformBufs[i], node.worldMatrix(), node.mesh.emissiveFactor ?? [
                0,
                0,
                0
            ], camera, player);
        });
        const encoder = device.createCommandEncoder();
        const clusterPass = encoder.beginComputePass();
        clusterPass.setPipeline(this.clusterPipeline);
        clusterPass.setBindGroup(0, this.clusterBG);
        clusterPass.dispatchWorkgroups(Renderer.CLUSTER_X, Renderer.CLUSTER_Y, Renderer.CLUSTER_Z);
        clusterPass.end();
        const assignPass = encoder.beginComputePass();
        assignPass.setPipeline(this.assignPipeline);
        assignPass.setBindGroup(0, this.assignBG);
        assignPass.dispatchWorkgroups(Renderer.CLUSTER_X, Renderer.CLUSTER_Y, Renderer.CLUSTER_Z);
        assignPass.end();
        const pass = encoder.beginRenderPass({
            colorAttachments: [
                {
                    view: wgpu.currentTextureView(),
                    clearValue: {
                        r: 0.0,
                        g: 0.0,
                        b: 0.0,
                        a: 1
                    },
                    loadOp: 'clear',
                    storeOp: 'store'
                }
            ],
            depthStencilAttachment: {
                view: wgpu.depthTextureView(),
                depthClearValue: 1.0,
                depthLoadOp: 'clear',
                depthStoreOp: 'store'
            }
        });
        pass.setPipeline(this.pipeline);
        pass.setBindGroup(1, this.fragLightBG);
        this.nodeRanges.forEach((param, i)=>{
            let { node, start, count } = param;
            const instanceCount = node.instanceCount ?? 1;
            pass.setBindGroup(0, this.bindGroups[i]);
            pass.draw(count, instanceCount, start, 0);
        });
        colliderDebug.draw(pass);
        pass.end();
        wgpu.submit(encoder);
    }
    static collectMeshNodes(node) {
        let list = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [];
        if (node.mesh) list.push(node);
        for (const child of node.children)Renderer.collectMeshNodes(child, list);
        return list;
    }
    // ── Capture / Record ──────────────────────────────────────
    /**
   * Convert a frames-per-second value to a millisecond interval.
   * @param {number} fps
   * @returns {number}
   */ static FpsToMS(fps) {
        return 1000 / fps;
    }
    /**
   * Capture the current front buffer as a PNG data URL.
   * Copies through an offscreen 2D canvas to handle WebGPU's opaque alpha.
   * @returns {Promise<string>} PNG data URL
   */ async capture() {
        const canvas = this.wgpu.canvas;
        // Flush the GPU queue so the frame is fully written before we read it.
        await this.wgpu.device.queue.onSubmittedWorkDone();
        const offscreen = document.createElement('canvas');
        offscreen.width = canvas.width;
        offscreen.height = canvas.height;
        offscreen.getContext('2d').drawImage(canvas, 0, 0);
        return offscreen.toDataURL('image/png');
    }
    /**
   * Repeatedly capture frames at a fixed interval, passing each PNG
   * data URL to onFrame. Returns a stop() function.
   *
   * @param {number}   intervalMs  — use Renderer.FpsToMS(fps)
   * @param {function(string): void} onFrame
   * @returns {function(): void} stop
   */ record() {
        let intervalMs = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : Renderer.FpsToMS(5), onFrame = arguments.length > 1 ? arguments[1] : void 0;
        let active = true;
        let lastTime = null;
        const tick = (timestamp)=>{
            if (!active) return;
            if (lastTime === null || timestamp - lastTime >= intervalMs) {
                lastTime = timestamp;
                this.capture().then((dataURL)=>{
                    if (active) onFrame(dataURL);
                });
            }
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        return ()=>{
            active = false;
        };
    }
}


},
515(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.d(__webpack_exports__, {
  A: () => (Transform)
});
class Transform {
    constructor(){
        this.position = [
            0,
            0,
            0
        ];
        this.rotation = [
            0,
            0,
            0
        ];
        this.scale = [
            1,
            1,
            1
        ];
    }
    static identity() {
        return new Float32Array([
            1,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1
        ]);
    }
    static multiply(a, b) {
        const out = new Array(16).fill(0);
        for(let col = 0; col < 4; col++){
            for(let row = 0; row < 4; row++){
                for(let k = 0; k < 4; k++){
                    out[col * 4 + row] += a[k * 4 + row] * b[col * 4 + k];
                }
            }
        }
        return out;
    }
    static translationMatrix(tx, ty, tz) {
        return [
            1,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1,
            0,
            tx,
            ty,
            tz,
            1
        ];
    }
    static scaleMatrix(sx, sy, sz) {
        return [
            sx,
            0,
            0,
            0,
            0,
            sy,
            0,
            0,
            0,
            0,
            sz,
            0,
            0,
            0,
            0,
            1
        ];
    }
    static rotationX(r) {
        const c = Math.cos(r), s = Math.sin(r);
        return [
            1,
            0,
            0,
            0,
            0,
            c,
            s,
            0,
            0,
            -s,
            c,
            0,
            0,
            0,
            0,
            1
        ];
    }
    static rotationY(r) {
        const c = Math.cos(r), s = Math.sin(r);
        return [
            c,
            0,
            s,
            0,
            0,
            1,
            0,
            0,
            -s,
            0,
            c,
            0,
            0,
            0,
            0,
            1
        ];
    }
    static rotationZ(r) {
        const c = Math.cos(r), s = Math.sin(r);
        return [
            c,
            -s,
            0,
            0,
            s,
            c,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1
        ];
    }
    toMatrix() {
        const T = Transform.translationMatrix(...this.position);
        const Rx = Transform.rotationX(this.rotation[0]);
        const Ry = Transform.rotationY(this.rotation[1]);
        const Rz = Transform.rotationZ(this.rotation[2]);
        const S = Transform.scaleMatrix(...this.scale);
        return Transform.multiply(T, Transform.multiply(Rx, Transform.multiply(Ry, Transform.multiply(Rz, S))));
    }
}


},
44(module, __unused_rspack___webpack_exports__, __webpack_require__) {
__webpack_require__.a(module, async function (__rspack_load_async_deps, __rspack_async_done) { try {
/* import */ var _engine_renderer_js__rspack_import_0 = __webpack_require__(156);
/* import */ var _engine_player_js__rspack_import_1 = __webpack_require__(710);
/* import */ var _engine_camera_js__rspack_import_2 = __webpack_require__(612);
/* import */ var _engine_physics_js__rspack_import_3 = __webpack_require__(402);
var __rspack_async_deps = __rspack_load_async_deps([_engine_physics_js__rspack_import_3]);
_engine_physics_js__rspack_import_3 = (__rspack_async_deps.then ? (await __rspack_async_deps)() : __rspack_async_deps)[0];









function _capsuleWireframe(halfHeight, radius) {
    const verts = [];
    const segs = 12;
    for(let i = 0; i < segs; i++){
        const a0 = i / segs * Math.PI * 2;
        const a1 = (i + 1) / segs * Math.PI * 2;
        verts.push(Math.cos(a0) * radius, halfHeight, Math.sin(a0) * radius);
        verts.push(Math.cos(a1) * radius, halfHeight, Math.sin(a1) * radius);
    }
    for(let i = 0; i < segs; i++){
        const a0 = i / segs * Math.PI * 2;
        const a1 = (i + 1) / segs * Math.PI * 2;
        verts.push(Math.cos(a0) * radius, -halfHeight, Math.sin(a0) * radius);
        verts.push(Math.cos(a1) * radius, -halfHeight, Math.sin(a1) * radius);
    }
    for(let i = 0; i < 4; i++){
        const a = i / 4 * Math.PI * 2;
        verts.push(Math.cos(a) * radius, halfHeight, Math.sin(a) * radius);
        verts.push(Math.cos(a) * radius, -halfHeight, Math.sin(a) * radius);
    }
    return new Float32Array(verts);
}
class App {
    async init() {
        this.ui = new UI().init();
        this.wgpu = new WGPU();
        await this.wgpu.init(document.querySelector('canvas.project-canvas'));
        this.wgpu.onResize = ()=>{
            this.camera.aspect = window.innerWidth / window.innerHeight;
        };
        const [vertSrc, fragSrc, clusterSrc, lightAssignSrc, debugSrc, bloomSrc] = await Promise.all([
            fetch('./shaders/vert.wgsl').then((r)=>r.text()),
            fetch('./shaders/frag.wgsl').then((r)=>r.text()),
            fetch('./shaders/cluster.wgsl').then((r)=>r.text()),
            fetch('./shaders/light_assign.wgsl').then((r)=>r.text()),
            fetch('./shaders/collider_debug.wgsl').then((r)=>r.text()),
            fetch('./shaders/bloom.wgsl').then((r)=>r.text())
        ]);
        this._debugSrc = debugSrc;
        this._shaders = {
            vert: vertSrc,
            frag: fragSrc,
            cluster: clusterSrc,
            lightAssign: lightAssignSrc,
            bloom: bloomSrc
        };
        this.renderer = new Renderer(this.wgpu, this._shaders);
        await this.renderer.init();
        await this._resetScene();
        this._initFPS();
    }
    async _resetScene() {
        if (this.physics) this.physics = null;
        if (this.colliderDebug) this.colliderDebug.clear();
        this.scene = new SceneGraph();
        this.player = new Player('player');
        this.player.transform.position = [
            0,
            5,
            5
        ];
        this.scene.root.children.push(this.player);
        this.player.parent = this.scene.root;
        this.camera = new Camera('camera');
        this.camera.transform.position = [
            0,
            this.player.eyeHeight,
            0
        ];
        this.physics = await new Physics().init();
        this.player.physicsBody = this.physics.addKinematic(this.player);
        if (!this.colliderDebug) {
            const debugSrc = this._debugSrc;
            this.colliderDebug = new ColliderDebug(this.wgpu.device, this.wgpu.format, this.renderer.cameraBuf);
            await this.colliderDebug.init(debugSrc);
        }
        this._addPlayerDebug();
    }
    _addPlayerDebug() {
        this.playerDebugHandle = this.colliderDebug.addCollider(_capsuleWireframe(this.player.capsuleHalfHeight, this.player.capsuleRadius), Transform.identity(), [
            0.0,
            0.5,
            1.0
        ], true);
    }
    async loadModel(file) {
        const rootNode = await ModelLoader.fromFile(file);
        const meshNodes = Renderer.collectMeshNodes(rootNode);
        const total = meshNodes.reduce((s, n)=>s + n.mesh.vertexCount, 0);
        console.log(`Loaded: ${file.name} - ${total} vertices across ${meshNodes.length} mesh node(s)`);
        await this._resetScene();
        await this.renderer.loadMesh(meshNodes);
        const emissiveLights = this.renderer.extractEmissiveLights();
        if (emissiveLights.length > 0) {
            this.renderer.setLights(emissiveLights);
            console.log(`Auto-generated ${emissiveLights.length} emissive point light(s)`);
        }
        for (const node of meshNodes){
            this.physics.addStatic(node);
            const verts = new Float32Array(node.mesh.vertices.length * 3);
            node.mesh.vertices.forEach((v, i)=>verts.set(v.position, i * 3));
            this.colliderDebug.addCollider(verts, node.worldMatrix(), [
                0.0,
                1.0,
                0.0
            ]);
        }
    }
    _initFPS() {
        this._fpsEl = this.ui.text({
            text: '-- fps',
            id: 'fps-counter'
        });
        this._fpsRing = new Float64Array(60);
        this._fpsHead = 0;
        this._fpsFull = false;
    }
    _updateFPS(dt) {
        this._fpsRing[this._fpsHead] = dt;
        this._fpsHead = (this._fpsHead + 1) % this._fpsRing.length;
        if (this._fpsHead === 0) this._fpsFull = true;
        const len = this._fpsFull ? this._fpsRing.length : this._fpsHead;
        let sum = 0;
        for(let i = 0; i < len; i++)sum += this._fpsRing[i];
        const avgFps = len / sum;
        if (this._fpsHead % 15 === 0) {
            this._fpsEl.textContent = `${avgFps.toFixed(0)} fps`;
        }
    }
    run() {
        let last = performance.now();
        const frame = ()=>{
            const now = performance.now();
            const dt = (now - last) / 1000;
            last = now;
            this.physics.step(dt);
            this.player.update(dt, this.physics);
            this._updateFPS(dt);
            this.renderer.writeCameraUniform(this.camera, this.player, this.wgpu.canvas);
            if (this.playerDebugHandle) {
                const pos = this.player.transform.position;
                const m = new Float32Array(Transform.identity());
                m[12] = pos[0];
                m[13] = pos[1];
                m[14] = pos[2];
                this.colliderDebug.updateModel(this.playerDebugHandle, m);
            }
            this.renderer.frame(this.camera, this.player, this.colliderDebug);
            requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
    }
}
const DEBUG_MODES = (/* unused pure expression or super */ null && ([
    {
        name: 'None',
        value: 0
    },
    {
        name: 'Cluster Grid',
        value: 1
    },
    {
        name: 'Light Heatmap',
        value: 2
    },
    {
        name: 'Z Slices',
        value: 3
    }
]));
async function execute() {
    const app = new App();
    await app.init();
    app.ui.parentPush({
        id: 'debug-menu',
        classOverrides: 'app-params-menu'
    });
    app.ui.parentPush({
        classOverrides: 'app-preset-dropdown'
    });
    app.ui.text({
        text: 'Debug:'
    });
    app.ui.dropdown({
        options: DEBUG_MODES,
        cb: (val)=>{
            app.renderer.setDebugMode(parseInt(val));
        }
    });
    app.ui.parentPop();
    app.ui.parentPop();
    app.ui.parentPush({
        id: 'app-project-title-root',
        classOverrides: 'app-project-title-root'
    });
    app.ui.textbox({
        text: "Clustered Forward Renderer",
        classOverrides: "app-project-title"
    });
    app.ui.parentPush({
        id: 'app-credit-menu-root',
        classOverrides: 'app-credit-menu-root'
    });
    app.ui.text({
        text: "The models used were from\u00A0",
        classOverrides: "app-credit",
        inline: true
    });
    app.ui.link({
        text: "https://thisisbranden.itch.io/spaceship-modules",
        href: "https://thisisbranden.itch.io/spaceship-modules",
        classOverrides: "app-credit app-credit-link"
    });
    app.ui.text({
        text: ", with slight modifications in blender.",
        classOverrides: "app-credit",
        inline: true
    });
    app.ui.parentPop();
    app.ui.parentPop();
    const canvas = document.querySelector('canvas.project-canvas');
    const modelPath = canvas.dataset.model;
    if (modelPath) {
        try {
            const res = await fetch(modelPath);
            const blob = await res.blob();
            const file = new File([
                blob
            ], modelPath.split('/').pop());
            await app.loadModel(file);
        } catch (e) {
            console.error('Failed to load model:', e);
        }
    }
    app.run();
}

__rspack_async_done();
} catch(e) { __rspack_async_done(e); } });

},
900(module) {
module.exports = import("https://cdn.jsdelivr.net/npm/@dimforge/rapier3d-compat@0.19.3/+esm").then(function(module) { return module; });

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
// webpack/runtime/define_property_getters
(() => {
__webpack_require__.d = (exports, definition) => {
	for(var key in definition) {
        if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
            Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
        }
    }
};
})();
// webpack/runtime/has_own_property
(() => {
__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
})();
// startup
// Load entry module and return exports
// This entry module used 'module' so it can't be inlined
var __webpack_exports__ = __webpack_require__(44);
})()
;