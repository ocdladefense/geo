



function injectScriptElement(tag) {

    let firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag == null)
    {
        (document.body || document.head).appendChild(tag);
    }
    else
    {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    return tag;
}

function createScriptElement(src) {
    let tag = document.createElement('script');
    tag.src = src;
    tag.async = true; // Load asynchronously to avoid blocking the page

    return tag;
}



export { injectScriptElement, createScriptElement };
