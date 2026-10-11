export type DemoState = {
	accessCode: string;
	showNumber: number;
	showName: string;
	connectedViewers: number;
	votesLocked: boolean;
	yoinkAvailable: boolean;
	yoinkDelayMinutes: number;
	speedVotes: number;
	yoinkVotes: number;
};

const configuredAccessCode = process.env.ACCESS_CODE;
const defaultAccessCode = configuredAccessCode && /^\d{3}$/.test(configuredAccessCode) ? configuredAccessCode : '123';

export const demoState: DemoState = {
	accessCode: defaultAccessCode,
	showNumber: 5,
	showName: 'The Show Name',
	connectedViewers: 12,
	votesLocked: true,
	yoinkAvailable: true,
	yoinkDelayMinutes: 0,
	speedVotes: 8,
	yoinkVotes: 3
};

export function adminPassword() {
	return process.env.ADMIN_PASSWORD || 'admin';
}

export function isValidAccessCode(value: string | undefined) {
	return value === demoState.accessCode;
}

export function isValidAdminPassword(value: string | undefined) {
	return value === adminPassword();
}
