var gulp = require('gulp')
var path = require('path')
var spritesmith = require('..')
var util = spritesmith.util
var del = require('del')

gulp.task('clean', function () {
  return del(path.join(__dirname, 'build'))
})

gulp.task('default', ['clean'], function () {
  return gulp.src('default/**/*.png')
    .pipe(spritesmith())
    .pipe(gulp.dest('build'))
})

gulp.task('theme', ['clean'], function () {
  var opts = {
    spritesmith: function (options, sprite, icons){
      if (sprite.indexOf('hover--') !== -1) {
        options.cssTemplate = themeTemplate
      }
      return options
    },
  }
  var themeTemplate = util.createTemplate(
    path.join(__dirname, 'template', 'css.hbs'),
    [addTheme, util.addPseudoClass]
  )
  function addTheme(data) {
    var info = data.spritesheet_info
    var match = info.name.match(/hover--(\w+)/)
    data.theme = match && match[1]
  }
  return gulp.src('custom-template/**/*.png')
    .pipe(spritesmith(opts))
    .pipe(gulp.dest('build'))
})
