import { toHijri, toGregorian } from 'hijri-converter';

let weekdays_en = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
let weekdays_ar = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

const hijri_months = {
	'muharram': 'محرم',
	'safar': 'صفر',
	'rabi al-awal': 'ربيع الأول',
	'rabi al-thani': 'ربيع الثاني',
	'jumada al-awal': 'جمادى الأول',
	'jumada al-thani': 'جمادى الثاني',
	'rajab': 'رجب',
	'shaban': 'شعبان',
	'ramadan': 'رمضان',
	'shawwal': 'شوال',
	'dhu al-qaadah': 'ذو القعدة',
	'dhu al-hijjah': 'ذو الحجة',
};

const arabic_digits = { '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤', '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩' };

export default function useDateHook() {
	let { gy, gm, gd } = toGregorian(1444, 5, 5);
	// console.log(weekday_en[new Date(gy, gm - 1, gd).getDay()]);

	const compareDatesByDay = (a, b) => {
		return a.getDate() == b.getDate() && a.getMonth() == b.getMonth() && a.getYear() == b.getYear();
	};

	const objectFlip = (obj) => {
		const ret = {};
		Object.keys(obj).forEach((key) => {
			ret[obj[key]] = key;
		});
		return ret;
	};

	const getHijriDate = (day, month, year) => {
		let { gy, gm, gd } = toGregorian(year, month, day);
		return new Date(gy, gm - 1, gd);
	};

	const getHijriDateWeekDay = (day, month, year) => {
		// let { gy, gm, gd } = toGregorian(year, month, day);
		let date = getHijriDate(day, month, year);
		return {
			en: weekdays_en[date.getDay()],
			ar: weekdays_ar[date.getDay()],
		};
	};

	const fromEnToArWeekday = (weekday) => {
		return weekdays_ar[weekdays_en.findIndex((x) => x == weekday)];
	};
	const fromArToEnWeekday = (weekday) => {
		return weekdays_en[weekdays_ar.findIndex((x) => x == weekday)];
	};

	const fromEnToArInteger = (integer) => {
		return integer
			.toString()
			.split('')
			.map((digit) => arabic_digits[digit])
			.join('');
	};

	const hijriMonthEnToAr = (month) => {
		return hijri_months[month];
	};

	const hijriMonthArToEn = (month) => {
		return objectFlip(hijri_months)[month];
	};

	const getHijriMonthIndex = (month) => {
		return Object.keys(hijri_months).findIndex((x) => x == month) + 1;
	};

	return {
		getHijriDateWeekDay,
		fromEnToArWeekday,
		fromArToEnWeekday,
		fromEnToArInteger,
		hijriMonthEnToAr,
		getHijriMonthIndex,
		getHijriDate,
		hijriMonthArToEn,
		compareDatesByDay,
	};
}
