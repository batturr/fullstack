# 14. Video

## Basic Usage

```html
<video controls width="640" height="360">
  <source src="video.mp4" type="video/mp4">
  <source src="video.webm" type="video/webm">
  Your browser does not support the video element.
</video>
```

---

## Attributes

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `controls` | Show play/pause, volume, fullscreen, progress | `<video controls>` |
| `autoplay` | Start playing automatically | `<video autoplay>` |
| `loop` | Repeat indefinitely | `<video loop>` |
| `muted` | Start muted | `<video muted>` |
| `preload` | Preload strategy | `preload="metadata"` |
| `poster` | Preview image before play | `poster="thumb.jpg"` |
| `width` | Video width | `width="640"` |
| `height` | Video height | `height="360"` |
| `playsinline` | Prevent fullscreen on iOS | `playsinline` |

```html
<!-- Hero background video -->
<video autoplay muted loop playsinline poster="hero-poster.jpg">
  <source src="hero.mp4" type="video/mp4">
  <source src="hero.webm" type="video/webm">
</video>

<!-- Video with poster -->
<video controls poster="thumbnail.jpg" preload="metadata" width="800">
  <source src="tutorial.mp4" type="video/mp4">
</video>
```

---

## Supported Video Formats

| Format | MIME Type | Codec | Browser Support |
|--------|-----------|-------|----------------|
| **MP4** | `video/mp4` | H.264 | All browsers |
| **WebM** | `video/webm` | VP8/VP9 | Chrome, Firefox, Opera, Edge |
| **OGG** | `video/ogg` | Theora | Chrome, Firefox, Opera |
| **AV1** | `video/mp4` (AV1 codec) | AV1 | Chrome, Firefox, Edge |

> **Best practice:** Provide **MP4 (H.264)** as primary, **WebM (VP9)** for smaller file size where supported.

---

## Captions & Subtitles — `<track>`

```html
<video controls width="640">
  <source src="movie.mp4" type="video/mp4">
  
  <track kind="subtitles" src="subs-en.vtt" srclang="en" label="English" default>
  <track kind="subtitles" src="subs-es.vtt" srclang="es" label="Español">
  <track kind="captions" src="captions-en.vtt" srclang="en" label="English CC">
  <track kind="descriptions" src="desc-en.vtt" srclang="en" label="Audio Description">
  <track kind="chapters" src="chapters.vtt" srclang="en" label="Chapters">
</video>
```

### `kind` Values

| Kind | Purpose |
|------|---------|
| `subtitles` | Translation of dialogue |
| `captions` | Dialogue + sound effects (for deaf/hard of hearing) |
| `descriptions` | Text description of visual content (for blind users) |
| `chapters` | Chapter titles for navigation |
| `metadata` | Machine-readable data (not shown to user) |

### WebVTT Format (.vtt)

```
WEBVTT

00:00:01.000 --> 00:00:04.000
Welcome to the HTML5 tutorial.

00:00:04.500 --> 00:00:08.000
Today we'll learn about video elements.

00:00:08.500 --> 00:00:12.000
Let's get started.
```

---

## Autoplay Policy

Same as audio — browsers block autoplay with sound:

```html
<!-- ✅ Works: autoplay + muted -->
<video autoplay muted loop playsinline>
  <source src="background.mp4" type="video/mp4">
</video>

<!-- ❌ Usually blocked: autoplay with sound -->
<video autoplay>
  <source src="video.mp4" type="video/mp4">
</video>
```

---

## Responsive Video

### CSS Approach

```css
video {
  width: 100%;
  height: auto;
  max-width: 800px;
}
```

### Aspect Ratio Container

```css
.video-wrapper {
  aspect-ratio: 16 / 9;
  width: 100%;
  max-width: 800px;
}

.video-wrapper video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

### Responsive YouTube Embed

```html
<div style="aspect-ratio: 16 / 9; width: 100%; max-width: 800px;">
  <iframe
    src="https://www.youtube.com/embed/VIDEO_ID"
    width="100%"
    height="100%"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen>
  </iframe>
</div>
```

---

## JavaScript Video API

```javascript
const video = document.getElementById('myVideo');

// Controls
video.play();
video.pause();
video.currentTime = 30;          // Seek
video.volume = 0.5;              // Volume (0-1)
video.playbackRate = 2;          // Speed
video.requestFullscreen();        // Fullscreen

// Properties
video.duration;                   // Total length
video.currentTime;                // Current position
video.paused;                     // Is paused?
video.ended;                      // Has finished?
video.videoWidth;                 // Native width
video.videoHeight;                // Native height

// Events
video.addEventListener('loadedmetadata', () => {
  console.log(`Duration: ${video.duration}s`);
});
video.addEventListener('timeupdate', () => {
  const progress = (video.currentTime / video.duration) * 100;
});
video.addEventListener('ended', () => console.log('Video finished'));
```

---

## Picture-in-Picture (PiP)

```javascript
const video = document.getElementById('myVideo');

// Enter PiP
if (document.pictureInPictureEnabled) {
  video.requestPictureInPicture();
}

// Exit PiP
document.exitPictureInPicture();

// Check if PiP
document.pictureInPictureElement; // Returns the PiP element or null
```

```html
<video id="myVideo" controls>
  <source src="video.mp4" type="video/mp4">
</video>
<button onclick="document.getElementById('myVideo').requestPictureInPicture()">
  PiP Mode
</button>
```

---

## Accessibility

- **Always** provide captions/subtitles (`<track>`)
- Include a `poster` image for context before playback
- Provide **transcripts** for important video content
- Don't autoplay video with sound
- Ensure controls are keyboard-accessible
- Use `prefers-reduced-motion` to limit auto-playing animations

```css
@media (prefers-reduced-motion: reduce) {
  video[autoplay] {
    display: none;
  }
}
```
