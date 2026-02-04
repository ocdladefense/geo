
export function addIntersectionObserver(items) {
    const intersectionObserver = new IntersectionObserver(handleIntersection);
    console.log(items);
    items.map((item) => {
        if (!item.href) return;
        let node = document.querySelector(`[id="${item.href}"]`);
        console.log(node);
        if (!node) return;
        intersectionObserver.observe(node);
        console.log(node);
    });
}

function handleIntersection(observedEntries) {
    console.log("handleIntersection");
    // Filter out entries that are not intersecting
    const intersectingEntries = observedEntries.filter(
        (entry) => entry.isIntersecting
    );

    // Make sure we have at least one entry remaining
    if (intersectingEntries.length == 0) return;

    // Iterate through our outline items and clear their styles.
    const activeElems = [...document.querySelectorAll("#outline .bg-black.text-white")] || [];
    activeElems.forEach((elem) => {
        elem.classList.remove("bg-black");
        elem.classList.remove("text-white");
    });

    // We only want the first entry. It's possible to scroll through multiple headings at once.
    const entry = intersectingEntries[0];
    const id = entry.target.id;
    const outlineListItem = document.querySelector(`[id='${id}-outline-item']`);

    //When we see a new item, we want to make sure the outline sidebar is scrolling to it.
    if (outlineListItem != null) {
        outlineListItem.scrollIntoView({
            behavior: "instant",
            block: "nearest",
            inline: "center",
        });

        // Add the active class styling to the current item.
        outlineListItem.classList.add("bg-black");
        outlineListItem.classList.add("text-white");
    }
};

