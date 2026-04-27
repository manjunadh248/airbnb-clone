"""
==============================================================================
STEP 2: Data Preprocessing & Smart Feature Engineering
==============================================================================
- Handle missing values
- Encode categorical variables using LabelEncoder
- Engineer 4 custom features with domain insight
- Analyze correlations of engineered features with dropout label
- Normalize numerical features using StandardScaler
- Output a clean DataFrame ready for clustering
==============================================================================
"""

# ─── Import Libraries ───────────────────────────────────────────────────────
import pandas as pd                                  # DataFrame operations
import numpy as np                                   # Numerical operations
from sklearn.preprocessing import LabelEncoder, StandardScaler  # Encoding + scaling
import matplotlib                                    # Plotting backend
matplotlib.use('Agg')                                # Non-interactive backend for saving plots
import matplotlib.pyplot as plt                      # Plotting library
import seaborn as sns                                # Statistical visualizations
import os                                            # File path operations
import warnings                                      # Warning suppression
warnings.filterwarnings('ignore')                    # Suppress sklearn/pandas warnings

# ─── Load the Dataset ────────────────────────────────────────────────────────
print("=" * 70)
print("  STEP 2: DATA PREPROCESSING & SMART FEATURE ENGINEERING")
print("=" * 70)

base_dir = os.path.dirname(__file__)
data_path = os.path.join(base_dir, "dataset.csv")
df = pd.read_csv(data_path)
print(f"\n📊 Original Dataset Shape: {df.shape}")
print(f"📋 Columns: {list(df.columns)}\n")

# ─── Step 2.1: Handle Missing Values ─────────────────────────────────────────
print("─" * 50)
print("Step 2.1: Handling Missing Values")
print("─" * 50)

missing_count = df.isnull().sum()
total_missing = missing_count.sum()

if total_missing == 0:
    print("✅ No missing values found! Dataset is complete.\n")
else:
    print(f"⚠️  Found {total_missing} missing values across columns:\n")
    print(missing_count[missing_count > 0])

    # Fill numerical missing values with median (robust to outliers)
    numerical_cols = df.select_dtypes(include=[np.number]).columns
    for col in numerical_cols:
        if df[col].isnull().sum() > 0:
            median_val = df[col].median()
            df[col].fillna(median_val, inplace=True)
            print(f"   Filled '{col}' with median: {median_val}")

    # Fill categorical missing values with mode
    categorical_cols = df.select_dtypes(include=['object']).columns
    for col in categorical_cols:
        if df[col].isnull().sum() > 0:
            mode_val = df[col].mode()[0]
            df[col].fillna(mode_val, inplace=True)
            print(f"   Filled '{col}' with mode: {mode_val}")

    print(f"\n✅ All missing values handled. Remaining: {df.isnull().sum().sum()}\n")

# ─── Step 2.2: Identify and Remove Irrelevant Columns ────────────────────────
print("─" * 50)
print("Step 2.2: Removing Irrelevant Columns")
print("─" * 50)

# The 'Target' column contains labels (Dropout/Enrolled/Graduate)
# We save it separately for later analysis but remove from clustering features
target_col = 'Target'
if target_col in df.columns:
    # Save the target labels for later use in profiling
    target_labels = df[target_col].copy()
    target_labels.to_csv(os.path.join(base_dir, "target_labels.csv"), index=False)
    print(f"✅ Saved '{target_col}' labels to target_labels.csv")
    print(f"   Distribution:\n{target_labels.value_counts().to_string()}\n")

    # Remove target from features
    df.drop(columns=[target_col], inplace=True)
    print(f"✅ Removed '{target_col}' column from features\n")

print(f"📊 Dataset shape after removal: {df.shape}\n")

# ─── Step 2.3: Encode Categorical Variables ───────────────────────────────────
print("─" * 50)
print("Step 2.3: Encoding Categorical Variables")
print("─" * 50)

categorical_cols = df.select_dtypes(include=['object']).columns.tolist()

if len(categorical_cols) > 0:
    print(f"📋 Found {len(categorical_cols)} categorical column(s): {categorical_cols}\n")
    le = LabelEncoder()
    for col in categorical_cols:
        df[col] = le.fit_transform(df[col].astype(str))
        print(f"   ✅ Encoded '{col}' → {df[col].nunique()} unique encoded values")
    print()
