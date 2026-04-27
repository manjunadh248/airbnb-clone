"""
==============================================================================
MASTER RUNNER — Execute All Steps in Sequence
==============================================================================
Run this file to execute the entire project pipeline:
    python run_all.py
==============================================================================
"""

import subprocess
import sys
import os
import time

base_dir = os.path.dirname(os.path.abspath(__file__))

# Create plots directory
plots_dir = os.path.join(base_dir, "plots")
os.makedirs(plots_dir, exist_ok=True)

# Define all steps in order
steps = [
    ("Step 2: Data Preprocessing",        "step2_preprocessing.py"),
    ("Step 3: Dimensionality Reduction",   "step3_dimensionality_reduction.py"),
    ("Step 4: Finding Optimal Clusters",   "step4_optimal_clusters.py"),
    ("Step 5: Clustering Algorithms",      "step5_clustering.py"),
    ("Step 6: Cluster Profiling",          "step6_cluster_profiling.py"),
    ("Step 7: At-Risk Student Detection",  "step7_at_risk_detection.py"),
    ("Step 7B: Trajectory Analysis (DTW)", "step7b_trajectory_analysis.py"),
    ("Step 9: Project Report Generation",  "step9_report.py"),
    ("Step 10: Interview Preparation",     "step10_interview_prep.py"),
]

print("=" * 70)
print("  MASTER RUNNER — Dropout Risk Pattern Discovery")
print("  Running all steps sequentially...")
print("=" * 70)

# Check if dataset exists
dataset_path = os.path.join(base_dir, "dataset.csv")
if not os.path.exists(dataset_path):
    print("\n⚠️  dataset.csv not found! Running Step 1 first...")
    result = subprocess.run(
        [sys.executable, os.path.join(base_dir, "step1_download_data.py")],
        cwd=base_dir
    )
    if result.returncode != 0:
        print("❌ Step 1 failed! Cannot continue.")
        sys.exit(1)
    print()

# Use non-interactive matplotlib backend for batch execution
os.environ['MPLBACKEND'] = 'Agg'

total_start = time.time()
results = []

for step_name, script_file in steps:
    print(f"\n{'=' * 70}")
    print(f"  RUNNING: {step_name}")
    print(f"{'=' * 70}\n")
    
    script_path = os.path.join(base_dir, script_file)
    start_time = time.time()
    
    try:
        result = subprocess.run(
            [sys.executable, script_path],
            cwd=base_dir,
            timeout=300,  # 5 minute timeout per step
            env={**os.environ, 'MPLBACKEND': 'Agg'}
        )
        elapsed = time.time() - start_time
        
        if result.returncode == 0:
            results.append((step_name, "✅ SUCCESS", f"{elapsed:.1f}s"))
            print(f"\n  ✅ {step_name} completed in {elapsed:.1f}s")
        else:
            results.append((step_name, "❌ FAILED", f"{elapsed:.1f}s"))
            print(f"\n  ❌ {step_name} failed (exit code: {result.returncode})")
    
    except subprocess.TimeoutExpired:
        results.append((step_name, "⏰ TIMEOUT", "300s"))
        print(f"\n  ⏰ {step_name} timed out after 300s")
    
    except Exception as e:
        results.append((step_name, f"❌ ERROR: {str(e)[:50]}", "N/A"))
        print(f"\n  ❌ {step_name} error: {e}")

total_elapsed = time.time() - total_start

# ─── Summary ──────────────────────────────────────────────────────────────────
print(f"\n\n{'=' * 70}")
print("  EXECUTION SUMMARY")
print(f"{'=' * 70}\n")

print(f"  {'Step':<45s}  {'Status':<15s}  {'Time':>8s}")
print(f"  {'─'*45}  {'─'*15}  {'─'*8}")

for step_name, status, elapsed in results:
    print(f"  {step_name:<45s}  {status:<15s}  {elapsed:>8s}")

success_count = sum(1 for _, s, _ in results if "SUCCESS" in s)
print(f"\n  Total: {success_count}/{len(results)} steps succeeded")
print(f"  Total Time: {total_elapsed:.1f}s ({total_elapsed/60:.1f} minutes)")

print(f"\n  📁 Output Files:")
print(f"     • dataset.csv              — Raw dataset")
print(f"     • preprocessed_data.csv    — Scaled features")
print(f"     • pca_data.csv             — PCA components")
print(f"     • tsne_data.csv            — t-SNE coordinates")
print(f"     • kmeans_labels.csv        — Cluster assignments")
print(f"     • at_risk_students.csv     — Flagged students")
print(f"     • PROJECT_REPORT.md        — IEEE-style report")
print(f"     • INTERVIEW_PREPARATION.md — Interview Q&A guide")
print(f"     • plots/                   — All visualization plots")

print(f"\n  🖥️  To launch the dashboard:")
print(f"     streamlit run step8_dashboard.py")

print(f"\n{'=' * 70}")
print("  ALL STEPS COMPLETE! 🎉")
print(f"{'=' * 70}")
