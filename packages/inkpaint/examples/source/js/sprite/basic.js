InkPaint.loader.add("t1", "source/assets/bg_grass.jpg");
InkPaint.loader.add("bg_rotate", "source/assets/bg_rotate2.jpg");
InkPaint.loader.add("bunny", "source/assets/bunny.png");
InkPaint.loader.load(setup);

var app = new InkPaint.Application(800, 600, {
    backgroundColor: 0x1099bb,
    preserveDrawingBuffer: true
});
document.body.appendChild(app.view);

function setup(l, resources) {
    var bunny1 = new InkPaint.Sprite(resources.bunny.texture);
    var bunny2 = new InkPaint.Sprite(resources.bunny.texture);
    var bunny3 = new InkPaint.Sprite(resources.bunny.texture);
    var bg = new InkPaint.Sprite(resources.bg_rotate.texture);

    // center the sprite's anchor point
    bunny1.anchor.set(0.5);
    bunny2.anchor.set(0.5);
    bunny3.anchor.set(0.5);

    // move the sprite to the center of the screen
    bunny1.x = app.screen.width / 2 - 200;
    bunny1.y = app.screen.height / 2 - 200;

    bunny2.x = 100;
    bunny2.y = 100;
    bunny3.x = 100;
    bunny3.y = 150;
    bunny3.rotation = 3.14 / 2;

    app.stage.addChild(bg);
    app.stage.addChild(bunny1);
    app.stage.addChild(bunny2);
    app.stage.addChild(bunny3);

    // Listen for animate update
    var ticker = new InkPaint.Ticker();
    ticker.start();
    ticker.add(function(delta) {
        app.render();
        // just for fun, let's rotate mr rabbit a little
        // delta is 1 if running at 100% performance
        // creates frame-independent transformation
        bunny1.rotation += 0.1 * delta;
    });
}
