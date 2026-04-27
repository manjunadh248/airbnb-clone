"""
==============================================================================
STEP 7: At-Risk Student Detection & Semester Trajectory Analysis
==============================================================================
- Flag students in the highest dropout-risk cluster
- Show what percentage of total students are at risk
- List top 10 features that define at-risk students
- Create risk distribution charts
- Build Sem1 → Sem2 trajectory transition matrix
- Flag students with deteriorating trajectories
- Export at-risk student list to CSV
==============================================================================
"""

# ─── Import Libraries ───────────────────────────────────────────────────────
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import os
import warnings
warnings.filterwarnings('ignore')

# ─── Configure Plot Style ────────────────────────────────────────────────────
plt.style.use('seaborn-v0_8-darkgrid')

# ─── Load Data ───────────────────────────────────────────────────────────────
print("=" * 70)
print("  STEP 7: AT-RISK DETECTION & TRAJECTORY ANALYSIS")
print("=" * 70)

base_dir = os.path.dirname(__file__)

df_clean = pd.read_csv(os.path.join(base_dir, "cleaned_unscaled_data.csv"))
kmeans_labels = pd.read_csv(os.path.join(base_dir, "kmeans_labels.csv"))['KMeans_Cluster']
target_labels = pd.read_csv(os.path.join(base_dir, "target_labels.csv"))['Target']

try:
    with open(os.path.join(base_dir, "optimal_k.txt"), 'r') as f:
        optimal_k = int(f.read().strip())
except FileNotFoundError:
    optimal_k = 3

df_clean['Cluster'] = kmeans_labels.values
df_clean['Target'] = target_labels.values

feature_cols = [c for c in df_clean.columns if c not in ['Cluster', 'Target']]

print(f"\n📊 Total Students: {len(df_clean)}")
print(f"🏆 Number of Clusters: {optimal_k}\n")

# ═══════════════════════════════════════════════════════════════════════════════
# PART A: Identify the Highest Dropout-Risk Cluster
# ═══════════════════════════════════════════════════════════════════════════════
print("─" * 50)
print("Part A: Identifying At-Risk Cluster")
print("─" * 50)

cluster_dropout_rates = {}
for cluster_id in range(optimal_k):
    cluster_mask = df_clean['Cluster'] == cluster_id
    cluster_data = df_clean[cluster_mask]
    dropout_count = (cluster_data['Target'] == 'Dropout').sum()
    dropout_rate = dropout_count / len(cluster_data) * 100
    cluster_dropout_rates[cluster_id] = dropout_rate

    print(f"\n  Cluster {cluster_id}:")
    print(f"    Size: {len(cluster_data)} students")
    print(f"    Dropout Rate: {dropout_rate:.1f}%")
    print(f"    Graduate Rate: {(cluster_data['Target'] == 'Graduate').mean()*100:.1f}%")

at_risk_cluster = max(cluster_dropout_rates, key=cluster_dropout_rates.get)
at_risk_rate = cluster_dropout_rates[at_risk_cluster]

print(f"\n  ⚠️  HIGHEST RISK CLUSTER: Cluster {at_risk_cluster}")
print(f"     Dropout Rate: {at_risk_rate:.1f}%")

# ═══════════════════════════════════════════════════════════════════════════════
# PART B: Flag At-Risk Students
# ═══════════════════════════════════════════════════════════════════════════════
print(f"\n{'─' * 50}")
print("Part B: Flagging At-Risk Students")
print("─" * 50)

df_clean['Risk_Status'] = df_clean['Cluster'].apply(
    lambda x: 'AT RISK' if x == at_risk_cluster else 'Low Risk'
)

at_risk_students = df_clean[df_clean['Risk_Status'] == 'AT RISK']
total_students = len(df_clean)
at_risk_count = len(at_risk_students)
at_risk_percentage = at_risk_count / total_students * 100

