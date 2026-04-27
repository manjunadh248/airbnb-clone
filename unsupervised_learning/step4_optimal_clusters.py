"""
==============================================================================
STEP 4: Finding Optimal Number of Clusters + Bootstrap Stability Validation
==============================================================================
- Elbow Method with K-Means (k=2 to 10)
- Silhouette Score analysis
- Davies-Bouldin Index
- Plot all three graphs side by side
- Recommend the best value of K
- Run 100 bootstrap stability tests with Jaccard similarity
- Save stability bar chart to plots/cluster_stability.png
==============================================================================
"""

# ─── Import Libraries ───────────────────────────────────────────────────────
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score, davies_bouldin_score, calinski_harabasz_score
import matplotlib.pyplot as plt
import seaborn as sns
from kneed import KneeLocator
from collections import Counter
import os
import warnings
warnings.filterwarnings('ignore')

# ─── Configure Plot Style ────────────────────────────────────────────────────
plt.style.use('seaborn-v0_8-darkgrid')

# ─── Load Preprocessed Data ──────────────────────────────────────────────────
print("=" * 70)
print("  STEP 4: FINDING OPTIMAL NUMBER OF CLUSTERS")
print("=" * 70)

base_dir = os.path.dirname(__file__)
df_scaled = pd.read_csv(os.path.join(base_dir, "preprocessed_data.csv"))
print(f"\n📊 Data Shape: {df_scaled.shape}\n")

# ─── Define Range of K Values ────────────────────────────────────────────────
k_range = range(2, 11)  # k = 2 to 10

# Storage for metrics
inertias = []          # For Elbow Method (Within-cluster sum of squares)
silhouette_scores = [] # For Silhouette Analysis
db_scores = []         # For Davies-Bouldin Index
ch_scores = []         # For Calinski-Harabasz Index

# ─── Evaluate Each K Value ────────────────────────────────────────────────────
print("⏳ Evaluating K values from 2 to 10...\n")
print(f"  {'K':>3s}  {'Inertia':>12s}  {'Silhouette':>12s}  {'Davies-Bouldin':>14s}  {'Calinski-H':>12s}")
print(f"  {'─'*3}  {'─'*12}  {'─'*12}  {'─'*14}  {'─'*12}")

for k in k_range:
    kmeans = KMeans(
        n_clusters=k,
        init='k-means++',
        n_init=10,
        max_iter=300,
        random_state=42
    )
    labels = kmeans.fit_predict(df_scaled)

    inertia = kmeans.inertia_
    sil_score = silhouette_score(df_scaled, labels)
    db_score = davies_bouldin_score(df_scaled, labels)
    ch_score = calinski_harabasz_score(df_scaled, labels)

    inertias.append(inertia)
    silhouette_scores.append(sil_score)
    db_scores.append(db_score)
    ch_scores.append(ch_score)

    print(f"  {k:3d}  {inertia:12.1f}  {sil_score:12.4f}  {db_score:14.4f}  {ch_score:12.1f}")

# ─── Find Optimal K Using Each Method ────────────────────────────────────────
print(f"\n{'─' * 50}")
print("OPTIMAL K RECOMMENDATIONS:")
print(f"{'─' * 50}")

# Elbow Method — Find the "knee" point
kl = KneeLocator(list(k_range), inertias, curve='convex', direction='decreasing')
elbow_k = kl.knee if kl.knee else 3
print(f"\n  📐 Elbow Method:        K = {elbow_k}")

# Silhouette Score — Higher is better
best_sil_k = list(k_range)[np.argmax(silhouette_scores)]
print(f"  📊 Silhouette Score:    K = {best_sil_k} (score = {max(silhouette_scores):.4f})")

# Davies-Bouldin Index — Lower is better
best_db_k = list(k_range)[np.argmin(db_scores)]
print(f"  📉 Davies-Bouldin:      K = {best_db_k} (score = {min(db_scores):.4f})")

# Calinski-Harabasz Index — Higher is better
best_ch_k = list(k_range)[np.argmax(ch_scores)]
print(f"  📈 Calinski-Harabasz:   K = {best_ch_k} (score = {max(ch_scores):.1f})")

# Final recommendation — majority vote across all 4 methods
candidates = [elbow_k, best_sil_k, best_db_k, best_ch_k]
vote_count = Counter(candidates)
recommended_k = vote_count.most_common(1)[0][0]

