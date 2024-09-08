var app = new InkPaint.Application();
document.body.appendChild(app.view);

var background = InkPaint.Sprite.fromImage("source/assets/bg_grass.jpg");
background.width = app.screen.width;
background.height = app.screen.height;
app.stage.addChild(background);

InkPaint.loader
    .add("shader", "source/assets/pixi-filters/shader.frag")
    .load(onLoaded);

var filter;

function onLoaded(loader, res) {
    filter = new InkPaint.Filter(null, res.shader.data);
    background.filters = [filter];
    ticker.start();
}

var ticker = new InkPaint.Ticker();
ticker.add(function(delta) {
    if (filter) filter.uniforms.customUniform += 0.04 * delta;
    app.render();
});
