"""
==============================================================================
STEP 5: Apply Clustering Algorithms with Isolation Forest Anomaly Layer
==============================================================================
1. Isolation Forest anomaly detection (contamination=0.05)
2. K-Means Clustering (with best K value)
3. DBSCAN Clustering (with eps and min_samples tuning)
4. Agglomerative Hierarchical Clustering
5. Compare all three using Silhouette Score
6. Visualize each cluster result using t-SNE 2D plot
==============================================================================
"""

# ─── Import Libraries ───────────────────────────────────────────────────────
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering
from sklearn.mixture import GaussianMixture
from sklearn.ensemble import IsolationForest
from sklearn.metrics import silhouette_score, davies_bouldin_score, calinski_harabasz_score
from sklearn.manifold import TSNE
from sklearn.decomposition import PCA
from sklearn.neighbors import NearestNeighbors
from scipy.cluster.hierarchy import dendrogram, linkage
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
print("  STEP 5: CLUSTERING ALGORITHMS + ANOMALY DETECTION")
print("=" * 70)

base_dir = os.path.dirname(__file__)
df_scaled = pd.read_csv(os.path.join(base_dir, "preprocessed_data.csv"))
df_clean = pd.read_csv(os.path.join(base_dir, "cleaned_unscaled_data.csv"))

# Load optimal K from Step 4
try:
    with open(os.path.join(base_dir, "optimal_k.txt"), 'r') as f:
        optimal_k = int(f.read().strip())
except FileNotFoundError:
    optimal_k = 3
    print("⚠️  optimal_k.txt not found, using default K=3")

print(f"\n📊 Data Shape: {df_scaled.shape}")
print(f"🏆 Optimal K: {optimal_k}\n")

# ═══════════════════════════════════════════════════════════════════════════════
# PRE-PROCESSING: Isolation Forest Anomaly Detection
# ═══════════════════════════════════════════════════════════════════════════════
print("─" * 50)
print("ANOMALY DETECTION: Isolation Forest (contamination=0.05)")
print("─" * 50)

iso_forest = IsolationForest(
    contamination=0.05,       # Flag top 5% as anomalies
    n_estimators=200,         # Number of isolation trees
    max_samples='auto',       # Subsample size
    random_state=42,
    n_jobs=-1
)

# Fit and predict: -1 = anomaly, 1 = normal
anomaly_labels = iso_forest.fit_predict(df_scaled)
anomaly_scores = iso_forest.decision_function(df_scaled)

# Convert: -1 (anomaly) → True, 1 (normal) → False
is_anomaly = anomaly_labels == -1
n_anomalies = is_anomaly.sum()
n_normal = (~is_anomaly).sum()

print(f"\n  📊 Anomaly Detection Results:")
print(f"  {'─' * 40}")
print(f"  Total Students:    {len(df_scaled)}")
print(f"  Normal Students:   {n_normal} ({n_normal/len(df_scaled)*100:.1f}%)")
print(f"  Anomalous Students: {n_anomalies} ({n_anomalies/len(df_scaled)*100:.1f}%)")

# Analyze top feature deviations of anomalous students
print(f"\n  📋 Top 5 Feature Deviations of Anomalous Students:")
print(f"  {'─' * 50}")

anomaly_means = df_scaled[is_anomaly].mean()
normal_means = df_scaled[~is_anomaly].mean()
normal_stds = df_scaled[~is_anomaly].std().replace(0, 1)

# Z-score of anomaly group vs normal group
anomaly_z = ((anomaly_means - normal_means) / normal_stds).abs()
top_anomaly_features = anomaly_z.nlargest(5)

for rank, (feature, z_val) in enumerate(top_anomaly_features.items(), 1):
    anom_val = anomaly_means[feature]
    norm_val = normal_means[feature]
    direction = "↑ HIGHER" if anom_val > norm_val else "↓ LOWER"
    print(f"    {rank}. {feature}")
    print(f"       {direction} than normal (|z| = {z_val:.3f})")

