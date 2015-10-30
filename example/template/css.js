var path = require('path')
var util = require('../util')

module.exports = util.createTemplate(
  path.join(__dirname, 'css.hbs'),
  util.addPseudoClass
)

