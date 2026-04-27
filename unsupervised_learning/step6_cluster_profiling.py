"""
==============================================================================
STEP 6: Cluster Analysis, Profiling & SHAP Explainability
==============================================================================
- Calculate mean of each feature per cluster
- Create a heatmap showing cluster profiles
- Name each cluster based on behaviour pattern
- Print top 5 defining features of each cluster
- Create a radar/spider chart for cluster comparison
- Train RF classifier on cluster labels, compute SHAP values
- Generate SHAP summary bar plot
==============================================================================
"""

# ─── Import Libraries ───────────────────────────────────────────────────────
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from math import pi
from sklearn.ensemble import RandomForestClassifier
import os
import warnings
warnings.filterwarnings('ignore')

# ─── Configure Plot Style ────────────────────────────────────────────────────
plt.style.use('seaborn-v0_8-darkgrid')

# ─── Load Data ───────────────────────────────────────────────────────────────
print("=" * 70)
print("  STEP 6: CLUSTER ANALYSIS, PROFILING & SHAP EXPLAINABILITY")
print("=" * 70)

base_dir = os.path.dirname(__file__)

df_clean = pd.read_csv(os.path.join(base_dir, "cleaned_unscaled_data.csv"))
df_scaled = pd.read_csv(os.path.join(base_dir, "preprocessed_data.csv"))

kmeans_labels = pd.read_csv(os.path.join(base_dir, "kmeans_labels.csv"))['KMeans_Cluster']
target_labels = pd.read_csv(os.path.join(base_dir, "target_labels.csv"))['Target']

try:
    with open(os.path.join(base_dir, "optimal_k.txt"), 'r') as f:
        optimal_k = int(f.read().strip())
except FileNotFoundError:
    optimal_k = 3

df_clean['Cluster'] = kmeans_labels.values
df_clean['Target'] = target_labels.values

print(f"\n📊 Data Shape: {df_clean.shape}")
print(f"🏆 Number of Clusters: {optimal_k}\n")

# ═══════════════════════════════════════════════════════════════════════════════
# PART A: Calculate Mean of Each Feature Per Cluster
# ═══════════════════════════════════════════════════════════════════════════════
print("─" * 50)
print("Part A: Feature Means by Cluster")
print("─" * 50)

feature_cols = [c for c in df_clean.columns if c not in ['Cluster', 'Target']]

cluster_means = df_clean.groupby('Cluster')[feature_cols].mean()
print(f"\n📊 Cluster Means (selected features):\n")
important_features = [
    'Curricular units 1st sem (approved)', 'Curricular units 1st sem (grade)',
    'Curricular units 2nd sem (approved)', 'Curricular units 2nd sem (grade)',
    'Tuition fees up to date', 'Scholarship holder', 'Age at enrollment',
    'Admission grade', 'Debtor', 'Gender',
    'academic_momentum', 'engagement_ratio', 'financial_stress_index',
    'early_performance_score'
]
available_important = [f for f in important_features if f in feature_cols]
print(cluster_means[available_important].round(2).to_string())

# ═══════════════════════════════════════════════════════════════════════════════
# PART B: Analyze Target Distribution Within Each Cluster
# ═══════════════════════════════════════════════════════════════════════════════
print(f"\n{'─' * 50}")
print("Part B: Target Distribution by Cluster")
print("─" * 50)

cross_tab = pd.crosstab(df_clean['Cluster'], df_clean['Target'], normalize='index') * 100
print(f"\n📊 Target Distribution (%) by Cluster:\n")
print(cross_tab.round(2).to_string())

# ═══════════════════════════════════════════════════════════════════════════════
# PART C: Name Clusters Based on Behavior Patterns
# ═══════════════════════════════════════════════════════════════════════════════
print(f"\n{'─' * 50}")
print("Part C: Cluster Naming Based on Patterns")
print("─" * 50)

cluster_names = {}
cluster_descriptions = {}

