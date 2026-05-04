# Blockish AI Context (Summary + Index)

This folder is the source of truth for AI agents that generate or edit Blockish designs.

Primary objective:
- help AI choose the correct Blockish blocks,
- build clean block trees with minimum required block count,
- use global controls and extensions safely,
- avoid unsupported attributes or inefficient structures.

## Required Read Order

1. `ai-context/README.ai.md` (this file)
2. `ai-context/global/advanced-controls.ai.md`
3. Relevant block specs from `ai-context/blocks/*.ai.md`
4. Relevant extension specs from `ai-context/extensions/*.ai.md`

If a rule conflicts, priority is:
1. Runtime source behavior
2. Block-specific AI spec
3. Global advanced controls spec
4. This summary/index

## Source-Validated Capability Snapshot

Current registered blocks (18):
- `blockish/container`
- `blockish/icon`
- `blockish/heading`
- `blockish/image`
- `blockish/button`
- `blockish/video`
- `blockish/google-map`
- `blockish/icon-list`
- `blockish/icon-list-item` (child of `icon-list`)
- `blockish/rating`
- `blockish/counter`
- `blockish/progress-bar`
- `blockish/social-icons`
- `blockish/social-icon-item` (child of `social-icons`)
- `blockish/accordion`
- `blockish/accordion-item` (child of `accordion`)
- `blockish/tab`
- `blockish/tab-item` (child of `tab`)

Current registered extensions (2):
- `class-manager`
- `ai-design-assistant`

## Parent/Child Rules (Critical)

AI must respect these nesting constraints:
- `icon-list-item` must be inside `icon-list`
- `social-icon-item` must be inside `social-icons`
- `accordion-item` must be inside `accordion`
- `tab-item` must be inside `tab`

If a design requires repeated items, prefer the parent + item pattern instead of creating unrelated sibling blocks.

## How Blockish Works (Mental Model for AI)

1. Structure layer:
- `container` is the main layout/section wrapper.
- Most page sections should start from one top-level `container`.

2. Content layer:
- Use content blocks (`heading`, `image`, `button`, `video`, etc.) inside container hierarchy.

3. Global advanced controls layer:
- All `blockish/*` blocks can receive shared advanced attributes (layout, width, position, flex/grid context, transform, background, border, custom CSS).
- Must follow `advanced-controls.ai.md` conditions and responsive value shape.

4. Extension layer:
- `class-manager` can attach reusable style classes globally.
- Use this for repeated styling patterns across many blocks.

## AI Composition Strategy

Before generating blocks:
1. Identify page intent (hero, features, CTA, FAQ, testimonial, contact, pricing).
2. Choose smallest valid block tree.
3. Reuse parent/item blocks where list-like content exists.
4. Apply block attributes first, global advanced controls second.
5. Add `customCss` only if controls cannot achieve the design.

## Block Planning Recipes (Estimated Counts)

These are planning baselines, not hard limits.

1. Simple Hero (title + text + CTA)
- Typical tree: `container` -> `heading` + optional text block + `button`
- Blockish count: usually 2 to 4 Blockish blocks (depending on whether text is Heading or core paragraph)

2. Features Grid (3 items)
- Typical tree: outer `container` -> inner item containers x3 -> per item (`icon` + `heading`)
- Blockish count: usually 10 to 14
- Efficiency tip: use repeated inner container pattern and shared spacing/background styles.

3. FAQ Section
- Typical tree: `container` -> `accordion` -> `accordion-item` xN
- Blockish count for 5 FAQs: usually 7
- Efficiency tip: keep one accordion with multiple items, not multiple accordions.

4. Social Links Row
- Typical tree: `container` -> `social-icons` -> `social-icon-item` xN
- Blockish count for 4 networks: usually 6

5. Stats Row
- Typical tree: `container` -> inner containers x3/4 -> `counter` or `progress-bar` per item
- Blockish count for 3 stats: usually 7 to 10

6. Tabbed Content
- Typical tree: `container` -> `tab` -> `tab-item` xN
- Blockish count for 3 tabs: usually 5

## Efficiency Rules (Very Important)

- Prefer fewer top-level containers and more meaningful inner grouping.
- Avoid deep nesting when one container level is enough.
- For repeated visuals across sections, prefer `class-manager` over duplicated inline/per-block styles.
- Keep global advanced styles minimal and purposeful.
- Do not set every responsive key unless needed; set only required device values.

## Extension Usage Rules

### `class-manager`
Use when:
- the same style token/pattern appears across multiple blocks,
- user asks for reusable classes or global consistency.

Avoid when:
- styling is one-off and local.

Safety:
- do not invent fake class IDs/slugs,
- preserve existing class assignments unless replacement is requested.

### `ai-design-assistant`
- Treat as assistant feature infrastructure.
- Do not assume it provides visual block styling attributes by itself.

## Safe Execution Checklist

Before finalizing AI output:
1. Every used block exists in Blockish block list.
2. Parent-child constraints are valid.
3. Global advanced attributes follow conditions (`widthType`, flex/grid context, position dependency).
4. Responsive value shapes are consistent.
5. No undocumented attributes or enum values are used.
6. `customCss` is scoped with `{{SELECTOR}}` and only used when needed.

## Quick Index

Global:
- `ai-context/global/advanced-controls.ai.md`

Blocks:
- `ai-context/blocks/container.ai.md`
- `ai-context/blocks/heading.ai.md`
- `ai-context/blocks/button.ai.md`
- `ai-context/blocks/image.ai.md`
- `ai-context/blocks/icon.ai.md`
- `ai-context/blocks/video.ai.md`
- `ai-context/blocks/google-map.ai.md`
- `ai-context/blocks/icon-list.ai.md`
- `ai-context/blocks/icon-list-item.ai.md`
- `ai-context/blocks/rating.ai.md`
- `ai-context/blocks/counter.ai.md`
- `ai-context/blocks/progress-bar.ai.md`
- `ai-context/blocks/social-icons.ai.md`
- `ai-context/blocks/social-icon-item.ai.md`
- `ai-context/blocks/accordion.ai.md`
- `ai-context/blocks/accordion-item.ai.md`
- `ai-context/blocks/tab.ai.md`
- `ai-context/blocks/tab-item.ai.md`

Extensions:
- `ai-context/extensions/class-manager.ai.md`

## Maintenance Contract

Whenever a block or extension changes in source (`src/` or `includes/Config/*List.php`):
1. update the corresponding `ai-context/*.ai.md` file,
2. update this index if block/extension list or composition guidance changed,
3. keep AI context and runtime behavior in the same commit/PR.
