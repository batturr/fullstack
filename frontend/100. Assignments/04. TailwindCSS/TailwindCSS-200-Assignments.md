# 200 Tailwind CSS v4 Real-Time Assignments

**Version focus:** Tailwind CSS v4 — `@import "tailwindcss"`, `@theme`, `@utility`, `@variant`, `@plugin`, automatic content detection, CSS custom properties (`--color-*`, `--spacing-*`), OKLCH colors, container queries, 3D transforms, `not-*` / `in-*` variants, and modern utilities like `bg-linear-to-*`.

**How to use:** For each assignment, implement the UI with Tailwind utility classes. When an assignment references design tokens or custom utilities, configure them in CSS (not `tailwind.config.js`).

---

## BEGINNER (Assignments 1–70)

### Layout Basics (1–10)

1. Build a full-viewport section that uses Flexbox to center a single card both horizontally and vertically.
2. Create a three-column grid of equal-width columns with consistent gaps; columns should stack on small screens.
3. Implement a responsive page container: centered, horizontal padding, and a sensible `max-width` at `lg` and above.
4. Build a toolbar that is a column on mobile and a row on `md+`, with items spaced apart.
5. Demonstrate `justify-*` and `items-*` on a flex container with multiple items of different heights.
6. Create a flex row of tags with uniform `gap-*` spacing between items (no manual margins on each tag).
7. Build a “card gallery” flex row that wraps to the next line when space runs out.
8. Use CSS Grid with an explicit template (different fractional column widths) for a simple two-sidebar layout sketch.
9. Create a grid where columns auto-fit with a minimum column width using `grid-cols` / `minmax` style patterns.
10. Hide a promotional banner on small screens and show it from `md` upward; hide secondary nav on mobile only.

### Spacing & Sizing (11–18)

11. Build a content panel demonstrating `p-*` and `m-*` on nested boxes so spacing hierarchy is obvious.
12. Create a centered block element using horizontal auto margins and a fixed `max-width`.
13. Use `space-x-*` / `space-y-*` on a vertical list so children are spaced without per-item margins.
14. Demonstrate `w-*`, `h-*`, and `w-full` on a card inside a constrained parent.
15. Use `min-h-*`, `min-w-*`, and `max-w-*` so text never exceeds a readable line length.
16. Build a video thumbnail placeholder using `aspect-video` (or `aspect-*`) and responsive width.
17. Use the `size-*` utility to make a square avatar placeholder.
18. Combine padding, margin, and `gap-*` in one layout and explain (in comments) which spacing tool you used where.

### Typography (19–28)

19. Show a heading and paragraph with responsive font sizes (`text-sm` → `text-3xl` style progression).
20. Display the same word in multiple `font-weight` utilities side by side.
21. Use semantic text colors (`text-slate-*`, `text-emerald-*`, etc.) for title, body, and muted caption.
22. Align blocks of text `left`, `center`, and `right` in a simple demo row or stack.
23. Apply underline, line-through, and `no-underline` examples on inline text.
24. Adjust letter spacing with `tracking-*` on headings and labels.
25. Use `leading-*` to contrast tight vs relaxed paragraph line height.
26. Truncate a long single-line heading with `truncate` inside a narrow column.
27. Clamp a multi-line description to three lines with `line-clamp-*`.
28. Style rich text using the Typography plugin (`@plugin "@tailwindcss/typography"`) and the `prose` classes.

### Colors & Backgrounds (29–36)

29. Build swatches of `text-*` colors on white and dark backgrounds.
30. Combine `bg-*` and `text-*` for accessible contrast on a call-to-action strip.
31. Create a gradient button or banner using `bg-linear-to-r` with OKLCH-friendly `from-*` / `to-*` stops.
32. Layer opacity with `bg-*` / `text-*` and the `/opacity` modifier (e.g. `bg-slate-900/80`).
33. Use `bg-[url(...)]` (arbitrary image) with overlays for a hero section.
34. Demonstrate `bg-cover`, `bg-center`, and `bg-no-repeat` on a tall hero.
35. Add a focus ring style with `ring-*`, `ring-offset-*`, and rounded corners on a button.
36. Build a vertical list with `divide-y` and `divide-*` border colors between items.

### Borders & Effects (37–44)

