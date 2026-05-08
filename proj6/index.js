import { default as seagulls } from 'https://cbcdn.githack.com/charlieroberts/gulls/raw/branch/main/gulls.js'

const WORKGROUP_SIZE  = 64
const VANTS_PER_CHUNK = 3
const NUM_CHUNKS      = 4                          // spawn this many clusters
const NUM_AGENTS      = NUM_CHUNKS * VANTS_PER_CHUNK
const DISPATCH_COUNT  = [Math.ceil(NUM_AGENTS / WORKGROUP_SIZE), 1, 1]
const GRID_SIZE       = 2
const CHUNK_RADIUS    = 0.05                       // fraction of screen

const W = Math.round(window.innerWidth  / GRID_SIZE)
const H = Math.round(window.innerHeight / GRID_SIZE)


// ==============================================================================
// RULE SYSTEM
//
// makeVant(rules, options) accepts an array of rule objects, each describing
// what a vant does when it encounters a specific pheromone value, plus an
// optional options object for per-vant appearance.
//
// rule object shape:
//   {
//     pheromone:      number, // pheromone value that triggers this rule (0 = empty, 1 = marked)
//     turn:           number, // fraction of full rotation to apply (+0.25 = CW 90°, -0.25 = CCW 90°)
//     writePheromone: number, // pheromone value to write at current cell after acting
//   }
//
// options object shape (all optional):
//   {
//     color: [r, g, b],  // RGB color for this vant type, each channel 0..1
//                        // defaults to [1, 0.15, 0.05] (red) if not specified
//   }
//
// returns a VantDef: an object the chunk system uses to configure vants and
// build the GPU rules buffer.
//
// rules are evaluated in order; first match wins.
// If no rule matches, the vant continues straight and writes nothing.
// ==============================================================================

function makeVant(rules = [], { color = [1, 0.15, 0.05] } = {}) {
  return { rules, color }
}

const VANT_DEFS = {
  // Classic Langton's Ant: turn right on empty, turn left on marked
  langton: makeVant([
    { pheromone: 0, turn:  0.25, writePheromone: 1 },
    { pheromone: 1, turn: -0.25, writePheromone: 0 },
  ], { color: [1.0, 0.15, 0.05] }),

  // Reversed: turn left on empty, turn right on marked
  reversed: makeVant([
    { pheromone: 0, turn: -0.25, writePheromone: 1 },
    { pheromone: 1, turn:  0.25, writePheromone: 0 },
  ], { color: [0.05, 0.5, 1.0] }),

  // Symmetric: always turn the same direction, toggle pheromone
  symmetric: makeVant([
    { pheromone: 0, turn:  0.10, writePheromone: 1 },
    { pheromone: 1, turn: -0.10, writePheromone: 0 },
  ], { color: [0.1, 1.0, 0.3] }),
}


// ==============================================================================
// CHUNK SYSTEM
//
// a chunk is a cluster of VANTS_PER_CHUNK vants that spawn near the same point.
// Each vant in a chunk can have a different VantDef (ruleset) and an optional
// per-vant offset relative to the chunk's center.
//
// defineChunk({ center, vants }) returns a ChunkDef:
//   center:  [fx, fy]         - normalized screen position (0..1, 0..1)
//   vants:   VantEntry[]      - one per vant in the chunk (length = VANTS_PER_CHUNK)
//
// VantEntry shape:
//   {
//     def:    VantDef,        - the ruleset/color definition for this vant
//     offset: [dx, dy],       - offset from chunk center in normalized coords (0..1)
//                               e.g. [0.02, -0.01] places the vant slightly right and up
//                               defaults to [0, 0] (exactly at center) if omitted
//   }
//
// if fewer than VANTS_PER_CHUNK entries are provided, the remainder are filled
// with the langton preset at [0, 0] offset.
// ==============================================================================

function defineChunk({ center = [0.5, 0.5], vants = [] }) {
  const entries = Array.from({ length: VANTS_PER_CHUNK }, (_, i) => {
    const entry = vants[i] ?? {}
    return {
      def:    entry.def    ?? VANT_DEFS.langton,
      offset: entry.offset ?? [0, 0],
    }
  })
  return { center, vants: entries }
}

