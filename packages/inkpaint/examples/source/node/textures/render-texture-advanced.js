var app = new InkPaint.Application();
document.body.appendChild(app.view);

module.exports = app;

// create two render textures... these dynamic textures will be used to draw the scene into itself
var renderTexture = InkPaint.RenderTexture.create(
    app.screen.width,
    app.screen.height
);
var renderTexture2 = InkPaint.RenderTexture.create(
    app.screen.width,
    app.screen.height
);
var currentTexture = renderTexture;

// create a new sprite that uses the render texture we created above
var outputSprite = new InkPaint.Sprite(currentTexture);

// align the sprite
outputSprite.x = 400;
outputSprite.y = 300;
outputSprite.anchor.set(0.5);

// add to stage
app.stage.addChild(outputSprite);

var stuffContainer = new InkPaint.Container();

stuffContainer.x = 400;
stuffContainer.y = 300;

app.stage.addChild(stuffContainer);

// create an array of image ids..
var fruits = [
    "source/assets/rt_object_01.png",
    "source/assets/rt_object_02.png",
    "source/assets/rt_object_03.png",
    "source/assets/rt_object_04.png",
    "source/assets/rt_object_05.png",
    "source/assets/rt_object_06.png",
    "source/assets/rt_object_07.png",
    "source/assets/rt_object_08.png"
];

// create an array of items
var items = [];

// now create some items and randomly position them in the stuff container
for (var i = 0; i < 20; i++) {
    var item = InkPaint.Sprite.fromImage(paths(fruits[i % fruits.length]));
    item.x = Math.random() * 400 - 200;
    item.y = Math.random() * 400 - 200;
    item.anchor.set(0.5);
    stuffContainer.addChild(item);
    items.push(item);
}

// used for spinning!
var count = 0;

var ticker = new InkPaint.Ticker();
ticker.start();
ticker.add(function() {
    for (var i = 0; i < items.length; i++) {
        // rotate each item
        var item = items[i];
        item.rotation += 0.1;
    }

    count += 0.01;

    // swap the buffers ...
    var temp = renderTexture;
    renderTexture = renderTexture2;
    renderTexture2 = temp;

    // set the new texture
    outputSprite.texture = renderTexture;

    var text = new InkPaint.Text("你好周杰伦! 哈哈");
    text.updateStyle({
        fill: "#ffffff",
        backgroundColor: "#00eeee",
        padding: 10
    });
    text.x = 100;
    text.y = 100;
    app.stage.addChild(text);

    stuffContainer.rotation -= 0.01;
    outputSprite.scale.set(1 + Math.sin(count) * 0.2);

    app.renderer.render(app.stage, renderTexture2, false);
    app.render();
});
