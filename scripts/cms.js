import { createDirectus, rest, readItems, readAssetBlob } from '@directus/sdk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIRECTUS_URL = 'https://chorgemeinschaft.fhoss.de';
const PAGES_DIR = path.join(__dirname, '../app/content');
const CONTENT_FOLDER = path.join(PAGES_DIR, '/posts');

const POST_FONT_MATTER = (post) => `+++
title = "${post.title || ''}"
date = '${new Date(post.date).toISOString().split('T')[0] || ''}'
summary = "${post.description || ''}"
tags = [${post.tags?.sort().map(t => `"${t}"`).join(', ') || ''}]
showZenMode = true
+++

`;

const PAGE_FONT_MATTER = (page) => `+++
title = "${page.title || ''}"
summary = "${page.description || ''}"
tags = [${page.tags?.sort().map(t => `"${t}"`).join(', ') || ''}]
showAuthor = false
showViews = false
showDate = false
showReadingTime = false
showWordCount = false
+++

`;

const SECTION_FONT_MATTER = (section) => `+++
title = "${section.title || ''}"
summary = "${section.description || ''}"
+++

`;

const directus = createDirectus(DIRECTUS_URL).with(rest());

async function downloadFiles(folder, files) {
  if (!files || files.length === 0) return;

  for (const { directus_files_id } of files) {
    if (directus_files_id.type.startsWith('image/')) {
      await downloadImage(folder, directus_files_id);
    } else {
      await downloadFile(folder, directus_files_id);
    }
  }
}

async function downloadFile(folder, file, name) {
  if (!file) return;

  const blob = await directus.request(readAssetBlob(file.id));
  const arrayBuffer = await blob.arrayBuffer();
  const filename = name || file.filename_download;
  const filepath = path.join(folder, filename);
  await fs.writeFile(filepath, Buffer.from(arrayBuffer));
  console.log(`Downloaded file: ${filepath}`);
}

async function downloadImage(folder, file, name) {
  if (!file) return;

  const query = { width: 1000, withoutEnlargement: true, format: 'webp', quality: 90 };
  const blob = await directus.request(readAssetBlob(file.id, query));
  const arrayBuffer = await blob.arrayBuffer();
  const filename = name || file.filename_download.split('.').slice(0, -1).join('.') + '.webp';
  const filepath = path.join(folder, filename);
  await fs.writeFile(filepath, Buffer.from(arrayBuffer));
  console.log(`Downloaded image: ${filepath}`);
}

async function downloadPages() {
  const pages = await directus.request(
    readItems('pages', {
      fields: ['*', 'extra_files.*.*', 'featured_image.*'],
    })
  );

  for (const page of pages) {
    let file = 'index';
    let content = PAGE_FONT_MATTER(page) + page.content;
    if (page.slug.includes('_index')) {
      file = '_index';
      content = SECTION_FONT_MATTER(page) + page.content;
    }

    const folder = path.join(PAGES_DIR, page.slug.split(file)[0]);
    await fs.mkdir(folder, { recursive: true });

    const indexPath = path.join(folder, file + '.md');
    await fs.writeFile(indexPath, content);

    console.log(`Written page: ${indexPath}`);

    downloadFile(folder, page.featured_image, 'featured.webp');
    downloadFiles(folder, page.extra_files);
  }
}

async function downloadPosts() {
  const published = await directus.request(
    readItems('posts', {
      filter: { status: { _eq: 'published' } },
      fields: ['*', 'extra_files.*.*', 'featured_image.*'],
    })
  );

  for (const post of published) {
    const date = new Date(post.date);
    const year = date.getFullYear();

    const folder = path.join(CONTENT_FOLDER, `${year}/${post.slug}/`);
    await fs.mkdir(folder, { recursive: true });
    const content = POST_FONT_MATTER(post) + post.content;
    const indexPath = path.join(folder, 'index.md');
    await fs.writeFile(indexPath, content);
    console.log(`Written post: ${indexPath}`);

    downloadFile(folder, post.featured_image, 'featured.webp');
    downloadFiles(folder, post.extra_files);
  }
}

async function run() {
  try {
    await fs.rm(PAGES_DIR, { recursive: true, force: true });

    await downloadPosts();
    await downloadPages();

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

run();
