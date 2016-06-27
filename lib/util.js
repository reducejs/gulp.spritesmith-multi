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

exports.generatePercentage = function (data) {
  data.sprites.forEach(function(sprite) {
    var offset_x = 100 * sprite.x / (sprite.total_width - sprite.width)
    var offset_y = 100 * sprite.y / (sprite.total_height - sprite.height)
    var size = 100 * sprite.total_width / sprite.width

    offset_x = offset_x && Number.isFinite(offset_x) ? offset_x.toFixed(5).replace(/\.?0*$/, '%') : 0
    offset_y = offset_y && Number.isFinite(offset_y) ? offset_y.toFixed(5).replace(/\.?0*$/, '%') : 0
    size = size ? size.toFixed(5).replace(/\.?0*$/, '%') : 0

    sprite.percentage = {
      offset_x: offset_x,
      offset_y: offset_y,
      size: size,
    }
  })
}

