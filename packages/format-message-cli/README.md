# ![format-message-cli][logo]

> Command-line tools to lint, extract, and inline format-message translations

[![npm Version][npm-image]][npm]
[![Build Status][build-image]][build]
[![JS Standard Style][style-image]][style]
[![MIT License][license-image]][LICENSE]


Inlined Messages
----------------

The examples provide sample inliner output. This output is not meant to be 100% exact, but to give a general idea of what the transform does.

### Simple messages with no placeholders

```js
formatMessage('My Collections')

// transforms to translated literal
"Minhas Coleções"
```

### Simple string placeholders

```js
formatMessage('Welcome, {name}!', { name: userName });

// messages with simple placeholders transforms to concatenated strings
"Bem Vindo, " + userName + "!" // Bem Vindo, Bob!
```

### Complex number, date, and time placeholders

```js
formatMessage('{ n, number, percent }', { n:0.1 });

// transforms to just the number call
formatMessage.number("en", 0.1, "percent") // "10%"


formatMessage('{ shorty, date, short }', { shorty:new Date() });

// transforms to just the date call
formatMessage.date("en", new Date(), "short") // "1/1/15"


formatMessage('You took {n,number} pictures since {d,date} {d,time}', { n:4000, d:new Date() });

// transforms to a function call, with the function defined at the top level
$$_you_took_n_number_pictures_123456({ n:4000, d:new Date() })
...
function $$_you_took_n_number_pictures_123456(args) {
  return "You took " + formatMessage.number("en", args["n"]) + " pictures since " + formatMessage.date("en", args["d"]) + " " + formatMessage.time("en", args["d"])
} // "You took 4,000 pictures since Jan 1, 2015 9:33:04 AM"
```

### Complex string with select and plural in ES6

```js
import formatMessage from 'format-message'

// using a template string for multiline, no interpolation
let formatMessage(`On { date, date, short } {name} ate {
  numBananas, plural,
       =0 {no bananas}
       =1 {a banana}
       =2 {a pair of bananas}
    other {# bananas}
  } {
  gender, select,
      male {at his house.}
    female {at her house.}
     other {at their house.}
  }`, {
  date: new Date(),
  name: 'Curious George',
  gender: 'male',
  numBananas: 27
})

// transforms to a function call, with the function defined at the top level
$$_on_date_date_short_name_ate_123456({ n:4000, d:new Date() })
...
function $$_on_date_date_short_name_ate_123456(args) {
  return ...
}
// en-US: "On 1/1/15 Curious George ate 27 bananas at his house."
```

### Current Optimizations

* Calls with no placeholders in the message become string literals.
* Calls with no `plural`, `select`, or `selectordinal` in the message, and an object literal with variables or literals for property values become concatentated strings and variables.

All other cases result in a function call, with the function declaration somewhere at the top level of the file.


CLI Tools
---------

All of the command line tools will look for `require`ing or `import`ing `format-message` in your source files to determine the local name of the `formatMessage` function. Then they will either check for problems, extract the original message patterns, or replace the call as follows:

### format-message lint

#### Usage: `format-message lint [options] [files...]`

find message patterns in files and verify there are no obvious problems

#### Options:

    -h, --help                  output usage information
    -n, --function-name [name]  find function calls with this name [formatMessage]
    --no-auto                   disables auto-detecting the function name from import or require calls
    -k, --key-type [type]       derived key from source pattern literal|normalized|underscored|underscored_crc32 [underscored_crc32]
    -t, --translations [path]   location of the JSON file with message translations, if specified, translations are also checked for errors
    -f, --filename [filename]   filename to use when reading from stdin - this will be used in source-maps, errors etc [stdin]

#### Examples:

lint the src js files, with `__` as the function name used instead of `formatMessage`

    format-message lint -n __ src/**/*.js

lint the src js files and translations

    format-message lint -t i18n/pt-BR.json src/**/*.js


### format-message extract

#### Usage: `format-message extract [options] [files...]`

find and list all message patterns in files

#### Options:

    -h, --help                  output usage information
    -n, --function-name [name]  find function calls with this name [formatMessage]
    --no-auto                   disables auto-detecting the function name from import or require calls
    -k, --key-type [type]       derived key from source pattern (literal | normalized | underscored | underscored_crc32) [underscored_crc32]
    -l, --locale [locale]       BCP 47 language tags specifying the source default locale [en]
    -o, --out-file [out]        write messages JSON object to this file instead of to stdout

#### Examples:

extract patterns from src js files, dump json to `stdout`. This can be helpful to get familiar with how `--key-type` and `--locale` change the json output.

    format-message extract src/**/*.js

extract patterns from `stdin`, dump to file.

    someTranspiler src/*.js | format-message extract -o locales/en.json


### format-message inline

#### Usage: `format-message inline [options] [files...]`

find and replace message pattern calls in files with translations

#### Options:

    -h, --help                            output usage information
    -n, --function-name [name]            find function calls with this name [formatMessage]
    --no-auto                             disables auto-detecting the function name from import or require calls
    -k, --key-type [type]                 derived key from source pattern (literal | normalized | underscored | underscored_crc32) [underscored_crc32]
    -l, --locale [locale]                 BCP 47 language tags specifying the target locale [en]
    -t, --translations [path]             location of the JSON file with message translations
    -e, --missing-translation [behavior]  behavior when --translations is specified, but a translated pattern is missing (error | warning | ignore) [error]
    -m, --missing-replacement [pattern]   pattern to inline when a translated pattern is missing, defaults to the source pattern
    -i, --source-maps-inline              append sourceMappingURL comment to bottom of code
    -s, --source-maps                     save source map alongside the compiled code
    -f, --filename [filename]             filename to use when reading from stdin - this will be used in source-maps, errors etc [stdin]
    -o, --out-file [out]                  compile all input files into a single file
    -d, --out-dir [out]                   compile an input directory of modules into an output directory
    -r, --root [path]                     remove root path for source filename in output directory [cwd]

#### Examples:

create locale-specific client bundles with source maps

    format-message inline src/**/*.js -s -l de -t translations.json -o dist/bundle.de.js
    format-message inline src/**/*.js -s -l en -t translations.json -o dist/bundle.en.js
    format-message inline src/**/*.js -s -l es -t translations.json -o dist/bundle.es.js
    format-message inline src/**/*.js -s -l pt -t translations.json -o dist/bundle.pt.js
    ...

inline without translating multiple files that used `var __ = require('format-message')`

    format-message inline -d dist -r src -n __ src/*.js lib/*.js component/**/*.js


License
-------

This software is free to use under the MIT license. See the [LICENSE-MIT file][LICENSE] for license text and copyright information.


[logo]: https://cdn.rawgit.com/format-message/format-message/5ecbfe3/logo.svg
[npm]: https://www.npmjs.org/package/format-message-cli
[npm-image]: https://img.shields.io/npm/v/format-message-cli.svg
[build]: https://travis-ci.org/format-message/format-message
[build-image]: https://img.shields.io/travis/format-message/format-message.svg
[style]: https://github.com/feross/standard
[style-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[license-image]: https://img.shields.io/npm/l/format-message.svg
[LICENSE]: https://github.com/format-message/format-message/blob/master/LICENSE-MIT