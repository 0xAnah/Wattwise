# Wattwise

Wattwise is a frontend dashboard for tracking residential electricity consumption.
It is designed around the Energy Consumption Monitoring System concept for
University of Ibadan Quarters, with a focus on helping users monitor usage,
spot patterns, and review simple cost estimates.

## Overview

This project is a React + Vite application that simulates a home energy
monitoring experience. It includes:

- a consumption overview dashboard
- daily and period-based usage tracking
- insights for peak demand and trends
- report generation and export support
- resident and meter information management
- local persistence through browser storage

## Features

- View household energy consumption over recent periods
- Compare current usage against a previous period
- Inspect meter activity and home details
- Review generated reports and usage summaries
- Export data as CSV from the browser
- Simulated demo data for presentation and prototyping

## Tech stack

- React
- Vite
- JavaScript / JSX
- Local browser storage for persistence

## Getting started

### Prerequisites

- Node.js 18+ recommended
- npm

### Install dependencies

```bash
npm install
```

### Run the app locally

```bash
npm run dev
```

Then open the local URL shown in the terminal, usually:

```text
http://localhost:5173
```

### Build for production

```bash
npm run build
```

The production files are generated in the `dist/` folder.

## Project structure

```text
Smart_Energy_System/
├── index.html
├── package.json
├── vercel.json
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── README.md
└── dist/   # generated after build
```

## Notes

This is a demo application with no backend or live smart-meter integration.
Data is simulated and saved in the browser's local storage so the interface can
be explored without a server.
