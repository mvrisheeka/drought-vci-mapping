# Drought Severity Mapping using Vegetation Condition Index (VCI)

This project maps drought severity in Jodhpur District, Rajasthan, India using the Vegetation Condition Index (VCI).
It uses MODIS NDVI satellite data from Google Earth Engine for the period 2015–2023. The project calculates VCI for 2023, classifies drought severity, and generates maps, charts, and area statistics.

## Features

- Loads MODIS NDVI data from Google Earth Engine
- Generates annual NDVI composites from 2015 to 2023
- Calculates long-term minimum and maximum NDVI
- Calculates Vegetation Condition Index (VCI)
- Classifies drought severity levels
- Computes area statistics for each drought class
- Creates drought maps and NDVI time-series charts

## Study Area

- **Location:** Jodhpur District, Rajasthan, India
- **Study Period:** 2015–2023
- **Target Year:** 2023

## Dataset Used

- **Dataset:** MODIS MOD13Q1 Version 6.1
- **Platform:** Google Earth Engine
- **Band Used:** NDVI
- **Spatial Resolution:** 250 m
- **Temporal Resolution:** 16 days

## VCI Formula

VCI = ((NDVI_current - NDVI_min) / (NDVI_max - NDVI_min)) × 100

Where:
- `NDVI_current` is the NDVI value for the selected year.
- `NDVI_min` is the minimum NDVI value from the historical period.
- `NDVI_max` is the maximum NDVI value from the historical period.

Low VCI values indicate vegetation stress and drought conditions, while high VCI values indicate healthier vegetation.

## Drought Severity Classes

| VCI Range | Drought Severity |
|---|---|
| 0–20 | Extreme Drought |
| 20–40 | Moderate Drought |
| 40–60 | Mild Drought |
| Above 60 | Healthy Vegetation |

## Technologies Used

- Python
- Google Earth Engine
- Google Colab / Jupyter Notebook
- Geemap
- GeoPandas
- Pandas
- NumPy
- Matplotlib

## Project Structure

```text
drought-vci-mapping/
│
├── drought_vci_mapping.ipynb
├── README.md
│
├── data/
│   └── gadm41_IND_shp.zip
│
└── outputs/
    ├── annual_ndvi_2023.png
    ├── vci_map.png
    ├── drought_severity_map.png
    ├── ndvi_time_series.png
    └── drought_class_distribution.png
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/drought-vci-mapping.git
cd drought-vci-mapping
```

### 2. Open the Notebook

Open the `drought_vci_mapping.ipynb` file using one of the following:

- Google Colab
- Jupyter Notebook
- VS Code with the Jupyter extension

### 3. Install Required Libraries

Run the following command in the first notebook cell:

```python
!pip install earthengine-api geemap geopandas pandas numpy matplotlib
```

### 4. Authenticate Google Earth Engine

Run the following code and complete the authentication process using the link shown in the output.

**Note:** Google Earth Engine now requires every session to be initialized with a Cloud project. Replace `"your-gee-project-id"` below with your own GEE-registered Google Cloud project ID before running the notebook.

```python
import ee

ee.Authenticate()
ee.Initialize(project="your-gee-project-id")
```

> You can find or create your project ID at [Google Cloud Console](https://console.cloud.google.com/) and register it for Earth Engine access at [https://code.earthengine.google.com/register](https://code.earthengine.google.com/register).

### 5. Run the Notebook

Run all cells in `drought_vci_mapping.ipynb` in sequence.

The notebook will:

- Load the Jodhpur District boundary.
- Access MODIS NDVI data from Google Earth Engine.
- Generate annual NDVI composites for 2015–2023.
- Calculate long-term NDVI minimum and maximum values.
- Calculate the Vegetation Condition Index (VCI).
- Classify drought severity levels.
- Generate maps, charts, and area statistics.

### 6. View the Results

The generated outputs will be displayed in the notebook. If export commands are enabled, maps and charts can also be saved in the `outputs/` folder.
