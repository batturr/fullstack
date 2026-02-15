# 19. Drag and Drop

## Overview

HTML5 provides a native Drag and Drop API. Any element can be made draggable, and any element can be a drop target.

---

## Making an Element Draggable

```html
<div draggable="true" id="item1">Drag me!</div>
```

- Set `draggable="true"` to make an element draggable
- Images and links are draggable by default

---

## Drag Events

### Events on the Dragged Element

| Event | Fires When |
|-------|-----------|
| `dragstart` | Drag begins |
| `drag` | During dragging (continuous) |
| `dragend` | Drag ends (drop or cancel) |

### Events on the Drop Target

| Event | Fires When |
|-------|-----------|
| `dragenter` | Dragged item enters the target |
| `dragover` | Dragged item is over the target (continuous) |
| `dragleave` | Dragged item leaves the target |
| `drop` | Item is dropped on the target |

---

## Basic Drag and Drop

```html
<div id="item" draggable="true" 
     style="width:100px; height:100px; background:coral; cursor:grab;">
  Drag me
</div>

<div id="dropzone" 
     style="width:300px; height:300px; border:2px dashed #999; margin-top:20px;">
  Drop here
</div>

<script>
const item = document.getElementById('item');
const dropzone = document.getElementById('dropzone');

// Drag start — store the dragged element's ID
item.addEventListener('dragstart', (e) => {
  e.dataTransfer.setData('text/plain', e.target.id);
  e.target.style.opacity = '0.5';
});

item.addEventListener('dragend', (e) => {
  e.target.style.opacity = '1';
});

// Must prevent default on dragover to allow drop
dropzone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropzone.style.borderColor = 'green';
});

dropzone.addEventListener('dragleave', () => {
  dropzone.style.borderColor = '#999';
});

dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  const id = e.dataTransfer.getData('text/plain');
  const element = document.getElementById(id);
  dropzone.appendChild(element);
  dropzone.style.borderColor = '#999';
});
</script>
```

> **Important:** You must call `e.preventDefault()` on the `dragover` event, otherwise the `drop` event won't fire.

---

## DataTransfer Object

```javascript
// Set data during dragstart
e.dataTransfer.setData('text/plain', 'Hello');
e.dataTransfer.setData('text/html', '<p>Hello</p>');
e.dataTransfer.setData('application/json', JSON.stringify({ id: 1 }));

// Get data during drop
const text = e.dataTransfer.getData('text/plain');
const json = JSON.parse(e.dataTransfer.getData('application/json'));

// Set drag image
e.dataTransfer.setDragImage(imgElement, offsetX, offsetY);

// Set drop effect
e.dataTransfer.dropEffect = 'move';     // move, copy, link, none
e.dataTransfer.effectAllowed = 'move';   // Set in dragstart
```

### Drop Effects

| Value | Cursor | Purpose |
|-------|--------|---------|
| `move` | Move cursor | Move the element |
| `copy` | Copy cursor | Copy the element |
| `link` | Link cursor | Create a link/reference |
| `none` | No-drop cursor | Drop not allowed |

---

## Sortable List Example

```html
<ul id="sortable" style="list-style:none; padding:0;">
  <li draggable="true" class="sort-item">Item 1</li>
  <li draggable="true" class="sort-item">Item 2</li>
  <li draggable="true" class="sort-item">Item 3</li>
  <li draggable="true" class="sort-item">Item 4</li>
  <li draggable="true" class="sort-item">Item 5</li>
</ul>

<style>
.sort-item {
  padding: 12px 16px;
  margin: 4px 0;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: grab;
}
.sort-item.dragging {
  opacity: 0.4;
  background: #e0e0ff;
}
.sort-item.over {
  border-top: 3px solid #3b82f6;
}
</style>

<script>
const list = document.getElementById('sortable');
let draggedItem = null;

list.addEventListener('dragstart', (e) => {
  draggedItem = e.target;
  e.target.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
});

list.addEventListener('dragend', (e) => {
  e.target.classList.remove('dragging');
  document.querySelectorAll('.over').forEach(el => el.classList.remove('over'));
});

list.addEventListener('dragover', (e) => {
  e.preventDefault();
  const target = e.target.closest('.sort-item');
  if (target && target !== draggedItem) {
    target.classList.add('over');
  }
});

list.addEventListener('dragleave', (e) => {
  e.target.classList.remove('over');
});

list.addEventListener('drop', (e) => {
  e.preventDefault();
  const target = e.target.closest('.sort-item');
  if (target && target !== draggedItem) {
    const items = [...list.children];
    const dragIdx = items.indexOf(draggedItem);
    const dropIdx = items.indexOf(target);
    
    if (dragIdx < dropIdx) {
      list.insertBefore(draggedItem, target.nextSibling);
    } else {
      list.insertBefore(draggedItem, target);
    }
  }
  document.querySelectorAll('.over').forEach(el => el.classList.remove('over'));
});
</script>
```

---

## File Drop Zone

```html
<div id="fileDropZone" 
     style="width:400px; height:200px; border:2px dashed #999; 
            display:flex; align-items:center; justify-content:center;">
  Drop files here
</div>
<ul id="fileList"></ul>

<script>
const zone = document.getElementById('fileDropZone');
const fileList = document.getElementById('fileList');

zone.addEventListener('dragover', (e) => {
  e.preventDefault();
  zone.style.borderColor = '#3b82f6';
  zone.style.background = '#f0f4ff';
});

zone.addEventListener('dragleave', () => {
  zone.style.borderColor = '#999';
  zone.style.background = '';
});

zone.addEventListener('drop', (e) => {
  e.preventDefault();
  zone.style.borderColor = '#999';
  zone.style.background = '';
  
  const files = e.dataTransfer.files;
  
  for (const file of files) {
    const li = document.createElement('li');
    li.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    fileList.appendChild(li);
    
    // Read file content
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.style.maxWidth = '200px';
        li.appendChild(img);
      };
      reader.readAsDataURL(file);
    }
  }
});
</script>
```

---

## Accessibility Considerations

- Drag and drop is **not keyboard accessible** by default
- Always provide a **keyboard alternative** (buttons, arrow keys, menus)
- Use `aria-grabbed` and `aria-dropeffect` for screen reader support
- Consider touch devices — drag events have limited mobile support
