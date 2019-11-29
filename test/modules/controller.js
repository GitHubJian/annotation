const { Controller, Dependencies, Inject } = require('../../common')
require('./service')

@Controller('hello')
@Dependencies('AppService')
class AppController {
  @Inject('AppService')
  appService

  getHello() {
    return this.appService.getHello()
  }
}

module.exports = AppController
