import landingData from './landing-locale.json';

const references = {
	'/': landingData,
};

export default function useLocaleHook() {
	const switchLocale = (locale, page) => {
		let data = references[page][locale];

		document.querySelectorAll('[data-locale-key]').forEach((element) => {
			const key = element.getAttribute('data-locale-key');
			const translation = data[key];
			element.innerText = translation;
		});
	};

	const getLocaleKey = (locale, page, key) => {
		return references[page][locale][key];
	};

	return {
		switchLocale,
		getLocaleKey,
	};
}
