import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import NavbarAuth from "../../components/NavbarAuth";

export default function ForgotPasswordPage() {
  const cardHeader = (
    <div className="text-center pt-4 pb-2">
      <h2 className="text-2xl font-bold text-light">Recuperar Contraseña</h2>
      <p className="text-light-gray mt-1">
        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
      </p>
    </div>
  );

  const cardFooter = (
    <div className="flex justify-center py-3">
      <p className="text-sm text-center text-light">
        <a href="/" className="text-primary hover:text-primary-hover font-medium">
          Volver a Iniciar Sesión
        </a>
      </p>
    </div>
  );

  return (
    <div className="auth-page min-h-screen flex flex-col bg-dark">
      <NavbarAuth />
      
      <main className="flex-1 bg-gradient-to-br from-secondary to-dark-light flex items-center justify-center p-6">
        <Card 
          header={cardHeader} 
          footer={cardFooter}
          className="w-full max-w-md shadow-xl rounded-lg bg-dark-card border border-dark-border text-light"
        >
          <div className="p-4">
            <form className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="text-light font-medium">Correo electrónico</label>
                <InputText 
                  id="email" 
                  type="email" 
                  placeholder="U20XXXXXXX@upc.edu.pe" 
                  required 
                  className="w-full bg-dark-light text-light border border-dark-border" 
                />
              </div>
              
              <div className="pt-2">
                <Button 
                  label="Enviar Enlace" 
                  type="submit" 
                  className="w-full bg-primary text-light hover:bg-primary-hover py-2" 
                />
              </div>
            </form>
          </div>
        </Card>
      </main>
    </div>
  );
}