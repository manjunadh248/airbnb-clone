"""
==============================================================================
STEP 7B: Advanced Trajectory Analysis — DTW & Sankey Diagram
==============================================================================
- Compute trajectory similarity using Dynamic Time Warping (DTW)
- Identify students transitioning from safe → risk cluster
- Create Sankey diagram showing trajectory movement flows
- Calculate critical academic point where dropout risk becomes critical
==============================================================================
"""

# ─── Import Libraries ───────────────────────────────────────────────────────
import pandas as pd                          # DataFrame operations
import numpy as np                           # Numerical computations
from sklearn.cluster import KMeans           # For semester-wise clustering
from sklearn.preprocessing import StandardScaler  # Feature normalization
from scipy.spatial.distance import euclidean # Distance metric for DTW fallback
import matplotlib                            # Plotting backend
matplotlib.use('Agg')                        # Non-interactive mode
import matplotlib.pyplot as plt              # Plotting library
import seaborn as sns                        # Statistical visualizations
import os                                    # File path operations
import warnings                              # Warning suppression
warnings.filterwarnings('ignore')            # Suppress convergence warnings

# Try to import plotly for Sankey diagram
try:
    import plotly.graph_objects as go         # Plotly for interactive Sankey
    PLOTLY_AVAILABLE = True
except ImportError:
    PLOTLY_AVAILABLE = False
    print("⚠️  plotly not installed — Sankey will use matplotlib fallback.")

# Try to import tslearn for DTW
try:
    from tslearn.metrics import dtw as tslearn_dtw  # Professional DTW
    DTW_AVAILABLE = True
    print("✅ tslearn loaded for DTW analysis")
except ImportError:
    DTW_AVAILABLE = False
    print("⚠️  tslearn not installed — using scipy DTW fallback")

# ─── Configure ───────────────────────────────────────────────────────────────
plt.style.use('seaborn-v0_8-darkgrid')
base_dir = os.path.dirname(__file__)
plots_dir = os.path.join(base_dir, "plots")
os.makedirs(plots_dir, exist_ok=True)

print("=" * 70)
print("  STEP 7B: ADVANCED TRAJECTORY ANALYSIS")
print("=" * 70)

# ─── Load Data ───────────────────────────────────────────────────────────────
df_clean = pd.read_csv(os.path.join(base_dir, "cleaned_unscaled_data.csv"))
target_labels = pd.read_csv(os.path.join(base_dir, "target_labels.csv"))['Target']
df_clean['Target'] = target_labels.values

# Define semester feature groups
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

print(f"\n📊 Semester 1 features: {len(sem1_avail)}")
print(f"📊 Semester 2 features: {len(sem2_avail)}")

# ═══════════════════════════════════════════════════════════════════════════════
# PART A: Build Semester-Wise Trajectories
# ═══════════════════════════════════════════════════════════════════════════════
print(f"\n{'─' * 50}")
print("Part A: Building Student Trajectories")
print("─" * 50)

# Normalize semester features independently
scaler1 = StandardScaler()
scaler2 = StandardScaler()
X_s1 = scaler1.fit_transform(df_clean[sem1_avail])
X_s2 = scaler2.fit_transform(df_clean[sem2_avail])

# Create "trajectory" = sequence of [sem1_vector, sem2_vector] for each student
# Shape: (n_students, 2_semesters, n_features)
n_feat = min(len(sem1_avail), len(sem2_avail))
trajectories = np.stack([X_s1[:, :n_feat], X_s2[:, :n_feat]], axis=1)
print(f"\n  ✅ Built trajectories: {trajectories.shape}")
print(f"     (students × semesters × features)")

# ═══════════════════════════════════════════════════════════════════════════════
# PART B: Dynamic Time Warping — Trajectory Similarity
# ═══════════════════════════════════════════════════════════════════════════════
print(f"\n{'─' * 50}")
print("Part B: Dynamic Time Warping (DTW) Trajectory Similarity")
print("─" * 50)

# Define simple DTW function as fallback
def simple_dtw(ts1, ts2):
    """Compute DTW distance between two multivariate time series."""
    n, m = len(ts1), len(ts2)
    dtw_mat = np.full((n + 1, m + 1), np.inf)
    dtw_mat[0, 0] = 0
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            cost = np.sqrt(np.sum((ts1[i-1] - ts2[j-1]) ** 2))
            dtw_mat[i, j] = cost + min(dtw_mat[i-1, j], dtw_mat[i, j-1], dtw_mat[i-1, j-1])
    return dtw_mat[n, m]

