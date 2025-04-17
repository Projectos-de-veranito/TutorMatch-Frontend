import { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Globe, ChevronDown, Loader, Menu, X } from 'lucide-react';
import CreateTutoringModal from './CreateTutoringModal';
import { User as UserType } from '../../user/types/User';
import { UserService } from '../../user/services/UserService';

const Navbar = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navigate = useNavigate();
  
  // Obtener los datos del usuario desde la API al cargar el componente
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setLoading(true);
        // Asumimos que el usuario con ID 3 es el que está logueado
        // En una aplicación real, esto vendría de un sistema de autenticación
        const userData = await UserService.getUserById(3);
        setCurrentUser(userData);
        setError(null);
      } catch (err) {
        console.error('Error al cargar los datos del usuario:', err);
        setError('Error al cargar los datos del usuario');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);
  
  const handleOpenModal = () => {
    setModalVisible(true);
    setMobileMenuOpen(false);
  };
  
  const handleHideModal = () => {
    setModalVisible(false);
  };
  
  const handleSaveTutoring = (tutoring: any) => {
    console.log('Tutoring saved:', tutoring);
    // Aquí irían las llamadas a la API para guardar la tutoría
    setModalVisible(false);
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    // Lógica de cierre de sesión aquí
    // Ejemplo: eliminar el token de autenticación, etc.
    console.log('Usuario ha cerrado sesión');
    navigate('/login'); // Redirigir al login
  };

  // Verificar si el usuario es un tutor
  const isTutor = currentUser?.role === 'tutor';

  // Cerrar el dropdown cuando se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !(dropdownRef.current as any).contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      
      if (mobileMenuRef.current && !(mobileMenuRef.current as any).contains(event.target) && 
          !((event.target as HTMLElement).closest('.mobile-menu-button'))) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef, mobileMenuRef]);

  // Si está cargando, mostrar un indicador de carga
  if (loading) {
    return (
      <nav className="bg-dark-card border-b border-dark-border">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/dashboard" className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 flex items-center justify-center rounded">
                  <img src="/assets/imgs/TutorMatch.webp" alt="Logo" className="h-6 w-6" />
                </div>
                <span className="ml-2 text-white font-semibold text-lg">TutorMatch</span>
              </Link>
            </div>
            
            {/* Indicador de carga */}
            <div className="flex items-center">
              <Loader className="animate-spin text-primary h-5 w-5" />
              <span className="ml-2 text-light-gray">Cargando...</span>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Si hay un error o no hay usuario, mostrar una versión simplificada
  if (error || !currentUser) {
    return (
      <nav className="bg-dark-card border-b border-dark-border">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/dashboard" className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 flex items-center justify-center rounded">
                  <img src="/assets/imgs/TutorMatch.webp" alt="Logo" className="h-6 w-6" />
                </div>
                <span className="ml-2 text-white font-semibold text-lg">TutorMatch</span>
              </Link>
            </div>
            
            {/* Error o botón de inicio de sesión */}
            {error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <Link to="/login" className="px-4 py-2 rounded bg-primary hover:bg-primary-hover text-white font-medium">
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </nav>
    );
  }

  const avatarInitial = currentUser.firstName?.charAt(0) || 'U';

  return (
    <>
      <nav className="bg-dark-card border-b border-dark-border">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/dashboard" className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 flex items-center justify-center rounded">
                  <img src="/assets/imgs/TutorMatch.webp" alt="Logo" className="h-6 w-6" />
                </div>
                <span className="ml-2 text-white font-semibold text-lg">TutorMatch</span>
              </Link>
            </div>
      
            {/* Barra de búsqueda centrada - solo visible en desktop */}
            <div className="hidden md:flex flex-1 justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-light-gray" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar cualquier curso"
                  className="block w-full pl-10 pr-3 py-2 rounded-md bg-dark border border-dark-border text-white placeholder-light-gray focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
      
            {/* Botones a la derecha - visible en desktop */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Solo mostrar botón de "Añadir Tutoría" si el usuario es un tutor */}
              {isTutor && (
                <button
                  className="px-4 py-2 rounded bg-primary hover:bg-primary-hover text-white font-medium"
                  onClick={handleOpenModal}
                >
                  Añadir Tutoría
                </button>
              )}
              <button className="text-white rounded-full p-1 hover:bg-dark-light">
                <Globe className="h-6 w-6" />
              </button>
              <div className="relative" ref={dropdownRef}>
                <button 
                  className="flex items-center space-x-1 text-white rounded-full hover:bg-dark-light p-1"
                  onClick={toggleProfileDropdown}
                >
                  <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center">
                    <span className="text-white">{avatarInitial}</span>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {/* Dropdown de perfil */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-dark-card border border-dark-border rounded-lg shadow-lg z-10">
                    <div className="p-4">
                      <div className="flex items-center mb-3">
                        <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center mr-3">
                          <span className="text-white text-xl">{avatarInitial}</span>
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{currentUser.firstName} {currentUser.lastName}</h3>
                          <p className="text-light-gray text-sm">{currentUser.email}</p>
                        </div>
                      </div>
                      
                      <div className="border-t border-dark-border pt-3 mb-3">
                        <div className="flex justify-between items-center text-sm text-light-gray mb-1">
                          <span>{currentUser.semesterNumber}° Semestre <br /> {currentUser.academicYear}</span>
                        </div>
                        <div className="text-sm text-red-600">
                          <span>{currentUser.role === 'tutor' ? 'Tutor' : 'Estudiante'}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Link to="/profile" className="block w-full text-center px-3 py-2 text-white hover:bg-dark-light hover:text-red-500 rounded">
                          Ver perfil completo
                        </Link>
                        <Link to="/settings" className="block w-full text-center px-3 py-2 text-white hover:bg-dark-light hover:text-red-500 rounded">
                          Configuración
                        </Link>
                        <button 
                          className="block w-full text-center px-3 py-2 text-red-500 hover:bg-dark-light hover:text-red-500 rounded"
                          onClick={handleLogout}
                        >
                          Cerrar sesión
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Botón de menú hamburguesa - visible solo en móvil */}
            <div className="flex md:hidden">
              <button
                aria-label="Abrir menú"
                className="mobile-menu-button p-2 rounded-md text-white hover:bg-dark-light"
                onClick={toggleMobileMenu}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Menú móvil */}
        {mobileMenuOpen && (
          <div 
            ref={mobileMenuRef}
            className="md:hidden bg-dark-card border-t border-dark-border z-20"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Barra de búsqueda en móvil */}
              <div className="p-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-light-gray" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar cualquier curso"
                    className="block w-full pl-10 pr-3 py-2 rounded-md bg-dark border border-dark-border text-white placeholder-light-gray focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Botones y opciones */}
              <div className="p-2">
                {/* Solo mostrar botón de "Añadir Tutoría" en móvil si el usuario es un tutor */}
                {isTutor && (
                  <button
                    className="w-full px-4 py-2 rounded bg-primary hover:bg-primary-hover text-white font-medium mb-2"
                    onClick={handleOpenModal}
                  >
                    Añadir Tutoría
                  </button>
                )}
                
                <div className="mt-3 pt-3 border-t border-dark-border">
                  <div className="flex items-center mb-2">
                    <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center mr-3">
                      <span className="text-white">{avatarInitial}</span>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{currentUser.firstName} {currentUser.lastName}</h3>
                      <p className="text-light-gray text-xs">{currentUser.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm text-light-gray mt-2 mb-2">
                    <span>{currentUser.semesterNumber}° Semestre - {currentUser.academicYear}</span>
                    <span className="text-red-600">{currentUser.role === 'tutor' ? 'Tutor' : 'Estudiante'}</span>
                  </div>

                  <div className="space-y-1 mt-2">
                    <Link to="/profile" className="block w-full text-left px-3 py-2 text-white hover:bg-dark-light hover:text-red-500 rounded">
                      Ver perfil completo
                    </Link>
                    <Link to="/settings" className="block w-full text-left px-3 py-2 text-white hover:bg-dark-light hover:text-red-500 rounded">
                      Configuración
                    </Link>
                    <button 
                      className="block w-full text-left px-3 py-2 text-red-500 hover:bg-dark-light hover:text-red-500 rounded"
                      onClick={handleLogout}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
      
      {/* Modal para crear tutoría - solo se renderizará si el usuario es tutor */}
      {isTutor && (
        <CreateTutoringModal
          visible={modalVisible}
          onHide={handleHideModal}
          onSave={handleSaveTutoring}
          currentUser={currentUser}
        />
      )}
    </>
  );
};

export default Navbar;