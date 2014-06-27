function Controller(particles) {
    this.particles = particles;
    this.obstacle = particles.addObstacle([0, 0], 20);
    this.obstacle.enabled = false;
    particles.updateObstacles();

    var _this = this,
        canvas = particles.igloo.gl.canvas;
    $(canvas).on('mousemove', function(event) {
        console.log('move');
        var $target = $(event.target),
            offset = $target.offset(),
            border = 1,
            x = event.pageX - offset.left - border,
            y = $target.height() - (event.pageY - offset.top - border);
        _this.obstacle.position[0] = x;
        _this.obstacle.position[1] = y;
        _this.obstacle.enabled = true;
        particles.updateObstacles();
    });
    $(canvas).on('mouseout', function() {
        _this.obstacle.enabled = false;
        particles.updateObstacles();
    });
}
