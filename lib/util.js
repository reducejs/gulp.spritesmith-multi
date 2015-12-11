var fs = require('fs')
var handlebars = require('handlebars')
var mix = require('mixy')

exports.addPseudoClass = function (data) {
  var pseudoPat = /--(\w+)$/
  data.sprites.forEach(function (sprite) {
    var name = sprite.name
    var matches = name.match(pseudoPat)
    if (matches && matches[1]) {
      sprite.name = name.slice(0, -1 * (matches[1].length + 2))
      sprite.pseudo_class = ':' + matches[1]
    }
  })
  return data
}

exports.createTemplate = function (tplInfo, filter) {
  if (typeof tplInfo === 'string') {
    tplInfo = { file: tplInfo }
  }

  var tmpl = tplInfo.source
  if (typeof tplInfo.source !== 'string') {
    tmpl = fs.readFileSync(tplInfo.file, 'utf8')
  }

  if (tplInfo.name) {
    handlebars.registerPartial(tplInfo.name, tmpl)
  }

  var templater = handlebars.compile(tmpl)

  filter = [].concat(filter).filter(Boolean)

  return function (data) {
    data = filter.reduce(function (o, f) {
      return typeof f === 'function' ? f(o) || o : mix(o, f)
    }, data)
    return templater(data)
  }
}

