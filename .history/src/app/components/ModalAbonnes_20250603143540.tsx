import React from 'react';
import Modal from 'react-modal';

interface ModalAbonnesProps {
  isOpen: boolean;
  onRequestClose: () => void;
  abonnes: { id: string; nom: string; avatar?: string }[];
}

const ModalAbonnes: React.FC<ModalAbonnesProps> = ({ isOpen, onRequestClose, abonnes }) => (
  <Modal isOpen={isOpen} onRequestClose={onRequestClose} contentLabel="Liste des abonnés">
    <h2>Abonnés</h2>
    <ul>
      {abonnes.map((abonne) => (
        <li key={abonne.id}>
          {abonne.avatar && <img src={abonne.avatar} alt={abonne.nom} width={30} height={30} />}
          {abonne.nom}
        </li>
      ))}
    </ul>
    <button onClick={onRequestClose}>Fermer</button>
  </Modal>
);

export default ModalAbonnes;
