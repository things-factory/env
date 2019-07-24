const path = require("path");
const { solve } = require("dependency-solver");
const {
  writeFileSync,
  existsSync,
  mkdirSync,
  removeSync
} = require("fs-extra");

var DEPENDENCY_MAP = {};

function getDependencies(packageNames = []) {
  var dependencies = [];

  for (const name of packageNames) {
    if (DEPENDENCY_MAP[name] || name == "@things-factory/shell") {
      dependencies.push(name);
      continue;
    }

    var packageJson = require(name + "/package.json");
    if (!packageJson["things-factory"]) {
      continue;
    }

    dependencies.push(name);

    var deps = Object.keys(packageJson.dependencies || []);
    var filtered = deps.filter(d => d.startsWith("@things-factory/"));

    if (!filtered || filtered.length === 0) continue;

    DEPENDENCY_MAP[name] = getDependencies(filtered);
  }

  return dependencies;
}

var orderedModuleNames = [];

const appRootPath = require("app-root-path").path;
const pkg = require(path.resolve(appRootPath, "package.json"));

try {
  const dependencyNames = Object.keys(pkg.dependencies).filter(dep =>
    dep.startsWith("@things-factory/")
  );
  const devDependencyNames = Object.keys(pkg.devDependencies).filter(dep =>
    dep.startsWith("@things-factory/")
  );

  if (pkg.name !== "@things-factory/shell" && pkg["things-factory"]) {
    DEPENDENCY_MAP[pkg.name] = dependencyNames;
  }

  getDependencies(dependencyNames);
  getDependencies(devDependencyNames);

  orderedModuleNames = solve(DEPENDENCY_MAP);

  console.info("\n[ ORDERED MODULE LIST ]");
  orderedModuleNames.map((m, idx) => console.info(`- ${idx} : ${m}`));
  console.info("[/ ORDERED MODULE LIST ]\n");

  /* 
    만일, 현재 package가 다른 모듈로부터 dependency가 걸려있다면,
    install-self 를 해서, package.name 으로 require 할 수 있도록 한다.
  */
  const selfPackageLink = path.resolve(appRootPath, "node_modules", pkg.name);

  if (!existsSync(selfPackageLink)) {
    mkdirSync(selfPackageLink);
  }

  pkg.main = path.resolve(appRootPath, pkg.main);

  if (pkg.typings) {
    pkg.typings = path.resolve(appRootPath, pkg.typings);
  }

  writeFileSync(
    path.resolve(selfPackageLink, "package.json"),
    JSON.stringify(pkg, null, 4)
  );

  /*
    assets 및 views 폴더를 삭제한다.
    각 모듈의 assets 폴더와 views 폴더가 build 시 output(dist-client)에 복사되기 때문에,
    사용되지 않는 모듈의 파일이 복사되지 않도록 폴더를 제거한다.
   */
  removeSync(path.resolve(selfPackageLink, "views"));
  removeSync(path.resolve(selfPackageLink, "assets"));
} catch (e) {
  console.error(e);
}

module.exports = orderedModuleNames;
