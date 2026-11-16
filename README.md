# Wattwise

A frontend-only residential electricity consumption monitoring demo based on the
Energy Consumption Monitoring System study for University of Ibadan Quarters.

## Run locally

```sh
npm install
npm run dev
```

Create a production build with `npm run build`; Vite writes it to `dist/`.

## Deploy to Vercel

Import this project into Vercel. Use the Vite preset, `npm run build` as the
build command, and `dist` as the output directory. The included `vercel.json`
supports client-side route fallback.

## Demo behavior

The app has no backend or live meter connection. Sample readings, residence and
meter details, preferences, demo profile, and generated report history are
stored in the current browser's local storage. CSV exports are generated in the
browser. All sample consumption data is simulated and does not represent actual
University of Ibadan Quarters usage.
