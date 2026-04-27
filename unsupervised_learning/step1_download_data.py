"""
==============================================================================
STEP 1: Download & Understand the Student Dropout Dataset
==============================================================================
Dataset: Predict Students' Dropout and Academic Success
Source: UCI Machine Learning Repository (ID: 697)
Records: 4,424 | Features: 35 + 1 Target
==============================================================================
"""

# ─── Import Libraries ───────────────────────────────────────────────────────
from ucimlrepo import fetch_ucirepo
import pandas as pd
import os

# ─── Download Dataset from UCI Repository ────────────────────────────────────
print("=" * 70)
print("  DOWNLOADING: Student Dropout & Academic Success Dataset")
print("=" * 70)

dataset = fetch_ucirepo(id=697)

# Combine features and target into a single DataFrame
X = dataset.data.features
y = dataset.data.targets

df = pd.concat([X, y], axis=1)

# ─── Save to CSV ─────────────────────────────────────────────────────────────
output_path = os.path.join(os.path.dirname(__file__), "dataset.csv")
df.to_csv(output_path, index=False)
print(f"\n✅ Dataset saved to: {output_path}")
print(f"   Shape: {df.shape[0]} rows × {df.shape[1]} columns\n")

# ─── Dataset Overview ────────────────────────────────────────────────────────
print("=" * 70)
print("  DATASET OVERVIEW")
print("=" * 70)

print(f"\n📊 Total Records : {df.shape[0]}")
print(f"📊 Total Features: {df.shape[1] - 1} + 1 Target")
print(f"\n📋 Column Names:\n")
for i, col in enumerate(df.columns, 1):
    print(f"   {i:2d}. {col}")

# ─── Data Types ──────────────────────────────────────────────────────────────
print(f"\n{'=' * 70}")
print("  DATA TYPES")
print(f"{'=' * 70}\n")
print(df.dtypes.to_string())

# ─── Missing Values Check ────────────────────────────────────────────────────
print(f"\n{'=' * 70}")
print("  MISSING VALUES CHECK")
print(f"{'=' * 70}\n")
missing = df.isnull().sum()
if missing.sum() == 0:
    print("✅ No missing values found in the dataset!")
else:
    print(missing[missing > 0])

# ─── Basic Statistics ─────────────────────────────────────────────────────────
print(f"\n{'=' * 70}")
print("  BASIC STATISTICS")
print(f"{'=' * 70}\n")
print(df.describe().round(2).to_string())

# ─── Target Distribution ─────────────────────────────────────────────────────
print(f"\n{'=' * 70}")
print("  TARGET DISTRIBUTION")
print(f"{'=' * 70}\n")
target_col = df.columns[-1]  # Last column is 'Target'
print(df[target_col].value_counts().to_string())
print(f"\n{'=' * 70}")
print("  STEP 1 COMPLETE ✅")
print(f"{'=' * 70}")
