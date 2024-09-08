"use strict";

/* eslint-disable global-require */
const InkPaint = require("../dist/inkpaint");
global.InkPaint = InkPaint;

describe("InkPaint", function() {
    it("should exist as a global object", function() {
        expect(InkPaint).to.be.an("object");
    });

    require("./core");
    require("./loaders");
    require("./renders");
    require("./prepare");
});
