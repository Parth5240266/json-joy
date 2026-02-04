# JSONJoy

JSONJoy is a **privacy-first**, **client-side** set of JSON tools built with Vite + React + TypeScript + shadcn-ui.

## Tools

- **Formatter**: beautify JSON with 2/4-space indentation
- **Validator**: validate JSON with line/column errors
- **Viewer**: collapsible JSON tree viewer
- **Diff**: compare two JSON documents
- **Table**: render array JSON as a table
- **Converter**: JSON → CSV / XML
- **Code Generator**: fetch JSON from URL and generate TypeScript / JavaScript code
- **Yup Schema Generator**: JSON → Yup validation schema with an interactive builder (`/yup-schema`)

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## SEO notes

- **Global meta tags** live in `index.html`.
- **Per-route SEO** is handled by `src/components/Seo.tsx` using `react-helmet-async`.
- **Canonical URLs** use `VITE_SITE_URL` if provided, otherwise `window.location.origin`.

Create a `.env` file for production:

```bash
VITE_SITE_URL=https://your-domain.com
```

## Tech stack

- Vite
- React 18
- TypeScript
- Tailwind CSS
- shadcn-ui
