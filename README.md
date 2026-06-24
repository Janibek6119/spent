# This is a template

Feel free to delete everything in `./app` but keep:

- Imports in `assets/css/main.css`
- `app.vue`, obviously, with at least something of your preference

## More granular trim

### TS Scripts & tsx

Purpose: Putting .ts scripts plain into here dissatisfies TS very much.

Usage: `pnpm tsx scripts/example.ts`

Removal:
- [scripts](./scripts) dir
- `tsx` package in [package.json](./package.json)
