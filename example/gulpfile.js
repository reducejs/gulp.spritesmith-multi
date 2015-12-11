var gulp = require('gulp')
var path = require('path')
var spritesmith = require('..')

gulp.task('clean', function () {
  var del = require('del')
  return del(path.join(__dirname, 'build'))
})

gulp.task('default', ['clean'], function () {
  return gulp.src('default/**/*.png')
    .pipe(spritesmith())
    .pipe(gulp.dest('build'))
})

gulp.task('theme', ['clean'], function () {
  var util = spritesmith.util
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

gulp.task('sprite', ['clean'], function () {
  var merge = require('merge-stream')
  var imagemin = require('gulp-imagemin')
  var csso = require('gulp-csso')

  // Generate our spritesheet
  var spriteData = gulp.src('default/**/*.png')
    .pipe(spritesmith({
      spritesmith: function (options) {
        options.imgPath = '../images/' + options.imgName
        options.retinaImgPath = '../images/' + options.retinaImgName
      }
    }))

  // Pipe image stream through image optimizer and onto disk
  var imgStream = spriteData.img
    .pipe(imagemin())
    .pipe(gulp.dest('build/images'))

  // Pipe CSS stream through CSS optimizer and onto disk
  var cssStream = spriteData.css
    .pipe(csso())
    .pipe(gulp.dest('build/css'))

  // Return a merged stream to handle both `end` events
  return merge(imgStream, cssStream)
})
