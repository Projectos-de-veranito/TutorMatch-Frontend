import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

interface DeleteAccountModalProps {
  visible: boolean;
  onHide: () => void;
  onConfirm: () => void;
  loading: boolean;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ visible, onHide, onConfirm, loading }) => {
  return (
    <Dialog
      header="Eliminar cuenta"
      visible={visible}
      onHide={onHide}
      modal
      className="w-full max-w-lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button 
            label="Cancelar" 
            icon="pi pi-times" 
            onClick={onHide} 
            className="p-button-text" 
            disabled={loading}
          />
          <Button 
            label="Eliminar mi cuenta" 
            icon="pi pi-trash" 
            onClick={onConfirm} 
            className="p-button-danger"
            loading={loading}
          />
        </div>
      }
    >
      <div className="p-4">
        <div className="flex flex-col items-center mb-4">
          <div className="bg-red-100 p-3 rounded-full mb-4">
            <i className="pi pi-exclamation-triangle text-red-500 text-3xl"></i>
          </div>
          <h2 className="text-xl font-bold text-red-500 mb-2">¡Atención! Esta acción es irreversible</h2>
        </div>
        
        <p className="mb-4 text-gray-700">
          Estás a punto de eliminar tu cuenta permanentemente. Esta acción no se puede deshacer y toda tu información, 
          incluyendo tu perfil, tutorías y datos personales, será eliminada definitivamente.
        </p>
        
        <div className="bg-yellow-50 p-3 rounded border border-yellow-200 mb-4">
          <p className="text-yellow-800 font-medium">Consecuencias de eliminar tu cuenta:</p>
          <ul className="list-disc pl-5 mt-2 text-yellow-800">
            <li>Tu perfil será eliminado completamente</li>
            <li>Perderás acceso a todas tus tutorías</li>
            <li>No podrás recuperar tu historial ni tus datos</li>
            <li>Tu nombre de usuario quedará disponible para otros</li>
          </ul>
        </div>
        
        <p className="font-medium text-gray-800">
          Si estás seguro de que deseas continuar, haz clic en "Eliminar mi cuenta".
        </p>
      </div>
    </Dialog>
  );
};

export default DeleteAccountModal;