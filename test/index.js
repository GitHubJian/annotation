require('reflect-metadata')
require('@babel/register')({
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }]
  ]
})

const factory = require('../core/nest-factory')
const AppModule = require('./modules/app')

async function bootstrap() {
  await factory.Factory.create(AppModule)
}

bootstrap()
