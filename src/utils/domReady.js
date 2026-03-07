/**
 * @module domReady
 * This module provides a way to execute callbacks when the DOM is ready. It ensures that callbacks are executed in order, even if they are added after the DOM is already ready.
 */



// Counter to track how many times domReady has been called. This is used to ensure that the DOMContentLoaded event listener is only added once.
let counter = 0;

// Array to hold callbacks that will be executed when the DOM is ready.
let funcs = [];

// Create a chain of promises to ensure that callbacks are executed in order.
let chain = [];



export function domReady(cb) {


    if (counter++ === 0)
    {
        document.addEventListener('DOMContentLoaded', async () => {
            funcs.forEach((fn, index, arr) => {
                let previous = index === 0 ? Promise.resolve() : arr[index - 1];
                previous.then(fn);
            });
        });
    }

    if (['interactive', 'complete'].includes(document.readyState))
    {
        let previous = chain.length > 0 ? chain[chain.length - 1] : Promise.resolve();
        let current = previous.then(cb);
        chain.push(current);
    } else
    {
        funcs.push(cb);
    }


}



export function waitUntil(func, wait) {
    let timeout;

    return function(...args) {
        const context = this;

        clearTimeout(timeout); // Clear the existing timer

        timeout = setTimeout(() => {
            func.apply(context, args); // Execute the function after the wait
        }, wait);
    };
}
