import React from 'react';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';

import useLocaleHook from 'hooks/LocaleHook';

export default function SearchBar(props) {
	const { getLocaleKeyAuto } = useLocaleHook();

	return (
		<Paper
			sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexDirection: props.direction == 'rtl' ? 'row' : 'row-reverse', width: '100%', border: '1px solid #707070' }}
		>
			<InputBase
				sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', width: '100%' }}
				placeholder={getLocaleKeyAuto('/committee-list', 'search-bar')}
				inputProps={{
					sx: {
						textAlign: props.direction == 'rtl' ? 'right' : 'left',
						fontFamily: 'Arial',
						dir: props.direction,
						direction: props.direction.toUpperCase(),
						unicodeBidi: props.direction == 'rtl' ? 'bidi-override' : 'normal',
					},
				}}
				onChange={props.onChange}
				value={props.value}
			/>

			<IconButton type='button' sx={{ p: '10px' }} aria-label='search'>
				<SearchIcon />
			</IconButton>
		</Paper>
	);
}
