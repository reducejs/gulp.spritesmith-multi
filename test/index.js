var fs = require('fs');
var test = require('tap').test;
var spritesmith = require('..');
var eos = require('end-of-stream');
var del = require('del');
var path = require('path');
var gulp = require('gulp');

var actual = path.resolve.bind(path, __dirname, 'actual');
var expected = path.resolve.bind(path, __dirname, 'expected');
var source = path.resolve.bind(path, __dirname, 'sp');

test('spritesmith', function(t) {
  var expectedFiles = fs.readdirSync(expected());

  t.plan(expectedFiles.length + 2);
  del.sync(actual());
  var stream = gulp.src(source('**/*.png'))
    .pipe(spritesmith())
    .pipe(gulp.dest(actual()));
  eos(
    stream,
    function (err) {
      t.error(err);
      var actualFiles = fs.readdirSync(expected());
      t.same(expectedFiles, actualFiles);
      actualFiles.forEach(function (f) {
        t.same(
          fs.readFileSync(actual(f)),
          fs.readFileSync(expected(f))
        );
      });
    }
  );
});

