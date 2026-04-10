'use client';

import { useState, useCallback, useMemo } from 'react';
import { Copy, Check, Code, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CodeBlock {
  lang: string;
  code: string;
  startIndex: number;
  endIndex: number;
}

function detectLanguage(info: string): string {
  const map: Record<string, string> = {
    ts: 'TypeScript', tsx: 'TypeScript', js: 'JavaScript', jsx: 'JavaScript',
    py: 'Python', rs: 'Rust', go: 'Go', java: 'Java', rb: 'Ruby',
    css: 'CSS', html: 'HTML', json: 'JSON', sql: 'SQL', sh: 'Shell',
    bash: 'Shell', yml: 'YAML', yaml: 'YAML', md: 'Markdown',
    c: 'C', cpp: 'C++', cs: 'C#', php: 'PHP', swift: 'Swift',
    graphql: 'GraphQL', xml: 'XML', dockerfile: 'Dockerfile',
  };
  return map[info.toLowerCase()] || info || 'Code';
}

// Check if a range overlaps with any existing token
function isInsideToken(tokens: { start: number; end: number }[], start: number, end: number): boolean {
  return tokens.some(t => start < t.end && end > t.start);
}

// Remove overlapping tokens, keeping the one that appeared first (with priority)
function deduplicateTokens(tokens: { start: number; end: number; className: string; priority: number }[]) {
  const sorted = [...tokens].sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    // Same start: lower priority number = higher priority
    return a.priority - b.priority;
  });
  const result: { start: number; end: number; className: string }[] = [];
  let lastEnd = 0;
  for (const t of sorted) {
    if (t.start >= lastEnd) {
      result.push({ start: t.start, end: t.end, className: t.className });
      lastEnd = t.end;
    }
  }
  return result;
}

