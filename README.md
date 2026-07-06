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
│   └── dataset.zip
│
└── outputs/
    ├── annual_ndvi_2023.png
    ├── vci_map.png
    ├── drought_severity_map.png
    ├── ndvi_time_series.png
    └── drought_class_distribution.png
