const { orderedModuleNames } = require("./dependency-order");

const AppRootPath = require("app-root-path").path;
const AppPackage = require(path.resolve(AppRootPath, "package.json"));

const path = require("path");

var CONFIG = {};

function build() {
  var appname = AppPackage.name;

  var moduleNames = [...orderedModuleNames, appname];

  CONFIG = {};

  /* 하위 모듈부터 불러온다. */
  moduleNames.forEach(m => {
    if (appname == m) {
      var modulePath = AppRootPath;
    } else {
      var modulePath = path.dirname(
        require.resolve(path.join(m, "package.json"))
      );
    }

    try {
      var cfg = require(path.join(modulePath, "config", `config.${mode}`));
      Object.assign(CONFIG, cfg);
    } catch (e) {}
  });

  try {
    var cfg = require(path.join(AppRootPath, `config.${mode}`));
    Object.assign(CONFIG, cfg);
  } catch (e) {}
}

function get(key, _default) {
  return CONFIG[key] || _default;
}

function getPath(mod, key, def) {
  var cfg = config(mod, key, def);

  return path.resolve(AppRootPath, cfg);
}

module.exports = {
  build,
  get,
  getPath
};