# Save anomaly students to CSV
anomaly_df = df_clean[is_anomaly].copy()
anomaly_df['anomaly_score'] = anomaly_scores[is_anomaly]
anomaly_df.insert(0, 'Student_ID', anomaly_df.index + 1)
anomaly_df = anomaly_df.sort_values('anomaly_score', ascending=True)  # Most anomalous first
anomaly_df.to_csv(os.path.join(base_dir, "anomaly_students.csv"), index=False)
print(f"\n  ✅ Saved {n_anomalies} anomaly students to anomaly_students.csv")
print(f"     (sorted by anomaly score — most anomalous first)\n")

# ─── Apply PCA for t-SNE (faster computation) ────────────────────────────────
print("⏳ Preparing t-SNE coordinates for visualization...")
pca = PCA(n_components=10, random_state=42)
X_pca = pca.fit_transform(df_scaled)

tsne = TSNE(n_components=2, random_state=42, perplexity=30, max_iter=1000)
X_tsne = tsne.fit_transform(X_pca)
print("✅ t-SNE coordinates computed.\n")

# ═══════════════════════════════════════════════════════════════════════════════
# ALGORITHM 1: K-Means Clustering
# ═══════════════════════════════════════════════════════════════════════════════
print("─" * 50)
print(f"Algorithm 1: K-Means (K={optimal_k})")
print("─" * 50)

kmeans = KMeans(
    n_clusters=optimal_k,
    init='k-means++',
    n_init=10,
    max_iter=300,
    random_state=42
)
kmeans_labels = kmeans.fit_predict(df_scaled)

# Tag anomalies as cluster -2 (distinct from DBSCAN noise = -1)
kmeans_labels_with_anomaly = kmeans_labels.copy()
kmeans_labels_with_anomaly[is_anomaly] = -2

# Compute silhouette only on non-anomaly points
normal_mask = ~is_anomaly
kmeans_sil = silhouette_score(df_scaled[normal_mask], kmeans_labels[normal_mask])

print(f"\n  ✅ K-Means applied with K={optimal_k}")
print(f"  📊 Silhouette Score (excl. anomalies): {kmeans_sil:.4f}")
print(f"  📋 Cluster Sizes:")
for cluster_id in sorted(np.unique(kmeans_labels_with_anomaly)):
    count = np.sum(kmeans_labels_with_anomaly == cluster_id)
    pct = count / len(kmeans_labels_with_anomaly) * 100
    label = "ANOMALY" if cluster_id == -2 else f"Cluster {cluster_id}"
    marker = " ⚠️" if cluster_id == -2 else ""
    print(f"     {label}: {count:5d} students ({pct:.1f}%){marker}")

# Save K-Means labels (original without anomaly tagging, for compatibility)
pd.DataFrame({'KMeans_Cluster': kmeans_labels}).to_csv(
    os.path.join(base_dir, "kmeans_labels.csv"), index=False)

# ═══════════════════════════════════════════════════════════════════════════════
# ALGORITHM 2: DBSCAN Clustering
# ═══════════════════════════════════════════════════════════════════════════════
print(f"\n{'─' * 50}")
print("Algorithm 2: DBSCAN Clustering")
print("─" * 50)

print("\n  ⏳ Finding optimal eps using k-distance method...")
neighbors = NearestNeighbors(n_neighbors=5)
neighbors_fit = neighbors.fit(df_scaled)

# ─── K-Distance Graph for eps selection ──────────────────────────────────────
fig_kdist, ax_kdist = plt.subplots(figsize=(10, 5))
distances_sorted = np.sort(neighbors_fit.kneighbors(df_scaled)[0][:, -1])
ax_kdist.plot(range(len(distances_sorted)), distances_sorted, 'b-', linewidth=1.5)
ax_kdist.set_xlabel('Points (sorted)', fontsize=12, fontweight='bold')
ax_kdist.set_ylabel('5th Nearest Neighbor Distance', fontsize=12, fontweight='bold')
ax_kdist.set_title('K-Distance Graph for DBSCAN eps Selection', fontsize=14, fontweight='bold')
plt.tight_layout()
plt.savefig(os.path.join(base_dir, "plots", "k_distance_graph.png"), dpi=150, bbox_inches='tight')
plt.close()
print("  ✅ K-distance graph saved to plots/k_distance_graph.png")
distances, indices = neighbors_fit.kneighbors(df_scaled)
distances = np.sort(distances[:, -1])

