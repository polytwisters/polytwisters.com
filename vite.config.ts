import { resolve } from "path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import fs from "fs";
import katex from "katex";

/**
 * A stupid Vite plugin which does the following:
 * - find strings of the form <include src="..." /> in the index.html file and in Vue
 * - find the HTML file that src="..." points to
 * - run KaTeX on anything between \( ... \) and \[ ... \] to render MathML output
 * - substitute the <include src="..." /> with the transformed code
 *
 * This is used to include article.html in both the Article.vue component and the
 * fallback article that appears in the <noscript> block in index.html.
 */
function stupidHTMLKatex() {
  const vueFileRegex = /\.vue$/;

  function fixEntities(code) {
    return code.replace(/&amp;/g, "&");
  }

  function runKatex(code, displayMode, isVue) {
    return katex.renderToString(fixEntities(code), {
      displayMode,
      // In the <noscript> block we actually ignore the KaTeX CSS and don't care too much about
      // things looking pretty, so it's OK to just use MathML.
      output: isVue ? "htmlAndMathml" : "mathml",
      // This is a bit harsh but we might as well catch KaTeX parse errors early.
      throwOnError: true,
    });
  }

  function substituteKatex(code, isVue) {
    return code
      .replace(/\\\(([\s\S]*?)\\\)/g, (ignore, src) => {
        return runKatex(src, false, isVue);
      })
      .replace(/\\\[([\s\S]*?)\\\]/g, (ignore, src) => {
        return runKatex(src, true, isVue);
      });
  }

  function transform(code, isVue) {
    return code.replace(/<include\s+src="(.*?)"\s+\/>/g, (ignore, src) => {
      let htmlCode = fs.readFileSync(src, { encoding: "utf-8" });
      htmlCode = substituteKatex(htmlCode, isVue);
      return htmlCode;
    });
  }

  return {
    name: "polytwisters:stupid-html-katex",
    transformIndexHtml(html) {
      return transform(html, false);
    },
    transform: {
      filter: {
        id: vueFileRegex,
      },
      handler(code, id) {
        if (!vueFileRegex.test(id)) {
          return null;
        }
        const transformedCode = transform(code, true);
        return {
          code: transformedCode,
          map: null,
        };
      },
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [stupidHTMLKatex(), vue(), tailwindcss() /*VitePWA()*/],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
  },
  define: {
    "import.meta.env.PACKAGE_VERSION": JSON.stringify(
      process.env.npm_package_version,
    ),
  },
});
