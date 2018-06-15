# build-unicode-category-data

This is a small [Node.js](https://nodejs.org/en/) script
which parses the content of
[UnicodeData.txt](https://www.unicode.org/Public/UCD/latest/ucd/UnicodeData.txt)
and produces a list of
[general categories](https://www.unicode.org/reports/tr44/#General_Category_Values)
and the [code points](http://unicode.org/glossary/#code_point) contained
within them.
The script then writes that list as a
[JSON](https://en.wikipedia.org/wiki/JSON) file.

The purpose of this tool is to produce unicode general category data in a format
that is easy to use and to process.

Note that `UnicodeData.txt`, a version of which is included in this repository,
is copyright Unicode, Inc. The full licensing terms for unicode data files
including `UnicodeData.txt`, which permits the distribution of those data files,
can be viewed online at http://www.unicode.org/copyright.html

Otherwise, the content of this repository is public domain.

## Running the script

To run the script, you should:

1. Download the latest version of `UnicodeData.txt` from
https://www.unicode.org/Public/UCD/latest/ucd/UnicodeData.txt

2. Place the downloaded file in the same directory as
`build-unicode-category-data.js`. (You should overwrite the `UnicodeData.txt` file included in this repository.)

3. Run the script using Node.js, for example by entering
`node build-unicode-category-data.js` in the command line.

If the script ran successfully, then it should have written or overwritten
a file in the same directory named `unicode-data.json`, and it should have
outputted a log like this to stdout:

``` text
Reading txt data file.
Parsing txt data file.
On line 5000 of about 32,000...
On line 10000 of about 32,000...
On line 15000 of about 32,000...
On line 20000 of about 32,000...
On line 25000 of about 32,000...
On line 30000 of about 32,000...
Adding derived categories.
Writing json data file.
All done!
```

## Output format

The outputted `unicode-data.json` file contains a list of general categories
in JSON format.

- The `shortName` attribute gives the category's abbreviated name.
- The `fullName` attribute gives the category's full name.
- The `fullCharacterList` attribute provides a compile list of every code
point that is included in the category.
- The `singleCharacters` attribute lists those code points that are included
in the category, and are not included in a range in `characterRanges`.
- The `characterRanges` attribute gives a list of ranges of code points that
are included in the category.
- The `derivedFrom` attribute is a list of abbreviated category names if
the category is a combination of some other categories, and `null` if it
isn't a combination of other categories.
For example, the `Number` general category is a combination of the
`Decimal_Number`, `Letter_Number`, and `Other_Number` categories.

The purpose of having separate `singleCharacters` and `characterRanges`
attributes is that this separation may help in some cases to check more
efficiently whether a given code point is contained within the category.
Comparing once for equality with every code point in `singleCharacters`
and comparing twice for inclusion in each range in `characterRanges` will
result in fewer overall comparisons than comparing equality once for every
code point in `fullCharacterList`.

Here are some examples of what one the objects in the outputted JSON list
look like:

``` json
{
    "shortName": "Zs",
    "fullName": "Space_Separator",
    "fullCharacterList": [
        32,
        160,
        5760,
        8192,
        8193,
        8194,
        8195,
        8196,
        8197,
        8198,
        8199,
        8200,
        8201,
        8202,
        8239,
        8287,
        12288
    ],
    "singleCharacters": [
        32,
        160,
        5760,
        8239,
        8287,
        12288
    ],
    "characterRanges": [
        [
            8192,
            8202
        ]
    ],
    "derivedFrom": null
},
```

Note that the lists in this example are truncated for ease of readability:

``` json
{
    "shortName": "P",
    "fullName": "Punctuation",
    "fullCharacterList": [
        33,
        34,
        35,
        37,
        38,
        ...
    ],
    "singleCharacters": [
        95,
        123,
        125,
        161,
        167,
        ...
    ],
    "characterRanges": [
        [33, 35],
        [37, 42],
        [44, 47],
        [58, 59],
        [63, 64],
        ...
    ],
    "derivedFrom": [
        "Pc",
        "Pd",
        "Ps",
        "Pe",
        "Pi",
        "Pf",
        "Po"
    ]
},
```
