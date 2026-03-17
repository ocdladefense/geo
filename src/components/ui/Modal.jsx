import ReactDOM from 'react-dom';
import { useEffect, useRef } from 'react';



export default function Modal({ isOpen, onClose, confirmAction, content, externalNode }) {
    if (!isOpen) return null;
    let title = "MY TOC";
    const containerRef = useRef(null);


    useEffect(() => {
        // Append the external DOM node to the container after the component mounts
        if (containerRef.current && externalNode)
        {
            containerRef.current.appendChild(externalNode);
        }

        // Optional cleanup function to remove the node when the component unmounts
        return () => {
            if (containerRef.current && externalNode)
            {
                containerRef.current.removeChild(externalNode);
            }
        };
    }, [externalNode]); // Rerun if the external node changes

    return ReactDOM.createPortal(
        <div style={{ zIndex: 100, top: "0px", left: "0px", textAlign: "center", height: "100vh", width: "100vw" }} onClick={onClose} className="modal fixed p-8 bg-black bg-opacity-70">
            <div style={{ height: "90%", margin: "0 auto", overflowY: "scroll", overflowX: "hidden" }} className="bg-white rounded-xl p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                {content}
                <div ref={containerRef} />
                <div>
                    <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
                    {/*<button onClick={confirmAction} className="bg-green-600 text-white px-4 py-2 rounded">Confirm</button>*/}
                </div>
            </div>
        </div>,
        document.body
    )
}
