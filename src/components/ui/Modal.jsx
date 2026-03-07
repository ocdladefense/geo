import React from 'react';
import ReactDOM from 'react-dom';




export default function Modal({ isOpen, onClose, confirmAction, content }) {
    if (!isOpen) return null;
    let title = "MY TOC";

    return ReactDOM.createPortal(
        <div style={{ zIndex: 100, top: "0px", left: "0px", textAlign: "center", height: "100vh", width: "100vw" }} onClick={onClose} className="modal fixed p-8 bg-black bg-opacity-70">
            <div style={{ height: "90%", margin: "0 auto", overflowY: "scroll", overflowX: "hidden" }} className="bg-white rounded-xl p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                {content}
                <div>
                    <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
                    {/*<button onClick={confirmAction} className="bg-green-600 text-white px-4 py-2 rounded">Confirm</button>*/}
                </div>
            </div>
        </div>,
        document.body
    )
}