print(f"\n  🚨 AT-RISK STUDENTS SUMMARY:")
print(f"  {'─' * 40}")
print(f"  Total Students:       {total_students}")
print(f"  At-Risk Students:     {at_risk_count}")
print(f"  At-Risk Percentage:   {at_risk_percentage:.1f}%")
print(f"  Low-Risk Students:    {total_students - at_risk_count}")
print(f"  Low-Risk Percentage:  {100 - at_risk_percentage:.1f}%")

print(f"\n  📊 Actual Outcomes of At-Risk Flagged Students:")
outcome_dist = at_risk_students['Target'].value_counts()
for outcome, count in outcome_dist.items():
    pct = count / at_risk_count * 100
    print(f"     {outcome}: {count} ({pct:.1f}%)")

# ═══════════════════════════════════════════════════════════════════════════════
# PART B2: Risk Score Calculation (0–100 Scale)
# ═══════════════════════════════════════════════════════════════════════════════
print(f"\n{'─' * 50}")
print("Part B2: Risk Score Calculation (0–100)")
print("─" * 50)

# Load scaled data to compute centroid distances
df_scaled = pd.read_csv(os.path.join(base_dir, "preprocessed_data.csv"))

# Compute at-risk cluster centroid
at_risk_mask = df_clean['Cluster'] == at_risk_cluster
at_risk_centroid = df_scaled[at_risk_mask].mean().values

# Calculate distance from each student to the at-risk centroid
distances = np.sqrt(np.sum((df_scaled.values - at_risk_centroid) ** 2, axis=1))

# Invert and normalize to 0–100: closer to at-risk centroid = higher score
max_dist = distances.max()
min_dist = distances.min()
risk_scores = (1 - (distances - min_dist) / (max_dist - min_dist + 1e-9)) * 100

# Clip to valid range
risk_scores = np.clip(risk_scores, 0, 100)
df_clean['Risk_Score'] = np.round(risk_scores, 1)

print(f"\n  📊 Risk Score Statistics:")
print(f"     Mean:   {df_clean['Risk_Score'].mean():.1f}")
print(f"     Median: {df_clean['Risk_Score'].median():.1f}")
print(f"     Std:    {df_clean['Risk_Score'].std():.1f}")
print(f"     Min:    {df_clean['Risk_Score'].min():.1f}")
print(f"     Max:    {df_clean['Risk_Score'].max():.1f}")

# Print mean risk score per cluster
print(f"\n  📊 Mean Risk Score by Cluster:")
for c in range(optimal_k):
    mean_rs = df_clean[df_clean['Cluster'] == c]['Risk_Score'].mean()
    print(f"     Cluster {c}: {mean_rs:.1f}")

# ═══════════════════════════════════════════════════════════════════════════════
# PART C: Top 10 Features Defining At-Risk Students
# ═══════════════════════════════════════════════════════════════════════════════
print(f"\n{'─' * 50}")
print("Part C: Top 10 Defining Features of At-Risk Students")
print("─" * 50)

overall_means = df_clean[feature_cols].mean()
overall_stds = df_clean[feature_cols].std().replace(0, 1)
at_risk_means = at_risk_students[feature_cols].mean()

z_scores = (at_risk_means - overall_means) / overall_stds
top_10_features = z_scores.abs().sort_values(ascending=False).head(10)

print(f"\n  📋 Top 10 Features (sorted by distinctiveness):\n")
print(f"  {'Rank':>4s}  {'Feature':<45s}  {'Direction':>10s}  {'Z-Score':>8s}")
print(f"  {'─'*4}  {'─'*45}  {'─'*10}  {'─'*8}")

for rank, (feature_name, abs_z) in enumerate(top_10_features.items(), 1):
    z = z_scores[feature_name]
    direction = "↑ HIGH" if z > 0 else "↓ LOW"
    at_risk_val = at_risk_means[feature_name]
    overall_val = overall_means[feature_name]
    print(f"  {rank:4d}  {feature_name:<45s}  {direction:>10s}  {z:>8.2f}")
    print(f"        At-Risk mean: {at_risk_val:.2f} vs Overall mean: {overall_val:.2f}")

