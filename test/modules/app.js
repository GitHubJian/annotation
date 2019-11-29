const { Module } = require('../../common')
const AppController = require('./controller')
const AppService = require('./service')

@Module({
  providers: [AppService],
  controllers: [AppController]
})
class AppModule {}

module.exports = AppModule
