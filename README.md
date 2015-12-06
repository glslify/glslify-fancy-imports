# glslify-fancy-imports

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

glslify transform that provides you with a cleaner module import/export syntax ✨

May eventually be available in glslify directly, but using this for people to try out and express opinions. Regardless, the old syntax will still be available for backwards compatibility.

## Setup

[![NPM](https://nodei.co/npm/glslify-fancy-imports.png)](https://www.npmjs.com/package/glslify-fancy-imports)

After installing, you can include this as a local transform from the CLI like to enable:

``` bash
glslify index.glsl -t glslify-fancy-imports
```

Alternatively you can add the transform by adding `glslify.transform` to your `package.json` file:

``` json
{
  "name": "my-package",
  "dependencies": {
    "glslify": "^4.0.0",
    "glslify-fancy-imports": "^1.0.0"
  },
  "glslify": {
    "transform": [
      "glslify-fancy-imports"
    ]
  }
}
```

## Usage

Right now the fancy import syntax is just sugar on top of the existing syntax, e.g. the following:

``` glsl
import z from './test'
import y from './test' where { map1 = source2, map2 = source1 }
import x from './test' where {
  map1 = source1,
  map2 = source2
}

export w
```

Gets converted into:

``` glsl
#pragma glslify: z = require('./test')
#pragma glslify: y = require('./test', map1 = source2, map2 = source1)
#pragma glslify: x = require('./test', map1 = source1, map2 = source2)

#pragma glslify: export(w)
```

The key difference is that there's no more `#pragma glslify:`. The imports/exports have their own glslify-specific language syntax (for better, or for worse).

You'll also notice that you can now declare your module name mappings over multiple lines, which is handy for packages that require a lot of configuration this way.

## Contributing

See [stackgl/contributing](https://github.com/stackgl/contributing) for details.

## License

MIT. See [LICENSE.md](http://github.com/stackgl/glslify-fancy-imports/blob/master/LICENSE.md) for details.
