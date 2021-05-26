import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
const resources = {
    en: {
        translation: {
            doudizhu: {
                ai_hand_faceup: 'AI Hand Face-Up',
                play_as_landlord: 'Play As Landlord',
                play_as_peasant: 'Play As Peasant',
                landlord_up: 'Landlord Up',
                landlord_down: 'Landlord Down',
            },
        },
    },
    zh: {
        translation: {
            doudizhu: {
                ai_hand_faceup: '显示AI手牌',
                play_as_landlord: '扮演地主',
                play_as_peasant: '扮演农民',
                landlord_up: '地主上家',
                landlord_down: '地主下家',
            },
        },
    },
};

i18n.use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources,
        lng: localStorage.getItem('LOCALE') || 'en', // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
        // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage

        interpolation: {
            escapeValue: false, // react already safes from xss
        },
    });

export default i18n;
