import React from 'react';
import Modal from 'react-modal';

interface ModalAbonnementsProps {
  isOpen: boolean;
  onRequestClose: () => void;
  abonnements: { id: string; nom: string; avatar?: string }[];
}

const ModalAbonnements: React.FC<ModalAbonnementsProps> = ({ isOpen, onRequestClose, abonnements }) => (
  <Modal isOpen={isOpen} onRequestClose={onRequestClose} contentLabel="Liste des abonnements">
    <h2>Abonnements</h2>
    <ul>
      {abonnements.map((abonnement) => (
        <li key={abonnement.id}>
          {abonnement.avatar && <img src={abonnement.avatar} alt={abonnement.nom} width={30} height={30} />}
          {abonnement.nom}
        </li>
      ))}
    </ul>
    <button onClick={onRequestClose}>Fermer</button>
  </Modal>
);

export default ModalAbonnements;
