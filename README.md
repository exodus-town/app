# Exodus Town - App

In the digital tapestry of the Metaverse, the Exodus Town interface stands as the portal to a new epoch. This repository is the forge where code alchemists shape the tools of interaction with Exodus Town.

### The Archive (2026)

Exodus Town is unwinding. ExodusDAO [proposal #9](https://polygonscan.com/tx/0xf00204dcf39c04826316b99e6a4d88d812fbdb194a9c22818beb083d23df2fb5) pauses the auctions and funds a [refund contract](https://polygonscan.com/address/0x4597d46C178C0B11d0F17ACb62bE81555D471524) from which every plot can be returned to the DAO for the MANA it sold for ([source and snapshot](https://github.com/exodus-town/refund)). This app keeps the town online as an archive at **https://exodus-town-archive.pages.dev**:

- **/unwind**: the proposal's status (and its Execute button once it passes), and returning your plots, one or many at once.
- **Owners of record**: `/api/owners` lists each plot's onchain holder, or for a plot returned to the DAO, whoever returned it (from the refund contract's `Refunded` events). The map, the parcel panel and content uploads all use it, so owners keep their plots, and can keep editing and publishing them, after returning them.
- **/play**: the Decentraland web explorer ([bevy-explorer](https://github.com/decentraland/bevy-explorer), the `@dcl-regenesislabs/bevy-explorer-web` package pinned in `package.json`) is served by this app and enters this site's own realm. `scripts/postinstall.ts` copies it to `public/play`; only its engine wasm (over 100 MB) is fetched from the package's versioned Decentraland CDN path. `functions/play/*.html.ts` serve its two `.html` pages around Pages' `.html` redirect, which its service worker relies on to isolate them.
- The realm's `/about` declares the town's map bounds, which the explorer needs before it loads any scene, and serves every scene with the inspector's runtime as its `bin/index.js`.

Deploys run in GitHub Actions (`.github/workflows/deploy.yml`): pushes to `main` deploy production, pull requests a preview, both bound to the content bucket. They need the `CLOUDFLARE_API_TOKEN` (Pages: Edit, Workers R2 Storage: Edit) and `CLOUDFLARE_ACCOUNT_ID` secrets and the `R2_BUCKET` variable. `wrangler.toml` holds the project's bindings and variables. Locally, `npm run preview` builds and serves the site the way Pages does (headers, Functions and a local bucket).

### Codex Overview

Within these digital halls lies the machinery of interaction for the settlers of Exodus Town. Crafted upon the anvil of Cloudflare Pages, the interface is a bastion of serverless might, with Cloudflare Functions as its sentinels. The webapp, a tapestry woven with Vite, React, and the arcane art of hooks, awaits your command.

### Enchantments and Runes

- **Auction Engagement**: The interface is your grimoire, guiding your hand in the sacred art of the auction, where parcels of the new world are claimed.
- **Content Conjuration**: For those with the TOWN token talisman, the interface becomes a wand, allowing you to breathe life into parcels with your creations.
- **Lore Updates**: With every cycle of the sun and moon, the interface whispers the latest happenings of Exodus Town to those who listen.

### Forging the Key

To wield the power of this interface:

- Clone the essence of this repository to your sanctum.
- Transcribe the ancient script `.dev.vars.example` into `.dev.vars`, infusing it with the necessary environment runes for the backend sanctum.
- To harmonize the frontiers of the frontend realm, edit the scrolls within `src/config/env/dev.json` and `src/config/env/prd.json` with the wisdom of configuration.
- Invoke `npm install` to align the stars and gather the necessary elements.
- Chant `npm run dev` to awaken the spirits within and step through the portal to your local realm.

### Scroll of Collaboration

This repository thrives on the contributions of fellow travelers and code conjurers. If the call to adventure stirs within you, consult the contribution scrolls for guidance.

### Aid and Consultation

Should you encounter beasts or bewilderments, inscribe your trials in an issue within these halls, and a guardian will come to your aid.

### Tome of the Law

The Exodus Town interface is bound by the [License](/LICENSE), a lexicon of freedom and sharing in the realm of code.

This is no mere interface; it is a beacon for those who dare to dream, a tool for the brave, the bold, and the builders. Here, we dance with destiny. Your saga begins with a single command.

.
