<script lang="ts">
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let code = $state('');

	function handleInput(event: Event) {
		const input = event.currentTarget as HTMLInputElement;

		// Keep only three digits, even when someone pastes text.
		code = input.value.replace(/\D/g, '').slice(0, 3);
		input.value = code;
	}
</script>

<svelte:head>
	<script type="module" src="https://ascii.rest/ascii.js"></script>
</svelte:head>

<main class="app-shell join-page">
	<section class="welcome">
		<h1 class="title">Welcome</h1>
		<ascii-art piece="tokyo-rain"></ascii-art>
	</section>


	<form method="POST" action="?/join" class="join-form">
		<label class="label" for="code">ACCESS CODE</label>

		<div class="code-input">
			<input
				id="code"
				name="code"
				type="text"
				inputmode="numeric"
				autocomplete="one-time-code"
				maxlength="3"
				required
				value={code}
				oninput={handleInput}
				aria-label="Three-digit access code"
			/>

			<div class="digits" aria-hidden="true">
				{#each [0, 1, 2] as index}
					<div class="digit" class:active={index === Math.min(code.length, 2)}>
						{code[index] ?? ''}
					</div>
				{/each}
			</div>
		</div>

		{#if form?.message}
			<p class="notice error">{form.message}</p>
		{/if}

		<button class="button primary" type="submit" disabled={code.length !== 3}>Join</button>
	</form>
</main>

<style>
	.join-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
	}

	.welcome {
		width: 100%;
	}

	.welcome :global(ascii-art) {
		display: block;
		max-width: 100%;
		margin: 2px auto 16px;
		color: var(--muted);
		opacity: 0.85;
	}

	.title {
		margin-top: 0;
	}

	.rule {
		width: 100%;
	}

	.join-form {
		display: flex;
		width: 100%;
		max-width: 320px;
		flex-direction: column;
		align-items: center;
		gap: 15px;
	}

	.code-input {
		position: relative;
		width: max-content;
	}

	.code-input input {
		position: absolute;
		inset: 0;
		z-index: 1;
		width: 100%;
		height: 100%;
		cursor: text;
		opacity: 0;
	}

	.digits {
		display: flex;
		gap: 9px;
		pointer-events: none;
	}

	.digit {
		display: grid;
		width: 64px;
		height: 68px;
		place-items: center;
		border: 1px solid #3a4240;
		border-radius: 12px;
		background: #1d2222;
		color: var(--text-strong);
		font-size: 28px;
		font-weight: 550;
		font-variant-numeric: tabular-nums;
		transition:
			border-color 0.15s ease,
			background 0.15s ease;
	}

	.code-input:focus-within .digit.active {
		border-color: var(--speed);
		background: var(--speed-soft);
	}

	.button {
		min-width: 120px;
	}

	.button:disabled {
		cursor: not-allowed;
		opacity: 0.45;
	}

	.notice {
		width: 100%;
		margin: 0;
		text-align: left;
	}

	@media (max-width: 360px) {
		.digit {
			width: 58px;
			height: 64px;
		}
	}
</style>
