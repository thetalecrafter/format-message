/* eslint-env mocha */
'use strict'

var plugin = require('../../packages/eslint-plugin-format-message')

var expect = require('chai').expect
var fs = require('fs')
var path = require('path')

var rules = fs.readdirSync(path.resolve(__dirname, '../../packages/eslint-plugin-format-message/lib/rules/'))
  .filter(function (f) { return f[0] !== '.' })
  .map(function (f) { return path.basename(f, '.js') })

describe('all rule files should be exported by the plugin', function () {
  rules.forEach(function (ruleName) {
    it('should export ' + ruleName, function () {
      expect(plugin.rules[ruleName]).to.eql(
        require(path.join('../../packages/eslint-plugin-format-message/lib/rules', ruleName))
      )
    })
  })
})
