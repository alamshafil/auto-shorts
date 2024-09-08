# InkPaint — canvas graphics rendering library for node.js

<p align="center">
  <img src="./examples/img/logo.png" />
</p>

<div align="center">
<a href="https://www.npmjs.com/inkpaint" target="_blank"><img src="https://img.shields.io/npm/v/inkpaint.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/inkpaint" target="_blank"><img src="https://img.shields.io/npm/l/inkpaint.svg" alt="Package License" /></a>
<a href="https://github.com/prettier/prettier" target="_blank"><img src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg" alt="Code Style"></a>
<a href="https://github.com/tnfe/inkpaint/pulls" target="_blank"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs"/></a>
<a href="https://nodejs.org" target="_blank"><img src="https://img.shields.io/badge/node-%3E%3D%208.0.0-brightgreen.svg" alt="Node Version" /></a>
</div>

## Overview

InkPaint is a lightweight node.js canvas graphics animation library. It forks from the famous canvas engine pixi.js. You can use it to do server-side image synthesis.

InkPaint has a lot of performance optimization and code refactoring. One of its application Demo is FFCreator [https://github.com/tnfe/FFCreator](https://github.com/tnfe/FFCreator) video processing library.

At the same time, inkpaint is a common library between node.js and the browser, and it can still run normally on the browser side.

## Current features

- WebGL renderer (headless-gl)
- Canvas renderer (node-canvas)
- Super easy to use API
- Support for texture atlases
- Asset loader / sprite sheet loader
- Support multiple text effects
- Various Sprite effects and animations
- Masking and Filters

## Basic Usage

```sh
npm install inkpaint
```

```js
const fs = require("fs-extra");
const { Application, Sprite, Ticker, Loader } = require("inkpaint");

const width = 800;
const height = 600;

const app = new Application(width, height);
const loader = new Loader();
loader.add("boy", "./assets/boy.png");
loader.load(loaded);

function loaded(loader, resources) {
  const boy = new Sprite(resources.boy.texture);
  boy.x = width / 2;
  boy.y = height / 2;
  boy.anchor.set(0.5);
  app.stage.addChild(boy);
}

const ticker = new Ticker();
ticker.start();
ticker.add(() => {
  app.render();
  boy.x += 0.1;
});

// save image
const buffer = app.view.toBuffer("image/png");
fs.outputFile("./hello.png", buffer);
```

## Save Image

InkPaint supports saving pictures in multiple formats, you can refer to the api of node-canvas [https://github.com/Automattic/node-canvas#canvastobuffer](). You can save any animated graphics supported by the browser on the server side.

## Installation

### Install `node-canvas` and `headless-gl` dependencies

> ##### If it is a computer with a display device, such as a personal `pc` computer with `windows`, `Mac OSX` system, or a `server` server with a graphics card or display device, you can skip this step without installing this dependency.

If you are using `Centos`, `Redhat`, `Fedora` system, you can use `yum` to install.

```shell
sudo yum install gcc-c++ cairo-devel pango-devel libjpeg-turbo-devel giflib-devel
```

Install[`Xvfb`](https://linux.die.net/man/1/xvfb) and [`Mesa`](http://www.sztemple.cc/articles/linux%E4%B8%8B%E7%9A%84opengl-mesa%E5%92%8Cglx%E7%AE%80%E4%BB%8B)

```shell
sudo yum install mesa-dri-drivers Xvfb libXi-devel libXinerama-devel libX11-devel
```

If you are using `Debian`, `ubuntu` system, you can use `apt` to install.

```shell
sudo apt-get install libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev build-essential g++
sudo apt-get install libgl1-mesa-dev xvfb libxi-dev libx11-dev
```

## Start Up

> If it is a computer with a display device, such as a personal pc computer or a server server with a graphics card or display device, start normally `npm start`

#### Otherwise, You must use the `xvfb-run` script command to start the program to use webgl under the Linux server

xvfb-run more detailed command parameters [http://manpages.ubuntu.com/manpages/xenial/man1/xvfb-run.1.html](http://manpages.ubuntu.com/manpages/xenial/man1/xvfb-run.1.html)

```shell
xvfb-run -s "-ac -screen 0 1280x1024x24" npm start
```

## How to build

Note that for most users you don't need to build this project. If all you want is to use InkPaint, then
just download one of our [prebuilt releases](https://github.com/tnfe/inkpaint/releases). Really
the only time you should need to build InkPaint is if you are developing it.

If you don't already have Node.js and NPM, go install them. Then, in the folder where you have cloned
the repository, install the build dependencies using npm:

```sh
npm install
```

Compile the node.js package

```sh
npm run lib
```

At the same time, inkpaint is a common library between node.js and the browser, and it can still run normally on the browser side.
If you want to view the example on the browser side, please execute

```sh
npm run web
```

To execute the example under node.js, execute

```sh
npm run examples
```

### License

This content is released under the (http://opensource.org/licenses/MIT) MIT License.
