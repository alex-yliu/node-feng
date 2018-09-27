import { TranslationsConfig, Translations } from './model';
import Mustache from 'mustache';

export * from './model';

export const languages = ['af', 'sq', 'ar-sa', 'ar-iq', 'ar-eg', 'ar-lf', 'ar-dz', 'ar-ma', 'ar-tn', 'ar-om',
    'ar-ye', 'ar-sy', 'ar-jo', 'ar-lb', 'ar-kw', 'ar-ae', 'ar-bh', 'ar-qa', 'eu', 'bg',
    'be', 'ca', 'zh-tw', 'zh-cn', 'zh-hk', 'zh-sg', 'hr', 'cs', 'da', 'nl', 'nl-be', 'en',
    'en-us', 'en-eg', 'en-au', 'en-gb', 'en-ca', 'en-nz', 'en-ie', 'en-za', 'en-jm',
    'en-bz', 'en-tt', 'et', 'fo', 'fa', 'fi', 'fr', 'fr-be', 'fr-ca', 'fr-ch', 'fr-lu',
    'gd', 'gd-ie', 'de', 'de-ch', 'de-at', 'de-lu', 'de-li', 'el', 'he', 'hi', 'hu',
    'is', 'id', 'it', 'it-CH', 'ja', 'ko', 'lv', 'lt', 'mk', 'mt', 'no', 'pl',
    'pt-br', 'pt', 'rm', 'ro', 'ro-mo', 'ru', 'ru-mi', 'sz', 'sr', 'sk', 'sl', 'sb',
    'es', 'es-ar', 'es-gt', 'es-cr', 'es-pa', 'es-do', 'es-mx', 'es-ve', 'es-co',
    'es-pe', 'es-ec', 'es-cl', 'es-uy', 'es-py', 'es-bo', 'es-sv', 'es-hn', 'es-ni',
    'es-pr', 'sx', 'sv', 'sv-fi', 'th', 'ts', 'tn', 'tr', 'uk', 'ur', 've', 'vi', 'xh',
    'ji', 'zu'];

const languageConfig: TranslationsConfig = {
    defaultLang: 'en',
    translations: undefined,
};

export function config(translations: Translations, defaultLang: string = 'en'): boolean {
    if (languages.includes(defaultLang.toLowerCase()) !== true) {
        return false;
    }
    for (const key of Object.keys(translations)) {
        const translation = translations[key] as any;
        const phrase = translation[defaultLang.toLowerCase()];
        if (phrase == null) {
            return false;
        }
    }
    languageConfig.defaultLang = defaultLang.toLowerCase();
    languageConfig.translations = translations;
    return true;
}

function closestLanguage(lang: string): string {
    const language = lang.toLowerCase();
    if (languages.includes(language)) {
        return language;
    }
    const langParts = lang.split('-');
    while (langParts.length > 0) {
        langParts.pop();
        const tryLanguage = langParts.join('-');
        if (languages.includes(language)) {
            return language;
        }
    }
    return languageConfig.defaultLang;
}
export function translate(lang: string, phrase: string, params?: any): string {
    const language = closestLanguage(lang);
    const translationPhrase = languageConfig.translations[phrase];
    if (translationPhrase == null) {
        return phrase;
    }
    const template = (translationPhrase as any)[language];
    if (template == null) {
        return phrase;
    }
    return Mustache.render(template, params);

}