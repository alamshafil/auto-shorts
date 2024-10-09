const path = require("path");
const fs = require("fs-extra");
const inquirer = require("inquirer");
const data = require("./source/manifest.json");
const InkPaint = require("../");
const { Application } = require("../");

let app;
let id = 0;
let index = 0;

const saveType = "image/png";

const removeFiles = () => {
    fs.remove(path.join(__dirname, "./output"));
    fs.remove(path.join(__dirname, "./cache"));
};

const polyfill = () => {
    const body = { appendChild(child) {} };
    global.document = { body };

    const baseUrl = path.join(__dirname);
    const paths = (p) => path.join(baseUrl, p);
    global.paths = paths;
};

const processingJson = (data) => {
    const json = [];
    for (let key in data) {
        const list = data[key];
        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            json.push({
                name: key + "::" + item.title,
                value: item.title,
                func: demoFunc(`${key}/${item.entry}`),
            });
        }
    }

    json.push({
        name: "Clear cache",
        value: "Clear cache",
        func: removeFiles,
    });

    json.push(new inquirer.Separator());
    return json;
};

let now;
const screenshots = (name) => {
    name = name.replace(/\//gi, "-");
    const dir = path.join(__dirname, "output", name);
    fs.ensureDir(dir);
    id = setInterval(saveFiles, 1000 / 2, dir);
};

const saveFiles = (dir) => {
    if (index >= 20) {
        clearInterval(id);
        index = 0;
        return;
    }

    now = Date.now();
    const buffer = app.view.toBuffer(saveType);
    const file = path.join(dir, `${index++}.png`);
    console.log(`${index} save success `, file, Date.now() - now);
    fs.outputFile(file, buffer);
};

const demoFunc = (name) => {
    const url = path.join(__dirname, "./source/node/", `${name}`);

    return () => {
        app = require(url);
        screenshots(name);
    };
};

const choices = processingJson(data);
const runDemo = (answer) => {
    for (let i = 0; i < choices.length; i++) {
        const choice = choices[i];
        if (choice.value === answer.val) {
            choice.func();
            break;
        }
    }
};

const initCommand = () => {
    for (let i = 0; i < choices.length; i++) {
        const choice = choices[i];
        choice.name = `(${i + 1}) ${choice.name}`;
    }

    inquirer
        .prompt([
            {
                type: "list",
                message: "Please select the demo you want to run:",
                name: "val",
                choices,
                pageSize: choices.length,
                validate: function (answer) {
                    if (answer.length < 1) {
                        return "You must choose at least one topping.";
                    }
                    return true;
                },
            },
        ])
        .then(runDemo);
};

initCommand();
polyfill();
