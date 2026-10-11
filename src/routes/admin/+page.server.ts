import { fail } from '@sveltejs/kit';
import { demoState, isValidAdminPassword } from '#lib/server/appState.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ cookies }) => {
	const adminCookie = cookies.get('yoinkit_admin');
	const authed = isValidAdminPassword(adminCookie);

	if (adminCookie && !authed) {
		cookies.delete('yoinkit_admin', { path: '/' });
	}

	return {
		authed,
		state: demoState
	};
};

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const form = await request.formData();
		const password = String(form.get('password') ?? '');

		if (!isValidAdminPassword(password)) {
			cookies.delete('yoinkit_admin', { path: '/' });
			return fail(401, { message: 'Admin password did not match.' });
		}

		cookies.set('yoinkit_admin', password, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 12
		});

		return { ok: true };
	},

	logout: async ({ cookies }) => {
		cookies.delete('yoinkit_admin', { path: '/' });
		return { ok: true };
	},

	saveSettings: async ({ request, cookies }) => {
		if (!isValidAdminPassword(cookies.get('yoinkit_admin'))) {
			return fail(401, { message: 'Please log in again.' });
		}

		const form = await request.formData();
		const accessCode = String(form.get('accessCode') ?? '').trim();
		const showName = String(form.get('showName') ?? '').trim();
		const yoinkDelayMinutes = Number(form.get('yoinkDelayMinutes') ?? 0);

		if (!/^\d{3}$/.test(accessCode)) {
			return fail(400, { message: 'The audience code must be exactly three numbers.' });
		}

		demoState.accessCode = accessCode;
		demoState.showName = showName || 'Untitled Show';
		demoState.votesLocked = form.get('votesLocked') === 'on';
		demoState.yoinkDelayMinutes = Math.max(0, yoinkDelayMinutes || 0);
		demoState.yoinkAvailable = demoState.yoinkDelayMinutes === 0 || form.get('yoinkAvailable') === 'on';

		return { message: 'Settings saved for this local demo.' };
	},

	startShow: async ({ request, cookies }) => {
		if (!isValidAdminPassword(cookies.get('yoinkit_admin'))) {
			return fail(401, { message: 'Please log in again.' });
		}

		const form = await request.formData();
		const showName = String(form.get('showName') ?? '').trim();
		demoState.showNumber += 1;
		demoState.showName = showName || 'Untitled Show';
		demoState.speedVotes = 0;
		demoState.yoinkVotes = 0;
		demoState.votesLocked = form.get('votesLocked') === 'on';
		demoState.yoinkDelayMinutes = Math.max(0, Number(form.get('yoinkDelayMinutes') ?? 0) || 0);
		demoState.yoinkAvailable = demoState.yoinkDelayMinutes === 0;

		return { message: `Started show #${demoState.showNumber}.` };
	},

	resetVotes: async ({ cookies }) => {
		if (!isValidAdminPassword(cookies.get('yoinkit_admin'))) {
			return fail(401, { message: 'Please log in again.' });
		}

		demoState.speedVotes = 0;
		demoState.yoinkVotes = 0;
		demoState.votesLocked = false;

		return { message: 'Votes reset. Vote changes are now allowed.' };
	},

	unlockYoink: async ({ cookies }) => {
		if (!isValidAdminPassword(cookies.get('yoinkit_admin'))) {
			return fail(401, { message: 'Please log in again.' });
		}

		demoState.yoinkAvailable = true;
		return { message: 'Yoink is available now.' };
	}
};
