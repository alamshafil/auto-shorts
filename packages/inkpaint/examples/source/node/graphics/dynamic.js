var app = new InkPaint.Application(800, 600, { antialias: true });
document.body.appendChild(app.view);

module.exports = app;

app.stage.interactive = true;

var graphics = new InkPaint.Graphics();

// set a fill and line style
graphics.beginFill(0xff3300);
graphics.lineStyle(10, 0xffd900, 1);

// draw a shape
graphics.moveTo(50, 50);
graphics.lineTo(250, 50);
graphics.lineTo(100, 100);
graphics.lineTo(250, 220);
graphics.lineTo(50, 220);
graphics.lineTo(50, 50);
graphics.endFill();

// set a fill and line style again
graphics.lineStyle(10, 0xff0000, 0.8);
graphics.beginFill(0xff700b, 1);

// draw a second shape
graphics.moveTo(210, 300);
graphics.lineTo(450, 320);
graphics.lineTo(570, 350);
graphics.quadraticCurveTo(600, 0, 480, 100);
graphics.lineTo(330, 120);
graphics.lineTo(410, 200);
graphics.lineTo(210, 300);
graphics.endFill();

// draw a rectangle
graphics.lineStyle(2, 0x0000ff, 1);
graphics.drawRect(50, 250, 100, 100);

// draw a circle
graphics.lineStyle(0);
graphics.beginFill(0xffff0b, 0.5);
graphics.drawCircle(470, 200, 100);
graphics.endFill();

graphics.lineStyle(20, 0x33ff00);
graphics.moveTo(30, 30);
graphics.lineTo(600, 300);

app.stage.addChild(graphics);

// let's create a moving shape
var thing = new InkPaint.Graphics();
app.stage.addChild(thing);
thing.x = 800 / 2;
thing.y = 600 / 2;

var count = 0;

global.app = app;

var ticker = new InkPaint.Ticker();
ticker.start();
ticker.add(function() {
    app.render();
    count += 0.1;

    thing.clear();
    thing.lineStyle(10, 0xff0000, 1);
    thing.beginFill(0xffff00, 0.5);

    thing.moveTo(-120 + Math.sin(count) * 20, -100 + Math.cos(count) * 20);
    thing.lineTo(120 + Math.cos(count) * 20, -100 + Math.sin(count) * 20);
    thing.lineTo(120 + Math.sin(count) * 20, 100 + Math.cos(count) * 20);
    thing.lineTo(-120 + Math.cos(count) * 20, 100 + Math.sin(count) * 20);
    thing.lineTo(-120 + Math.sin(count) * 20, -100 + Math.cos(count) * 20);

    thing.rotation = count * 0.1;
});
