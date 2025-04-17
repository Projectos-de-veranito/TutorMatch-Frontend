import React, { useState, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Image } from 'primereact/image';
import { Toast } from 'primereact/toast';
import { User } from '../../user/types/User';

interface EditProfileModalProps {
  visible: boolean;
  onHide: () => void;
  user: User;
  onSave: (updatedUser: User) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ visible, onHide, user, onSave }) => {
  const [formData, setFormData] = useState<User>(user);
  const [profileImage, setProfileImage] = useState<string | undefined>(user.avatar);
  const toast = useRef<Toast>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = () => {
    onSave({ ...formData, avatar: profileImage });
    onHide();
    toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Perfil actualizado correctamente', life: 3000 });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      if (file.size > 1024 * 1024) {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: 'El archivo es demasiado grande. Máximo 1MB.', life: 3000 });
        return;
      }

      if (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg') {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          setProfileImage(e.target.result);
          toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Imagen cargada correctamente', life: 3000 });
        };
        reader.readAsDataURL(file);
      } else {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Tipo de archivo inválido. Solo PNG o JPEG.', life: 3000 });
      }
    }
  };

  const headerElement = (
    <div className="w-full flex justify-between items-center text-white">
      <h2 className="text-xl font-semibold">Editar Perfil</h2>
      <button
        onClick={onHide}
        className="text-white bg-transparent hover:text-gray-400"
      >
        ✕
      </button>
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        onHide={onHide}
        style={{ width: '95%', maxWidth: '600px' }}
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
          {/* Foto de perfil */}
          <div>
            <h3 className="text-lg font-medium mb-4">Foto de Perfil</h3>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-300 flex items-center justify-center">
                <Image
                  src={profileImage || '/assets/imgs/avatar-placeholder.png'}
                  alt="Foto de perfil"
                  width="100"
                  preview
                  className="object-cover"
                />
              </div>
              <div>
                <label
                  htmlFor="profile-image-upload"
                  className="block text-center text-sm text-white py-2 px-4 rounded bg-primary font-semibold cursor-pointer hover:bg-primary-hover transition-all"
                >
                  Cambiar foto
                </label>
                <input
                  id="profile-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label htmlFor="firstName" className="text-light block mb-2">Nombre</label>
            <InputText
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full bg-dark-light text-light border border-dark-border px-3 py-2 rounded-md"
            />
          </div>

          {/* Apellido */}
          <div>
            <label htmlFor="lastName" className="text-light block mb-2">Apellido</label>
            <InputText
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full bg-dark-light text-light border border-dark-border px-3 py-2 rounded-md"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label htmlFor="phone" className="text-light block mb-2">Teléfono</label>
            <InputText
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full bg-dark-light text-light border border-dark-border px-3 py-2 rounded-md"
            />
          </div>

          {/* Biografía */}
          <div>
            <label htmlFor="bio" className="text-light block mb-2">Biografía</label>
            <InputTextarea
              id="bio"
              name="bio"
              rows={4}
              value={formData.bio}
              onChange={handleInputChange}
              className="w-full bg-dark-light text-light border border-dark-border px-3 py-2 rounded-md"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              className="p-button-text text-light-gray hover:text-white"
              onClick={onHide}
            />
            <Button
              label="Guardar"
              icon="pi pi-check"
              className="p-button-primary bg-primary hover:bg-primary-hover text-white"
              onClick={handleSave}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default EditProfileModal;