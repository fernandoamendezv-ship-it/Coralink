import React, { useState, useEffect } from 'react';
import { X, Shield, Lock, FileText, Copy, Check, Mail, Phone, MapPin, Clock } from 'lucide-react';
import { getPrivacyConfig, PrivacyLegalConfig } from '../utils/privacyConfig';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<PrivacyLegalConfig>(getPrivacyConfig());
  const [copied, setCopied] = useState(false);

  // Keep state updated in case admin changes details
  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e?.detail) {
        setConfig(e.detail);
      } else {
        setConfig(getPrivacyConfig());
      }
    };
    window.addEventListener('coralink_privacy_updated', handleUpdate);
    return () => window.removeEventListener('coralink_privacy_updated', handleUpdate);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setConfig(getPrivacyConfig());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyPolicy = () => {
    const fullText = document.getElementById('privacy-policy-content')?.innerText || '';
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(fullText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-4xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden text-slate-800 dark:text-slate-100">
        
        {/* Header */}
        <div className="px-5 py-4 bg-[#0B2545] text-white flex items-center justify-between shrink-0 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1BA7D9] flex items-center justify-center text-white shadow-md">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                  POLÍTICA DE PRIVACIDAD
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  RGPD • CCPA • App Store • Google Play
                </span>
              </div>
              <p className="text-xs text-[#A5EEFF] font-medium leading-tight mt-0.5">
                {config.businessName} • Versión {config.version} • {config.lastUpdated}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyPolicy}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Copiar texto formal completo de la política para publicar en tiendas o web"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? '¡Copiado!' : 'Copiar Texto Oficial'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="px-5 py-2.5 bg-sky-50/70 dark:bg-sky-950/40 border-b border-sky-100 dark:border-sky-900/60 flex items-center justify-between text-xs gap-3 flex-wrap">
          <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 flex-wrap">
            <span className="flex items-center gap-1 font-semibold">
              <Mail className="w-3.5 h-3.5 text-[#1BA7D9]" />
              <strong className="text-[#0B2545] dark:text-white">{config.email}</strong>
            </span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <span className="flex items-center gap-1 font-semibold">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <strong className="text-[#0B2545] dark:text-white">{config.phone}</strong>
            </span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Última actualización: <strong>{config.lastUpdated}</strong>
          </span>
        </div>

        {/* Content Body */}
        <div
          id="privacy-policy-content"
          className="p-5 sm:p-7 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-normal"
        >
          {/* Header Metadata */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-black text-sm sm:text-base">
              <FileText className="w-4 h-4 text-[#1BA7D9]" />
              <span>POLÍTICA DE PRIVACIDAD Y PROTECCIÓN DE DATOS PERSONALES DE CORALINK</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              <b>Última actualización:</b> {config.lastUpdated} &nbsp;•&nbsp; <b>Versión:</b> {config.version} &nbsp;•&nbsp; <b>Aplicación:</b> {config.applicationName}
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-2">
            <h3 className="text-sm sm:text-base font-black text-[#0B2545] dark:text-[#1BA7D9]">
              1. IDENTIFICACIÓN DEL RESPONSABLE DEL TRATAMIENTO
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Nombre Comercial:</strong> {config.businessName}</li>
              <li><strong>Domicilio:</strong> {config.address}</li>
              <li><strong>Correo electrónico de contacto:</strong> <code>{config.email}</code></li>
              <li><strong>Teléfono / WhatsApp oficial:</strong> <code>{config.phone}</code></li>
            </ul>
            <p className="pt-1">
              Coralink actúa como responsable del tratamiento de los datos personales recabados a través de su aplicación móvil, Progressive Web App (PWA) y plataforma de catálogo interactivo.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2">
            <h3 className="text-sm sm:text-base font-black text-[#0B2545] dark:text-[#1BA7D9]">
              2. MARCO LEGAL APLICABLE
            </h3>
            <p>La presente Política de Privacidad ha sido redactada para garantizar el cumplimiento de:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>RGPD</strong> (Reglamento General de Protección de Datos de la Unión Europea - UE 2016/679).</li>
              <li><strong>CCPA / CPRA</strong> (California Consumer Privacy Act / California Privacy Rights Act).</li>
              <li><strong>Políticas de Datos de Usuario y Familias de Google Play Store.</strong></li>
              <li><strong>Directrices de Revisión de la App Store de Apple</strong> (Sección 5.1 - Privacidad y Seguridad).</li>
              <li><strong>Ley N° 787 de Protección de Datos Personales</strong> de la República de Nicaragua.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-2">
            <h3 className="text-sm sm:text-base font-black text-[#0B2545] dark:text-[#1BA7D9]">
              3. PRINCIPIO DE MINIMIZACIÓN: DATOS QUE RECOPILAMOS Y LOS QUE NO RECOPILAMOS
            </h3>
            <p>En estricta observancia del principio de privacidad desde el diseño (<em>Privacy by Design</em>):</p>
            
            <div className="space-y-2 pl-2">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-100">• Datos que usted nos proporciona voluntariamente:</p>
                <ul className="list-disc pl-5 space-y-1 mt-1 text-slate-600 dark:text-slate-300">
                  <li><strong>Nombre o alias y número de teléfono:</strong> Proporcionados exclusivamente cuando usted decide cotizar o formalizar un pedido a través del botón oficial de WhatsApp.</li>
                  <li><strong>Detalles del pedido:</strong> Selección de productos, dedicatorias o fotografías de referencia para la personalización de artículos (resina, sublimación, papelería).</li>
                </ul>
              </div>

              <div>
                <p className="font-bold text-slate-800 dark:text-slate-100">• Datos almacenados localmente en su dispositivo (Almacenamiento del Cliente / PWA):</p>
                <p className="text-slate-600 dark:text-slate-300 pl-4 mt-1">
                  La aplicación utiliza <code>LocalStorage</code> e <code>IndexedDB</code> exclusivamente en su dispositivo para recordar: su lista de productos favoritos, productos añadidos a su carrito de cotización, estado del modo oscuro y archivos estáticos de navegación fuera de línea (offline). Estos datos permanecen en su propio dispositivo y no se transmiten a servidores externos de rastreo comercial.
                </p>
              </div>

              <div>
                <p className="font-bold text-rose-700 dark:text-rose-400">• DATOS QUE NUNCA RECOPILAMOS:</p>
                <ul className="list-disc pl-5 space-y-1 mt-1 text-slate-600 dark:text-slate-300">
                  <li>No solicitamos contraseñas a clientes regulares para navegar o cotizar.</li>
                  <li>No procesamos ni almacenamos números de tarjetas de crédito o débito dentro de la aplicación.</li>
                  <li>No accedemos a su libreta de contactos, micrófono en segundo plano ni ubicación GPS precisa.</li>
                  <li>No recopilamos datos biométricos ni categorías especiales de datos personales.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-2">
            <h3 className="text-sm sm:text-base font-black text-[#0B2545] dark:text-[#1BA7D9]">
              4. FINALIDAD Y BASES LEGALES DEL TRATAMIENTO
            </h3>
            <p>Los datos se tratan con las siguientes finalidades:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Gestión de cotizaciones y pedidos personalizados (Art. 6.1.b RGPD):</strong> Tratamiento indispensable para la elaboración del presupuesto solicitado y la fabricación de los artículos artesanales.</li>
              <li><strong>Atención y comunicación con el cliente (Art. 6.1.a RGPD):</strong> Coordinar entregas en Corn Island y envíos marítimos/aéreos hacia otras localidades de Nicaragua mediante WhatsApp.</li>
              <li><strong>Seguridad y funcionamiento técnico (Art. 6.1.f RGPD):</strong> Garantizar la integridad del catálogo y el funcionamiento sin conexión mediante el Service Worker.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-2">
            <h3 className="text-sm sm:text-base font-black text-[#0B2545] dark:text-[#1BA7D9]">
              5. PROVEEDORES DE SERVICIOS Y TERCEROS
            </h3>
            <p>La aplicación se integra únicamente con proveedores técnicos reconocidos para su correcto funcionamiento operativo:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>WhatsApp (Meta Platforms, Inc.):</strong> Las comunicaciones entre el cliente y Coralink se realizan mediante enlaces directos a WhatsApp, protegidos por el cifrado de extremo a extremo de dicha plataforma bajo sus propias políticas de privacidad.</li>
              <li><strong>Google Firebase Firestore (Google LLC):</strong> Servicio de base de datos en la nube utilizado exclusivamente para la consulta y sincronización técnica del catálogo público de productos. No se utiliza para funciones de rastreo analítico ni recolección de perfiles de usuario, operando bajo reglas de seguridad estrictas que impiden accesos no autorizados.</li>
              <li><strong>Postimages:</strong> Plataforma de alojamiento CDN utilizada para servir las fotografías de los productos de manera rápida y segura, sin transferir datos de identidad personal a dicha infraestructura.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-2">
            <h3 className="text-sm sm:text-base font-black text-[#0B2545] dark:text-[#1BA7D9]">
              6. DECLARACIÓN DE NO VENTA DE DATOS (CCPA/CPRA)
            </h3>
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-medium">
              Coralink no vende, no alquila, no cede ni comercializa información personal de ningún usuario a intermediarios de datos (data brokers), anunciantes o redes publicitarias de terceros. No participamos en publicidad conductual cruzada (<em>Cross-Context Behavioral Advertising</em>).
            </div>
          </section>

          {/* Section 7 */}
          <section className="space-y-2">
            <h3 className="text-sm sm:text-base font-black text-[#0B2545] dark:text-[#1BA7D9]">
              7. DERECHOS DEL USUARIO (ARCO, RGPD Y DERECHO DE SUPRESIÓN)
            </h3>
            <p>Todo usuario tiene derecho a:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Acceso:</strong> Solicitar confirmación de los datos que conservamos sobre sus cotizaciones.</li>
              <li><strong>Rectificación:</strong> Modificar datos erróneos relativos a su pedido.</li>
              <li><strong>Supresión («Derecho al Olvido»):</strong> Solicitar la eliminación total de sus mensajes y registros de cotizaciones en nuestros canales de atención.</li>
              <li><strong>Oposición y Limitación:</strong> Oponerse al tratamiento o solicitar su restricción.</li>
              <li><strong>Portabilidad:</strong> Solicitar una copia de la información de sus pedidos en formato legible.</li>
            </ul>
            <div className="mt-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <p className="font-bold text-slate-800 dark:text-white">
                Mecanismo para solicitar la eliminación de datos (Requisito Google Play &amp; Apple App Store):
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                Para solicitar la eliminación definitiva de cualquier dato personal vinculado a sus cotizaciones, envíe un mensaje a <code>{config.email}</code> o al WhatsApp <code>{config.phone}</code> con el asunto «Solicitud de Eliminación de Datos». Su petición será atendida y procesada en un plazo máximo de {config.deletionResponseHours}. Asimismo, puede eliminar sus favoritos y carritos locales en cualquier momento limpiando los datos de navegación (caché) de su explorador web.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section className="space-y-2">
            <h3 className="text-sm sm:text-base font-black text-[#0B2545] dark:text-[#1BA7D9]">
              8. PRIVACIDAD DE MENORES (COPPA Y POLÍTICAS DE GOOGLE PLAY)
            </h3>
            <p>
              Nuestra aplicación está destinada a un público general y no está dirigida deliberadamente a menores de trece (13) años. No recopilamos intencionalmente datos de menores sin la supervisión y autorización de sus padres o tutores legales. Si un padre o tutor tiene conocimiento de que un menor ha facilitado datos sin su consentimiento, puede comunicarse con nosotros para proceder a su borrado inmediato.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-2">
            <h3 className="text-sm sm:text-base font-black text-[#0B2545] dark:text-[#1BA7D9]">
              9. SEGURIDAD DE LA INFORMACIÓN
            </h3>
            <p>Implementamos estándares de seguridad técnica y organizativa para proteger la integridad de los datos:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Conexiones obligatorias bajo protocolo seguro HTTPS / TLS.</li>
              <li>Aislamiento de datos en clientes y mecanismos de bloqueo administrativo mediante PIN/contraseña protegida para la gestión interna del catálogo.</li>
            </ul>
          </section>

          {/* Section 10 */}
          <section className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm sm:text-base font-black text-[#0B2545] dark:text-[#1BA7D9]">
              10. CANAL DE ATENCIÓN DE PRIVACIDAD
            </h3>
            <p>Para cualquier duda, comentario o solicitud relacionada con esta Política de Privacidad, comuníquese a:</p>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm space-y-2 font-medium">
              <p className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#1BA7D9]" />
                <span><strong>Entidad:</strong> {config.businessName} Corn Island</span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FF6B35]" />
                <span><strong>Domicilio:</strong> {config.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-600" />
                <span><strong>Email:</strong> <a href={`mailto:${config.email}`} className="text-[#1BA7D9] underline">{config.email}</a></span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span><strong>WhatsApp:</strong> <a href={`https://wa.me/${config.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="text-[#1BA7D9] underline">{config.phone}</a></span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span><strong>Horario de atención:</strong> {config.hours}</span>
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Documento legal vinculante y listo para publicación</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#0B2545] dark:bg-[#1BA7D9] hover:bg-[#144272] dark:hover:bg-[#158db9] text-white text-xs font-bold transition-colors cursor-pointer shadow-md"
          >
            Entendido y Aceptar
          </button>
        </div>

      </div>
    </div>
  );
};