# ═══════════════════════════════════════════════════════════════════════════════
# PART D: Risk Distribution Bar Chart
# ═══════════════════════════════════════════════════════════════════════════════
print(f"\n{'─' * 50}")
print("Part D: Generating Risk Distribution Charts")
print("─" * 50)

fig, axes = plt.subplots(1, 3, figsize=(20, 6))

# Chart 1: Pie Chart of Risk Distribution
ax1 = axes[0]
risk_counts = df_clean['Risk_Status'].value_counts()
colors_pie = ['#FF4444', '#4CAF50']
explode = (0.05, 0)  # Slightly explode the at-risk slice
ax1.pie(risk_counts.values, labels=risk_counts.index, colors=colors_pie,
        autopct='%1.1f%%', startangle=90, explode=explode,
        textprops={'fontsize': 12, 'fontweight': 'bold'},
        wedgeprops={'edgecolor': 'white', 'linewidth': 2})
ax1.set_title('Risk Status Distribution', fontsize=14, fontweight='bold')

# Chart 2: Dropout Rate by Cluster
ax2 = axes[1]
cluster_ids = sorted(cluster_dropout_rates.keys())
rates = [cluster_dropout_rates[k] for k in cluster_ids]
bar_colors = ['#FF4444' if k == at_risk_cluster else '#2196F3' for k in cluster_ids]
bars = ax2.bar([f'Cluster {k}' for k in cluster_ids], rates, color=bar_colors,
               alpha=0.85, edgecolor='white', linewidth=2)
for bar, rate in zip(bars, rates):
    ax2.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 0.5,
             f'{rate:.1f}%', ha='center', va='bottom',
             fontsize=11, fontweight='bold')
ax2.set_ylabel('Dropout Rate (%)', fontsize=12, fontweight='bold')
ax2.set_title('Dropout Rate by Cluster', fontsize=14, fontweight='bold')
ax2.axhline(y=50, color='red', linestyle='--', alpha=0.5, label='50% threshold')
ax2.legend()

# Chart 3: Top 10 At-Risk Features
ax3 = axes[2]
top_features_names = [f.replace('Curricular units ', 'CU ')[:25] for f in top_10_features.index]
z_vals = [z_scores[f] for f in top_10_features.index]
colors_feat = ['#FF4444' if z < 0 else '#4CAF50' for z in z_vals]
ax3.barh(top_features_names[::-1], [abs(z) for z in z_vals[::-1]],
         color=colors_feat[::-1], alpha=0.85, edgecolor='white', linewidth=1)
ax3.set_xlabel('Absolute Z-Score', fontsize=12, fontweight='bold')
ax3.set_title('Top 10 At-Risk Features', fontsize=14, fontweight='bold')

plt.suptitle('At-Risk Student Analysis', fontsize=16, fontweight='bold', y=1.03)
plt.tight_layout()
plt.savefig(os.path.join(base_dir, "plots", "risk_distribution.png"),
            dpi=150, bbox_inches='tight')
plt.close()
print("✅ Risk distribution charts saved.\n")

# ═══════════════════════════════════════════════════════════════════════════════
# PART D2: Demographic Breakdown of At-Risk Students
# ═══════════════════════════════════════════════════════════════════════════════
print("─" * 50)
print("Part D2: Demographic Breakdown of At-Risk Students")
print("─" * 50)

fig, axes = plt.subplots(1, 2, figsize=(14, 5))

# ─── By Gender ───────────────────────────────────────────────────────────
ax_g = axes[0]
if 'Gender' in df_clean.columns:
    gender_map = {0: 'Female', 1: 'Male'}
    df_clean['Gender_Label'] = df_clean['Gender'].map(gender_map).fillna(df_clean['Gender'].astype(str))
    gender_risk = df_clean.groupby('Gender_Label')['Risk_Status'].value_counts().unstack(fill_value=0)
    gender_risk.plot(kind='bar', ax=ax_g, color=['#FF4444', '#4CAF50'], alpha=0.85,
                     edgecolor='white', linewidth=1.5)
    ax_g.set_title('Risk Status by Gender', fontsize=13, fontweight='bold')
    ax_g.set_ylabel('Count', fontsize=11)
    ax_g.set_xticklabels(ax_g.get_xticklabels(), rotation=0)
    ax_g.legend(fontsize=10)

