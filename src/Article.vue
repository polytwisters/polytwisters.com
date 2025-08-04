<script setup lang="ts">
// @ts-ignore
import renderMathInElement from "katex/dist/contrib/auto-render.mjs";

const twistersLink = "https://www.polytope.net/hedrondude/twisters.htm";

const vKatex = {
  mounted: (el: HTMLElement) => {
    renderMathInElement(el);
  },
  updated: (el: HTMLElement) => {
    renderMathInElement(el);
  },
};
</script>

<template>
  <article class="my-5" v-katex id="article">
    <p>
      <a :href="twistersLink" target="_blank">Polytwisters</a> are a family of
      four-dimensional curved shapes related to polyhedra and Hopf fibration. As
      polytwisters are 4D, the display shows 3D cross sections of the shapes.
      Control the location of the slice using the slider.
    </p>

    <p>This app is in an early stage of development.</p>

    <div class="flex flex-row justify-center gap-10 p-3">
      <section class="flex-1">
        <h1>Known issues</h1>
        <ul class="list-disc list-inside">
          <li>Not mobile friendly at the moment.</li>
          <li>
            On Windows, browser freezes briefly when switching polytwisters as the
            shaders are compiled.
          </li>
        </ul>
      </section>
      <section class="flex-1">
        <h1>Future plans</h1>
        <ul class="">
          <li>All 200+ regular and quasiregular polytwisters</li>
          <li>Custom polytwister construction</li>
          <li>Display of combinatorial structure</li>
          <li>Mesh export for use in other software or 3D printing</li>
          <li>Cross sections at oblique angles</li>
          <li>SDF renderer</li>
          <li>Paper explaining the mathematics of polytwisters</li>
        </ul>
      </section>
    </div>

    <h2>What are polytwisters?</h2>

    <p>
      Polytwisters are a family of curved shapes that exist in four spatial
      dimensions. They were discovered in 2000 by
      <a href="https://www.polytope.net/hedrondude/home.htm" target="_blank"
        >Jonathan Bowers</a
      >, an American mathematician known for his work on polytopes in four
      dimensions and above. Check
      <a :href="twistersLink" target="_blank">his original polytwisters page</a
      >.
    </p>

    <p>
      If you are entirely new to 4D Euclidean space, I recommend the following
      resources:
    </p>

    <ul>
      <li>
        Article series by H. S. Teoh: "<a
          href="https://www.qfbox.info/4d/vis/vis"
          >4D Visualization</a
        >."
      </li>
      <li>
        Video series from HyperCubist Math: "<a
          href="https://www.youtube.com/watch?v=SwGbHsBAcZ0"
          >Visualizing 4D</a
        >."
      </li>
    </ul>

    <p>
      The 4D analogy of the sphere is known as the
      <a href="https://en.wikipedia.org/wiki/3-sphere"><em>3-sphere</em></a
      >. On the ordinary sphere, a <em>great circle</em> is a circle with the
      same radius as the sphere itself, dividing it into two hemispheres. Any
      two distinct great circles on a sphere must intersect at exactly two
      points. On the 3-sphere, it is possible for two great circles on the
      3-sphere to not intersect each other at all. As the 3-sphere is a
      dimension "bigger" than the sphere, there is far more room for these
      circles.
    </p>

    <p>
      In fact, it is possible to divide the 3-sphere into infinitely many great
      circles so that no two of them overlap each other and the circles cover
      the entire 3-sphere. This is <em>Hopf fibration</em>, and these circles
      are called <em>Hopf fibers</em>.
    </p>

    <p>
      Even stranger, there exists a highly symmetrical one-to-one mapping from
      Hopf fibers to points on the ordinary sphere. This is the
      <em>Hopf map</em>. If we have a polyhedron whose vertices are on a sphere,
      we can invert the Hopf map to convert that collection of vertices to a set
      of Hopf fibers which we call <em>rings</em>.
    </p>

    <p>
      Polytwisters are a four-dimensional analogy to polyhedra which, in place
      of "vertices," have rings. In place of a polyhedron's edges which connect
      two points, two rings may be connected by a <em>strip</em>, which is a
      two-dimensional surface topologically equivalent to an open cylinder.
      Finally, a set of strips joined end-to-end form a <em>twister</em>, which
      is a polytwister's equivalent of a polygonal face.
    </p>

    <h2>Definition of polytwisters</h2>

    <p>
      A major part of this project was establishing a formal definition of
      polytwisters for the first time. This section defines convex polytwisters,
      and less formally describes strips, twisters, and nonconvex polytwisters.
      It is intentionally terse because as of April 2025, I am working on a paper
      which elaborates greatly on this.
    </p>

    <p>
      Equate \(\mathbb{R}^4\) and \(\mathbb{C}^2\) with \((a, b, c,
      d)_{\mathbb{R}^4} \equiv (a + bi, c + di)_{\mathbb{C}^2}\). Define the
      equivalence relation \(x \sim y\) on \(\mathbb{C}^2\) as true
      <abbr title="if and only if">iff</abbr> there exists \(k \in \mathbb{C},\,
      |k| = 1\) such that \(y = kx\), i.e. \(y\) is a <em>phase rotation</em> of
      \(x\). The partition \(\mathbb{C}^2 / \sim\) divides the space into
      <em>fibers</em>. Reinterpreted in \(\mathbb{R}^4\), fibers are geometric
      circles centered on the origin, except for one
      <em>trivial fiber</em> comprising the origin; the rest we refer to as
      <em>nontrivial fibers</em>.
    </p>

    <p>
      Taking only the fibers of unit radius gives us the Hopf fibration,
      partitioning the 3-sphere into infinitely many great circles. The Hopf map
      is actually not necessary to understand or define polytwisters, so I will
      not discuss it here.
    </p>

    <p>
      Given \(y \in \mathbb{C}^2 \backslash \{0\}\) define a <em>log</em> and a
      <em>pipe</em> respectively as:
    </p>

    <p>
      \[ \begin{align*} L(y) = L(y_1, y_2) &amp;= \{ x \in \mathbb{C}^2 :
      |\langle x, y \rangle| \leq 1\} \\ P(y) = P(y_1, y_2) &amp;= \{ x \in
      \mathbb{C}^2 : |\langle x, y \rangle| = 1\} \\ \end{align*} \]
    </p>

    <p>
      where \(\langle (x_1, x_2), (y_1, y_2) \rangle = x_1 y_1^* + x_2 y_2^*\).
      The pipe \(P(1, 0)\) viewed in \(\mathbb{R}^4\) is the Cartesian product
      of a unit circle and a plane, and the log \(L(1, 0)\) is the Cartesian
      product of a closed unit disk and a plane. All other pipes and logs are
      respectively of the form \(k\mathbf{U}P(1, 0)\) and \(k\mathbf{U}L(1, 0)\)
      where \(\mathbf{U} \in \text{SU}(2)\) and \(k\) is a positive real number.
      Crucially, all logs and pipes are unions of fibers.
    </p>

    <p>We can now define a convex polytwister:</p>

    <p class="mx-5 my-8!">
      <strong>Definition.</strong> A convex polytwister is an intersection of a
      finite set of three or more logs, but not equal to the intersection of
      fewer than three logs.
    </p>

    <p>
      The key to this is the analogy to the definition of
      "\(\mathcal{H}\)-polytopes," which may be defined as the bounded
      intersection of finitely many closed half-spaces. (See Ziegler's
      <em>Lectures on polytopes</em> for an introduction.) The polytwister
      equivalent of a closed half-space is a log, and the equivalent of a
      hyperplane is a pipe.
    </p>

    <p>
      Just as two planes in general position in 3D space intersect at lines and
      three planes intersect at a point, the intersection of pipes allows us to
      produce lower-dimensional shapes. An important fact, although not an
      obvious one at all, is that three pipes in general position intersect at
      exactly two nontrivial fibers (sometimes zero or one, but those cases are
      irrelevant to polytwisters). You can see a visual of this in the order 3
      dyadic twister, which is the simplest convex polytwister; the solid is the
      intersection of exactly three logs \(L(y_1) \cap L(y_2) \cap L(y_3)\). The
      two fibers in the set \(P(y_1) \cap P(y_2) \cap P(y_3)\) appear as
      "vertices" on the boundary of the figure, which we properly call rings.
    </p>

    <p>
      Taking further set operations on pipes and logs gives us the face lattice
      of the polytwister. A strip can be formed as the intersection of two pipes
      and at least one log, such as \(P(y_1) \cap P(y_2) \cap L(y_3)\). In \(\mathbb{R}^4\)
      it is an embedding of the cylinder, and its topological boundary is two fibers.
      Unlike line segments, strips are not uniquely determined by their boundary: there
      are infinitely many strips between a pair of fibers, and they bow out in different
      amounts depending on the orienation of the pipes.
      Finally, a twister (2-face) is formed by the intersection of one pipe and two or more logs,
      such as \(L(y_1) \cap L(y_2) \cap P(y_3)\), and its boundary is a set of two or more strips.
      (I am being informal here and leaving out some degeneracy conditions.)
    </p>

    <p>
      Nonconvex polytwisters are defined roughly as
      <a href="https://en.wikipedia.org/wiki/Abstract_polytope">
        abstract 3-polytopes
      </a>
      with a realization that maps each facet (twister) to a pipe called its "containing pipe,"
      each edge to a strip, and each vertex to a ring (fiber), such that each strip's incident rings
      are precisely its boundary, and each twister's incident strips are subsets of its containing
      pipe.
    </p>

    <p>
      Polytwisters will be explained in more detail in an upcoming paper, but I
      hope this brief description is useful.
    </p>

    <h2>Background</h2>

    <p>
      I have been working on this project since November 2022. It took over two
      years of work to develop a simple and mathematically elegant definition of
      polytwisters.
    </p>

    <p>
      The renderer is a GLSL fragment shader which implements a classical
      raytracer, using closed-form expressions to compute intersections of rays
      and logs. A cross-section of a log is an affine transformation of an
      infinite cylinder, and polytwisters are formed by Boolean operations on
      logs, so rendering polytwisters is no more difficult than raytracing
      cylinders.
    </p>

    <p>
      Thanks foremost to Jonathan Bowers for giving me access to his original
      POV-Ray code and answering my many questions. I'm also grateful to members
      of the
      <a href="https://polytope.miraheze.org/" target="_blank">Polytope Wiki</a>
      and Discord for their assistance, in particular Violeta, galoomba, and
      PlanetN9ne.
    </p>

    <h2>Changelog</h2>

    <p>2025-06-13: Added 142 uniform polytwisters.</p>

    <p>
      2025-04-09: Total rewrite, migrating from static videos rendered in
      Blender to an interactive real-time application.
    </p>

    <p>2024-06-13: Improvements to CSS.</p>

    <p>2024-05-04: Initial launch.</p>

    <footer>
      &copy; <a href="https://nathan.ho.name/" target="_blank">Nathan Ho</a>
      {{ new Date().getFullYear() }}.
    </footer>
  </article>
</template>

<style scoped>
@reference "./style.css";

article > h2 {
  @apply text-2xl font-bold my-5;
}

section > h1 {
  @apply text-lg font-bold my-5;
}

p {
  @apply my-3;
}

a:link,
a:visited {
  @apply text-sky-400 hover:text-sky-300;
}

ul {
  @apply ml-7 list-outside list-disc list-inside;
}
</style>
