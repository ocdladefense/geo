import { useEffect, useRef } from 'react';
import ResultsTable from './districts/ResultsTable.jsx';
import useModal from './hooks/useModal.js';
import Modal from './ui/Modal.jsx';




export default function Results({ addresses = [], onClick = () => { } }, groupByField = "none") {

    const containerRef = useRef(null);
    const { isOpen, modalContent, modalExternalNode, openModal, openModalWithNode, closeModal } = useModal();
    let externalNode = null;
    let table2 = null;

    const handleOpenCustomModal = () => {
        openModalWithNode(
            table2
        );
    };


    useEffect(() => {
        // Append the external DOM node to the container after the component mounts
        if (containerRef.current && addresses.length > 0)
        {
            // Base case.
            externalNode = ResultsTable(addresses);
            table2 = ResultsTable(addresses);
            externalNode.addEventListener('click', onClick);
            table2.addEventListener('click', e => { onClick(e); closeModal(); });
            containerRef.current.appendChild(externalNode);
        }

        // Optional cleanup function to remove the node when the component unmounts
        return () => {
            if (containerRef.current && externalNode)
            {
                containerRef.current.removeChild(externalNode);
            }
        };
    }); // Rerun if the external node changes



    let styles = addresses.length > 0 ? { display: 'block' } : { display: 'none' };

    return (
        <div id="results" style={styles}>

            <button onClick={handleOpenCustomModal} style={{ backgroundColor: "#ccc", borderRadius: "3px", padding: '10px', fontSize: 'larger', marginTop: '20px' }} id="find-district" type="button">More results</button>


            <Modal isOpen={isOpen} content={modalContent} externalNode={modalExternalNode} onClose={closeModal} />

            {/*<label htmlFor="order-by-district" style={{ fontSize: 'larger' }}>Order by district</label>
            <input type="checkbox" id="order-by-district" name="order-by-district" style={{ marginLeft: '10px' }} /> */}

            <div id="result" ref={containerRef} />
        </div>
    );
}





