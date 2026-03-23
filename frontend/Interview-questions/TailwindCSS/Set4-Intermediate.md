# Tailwind CSS v4 MCQ - Set 4 (Intermediate Level)

**1. Which utility applies a continuous rotation animation?**

a) `animate-rotate`  
b) `animate-spin`  
c) `spin-360`  
d) `motion-spin`

**Answer: b) `animate-spin`**

---

**2. Which utility creates a radar-like expanding ring effect?**

a) `animate-ping`  
b) `animate-pulse`  
c) `animate-bounce`  
d) `animate-ring`

**Answer: a) `animate-ping`**

---

**3. Which utility softly fades opacity on a repeating cycle?**

a) `animate-bounce`  
b) `animate-pulse`  
c) `animate-ping`  
d) `animate-wiggle`

**Answer: b) `animate-pulse`**

---

**4. Which utility applies a vertical bouncing keyframe?**

a) `animate-spring`  
b) `animate-bounce`  
c) `animate-jump`  
d) `animate-elastic`

**Answer: b) `animate-bounce`**

---

**5. In v4, custom named animations are typically wired through theme tokens like:**

```css
@theme {
  --animate-wiggle: wiggle 1s ease-in-out infinite;
}
```

a) `animation-wiggle: ...` in `@theme`  
b) `--animate-wiggle` mapping to keyframes name and timing  
c) `@keyframes` inside `tailwind.config.js`  
d) `@utility animate-wiggle only` without `@theme`

**Answer: b) `--animate-wiggle` mapping to keyframes name and timing**

---

**6. Where should `@keyframes wiggle` live in a v4 CSS-first project?**

a) Only in `tailwind.config.js` `theme.extend.keyframes`  
b) In your CSS stylesheet alongside `@import "tailwindcss"` and `@theme`  
c) Inside `node_modules` only  
d) It is not supported in v4

**Answer: b) In your CSS stylesheet alongside `@import "tailwindcss"` and `@theme`**

---

**7. After defining keyframes and `--animate-fade` in CSS (see below), which class uses the animation?**

```css
@keyframes fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
@theme {
  --animate-fade: fade 0.2s ease-out both;
}
```

a) `transition-fade`  
b) `animate-fade`  
c) `motion-fade`  
d) `keyframes-fade`

**Answer: b) `animate-fade`**

---

**8. Which class applies a conic gradient background?**

a) `bg-conic-180`  
b) `bg-radial-to-r`  
c) `bg-linear-to-t`  
d) `conic-from-red`

**Answer: a) `bg-conic-180`**

---

**9. Radial gradients in v4 use utilities such as:**

a) `bg-radial-*`  
b) `bg-circle-*` only  
c) `radial-bg` without variants  
d) `gradient-radial` only in plugins

**Answer: a) `bg-radial-*`**

---

**10. For a radial gradient, color stops still use:**

a) `from-*` / `via-*` / `to-*`  
b) `inner-*` / `outer-*`  
c) `start-*` / `finish-*`  
d) Only `color-*` without stops

**Answer: a) `from-*` / `via-*` / `to-*`**

---

**11. Which utilities hide content visually but keep it available to assistive tech?**

a) `hidden`  
b) `sr-only`  
c) `invisible`  
d) `opacity-0`

**Answer: b) `sr-only`**

---

**12. Which utility undoes screen-reader-only clipping for a breakpoint?**

a) `sr-visible`  
b) `not-sr-only`  
c) `show-all`  
d) `a11y-show`

**Answer: b) `not-sr-only`**

---

**13. Which class sets CSS multi-column layout to 3 columns?**

a) `cols-3`  
b) `columns-3`  
c) `column-count-3`  
d) `multicolumn-3`

**Answer: b) `columns-3`**

---

**14. Which class uses a Tailwind column width token like `columns-sm`?**

a) It sets `column-width` using the `sm` scale token  
b) It forces exactly 12 columns  
c) It disables columns  
d) It only works with flexbox

**Answer: a) It sets `column-width` using the `sm` scale token**

---

**15. Which utility clamps text to 2 lines with ellipsis?**

a) `truncate-2`  
b) `line-clamp-2`  
c) `ellipsis-2`  
d) `clamp-lines-2`

