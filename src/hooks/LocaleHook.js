import landingData from 'page-locales/landing-locale.json';
import barcodeData from 'page-locales/barcode-locale.json';

const references = {
	'/': landingData,
	'/barcode': barcodeData,
};

// TODO: Remove prefix of "landing-" in each item of landing-locale.json

export default function useLocaleHook() {
	const switchLocale = (locale, page) => {
		console.log(locale);
		console.log(page);
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
