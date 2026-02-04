



export default function waitUntil(func, wait) {
    let timeout;

    return function(...args) {
        const context = this;

        clearTimeout(timeout); // Clear the existing timer

        timeout = setTimeout(() => {
            func.apply(context, args); // Execute the function after the wait
        }, wait);
    };
}


export function injectScriptElement(src) {
    let tag = document.createElement('script');
    tag.src = src;

    let firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag == null) {
        (document.body || document.head).appendChild(tag);
    }
    else {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    return tag;
}