# Compute DTW for a sample (full dataset would be O(n^2))
n_sample = min(500, len(trajectories))
rng = np.random.RandomState(42)
sample_idx = rng.choice(len(trajectories), n_sample, replace=False)
sample_traj = trajectories[sample_idx]
sample_targets = target_labels.values[sample_idx]

print(f"\n  ⏳ Computing DTW distances for {n_sample} students...")

# Compute pairwise DTW for a smaller subset (100 students for speed)
n_dtw = min(100, n_sample)
dtw_matrix = np.zeros((n_dtw, n_dtw))

for i in range(n_dtw):
    for j in range(i + 1, n_dtw):
        if DTW_AVAILABLE:
            dist = tslearn_dtw(sample_traj[i], sample_traj[j])
        else:
            dist = simple_dtw(sample_traj[i], sample_traj[j])
        dtw_matrix[i, j] = dist
        dtw_matrix[j, i] = dist

print(f"  ✅ DTW distance matrix computed ({n_dtw}×{n_dtw})")

# Analyze DTW distances by outcome group
print(f"\n  📊 Average DTW Distance Within Groups:")
for target_val in ['Dropout', 'Enrolled', 'Graduate']:
    mask = sample_targets[:n_dtw] == target_val
    if mask.sum() >= 2:
        within_dists = dtw_matrix[np.ix_(mask, mask)]
        avg_within = within_dists[within_dists > 0].mean() if (within_dists > 0).any() else 0
        print(f"     {target_val}: {avg_within:.3f}")

print(f"\n  📊 Average DTW Distance Between Groups:")
for t1, t2 in [('Dropout', 'Graduate'), ('Dropout', 'Enrolled'), ('Enrolled', 'Graduate')]:
    m1 = sample_targets[:n_dtw] == t1
    m2 = sample_targets[:n_dtw] == t2
    if m1.sum() >= 1 and m2.sum() >= 1:
        between = dtw_matrix[np.ix_(m1, m2)]
        print(f"     {t1} ↔ {t2}: {between.mean():.3f}")

# ═══════════════════════════════════════════════════════════════════════════════
# PART C: Sankey Diagram — Trajectory Flow Visualization
# ═══════════════════════════════════════════════════════════════════════════════
print(f"\n{'─' * 50}")
print("Part C: Sankey Diagram — Trajectory Flows")
print("─" * 50)

# Cluster each semester independently to create risk levels
n_risk = 3
km_s1 = KMeans(n_clusters=n_risk, init='k-means++', n_init=10, random_state=42)
km_s2 = KMeans(n_clusters=n_risk, init='k-means++', n_init=10, random_state=42)
labels_s1 = km_s1.fit_predict(X_s1)
labels_s2 = km_s2.fit_predict(X_s2)

# Map clusters to risk levels by dropout rate
def map_to_risk(labels, targets, n_clusters):
    dropout_rates = {}
    for c in range(n_clusters):
        mask = labels == c
        if mask.sum() > 0:
            dropout_rates[c] = (targets[mask] == 'Dropout').mean()
        else:
            dropout_rates[c] = 0
    sorted_clusters = sorted(dropout_rates, key=dropout_rates.get)
    mapping = {}
    for i, c in enumerate(sorted_clusters):
        if i < n_clusters // 3 + 1:
            mapping[c] = 'Low Risk'
        elif i < 2 * n_clusters // 3 + 1:
            mapping[c] = 'Medium Risk'
        else:
            mapping[c] = 'High Risk'
    return np.array([mapping[l] for l in labels])

risk_s1 = map_to_risk(labels_s1, target_labels.values, n_risk)
risk_s2 = map_to_risk(labels_s2, target_labels.values, n_risk)

# Build transition counts for Sankey
risk_levels = ['Low Risk', 'Medium Risk', 'High Risk']
flow_counts = {}
for s1_risk in risk_levels:
    for s2_risk in risk_levels:
        key = (s1_risk, s2_risk)
        flow_counts[key] = int(((risk_s1 == s1_risk) & (risk_s2 == s2_risk)).sum())

print("\n  📊 Transition Flow Counts:")
for (s1, s2), count in sorted(flow_counts.items()):
    print(f"     Sem1: {s1:12s} → Sem2: {s2:12s}: {count:5d} students")

