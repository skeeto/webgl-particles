function Controller(particles) {
    this.particles = particles;
    this.obstacle = null;
    this.init();

    var _this = this,
        canvas = particles.igloo.gl.canvas;
    $(canvas).on('mousemove', function(event) {
        var coords = Controller.coords(event);
        _this.obstacle.position[0] = coords[0];
        _this.obstacle.position[1] = coords[1];
        _this.obstacle.enabled = true;
        particles.updateObstacles();
    });
    $(canvas).on('mouseout', function() {
        _this.obstacle.enabled = false;
        particles.updateObstacles();
    });
    $(canvas).on('mouseup', function(event) {
        if (event.which === 1) {
            var center = _this.obstacle.position,
            radius = _this.obstacle.size;
            particles.addObstacle(center.slice(0), radius);
            particles.updateObstacles();
        }
    });
    $(canvas).on('mousedown', function(event) {
        if (event.which === 2) {
            particles.obstacles.length = 0;
            _this.init();
            event.preventDefault();
            return false;
        }
        return true;
    });
}

Controller.prototype.init = function() {
    this.obstacle = this.particles.addObstacle([0, 0], 20);
    this.obstacle.enabled = false;
    this.particles.updateObstacles();
};

Controller.coords = function(event) {
    var $target = $(event.target),
        offset = $target.offset(),
        border = 1,
        x = event.pageX - offset.left - border,
        y = $target.height() - (event.pageY - offset.top - border);
    return [x, y];
};
