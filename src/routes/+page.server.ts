import { fail, redirect } from '@sveltejs/kit';
import { isValidAccessCode } from '#lib/server/appState.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ cookies }) => {
	const savedCode = cookies.get('yoinkit_code');

	if (isValidAccessCode(savedCode)) {
		redirect(303, '/vote');
	}

	if (savedCode) {
		cookies.delete('yoinkit_code', { path: '/' });
	}

	return {};
};

export const actions: Actions = {
	join: async ({ request, cookies }) => {
		const form = await request.formData();
		const code = String(form.get('code') ?? '').trim();

		if (!/^\d{3}$/.test(code)) {
			return fail(400, { message: 'Enter the three-number room code.' });
		}

		if (!isValidAccessCode(code)) {
			cookies.delete('yoinkit_code', { path: '/' });
			return fail(401, { message: 'That code is not active.' });
		}

		cookies.set('yoinkit_code', code, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 12
		});

		redirect(303, '/vote');
	}
};
