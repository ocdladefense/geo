import { useRef } from 'react';
import ResultsTable from './districts/ResultsTable.jsx';
import useModal from './hooks/useModal.js';
import Modal from './ui/Modal.jsx';




export default function Results({ addresses = [], onClick = () => { } }, groupByField = "none") {

    const containerRef = useRef(null);
    const { isOpen, modalContent, modalExternalNode, openModal, openModalWithNode, closeModal } = useModal();
    let table1 = null;
    let table2 = null;

    const handleOpenCustomModal = () => {
        openModalWithNode(
            table2
        );
    };





    if (containerRef.current)
    {
        // Base case.
        table1 = ResultsTable(addresses);
        table2 = ResultsTable(addresses);
        table1.addEventListener('click', onClick);
        containerRef.current.appendChild(table1);
    }

    let styles = addresses.length > 0 ? { display: 'block', marginTop: '20px' } : { display: 'none' };

    return (
        <div id="results" style={styles}>


            <a onClick={handleOpenCustomModal}>Modal</a>

            <Modal isOpen={isOpen} content={modalContent} externalNode={modalExternalNode} onClose={closeModal} />

            {/*<label htmlFor="order-by-district" style={{ fontSize: 'larger' }}>Order by district</label>
            <input type="checkbox" id="order-by-district" name="order-by-district" style={{ marginLeft: '10px' }} /> */}

            <div id="result" ref={containerRef} />
        </div>
    );
}





