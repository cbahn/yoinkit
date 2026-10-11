<script lang="ts">
	import { reactionCatalog } from '#lib/reactions.js';

	type ReactionCount = { id: string; count: number };
	type Props = {
		reactions: ReactionCount[];
		mine: string[];
		onToggle: (id: string, active: boolean) => void;
		pendingId?: string;
	};

	let { reactions, mine, onToggle, pendingId = '' }: Props = $props();
	let open = $state(false);

	const countById = $derived(new Map(reactions.map((reaction) => [reaction.id, reaction.count])));
	const mineSet = $derived(new Set(mine));
	const usedReactions = $derived(reactionCatalog.filter((reaction) => (countById.get(reaction.id) ?? 0) > 0));

	function choose(id: string) {
		onToggle(id, !mineSet.has(id));
		open = false;
	}
</script>

<div class="reaction-row">
	{#each usedReactions as reaction (reaction.id)}
		<button
			type="button"
			class:selected={mineSet.has(reaction.id)}
			class="chip"
			disabled={pendingId === reaction.id}
			aria-pressed={mineSet.has(reaction.id)}
			aria-label={`${reaction.name} reaction, ${countById.get(reaction.id)} selected`}
			onclick={() => choose(reaction.id)}
		>
			<span class="emoji">{reaction.emoji}</span>
			<span>{countById.get(reaction.id)}</span>
		</button>
	{/each}

	<button
		type="button"
		class="chip add"
		aria-label="Add reaction"
		aria-expanded={open}
		onclick={() => (open = !open)}
	>
		☻ +
	</button>
</div>

{#if open}
	<div class="picker">
		<div class="picker-head">
			<span>Choose a reaction</span>
			<button type="button" aria-label="Close reaction picker" onclick={() => (open = false)}>×</button>
		</div>
		<div class="emoji-grid">
			{#each reactionCatalog as reaction (reaction.id)}
				<button
					type="button"
					class:selected={mineSet.has(reaction.id)}
					disabled={pendingId === reaction.id}
					aria-label={`React with ${reaction.name}`}
					onclick={() => choose(reaction.id)}
				>
					{reaction.emoji}
				</button>
			{/each}
		</div>
	</div>
{/if}

<style>
	.reaction-row {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		align-items: center;
	}

	.chip {
		display: inline-flex;
		min-height: 32px;
		align-items: center;
		justify-content: center;
		gap: 7px;
		padding: 5px 9px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: #242829;
		color: #afb8b3;
		font-size: 13px;
		line-height: 1;
	}

	.chip:hover {
		background: #2d3333;
	}

	.chip.selected {
		border-color: var(--selected);
		background: var(--selected-soft);
		color: #c6cdf2;
	}

	.chip:disabled {
		cursor: wait;
		opacity: 0.6;
	}

	.emoji {
		font-size: 16px;
	}

	.add {
		padding: 5px 10px;
		color: #c1c9c5;
		font-size: 18px;
	}

	.picker {
		margin-top: 12px;
		padding: 12px;
		border: 1px solid var(--border);
		border-radius: 12px;
		background: #1d2222;
	}

	.picker-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 12px;
		font-size: 12px;
		color: #c9d0ca;
	}

	.picker-head button {
		border: 0;
		background: transparent;
		color: #9da9a1;
		font-size: 19px;
	}

	.emoji-grid {
		display: grid;
		grid-template-columns: repeat(8, minmax(0, 1fr));
		gap: 3px;
	}

	.emoji-grid button {
		display: grid;
		place-items: center;
		height: 36px;
		padding: 0;
		border: 1px solid transparent;
		border-radius: 7px;
		background: transparent;
		font-size: 19px;
	}

	.emoji-grid button:hover,
	.emoji-grid button:focus-visible,
	.emoji-grid button.selected {
		border-color: #636d69;
		background: #303635;
	}

	.emoji-grid button:disabled {
		cursor: wait;
		opacity: 0.5;
	}

	@media (max-width: 360px) {
		.emoji-grid {
			grid-template-columns: repeat(7, minmax(0, 1fr));
		}
	}
</style>
