function pluginTarget(obj) {
  obj.__plugins = {};

  obj.registerPlugin = function registerPlugin(pluginName, ctor) {
    obj.__plugins[pluginName] = ctor;
  };

  obj.prototype.initPlugins = function initPlugins() {
    this.plugins = this.plugins || {};

    for (const o in obj.__plugins) {
      this.plugins[o] = new obj.__plugins[o](this);
    }
  };

  obj.prototype.destroyPlugins = function destroyPlugins() {
    for (const o in this.plugins) {
      this.plugins[o].destroy();
      this.plugins[o] = null;
    }

    this.plugins = null;
  };
}

export default {
  mixin: function mixin(obj) {
    pluginTarget(obj);
  }
};
