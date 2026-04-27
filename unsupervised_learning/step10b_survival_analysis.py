"""
==============================================================================
STEP 10b: Survival Analysis — Kaplan-Meier Curves per Cluster
==============================================================================
Treats each student's "time to dropout" as the number of enrolled semesters
before dropping out.  Plots Kaplan-Meier survival curves for each cluster
using the lifelines library.

Output:
  • plots/survival_curves.png
  • Median survival time per cluster printed to console
==============================================================================
"""

# ─── Imports ─────────────────────────────────────────────────────────────────
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from lifelines import KaplanMeierFitter
from lifelines.statistics import logrank_test
import os
import warnings
warnings.filterwarnings('ignore')

plt.style.use('seaborn-v0_8-darkgrid')

# ─── Load Data ───────────────────────────────────────────────────────────────
print("=" * 70)
print("  STEP 10b: SURVIVAL ANALYSIS — KAPLAN-MEIER CURVES")
print("=" * 70)

base_dir = os.path.dirname(__file__)
plots_dir = os.path.join(base_dir, "plots")
os.makedirs(plots_dir, exist_ok=True)

df_clean   = pd.read_csv(os.path.join(base_dir, "cleaned_unscaled_data.csv"))
kmeans_lbl = pd.read_csv(os.path.join(base_dir, "kmeans_labels.csv"))['KMeans_Cluster']
target_lbl = pd.read_csv(os.path.join(base_dir, "target_labels.csv"))['Target']

df_clean['Cluster'] = kmeans_lbl.values
df_clean['Target']  = target_lbl.values

# ═══════════════════════════════════════════════════════════════════════════════
# PART A: Construct Survival Data
# ═══════════════════════════════════════════════════════════════════════════════
print("\n─── Part A: Constructing Survival Data ───")

# Semester features used as proxy for "time in programme"
sem1_cols = [c for c in df_clean.columns if '1st sem' in c and 'enrolled' in c.lower()]
sem2_cols = [c for c in df_clean.columns if '2nd sem' in c and 'enrolled' in c.lower()]

def estimate_duration(row):
    """
    Heuristic duration (semesters) based on curricular-unit engagement.
    • If a student has 2nd-sem enrolled units > 0 → survived at least 2 semesters
    • Add bonus semesters proportional to approved / enrolled ratio to simulate
      a longer observation window for students who stayed active.
    """
    sem1_enr = row.get(sem1_cols[0], 0) if sem1_cols else 0
    sem2_enr = row.get(sem2_cols[0], 0) if sem2_cols else 0

    # Base semesters observed
    if sem2_enr > 0:
        base = 2
    elif sem1_enr > 0:
        base = 1
    else:
        base = 0.5          # enrolled but zero units – very short tenure

    # Extend duration for students who approved many units (proxy for
    # continuing beyond year 1).  This gives Graduates ~4-6 semesters,
    # Enrolled ~3-4, and Dropouts ~1-2 on average.
    sem1_app_cols = [c for c in df_clean.columns
                     if '1st sem' in c and 'approved' in c.lower()]
    sem2_app_cols = [c for c in df_clean.columns
                     if '2nd sem' in c and 'approved' in c.lower()]

    sem1_app = row.get(sem1_app_cols[0], 0) if sem1_app_cols else 0
    sem2_app = row.get(sem2_app_cols[0], 0) if sem2_app_cols else 0

    extra = 0
    if sem1_enr > 0:
        extra += (sem1_app / max(sem1_enr, 1)) * 2   # up to +2
    if sem2_enr > 0:
        extra += (sem2_app / max(sem2_enr, 1)) * 2   # up to +2

    return round(base + extra, 1)


df_clean['duration'] = df_clean.apply(estimate_duration, axis=1)

# Event indicator: 1 = dropout occurred, 0 = censored (still enrolled / graduated)
df_clean['event'] = (df_clean['Target'] == 'Dropout').astype(int)

print(f"  Students:        {len(df_clean)}")
print(f"  Dropout events:  {df_clean['event'].sum()}")
print(f"  Censored:        {(df_clean['event'] == 0).sum()}")
print(f"  Duration range:  [{df_clean['duration'].min():.1f}, "
      f"{df_clean['duration'].max():.1f}] semesters\n")

# ═══════════════════════════════════════════════════════════════════════════════
# PART B: Fit Kaplan-Meier per Cluster & Plot
# ═══════════════════════════════════════════════════════════════════════════════
print("─── Part B: Fitting Kaplan-Meier Survival Curves ───\n")

n_clusters = df_clean['Cluster'].nunique()
colors = ['#64ffda', '#38bdf8', '#a78bfa', '#f472b6', '#fbbf24',
          '#34d399', '#fb923c', '#e879f9']

fig, axes = plt.subplots(1, 2, figsize=(18, 7))

