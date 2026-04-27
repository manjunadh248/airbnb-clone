"""
==============================================================================
STEP 3: Dimensionality Reduction — PCA, t-SNE & UMAP
==============================================================================
- Apply PCA on clean data
- Plot explained variance ratio (scree plot)
- Select number of components explaining 95% variance
- Apply t-SNE with parameters: n_components=2, perplexity=30, random_state=42
- Apply UMAP as alternative dimensionality reduction
- Create side-by-side visual comparison of PCA vs t-SNE vs UMAP
- Save all plots as PNG files
==============================================================================
"""

# ─── Import Libraries ───────────────────────────────────────────────────────
import pandas as pd                          # DataFrame operations
import numpy as np                           # Numerical computations
from sklearn.decomposition import PCA        # Principal Component Analysis
from sklearn.manifold import TSNE            # t-SNE for 2D visualization
import matplotlib                            # Plotting backend
matplotlib.use('Agg')                        # Non-interactive backend for saving
import matplotlib.pyplot as plt              # Plotting library
import seaborn as sns                        # Statistical visualizations
import os                                    # File path operations
import warnings                              # Warning suppression
warnings.filterwarnings('ignore')            # Suppress convergence warnings

# Try to import UMAP — graceful fallback if not installed
try:
    from umap import UMAP                    # UMAP dimensionality reduction
    UMAP_AVAILABLE = True                    # Flag: UMAP is available
    print("✅ UMAP library loaded successfully")
except ImportError:
    UMAP_AVAILABLE = False                   # Flag: UMAP not installed
    print("⚠️  UMAP not available — install with: pip install umap-learn")

# ─── Configure Plot Style ────────────────────────────────────────────────────
plt.style.use('seaborn-v0_8-darkgrid')       # Professional plot style
sns.set_palette("viridis")                    # Color palette for plots

# ─── Load Preprocessed Data ──────────────────────────────────────────────────
print("=" * 70)
print("  STEP 3: DIMENSIONALITY REDUCTION (PCA + t-SNE + UMAP)")
print("=" * 70)

base_dir = os.path.dirname(__file__)         # Project root directory
plots_dir = os.path.join(base_dir, "plots")  # Plots output directory
os.makedirs(plots_dir, exist_ok=True)        # Ensure plots dir exists

# Load the scaled/preprocessed data from Step 2
df_scaled = pd.read_csv(os.path.join(base_dir, "preprocessed_data.csv"))
# Load target labels for coloring the visualizations
target_labels = pd.read_csv(os.path.join(base_dir, "target_labels.csv"))['Target']

print(f"\n📊 Preprocessed Data Shape: {df_scaled.shape}")
print(f"📋 Target Distribution:\n{target_labels.value_counts().to_string()}\n")

# ═══════════════════════════════════════════════════════════════════════════════
# PART A: PCA — Principal Component Analysis
# ═══════════════════════════════════════════════════════════════════════════════
print("─" * 50)
print("Part A: PCA — Principal Component Analysis")
print("─" * 50)

# ─── Apply PCA with ALL components first to analyze full variance ────────────
pca_full = PCA(random_state=42)              # Full PCA (all components)
pca_full.fit(df_scaled)                      # Fit on the scaled data

# Compute cumulative explained variance across all components
cumulative_var = np.cumsum(pca_full.explained_variance_ratio_)

# Print cumulative explained variance for key component counts
print(f"\n📊 Cumulative Explained Variance by Component:")
for i in [1, 2, 3, 5, 10, 15, 20]:
    if i <= len(cumulative_var):
        print(f"   PC{i:2d}: {cumulative_var[i-1]*100:.2f}%")

# ─── Automatically select components for 95% variance ────────────────────────
n_components_95 = np.argmax(cumulative_var >= 0.95) + 1  # First index where ≥95%
print(f"\n🎯 Components needed for 95% variance: {n_components_95}")
print(f"   (Cumulative variance at PC{n_components_95}: {cumulative_var[n_components_95-1]*100:.2f}%)")

# ─── Apply PCA to reduce to 10 components (for clustering input) ─────────────
n_components = 10                            # Standard reduction for clustering
pca = PCA(n_components=n_components, random_state=42)
X_pca = pca.fit_transform(df_scaled)         # Transform data to 10 PCA components

