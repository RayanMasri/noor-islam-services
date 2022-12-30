import React, { useState, useRef } from 'react';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IconButton } from '@mui/material';

export default function Card(props) {
	return (
		<div
			style={{
				position: 'relative',
				height: 'max-content',
				borderRadius: '15px',
				overflow: 'hidden',
				...props.style,
			}}
			className={props.className}
		>
			<div
				style={{
					position: 'relative',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
				}}
				className='card-showcase'
			>
				<div
					style={{
						width: '100%',
						height: '100%',
						backgroundColor: 'white',
					}}
				>
					<img
						style={{
							position: 'absolute',
						}}
						src={props.showcase}
						width='100%'
						height='100%'
					/>
				</div>

				{/* <div
      style={{
      	height: '100%',
      	width: '100%',
      	position: 'absolute',
      	backgroundColor: 'red',
      }}
      >
      hi
      </div> */}
				<div
					style={{
						height: '100%',
						width: '100%',
						position: 'absolute',
					}}
					className='card-glass-component'
				></div>
			</div>

			<div
				style={{
					width: '100%',
					backgroundColor: 'white',
					boxSizing: 'border-box',
					fontFamily: 'arabic',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'flex-start',
					position: 'relative',
				}}
				className={props.language == 'ar' ? 'card-info-holder' : 'card-info-holder-en'}
			>
				<div className='info-title'>{props.title}</div>
				<div style={{}} className='description'>
					{props.description}
				</div>

				<IconButton
					style={{
						position: 'absolute',
						bottom: 0,
					}}
					className={props.language == 'ar' ? 'card-arrow-button' : 'card-arrow-button-en'}
					onClick={props.onClick}
				>
					<ArrowBackIcon
						sx={{
							color: '#D68C45',
						}}
						className='card-arrow-icon'
					/>
				</IconButton>
			</div>
		</div>
	);
}
