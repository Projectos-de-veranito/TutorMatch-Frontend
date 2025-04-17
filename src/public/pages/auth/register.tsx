import { useState } from "react"
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { Button } from 'primereact/button';
import { RadioButton } from 'primereact/radiobutton';
import { Dropdown } from 'primereact/dropdown';
import NavbarAuth from "../../components/NavbarAuth";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "estudiante",
    firstName: "",
    lastName: "",
    gender: "",
    educationLevel: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDropdownChange = (name: string) => (e: { value: string }) => {
    setFormData((prev) => ({ ...prev, [name]: e.value }))
  }

  const handleRoleChange = (e: { value: string }) => {
    setFormData((prev) => ({ ...prev, role: e.value }))
  }

  const handleSubmitStep1 = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStep(2)
  }

  const handleSubmitStep2 = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Aquí iría la lógica para enviar los datos al servidor
    console.log("Datos de registro:", formData)
    // Navegar a la página de éxito
    window.location.href = "/register/success"
  }

  const goBack = () => {
    setStep(1)
  }

  const genderOptions = [
    { label: 'Masculino', value: 'masculino' },
    { label: 'Femenino', value: 'femenino' },
    { label: 'Otro', value: 'otro' },
    { label: 'Prefiero no decir', value: 'prefiero-no-decir' }
  ]

  const educationOptions = [
    { label: 'Primaria', value: 'primaria' },
    { label: 'Secundaria', value: 'secundaria' },
    { label: 'Bachillerato', value: 'bachillerato' },
    { label: 'Universidad', value: 'universidad' },
    { label: 'Postgrado', value: 'postgrado' }
  ]

  // Modificado para reducir espacio
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

  // Modificado para reducir espacio
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
                    <div className="flex items-center">
                      <RadioButton
                        inputId="estudiante"
                        name="role"
                        value="estudiante"
                        onChange={handleRoleChange}
                        checked={formData.role === 'estudiante'}
                        className="mr-2"
                        style={{ accentColor: "red" }}
                      />
                      <label htmlFor="estudiante" className="text-light">Estudiante</label>
                    </div>
                    <div className="flex items-center">
                      <RadioButton
                        inputId="tutor"
                        name="role"
                        value="tutor"
                        onChange={handleRoleChange}
                        checked={formData.role === 'tutor'}
                        className="mr-2"
                        style={{ accentColor: "red" }}
                      />
                      <label htmlFor="tutor" className="text-light">Tutor</label>
                    </div>
                  </div>
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
              <form onSubmit={handleSubmitStep2} className="space-y-3"> {/* Reducido de space-y-4 a space-y-3 */}
                <div className="space-y-1"> {/* Reducido de space-y-2 a space-y-1 */}
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
                <div className="space-y-1"> {/* Reducido de space-y-2 a space-y-1 */}
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
                <div className="space-y-1"> {/* Reducido de space-y-2 a space-y-1 */}
                  <label htmlFor="gender" className="text-light">Género</label>
                  <Dropdown
                    id="gender"
                    value={formData.gender}
                    options={genderOptions}
                    onChange={handleDropdownChange('gender')}
                    placeholder="Selecciona una opción"
                    className="w-full bg-dark-light text-light border border-dark-border rounded-md"
                  />
                </div>
                <div className="space-y-1"> {/* Reducido de space-y-2 a space-y-1 */}
                  <label htmlFor="educationLevel" className="text-light">Nivel educativo</label>
                  <Dropdown
                    id="educationLevel"
                    value={formData.educationLevel}
                    options={educationOptions}
                    onChange={handleDropdownChange('educationLevel')}
                    placeholder="Selecciona una opción"
                    className="w-full bg-dark-light text-light border border-dark-border rounded-md"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    label="Atrás"
                    type="button"
                    onClick={goBack}
                    className="w-full flex-1 bg-dark-light border border-dark-border text-light hover:bg-dark py-2 text-sm"
                  />
                  <Button
                    label="Completar Registro"
                    type="submit"
                    className="w-full flex-1 bg-primary text-light hover:bg-primary-hover py-2 text-sm"
                  />
                </div>
              </form>
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}