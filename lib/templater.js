var fs = require('fs');
var handlebars = require('handlebars');
var mix = require('util-mix');
var path = require('path');

module.exports = function (tplInfo, filter) {
  if (typeof tplInfo === 'string') {
    tplInfo = { file: tplInfo };
  }
  tplInfo.file = tplInfo.file || path.join(__dirname, 'template', 'css.hbs');
  var tmpl = typeof tplInfo.contents === 'string'
    ? tplInfo.contents
    : fs.readFileSync(tplInfo.file, 'utf8')
    ;

  if (tplInfo.name) {
    handlebars.registerPartial(tplInfo.name, tmpl);
  }

  return function (data) {
    return handlebars.compile(tmpl)(
      typeof filter === 'function'
        ? filter(data)
        : mix(data, filter)
    );
  };
};

