# Tarriffic: A Tariff and Trade Data Visualization Platform

## Overview

Tarriffic is a full-stack application designed to analyze and visualize US tariff and trade data. It provides an interactive platform for exploring trade flows, tariff rates, and their economic impact. The project is composed of two main components: a Python-based data curation pipeline and a Next.js frontend application.

## Architecture

The application is architected as follows:

-   **Data Curator (`data-curator/`)**: A set of Python scripts responsible for fetching, cleaning, merging, and processing raw tariff and trade data. It prepares the data for consumption by the frontend.
-   **Frontend (`frontend/`)**: A Next.js application that provides a rich, interactive user interface for data visualization. It includes various charts, maps, and analytical tools to explore the curated data.

## Features

-   Interactive globe visualization of trade flows.
-   Heatmaps to show high-tariff sectors.
-   Sankey diagrams for analyzing trade value chains.
-   Detailed product-level analysis of tariffs and trade volumes.
-   Historical trend analysis of tariff rates.

## Project Structure

```
.
├── data-curator/         # Python data processing pipeline
│   ├── api/              # Scripts to interact with external data APIs (e.g., WITS)
│   ├── data/             # Raw and processed data files
│   ├── scripts/          # Helper scripts for data fetching and processing
│   ├── utils/            # Data cleaning and utility functions
│   ├── curate.py         # Main script for the data curation pipeline
│   └── requirements.txt  # Python dependencies
│
├── frontend/             # Next.js web application
│   ├── public/           # Static assets, including some data files
│   ├── src/
│   │   ├── app/          # Next.js App Router pages and API routes
│   │   ├── components/   # React components
│   │   ├── lib/          # Helper functions and libraries
│   └── package.json      # Node.js dependencies and scripts
│
└── README.md             # This file
```

## Getting Started

### Prerequisites

-   Python 3.8+
-   Node.js 18.0+
-   `pip` for Python package management
-   `npm` or `yarn` for Node.js package management

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd tarriffic
    ```

2.  **Set up the Data Curator:**
    ```bash
    cd data-curator
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
    ```

3.  **Set up the Frontend:**
    ```bash
    cd frontend
    npm install
    cd ..
    ```

## Usage

### 1. Running the Data Curation Pipeline

The data curation pipeline processes raw CSV files located in `data-curator/data/raw/` and outputs a cleaned, merged dataset to `data-curator/data/processed/`.

To run the pipeline, execute the `curate.py` script from within the `data-curator` directory:

```bash
cd data-curator
source venv/bin/activate
python curate.py
```

This will perform the following steps:
-   Clean the tariff and trade data.
-   Merge the two datasets on HS4 product codes.
-   Validate the merged data.
-   Save the final dataset as `merged_summary.csv` in `data-curator/data/processed/`.

### 2. Running the Frontend Application

The frontend is a Next.js application that serves the user interface.

To start the development server:

```bash
cd frontend
npm run dev
```

This will start the application on `http://localhost:3000`. The `--turbopack` flag is used for faster development builds.

### Key Scripts

#### Data Curator

-   `python data-curator/curate.py`: Runs the main data processing pipeline.

#### Frontend

-   `npm run dev`: Starts the development server.
-   `npm run build`: Builds the application for production.
-   `npm run start`: Starts a production server.
-   `npm run lint`: Lints the codebase.
