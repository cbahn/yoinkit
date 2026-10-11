# Yoinkit.biz — Design brief

## Purpose and scope

Yoinkit is a small, live audience app for roughly a dozen people watching a movie together. Participants enter a three-digit access code, see the current show and audience response, cast independent “Speed up” and “Yoink it” votes, and react with custom emoji. The administrator is in the room and can explain the use of the app in person.

Prioritize simplicity, immediacy, and maintainability for a developer with limited frontend experience. Use SvelteKit, TypeScript, and plain CSS, deployed in one Docker container with one server process. Keep authoritative state in memory; no database or durable show history is required. A restart discards the current show and participation state.

The three-digit access code is set by the admin. The admin password is passed to the container as an environmental variable.

## Admin access and flow
When users first visit /, they should see just very minimal interface asking for the 3 digit access code. I want it to be clear that the code is three numbers and not a password or something.
Once they enter the access code, it'll load up the voting apps at /vote. We don't need to have session tokens or anything, just a cookie that stores the 3digit access code. IF the cookie is missing or incorrect, it deletes the cookie and boots them back to /
There is also an /admin page that works similiarly. It asks for the password then just stores it in plaintext in a cookie. There's no link to the admin page from the other pages, admins need to know about that URL beforehand.

## Visual direction and reference

The companion [interactive HTML prototype](yoinkit_interactive_demo.html) is the visual and interaction reference. It contains sample counts, local-only interactions, and preview controls; those controls belong on the production admin page. This brief governs behavior the prototype does not implement.