37. Create cards with different `border` widths and colors on each side (where practical).
38. Show `rounded-*` variants from none to full pill on buttons and cards.
39. Compare `shadow-sm`, `shadow`, and `shadow-xl` on stacked cards.
40. Combine `ring-*` and `shadow-*` on an input to show focus vs rest states.
41. Style a ghost button using `outline` utilities instead of a filled background.
42. Build a table-like list using `divide-x` / `divide-y` on a flex or grid container.
43. Fade secondary UI with `opacity-*` and restore on `hover:`.
44. Apply `blur-*`, `brightness-*`, and `contrast-*` to an image on hover.

### Responsive Design (45–54)

45. Build a hero that changes padding, font size, and alignment at `sm`, `md`, and `lg`.
46. Demonstrate mobile-first spacing: tight padding on mobile, roomier at `lg`.
47. Make a headline `text-2xl` on mobile and `text-5xl` at `xl`.
48. Convert a single-column card list to two columns at `md` and three at `lg` using grid utilities.
49. Show a “Menu” label on mobile and a full horizontal nav from `md` upward.
50. Hide decorative imagery on small screens; show it from `lg`.
51. Adjust `gap-*` responsively in a card grid (tighter mobile, looser desktop).
52. Switch `flex-col` to `flex-row` at a breakpoint for a feature section.
53. Change `text-left` to `text-center` at `md` for a marketing band.
54. Constrain content to a wider `max-width` at `2xl` while staying centered.

### States (55–62)

55. Style a button with distinct `hover:` background and text colors.
56. Add a visible `focus:` ring on links and buttons for keyboard users.
57. Show `active:` scale or background change on a pressable card.
58. Dim a button with `disabled:` opacity and remove pointer interaction.
59. Use `group` / `group-hover:` to reveal an icon when hovering a card.
60. Build a toggle row where `peer` and `peer-checked:` style a custom track.
61. Highlight a search field container with `focus-within:` ring when any child input is focused.
62. Use `focus-visible:` (not plain `focus:`) to show outlines only for keyboard focus.

### Basic Components (63–70)

63. Primary, secondary, and danger button variants sharing consistent padding and radius.
64. A card with header, body, footer regions and subtle border/shadow.
65. Pill badges for “New”, “Beta”, and “Sale” with different color themes.
66. Avatar stack (overlapping circles) for a fake team list.
67. Alert banners for success, warning, and error with icons and dismiss affordance (non-JS markup OK).
68. Responsive navbar: brand left, links center/right, collapsible placeholder for mobile.
69. Text input with label, helper text, and error state classes.
70. Simple two-field form (name, email) with stacked labels and a submit button.

---

## INTERMEDIATE (Assignments 71–140)

### Advanced Layouts (71–84)

71. Sticky header that stays visible while scrolling a long article body.
72. Classic sidebar + content layout: fixed sidebar width on desktop, stacked on mobile.
73. “Holy grail” sketch: header, footer, main + two side columns using grid.
74. Dashboard grid: sidebar, topbar, and main widget area with cards.
75. Responsive card grid where cards stretch evenly in each row.
76. Masonry-like layout using column utilities or grid dense packing patterns.
77. Footer pushed to the bottom on short pages (`min-h-dvh` flex column pattern).
78. Scrollable sidebar panel with independent overflow from the main content.
79. Fixed footer bar for mobile actions that does not overlap readable content (add bottom padding).
80. Layered UI: modal backdrop, modal, and toast with explicit `z-*` values.
81. Long chat-like column that scrolls internally while header stays put.
82. Split pane: scrollable list left, detail pane right (stacks on mobile).
83. Horizontal scrolling chip list with hidden scrollbar aesthetic (still accessible).
84. Sticky section headings within an `overflow-y-auto` container.

### Animations & Transitions (85–94)

85. Button color transition using `transition-colors` and `duration-*`.
86. Card lift effect: `hover:` translate and shadow with `transition-all`.
87. Use `animate-spin` on a loader icon.
88. Use `animate-ping` on a notification dot.
89. Use `animate-bounce` sparingly on a CTA chevron.
90. Define custom `@keyframes` in CSS and expose them via `@theme` for a `animate-*` utility.
91. `hover:` scale transform on a product tile.
92. Rotate an element in 3D on hover using `rotate-x-*` / `rotate-y-*` / `perspective-*`.
93. Combine `translate-*` and `rotate-*` for a playful hover state.
94. Tune `duration-*` and `ease-*` on a sliding panel (markup-only).

