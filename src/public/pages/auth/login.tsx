import { useState } from "react";
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import NavbarAuth from "../../components/NavbarAuth";
import { useAuth } from "../../hooks/useAuth";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const toast = useRef<any>(null);
    const { signIn } = useAuth();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { success, message } = await signIn(email, password);
            
            if (success) {
                // Redireccionar al dashboard
                window.location.href = "/dashboard";
            } else {
                toast.current.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: message,
                    life: 3000
                });
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Ha ocurrido un error inesperado',
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    };

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
            <Toast ref={toast} />
            <NavbarAuth />

            <main className="flex-1 bg-gradient-to-br from-secondary to-dark-light flex items-center justify-center p-6">
                <Card
                    header={cardHeader}
                    footer={cardFooter}
                    className="w-full max-w-md shadow-xl bg-dark-card border border-dark-border text-light rounded-xl"
                >
                    <div className="p-4">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label htmlFor="email" className="text-light font-medium">Correo electrónico</label>
                                </div>
                                <InputText
                                    id="email"
                                    type="email"
                                    placeholder="U20XXXXXXX@upc.edu.pe"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
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
                                    label={loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary text-light hover:bg-primary-hover py-2"
                                    icon={loading ? "pi pi-spin pi-spinner" : ""}
                                />
                            </div>
                        </form>
                    </div>
                </Card>
            </main>
        </div>
    );
}