'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  Code,
  X,
  Check,
  ChevronsUpDown,
  Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'rust', label: 'Rust' },
  { value: 'go', label: 'Go' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'bash', label: 'Shell / Bash' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'dockerfile', label: 'Dockerfile' },
  { value: 'graphql', label: 'GraphQL' },
  { value: 'plaintext', label: 'Plain Text' },
];

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

// --- Syntax highlighting engine ---
function isInsideToken(tokens: { start: number; end: number }[], start: number, end: number): boolean {
  return tokens.some(t => start < t.end && end > t.start);
}

function deduplicateTokens(tokens: { start: number; end: number; className: string; priority: number }[]) {
  const sorted = [...tokens].sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
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

function highlightSyntax(code: string, lang: string): string {
  const escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  if (lang === 'json' || lang === 'JSON') {
    return escaped
      .replace(/"([^"]+)"(\s*:)/g, '<span class="code-key">"$1"</span>$2')
      .replace(/:\s*"([^"]*)"/g, ': <span class="code-string">"$1"</span>')
      .replace(/:\s*(\d+\.?\d*)/g, ': <span class="code-number">$1</span>')
      .replace(/:\s*(true|false|null)/g, ': <span class="code-boolean">$1</span>')
      .replace(/([{}\[\]])/g, '<span class="code-bracket-curly">$1</span>');
  }

  const tokens: { start: number; end: number; className: string; priority: number }[] = [];
  const input = escaped;
  let m;

  // Comments
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

  // Strings
  const stringRegex = /(["'`])(?:(?!\1|\\).|\\.)*?\1/g;
  while ((m = stringRegex.exec(input)) !== null) {
    if (!isInsideToken(tokens, m.index, m.index + m[0].length)) {
      tokens.push({ start: m.index, end: m.index + m[0].length, className: 'code-string', priority: 2 });
    }
  }

  // Keywords
  const keywordRegex = /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|import|export|from|default|async|await|try|catch|finally|throw|new|this|typeof|instanceof|in|of|def|print|self|elif|lambda|yield|with|as|pass|raise|assert|fn|impl|pub|use|mod|struct|enum|match|loop|mut|ref|trait|where|type|interface|extends|implements|super|static|void|int|float|double|bool|string|char|long|short|byte|Map|Set|List|Array|Object|Promise|console|package|fmt|func|go|chan|select|defer|range|make|append|nil|True|False|None|println|namespace|using|public|private|protected|internal|readonly|abstract|override|virtual|sealed|partial|record|init|get|set|require)\b/g;
  while ((m = keywordRegex.exec(input)) !== null) {
    if (!isInsideToken(tokens, m.index, m.index + m[0].length)) {
      tokens.push({ start: m.index, end: m.index + m[0].length, className: 'code-keyword', priority: 3 });
    }
  }

  // Booleans
  const boolRegex = /\b(true|false|null|undefined)\b/g;
  while ((m = boolRegex.exec(input)) !== null) {
    if (!isInsideToken(tokens, m.index, m.index + m[0].length)) {
      tokens.push({ start: m.index, end: m.index + m[0].length, className: 'code-boolean', priority: 3 });
    }
  }

  // Numbers
  const numberRegex = /\b(\d+\.?\d*)\b/g;
  while ((m = numberRegex.exec(input)) !== null) {
    if (!isInsideToken(tokens, m.index, m.index + m[0].length)) {
      tokens.push({ start: m.index, end: m.index + m[0].length, className: 'code-number', priority: 4 });
    }
  }

  // Function calls
  const funcCallRegex = /\b([a-zA-Z_$][\w$]*)\s*(?=\()/g;
  while ((m = funcCallRegex.exec(input)) !== null) {
    if (!isInsideToken(tokens, m.index, m.index + m[0].length)) {
      tokens.push({ start: m.index, end: m.index + m[1].length, className: 'code-function', priority: 5 });
    }
  }

  // Operators
  const operatorRegex = /([+\-*/%=!<>&|^~?:]+)/g;
  while ((m = operatorRegex.exec(input)) !== null) {
    if (!isInsideToken(tokens, m.index, m.index + m[0].length)) {
      tokens.push({ start: m.index, end: m.index + m[0].length, className: 'code-operator', priority: 6 });
    }
  }

  // Brackets
  const roundBracketRegex = /([()])/g;
  while ((m = roundBracketRegex.exec(input)) !== null) {
    if (!isInsideToken(tokens, m.index, m.index + m[0].length)) {
      tokens.push({ start: m.index, end: m.index + m[0].length, className: 'code-bracket-round', priority: 7 });
    }
  }
  const curlyBracketRegex = /([{}])/g;
  while ((m = curlyBracketRegex.exec(input)) !== null) {
    if (!isInsideToken(tokens, m.index, m.index + m[0].length)) {
      tokens.push({ start: m.index, end: m.index + m[0].length, className: 'code-bracket-curly', priority: 7 });
    }
  }
  const squareBracketRegex = /(\[|\])/g;
  while ((m = squareBracketRegex.exec(input)) !== null) {
    if (!isInsideToken(tokens, m.index, m.index + m[0].length)) {
      tokens.push({ start: m.index, end: m.index + m[0].length, className: 'code-bracket-square', priority: 7 });
    }
  }

  const deduped = deduplicateTokens(tokens);

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

// --- Syntax highlighting CSS ---
const SYNTAX_CSS = `
  .cb-keyword { color: #c678dd; font-weight: 500; }
  .cb-string { color: #98c379; }
  .cb-number { color: #d19a66; }
  .cb-comment { color: #5c6370; font-style: italic; }
  .cb-boolean { color: #d19a66; font-weight: 500; }
  .cb-key { color: #e06c75; }
  .cb-function { color: #61afef; }
  .cb-operator { color: #56b6c2; }
  .cb-bracket-round { color: #e5c07b; font-weight: 700; }
  .cb-bracket-curly { color: #e06c75; font-weight: 700; }
  .cb-bracket-square { color: #98c379; font-weight: 700; }
  .cb-bracket-angle { color: #56b6c2; font-weight: 700; }
`;

// Prepend class names with "cb-" prefix to avoid conflicts with other code styles
function highlightSyntaxScoped(code: string, lang: string): string {
  return highlightSyntax(code, lang).replace(/class="code-/g, 'class="cb-');
}

interface CodeBlockInsertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (lang: string, code: string) => void;
}

export function CodeBlockInsertDialog({ open, onOpenChange, onInsert }: CodeBlockInsertDialogProps) {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [langPopoverOpen, setLangPopoverOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const selectedLang = LANGUAGES.find(l => l.value === language) ?? LANGUAGES[0];

  const filteredLanguages = LANGUAGES.filter(l =>
    l.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInsert = useCallback(() => {
    if (!code.trim()) return;
    onInsert(language, code);
    setCode('');
    setLanguage('javascript');
    setSearchQuery('');
    onOpenChange(false);
  }, [language, code, onInsert, onOpenChange]);

  const handleClose = useCallback(() => {
    setCode('');
    setLanguage('javascript');
    setSearchQuery('');
    onOpenChange(false);
  }, [onOpenChange]);

  useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [open]);

  // Sync scroll between textarea and highlighted backdrop
  const handleScroll = useCallback(() => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  const lines = code.split('\n');
  const lineCount = lines.length;

  const highlightedCode = useMemo(() => highlightSyntaxScoped(code, language), [code, language]);

  // Ensure trailing newline for proper display alignment
  const displayCode = code + (code.endsWith('\n') ? '' : '\n');

  const handleCopy = useCallback(() => {
    if (!code.trim()) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      toast.success('Code copied');
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl p-0 gap-0 flex flex-col !rounded-xl overflow-hidden" showCloseButton={false}>
        {/* Accessible title for screen readers (hidden visually) */}
        <DialogTitle className="sr-only">Insert Code Block</DialogTitle>

        {/* Header bar — IDE style */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#21252b] border-b border-[#181a1f]">
          <div className="flex items-center gap-3">
            {/* Traffic light dots */}
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#e06c75] hover:brightness-110 cursor-pointer transition-all" />
              <span className="w-3 h-3 rounded-full bg-[#e5c07b] hover:brightness-110 cursor-pointer transition-all" />
              <span className="w-3 h-3 rounded-full bg-[#98c379] hover:brightness-110 cursor-pointer transition-all" />
            </div>
            <Code className="w-3.5 h-3.5 text-[#5c6370]" />
            <span className="text-[11px] font-medium text-[#abb2bf]">{selectedLang.label}</span>
            <span className="text-[10px] text-[#5c6370]">{lineCount} lines</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-white/10"
              onClick={handleCopy}
              disabled={!code.trim()}
              title="Copy code"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-[#5c6370]" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-white/10"
              onClick={handleClose}
            >
              <X className="w-3.5 h-3.5 text-[#5c6370]" />
            </Button>
          </div>
        </div>

        {/* Language selector bar */}
        <div className="flex items-center gap-3 px-4 py-2 bg-[#282c34] border-b border-[#3e4451]">
          <span className="text-[11px] font-medium text-[#5c6370]">Language</span>
          <Popover open={langPopoverOpen} onOpenChange={setLangPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                className="flex items-center gap-2 h-7 px-2.5 rounded-md border border-[#3e4451] bg-[#21252b] hover:bg-[#2c313a] transition-colors text-xs text-[#abb2bf]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#61afef]" />
                {selectedLang.label}
                <ChevronsUpDown className="w-3 h-3 text-[#5c6370]" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-1.5 bg-[#21252b] border-[#3e4451]" align="start">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search languages..."
                className="w-full px-2 py-1.5 text-xs bg-[#282c34] border border-[#3e4451] rounded-md outline-none text-[#abb2bf] placeholder:text-[#5c6370] mb-1"
                autoFocus
              />
              <div className="max-h-[200px] overflow-y-auto">
                {filteredLanguages.map((lang) => (
                  <button
                    key={lang.value}
                    className={cn(
                      'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-left transition-colors',
                      'hover:bg-[#3e4451] text-[#abb2bf]',
                      language === lang.value && 'bg-[#3e4451] font-medium'
                    )}
                    onClick={() => {
                      setLanguage(lang.value);
                      setLangPopoverOpen(false);
                      setSearchQuery('');
                    }}
                  >
                    <span className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      language === lang.value ? 'bg-[#61afef]' : 'bg-[#5c6370]'
                    )} />
                    {lang.label}
                    <span className="ml-auto text-[10px] text-[#5c6370] font-mono">
                      {lang.value}
                    </span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* IDE Code Editor — single panel with live syntax highlighting */}
        <div className="flex-1 min-h-0 overflow-hidden bg-[#282c34]">
          <div className="flex h-full" style={{ minHeight: '350px', maxHeight: '55vh' }}>
            <LineNumbers count={lineCount} />

            {/* Editor wrapper: highlights behind, transparent textarea on top */}
            <div className="relative flex-1 overflow-hidden">
              <style>{SYNTAX_CSS}</style>

              {/* Highlighted code backdrop */}
              <pre
                ref={preRef}
                className="absolute inset-0 p-3 m-0 font-mono text-xs leading-[1.6rem] whitespace-pre text-[#abb2bf] overflow-hidden pointer-events-none"
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: highlightedCode || '\n' }}
              />

              {/* Invisible textarea for input — overlaid on top */}
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onScroll={handleScroll}
                placeholder="Paste or type your code here..."
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                className={cn(
                  'absolute inset-0 w-full h-full p-3 m-0 resize-none',
                  'font-mono text-xs leading-[1.6rem]',
                  'bg-transparent text-transparent caret-[#528bff]',
                  'border-none outline-none',
                  'selection:bg-[#3e4451]/70'
                )}
                style={{
                  // Make tab stops match the font
                  tabSize: 2,
                  MozTabSize: 2,
                }}
                onKeyDown={(e) => {
                  // Tab inserts 2 spaces
                  if (e.key === 'Tab') {
                    e.preventDefault();
                    const target = e.target as HTMLTextAreaElement;
                    const start = target.selectionStart;
                    const end = target.selectionEnd;
                    const newVal = code.substring(0, start) + '  ' + code.substring(end);
                    setCode(newVal);
                    requestAnimationFrame(() => {
                      target.selectionStart = target.selectionEnd = start + 2;
                    });
                  }
                  // Cmd/Ctrl+Enter to insert
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleInsert();
                  }
                  // Auto-indent + auto-close brackets on Enter
                  if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey) {
                    const target = e.target as HTMLTextAreaElement;
                    const start = target.selectionStart;
                    const currentLine = code.substring(0, start).split('\n').pop() || '';
                    const indent = currentLine.match(/^(\s*)/)?.[1] || '';
                    const charBefore = code.substring(start - 1, start);
                    const closeBracket: Record<string, string> = {
                      '{': '}', '(': ')', '[': ']',
                      '"': '"', "'": "'", '`': '`',
                    };
                    if (closeBracket[charBefore]) {
                      e.preventDefault();
                      const cb = closeBracket[charBefore];
                      const newVal = code.substring(0, start) + '\n' + indent + '  \n' + indent + cb + code.substring(target.selectionEnd);
                      setCode(newVal);
                      requestAnimationFrame(() => {
                        target.selectionStart = target.selectionEnd = start + 1 + indent.length + 2;
                      });
                    } else if (indent) {
                      e.preventDefault();
                      const newVal = code.substring(0, start) + '\n' + indent + code.substring(target.selectionEnd);
                      setCode(newVal);
                      requestAnimationFrame(() => {
                        target.selectionStart = target.selectionEnd = start + 1 + indent.length;
                      });
                    }
                  }
                  // Auto-close brackets/quotes
                  const autoCloseMap: Record<string, string> = {
                    '{': '}', '(': ')', '[': ']', '"': '"', "'": "'", '`': '`',
                  };
                  if (autoCloseMap[e.key]) {
                    const target = e.target as HTMLTextAreaElement;
                    const start = target.selectionStart;
                    const end = target.selectionEnd;
                    // Only auto-close if there's no selection
                    if (start === end) {
                      e.preventDefault();
                      const newVal = code.substring(0, start) + e.key + autoCloseMap[e.key] + code.substring(end);
                      setCode(newVal);
                      requestAnimationFrame(() => {
                        target.selectionStart = target.selectionEnd = start + 1;
                      });
                    }
                  }
                }}
              />

              {/* Empty state overlay */}
              {!code.trim() && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center opacity-30">
                    <Code className="w-10 h-10 mx-auto mb-2 text-[#5c6370]" />
                    <p className="text-sm text-[#5c6370]">Start typing or paste your code</p>
                    <p className="text-[10px] text-[#5c6370] mt-1">Syntax highlighting is live</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#21252b] border-t border-[#181a1f]">
          <p className="text-[10px] text-[#5c6370]">
            Tab indent &middot; Auto-close brackets &middot; {navigator.platform?.includes('Mac') ? '⌘' : 'Ctrl+'}+Enter to insert
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-[#abb2bf] hover:bg-[#3e4451] hover:text-[#abb2bf]"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs gap-1.5 bg-[#61afef] text-[#282c34] hover:bg-[#61afeee0] font-medium"
              onClick={handleInsert}
              disabled={!code.trim()}
            >
              <Check className="w-3 h-3" />
              Insert Code Block
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
