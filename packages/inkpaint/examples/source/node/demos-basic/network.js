InkPaint.loader.add(
    "bunny",
    "https://www.pixijs.com/wp/wp-content/uploads/pixijs-v5-logo-1.png"
);
InkPaint.loader.add(
    "bg",
    "https://www.pixijs.com/wp/wp-content/uploads/feature-multiplatform.png"
);
InkPaint.loader.add(
    "ws",
    "http://qzonestyle.gtimg.cn/qz-proj/weishi-pc/img/index/logo-l@2x.png"
);
InkPaint.loader.add("txws", paths("source/assets/txlogo.png"));
InkPaint.loader.add("bunny2", paths("source/assets/bunny.png"));

InkPaint.loader.load(setup);
InkPaint.loader.on("error", error => {
    console.log(error);
});

var app = new InkPaint.Application(800, 600, {
    backgroundColor: 0x1099bb,
    resolution: 2
});

function setup(l, resources) {
    document.body.appendChild(app.view);

    var bunny = new InkPaint.Sprite(resources.bunny.texture);
    var bg = new InkPaint.Sprite(resources.bg.texture);
    var ws = new InkPaint.Sprite(resources.ws.texture);
    var txws = new InkPaint.Sprite(resources.txws.texture);

    bunny.anchor.set(0.5);
    bunny.x = app.screen.width / 2;
    bunny.y = app.screen.height / 2;

    bg.anchor.set(0.5);
    bg.scale.set(10);
    bg.x = app.screen.width / 2;
    bg.y = app.screen.height / 2;

    ws.x = 100;
    ws.y = 100;
    txws.x = 200;
    txws.y = 100;

    app.stage.addChild(bg);
    app.stage.addChild(bunny);
    app.stage.addChild(ws);
    app.stage.addChild(txws);

    var ticker = new InkPaint.Ticker();
    ticker.start();
    ticker.add(function() {
        app.render();
        // just for fun, let's rotate mr rabbit a little
        bunny.rotation += 0.1;
        bg.rotation -= 0.01;
    });
}

module.exports = app;
