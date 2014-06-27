#ifdef GL_ES
precision mediump float;
#endif

void main() {
    vec2 p = 2.0 * (gl_PointCoord - 0.5);
    vec2 norm;
    if (length(p) < 1.0) {
        norm = normalize(p * vec2(1, -1));
    } else {
        norm = vec2(0, 0);
    }
    gl_FragColor = vec4((norm + 1.0) / 2.0, 0, 1);
}
