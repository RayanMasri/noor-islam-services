import React from 'react';

import { IconButton } from '@mui/material';

import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';

const icons = {
	'facebook': <FacebookIcon sx={{ color: 'black ' }} />,
	'twitter': <TwitterIcon sx={{ color: 'black ' }} />,
	'instagram': <InstagramIcon sx={{ color: 'black ' }} />,
};

export default function SocialLink(props) {
	return (
		<IconButton
			style={{
				backgroundColor: 'white',
				...props.style,
			}}
		>
			{icons[props.icon]}
		</IconButton>
	);
}
