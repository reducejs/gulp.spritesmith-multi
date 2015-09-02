var mix = require('util-mix');

module.exports = function (name, files, opts) {
  opts = opts || {};
  var extension = opts.cssExtension || '.css';
  var prefix = opts.cssSpritesheetNamePrefix || 'sp-';

  var options = {
    imgName: name + '.png',
    cssName: name + extension,
    cssTemplate: require('./template/css'),
    cssSpritesheetName: prefix + name,
  };

  if (hasRetina(files)) {
    mix(options, {
      retinaSrcFilter: '**/*@2x.png',
      retinaImgName: name + '@2x.png',
    });
  }

  if (typeof opts.gulpSpritesmithOptionsFilter === 'function') {
    options = opts.gulpSpritesmithOptionsFilter(options, name);
  }

  return options;
};

function hasRetina(files) {
  return files.some(function (file) {
    return /@2x.png/.test(file.path);
  });
}

