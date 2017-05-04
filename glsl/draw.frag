#ifdef GL_ES
precision highp float;
#endif

uniform vec4 color;
varying vec2 velocity;

const float DELTA = 0.2;

void main() {
    vec2 p = 2.0 * (gl_PointCoord - 0.5);
    float a = smoothstep(1.0 - DELTA, 1.0, length(p));
    float e = 0.0 + length(velocity) / 3.0;
    gl_FragColor = pow(mix(color, vec4(0, 0, 0, 0), a), vec4(e));
}
