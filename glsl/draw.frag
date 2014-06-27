#ifdef GL_ES
precision mediump float;
#endif

uniform vec4 color;

const float DELTA = 0.2;

void main() {
    vec2 p = 2.0 * (gl_PointCoord - 0.5);
    float a = smoothstep(1.0 - DELTA, 1.0, length(p));
    gl_FragColor = mix(color, vec4(0, 0, 0, 0), a);
}