from kneed import KneeLocator
kl = KneeLocator(range(len(distances)), distances, curve='convex', direction='increasing')
optimal_eps = distances[kl.knee] if kl.knee else np.percentile(distances, 90)
optimal_min_samples = 5

print(f"  📐 Optimal eps: {optimal_eps:.4f}")
print(f"  📐 min_samples: {optimal_min_samples}")

dbscan = DBSCAN(
    eps=optimal_eps,
    min_samples=optimal_min_samples,
    n_jobs=-1
)
dbscan_labels = dbscan.fit_predict(df_scaled)

n_clusters_dbscan = len(set(dbscan_labels)) - (1 if -1 in dbscan_labels else 0)
n_noise = np.sum(dbscan_labels == -1)

if n_clusters_dbscan < 2:
    print(f"\n  ⚠️  DBSCAN found only {n_clusters_dbscan} cluster(s) with eps={optimal_eps:.4f}")
    print("  🔄 Trying alternative eps values...")

    for eps_multiplier in [0.8, 0.6, 1.2, 1.5, 2.0]:
        new_eps = optimal_eps * eps_multiplier
        dbscan_alt = DBSCAN(eps=new_eps, min_samples=optimal_min_samples, n_jobs=-1)
        dbscan_labels_alt = dbscan_alt.fit_predict(df_scaled)
        n_alt = len(set(dbscan_labels_alt)) - (1 if -1 in dbscan_labels_alt else 0)
        if n_alt >= 2:
            dbscan_labels = dbscan_labels_alt
            optimal_eps = new_eps
            n_clusters_dbscan = n_alt
            n_noise = np.sum(dbscan_labels == -1)
            print(f"  ✅ Found {n_clusters_dbscan} clusters with eps={optimal_eps:.4f}")
            break

if n_clusters_dbscan >= 2:
    mask = dbscan_labels != -1
    dbscan_sil = silhouette_score(df_scaled[mask], dbscan_labels[mask])
else:
    dbscan_sil = -1

print(f"\n  ✅ DBSCAN Results:")
print(f"  📊 Clusters Found: {n_clusters_dbscan}")
print(f"  📊 Noise Points: {n_noise} ({n_noise/len(dbscan_labels)*100:.1f}%)")
print(f"  📊 Silhouette Score: {dbscan_sil:.4f}")
print(f"  📋 Cluster Sizes:")
for cluster_id in sorted(np.unique(dbscan_labels)):
    count = np.sum(dbscan_labels == cluster_id)
    label = "Noise" if cluster_id == -1 else f"Cluster {cluster_id}"
    print(f"     {label}: {count:5d} students ({count/len(dbscan_labels)*100:.1f}%)")

pd.DataFrame({'DBSCAN_Cluster': dbscan_labels}).to_csv(
    os.path.join(base_dir, "dbscan_labels.csv"), index=False)

# ═══════════════════════════════════════════════════════════════════════════════
# ALGORITHM 3: Agglomerative Hierarchical Clustering
# ═══════════════════════════════════════════════════════════════════════════════
print(f"\n{'─' * 50}")
print(f"Algorithm 3: Agglomerative Hierarchical Clustering (K={optimal_k})")
print("─" * 50)

# ─── Dendrogram with Ward Linkage ────────────────────────────────────────────
print("\n  ⏳ Computing dendrogram (using subsample for speed)...")
sample_size = min(500, len(df_scaled))
rng = np.random.RandomState(42)
sample_idx = rng.choice(len(df_scaled), sample_size, replace=False)
Z = linkage(df_scaled.values[sample_idx], method='ward', metric='euclidean')

