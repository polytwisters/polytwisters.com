# Polytwisters.com

Source code for [Polytwisters.com](https://polytwisters.com/), an interactive viewer for _polytwisters_, a family of curved shapes in four-dimensional Euclidean space arising from polyhedra and the Hopf fibration.

## Overview

Polytwisters.com is written in TypeScript. Main dependencies are Vite, Vue.js, Tailwind, and THREE.js. The core renderer is a single GLSL fragment shader that raytraces the polytwister cross sections in real time, using classical raytracing methods with closed-form ray-surface intersections. THREE.js is only used to set up the shader and for vector/matrix math. Its actual 3D rendering features are not currently used.

The deliverable is a static HTML and JavaScript application. Only static file hosting is needed to serve it. It does not require any external assets.

## Building

Fonts and images are checked in with git-lfs.

Recommended editor setup is VSCodium + Vue.

```
npm install
npm run dev  # Vite development server
npm run test  # run test suite
npm run build  # build the final files at dist/
```

## Copyright

MIT License. Material Symbols Rounded is copyright by Google, licensed under Apache 2.0.
