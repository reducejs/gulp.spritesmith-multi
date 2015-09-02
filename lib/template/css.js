var templater = require('../templater');
var path = require('path');

module.exports = templater(
  path.join(__dirname, 'css.hbs'),
  function (data) {
    var pseudoPat = /--(\w+)$/;
    data.sprites.forEach(function (sprite) {
      var name = sprite.name;
      var matches = name.match(pseudoPat);
      if (matches && matches[1]) {
        sprite.name = name.slice(0, -1 * (matches[1].length + 2));
        sprite.pseudo_class = ':' + matches[1];
      }
    });
    return data;
  }
);