fig_dend, ax_dend = plt.subplots(figsize=(14, 6))
dendrogram(Z, truncate_mode='lastp', p=30, leaf_rotation=90, leaf_font_size=8,
           color_threshold=Z[-(optimal_k-1), 2], ax=ax_dend)
ax_dend.set_xlabel('Sample Index / Cluster Size', fontsize=12, fontweight='bold')
ax_dend.set_ylabel('Ward Distance', fontsize=12, fontweight='bold')
ax_dend.set_title(f'Agglomerative Dendrogram (Ward Linkage, K={optimal_k})',
                  fontsize=14, fontweight='bold')
ax_dend.axhline(y=Z[-(optimal_k-1), 2], color='red', linestyle='--', alpha=0.7,
                label=f'Cut for K={optimal_k}')
ax_dend.legend(fontsize=11)
plt.tight_layout()
plt.savefig(os.path.join(base_dir, "plots", "dendrogram.png"), dpi=150, bbox_inches='tight')
plt.close()
print("  ✅ Dendrogram saved to plots/dendrogram.png")

agglo = AgglomerativeClustering(
    n_clusters=optimal_k,
    linkage='ward'
)
agglo_labels = agglo.fit_predict(df_scaled)
agglo_sil = silhouette_score(df_scaled[normal_mask], agglo_labels[normal_mask])

print(f"\n  ✅ Agglomerative Clustering applied with K={optimal_k}")
print(f"  📊 Silhouette Score (excl. anomalies): {agglo_sil:.4f}")
print(f"  📋 Cluster Sizes:")
for cluster_id in sorted(np.unique(agglo_labels)):
    count = np.sum(agglo_labels == cluster_id)
    pct = count / len(agglo_labels) * 100
    print(f"     Cluster {cluster_id}: {count:5d} students ({pct:.1f}%)")

pd.DataFrame({'Agglo_Cluster': agglo_labels}).to_csv(
    os.path.join(base_dir, "agglo_labels.csv"), index=False)

# ═══════════════════════════════════════════════════════════════════════════════
# ALGORITHM 4: Gaussian Mixture Model (GMM)
# ═══════════════════════════════════════════════════════════════════════════════
print(f"\n{'─' * 50}")
print(f"Algorithm 4: Gaussian Mixture Model (K={optimal_k})")
print("─" * 50)

# Test BIC for multiple component counts to validate optimal K
print("\n  ⏳ BIC validation for component selection...")
bic_scores = []
for n_comp in range(2, 8):
    gmm_test = GaussianMixture(n_components=n_comp, covariance_type='full',
                                random_state=42, n_init=5)
    gmm_test.fit(df_scaled)
    bic_scores.append((n_comp, gmm_test.bic(df_scaled)))
    print(f"     Components={n_comp}: BIC={gmm_test.bic(df_scaled):.1f}")

best_bic_k = min(bic_scores, key=lambda x: x[1])[0]
print(f"  📊 Best BIC at K={best_bic_k}")

# Apply GMM with optimal K
gmm = GaussianMixture(
    n_components=optimal_k,
    covariance_type='full',
    random_state=42,
    n_init=10
)
gmm_labels = gmm.fit_predict(df_scaled)
gmm_sil = silhouette_score(df_scaled[normal_mask], gmm_labels[normal_mask])

print(f"\n  ✅ GMM applied with K={optimal_k}")
print(f"  📊 Silhouette Score (excl. anomalies): {gmm_sil:.4f}")
print(f"  📊 BIC Score: {gmm.bic(df_scaled):.1f}")
print(f"  📋 Cluster Sizes:")
for cluster_id in sorted(np.unique(gmm_labels)):
    count = np.sum(gmm_labels == cluster_id)
    pct = count / len(gmm_labels) * 100
    print(f"     Cluster {cluster_id}: {count:5d} students ({pct:.1f}%)")