else:
    print("✅ No categorical columns found (all features are numerical).\n")
    print("   Note: Some columns like 'Marital Status', 'Course', 'Application mode'")
    print("   are encoded as integers but represent categories.\n")

# ═══════════════════════════════════════════════════════════════════════════════
# Step 2.3b: OUTLIER REMOVAL USING IQR METHOD
# ═══════════════════════════════════════════════════════════════════════════════
print("─" * 50)
print("Step 2.3b: Outlier Removal (IQR Method)")
print("─" * 50)

# Select only continuous numerical columns for IQR (skip binary/ordinal encoded ones)
# Binary features (0/1) should not be filtered by IQR
binary_cols = [c for c in df.columns if df[c].nunique() <= 2]  # Identify binary columns
continuous_cols = [c for c in df.select_dtypes(include=[np.number]).columns
                   if c not in binary_cols]  # Only continuous features

print(f"\n  📊 Continuous features for IQR check: {len(continuous_cols)}")
print(f"  📊 Skipping {len(binary_cols)} binary features\n")

# Count rows before outlier removal
rows_before = len(df)

# Apply IQR-based outlier detection with 1.5x multiplier (standard threshold)
outlier_mask = pd.Series([False] * len(df))  # Initialize: no outliers

for col in continuous_cols:
    Q1 = df[col].quantile(0.25)               # First quartile (25th percentile)
    Q3 = df[col].quantile(0.75)               # Third quartile (75th percentile)
    IQR = Q3 - Q1                              # Interquartile range
    lower_bound = Q1 - 1.5 * IQR              # Lower fence
    upper_bound = Q3 + 1.5 * IQR              # Upper fence
    # Flag rows where this column exceeds the fences
    col_outliers = (df[col] < lower_bound) | (df[col] > upper_bound)
    outlier_mask = outlier_mask | col_outliers  # Accumulate across all columns

# Count outliers per column (for reporting) — top 5 most affected
outlier_counts = {}
for col in continuous_cols:
    Q1 = df[col].quantile(0.25)
    Q3 = df[col].quantile(0.75)
    IQR = Q3 - Q1
    count = ((df[col] < Q1 - 1.5 * IQR) | (df[col] > Q3 + 1.5 * IQR)).sum()
    if count > 0:
        outlier_counts[col] = count

# Sort and print top columns with outliers
sorted_outliers = sorted(outlier_counts.items(), key=lambda x: x[1], reverse=True)
print("  📋 Top 5 columns with most outliers:")
for col_name, count in sorted_outliers[:5]:
    print(f"     • {col_name}: {count} outliers")

# Remove outlier rows from the DataFrame
df = df[~outlier_mask].reset_index(drop=True)  # Remove flagged rows, reset index
rows_after = len(df)
rows_removed = rows_before - rows_after

print(f"\n  📊 Rows before IQR removal: {rows_before}")
print(f"  📊 Rows after IQR removal:  {rows_after}")
print(f"  📊 Rows removed:            {rows_removed} ({rows_removed/rows_before*100:.1f}%)")

# Also filter target_labels to match the same rows
target_labels = target_labels[~outlier_mask.values[:len(target_labels)]].reset_index(drop=True)
print(f"  ✅ Target labels also filtered to match ({len(target_labels)} rows)\n")

# Re-save the filtered target labels
target_labels.to_csv(os.path.join(base_dir, "target_labels.csv"), index=False)
print(f"  ✅ Updated target_labels.csv after outlier removal")

# ═══════════════════════════════════════════════════════════════════════════════
# Step 2.4: SMART FEATURE ENGINEERING (4 Custom Features)
# ═══════════════════════════════════════════════════════════════════════════════
print("─" * 50)
print("Step 2.4: Smart Feature Engineering")
print("─" * 50)
print("\n🧠 Creating 4 domain-driven engineered features...\n")

# ────────────────────────────────────────────────────────────────────────────
# Feature 1: ACADEMIC MOMENTUM
# Measures improvement or decline in grades between semesters.
# Positive = improving trend, Negative = declining trajectory.
# Formula: academic_momentum = sem2_grade - sem1_grade
# ────────────────────────────────────────────────────────────────────────────
sem1_grade_col = 'Curricular units 1st sem (grade)'
sem2_grade_col = 'Curricular units 2nd sem (grade)'

