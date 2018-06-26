[![Build status][ci image]][ci]

Renders BBCode.

```javascript
var html = bbcode.render('[b]Hello, world![/b]');
```

`bbcode.render` takes an optional second argument, `options`,
an object whose properties alter the renderer’s behaviour in some way.
The available options are:

Option name           | Description | Default
----------------------|-------------|--------
`automaticParagraphs` | Whether `<p>` elements should be created automatically based on line breaks, as in Markdown. | `false`


  [ci]: https://travis-ci.com/FurAffinity/bbcode-js
  [ci image]: https://api.travis-ci.com/FurAffinity/bbcode-js.svg
