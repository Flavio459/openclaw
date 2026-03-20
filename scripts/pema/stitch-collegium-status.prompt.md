# Google Stitch Prompt (Collegium Implantation Status)

Use this prompt in Google Stitch when iterating on the local executive panel:

```text
Responsive web command deck for Collegium Cortex implantation status.

Purpose:
- Let the Chairman understand the real state of implantation in less than 2 minutes.
- Make blockers, pending decisions, next dominant action, and product surfaces immediately obvious.
- Preserve the distinction between OpenClaw Runtime, Collegium product surfaces, PEMA integrations, and LAB tooling.

Audience:
- Chairman
- development leader
- operators who need fast executive clarity, not raw engineering logs

Information hierarchy:
1. General state
2. What is happening now
3. Next dominant action
4. Blockers and pending decisions
5. Product surfaces
6. Components grouped by type
7. Risks
8. Evidence
9. Chairman observations with AI leader response

Layout:
- Desktop-first executive board
- Thin topbar with title, last update, and status signal
- Hero section with strong headline and 4 summary signal cards
- Main deck with two columns:
  - left column for current state, weekly priorities, surfaces, grouped components
  - right column for pending decisions, blockers, risks, evidence
- Full-width section at bottom for Chairman observations

Visual direction:
- Executive navigation deck, not generic admin dashboard
- High clarity, high contrast, low noise
- Deep petroleum/graphite base with pale text
- Accent colors:
  - green for active
  - amber for attention
  - red for blocked
  - steel blue for lab or provisional
- Typography with one elegant display face for headlines and one highly legible sans for interface copy
- Large cards, deliberate spacing, obvious grouping, minimal chrome

Interaction cues:
- Clear status chips
- Distinct sections with visible hierarchy
- Avoid dense tables when cards or grouped blocks communicate better
- Evidence and file references should look actionable
- Chairman observations should read like a command rail

Accessibility:
- WCAG AA contrast minimum
- Keyboard-friendly focus states
- Mobile adaptation without losing hierarchy

Do not:
- make it look like a generic SaaS analytics dashboard
- overuse gradients or glassmorphism
- blur the distinction between product and tooling
- add decorative charts that do not serve decision-making
```

## Refinement prompts

1. `Make the summary cards more legible and scannable for a decision-maker under time pressure.`
2. `Replace any dense matrix feeling with clearer grouped executive sections.`
3. `Increase the clarity of the Chairman observations rail and make AI responses visually subordinate but still easy to read.`
4. `Preserve the serious, institutional tone and avoid startup-dashboard aesthetics.`