df['academic_momentum'] = df[sem2_grade_col] - df[sem1_grade_col]

print("  ✅ Feature 1: academic_momentum")
print(f"     Formula: sem2_grade − sem1_grade")
print(f"     Range: [{df['academic_momentum'].min():.2f}, {df['academic_momentum'].max():.2f}]")
print(f"     Mean: {df['academic_momentum'].mean():.4f}  |  Std: {df['academic_momentum'].std():.4f}")
print(f"     Interpretation: >0 = improving, <0 = declining\n")

# ────────────────────────────────────────────────────────────────────────────
# Feature 2: ENGAGEMENT RATIO
# Measures the efficiency of course completion — what fraction of enrolled
# units were approved. High ratio = high engagement, low = disengaged.
# Uses Sem2 as it reflects the most recent behavior.
# Formula: engagement_ratio = approved_units / (enrolled_units + 1)
# ────────────────────────────────────────────────────────────────────────────
sem2_approved_col = 'Curricular units 2nd sem (approved)'
sem2_enrolled_col = 'Curricular units 2nd sem (enrolled)'

df['engagement_ratio'] = df[sem2_approved_col] / (df[sem2_enrolled_col] + 1)

print("  ✅ Feature 2: engagement_ratio")
print(f"     Formula: sem2_approved / (sem2_enrolled + 1)")
print(f"     Range: [{df['engagement_ratio'].min():.4f}, {df['engagement_ratio'].max():.4f}]")
print(f"     Mean: {df['engagement_ratio'].mean():.4f}  |  Std: {df['engagement_ratio'].std():.4f}")
print(f"     Interpretation: higher = more efficient learning\n")

# ────────────────────────────────────────────────────────────────────────────
# Feature 3: FINANCIAL STRESS INDEX
# Composite score capturing financial pressure from multiple indicators.
# Each component is binary (0 or 1), so the index ranges from 0 to 3.
# 0 = no financial stress, 3 = maximum financial pressure.
# Formula: debtor + (1 - tuition_up_to_date) + (1 - scholarship_holder)
# ────────────────────────────────────────────────────────────────────────────
debtor_col = 'Debtor'
tuition_col = 'Tuition fees up to date'
scholarship_col = 'Scholarship holder'

df['financial_stress_index'] = (
    df[debtor_col]
    + (1 - df[tuition_col])
    + (1 - df[scholarship_col])
)

print("  ✅ Feature 3: financial_stress_index")
print(f"     Formula: debtor + (1 − tuition_up_to_date) + (1 − scholarship_holder)")
print(f"     Range: [{df['financial_stress_index'].min():.0f}, {df['financial_stress_index'].max():.0f}]")
print(f"     Mean: {df['financial_stress_index'].mean():.4f}  |  Std: {df['financial_stress_index'].std():.4f}")
print(f"     Interpretation: 0 = no stress, 3 = maximum pressure\n")

# ────────────────────────────────────────────────────────────────────────────
# Feature 4: EARLY PERFORMANCE SCORE
# Weighted average combining 1st semester grades with approval rate.
# Captures both the quality (grade) and throughput (approval %) of early
# academic performance — a strong leading indicator of dropout risk.
# Formula: sem1_grade × (sem1_approved / (sem1_enrolled + 1))
# ────────────────────────────────────────────────────────────────────────────
sem1_approved_col = 'Curricular units 1st sem (approved)'
sem1_enrolled_col = 'Curricular units 1st sem (enrolled)'

df['early_performance_score'] = (
    df[sem1_grade_col]
    * (df[sem1_approved_col] / (df[sem1_enrolled_col] + 1))
)

print("  ✅ Feature 4: early_performance_score")
print(f"     Formula: sem1_grade × (sem1_approved / (sem1_enrolled + 1))")
print(f"     Range: [{df['early_performance_score'].min():.2f}, {df['early_performance_score'].max():.2f}]")
print(f"     Mean: {df['early_performance_score'].mean():.4f}  |  Std: {df['early_performance_score'].std():.4f}")
print(f"     Interpretation: higher = stronger early academic foundation\n")

# ════════════════════════════════════════════════════════════════════════════
# Step 2.4b: Correlation Analysis of Engineered Features vs Dropout
# ════════════════════════════════════════════════════════════════════════════
print("─" * 50)
print("Step 2.4b: Feature Correlation with Dropout Label")
print("─" * 50)

