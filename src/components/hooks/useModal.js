import { useState } from 'react';




const useModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    const [modalExternalNode, setModalExternalNode] = useState(null);

    const openModal = (content) => {
        setModalContent(content);
        setIsOpen(true);
        document.body.classList.toggle('overflow-hidden', isOpen);
    };


    const openModalWithNode = (externalNode) => {
        // setModalContent(content);
        setModalExternalNode(externalNode);
        setIsOpen(true);
        document.body.classList.toggle('overflow-hidden', isOpen);
    };

    const closeModal = () => {
        setIsOpen(false);
        setModalContent(null);
        document.body.classList.remove('overflow-hidden');
    };

    const toggleModal = (content = null) => {
        if (isOpen)
        {
            closeModal();
        } else
        {
            openModal(content);
        }
    };

    return {
        isOpen,
        modalContent,
        modalExternalNode,
        openModal,
        openModalWithNode,
        closeModal,
        toggleModal,
    };
};

export default useModal;
