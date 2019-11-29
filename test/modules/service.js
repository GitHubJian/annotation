const { Injectable } = require('../../common')

@Injectable()
class AppService {
  getHello(id) {
    return `Hello world! id=${id}`
  }
}

module.exports = AppService
