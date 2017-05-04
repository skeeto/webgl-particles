#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D background;
uniform vec4 color;
uniform vec2 worldsize;
varying vec2 index;

float get(vec2 offset) {
    vec2 p = index + offset / worldsize;
    return length((texture2D(background, p).xy - 0.5) * 2.0);
}

const float DIAG     = 0.011344;
const float ADJACENT = 0.083820;
const float CENTER   = 0.619347;

void main() {
    float norm =
        get(vec2( 1, -1)) * DIAG +
        get(vec2( 1,  0)) * ADJACENT +
        get(vec2( 1,  1)) * DIAG +
        get(vec2( 0, -1)) * ADJACENT +
        get(vec2( 0,  0)) * CENTER +
        get(vec2( 0,  1)) * ADJACENT +
        get(vec2(-1, -1)) * DIAG +
        get(vec2(-1,  0)) * ADJACENT +
        get(vec2(-1,  1)) * DIAG;
    gl_FragColor = mix(vec4(0, 0, 0, 0), color, norm);
}
