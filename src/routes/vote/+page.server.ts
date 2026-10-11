import { redirect } from '@sveltejs/kit';
import { isValidAccessCode, newViewerId, snapshot } from '#lib/server/appState.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ cookies }) => {
	const savedCode = cookies.get('yoinkit_code');

	if (!isValidAccessCode(savedCode)) {
		if (savedCode) cookies.delete('yoinkit_code', { path: '/' });
		redirect(303, '/');
	}

	let viewerId = cookies.get('yoinkit_viewer_id');
	if (!viewerId) {
		viewerId = newViewerId();
		cookies.set('yoinkit_viewer_id', viewerId, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 30
		});
	}

	return {
		state: snapshot(viewerId)
	};
};
