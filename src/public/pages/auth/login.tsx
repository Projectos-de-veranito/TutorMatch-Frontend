import { useState } from "react";
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from 'primereact/button';
import NavbarAuth from "../../components/NavbarAuth";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);

    const cardHeader = (
        <div className="text-center pt-4 pb-2">
            <h2 className="text-2xl font-bold text-light">Iniciar Sesión</h2>
            <p className="text-light-gray mt-1">Ingresa tus credenciales para acceder a tu cuenta</p>
        </div>
    );

    const cardFooter = (
        <div className="flex justify-center py-3 mb-4">
            <p className="text-sm text-center text-light">
                ¿No tienes una cuenta?{" "}
                <a href="/register" className="text-primary hover:text-primary-hover font-medium">
                    Regístrate aquí
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
                    <div className="p-4">
                        <form className="space-y-5">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label htmlFor="email" className="text-light font-medium">Correo electrónico</label>
                                </div>
                                <InputText
                                    id="email"
                                    type="email"
                                    placeholder="U20XXXXXXX@upc.edu.pe"
                                    required
                                    className="w-full bg-dark-light text-light border border-dark-border px-3 py-3 rounded-md"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="text-light font-medium">Contraseña</label>
                                    <a href="/forgot-password" className="text-primary hover:text-primary-hover text-sm">
                                        ¿Olvidaste tu contraseña?
                                    </a>
                                </div>
                                <div className="flex relative">
                                    <InputText
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        required
                                        className="w-full bg-dark-light text-light border border-dark-border px-3 py-3 rounded-md"
                                    />
                                    <Button
                                        icon={showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-transparent border-none p-2 text-light-gray"
                                        type="button"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button
                                    label="Iniciar Sesión"
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