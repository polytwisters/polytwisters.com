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
  <article class="my-5" v-katex>
    <p>
      This is a real-time interactive viewer for
      <a :href="twistersLink" target="_blank">polytwisters</a>, a family of
      four-dimensional curved shapes related to polyhedra and Hopf fibration. As
      polytwisters are 4D, the display shows 3D cross sections of the shapes.
      Control the location of the slice using the slider.
    </p>

    <p>
      This app is in an early stage of development.
    </p>

    <div class="flex flex-row justify-center gap-10 p-3">
      <section class="flex-1">
        <h1>Known issues</h1>
        <ul class="list-disc list-inside">
          <li>
            Some polytwisters are tagged "bug," meaning that they render incorrectly.
          </li>
          <li>
            Browser may freeze briefly when switching polytwisters as the
            shaders are compiled.
          </li>
          <li>
            z-fighting is visible at some w-coordinates where two planes merge.
          </li>
          <li>Not mobile friendly at the moment.</li>
        </ul>
      </section>
      <section class="flex-1">
        <h1>Future plans</h1>
        <ul class="list-disc list-inside">
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
      Polytwisters are a family of curved four-dimensional shapes. They were
      discovered by
      <a href="https://www.polytope.net/hedrondude/home.htm" target="_blank"
        >Jonathan Bowers</a
      >, an American mathematician known for his work on polytopes in four
      dimensions and above. Check
      <a :href="twistersLink" target="_blank">his original polytwisters page</a
      >.
    </p>

    <p>
      The 4D analogy of the sphere is known as the <em>3-sphere</em>. On the
      ordinary sphere, a <em>great circle</em> is a circle with the same radius
      as the sphere itself, dividing it into two hemispheres. Any two distinct
      great circles on a sphere must intersect at exactly two points. On the
      3-sphere, it is possible for two great circles on the 3-sphere to not
      intersect each other at all. As the 3-sphere is a dimension "bigger" than
      the sphere, there is far more room for these circles.
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

    <h2>Definition of convex polytwisters</h2>

    <p>
      This section details a definition of convex polytwisters for readers with
      a mathematics background. It is intentionally very terse and only covers a
      fraction of the topic. As of April 2025, I am working on a paper which
      elaborates greatly on this and addresses nonconvex polytwisters.
    </p>

    <p>
      Equate \(\mathbb{R}^4\) and \(\mathbb{C}^2\) with \((a, b, c,
      d)_{\mathbb{R}^4} \equiv (a + bi, c + di)_{\mathbb{C}^2}\). Define the
      equivalence relation \(x \sim y\) on \(\mathbb{C}^2\) as true iff there
      exists \(k \in \mathbb{C},\, |k| = 1\) such that \(y = kx\), i.e. \(y\) is
      a <em>phase rotation</em> of \(x\). The partition \(\mathbb{C}^2 / \sim\)
      divides the space into <em>fibers</em>. Reinterpreted in \(\mathbb{R}^4\),
      fibers are geometric circles centered on the origin, except for one
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
      product of a closed unit disk and a plane. All other pipes (or logs) are
      formed by transforming this base pipe (or log) by applying a special
      unitary matrix \(\mathbf{U} \in \text{SU}(2)\) in the \(\mathbb{C}^2\)
      domain, and a uniform scaling about the origin. Crucially, all logs and
      pipes are unions of fibers.
    </p>

    <p>
      The key to the polyhedral analogies are that logs are the equivalent of
      closed half-spaces and pipes are the equivalent of planes. Even the
      formulas look similar, as a closed half-space may be defined as a set
      \(H(y) = \{x \in \mathbb{R}^3 : \langle x, y \rangle \leq 1\}\) for some
      \(y \in \mathbb{R}^3 \backslash \{0\}\). Knowing that convex polyhedra may
      be defined as intersections of finitely many closed half-spaces, we are
      set up for a definition of convex polytwisters:
    </p>

    <p class="mx-5 my-8!">
      <strong>Definition.</strong> A convex polytwister is an intersection of a
      finite set of three or more logs, but not equal to the intersection of
      fewer than three logs.
    </p>

    <p>
      From here I will leave things sketchy to limit scope, but I will mention
      that the minimum of exactly three logs has an important reason: the
      intersection of three pipes, under certain conditions, is exactly two
      nontrivial fibers with locations computed by a certain system of
      polynomial equations. This is what allows polytwisters to have rings,
      which are designated fibers that are polytwisters' equivalents of
      vertices. The analogous situation in 3D is that three planes in general
      position intersect at a single point determined by a system of linear
      equations, and every vertex of the polyhedron must be located at one such
      intersection point. As for strips, they are the intersection of two pipes
      and a log, and a twister is the intersection of one pipe and two or more
      logs.
    </p>

    <p>
      Again, all this will be explained in more detail in an upcoming paper, but
      I hope this brief description is useful.
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

    <p>
      2025-06-13: Added 142 uniform polytwisters.
    </p>

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
  @apply text-sky-200;
}

ul {
  @apply ml-7 list-outside;
}
</style>