print(f"\n  🏆 RECOMMENDED K = {recommended_k} (majority vote from 4 methods)")
print(f"     Votes: Elbow→{elbow_k}, Silhouette→{best_sil_k}, DB→{best_db_k}, CH→{best_ch_k}")

# Save the recommended K
with open(os.path.join(base_dir, "optimal_k.txt"), 'w') as f:
    f.write(str(recommended_k))
print(f"\n  ✅ Saved optimal K = {recommended_k} to optimal_k.txt\n")

# ═══════════════════════════════════════════════════════════════════════════════
# PLOTS — All Four Methods in 2×2 Grid
# ═══════════════════════════════════════════════════════════════════════════════

fig, axes = plt.subplots(2, 2, figsize=(16, 12))

# ─── Plot 1: Elbow Method (Top Left) ─────────────────────────────────────────
ax1 = axes[0, 0]
ax1.plot(list(k_range), inertias, 'bo-', linewidth=2.5, markersize=10,
         markerfacecolor='white', markeredgewidth=2, markeredgecolor='blue')
ax1.fill_between(list(k_range), inertias, alpha=0.15, color='blue')

if elbow_k:
    elbow_idx = list(k_range).index(elbow_k)
    ax1.axvline(x=elbow_k, color='red', linestyle='--', linewidth=2, alpha=0.8)
    ax1.scatter([elbow_k], [inertias[elbow_idx]], color='red', s=200, zorder=5,
                marker='*', edgecolors='darkred', linewidths=1)
    ax1.annotate(f'Elbow at K={elbow_k}', xy=(elbow_k, inertias[elbow_idx]),
                 xytext=(elbow_k + 0.8, inertias[elbow_idx]),
                 fontsize=11, fontweight='bold', color='red',
                 arrowprops=dict(arrowstyle='->', color='red', lw=2))

ax1.set_xlabel('Number of Clusters (K)', fontsize=12, fontweight='bold')
ax1.set_ylabel('Inertia (WCSS)', fontsize=12, fontweight='bold')
ax1.set_title('Elbow Method', fontsize=14, fontweight='bold')
ax1.set_xticks(list(k_range))

# ─── Plot 2: Silhouette Score (Top Right) ────────────────────────────────────
ax2 = axes[0, 1]
colors_sil = ['limegreen' if k == best_sil_k else 'steelblue' for k in k_range]
bars = ax2.bar(list(k_range), silhouette_scores, color=colors_sil,
               alpha=0.85, edgecolor='white', linewidth=1.5)

for bar, score in zip(bars, silhouette_scores):
    ax2.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 0.003,
             f'{score:.3f}', ha='center', va='bottom', fontsize=9, fontweight='bold')

ax2.axhline(y=max(silhouette_scores), color='green', linestyle='--', alpha=0.6)
ax2.set_xlabel('Number of Clusters (K)', fontsize=12, fontweight='bold')
ax2.set_ylabel('Silhouette Score', fontsize=12, fontweight='bold')
ax2.set_title(f'Silhouette Score (Best: K={best_sil_k})', fontsize=14, fontweight='bold')
ax2.set_xticks(list(k_range))

# ─── Plot 3: Davies-Bouldin Index (Bottom Left) ─────────────────────────────
ax3 = axes[1, 0]
ax3.plot(list(k_range), db_scores, 'rs-', linewidth=2.5, markersize=10,
         markerfacecolor='white', markeredgewidth=2, markeredgecolor='red')
ax3.fill_between(list(k_range), db_scores, alpha=0.15, color='red')

best_db_idx = list(k_range).index(best_db_k)
ax3.scatter([best_db_k], [db_scores[best_db_idx]], color='green', s=200, zorder=5,
            marker='*', edgecolors='darkgreen', linewidths=1)
ax3.annotate(f'Best at K={best_db_k}', xy=(best_db_k, db_scores[best_db_idx]),
             xytext=(best_db_k + 0.8, db_scores[best_db_idx] + 0.1),
             fontsize=11, fontweight='bold', color='green',
             arrowprops=dict(arrowstyle='->', color='green', lw=2))

ax3.set_xlabel('Number of Clusters (K)', fontsize=12, fontweight='bold')
ax3.set_ylabel('Davies-Bouldin Index', fontsize=12, fontweight='bold')
ax3.set_title(f'Davies-Bouldin Index (Best: K={best_db_k})', fontsize=14, fontweight='bold')
ax3.set_xticks(list(k_range))

