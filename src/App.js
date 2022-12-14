import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import 'App.css';
// import { useMainContext } from './contexts/MainContext.jsx';
import Header from 'components/Header.js';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IconButton } from '@mui/material';
import Card from 'components/Card.js';
import ProductCard from 'components/ProductCard.js';
import SocialLink from 'components/SocialLink.js';

// provide better error by  using errorelement on route (react-router-dom ) for debugging on other devices
// for rtl, create different components, one for rtl and one for ltr
// take panaroma picture of school building standing in middle school gate corner and rotating forever for the arabic picture,
// and then take another picture starting from the corner of the high school gate corner and rotating forever
// add book download
// drag scroll

// TODO: fix custom-arabic font ال and ي (more important ي)
// TODO: organize css of each page
// TODO: remove logo from page previews
// TODO: update preview for schedule
// TODO: wrong domain fallback

// add something related to the school weekly schedule, like analyzing which class the teacher might be free so the student
// can go and talk to them, or each weekday's priority ? or something try

// controllable size for barcode printables & preview relative to original barcode image

export default function App() {
	const navigate = useNavigate();
	// let [main, setMain] = useMainContext();

	return (
		<div id='landing-page' className='page'>
			<div className='header-holder' style={{ width: '100%', boxSizing: 'border-box' }}>
				<Header />

				<div className='title-container'>
					<div
						style={{
							color: '#233262',
							fontFamily: 'segoeui',
							height: 'max-content',
						}}
						className='maintitle title'
					>
						<div>
							الخدمات الرقمية لمدارس
							<br />
							نور الإسلام الأهلية القسم الثانوي
						</div>
					</div>
					<div
						style={{
							color: '#233262',
							fontFamily: 'segoeui',
							height: 'max-content',
						}}
						className='subtitle title'
					>
						تسعى خدمات نور الإسلام الرقمية لتحسين تعليمك
					</div>
				</div>
			</div>

			<div
				id='services'
				style={{
					backgroundColor: '#537A5A',
					width: '100%',
					height: 'max-content',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					flexDirection: 'column',
				}}
			>
				<div
					style={{
						fontSize: '30px',
						fontFamily: 'custom-arabic',
						color: 'white',
					}}
				>
					الخدمات
				</div>
				<div
					id='cards'
					className='gridx2'
					style={{
						paddingTop: '10px',
						paddingBottom: '30px',
						width: '100%',
						height: 'max-content',
						// display: 'flex',
						// justifyContent: 'center',
						// flexDirection: 'column',
						// alignItems: 'center',
					}}
				>
					<Card
						showcase={require('./icons/barcode-showcase.svg').default}
						title='الحصول على بطاقة الباركود'
						description='قم بإنشاء الرمز الشريطي الخاص بك وطباعته فقط عن طريق إدخال رقم الهوية الخاص بك'
						onClick={() => navigate('/barcode')}
						className='service-card'
					/>

					<Card
						showcase={require('./icons/committee-showcase.svg').default}
						title='تعرف على معلومات لجنتك'
						description='قم بعرض وطباعة جميع المعلومات المتعلقة باللجنة عن طريق إدخال رقم هويتك'
						onClick={() => navigate('/committee-researcher')}
						className='service-card'
					/>
					<Card
						showcase={require('./icons/barcode-showcase.svg').default}
						title='عرض قائمة طلاب اللجنة'
						description='عرض القائمة الكاملة للطلاب في كل لجنة أو منطقة مع إمكانات البحث'
						onClick={() => navigate('/committee-list')}
						className='service-card'
					/>

					<Card
						showcase={require('./icons/schedule-showcase.svg').default}
						title='تعرف على التقويم الدراسي'
						description='عرض الجدول الزمني الكامل لهذا العام بما في ذلك إجازات الأسبوع القصيرة والأعياد '
						onClick={() => navigate('/schedule')}
						className='service-card'
					/>
					{/* <div>
						<Card
							showcase={require('./icons/barcode-showcase.svg').default}
							title='الحصول على بطاقة الباركود'
							description='قم بإنشاء الرمز الشريطي الخاص بك وطباعته فقط عن طريق إدخال رقم الهوية الخاص بك'
							onClick={() => navigate('/barcode')}
							className='service-card'
						/>

						<Card
							showcase={require('./icons/committee-showcase.svg').default}
							title='تعرف على معلومات لجنتك'
							description='قم بعرض وطباعة جميع المعلومات المتعلقة باللجنة عن طريق إدخال رقم هويتك'
							onClick={() => navigate('/committee-researcher')}
							className='service-card'
						/>
					</div>
					<div>
						<Card
							showcase={require('./icons/barcode-showcase.svg').default}
							title='عرض قائمة طلاب اللجنة'
							description='عرض القائمة الكاملة للطلاب في كل لجنة أو منطقة مع إمكانات البحث'
							onClick={() => navigate('/committee-list')}
							className='service-card'
						/>

						<Card
							showcase={require('./icons/schedule-showcase.svg').default}
							title='تعرف على التقويم الدراسي'
							description='عرض الجدول الزمني الكامل لهذا العام بما في ذلك إجازات الأسبوع القصيرة والأعياد '
							onClick={() => navigate('/schedule')}
							className='service-card'
						/>
					</div> */}
				</div>
			</div>

			<div
				style={{
					backgroundColor: '#537A5A',
					width: '100%',
					height: 'max-content',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					flexDirection: 'column',
				}}
				className='gradient-background'
			>
				<div
					style={{
						fontSize: '30px',
						fontFamily: 'custom-arabic',
						color: '#537A5A',
						marginTop: '10px',
						marginBottom: '10px',
					}}
				>
					منتجات أخرى
				</div>
				<div
					style={{
						paddingTop: '10px',
						paddingBottom: '30px',
						width: '100%',
						height: 'max-content',
					}}
					className='product-cards'
				>
					<ProductCard className='product-card' />
					<ProductCard className='product-card' />
				</div>

				<div
					style={{
						width: '100%',
						display: 'flex',
						flexDirection: 'row',
						justifyContent: 'center',
						alignItems: 'center',
						marginBottom: '15px',
					}}
				>
					<img
						src={require('./icons/maarif-logo.svg').default}
						height='32px'
						style={{
							marginRight: '15px',
						}}
					></img>
					<img src={require('./icons/vision.svg').default} height='32px'></img>
				</div>
			</div>

			<div
				style={{
					width: '100%',
					backgroundColor: 'black',
					paddingTop: '15px',
					paddingBottom: '15px',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					flexDirection: 'row',
				}}
			>
				<SocialLink
					icon='facebook'
					style={{
						marginRight: '15px',
					}}
				/>
				<SocialLink
					icon='twitter'
					style={{
						marginRight: '15px',
					}}
				/>
				<SocialLink icon='instagram' />
			</div>
		</div>
	);
}
