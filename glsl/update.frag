#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D position;
uniform sampler2D velocity;
uniform sampler2D obstacles;
uniform int derivative;
uniform float scale;
uniform float random;
uniform vec2 gravity;
uniform float restitution;
uniform vec2 worldsize;
varying vec2 index;

const float BASE = 255.0;
const float OFFSET = BASE * BASE / 2.0;

float decode(vec2 channels) {
    return (dot(channels, vec2(BASE, BASE * BASE)) - OFFSET) / scale;
}

vec2 encode(float value) {
    value = value * scale + OFFSET;
    float x = mod(value, BASE);
    float y = floor(value / BASE);
    return vec2(x, y) / BASE;
}

void updatePosition(inout vec2 p, inout vec2 v, vec2 obstacle) {
    p += v;
    if (p.y <= 0.0 || p.x < 0.0 || p.x > worldsize.x) {
        /* Left the world, reset particle. */
        p.y += worldsize.y + random + (index.y - 0.5) * sign(random);
        p.x = mod(p.x + random * 10.0, worldsize.x);
    }
    if (length(obstacle) > 0.5) {
        p -= v;        // back out velocity change
        p += obstacle; // push out out obstacle
    }
}

void updateVelocity(inout vec2 p, inout vec2 v, vec2 obstacle) {
    v += gravity;
    if (p.y + v.y < -1.0) {
        /* Left the world, reset particle. */
        v.x = v.x + random / 2.0 + (index.x - 0.5) * sign(random);
        v.y = 0.0;
    }
    if (length(obstacle) > 0.5) {
        if (length(v) < 0.5) {
            v = obstacle * 0.5; // velocity too low, jiggle outward
        } else {
            v = reflect(v, obstacle) * restitution; // bounce
        }
    }
}

void main() {
    vec4 psample = texture2D(position, index);
    vec4 vsample = texture2D(velocity, index);
    vec2 p = vec2(decode(psample.rg), decode(psample.ba));
    vec2 v = vec2(decode(vsample.rg), decode(vsample.ba));
    vec2 obstacle = (texture2D(obstacles, p / worldsize).xy - 0.5) * 2.0;
    vec2 result;
    if (derivative == 0) {
        updatePosition(p, v, obstacle);
        result = p;
    } else {
        updateVelocity(p, v, obstacle);
        result = v;
    }
    gl_FragColor = vec4(encode(result.x), encode(result.y));
}
