#ifdef GL_ES
precision highp float;
#endif

attribute vec2 vert;
uniform vec2 position;
uniform vec2 worldsize;
uniform float size;

void main() {
    gl_Position = vec4(vert + (position / worldsize) * 2.0 - 1.0, 0, 1);
    gl_PointSize = size * 2.0;
}
