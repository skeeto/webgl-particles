#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D position;
uniform sampler2D velocity;
uniform int derivative;
uniform float scale;
uniform vec2 gravity;
varying vec2 index;

const float BASE = 255.0;

float decode(vec2 channels) {
    return dot(channels, vec2(BASE, BASE * BASE) / scale);
}

vec2 encode(float value) {
    value *= scale;
    float x = mod(value, BASE);
    float y = floor(value / BASE);
    return vec2(x, y) / BASE;
}

void updatePosition(inout vec2 p, inout vec2 v) {
    p += v;
}

void updateVelocity(inout vec2 p, inout vec2 v) {
    v += gravity;
}

void main() {
    vec4 psample = texture2D(position, index);
    vec4 vsample = texture2D(velocity, index);
    vec2 p = vec2(decode(psample.rg), decode(psample.ba));
    vec2 v = vec2(decode(vsample.rg), decode(vsample.ba));
    vec2 result;
    if (derivative == 0) {
        updatePosition(p, v);
        result = p;
    } else {
        updateVelocity(p, v);
        result = v;
    }
    gl_FragColor = vec4(encode(result.x), encode(result.y));
}
