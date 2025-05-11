import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { classNames } from 'primereact/utils';
import { Toast } from 'primereact/toast';
import { PaymentPlan } from '../types/Payment';

interface PaymentModalProps {
    userId: string;
    visible: boolean;
    onHide: () => void;
    onSuccess?: (planId: string) => void;
    selectedPlanId?: string;
    selectedPlan?: PaymentPlan;
}

const API_URL = import.meta.env.VITE_TUTORMATCH_PAYMENT_BACKEND_URL;


const PaymentModal: React.FC<PaymentModalProps> = ({ userId, visible, onHide, onSuccess, selectedPlan: propSelectedPlan }) => {
    const [step, setStep] = useState<'qr' | 'upload' | 'processing' | 'completed' | 'error'>('qr');
    const [receipt, setReceipt] = useState<File | null>(null);
    const [message, setMessage] = useState('');
    const [, setLoading] = useState(false);
    const [localSelectedPlan, setLocalSelectedPlan] = useState<PaymentPlan | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const toastRef = React.useRef<Toast>(null);

    // Inicializar con el plan proporcionado
    useEffect(() => {
        if (visible && propSelectedPlan) {
            setLocalSelectedPlan(propSelectedPlan);
            setStep('qr');
        } else if (visible && !propSelectedPlan) {
            toastRef.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se ha seleccionado ningún plan.',
                life: 5000
            });
            onHide();
        }
    }, [visible, propSelectedPlan, onHide]);

    // Limpiar el URL de vista previa
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            if (file.size > 10 * 1024 * 1024) {
                toastRef.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'El archivo es demasiado grande. El tamaño máximo permitido es 10MB.',
                    life: 5000
                });
                return;
            }

            setReceipt(file);

            // Actualizar vista previa
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    const processPayment = async () => {
        if (!receipt || !localSelectedPlan) return;

        setLoading(true);
        setStep('processing');

        try {
            // Crear FormData para enviar el archivo
            const formData = new FormData();
            formData.append('receipt', receipt);
            formData.append('userId', userId);
            formData.append('planId', localSelectedPlan.id);
            formData.append('amount', localSelectedPlan.amount.toString());

            // Enviar al backend
            const response = await fetch(`${API_URL}/payments/verify`, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            // Verificar explícitamente el estado de validación
            if (response.ok) {
                // CASO 1: Error de destinatario incorrecto
                if (result.message && result.message.includes('destinatario')) {
                    setStep('error');
                    setMessage(result.message || 'El destinatario debe ser "Rodrigo A. Lopez H."');
                    return;
                }

                // CASO 2: Error de validación en el OCR
                if (result.isValid === false || result.isValid === 'false') {
                    setStep('error');
                    setMessage(result.message || 'El comprobante no pudo ser validado');
                    return;
                }

                // CASO 3: Error de monto incorrecto - REVISADO Y REFORZADO
                if (result.message && result.message.includes('no coincide con')) {
                    setStep('error');
                    setMessage(result.message);
                    return;
                }

                // CASO 4: Error de monto incorrecto - REVISADO Y REFORZADO

                if (result.message && result.message.includes('no parece ser un comprobante')) {
                    setStep('error');
                    setMessage(result.message || 'La imagen no parece ser un comprobante de Yape válido');
                    return;
                }

                if (result.message && result.message.includes('Hubo un problema al procesar el pago.')) {
                    setStep('error');
                    setMessage(result.message);
                    return;
                }
                // Si llegamos aquí, el pago es válido
                setStep('completed');

                // Configurar mensaje de éxito con/sin detalles
                if (result.paymentInfo) {
                    setMessage('Pago verificado correctamente.');
                } else {
                    setMessage(result.message || 'Pago verificado correctamente');
                }

                // Notificar al componente padre
                if (onSuccess) {
                    onSuccess(localSelectedPlan.id);
                }
            } else {
                // Error en la respuesta HTTP
                setStep('error');

                // Diferentes tipos de errores basados en los códigos HTTP
                if (response.status === 400) {
                    setMessage(result.message || 'El formato del comprobante no es válido.');
                } else if (response.status === 422) {
                    setMessage(result.message || 'No se pudo procesar el comprobante. Asegúrate de que sea un recibo de Yape válido.');
                } else {
                    setMessage(result.message || 'Ha ocurrido un error al verificar el pago.');
                }
            }
        } catch (error) {
            console.error('Error al procesar el pago:', error);
            setStep('error');
            setMessage('Error de conexión. Por favor, inténtelo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const resetProcess = () => {
        setStep('qr');
        setReceipt(null);
        setMessage('');
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    };

    // Reset al cerrar el modal
    const handleHide = () => {
        resetProcess();
        onHide();
    };

    const phoneNumber = '936591720';

    // Header personalizado
    const headerElement = (
        <div className="w-full flex justify-between items-center text-white">
            <h2 className="text-xl font-semibold">
                {step === 'qr' && 'Pago con Yape/Plin'}
                {step === 'upload' && 'Sube tu Comprobante'}
                {step === 'processing' && 'Procesando Pago'}
                {step === 'completed' && '¡Pago Exitoso!'}
                {step === 'error' && 'Error en el Pago'}
            </h2>
            <button
                onClick={handleHide}
                className="text-white bg-transparent hover:text-gray-400"
                disabled={step === 'processing'}
            >
                ✕
            </button>
        </div>
    );

    // Contenido del modal según el paso actual
    const renderContent = () => {
        if (!localSelectedPlan) {
            return (
                <div className="flex flex-col items-center justify-center p-8">
                    <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
                    <p className="text-light-gray mt-4">Cargando información del plan...</p>
                </div>
            );
        }

        switch (step) {
            case 'qr':
                return (
                    <div className="p-5">
                        <div className="mb-4">
                            <div className="bg-dark p-4 rounded-lg border border-dark-border mb-4">
                                <h3 className="text-white font-bold mb-3">Detalles del plan</h3>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-primary font-bold text-xl">{localSelectedPlan.name}</span>
                                    <span className="bg-dark-light px-3 py-1 rounded-full text-white text-sm">
                                        S/ {localSelectedPlan.amount.toFixed(2)}
                                    </span>
                                </div>
                                <p className="text-light-gray text-sm mb-3">{localSelectedPlan.description}</p>

                                <div className="mt-3 border-t border-dark-border pt-3">
                                    <p className="text-white text-sm mb-2">Incluye:</p>
                                    <ul className="grid grid-cols-1 gap-1">
                                        <li className="flex items-center text-xs text-light-gray">
                                            <i className="pi pi-check text-green-400 mr-2 text-xs"></i>
                                            {localSelectedPlan.description}
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col items-center">
                                <div className="bg-white rounded-lg mb-3">
                                    <img
                                        src="https://xdqnuesrahrusfnxcwvm.supabase.co/storage/v1/object/public/qr//qr.png"
                                        alt="Código QR para pago"
                                        className="w-48 h-48"
                                    />
                                </div>
                                <span className="text-light-gray text-sm">Escanea con Yape o Plin</span>
                            </div>

                            <div className="flex flex-col">
                                <div className="bg-dark p-4 rounded-lg border border-dark-border mb-4">
                                    <h3 className="text-white font-bold mb-3">Información de pago</h3>

                                    <div className="flex justify-between mb-2">
                                        <span className="text-light-gray">Nombre:</span>
                                        <span className="text-white">Rodrigo López</span>
                                    </div>

                                    <div className="flex justify-between mb-2">
                                        <span className="text-light-gray">Teléfono:</span>
                                        <span className="text-white">{phoneNumber}</span>
                                    </div>

                                    <div className="flex justify-between font-bold mt-3 pt-3 border-t border-dark-border">
                                        <span className="text-light-gray">Monto a pagar:</span>
                                        <span className="text-primary text-xl">S/ {localSelectedPlan.amount.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="bg-dark p-3 rounded border border-yellow-600 border-opacity-30 mb-4">
                                    <div className="flex items-start">
                                        <i className="pi pi-info-circle text-yellow-500 mr-2 mt-1"></i>
                                        <p className="text-light-gray text-sm">Por favor ingresa exactamente el monto indicado y no cierres esta ventana hasta completar el proceso.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end mt-5">
                            <Button
                                label="Ya realicé el pago"
                                icon="pi pi-arrow-right"
                                onClick={() => setStep('upload')}
                                className="bg-primary hover:bg-primary-hover text-white border-none"
                            />
                        </div>
                    </div>
                );

            case 'upload':
                return (
                    <div className="p-5">
                        <div className="bg-dark p-4 rounded-lg border border-dark-border mb-4">
                            <div className="flex items-center mb-3">
                                <i className="pi pi-info-circle text-blue-400 mr-2"></i>
                                <p className="text-white font-medium">Sube el comprobante de tu pago</p>
                            </div>

                            <p className="text-light-gray text-sm mb-3">
                                Debes haber pagado <span className="text-primary font-medium">S/ {localSelectedPlan.amount.toFixed(2)}</span> por el plan <span className="text-white">{localSelectedPlan.name}</span>
                            </p>
                        </div>

                        <div className="mb-5">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-dark-border rounded-lg cursor-pointer bg-dark hover:bg-dark-light transition-colors duration-200">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <i className="pi pi-cloud-upload text-light-gray text-3xl mb-2"></i>
                                    <p className="text-sm text-light-gray">
                                        <span className="font-medium">Haz clic para subir</span> o arrastra y suelta
                                    </p>
                                    <p className="text-xs text-light-gray">PNG, JPG o JPEG (máx. 10MB)</p>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                            </label>
                        </div>

                        {receipt && previewUrl && (
                            <div className="mb-5">
                                <div className="bg-dark p-3 rounded-lg border border-dark-border">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-white font-medium text-sm">Comprobante cargado:</span>
                                        <span className="text-light-gray text-xs">{receipt.name}</span>
                                    </div>
                                    <div className="flex justify-center bg-black bg-opacity-50 rounded p-2">
                                        <img
                                            src={previewUrl}
                                            alt="Vista previa del comprobante"
                                            className="max-h-48 object-contain"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between mt-5">
                            <Button
                                label="Atrás"
                                icon="pi pi-arrow-left"
                                onClick={() => setStep('qr')}
                                className="p-button-text text-light-gray hover:bg-dark-light"
                            />

                            <Button
                                label="Verificar Pago"
                                icon="pi pi-check"
                                onClick={processPayment}
                                disabled={!receipt}
                                className={classNames(
                                    "text-white border-none",
                                    { "bg-primary hover:bg-primary-hover": receipt, "bg-gray-600 cursor-not-allowed": !receipt }
                                )}
                            />
                        </div>
                    </div>
                );

            case 'processing':
                return (
                    <div className="flex flex-col items-center justify-center p-8">
                        <ProgressSpinner style={{ width: '70px', height: '70px' }} strokeWidth="4" />
                        <p className="text-white font-medium mt-5">Verificando tu pago...</p>
                        <p className="text-light-gray text-sm mt-2">Esto puede tomar unos momentos. No cierres esta ventana.</p>
                    </div>
                );

            case 'completed':
                // Extraer datos del mensaje si contiene información en formato JSON
                let paymentDetails = null;
                try {
                    if (message && message.includes('{')) {
                        const jsonStartIndex = message.indexOf('{');
                        const jsonString = message.substring(jsonStartIndex);
                        paymentDetails = JSON.parse(jsonString);
                    }
                } catch (error) {
                    console.error('Error al parsear detalles del pago:', error);
                }

                return (
                    <div className="flex flex-col items-center p-6">
                        <div className="bg-green-500 bg-opacity-10 p-4 rounded-full mb-4">
                            <i className="pi pi-check-circle text-green-500 text-4xl"></i>
                        </div>

                        <h3 className="text-white font-bold text-xl mb-3">¡Pago Verificado!</h3>

                        <p className="text-light-gray text-center mb-5">
                            {paymentDetails ? 'Tu comprobante ha sido verificado correctamente.' : message}
                        </p>

                        {/* Detalles del pago verificado */}
                        <div className="bg-dark p-4 rounded-lg border border-green-500 border-opacity-20 w-full mb-5">
                            <div className="flex items-start mb-3">
                                <i className="pi pi-info-circle text-green-400 mr-2 mt-1"></i>
                                <div>
                                    <p className="text-white text-sm font-medium">Plan {localSelectedPlan.name} activado</p>
                                    <p className="text-light-gray text-xs mt-1">Tu suscripción está activa y lista para usar.</p>
                                </div>
                            </div>

                            {/* Detalles adicionales si existe información del OCR */}
                            {paymentDetails && (
                                <div className="mt-3 pt-3 border-t border-dark-border">
                                    <p className="text-white text-sm font-medium mb-2">Detalles del pago:</p>

                                    <div className="space-y-2 text-xs">
                                        {paymentDetails.amount && (
                                            <div className="flex justify-between">
                                                <span className="text-light-gray">Monto verificado:</span>
                                                <span className="text-white">S/ {paymentDetails.amount.toFixed(2)}</span>
                                            </div>
                                        )}

                                        {paymentDetails.paymentMethod && (
                                            <div className="flex justify-between">
                                                <span className="text-light-gray">Método de pago:</span>
                                                <span className="text-white">{paymentDetails.paymentMethod}</span>
                                            </div>
                                        )}

                                        {paymentDetails.date && paymentDetails.time && (
                                            <div className="flex justify-between">
                                                <span className="text-light-gray">Fecha y hora:</span>
                                                <span className="text-white">{paymentDetails.date} | {paymentDetails.time}</span>
                                            </div>
                                        )}

                                        {paymentDetails.transactionId && (
                                            <div className="flex justify-between">
                                                <span className="text-light-gray">ID de transacción:</span>
                                                <span className="text-white">{paymentDetails.transactionId}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <Button
                            label="Aceptar"
                            icon="pi pi-check"
                            onClick={handleHide}
                            className="bg-green-500 hover:bg-green-400 text-white border-none"
                        />
                    </div>
                );

            case 'error':
                // Verificar específicamente si es un error de monto incorrecto
                const isAmountMismatchError = message.includes('monto detectado') && message.includes('no coincide');
                // Otros tipos de errores
                const isDestinationError = message.includes('destinatario');
                const isGenericAmountError = !isAmountMismatchError && (message.includes('monto') || message.includes('S/'));
                const isFormatError = message.includes('formato') || message.includes('imagen') || message.includes('comprobante');
                const isTimeError = message.includes('reciente') || message.includes('minutos');

                return (
                    <div className="flex flex-col items-center p-6">
                        <div className="bg-red-500 bg-opacity-10 p-4 rounded-full mb-4">
                            <i className="pi pi-times-circle text-primary text-4xl"></i>
                        </div>

                        <h3 className="text-white font-bold text-xl mb-3">Error en la Verificación</h3>

                        <p className="text-light-gray text-center mb-5">{message}</p>

                        <div className="bg-dark p-4 rounded-lg border border-primary border-opacity-20 w-full mb-5">
                            <div className="flex items-start">
                                <i className="pi pi-exclamation-triangle text-primary mr-2 mt-1"></i>
                                <div className="text-light-gray text-sm">
                                    {isAmountMismatchError ? (
                                        <div>
                                            <p className="mb-2 font-medium text-white">Monto incorrecto detectado</p>
                                            <p className="mb-2">El monto en el comprobante no coincide con el precio del plan seleccionado.</p>
                                            <p>Por favor, realiza un nuevo pago con el monto exacto: <span className="text-white font-medium">S/ {localSelectedPlan?.amount.toFixed(2)}</span></p>
                                        </div>
                                    ) : isDestinationError ? (
                                        <div>
                                            <p className="mb-2 font-medium text-white">Destinatario incorrecto</p>
                                            <p>El pago debe ser dirigido a <span className="text-white font-medium">Rodrigo A. López H.</span> Verifica el nombre al realizar la transferencia.</p>
                                        </div>
                                    ) : isGenericAmountError ? (
                                        <div>
                                            <p className="mb-2 font-medium text-white">Error en el monto</p>
                                            <p>El monto verificado debe ser <span className="text-white font-medium">S/ {localSelectedPlan?.amount.toFixed(2)}</span>. Por favor, asegúrate de pagar el monto exacto.</p>
                                        </div>
                                    ) : isTimeError ? (
                                        <div>
                                            <p className="mb-2 font-medium text-white">Comprobante expirado</p>
                                            <p>La transacción debe ser reciente. Sube el comprobante inmediatamente después de realizar el pago.</p>
                                        </div>
                                    ) : isFormatError ? (
                                        <div>
                                            <p className="mb-2 font-medium text-white">Formato inadecuado</p>
                                            <p>El comprobante debe ser una captura de pantalla clara del recibo de Yape. Asegúrate de que todos los detalles sean visibles.</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="mb-2 font-medium text-white">Error en la verificación</p>
                                            <p>Asegúrate de que el comprobante sea claro y corresponda al monto exacto de S/ {localSelectedPlan?.amount.toFixed(2)} pagado a Rodrigo A. López H.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full">
                            <Button
                                label="Realizar nuevo pago"
                                icon="pi pi-arrow-left"
                                onClick={() => setStep('qr')}
                                className="p-button-outlined p-button-secondary flex-1"
                            />
                            {!isAmountMismatchError && (
                                <Button
                                    label="Subir otro comprobante"
                                    icon="pi pi-image"
                                    onClick={() => {
                                        setReceipt(null);
                                        setPreviewUrl(null);
                                        setStep('upload');
                                    }}
                                    className="bg-primary hover:bg-primary-hover text-white border-none flex-1"
                                />
                            )}
                        </div>
                    </div>
                );
        }
    };

    return (
        <>
            <Toast ref={toastRef} position="top-right" />
            <Dialog
                header={headerElement}
                footer={false}
                draggable={false}
                resizable={false}
                closable={false}
                visible={visible}
                style={{ borderRadius: '8px', overflow: 'hidden', maxWidth: '650px', width: '95%' }}
                modal
                onHide={handleHide}
                contentClassName="p-0"
                headerClassName="bg-dark px-4 py-3 border-b border-dark-border"
                className="bg-dark-card shadow-xl"
                breakpoints={{ '960px': '90vw', '640px': '95vw' }}
            >
                <div className="bg-[#1e1f1e]">
                    {renderContent()}
                </div>
            </Dialog>
        </>
    );
};

export default PaymentModal;