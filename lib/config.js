const path = require("path");
const orderedModuleNames = require("./dependency-order");
const AppRootPath = require("app-root-path").path;
const AppPackage = require(path.resolve(AppRootPath, "package.json"));

var CONFIG = {};

function build() {
  var appname = AppPackage.name;
  var mode = process.env.NODE_ENV;

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

  console.log(
    "\n\n############ [ SERVER CONFIGURATIONS - BEGIN ] ##############\n"
  );
  console.log(JSON.stringify(CONFIG, null, 2));
  console.log(
    "\n############ [ SERVER CONFIGURATIONS - END ] ##############\n\n"
  );
}

function get(key, _default) {
  return CONFIG[key] || _default;
}

function getPath(mod, key, def) {
  var cfg = get(mod, key, def);

  return path.resolve(AppRootPath, cfg);
}

module.exports = {
  build,
  get,
  getPath
};
