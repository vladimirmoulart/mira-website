import React from 'react';

interface Avis {
  id: string;
  auteur: string;
  commentaire: string;
  note: number;
}

interface ModalAvisProps {
  isOpen: boolean;
  onRequestClose: () => void;
  avis: Avis[];
}

const ModalAvis: React.FC<ModalAvisProps> = ({ isOpen, onRequestClose, avis }) => (
  <Modal isOpen={isOpen} onRequestClose={onRequestClose} contentLabel="Liste des avis">
    <h2>Avis</h2>
    <ul>
      {avis.map((a) => (
        <li key={a.id}>
          <strong>{a.auteur}</strong> ({a.note}/5): {a.commentaire}
        </li>
      ))}
    </ul>
    <button onClick={onRequestClose}>Fermer</button>
  </Modal>
);

export default ModalAvis;
