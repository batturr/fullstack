# MODULE 8: Prompt Engineering for Multimodal AI

---

## 8.1 Understanding Multimodal Models

### What Are Multimodal Models?
Multimodal models can process and generate content across **multiple data types** (modalities) simultaneously — text, images, audio, and video. Unlike traditional models that handle only one modality, these models understand the relationships between different types of content.

For example, a multimodal model can:
- Look at a photo and describe what's happening
- Read a chart and answer questions about the data
- Listen to audio and generate a transcript with analysis
- Generate an image from a text description
- Process a video and summarize its content

### Key Multimodal Models (2024–2026)

**GPT-4o (OpenAI)**:
- "Omni" model — natively processes text, images, and audio
- Can see images, interpret screenshots, read documents
- Real-time voice conversation with emotional expression
- Generates text and can trigger image generation via DALL-E

**GPT-4V / GPT-4 Vision (OpenAI)**:
- Predecessor to GPT-4o focused on text + image understanding
- Accepts images as input alongside text prompts
- Cannot generate images — only understands them

**Gemini Pro Vision / Gemini 2.0 (Google)**:
- Natively multimodal from the ground up (not retrofitted)
- Processes text, images, audio, video
- 1M–2M token context window enables processing entire books or hours of video
- Integrated with Google Search for grounding

**Claude 3.5 Sonnet / Claude 3 Opus (Anthropic)**:
- Strong vision capabilities — reads images, charts, documents
- Particularly good at analyzing complex visual data (tables, diagrams)
- 200K token context window
- Cannot generate images

### Architecture Overview: How Models Process Multiple Modalities
Multimodal models typically use one of two approaches:

**Unified architecture** (Gemini):
- All modalities processed by a single model from the start
- Images, text, and audio are tokenized into a shared representation space
- The model learns cross-modal relationships during pre-training

**Modular architecture** (GPT-4V/4o):
- Separate encoders for each modality (vision encoder, audio encoder, text encoder)
- A fusion layer combines the representations
- The language model decoder generates text outputs based on the fused representation

**Image tokenization**: Images are typically divided into patches (e.g., 16×16 pixel patches), each patch is converted into a token embedding, and these visual tokens are processed alongside text tokens.

### Current Capabilities and Limitations

**Capabilities**:
- Image description and analysis (objects, scenes, text, emotions)
- Chart and graph interpretation
- Document/PDF reading and extraction
- Optical Character Recognition (OCR)
- Spatial reasoning (relative positions of objects)
- Visual question answering
- Multi-image comparison