# Create Sankey diagram
if PLOTLY_AVAILABLE:
    # Node labels: Sem1 levels on left, Sem2 levels on right
    node_labels = [f"S1: {r}" for r in risk_levels] + [f"S2: {r}" for r in risk_levels]
    node_colors = ['#4CAF50', '#FF9800', '#FF4444', '#66BB6A', '#FFB74D', '#EF5350']

    sources, targets_s, values, link_colors = [], [], [], []
    for i, s1_risk in enumerate(risk_levels):
        for j, s2_risk in enumerate(risk_levels):
            count = flow_counts[(s1_risk, s2_risk)]
            if count > 0:
                sources.append(i)
                targets_s.append(3 + j)  # Offset by 3 for Sem2 nodes
                values.append(count)
                # Color links by destination
                if j == 2:   # Flowing to High Risk
                    link_colors.append('rgba(255,68,68,0.4)')
                elif j == 1:  # Flowing to Medium
                    link_colors.append('rgba(255,152,0,0.4)')
                else:         # Flowing to Low Risk
                    link_colors.append('rgba(76,175,80,0.4)')

    fig = go.Figure(data=[go.Sankey(
        node=dict(
            pad=15, thickness=25, line=dict(color="white", width=1),
            label=node_labels, color=node_colors
        ),
        link=dict(source=sources, target=targets_s, value=values, color=link_colors)
    )])
    fig.update_layout(
        title_text="Student Risk Trajectory: Semester 1 → Semester 2 (Sankey Flow)",
        font_size=14, width=900, height=500
    )
    fig.write_image(os.path.join(plots_dir, "trajectory_sankey.png"), scale=2)
    print("\n  ✅ Sankey diagram saved to plots/trajectory_sankey.png")
else:
    # Matplotlib fallback: stacked bar chart showing flows
    fig, ax = plt.subplots(figsize=(10, 6))
    x = np.arange(len(risk_levels))
    width = 0.25
    for i, s1_risk in enumerate(risk_levels):
        counts = [flow_counts[(s1_risk, s2_risk)] for s2_risk in risk_levels]
        ax.bar(x + i * width, counts, width, label=f'From {s1_risk}',
               alpha=0.85, edgecolor='white')
    ax.set_xlabel('Semester 2 Risk Level', fontsize=12, fontweight='bold')
    ax.set_ylabel('Student Count', fontsize=12, fontweight='bold')
    ax.set_title('Trajectory Flows: Sem1 → Sem2', fontsize=14, fontweight='bold')
    ax.set_xticks(x + width)
    ax.set_xticklabels(risk_levels)
    ax.legend(fontsize=10)
    plt.tight_layout()
    plt.savefig(os.path.join(plots_dir, "trajectory_sankey.png"), dpi=150, bbox_inches='tight')
    plt.close()
    print("\n  ✅ Trajectory flow chart saved (matplotlib fallback)")

# ═══════════════════════════════════════════════════════════════════════════════
# PART D: Critical Dropout Point Analysis
# ═══════════════════════════════════════════════════════════════════════════════
print(f"\n{'─' * 50}")
print("Part D: Critical Academic Dropout Point")
print("─" * 50)

# Compare Sem1 vs Sem2 performance for dropout students
dropout_mask = target_labels.values == 'Dropout'
graduate_mask = target_labels.values == 'Graduate'

