var app = new InkPaint.Application();
document.body.appendChild(app.view);

app.stage.interactive = true;

var bg = InkPaint.Sprite.fromImage('source/assets/bg_rotate.jpg');
bg.anchor.set(0.5);

bg.x = app.screen.width / 2;
bg.y = app.screen.height / 2;

var filter = new InkPaint.filters.ColorMatrixFilter();

var container = new InkPaint.Container();
container.x = app.screen.width / 2;
container.y = app.screen.height / 2;

var bgFront = InkPaint.Sprite.fromImage('source/assets/bg_scene_rotate.jpg');
bgFront.anchor.set(0.5);

container.addChild(bgFront);

var light2 = InkPaint.Sprite.fromImage('source/assets/light_rotate_2.png');
light2.anchor.set(0.5);
container.addChild(light2);

var light1 = InkPaint.Sprite.fromImage('source/assets/light_rotate_1.png');
light1.anchor.set(0.5);
container.addChild(light1);

var panda = InkPaint.Sprite.fromImage('source/assets/panda.png');
panda.anchor.set(0.5);

container.addChild(panda);

app.stage.addChild(container);

app.stage.filters = [filter];

var count = 0;
var enabled = true;

app.stage.on('pointertap', function() {
    enabled = !enabled;
    app.stage.filters = enabled ? [filter] : null;
});

var help = new InkPaint.Text('Click or tap to turn filters on / off.', {
    fontFamily: 'Arial',
    fontSize: 12,
    fontWeight: 'bold',
    fill: 'white'
});
help.y = app.screen.height - 25;
help.x = 10;

app.stage.addChild(help);

var ticker = new InkPaint.Ticker();
ticker.start();
ticker.add(function(delta) {
    app.render();
    bg.rotation += 0.01;
    bgFront.rotation -= 0.01;
    light1.rotation += 0.02;
    light2.rotation += 0.01;

    panda.scale.x = 1 + Math.sin(count) * 0.04;
    panda.scale.y = 1 + Math.cos(count) * 0.04;

    count += 0.1;

    var matrix = filter.matrix;

    matrix[1] = Math.sin(count) * 3;
    matrix[2] = Math.cos(count);
    matrix[3] = Math.cos(count) * 1.5;
    matrix[4] = Math.sin(count / 3) * 2;
    matrix[5] = Math.sin(count / 2);
    matrix[6] = Math.sin(count / 4);
});
