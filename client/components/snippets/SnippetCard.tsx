'use client'

import { useState, useMemo } from 'react'
import type { Snippet } from '@/app/snippets/SnippetsClient'

// ---------------------------------------------------------------------------
// Minimal syntax highlighter (no external deps)
// ---------------------------------------------------------------------------

const LANGUAGE_KEYWORDS: Record<string, string[]> = {
  typescript: [
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'while', 'for',
    'new', 'class', 'interface', 'type', 'extends', 'implements', 'import',
    'export', 'default', 'from', 'async', 'await', 'try', 'catch', 'throw',
    'private', 'public', 'readonly', 'static', 'of', 'in', 'true', 'false',
    'null', 'undefined', 'void', 'number', 'string', 'boolean', 'this',
  ],
  javascript: [
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'while', 'for',
    'new', 'class', 'extends', 'import', 'export', 'default', 'from', 'async',
    'await', 'try', 'catch', 'throw', 'of', 'in', 'true', 'false', 'null',
    'undefined', 'this',
  ],
  python: [
    'def', 'class', 'return', 'if', 'else', 'elif', 'for', 'while', 'import',
    'from', 'as', 'with', 'try', 'except', 'finally', 'raise', 'in', 'not',
    'and', 'or', 'is', 'None', 'True', 'False', 'pass', 'break', 'continue',
    'lambda', 'yield', 'self',
  ],
  css: [
    'background', 'border', 'border-radius', 'box-shadow', 'color', 'display',
    'flex', 'font', 'height', 'margin', 'padding', 'position', 'transform',
    'transition', 'width', 'opacity', 'overflow', 'z-index',
  ],
  bash: [
    'if', 'then', 'else', 'fi', 'for', 'do', 'done', 'while', 'echo', 'exit',
    'return', 'function', 'export', 'source', 'cd', 'ls', 'mkdir', 'rm',
  ],
}

type TokenType = 'keyword' | 'string' | 'comment' | 'number' | 'plain'

interface Token {
  type: TokenType
  value: string
}

function tokenize(code: string, language: string): Token[] {
  const tokens: Token[] = []
  const keywords = new Set(LANGUAGE_KEYWORDS[language] ?? [])

  // We'll process char by char using a simple state machine approach,
  // but for simplicity use regex-based splitting on distinct regions.
  // Regions: line comments, block comments, strings (single/double/template), numbers, words, rest.

  const pattern = new RegExp(
    [
      // template literals (backtick)
      '`(?:[^`\\\\]|\\\\.)*`',
      // double-quoted strings
      '"(?:[^"\\\\]|\\\\.)*"',
      // single-quoted strings
      "'(?:[^'\\\\]|\\\\.)*'",
      // line comments
      language === 'css' ? '(?!x)x' : '//[^\\n]*',  // skip for css
      // block comments
      '/\\*[\\s\\S]*?\\*/',
      // CSS single-line: no // but /* */ handled above
      // numbers
      '\\b\\d+(?:\\.\\d+)?\\b',
      // words (identifiers / keywords)
      '[A-Za-z_$][\\w$]*',
      // anything else (operators, punctuation, whitespace)
      '[\\s\\S]',
    ].filter(Boolean).join('|'),
    'g',
  )

  let match: RegExpExecArray | null
  while ((match = pattern.exec(code)) !== null) {
    const val = match[0]
    let type: TokenType = 'plain'

    if (
      (val.startsWith('"') || val.startsWith("'") || val.startsWith('`'))
    ) {
      type = 'string'
    } else if (val.startsWith('//') || val.startsWith('#')) {
      type = 'comment'
    } else if (val.startsWith('/*')) {
      type = 'comment'
    } else if (/^\d/.test(val)) {
      type = 'number'
    } else if (keywords.has(val)) {
      type = 'keyword'
    }

    tokens.push({ type, value: val })
  }

  return tokens
}

const TOKEN_COLORS: Record<TokenType, string> = {
  keyword: 'text-blue-400',
  string: 'text-green-400',
  comment: 'text-neutral-500',
  number: 'text-orange-400',
  plain: 'text-neutral-200',
}

function SyntaxCode({ code, language }: { code: string; language: string }) {
  const tokens = useMemo(() => tokenize(code, language), [code, language])

  return (
    <code className="text-xs leading-relaxed font-mono">
      {tokens.map((tok, i) => (
        <span key={i} className={TOKEN_COLORS[tok.type]}>
          {tok.value}
        </span>
      ))}
    </code>
  )
}

// ---------------------------------------------------------------------------
// Language badge color
// ---------------------------------------------------------------------------

const LANG_BADGE: Record<string, string> = {
  typescript: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  javascript: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  python: 'bg-green-500/15 text-green-400 border-green-500/30',
  css: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  bash: 'bg-neutral-500/15 text-neutral-400 border-neutral-500/30',
}

const CATEGORY_BADGE: Record<string, string> = {
  algorithm: 'text-orange-400',
  hook: 'text-pink-400',
  utility: 'text-cyan-400',
  animation: 'text-violet-400',
  game: 'text-emerald-400',
}

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

interface Props {
  snippet: Snippet
}

export default function SnippetCard({ snippet }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: create textarea
      const el = document.createElement('textarea')
      el.value = snippet.code
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <article
      className={[
        'group flex flex-col rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden',
        'transition-all duration-300 ease-out',
        'hover:-translate-y-1 hover:border-neutral-700 hover:shadow-xl hover:shadow-black/40',
      ].join(' ')}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3 border-b border-neutral-800/60">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              className={[
                'inline-block px-2 py-0.5 rounded border text-[10px] font-mono uppercase tracking-wide',
                LANG_BADGE[snippet.language] ?? 'bg-neutral-800 text-neutral-400 border-neutral-700',
              ].join(' ')}
            >
              {snippet.language}
            </span>
            <span
              className={[
                'text-[10px] font-mono uppercase tracking-wide',
                CATEGORY_BADGE[snippet.category] ?? 'text-neutral-500',
              ].join(' ')}
            >
              {snippet.category}
            </span>
          </div>
          <h2 className="text-sm font-semibold text-neutral-100 truncate">{snippet.title}</h2>
        </div>

        {/* Copy button */}
        <button
          type="button"
          onClick={handleCopy}
          className={[
            'flex-shrink-0 px-3 py-1 rounded text-[10px] font-mono border transition-all duration-200',
            copied
              ? 'bg-green-500/15 text-green-400 border-green-500/40'
              : 'bg-neutral-900 text-neutral-500 border-neutral-800 hover:border-neutral-600 hover:text-neutral-300',
          ].join(' ')}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Code block */}
      <div className="relative flex-1">
        {/* Decorative dots */}
        <div className="flex items-center gap-1.5 px-4 pt-3 pb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
          <span className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
          <span className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
        </div>

        <pre className="px-4 pb-4 overflow-x-auto max-h-72 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-800">
          <SyntaxCode code={snippet.code} language={snippet.language} />
        </pre>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-neutral-800/60 space-y-2.5">
        {/* AI description */}
        <p className="text-xs italic text-neutral-500">
          ✦ {snippet.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {snippet.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-neutral-900 text-neutral-600 border border-neutral-800"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}
