var app = new InkPaint.Application();
document.body.appendChild(app.view);

module.exports = app;


// Create background image
var background = InkPaint.Sprite.fromImage(paths('source/assets/bg_grass.jpg'));
background.width = app.screen.width;
background.height = app.screen.height;
app.stage.addChild(background);

// Stop application wait for load to finish
app.stop();

InkPaint.loader.add('shader', 'source/assets/pixi-filters/shader.frag')
    .load(onLoaded);

var filter;

// Handle the load completed
function onLoaded(loader, res) {
    // Create the new filter, arguments: (vertexShader, framentSource)
    filter = new InkPaint.Filter(null, res.shader.data);

    // Add the filter
    background.filters = [filter];

    // Resume application update
    app.start();
}

// Animate the filter
var ticker = new InkPaint.Ticker();
ticker.start();
ticker.add(function(delta) {
    app.render();
    filter.uniforms.customUniform += 0.04 * delta;
});