# ─── Plot 4: Calinski-Harabasz Index (Bottom Right) ──────────────────────────
ax4 = axes[1, 1]
ax4.plot(list(k_range), ch_scores, 'g^-', linewidth=2.5, markersize=10,
         markerfacecolor='white', markeredgewidth=2, markeredgecolor='green')
ax4.fill_between(list(k_range), ch_scores, alpha=0.15, color='green')

best_ch_idx = list(k_range).index(best_ch_k)
ax4.scatter([best_ch_k], [ch_scores[best_ch_idx]], color='orange', s=200, zorder=5,
            marker='*', edgecolors='darkorange', linewidths=1)
ax4.annotate(f'Best at K={best_ch_k}', xy=(best_ch_k, ch_scores[best_ch_idx]),
             xytext=(best_ch_k + 0.8, ch_scores[best_ch_idx]),
             fontsize=11, fontweight='bold', color='orange',
             arrowprops=dict(arrowstyle='->', color='orange', lw=2))

ax4.set_xlabel('Number of Clusters (K)', fontsize=12, fontweight='bold')
ax4.set_ylabel('Calinski-Harabasz Index', fontsize=12, fontweight='bold')
ax4.set_title(f'Calinski-Harabasz Index (Best: K={best_ch_k})', fontsize=14, fontweight='bold')
ax4.set_xticks(list(k_range))

plt.suptitle(f'Optimal Cluster Analysis — Recommended K = {recommended_k}',
             fontsize=16, fontweight='bold', y=1.03)
plt.tight_layout()
plt.savefig(os.path.join(base_dir, "plots", "optimal_k_analysis.png"),
            dpi=150, bbox_inches='tight')
plt.close()

# ═══════════════════════════════════════════════════════════════════════════════
# BOOTSTRAP CLUSTER STABILITY VALIDATION (100 Iterations)
# ═══════════════════════════════════════════════════════════════════════════════
print("─" * 50)
print("CLUSTER STABILITY VALIDATION (Bootstrap + Jaccard)")
print("─" * 50)

print(f"\n⏳ Running 100 bootstrap iterations with K={recommended_k}...")
print("   (80% subsample per iteration, measuring Jaccard similarity)\n")

# Step 1: Fit the original clustering on the full dataset
original_kmeans = KMeans(
    n_clusters=recommended_k, init='k-means++',
    n_init=10, max_iter=300, random_state=42
)
original_labels = original_kmeans.fit_predict(df_scaled)