**Limitations**:
- Counting objects accurately (especially >10 items)
- Reading small or blurry text in images
- Understanding spatial relationships in complex scenes
- Processing very high-resolution images (they're typically downscaled)
- Recognizing specific people (deliberately restricted for privacy)
- Understanding video temporal dynamics (frame-by-frame analysis is limited)
- Hallucinating details in images (seeing things that aren't there)

---

## 8.2 Image Understanding and Analysis

### Prompting Vision Models for Image Description
Basic pattern: attach an image and ask a question about it.

**Generic description**:
```
Describe this image in detail. Include:
- Main subjects and their actions
- Setting and environment
- Colors, lighting, and mood
- Any text visible in the image
- Notable details a casual viewer might miss
```

**Targeted description**:
```
Describe this image from the perspective of a real estate agent writing a listing.
Focus on: room size estimation, natural lighting, finishes, and selling points.
```

### Object Detection and Counting via Prompts
```
"Look at this image and:
1. List every distinct object you can identify
2. Count the number of people visible
3. Identify any text or signage
4. Note the approximate time of day based on lighting"
```

**Tip**: Models struggle with precise counting. For critical counting tasks, say:
```
"Count the items carefully. Point to each one as you count. 
If you're uncertain, provide a range (e.g., '8-10 items')."
```

### OCR (Optical Character Recognition) with LLMs
Vision models can read text in images — handwritten, printed, or stylized:

```
"Read all text visible in this image. 
Organize it by location (top-left, center, bottom, etc.).
Maintain the original formatting as much as possible.
If any text is partially obscured, indicate this with [unclear]."
```

**For structured documents**:
```
"This is a scanned receipt. Extract:
- Store name
- Date and time
- Each line item (name, quantity, price)
- Subtotal, tax, and total
- Payment method
Return as a JSON object."
```

### Chart and Graph Interpretation
```
"Analyze this chart and provide:
1. Chart type (bar, line, pie, scatter, etc.)
2. What the axes represent (including units)
3. Key data points and values
4. Trends or patterns
5. Outliers or anomalies
6. A plain-English summary of what the chart shows

Be precise with numbers — read values from the chart as accurately as possible."
```

### Medical Image Analysis Prompting
```
"Describe what you observe in this medical image.

IMPORTANT DISCLAIMERS:
- This is for educational/informational purposes only
- This does not constitute a medical diagnosis
- Always consult a qualified healthcare professional

Describe:
- Type of imaging (X-ray, CT, MRI, ultrasound, etc.)
- Anatomical region shown
- Notable observations (without making diagnostic claims)
- Image quality and orientation"
```

### Comparative Image Analysis
```
"Compare these two images side by side:

Image 1: [first image]
Image 2: [second image]

Identify:
1. Similarities between the images
2. Key differences
3. Changes that occurred between them (if they're before/after)
4. Which elements are present in one but not the other"
```

### Spatial Reasoning in Images
```
"Describe the spatial layout of this room:
- Where is the furniture positioned relative to doors and windows?
- Approximate dimensions based on standard object sizes
- Traffic flow patterns
- What's in the foreground vs. background?"
```

---

## 8.3 Text-to-Image Prompt Engineering

### DALL-E 3 Prompting Strategies

DALL-E 3 (integrated into ChatGPT and API) generates images from text descriptions. It has a strong language understanding model that interprets prompts.

**Subject description — specificity and detail**:
```
Vague: "A dog in a park"
Better: "A golden retriever puppy sitting in a sunlit meadow of wildflowers, 
looking directly at the camera with its tongue out, ears perked up"
```

More detail = more control over the output. Describe: subject, action/pose, expression, setting.

**Style keywords**:
```
- Photorealistic, hyperrealistic, photograph, DSLR photo
- Oil painting, watercolor, acrylic painting
- Digital art, concept art, matte painting
- Pencil sketch, charcoal drawing, ink illustration
- Pixel art, voxel art, low-poly 3D
- Anime, manga, Studio Ghibli style
- Minimalist, flat design, vector illustration
- Surrealist, impressionist, Art Deco, Art Nouveau
```

**Composition terms**:
```
- Close-up, extreme close-up, macro
- Medium shot, full body shot
- Wide-angle, panoramic, landscape orientation
- Bird's-eye view, aerial view
- Worm's-eye view, low angle
- Dutch angle, tilted
- Rule of thirds, centered composition
- Negative space, symmetrical
```

**Lighting descriptions**:
```
- Golden hour, sunset lighting, warm tones
- Blue hour, twilight
- Studio lighting, softbox, ring light
- Dramatic lighting, chiaroscuro, Rembrandt lighting
- Backlighting, silhouette
- Neon lighting, cyberpunk glow
- Natural daylight, overcast, diffused light
- Candlelight, firelight, warm ambient
```

**Color palette specification**:
```
- "Muted earth tones: olive green, terracotta, cream"
- "Vibrant neon colors against a dark background"
- "Monochromatic blue palette, from navy to sky blue"
- "Pastel color scheme: soft pink, lavender, mint"
- "High contrast black and white with a single red element"
```

**Negative prompting (what to avoid)**:
DALL-E 3 handles this through natural language:
```
"Do not include any text or watermarks in the image.
Avoid distorted faces or extra fingers.
The background should not be cluttered."
```

**Complete DALL-E 3 prompt example**:
```
"A cozy bookshop interior on a rainy evening. Warm golden lighting from vintage 
pendant lamps illuminates floor-to-ceiling wooden bookshelves packed with colorful 
books. A tabby cat sleeps curled up on a worn leather armchair. Rain streams down 
the large front window, reflecting the warm interior light. A steaming cup of tea 
sits on a small round table beside the chair. Style: photorealistic with warm, 
inviting atmosphere. Shot on a 35mm lens with shallow depth of field. 
No text or watermarks."
```

### Midjourney Prompting

Midjourney uses Discord or its web interface and has its own parameter system.

**Parameter flags**:
```
--ar 16:9        (aspect ratio: 16:9 widescreen)
--ar 1:1         (square)
--ar 9:16        (portrait/mobile)
--v 6.1          (model version)
--s 250          (stylize: 0=less artistic, 1000=very artistic)
--c 20           (chaos: 0=predictable, 100=very varied)
--q 2            (quality: higher = more detail, slower)
--no plants      (negative prompt: exclude plants)
--seed 12345     (reproducibility)
```

**Multi-prompt syntax with :: weights**:
```
"cyberpunk city::2 sunset::1 rain::0.5"
```
This means: cyberpunk city is twice as important as sunset, which is twice as important as rain.

**Style references and image blending**:
```
--sref [URL]     (use another image as style reference)
--cref [URL]     (character reference — maintain character consistency)
--iw 1.5         (image weight — how much to follow reference)
```

**Permutation prompts** (generate multiple variations):
```
"A {red, blue, green} dragon in a {forest, desert, ocean}"
→ Generates all 9 combinations
```

### Stable Diffusion Prompting

Stable Diffusion (open-source, run locally) uses a different prompting style.

**Positive and negative prompt design**:
```
Positive: "masterpiece, best quality, ultra-detailed, 8K, professional photo, 
a majestic lion standing on a rocky cliff at sunset, dramatic lighting, 
volumetric clouds, golden hour"

Negative: "low quality, blurry, distorted, deformed, ugly, watermark, text, 
extra limbs, bad anatomy, bad hands, missing fingers, cropped"
```

**Prompt weighting with (parentheses) and [brackets]**:
```
"A (beautiful:1.3) garden with [minimal:0.7] flowers"
(parentheses) = increase weight
[brackets] = decrease weight
Number = specific weight multiplier
```

**Embedding triggers and LoRA keywords**:
When using custom-trained models (LoRAs):
```
"photo of a woman, <lora:specific_style:0.8>, wearing a red dress"
```
The LoRA trigger word activates the custom style/character.

**Sampler and step count considerations**:
- **Steps**: 20–30 is typical. More steps = more refined but slower.
- **Samplers**: Euler a (fast, good quality), DPM++ 2M Karras (high quality), DDIM (consistent)
- **CFG Scale** (Classifier-Free Guidance): 
  - 1–4: very creative, may ignore prompt
  - 7–9: balanced (most common)
  - 12–20: strict prompt adherence, may look artificial

### Common Image Prompt Frameworks

**Subject + Style + Environment + Lighting + Camera + Color**:
```
Subject: "An elderly Japanese craftsman"
Style: "documentary photography"
Environment: "in a traditional pottery workshop"
Lighting: "soft natural light from a side window"
Camera: "shot on 85mm lens, f/1.8, shallow depth of field"
Color: "warm muted tones, earth colors"
```

**The "prompt matrix" technique**:
Systematically vary one element while keeping others constant:
```
Base: "A castle on a hilltop"
Vary style: [photorealistic | watercolor | pixel art | oil painting]
→ 4 variations showing how style affects the same subject
```

---

## 8.4 Text-to-Video Prompting

### Current Platforms
- **Sora (OpenAI)**: high-quality, physically consistent videos up to 60 seconds
- **Runway Gen-3 Alpha**: fast iteration, good for creative work
- **Pika Labs**: accessible, good for short clips
- **Veo 2/3 (Google)**: strong physical understanding, long-form potential

### Describing Motion and Temporal Sequences
Video prompts must describe **what changes over time**:
```
"A time-lapse of a flower blooming: starting as a tight green bud, 
slowly opening its petals to reveal vibrant purple with yellow stamens, 
completing the bloom over approximately 5 seconds. Soft morning light 
gradually brightens. Shallow depth of field with a blurred garden background."
```

### Camera Movement Keywords
```
- Pan left/right: camera rotates horizontally
- Tilt up/down: camera rotates vertically  
- Dolly in/out: camera physically moves toward/away from subject
- Tracking shot: camera follows a moving subject
- Crane shot: camera rises or descends vertically
- Steadicam: smooth handheld following movement
- Zoom in/out: lens focal length changes (not camera movement)
- Static/locked: camera doesn't move at all
- 360° orbit: camera circles around the subject
- Whip pan: very fast pan creating motion blur
```

**Example**:
```
"Camera slowly dollies forward through a misty forest at dawn. 
Tracking a fox trotting along a fallen log. Camera pulls back to reveal 
the full forest landscape as sunlight breaks through the canopy. 
Cinematic, 24fps, anamorphic lens flare."
```

### Scene Transition Descriptions
```
"Scene 1: Close-up of hands typing on a keyboard in a dark room. 
[Cut to] Scene 2: Wide shot of a bustling open-plan office at midday. 
[Dissolve to] Scene 3: Same office at night, empty desks, cleaning crew."
```

### Duration and Pacing Control
```
"Create a 10-second video. Pacing: slow and contemplative. 
First 3 seconds: establishing wide shot. 
Seconds 4-7: slow zoom into the subject. 
Seconds 8-10: subject turns and looks at camera."
```

---

## 8.5 Text-to-Audio and Music Generation

### Prompting Audio Models
Platforms: Suno, Udio, MusicLM (Google), Stable Audio

**Music generation**:
```
"Create a 2-minute instrumental track:
Genre: lo-fi hip hop
Tempo: 85 BPM
Mood: relaxed, nostalgic, slightly melancholic
Instruments: mellow electric piano, vinyl crackle, soft drum loop, 
subtle bass, distant jazz saxophone sample
Structure: 8-bar intro → verse loop → bridge with piano solo → return to main loop → fade out"
```

### Genre, Mood, Tempo, and Instrument Specification
```
Genre keywords: pop, rock, jazz, classical, electronic, ambient, hip-hop, R&B, folk, country, metal
Mood keywords: happy, sad, energetic, calm, dark, uplifting, mysterious, romantic, aggressive, dreamy
Tempo: slow (60-80 BPM), moderate (80-120 BPM), fast (120-160 BPM), very fast (160+ BPM)
Instruments: piano, guitar, drums, bass, synth, violin, cello, trumpet, flute, organ, percussion
```

### Sound Effect Generation
```
"Generate a sound effect: heavy rain on a tin roof with distant thunder 
and occasional close lightning cracks. Duration: 30 seconds. 
The thunder should gradually get closer over the clip."
```

### Voice Synthesis Prompting
```
"Generate speech with these characteristics:
Voice: warm female voice, mid-30s
Accent: neutral American English
Tone: professional but friendly, like a podcast host
Pace: moderate, with natural pauses at commas and periods
Emphasis: stress the words in [brackets]

Text to speak: 'Welcome to [The Future of AI], a podcast where we explore...'"
```

---

## 8.6 Document and PDF Understanding

### Multi-Page Document Analysis
```
"I'm uploading a 20-page quarterly report. Please:
1. Read the entire document
2. Create a structured summary organized by section
3. Extract all financial figures into a table
4. List all action items or recommendations mentioned
5. Identify any risks or concerns flagged in the report
6. Note any data that seems inconsistent across sections"
```

### Table Extraction from Images
```
"This image contains a data table. Extract all data from the table and 
reproduce it as a markdown table. Preserve:
- All column headers
- All row labels
- All numerical values (maintain original precision)
- Any footnotes or annotations
If any cell is unclear, mark it as [unclear]."
```

### Form Parsing and Data Extraction
```
"This is a scanned application form. Extract all filled-in fields:
- Map each field label to its value
- Return as a JSON object
- For checkboxes, return true/false
- For empty fields, return null
- For handwritten entries that are hard to read, provide your best guess 
  with a confidence level (high/medium/low)"
```

### Handwriting Recognition Prompting
```
"This image contains handwritten text. Please:
1. Transcribe the handwritten text as accurately as possible
2. Maintain paragraph structure
3. Mark uncertain words with [?]
4. Note any drawings, arrows, or non-text elements as [diagram: description]
5. If there are crossed-out words, include them as ~~strikethrough~~"
```

### Combining OCR with Structured Output Generation
```
"Process this business card image:
1. Read all text from the card
2. Identify and categorize each piece of information
3. Return as a structured vCard-compatible JSON:
{
  'name': '',
  'title': '',
  'company': '',
  'email': '',
  'phone': '',
  'address': '',
  'website': '',
  'social_media': {}
}"
```

---

> **Key Takeaway for Module 8**: Multimodal AI extends prompt engineering beyond text. Image understanding requires descriptive precision, text-to-image generation demands knowledge of visual vocabulary (style, lighting, composition), and video/audio generation adds temporal dimensions. The core principle remains the same: the more specific and structured your prompt, the better the output. Each modality has its own vocabulary and best practices — mastering them multiplies your creative and analytical capabilities.
