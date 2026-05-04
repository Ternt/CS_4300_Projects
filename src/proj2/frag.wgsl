// --- TheSchwartz bindings ---------------------------------------------------------

@group(0) @binding(0) var<uniform> res   : vec2f;
@group(0) @binding(1) var<uniform> frame : f32;
@group(0) @binding(2) var<uniform> mouse : vec3f;
@group(0) @binding(3) var<uniform> audio : vec3f;
@group(0) @binding(4) var          backSampler : sampler;
@group(0) @binding(5) var          backBuffer  : texture_2d<f32>;
@group(1) @binding(0) var          videoBuffer : texture_external;
@group(1) @binding(1) var          videoSampler: sampler;

// --- TheSchwartz constants --------------------------------------------------------

const PI  : f32 = 3.14159265358979323846;
const PI2 : f32 = 6.28318530717958647692;

const red     : vec3f = vec3f(1.0, 0.0, 0.0);
const green   : vec3f = vec3f(0.0, 1.0, 0.0);
const blue    : vec3f = vec3f(0.0, 0.0, 1.0);
const purple  : vec3f = vec3f(0.5, 0.0, 1.0);
const pink    : vec3f = vec3f(1.0, 0.4, 0.7);
const teal    : vec3f = vec3f(0.0, 0.8, 0.8);
const black   : vec3f = vec3f(0.0, 0.0, 0.0);
const white   : vec3f = vec3f(1.0, 1.0, 1.0);
const orange  : vec3f = vec3f(1.0, 0.5, 0.0);
const magenta : vec3f = vec3f(1.0, 0.0, 1.0);
const brown   : vec3f = vec3f(0.6, 0.3, 0.1);
const yellow  : vec3f = vec3f(1.0, 1.0, 0.0);

// --- TheSchwartz utility functions ------------------------------------------------

// pixel position -> -1 to 1
fn uv(p: vec2f) -> vec2f {
  return (p / res) * 2.0 - vec2f(1.0);
}

// pixel position -> 0 to 1
fn uvN(p: vec2f) -> vec2f {
  return p / res;
}

// rotate a 2D point by angle (radians)
fn rotate(p: vec2f, angle: f32) -> vec2f {
  let c = cos(angle);
  let s = sin(angle);
  return vec2f(p.x * c - p.y * s, p.x * s + p.y * c);
}

// sample previous frame (expects normalized 0-1 coords)
fn lastframe(p: vec2f) -> vec4f {
  return textureSample(backBuffer, backSampler, p);
}

// sample webcam feed (expects normalized 0-1 coords, Chrome only)
fn video(p: vec2f) -> vec4f {
  return textureSampleBaseClampToEdge(videoBuffer, videoSampler, p);
}

// seconds elapsed
fn seconds() -> f32 {
  return frame / 60.0;
}

// milliseconds elapsed
fn ms() -> f32 {
  return (frame / 60.0) * 1000.0;
}

// --- Our Actual Shader Constants ------------------------------------------------

// Animation constants 
const anim_speed_modifier = 0.4;
const anim_length_s: f32 = anim_speed_modifier * 60.0;
const anim_clip_count: u32 = 2;

// Arpeggiator animation timing constants
const arp_anim_up_length: f32 = 1.025;
const arp_anim_down_length: f32 = 1.332;
const arp_anim_total_length: f32 = arp_anim_up_length + arp_anim_down_length;

// Circle SDF
fn sdf_circle( p : vec2f, r : f32 ) -> f32 {
  return length(p) - r;
}

@fragment 
fn fs( @builtin(position) pos : vec4f ) -> @location(0) vec4f {
  // Account for aspect ratio
  var aspect_ratio: f32 = res.x / res.y;
  var uv_coord: vec2f = uv(pos.xy);
  uv_coord.y *= -1;
  uv_coord.x *= aspect_ratio;

  // Animation time and completion percentage
  var elapsed_s: f32 = frame / 60.0;
  var total_anim_time: f32 = clamp(elapsed_s, 0.0, anim_length_s);
  var total_anim_percent: f32 = clamp(elapsed_s / anim_length_s, 0.0, 1.0);

  // Audio FFT processing
  var signal_strength: f32 = 0.05 * mix(0.5, 1.2, total_anim_percent);
  var fft_signal: f32 = signal_strength * (audio.x + audio.y + audio.z);
  var fft_anim_value = fft_signal;

  // chromatic aberration
  var ca_strength: vec2f = mix(vec2f(0.0), vec2f(0.015, 0.0), total_anim_percent);
  var radius: f32 = mix(0.01, 0.5, total_anim_percent) + fft_anim_value;
  var sdv: f32 = sdf_circle(uv_coord, radius);

  var dist: f32 = length(uv_coord);
  var arp_speed: f32 = frame * 0.6;
  var ripple_fade_strength: f32 = -40.0 * mix(0.5, 1.2, total_anim_percent);
  var ripple_fade: f32 = exp(ripple_fade_strength * sdv);

  var bg_color: vec3f = vec3f(1.0);
  var col: vec3f = bg_color;

  if (total_anim_time == anim_length_s) {
    bg_color = vec3f(1.0, 0.0, 0.0);
    col = bg_color;
  }

  if (sdv > 0.0) {
    col  = bg_color;
    col *= 1.0 - exp(-6.0 * abs(sdv));
    col *= ripple_fade * cos(150.0 * dist - arp_speed);
    col  = mix(col, bg_color, 1.0 - smoothstep(0.0, 0.01, abs(sdv)));
  }

  var screen_uv: vec2f = uvN(pos.xy);
  return vec4f(col, 1.0);
}