# ─── By Age Group ────────────────────────────────────────────────────────
ax_a = axes[1]
if 'Age at enrollment' in df_clean.columns:
    bins = [0, 20, 25, 30, 100]
    labels_age = ['<20', '20-25', '25-30', '30+']
    df_clean['Age_Group'] = pd.cut(df_clean['Age at enrollment'], bins=bins, labels=labels_age)
    age_risk = df_clean.groupby('Age_Group')['Risk_Status'].value_counts().unstack(fill_value=0)
    age_risk.plot(kind='bar', ax=ax_a, color=['#FF4444', '#4CAF50'], alpha=0.85,
                  edgecolor='white', linewidth=1.5)
    ax_a.set_title('Risk Status by Age Group', fontsize=13, fontweight='bold')
    ax_a.set_ylabel('Count', fontsize=11)
    ax_a.set_xticklabels(ax_a.get_xticklabels(), rotation=0)
    ax_a.legend(fontsize=10)

plt.suptitle('Demographic Breakdown of At-Risk Students', fontsize=15, fontweight='bold', y=1.02)
plt.tight_layout()
plt.savefig(os.path.join(base_dir, "plots", "risk_demographics.png"),
            dpi=150, bbox_inches='tight')
plt.close()
print("✅ Demographic breakdown charts saved.\n")

# ═══════════════════════════════════════════════════════════════════════════════
# PART E: SEMESTER TRAJECTORY TRANSITION MATRIX
# ═══════════════════════════════════════════════════════════════════════════════
print("─" * 50)
print("Part E: Semester Trajectory Transition Matrix")
print("─" * 50)

print("\n  ⏳ Building Sem1 → Sem2 trajectory analysis...\n")

# Define Semester 1 and Semester 2 feature subsets
sem1_features = [
    'Curricular units 1st sem (credited)',
    'Curricular units 1st sem (enrolled)',
    'Curricular units 1st sem (evaluations)',
    'Curricular units 1st sem (approved)',
    'Curricular units 1st sem (grade)',
    'Curricular units 1st sem (without evaluations)'
]

sem2_features = [
    'Curricular units 2nd sem (credited)',
    'Curricular units 2nd sem (enrolled)',
    'Curricular units 2nd sem (evaluations)',
    'Curricular units 2nd sem (approved)',
    'Curricular units 2nd sem (grade)',
    'Curricular units 2nd sem (without evaluations)'
]

# Filter to available features
sem1_avail = [f for f in sem1_features if f in df_clean.columns]
sem2_avail = [f for f in sem2_features if f in df_clean.columns]

print(f"  Semester 1 features: {len(sem1_avail)}")
print(f"  Semester 2 features: {len(sem2_avail)}")

# Scale each semester independently
scaler_s1 = StandardScaler()
scaler_s2 = StandardScaler()

X_sem1 = scaler_s1.fit_transform(df_clean[sem1_avail])
X_sem2 = scaler_s2.fit_transform(df_clean[sem2_avail])

# Cluster students independently on each semester's data
n_traj_clusters = 3

km_sem1 = KMeans(n_clusters=n_traj_clusters, init='k-means++',
                  n_init=10, random_state=42)
km_sem2 = KMeans(n_clusters=n_traj_clusters, init='k-means++',
                  n_init=10, random_state=42)

sem1_labels = km_sem1.fit_predict(X_sem1)
sem2_labels = km_sem2.fit_predict(X_sem2)

# Determine risk order for each semester's clusters (by dropout rate)
def get_risk_order(labels, targets, n_clusters):
    """Returns cluster IDs sorted from lowest to highest risk."""
    dropout_rates = {}
    for c in range(n_clusters):
        mask = labels == c
        if mask.sum() > 0:
            dropout_rates[c] = (targets[mask] == 'Dropout').mean()
        else:
            dropout_rates[c] = 0.0
    return sorted(dropout_rates.keys(), key=lambda x: dropout_rates[x])

