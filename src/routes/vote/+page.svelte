<script lang="ts">
	import { onMount } from 'svelte';
	import ReactionChips from '#lib/components/ReactionChips.svelte';
	import VoteSlider from '#lib/components/VoteSlider.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let snapshotState = $state<PageData['state']>(data.state);
	let pendingVote = $state('');
	let pendingReaction = $state('');

	const scale = $derived(Math.max(snapshotState.connectedViewers, snapshotState.speedVotes, snapshotState.yoinkVotes, 1));
	const showTitle = $derived(snapshotState.showName || '');

	onMount(() => {
		const events = new EventSource('/api/events');
		events.addEventListener('snapshot', (event) => {
			snapshotState = JSON.parse((event as MessageEvent).data);
			pendingVote = '';
			pendingReaction = '';
		});

		return () => events.close();
	});

	async function setVote(category: 'speed' | 'yoink', active: boolean) {
		pendingVote = category;
		const response = await fetch('/api/vote', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ category, active })
		});
		if (response.ok) {
			snapshotState = await response.json();
		}
		pendingVote = '';
	}

	async function setReaction(id: string, active: boolean) {
		pendingReaction = id;
		const response = await fetch('/api/reaction', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id, active })
		});
		if (response.ok) {
			snapshotState = await response.json();
		}
		pendingReaction = '';
	}
</script>

<main class="app-shell">
	<header class="topbar">
		<div class="brand">yoinkit</div>
		<div class="live-count">{snapshotState.connectedViewers} connected</div>
	</header>

	<section>
		<h1 class="title"><span class="title-number">#{snapshotState.showNumber}</span> — {showTitle}</h1>
		<ReactionChips
			reactions={snapshotState.reactions}
			mine={snapshotState.mine.reactions}
			pendingId={pendingReaction}
			onToggle={setReaction}
		/>
	</section>


	<hr class="rule" />

	<section>
		<div class="results">
			<div class="result speed">
				<div class="result-top">
					<span class="result-name">Speed up</span>
					<span class="result-count">{snapshotState.speedVotes}<small>votes</small></span>
				</div>
				<div class="meter"><div class="meter-fill" style={`width: ${(snapshotState.speedVotes / scale) * 100}%`}></div></div>
			</div>

			<div class="result yoink">
				<div class="result-top">
					<span class="result-name">Yoink it</span>
					<span class="result-count">{snapshotState.yoinkVotes}<small>votes</small></span>
				</div>
				<div class="meter"><div class="meter-fill" style={`width: ${(snapshotState.yoinkVotes / scale) * 100}%`}></div></div>
			</div>
		</div>
	</section>

	<hr class="rule before-vote" />

	<section>
		<div class="vote-heading">
			<span class="label">{snapshotState.votesLocked ? 'VOTES CAN\'T BE TAKEN BACK' : 'VOTES CAN BE CHANGED'}</span>
		</div>

		{#key snapshotState.revision}
			<VoteSlider
				name="Speed up"
				theme="speed"
				locked={snapshotState.votesLocked}
				voted={snapshotState.mine.speed}
				pending={pendingVote === 'speed'}
				onVote={(active) => setVote('speed', active)}
			/>
			<VoteSlider
				name="Yoink it"
				theme="yoink"
				locked={snapshotState.votesLocked}
				voted={snapshotState.mine.yoink}
				pending={pendingVote === 'yoink'}
				disabled={!snapshotState.yoinkAvailable}
				disabledText="Yoink unlocks later"
				onVote={(active) => setVote('yoink', active)}
			/>
		{/key}
	</section>
</main>

<style>
	.results {
		display: grid;
		gap: 18px;
	}

	.result {
		--accent: var(--speed);
	}

	.result.yoink {
		--accent: var(--yoink);
	}

	.result-top {
		margin-bottom: 10px;
	}

	.result-name {
		font-size: 15px;
		font-weight: 500;
		color: #e0e5df;
	}

	.result-count {
		font-variant-numeric: tabular-nums;
		font-size: 16px;
		font-weight: 600;
	}

	.result-count small {
		margin-left: 6px;
		color: #7f8d86;
		font-size: 11px;
		font-weight: 400;
	}

	.meter {
		height: 6px;
		overflow: hidden;
		border-radius: 10px;
		background: var(--line);
	}

	.meter-fill {
		height: 100%;
		border-radius: 10px;
		background: var(--accent);
		transition: width 0.25s ease;
	}

	.before-vote {
		margin-top: 30px;
		margin-bottom: 24px;
	}

	.vote-heading {
		margin-bottom: 19px;
	}
</style>
