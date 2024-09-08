var app = new InkPaint.Application();
document.body.appendChild(app.view);

module.exports = app;

var stage = app.stage;

var brush = new InkPaint.Graphics();
brush.beginFill(0xffffff);
brush.drawCircle(0, 0, 50);
brush.endFill();

InkPaint.loader.add("t1", paths("source/assets/bg_grass.jpg"));
InkPaint.loader.add("t2", paths("source/assets/bg_rotate.jpg"));
InkPaint.loader.load(setup);

function setup(loader, resources) {
    var background = new InkPaint.Sprite(resources.t1.texture);
    stage.addChild(background);
    background.width = app.screen.width;
    background.height = app.screen.height;

    var imageToReveal = new InkPaint.Sprite(resources.t2.texture);
    stage.addChild(imageToReveal);
    imageToReveal.width = app.screen.width;
    imageToReveal.height = app.screen.height;

    var renderTexture = InkPaint.RenderTexture.create(
        app.screen.width,
        app.screen.height
    );

    var renderTextureSprite = new InkPaint.Sprite(renderTexture);
    stage.addChild(renderTextureSprite);
    imageToReveal.mask = renderTextureSprite;

    function pointerMove() {
        var d = 4;
        brush.position.x += d;
        brush.position.y += d;
        app.renderer.render(brush, renderTexture, false, null, false);
        app.render();
    }

    setInterval(pointerMove, 1000 / 10);
}
