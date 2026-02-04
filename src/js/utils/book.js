// import HttpClient from "@ocdla/lib-http/HttpClient.js";
import TableOfContents from "@ocdla/table-of-contents";

let index;

export async function loadIndex() {
    let xml = await fetch('/books').then(res => res.text());
    const parser = new DOMParser();
    index = parser.parseFromString(xml, "application/xml");

    return index;
}


/**
 * Fetches the specified chapter of a book from the OCDLA publications website.
 *
 * @param {string} book - The title of the book to fetch a chapter from.
 * @param {string} chapter - The chapter number to fetch.
 * @return {string} The text content of the chapter.
 */
export async function loadChapter(book, chapter) {
    let html = await fetch(`/data/${book}/${book}-${chapter}.html`).then(resp => resp.text());

    const parser = new DOMParser();
    return parser.parseFromString(html, "text/html");
}

export async function getChapterList(book) {
    if (!index)
    {
        index = await loadIndex();
    }
    const elems = index.querySelectorAll(`book[shortName="${book}"] > * > :is(part, chapter, appendix)`);
    const toc = TableOfContents.fromXml(elems);

    return toc.getEntries();
}


export async function getBookMetadata(bookShortCode) {
    if (!index)
    {
        index = await loadIndex();
    }
    const title = index.querySelector(`book[shortName="${bookShortCode}"] meta[name="title"]`);
    const editor = index.querySelector(`book[shortName="${bookShortCode}"] meta[name="editor"]`);
    const edition = index.querySelector(`book[shortName="${bookShortCode}"] meta[name="edition"]`);
    console.log(title, editor, edition);


    return {
        title: title.getAttribute("content"),
        editor: editor.getAttribute("content"),
        edition: edition.getAttribute("content")
    };
}

export async function getChapterMetadata(bookId, chapterId) {
    if (!index)
    {
        index = await loadIndex();
    }
    let elem = index.getElementById(`${bookId}-${chapterId}`);
    let label = elem.getAttribute("label");
    let name = elem.getAttribute("name");
    let authors = elem.getAttribute("authors");
    const appendicesXml = [...elem.querySelectorAll('appendix')];
    const hasAppendices = elem.querySelector('appendices') != null || appendicesXml.length > 0;
    console.log(appendicesXml);
    let appendices = appendicesXml.map((appendix) => {
        return {
            id: appendix.getAttribute("id"),
            url: appendix.getAttribute("url"),
            name: appendix.textContent
        };
    });

    if (elem.querySelector("meta[name='authors']"))
    {
        authors = elem.querySelector("meta[name='authors']").getAttribute("content");
    }

    console.log(appendices);
    console.log(label, name, authors);

    return {
        label: label,
        name: name,
        authors: authors,
        appendices: appendices,
        hasAppendices: hasAppendices
    };
}

export async function getBookList() {
    if (!index)
    {
        index = await loadIndex();
    }
    let elems = [...index.querySelectorAll('book')];

    let firstChapters = elems.map((elem) => {
        let firstChapter = elem.querySelector(':is(part, chapter, appendix)');
        let attr = firstChapter.getAttribute("id");
        let id = attr.split("-")[1];

        return [elem.getAttribute("shortName"), id];
    });

    let firstChapterMap = new Map(firstChapters);

    const bookList = elems.map((elem) => {
        return {
            name: elem.getAttribute("name"),
            shortName: elem.getAttribute("shortName"),
            default: elem.getAttribute("default"),
            firstChapter: firstChapterMap.get(elem.getAttribute("shortName"))
        };
    });
    return bookList;
}



/**
   * Renders the content of a book chapter, including the chapter HTML and an outline of the chapter's sections.
   *
   * @param {string} book - The book shortname identifier.
   * @param {string} unit - The unit identifier. This could be for example a chapter number, section identifier, or an appendix identifier.
   * @return {void}
   */
export async function getContent(book, unit) {

    if (["tnb", "im", "clfb"].includes(book))
    {
        // For The New Bonaventura and The Cloud of Unknowing, load the chapter directly.
        return await fetch(`/data/${book}/${book}-${unit}.html`).then(resp => resp.text());
    }
    // Display the content of the chapter.
    return loadChapter(book, unit).then((doc) => {

        // import node function
        let selectors = book == "ssm" ? "header, section[class^='level1'], section[class^='level2']" : "header, section[class^='level1']";
        let sections = doc.querySelectorAll(selectors);
        let fragment = document.createDocumentFragment();
        fragment.append(...sections);
        const s = new XMLSerializer();

        return s.serializeToString(fragment);
    });
}