**Answer: b) `line-clamp-2`**

---

**16. Which class removes line clamping?**

a) `line-clamp-none`  
b) `unclamp`  
c) `line-clamp-0`  
d) `text-wrap-all`

**Answer: a) `line-clamp-none`**

---

**17. Which utility opts into smooth scrolling for anchor navigation?**

a) `scroll-smooth`  
b) `smooth-scroll`  
c) `behavior-smooth`  
d) `anchor-smooth`

**Answer: a) `scroll-smooth`**

---

**18. Which utility restores default instant scrolling?**

a) `scroll-instant`  
b) `scroll-auto`  
c) `scroll-normal`  
d) `scroll-default`

**Answer: b) `scroll-auto`**

---

**19. Which class aligns snap children to the start of the scroll container?**

```html
<div class="flex snap-x snap-mandatory overflow-x-auto">
  <section class="snap-start shrink-0 w-full">A</section>
</div>
```

a) `snap-align-start`  
b) `snap-start`  
c) `scroll-snap-left`  
d) `snap-to-start-only`

**Answer: b) `snap-start`**

---

**20. Which class centers the snapped item in the viewport along the scroll axis?**

a) `snap-middle`  
b) `snap-center`  
c) `snap-mid`  
d) `snap-align-center`

**Answer: b) `snap-center`**

---

**21. Which utility makes scroll snapping strict (must land on a snap point)?**

a) `snap-mandatory`  
b) `snap-strict`  
c) `snap-required`  
d) `snap-lock`

**Answer: a) `snap-mandatory`**

---

**22. Which utility allows snapping but tolerates in-between positions?**

a) `snap-loose`  
b) `snap-proximity`  
c) `snap-soft`  
d) `snap-flex`

**Answer: b) `snap-proximity`**

---

**23. Which utility sets `touch-action: manipulation` to reduce double-tap zoom delay on buttons?**

a) `touch-pinch`  
b) `touch-manipulation`  
c) `tap-manipulation`  
d) `gesture-manipulation`

**Answer: b) `touch-manipulation`**

---

**24. Which utility allows panning on the x-axis only?**

a) `touch-pan-x`  
b) `pan-x-only`  
c) `scroll-touch-x`  
d) `touch-horizontal`

**Answer: a) `touch-pan-x`**

---

**25. `will-change-transform` is used to:**

a) Disable GPU compositing  
b) Hint the browser to optimize for upcoming `transform` changes  
c) Force `position: fixed`  
d) Remove animations in v4

**Answer: b) Hint the browser to optimize for upcoming `transform` changes**

---

**26. Which variant targets only the first child among siblings?**

a) `child-first:`  
b) `first:`  
c) `nth-1:`  
d) `begin:`

**Answer: b) `first:`**

---

**27. Which variant targets only the last child among siblings?**

a) `end:`  
b) `last:`  
c) `final:`  
d) `nth-last:`

**Answer: b) `last:`**

---

**28. Which variant applies to odd-indexed children (1-based)?**

a) `odd:`  
b) `alternate:`  
c) `stripe:`  
d) `odd-child:`

**Answer: a) `odd:`**

---

**29. Which variant applies to even-indexed children?**

a) `even:`  
b) `pair:`  
c) `even-row:`  
d) `dual:`

**Answer: a) `even:`**

---

**30. Which variant styles an input only when it has the `required` attribute?**

a) `needs-required:`  
b) `required:`  
c) `attr-required:`  
d) `is-required:`

**Answer: b) `required:`**

---

**31. Which variant applies when a form control is `:disabled`?**

a) `inactive:`  
b) `disabled:`  
c) `off:`  
d) `unusable:`

**Answer: b) `disabled:`**

---

**32. Which variant targets a checked checkbox or radio?**

a) `toggled:`  
b) `checked:`  
c) `on:`  
d) `selected:`

**Answer: b) `checked:`**

---

**33. Which variant applies when an input matches `:valid` constraints?**

a) `ok:`  
b) `valid:`  
c) `success:`  
d) `good:`

**Answer: b) `valid:`**

---

**34. Which variant applies when constraints fail (`:invalid`)?**

a) `bad:`  
b) `invalid:`  
c) `error:`  
d) `fail:`

**Answer: b) `invalid:`**

---

