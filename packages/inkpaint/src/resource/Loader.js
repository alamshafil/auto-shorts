import Signal from "mini-signals";
import parseUri from "parse-uri";
import * as async from "./async";
import Resource from "./Resource";

const MAX_PROGRESS = 100;
const rgxExtractUrlHash = /(#[\w-]+)?$/;

export default class ResourceLoader {
  constructor(baseUrl = "", concurrency = 10) {
    this.baseUrl = baseUrl;
    this.progress = 0;
    this.loading = false;
    this.defaultQueryString = "";
    this._beforeMiddleware = [];
    this._afterMiddleware = [];
    this._resourcesParsing = [];
    this._boundLoadResource = (r, d) => this._loadResource(r, d);
    this._queue = async.queue(this._boundLoadResource, concurrency);
    this._queue.pause();

    this.resources = {};
    this.onProgress = new Signal();
    this.onError = new Signal();
    this.onLoad = new Signal();
    this.onStart = new Signal();
    this.onComplete = new Signal();

    for (let i = 0; i < ResourceLoader._defaultBeforeMiddleware.length; ++i) {
      this.pre(ResourceLoader._defaultBeforeMiddleware[i]);
    }

    for (let i = 0; i < ResourceLoader._defaultAfterMiddleware.length; ++i) {
      this.use(ResourceLoader._defaultAfterMiddleware[i]);
    }
  }

  add(name, url, options, cb) {
    if (Array.isArray(name)) {
      for (let i = 0; i < name.length; ++i) {
        this.add(name[i]);
      }

      return this;
    }

    // if an object is passed instead of params
    if (typeof name === "object") {
      cb = url || name.callback || name.onComplete;
      options = name;
      url = name.url;
      name = name.name || name.key || name.url;
    }

    if (this.resources[name]) {
      return;
    }

    // case where no name is passed shift all args over by one.
    if (typeof url !== "string") {
      cb = options;
      options = url;
      url = name;
    }

    // now that we shifted make sure we have a proper url.
    if (typeof url !== "string") {
      throw new Error("No url passed to add resource to loader.");
    }

    // options are optional so people might pass a function and no options
    if (typeof options === "function") {
      cb = options;
      options = null;
    }

    // if loading already you can only add resources that have a parent.
    if (this.loading && (!options || !options.parentResource)) {
      throw new Error("Cannot add resources the loader is running.");
    }

    url = this._prepareUrl(url);
    this.resources[name] = new Resource(name, url, options);

    if (typeof cb === "function") {
      this.resources[name].onAfterMiddleware.once(cb);
    }

    // if actively loading, make sure to adjust progress chunks for that parent and its children
    if (this.loading) {
      const parent = options.parentResource;
      const incompleteChildren = [];

      for (let i = 0; i < parent.children.length; ++i) {
        if (!parent.children[i].isComplete) {
          incompleteChildren.push(parent.children[i]);
        }
      }

      const fullChunk = parent.progressChunk * (incompleteChildren.length + 1); // +1 for parent
      const eachChunk = fullChunk / (incompleteChildren.length + 2); // +2 for parent & new child

      parent.children.push(this.resources[name]);
      parent.progressChunk = eachChunk;

      for (let i = 0; i < incompleteChildren.length; ++i) {
        incompleteChildren[i].progressChunk = eachChunk;
      }

      this.resources[name].progressChunk = eachChunk;
    }

    this._queue.push(this.resources[name]);
    return this;
  }

  pre(fn) {
    this._beforeMiddleware.push(fn);
    return this;
  }

  use(fn) {
    this._afterMiddleware.push(fn);
    return this;
  }

  reset() {
    this.progress = 0;
    this.loading = false;

    this._queue.kill();
    this._queue.pause();

    for (const k in this.resources) {
      const res = this.resources[k];
      if (res._onLoadBinding) res._onLoadBinding.detach();
      if (res.isLoading) res.abort();
      delete this.resources[k];
    }

    this.resources = {};
    return this;
  }

  destroy() {
    this.progress = 0;
    this.loading = false;

    this._queue.kill();
    this._queue.pause();

    for (const key in this.resources) {
      const res = this.resources[key];
      if (res.destroy) res.destroy();
      delete this.resources[key];
    }

    this.baseUrl = "";
    this.defaultQueryString = "";
    this._beforeMiddleware = null;
    this._afterMiddleware = null;
    this._resourcesParsing = null;
    this._boundLoadResource = null;
    this._queue = null;
    this.resources = null;
    this.onProgress = null;
    this.onLoad = null;
    this.onError = null;
    this.onStart = null;
    this.onComplete = null;
  }

  loadAsync() {
    return new Promise((resolve, reject) => {
      this.load(resolve);
    });
  }

  load(cb) {
    if (typeof cb === "function") this.onComplete.once(cb);
    if (this.loading) return this;

    if (this._queue.idle()) {
      this._onStart();
      this._onComplete();
    } else {
      const numTasks = this._queue._tasks.length;
      const chunk = MAX_PROGRESS / numTasks;

      for (let i = 0; i < this._queue._tasks.length; ++i) {
        this._queue._tasks[i].data.progressChunk = chunk;
      }

      this._onStart();
      this._queue.resume();
    }

    return this;
  }

  get concurrency() {
    return this._queue.concurrency;
  }

  set concurrency(concurrency) {
    this._queue.concurrency = concurrency;
  }

  _prepareUrl(url) {
    const parsedUrl = parseUri(url, { strictMode: true });
    let result;

    // absolute url, just use it as is.
    if (parsedUrl.protocol || !parsedUrl.path || url.indexOf("//") === 0) {
      result = url;
    }
    // if baseUrl doesn't end in slash and url doesn't start with slash, then add a slash inbetween
    else if (
      this.baseUrl.length &&
      this.baseUrl.lastIndexOf("/") !== this.baseUrl.length - 1 &&
      url.charAt(0) !== "/"
    ) {
      result = `${this.baseUrl}/${url}`;
    } else {
      result = this.baseUrl + url;
    }

    // if we need to add a default querystring, there is a bit more work
    if (this.defaultQueryString) {
      const hash = rgxExtractUrlHash.exec(result)[0];
      result = result.substr(0, result.length - hash.length);

      if (result.indexOf("?") !== -1) {
        result += `&${this.defaultQueryString}`;
      } else {
        result += `?${this.defaultQueryString}`;
      }

      result += hash;
    }

    return result;
  }

  _loadResource(resource, dequeue) {
    resource._dequeue = dequeue;

    async.eachSeries(
      this._beforeMiddleware,
      (fn, next) => {
        fn.call(this, resource, () => {
          next(resource.isComplete ? {} : null);
        });
      },
      () => {
        if (resource.isComplete) {
          this._onLoad(resource);
        } else {
          resource._onLoadBinding = resource.onComplete.once(
            this._onLoad,
            this
          );
          resource.load();
        }
      },
      true
    );
  }

  _onStart() {
    this.progress = 0;
    this.loading = true;
    this.onStart.dispatch(this);
  }

  _onComplete() {
    this.progress = MAX_PROGRESS;
    this.loading = false;
    this.onComplete.dispatch(this, this.resources);
  }

  _onLoad(resource) {
    resource._onLoadBinding = null;
    this._resourcesParsing.push(resource);
    resource._dequeue();

    async.eachSeries(
      this._afterMiddleware,
      (fn, next) => {
        fn.call(this, resource, next);
      },
      () => {
        resource.onAfterMiddleware.dispatch(resource);

        this.progress = Math.min(
          MAX_PROGRESS,
          this.progress + resource.progressChunk
        );
        this.onProgress.dispatch(this, resource);

        if (resource.error) {
          this.onError.dispatch(resource.error, this, resource);
        } else {
          this.onLoad.dispatch(this, resource);
        }

        this._resourcesParsing.splice(
          this._resourcesParsing.indexOf(resource),
          1
        );

        // do completion check
        if (this._queue.idle() && this._resourcesParsing.length === 0) {
          this._onComplete();
        }
      },
      true
    );
  }
}

ResourceLoader._defaultBeforeMiddleware = [];
ResourceLoader._defaultAfterMiddleware = [];

ResourceLoader.pre = function LoaderPreStatic(fn) {
  ResourceLoader._defaultBeforeMiddleware.push(fn);
  return ResourceLoader;
};

ResourceLoader.use = function LoaderUseStatic(fn) {
  ResourceLoader._defaultAfterMiddleware.push(fn);
  return ResourceLoader;
};
