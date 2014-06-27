#ifdef GL_ES
precision mediump float;
#endif

attribute vec2 index;
uniform sampler2D positions;
uniform sampler2D velocities;
uniform vec2 statesize;
uniform vec2 worldsize;
uniform float size;
uniform float scale;
varying vec2 velocity;

const float BASE = 255.0;
const float OFFSET = BASE * BASE / 2.0;

float decode(vec2 channels) {
    return (dot(channels, vec2(BASE, BASE * BASE)) - OFFSET) / scale;
}

void main() {
    vec4 psample = texture2D(positions, index / statesize);
    vec4 vsample = texture2D(velocities, index / statesize);
    vec2 p = vec2(decode(psample.rg), decode(psample.ba));
    velocity = vec2(decode(vsample.rg), decode(vsample.ba));
    gl_Position = vec4(p / worldsize * 2.0 - 1.0, 0, 1);
    gl_PointSize = size;
}
