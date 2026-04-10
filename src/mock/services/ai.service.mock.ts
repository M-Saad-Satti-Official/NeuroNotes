const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const tagKeywordMap: Record<string, string[]> = {
  react: ['react', 'components', 'hooks', 'jsx', 'virtual-dom'],
  typescript: ['typescript', 'ts', 'types', 'generics', 'type-safety'],
  javascript: ['javascript', 'js', 'es6', 'async', 'promise'],
  nextjs: ['nextjs', 'next.js', 'ssr', 'ssg', 'app-router'],
  python: ['python', 'django', 'flask', 'fastapi', 'pip'],
  rust: ['rust', 'cargo', 'ownership', 'borrowing', 'lifetime'],
  database: ['database', 'sql', 'nosql', 'postgres', 'mysql'],
  api: ['api', 'rest', 'graphql', 'endpoint', 'http'],
  ai: ['ai', 'machine-learning', 'neural-network', 'deep-learning', 'model'],
  llm: ['llm', 'gpt', 'language-model', 'prompt', 'token'],
  design: ['design', 'ui', 'ux', 'css', 'layout'],
  frontend: ['frontend', 'react', 'vue', 'angular', 'svelte'],
  backend: ['backend', 'server', 'node', 'express', 'microservice'],
  startup: ['startup', 'mvp', 'lean', 'pivot', 'growth'],
  productivity: ['productivity', 'workflow', 'focus', 'time-management', 'habits'],
  fitness: ['fitness', 'running', 'exercise', 'health', 'endurance'],
  mental: ['mental-health', 'mindset', 'resilience', 'wellness', 'meditation'],
  knowledge: ['knowledge', 'learning', 'notes', 'zettelkasten', 'pkm'],
  security: ['security', 'auth', 'encryption', 'vulnerability', 'oauth'],
  performance: ['performance', 'optimization', 'caching', 'speed', 'benchmark'],
  testing: ['testing', 'jest', 'unit-test', 'e2e', 'coverage'],
  devops: ['devops', 'docker', 'kubernetes', 'ci/cd', 'deployment'],
  architecture: ['architecture', 'patterns', 'microservices', 'monolith', 'system-design'],
};

export async function generateTags(content: string): Promise<string[]> {
  await delay(500);
  const lowerContent = content.toLowerCase();

  const scoredTags: { tag: string; score: number }[] = [];

  for (const [keyword, relatedTags] of Object.entries(tagKeywordMap)) {
    const keywordMatches = (lowerContent.match(new RegExp(keyword, 'gi')) || []).length;
    if (keywordMatches > 0) {
      scoredTags.push({ tag: keyword, score: keywordMatches * 3 });
    }
    for (const tag of relatedTags) {
      const matches = (lowerContent.match(new RegExp(tag.replace('-', '[- ]?'), 'gi')) || []).length;
      if (matches > 0) {
        scoredTags.push({ tag, score: matches });
      }
    }
  }

  // Sort by score and take top 3-6
  scoredTags.sort((a, b) => b.score - a.score);
  const uniqueTags = [...new Set(scoredTags.map(t => t.tag))];
  const count = 3 + Math.floor(Math.random() * 4); // 3-6 tags
  return uniqueTags.slice(0, count);
}

export async function generateTitle(content: string): Promise<string> {
  await delay(400);
  const trimmed = content.trim();
  if (!trimmed) return 'Untitled';

  // Extract first sentence (up to first period, newline, or 50 chars)
  const firstSentence = trimmed.split(/[.!?\n]/)[0] || trimmed.slice(0, 50);
  const title = firstSentence.trim().slice(0, 50);
  // Capitalize first letter
  return title.charAt(0).toUpperCase() + title.slice(1);
}
