import { readFile } from "fs";
import Signal from "mini-signals";
import superagent from "superagent";
import PsImage from "../polyfill/Image";
import { isBrowser } from "browser-or-node";
import {
  STATUS_FLAGS,
  LOAD_TYPE,
  XHR_TYPE_MAP,
  LOAD_TYPE_MAP
} from "./constant";

function _noop() {}
const EMPTY_GIF =
  "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";

export default class Resource {
  constructor(name, url, options = {}) {
    if (typeof name !== "string" || typeof url !== "string") {
      throw new Error("Both name and url are required.");
    }

    this._flags = 0;
    this.setflag(STATUS_FLAGS.DATA_URL, url.indexOf("data:") === 0);

    this.name = name;
    this.url = url;
    this.extension = this._getExt();
    this.data = null;
    this.crossOrigin =
      options.crossOrigin === true ? "anonymous" : options.crossOrigin;

    this.timeout = options.timeout || 0;
    this.loadType = options.loadType || this._determineLoadType();
    this.xhrType = options.xhrType;

    this.error = null;
    this.children = [];
    this.type = Resource.TYPE.UNKNOWN;
    this.progressChunk = 0;
    this._dequeue = _noop;
    this._onLoadBinding = null;
    this._elementTimer = 0;

    this.metadata = options.metadata || {};
    this.onStart = new Signal();
    this.onProgress = new Signal();
    this.onComplete = new Signal();
    this.onAfterMiddleware = new Signal();

    this._onComplete = this._onComplete.bind(this);
    this._onError = this._onError.bind(this);
    this._onTimeout = this._onTimeout.bind(this);
    this._onXhrLoad = this._onXhrLoad.bind(this);
  }

  get isDataUrl() {
    return this.hasflag(STATUS_FLAGS.DATA_URL);
  }

  get isComplete() {
    return this.hasflag(STATUS_FLAGS.COMPLETE);
  }

  get isLoading() {
    return this.hasflag(STATUS_FLAGS.LOADING);
  }

  complete() {
    this._clearEvents();
    this._finish();
  }

  load(cb) {
    const { isLoading, loadType, isComplete } = this;

    if (isLoading) return;
    if (isComplete) {
      if (cb) setTimeout(() => cb(this), 1);
      return;
    } else if (cb) {
      this.onComplete.once(cb);
    }

    this.setflag(STATUS_FLAGS.LOADING, true);
    this.onStart.dispatch(this);

    switch (loadType) {
      case LOAD_TYPE.IMAGE:
        this.type = Resource.TYPE.IMAGE;
        this._loadImage();
        break;

      case LOAD_TYPE.XHR:
      default:
        this._loadOtherFile();
        break;
    }
  }

  abort(message) {
    if (this.error) return;
    this.error = new Error(message);
    this._clearEvents();

    if (this.data) {
      // single source
      if (this.data.src) {
        this.data.src = EMPTY_GIF;
      }

      // multi-source
      else {
        while (this.data.firstChild) {
          this.data.removeChild(this.data.firstChild);
        }
      }
    }

    this._finish();
  }

  destroy() {
    this.removeHandler();
    this.data = null;
    this.name = null;
    this.url = null;
    this.metadata = null;
    this.onStart = null;
    this.onProgress = null;
    this.onComplete = null;
    this.onAfterMiddleware = null;

    this.children = null;
    this._dequeue = null;
    this._onLoadBinding = null;
    this._flags = 0;
    this._onComplete = null;
    this._onError = null;
    this._onTimeout = null;
    this._onXhrLoad = null;
  }

  _loadOtherFile() {
    const isNetWork = this._isNetWork(this.url);
    if (isNetWork || isBrowser) {
      this._loadXhr();
    } else {
      this._loadLocalFile();
    }
  }

  _loadLocalFile() {
    readFile(this.url, (err, data) => {
      if (err) {
        this._onError(err);
      } else {
        const body = JSON.parse(data);
        this._onXhrLoad(body);
      }
    });
  }

  _loadXhr() {
    superagent.get(this.url).end((err, res) => {
      if (err) {
        this._onError(err);
      } else {
        this._onXhrLoad(res.body);
      }
    });
  }

  _isNetWork(url) {
    if (/^\s*https?:\/\//.test(url)) return true;
    return false;
  }

  _onXhrLoad(data) {
    this.data = data;
    this.type = Resource.TYPE.JSON;
    this.complete();
  }

  hasflag(flag) {
    return (this._flags & flag) !== 0;
  }

  setflag(flag, value) {
    this._flags = value ? this._flags | flag : this._flags & ~flag;
  }

  removeHandler() {
    if (!this.data) return;
    this.data.onerror = null;
    this.data.onload = null;
  }

  _clearEvents() {
    clearTimeout(this._elementTimer);
    this.removeHandler();
  }

  _finish() {
    if (this.isComplete) return;
    this.setflag(STATUS_FLAGS.COMPLETE, true);
    this.setflag(STATUS_FLAGS.LOADING, false);
    this.onComplete.dispatch(this);
  }

  _loadImage() {
    this.data = new PsImage();
    this.data.onerror = this._onError;
    this.data.onload = this._onComplete;
    if (this.crossOrigin) this.data.crossOrigin = this.crossOrigin;

    this.data.src = this.url;
    if (this._isNetWork(this.url)) {
      this.data.network = true;
    } else {
      this.data.network = false;
    }

    if (this.timeout) {
      this._elementTimer = setTimeout(this._onTimeout, this.timeout);
    }
  }

  _onError(event) {
    this.abort(`Failed to load element using: ${event}`);
  }

  _onTimeout() {
    this.abort(`Load timed out.`);
  }

  _onComplete(e) {
    this.complete();
  }

  _determineLoadType() {
    return LOAD_TYPE_MAP[this.extension] || LOAD_TYPE.XHR;
  }

  _getExt() {
    let url = this.url;
    let ext = "";

    if (this.isDataUrl) {
      const slashIndex = url.indexOf("/");
      ext = url.substring(slashIndex + 1, url.indexOf(";", slashIndex));
    } else {
      const queryStart = url.indexOf("?");
      const hashStart = url.indexOf("#");
      const index = Math.min(
        queryStart > -1 ? queryStart : url.length,
        hashStart > -1 ? hashStart : url.length
      );
      url = url.substring(0, index);
      ext = url.substring(url.lastIndexOf(".") + 1);
    }

    return ext.toLowerCase();
  }

  static setExtensionLoadType(extname, loadType) {
    setExtMap(LOAD_TYPE_MAP, extname, loadType);
  }

  static setExtensionXhrType(extname, xhrType) {
    setExtMap(XHR_TYPE_MAP, extname, xhrType);
  }
}

Resource.TYPE = {
  UNKNOWN: 0,
  JSON: 1,
  XML: 2,
  IMAGE: 3,
  AUDIO: 4,
  VIDEO: 5,
  TEXT: 6
};

function setExtMap(map, extname, val) {
  if (extname && extname.indexOf(".") === 0) {
    extname = extname.substring(1);
  }

  if (!extname) {
    return;
  }

  map[extname] = val;
}
