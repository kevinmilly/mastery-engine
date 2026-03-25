import { useMemo } from 'react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const html = useMemo(() => {
    const result = unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeStringify)
      .processSync(content);
    return String(result);
  }, [content]);

  return (
    <>
      <div
        className="markdown-body"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <style>{`
        .markdown-body {
          font-family: var(--font-sans);
          font-size: 1rem;
          line-height: 1.7;
          color: var(--color-text-primary);
          max-width: 65ch;
        }

        .markdown-body h1,
        .markdown-body h2,
        .markdown-body h3,
        .markdown-body h4,
        .markdown-body h5,
        .markdown-body h6 {
          font-family: var(--font-serif);
          font-weight: 600;
          line-height: 1.25;
          color: var(--color-text-primary);
          margin-top: 2em;
          margin-bottom: 0.6em;
        }

        .markdown-body h1 { font-size: 2rem; font-style: italic; }
        .markdown-body h2 { font-size: 1.5rem; font-style: italic; }
        .markdown-body h3 { font-size: 1.2rem; }
        .markdown-body h4 { font-size: 1rem; }

        .markdown-body p {
          margin-bottom: 1.2em;
        }

        .markdown-body ul,
        .markdown-body ol {
          padding-left: 1.5em;
          margin-bottom: 1.2em;
        }

        .markdown-body li {
          margin-bottom: 0.4em;
        }

        .markdown-body code {
          font-family: var(--font-mono);
          font-size: 0.875em;
          background: var(--color-surface-raised);
          color: var(--color-accent-amber);
          padding: 0.15em 0.4em;
          border-radius: 4px;
          border: 1px solid var(--color-border);
        }

        .markdown-body pre {
          background: var(--color-surface-raised);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 1rem 1.25rem;
          overflow-x: auto;
          margin-bottom: 1.5em;
        }

        .markdown-body pre code {
          background: none;
          border: none;
          padding: 0;
          color: var(--color-text-primary);
          font-size: 0.875rem;
        }

        .markdown-body blockquote {
          border-left: 3px solid var(--color-accent-blue);
          margin: 0 0 1.5em 0;
          padding: 0.5em 0 0.5em 1.25em;
          color: var(--color-text-secondary);
          font-style: italic;
        }

        .markdown-body blockquote p { margin-bottom: 0; }

        .markdown-body hr {
          border: none;
          border-top: 1px solid var(--color-border);
          margin: 2em 0;
        }

        .markdown-body a {
          color: var(--color-accent-blue);
          text-decoration: underline;
          text-decoration-color: rgba(107,140,174,0.4);
        }

        .markdown-body a:hover {
          text-decoration-color: var(--color-accent-blue);
        }

        .markdown-body table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1.5em;
          font-size: 0.9rem;
        }

        .markdown-body th,
        .markdown-body td {
          border: 1px solid var(--color-border);
          padding: 0.5rem 0.75rem;
          text-align: left;
        }

        .markdown-body th {
          background: var(--color-surface-raised);
          font-weight: 600;
        }

        .markdown-body strong { font-weight: 600; }
        .markdown-body em { font-style: italic; }
      `}</style>
    </>
  );
}
