const path = require('path')

var DEPENDENCY_MAP = {}
var nodes = {}
var edges = []

function getDependencies(packageNames = []) {
  var dependencies = []

  for (const name of packageNames) {
    if (DEPENDENCY_MAP[name] || name == '@things-factory/shell') {
      dependencies.push(name)
      continue
    }

    var packageJson = require(name + '/package.json')
    if (!packageJson['things-factory']) {
      delete DEPENDENCY_MAP[name]
      for (const key in DEPENDENCY_MAP) {
        const d = DEPENDENCY_MAP[key]
        const idx = d.findIndex(n => n == name)
        if (idx > -1) d.splice(idx, 1)
      }
      continue
    }

    dependencies.push(name)

    var deps = Object.keys(packageJson.dependencies || [])
    var filtered = deps.filter(d => d.startsWith('@things-factory/'))

    if (!filtered || filtered.length === 0) continue

    DEPENDENCY_MAP[name] = getDependencies(filtered)
  }

  return dependencies
}

const appRootPath = require('app-root-path').path
const pkg = require(path.resolve(appRootPath, 'package.json'))

var dependencyGraph = {}

try {
  const dependencyNames = Object.keys(pkg.dependencies).filter(dep => dep.startsWith('@things-factory/'))
  const devDependencyNames = Object.keys(pkg.devDependencies).filter(dep => dep.startsWith('@things-factory/'))

  if (pkg.name !== '@things-factory/shell' && pkg['things-factory']) {
    DEPENDENCY_MAP[pkg.name] = dependencyNames
  }

  getDependencies(dependencyNames)
  getDependencies(devDependencyNames)

  Object.keys(DEPENDENCY_MAP).forEach(key => {
    nodes[key] = {
      id: key,
      name: key.substr(16)
    }

    var dependencies = DEPENDENCY_MAP[key]

    dependencies.forEach(dep => {
      edges.push({
        source: key,
        target: dep
      })
    })
  })

  dependencyGraph = {
    nodes,
    edges
  }
} catch (e) {
  console.error(e)
}

module.exports = dependencyGraph