### Dark Mode (95–102)

95. Opt-in dark styles using the `dark:` variant on a card component.
96. Respect system theme using `prefers-color-scheme` driven dark mode (document the `dark` class strategy in a comment).
97. Build a manual theme toggle button (two variants side by side) using `dark:` classes on a wrapper.
98. Dark-mode-friendly dashboard cards with distinct border and background tokens.
99. Styled form controls that remain legible in dark mode.
100. Navbar that adapts background, text, and borders in dark mode.
101. Extract repeated light/dark colors into `@theme` variables and use mapped utilities.
102. Gradient hero that flips gradient direction or stops between light and dark themes.

### Forms (103–114)

103. Text inputs with filled and outlined styles.
104. Styled `<select>` with custom arrow appearance using utilities (wrapper div pattern).
105. Custom checkbox visual using `peer` and `appearance-none`.
106. Radio group styled as segmented control.
107. iOS-style switch using `peer-checked:` and rounded full track.
108. Range slider styled with accent-friendly utilities and width constraints.
109. File input row with button-like `file:` selector styling.
110. Input group: leading icon, input, trailing button.
111. Floating label pattern (CSS-only) for an email field.
112. Validation states: `border-emerald-*` for success, `border-red-*` for error.
113. Search field with clear icon spacing and `focus-within:` ring on wrapper.
114. `textarea` with auto `min-h-*`, `resize-y`, and character hint text.

### Advanced Components (115–126)

115. Dropdown menu panel positioned under a button (CSS-only hover/focus pattern).
116. Modal dialog markup using `<dialog>` with backdrop styling classes.
117. Tabs: list of triggers and panels with active state styles (no JS required beyond details/summary if you prefer).
118. Accordion with `details` / `summary` and animated chevron.
119. Tooltip on hover using `group-hover:` and absolutely positioned bubble.
120. Toast stack fixed to the corner with shadow and border.
121. Breadcrumb trail with separators and `truncate` on small screens.
122. Pagination row with previous/next and numbered pages.
123. Stepper showing three steps with connectors and active/completed states.
124. Vertical timeline with dots and connecting line.
125. Pricing card with highlighted “Popular” tier and feature list.
126. Testimonial card with avatar, quote, and star rating row.

### Container Queries & Modern Variants (127–134)

127. Mark a card wrapper as `@container` and change layout at `@md` container sizes.
128. Card that switches from stacked to horizontal when its container is wide enough.
129. Grid inside a container that reflows based on container width, not only viewport.
130. Use `not-hover:` to dim helper text when the parent is *not* hovered.
131. Parent highlights when it `has-[:checked]` using `has-*` utilities.
132. Use `in-data-[state=open]:` or `in-aria-expanded-*:` style patterns on nested labels (document expected attributes).
133. Combine `group-has-*` to style a row when an inner checkbox is checked.
134. Style a button differently when `data-variant="ghost"` using arbitrary `data-*` variants.

### Customization (135–140)

135. Add brand colors as OKLCH values inside `@theme` and use them as `bg-*` / `text-*`.
136. Extend spacing with a custom `--spacing-*` token and use it in `p-*`, `m-*`, or `gap-*`.
137. Register a custom font family in `@theme` and apply with `font-*` utilities.
138. Create a `@utility` that applies a reusable cluster of utilities (document the CSS).
139. Create a `@variant` (e.g. `hocus:` for hover+focus) and demonstrate on a link.
140. Use arbitrary values such as `top-[137px]` and `w-[73cqw]` in a layout sketch.

---

## ADVANCED (Assignments 141–200)

### Complex Components (141–152)

141. Animated hamburger icon that morphs into an `X` using transitions (checkbox or `peer` hack).
142. Mega menu dropdown with multi-column groups (CSS hover/focus visibility).
143. Image gallery grid with a “lightbox” overlay frame (static markup; dimmed backdrop).
144. Drag-and-drop *style* list: cards with “handle”, elevation, and reordering hints (visual only).
145. Kanban board: columns, cards, tags, and scrollable columns.
146. Chat UI: bubbles, timestamps, sticky composer bar, unread divider.
147. Notification center panel list with icons, unread dot, and time stamps.
148. Command palette mock: search input, grouped results, kbd hints.
149. Month calendar grid with headers, cells, and an “event” chip on a day.
150. Data table with sortable column headers (buttons) and zebra rows.
151. Infinite scroll *skeleton* list showing placeholder cards.
152. Multi-select tags input visual: chips, input inline, and dropdown panel.

