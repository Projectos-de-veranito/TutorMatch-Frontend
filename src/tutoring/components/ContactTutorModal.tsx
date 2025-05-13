import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Mail, MessageCircle } from 'lucide-react';
import { User } from '../../user/types/User';

interface ContactTutorModalProps {
  visible: boolean;
  onHide: () => void;
  tutor: User | undefined;
}

const ContactTutorModal: React.FC<ContactTutorModalProps> = ({
  visible,
  onHide,
  tutor
}) => {
  if (!tutor) return null;

  const handleEmailContact = () => {
    window.open(`mailto:${tutor.email}?subject=Consulta sobre tutoría&body=Hola ${tutor.firstName}, me interesa tu tutoría...`, '_blank');
    onHide();
  };

  const handleWhatsAppContact = () => {
    // Formato para WhatsApp: asegura que el número no tenga espacios
    const phoneNumber = tutor.phone?.replace(/\s/g, '');
    const message = `Hola ${tutor.firstName}, me interesa tu tutoría que vi en TutorMatch.`;
    window.open(`https://wa.me/51${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
    onHide();
  };

  const headerElement = (
    <div className="w-full flex justify-between items-center text-white">
      <h2 className="text-xl font-semibold">Contactar con el tutor</h2>
      <button
        onClick={onHide}
        className="text-white bg-transparent hover:text-gray-400"
      >
        ✕
      </button>
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      style={{ width: '95%', maxWidth: '500px' }}
      modal
      header={headerElement}
      footer={false}
      className="border-none shadow-xl"
      draggable={false}
      resizable={false}
      closable={false}
      contentClassName="bg-[#1f1f1f] text-white p-6"
    >
      <div className="space-y-6">
        <div className="text-center mb-4">
          <h3 className="text-xl font-semibold mb-2">¿Cómo deseas contactar a {tutor.firstName}?</h3>
          <p className="text-gray-400">Selecciona una opción para iniciar la comunicación.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleEmailContact}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg flex flex-col items-center justify-center transition-colors"
          >
            <Mail size={32} className="mb-2" />
            <span className="font-medium">Correo electrónico</span>
            <span className="text-sm mt-2 text-gray-300">{tutor.email}</span>
          </button>

          {tutor.phone ? (
            <button
              onClick={handleWhatsAppContact}
              className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg flex flex-col items-center justify-center transition-colors"
            >
              <MessageCircle size={32} className="mb-2" />
              <span className="font-medium">WhatsApp</span>
              <span className="text-sm mt-2 text-gray-300">+51 {tutor.phone.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3')}</span>
            </button>
          ) : (
            <div className="bg-gray-700 text-white p-4 rounded-lg flex flex-col items-center justify-center opacity-60">
              <MessageCircle size={32} className="mb-2" />
              <span className="font-medium">WhatsApp</span>
              <span className="text-sm mt-2 text-gray-300">No disponible</span>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Button
            label="Cancelar"
            icon="pi pi-times"
            className="p-button-text text-gray-400 hover:text-white"
            onClick={onHide}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default ContactTutorModal;