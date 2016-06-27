var fs = require('fs')
var test = require('tap').test
var spritesmith = require('..')
var del = require('del')
var path = require('path')
var gulp = require('gulp')
var runSequence = require('callback-sequence').run
var util = spritesmith.util

var fixtures = path.resolve.bind(path, __dirname, 'fixtures')

test(
  'default',
  runTest.bind(null, 'default', null)
)

test(
  'single',
  runTest.bind(null, 'single', {
    to: 'sprite',
  })
)

test(
  'another-single',
  runTest.bind(null, 'single', {
    to: function () {
      return 'sprite'
    },
  })
)

test(
  'custom-template',
  runTest.bind(null, 'custom-template', {
    spritesmith: function (options, sprite) {
      if (sprite.indexOf('hover--') !== -1) {
        options.cssTemplate = util.createTemplate(
          fixtures('template', 'css.hbs'),
          [function addTheme(data) {
            var info = data.spritesheet_info
            var match = info.name.match(/hover--(\w+)/)
            data.theme = match && match[1]
          }, util.addPseudoClass]
        )
      }
      return options
    },
  })
)

test(
  'responsive-css',
  runTest.bind(null, 'responsive-css', {
    spritesmith: {
      cssTemplate: spritesmith.builtin.responsiveCss,
    },
  })
)

function runTest(dir, opts, t) {
  return runSequence([
    clean,
    function () {
      return gulp.src('**/*.png', { cwd: fixtures('src', dir) })
        .pipe(spritesmith(opts))
        .pipe(gulp.dest(fixtures('build')))
    },
  ])
  .then(function () {
    var files = fs.readdirSync(fixtures('expected', dir))
    files.forEach(function (f) {
      t.same(
        fs.readFileSync(fixtures('build', f)),
        fs.readFileSync(fixtures('expected', dir, f))
      )
    })
  })
}

function clean() {
  return del(fixtures('build'))
}