// ==============================================================================
// CHUNK DEFINITIONS
// edit these to change the simulation layout and behaviour.
// each vant entry takes a def (VantDef) and an optional offset [dx, dy]
// in normalized coords relative to the chunk center.
// ==============================================================================

const chunks = [
  defineChunk({
    center: [0.25, 0.25],
    vants: [
      { def: VANT_DEFS.langton,   offset: [ 0.00,  0.00] },
      { def: VANT_DEFS.reversed,  offset: [ 0.005, 0.0005] },
      { def: VANT_DEFS.langton,   offset: [-0.01,  0.00] },
    ],
  }),
  defineChunk({
    center: [0.75, 0.25],
    vants: [
      { def: VANT_DEFS.reversed,  offset: [ 0.00,  0.03] },
      { def: VANT_DEFS.reversed,  offset: [ 0.00, -0.03] },
      { def: VANT_DEFS.symmetric, offset: [ 0.00,  0.00] },
    ],
  }),
  defineChunk({
    center: [0.25, 0.75],
    vants: [
      { def: VANT_DEFS.symmetric, offset: [-0.02, -0.02] },
      { def: VANT_DEFS.langton,   offset: [ 0.02,  0.00] },
      { def: VANT_DEFS.symmetric, offset: [-0.02,  0.02] },
    ],
  }),
  defineChunk({
    center: [0.75, 0.75],
    vants: [
      { def: VANT_DEFS.langton,   offset: [ 0.00,  0.00] },
      { def: VANT_DEFS.symmetric, offset: [ 0.02,  0.02] },
      { def: VANT_DEFS.reversed,  offset: [-0.02,  0.02] },
    ],
  }),
]


// ==============================================================================
// BUFFER CONSTRUCTION
//
// we build four separate CPU arrays:
//
//   vants_props  - [x, y, dir, ruleStart]  × NUM_AGENTS
//                  ruleStart points into the rules buffer so each vant
//                  can carry a different behavioural programme.
//
//   pheromones   - [value]  × (W × H)
//                  One float per grid cell. The compute shader reads and
//                  writes this every step.
//
//   vants_render - [value]  × (W × H)
//                  Cleared each frame by the JS onframe hook.
//                  The compute shader writes the vant's colorIndex+1 at
//                  the occupied cell so the fragment shader can look up
//                  the vant's color.
//
//   rules_buf    - [pheromone, turn, writePheromone, ruleCount,
//                   pheromone, turn, writePheromone, 0, ...]
//                  One 4-float entry per rule, all rulesets concatenated.
//                  The compute shader is told where each ruleset starts via
//                  the ruleStart stored in vants_props.
//
//   colors_buf   - [r, g, b, pad]  × NUM_UNIQUE_DEFS
//                  One entry per unique VantDef, in the same order as
//                  rulesetList. The fragment shader indexes into this with
//                  the colorIndex written into vants_render.
//
// ==============================================================================

// collect every unique VantDef referenced by any chunk and assign an index.
// rulesetOffset[defRef] = flat index of the first rule of that ruleset in rules_buf.

const rulesetList   = []          // ordered list of VantDefs (deduplicated by identity)
const rulesetOffset = new Map()   // VantDef → flat rule index (not float index)

for (const chunk of chunks) {
  for (const entry of chunk.vants) {
    const def = entry.def
    if (!rulesetOffset.has(def)) {
      rulesetOffset.set(def, rulesetList.length > 0
        ? rulesetOffset.get(rulesetList[rulesetList.length - 1]) +
          rulesetList[rulesetList.length - 1].rules.length
        : 0
      )
      rulesetList.push(def)
    }
  }
}

// build the flat rules buffer.
// each rule: [pheromone, turn, writePheromone, ruleCount (first entry only, else 0)]
// we encode ruleCount into slot [3] of the FIRST rule of each set so the shader
// knows when to stop iterating without needing a separate uniform.
const RULE_FLOATS = 4  // floats per rule entry (pheromone, turn, write, count)
let totalRules = 0
for (const def of rulesetList) totalRules += def.rules.length