print(f"\n✅ PCA applied: {df_scaled.shape[1]} features → {n_components} components")
print(f"   Total variance explained by {n_components} PCs: {sum(pca.explained_variance_ratio_)*100:.2f}%\n")

# Save PCA-reduced data to CSV for downstream steps
pca_df = pd.DataFrame(X_pca, columns=[f'PC{i+1}' for i in range(n_components)])
pca_df.to_csv(os.path.join(base_dir, "pca_data.csv"), index=False)
print("✅ PCA data saved to pca_data.csv\n")

# ─── Plot 1: Explained Variance Ratio Bar + Cumulative Line ──────────────────
fig, axes = plt.subplots(1, 2, figsize=(16, 6))

# --- Plot 1a: Individual + Cumulative Explained Variance (10 PCs) ---
ax1 = axes[0]
components = range(1, n_components + 1)      # Component numbers 1-10
# Bar chart of individual variance per component
bars = ax1.bar(components, pca.explained_variance_ratio_ * 100,
               color=sns.color_palette("viridis", n_components),
               alpha=0.8, edgecolor='white', linewidth=0.5)

# Overlay cumulative variance as a red line
cum_var = np.cumsum(pca.explained_variance_ratio_) * 100
ax1.plot(components, cum_var, 'ro-', linewidth=2, markersize=8, label='Cumulative')

# Add percentage labels on top of each bar
for bar, pct in zip(bars, pca.explained_variance_ratio_ * 100):
    ax1.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 0.5,
             f'{pct:.1f}%', ha='center', va='bottom', fontsize=8, fontweight='bold')

ax1.set_xlabel('Principal Component', fontsize=12, fontweight='bold')
ax1.set_ylabel('Explained Variance (%)', fontsize=12, fontweight='bold')
ax1.set_title('PCA — Explained Variance Ratio', fontsize=14, fontweight='bold')
ax1.legend(fontsize=11)
ax1.set_xticks(components)

# Add 95% variance line annotation
ax1.axhline(y=95, color='green', linestyle='--', alpha=0.5, label='95% threshold')

# --- Plot 1b: Scree Plot (Full Components) ---
ax2 = axes[1]
n_show = min(20, len(pca_full.explained_variance_ratio_))  # Show up to 20
ax2.plot(range(1, n_show + 1), pca_full.explained_variance_ratio_[:n_show] * 100,
         'bo-', linewidth=2, markersize=6)
ax2.axhline(y=5, color='red', linestyle='--', alpha=0.7, label='5% threshold')
ax2.fill_between(range(1, n_show + 1), pca_full.explained_variance_ratio_[:n_show] * 100,
                  alpha=0.3, color='steelblue')

# Mark the 95% variance component with a vertical line
ax2.axvline(x=n_components_95, color='green', linestyle='--', alpha=0.7,
            label=f'95% var at PC{n_components_95}')

ax2.set_xlabel('Principal Component', fontsize=12, fontweight='bold')
ax2.set_ylabel('Individual Variance (%)', fontsize=12, fontweight='bold')
ax2.set_title(f'Scree Plot — 95% Variance at PC{n_components_95}', fontsize=14, fontweight='bold')
ax2.legend(fontsize=11)

plt.tight_layout()
plt.savefig(os.path.join(plots_dir, "pca_variance.png"), dpi=150, bbox_inches='tight')
plt.close()
print("✅ PCA variance plot saved.\n")

# ═══════════════════════════════════════════════════════════════════════════════
# PART B: t-SNE — t-Distributed Stochastic Neighbor Embedding
# ═══════════════════════════════════════════════════════════════════════════════
print("─" * 50)
print("Part B: t-SNE — 2D Visualization")
print("─" * 50)

# Apply t-SNE on PCA-reduced data (10 components) for better performance
# Using PCA output as input is recommended to speed up t-SNE and reduce noise
print("\n⏳ Applying t-SNE (this may take a moment)...")
tsne = TSNE(
    n_components=2,        # Reduce to 2D for visualization
    random_state=42,       # Reproducibility — required by project spec
    perplexity=30,         # Balance between local and global structure
    max_iter=1000,         # Number of optimization iterations
)
X_tsne = tsne.fit_transform(X_pca)           # Fit and transform PCA data

