<script lang="ts">
	type Props = {
		name: string;
		theme: 'speed' | 'yoink';
		locked: boolean;
		disabled?: boolean;
		disabledText?: string;
	};

	let { name, theme, locked, disabled = false, disabledText = 'Not available yet' }: Props = $props();

	let track = $state<HTMLDivElement>();
	let thumb = $state<HTMLButtonElement>();
	let distance = $state(1);
	let dragging = $state(false);
	let voted = $state(false);
	let percent = $state(0);
	let pointerId = $state<number | null>(null);

	const canRemove = $derived(voted && !locked);
	const complete = $derived(voted || percent >= 1);

	function updateDistance() {
		if (track && thumb) {
			distance = Math.max(1, track.clientWidth - thumb.offsetWidth - 8);
		}
	}

	function setPercent(value: number) {
		percent = Math.max(0, Math.min(1, value));
	}

	function percentFromPointer(event: PointerEvent) {
		if (!track || !thumb) return 0;
		const rect = track.getBoundingClientRect();
		updateDistance();
		return (event.clientX - rect.left - 4 - thumb.offsetWidth / 2) / distance;
	}

	function start(event: PointerEvent) {
		if (disabled || voted) return;
		if (event.button !== 0 && event.pointerType === 'mouse') return;

		event.preventDefault();
		dragging = true;
		pointerId = event.pointerId;
		thumb?.setPointerCapture(event.pointerId);
		setPercent(percentFromPointer(event));
	}

	function move(event: PointerEvent) {
		if (!dragging || event.pointerId !== pointerId) return;
		setPercent(percentFromPointer(event));
	}

	function finish(event: PointerEvent, submit = true) {
		if (!dragging || event.pointerId !== pointerId) return;

		dragging = false;
		pointerId = null;

		if (submit && percent >= 0.86) {
			voted = true;
			percent = 1;
		} else {
			percent = 0;
		}

		if (thumb?.hasPointerCapture(event.pointerId)) {
			thumb.releasePointerCapture(event.pointerId);
		}
	}

	function removeVote() {
		voted = false;
		percent = 0;
	}
</script>

<div class="vote-block {theme}">
	<div class="vote-caption">
		<strong>{name}</strong>
		{#if canRemove}
			<button type="button" class="withdraw" onclick={removeVote}>Remove vote</button>
		{/if}
	</div>

	{#if disabled}
		<div class="disabled-slider">{disabledText}</div>
	{:else}
		<div
			bind:this={track}
			class:dragging
			class:complete
			class="slider"
			style={`--p: ${complete ? 1 : percent}; --dx: ${complete ? distance : distance * percent}px`}
		>
			<div class="fill"></div>
			<span class="slide-text">{voted ? 'Vote recorded' : 'Slide to vote →'}</span>
			<button
				bind:this={thumb}
				type="button"
				class="thumb"
				role="slider"
				aria-label={`Slide to vote ${name}`}
				aria-valuemin="0"
				aria-valuemax="100"
				aria-valuenow={Math.round((complete ? 1 : percent) * 100)}
				onpointerdown={start}
				onpointermove={move}
				onpointerup={finish}
				onpointercancel={(event) => finish(event, false)}
			>
				→
			</button>
		</div>
	{/if}
</div>

<style>
	.vote-block {
		margin-bottom: 20px;
		--accent: var(--speed);
		--accent-ink: var(--speed-ink);
		--soft: var(--speed-soft);
	}

	.vote-block.yoink {
		--accent: var(--yoink);
		--accent-ink: var(--yoink-ink);
		--soft: var(--yoink-soft);
	}

	.vote-caption {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		margin-bottom: 10px;
	}

	.vote-caption strong {
		font-size: 15px;
		font-weight: 550;
		color: #e0e5e0;
	}

	.withdraw {
		padding: 3px 0;
		border: 0;
		background: transparent;
		color: #a3b2aa;
		font-size: 12px;
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.slider,
	.disabled-slider {
		height: 58px;
		border: 1px solid #3a4240;
		border-radius: 12px;
		background: var(--panel-soft);
	}

	.slider {
		position: relative;
		overflow: hidden;
		user-select: none;
		touch-action: pan-y;
	}

	.disabled-slider {
		display: grid;
		place-items: center;
		color: #7d8b82;
		font-size: 13px;
	}

	.fill {
		position: absolute;
		inset: 0 auto 0 0;
		width: calc(52px + var(--dx));
		max-width: calc(var(--p) * 100%);
		background: var(--soft);
		transition: width 0.23s ease;
		pointer-events: none;
	}

	.thumb {
		position: absolute;
		top: 4px;
		left: 4px;
		z-index: 3;
		display: grid;
		place-items: center;
		width: 48px;
		height: 48px;
		border: 0;
		border-radius: 9px;
		background: var(--accent);
		color: var(--accent-ink);
		font-size: 23px;
		line-height: 1;
		transform: translateX(var(--dx));
		transition: transform 0.23s ease;
		touch-action: none;
	}

	.dragging .thumb,
	.dragging .fill {
		transition: none;
	}

	.slide-text {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		padding-right: 10px;
		padding-left: 54px;
		color: #9ba8a0;
		font-size: 13px;
		letter-spacing: 0.1px;
		pointer-events: none;
	}

	.complete {
		border-color: color-mix(in srgb, var(--accent) 65%, #3a4240);
	}

	.complete .slide-text {
		padding-right: 52px;
		padding-left: 10px;
		color: #d8e0d9;
	}

	@media (prefers-reduced-motion: reduce) {
		.fill,
		.thumb {
			transition: none;
		}
	}
</style>
