import { error, json } from '@sveltejs/kit';
import { isValidAccessCode, setVote, snapshot, type VoteCategory } from '#lib/server/appState.js';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const viewerId = cookies.get('yoinkit_viewer_id');
	if (!viewerId || !isValidAccessCode(cookies.get('yoinkit_code'))) {
		error(401, 'Not authorized');
	}

	const body = await request.json().catch(() => ({}));
	const category = body.category as VoteCategory;
	const active = Boolean(body.active);

	if (category !== 'speed' && category !== 'yoink') {
		error(400, 'Unknown vote category');
	}

	setVote(viewerId, category, active);
	return json(snapshot(viewerId));
};