print(f"✅ t-SNE applied: {X_pca.shape[1]} PCA components → 2D\n")

# Save t-SNE results with target labels for downstream visualization
tsne_df = pd.DataFrame(X_tsne, columns=['t-SNE_1', 't-SNE_2'])
tsne_df['Target'] = target_labels.values
tsne_df.to_csv(os.path.join(base_dir, "tsne_data.csv"), index=False)
print("✅ t-SNE data saved to tsne_data.csv\n")

# ═══════════════════════════════════════════════════════════════════════════════
# PART C: UMAP — Uniform Manifold Approximation and Projection
# ═══════════════════════════════════════════════════════════════════════════════
print("─" * 50)
print("Part C: UMAP — 2D Visualization")
print("─" * 50)

if UMAP_AVAILABLE:
    print("\n⏳ Applying UMAP...")
    umap_model = UMAP(
        n_components=2,             # Reduce to 2D
        n_neighbors=15,             # Number of neighbors for local structure
        min_dist=0.1,               # Minimum distance between embedded points
        metric='euclidean',         # Distance metric
        random_state=42             # Reproducibility
    )
    X_umap = umap_model.fit_transform(X_pca)  # Fit on PCA data for consistency

    print(f"✅ UMAP applied: {X_pca.shape[1]} PCA components → 2D\n")

    # Save UMAP results
    umap_df = pd.DataFrame(X_umap, columns=['UMAP_1', 'UMAP_2'])
    umap_df['Target'] = target_labels.values
    umap_df.to_csv(os.path.join(base_dir, "umap_data.csv"), index=False)
    print("✅ UMAP data saved to umap_data.csv\n")
else:
    X_umap = None
    print("⚠️  Skipping UMAP (not installed). Using PCA 2D as fallback.\n")

# ═══════════════════════════════════════════════════════════════════════════════
# PART D: Individual Scatter Plots for Each Method
# ═══════════════════════════════════════════════════════════════════════════════
print("─" * 50)
print("Part D: Individual t-SNE Scatter Plot")
print("─" * 50)

# ─── t-SNE Scatter Plot Colored by Original Target ───────────────────────────
fig, ax = plt.subplots(figsize=(12, 8))

# Create color mapping for the original target labels
target_colors = {'Dropout': '#FF4444', 'Enrolled': '#FFB347', 'Graduate': '#44BB44'}
colors = target_labels.map(target_colors)    # Map each student to their color

# Scatter plot with color coding
scatter = ax.scatter(
    X_tsne[:, 0], X_tsne[:, 1],              # t-SNE coordinates
    c=colors, alpha=0.6, s=15, edgecolors='none'  # Small semi-transparent dots
)

# Add legend with student counts per category
from matplotlib.patches import Patch          # For custom legend entries
legend_elements = [
    Patch(facecolor='#FF4444', label=f'Dropout ({(target_labels=="Dropout").sum()})'),
    Patch(facecolor='#FFB347', label=f'Enrolled ({(target_labels=="Enrolled").sum()})'),
    Patch(facecolor='#44BB44', label=f'Graduate ({(target_labels=="Graduate").sum()})')
]
ax.legend(handles=legend_elements, loc='best', fontsize=12,
          framealpha=0.9, edgecolor='gray')

ax.set_xlabel('t-SNE Dimension 1', fontsize=13, fontweight='bold')
ax.set_ylabel('t-SNE Dimension 2', fontsize=13, fontweight='bold')
ax.set_title('t-SNE 2D Visualization — Student Dropout Dataset\n(Colored by Original Labels)',
             fontsize=15, fontweight='bold')

plt.tight_layout()
plt.savefig(os.path.join(plots_dir, "tsne_visualization.png"), dpi=150, bbox_inches='tight')
plt.close()
print("✅ t-SNE visualization saved.\n")