pd.DataFrame({'GMM_Cluster': gmm_labels}).to_csv(
    os.path.join(base_dir, "gmm_labels.csv"), index=False)

# ═══════════════════════════════════════════════════════════════════════════════
# COMPARISON: All Four Algorithms — Silhouette, Davies-Bouldin, Calinski-Harabasz
# ═══════════════════════════════════════════════════════════════════════════════
print(f"\n{'=' * 70}")
print("  ALGORITHM COMPARISON")
print(f"{'=' * 70}")

# Compute all 3 metrics for each algorithm
def safe_metrics(data, labels, mask):
    """Compute metrics only on valid (non-anomaly) points."""
    d, l = data[mask], labels[mask]
    valid = len(np.unique(l)) >= 2
    return (
        silhouette_score(d, l) if valid else -1,
        davies_bouldin_score(d, l) if valid else 99,
        calinski_harabasz_score(d, l) if valid else 0
    )

km_sil, km_db, km_ch = safe_metrics(df_scaled, kmeans_labels, normal_mask)
db_sil2, db_db, db_ch = safe_metrics(df_scaled, dbscan_labels, dbscan_labels != -1) if n_clusters_dbscan >= 2 else (dbscan_sil, 99, 0)
ag_sil, ag_db, ag_ch = safe_metrics(df_scaled, agglo_labels, normal_mask)
gm_sil, gm_db, gm_ch = safe_metrics(df_scaled, gmm_labels, normal_mask)

comparison_data = {
    'Algorithm': ['K-Means', 'DBSCAN', 'Agglomerative', 'GMM'],
    'Silhouette': [km_sil, db_sil2, ag_sil, gm_sil],
    'Davies-Bouldin': [km_db, db_db, ag_db, gm_db],
    'Calinski-Harabasz': [km_ch, db_ch, ag_ch, gm_ch],
    'Clusters': [optimal_k, n_clusters_dbscan, optimal_k, optimal_k]
}
comparison_df = pd.DataFrame(comparison_data)
print(f"\n{comparison_df.to_string(index=False)}\n")

# Determine best algorithm by silhouette (higher = better)
best_algo = comparison_df.loc[comparison_df['Silhouette'].idxmax(), 'Algorithm']
print(f"  🏆 Best Algorithm: {best_algo} (highest Silhouette Score)")
print(f"  ⚠️  Anomalies Detected: {n_anomalies} students (tagged as cluster -2)\n")

# ═══════════════════════════════════════════════════════════════════════════════
# VISUALIZATION: t-SNE Plots for Each Algorithm
# ═══════════════════════════════════════════════════════════════════════════════

fig, axes = plt.subplots(2, 2, figsize=(18, 14))
cmap = plt.cm.Set2
normal_pts = ~is_anomaly

# ─── Plot 1: K-Means ─────────────────────────────────────────────────────────
ax1 = axes[0, 0]
ax1.scatter(X_tsne[normal_pts, 0], X_tsne[normal_pts, 1],
            c=kmeans_labels[normal_pts], cmap=cmap, alpha=0.6, s=12, edgecolors='none')
ax1.scatter(X_tsne[is_anomaly, 0], X_tsne[is_anomaly, 1],
            c='red', marker='x', s=25, alpha=0.8, linewidths=1, label=f'Anomalies ({n_anomalies})')
ax1.set_title(f'K-Means (K={optimal_k})\nSil: {km_sil:.4f}', fontsize=13, fontweight='bold')
ax1.set_xlabel('t-SNE 1', fontsize=11); ax1.set_ylabel('t-SNE 2', fontsize=11)
ax1.legend(fontsize=9)

# ─── Plot 2: DBSCAN ──────────────────────────────────────────────────────────
ax2 = axes[0, 1]
ax2.scatter(X_tsne[dbscan_labels != -1, 0], X_tsne[dbscan_labels != -1, 1],
            c=dbscan_labels[dbscan_labels != -1], cmap=cmap, alpha=0.6, s=12, edgecolors='none')
