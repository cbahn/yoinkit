<script lang="ts">
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<main class="app-shell">
	<header class="topbar">
		<div class="brand">yoinkit admin</div>
	</header>

	{#if !data.authed}
		<section>
			<div class="label">ADMIN</div>
			<h1 class="title">Enter the admin password.</h1>
			<p class="subtitle">For now this stores the password plainly in a cookie, as requested.</p>
		</section>

		<hr class="rule" />

		<form method="POST" action="?/login" class="form-stack login-form">
			<div class="field">
				<label for="password">Password</label>
				<input id="password" name="password" type="password" />
			</div>
			{#if form?.message}
				<p class="notice error">{form.message}</p>
			{/if}
			<button class="button primary" type="submit">Open admin</button>
		</form>
	{:else}
		<section>
			<div class="label">CONTROL ROOM</div>
			<h1 class="title"><span class="title-number">#{data.state.showNumber}</span> — {data.state.showName}</h1>
			<p class="subtitle">
				Audience code: {data.state.accessCode} · {data.state.connectedViewers} connected · {data.state.votesLocked
					? 'votes are final'
					: 'votes can be changed'}
			</p>
		</section>

		<hr class="rule" />

		{#if form?.message}
			<p class="notice">{form.message}</p>
		{/if}

		<section class="admin-section">
			<div class="section-top">
				<span class="label">ROOM SETTINGS</span>
				<span class="tiny">used by / and /vote</span>
			</div>

			<form method="POST" action="?/saveSettings" class="form-stack panel-form">
				<div class="field">
					<label for="accessCode">Audience access code</label>
					<input
						id="accessCode"
						name="accessCode"
						type="text"
						inputmode="numeric"
						pattern="[0-9]{3}"
						maxlength="3"
						value={data.state.accessCode}
					/>
				</div>
				<div class="field">
					<label for="showName">Current show name</label>
					<input id="showName" name="showName" type="text" value={data.state.showName} />
				</div>
				<div class="field">
					<label for="yoinkDelayMinutes">Yoink delay in minutes</label>
					<input
						id="yoinkDelayMinutes"
						name="yoinkDelayMinutes"
						type="number"
						min="0"
						value={data.state.yoinkDelayMinutes}
					/>
				</div>
				<label class="check-row">
					<input type="checkbox" name="votesLocked" checked={data.state.votesLocked} />
					<span>Votes are final / locked</span>
				</label>
				<label class="check-row">
					<input type="checkbox" name="yoinkAvailable" checked={data.state.yoinkAvailable} />
					<span>Yoink is available now</span>
				</label>
				<button class="button primary" type="submit">Save settings</button>
			</form>
		</section>

		<hr class="rule" />

		<section class="admin-section">
			<div class="section-top">
				<span class="label">SHOW LIFECYCLE</span>
				<span class="tiny">demo actions</span>
			</div>

			<form method="POST" action="?/startShow" class="form-stack panel-form">
				<div class="field">
					<label for="newShowName">New show name</label>
					<input id="newShowName" name="showName" type="text" placeholder="Movie or episode title" />
				</div>
				<div class="field">
					<label for="newDelay">Yoink delay in minutes</label>
					<input id="newDelay" name="yoinkDelayMinutes" type="number" min="0" value="0" />
				</div>
				<label class="check-row">
					<input type="checkbox" name="votesLocked" checked />
					<span>Start with final / locked votes</span>
				</label>
				<button class="button primary" type="submit">Start new show</button>
			</form>

			<div class="quick-actions">
				<form method="POST" action="?/resetVotes">
					<button class="button danger" type="submit">Reset votes only</button>
				</form>
				<form method="POST" action="?/unlockYoink">
					<button class="button" type="submit">Unlock Yoink early</button>
				</form>
				<form method="POST" action="?/logout">
					<button class="button" type="submit">Log out</button>
				</form>
			</div>
		</section>
	{/if}
</main>

<style>
	.login-form {
		max-width: 340px;
	}

	.admin-section {
		display: grid;
		gap: 13px;
	}

	.panel-form {
		padding: 15px;
		border: 1px solid #353c39;
		border-radius: 12px;
		background: var(--panel);
	}

	.check-row {
		display: flex;
		align-items: center;
		gap: 9px;
		color: #c9d0ca;
		font-size: 13px;
	}

	.check-row input {
		width: 16px;
		height: 16px;
		accent-color: var(--speed);
	}

	.quick-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 12px;
	}

	.quick-actions form {
		margin: 0;
	}
</style>
