# 13. Audio

## Basic Usage

```html
<audio controls>
  <source src="song.mp3" type="audio/mpeg">
  <source src="song.ogg" type="audio/ogg">
  Your browser does not support the audio element.
</audio>
```

- `<audio>` is the container element
- `<source>` provides multiple formats (browser picks the first supported one)
- Text inside is the **fallback** for non-supporting browsers

---

## Attributes

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `controls` | Show play/pause, volume, progress | `<audio controls>` |
| `autoplay` | Start playing automatically | `<audio autoplay>` |
| `loop` | Repeat indefinitely | `<audio loop>` |
| `muted` | Start muted | `<audio muted>` |
| `preload` | Preload strategy | `preload="auto"` |
| `src` | Audio source (if no `<source>` elements) | `src="song.mp3"` |

### `preload` Values

| Value | Behavior |
|-------|----------|
| `none` | Don't preload (saves bandwidth) |
| `metadata` | Load only metadata (duration, dimensions) |
| `auto` | Let the browser decide (may load entire file) |

```html
<!-- Minimal — just metadata -->
<audio controls preload="metadata">
  <source src="podcast.mp3" type="audio/mpeg">
</audio>

<!-- Autoplay + muted + loop (background audio) -->
<audio autoplay muted loop>
  <source src="ambient.mp3" type="audio/mpeg">
</audio>
```

---

## Supported Audio Formats

| Format | MIME Type | Browser Support |
|--------|-----------|----------------|
| **MP3** | `audio/mpeg` | All modern browsers |
| **WAV** | `audio/wav` | All modern browsers |
| **OGG** | `audio/ogg` | Chrome, Firefox, Opera (not Safari) |
| **AAC** | `audio/aac` | Chrome, Safari, Edge |
| **FLAC** | `audio/flac` | Chrome, Firefox, Edge |
| **WebM** | `audio/webm` | Chrome, Firefox, Opera |

> **Best practice:** Provide **MP3** as the primary format (universal support).

---

## Autoplay Policy

Modern browsers **block autoplay with sound** to improve user experience:

- `autoplay` alone: **Blocked** by most browsers
- `autoplay muted`: **Allowed** (starts muted)
- User interaction first: Allowed after user clicks/taps on the page

```html
<!-- ✅ This works: autoplay but muted -->
<audio autoplay muted>
  <source src="bg-music.mp3" type="audio/mpeg">
</audio>

<!-- ❌ This is usually BLOCKED by browsers -->
<audio autoplay>
  <source src="bg-music.mp3" type="audio/mpeg">
</audio>
```

---

## JavaScript Audio API

```javascript
const audio = document.getElementById('myAudio');

// Controls
audio.play();                    // Play
audio.pause();                   // Pause
audio.currentTime = 0;           // Seek to start
audio.currentTime = 30;          // Seek to 30 seconds
audio.volume = 0.5;              // Set volume (0 to 1)
audio.muted = true;              // Mute
audio.playbackRate = 1.5;        // Speed (1 = normal)

// Properties
audio.duration;                  // Total length in seconds
audio.currentTime;               // Current position
audio.paused;                    // Is paused?
audio.ended;                     // Has finished?

// Events
audio.addEventListener('play', () => console.log('Playing'));
audio.addEventListener('pause', () => console.log('Paused'));
audio.addEventListener('ended', () => console.log('Finished'));
audio.addEventListener('timeupdate', () => {
  console.log(audio.currentTime);
});
audio.addEventListener('error', (e) => console.error('Error', e));
```

### Create Audio Programmatically

```javascript
const audio = new Audio('notification.mp3');
audio.play();
```

---

## Custom Audio Player

```html
<div class="audio-player">
  <audio id="player" preload="metadata">
    <source src="song.mp3" type="audio/mpeg">
  </audio>
  <button id="playBtn">▶</button>
  <input type="range" id="progress" value="0" min="0" max="100">
  <span id="time">0:00 / 0:00</span>
  <input type="range" id="volume" value="100" min="0" max="100">
</div>
```

---

## Accessibility

```html
<figure>
  <figcaption>Listen to the podcast episode:</figcaption>
  <audio controls>
    <source src="podcast-ep1.mp3" type="audio/mpeg">
    <a href="podcast-ep1.mp3">Download podcast (MP3, 15 MB)</a>
  </audio>
</figure>
```

- Always provide **transcripts** for important audio content
- Include a **download link** as fallback
- Use `<figure>` + `<figcaption>` to label audio content