target_array = df_clean['Target'].values

sem1_risk_order = get_risk_order(sem1_labels, target_array, n_traj_clusters)
sem2_risk_order = get_risk_order(sem2_labels, target_array, n_traj_clusters)

# Map original cluster IDs to risk levels (0=low, 1=medium, 2=high)
sem1_risk_map = {orig: risk for risk, orig in enumerate(sem1_risk_order)}
sem2_risk_map = {orig: risk for risk, orig in enumerate(sem2_risk_order)}

sem1_risk_levels = np.array([sem1_risk_map[l] for l in sem1_labels])
sem2_risk_levels = np.array([sem2_risk_map[l] for l in sem2_labels])

risk_level_names = ['Low Risk', 'Medium Risk', 'High Risk']

# Build transition matrix
transition_matrix = np.zeros((n_traj_clusters, n_traj_clusters), dtype=int)
for s1, s2 in zip(sem1_risk_levels, sem2_risk_levels):
    transition_matrix[s1][s2] += 1

# Print transition matrix
print(f"\n  📊 TRANSITION MATRIX (Sem1 → Sem2):")
print(f"  {'─' * 55}")

header = f"  {'':20s}"
for name in risk_level_names:
    header += f"  {name:>12s}"
print(header)
print(f"  {'─'*20}  {'─'*12}  {'─'*12}  {'─'*12}")

for i, row_name in enumerate(risk_level_names):
    row_str = f"  {row_name:20s}"
    for j in range(n_traj_clusters):
        row_str += f"  {transition_matrix[i][j]:>12d}"
    print(row_str)

# Flag students who deteriorated (moved to higher risk cluster)
trajectory_deteriorating = sem2_risk_levels > sem1_risk_levels
trajectory_improving = sem2_risk_levels < sem1_risk_levels
trajectory_stable = sem2_risk_levels == sem1_risk_levels

n_deteriorating = trajectory_deteriorating.sum()
n_improving = trajectory_improving.sum()
n_stable = trajectory_stable.sum()

print(f"\n  📊 TRAJECTORY SUMMARY:")
print(f"  {'─' * 40}")
print(f"  🔻 Deteriorating: {n_deteriorating} ({n_deteriorating/total_students*100:.1f}%)")
print(f"  🔹 Stable:        {n_stable} ({n_stable/total_students*100:.1f}%)")
print(f"  🔺 Improving:     {n_improving} ({n_improving/total_students*100:.1f}%)")

# Save trajectory data
trajectory_df = pd.DataFrame({
    'sem1_risk_level': sem1_risk_levels,
    'sem2_risk_level': sem2_risk_levels,
    'sem1_risk_name': [risk_level_names[l] for l in sem1_risk_levels],
    'sem2_risk_name': [risk_level_names[l] for l in sem2_risk_levels],
    'trajectory_deteriorating': trajectory_deteriorating,
    'trajectory_improving': trajectory_improving,
    'trajectory_stable': trajectory_stable
})
trajectory_df.to_csv(os.path.join(base_dir, "trajectory_data.csv"), index=False)

# ─── Transition Matrix Heatmap ───────────────────────────────────────────────
fig, axes = plt.subplots(1, 2, figsize=(18, 7))

# Heatmap with counts
ax1 = axes[0]
transition_df = pd.DataFrame(
    transition_matrix,
    index=[f"Sem1: {n}" for n in risk_level_names],
    columns=[f"Sem2: {n}" for n in risk_level_names]
)
sns.heatmap(transition_df, annot=True, fmt='d', cmap='YlOrRd',
            linewidths=2, linecolor='white', ax=ax1,
            cbar_kws={'label': 'Student Count'},
            annot_kws={'size': 16, 'weight': 'bold'})
ax1.set_title('Semester Trajectory Transition Matrix\n(Student Counts)',
              fontsize=14, fontweight='bold')
ax1.set_ylabel('Semester 1 Risk Level', fontsize=12, fontweight='bold')
ax1.set_xlabel('Semester 2 Risk Level', fontsize=12, fontweight='bold')

