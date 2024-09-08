var texture;
var app = new InkPaint.Application();
document.body.appendChild(app.view);

InkPaint.loader.add("flowerTop1", paths("source/assets/flowerTop1.png"));
InkPaint.loader.add("bunny", paths("source/assets/bunny.png"));
InkPaint.loader.load(function(loader, resources) {
    texture = resources.flowerTop1.texture;
    loaded();
});

var ticker = new InkPaint.Ticker();
ticker.start();
ticker.add(function() {
    app.render();
});

// 0, 0, 119, 181
function loaded() {
    // 1
    var sprite1 = new InkPaint.Sprite(texture);
    sprite1.x = 100;
    sprite1.y = 150;
    app.stage.addChild(sprite1);

    //////////////////////////////////////////////////////
    var width = 40;
    var height = 190;
    var frame = new InkPaint.Rectangle(0, 0, 119, 181);
    var orig = new InkPaint.Rectangle(0, 0, width, height);
    var trim = new InkPaint.Rectangle(0, 0, width, height);
    var result = getSourceRect(width, height);

    // 2
    //////////////////////////////////////////////////////
    var texture2 = new InkPaint.Texture(texture.baseTexture, result, orig, trim);
    var sprite2 = new InkPaint.Sprite(texture2);
    sprite2.x = 300;
    sprite2.y = 150;
    app.stage.addChild(sprite2);

    // 3
    //////////////////////////////////////////////////////
    var sprite3 = new InkPaint.Sprite(InkPaint.Texture.newEmpty());
    sprite3.x = 410;
    sprite3.y = 150;
    app.stage.addChild(sprite3);

    // 4
    //////////////////////////////////////////////////////
    var width = 60;
    var height = 240;
    var texture4;
    var sprite4 = new InkPaint.Sprite(InkPaint.Texture.newEmpty());
    sprite4.x = 600;
    sprite4.y = 150;
    sprite4.width = width;
    sprite4.height = height;
    app.stage.addChild(sprite4);

    var orig = new InkPaint.Rectangle(0, 0, width, height);
    var trim = new InkPaint.Rectangle(0, 0, width, height);
    var result = getSourceRect(width, height);

    var i = 0;
    setTimeout(() => {
        if (!texture4) {
            texture4 = new InkPaint.Texture(
                new InkPaint.BaseTexture(),
                result,
                orig,
                trim
            );
            texture4.id = "xxx";
            sprite4.texture = texture4;
            sprite4.width = width;
            sprite4.height = height;
            sprite3.texture = texture.clone();
        }
    }, 200);

    setInterval(() => {
        //////////////////////////////////////////////////////
        if (++i > 3) i = 1;
        sprite4.texture.updateSource(
            paths(`source/assets/flowerTop${i}.png`)
        );

        sprite3.updateBaseTexture(
            paths(`source/assets/flowerTop${3 - i}.png`),
            true
        );
    }, 800);
}

function getSourceRect(width, height) {
    let w, h, x, y;
    const ow = 119;
    const oh = 181;
    const s1 = width / height;
    const s2 = ow / oh;
    if (s1 >= s2) {
        w = ow;
        h = (ow / s1) >> 0;
        x = 0;
        y = ((oh - h) / 2) >> 0;
    } else {
        h = oh;
        w = (oh * s1) >> 0;
        y = 0;
        x = ((ow - w) / 2) >> 0;
    }

    return new InkPaint.Rectangle(x, y, w, h);
}

module.exports = app;
