const path = require('path')

describe('app-root-path', () => {
  test('should return cwd(current working directory)', () => {
    const appRootPath = require('app-root-path').path
    const currentWorkingDirectory = path.resolve('.')

    expect(appRootPath).toEqual(currentWorkingDirectory)
  })

  test('should return preset directory', () => {
    require('app-root-path').setPath(__dirname)
    const appRootPath = require('app-root-path').path

    expect(appRootPath).toEqual(__dirname)
  })
})
