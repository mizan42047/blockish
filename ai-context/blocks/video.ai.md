# Block Spec: `blockish/video`

Important prerequisite: AI must read `ai-context/global/advanced-controls.ai.md` first.

## Block Summary

- Name: `blockish/video`
- Role: video embed/player block (YouTube, Vimeo, or self-hosted)
- Typical use: tutorials, promos, product demos, media sections
- Can contain: no inner blocks

## When AI Should Use It

Use video when AI needs:
- an embedded YouTube/Vimeo player,
- or a self-hosted video with playback options,
- optional click-to-play overlay image.

Avoid this block when user needs advanced playlist/chapter system beyond current controls.

## Core Behavioral Notes

- Wrapper class: `blockish-video-wrapper`.
- Player container class: `blockish-video-player`.
- Source mode is controlled by `sourceType.value`:
  - `youtube`
  - `vimeo`
  - `selfHosted`
- URL/embed behavior:
  - YouTube/Vimeo URLs are parsed to provider embed URLs via `getVideoEmbedUrl(...)`.
  - Invalid/unsupported URLs return no embed.
- Overlay behavior:
  - overlay appears only when:
    - `showOverlay = true`
    - `overlayImage.url` exists
    - `autoplay = false`
  - click hides overlay and starts playback (video play or iframe autoplay param).

## Important Attributes (AI-Relevant)

1. Source
- `sourceType` (object `{label,value}`)
  - default: `{ label: "YouTube", value: "youtube" }`
- `youtubeUrl` (string)
  - default: sample YouTube URL
- `vimeoUrl` (string)
  - default: sample Vimeo URL
- `selfHostedVideo` (object)
- `selfHostedUrl` (string)

2. Playback
- `poster` (string; mainly self-hosted poster image URL)
- `autoplay` (boolean, default `false`)
- `loop` (boolean, default `false`)
- `muted` (boolean, default `false`)
- `playOnMobile` (boolean, default `true`)
- `controls` (boolean, default `true`)
- `preload` (string, default `metadata`)
- `startTime` (number, default `0`)
- `endTime` (number, default `0`)
- `captions` (boolean, default `false`)
- `privacyMode` (boolean, default `false`)
- `lazyLoad` (boolean, default `true`)
- `suggestedVideos` (object `{label,value}`)
  - default: `{ label: "Current Channel", value: "currentChannel" }`
  - supported values include `currentChannel`, `anyVideo`

3. Overlay
- `showOverlay` (boolean, default `false`)
- `overlayImage` (object)
- `showOverlayPlayIcon` (boolean, default `true`)
- `overlayPlayButtonSize` (object)
  - controls overlay play button width/height
- `overlayPlayButtonIconSize` (object)
  - controls triangle icon size via CSS variable
- `overlayPlayButtonBg` (string)
  - controls overlay play button background
- `overlayPlayButtonIconColor` (string)
  - controls overlay play triangle color
- `overlayPlayButtonBorderRadius` (object)
  - controls overlay play button radius

4. Layout
- `alignment` (object by device)
  - default: `Desktop: center`
  - values: `left`, `center`, `right`
- `videoAspectRatio` (object `{label,value}`)
  - default: `{ label: "16:9", value: "16 / 9" }`
  - supports `auto` behavior in runtime when value is `auto`
- `videoCSSFilters` (string)
  - group selector type: `BlockishCSSFilters`

Deprecated/removed:
- Do not write `videoWidth` or `videoHeight`; current block data uses `videoAspectRatio` instead.

## Source-Specific Conditions

- Self-hosted:
  - uses `selfHostedVideo.url` or `selfHostedUrl`.
  - poster uploader is available.
- YouTube/Vimeo:
  - URL text input by source.
  - `privacyMode` available for embeds.
- Vimeo:
  - `endTime` and `controls` toggles are not shown in inspector.
- YouTube:
  - supports `captions`, `lazyLoad`, and `suggestedVideos`.

## AI Safe-Write Rules

- Keep `sourceType.value` valid (`youtube`, `vimeo`, `selfHosted`).
- Match URL field to selected source type.
- Use non-negative start/end times.
- Avoid autoplay with sound unless user explicitly requests (prefer muted autoplay).
- For overlays, ensure image exists before enabling.
- Only write overlay play button style attributes when `showOverlayPlayIcon = true`.
- Use `videoAspectRatio` for sizing instead of deprecated `videoWidth`/`videoHeight`.
- Preserve accessibility/readability: keep controls enabled when usability is important.

## Failure/Fallback Guidance

If provided video URL is invalid or unsupported:
- keep source selection but show clear fallback suggestion,
- or switch to self-hosted URL when available.

If overlay assets are missing:
- disable overlay and keep direct player visible.