// Enhanced syntax highlighting with colored brackets (token-based to avoid overlaps)
function highlightSyntax(code: string, lang: string): string {
  // Step 1: Escape HTML entities
  const escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  if (lang === 'json' || lang === 'JSON') {
    let result = escaped
      .replace(/"([^"]+)"(\s*:)/g, '<span class="code-key">"$1"</span>$2')
      .replace(/:\s*"([^"]*)"/g, ': <span class="code-string">"$1"</span>')
      .replace(/:\s*(\d+\.?\d*)/g, ': <span class="code-number">$1</span>')
      .replace(/:\s*(true|false|null)/g, ': <span class="code-boolean">$1</span>')
      .replace(/([{}\[\]])/g, '<span class="code-bracket-curly">$1</span>');
    return result;
  }

  // Use a token-based approach to avoid overlapping regex matches
  // Priority: lower number = higher priority (rendered first)
  const tokens: { start: number; end: number; className: string; priority: number }[] = [];
  const input = escaped;

  // Priority 1: Comments
  let m;
  const singleCommentRegex = /(\/\/.*$)/gm;
  while ((m = singleCommentRegex.exec(input)) !== null) {
    tokens.push({ start: m.index, end: m.index + m[0].length, className: 'code-comment', priority: 1 });
  }
  const multiCommentRegex = /(\/\*[\s\S]*?\*\/)/g;
  while ((m = multiCommentRegex.exec(input)) !== null) {
    tokens.push({ start: m.index, end: m.index + m[0].length, className: 'code-comment', priority: 1 });
  }
  const hashCommentRegex = /(^|\s)(#.*)$/gm;
  while ((m = hashCommentRegex.exec(input)) !== null) {
    const start = m.index + m[1].length;
    tokens.push({ start, end: start + m[2].length, className: 'code-comment', priority: 1 });
  }

  // Priority 2: Strings
  const stringRegex = /(["'`])(?:(?!\1|\\).|\\.)*?\1/g;
  while ((m = stringRegex.exec(input)) !== null) {
    if (!isInsideToken(tokens, m.index, m.index + m[0].length)) {
      tokens.push({ start: m.index, end: m.index + m[0].length, className: 'code-string', priority: 2 });
    }
  }

  // Priority 3: Keywords
  const keywordRegex = /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|import|export|from|default|async|await|try|catch|finally|throw|new|this|typeof|instanceof|in|of|def|print|self|elif|lambda|yield|with|as|pass|raise|assert|fn|impl|pub|use|mod|struct|enum|match|loop|mut|ref|trait|where|type|interface|extends|implements|super|static|void|int|float|double|bool|string|char|long|short|byte|Map|Set|List|Array|Object|Promise|console|package|fmt|func|go|chan|select|defer|range|make|append|nil|True|False|None|println|namespace|using|public|private|protected|internal|readonly|abstract|override|virtual|sealed|partial|record|init|get|set|require)\b/g;
  while ((m = keywordRegex.exec(input)) !== null) {
    if (!isInsideToken(tokens, m.index, m.index + m[0].length)) {
      tokens.push({ start: m.index, end: m.index + m[0].length, className: 'code-keyword', priority: 3 });
    }
  }

  // Priority 3: Booleans and null
  const boolRegex = /\b(true|false|null|undefined)\b/g;
  while ((m = boolRegex.exec(input)) !== null) {
    if (!isInsideToken(tokens, m.index, m.index + m[0].length)) {
      tokens.push({ start: m.index, end: m.index + m[0].length, className: 'code-boolean', priority: 3 });
    }
  }

  // Priority 4: Numbers
  const numberRegex = /\b(\d+\.?\d*)\b/g;
  while ((m = numberRegex.exec(input)) !== null) {
    if (!isInsideToken(tokens, m.index, m.index + m[0].length)) {
      tokens.push({ start: m.index, end: m.index + m[0].length, className: 'code-number', priority: 4 });
    }
  }

  // Priority 5: Function calls
  const funcCallRegex = /\b([a-zA-Z_$][\w$]*)\s*(?=\()/g;
  while ((m = funcCallRegex.exec(input)) !== null) {
    if (!isInsideToken(tokens, m.index, m.index + m[0].length)) {
      tokens.push({ start: m.index, end: m.index + m[1].length, className: 'code-function', priority: 5 });
    }
  }

  // Priority 6: Operators
  const operatorRegex = /([+\-*/%=!<>&|^~?:]+)/g;
  while ((m = operatorRegex.exec(input)) !== null) {
    if (!isInsideToken(tokens, m.index, m.index + m[0].length)) {
      tokens.push({ start: m.index, end: m.index + m[0].length, className: 'code-operator', priority: 6 });
    }
  }

  // Priority 7: Brackets - colored distinctly
  // Round brackets: ()
  const roundBracketRegex = /([()])/g;
  while ((m = roundBracketRegex.exec(input)) !== null) {
    if (!isInsideToken(tokens, m.index, m.index + m[0].length)) {
      tokens.push({ start: m.index, end: m.index + m[0].length, className: 'code-bracket-round', priority: 7 });
    }
  }
  // Curly brackets: {}
  const curlyBracketRegex = /([{}])/g;
  while ((m = curlyBracketRegex.exec(input)) !== null) {
    if (!isInsideToken(tokens, m.index, m.index + m[0].length)) {
      tokens.push({ start: m.index, end: m.index + m[0].length, className: 'code-bracket-curly', priority: 7 });
    }
  }
  // Square brackets: []
  const squareBracketRegex = /(\[|\])/g;
  while ((m = squareBracketRegex.exec(input)) !== null) {
    if (!isInsideToken(tokens, m.index, m.index + m[0].length)) {
      tokens.push({ start: m.index, end: m.index + m[0].length, className: 'code-bracket-square', priority: 7 });
    }
  }

  // Remove duplicates and overlapping tokens
  const deduped = deduplicateTokens(tokens);

  // Build the highlighted HTML
  let result = '';
  let lastEnd = 0;
  for (const token of deduped) {
    if (token.start > lastEnd) {
      result += input.substring(lastEnd, token.start);
    }
    result += `<span class="${token.className}">${input.substring(token.start, token.end)}</span>`;
    lastEnd = token.end;
  }
  if (lastEnd < input.length) {
    result += input.substring(lastEnd);
  }

  return result;
}

function parseCodeBlocks(content: string): { blocks: CodeBlock[]; parts: { type: 'text' | 'code'; content: string; block?: CodeBlock }[] } {
  const blocks: CodeBlock[] = [];
  const regex = /```(\w*)\n([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    blocks.push({
      lang: match[1] || 'text',
      code: match[2],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  if (blocks.length === 0) {
    return { blocks: [], parts: [{ type: 'text', content }] };
  }

  const parts: { type: 'text' | 'code'; content: string; block?: CodeBlock }[] = [];
  let lastIndex = 0;
  for (const block of blocks) {
    if (block.startIndex > lastIndex) {
      parts.push({ type: 'text', content: content.slice(lastIndex, block.startIndex) });
    }
    parts.push({ type: 'code', content: block.code, block });
    lastIndex = block.endIndex;
  }
  if (lastIndex < content.length) {
    parts.push({ type: 'text', content: content.slice(lastIndex) });
  }

  return { blocks, parts };
}

function LineNumbers({ count }: { count: number }) {
  return (
    <div className="flex-shrink-0 select-none border-r border-[#181a1f] pr-3 text-right">
      {Array.from({ length: Math.max(count, 1) }, (_, i) => (
        <div key={i} className="text-[11px] leading-[1.6rem] text-[#5c6370] font-mono">
          {i + 1}
        </div>
      ))}
    </div>
  );
}

function CodeBlockRenderer({
  block,
  onStartEdit,
  onSaveEdit,
  isEditing,
  readOnly = false,
}: {
  block: CodeBlock;
  onStartEdit: () => void;
  onSaveEdit: (newCode: string) => void;
  isEditing: boolean;
  readOnly?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const language = detectLanguage(block.lang);
  const lines = block.code.split('\n');
  const highlightedCode = useMemo(() => highlightSyntax(block.code, language), [block.code, language]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(block.code).then(() => {
      setCopied(true);
      toast.success('Code copied');
      setTimeout(() => setCopied(false), 2000);
    });
  }, [block.code]);

  return (
    <div className="my-3 rounded-lg border border-[#3e4451] overflow-hidden bg-[#282c34]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#21252b] border-b border-[#181a1f]">
        <div className="flex items-center gap-2">
          {/* Traffic light dots */}
          <div className="flex items-center gap-1.5 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e06c75]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#e5c07b]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#98c379]" />
          </div>
          <Code className="w-3 h-3 text-[#abb2bf]" />
          <span className="text-[11px] font-medium text-[#abb2bf]">{language}</span>
          <span className="text-[10px] text-[#5c6370]">{lines.length} lines</span>
        </div>
        <div className="flex items-center gap-1">
          {!readOnly && !isEditing && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-white/10"
              onClick={onStartEdit}
              title="Edit code block"
            >
              <Edit3 className="w-3 h-3 text-[#abb2bf]" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-white/10" onClick={handleCopy}>
            {copied ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3 text-[#abb2bf]" />
            )}
          </Button>
        </div>
      </div>

      {/* Code content */}
      {isEditing ? (
        <div className="flex">
          <LineNumbers count={lines.length} />
          <textarea
            autoFocus
            defaultValue={block.code}
            onBlur={(e) => {
              onSaveEdit(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.currentTarget.blur();
              }
              if (e.key === 'Tab') {
                e.preventDefault();
                const start = e.currentTarget.selectionStart;
                const end = e.currentTarget.selectionEnd;
                const target = e.currentTarget;
                target.value = target.value.substring(0, start) + '  ' + target.value.substring(end);
                target.selectionStart = target.selectionEnd = start + 2;
              }
            }}
            className="flex-1 min-h-[100px] p-3 bg-[#282c34] font-mono text-xs leading-[1.6rem] text-[#abb2bf] resize-none focus:outline-none border-none"
            spellCheck={false}
          />
        </div>
      ) : (
        <div
          className="flex overflow-x-auto cursor-pointer font-mono text-xs"
          onDoubleClick={() => !readOnly && onStartEdit()}
          title={readOnly ? undefined : 'Double-click to edit'}
        >
          <LineNumbers count={lines.length} />
          <pre
            className="p-3 flex-1 leading-[1.6rem] whitespace-pre text-[#abb2bf]"
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </div>
      )}
    </div>
  );
}

interface CodeBlockEditorProps {
  content: string;
  onChange: (content: string) => void;
  readOnly?: boolean;
}

export function CodeBlockEditor({ content, onChange, readOnly = false }: CodeBlockEditorProps) {
  const [editingBlockIndex, setEditingBlockIndex] = useState<number | null>(null);
  const { blocks, parts } = (() => {
    const result = parseCodeBlocks(content);
    return result;
  })();

  const handleBlockEdit = useCallback((blockIndex: number, newCode: string) => {
    const block = blocks[blockIndex];
    const prefix = content.slice(0, block.startIndex + 3 + (block.lang ? block.lang.length : 0));
    const suffix = content.slice(block.endIndex - 3);
    onChange(prefix + newCode + suffix);
  }, [blocks, content, onChange]);

  if (blocks.length === 0) return null;

  return (
    <div className="note-content-with-code">
      <style>{`
        /* One Dark Pro color scheme */
        .code-keyword { color: #c678dd; font-weight: 500; }
        .code-string { color: #98c379; }
        .code-number { color: #d19a66; }
        .code-comment { color: #5c6370; font-style: italic; }
        .code-boolean { color: #d19a66; font-weight: 500; }
        .code-key { color: #e06c75; }
        .code-function { color: #61afef; }
        .code-operator { color: #56b6c2; }
        .code-bracket-round { color: #e5c07b; font-weight: 700; }
        .code-bracket-curly { color: #e06c75; font-weight: 700; }
        .code-bracket-square { color: #98c379; font-weight: 700; }
        .code-bracket-angle { color: #56b6c2; font-weight: 700; }
      `}</style>
      {parts.map((part, i) => {
        if (part.type === 'text') {
          return (
            <span key={i} className="whitespace-pre-wrap">
              {part.content}
            </span>
          );
        }
        return (
          <CodeBlockRenderer
            key={part.block?.startIndex ?? i}
            block={part.block!}
            onStartEdit={() => setEditingBlockIndex(blocks.indexOf(part.block!))}
            onSaveEdit={(newCode) => {
              const blockIdx = blocks.indexOf(part.block!);
              handleBlockEdit(blockIdx, newCode);
              setEditingBlockIndex(null);
            }}
            isEditing={editingBlockIndex === blocks.indexOf(part.block!)}
            readOnly={readOnly}
          />
        );
      })}
    </div>
  );
}
