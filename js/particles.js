/*global Igloo */

function Particles(canvas, nparticles) {
    var igloo = this.igloo = new Igloo(canvas),
        gl = igloo.gl,
        maxTexture = gl.getParameter(gl.MAX_TEXTURE_SIZE),
        tw = Math.ceil(Math.sqrt(nparticles)),
        th = Math.floor(Math.sqrt(nparticles)),
        w = canvas.width, h = canvas.height;
    gl.disable(gl.DEPTH_TEST);
    this.statesize = new Float32Array([tw, th]);
    this.worldsize = new Float32Array([w, h]);
    this.scale = Math.floor(Math.pow(Particles.BASE, 2) / Math.max(w, h) / 2);
    this.size = 10;
    this.color = new Float32Array([0.14, 0.62, 1, 1]);
    this.gravity = new Float32Array([0, -0.10]);

    var indexes = new Float32Array(tw * th * 2);
    for (var y = 0; y < th; y++) {
        for (var x = 0; x < tw; x++) {
            var i = y * tw * 2 + x * 2;
            indexes[i + 0] = x;
            indexes[i + 1] = y;
        }
    }

    function texture() {
        return igloo.texture(null, gl.RGBA, gl.CLAMP_TO_EDGE, gl.NEAREST)
            .blank(tw, th);
    }

    this.programs = {
        update: igloo.program('glsl/quad.vert', 'glsl/update.frag'),
        draw:   igloo.program('glsl/draw.vert', 'glsl/draw.frag')
    };
    this.buffers = {
        quad: igloo.array(Igloo.QUAD2),
        indexes: igloo.array(indexes)
    };
    this.textures = {
        p0: texture(),
        p1: texture(),
        v0: texture(),
        v1: texture()
    };
    this.framebuffers = {
        step: igloo.framebuffer()
    };

    this.fill();
    this.running = false;
}

Particles.BASE = 255;

Particles.encode = function(value, scale) {
    var b = Particles.BASE;
    value = value * scale + b * b / 2;
    var pair = [
        Math.floor((value % b) / b * 255),
        Math.floor(Math.floor(value / b) / b * 255)
    ];
    return pair;
};

Particles.decode = function(pair, scale) {
    var b = Particles.BASE;
    return (((pair[0] / 255) * b +
             (pair[1] / 255) * b * b) - b * b / 2) / scale;
};

Particles.prototype.fill = function() {
    var tw = this.statesize[0], th = this.statesize[1],
        w = this.worldsize[0], h = this.worldsize[1],
        s = this.scale,
        rgbaP = new Uint8Array(tw * th * 4),
        rgbaV = new Uint8Array(tw * th * 4);
    for (var y = 0; y < th; y++) {
        for (var x = 0; x < tw; x++) {
            var i = y * tw * 4 + x * 4,
                px = Particles.encode(Math.random() * w, s),
                py = Particles.encode(Math.random() * h, s),
                vx = Particles.encode(0, s),
                vy = Particles.encode(0, s);
            rgbaP[i + 0] = px[0];
            rgbaP[i + 1] = px[1];
            rgbaP[i + 2] = py[0];
            rgbaP[i + 3] = py[1];
            rgbaV[i + 0] = vx[0];
            rgbaV[i + 1] = vx[1];
            rgbaV[i + 2] = vy[0];
            rgbaV[i + 3] = vy[1];
        }
    }
    this.textures.p0.subset(rgbaP, 0, 0, tw, th);
    this.textures.v0.subset(rgbaV, 0, 0, tw, th);
    return this;
};

Particles.prototype.get = function() {
    var gl = this.igloo.gl;
    this.framebuffers.step.attach(this.textures.p0);
    var w = this.statesize[0], h = this.statesize[1],
        s = this.scale,
        rgba = new Uint8Array(w * h * 4);
    gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, rgba);
    var particles = [];
    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            var i = y * w * 4 + x * 4,
                px = Particles.decode([rgba[i + 0], rgba[i + 1]], s),
                py = Particles.decode([rgba[i + 2], rgba[i + 3]], s);
            particles.push({x: px, y: py});
        }
    }
    return particles;
};

Particles.prototype.swap = function() {
    var tmp = this.textures.p0;
    this.textures.p0 = this.textures.p1;
    this.textures.p1 = tmp;
    tmp = this.textures.v0;
    this.textures.v0 = this.textures.v1;
    this.textures.v1 = tmp;
    return this;
};


Particles.prototype.step = function() {
    var igloo = this.igloo, gl = igloo.gl;
    gl.disable(gl.BLEND);
    this.framebuffers.step.attach(this.textures.p1);
    this.textures.p0.bind(0);
    this.textures.v0.bind(1);
    gl.viewport(0, 0, this.statesize[0], this.statesize[1]);
    this.programs.update.use()
        .attrib('quad', this.buffers.quad, 2)
        .uniformi('position', 0)
        .uniformi('velocity', 1)
        .uniform('scale', this.scale)
        .uniform('gravity', this.gravity)
        .uniformi('derivative', 0)
        .draw(gl.TRIANGLE_STRIP, Igloo.QUAD2.length / 2);
    this.framebuffers.step.attach(this.textures.v1);
    this.programs.update
        .uniformi('derivative', 1)
        .draw(gl.TRIANGLE_STRIP, Igloo.QUAD2.length / 2);
    this.swap();
    return this;
};

Particles.prototype.draw = function() {
    var igloo = this.igloo, gl = igloo.gl;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    igloo.defaultFramebuffer.bind();
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    this.textures.p0.bind(0);
    gl.viewport(0, 0, this.worldsize[0], this.worldsize[1]);
    this.programs.draw.use()
        .attrib('index', this.buffers.indexes, 2)
        .uniformi('positions', 0)
        .uniform('statesize', this.statesize)
        .uniform('worldsize', this.worldsize)
        .uniform('size', this.size)
        .uniform('scale', this.scale)
        .uniform('color', this.color)
        .draw(gl.POINTS, this.statesize[0] * this.statesize[1]);
    return this;
};

Particles.prototype.frame = function() {
    window.requestAnimationFrame(function() {
        if (this.running) {
            this.step().draw().frame();
        }
    }.bind(this));
    return this;
};

Particles.prototype.start = function() {
    if (!this.running) {
        this.running = true;
        this.frame();
    }
    return this;
};

Particles.prototype.stop = function() {
    this.running = false;
    return this;
};