const rules_cpu = new Float32Array(totalRules * RULE_FLOATS)
let ruleWriteIdx = 0

for (const def of rulesetList) {
  for (let ri = 0; ri < def.rules.length; ri++) {
    const rule = def.rules[ri]
    const base = ruleWriteIdx * RULE_FLOATS
    rules_cpu[base + 0] = rule.pheromone
    rules_cpu[base + 1] = rule.turn
    rules_cpu[base + 2] = rule.writePheromone
    rules_cpu[base + 3] = ri === 0 ? def.rules.length : 0
    ruleWriteIdx++
  }
}

// Build colors buffer: [r, g, b, pad] per unique VantDef, in rulesetList order.
const COLOR_FLOATS = 4
const colors_cpu = new Float32Array(rulesetList.length * COLOR_FLOATS)
for (let di = 0; di < rulesetList.length; di++) {
  const [r, g, b] = rulesetList[di].color
  colors_cpu[di * COLOR_FLOATS + 0] = r
  colors_cpu[di * COLOR_FLOATS + 1] = g
  colors_cpu[di * COLOR_FLOATS + 2] = b
  colors_cpu[di * COLOR_FLOATS + 3] = 0  // padding
}

// build vants_props: [x, y, dir, ruleStart] per agent.
// the offset field from each VantEntry is applied here in pixel space,
// scaled by W and H respectively so normalized offsets map to grid coords.
const NUM_PROPS   = 4
const vants_props = new Float32Array(NUM_AGENTS * NUM_PROPS)

// colorIndex_per_agent maps agent index -> index into colors_cpu / rulesetList.
// stored separately because vants_props only has 4 floats and all are used.
// the compute shader writes (colorIndex + 1) into vants_render so 0 means empty.
const colorIndex_per_agent = new Uint32Array(NUM_AGENTS)

let agentIdx = 0
for (const chunk of chunks) {
  const cx = chunk.center[0] * W
  const cy = chunk.center[1] * H

  for (let vi = 0; vi < VANTS_PER_CHUNK; vi++) {
    const entry      = chunk.vants[vi]
    const def        = entry.def
    const ruleStart  = rulesetOffset.get(def)
    const colorIndex = rulesetList.indexOf(def)
    const base       = agentIdx * NUM_PROPS

    // apply the per-vant offset (normalized) scaled to grid dimensions
    const ox = entry.offset[0] * W
    const oy = entry.offset[1] * H

    vants_props[base + 0] = Math.floor(cx + ox)    // x
    vants_props[base + 1] = Math.floor(cy + oy)    // y
    vants_props[base + 2] = vi / VANTS_PER_CHUNK   // dir (spread starting directions)
    vants_props[base + 3] = ruleStart              // ruleset start index

    colorIndex_per_agent[agentIdx] = colorIndex
    agentIdx++
  }
}

// pack colorIndex into a flat GPU buffer: one u32 per agent.
// the compute shader reads this at binding(4) to know which color to write.
const agent_colors_cpu = new Float32Array(NUM_AGENTS)
for (let i = 0; i < NUM_AGENTS; i++) {
  agent_colors_cpu[i] = colorIndex_per_agent[i]
}

const pheromones   = new Float32Array(W * H)
const vants_render = new Float32Array(W * H)


const render_shader = seagulls.constants.vertex + `
@group(0) @binding(0) var<storage> pheromones   : array<f32>;
@group(0) @binding(1) var<storage> vants_render  : array<f32>;
@group(0) @binding(2) var<storage> colors        : array<f32>; // [r,g,b,pad] per unique VantDef

@fragment
fn fs(@builtin(position) pos: vec4f) -> @location(0) vec4f {
  let gp   = floor(pos.xy / ${GRID_SIZE}.);
  let idx  = u32(gp.y * ${W}. + gp.x);
  let p    = pheromones[idx];
  let v    = vants_render[idx];  // 0 = empty, colorIndex+1 = vant present

  var col: vec3f;
  if (v > 0.5) {
    // Vant pixel: look up its color from the colors buffer
    let ci = u32(v - 1.0) * 4u;  // each color entry is 4 floats (r,g,b,pad)
    col = vec3f(colors[ci], colors[ci + 1u], colors[ci + 2u]);
  } else {
    // Empty cell: pheromone trail as greyscale intensity
    col = vec3(p * 0.85);
  }
  return vec4f(col, 1.);
}`


