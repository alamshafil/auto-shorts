InkPaint.loader.add(
    "bunny",
    "https://www.pixijs.com/wp/wp-content/uploads/pixijs-v5-logo-1.png",
    { crossOrigin: "anonymous" }
);
InkPaint.loader.add(
    "bg",
    "https://www.baidu.com/img/PCtm_d9c8750bed0b3c7d089fa7d55720d6cf.png",
    { crossOrigin: "anonymous" }
);
InkPaint.loader.add(
    "ws",
    "http://qzonestyle.gtimg.cn/qz-proj/weishi-pc/img/index/logo-l@2x.png",
    { crossOrigin: "anonymous" }
);
InkPaint.loader.load(setup);
InkPaint.loader.on("error", error => {
    console.log(error);
});

var app;
function setup(l, resources) {
    app = new InkPaint.Application(800, 600, {
        backgroundColor: 0x1099bb,
        preserveDrawingBuffer: true
    });
    document.body.appendChild(app.view);
    var bunny = new InkPaint.Sprite(resources.ws.texture);
    var bg = new InkPaint.Sprite(resources.bg.texture);

    // center the sprite's anchor point
    bunny.anchor.set(0.5);
    bunny.x = app.screen.width / 2;
    bunny.y = app.screen.height / 2;

    bg.anchor.set(0.5);
    bg.x = app.screen.width / 2;
    bg.y = app.screen.height / 2;

    app.stage.addChild(bg);
    app.stage.addChild(bunny);

    var ticker = new InkPaint.Ticker();
    ticker.start();
    ticker.add(function() {
        app.render();
        // just for fun, let's rotate mr rabbit a little
        bunny.rotation += 0.1;
        bg.rotation -= 0.01;
    });
}
