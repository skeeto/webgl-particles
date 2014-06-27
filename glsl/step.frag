#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D state;
uniform vec2 scale;
uniform vec2 gravity;
varying vec2 index;

void main() {
    vec4 particle = texture2D(state, index);
    vec2 position = particle.xy * scale;
    vec2 velocity = particle.zw * scale;
    position += velocity;
    velocity += gravity;
    gl_FragColor = vec4(position / scale, velocity / scale);
}