### Design System (153–162)

153. Define a complete brand palette in `@theme` using OKLCH and semantic names (`--color-brand-*`).
154. Build a spacing scale snippet in `@theme` and demo boxes for each step.
155. Typography scale in `@theme` (`--text-*`, line heights) applied to a type specimen page.
156. Document buttons, inputs, and cards as reusable HTML patterns using the same tokens.
157. Map semantic tokens (`surface`, `muted`, `danger`) to utilities via `@theme`.
158. Build a “token gallery” page that lists swatches and labels for teaching.
159. Create primary/secondary/ghost button components using only shared utility clusters.
160. Align border radii and shadows across card + modal + popover examples.
161. Build a compact and comfortable density toggle using different `gap-*` / `p-*` presets.
162. Show how CSS variables from `@theme` surface as utilities on sample components.

### Advanced Patterns (163–174)

163. Glassmorphism card: translucent background, blur, subtle border on a bright photo hero.
164. Soft neumorphism-inspired panel using layered shadows (tasteful, not extreme).
165. Gradient mesh background using multiple blurred blobs in absolute layers.
166. Animated gradient border around a card using pseudo-element technique (CSS + utilities).
167. Text gradient heading using `bg-linear-to-r` with `bg-clip-text` and `text-transparent`.
168. Parallax-like layers: background moves slower using transforms on scroll simulation (static demo OK).
169. CSS-only carousel strip with overflow, snap points, and arrow buttons as links.
170. Animated counter aesthetic: tabular numbers and `transition` on opacity (no real JS counter required).
171. Typing animation using `steps()` keyframes in custom CSS referenced by `@theme`.
172. Skeleton placeholders for avatar, text lines, and image block.
173. Shimmer loading bar or card using `animate-*` and gradient background.
174. Aurora / northern lights background with slow moving gradients.

### Performance & Optimization (175–180)

175. Show a *safe* pattern for dynamic class names (avoid string concatenation that breaks compilation).
176. Demonstrate `@source` usage in CSS to include extra content paths for class detection.
177. Compare `@theme` vs `@theme inline` with a short comment on when inlining helps.
178. Build a component using CSS variables (`var(--custom)`) without inventing unseen utilities.
179. Show conditional classes using data attributes instead of interpolated Tailwind strings.
180. Responsive `<img>` or `<picture>` markup with `object-cover` and sized containers.

### Accessibility (181–186)

181. Visible `focus-visible:` styles on all interactive controls in a mini form.
182. Use `forced-colors:` adjustments for buttons and links in high-contrast mode.
183. Enhance borders for `contrast-more:` users on subtle cards.
184. Replace distracting motion with reduced animations under `motion-reduce:`.
185. Accessible skip link that is off-screen until `focus:` using `sr-only` and `focus:not-sr-only` patterns.
186. Associate labels, inputs, `aria-invalid`, and hint text using utility-based layout.

### Real-World Projects (187–200)

187. Landing page hero + features + testimonial + footer for a fictional SaaS.
188. Portfolio grid with project cards, tags, and contact strip.
189. Blog layout: article column, sidebar with TOC and author card.
190. E-commerce product page: gallery, title, price, variants, add-to-cart area.
191. Admin dashboard with sidebar, stats row, chart placeholders, and table.
192. Pricing page with three tiers and FAQ accordion.
193. Restaurant menu with sections, dietary badges, and prices.
194. Login and signup cards side by side on desktop, stacked mobile.
195. Weather app UI: current temperature, weekly row, wind/humidity chips.
196. Social feed cards with avatar, media placeholder, actions row.
197. Job listing page with filters sidebar and job cards.
198. Documentation page with sidebar nav, content column, and on-this-page anchors.
199. SaaS homepage with logo wall, feature grid, metrics, and CTA band.
200. Mobile app frame UI: bottom tab bar, header, scrollable content cards.
