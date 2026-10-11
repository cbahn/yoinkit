import { redirect } from '@sveltejs/kit';
import { demoState, isValidAccessCode } from '#lib/server/appState.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ cookies }) => {
	const savedCode = cookies.get('yoinkit_code');

	if (!isValidAccessCode(savedCode)) {
		if (savedCode) cookies.delete('yoinkit_code', { path: '/' });
		redirect(303, '/');
	}

	return {
		state: demoState
	};
};
