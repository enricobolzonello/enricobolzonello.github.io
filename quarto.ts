import { merge } from "lume/core/utils/object.ts";
import { basename, join } from "@std/path";

export interface Options {
  /** Path to the notebooks directory, relative to site src. Default: "notebooks" */
  notebooksDir: string;
  /** Move Quarto figure files into static/images and rewrite md references. Default: true */
  fixImages: boolean;
}

export const defaults: Options = {
  notebooksDir: "notebooks",
  fixImages: true,
};

/**
 * Rewrites inline math delimiters in all generated .md files.
 * Quarto outputs $...$ for inline math, but $-delimiters are unreliable
 * in markdown (markdown-it may mangle content between them). Converting
 * to \\(...\\) means markdown-it emits \(...\) in HTML, which Lume's
 * KaTeX plugin recognises via its default \( delimiter.
 */
async function fixMathDelimiters(postsDir: string) {
  // Matches inline $...$ but not $$...$$. Skips newlines so display math
  // blocks (which span multiple lines) are left alone.
  const inlineMath = /(?<!\$)\$([^$\n]+?)\$(?!\$)/g;

  for await (const entry of Deno.readDir(postsDir)) {
    if (!entry.isFile || !entry.name.endsWith(".md")) continue;
    const path = join(postsDir, entry.name);
    const content = await Deno.readTextFile(path);
    const updated = content.replace(inlineMath, (_, math) => `\\\\(${math}\\\\)`);
    if (updated !== content) await Deno.writeTextFile(path, updated);
  }
}

/**
 * Ports fix-images.py: moves <post>_files/ figures into src/static/images/posts/<year>/<post>/
 * and rewrites markdown image references as <img> tags.
 */
async function fixImages(postsDir: string, staticImagesDir: string) {
  const imgPattern =
    /!\[([^\]]*)\]\(([^)]+_files\/[^)]+\.(?:png|jpg|jpeg|svg|gif))\)/g;

  for await (const entry of Deno.readDir(postsDir)) {
    if (!entry.isFile || !entry.name.endsWith(".md")) continue;

    const postName = entry.name.replace(/\.md$/, "");
    const filesDir = join(postsDir, `${postName}_files`);

    try {
      await Deno.stat(filesDir);
    } catch {
      continue; // No _files dir for this post
    }

    const mdPath = join(postsDir, entry.name);
    const content = await Deno.readTextFile(mdPath);

    const yearMatch = content.match(/^date:\s*(\d{4})/m);
    const year = yearMatch ? yearMatch[1] : String(new Date().getFullYear());

    const targetDir = join(staticImagesDir, year, postName);
    await Deno.mkdir(targetDir, { recursive: true });

    // Collect replacements first (async copies), then apply to content
    const replacements: [string, string][] = [];
    for (const [full, alt, rel] of content.matchAll(imgPattern)) {
      const srcPath = join(postsDir, rel);
      try {
        await Deno.stat(srcPath);
      } catch {
        continue;
      }
      const fileName = basename(srcPath);
      await Deno.copyFile(srcPath, join(targetDir, fileName));
      replacements.push([
        full,
        `<img src="/images/posts/${year}/${postName}/${fileName}" alt="${alt}">`,
      ]);
    }

    let newContent = content;
    for (const [match, replacement] of replacements) {
      newContent = newContent.replaceAll(match, replacement);
    }

    if (newContent !== content) {
      await Deno.writeTextFile(mdPath, newContent);
      console.log(`[quarto] Fixed images: ${entry.name}`);
    }

    await Deno.remove(filesDir, { recursive: true });
    console.log(`[quarto] Removed: ${postName}_files/`);
  }
}

export default function quarto(userOptions?: Partial<Options>) {
  const options = merge(defaults, userOptions);

  return (site: Lume.Site) => {
    const notebooksPath = site.src(options.notebooksDir);
    const postsDir = site.src("posts");
    const staticImagesDir = site.src("static/images/posts");

    async function runQuarto() {
      const cmd = new Deno.Command("quarto", {
        args: ["render"],
        cwd: notebooksPath,
        stdout: "inherit",
        stderr: "inherit",
      });
      const { code } = await cmd.output();
      if (code !== 0) throw new Error("quarto render failed");

      await fixMathDelimiters(postsDir);
      if (options.fixImages) {
        await fixImages(postsDir, staticImagesDir);
      }
    }

    // Run quarto before the initial build
    site.addEventListener("beforeBuild", runQuarto);

    // Re-run quarto when any .qmd file changes during serve
    // Quarto outputs updated .md files to src/posts/, which Lume then picks
    // up on the next watch cycle automatically.
    site.addEventListener("beforeUpdate", async (event) => {
      if ([...event.files].some((f) => f.endsWith(".qmd"))) {
        await runQuarto();
      }
    });

    // Fix &#10; HTML entities inside <script> tags.
    // Plotly's notebook renderer emits &#10; as newline separators inside
    // <script> blocks. In a standalone HTML page, <script> content is raw
    // text so &#10; is never decoded — the JS parser sees a literal & and
    // throws "expected expression, got '&'".
    site.process([".html"], (pages) => {
      for (const page of pages) {
        if (typeof page.content === "string") {
          page.content = page.content.replace(
            /(<script\b[^>]*>)([\s\S]*?)(<\/script>)/gi,
            (_, open, body, close) =>
              open + body.replace(/&#10;/g, "\n") + close,
          );
        }
      }
    });
  };
}
