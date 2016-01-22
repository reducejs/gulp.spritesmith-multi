var path = require('path')
var thr = require('through2')
var mix = require('mixy')
var util = require('util')
var merge = require('merge-stream')
var spritesmith = require('gulp.spritesmith')

var builtin = require('./lib/builtin')

exports = module.exports = gulpSpritesmith
exports.util = require('./lib/util')
exports.builtin = builtin

function gulpSpritesmith(opts) {
  opts = opts || {}

  var groups = {}
  var output = thr.obj(write, end)
  var wait = thr.obj()
  var imgStream = output.img = merge(wait)
  var cssStream = output.css = merge(wait)

  function to(file) {
    if (typeof opts.to === 'string') {
      return opts.to
    }
    if (typeof opts.to === 'function') {
      return opts.to(file)
    }
    return path.basename(
      path.dirname(file)
    )
  }

  function write(file, _, next) {
    var sprite = to(file.path)
    groups[sprite] = groups[sprite] || []
    groups[sprite].push(file)
    next()
  }

  function end(done) {
    wait.end()
    var sprites = Object.keys(groups)
    if (sprites.length === 0) {
      return done()
    }

    sprites.forEach(function (sprite) {
      var icons = groups[sprite]
      var options = filterSmithOption(
        createSmithOption(sprite, icons),
        opts.spritesmith, sprite, icons
      )
      var gulpSpriteStream = spritesmith(options)

      imgStream.add(gulpSpriteStream.img)
      cssStream.add(gulpSpriteStream.css)

      gulpSpriteStream.on('error', errorHandler(output, sprite))
      gulpSpriteStream.img.on('error', errorHandler(imgStream, sprite))
      gulpSpriteStream.css.on('error', errorHandler(cssStream, sprite))

      icons.forEach(function (icon) {
        gulpSpriteStream.write(icon)
      })
      gulpSpriteStream.end()
    })

    merge(imgStream, cssStream)
      .on('error', done)
      .on('data', function (file) {
        output.push(file)
      })
      .on('end', done)
  }

  return output
}

function errorHandler(target, sprite) {
  return function (err) {
    if (!/Retina settings detected/.test(err.message)) {
      return target.emit('error', err)
    }

    var message = util.format(
      'Unmatched retina images found when creating sprite `%s`. %d retina images expected to line up against %d normal images.',
      sprite,
      err.retinaImages.length,
      err.images.length
    )
    var error = new Error(message)
    error['normal images'] = err.images.map(function (img) {
      return img.path
    })
    error['retina images'] = err.retinaImages.map(function (img) {
      return img.path
    })
    target.emit('error', error)
  }
}

function hasRetinaIcon(icons) {
  return icons.some(function (icon) {
    return /@2x.png/.test(icon.path)
  })
}

function createSmithOption(sprite, icons) {
  var options = {
    imgName: sprite + '.png',
    cssName: sprite + '.css',
    cssTemplate: builtin.css,
    cssSpritesheetName: 'sp-' + sprite,
  }
  if (hasRetinaIcon(icons)) {
    options.retinaSrcFilter = '**/*@2x.png'
    options.retinaImgName = sprite + '@2x.png'
  }
  return options
}

function filterSmithOption(options, filter, sprite, icons) {
  if (typeof filter === 'function') {
    return filter(options, sprite, icons) || options
  }
  return mix(options, filter)
}

