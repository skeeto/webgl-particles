/*global updateCount x*/

/**
 * User interface connection to the simulation.
 * @constructor
 */
function Controller(particles) {
    this.particles = particles;
    this.obstacle = null;
    this.init();
    this.mousedown = false;

    var _this = this,
        canvas = particles.igloo.gl.canvas;
    $(canvas).on('mousemove', function(event) {
        var coords = Controller.coords(event);
        _this.obstacle.position[0] = coords[0];
        _this.obstacle.position[1] = coords[1];
        _this.obstacle.enabled = true;
        particles.updateObstacles();
        if (_this.mousedown) _this.place();
    });
    $(canvas).on('mouseout', function() {
        _this.obstacle.enabled = false;
        particles.updateObstacles();
        _this.mousedown = false;
    });
    $(canvas).on('mousedown', function() {
        _this.mousedown = true;
    });
    $(canvas).on('mouseup', function(event) {
        if (event.which === 1) _this.place();
        _this.mousedown = false;
    });
    $(window).on('keyup', function(event) {
        switch (event.which) {
        case 67: // c
            _this.clear();
            break;
        case 68: // d
            _this.adjust(2);
            break;
        case 72: // h
            _this.adjust(0.5);
            break;
        }
    });
    this.controls = {
        increase: $('.controls .increase').on('click', function() {
            _this.adjust(2);
        }),
        decrease: $('.controls .decrease').on('click', function() {
            _this.adjust(0.5);
        }),
        pcolor: $('.controls .particles .color').on('change', function(event) {
            var value = $(event.target).val();
            _this.particles.color = Controller.parseColor(value);
        }),
        reset: $('.controls .reset').on('click', function() {
            _this.adjust(1);
        }),
        psize: $('.controls .particles .size').on('input', function() {
            _this.particles.size = Number($(this).val());
        }),
        gravity: $('.controls .particles .gravity').on('input', function() {
            _this.particles.gravity[1] = -Number($(this).val());
        }),
        wind: $('.controls .particles .wind').on('input', function() {
            _this.particles.wind[0] = Number($(this).val());
        }),
        restitution: $('.controls .restitution').on('input', function() {
            _this.particles.restitution = Number($(this).val());
        }),
        ocolor: $('.controls .obstacles .color').on('change', function(event) {
            var value = $(event.target).val();
            _this.particles.obstacleColor = Controller.parseColor(value);
        }),
        clear: $('.controls .clear').on('click', function() {
            _this.clear();
        }),
        osize: $('.controls .obstacles .size').on('change', function() {
            _this.obstacle.size = Number($(this).val());
            _this.particles.updateObstacles();
        }),
        save: $('.controls .save').on('click', function() {
            localStorage.snapshot = JSON.stringify(_this.save());
        }),
        restore: $('.controls .restore').on('click', function() {
            _this.restore(JSON.parse(localStorage.snapshot));
            updateCount();
        })
    };
}

/**
 * Create and capture the mouse obstacle.
 * @returns {Controller} this
 */
Controller.prototype.init = function() {
    this.obstacle = this.particles.addObstacle([0, 0], 20);
    this.obstacle.enabled = false;
    this.particles.updateObstacles();
    return this;
};

/**
 * Place a new obstacle at the mouse location.
 * @returns {Controller} this
 */
Controller.prototype.place = function() {
    var center = this.obstacle.position,
        radius = this.obstacle.size;
    this.particles.addObstacle(center.slice(0), radius);
    this.particles.updateObstacles();
    return this;
};

/**
 * Clear all obstacles.
 * @returns {Controller} this
 */
Controller.prototype.clear = function() {
    var size = this.obstacle.size;
    this.particles.obstacles.length = 0;
    this.init();
    this.obstacle.size = size;
    return this;
};

/**
 * Immediately adjust the particle count.
 * @param {number} factor multiplies the particle count
 * @returns {Controller} this
 */
Controller.prototype.adjust = function(factor) {
    var current = this.particles.getCount();
    this.particles.setCount(Math.max(1, current * factor));
    updateCount();
};

/**
 * Captures the simulation's particle count and obstacle configuration.
 * @returns {Object} the simulation save state object
 */
Controller.prototype.save = function() {
    var save = {
        gravity: this.particles.gravity,
        wind: this.particles.wind,
        size: this.particles.size,
        restitution: this.particles.restitution,
        particles: this.particles.getCount(),
        obstacles: []
    };
    this.particles.obstacles.forEach(function(o) {
        if (o.enabled) {
            save.obstacles.push({
                position: Controller.round(o.position),
                size: o.size
            });
        }
    });
    return save;
};

/**
 * Restore the simulation's state from a save object.
 * @param {Object} save
 * @returns {Controller} this
 */
Controller.prototype.restore = function(save) {
    if (this.particles.getCount() !== save.particles) {
        this.particles.setCount(save.particles);
    }
    this.clear();
    var ps = this.particles;
    this.controls.psize.val(ps.size = save.size);
    this.controls.gravity.val(ps.gravity = save.gravity);
    this.controls.wind.val(ps.wind = save.wind);
    this.controls.restitution.val(ps.restitution = save.restitution);
    save.obstacles.forEach(function(o) {
        ps.addObstacle(o.position, o.size);
    });
    return this;
};

/**
 * @param {Object} event
 * @returns {Array} the simulation coodinates from the event
 */
Controller.coords = function(event) {
    var $target = $(event.target),
        offset = $target.offset(),
        border = 1,
        x = event.pageX - offset.left - border,
        y = $target.height() - (event.pageY - offset.top - border);
    return [x, y];
};

/**
 * @param {Array|ArrayBufferView|value} value
 * @param {number} [precision=4]
 * @returns {Array|number} a copy of the array/value rounded to PRECISION
 */
Controller.round = function(value, precision) {
    precision = precision || 4;
    if ('length' in value) {
        return Array.prototype.map.call(value, function (x) {
            return Number(x.toPrecision(precision));
        });
    } else {
        return Number(value.toPrecision(precision));
    }
};

/**
 * @param {string} color
 * @returns {Array} a 4-element color array
 */
Controller.parseColor = function(color) {
    var colors = /#(..)(..)(..)/.exec(color).slice(1).map(function(x) {
        return parseInt(x, 16) / 255;
    });
    colors.push(1);
    return colors;
};