for cluster_id in range(optimal_k):
    cluster_data = df_clean[df_clean['Cluster'] == cluster_id]

    dropout_pct = (cluster_data['Target'] == 'Dropout').mean() * 100
    graduate_pct = (cluster_data['Target'] == 'Graduate').mean() * 100
    enrolled_pct = (cluster_data['Target'] == 'Enrolled').mean() * 100

    avg_grade_1 = cluster_data['Curricular units 1st sem (grade)'].mean() if 'Curricular units 1st sem (grade)' in cluster_data.columns else 0
    avg_grade_2 = cluster_data['Curricular units 2nd sem (grade)'].mean() if 'Curricular units 2nd sem (grade)' in cluster_data.columns else 0
    avg_grade = (avg_grade_1 + avg_grade_2) / 2

    if dropout_pct > 50:
        if avg_grade < 8:
            name = "🔴 At-Risk (Disengaged)"
            desc = "High dropout rate with very low academic engagement and grades"
        else:
            name = "🟠 At-Risk (Struggling)"
            desc = "High dropout rate despite some academic effort"
    elif dropout_pct > 30:
        name = "🟡 Moderate Risk"
        desc = "Moderate dropout rate with inconsistent academic performance"
    elif graduate_pct > 60:
        if avg_grade > 12:
            name = "🟢 High Performer (Active)"
            desc = "Strong academic performance with high graduation rate"
        else:
            name = "🔵 Steady Performer"
            desc = "Consistent academic trajectory with good graduation rate"
    elif enrolled_pct > 40:
        name = "🟡 Uncertain Trajectory"
        desc = "Large proportion still enrolled — future outcome uncertain"
    else:
        name = f"🟣 Mixed Profile"
        desc = "Diverse mix of outcomes and academic patterns"

    cluster_names[cluster_id] = name
    cluster_descriptions[cluster_id] = desc

print("\n📋 CLUSTER PROFILES:\n")
for cluster_id in range(optimal_k):
    cluster_data = df_clean[df_clean['Cluster'] == cluster_id]
    size = len(cluster_data)
    pct = size / len(df_clean) * 100

    print(f"  Cluster {cluster_id}: {cluster_names[cluster_id]}")
    print(f"  {'─' * 45}")
    print(f"  Size: {size} students ({pct:.1f}%)")
    print(f"  Description: {cluster_descriptions[cluster_id]}")

    dropout_pct = (cluster_data['Target'] == 'Dropout').mean() * 100
    graduate_pct = (cluster_data['Target'] == 'Graduate').mean() * 100
    enrolled_pct = (cluster_data['Target'] == 'Enrolled').mean() * 100
    print(f"  Dropout: {dropout_pct:.1f}% | Graduate: {graduate_pct:.1f}% | Enrolled: {enrolled_pct:.1f}%")
    print()

cluster_map_df = pd.DataFrame({
    'Cluster': list(cluster_names.keys()),
    'Name': list(cluster_names.values()),
    'Description': list(cluster_descriptions.values())
})
cluster_map_df.to_csv(os.path.join(base_dir, "cluster_names.csv"), index=False)

# ═══════════════════════════════════════════════════════════════════════════════
# PART C2: Bar Charts — Key Features Across Clusters
# ═══════════════════════════════════════════════════════════════════════════════
print(f"{'─' * 50}")
print("Part C2: Bar Charts for Key Features")
print("─" * 50)

bar_features = [
    'Curricular units 2nd sem (approved)', 'Curricular units 2nd sem (grade)',
    'Tuition fees up to date', 'Age at enrollment',
    'Admission grade', 'Scholarship holder'
]
bar_features = [f for f in bar_features if f in feature_cols]

