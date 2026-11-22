import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { lessons as maneuvers } from '../content.js';
import { tasks as catalog } from '../technical-catalog.js';
import { attachedMaterials, createCourseArtifacts, expectedTasks, plainText, readTechnicalLessons, validateLessons } from '../tools/build-course-index.mjs';

const lessons = await readTechnicalLessons();
const { outline, search } = createCourseArtifacts(lessons);
const clone = () => structuredClone(lessons);

test('course navigation catalog and lesson files agree on route ids and task labels',()=>{
  assert.deepEqual(catalog.map(t=>t[0]),expectedTasks);
  for(const [task,id,title,summary] of catalog){
    assert.equal(lessons.find(l=>l.id===id)?.task,task);
    assert.ok(title&&summary);
  }
});

test('Area II includes every provided ACS task exactly once with complete review quizzes', () => {
  assert.deepEqual(lessons.map(lesson => lesson.task), expectedTasks);
  assert.equal(lessons.length, 14);
  for (const lesson of lessons) {
    assert.ok(lesson.sections.length >= 5, lesson.id);
    assert.equal(lesson.quiz.length, 6, lesson.id);
    for (const question of lesson.quiz) {
      assert.equal(question.options.length, 4);
      assert.equal(new Set(question.options.map(option => option.trim().toLowerCase())).size, 4);
      assert.equal(question.feedback.length, 4);
      assert.ok(question.feedback.every(feedback => feedback.trim().length > 15));
      assert.ok(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < 4);
      assert.ok(question.hint.trim().length > 0);
      assert.ok(lesson.sections.some(section => section.id === question.review), `${lesson.id}/${question.id}`);
    }
  }
});

test('all source-document references name actual supplied materials and use HTTPS sources', () => {
  for (const lesson of lessons) {
    for (const material of lesson.materials) assert.ok(attachedMaterials.has(material.file), material.file);
    for (const source of lesson.sources) {
      const url = new URL(source.url);
      assert.equal(url.protocol, 'https:', source.url);
      assert.ok(source.label.trim());
    }
  }
});

test('every section and legacy maneuver has a unique searchable, resolvable link', () => {
  const totalSections = lessons.reduce((count, lesson) => count + lesson.sections.length, 0);
  assert.equal(search.length, totalSections + 6);
  assert.equal(new Set(search.map(entry => entry.id)).size, search.length);
  assert.equal(new Set(search.map(entry => entry.href)).size, search.length);
  for (const entry of search) {
    const url = new URL(entry.href, 'https://academy.example/');
    assert.equal(url.origin, 'https://academy.example');
    if (entry.subject === 'Maneuvers') {
      assert.equal(url.pathname, '/lesson.html');
      assert.ok(maneuvers.some(lesson => lesson.id === url.hash.slice(1)));
    } else {
      assert.equal(url.pathname, '/technical.html');
      const lesson = lessons.find(item => item.id === url.searchParams.get('task'));
      assert.ok(lesson, entry.href);
      const section = lesson.sections.find(item => item.id === url.hash.slice(1));
      assert.ok(section, entry.href);
      assert.equal(entry.subject, lesson.title);
      assert.equal(entry.task, lesson.task);
      assert.equal(entry.title, section.title);
      assert.ok(entry.text.includes(plainText(section.body).slice(0, 70)));
      if (section.deep) assert.ok(entry.text.includes(plainText(section.deep).slice(0, 70)));
      for (const question of lesson.quiz.filter(item => item.review === section.id)) {
        assert.ok(entry.text.includes(plainText(question.question)), `${lesson.id}/${question.id} is not searchable`);
      }
    }
    assert.ok(entry.summary.length > 0);
    assert.ok([...entry.summary].length <= 150);
    assert.doesNotMatch(entry.text, /<\/?(?:p|strong|math|mrow|mfrac|table|li)\b/i);
  }
});

test('the small outline contains section navigation and reading counts without lesson bodies', () => {
  assert.deepEqual(Object.keys(outline), lessons.map(lesson => lesson.id));
  for (const lesson of lessons) {
    const item = outline[lesson.id];
    assert.equal(item.questions, 6);
    assert.ok(Number.isInteger(item.words) && item.words > 100);
    assert.deepEqual(item.sections, lesson.sections.map(({ id, title }) => ({ id, title })));
    assert.deepEqual(Object.keys(item).sort(), ['questions', 'sections', 'words']);
  }
  assert.ok(JSON.stringify(outline).length < 30000, 'The navigation outline should remain small.');
});