**35. Which variant styles an input while placeholder text is shown?**

a) `empty:`  
b) `placeholder-shown:`  
c) `has-placeholder:`  
d) `placeholder-visible:`

**Answer: b) `placeholder-shown:`**

---

**36. Which variant targets autofilled fields?**

a) `autofill:`  
b) `filled-by-browser:`  
c) `chrome-autofill:`  
d) `auto:`

**Answer: a) `autofill:`**

---

**37. Which variant styles controls in a read-only state?**

a) `readonly:`  
b) `read-only:`  
c) `locked:`  
d) `no-edit:`

**Answer: b) `read-only:`**

---

**38. `has-[:focus-visible]:ring-2` means:**

a) The element rings when it focuses itself  
b) The element gets a ring when any descendant matches `:focus-visible`  
c) It requires `@container`  
d) It only works with `print:`

**Answer: b) The element gets a ring when any descendant matches `:focus-visible`**

---

**39. `group-has-[svg]:flex` typically requires on the parent:**

a) `group` class (or group variant context) so child can use `group-has-*`  
b) Only `flex` on the parent  
c) `data-group` attribute without `group`  
d) `@plugin` for `group`

**Answer: a) `group` class (or group variant context) so child can use `group-has-*`**

---

**40. Which variant reacts to a `data-state="open"` attribute?**

a) `attr-[state=open]:`  
b) `data-[state=open]:`  
c) `aria-open:`  
d) `dataset-open:`

**Answer: b) `data-[state=open]:`**

---

**41. Which variant applies styles when a CSS feature is supported?**

a) `feature-[display:grid]:`  
b) `supports-[display:grid]:`  
c) `@supports:`  
d) `if-supports:`

**Answer: b) `supports-[display:grid]:`**

---

**42. Which variant applies rules only for printed media?**

a) `media-print:`  
b) `print:`  
c) `paper:`  
d) `pdf:`

**Answer: b) `print:`**

---

**43. Which variant matches portrait orientation?**

a) `vertical:`  
b) `portrait:`  
c) `phone:`  
d) `tall:`

**Answer: b) `portrait:`**

---

**44. Which variant matches landscape orientation?**

a) `horizontal:`  
b) `landscape:`  
c) `wide:`  
d) `desktop:`

**Answer: b) `landscape:`**

---

**45. Which variant is useful for Windows High Contrast / forced-colors modes?**

a) `high-contrast:`  
b) `forced-colors:`  
c) `contrast-forced:`  
d) `a11y-colors:`

**Answer: b) `forced-colors:`**

---

**46. Which variant applies when the user has not requested reduced motion?**

a) `motion-ok:`  
b) `motion-safe:`  
c) `animate-allowed:`  
d) `prefers-motion:`

**Answer: b) `motion-safe:`**

---

**47. Which variant applies when `prefers-reduced-motion: reduce` is set?**

a) `motion-reduce:`  
b) `reduce-motion:`  
c) `no-animate:`  
d) `static:`

**Answer: a) `motion-reduce:`**

---

**48. Which variant targets users who prefer higher contrast?**

a) `contrast-high:`  
b) `contrast-more:`  
c) `more-contrast:`  
d) `a11y-contrast:`

**Answer: b) `contrast-more:`**

---

**49. Which variant targets users who prefer less contrast?**

a) `contrast-low:`  
b) `contrast-less:`  
c) `soft:`  
d) `muted-theme:`

**Answer: b) `contrast-less:`**

---

**50. Putting it together: which markup shows composable variants, 3D transform, and `field-sizing`?**

```html
<div class="motion-safe:hover:rotate-x-12 perspective-distant">
  <textarea class="field-sizing-content min-h-16"></textarea>
</div>
```

a) `rotate-x-12` and `perspective-distant` are invalid in v4  
b) `motion-safe:hover:` composes variants; `rotate-x-*` / `perspective-*` are 3D utilities; `field-sizing-content` sets `field-sizing: content`  
c) `field-sizing-content` requires `tailwind.config.js`  
d) Composable variants are not allowed with `motion-safe:`

**Answer: b) `motion-safe:hover:` composes variants; `rotate-x-*` / `perspective-*` are 3D utilities; `field-sizing-content` sets `field-sizing: content`**

---
