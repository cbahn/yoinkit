<script lang="ts">
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<main class="app-shell join-page">
	<header class="topbar">
		<div class="brand">yoinkit</div>
	</header>

	<section>
		<div class="label">ROOM CODE</div>
		<h1 class="title">Enter the three numbers on screen.</h1>
		<p class="subtitle">This is not a password. It is just the shared movie-room code.</p>
	</section>

	<hr class="rule" />

	<form method="POST" action="?/join" class="form-stack">
		<div class="field">
			<label for="code">3 digit access code</label>
			<input
				id="code"
				name="code"
				type="text"
				inputmode="numeric"
				pattern="[0-9]{3}"
				maxlength="3"
				placeholder="123"
				autocomplete="one-time-code"
			/>
		</div>

		{#if form?.message}
			<p class="notice error">{form.message}</p>
		{/if}

		<button class="button primary" type="submit">Join voting</button>
	</form>
</main>

<style>
	.join-page {
		display: flex;
		flex-direction: column;
	}

	form {
		max-width: 320px;
	}

	input {
		font-size: 22px;
		letter-spacing: 0.3em;
		text-align: center;
	}
</style>
