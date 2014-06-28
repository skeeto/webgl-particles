/**
 * A very crude FPS counter.
 * @constructor
 */
function FPS(thing) {
    var lasttime = Date.now(),
        count = 0,
        $fps = $('.fps');
    thing.listeners.push(function() {
        count++;
        var date = Date.now();
        if (date >= lasttime + 1000) {
            $fps.text(Math.round(count / (date - lasttime) * 1000));
            lasttime = date;
            count = 0;
        }
    });
}
