import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { CheckCircle } from "lucide-react";
import NavbarAuth from '../../components/NavbarAuth';

export default function RegisterSuccessPage() {
  const cardHeader = (
    <div className="text-center">
      <div className="flex justify-center mb-4">
        <CheckCircle className="h-16 w-16 text-green-500" />
      </div>
      <h2 className="text-2xl font-bold">¡Registro Completado!</h2>
    </div>
  );

  const cardFooter = (
    <div className="flex justify-center">
      <a href="/">
        <Button
          label="Iniciar Sesión"
          className="bg-primary text-light hover:bg-primary-hover"
        />
      </a>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-dark">
      <NavbarAuth />
      <main className="flex-1 bg-gradient-to-br from-secondary to-dark-light flex items-center justify-center p-6">
        <Card 
          header={cardHeader} 
          footer={cardFooter}
          className="w-full max-w-md shadow-xl bg-white border border-dark-border"
        >
          <div className="text-center p-4">
            <p className="mb-4 text-gray-800">
              Tu cuenta ha sido creada exitosamente. Hemos enviado un correo de confirmación a tu dirección de email.
            </p>
          </div>
        </Card>
      </main>
    </div>
  );
}