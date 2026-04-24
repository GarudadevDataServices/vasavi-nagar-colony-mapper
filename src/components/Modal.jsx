import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({ isOpen, onClose, children, title }) => {
  if (typeof document === 'undefined') return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="modal-backdrop"
          />
          
          {/* Modal Container */}
          <div className="modal-container">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              className="modern-card modal-content"
              style={{ maxHeight: '90vh' }}
            >
              <div className="modern-card-header">
                <button onClick={onClose} className="modern-close-btn">
                  <X size={20} />
                </button>
              </div>
              <div className="modern-card-content custom-scrollbar" style={{ flexGrow: 1 }}>
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

// We use createPortal to render the modal at the end of the body
const PortalModal = (props) => {
  return createPortal(<Modal {...props} />, document.body);
};

export default PortalModal;
