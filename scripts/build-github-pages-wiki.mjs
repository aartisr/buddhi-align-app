import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

const [sourceDirectory, outputDirectory] = process.argv.slice(2);
const siteUrl = "https://aartisr.github.io/buddhi-align-app";
const sourceRepositoryUrl = "https://github.com/aartisr/buddhi-align-app/blob/main/docs";
const repositoryUrl = "https://github.com/aartisr/buddhi-align-app";
const githubWikiUrl = `${repositoryUrl}/wiki`;
const authorName = "Aarti S Ravikumar";
const authorUrl = "https://ai-aarti.com/";
const lastModified = "2026-08-16";

if (!sourceDirectory || !outputDirectory) {
  throw new Error("Usage: node scripts/build-github-pages-wiki.mjs <source-directory> <output-directory>");
}

const markdownFiles = (await readdir(sourceDirectory))
  .filter((file) => file.endsWith(".md"))
  .sort((a, b) => (a === "Home.md" ? -1 : b === "Home.md" ? 1 : a.localeCompare(b)));

const pageBySourceName = new Map(markdownFiles.map((file) => {
  const name = basename(file, ".md");
  const slug = name === "Home" ? "index" : name.toLowerCase();
  return [name, { file, name, slug, href: `${slug}.html` }];
}));

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function resolveLink(value) {
  if (/^(https?:|mailto:|#)/.test(value)) return value;
  const wikiPage = pageBySourceName.get(value.replace(/\.md$/, ""));
  if (wikiPage) return wikiPage.href;
  if (value.startsWith("../") && value.endsWith(".md")) {
    return `${sourceRepositoryUrl}/${value.slice(3)}`;
  }
  return value;
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/\[([^\]]+)]\(([^)]+)\)/g, (_match, label, href) => `<a href="${escapeHtml(resolveLink(href))}">${label}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function renderMarkdown(markdown) {
  const output = [];
  const paragraph = [];
  let listOpen = false;
  const flushParagraph = () => {
    if (paragraph.length) output.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
    paragraph.length = 0;
  };
  const closeList = () => {
    if (listOpen) output.push("</ul>");
    listOpen = false;
  };

  for (const line of markdown.split(/\r?\n/)) {
    if (!line.trim()) {
      flushParagraph();
      closeList();
      continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      closeList();
      const level = heading[1].length;
      output.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }
    const item = line.match(/^-\s+(.+)$/);
    if (item) {
      flushParagraph();
      if (!listOpen) output.push("<ul>");
      listOpen = true;
      output.push(`<li>${inlineMarkdown(item[1])}</li>`);
      continue;
    }
    closeList();
    paragraph.push(line.trim());
  }
  flushParagraph();
  closeList();
  return output.join("\n");
}

function pageTemplate({ title, href, article, currentHref }) {
  const navigation = [...pageBySourceName.values()]
    .map((page) => `<a href="${page.href}"${page.href === currentHref ? ' aria-current="page"' : ""}>${escapeHtml(page.name === "Home" ? "Wiki home" : page.name.replaceAll("-", " "))}</a>`)
    .join("");
  const canonicalUrl = `${siteUrl}/wiki/${href}`;
  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    url: canonicalUrl,
    dateModified: lastModified,
    isPartOf: { "@type": "WebSite", name: "Buddhi Align Wiki", url: `${siteUrl}/wiki/` },
    author: { "@type": "Person", name: authorName, url: authorUrl },
    publisher: { "@type": "Person", name: authorName, url: authorUrl },
    about: { "@type": "SoftwareApplication", name: "Buddhi Align", url: "https://buddhi-align.foreverlotus.com/" },
    mainEntityOfPage: canonicalUrl,
  });

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} · Buddhi Align Wiki</title>
  <meta name="description" content="${escapeHtml(title)} from the Buddhi Align Wiki by ${authorName}.">
  <meta name="author" content="${authorName}">
  <meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1">
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="stylesheet" href="../styles.css">
  <script type="application/ld+json">${schema}</script>
</head>
<body>
  <a class="skip-link" href="#content">Skip to content</a>
  <header class="site-header shell">
    <div class="topbar"><a class="brand" href="../index.html"><span class="brand-mark" aria-hidden="true">B</span><span>Buddhi Align</span></a><a class="topbar__link" href="https://buddhi-align.foreverlotus.com/">Visit the product ↗</a></div>
    <nav class="nav" aria-label="Wiki navigation">${navigation}</nav>
  </header>
  <main id="content" class="shell wiki-page"><p class="eyebrow">Buddhi Align Wiki · <a href="${authorUrl}" rel="author">${authorName}</a></p><article class="wiki-article">${article}</article></main>
  <footer class="site-footer shell"><div class="footer-row"><p>© 2026 <a href="${authorUrl}" rel="author">${authorName}</a> · Buddhi Align Wiki</p><nav class="footer-links" aria-label="Wiki resources"><a href="index.html">Wiki home</a><a href="../index.html">Documentation home</a><a href="../practice-guide.html">Practice guide</a><a href="../open-web-reference.html">Official sources</a><a href="${githubWikiUrl}">GitHub Wiki ↗</a><a href="${repositoryUrl}">Source repository ↗</a><a href="https://buddhi-align.foreverlotus.com/">Product ↗</a></nav></div></footer>
</body>
</html>`;
}

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

for (const page of pageBySourceName.values()) {
  const markdown = await readFile(join(sourceDirectory, page.file), "utf8");
  const title = markdown.match(/^#\s+(.+)$/m)?.[1] ?? page.name;
  await writeFile(join(outputDirectory, page.href), pageTemplate({
    title,
    href: page.href,
    article: renderMarkdown(markdown),
    currentHref: page.href,
  }));
}

console.log(`[github-pages-wiki] Built ${markdownFiles.length} wiki pages in ${outputDirectory}.`);
