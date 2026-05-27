// Buffer layout per particle (STRIDE = 8 + TRAIL_LEN*2 floats):
//   [0] px, [1] py, [2] vx, [3] vy
//   [4] head (ring buffer write index, float cast), [5] hot (1=alive), [6] pad, [7] pad
//   [8 .. 8+TRAIL_LEN*2-1] ring buffer of (x,y) trail positions

// state2 layout per particle (4 floats):
//   [0] life, [1] r, [2] g, [3] b

const TRAIL_LEN : u32 = 16u;
const STRIDE    : u32 = 8u + TRAIL_LEN * 2u; // floats per particle in state1

@group(0) @binding(0) var<uniform>             res    : vec2f;
@group(0) @binding(1) var<storage, read_write> state1  : array<f32>;
@group(0) @binding(2) var<storage, read_write> state2  : array<f32>;
@group(0) @binding(3) var<uniform>             spawn  : vec4f; // xy=pos, z=trigger, w=seed
@group(0) @binding(4) var<uniform>             params : vec4f; // x=dt, y=deathRate, z=speed, w=unused

fn hash(n: f32) -> f32 { return fract(sin(n) * 43758.5453); }

fn cellindex(cell: vec3u) -> u32 {
  return cell.x + cell.y * 8u + cell.z * 64u;
}

@compute @workgroup_size(8, 8)
fn cs(@builtin(global_invocation_id) cell: vec3u) {
  let i = cellindex(cell);
  let total = arrayLength(&state1) / STRIDE;
  if (i >= total) { return; }

  let sb = i * STRIDE;  // state1 base for particle i
  let mb = i * 4u;      // state12 base

  var px     = state1[sb + 0u];
  var py     = state1[sb + 1u];
  var vx     = state1[sb + 2u];
  var vy     = state1[sb + 3u];
  var head   = u32(state1[sb + 4u]);
  var hot = state1[sb + 5u];

  var life = state2[mb + 0u];
  var r    = state2[mb + 1u];
  var g    = state2[mb + 2u];
  var b    = state2[mb + 3u];

  let fi        = f32(i);
  let n         = f32(total);
  let dt        = params.x;
  let deathRate = params.y;
  let speed     = params.z;
  let seed      = spawn.w;

  // --- SPAWN ---
  if (life <= 0.0 && spawn.z > 0.5) {
    let angle = (fi / n) * 6.28318 + hash(fi + seed) * 0.3;
    let spd   = (0.2 + hash(fi + seed + 3.7) * 0.6) * speed;

    px = spawn.x;
    py = spawn.y;
    vx = cos(angle) * spd;
    vy = sin(angle) * spd;
    life   = 0.8 + hash(fi + seed + 1.1) * 0.5;
    hot = 1.0;
    head   = 0u;

    // Zero out the entire ring buffer so old ghost positions don't bleed through
    for (var t = 0u; t < TRAIL_LEN; t++) {
      state1[sb + 8u + t * 2u + 0u] = px;
      state1[sb + 8u + t * 2u + 1u] = py;
    }

    // Warm palette: gold-white / amber / orange-red / deep red
    let hue = hash(fi + seed + 7.3);
    if (hue < 0.35) {
      r = 1.0; g = 0.88 + hash(fi) * 0.12; b = 0.3 + hash(fi + 1.0) * 0.2;
    } else if (hue < 0.6) {
      r = 1.0; g = 0.55 + hash(fi) * 0.25; b = 0.05;
    } else if (hue < 0.82) {
      r = 1.0; g = 0.25 + hash(fi) * 0.2;  b = 0.02;
    } else {
      r = 0.85 + hash(fi) * 0.15; g = 0.08; b = 0.0;
    }
  }

  // --- UPDATE ---
  if (life > 0.0) {
    // Write current position into ring buffer BEFORE moving
    let slot = head % TRAIL_LEN;
    state1[sb + 8u + slot * 2u + 0u] = px;
    state1[sb + 8u + slot * 2u + 1u] = py;
    head = (head + 1u) % TRAIL_LEN;

    // Physics
    vy   -= 0.22 * dt;
    vx   *= 1.0 - deathRate * 1.4 * dt;
    vy   *= 1.0 - deathRate * 1.4 * dt;
    px   += vx * dt;
    py   += vy * dt;
    life -= deathRate * dt;

    // Warm ember fade
    let t  = clamp(life, 0.0, 1.0);
    let t2 = t * t;
    r = mix(0.35, r, t);
    g = mix(0.0,  g, t2);
    b = mix(0.0,  b, t2 * t);

    if (life <= 0.0) { life = 0.0; hot = 0.0; }
  }

  state1[sb + 0u] = px;
  state1[sb + 1u] = py;
  state1[sb + 2u] = vx;
  state1[sb + 3u] = vy;
  state1[sb + 4u] = f32(head);
  state1[sb + 5u] = hot;

  state2[mb + 0u] = life;
  state2[mb + 1u] = r;
  state2[mb + 2u] = g;
  state2[mb + 3u] = b;
}
