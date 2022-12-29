import landingData from 'page-locales/landing-locale.json';
import barcodeData from 'page-locales/barcode-locale.json';
import committeeResearcherData from 'page-locales/committee-researcher-locale.json';
import scheduleData from 'page-locales/schedule-locale.json';
import committeeListData from 'page-locales/committee-list-locale.json';

import { useMainContext } from 'contexts/MainContext';

const references = {
	'/': landingData,
	'/barcode': barcodeData,
	'/committee-researcher': committeeResearcherData,
	'/schedule': scheduleData,
	'/committee-list': committeeListData,
};

// TODO: Remove prefix of "landing-" in each item of landing-locale.json

export default function useLocaleHook() {
	const { main } = useMainContext();

	const switchLocale = (locale, page) => {
		console.log(locale);
		console.log(page);
		let data = references[page][locale];
		console.log(data);

		document.querySelectorAll('[data-locale-key]').forEach((element) => {
			console.log(element);
			const key = element.getAttribute('data-locale-key');
			const translation = data[key];
			element.innerText = translation;
		});
	};

	const getLocaleKey = (locale, page, key) => {
		return references[page][locale][key];
	};

	const getLocaleKeyAuto = (page, key) => {
		return references[page][main.language][key];
	};

	return {
		switchLocale,
		getLocaleKey,
		getLocaleKeyAuto,
	};
}
