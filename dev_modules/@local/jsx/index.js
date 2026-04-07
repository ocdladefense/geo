let renderCount = 0;
let previousState = null;
let state = [];
let counter = 0;
let renderFn;
let updateQueue = [];
let isProcessing = false;



// Method to add updates to the queue.
function sendEvent(eventPayload) {
    updateQueue.push(eventPayload);
    // Defer the processing of the queue
    if (!isProcessing)
    {
        isProcessing = true;
        Promise.resolve().then(() => processQueue());
    }
}




// Method to process the queued update.s
function processQueue() {
    console.log("Processing update queue:", updateQueue);
    let currentState = state;
    // Iterate through all updates, ensuring each uses the result of the previous one
    while (updateQueue.length > 0)
    {
        const event = updateQueue.shift();
        // Apply transition logic to calculate the next state
        // currentState = calculateNextState(currentState, event);
        currentState[event.index] = event.value;
    }
    // Apply the final consolidated state and trigger side effects/renders
    state = currentState;
    isProcessing = false;
    renderFn();
}






export function render(root, component) {
    renderFn = function() {
        // previousState = JSON.stringify(state);
        root.innerHTML = "";
        root.appendChild(component());
        if (hasStateChanged(previousState, state))
        {
            // renderFn();
        }
        renderCount++;
        counter = 0;
    };
    renderFn();
}


function hasStateChanged(state1, state2) {
    return true;
}



export function useState(defaultValue) {
    let count = counter;
    if (renderCount === 0)
    {
        state[count] = defaultValue;
    }
    let setterFn = function(val) {
        sendEvent({ type: "stateUpdate", index: count, value: val });
    };

    counter++;
    return [state[count], setterFn];
}
