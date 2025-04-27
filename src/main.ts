import { File, EpubSettings, InternalEpubChapter } from "../types";
import {
  createFile,
  getImageType,
  removeFileExtension,
  setChapterFileNames,
  sanitizeFileName,
} from "./methods/helper";
import { createStyle } from "./methods/createStyle";
import { createMetadata } from "./constructors/metadataConstructor";
import { createChapter } from "./methods/createChapter";
import {
  manifestChapter,
  manifestCover,
  manifestImage,
  manifestNav,
  manifestStyle,
  manifestToc,
} from "./constructors/manifestConstructor";
import {
  defaultContainer,
  defaultEpub,
  defaultHtmlToc,
  defaultNcxToc,
} from "./constructors/defaultsConstructor";

export default class EpubFile {
  epubSettings: EpubSettings;

  constructor(epubSettings: EpubSettings) {
    this.epubSettings = {
      ...epubSettings,
      fileName: sanitizeFileName(epubSettings.fileName ?? epubSettings.title),
    };
  }

  /**
   * Constructs the EPUB file based on the provided settings.
   * @param localOnProgress Optional callback function to track the progress of EPUB construction.
   * @returns An array of File objects representing the files in the EPUB.
   * @throws Error if the EPUB file needs at least one chapter.
   */
  public async constructEpub(): Promise<File[]> {
    const files: File[] = [];
    const manifest: string[] = [];
    const spine: string[] = [];
    if (
      !this.epubSettings.chapters ||
      this.epubSettings.chapters.length === 0
    ) {
      throw new Error("Epub file needs at least one chapter");
    }
    if (!this.epubSettings.title || this.epubSettings.title.trim() === "") {
      throw new Error("Epub file needs a title");
    }

    const len = this.epubSettings.chapters.length;

    this.epubSettings.bookId ??= new Date().getUTCMilliseconds().toString();
    this.epubSettings.fileName = removeFileExtension(
      this.epubSettings.fileName
    );

    if (this.epubSettings.cover) {
      const fileType = getImageType(this.epubSettings.cover);
      const coverFilePath = `OEBPS/images/cover.${fileType}`;
      files.push(createFile(coverFilePath, this.epubSettings.cover, true));
      manifest.push(manifestCover(fileType));
    }
    files.push(
      createFile(
        "META-INF/container.xml",
        defaultContainer(this.epubSettings.fileName)
      ),
      createFile("EPUB/styles.css", createStyle(this.epubSettings.stylesheet)),
      createFile(
        "EPUB/script.js",
        `function fnEpub(){${this.epubSettings.js ?? ""}}`
      )
    );
    let epub = defaultEpub();
    let ncxToc = defaultNcxToc(
      this.epubSettings.chapters.length,
      this.epubSettings.title,
      this.epubSettings.bookId,
      this.epubSettings.author
    );
    let htmlToc = defaultHtmlToc(this.epubSettings.title);
    let metadata = createMetadata(this.epubSettings);
    const navMap: string[] = [];
    const ol: string[] = [];

    this.epubSettings.chapters = setChapterFileNames(
      this.epubSettings.chapters
    );

    for (let index = 0; index < len; index++) {
      const chapter = this.epubSettings.chapters[index] as InternalEpubChapter;

      let imageIndex = 0;
      const idRef = `${sanitizeFileName(chapter.title)}_image_${imageIndex}`;
      chapter.htmlBody = chapter.htmlBody
        .replace(/(?<=<img[^>]+src=(?:\"|')).+?(?=\"|')/gi, (uri: string) => {
          imageIndex++;
          const fileType = getImageType(uri);
          const path = `OEBPS/images/${idRef}.${fileType}`;
          files.push(createFile(path, uri, true));
          manifest.push(manifestImage("../" + path, fileType));
          return `../../${path}`;
        })
        .replace(/\&nbsp/g, "")
        .replace(/(<img[^>]+>)(?!\s*<\/img>)/g, "$1</img>")
        .replace(/<\/?(?:html|head|body|input)[^>]*>/g, "");
      manifest.push(manifestChapter(idRef, chapter.fileName));
      files.push(createChapter(chapter));
      spine.push(`<itemref idref="${idRef}" ></itemref>`);
      ol.push(`<li><a href="${chapter.fileName}">${chapter.title}</a></li>`);
      navMap.push(
        `<navPoint id="${idRef}" playOrder="${index + 1}">
          <navLabel>
            <text>${chapter.title}</text>
          </navLabel> <content src="${chapter.fileName}" />
        </navPoint>`
      );
    }
    manifest.push(manifestNav(), manifestStyle(), manifestToc());

    epub = epub
      .replace("#manifest", manifest.join("\n"))
      .replace("#spine", spine.join("\n"))
      .replace("#metadata", metadata);
    ncxToc = ncxToc.replace("#navMap", navMap.join("\n"));
    htmlToc = htmlToc.replace("#ol", ol.join("\n"));
    files.push(
      createFile(`EPUB/${this.epubSettings.fileName}.opf`, epub),
      createFile("EPUB/toc.xhtml", htmlToc),
      createFile("EPUB/toc.ncx", ncxToc),
      createFile("mimetype", "application/epub+zip")
    );

    return files;
  }
}
