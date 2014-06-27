#ifdef GL_ES
precision mediump float;
#endif

attribute vec2 vert;
uniform vec2 position;
uniform float size;

void main() {
    gl_Position = vec4(vert + position, 0, 1);
    gl_PointSize = size * 2.0;
}
