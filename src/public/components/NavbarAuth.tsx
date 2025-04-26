import { useAuth } from '../hooks/useAuth';

export default function NavbarAuth() {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-dark border-b border-dark-border">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <a href="/" className="flex items-center">
          <h1 className="text-xl md:text-2xl font-bold text-light">
          <span className="text-light text-xl font-bold">TutorMatch</span>
          </h1>
        </a>

        <div>
          {user ? (
            <button
              onClick={async () => {
                const { success } = await signOut();
                if (success) {
                  window.location.href = '/';
                }
              }}
              className="text-sm px-4 py-2 rounded-md bg-dark-light text-light hover:bg-dark-lighter"
            >
              Cerrar Sesión
            </button>
          ) : (
            <div className="flex gap-2">
              <a
                href="/"
                className="text-sm px-4 py-2 rounded-md bg-dark-light text-light hover:bg-dark-lighter"
              >
                Iniciar Sesión
              </a>
              <a
                href="/register"
                className="text-sm px-4 py-2 rounded-md bg-primary text-light hover:bg-primary-hover"
              >
                Registrarse
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}