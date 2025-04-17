import React, { useState } from 'react';
import { User as UserType } from '../../../user/types/User';
import Navbar from '../../../dashboard/components/Navbar';
import Footer from '../../components/Footer';
import EditProfileModal from '../../../user/components/EditProfileModal';
import { Edit, LogOut, User } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const user: UserType = {
    id: 1,
    firstName: 'Carlos',
    lastName: 'Domínguez',
    fullName: 'Carlos Domínguez',
    email: 'U202212345@upc.edu.pe',
    avatar: '/assets/imgs/avatar-placeholder.png',
    role: 'tutor',
    status: 'active',
    semesterNumber: 5,
    academicYear: '2023-2024',
    phone: '+51 987654321',
    bio: 'Apasionado por la enseñanza y el aprendizaje continuo. Me encanta ayudar a otros a alcanzar sus metas académicas.',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date(),
  };

  const handleSaveProfile = (updatedUser: UserType) => {
    console.log('Perfil actualizado:', updatedUser);
    // Aquí puedes manejar la lógica para guardar los cambios (API, estado global, etc.).
  };

  const [isEditModalVisible, setEditModalVisible] = useState(false);

  return (
    <>
      <div className="flex flex-col min-h-screen bg-[#1e1e1e] text-white">
        <Navbar />
        {/* Contenido principal */}
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-[#2c2c2c] p-6 rounded-lg shadow-lg w-full max-w-4xl relative">
            {/* Botón de editar */}
            <button
              className="absolute top-4 right-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm flex items-center gap-2"
              onClick={() => setEditModalVisible(true)}
            >
              <Edit /> Editar
            </button>

            {/* Encabezado del perfil */}
            <div className="flex items-center gap-6 mb-6">
              <img
                src={user.avatar || '/assets/imgs/avatar-placeholder.png'}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover"
              />
              <div>
                <h1 className="text-3xl font-bold">{user.fullName}</h1>
                <p className="text-gray-400">{user.email}</p>
                <p className="text-sm text-gray-500">Miembro desde {user.createdAt.toLocaleDateString('es-ES')}</p>
                <p className="text-sm text-red-600">{user.role === 'tutor' ? 'Tutor' : 'Estudiante'}</p>
              </div>
            </div>

            {/* Información adicional */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <span>
                  <User />
                </span>
                Acerca de mí
              </h2>
              <p className="text-gray-300 text-sm">{user.bio || 'Sin biografía disponible.'}</p>
            </div>

            {/* Opciones de perfil */}
            <div>
              <div className="flex gap-4">
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-all text-sm flex items-center gap-2">
                  <LogOut /> Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />

        <EditProfileModal
          visible={isEditModalVisible}
          onHide={() => setEditModalVisible(false)}
          user={user}
          onSave={handleSaveProfile}
        />
      </div>
    </>
  );
};

export default ProfilePage;