# ═══════════════════════════════════════════════════════════════════════════════
# PART E: SIDE-BY-SIDE COMPARISON — PCA vs t-SNE vs UMAP
# ═══════════════════════════════════════════════════════════════════════════════
print("─" * 50)
print("Part E: Side-by-Side Comparison (PCA vs t-SNE vs UMAP)")
print("─" * 50)

# Create PCA 2D projection for the comparison
pca_2d = PCA(n_components=2, random_state=42)  # Reduce to just 2 PCs
X_pca_2d = pca_2d.fit_transform(df_scaled)      # Transform full data to 2D

# Set up 1×3 subplot figure for comparison
n_plots = 3 if UMAP_AVAILABLE else 2        # 3 panels if UMAP available
fig, axes = plt.subplots(1, n_plots, figsize=(7 * n_plots, 6))

# Ensure axes is always iterable
if n_plots == 2:
    axes = list(axes)

# Color mapping for all plots
colors = target_labels.map(target_colors)

# --- Panel 1: PCA 2D ---
ax1 = axes[0]
ax1.scatter(X_pca_2d[:, 0], X_pca_2d[:, 1], c=colors, alpha=0.5, s=10, edgecolors='none')
ax1.set_xlabel('PC1', fontsize=11, fontweight='bold')
ax1.set_ylabel('PC2', fontsize=11, fontweight='bold')
ax1.set_title(f'PCA (2 Components)\nVariance: {pca_2d.explained_variance_ratio_.sum()*100:.1f}%',
              fontsize=13, fontweight='bold')

# --- Panel 2: t-SNE ---
ax2 = axes[1]
ax2.scatter(X_tsne[:, 0], X_tsne[:, 1], c=colors, alpha=0.5, s=10, edgecolors='none')
ax2.set_xlabel('t-SNE 1', fontsize=11, fontweight='bold')
ax2.set_ylabel('t-SNE 2', fontsize=11, fontweight='bold')
ax2.set_title('t-SNE (perplexity=30)\nNon-linear local structure',
              fontsize=13, fontweight='bold')

# --- Panel 3: UMAP (if available) ---
if UMAP_AVAILABLE and X_umap is not None:
    ax3 = axes[2]
    ax3.scatter(X_umap[:, 0], X_umap[:, 1], c=colors, alpha=0.5, s=10, edgecolors='none')
    ax3.set_xlabel('UMAP 1', fontsize=11, fontweight='bold')
    ax3.set_ylabel('UMAP 2', fontsize=11, fontweight='bold')
    ax3.set_title('UMAP (n_neighbors=15)\nGlobal + local structure',
                  fontsize=13, fontweight='bold')

# Add shared legend
legend_elements = [
    Patch(facecolor='#FF4444', label='Dropout'),
    Patch(facecolor='#FFB347', label='Enrolled'),
    Patch(facecolor='#44BB44', label='Graduate')
]
axes[-1].legend(handles=legend_elements, loc='best', fontsize=10, framealpha=0.9)

plt.suptitle('Dimensionality Reduction Comparison — PCA vs t-SNE vs UMAP',
             fontsize=16, fontweight='bold', y=1.03)
plt.tight_layout()
plt.savefig(os.path.join(plots_dir, "dim_reduction_comparison.png"),
            dpi=150, bbox_inches='tight')
plt.close()
print("✅ Comparison plot saved to plots/dim_reduction_comparison.png\n")

# ═══════════════════════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════════════════════
print(f"{'=' * 70}")
print("  STEP 3 COMPLETE ✅")
print(f"{'=' * 70}")
print(f"\n📁 Output Files:")
print(f"   • pca_data.csv                    — PCA-reduced features (10 components)")
print(f"   • tsne_data.csv                   — t-SNE 2D coordinates")
if UMAP_AVAILABLE:
    print(f"   • umap_data.csv                   — UMAP 2D coordinates")
print(f"   • plots/pca_variance.png          — PCA explained variance plots")
print(f"   • plots/tsne_visualization.png    — t-SNE scatter plot")
print(f"   • plots/dim_reduction_comparison.png — PCA vs t-SNE vs UMAP comparison")
print(f"\n📊 Key Results:")
print(f"   • 95% variance at: PC{n_components_95}")
print(f"   • 10 PCs explain: {sum(pca.explained_variance_ratio_)*100:.1f}% variance")
