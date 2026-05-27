// Each INSTANCE = one trail slot for one particle.
// instance_index encodes: particle_i = ii / TRAIL_LEN, slot = ii % TRAIL_LEN
//
// state1 layout per particle (STRIDE floats):
//   [0] px [1] py [2] vx [3] vy [4] head [5] hot [6] pad [7] pad
//   [8 + t*2], [9 + t*2]  =>  ring buffer position for slot t
//
// meta layout: [0] life [1] r [2] g [3] b

const TRAIL_LEN : u32 = 16u;
const STRIDE    : u32 = 8u + TRAIL_LEN * 2u;

struct Vin  { @location(0) pos: vec2f };
struct VOut {
  @builtin(position) clip : vec4f,
  @location(0)       col  : vec4f,
  @location(1)       uv   : vec2f,
}

@group(0) @binding(0) var<uniform> frame  : f32;
@group(0) @binding(1) var<uniform> res    : vec2f;
@group(0) @binding(2) var<storage> state1  : array<f32>;
@group(0) @binding(3) var<storage> state2  : array<f32>;
@group(0) @binding(4) var<uniform> params : vec4f; // x=dt, y=deathRate, z=speed, w=particleSize

@vertex
fn vs(input: Vin, @builtin(instance_index) ii: u32) -> VOut {
  var out: VOut;

  let particle = ii / TRAIL_LEN;   // which lead particle
  let ghost    = ii % TRAIL_LEN;   // which ghost in its trail (0 = oldest, TRAIL_LEN-1 = newest)

  let sb = particle * STRIDE;
  let mb = particle * 4u;

  let head   = u32(state1[sb + 4u]);
  let hot    = state1[sb + 5u];
  let life   = state2[mb + 0u];
  let r      = state2[mb + 1u];
  let g      = state2[mb + 2u];
  let b      = state2[mb + 3u];

  // Ring buffer: slot for this ghost.
  // ghost=0 is the oldest stored position, ghost=TRAIL_LEN-1 the most recent.
  // head points to the NEXT write slot, so the newest written slot is (head - 1).
  // We offset backwards: slot_index = (head - 1 - ghost + TRAIL_LEN) % TRAIL_LEN
  let slot = (head + TRAIL_LEN - 1u - ghost) % TRAIL_LEN;

  let tx = state1[sb + 8u + slot * 2u + 0u];
  let ty = state1[sb + 8u + slot * 2u + 1u];

  // Ghost age: 0.0 = newest (lead), 1.0 = oldest (tail)
  let age = f32(ghost) / f32(TRAIL_LEN - 1u);

  // Size: lead dot full size, ghosts shrink toward the tail
  let baseSize = select(0.0, (0.005 + life * 0.004) * params.w, hot > 0.5);
  let size     = baseSize * (1.0 - age * 0.75);
  let aspect   = res.y / res.x;

  out.clip = vec4f(tx + input.pos.x * size * aspect, ty + input.pos.y * size, 0.0, 1.0);

  // Opacity: lead is full, each ghost fades with a smooth curve toward transparent
  let alpha = clamp(life * 2.0, 0.0, 1.0) * pow(1.0 - age, 2.2);
  out.col   = vec4f(r, g, b, alpha);
  out.uv    = input.pos;
  return out;
}

@fragment
fn fs(in: VOut) -> @location(0) vec4f {
  let dist = length(in.uv);
  if (dist > 1.0) { discard; }

  // Tight bright core + faint halo — glowing bead look
  let core = 1.0 - smoothstep(0.0, 0.45, dist);
  let halo = 1.0 - smoothstep(0.3,  1.0, dist);

  let brightness = core * 1.2 + halo * 0.12;
  let rgb = in.col.rgb * brightness + vec3f(core * 0.5, core * 0.25, 0.0);

  return vec4f(rgb, in.col.a * (core * 0.9 + halo * 0.1));
}