The atmosphere is cool, calm, and restrained, inspired by the rainy-night mood discussed around [ascii.rest’s Tokyo Rain](https://ascii.rest/tokyo-rain/). Achieve this through typography, spacing, and subdued colors. Keep the interface flat and minimal: no neon effects, decorative glow, rain overlays, or elaborate graphics. A small directional arrow on a slider is an interaction cue.

Use these prototype colors as the starting theme:

| Role | Color |
| --- | --- |
| Page background | `#131518` |
| Primary text | `#e5e8e5` |
| Muted text | `#929d96` |
| Dividers / meter tracks | `#2b3130` |
| Speed up accent / soft fill | `#88a9a0` / `#293833` |
| Yoink it accent / soft fill | `#b49baa` / `#382d35` |
| Selected reaction border / background | `#7583ae` / `#2b3040` |

Reserve category colors for the corresponding results and slider.

Use ordinary sans-serif typography for titles and controls, with small monospaced section labels. The show title has the strongest visual weight. Prefer whitespace and thin horizontal dividers over separate cards. Centralize theme variables globally; keep component styles alongside their Svelte components.

## Audience screen

Design for phones first, with a narrow centered layout on larger screens. Remember, this app will be used one handed in a dark room. The prototype’s approximately 490px content width and 21px side padding are useful starting points. Keep the brand and live connection count unobtrusive at the top.

Display the title prominently as `#5 — The Show Name`. Show numbers identify successive generations within the running session, rather than a persistent historical archive. Long names should wrap naturally.

Follow the latest prototype’s order: show heading, compact reactions, live results, and two voting sliders. The earlier bottom-drawer proposal is superseded by this inline reference layout.

Show separate horizontal meters and exact totals for Speed up and Yoink it. A person may vote for neither, either, or both, so these are independent measures. Do not use a pie chart or a shared percentage bar.

Votes remain counted after a participant disconnects. **Recommended display rule:** scale both bars against the same value, `max(connected viewers, Speed up total, Yoink it total, 1)`. This avoids overflowing bars without deleting votes. Do not label the bars as percentages of the current audience; the denominator changes with presence. Exact counts are authoritative.

## Voting interaction and rules

Each category has its own labeled left-to-right slide-to-confirm control, informed by the [Ciele interaction reference](https://ciele.app/components/slide-to-confirm) and implemented in the attached prototype’s flat style. Both votes remain independently available.

Start with a muted track, colored handle, and “Slide to vote” text. Dragging advances a subdued fill. Releasing near the end confirms; releasing earlier returns the handle to the start. The prototype uses an 86% completion threshold, a roughly 58px track, and a 48px handle. Treat these as tuning defaults.

Touch and mouse interaction must work smoothly. Cancellation must never submit. Partial dragging is temporary, with no effect on results. Show a pending state during submission and a recorded state only after server confirmation. Failed submissions must remain retryable, without duplicate votes.

The admin can toggle vote locking at any time. When locked, existing votes cannot be removed and recorded sliders remain completed. When unlocked, previously recorded votes become removable; a small explicit “Remove vote” action matches the prototype. Adding still requires sliding. Relocking preserves and locks all active votes. Always show the current rule clearly, such as “Votes are final” or “Votes can be changed.”

## Yoink availability

When starting a show, the admin chooses immediate Yoink availability or a delay measured from show start. Speed up is available immediately. The admin can unlock Yoink early without restarting the show.

While delayed, retain a quiet Yoink label and countdown, but no usable voting control. A disabled control or reserved space is acceptable; make availability unambiguous. At the deadline, enable the slider. The server enforces eligibility using its own clock. A browser countdown is only a display aid.

## Compact custom reactions

Reactions follow Discord / Teams conventions. Show only emoji currently used on the show, each in a small chip with its count. Tapping a chip adds or removes the viewer’s reaction; distinguish selected chips subtly. Remove a chip when its count reaches zero.

Each viewer can select each emoji once and can select multiple different emoji. Reactions remain reversible regardless of vote locking. Counts represent distinct reacting viewers, not repeated taps.

A compact add-reaction button opens a picker for approximately 43 specific emoji. Opening the picker should not permanently expand the main interface. Selecting an unused emoji creates its chip; selecting one already chosen must not create a duplicate. The existing chip remains the removal control.

Use the following emoji for the app: ["🎃","😟","💤","😅","❤️","💀","👍","🤡","✨","🤔","😤","👻","💪","🥺","👀","😂","💡","🎉","💯","🫩","🥹","🩷","🫪","🍆","🧠","🔥","🙏","👽","👺","🍖","➡️","🚀","💢","🙈","💩","👯","🤦","🫂","🇺🇸","🫠","🫡","😭","👎"]

Define the allowed catalog centrally with stable IDs, display names, and image assets. Provide readable accessible names. Keep chip order stable during live updates and allow compact wrapping. Reactions reset with a new show. Comments, shared drawing, soundboards, and collective reaction effects are outside this version.

## Show lifecycle and administration

The admin page starts a new show by accepting its name, vote-lock setting, and Yoink delay. Starting increments the show number, resets both vote sets and all reactions, and establishes a new start time and unlock deadline. Preserve participant identities and connections so nobody must rejoin.

Also provide live vote-lock changes, early Yoink unlock, and a vote-only reset. **Recommended reset distinction:** resetting votes clears both categories and unlocks their controls while retaining the show, reactions, and Yoink deadline. Starting a new show resets everything associated with that show. Label destructive actions clearly to avoid accidental round changes.

Before any show exists, display a simple waiting state. Administrative mutations require separate administrator authorization; the audience code must not grant admin access.

## State, presence, and live updates

Use ordinary HTTP requests for joining, votes, reactions, and admin actions, with Server-Sent Events for live updates. Broadcast small full snapshots rather than requiring clients to reconstruct state from event history. Include show metadata, rules, deadlines, totals, reaction counts, and the viewer’s own selections.

Issue an cookie identity after joining. Multiple tabs sharing that identity count as one connected viewer and share selections. Different browsers or devices count separately; this is sufficient for a casual in-room activity.

Count viewers with at least one active stream. Clean up disconnected streams and send periodic heartbeats. Presence is approximate during network loss, not an instantaneous guarantee. Disconnecting must not erase votes or reactions.

Reconnect by loading an authoritative snapshot. Reject stale mutations after a new show or vote reset using a server-issued revision; include a fresh session identity after restarts. Repeated add/remove requests must have idempotent outcomes. On reset, cancel partial drags immediately. Enforce all voting and reaction rules server-side.