# Percentage heatmap
ax2 = axes[1]
transition_pct = transition_matrix / transition_matrix.sum(axis=1, keepdims=True) * 100
transition_pct_df = pd.DataFrame(
    transition_pct,
    index=[f"Sem1: {n}" for n in risk_level_names],
    columns=[f"Sem2: {n}" for n in risk_level_names]
)
sns.heatmap(transition_pct_df, annot=True, fmt='.1f', cmap='RdYlGn_r',
            linewidths=2, linecolor='white', ax=ax2,
            cbar_kws={'label': 'Transition %'},
            annot_kws={'size': 14, 'weight': 'bold'})
ax2.set_title('Transition Probabilities (%)\n(Row-normalized)',
              fontsize=14, fontweight='bold')
ax2.set_ylabel('Semester 1 Risk Level', fontsize=12, fontweight='bold')
ax2.set_xlabel('Semester 2 Risk Level', fontsize=12, fontweight='bold')

plt.suptitle(f'Student Risk Trajectory: Sem1 → Sem2 ({n_deteriorating} Deteriorating)',
             fontsize=16, fontweight='bold', y=1.03)
plt.tight_layout()
plt.savefig(os.path.join(base_dir, "plots", "trajectory_matrix.png"),
            dpi=150, bbox_inches='tight')
plt.close()
print("\n  ✅ Trajectory heatmap saved to plots/trajectory_matrix.png")

# ═══════════════════════════════════════════════════════════════════════════════
# PART F: Export At-Risk Students to CSV
# ═══════════════════════════════════════════════════════════════════════════════
print(f"\n{'─' * 50}")
print("Part F: Exporting At-Risk Student List")
print("─" * 50)

# Add trajectory info to the at-risk export
df_clean['trajectory_deteriorating'] = trajectory_deteriorating

at_risk_export = at_risk_students.copy()
at_risk_export['Risk_Score'] = df_clean.loc[at_risk_export.index, 'Risk_Score'].values
at_risk_export['trajectory_deteriorating'] = trajectory_deteriorating[at_risk_export.index]
at_risk_export.insert(0, 'Student_ID', range(1, len(at_risk_export) + 1))

output_path = os.path.join(base_dir, "at_risk_students.csv")
at_risk_export.to_csv(output_path, index=False)

print(f"\n  ✅ At-risk student list exported to: {output_path}")
print(f"  📊 Exported {len(at_risk_export)} students")
print(f"  📋 Columns: {list(at_risk_export.columns[:5])} + {len(at_risk_export.columns) - 5} more")

# ─── Summary Statistics for At-Risk vs Low-Risk ──────────────────────────────
print(f"\n{'─' * 50}")
print("KEY DIFFERENCES: At-Risk vs Low-Risk Students")
print("─" * 50)

low_risk_students = df_clean[df_clean['Risk_Status'] == 'Low Risk']
comparison_features = top_10_features.index[:5]

print(f"\n  {'Feature':<40s}  {'At-Risk':>10s}  {'Low-Risk':>10s}  {'Diff':>8s}")
print(f"  {'─'*40}  {'─'*10}  {'─'*10}  {'─'*8}")

for feature in comparison_features:
    ar_mean = at_risk_students[feature].mean()
    lr_mean = low_risk_students[feature].mean()
    diff = ar_mean - lr_mean
    print(f"  {feature:<40s}  {ar_mean:>10.2f}  {lr_mean:>10.2f}  {diff:>+8.2f}")

print(f"\n{'=' * 70}")
print("  [STEP 7 COMPLETE] ✅")
print(f"{'=' * 70}")
print(f"\n📁 Output Files:")
print(f"   • at_risk_students.csv              — Exported at-risk student list")
print(f"   • trajectory_data.csv               — Sem1→Sem2 trajectory labels")
print(f"   • plots/risk_distribution.png       — Risk analysis charts")
print(f"   • plots/trajectory_matrix.png       — Transition matrix heatmap")
