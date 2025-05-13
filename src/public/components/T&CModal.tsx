import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

interface TermsModalProps {
    visible: boolean;
    onHide: () => void;
    onAccept: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ visible, onHide, onAccept }) => {
    const headerElement = (
        <div className="w-full flex justify-between items-center text-white">
            <h2 className="text-xl font-semibold">Términos y Condiciones</h2>
        </div>
    );
    return (
        <Dialog
            header={headerElement}
            footer={false}
            draggable={false}
            resizable={false}
            closable={false}
            visible={visible}
            style={{ width: '700px', borderRadius: '8px', overflow: 'hidden' }}
            modal
            onHide={onHide}
            contentClassName="p-0"
            headerClassName="bg-dark px-4 py-3 border-b border-dark-border"
            className="bg-dark-card shadow-xl"
            breakpoints={{ '960px': '80vw', '640px': '90vw' }}
        >
            <div className="flex flex-col p-5 bg-[#1e1f1e]">
                <div className="flex items-center mb-5">
                    <div className="bg-secondary bg-opacity-10 p-3 rounded-full mr-4">
                        <i className="pi pi-file-edit text-secondary text-2xl"></i>
                    </div>
                    <h2 className="text-xl font-bold text-white">Acuerdo de Uso de TutorMatch</h2>
                </div>

                <div className="bg-dark p-4 rounded mb-4 border border-dark-border h-80 overflow-y-auto">
                    <h3 className="text-white font-medium text-lg mb-3">1. Introducción y Alcance</h3>
                    <p className="text-light-gray mb-4">
                        Bienvenido a TutorMatch. Este Acuerdo de Servicio ("Acuerdo") establece los términos y condiciones 
                        que rigen el uso de la plataforma TutorMatch, incluyendo todas sus características y funcionalidades.
                        Al registrarte y usar TutorMatch, aceptas cumplir con este Acuerdo en su totalidad. TutorMatch es una 
                        plataforma que conecta estudiantes con tutores calificados para recibir apoyo académico en diversas materias.
                    </p>

                    <h3 className="text-white font-medium text-lg mb-3">2. Definiciones</h3>
                    <p className="text-light-gray mb-4">
                        "Plataforma" se refiere al sitio web y servicios de TutorMatch.<br/>
                        "Usuario" se refiere a cualquier persona que acceda o utilice la Plataforma.<br/>
                        "Estudiante" se refiere a un Usuario que busca servicios de tutoría.<br/>
                        "Tutor" se refiere a un Usuario que ofrece servicios de tutoría.<br/>
                        "Tutoría" se refiere al servicio educativo proporcionado por un Tutor a un Estudiante.
                    </p>

                    <h3 className="text-white font-medium text-lg mb-3">3. Registro y Cuentas de Usuario</h3>
                    <p className="text-light-gray mb-4">
                        3.1. Para utilizar TutorMatch, debes crear una cuenta proporcionando información precisa y completa.<br/>
                        3.2. Eres responsable de mantener la confidencialidad de tus credenciales de acceso.<br/>
                        3.3. Debes ser alumno de la Universidad Peruana de Ciencias Aplicadas (UPC) para registrarte y contar con autorización de tus padres o tutores legales, en caso de ser menor de edad.<br/>
                        3.4. Cada cuenta es personal e intransferible.<br/>
                        3.5. TutorMatch se reserva el derecho de verificar la identidad de los usuarios mediante procedimientos de verificación, especialmente para tutores.
                    </p>

                    <h3 className="text-white font-medium text-lg mb-3">4. Servicios de Tutoría</h3>
                    <p className="text-light-gray mb-4">
                        4.1. Los Tutores pueden crear y ofrecer sesiones de tutoría a través de la Plataforma.<br/>
                        4.2. Los Tutores son responsables de la calidad y precisión del contenido educativo que proporcionan.<br/>
                        4.3. TutorMatch no garantiza resultados académicos específicos derivados de las tutorías.<br/>
                        4.4. Los horarios de disponibilidad son establecidos por los Tutores y respetados por los Estudiantes.<br/>
                        4.5. TutorMatch se reserva el derecho de revisar y moderar el contenido de las tutorías para asegurar su calidad y cumplimiento con nuestras políticas.
                    </p>

                    <h3 className="text-white font-medium text-lg mb-3">5. Pagos y Transacciones</h3>
                    <p className="text-light-gray mb-4">
                        5.1. TutorMatch actúa únicamente como plataforma de conexión entre Tutores y Estudiantes.<br/>
                        5.2. TutorMatch NO gestiona pagos ni transacciones entre usuarios.<br/>
                        5.3. Los acuerdos económicos, métodos de pago y tarifas deben ser acordados directamente entre el Tutor y el Estudiante.<br/>
                        5.4. TutorMatch no es responsable por disputas económicas, falta de pago o cualquier otro problema relacionado con transacciones entre usuarios.<br/>
                        5.5. Los usuarios acuerdan que cualquier arreglo financiero realizado es bajo su entera responsabilidad.<br/>
                        5.6. Se recomienda a los usuarios establecer claramente las condiciones de pago antes de iniciar cualquier servicio de tutoría.
                    </p>

                    <h3 className="text-white font-medium text-lg mb-3">6. Privacidad y Protección de Datos</h3>
                    <p className="text-light-gray mb-4">
                        6.1. TutorMatch recopila y procesa datos personales de acuerdo con nuestra Política de Privacidad.<br/>
                        6.2. Los usuarios son responsables de la información que comparten con otros usuarios.<br/>
                        6.3. TutorMatch implementa medidas de seguridad para proteger la información de los usuarios.<br/>
                        6.4. Los datos de los usuarios se almacenan de forma segura y se utilizan solo para los fines establecidos en nuestra Política de Privacidad.<br/>
                        6.5. Los usuarios pueden solicitar acceso, rectificación o eliminación de sus datos personales según las leyes aplicables.
                    </p>

                    <h3 className="text-white font-medium text-lg mb-3">7. Propiedad Intelectual</h3>
                    <p className="text-light-gray mb-4">
                        7.1. Todo el contenido de TutorMatch, incluyendo logos, diseños y software, es propiedad de TutorMatch o está licenciado a nosotros.<br/>
                        7.2. Los materiales educativos subidos por los Tutores siguen siendo de su propiedad, pero conceden a TutorMatch una licencia para mostrarlos en la Plataforma.<br/>
                        7.3. Los usuarios no pueden copiar, distribuir o modificar contenido de la Plataforma sin autorización.<br/>
                        7.4. TutorMatch respeta los derechos de propiedad intelectual de terceros y espera que los usuarios también lo hagan.
                    </p>

                    <h3 className="text-white font-medium text-lg mb-3">8. Conducta del Usuario</h3>
                    <p className="text-light-gray mb-4">
                        8.1. Los usuarios deben comportarse de manera respetuosa y profesional.<br/>
                        8.2. Está prohibido el uso de la Plataforma para actividades ilegales, fraudulentas o no éticas.<br/>
                        8.3. No se permite el acoso, discriminación o comportamiento abusivo hacia otros usuarios.<br/>
                        8.4. La publicación de contenido inapropiado, ofensivo o dañino está prohibida.<br/>
                        8.5. Los usuarios no deben interferir con el funcionamiento de la Plataforma o intentar acceder sin autorización a áreas restringidas.
                    </p>

                    <h3 className="text-white font-medium text-lg mb-3">9. Limitación de Responsabilidad</h3>
                    <p className="text-light-gray mb-4">
                        9.1. TutorMatch no es responsable de la calidad o precisión del contenido proporcionado por los Tutores.<br/>
                        9.2. TutorMatch no garantiza la credibilidad, calificaciones o experiencia de los Tutores.<br/>
                        9.3. TutorMatch no es responsable de ninguna transacción financiera entre Estudiantes y Tutores.<br/>
                        9.4. No garantizamos la disponibilidad ininterrumpida de la Plataforma.<br/>
                        9.5. No somos responsables de las interacciones entre usuarios fuera de la Plataforma.<br/>
                        9.6. TutorMatch no se hace responsable de daños directos, indirectos, incidentales o consecuentes derivados del uso de la Plataforma.
                    </p>

                    <h3 className="text-white font-medium text-lg mb-3">10. Contacto entre Usuarios</h3>
                    <p className="text-light-gray mb-4">
                        10.1. TutorMatch facilita el contacto inicial entre Tutores y Estudiantes a través de la Plataforma.<br/>
                        10.2. Los usuarios pueden comunicarse a través de correo electrónico o WhatsApp para coordinar detalles de sus tutorías.<br/>
                        10.3. TutorMatch no supervisa ni participa en las comunicaciones directas entre usuarios.<br/>
                        10.4. Los usuarios acuerdan usar los canales de comunicación de manera responsable y profesional.<br/>
                        10.5. TutorMatch recomienda mantener todas las comunicaciones relacionadas con las tutorías dentro de canales que puedan ser verificados.
                    </p>

                    <h3 className="text-white font-medium text-lg mb-3">11. Terminación</h3>
                    <p className="text-light-gray mb-4">
                        11.1. Los usuarios pueden cancelar su cuenta en cualquier momento.<br/>
                        11.2. TutorMatch puede suspender o terminar cuentas que violen este Acuerdo sin previo aviso.<br/>
                        11.3. Al cancelar tu cuenta, es posible que no tengas acceso a ciertos datos o contenidos.<br/>
                        11.4. Algunas disposiciones de este Acuerdo seguirán vigentes después de la terminación.
                    </p>

                    <h3 className="text-white font-medium text-lg mb-3">12. Modificaciones al Acuerdo</h3>
                    <p className="text-light-gray mb-4">
                        12.1. TutorMatch puede modificar este Acuerdo en cualquier momento.<br/>
                        12.2. Las modificaciones importantes serán notificadas a los usuarios.<br/>
                        12.3. El uso continuado de la Plataforma después de las modificaciones constituye aceptación de los nuevos términos.
                    </p>

                    <h3 className="text-white font-medium text-lg mb-3">13. Ley Aplicable</h3>
                    <p className="text-light-gray mb-4">
                        13.1. Este Acuerdo se rige por las leyes de Perú.<br/>
                        13.2. Cualquier disputa derivada de este Acuerdo se resolverá en los tribunales competentes de Lima, Perú.
                    </p>
                </div>

                <div className="bg-dark p-3 rounded border border-secondary border-opacity-30 mb-4">
                    <div className="flex items-center">
                        <i className="pi pi-info-circle text-secondary mr-2"></i>
                        <p className="text-light-gray text-sm">Al hacer clic en "Aceptar", confirmas que has leído y estás de acuerdo con nuestros Términos y Condiciones, y nuestra Política de Privacidad.</p>
                    </div>
                </div>

                <div className="flex justify-end bg-[#1e1f1e] gap-2">
                    <Button
                        label="Aceptar"
                        icon="pi pi-check"
                        onClick={onAccept}
                        className="bg-secondary hover:bg-primary-hover text-white border-none transition-colors duration-200 shadow-md"
                        style={{ fontWeight: 500 }}
                    />
                    <Button
                        label="Cancelar"
                        icon="pi pi-times"
                        onClick={onHide}
                        className="p-button-text hover:bg-dark-light text-light-gray"
                    />
                </div>
            </div>
        </Dialog>
    );
};

export default TermsModal;