var texture;
var app = new InkPaint.Application({ autoRender: true });
document.body.appendChild(app.view);

InkPaint.loader.add("flowerTop", "source/assets/flowerTop.png");
InkPaint.loader.load(function(loader, resources) {
    texture = resources.flowerTop.texture;
    init();
});

function init() {
    var textures = [texture];

    for (var rotate = 1; rotate < 16; rotate++) {
        var h = InkPaint.GroupD8.isVertical(rotate)
            ? texture.frame.width
            : texture.frame.height;

        var w = InkPaint.GroupD8.isVertical(rotate)
            ? texture.frame.height
            : texture.frame.width;

        var frame = texture.frame;
        var crop = new InkPaint.Rectangle(texture.frame.x, texture.frame.y, w, h);
        var trim = crop;
        var rotatedTexture;

        if (rotate % 2 === 0) {
            rotatedTexture = new InkPaint.Texture(
                texture.baseTexture,
                frame,
                crop,
                trim,
                rotate
            );
        } else {
            rotatedTexture = new InkPaint.Texture(
                texture.baseTexture,
                frame,
                crop,
                trim,
                rotate - 1
            );
            rotatedTexture.rotate++;
        }

        textures.push(rotatedTexture);
    }

    var offsetX = (app.screen.width / 16) | 0;
    var offsetY = (app.screen.height / 8) | 0;
    var gridW = (app.screen.width / 4) | 0;
    var gridH = (app.screen.height / 5) | 0;

    for (var i = 0; i < 16; i++) {
        var dude = new InkPaint.Sprite(textures[i < 8 ? i * 2 : (i - 8) * 2 + 1]);
        dude.scale.x = 0.5;
        dude.scale.y = 0.5;
        dude.x = offsetX + gridW * (i % 4);
        dude.y = offsetY + gridH * ((i / 4) | 0);
        app.stage.addChild(dude);

        var text = new InkPaint.Text("rotate = " + dude.texture.rotate, {
            fontFamily: "Courier New",
            fontSize: "12px",
            fill: "white",
            align: "left"
        });
        text.x = dude.x;
        text.y = dude.y - 20;
        app.stage.addChild(text);
    }
}
