var path = require('path')
var util = require('../util')

module.exports = util.createTemplate(
  path.join(__dirname, 'responsive-css.hbs'),
  [util.generatePercentage, util.addPseudoClass]
)

