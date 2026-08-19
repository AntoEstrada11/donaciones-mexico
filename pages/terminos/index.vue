<script setup lang="ts">
const { t } = useI18n()

useHead({
  title: 'Términos de uso — Donaciones Iglesia Universal México',
  meta: [
    {
      name: 'description',
      content: 'Términos y condiciones de uso del sitio de donaciones de la Iglesia Universal del Reino de Dios en México.',
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
        {{ t('legal.termsTitle') }}
      </h1>
      <p class="mt-2 text-sm text-gray-500">
        {{ t('legal.lastUpdate', { date: LEGAL.noticeDate, version: LEGAL.noticeVersion }) }}
      </p>
    </header>

    <article class="space-y-8 text-sm leading-relaxed text-gray-700">
      <section>
        <h2 class="mb-2 text-lg font-bold text-ink">
          1. Aceptación
        </h2>
        <p>
          Este sitio es operado por <strong>{{ LEGAL.razonSocial }}</strong>. Al crear una cuenta o
          registrar un donativo, usted acepta estos términos y el
          <NuxtLink to="/privacidad" class="text-brand hover:underline">
            aviso de privacidad
          </NuxtLink>.
          Si no está de acuerdo, le pedimos no utilizar el sitio.
        </p>
      </section>

      <section>
        <h2 class="mb-2 text-lg font-bold text-ink">
          2. Naturaleza del donativo
        </h2>
        <p>
          Los aportes realizados a través de este sitio son <strong>donativos voluntarios</strong>
          destinados al sostenimiento de la obra de la Iglesia. No constituyen la compra de un bien
          ni la contratación de un servicio, y no otorgan derecho a contraprestación alguna.
        </p>
        <p class="mt-3">
          Por su naturaleza, los donativos <strong>no son reembolsables</strong>. Si detecta un cargo
          duplicado, un monto incorrecto o cualquier otra irregularidad, escríbanos a
          {{ LEGAL.correoArco }} o llame al {{ LEGAL.telefono }} para revisar el caso y, cuando
          proceda, corregirlo.
        </p>
      </section>

      <section>
        <h2 class="mb-2 text-lg font-bold text-ink">
          3. Su cuenta
        </h2>
        <ul class="mt-2 list-disc space-y-1 pl-5">
          <li>Debe ser mayor de edad y tener capacidad legal para donar.</li>
          <li>La información que proporcione debe ser veraz, completa y actualizada.</li>
          <li>Es responsable de mantener la confidencialidad de su contraseña y de la actividad realizada desde su cuenta.</li>
          <li>Avísenos de inmediato si sospecha de un acceso no autorizado.</li>
          <li>Puede eliminar su cuenta en cualquier momento desde su perfil.</li>
        </ul>
      </section>

      <section>
        <h2 class="mb-2 text-lg font-bold text-ink">
          4. Comprobantes fiscales
        </h2>
        <p>
          Si desea un recibo deducible de impuestos, deberá indicarlo y proporcionar sus datos
          fiscales completos y correctos. La emisión del comprobante está sujeta a que la Iglesia
          cuente con la autorización vigente correspondiente y a que los datos proporcionados
          coincidan con los registrados ante el Servicio de Administración Tributaria. Los datos
          fiscales son opcionales: puede donar sin proporcionarlos.
        </p>
      </section>

      <section>
        <h2 class="mb-2 text-lg font-bold text-ink">
          5. Uso permitido
        </h2>
        <p>Al usar este sitio usted se compromete a no:</p>
        <ul class="mt-2 list-disc space-y-1 pl-5">
          <li>Suplantar la identidad de otra persona o usar datos que no le pertenecen.</li>
          <li>Intentar vulnerar la seguridad del sitio o acceder a cuentas ajenas.</li>
          <li>Automatizar peticiones de forma que degrade el servicio.</li>
          <li>Utilizar el sitio para fines ilícitos, incluida la simulación de operaciones.</li>
        </ul>
        <p class="mt-3">
          Podemos suspender o cancelar el acceso de quien incumpla estos términos.
        </p>
      </section>

      <section>
        <h2 class="mb-2 text-lg font-bold text-ink">
          6. Seguridad en los pagos
        </h2>
        <p>
          Cuando done por transferencia SPEI, verifique siempre que el nombre del beneficiario
          coincida con <strong>{{ LEGAL.razonSocial }}</strong>. La Iglesia
          <strong>nunca</strong> le solicitará su NIP, contraseñas bancarias ni códigos de
          verificación por teléfono, correo o mensajería. Desconfíe de cualquier persona que lo
          haga.
        </p>
      </section>

      <section>
        <h2 class="mb-2 text-lg font-bold text-ink">
          7. Disponibilidad y limitación de responsabilidad
        </h2>
        <p>
          Procuramos que el sitio esté disponible de forma continua, pero puede haber interrupciones
          por mantenimiento, fallas técnicas o causas ajenas a nosotros. El directorio de iglesias se
          alimenta de una fuente externa y puede contener información desactualizada. No somos
          responsables por daños derivados del uso del sitio, salvo en los casos en que la ley no
          permita esa limitación.
        </p>
      </section>

      <section>
        <h2 class="mb-2 text-lg font-bold text-ink">
          8. Cambios y ley aplicable
        </h2>
        <p>
          Podemos actualizar estos términos; la versión vigente será siempre la publicada en esta
          página. Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Para
          cualquier controversia, las partes se someten a los tribunales competentes de la Ciudad de
          México, renunciando a cualquier otro fuero.
        </p>
      </section>

      <section class="rounded-lg border border-gray-200 bg-gray-50 p-5">
        <h2 class="mb-2 text-lg font-bold text-ink">
          Contacto
        </h2>
        <p>
          <a :href="`mailto:${LEGAL.correoArco}`" class="font-medium text-brand hover:underline">
            {{ LEGAL.correoArco }}
          </a>
          · {{ LEGAL.telefono }}
        </p>
      </section>
    </article>

    <div class="mt-10 border-t border-gray-200 pt-6">
      <NuxtLink to="/privacidad" class="text-sm font-medium text-brand hover:underline">
        {{ t('legal.privacyLink') }} →
      </NuxtLink>
    </div>
  </div>
</template>