# ── Left panel: per-cluster curves ──
ax1 = axes[0]
median_survival = {}

for cluster_id in sorted(df_clean['Cluster'].unique()):
    mask = df_clean['Cluster'] == cluster_id
    T = df_clean.loc[mask, 'duration']
    E = df_clean.loc[mask, 'event']

    kmf = KaplanMeierFitter()
    kmf.fit(T, event_observed=E, label=f'Cluster {cluster_id}')
    kmf.plot_survival_function(ax=ax1, ci_show=True,
                                color=colors[cluster_id % len(colors)],
                                linewidth=2.5)

    med = kmf.median_survival_time_
    median_survival[cluster_id] = med

    dropout_rate = df_clean.loc[mask, 'event'].mean() * 100
    print(f"  Cluster {cluster_id}:")
    print(f"    Size               = {mask.sum()}")
    print(f"    Dropout Rate       = {dropout_rate:.1f}%")
    print(f"    Median Survival    = {med:.2f} semesters")
    print()

ax1.set_title('Kaplan-Meier Survival Curves by Cluster',
              fontsize=14, fontweight='bold')
ax1.set_xlabel('Duration (semesters)', fontsize=12, fontweight='bold')
ax1.set_ylabel('Survival Probability', fontsize=12, fontweight='bold')
ax1.legend(fontsize=11, loc='lower left')
ax1.set_ylim(0, 1.05)
ax1.grid(True, alpha=0.3)

# ── Right panel: per-target curves ──
ax2 = axes[1]
target_colors = {'Dropout': '#ff6b6b', 'Enrolled': '#fbbf24', 'Graduate': '#64ffda'}

for target_val in ['Dropout', 'Enrolled', 'Graduate']:
    mask = df_clean['Target'] == target_val
    if mask.sum() == 0:
        continue
    T = df_clean.loc[mask, 'duration']
    E = df_clean.loc[mask, 'event']

    kmf = KaplanMeierFitter()
    kmf.fit(T, event_observed=E, label=target_val)
    kmf.plot_survival_function(ax=ax2, ci_show=True,
                                color=target_colors.get(target_val, '#ccc'),
                                linewidth=2.5)

ax2.set_title('Kaplan-Meier Survival Curves by Outcome',
              fontsize=14, fontweight='bold')
ax2.set_xlabel('Duration (semesters)', fontsize=12, fontweight='bold')
ax2.set_ylabel('Survival Probability', fontsize=12, fontweight='bold')
ax2.legend(fontsize=11, loc='lower left')
ax2.set_ylim(0, 1.05)
ax2.grid(True, alpha=0.3)

plt.suptitle('Student Retention Survival Analysis',
             fontsize=16, fontweight='bold', y=1.03)
plt.tight_layout()
plt.savefig(os.path.join(plots_dir, "survival_curves.png"),
            dpi=150, bbox_inches='tight')
plt.close()
print("  ✅ Survival curves saved to plots/survival_curves.png\n")

# ═══════════════════════════════════════════════════════════════════════════════
# PART C: Log-Rank Test Between Clusters
# ═══════════════════════════════════════════════════════════════════════════════
print("─── Part C: Log-Rank Pairwise Tests ───\n")

cluster_ids = sorted(df_clean['Cluster'].unique())
for i in range(len(cluster_ids)):
    for j in range(i + 1, len(cluster_ids)):
        ci, cj = cluster_ids[i], cluster_ids[j]
        mi, mj = df_clean['Cluster'] == ci, df_clean['Cluster'] == cj
        result = logrank_test(
            df_clean.loc[mi, 'duration'], df_clean.loc[mj, 'duration'],
            event_observed_A=df_clean.loc[mi, 'event'],
            event_observed_B=df_clean.loc[mj, 'event']
        )
        sig = "***" if result.p_value < 0.001 else (
              "**"  if result.p_value < 0.01  else (
              "*"   if result.p_value < 0.05  else "ns"))
        print(f"  C{ci} vs C{cj}:  χ² = {result.test_statistic:.2f},  "
              f"p = {result.p_value:.4f}  {sig}")

# ═══════════════════════════════════════════════════════════════════════════════
# Summary
# ═══════════════════════════════════════════════════════════════════════════════
print(f"\n{'=' * 70}")
print("  MEDIAN SURVIVAL TIME PER CLUSTER")
print(f"{'=' * 70}")
for cid in sorted(median_survival):
    val = median_survival[cid]
    print(f"  Cluster {cid}:  {val:.2f} semesters")

print(f"\n{'=' * 70}")
print("  [STEP 10b COMPLETE] ✅")
print(f"{'=' * 70}")
print(f"\n📁 Output Files:")
print(f"   • plots/survival_curves.png  — Kaplan-Meier survival curves")
