var app, loader, ticker, con, btn, texture;
var index = 0;
var first = false;
var ids = [];

addBtn();
init();

function addBtn() {
    document.body.noclick = true;
    con = $("<div></div>").css({
        width: "100%",
        height: "100%",
        zIndex: 9,
        background: "#cccccc",
        position: "absolute"
    });
    btn = $("<div>Click Reset</div>").css({
        width: "100px",
        height: "30px",
        top: "10px",
        right: "10px",
        color: "#fff",
        background: "#004cf8",
        padding: "5px",
        cursor: "pointer",
        position: "absolute"
    });

    var inited = true;
    btn.on("click", function() {
        if (inited) {
            inited = false;
            destroy();
        } else {
            inited = true;
            init();
        }
    });

    $("body").append(con);
    con.append(btn);
}

function init() {
    loader = new InkPaint.Loader();
    app = new InkPaint.Application(800, 600, {
        backgroundColor: 0x3333bb
        //useGL: true
    });
    con[0].appendChild(app.view);

    loader.add("flowerTop1", "source/assets/flowerTop1.png");
    loader.load(function(loader, resources) {
        texture = resources.flowerTop1.texture;
        // console.log(texture.frame.toString());
        loaded();
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
        var frame = getSourceRect(width, height);

        // 2
        //////////////////////////////////////////////////////
        var texture2 = new InkPaint.Texture(
            texture.baseTexture,
            frame,
            orig,
            trim
        );
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

        var frame = getSourceRect(width, height);
        var orig = new InkPaint.Rectangle(0, 0, 119, 181);
        var trim = new InkPaint.Rectangle(0, 0, width, height);
        var trim = frame.clone();

        var i = 0;
        var id = setTimeout(() => {
            if (!texture4) {
                texture4 = new InkPaint.Texture(
                    new InkPaint.BaseTexture(),
                    frame,
                    orig,
                    trim
                );
                texture4.id = "xxx";
                sprite4.texture = texture4;
                sprite4.width = width;
                sprite4.height = height;
            }

            setSprite3Face();
        }, 200);
        ids.push(id);

        function setSprite3Face() {
            if (!first) {
                sprite3.texture = InkPaint.Texture.fromImage(
                    "source/assets/flowerTop0.png"
                );
                console.log("--------------", sprite3.texture.frame.toString());
                first = true;
            }
        }

        id = setInterval(() => {
            //////////////////////////////////////////////////////
            if (++i > 3) i = 1;
            sprite4.updateBaseTexture(`source/assets/flowerTop${i}.png`);
            sprite3.updateBaseTexture(
                `source/assets/flowerTop${3 - i}.png`,
                true
            );
            console.log("--------------", sprite3.texture.frame.toString());
        }, 1800);
        ids.push(id);

        // Listen for animate update
        ticker = new InkPaint.Ticker();
        ticker.start();
        ticker.add(function(delta) {
            app.render();
        });
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
}

function destroy() {
    if (!app) return;

    app.destroy(true, true);
    loader.destroy();
    ticker.destroy();
    //InkPaint.destroyAndCleanAllCache();

    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        clearInterval(id);
        clearTimeout(id);
    }
    ids.length = 0;

    console.log(InkPaint.TextureCache);
    console.log(InkPaint.BaseTextureCache);
    console.log(loader);

    app = null;
    loader = null;
    ticker = null;
    first = false;
}