# Encode target for correlation analysis (Dropout=1, else=0)
dropout_binary = (target_labels == 'Dropout').astype(int)

engineered_features = [
    'academic_momentum',
    'engagement_ratio',
    'financial_stress_index',
    'early_performance_score'
]

print(f"\n  📊 Pearson Correlation with Dropout (1 = Dropout, 0 = Other):\n")
print(f"  {'Feature':<30s}  {'Correlation':>12s}  {'Strength':>12s}")
print(f"  {'─'*30}  {'─'*12}  {'─'*12}")

for feat in engineered_features:
    corr = df[feat].corr(dropout_binary)
    abs_corr = abs(corr)

    if abs_corr > 0.5:
        strength = "🔴 STRONG"
    elif abs_corr > 0.3:
        strength = "🟠 MODERATE"
    elif abs_corr > 0.15:
        strength = "🟡 WEAK"
    else:
        strength = "⚪ MINIMAL"

    direction = "+" if corr > 0 else "−"
    print(f"  {feat:<30s}  {direction}{abs_corr:>11.4f}  {strength:>12s}")

print(f"\n  💡 Insight: Features with negative correlation reduce dropout risk;")
print(f"     positive correlation indicates risk factors.\n")

# Also show correlation between all engineered features
print("  📊 Inter-Feature Correlation Matrix (Engineered Features):\n")
eng_corr_matrix = df[engineered_features].corr()
print(eng_corr_matrix.round(3).to_string())
print()

# ═══════════════════════════════════════════════════════════════════════════════
# Step 2.4c: CORRELATION HEATMAP
# ═══════════════════════════════════════════════════════════════════════════════
print("─" * 50)
print("Step 2.4c: Correlation Heatmap")
print("─" * 50)

# Compute Pearson correlation matrix on all numerical features
corr_matrix = df.corr()  # Full pairwise correlation

# Create the heatmap figure
fig, ax = plt.subplots(figsize=(20, 16))  # Large figure for readability

# Generate a mask for the upper triangle (avoid redundant display)
mask = np.triu(np.ones_like(corr_matrix, dtype=bool))  # Upper triangle mask

# Plot heatmap with seaborn
sns.heatmap(
    corr_matrix,
    mask=mask,                              # Show only lower triangle
    annot=False,                            # Too many features for annotations
    cmap='RdBu_r',                          # Red-Blue diverging colormap
    center=0,                               # Center at 0 correlation
    linewidths=0.3,                         # Grid line width
    linecolor='white',                      # Grid line color
    vmin=-1, vmax=1,                        # Full correlation range
    cbar_kws={'label': 'Pearson Correlation Coefficient',
              'shrink': 0.8},               # Colorbar settings
    ax=ax
)

ax.set_title('Feature Correlation Heatmap — All Features',
             fontsize=16, fontweight='bold', pad=20)
plt.xticks(rotation=45, ha='right', fontsize=7)  # Rotate x-axis labels
plt.yticks(fontsize=7)                             # Y-axis label size

plt.tight_layout()
plots_dir = os.path.join(base_dir, "plots")
os.makedirs(plots_dir, exist_ok=True)  # Ensure plots directory exists
plt.savefig(os.path.join(plots_dir, "correlation_heatmap.png"),
            dpi=150, bbox_inches='tight')
plt.close()
print("\n  ✅ Correlation heatmap saved to plots/correlation_heatmap.png")

# Print top 10 most correlated feature pairs (excluding self-correlation)
print("\n  📊 Top 10 Most Correlated Feature Pairs:")
pairs = []
for i in range(len(corr_matrix.columns)):
    for j in range(i+1, len(corr_matrix.columns)):
        pairs.append((
            corr_matrix.columns[i],
            corr_matrix.columns[j],
            corr_matrix.iloc[i, j]
        ))
pairs.sort(key=lambda x: abs(x[2]), reverse=True)  # Sort by absolute correlation
for feat_a, feat_b, corr_val in pairs[:10]:
    print(f"     {feat_a[:30]:<30s} ↔ {feat_b[:30]:<30s}  r = {corr_val:+.3f}")
print()

# ─── Step 2.5: Normalize Numerical Features ──────────────────────────────────
print("─" * 50)
print("Step 2.5: Normalizing Numerical Features")
print("─" * 50)

