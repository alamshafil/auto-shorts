InkPaint.loader.add("t1", "source/assets/bg_grass.jpg");
InkPaint.loader.add("bg_rotate", "source/assets/bg_rotate2.jpg");
InkPaint.loader.add("bunny", "source/assets/bunny.png");
InkPaint.loader.load(setup);

var app;
function setup(l, resources) {
    app = new InkPaint.Application(800, 600, {
        backgroundColor: 0x1099bb,
        preserveDrawingBuffer: true
    });

    document.body.appendChild(app.view);

    var bunny = new InkPaint.Sprite(resources.bunny.texture);
    var bg_rotate = new InkPaint.Sprite(resources.bg_rotate.texture);

    bunny.anchor.set(0.5);
    bunny.x = app.screen.width / 2;
    bunny.y = app.screen.height / 2;
    bunny.scale.set(5);

    bg_rotate.anchor.set(0.5);
    bg_rotate.x = app.screen.width / 2;
    bg_rotate.y = app.screen.height / 2;
    app.stage.addChild(bg_rotate);

    var style = {
        fontFamily: "Arial",
        fontSize: 36,
        fontStyle: "italic",
        fontWeight: "bold",
        fill: ["#ffffff", "#00ff99"], // gradient
        stroke: "#4a1850",
        strokeThickness: 5,
        dropShadow: true,
        dropShadowColor: "#000000",
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
        wordWrap: true,
        wordWrapWidth: 440
    };

    var richText = new InkPaint.ProxyObj();
    richText.text =
        "FFCreator文字多行的示例，FFCreator文字多行的示例，FFCreator文字多行的示例，FFCreator文字多行的示例，FFCreator文字多行的示例，FFCreator文字多行的示例，FFCreator文字多行的示例。";
    richText.updateStyle(style);
    richText.x = 150;
    richText.y = 300;
    app.stage.addChild(richText);
    app.stage.addChild(bunny);

    var oldRichText = richText;

    richText = new InkPaint.Text();
    richText.substitute(oldRichText);
    oldRichText = null;
    console.log(app.stage);

    var ticker = new InkPaint.Ticker();
    ticker.start();
    ticker.add(function() {
        app.render();
        // just for fun, let's rotate mr rabbit a little
        bunny.rotation += 0.1;
        bg_rotate.rotation -= 0.01;
    });
}
