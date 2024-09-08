"use strict";

function withGL(fn) {
    return true ? fn || true : undefined;
}

module.exports = withGL;
