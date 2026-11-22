import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { lessons as maneuvers } from '../content.js';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
export const expectedTasks = [...'ABCDEFGHIJKMNO'];

// Exact original filenames from the uploaded Area II archive. Keeping this small
// manifest lets data checks run without shipping the source documents publicly.
export const attachedMaterials = new Set([
  'Copy of Area 02 (II) - Task A - Human Factors.docx',
  'Copy of Area 02 (II) - Task B - Visual Scanning and Collision Avoidance.docx',
  'Copy of Area 02 (II) - Task C - Runway Incursion Avoidance.docx',
  'Copy of Area 02 (II) - Task D - Principles of Flight.docx',
  'Copy of Area 02 (II) - Task E - Airplane Flight Controls and Operation of Systems.docx',
  'Copy of Area 02 (II) - Task F - Performance and Limitations.docx',
  'Copy of Area 02 (II) - Task G - National Airspace System.docx',
  'Copy of Area 02 (II) - Task H - Navigation Systems and Radar Services.docx',
  'Copy of Area 02 (II) - Task I - Navigation and Cross-Country Flight Planning.docx',
  'Copy of Area 02 (II) - Task J - 14 CFR and Publications.docx',
  'Copy of Area 02 (II) - Task K - Endorsements and Logbook Entries.docx',
  'Copy of Area 02 (II) - Task M - Night Operations.docx',
  'Copy of Area 02 (II) - Task N - High Altitude Operations - Supplemental Oxygen.docx',
  'Copy of Area 02 (II) - Task O - High Altitude Operations - Pressurization.docx',
  'Task A - Human Factors.pptx',
  'Task B - Visual Scanning and Collision Avoidance.pptx',
  'TASK C - Runway Incursion Avoidance.pptx',
  'TASK D - Principles of Flight.pptx',
  'Task E - Airplane Flight Controls and System Operations.pptx',
  'Task F - Performance and Limitations.pptx',
  'Task G - National Airspace System.pptx',
  'Task I - Navigation and Cross Country Flight Planning.pptx',
  'Task K - Endorsements.pptx',
  'Task N - High Altitude Operations - Supplemental Oxygen.pptx',
  'TASK_K.pdf',
  '_Task C & K, at least One Other Task Tested_.docx'
]);

const entities = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  ndash: '–', mdash: '—', hellip: '…', deg: '°', times: '×',
  divide: '÷', minus: '−', plusmn: '±', ge: '≥', le: '≤',
  alpha: 'α', beta: 'β', phi: 'φ', rho: 'ρ', mu: 'μ', Delta: 'Δ'
};

export function plainText(value) {
  return String(value ?? '')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(#x[\da-f]+|#\d+|[a-z][\da-z]+);/gi, (whole, name) => {
      if (name.startsWith('#')) {
        const number = name[1].toLowerCase() === 'x'
          ? Number.parseInt(name.slice(2), 16) : Number.parseInt(name.slice(1), 10);
        return number > 0 && number <= 0x10ffff && !(number >= 0xd800 && number <= 0xdfff)
          ? String.fromCodePoint(number) : whole;
      }
      return entities[name] ?? whole;
    })
    .replace(/\s+/g, ' ')
    .trim();
}

const safeId = /^[a-z][a-z0-9-]*$/;
const allowedTags = new Set([
  'p', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'dl', 'dt', 'dd',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'sub', 'sup',
  'span', 'div', 'blockquote', 'br', 'code', 'kbd', 'samp', 'figure',
  'figcaption', 'h3', 'h4', 'a', 'math', 'mi', 'mn', 'mo', 'mrow', 'mfrac',
  'msup', 'msub', 'msubsup', 'msqrt', 'mroot', 'mtext', 'mover', 'munder',
  'munderover', 'mtable', 'mtr', 'mtd', 'semantics', 'annotation'
]);

