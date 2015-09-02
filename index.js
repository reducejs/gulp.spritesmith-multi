var merge = require('merge-stream');
var spritesmith = require('gulp.spritesmith');
var sink = require('sink-transform');
var pick = require('util-mix/lib/pick');
var each = require('util-mix/lib/each');

var split = require('./lib/split');
var buildOptions = require('./lib/buildGulpSpritesmithOptions');

module.exports = function (opts) {
  opts = opts || {};
  return sink.obj(function (sprites, done) {
    var groups = split(
      sprites,
      pick('getGroupName', opts)
    );
    if (!groups) {
      done();
      return;
    }

    var output = merge();
    output.on('error', this.emit.bind(this, 'error'));
    each(groups, function (files, name) {
      var spritesmithOpts = buildOptions(
        name,
        files,
        pick([
          'cssExtension',
          'cssSpritesheetNamePrefix',
          'gulpSpritesmithOptionsFilter',
        ], opts)
      );
      var stream = spritesmith(spritesmithOpts);
      files.forEach(function (file) {
        stream.write(file);
      });
      stream.end();
      stream.file = name;
      output.add(stream);
    });

    var self = this;
    output.pipe(sink.obj(function (files, cb) {
      files.forEach(function (file) {
        self.push(file);
      });
      cb();
      done();
    }));
  });
};

