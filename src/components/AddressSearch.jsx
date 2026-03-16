import useModal from './hooks/useModal.js';
import Modal from './ui/Modal.jsx';



export default function AddressSearch({ mapManager }) {



    const { isOpen, modalContent, openModal, closeModal } = useModal();

    const handleOpenCustomModal = () => {
        openModal(
            <div >
                <h2 className="text-2xl font-semibold mb-4">Modal</h2>
                <a onClick={closeModal} className="text-blue-500 hover:underline cursor-pointer">Close</a>
            </div>
        );
    };

    return (

        <form id="district-lookup" method="post">

            <label for="district-select">Features</label><br />
            <select id="district-select" className="mb-4">
                <option value="">--Select feature--</option>
                <option value="house">House Districts</option>
                <option value="senate">Senate Districts</option>
            </select>

            <a onClick={handleOpenCustomModal}>Modal</a>

            <label style={{ fontSize: 'larger', display: "none" }} htmlFor="address">Enter Address:</label>
            <textarea type="text" style={{ width: "99%", borderRadius: "3px", padding: '10px', fontSize: 'larger' }} id="address" name="address" rows="3" cols="60" placeholder="Enter address" />

            <button style={{ backgroundColor: "#ccc", borderRadius: "3px", padding: '10px', fontSize: 'larger', marginTop: '5px', marginRight: "5px" }} id="find-district" type="submit">Find district</button>

            <button onClick={() => mapManager.resetZoom()} style={{ backgroundColor: "#ccc", borderRadius: "3px", padding: '10px', fontSize: 'larger', marginTop: '5px' }} id="find-district" type="submit">Reset zoom</button>
            <label htmlFor="order-by-district" style={{ fontSize: 'larger' }}>Order by district</label>
            <input type="checkbox" id="order-by-district" name="order-by-district" style={{ marginLeft: '10px' }} />

            <Modal isOpen={isOpen} content={modalContent} onClose={closeModal} />

            <div id="result"></div>
        </form>

    );
}
