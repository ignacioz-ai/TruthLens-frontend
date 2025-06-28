import i18n from '../plugins/i18n'

/**
 * Dynamically loads a locale JSON file from /locales/ and sets it in the i18n instance.
 * @param locale The locale code to load (e.g., 'en', 'es', 'fr').
 */
export async function loadLocaleMessages(locale: string) {
  try {
    // Log de inicio
    console.log('[i18n] Solicitando idioma:', locale);

    // Si ya está cargado
    if (i18n.global.availableLocales.value.includes(locale)) {
      i18n.global.locale.value = locale;
      console.log('[i18n] Idioma ya cargado, cambiando a:', locale);
      return;
    }

    // Fetch del JSON
    const response = await fetch(`/locales/${locale}.json`);
    console.log('[i18n] Respuesta fetch:', response);

    if (!response.ok) {
      console.error('[i18n] Error al obtener el archivo de idioma:', response.status, response.statusText);
      return;
    }

    const messages = await response.json();
    console.log('[i18n] Mensajes cargados para', locale, messages);

    i18n.global.setLocaleMessage(locale, messages);
    // Forzar refresco del idioma
    i18n.global.locale.value = '';
    i18n.global.locale.value = locale;
    console.log('[i18n] Idioma activo ahora:', i18n.global.locale.value);
    console.log('[i18n] Locales disponibles:', i18n.global.availableLocales.value);
    console.log('[i18n] Ejemplo de traducción landing.hero.title:', i18n.global.t('landing.hero.title'));
  } catch (e) {
    console.error('[i18n] Error inesperado al cargar idioma', locale, e);
  }
} 