if len(bar_features) >= 4:
    n_bar = min(6, len(bar_features))
    fig, axes = plt.subplots(2, 3, figsize=(18, 10))
    axes = axes.flatten()
    cluster_colors = ['#FF4444', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#00BCD4']

    for i, feat in enumerate(bar_features[:n_bar]):
        ax = axes[i]
        means = [df_clean[df_clean['Cluster'] == c][feat].mean() for c in range(optimal_k)]
        labels_bar = [f'C{c}' for c in range(optimal_k)]
        bars = ax.bar(labels_bar, means, color=[cluster_colors[c % len(cluster_colors)] for c in range(optimal_k)],
                      alpha=0.85, edgecolor='white', linewidth=1.5)
        for bar, m in zip(bars, means):
            ax.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 0.01 * max(means),
                    f'{m:.1f}', ha='center', va='bottom', fontsize=9, fontweight='bold')
        short_name = feat.replace('Curricular units ', 'CU ').replace('1st sem ', 'S1 ').replace('2nd sem ', 'S2 ')
        ax.set_title(short_name, fontsize=11, fontweight='bold')
        ax.set_ylabel('Mean Value', fontsize=10)

    # Hide extra subplots
    for j in range(n_bar, len(axes)):
        axes[j].set_visible(False)

    plt.suptitle('Key Feature Means by Cluster', fontsize=15, fontweight='bold', y=1.02)
    plt.tight_layout()
    plt.savefig(os.path.join(base_dir, "plots", "cluster_feature_bars.png"),
                dpi=150, bbox_inches='tight')
    plt.close()
    print("✅ Bar charts saved to plots/cluster_feature_bars.png\n")

# ═══════════════════════════════════════════════════════════════════════════════
# PART D: Top 5 Defining Features Per Cluster
# ═══════════════════════════════════════════════════════════════════════════════
print(f"{'─' * 50}")
print("Part D: Top 5 Defining Features Per Cluster")
print("─" * 50)

overall_means = df_clean[feature_cols].mean()
overall_stds = df_clean[feature_cols].std()
overall_stds = overall_stds.replace(0, 1)

for cluster_id in range(optimal_k):
    cluster_data = df_clean[df_clean['Cluster'] == cluster_id]
    cluster_mean = cluster_data[feature_cols].mean()

    z_scores = (cluster_mean - overall_means) / overall_stds
    top_features = z_scores.abs().sort_values(ascending=False).head(5)

    print(f"\n  Cluster {cluster_id}: {cluster_names[cluster_id]}")
    print(f"  {'─' * 45}")
    for feature_name in top_features.index:
        z = z_scores[feature_name]
        direction = "↑ HIGH" if z > 0 else "↓ LOW"
        print(f"    • {feature_name}: {direction} (z={z:.2f})")

# ═══════════════════════════════════════════════════════════════════════════════
# PART E: HEATMAP — Cluster Profiles
# ═══════════════════════════════════════════════════════════════════════════════
print(f"\n{'─' * 50}")
print("Part E: Generating Heatmap")
print("─" * 50)

cluster_means_normalized = (cluster_means - cluster_means.mean()) / cluster_means.std()
feature_variance = cluster_means_normalized.var()
top_features_for_heatmap = feature_variance.nlargest(15).index.tolist()

fig, ax = plt.subplots(figsize=(16, 8))

heatmap_data = cluster_means_normalized[top_features_for_heatmap].T
rename_dict = {i: f"C{i}: {cluster_names.get(i, f'Cluster {i}')}" for i in range(optimal_k)}
heatmap_data.columns = [rename_dict.get(c, c) for c in heatmap_data.columns]

sns.heatmap(
    heatmap_data,
    annot=True, fmt='.2f',
    cmap='RdYlGn',
    center=0,
    linewidths=0.5,
    linecolor='white',
    cbar_kws={'label': 'Z-Score (relative to cluster means)'},
    ax=ax
)

ax.set_title('Cluster Profile Heatmap — Top 15 Differentiating Features',
             fontsize=15, fontweight='bold', pad=20)
ax.set_ylabel('Feature', fontsize=12, fontweight='bold')
ax.set_xlabel('Cluster', fontsize=12, fontweight='bold')
plt.xticks(rotation=0, fontsize=10)
plt.yticks(rotation=0, fontsize=9)

plt.tight_layout()
plt.savefig(os.path.join(base_dir, "plots", "cluster_heatmap.png"),
            dpi=150, bbox_inches='tight')
plt.close()
print("✅ Heatmap saved.\n")

# ═══════════════════════════════════════════════════════════════════════════════
# PART F: RADAR / SPIDER CHART — Cluster Comparison
# ═══════════════════════════════════════════════════════════════════════════════
print("─" * 50)
print("Part F: Generating Radar Chart")
print("─" * 50)

