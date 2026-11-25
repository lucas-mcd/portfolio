import { readFileSync, readdirSync, statSync } from 'node:fs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { skills, skillIcons, projects, resume, institutionIcons } from '../src/data/portfolioData.js';
import { getPortfolioContent } from '../src/data/translations.js';
const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root));
const pdf = read('public/' + resume.path);
assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
for (const name of skills.flatMap(group => group.items)) {
 const icon = skillIcons[name];
 assert(read(`public/icons/mono/${icon}.svg`).toString().includes('svg'));
 const bytes = read(`public/holograms/${icon}.bin`);
 assert(bytes.length > 0 && bytes.length % 24 === 0);
}
for (const language of ['pt', 'en']) {
 const { education } = getPortfolioContent(language);
 assert.equal(new Set(education.map(course => course.id)).size, education.length);
 for (const course of education) {
  assert(course.summary?.trim() && course.course && course.status, course.id);
  const icons = [institutionIcons[course.institution]];
  if (course.credential) icons.push(course.id);
  for (const icon of icons) {
   const bytes = read(`public/holograms/${icon}.bin`);
   assert(bytes.length && bytes.length % 24 === 0, icon);
   for (let i = 0; i < bytes.length; i += 4) assert(Number.isFinite(bytes.readFloatLE(i)), icon);
  }
 }
}
for (const project of projects) for (const url of [project.repositoryUrl, project.liveUrl].filter(Boolean)) assert.equal(new URL(url).protocol, 'https:');
function inspect(path) {
 for (const name of readdirSync(path)) {
  const file = new URL(name, path);
  if (statSync(file).isDirectory()) inspect(new URL(name+'/',path));
  else assert(!/^(\.env|\.git)|\.(map|pem|key|zip)$/i.test(name), `Unexpected public artifact: ${name}`);
 }
}
inspect(new URL('dist/',root));
console.log('Release checks passed: CV, icons, holograms, HTTPS links and published artifacts.');
console.log('CV SHA-256:', createHash('sha256').update(pdf).digest('hex'));
