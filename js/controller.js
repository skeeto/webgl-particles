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
        if (event.which === 1) {
            _this.place();
            _this.mousedown = false;
        }
    });
    $(canvas).on('mousedown', function(event) {
        if (event.which === 2) {
            _this.clear();
            event.preventDefault();
            return false;
        } else {
            return true;
        }
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
    $('.controls .increase').on('click', function() {
        _this.adjust(2);
    });
    $('.controls .decrease').on('click', function() {
        _this.adjust(0.5);
    });
    $('.controls .reset').on('click', function() {
        _this.adjust(1);
    });
    $('.controls .bigger').on('click', function() {
        _this.obstacle.size *= 1.5;
        _this.particles.updateObstacles();
    });
    $('.controls .smaller').on('click', function() {
        _this.obstacle.size *= 0.67;
        _this.particles.updateObstacles();
    });
    $('.controls .clear').on('click', function() {
        _this.clear();
    });
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
    this.particles.obstacles.length = 0;
    this.init();
    return this;
};

/**
 * Immediately adjust the particle count.
 * @param {number} factor multiplies the particle count
 * @returns {Controller} this
 */
Controller.prototype.adjust = function(factor) {
    this.particles.setCount(this.particles.getCount() * factor);
    updateCount();
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
