# Epub-Constructor

This library is forked from [epub-constructor](https://github.com/CD-Z/react-native-epub-creator) and depends on the [react-native-epub-creator](https://github.com/HimoJuku/react-native-epub-creator) for construct the epub files.

Specifically, it provides the necessary methods to create the epub file structure and generate the required files, such as `mimetype`, `META-INF/container.xml`, and `EPUB/package.opf`. It also includes methods for creating the HTML files for each chapter and generating the table of contents (TOC) in both HTML and NCX formats.

We aims to fix the upstream library and make it work with the latest version of React Native.

### Install

`npm install @himojuku/epub-constructor`

### How to use

```js
import EpubFile from 'epub-constructor'
    var epub = new EpubFile({
          title: "example",
          fileName: "examplefile" // optional, it will take title if not set
          language: "en",
          description: "this is a epub test",
          stylesheet:{
           p: {
            width:"100%"
           }
          },
          chapters:[{
            fileName: "examplefile" // optional, it will take title if not set
            title: "Air born",
            htmlBody: "<p>this is chapter 1</p>"
          },{
            title:"chapter 2",
            htmlBody: "<p>this is chapter 1</p>"
          }]
      });
    var file = await epub.constructEpub();
    // save the file to your device
```

This is what file will containe

```js
[
  {path:"mimetype",content:"application/epub+zip"},
  {path:"META-INF/container.xml",content:"<?xml version="1.0" encoding="UTF-8"?> <container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"> <rootfiles> <rootfile full-path="EPUB/example.opf" media-type="application/oebps-package+xml"/> </rootfiles> </container>"},
  {path:"EPUB/styles.css",content:'body { font-family: "Helvetica Neue", "Helvetica", "Arial", sans-serif; font-size: 1.125em; line-height: 1.6em; color: #000; } h1, h2, h3, h4, h5, h6 { line-height: 1em; } h1 { font-size: 3em; } h2 { font-size: 2.5em; } p { width: 100%; }'},
  {path:"EPUB/Air born.html",content:'<?xml version="1.0" encoding="utf-8"?> <!DOCTYPE html> <html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"> <head> <link rel="stylesheet" type="text/css" href="styles.css"/> <title>Air born</title> </head> <body> <p>this is a content</p> </body> </html>'},
  {path:"EPUB/chapter 2.html",content:' <?xml version="1.0" encoding="utf-8"?> <!DOCTYPE html> <html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"> <head> <link rel="stylesheet" type="text/css" href="styles.css"/> <title>chapter 2</title> </head> <body> <p>this is a content</p> </body> </html>'},
  {path:"EPUB/example.opf",content:'<?xml version="1.0" encoding="utf-8"?> <package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="3.0"> <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title class="title">example</dc:title><dc:language class="language">en</dc:language><dc:identifier class="identifier" id="BookId">364</dc:identifier><dc:description class="description">this is a epub test</dc:description><dc:date>Fri Oct 01 2021 16:04:48 GMT+0200 (Central European Summer Time)</dc:date><dc:rights class="rights"></dc:rights><dc:source class="source"></dc:source></metadata> <manifest><item href="styles.css" id="css1" media-type="text/css"></item><item id="Air born1" href="Air born.html" media-type="application/xhtml+xml" ></item><item id="chapter 22" href="chapter 2.html" media-type="application/xhtml+xml" ></item><item properties="nav" id="toc" href="toc.html" media-type="application/xhtml+xml" ></item> <item href="toc.ncx" id="ncx" media-type="application/x-dtbncx+xml"></item></manifest> <spine toc="ncx"><itemref idref="Air born1" ></itemref><itemref idref="chapter 22" ></itemref></spine> </package>'},
  {path:"EPUB/toc.html",content:'<?xml version="1.0" encoding="utf-8"?> <!DOCTYPE html> <html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"> <head> <link rel="stylesheet" type="text/css" href="styles.css" > <title>toc</title> </head> <body> <nav epub:type="toc" id="toc"> <h1>Table of Contents</h1> <ol> <li><a href="Air born.html">Air born</a></li><li><a href="chapter 2.html">chapter 2</a></li></ol> </nav> </body> </html>'},
  {path:"EPUB/toc.ncx",content:'<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1" xml:lang="en" dir="ltr"> <head> <meta name="dtb:uid" content="http://digitalpublishingtoolkit.org/ExampleEPUB.html" > <meta name="dtb:depth" content="2" > <meta name="dtb:totalPageCount" content="2" > <meta name="dtb:maxPageNumber" content="0" > </head> <docTitle> <text>example EPUB</text> </docTitle> <docAuthor> <text>undefined</text> </docAuthor> <navMap> <navPoint id="Air born1" playOrder="1"> <navLabel> <text>Air born</text> </navLabel> <content src="Air born.html" ></content></navPoint><navPoint id="chapter 22" playOrder="2"> <navLabel> <text>chapter 2</text> </navLabel> <content src="chapter 2.html" ></content></navPoint></navMap> </ncx>'}
]
```

You will have to create those files and make a zip file there after.

You could also read an epub file and begin to modify or append chapters there after.

## Currently not working

```js
// file have to be extracted by your self. It should look like the above json and be created by this library
var settings = EpubFile.load(file);
settings.chapters.push({
  title: 'chapter 3',
  htmlBody: '<p>this is chapter 3</p>',
});
var epub = new EpubFile(settings);
var file = await epub.constructEpub();
// save the file to your device
```