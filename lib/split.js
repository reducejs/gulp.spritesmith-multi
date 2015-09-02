var path = require('path');

module.exports = function (files, opts) {
  if (!files.length) {
    return null;
  }

  opts = opts || {};
  var getGroupName = opts.getGroupName || function (file) {
    return path.basename(
      path.dirname(file.path)
    );
  };

  var groups = {};
  files.forEach(function (file) {
    var name = getGroupName(file);
    groups[name] = [].concat(groups[name], file).filter(Boolean);
  });
  return groups;
};
