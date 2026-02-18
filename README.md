# @codedev168/tiny-three-site

A tiny three.js website starter that mounts a minimal scene with a rotating cube into a DOM element.

Installation

```bash
npm install @codedev168/tiny-three-site three
```

Usage

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>tiny-three-site demo</title>
    <style>
      body, html, #app { width: 100%; height: 100%; margin: 0; }
    </style>
  </head>
  <body>
    <div id="app"></div>
    <script type="module">
      import createTinyThreeSite from '@codedev168/tiny-three-site';

      const container = document.getElementById('app');
      if (container) {
        createTinyThreeSite(container, { animate: true });
      }
    </script>
  </body>
</html>
```

API

- createTinyThreeSite(container: HTMLElement, opts?: TinyThreeOptions)
  - returns an object with scene, camera, renderer, cube, stop(), resize(w,h)

License: MIT