const compute_shader = `
struct VantProps {
  x:         f32,   // grid x position
  y:         f32,   // grid y position
  dir:       f32,   // heading as fraction of full rotation (0..1)
  ruleStart: f32,   // index of first rule entry for this vant's ruleset
}

// Each rule entry occupies 4 floats:
//   [0] pheromone      - pheromone value that triggers this rule
//   [1] turn           - heading delta (fraction of full rotation)
//   [2] writePheromone - value to stamp at current cell
//   [3] ruleCount      - total rules in this set (only in first entry, else 0)
struct Rule {
  pheromone:      f32,
  turn:           f32,
  writePheromone: f32,
  ruleCount:      f32,
}

@group(0) @binding(0) var<storage, read_write> vants_props   : array<VantProps>;
@group(0) @binding(1) var<storage, read_write> pheromones    : array<f32>;
@group(0) @binding(2) var<storage, read_write> vants_render  : array<f32>;
@group(0) @binding(3) var<storage, read_write> rules         : array<Rule>;
@group(0) @binding(4) var<storage, read_write> agent_colors  : array<f32>; // colorIndex per agent

fn gridIndex(x: f32, y: f32) -> u32 {
  let gx = u32(abs(x)) % ${W}u;
  let gy = u32(abs(y)) % ${H}u;
  return gy * ${W}u + gx;
}

@compute @workgroup_size(${WORKGROUP_SIZE}, 1, 1)
fn cs(@builtin(global_invocation_id) cell: vec3u) {
  if (cell.x >= ${NUM_AGENTS}u) { return; }

  let pi2  = ${Math.PI * 2};
  var vant = vants_props[cell.x];

  let pIdx = gridIndex(vant.x, vant.y);
  let pVal = pheromones[pIdx];

  // evalute rules
  // Read ruleCount from the first entry of this vant's ruleset.
  let startIdx  = u32(vant.ruleStart);
  let ruleCount = u32(rules[startIdx].ruleCount);

  var matched = false;
  for (var ri = 0u; ri < ruleCount; ri++) {
    let rule = rules[startIdx + ri];
    if (!matched && abs(pVal - rule.pheromone) < 0.01) {
      vant.dir         += rule.turn;
      pheromones[pIdx]  = rule.writePheromone;
      matched           = true;
    }
  }
  // No pheromone: continue straight, write nothing.

  // calculate movement
  let dir  = vec2f(sin(vant.dir * pi2), cos(vant.dir * pi2));
  vant.x   = round(vant.x + dir.x);
  vant.y   = round(vant.y + dir.y);

  vants_props[cell.x] = vant;

  // Write colorIndex+1 so the fragment shader can distinguish occupied cells
  // (value > 0) from empty cells (value == 0) and look up the right color.
  let newIdx = gridIndex(vant.x, vant.y);
  vants_render[newIdx] = agent_colors[cell.x] + 1.0;
}`


const sg = await seagulls.init()

const pheromones_b    = sg.buffer(pheromones)
const vants_props_b   = sg.buffer(vants_props)
const vants_render_b  = sg.buffer(vants_render)
const rules_b         = sg.buffer(rules_cpu)
const colors_b        = sg.buffer(colors_cpu)
const agent_colors_b  = sg.buffer(agent_colors_cpu)

const render = await sg.render({
  shader: render_shader,
  data: [
    pheromones_b,
    vants_render_b,
    colors_b,
  ],
})

const compute = sg.compute({
  shader: compute_shader,
  data: [
    vants_props_b,
    pheromones_b,
    vants_render_b,
    rules_b,
    agent_colors_b,
  ],
  onframe() { vants_render_b.clear() },
  dispatchCount: DISPATCH_COUNT,
})

sg.run(compute, render)