radar_features = [
    'Curricular units 1st sem (grade)',
    'Curricular units 2nd sem (grade)',
    'Curricular units 1st sem (approved)',
    'Curricular units 2nd sem (approved)',
    'Admission grade',
    'Age at enrollment',
    'Tuition fees up to date',
    'Scholarship holder'
]
radar_features = [f for f in radar_features if f in feature_cols]

radar_data = cluster_means[radar_features].copy()
radar_min = df_clean[radar_features].min()
radar_max = df_clean[radar_features].max()
radar_range = radar_max - radar_min
radar_range = radar_range.replace(0, 1)
radar_normalized = (radar_data - radar_min) / radar_range

N = len(radar_features)
angles = [n / float(N) * 2 * pi for n in range(N)]
angles += angles[:1]

short_names = []
for f in radar_features:
    name = f.replace('Curricular units ', 'CU ').replace('1st sem ', 'S1 ').replace('2nd sem ', 'S2 ')
    name = name.replace('(grade)', 'Grade').replace('(approved)', 'Appr.')
    name = name.replace('Admission grade', 'Admission').replace('Age at enrollment', 'Age')
    name = name.replace('Tuition fees up to date', 'Fees Paid').replace('Scholarship holder', 'Scholar')
    short_names.append(name)

fig, ax = plt.subplots(figsize=(10, 10), subplot_kw=dict(polar=True))