ax2.scatter(X_tsne[dbscan_labels == -1, 0], X_tsne[dbscan_labels == -1, 1],
            c='gray', alpha=0.2, s=8, label=f'Noise ({n_noise})')
ax2.set_title(f'DBSCAN (eps={optimal_eps:.2f})\nSil: {db_sil2:.4f}', fontsize=13, fontweight='bold')
ax2.set_xlabel('t-SNE 1', fontsize=11); ax2.set_ylabel('t-SNE 2', fontsize=11)
ax2.legend(fontsize=10)

# ─── Plot 3: Agglomerative ───────────────────────────────────────────────────
ax3 = axes[1, 0]
ax3.scatter(X_tsne[:, 0], X_tsne[:, 1], c=agglo_labels, cmap=cmap, alpha=0.6, s=12, edgecolors='none')
ax3.set_title(f'Agglomerative (K={optimal_k})\nSil: {ag_sil:.4f}', fontsize=13, fontweight='bold')
ax3.set_xlabel('t-SNE 1', fontsize=11); ax3.set_ylabel('t-SNE 2', fontsize=11)

# ─── Plot 4: GMM ─────────────────────────────────────────────────────────────
ax4 = axes[1, 1]
ax4.scatter(X_tsne[:, 0], X_tsne[:, 1], c=gmm_labels, cmap=cmap, alpha=0.6, s=12, edgecolors='none')
ax4.set_title(f'GMM (K={optimal_k})\nSil: {gm_sil:.4f}', fontsize=13, fontweight='bold')
ax4.set_xlabel('t-SNE 1', fontsize=11); ax4.set_ylabel('t-SNE 2', fontsize=11)

plt.suptitle('Clustering Algorithms Comparison — t-SNE Visualization',
             fontsize=16, fontweight='bold', y=1.02)
plt.tight_layout()
plt.savefig(os.path.join(base_dir, "plots", "clustering_comparison.png"), dpi=150, bbox_inches='tight')
plt.close()

# ─── Silhouette Score Bar Chart ──────────────────────────────────────────────
fig, ax = plt.subplots(figsize=(10, 5))
colors = ['#2196F3', '#FF9800', '#4CAF50', '#9C27B0']
bars = ax.bar(comparison_df['Algorithm'], comparison_df['Silhouette'],
              color=colors, alpha=0.85, edgecolor='white', linewidth=2)
for bar, score in zip(bars, comparison_df['Silhouette']):
    ax.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 0.005,
            f'{score:.4f}', ha='center', va='bottom', fontsize=12, fontweight='bold')
ax.set_ylabel('Silhouette Score', fontsize=12, fontweight='bold')
ax.set_title('Algorithm Comparison — Silhouette Scores', fontsize=14, fontweight='bold')
ax.set_ylim(0, max(comparison_df['Silhouette'].max(), 0.05) * 1.3)
plt.tight_layout()
plt.savefig(os.path.join(base_dir, "plots", "silhouette_comparison.png"), dpi=150, bbox_inches='tight')
plt.close()

print(f"\n{'=' * 70}")
print("  [STEP 5 COMPLETE] ✅")
print(f"{'=' * 70}")
print(f"\n📁 Output Files:")
print(f"   • anomaly_students.csv               — {n_anomalies} anomalous students")
print(f"   • kmeans_labels.csv                   — K-Means cluster assignments")
print(f"   • dbscan_labels.csv                   — DBSCAN cluster assignments")
print(f"   • agglo_labels.csv                    — Agglomerative cluster assignments")
print(f"   • gmm_labels.csv                      — GMM cluster assignments")
print(f"   • plots/k_distance_graph.png          — DBSCAN eps selection")
print(f"   • plots/dendrogram.png                — Hierarchical dendrogram")
print(f"   • plots/clustering_comparison.png     — 2×2 comparison")
print(f"   • plots/silhouette_comparison.png     — Silhouette bar chart")
