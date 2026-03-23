# JavaScript DOM: Comprehensive Guide

## Table of Contents
1. [Introduction to the DOM](#introduction-to-the-dom)
2. [Accessing DOM Elements](#accessing-dom-elements)
    - [getElementById](#getelementbyid)
    - [getElementsByClassName](#getelementsbyclassname)
    - [getElementsByTagName](#getelementsbytagname)
    - [querySelector & querySelectorAll](#queryselector--queryselectorall)
3. [Manipulating DOM Elements](#manipulating-dom-elements)
    - [Changing Content](#changing-content)
    - [Changing Attributes](#changing-attributes)
    - [Changing Styles](#changing-styles)
4. [Creating and Removing Elements](#creating-and-removing-elements)
    - [createElement](#createelement)
    - [appendChild & insertBefore](#appendchild--insertbefore)
    - [removeChild](#removechild)
5. [Event Handling](#event-handling)
    - [addEventListener](#addeventlistener)
    - [Common Events](#common-events)
6. [DOM Traversal](#dom-traversal)
    - [Parent, Child, Sibling Nodes](#parent-child-sibling-nodes)
7. [Useful DOM Properties & Methods](#useful-dom-properties--methods)
8. [Best Practices](#best-practices)
9. [References](#references)

---

## 1. Introduction to the DOM
The Document Object Model (DOM) is a programming interface for web documents. It represents the page so that programs can change the document structure, style, and content.

## 2. Accessing DOM Elements

### getElementById
```html
<div id="demo">Hello</div>
<script>
  var el = document.getElementById('demo');
  console.log(el.textContent); // Hello
</script>
```

### getElementsByClassName
```html
<p class="note">Note 1</p>
<p class="note">Note 2</p>
<script>
  var notes = document.getElementsByClassName('note');
  console.log(notes.length); // 2
</script>
```

### getElementsByTagName
```html
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>
<script>
  var items = document.getElementsByTagName('li');
  console.log(items[0].textContent); // Item 1
</script>
```

### querySelector & querySelectorAll
```html
<div class="box">Box 1</div>
<div class="box">Box 2</div>
<script>
  var firstBox = document.querySelector('.box');
  var allBoxes = document.querySelectorAll('.box');
  console.log(firstBox.textContent); // Box 1
  console.log(allBoxes.length); // 2
</script>
```

## 3. Manipulating DOM Elements

### Changing Content
```html
<p id="text">Old Text</p>
<script>
  document.getElementById('text').textContent = 'New Text';
</script>
```

### Changing Attributes
```html
<img id="myImg" src="old.png">
<script>
  document.getElementById('myImg').src = 'new.png';
</script>
```

### Changing Styles
```html
<div id="colorBox">Color me!</div>
<script>
  document.getElementById('colorBox').style.backgroundColor = 'yellow';
</script>
```

## 4. Creating and Removing Elements

### createElement
```html
<ul id="list"></ul>
<script>
  var li = document.createElement('li');
  li.textContent = 'New Item';
  document.getElementById('list').appendChild(li);
</script>
```

### appendChild & insertBefore
```html
<ul id="list"><li>First</li></ul>
<script>
  var li = document.createElement('li');
  li.textContent = 'Second';
  var list = document.getElementById('list');
  list.appendChild(li); // Adds at the end
</script>
```

### removeChild
```html
<ul id="list"><li>Remove me</li></ul>
<script>
  var list = document.getElementById('list');
  var item = list.firstElementChild;
  list.removeChild(item);
</script>
```

## 5. Event Handling

### addEventListener
```html
<button id="btn">Click me</button>
<script>
  document.getElementById('btn').addEventListener('click', function() {
    alert('Button clicked!');
  });
</script>
```

### Common Events
- click
- mouseover
- mouseout
- keydown
- submit

## 6. DOM Traversal

### Parent, Child, Sibling Nodes
```html
<ul id="list">
  <li>Item 1</li>
  <li>Item 2</li>
</ul>
<script>
  var list = document.getElementById('list');
  var first = list.firstElementChild;
  var next = first.nextElementSibling;
  var parent = first.parentElement;
</script>
```

## 7. Useful DOM Properties & Methods
- innerHTML / textContent
- classList.add/remove/toggle
- setAttribute / getAttribute
- children / childNodes
- parentElement / parentNode
- nextElementSibling / previousElementSibling

## 8. Best Practices
- Minimize DOM access for performance
- Use event delegation for dynamic elements
- Avoid using innerHTML for user-generated content (security)
- Use `textContent` for plain text

## 9. References
- [MDN Web Docs: DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)
- [W3Schools: JavaScript HTML DOM](https://www.w3schools.com/js/js_htmldom.asp)
