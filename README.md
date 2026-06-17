# TurboConverter

A 100% client-side file conversion application built with React 19, TypeScript, and Vite. Supports PDF and image tools — all processing happens in the browser with no server-side dependencies.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the app:
   ```bash
   npm run dev
   ```

## Build

```bash
npm run build
```

The production build is output to `dist/`.

## Office Conversions (Word, Excel, PowerPoint → PDF)

These conversions use [ConvertAPI](https://www.convertapi.com/) for server-side processing.

To enable them:
1. Create a free account at https://www.convertapi.com/
2. Copy your API Secret from the dashboard
3. Set `VITE_CONVERT_API_SECRET=your_secret` in your `.env.local` file

Free tier includes 250 conversions/month.
