import { reactionCatalog } from '#lib/reactions.js';

export type VoteCategory = 'speed' | 'yoink';

export type PublicSnapshot = {
	accessCode: string;
	showNumber: number;
	showName: string;
	connectedViewers: number;
	votesLocked: boolean;
	yoinkAvailable: boolean;
	yoinkDelayMinutes: number;
	speedVotes: number;
	yoinkVotes: number;
	revision: number;
	reactions: { id: string; count: number }[];
	mine: {
		speed: boolean;
		yoink: boolean;
		reactions: string[];
	};
};

type AppState = {
	accessCode: string;
	showNumber: number;
	showName: string;
	votesLocked: boolean;
	yoinkAvailable: boolean;
	yoinkDelayMinutes: number;
	revision: number;
	speedVoters: Set<string>;
	yoinkVoters: Set<string>;
	reactions: Map<string, Set<string>>;
	streamsByViewer: Map<string, number>;
};

const configuredAccessCode = process.env.ACCESS_CODE;
const defaultAccessCode = configuredAccessCode && /^\d{3}$/.test(configuredAccessCode) ? configuredAccessCode : '123';

const state: AppState = {
	accessCode: defaultAccessCode,
	showNumber: 0,
	showName: '',
	votesLocked: true,
	yoinkAvailable: true,
	yoinkDelayMinutes: 0,
	revision: 1,
	speedVoters: new Set(),
	yoinkVoters: new Set(),
	reactions: new Map(),
	streamsByViewer: new Map()
};

type Subscriber = () => void;
const subscribers = new Set<Subscriber>();

export const demoState = state;

export function adminPassword() {
	return process.env.ADMIN_PASSWORD || 'admin';
}

export function isValidAccessCode(value: string | undefined) {
	return value === state.accessCode;
}

export function isValidAdminPassword(value: string | undefined) {
	return value === adminPassword();
}

export function newViewerId() {
	return crypto.randomUUID();
}

export function bumpRevision() {
	state.revision += 1;
	broadcast();
}

export function subscribe(callback: Subscriber) {
	subscribers.add(callback);
	return () => subscribers.delete(callback);
}

export function broadcast() {
	for (const subscriber of subscribers) {
		subscriber();
	}
}

export function viewerConnected(viewerId: string) {
	state.streamsByViewer.set(viewerId, (state.streamsByViewer.get(viewerId) ?? 0) + 1);
	broadcast();
}

export function viewerDisconnected(viewerId: string) {
	const next = (state.streamsByViewer.get(viewerId) ?? 1) - 1;
	if (next <= 0) {
		state.streamsByViewer.delete(viewerId);
	} else {
		state.streamsByViewer.set(viewerId, next);
	}
	broadcast();
}

export function snapshot(viewerId = ''): PublicSnapshot {
	return {
		accessCode: state.accessCode,
		showNumber: state.showNumber,
		showName: state.showName,
		connectedViewers: state.streamsByViewer.size,
		votesLocked: state.votesLocked,
		yoinkAvailable: state.yoinkAvailable,
		yoinkDelayMinutes: state.yoinkDelayMinutes,
		speedVotes: state.speedVoters.size,
		yoinkVotes: state.yoinkVoters.size,
		revision: state.revision,
		reactions: reactionCatalog
			.map((reaction) => ({ id: reaction.id, count: state.reactions.get(reaction.id)?.size ?? 0 }))
			.filter((reaction) => reaction.count > 0),
		mine: {
			speed: state.speedVoters.has(viewerId),
			yoink: state.yoinkVoters.has(viewerId),
			reactions: reactionCatalog
				.filter((reaction) => state.reactions.get(reaction.id)?.has(viewerId))
				.map((reaction) => reaction.id)
		}
	};
}

export function setVote(viewerId: string, category: VoteCategory, active: boolean) {
	const voters = category === 'speed' ? state.speedVoters : state.yoinkVoters;

	if (active && category === 'yoink' && !state.yoinkAvailable) return;
	if (!active && state.votesLocked) return;

	if (active) {
		voters.add(viewerId);
	} else {
		voters.delete(viewerId);
	}
	bumpRevision();
}

export function setReaction(viewerId: string, reactionId: string, active: boolean) {
	if (!reactionCatalog.some((reaction) => reaction.id === reactionId)) return;

	const viewers = state.reactions.get(reactionId) ?? new Set<string>();
	if (active) {
		viewers.add(viewerId);
	} else {
		viewers.delete(viewerId);
	}

	if (viewers.size === 0) {
		state.reactions.delete(reactionId);
	} else {
		state.reactions.set(reactionId, viewers);
	}
	bumpRevision();
}

export function startShow(showName: string, votesLocked: boolean, yoinkDelayMinutes: number) {
	state.showNumber += 1;
	state.showName = showName || 'Untitled Show';
	state.votesLocked = votesLocked;
	state.yoinkDelayMinutes = Math.max(0, yoinkDelayMinutes || 0);
	state.yoinkAvailable = state.yoinkDelayMinutes === 0;
	state.speedVoters.clear();
	state.yoinkVoters.clear();
	state.reactions.clear();
	bumpRevision();
}

export function resetVotes() {
	state.speedVoters.clear();
	state.yoinkVoters.clear();
	state.votesLocked = false;
	bumpRevision();
}
