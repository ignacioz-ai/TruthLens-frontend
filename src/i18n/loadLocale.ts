import i18n from '../plugins/i18n'

/**
 * Dynamically loads a locale JSON file from /locales/ and sets it in the i18n instance.
 * @param locale The locale code to load (e.g., 'en', 'es', 'fr').
 */
export async function loadLocaleMessages(locale: string) {
  // If the locale is already loaded, just switch to it
  if (i18n.global.availableLocales.value.includes(locale)) {
    i18n.global.locale.value = locale
    return
  }
  // Fetch the JSON file from /locales/
  const messages = await fetch(`/locales/${locale}.json`).then(res => res.json())
  i18n.global.setLocaleMessage(locale, messages)
  i18n.global.locale.value = locale
} 