feature_names = df.columns.tolist()
print(f"📋 Total features to normalize: {len(feature_names)} columns")
print(f"   (includes 4 engineered features)\n")

# Apply StandardScaler (zero mean, unit variance)
scaler = StandardScaler()
df_scaled = pd.DataFrame(
    scaler.fit_transform(df),
    columns=feature_names
)

print("✅ StandardScaler applied successfully!")
print(f"   Mean of features (should be ~0): {df_scaled.mean().mean():.6f}")
print(f"   Std of features (should be ~1):  {df_scaled.std().mean():.6f}\n")

# ─── Step 2.6: Display Feature Statistics ─────────────────────────────────────
print("─" * 50)
print("Step 2.6: Feature Analysis Summary")
print("─" * 50)

print("\n📊 FEATURE CATEGORIES FOR CLUSTERING:\n")

demographic_features = [
    'Marital Status', 'Gender', 'Age at enrollment',
    'Nacionality', 'Displaced', 'International'
]

academic_features = [
    'Course', 'Application mode', 'Application order',
    'Daytime/evening attendance', 'Previous qualification',
    'Previous qualification (grade)', 'Admission grade',
    'Curricular units 1st sem (credited)', 'Curricular units 1st sem (enrolled)',
    'Curricular units 1st sem (evaluations)', 'Curricular units 1st sem (approved)',
    'Curricular units 1st sem (grade)', 'Curricular units 1st sem (without evaluations)',
    'Curricular units 2nd sem (credited)', 'Curricular units 2nd sem (enrolled)',
    'Curricular units 2nd sem (evaluations)', 'Curricular units 2nd sem (approved)',
    'Curricular units 2nd sem (grade)', 'Curricular units 2nd sem (without evaluations)'
]

socioeconomic_features = [
    "Mother's qualification", "Father's qualification",
    "Mother's occupation", "Father's occupation",
    'Scholarship holder', 'Debtor', 'Tuition fees up to date',
    'Educational special needs'
]

economic_features = [
    'Unemployment rate', 'Inflation rate', 'GDP'
]

engineered_features_list = [
    'academic_momentum', 'engagement_ratio',
    'financial_stress_index', 'early_performance_score'
]

for category, features in [
    ("🧑 Demographic", demographic_features),
    ("📚 Academic Performance", academic_features),
    ("💰 Socio-economic", socioeconomic_features),
    ("📉 Macro-economic", economic_features),
    ("🧠 Engineered (Custom)", engineered_features_list)
]:
    available = [f for f in features if f in feature_names]
    print(f"   {category} ({len(available)} features):")
    for f in available:
        print(f"      • {f}")
    print()

# ─── Step 2.7: Save Preprocessed Data ────────────────────────────────────────
print("─" * 50)
print("Step 2.7: Saving Preprocessed Data")
print("─" * 50)

# Save the scaled/preprocessed DataFrame
output_path = os.path.join(base_dir, "preprocessed_data.csv")
df_scaled.to_csv(output_path, index=False)
print(f"\n✅ Preprocessed data saved to: {output_path}")
print(f"   Shape: {df_scaled.shape}")

# Also save the unscaled but cleaned data for profiling later
unscaled_path = os.path.join(base_dir, "cleaned_unscaled_data.csv")
df.to_csv(unscaled_path, index=False)
print(f"✅ Unscaled clean data saved to: {unscaled_path}")

# Save as clean_data.csv (required by Task 2 specification)
clean_data_path = os.path.join(base_dir, "clean_data.csv")
df.to_csv(clean_data_path, index=False)
print(f"✅ Clean data also saved to: {clean_data_path}")

print(f"\n{'=' * 70}")
print("  [STEP 2 COMPLETE] ✅ — Data preprocessed with 4 engineered features!")
print(f"{'=' * 70}")
print(f"\n📋 Summary:")
print(f"   • Original features: 36 → After engineering: {len(feature_names)}")
print(f"   • Outlier removal: IQR method applied on continuous features")
print(f"   • Engineered: academic_momentum, engagement_ratio,")
print(f"     financial_stress_index, early_performance_score")
print(f"   • Correlation heatmap saved to plots/")
print(f"   • All features StandardScaler-normalized")
print(f"\n📋 First 5 rows of preprocessed data:\n")
print(df_scaled.head().to_string())
