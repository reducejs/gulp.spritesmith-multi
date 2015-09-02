# gulp.spritesmith-multi
A wrapper for [gulp.spritesmith](https://github.com/twolfson/gulp.spritesmith) to generate multiple sprites and stylesheets.

## Example

```javascript
var gulp = require('gulp');
var spritesmith = require('gulp.spritesmith-multi');

gulp.task('default', function () {
  return gulp.src('sp/**/*.png')
    .pipe(spritesmith())
    .pipe(gulp.dest('build'))
    ;
});
```

input:

```
⌘ tree sp
sp
├── hover
│   ├── sprite1--hover.png
│   ├── sprite1--hover@2x.png
│   ├── sprite1.png
│   ├── sprite1@2x.png
│   ├── sprite2.png
│   ├── sprite2@2x.png
│   ├── sprite3.png
│   └── sprite3@2x.png
├── normal
│   ├── sprite1.png
│   ├── sprite2.png
│   └── sprite3.png
└── retina
    ├── sprite1.png
    ├── sprite1@2x.png
    ├── sprite2.png
    ├── sprite2@2x.png
    ├── sprite3.png
    └── sprite3@2x.png
```

output:

```
⌘ tree build/
build/
├── hover.css
├── hover.png
├── hover@2x.png
├── normal.css
├── normal.png
├── retina.css
├── retina.png
└── retina@2x.png
```

hover.css

```css
.sp-hover {
  background-image: url(hover.png);
}

@media (-webkit-min-device-pixel-ratio: 2),
       (min-resolution: 192dpi) {
  .sp-hover {
    background-image: url(hover@2x.png);
    background-size: 150px 200px;
  }
}

.sp-hover__sprite1:hover {
  background-position: -100px 0px;
  width: 50px;
  height: 50px;
}
.sp-hover__sprite1 {
  background-position: -100px -50px;
  width: 50px;
  height: 50px;
}
.sp-hover__sprite2 {
  background-position: -100px -100px;
  width: 50px;
  height: 50px;
}
.sp-hover__sprite3 {
  background-position: 0px 0px;
  width: 100px;
  height: 200px;
}
```

## stream = spritesmith(options)

Generates a transform to be used in the gulp pipeline, icons in, sprites and stylesheets out.

### options

#### getGroupName

Type: `Function`

Default: `null`

Receives a [vinyl](https://github.com/wearefractal/vinyl) file object (the icon file),
and should return a string indicating the sprite into which the current icon should be included.

This function splits incoming icons into several groups,
and each group will be converted into a seperate sprite and stylesheet.

By default, icons are split according to the directory where they lie.

#### cssExtension

Type: `String`

Default: `.css`

If `sass` or `less` files are going to be generated,
probably this option is needed.

#### cssSpritesheetNamePrefix

Type: `String`

Default: `sp-`

The prefix of corresponding css classes.

#### gulpSpritesmithOptionsFilter

Type: `Function`

Default: `null`

Receives the default options and the group name,
and should return the new options object.

This options object is passed directly to [gulp.spritesmith](https://github.com/twolfson/gulp.spritesmith),
so you can use all the features provided by it.

For example,
you can add a `cssTemplate` field to make custom templates.
To make things easier,
this package provides a function to build `cssTemplate` functions.

## Pseudo-classes

The default [template](#custom-template) supports pseudo-classes.

Suppose you have `icon.png` and `icon--hover.png` in sprite `pseudo`,
the final css will be like:

```css
.sp-pseudo {
  background-image: url(pseudo.png)
}
.sp-pseudo__icon {
  background-position: -100px -50px;
  width: 50px;
  height: 50px;
}
.sp-pseudo__icon:hover {
  background-position: -100px 0px;
  width: 50px;
  height: 50px;
}

```

Retina icons will be named like `icon--hover@2x.png`.

## Retina support

All retina icon files should be named like `xxx@2x.png`.

## Custom template

```javascript
var templater = require('gulp.spritesmith-multi/lib/templater');
var cssTemplate = templater(
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
```

###  templater(templateInfo, filter)

#### templateInfo

Type: `String`, `Object`

If `String`,
it is the path of the template file.

If `Object`,
you can pass the path via the `file` field,
or pass the template via the `contents` field.

If a `name` field is specified,
the corresponding template will be registered as a handlebars partial.

#### filter

Type: `Function`, `Object`

Default: `null`

To filter the `data` before being applied to build the stylesheet by handlebars.

If `Function`,
it receives the old [data](https://github.com/twolfson/spritesheet-templates#template-data),
and should return the new data object.

If `Object`,
it will be mixed into the old `data`.