export function validateLessons(lessons) {
  const errors = [];
  const expect = (condition, message) => { if (!condition) errors.push(message); };
  const nonempty = value => typeof value === 'string' && value.trim().length > 0;
  const ids = new Set();
  const tasks = new Set();
  const html = (value, location) => {
    expect(typeof value === 'string', `${location}: HTML must be a string`);
    if (typeof value !== 'string') return;
    for (const match of value.matchAll(/<\/?\s*([a-z][\w:-]*)\b/gi)) {
      expect(allowedTags.has(match[1].toLowerCase()), `${location}: unsafe HTML tag ${match[1]}`);
    }
    expect(!/<[^>]*\s+on[\w:-]*\s*=/i.test(value), `${location}: HTML event handler`);
    expect(!/\b(?:href|src|xlink:href)\s*=\s*["']?\s*(?:javascript|vbscript|data)\s*:/i.test(value),
      `${location}: unsafe HTML URL`);
    expect(!/\bsrcdoc\s*=/i.test(value), `${location}: embedded HTML document`);
  };

  expect(Array.isArray(lessons), 'Lessons must be an array');
  if (!Array.isArray(lessons)) throw new Error(errors.join('\n'));
  expect(lessons.length === expectedTasks.length, `Expected ${expectedTasks.length} Area II tasks`);
  for (const lesson of lessons) {
    if (!lesson || typeof lesson !== 'object') { errors.push('Lesson must be an object'); continue; }
    const location = `Task ${lesson.task ?? '?'} (${lesson.id ?? '?'})`;
    expect(safeId.test(lesson.id ?? ''), `${location}: unsafe lesson id`);
    expect(!ids.has(lesson.id), `${location}: duplicate lesson id`);
    ids.add(lesson.id);
    expect(expectedTasks.includes(lesson.task), `${location}: unexpected ACS task`);
    expect(!tasks.has(lesson.task), `${location}: duplicate ACS task`);
    tasks.add(lesson.task);
    expect(nonempty(lesson.title) && nonempty(lesson.summary), `${location}: title and summary required`);
    expect(Array.isArray(lesson.objectives) && lesson.objectives.length > 0 && lesson.objectives.every(nonempty),
      `${location}: learning objectives required`);
    expect(Array.isArray(lesson.sections) && lesson.sections.length >= 5, `${location}: at least five sections required`);
    const sectionIds = new Set();
    for (const section of lesson.sections ?? []) {
      expect(safeId.test(section.id ?? ''), `${location}: unsafe section id`);
      expect(!sectionIds.has(section.id), `${location}: duplicate section id ${section.id}`);
      sectionIds.add(section.id);
      expect(nonempty(section.title) && plainText(section.body).length > 0,
        `${location}/${section.id}: section title and body required`);
      html(section.body, `${location}/${section.id}/body`);
      html(section.deep ?? '', `${location}/${section.id}/deep`);
    }
    expect(Array.isArray(lesson.quiz) && lesson.quiz.length === 6, `${location}: exactly six quiz questions required`);
    const questionIds = new Set();
    for (const question of lesson.quiz ?? []) {
      const qLocation = `${location}/${question.id ?? '?'}`;
      expect(safeId.test(question.id ?? ''), `${qLocation}: unsafe quiz id`);
      expect(!questionIds.has(question.id), `${qLocation}: duplicate quiz id`);
      questionIds.add(question.id);
      expect(nonempty(question.question), `${qLocation}: question prompt required`);
      const options = question.options ?? [];
      expect(Array.isArray(options) && options.length === 4 && options.every(nonempty),
        `${qLocation}: exactly four nonempty choices required`);
      expect(new Set(options.map(option => plainText(option).toLowerCase())).size === 4,
        `${qLocation}: choices must be unique`);
      expect(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < 4,
        `${qLocation}: correct answer index must be 0–3`);
      expect(Array.isArray(question.feedback) && question.feedback.length === 4 && question.feedback.every(nonempty),
        `${qLocation}: four option-specific explanations required`);
      expect(nonempty(question.hint), `${qLocation}: hint required`);
      expect(sectionIds.has(question.review), `${qLocation}: review target does not exist`);
    }
    expect(Array.isArray(lesson.sources) && lesson.sources.length > 0, `${location}: authoritative sources required`);
    for (const source of lesson.sources ?? []) {
      let url;
      try { url = new URL(source.url); } catch { /* reported below */ }
      expect(url?.protocol === 'https:' && nonempty(source.label), `${location}: source must have an HTTPS URL and label`);
    }
    expect(Array.isArray(lesson.materials) && lesson.materials.length > 0, `${location}: uploaded material references required`);
    for (const material of lesson.materials ?? []) {
      expect(attachedMaterials.has(material.file), `${location}: material was not in the uploaded archive: ${material.file}`);
    }
  }
  for (const task of expectedTasks) expect(tasks.has(task), `Missing Area II task ${task}`);
  if (errors.length) throw new Error(`Course data is invalid:\n${errors.join('\n')}`);
  return lessons;
}

export async function readTechnicalLessons(root = projectRoot) {
  const directory = path.join(root, 'technical');
  const files = (await readdir(directory)).filter(file => file.endsWith('.json')).sort();
  const lessons = [];
  for (const file of files) {
    const lesson = JSON.parse(await readFile(path.join(directory, file), 'utf8'));
    if (file !== `${lesson.id}.json`) throw new Error(`Lesson filename does not match id: ${file}`);
    lessons.push(lesson);
  }
  return validateLessons(lessons).sort((a, b) => expectedTasks.indexOf(a.task) - expectedTasks.indexOf(b.task));
}

export function createCourseArtifacts(lessons, legacy = maneuvers) {
  validateLessons(lessons);
  const outline = {};
  const search = [];
  for (const lesson of [...lessons].sort((a, b) => expectedTasks.indexOf(a.task) - expectedTasks.indexOf(b.task))) {
    outline[lesson.id] = {
      sections: lesson.sections.map(({ id, title }) => ({ id, title })),
      questions: lesson.quiz.length,
      words: lesson.sections.reduce((total, section) => total + plainText(`${section.body} ${section.deep ?? ''}`).split(/\s+/).filter(Boolean).length, 0)
    };
    for (const section of lesson.sections) {
      const body = plainText(section.body);
      const questions = lesson.quiz.filter(question => question.review === section.id).map(question => question.question);
      search.push({
        id: `${lesson.id}-${section.id}`,
        subject: lesson.title,
        task: lesson.task,
        title: section.title,
        href: `./technical.html?task=${lesson.id}#${section.id}`,
        text: plainText([lesson.title, section.title, section.body, section.deep ?? '', ...questions].join(' ')),
        summary: [...body].slice(0, 150).join('')
      });
    }
  }
  for (const lesson of legacy) {
    search.push({
      id: `maneuver-${lesson.id}`,
      subject: 'Maneuvers',
      task: '',
      title: lesson.title,
      href: `./lesson.html#${lesson.id}`,
      text: plainText([lesson.title, lesson.short, lesson.lead, lesson.why, lesson.derive, lesson.takeaway].join(' ')),
      summary: [...plainText(lesson.short || lesson.lead)].slice(0, 150).join('')
    });
  }
  return { outline, search };
}

export async function buildCourseIndex(root = projectRoot) {
  const lessons = await readTechnicalLessons(root);
  const { outline, search } = createCourseArtifacts(lessons);
  await Promise.all([
    writeFile(path.join(root, 'course-outline.js'), `// Generated by tools/build-course-index.mjs.\nexport const outline = ${JSON.stringify(outline, null, 2)};\n`),
    writeFile(path.join(root, 'search-index.json'), `${JSON.stringify(search)}\n`)
  ]);
  return { lessons: lessons.length, sections: search.length - maneuvers.length, maneuvers: maneuvers.length, entries: search.length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(await buildCourseIndex()));
}
