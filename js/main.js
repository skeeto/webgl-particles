/* requestAnimationFrame shim */
if (window.requestAnimationFrame == null) {
    window.requestAnimationFrame =
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
}

var particles = null,
    controller = null;
$(document).ready(function() {
    var canvas = $('#display')[0];
    particles = new Particles(canvas, 1024 * 8, 3).draw().start();
    controller = new Controller(particles);
});
