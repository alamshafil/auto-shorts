InkPaint.loader.add("t1", "source/assets/bg_grass.jpg");
InkPaint.loader.add("bg_rotate", "source/assets/bg_rotate2.jpg");
InkPaint.loader.add("bunny", "source/assets/bunny.png");
InkPaint.loader.load(setup);

// InkPaint.settings.RESOLUTION = 3;
// InkPaint.settings.SCALE_MODE = InkPaint.SCALE_MODES.NEAREST;

var app;
function setup(l, resources) {
    app = new InkPaint.Application(800, 600, {
        backgroundColor: 0x1099bb,
        //antialias: true,
        preserveDrawingBuffer: true
    });
    document.body.appendChild(app.view);

    // create a new Sprite from an image path.
    var bunny = new InkPaint.Sprite(resources.bunny.texture);
    var bg_rotate = new InkPaint.Sprite(resources.bg_rotate.texture);

    // center the sprite's anchor point
    bunny.anchor.set(0.5);
    bunny.x = app.screen.width / 2;
    bunny.y = app.screen.height / 2;

    bg_rotate.anchor.set(0.5);
    bg_rotate.x = app.screen.width / 2;
    bg_rotate.y = app.screen.height / 2;

    app.stage.addChild(bg_rotate);
    app.stage.addChild(bunny);

    var ticker = new InkPaint.Ticker();
    ticker.start();
    ticker.add(function() {
        app.render();
        // just for fun, let's rotate mr rabbit a little
        bunny.rotation += 0.1;
        bg_rotate.rotation -= 0.01;
    });
}