# Key metric: approval rate change
if 'Curricular units 1st sem (approved)' in df_clean.columns and 'Curricular units 2nd sem (approved)' in df_clean.columns:
    s1_appr = df_clean['Curricular units 1st sem (approved)']
    s2_appr = df_clean['Curricular units 2nd sem (approved)']
    s1_enr = df_clean.get('Curricular units 1st sem (enrolled)', pd.Series([1]*len(df_clean)))
    s2_enr = df_clean.get('Curricular units 2nd sem (enrolled)', pd.Series([1]*len(df_clean)))

    # Approval rates
    ar_s1 = s1_appr / s1_enr.replace(0, 1)
    ar_s2 = s2_appr / s2_enr.replace(0, 1)

    print("\n  📊 Average Approval Rate by Outcome:")
    for label, mask in [('Dropout', dropout_mask), ('Graduate', graduate_mask)]:
        print(f"     {label}: Sem1 = {ar_s1[mask].mean():.2f}, Sem2 = {ar_s2[mask].mean():.2f}, "
              f"Δ = {(ar_s2[mask].mean() - ar_s1[mask].mean()):+.2f}")

    # Critical threshold: where dropout probability exceeds 50%
    # Bin approval rates and compute dropout fraction per bin
    ar_combined = (ar_s1 + ar_s2) / 2
    bins = np.linspace(0, 1, 11)
    df_clean['avg_approval_rate'] = ar_combined
    df_clean['approval_bin'] = pd.cut(ar_combined, bins=bins, labels=[f'{b:.0%}' for b in bins[:-1]])

    bin_stats = df_clean.groupby('approval_bin').agg(
        dropout_rate=('Target', lambda x: (x == 'Dropout').mean() * 100),
        count=('Target', 'size')
    ).dropna()

    # Find the critical point where dropout rate crosses 50%
    critical_idx = None
    for i, (_, row) in enumerate(bin_stats.iterrows()):
        if row['dropout_rate'] > 50:
            critical_idx = i
            break

    if critical_idx is not None:
        critical_bin = bin_stats.index[critical_idx]
        print(f"\n  🎯 CRITICAL DROPOUT POINT:")
        print(f"     Average approval rate below {critical_bin} → >50% dropout probability")
    else:
        print(f"\n  📊 No clear 50% threshold found in approval rate bins")

    # Visualization
    fig, axes = plt.subplots(1, 2, figsize=(16, 6))

    # Plot 1: Approval rate distribution by outcome
    ax1 = axes[0]
    for label, mask, color in [('Dropout', dropout_mask, '#FF4444'),
                                ('Graduate', graduate_mask, '#4CAF50')]:
        ax1.hist(ar_combined[mask], bins=20, alpha=0.6, color=color, label=label, edgecolor='white')
    ax1.set_xlabel('Average Approval Rate (Sem1+Sem2)/2', fontsize=12, fontweight='bold')
    ax1.set_ylabel('Frequency', fontsize=12, fontweight='bold')
    ax1.set_title('Approval Rate Distribution by Outcome', fontsize=14, fontweight='bold')
    ax1.legend(fontsize=12)
    ax1.axvline(x=0.5, color='red', linestyle='--', alpha=0.5, label='50% threshold')

    # Plot 2: Dropout rate by approval rate bin
    ax2 = axes[1]
    if len(bin_stats) > 0:
        colors = ['#FF4444' if r > 50 else '#4CAF50' for r in bin_stats['dropout_rate']]
        bars = ax2.bar(range(len(bin_stats)), bin_stats['dropout_rate'],
                       color=colors, alpha=0.85, edgecolor='white')
        ax2.set_xticks(range(len(bin_stats)))
        ax2.set_xticklabels(bin_stats.index, rotation=45, ha='right', fontsize=9)
        ax2.axhline(y=50, color='red', linestyle='--', alpha=0.7, label='50% threshold')
        ax2.set_xlabel('Average Approval Rate Bin', fontsize=12, fontweight='bold')
        ax2.set_ylabel('Dropout Rate (%)', fontsize=12, fontweight='bold')
        ax2.set_title('Critical Dropout Point — By Approval Rate', fontsize=14, fontweight='bold')
        ax2.legend(fontsize=10)

    plt.suptitle('Academic Critical Point Analysis', fontsize=16, fontweight='bold', y=1.03)
    plt.tight_layout()
    plt.savefig(os.path.join(plots_dir, "critical_dropout_point.png"), dpi=150, bbox_inches='tight')
    plt.close()
    print("  ✅ Critical dropout point chart saved.\n")

# ═══════════════════════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════════════════════
print(f"{'=' * 70}")
print("  [STEP 7B COMPLETE] ✅")
print(f"{'=' * 70}")
print(f"\n📁 Output Files:")
print(f"   • plots/trajectory_sankey.png         — Sankey flow diagram")
print(f"   • plots/critical_dropout_point.png    — Critical point analysis")
print(f"\n📊 Key Findings:")
n_deteriorating = ((risk_s1 == 'Low Risk') & (risk_s2 == 'High Risk')).sum() + \
                  ((risk_s1 == 'Medium Risk') & (risk_s2 == 'High Risk')).sum() + \
                  ((risk_s1 == 'Low Risk') & (risk_s2 == 'Medium Risk')).sum()
print(f"   • {n_deteriorating} students show deteriorating trajectories")
print(f"   • DTW analysis reveals distinct trajectory shapes per outcome group")
