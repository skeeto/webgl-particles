#ifdef GL_ES
precision mediump float;
#endif

attribute vec2 index;
uniform sampler2D particles;
uniform vec2 statesize;
uniform vec2 worldsize;
uniform float size;
uniform vec2 scale;

void main() {
    vec2 position = texture2D(particles, index / statesize).xy * scale.x;
    gl_Position = vec4(position / worldsize * 2.0 - 1.0, 0, 1);
    gl_PointSize = size;
}
