#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D position;
uniform sampler2D velocity;
uniform float scale;
uniform vec2 gravity;
varying vec2 index;

float decode(vec2 channels) {
    return (channels[0] * 256.0 + channels[1] * 65536.0) / scale;
}

vec2 encode(float value) {
    value *= scale;
    float x = mod(value, 256.0) / 256.0;
    float y = value / 65536.0;
    return vec2(x, y);
}

void go(inout vec2 p, inout vec2 v) {
    p += v;
}
void main() {
    vec4 psample = texture2D(position, index);
    vec4 vsample = texture2D(velocity, index);
    vec2 p = vec2(decode(psample.rg), decode(psample.ba));
    vec2 v = vec2(decode(vsample.rg), decode(vsample.ba));
    //go(p, v);
    gl_FragColor = vec4(encode(p.x), encode(p.y));
}
