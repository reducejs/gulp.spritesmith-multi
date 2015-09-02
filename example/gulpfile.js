var gulp = require('gulp');
var spritesmith = require('..');

gulp.task('default', function () {
  return gulp.src('sp/**/*.png')
    .pipe(spritesmith())
    .pipe(gulp.dest('build'))
    ;
});
