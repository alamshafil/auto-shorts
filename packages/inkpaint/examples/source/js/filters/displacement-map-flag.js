var app = new InkPaint.Application();
document.body.appendChild(app.view);

app.stage.interactive = true;

var container = new InkPaint.Container();
app.stage.addChild(container);

var flag = InkPaint.Sprite.fromImage('source/assets/pixi-filters/flag.png');
container.addChild(flag);
flag.x = 100;
flag.y = 100;

var displacementSprite = InkPaint.Sprite.fromImage('source/assets/pixi-filters/displacement_map_repeat.jpg');
// Make sure the sprite is wrapping.
displacementSprite.texture.baseTexture.wrapMode = InkPaint.WRAP_MODES.REPEAT;
var displacementFilter = new InkPaint.filters.DisplacementFilter(displacementSprite);
displacementFilter.padding = 10;

displacementSprite.position = flag.position;

app.stage.addChild(displacementSprite);

flag.filters = [displacementFilter];

displacementFilter.scale.x = 30;
displacementFilter.scale.y = 60;

var ticker = new InkPaint.Ticker();
ticker.start();
ticker.add(function() {
    app.render();
    // Offset the sprite position to make vFilterCoord update to larger value. Repeat wrapping makes sure there's still pixels on the coordinates.
    displacementSprite.x++;
    // Reset x to 0 when it's over width to keep values from going to very huge numbers.
    if (displacementSprite.x > displacementSprite.width) displacementSprite.x = 0;
});
