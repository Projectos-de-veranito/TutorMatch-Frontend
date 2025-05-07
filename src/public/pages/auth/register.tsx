import { useState } from "react";
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Card } from 'primereact/card';
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from 'primereact/button';
import { RadioButton } from 'primereact/radiobutton';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { UserRole, UserStatus } from "../../../user/types/User";
import NavbarAuth from "../../components/NavbarAuth";
import { useAuth } from "../../hooks/useAuth";

export default function RegisterPage() {
  const toast = useRef<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  
  // Estado del formulario ajustado según el tipo User
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "student" as UserRole,
    firstName: "",
    lastName: "",
    gender: "",
    semesterNumber: 1,
    academicYear: "",
    bio: "",
    phone: "",
    tutor_id: "",
    status: "active" as UserStatus,
    avatar: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDropdownChange = (name: string) => (e: { value: string }) => {
    setFormData((prev) => ({ ...prev, [name]: e.value }));
  };

  const handleRoleChange = (e: { value: string }) => {
    // Asegurarse de que el rol sea uno de los valores permitidos en UserRole
    const role = e.value === 'student' || e.value === 'tutor' ? e.value as UserRole : 'student';
    setFormData((prev) => ({ ...prev, role }));
  };

  const handleSemesterChange = (e: { value: number | null | undefined }) => {
    setFormData((prev) => ({ 
      ...prev, 
      semesterNumber: e.value !== null && e.value !== undefined ? e.value : 1
    }));
  };

  const handleSubmitStep1 = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Validación básica antes de pasar al paso 2
    if (!formData.email || !formData.password) {
      toast.current.show({
        severity: 'error',
        summary: 'Campos requeridos',
        detail: 'Por favor completa todos los campos obligatorios',
        life: 3000
      });
      return;
    }
    setStep(2);
  };

  const handleSubmitStep2 = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!formData.firstName || !formData.lastName || !formData.gender) {
        throw new Error("Por favor completa todos los campos obligatorios");
      }
      
      // Almacenar los datos en localStorage para el proceso de verificación
      localStorage.setItem('pendingRegistration', JSON.stringify({
        email: formData.email,
        userData: {
          ...formData,
          // Convertir semesterNumber a número explícitamente
          semesterNumber: typeof formData.semesterNumber === 'number' 
            ? formData.semesterNumber 
            : Number(formData.semesterNumber) || 1,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }));
  
      // Preparar datos completos para el registro
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender,
        semesterNumber: typeof formData.semesterNumber === 'number' 
          ? formData.semesterNumber 
          : Number(formData.semesterNumber) || 1,
        role: formData.role
      };
  
      console.log('Datos a enviar (ajustados):', {
        email: formData.email,
        password: formData.password,
        ...userData
      });
      
      // Llamada al endpoint de registro con datos completos
      const { success, message } = await signUp(
        formData.email, 
        formData.password, 
        userData
      );
      
      if (success) {
        toast.current.show({
          severity: 'success',
          summary: 'Registro iniciado',
          detail: 'Tu cuenta está siendo creada. Por favor, verifica tu correo electrónico.',
          life: 3000
        });
        
        // Redirigir a la página de verificación
        setTimeout(() => {
          window.location.href = `/verify-email?email=${encodeURIComponent(formData.email)}`;
        }, 1500);
      } else {
        throw new Error(message || "Error al registrar usuario");
      }
      
    } catch (error: any) {
      toast.current.show({
        severity: 'error',
        summary: 'Error de registro',
        detail: error.message || 'No se pudo completar el registro. Por favor, intenta nuevamente.',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };
  
  const goBack = () => {
    setStep(1);
  };

  // Opciones para los campos de selección
  const genderOptions = [
    { label: 'Masculino', value: 'male' },
    { label: 'Femenino', value: 'female' },
    { label: 'Otro', value: 'other' },
    { label: 'Prefiero no decir', value: 'preferredNotSay' }
  ];

  const roleOptions = [
    { label: 'Estudiante', value: 'student' as UserRole },
    { label: 'Tutor', value: 'tutor' as UserRole }
  ];

  const cardHeader = (
    <div className="text-center pt-3 pb-1">
      <h2 className="text-2xl font-bold text-light">Crear una cuenta</h2>
      <p className="text-light-gray mt-1">
        {step === 1
          ? "Ingresa tus datos básicos para comenzar"
          : "Completa tu perfil para finalizar el registro"
        }
      </p>
      {step === 2 && <div className="text-sm text-light-gray">Paso 2 de 2</div>}
    </div>
  );

  const cardFooter = (
    <div className="flex justify-center py-1">
      <p className="text-sm text-center text-light">
        ¿Ya tienes una cuenta?{" "}
        <a href="/" className="text-primary hover:text-primary-hover font-medium">
          Inicia sesión aquí
        </a>
      </p>
    </div>
  );

  return (
    <div className="auth-page min-h-screen flex flex-col bg-dark">
      <Toast ref={toast} />
      <NavbarAuth />
      <main className="flex-1 bg-gradient-to-br from-secondary to-dark-light flex items-center justify-center p-6">
        <Card
          header={cardHeader}
          footer={cardFooter}
          className="w-full max-w-md shadow-xl bg-dark-card border border-dark-border text-light rounded-xl"
        >
          {step === 1 ? (
            <div className="p-4">
              <form onSubmit={handleSubmitStep1} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-light">Correo electrónico</label>
                  <InputText
                    id="email"
                    name="email"
                    type="email"
                    placeholder="U20XXXXXXX@upc.edu.pe"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-dark-light text-light border border-dark-border px-3 py-2 rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-light">Contraseña</label>
                  <div className="relative">
                    <InputText
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full bg-dark-light text-light border border-dark-border px-3 py-2 rounded-md"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light-gray"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-light block mb-2 text-center">Tipo de cuenta</label>
                  <div className="flex gap-8 justify-center">
                    {roleOptions.map((option) => (
                      <div className="flex items-center" key={option.value}>
                        <RadioButton
                          inputId={option.value}
                          name="role"
                          value={option.value}
                          onChange={handleRoleChange}
                          checked={formData.role === option.value}
                          className="mr-2"
                        />
                        <label htmlFor={option.value} className="text-light">{option.label}</label>
                      </div>
                    ))}
                  </div>
                  {formData.role === 'tutor' && (
                    <p className="text-xs text-center text-yellow-500 mt-2">
                      Para ser tutor, necesitarás seleccionar un plan después del registro
                    </p>
                  )}
                </div>
                <Button
                  label="Continuar"
                  type="submit"
                  className="w-full bg-primary text-light hover:bg-primary-hover"
                />
              </form>
            </div>
          ) : (
            <div className="p-4">
              <form onSubmit={handleSubmitStep2} className="space-y-3">
                <div className="space-y-1">
                  <label htmlFor="firstName" className="text-light">Nombre</label>
                  <InputText
                    id="firstName"
                    name="firstName"
                    placeholder="Tu nombre"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full bg-dark-light text-light border border-dark-border px-3 py-2 rounded-md"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="lastName" className="text-light">Apellido</label>
                  <InputText
                    id="lastName"
                    name="lastName"
                    placeholder="Tu apellido"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full bg-dark-light text-light border border-dark-border px-3 py-2 rounded-md"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="gender" className="text-light">Género</label>
                  <Dropdown
                    id="gender"
                    value={formData.gender}
                    options={genderOptions}
                    onChange={handleDropdownChange('gender')}
                    placeholder="Selecciona una opción"
                    className="w-full bg-dark-light text-light border border-dark-border rounded-md"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="semesterNumber" className="text-light">Semestre (1-10)</label>
                  <InputNumber
                    id="semesterNumber"
                    value={formData.semesterNumber}
                    onValueChange={handleSemesterChange}
                    placeholder="Selecciona el semestre"
                    min={1}
                    max={10}
                    showButtons
                    buttonLayout="horizontal"
                    decrementButtonClassName="p-button-danger"
                    incrementButtonClassName="p-button-danger"
                    incrementButtonIcon="pi pi-plus"
                    decrementButtonIcon="pi pi-minus"
                    mode="decimal"
                    useGrouping={false}
                    minFractionDigits={0}
                    maxFractionDigits={0}
                    className="w-full bg-dark-light text-light border border-dark-border rounded-md"
                    inputClassName="bg-dark-light text-light"
                  />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <Button
                    label="Atrás"
                    type="button"
                    onClick={goBack}
                    className="w-full flex-1 bg-dark-light border border-dark-border text-light hover:bg-dark py-2 text-sm"
                    disabled={loading}
                  />
                  <Button
                    label={loading ? "Registrando..." : "Completar Registro"}
                    type="submit"
                    className="w-full flex-1 bg-primary text-light hover:bg-primary-hover py-2 text-sm"
                    disabled={loading}
                    icon={loading ? "pi pi-spin pi-spinner" : ""}
                  />
                </div>
              </form>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}