cluster_colors = ['#FF4444', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#00BCD4']

for cluster_id in range(optimal_k):
    values = radar_normalized.loc[cluster_id].values.tolist()
    values += values[:1]

    color = cluster_colors[cluster_id % len(cluster_colors)]
    label = f"C{cluster_id}: {cluster_names.get(cluster_id, f'Cluster {cluster_id}')}"

    ax.plot(angles, values, 'o-', linewidth=2, label=label, color=color, markersize=6)
    ax.fill(angles, values, alpha=0.15, color=color)

ax.set_xticks(angles[:-1])
ax.set_xticklabels(short_names, fontsize=10, fontweight='bold')
ax.set_ylim(0, 1)
ax.set_title('Radar Chart — Cluster Comparison\n(Normalized 0–1 Scale)',
             fontsize=15, fontweight='bold', pad=30)
ax.legend(loc='upper right', bbox_to_anchor=(1.3, 1.1), fontsize=10)

plt.tight_layout()
plt.savefig(os.path.join(base_dir, "plots", "cluster_radar.png"),
            dpi=150, bbox_inches='tight')
plt.close()
print("✅ Radar chart saved.\n")

# ═══════════════════════════════════════════════════════════════════════════════
# PART G: SHAP EXPLAINABILITY — Feature Importance per Cluster
# ═══════════════════════════════════════════════════════════════════════════════
print("─" * 50)
print("Part G: SHAP Explainability (Random Forest + TreeExplainer)")
print("─" * 50)

print("\n  ⏳ Training Random Forest classifier on cluster labels...")

# Train a Random Forest on the scaled features with cluster labels as targets
rf_clf = RandomForestClassifier(
    n_estimators=200,
    max_depth=15,
    min_samples_split=10,
    random_state=42,
    n_jobs=-1
)
rf_clf.fit(df_scaled.values, kmeans_labels.values)

train_accuracy = rf_clf.score(df_scaled.values, kmeans_labels.values)
print(f"  ✅ RF Training Accuracy: {train_accuracy:.4f}")
print(f"     (High accuracy confirms clusters have learnable boundaries)\n")

# Compute SHAP values using TreeExplainer
print("  ⏳ Computing SHAP values (this may take a moment)...")
import shap

explainer = shap.TreeExplainer(rf_clf)

# Use a subsample for SHAP computation if dataset is large
n_shap_samples = min(1000, len(df_scaled))
shap_sample_idx = np.random.RandomState(42).choice(
    len(df_scaled), n_shap_samples, replace=False
)
X_shap = df_scaled.values[shap_sample_idx]

shap_values = explainer.shap_values(X_shap)
print(f"  ✅ SHAP values computed for {n_shap_samples} samples\n")

# ─── SHAP Summary Bar Plot ───────────────────────────────────────────────────
print("  📊 Generating SHAP summary bar plot...")

fig, ax = plt.subplots(figsize=(12, 8))

# For multi-class, shap_values is a list of arrays (one per class)
# For binary with newer SHAP, it can be a 3D numpy array
# Compute mean |SHAP| across all classes
if isinstance(shap_values, np.ndarray) and shap_values.ndim == 3:
    # 3D array: (samples, features, classes) — average across classes
    mean_abs_shap = np.abs(shap_values).mean(axis=(0, 2))
elif isinstance(shap_values, list):
    # Multi-class: list of arrays, average across classes
    mean_abs_shap = np.mean([np.abs(sv).mean(axis=0) for sv in shap_values], axis=0)
else:
    # Binary or single-output: (samples, features)
    mean_abs_shap = np.abs(shap_values).mean(axis=0)

# Ensure 1D
mean_abs_shap = np.array(mean_abs_shap).flatten()

feature_importance_df = pd.DataFrame({
    'Feature': df_scaled.columns,
    'Mean |SHAP|': mean_abs_shap
}).sort_values('Mean |SHAP|', ascending=True)

# Plot top 20 features
top_n = min(20, len(feature_importance_df))
top_feats = feature_importance_df.tail(top_n)

colors = plt.cm.viridis(np.linspace(0.3, 0.9, top_n))
ax.barh(top_feats['Feature'], top_feats['Mean |SHAP|'],
        color=colors, edgecolor='white', linewidth=0.5)

for i, (_, row) in enumerate(top_feats.iterrows()):
    ax.text(row['Mean |SHAP|'] + 0.001, i, f'{row["Mean |SHAP|"]:.4f}',
            va='center', fontsize=9, fontweight='bold')

ax.set_xlabel('Mean |SHAP Value|', fontsize=12, fontweight='bold')
ax.set_title('SHAP Feature Importance — Cluster Assignment Drivers',
             fontsize=14, fontweight='bold')
plt.tight_layout()
plt.savefig(os.path.join(base_dir, "plots", "shap_summary.png"),
            dpi=150, bbox_inches='tight')
plt.close()
print("  ✅ SHAP summary bar plot saved to plots/shap_summary.png\n")

# ─── Print Top 5 Features Driving Each Cluster ───────────────────────────────
print("  📋 Top 5 SHAP Features per Cluster:\n")

for cluster_id in range(optimal_k):
    print(f"  Cluster {cluster_id}: {cluster_names.get(cluster_id, f'Cluster {cluster_id}')}")
    print(f"  {'─' * 50}")

    if isinstance(shap_values, np.ndarray) and shap_values.ndim == 3 and cluster_id < shap_values.shape[2]:
        cluster_shap = np.abs(shap_values[:, :, cluster_id]).mean(axis=0)
    elif isinstance(shap_values, list) and cluster_id < len(shap_values):
        cluster_shap = np.abs(shap_values[cluster_id]).mean(axis=0)
    else:
        # Fallback — use overall
        cluster_shap = mean_abs_shap

    top_5_idx = np.argsort(cluster_shap)[::-1][:5]
    for rank, idx in enumerate(top_5_idx, 1):
        feat_name = df_scaled.columns[idx]
        shap_val = cluster_shap[idx]
        print(f"    {rank}. {feat_name}: mean |SHAP| = {shap_val:.4f}")
    print()

# Save SHAP importance data
shap_importance_df = pd.DataFrame({
    'Feature': df_scaled.columns,
    'Mean_Abs_SHAP': mean_abs_shap
}).sort_values('Mean_Abs_SHAP', ascending=False)
shap_importance_df.to_csv(os.path.join(base_dir, "shap_importance.csv"), index=False)

print(f"{'=' * 70}")
print("  [STEP 6 COMPLETE] ✅")
print(f"{'=' * 70}")
print(f"\n📁 Output Files:")
print(f"   • cluster_names.csv                  — Cluster name mappings")
print(f"   • shap_importance.csv                — SHAP feature importances")
print(f"   • plots/cluster_heatmap.png          — Feature heatmap")
print(f"   • plots/cluster_radar.png            — Radar comparison chart")
print(f"   • plots/shap_summary.png             — SHAP summary bar plot")
