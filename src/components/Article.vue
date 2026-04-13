<template>
  <article class="my-5" id="article">
    <!--
    A custom Vite plugin replaces this with the actual article HTML before being processed by Vue.
    See the root vite.config.ts. The path is relative to the root of the repo, not this file.
    -->
    <include src="src/article.html" />
  </article>
</template>

<style scoped>
@reference "@/style.css";

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
  @apply text-link;
}

ul {
  @apply ml-7 list-outside list-disc;
}
</style>
