InkPaint.loader.add("t1", "source/assets/bg_grass.jpg");
InkPaint.loader.add("bg_rotate", "source/assets/bg_rotate2.jpg");
InkPaint.loader.add("bunny", "source/assets/bunny.png");
InkPaint.loader.load(setup);

var app, bg_rotate;

function setup(l, resources) {
    app = new InkPaint.Application(800, 600, {
        backgroundColor: 0x1099bb,
        preserveDrawingBuffer: true
    });

    document.body.appendChild(app.view);
    document.body.noclick = true;

    var bunny = new InkPaint.Sprite(resources.bunny.texture);
    var bg_rotate = new InkPaint.Sprite(resources.bg_rotate.texture);

    bunny.anchor.set(0.5);
    bunny.x = app.screen.width / 2;
    bunny.y = app.screen.height / 2;

    bg_rotate.anchor.set(0.5);
    bg_rotate.x = app.screen.width / 2;
    bg_rotate.y = app.screen.height / 2;

    app.stage.addChild(bg_rotate);
    app.stage.addChild(bunny);

    app.view.addEventListener("mousedown", mousedown);

    new TWEEN.Tween(bunny).to({ x: 10, y: 10 }, 10000).start();
    new TWEEN.Tween(bg_rotate).to({ rotation: 3.14 * 3 }, 10000).start();

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
    app.render();
}

function mousedown() {
    var width = (Math.random() * 800) >> 0;
    var height = (Math.random() * 600) >> 0;
    app.renderer.resize(width, height);

    app.renderer.view.style.width = width + "px";
    app.renderer.view.style.height = height + "px";
    console.log(width, height);
}
