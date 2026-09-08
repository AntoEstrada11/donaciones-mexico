<script setup lang="ts">
const { t } = useI18n()

useHead({
  title: 'Aviso de privacidad — Donaciones Iglesia Universal México',
  meta: [
    {
      name: 'description',
      content: 'Aviso de privacidad integral conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.',
    },
  ],
})
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-10 md:px-6">
    <NuxtLink to="/" class="mb-6 inline-flex items-center gap-1 text-sm text-brand hover:underline">
      ← {{ t('common.back') }}
    </NuxtLink>

    <header class="mb-8">
      <h1 class="section-title">
        {{ t('legal.privacyTitle') }}
      </h1>
      <p class="mt-2 text-sm text-gray-500">
        {{ t('legal.lastUpdate', { date: LEGAL.noticeDate, version: LEGAL.noticeVersion }) }}
      </p>
    </header>

    <article class="space-y-8 text-sm leading-relaxed text-gray-700">
      <section>
        <h2 class="mb-2 text-lg font-bold text-ink">
          1. Quién es responsable de sus datos
        </h2>
        <p>
          <strong>{{ LEGAL.razonSocial }}</strong> (en adelante, «la Iglesia») es responsable del
          tratamiento de los datos personales que usted proporciona a través de este sitio de
          donaciones, conforme a la Ley Federal de Protección de Datos Personales en Posesión de los
          Particulares.
        </p>
        <ul class="mt-3 space-y-1">
          <li><strong>Domicilio:</strong> {{ LEGAL.domicilio }}</li>
          <li><strong>Correo para asuntos de privacidad:</strong> {{ LEGAL.correoArco }}</li>
          <li><strong>Teléfono:</strong> {{ LEGAL.telefono }}</li>
        </ul>
      </section>

      <section>
        <h2 class="mb-2 text-lg font-bold text-ink">
          2. Qué datos personales tratamos
        </h2>
        <p>Para las finalidades descritas en este aviso recabamos los siguientes datos:</p>
        <ul class="mt-3 list-disc space-y-1 pl-5">
          <li><strong>Identificación y contacto:</strong> nombre, correo electrónico y teléfono.</li>
          <li><strong>Datos de acceso:</strong> la contraseña que usted define, que guardamos cifrada en un solo sentido y que nadie en la Iglesia puede leer.</li>
          <li><strong>Datos fiscales (opcionales):</strong> RFC, calle, ciudad, estado y código postal. Solo se los pedimos si usted solicita un recibo deducible de impuestos.</li>
          <li><strong>Datos del donativo:</strong> iglesia elegida, tipo de donación, monto, método de pago y fecha.</li>
          <li><strong>Ubicación aproximada (opcional):</strong> las coordenadas de su dispositivo, únicamente si usted autoriza el permiso de ubicación para ordenar el directorio de iglesias por cercanía. No se guardan en su cuenta.</li>
          <li><strong>Datos técnicos:</strong> versión del aviso que aceptó, fecha del consentimiento, navegador y una huella cifrada de su dirección IP, como evidencia de que el consentimiento fue otorgado.</li>
        </ul>
      </section>

      <section class="rounded-lg border border-brand/30 bg-brand-light/40 p-5">
        <h2 class="mb-2 text-lg font-bold text-ink">
          3. Tratamiento de datos personales sensibles
        </h2>
        <p>
          <strong>
            Le informamos expresamente que en este sitio tratamos datos personales sensibles.
          </strong>
          Al registrarse o realizar un donativo a la Iglesia Universal del Reino de Dios, la
          información generada revela sus creencias religiosas, categoría que la ley clasifica como
          dato personal sensible.
        </p>
        <p class="mt-3">
          Por esa razón le solicitamos su <strong>consentimiento expreso</strong> mediante la casilla
          que aparece en los formularios de registro y de donación. Sin ese consentimiento no podemos
          crear su cuenta ni registrar su donativo. La creación de esta base de datos responde a una
          finalidad legítima y concreta: administrar los donativos que sostienen la obra de la Iglesia
          y cumplir con las obligaciones contables y fiscales derivadas de ellos.
        </p>
        <p class="mt-3">
          Limitamos el tratamiento de estos datos al mínimo indispensable y restringimos su acceso al
          personal que administra los donativos.
        </p>
      </section>

      <section>
        <h2 class="mb-2 text-lg font-bold text-ink">
          4. Para qué usamos sus datos
        </h2>

        <h3 class="mb-2 mt-4 font-semibold text-ink">
          Finalidades necesarias
        </h3>
        <p>Sin estas finalidades no es posible prestarle el servicio:</p>
        <ul class="mt-2 list-disc space-y-1 pl-5">
          <li>Crear y administrar su cuenta y validar su acceso.</li>
          <li>Registrar, procesar y dar seguimiento a sus donativos.</li>
          <li>Mostrarle su historial de donaciones.</li>
          <li>Emitir el comprobante fiscal cuando usted lo solicite y proporcione sus datos fiscales.</li>
          <li>Atender sus dudas, aclaraciones y solicitudes de derechos ARCO.</li>
          <li>Cumplir obligaciones contables, fiscales y de prevención de fraude.</li>
        </ul>

        <h3 class="mb-2 mt-4 font-semibold text-ink">
          Finalidades adicionales que requieren su consentimiento
        </h3>
        <p>Estas son opcionales y usted puede negarlas sin que afecte su donativo ni su cuenta:</p>
        <ul class="mt-2 list-disc space-y-1 pl-5">
          <li>Enviarle comunicaciones, noticias e invitaciones a actividades de la Iglesia.</li>
          <li>Invitarle a participar en campañas o propósitos de fe.</li>
        </ul>
        <p class="mt-3">
          Si no desea que sus datos se usen para estas finalidades, deje sin marcar la casilla
          correspondiente al registrarse, desactívela después desde
          <NuxtLink to="/perfil" class="text-brand hover:underline">
            su perfil
          </NuxtLink>
          o escríbanos a {{ LEGAL.correoArco }}.
        </p>
      </section>

      <section>
        <h2 class="mb-2 text-lg font-bold text-ink">
          5. Sus derechos ARCO y la revocación del consentimiento
        </h2>
        <p>
          Usted puede solicitar el <strong>Acceso</strong> a sus datos, la
          <strong>Rectificación</strong> de los que sean inexactos, la <strong>Cancelación</strong>
          cuando considere que no son necesarios, y <strong>Oponerse</strong> a un uso específico.
          También puede revocar en cualquier momento el consentimiento que nos otorgó.
        </p>

        <h3 class="mb-2 mt-4 font-semibold text-ink">
          Desde su cuenta
        </h3>
        <ul class="mt-2 list-disc space-y-1 pl-5">
          <li><strong>Acceso:</strong> descargue una copia completa de sus datos en su perfil.</li>
          <li><strong>Rectificación:</strong> edite sus datos directamente en su perfil.</li>
          <li><strong>Cancelación:</strong> elimine su cuenta desde su perfil.</li>
          <li><strong>Oposición y revocación:</strong> desactive las comunicaciones opcionales en su perfil.</li>
        </ul>

        <h3 class="mb-2 mt-4 font-semibold text-ink">
          Por correo electrónico
        </h3>
        <p>
          Envíe su solicitud a <strong>{{ LEGAL.correoArco }}</strong> indicando su nombre, un correo
          para recibir la respuesta, una copia de una identificación oficial que acredite su
          identidad, la descripción clara de los datos sobre los que ejerce el derecho y qué derecho
          desea ejercer.
        </p>
        <p class="mt-3">
          Le responderemos en un plazo máximo de <strong>{{ ARCO_DEADLINES.respuesta }} días
            hábiles</strong>, prorrogable por una sola vez hasta por
          {{ ARCO_DEADLINES.prorroga }} días hábiles más cuando exista causa justificada. Si su
          solicitud procede, la haremos efectiva dentro de los {{ ARCO_DEADLINES.ejecucion }} días
          hábiles siguientes.
        </p>
        <p class="mt-3">
          Si no está conforme con nuestra respuesta, puede acudir ante la
          {{ LEGAL.autoridad }}, autoridad competente en materia de protección de datos personales en
          posesión de particulares.
        </p>
      </section>

      <section>
        <h2 class="mb-2 text-lg font-bold text-ink">
          6. Cuánto tiempo conservamos sus datos
        </h2>
        <ul class="mt-2 list-disc space-y-1 pl-5">
          <li><strong>Cuenta y datos de contacto:</strong> {{ RETENTION.cuentaActiva.toLowerCase() }}.</li>
          <li><strong>Al cancelar la cuenta:</strong> {{ RETENTION.trasCancelacion.toLowerCase() }}.</li>
          <li><strong>Datos fiscales y comprobantes:</strong> {{ RETENTION.datosFiscales.toLowerCase() }}.</li>
          <li><strong>Registro de consentimientos:</strong> {{ RETENTION.consentimientos.toLowerCase() }}.</li>
        </ul>
        <p class="mt-3">
          Cuando la ley nos obliga a conservar un dato (por ejemplo, el respaldo contable de un
          donativo por el que se emitió comprobante fiscal), no podemos eliminarlo antes del plazo
          legal aunque usted cancele su cuenta. En ese caso lo conservamos bloqueado, sin usarlo para
          ninguna otra finalidad.
        </p>
      </section>

      <section>
        <h2 class="mb-2 text-lg font-bold text-ink">
          7. Con quién compartimos sus datos
        </h2>
        <p>
          <strong>No vendemos, alquilamos ni comercializamos sus datos personales.</strong>
        </p>
        <ul class="mt-3 list-disc space-y-1 pl-5">
          <li>
            <strong>Directorio de iglesias:</strong> si autoriza el permiso de ubicación, enviamos
            únicamente las coordenadas de su dispositivo al servicio de directorio alojado en
            universal.org.mx para ordenar las iglesias por cercanía. No enviamos su nombre, correo,
            teléfono ni datos fiscales.
          </li>
          <li>
            <strong>MercadoPago:</strong> si elige pagar con tarjeta, lo redirigimos al checkout
            alojado de Mercado Pago, S.A. de C.V. (encargado de cobro). Recibe el monto, la moneda y
            un identificador de la donación; usted ingresa los datos de su tarjeta directamente en
            ese sitio. Nosotros no almacenamos número de tarjeta ni CVV.
          </li>
          <li>
            <strong>PayPal:</strong> si elige PayPal, lo redirigimos al checkout de PayPal
            (PayPal, Inc. / PayPal México). Recibe el monto, la moneda y un identificador de la
            donación. Los datos de su cuenta PayPal se tratan en ese entorno; no los almacenamos en
            este sitio.
          </li>
          <li>
            <strong>Autoridades:</strong> cuando exista un requerimiento fundado y motivado de una
            autoridad competente.
          </li>
          <li>
            <strong>Proveedores de servicio:</strong> el alojamiento del sitio y de la base de datos.
            Están obligados por contrato a mantener la confidencialidad de sus datos, incluso después
            de terminada la relación.
          </li>
        </ul>
      </section>

      <section>
        <h2 class="mb-2 text-lg font-bold text-ink">
          8. Almacenamiento en su navegador
        </h2>
        <p>
          Este sitio <strong>no utiliza cookies publicitarias ni herramientas de analítica o
            rastreo de terceros.</strong> Solo usamos el almacenamiento de sesión de su navegador
          para mantener su sesión iniciada, recordar la iglesia que seleccionó y guardar
          temporalmente el resultado del directorio. Esa información se borra al cerrar la pestaña o
          al cerrar sesión, y usted puede eliminarla en cualquier momento desde la configuración de
          su navegador.
        </p>
      </section>

      <section>
        <h2 class="mb-2 text-lg font-bold text-ink">
          9. Cómo protegemos sus datos
        </h2>
        <p>
          Aplicamos medidas administrativas, técnicas y físicas razonables: las contraseñas se
          almacenan cifradas en un solo sentido, el acceso a la base de datos está restringido a
          personal autorizado, los datos de contacto y fiscales se guardan separados de las
          credenciales de acceso, y las funciones de administración exigen un rol específico.
          Ninguna medida de seguridad es infalible, por lo que le pedimos usar una contraseña única y
          no compartirla.
        </p>
      </section>

      <section>
        <h2 class="mb-2 text-lg font-bold text-ink">
          10. Cambios a este aviso
        </h2>
        <p>
          Podemos actualizar este aviso por cambios legales o por modificaciones en nuestros
          servicios. La versión vigente siempre estará publicada en esta página con su fecha y número
          de versión. Cuando el cambio afecte de manera sustancial las finalidades del tratamiento,
          le solicitaremos nuevamente su consentimiento.
        </p>
      </section>

      <section class="rounded-lg border border-gray-200 bg-gray-50 p-5">
        <h2 class="mb-2 text-lg font-bold text-ink">
          Contacto
        </h2>
        <p>
          Para cualquier duda sobre este aviso o sobre el tratamiento de sus datos, escríbanos a
          <a :href="`mailto:${LEGAL.correoArco}`" class="font-medium text-brand hover:underline">
            {{ LEGAL.correoArco }}
          </a>
          o llame al {{ LEGAL.telefono }}.
        </p>
      </section>
    </article>

    <div class="mt-10 border-t border-gray-200 pt-6">
      <NuxtLink to="/terminos" class="text-sm font-medium text-brand hover:underline">
        {{ t('legal.termsLink') }} →
      </NuxtLink>
    </div>
  </div>
</template>
