var path = require('path')
var thr = require('through2')
var mix = require('util-mix')
var merge = require('merge-stream')
var spritesmith = require('gulp.spritesmith')

var builtin = require('./lib/builtin')

exports = module.exports = gulpSpritesmith
exports.util = require('./lib/util')
exports.builtin = builtin

function gulpSpritesmith(opts) {
  opts = opts || {}

  var groups = {}

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
    var sprites = Object.keys(groups)
    if (sprites.length === 0) {
      return done()
    }

    var streams = merge()
    var output = this

    sprites.forEach(function (sprite) {
      var icons = groups[sprite]
      var options = filterSmithOption(
        createSmithOption(sprite, icons),
        opts.spritesmith, sprite, icons
      )
      var gulpSpriteStream = spritesmith(options)
      icons.forEach(function (icon) {
        gulpSpriteStream.write(icon)
      })
      gulpSpriteStream.end()
      gulpSpriteStream.file = sprite
      streams.add(gulpSpriteStream)
    })

    streams.on('error', done)
    streams.on('data', function (file) {
      output.push(file)
    })
    streams.on('end', done)
  }

  return thr.obj(write, end)
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