def compute_jaccard_similarity(labels_a, labels_b, indices):
    """
    Compute the mean Jaccard similarity between two clustering assignments.
    Uses pairwise co-assignment: two points are 'co-assigned' if they share
    the same cluster. Jaccard = |intersection| / |union| of co-assignment sets.
    """
    n = len(indices)
    if n < 2:
        return 0.0

    # Sample a manageable number of pairs for efficiency
    max_pairs = min(5000, n * (n - 1) // 2)
    rng = np.random.RandomState(42)
    pair_indices = rng.choice(n, size=(max_pairs, 2), replace=True)

    same_a = labels_a[pair_indices[:, 0]] == labels_a[pair_indices[:, 1]]
    same_b = labels_b[pair_indices[:, 0]] == labels_b[pair_indices[:, 1]]

    intersection = np.sum(same_a & same_b)
    union = np.sum(same_a | same_b)

    return intersection / union if union > 0 else 0.0

n_bootstrap = 100
jaccard_scores = []
data_array = df_scaled.values
n_samples = len(data_array)

for i in range(n_bootstrap):
    # 80% subsample with replacement
    rng = np.random.RandomState(i)
    bootstrap_idx = rng.choice(n_samples, size=int(0.8 * n_samples), replace=True)
    bootstrap_data = data_array[bootstrap_idx]

    # Cluster the bootstrap sample
    boot_kmeans = KMeans(
        n_clusters=recommended_k, init='k-means++',
        n_init=5, max_iter=200, random_state=42
    )
    boot_labels = boot_kmeans.fit_predict(bootstrap_data)

    # Get original labels for the same indices
    orig_subset_labels = original_labels[bootstrap_idx]

    # Compute Jaccard similarity
    jaccard = compute_jaccard_similarity(orig_subset_labels, boot_labels, bootstrap_idx)
    jaccard_scores.append(jaccard)

    if (i + 1) % 25 == 0:
        print(f"   Completed {i+1}/100 iterations...")

jaccard_scores = np.array(jaccard_scores)
mean_jaccard = jaccard_scores.mean()
std_jaccard = jaccard_scores.std()

print(f"\n  📊 BOOTSTRAP STABILITY RESULTS:")
print(f"  {'─' * 40}")
print(f"  Iterations:        {n_bootstrap}")
print(f"  Subsample Size:    80% ({int(0.8 * n_samples)} samples)")
print(f"  Mean Jaccard:      {mean_jaccard:.4f}")
print(f"  Std Jaccard:       {std_jaccard:.4f}")
print(f"  95% CI:            [{mean_jaccard - 1.96*std_jaccard:.4f}, {mean_jaccard + 1.96*std_jaccard:.4f}]")

if mean_jaccard > 0.75:
    stability = "🟢 HIGHLY STABLE — clusters are robust and reproducible"
elif mean_jaccard > 0.6:
    stability = "🟡 MODERATELY STABLE — clusters are reasonably consistent"
else:
    stability = "🔴 UNSTABLE — clusters vary significantly across samples"

print(f"  Assessment:        {stability}")

# Save stability scores to CSV for report
stability_df = pd.DataFrame({
    'bootstrap_iteration': range(1, n_bootstrap + 1),
    'jaccard_score': jaccard_scores
})
stability_df.to_csv(os.path.join(base_dir, "bootstrap_stability.csv"), index=False)

# ─── Stability Bar Chart ─────────────────────────────────────────────────────
fig, axes = plt.subplots(1, 2, figsize=(16, 6))

# Histogram of Jaccard scores
ax1 = axes[0]
ax1.hist(jaccard_scores, bins=20, color='#2196F3', alpha=0.8,
         edgecolor='white', linewidth=1.5)
ax1.axvline(x=mean_jaccard, color='red', linestyle='--', linewidth=2.5,
            label=f'Mean = {mean_jaccard:.4f}')
ax1.axvline(x=mean_jaccard - std_jaccard, color='orange', linestyle=':',
            linewidth=1.5, label=f'±1σ = [{mean_jaccard-std_jaccard:.3f}, {mean_jaccard+std_jaccard:.3f}]')
ax1.axvline(x=mean_jaccard + std_jaccard, color='orange', linestyle=':',
            linewidth=1.5)
ax1.fill_betweenx([0, ax1.get_ylim()[1] if ax1.get_ylim()[1] > 0 else 20],
                   mean_jaccard - std_jaccard, mean_jaccard + std_jaccard,
                   alpha=0.1, color='orange')
ax1.set_xlabel('Jaccard Similarity Score', fontsize=12, fontweight='bold')
ax1.set_ylabel('Frequency', fontsize=12, fontweight='bold')
ax1.set_title(f'Bootstrap Cluster Stability (K={recommended_k}, n={n_bootstrap})',
              fontsize=14, fontweight='bold')
ax1.legend(fontsize=10)

# Running mean across iterations
ax2 = axes[1]
running_mean = np.cumsum(jaccard_scores) / np.arange(1, n_bootstrap + 1)
ax2.plot(range(1, n_bootstrap + 1), running_mean, color='#4CAF50',
         linewidth=2.5, label='Running Mean')
ax2.fill_between(range(1, n_bootstrap + 1),
                  running_mean - std_jaccard, running_mean + std_jaccard,
                  alpha=0.15, color='#4CAF50')
ax2.axhline(y=mean_jaccard, color='red', linestyle='--', linewidth=1.5,
            label=f'Final Mean = {mean_jaccard:.4f}')
ax2.set_xlabel('Bootstrap Iteration', fontsize=12, fontweight='bold')
ax2.set_ylabel('Cumulative Mean Jaccard', fontsize=12, fontweight='bold')
ax2.set_title('Convergence of Stability Estimate', fontsize=14, fontweight='bold')
ax2.legend(fontsize=10)

plt.suptitle(f'Cluster Stability Analysis — Mean Jaccard = {mean_jaccard:.4f} ± {std_jaccard:.4f}',
             fontsize=16, fontweight='bold', y=1.03)
plt.tight_layout()
plt.savefig(os.path.join(base_dir, "plots", "cluster_stability.png"),
            dpi=150, bbox_inches='tight')
plt.close()

print(f"\n{'=' * 70}")
print("  [STEP 4 COMPLETE] ✅")
print(f"{'=' * 70}")
print(f"\n📁 Output Files:")
print(f"   • optimal_k.txt                       — Best K value")
print(f"   • bootstrap_stability.csv              — Jaccard scores per iteration")
print(f"   • plots/optimal_k_analysis.png         — Comparison plots")
print(f"   • plots/cluster_stability.png          — Stability analysis charts")
