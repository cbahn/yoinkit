import { error } from '@sveltejs/kit';
import {
	isValidAccessCode,
	isValidAdminPassword,
	snapshot,
	subscribe,
	viewerConnected,
	viewerDisconnected
} from '#lib/server/appState.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ cookies }) => {
	const viewerId = cookies.get('yoinkit_viewer_id');
	const audienceOk = isValidAccessCode(cookies.get('yoinkit_code')) && viewerId;
	const adminOk = isValidAdminPassword(cookies.get('yoinkit_admin'));

	if (!audienceOk && !adminOk) {
		error(401, 'Not authorized');
	}

	let cleanup = () => {};

	const stream = new ReadableStream({
		start(controller) {
			const encoder = new TextEncoder();
			const id = viewerId ?? 'admin';

			function send() {
				try {
					controller.enqueue(encoder.encode(`event: snapshot\ndata: ${JSON.stringify(snapshot(id))}\n\n`));
				} catch {
					cleanup();
				}
			}

			if (viewerId && audienceOk) viewerConnected(viewerId);
			send();

			const unsubscribe = subscribe(send);
			const heartbeat = setInterval(() => {
				try {
					controller.enqueue(encoder.encode(': heartbeat\n\n'));
				} catch {
					cleanup();
				}
			}, 15000);

			cleanup = () => {
				clearInterval(heartbeat);
				unsubscribe();
				if (viewerId && audienceOk) viewerDisconnected(viewerId);
			};
		},
		cancel() {
			cleanup();
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache, no-transform',
			Connection: 'keep-alive'
		}
	});
};
