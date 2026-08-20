import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (props) => (
      <h1
        className="mt-8 text-4xl font-semibold tracking-tight text-white first:mt-0"
        {...props}
      />
    ),
    h2: (props) => (
      <h2 className="mt-10 text-2xl font-semibold tracking-tight text-white" {...props} />
    ),
    h3: (props) => (
      <h3 className="mt-8 text-xl font-semibold tracking-tight text-white" {...props} />
    ),
    p: (props) => <p className="mt-4 text-base leading-8 text-slate-300" {...props} />,
    ul: (props) => <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-300" {...props} />,
    ol: (props) => <ol className="mt-4 list-decimal space-y-2 pl-6 text-slate-300" {...props} />,
    li: (props) => <li className="leading-7" {...props} />,
    a: (props) => <a className="text-sky-300 underline decoration-sky-400/40 underline-offset-4" {...props} />,
    strong: (props) => <strong className="font-semibold text-white" {...props} />,
    code: (props) => (
      <code
        className="rounded bg-slate-900 px-1.5 py-0.5 font-mono text-sm text-sky-100"
        {...props}
      />
    ),
    pre: (props) => (
      <pre
        className="mt-5 overflow-x-auto rounded-2xl border border-border bg-slate-950/80 p-4 text-sm text-slate-200"
        {...props}
      />
    ),
    blockquote: (props) => (
      <blockquote
        className="mt-5 rounded-r-2xl border-l-4 border-sky-400/50 bg-sky-400/10 px-4 py-3 text-slate-200"
        {...props}
      />
    ),
    ...components,
  };
}
