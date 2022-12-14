import React from 'react';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';

export default function SearchBar(props) {
	return (
		<Paper sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'row', width: '100%', border: '1px solid #707070' }}>
			<InputBase
				sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', textAlign: 'right', width: '100%' }}
				placeholder='البحث'
				inputProps={{
					sx: {
						textAlign: 'right',
						fontFamily: 'Arial',
						dir: 'rtl',
						direction: 'RTL',
						unicodeBidi: 'bidi-override',
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
