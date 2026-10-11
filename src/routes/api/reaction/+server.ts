import { error, json } from '@sveltejs/kit';
import { isValidAccessCode, setReaction, snapshot } from '#lib/server/appState.js';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const viewerId = cookies.get('yoinkit_viewer_id');
	if (!viewerId || !isValidAccessCode(cookies.get('yoinkit_code'))) {
		error(401, 'Not authorized');
	}

	const body = await request.json().catch(() => ({}));
	const id = String(body.id ?? '');
	const active = Boolean(body.active);

	setReaction(viewerId, id, active);
	return json(snapshot(viewerId));
};
