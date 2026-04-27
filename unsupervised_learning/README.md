# 🎓 Dropout Risk Pattern Discovery from Academic Trajectories

> **An Unsupervised Machine Learning Framework with Explainability and Ethical Analysis**

[![Python](https://img.shields.io/badge/Python-3.9%2B-blue?logo=python)](https://python.org)
[![Streamlit](https://img.shields.io/badge/Dashboard-Streamlit-FF4B4B?logo=streamlit)](https://streamlit.io)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 📋 Overview

This project implements a **complete, production-ready unsupervised machine learning pipeline** to discover hidden dropout risk patterns from student academic trajectories. Using the UCI "Predict Students' Dropout and Academic Success" dataset (4,424 records, 35+ features), the pipeline identifies distinct student behavioral profiles, flags at-risk students, and provides actionable insights through an interactive dashboard.

### Key Highlights
- **4 Clustering Algorithms**: K-Means, DBSCAN, Agglomerative, Gaussian Mixture Model (GMM)
- **3 Dimensionality Reduction Methods**: PCA, t-SNE, UMAP
- **4 Cluster Validation Metrics**: Elbow, Silhouette, Davies-Bouldin, Calinski-Harabasz
- **Explainable AI**: SHAP feature importance for cluster-level interpretability
- **Risk Scoring**: 0–100 risk score per student with demographic breakdown
- **Trajectory Analysis**: Semester-to-semester migration with Sankey diagrams
- **Ethical AI Audit**: Demographic parity analysis for bias detection
- **Interactive Dashboard**: Premium Streamlit app with glassmorphism design

---

## 🏗️ Project Structure

```
unsupervised_learning/
│
├── step1_download_data.py            # Dataset acquisition from UCI repository
├── step2_preprocessing.py            # Cleaning, IQR outlier removal, feature engineering
├── step3_dimensionality_reduction.py # PCA + t-SNE + UMAP with comparison
├── step4_optimal_clusters.py         # 4-method consensus for optimal K (2×2 grid)
├── step5_clustering.py               # K-Means, DBSCAN, Agglomerative, GMM + dendrogram
├── step6_cluster_profiling.py        # Z-score heatmap, radar chart, SHAP explainability
├── step7_at_risk_detection.py        # Risk scoring (0–100), demographics, trajectory matrix
├── step7b_trajectory_analysis.py     # DTW analysis, Sankey diagram, critical dropout point
├── step8_dashboard.py                # Premium Streamlit dashboard (9 tabs)
├── step9_report.py                   # IEEE-format research report generator
├── step10_interview_prep.py          # Interview Q&A guide generator
├── step10b_survival_analysis.py      # Kaplan-Meier survival curves
├── run_all.py                        # Master runner — execute entire pipeline
│
├── PROJECT_REPORT.md                 # Generated IEEE-style research paper (10 sections)
├── INTERVIEW_PREPARATION.md          # Generated interview guide (15 Qs + tips)
├── requirements.txt                  # Python dependencies
├── README.md                         # This file
│
├── dataset.csv                       # Raw dataset (auto-downloaded)
├── preprocessed_data.csv             # Scaled features
├── clean_data.csv                    # Cleaned data (post-IQR)
├── pca_data.csv                      # PCA-reduced components
├── tsne_data.csv                     # t-SNE 2D coordinates
├── umap_data.csv                     # UMAP 2D coordinates
├── kmeans_labels.csv                 # K-Means cluster assignments
├── dbscan_labels.csv                 # DBSCAN cluster assignments
├── agglo_labels.csv                  # Agglomerative cluster assignments
├── gmm_labels.csv                    # GMM cluster assignments
├── at_risk_students.csv              # Flagged at-risk students with risk scores
├── trajectory_data.csv               # Semester trajectory transitions
│
└── plots/                            # All generated visualizations
    ├── correlation_heatmap.png
    ├── pca_variance.png
    ├── tsne_visualization.png
    ├── dim_reduction_comparison.png   # PCA vs t-SNE vs UMAP
    ├── optimal_clusters_2x2.png       # 4-method evaluation grid
    ├── k_distance_graph.png           # DBSCAN eps selection
    ├── dendrogram.png                 # Hierarchical clustering
    ├── clustering_comparison.png      # 2×2 algorithm comparison
    ├── silhouette_comparison.png
    ├── cluster_heatmap.png
    ├── cluster_radar.png
    ├── cluster_feature_bars.png
    ├── shap_summary.png
    ├── risk_distribution.png
    ├── risk_demographics.png
    ├── trajectory_matrix.png
    ├── trajectory_sankey.png
    ├── critical_dropout_point.png
    └── survival_curves.png
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Run the Full Pipeline

```bash
python run_all.py
```

This executes all steps sequentially (Steps 1–10) and generates all outputs.

### 3. Launch the Dashboard

```bash
streamlit run step8_dashboard.py
```

The dashboard opens at `http://localhost:8501` with 9 interactive tabs.

---

## 📊 Results Summary

| Metric | Value |
|--------|-------|
| Dataset Size | 4,424 students |
| Features | 35 original + 4 engineered |
| Optimal Clusters (K) | 3 (consensus from 4 methods) |
| Best Algorithm | K-Means (highest Silhouette) |
| Silhouette Score | ~0.15–0.20 |
| At-Risk Students | ~25–35% of population |
| Risk Score Range | 0–100 (centroid-distance based) |
| Anomalies Detected | ~5% (Isolation Forest) |

### Cluster Profiles

| Cluster | Name | Key Characteristics |
|---------|------|---------------------|
| 0 | At-Risk (Disengaged) | Low grades, high debt, >50% dropout |
| 1 | High Performer (Active) | High approval rates, scholarship holders |
| 2 | Moderate Risk | Mixed performance, large enrolled fraction |

---

## 🛠️ Technical Details

### Feature Engineering (4 Custom Features)
1. **Academic Momentum** — Grade change between Sem1 and Sem2
2. **Engagement Ratio** — Consistency of evaluations across semesters
3. **Financial Stress Index** — Composite of debt, tuition, scholarship
4. **Early Performance Score** — Sem1 approval rate as early indicator

### Algorithms Compared
| Algorithm | Type | Strengths |
|-----------|------|-----------|
| K-Means | Centroid-based | Fast, interpretable, best Silhouette |
| DBSCAN | Density-based | Detects noise/outliers, arbitrary shapes |
| Agglomerative | Hierarchical | Dendrogram visualization, no K needed |
| GMM | Model-based | Probabilistic, soft assignments, BIC validation |

### Advanced Techniques
- **Bootstrap Jaccard Stability** — 100-iteration cluster robustness validation
- **Isolation Forest** — 5% contamination anomaly detection
- **SHAP TreeExplainer** — Feature importance per cluster
- **Kaplan-Meier** — Survival curves with log-rank tests
- **DTW** — Dynamic Time Warping for trajectory similarity
- **Ethical Audit** — Demographic parity analysis

---

## 📝 Generated Documents

- **`PROJECT_REPORT.md`** — IEEE-format research paper (10 sections, 10 references)
- **`INTERVIEW_PREPARATION.md`** — 15 interview questions, tricky Qs, portfolio strategy

---

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| pandas, numpy | Data manipulation |
| scikit-learn | Clustering, PCA, scaling |
| matplotlib, seaborn | Static visualizations |
| plotly | Interactive charts, Sankey diagrams |
| umap-learn | UMAP dimensionality reduction |
| shap | Explainability |
| lifelines | Survival analysis |
| streamlit | Interactive dashboard |
| kneed | Elbow detection |
| tslearn | Dynamic Time Warping |
| scipy | Hierarchical clustering, statistics |

---

## 👤 Author

Research Team — Department of Computer Science, April 2026

---

*Built as part of the INT 396 Unsupervised Learning course project.*
