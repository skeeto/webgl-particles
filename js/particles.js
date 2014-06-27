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
    this.scale = new Float32Array([Math.max(w, h), Math.max(w, h) / 10]);
    this.size = 15;
    this.color = new Float32Array([0.14, 0.62, 1, 1]);
    this.gravity = new Float32Array([0, 0.10]);

    var indexes = new Float32Array(tw * th * 2);
    for (var y = 0; y < th; y++) {
        for (var x = 0; x < tw; x++) {
            var i = y * tw * 2 + x * 2;
            indexes[i + 0] = x;
            indexes[i + 1] = y;
        }
    }

    this.programs = {
        step: igloo.program('glsl/quad.vert', 'glsl/step.frag'),
        draw: igloo.program('glsl/draw.vert', 'glsl/draw.frag')
    };
    this.buffers = {
        quad: igloo.array(Igloo.QUAD2),
        indexes: igloo.array(indexes)
    };
    this.textures = {
        fore: igloo.texture(null, gl.RGBA, gl.CLAMP_TO_EDGE, gl.NEAREST)
            .blank(tw, th),
        back: igloo.texture(null, gl.RGBA, gl.CLAMP_TO_EDGE, gl.NEAREST)
            .blank(tw, th)
    };
    this.framebuffers = {
        step: igloo.framebuffer()
    };

    this.fill();
    this.running = false;
}

Particles.prototype.fill = function() {
    var tw = this.statesize[0], th = this.statesize[1],
        w = this.worldsize[0], h = this.worldsize[1],
        s = this.scale[0],
        rgba = new Uint8Array(tw * th * 4);
    for (var y = 0; y < th; y++) {
        for (var x = 0; x < tw; x++) {
            var i = y * tw * 4 + x * 4;
            rgba[i + 0] = Math.random() * w * (255 / s);
            rgba[i + 1] = Math.random() * h * (255 / s);
            rgba[i + 2] = 0;
            rgba[i + 3] = 0;
        }
    }
    this.textures.fore.subset(rgba, 0, 0, tw, th);
    return this;
};

Particles.prototype.swap = function() {
    var tmp = this.textures.fore;
    this.textures.fore = this.textures.back;
    this.textures.back = tmp;
    return this;
};


Particles.prototype.step = function() {
    var igloo = this.igloo, gl = igloo.gl;
    this.framebuffers.step.bind().attach(this.textures.back);
    gl.disable(gl.BLEND);
    this.textures.fore.bind(0);
    gl.viewport(0, 0, this.statesize[0], this.statesize[1]);
    this.programs.step.use()
        .attrib('quad', this.buffers.quad, 2)
        .uniformi('state', 0)
        .uniform('scale', this.scale)
        .uniform('gravity', this.gravity)
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
    this.textures.fore.bind(0);
    gl.viewport(0, 0, this.worldsize[0], this.worldsize[1]);
    this.programs.draw.use()
        .attrib('index', this.buffers.indexes, 2)
        .uniformi('particles', 0)
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
