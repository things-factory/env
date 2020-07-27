const path = require('path')
const fs = require('fs-extra')

const appRootPath = process.cwd()
var sceneModuleNames = []

try {
  const module_path = path.resolve(appRootPath, 'node_modules')
  const thingsSceneDir = path.resolve(module_path, '@things-scene')
  const folders = fs.readdirSync(thingsSceneDir)

  folders.forEach(folder => {
    try {
      const pkg = require(path.resolve(thingsSceneDir, folder, 'package.json'))
      sceneModuleNames.push(pkg.name)
    } catch (e) {
      console.warn(e)
    }
  })

  try {
    /* 루트 폴더의 package.json을 보고 추가한다. */
    const pkg = require(path.resolve(appRootPath, 'package.json'))
    pkg['things-scene'] && sceneModuleNames.push(pkg.name)
  } catch (e) {
    console.error(e)
  }
} catch (e) {
  console.info('@things-scene modules not found.')
}

module.exports = sceneModuleNames
