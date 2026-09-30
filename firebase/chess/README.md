# Abwalqmrzmrd Chess: activation

The site icon loads `/assets/chess/chess-app.js` only when opened. All chess UI and computer files are local to GitHub Pages. The established site Firebase Auth instance is reused; no second account is created. A nickname is asked once and cached under the current Auth UID. Until cloud activation, the UI explicitly says names and preferences are saved on this device. Audio uses a local object URL only and is not uploaded.

## Firebase setup required before online activation

1. Read the CURRENT Realtime Database rules from project `sakaker-9247f`.
2. Merge the `chessV1` object from `rules-additions.json` under the existing root `rules` object. This file is a subtree, not a replacement for all site rules. Preserve chat/Pong/subscription rules.
3. Check ancestor permissions: an existing root `".write": "auth != null"` would override these restrictions. Do not enable chess until broader ancestor grants are removed safely and current site branches receive explicit grants.
4. Test authenticated profile ownership, room creation, joining, turn-taking, spectators, resigning, and chat. Anonymous writes, other users' profile edits, extra fields, seat changes and visitor message deletion must fail.
5. After deploying and verifying rules, change `assets/chess/config.json` to `"onlineEnabled": true`.

No Firebase admin credentials are embedded. No rules were deployed by this code commit. The namespace is disabled in the production configuration until setup is completed.

## Scope and integrity

Online games are casual/unranked. Clients replay and validate every move through chess.js; Firebase rules bind writes to account/seat/turn and freeze prior move strings. Firebase database rules cannot independently execute a chess engine, so a malicious participant could still send invalid SAN and halt a casual room. Official competitive Elo requires an authoritative server that validates moves and final results. This release instead maintains an explicitly labelled training estimate against the computer. It is not FIDE-rated and does not pretend to be a tamper-proof ranking. Names are immutable per UID after their first cloud registration; account settings remain editable.

Public messages are displayed for three minutes, with 40 recent entries read at most. Old database records are not automatically deleted by this client; scheduled server cleanup can be added later.

## Google Drive

Drive receives a maintenance backup ZIP of the game files and general settings. It is not used as a realtime database or a public executable host. Public Drive download pages have redirects, authentication and CORS restrictions, and cannot safely host writable per-account profiles. Lazy loading separate Pages assets is what reduces the home page's work. Per-account settings use Firebase after its activation, plus a device-local cache. The user's selected private audio remains local.

## Validation

Run `node assets/chess/verify.mjs`. Includes initial position perft (depth 3 = 8,902), castling, en passant, promotion, checkmate, threefold repetition, computer move legality, room replay/turn checks and training counters.

Third-party chess rules: chess.js v0.13.4, BSD-2-Clause, vendored unchanged from the original author's tagged source. The license is retained at the top of `assets/chess/chess-rules.js`.

Business copy: this site uses its existing sakaker-basnusse Firebase project. Never deploy the main site's rules wholesale here. Review the current business database rules and merge only the chessV1 subtree. Online remains disabled until activation.
