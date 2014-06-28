#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D background;
uniform vec4 color;
varying vec2 index;

void main() {
    vec2 norm = (texture2D(background, index).xy - 0.5) * 2.0;
    if (length(norm) > 0.5) {
        gl_FragColor = color;
    } else {
        gl_FragColor = vec4(0, 0, 0, 0);
    }
}
