<script lang="ts">
	import ReactionChips from '#lib/components/ReactionChips.svelte';
	import VoteSlider from '#lib/components/VoteSlider.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const scale = $derived(
		Math.max(data.state.connectedViewers, data.state.speedVotes, data.state.yoinkVotes, 1)
	);
</script>

<main class="app-shell">
	<header class="topbar">
		<div class="brand">yoinkit</div>
		<div class="live-count">{data.state.connectedViewers} connected</div>
	</header>

	<section>
		<div class="label">NOW SHOWING</div>
		<h1 class="title"><span class="title-number">#{data.state.showNumber}</span> — {data.state.showName}</h1>
		<p class="subtitle">Audience voting is open</p>
	</section>

	<hr class="rule" />

	<section>
		<div class="section-top">
			<span class="label">REACTIONS</span>
			<span class="tiny">tap to react</span>
		</div>
		<ReactionChips />
	</section>

	<hr class="rule" />

	<section>
		<div class="section-top">
			<span class="label">LIVE RESULTS</span>
			<span class="tiny">{data.state.connectedViewers} people watching</span>
		</div>

		<div class="results">
			<div class="result speed">
				<div class="result-top">
					<span class="result-name">Speed up</span>
					<span class="result-count">{data.state.speedVotes}<small>votes</small></span>
				</div>
				<div class="meter"><div class="meter-fill" style={`width: ${(data.state.speedVotes / scale) * 100}%`}></div></div>
			</div>

			<div class="result yoink">
				<div class="result-top">
					<span class="result-name">Yoink it</span>
					<span class="result-count">{data.state.yoinkVotes}<small>votes</small></span>
				</div>
				<div class="meter"><div class="meter-fill" style={`width: ${(data.state.yoinkVotes / scale) * 100}%`}></div></div>
			</div>
		</div>
	</section>

	<hr class="rule before-vote" />

	<section>
		<div class="vote-heading">
			<span class="label">CAST YOUR VOTE</span>
			<span class="tiny">{data.state.votesLocked ? 'Votes are final' : 'Votes can be changed'}</span>
		</div>

		<VoteSlider name="Speed up" theme="speed" locked={data.state.votesLocked} />
		<VoteSlider
			name="Yoink it"
			theme="yoink"
			locked={data.state.votesLocked}
			disabled={!data.state.yoinkAvailable}
			disabledText="Yoink unlocks later"
		/>
		<p class="help-text">Slide each handle all the way to the right. You can vote for both.</p>
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
