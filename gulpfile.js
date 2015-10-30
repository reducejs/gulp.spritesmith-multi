var gulp = require('gulp')

gulp.task('clean', function () {
  var del = require('del')
  return del('build')
})

gulp.task('scripts', ['clean'], function () {
  return gulp.src(['lib/*.js', 'bin/*.js', 'index.js'], { base: process.cwd() })
    .pipe(gulp.dest('build'))
})

gulp.task('docs', ['clean'], function () {
  return gulp.src(['README.md', 'LICENSE', 'package.json'])
    .pipe(gulp.dest('build'))
})

gulp.task('build', ['scripts', 'docs'])

gulp.task('lint', function () {
  var eslint = require('gulp-eslint')
  return gulp.src(['*.js', 'bin/*.js', 'lib/*.js', 'test/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
})

gulp.task('test', test)
gulp.task('coverage',
  require('callback-sequence')(instrument, test, report)
)
gulp.task('default', ['lint', 'coverage'])
gulp.task('upload-coverage', ['coverage'], function (cb) {
  var handleReport = require('coveralls/lib/handleInput')
  var fs = require('fs')
  fs.readFile('./coverage/lcov.info', 'utf8', function (err, data) {
    if (err) {
      return cb(err)
    }
    handleReport(data, cb)
  })
})

function instrument() {
  var istanbul = require('gulp-istanbul')
  return gulp.src(['lib/*.js', 'index.js'])
    .pipe(istanbul({ includeUntested: true }))
    .pipe(istanbul.hookRequire())
}

function test() {
  require('task-tape')
  var tape = require('gulp-tape')
  var reporter = require('tap-spec')
  return gulp.src('test/*.js')
    .pipe(tape({
      reporter: reporter(),
    }))
}

function report() {
  var istanbul = require('gulp-istanbul')
  return gulp.src('test/*.js', { read: false })
    .pipe(istanbul.writeReports())
    .pipe(istanbul.enforceThresholds({
      thresholds: {
        global: {
          statements: 90,
          functions: 90,
          branches: 80,
          lines: 90,
        },
      },
    }))
}