test('search includes terms from deeper explanations, navigation calculations, and relevant quiz prompts', () => {
  const terms = [
    ['performance', 'maneuvering speed'],
    ['airspace', 'special VFR'],
    ['navigation-systems', 'slant range'],
    ['cross-country', 'magnetic course'],
    ['regulations', 'immediate notification']
  ];
  for (const [id, term] of terms) {
    assert.ok(search.some(entry => entry.href.includes(`task=${id}#`) && entry.text.toLowerCase().includes(term.toLowerCase())), `${id}: ${term}`);
  }
  const fixture = clone();
  fixture[0].quiz[0].question = 'UNIQUE REVIEW QUESTION SEARCH TERM';
  fixture[0].quiz[0].options = ['ANSWER ONE NOT FOR SEARCH', 'ANSWER TWO NOT FOR SEARCH', 'ANSWER THREE NOT FOR SEARCH', 'ANSWER FOUR NOT FOR SEARCH'];
  const changed = createCourseArtifacts(fixture).search;
  const matching = changed.filter(entry => entry.text.includes('UNIQUE REVIEW QUESTION SEARCH TERM'));
  assert.equal(matching.length, 1);
  assert.ok(matching[0].href.endsWith(`#${fixture[0].quiz[0].review}`));
  assert.ok(changed.every(entry => !entry.text.includes('ANSWER ONE NOT FOR SEARCH')));
});

test('plain text extraction decodes chart and equation characters without exposing markup', () => {
  assert.equal(plainText('<p>Mass&nbsp;&amp;&nbsp;balance: 2 &times; 3 = 6.</p><p>&#x3c6; &#176; &lt; 10</p>'), 'Mass & balance: 2 × 3 = 6. φ ° < 10');
  assert.equal(plainText('<p>Before</p><!-- hidden --><script>bad()</script><style>.x{}</style><p>After</p>'), 'Before After');
});

test('validation catches missing tasks, broken review destinations, and ambiguous choice data', () => {
  assert.throws(() => validateLessons(lessons.slice(1)), /Missing Area II task A/);
  const missingReview = clone(); missingReview[0].quiz[0].review = 'missing';
  assert.throws(() => validateLessons(missingReview), /review target does not exist/);
  const duplicateChoice = clone(); duplicateChoice[0].quiz[0].options[1] = duplicateChoice[0].quiz[0].options[0];
  assert.throws(() => validateLessons(duplicateChoice), /choices must be unique/);
  const wrongIndex = clone(); wrongIndex[0].quiz[0].answer = 4;
  assert.throws(() => validateLessons(wrongIndex), /answer index must be 0–3/);
  const feedback = clone(); feedback[0].quiz[0].feedback.pop();
  assert.throws(() => validateLessons(feedback), /four option-specific explanations/);
});

test('validation rejects executable HTML, unsafe ids, insecure sources, and invented source files', () => {
  for (const body of ['<script>alert(1)</script>', '<p onclick="bad()">Text</p>', '<a href="javascript:bad()">Text</a>']) {
    const injected = clone(); injected[0].sections[0].body = body;
    assert.throws(() => validateLessons(injected), /unsafe HTML|HTML event handler/);
  }
  const id = clone(); id[0].id = '../wrong';
  assert.throws(() => validateLessons(id), /unsafe lesson id/);
  const source = clone(); source[0].sources[0].url = 'http://example.com';
  assert.throws(() => validateLessons(source), /HTTPS URL/);
  const material = clone(); material[0].materials[0].file = 'unprovided.pptx';
  assert.throws(() => validateLessons(material), /not in the uploaded archive/);
});

test('checked-in generated artifacts match current lesson data', async () => {
  const generated = await import('../course-outline.js');
  const index = JSON.parse(await readFile(new URL('../search-index.json', import.meta.url), 'utf8'));
  assert.deepEqual(generated.outline, outline, 'Run node tools/build-course-index.mjs after editing lessons.');
  assert.deepEqual(index, search, 'Search data must describe the same source state as the lessons.');
});
