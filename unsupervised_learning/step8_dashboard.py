"""
==============================================================================
STEP 8: Advanced Streamlit Dashboard — Dropout Risk Pattern Discovery
==============================================================================
Premium UI with animations, glassmorphism, particles, and dynamic visuals.
9 tabs: Dataset Overview, Clusters, Profiles, At-Risk, Explorer,
        Risk Calculator, What-If Simulator, Anomaly Alerts, Trajectory View
Run with: python -m streamlit run step8_dashboard.py
"""

import streamlit as st
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.ensemble import IsolationForest
import plotly.express as px
import plotly.graph_objects as go
import os, warnings
warnings.filterwarnings('ignore')

st.set_page_config(page_title="🎓 Dropout Risk Discovery", page_icon="🎓",
                   layout="wide", initial_sidebar_state="expanded")

# ═══════════════════════════════════════════════════════════════════════════════
# ADVANCED CSS WITH ANIMATIONS
# ═══════════════════════════════════════════════════════════════════════════════
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800&display=swap');
*, *::before, *::after { box-sizing: border-box; }
html, body, [class*="css"] { font-family: 'Inter', sans-serif !important; }
.main .block-container { padding: 1.5rem 2rem 2rem; max-width: 1400px; }
[data-testid="stSidebar"] { background: linear-gradient(180deg, #0a0a1a 0%, #0d1b2a 40%, #1b2838 100%) !important; }
.stApp { background: linear-gradient(135deg, #0a0a1a 0%, #0d1117 40%, #0a192f 100%); }

.particles-bg { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; overflow: hidden; }
.particle { position: absolute; border-radius: 50%; background: radial-gradient(circle, rgba(233,69,96,0.4), transparent); animation: floatParticle 15s infinite ease-in-out; }
.particle:nth-child(1) { width:6px; height:6px; left:10%; top:20%; animation-delay:0s; animation-duration:20s; }
.particle:nth-child(2) { width:4px; height:4px; left:30%; top:60%; animation-delay:2s; animation-duration:25s; background: radial-gradient(circle, rgba(100,255,218,0.3), transparent); }
.particle:nth-child(3) { width:8px; height:8px; left:50%; top:30%; animation-delay:4s; animation-duration:18s; background: radial-gradient(circle, rgba(139,92,246,0.3), transparent); }
.particle:nth-child(4) { width:5px; height:5px; left:70%; top:70%; animation-delay:1s; animation-duration:22s; }
.particle:nth-child(5) { width:3px; height:3px; left:85%; top:15%; animation-delay:3s; animation-duration:28s; background: radial-gradient(circle, rgba(56,189,248,0.4), transparent); }
.particle:nth-child(6) { width:7px; height:7px; left:20%; top:80%; animation-delay:5s; animation-duration:16s; background: radial-gradient(circle, rgba(251,191,36,0.3), transparent); }
@keyframes floatParticle { 0%, 100% { transform: translate(0,0) scale(1); opacity:0.3; } 25% { transform: translate(80px,-120px) scale(1.5); opacity:0.7; } 50% { transform: translate(-60px,-200px) scale(1); opacity:0.4; } 75% { transform: translate(100px,-80px) scale(1.8); opacity:0.6; } }

.hero-header { background: linear-gradient(135deg, #0d1b2a 0%, #1b2838 30%, #0a192f 60%, #172a45 100%); border: 1px solid rgba(100,255,218,0.1); border-radius: 20px; padding: 2.5rem 3rem; margin-bottom: 2rem; position: relative; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05); animation: headerSlideIn 1s cubic-bezier(0.16,1,0.3,1) forwards; opacity: 0; transform: translateY(-30px); }
.hero-header::before { content:''; position:absolute; top:-50%; left:-50%; width:200%; height:200%; background: conic-gradient(from 0deg, transparent 0%, rgba(233,69,96,0.05) 25%, transparent 50%, rgba(100,255,218,0.05) 75%, transparent 100%); animation: rotateBg 20s linear infinite; }
.hero-header::after { content:''; position:absolute; top:0; left:0; right:0; bottom:0; background: linear-gradient(90deg, transparent, rgba(100,255,218,0.03), transparent); animation: shimmer 3s ease-in-out infinite; }
@keyframes headerSlideIn { to { opacity:1; transform:translateY(0); } }
@keyframes rotateBg { to { transform:rotate(360deg); } }
@keyframes shimmer { 0%,100% { opacity:0; } 50% { opacity:1; } }

.hero-header h1 { position:relative; z-index:1; font-family:'Outfit',sans-serif; font-size:2.8rem; font-weight:800; margin:0; background: linear-gradient(135deg,#e94560,#ff6b6b,#ee5a24,#e94560); background-size:300% 300%; -webkit-background-clip:text; -webkit-text-fill-color:transparent; animation: gradientShift 4s ease infinite; }
.hero-header .subtitle { position:relative; z-index:1; color:#8892b0; font-size:1.15rem; margin-top:0.5rem; font-weight:300; letter-spacing:0.5px; }
.hero-badge { position:relative; z-index:1; display:inline-block; background:rgba(100,255,218,0.1); border:1px solid rgba(100,255,218,0.2); color:#64ffda; padding:4px 14px; border-radius:20px; font-size:0.75rem; font-weight:600; letter-spacing:1px; margin-top:0.8rem; text-transform:uppercase; animation: badgePulse 2s ease-in-out infinite; }
@keyframes gradientShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
@keyframes badgePulse { 0%,100%{box-shadow:0 0 5px rgba(100,255,218,0.2)} 50%{box-shadow:0 0 20px rgba(100,255,218,0.4)} }

.glass-card { background:rgba(13,27,42,0.6); backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:1.8rem; text-align:center; position:relative; overflow:hidden; transition: all 0.4s cubic-bezier(0.16,1,0.3,1); animation: cardFadeIn 0.8s cubic-bezier(0.16,1,0.3,1) forwards; opacity:0; transform:translateY(20px); }
.glass-card:hover { transform:translateY(-8px) scale(1.02) !important; border-color:rgba(100,255,218,0.3); box-shadow:0 20px 40px rgba(0,0,0,0.4), 0 0 30px rgba(100,255,218,0.1); }
.glass-card::before { content:''; position:absolute; top:0; left:-100%; width:100%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.03),transparent); transition:left 0.6s ease; }
.glass-card:hover::before { left:100%; }
.card-icon { font-size:2.2rem; margin-bottom:0.5rem; display:block; filter:drop-shadow(0 0 10px rgba(100,255,218,0.3)); }
.card-value { font-family:'Outfit',sans-serif; font-size:2.8rem; font-weight:800; margin:0.3rem 0; line-height:1; }
.card-label { font-size:0.8rem; color:#64748b; text-transform:uppercase; letter-spacing:2px; font-weight:600; }
.card-sub { font-size:0.75rem; color:#64ffda; margin-top:0.5rem; font-weight:500; }
.card-d1{animation-delay:0.1s;} .card-d2{animation-delay:0.2s;} .card-d3{animation-delay:0.3s;} .card-d4{animation-delay:0.4s;}
@keyframes cardFadeIn { to { opacity:1; transform:translateY(0); } }
.accent-blue .card-value{color:#38bdf8;} .accent-purple .card-value{color:#a78bfa;} .accent-green .card-value{color:#64ffda;} .accent-red .card-value{color:#ff6b6b;}

.alert-banner { background:linear-gradient(135deg,rgba(255,68,68,0.15),rgba(255,107,107,0.08)); border:1px solid rgba(255,68,68,0.3); border-radius:14px; padding:1.2rem 2rem; text-align:center; margin:1.5rem 0; animation: alertPulse 3s ease-in-out infinite, fadeInUp 1s 0.5s forwards; opacity:0; transform:translateY(15px); }
.alert-banner .alert-text { color:#ff6b6b; font-weight:700; font-size:1.1rem; }
.alert-banner .alert-icon { font-size:1.4rem; animation:shake 0.8s ease-in-out infinite; }
@keyframes alertPulse { 0%,100%{box-shadow:0 0 10px rgba(255,68,68,0.1)} 50%{box-shadow:0 0 30px rgba(255,68,68,0.2)} }
@keyframes shake { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-5deg)} 75%{transform:rotate(5deg)} }
@keyframes fadeInUp { to { opacity:1; transform:translateY(0); } }

.section-title { font-family:'Outfit',sans-serif; font-size:1.6rem; font-weight:700; background:linear-gradient(135deg,#64ffda,#38bdf8); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin:1.5rem 0 1rem; padding-bottom:0.5rem; border-bottom:2px solid rgba(100,255,218,0.1); animation:fadeInUp 0.8s forwards; opacity:0; }
.stTabs [data-baseweb="tab-list"] { gap:4px; background:rgba(13,27,42,0.5); border-radius:12px; padding:4px; }
.stTabs [data-baseweb="tab"] { border-radius:10px; padding:10px 24px; font-weight:600; font-size:0.9rem; transition:all 0.3s ease; }
.stTabs [aria-selected="true"] { background:linear-gradient(135deg,rgba(100,255,218,0.15),rgba(56,189,248,0.15)) !important; border:1px solid rgba(100,255,218,0.2) !important; }

[data-testid="stSidebar"] .block-container { padding-top:2rem; }
.sidebar-brand { text-align:center; padding:1rem 0 1.5rem; }
.sidebar-brand h2 { font-family:'Outfit',sans-serif; font-size:1.3rem; background:linear-gradient(135deg,#64ffda,#38bdf8); -webkit-background-clip:text; -webkit-text-fill-color:transparent; font-weight:700; }
.sidebar-stat { background:rgba(100,255,218,0.05); border:1px solid rgba(100,255,218,0.1); border-radius:10px; padding:12px 16px; margin:8px 0; display:flex; justify-content:space-between; align-items:center; transition:all 0.3s ease; }
.sidebar-stat:hover { background:rgba(100,255,218,0.1); transform:translateX(4px); }
.sidebar-stat .stat-label { color:#8892b0; font-size:0.8rem; font-weight:500; }
.sidebar-stat .stat-value { color:#64ffda; font-weight:700; font-size:1rem; }

.anomaly-badge { display:inline-block; background:rgba(255,68,68,0.2); border:1px solid rgba(255,68,68,0.4); color:#ff6b6b; padding:3px 10px; border-radius:8px; font-size:0.75rem; font-weight:700; animation: alertPulse 2s infinite; }

.js-plotly-plot { border-radius:12px; overflow:hidden; }
::-webkit-scrollbar { width:6px; }
::-webkit-scrollbar-track { background:#0a0a1a; }
::-webkit-scrollbar-thumb { background:linear-gradient(180deg,#e94560,#64ffda); border-radius:3px; }
.animated-divider { height:2px; margin:2rem 0; background:linear-gradient(90deg,transparent,rgba(100,255,218,0.3),rgba(233,69,96,0.3),transparent); background-size:200% 100%; animation:dividerMove 3s linear infinite; }
@keyframes dividerMove { 0%{background-position:100% 0} 100%{background-position:-100% 0} }
.footer-glow { text-align:center; padding:2rem; color:#64748b; font-size:0.85rem; border-top:1px solid rgba(100,255,218,0.05); margin-top:2rem; }
.footer-glow a { color:#64ffda; text-decoration:none; }
</style>

<div class="particles-bg">
    <div class="particle"></div><div class="particle"></div><div class="particle"></div>
    <div class="particle"></div><div class="particle"></div><div class="particle"></div>
</div>
""", unsafe_allow_html=True)

# ═══════════════════════════════════════════════════════════════════════════════
# DATA LOADING
# ═══════════════════════════════════════════════════════════════════════════════
@st.cache_data
def load_and_process_data(uploaded_file=None):
    base_dir = os.path.dirname(__file__)
    if uploaded_file is not None:
        df = pd.read_csv(uploaded_file)
    else:
        data_path = os.path.join(base_dir, "dataset.csv")
        if os.path.exists(data_path):
            df = pd.read_csv(data_path)
        else:
            return None, None, None, None, None
    target_col = 'Target'
    if target_col in df.columns:
        target_labels = df[target_col].copy()
        df_features = df.drop(columns=[target_col])
    else:
        target_labels = pd.Series(['Unknown'] * len(df))
        df_features = df.copy()
    for col in df_features.select_dtypes(include=['object']).columns:
        df_features[col] = pd.factorize(df_features[col])[0]
    scaler = StandardScaler()
    df_scaled = pd.DataFrame(scaler.fit_transform(df_features), columns=df_features.columns)
    return df, df_features, df_scaled, target_labels, df_features.columns.tolist()

@st.cache_data
def run_clustering(df_scaled_json, n_clusters):
    df_scaled = pd.read_json(df_scaled_json)
    kmeans = KMeans(n_clusters=n_clusters, init='k-means++', n_init=10, max_iter=300, random_state=42)
    labels = kmeans.fit_predict(df_scaled)
    sil_score = silhouette_score(df_scaled, labels)
    return labels, sil_score, kmeans

@st.cache_data
def compute_tsne(df_scaled_json):
    df_scaled = pd.read_json(df_scaled_json)
    pca = PCA(n_components=10, random_state=42)
    X_pca = pca.fit_transform(df_scaled)
    tsne = TSNE(n_components=2, random_state=42, perplexity=30, max_iter=1000)
    X_tsne = tsne.fit_transform(X_pca)
    return X_tsne

@st.cache_data
def run_anomaly_detection(df_scaled_json, contamination=0.05):
    df_scaled = pd.read_json(df_scaled_json)
    iso = IsolationForest(contamination=contamination, random_state=42, n_jobs=-1)
    preds = iso.fit_predict(df_scaled)
    scores = iso.decision_function(df_scaled)
    return preds, scores

# ═══════════════════════════════════════════════════════════════════════════════
# HERO HEADER
# ═══════════════════════════════════════════════════════════════════════════════
st.markdown("""
<div class="hero-header">
    <h1>🎓 Dropout Risk Pattern Discovery</h1>
    <p class="subtitle">Advanced unsupervised ML analysis with risk calculator, what-if simulator, anomaly alerts & trajectory view</p>
    <div class="hero-badge">✦ MACHINE LEARNING POWERED</div>
</div>
""", unsafe_allow_html=True)

# ═══════════════════════════════════════════════════════════════════════════════
# SIDEBAR
# ═══════════════════════════════════════════════════════════════════════════════
with st.sidebar:
    st.markdown('<div class="sidebar-brand"><h2>📊 Analysis Controls</h2></div>', unsafe_allow_html=True)
    uploaded_file = st.file_uploader("📁 Upload CSV Dataset", type=['csv'])
    st.markdown("---")

df_raw, df_features, df_scaled, target_labels, feature_names = load_and_process_data(uploaded_file)

if df_raw is None:
    st.warning("⚠️ Please upload a CSV dataset or place `dataset.csv` in the project folder.")
    st.stop()

with st.sidebar:
    st.markdown("### 🔧 Clustering Parameters")
    n_clusters = st.slider("Number of Clusters (K)", 2, 8, 3)
    st.markdown("---")

df_scaled_json = df_scaled.to_json()
cluster_labels, sil_score, kmeans_model = run_clustering(df_scaled_json, n_clusters)
df_raw['Cluster'] = cluster_labels

cluster_dropout_rates = {}
if 'Target' in df_raw.columns:
    for c in range(n_clusters):
        mask = df_raw['Cluster'] == c
        cluster_dropout_rates[c] = (df_raw.loc[mask, 'Target'] == 'Dropout').mean() * 100
    at_risk_cluster = max(cluster_dropout_rates, key=cluster_dropout_rates.get)
else:
    at_risk_cluster = 0

with st.sidebar:
    st.markdown("### 🔍 Filter Clusters")
    selected_clusters = st.multiselect("Select clusters", list(range(n_clusters)), list(range(n_clusters)),
        format_func=lambda x: f"Cluster {x} {'⚠️' if x == at_risk_cluster else ''}")
    st.markdown("---")
    st.markdown(f"""
    <div class="sidebar-stat"><span class="stat-label">Silhouette</span><span class="stat-value">{sil_score:.4f}</span></div>
    <div class="sidebar-stat"><span class="stat-label">Students</span><span class="stat-value">{len(df_raw):,}</span></div>
    <div class="sidebar-stat"><span class="stat-label">At-Risk Cluster</span><span class="stat-value">C{at_risk_cluster} ⚠️</span></div>
    """, unsafe_allow_html=True)

filtered_df = df_raw[df_raw['Cluster'].isin(selected_clusters)]

# ═══════════════════════════════════════════════════════════════════════════════
# METRIC CARDS
# ═══════════════════════════════════════════════════════════════════════════════
at_risk_count = (df_raw['Cluster'] == at_risk_cluster).sum()
at_risk_pct = at_risk_count / len(df_raw) * 100

c1, c2, c3, c4 = st.columns(4)
with c1:
    st.markdown(f"""<div class="glass-card card-d1 accent-blue"><span class="card-icon">👥</span>
        <div class="card-value">{len(df_raw):,}</div><div class="card-label">Total Students</div>
        <div class="card-sub">Complete dataset</div></div>""", unsafe_allow_html=True)
with c2:
    st.markdown(f"""<div class="glass-card card-d2 accent-purple"><span class="card-icon">🧬</span>
        <div class="card-value">{len(feature_names)}</div><div class="card-label">Features</div>
        <div class="card-sub">Input dimensions</div></div>""", unsafe_allow_html=True)
with c3:
    st.markdown(f"""<div class="glass-card card-d3 accent-green"><span class="card-icon">🎯</span>
        <div class="card-value">{n_clusters}</div><div class="card-label">Clusters</div>
        <div class="card-sub">Sil: {sil_score:.3f}</div></div>""", unsafe_allow_html=True)
with c4:
    st.markdown(f"""<div class="glass-card card-d4 accent-red"><span class="card-icon">🚨</span>
        <div class="card-value">{at_risk_count:,}</div><div class="card-label">At-Risk</div>
        <div class="card-sub">{at_risk_pct:.1f}% of total</div></div>""", unsafe_allow_html=True)

if at_risk_pct > 15:
    st.markdown(f"""<div class="alert-banner">
        <span class="alert-icon">🚨</span>
        <span class="alert-text"> ALERT: {at_risk_count:,} students ({at_risk_pct:.1f}%) flagged as AT-RISK — Cluster {at_risk_cluster} has {cluster_dropout_rates.get(at_risk_cluster, 0):.1f}% dropout rate</span>
    </div>""", unsafe_allow_html=True)

st.markdown('<div class="animated-divider"></div>', unsafe_allow_html=True)

PLOT_LAYOUT = dict(
    plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(13,27,42,0.4)',
    font=dict(color='#ccd6f6', family='Inter'), margin=dict(t=50, b=40, l=50, r=30),
    legend=dict(bgcolor='rgba(0,0,0,0)', bordercolor='rgba(100,255,218,0.2)', borderwidth=1),
)
COLORS = ['#64ffda','#38bdf8','#a78bfa','#f472b6','#fbbf24','#34d399','#fb923c','#e879f9']

# ═══════════════════════════════════════════════════════════════════════════════
# ALL 9 TABS
# ═══════════════════════════════════════════════════════════════════════════════
tab1, tab2, tab3, tab4, tab5, tab6, tab7, tab8, tab9 = st.tabs([
    "📊 Overview", "🗺️ Clusters", "🔥 Profiles",
    "⚠️ At-Risk", "📋 Explorer",
    "🧮 Risk Calculator", "🔮 What-If", "🚨 Anomalies", "📈 Trajectory"
])

# ─── TAB 1: Dataset Overview ─────────────────────────────────────────────────
with tab1:
    st.markdown('<p class="section-title">Dataset Summary</p>', unsafe_allow_html=True)
    col1, col2 = st.columns(2)
    with col1:
        st.markdown("#### 📊 Statistics")
        st.dataframe(df_raw.describe().round(2), use_container_width=True, height=400)
    with col2:
        if 'Target' in df_raw.columns:
            st.markdown("#### 🎯 Target Distribution")
            dist = df_raw['Target'].value_counts()
            fig = go.Figure(go.Pie(labels=dist.index, values=dist.values, hole=0.55,
                marker=dict(colors=['#ff6b6b','#fbbf24','#64ffda'], line=dict(color='#0a192f', width=3)),
                textfont=dict(size=14, color='white'), textinfo='label+percent'))
            fig.update_layout(**PLOT_LAYOUT, height=350, showlegend=False)
            st.plotly_chart(fig, use_container_width=True)
        st.markdown("#### 📐 Cluster Sizes")
        sizes = df_raw['Cluster'].value_counts().sort_index()
        fig2 = go.Figure(go.Bar(x=[f"C{i}" for i in sizes.index], y=sizes.values,
            marker=dict(color=COLORS[:n_clusters], line=dict(width=0)),
            text=sizes.values, textposition='outside', textfont=dict(color='#64ffda', size=13)))
        fig2.update_layout(**PLOT_LAYOUT, height=300, xaxis_title="Cluster", yaxis_title="Count")
        st.plotly_chart(fig2, use_container_width=True)

# ─── TAB 2: Cluster Visualization ────────────────────────────────────────────
with tab2:
    st.markdown('<p class="section-title">t-SNE Cluster Visualization</p>', unsafe_allow_html=True)
    with st.spinner("⏳ Computing t-SNE projection..."):
        X_tsne = compute_tsne(df_scaled_json)
    tsne_df = pd.DataFrame({'t-SNE 1': X_tsne[:,0], 't-SNE 2': X_tsne[:,1],
        'Cluster': [f'C{c}' for c in cluster_labels],
        'Target': target_labels.values if 'Target' in df_raw.columns else ['N/A']*len(df_raw)})
    col1, col2 = st.columns(2)
    with col1:
        fig = px.scatter(tsne_df, x='t-SNE 1', y='t-SNE 2', color='Cluster',
            color_discrete_sequence=COLORS, opacity=0.7, title="By Cluster Assignment")
        fig.update_traces(marker=dict(size=5, line=dict(width=0)))
        fig.update_layout(**PLOT_LAYOUT, height=500)
        st.plotly_chart(fig, use_container_width=True)
    with col2:
        fig2 = px.scatter(tsne_df, x='t-SNE 1', y='t-SNE 2', color='Target',
            color_discrete_map={'Dropout':'#ff6b6b','Enrolled':'#fbbf24','Graduate':'#64ffda'},
            opacity=0.7, title="By Original Target")
        fig2.update_traces(marker=dict(size=5, line=dict(width=0)))
        fig2.update_layout(**PLOT_LAYOUT, height=500)
        st.plotly_chart(fig2, use_container_width=True)

# ─── TAB 3: Cluster Profiles ─────────────────────────────────────────────────
with tab3:
    st.markdown('<p class="section-title">Cluster Profile Heatmap</p>', unsafe_allow_html=True)
    numeric_cols = [c for c in df_raw.select_dtypes(include=[np.number]).columns if c != 'Cluster']
    cluster_means = df_raw.groupby('Cluster')[numeric_cols].mean()
    cluster_norm = (cluster_means - cluster_means.mean()) / cluster_means.std()
    top_feats = cluster_norm.var().nlargest(15).index.tolist()
    fig = px.imshow(cluster_norm[top_feats].T, labels=dict(x="Cluster", y="Feature", color="Z-Score"),
        x=[f"C{i}" for i in range(n_clusters)], y=top_feats,
        color_continuous_scale="RdYlGn", aspect="auto", title="Top 15 Differentiating Features")
    fig.update_layout(**PLOT_LAYOUT, height=550)
    st.plotly_chart(fig, use_container_width=True)
    if 'Target' in df_raw.columns:
        st.markdown("#### 📊 Cluster × Target Crosstab")
        ct = pd.crosstab(df_raw['Cluster'], df_raw['Target'], normalize='index') * 100
        ct = ct.round(1); ct.columns = [f'{c} %' for c in ct.columns]
        ct['Size'] = df_raw['Cluster'].value_counts().sort_index().values
        st.dataframe(ct, use_container_width=True)

# ─── TAB 4: At-Risk Analysis ─────────────────────────────────────────────────
with tab4:
    st.markdown('<p class="section-title">⚠️ At-Risk Analysis</p>', unsafe_allow_html=True)
    at_risk_data = df_raw[df_raw['Cluster'] == at_risk_cluster]
    low_risk_data = df_raw[df_raw['Cluster'] != at_risk_cluster]
    dropout_in_risk = (at_risk_data['Target'] == 'Dropout').mean() * 100 if 'Target' in df_raw.columns else 0
    rc1, rc2, rc3 = st.columns(3)
    with rc1:
        st.markdown(f"""<div class="glass-card accent-red"><span class="card-icon">🚨</span>
            <div class="card-value">{len(at_risk_data):,}</div><div class="card-label">At-Risk</div></div>""", unsafe_allow_html=True)
    with rc2:
        st.markdown(f"""<div class="glass-card accent-green"><span class="card-icon">✅</span>
            <div class="card-value">{len(low_risk_data):,}</div><div class="card-label">Low-Risk</div></div>""", unsafe_allow_html=True)
    with rc3:
        st.markdown(f"""<div class="glass-card accent-red"><span class="card-icon">📉</span>
            <div class="card-value">{dropout_in_risk:.1f}%</div><div class="card-label">Dropout Rate</div></div>""", unsafe_allow_html=True)
    col1, col2 = st.columns(2)
    with col1:
        fig = go.Figure(go.Pie(labels=['At Risk','Low Risk'], values=[len(at_risk_data), len(low_risk_data)],
            hole=0.6, marker=dict(colors=['#ff6b6b','#64ffda'], line=dict(color='#0a192f', width=3)),
            textfont=dict(size=14, color='white')))
        fig.update_layout(**PLOT_LAYOUT, height=350, title="Risk Distribution")
        st.plotly_chart(fig, use_container_width=True)
    with col2:
        overall_m = df_raw[numeric_cols].mean()
        overall_s = df_raw[numeric_cols].std().replace(0, 1)
        z = ((at_risk_data[numeric_cols].mean() - overall_m) / overall_s).dropna().abs().nlargest(10)
        fig2 = go.Figure(go.Bar(y=[f[:25] for f in z.index], x=z.values, orientation='h',
            marker=dict(color='#ff6b6b', line=dict(width=0)),
            text=[f'{v:.2f}' for v in z.values], textposition='outside'))
        fig2.update_layout(**PLOT_LAYOUT, height=350, title="Top Risk Indicators (|Z|)", xaxis_title="|Z-Score|")
        st.plotly_chart(fig2, use_container_width=True)
    st.markdown("#### 📋 At-Risk Records")
    st.dataframe(at_risk_data.head(50), use_container_width=True, height=300)
    st.download_button("📥 Download At-Risk CSV", at_risk_data.to_csv(index=False).encode(), "at_risk_students.csv", "text/csv")

# ─── TAB 5: Interactive Explorer ──────────────────────────────────────────────
with tab5:
    st.markdown('<p class="section-title">Interactive Explorer</p>', unsafe_allow_html=True)
    numeric_cols_list = [c for c in df_raw.select_dtypes(include=[np.number]).columns if c != 'Cluster']
    ec1, ec2 = st.columns(2)
    with ec1: x_feat = st.selectbox("X-axis", numeric_cols_list, index=0)
    with ec2: y_feat = st.selectbox("Y-axis", numeric_cols_list, index=min(1, len(numeric_cols_list)-1))
    color_by = st.radio("Color by:", ["Cluster", "Target"], horizontal=True)
    fig = px.scatter(filtered_df, x=x_feat, y=y_feat,
        color=color_by if color_by in filtered_df.columns else 'Cluster',
        color_discrete_sequence=COLORS, opacity=0.6, title=f"{x_feat} vs {y_feat}")
    fig.update_traces(marker=dict(size=5))
    fig.update_layout(**PLOT_LAYOUT, height=500)
    st.plotly_chart(fig, use_container_width=True)
    st.dataframe(filtered_df, use_container_width=True, height=300)

# ─── TAB 6: Individual Risk Calculator ───────────────────────────────────────
with tab6:
    st.markdown('<p class="section-title">🧮 Individual Risk Calculator</p>', unsafe_allow_html=True)
    st.markdown("""<div class="glass-card" style="opacity:1;transform:none;text-align:left;padding:1.2rem 1.5rem;">
        <p style="color:#8892b0;margin:0;">Enter a student's feature values below. The model will assign them to a cluster and compute a risk score in real time.</p>
    </div>""", unsafe_allow_html=True)

    # Select top features for input
    important_features = numeric_cols_list[:min(12, len(numeric_cols_list))]
    input_vals = {}
    cols = st.columns(3)
    for i, feat in enumerate(important_features):
        with cols[i % 3]:
            feat_min = float(df_raw[feat].min())
            feat_max = float(df_raw[feat].max())
            feat_mean = float(df_raw[feat].mean())
            input_vals[feat] = st.number_input(
                feat[:35], min_value=feat_min, max_value=feat_max,
                value=feat_mean, key=f"calc_{feat}")

    if st.button("🎯 Calculate Risk", type="primary", key="calc_btn"):
        # Build full feature vector (use mean for missing features)
        full_vec = []
        for f in feature_names:
            if f in input_vals:
                full_vec.append(input_vals[f])
            else:
                full_vec.append(float(df_features[f].mean()))
        input_arr = np.array(full_vec).reshape(1, -1)
        # Scale using same scaler
        scaler = StandardScaler()
        scaler.fit(df_features.values)
        input_scaled = scaler.transform(input_arr)
        # Predict cluster
        pred_cluster = kmeans_model.predict(input_scaled)[0]
        # Distance to centroid as risk proxy
        distances = np.linalg.norm(kmeans_model.cluster_centers_ - input_scaled, axis=1)
        risk_score = 1.0 - (distances[pred_cluster] / distances.max())
        is_at_risk = pred_cluster == at_risk_cluster
        dropout_rate_cl = cluster_dropout_rates.get(pred_cluster, 0)

        r1, r2, r3 = st.columns(3)
        with r1:
            color_cls = "accent-red" if is_at_risk else "accent-green"
            st.markdown(f"""<div class="glass-card {color_cls}" style="opacity:1;transform:none;">
                <span class="card-icon">{'🚨' if is_at_risk else '✅'}</span>
                <div class="card-value">C{pred_cluster}</div>
                <div class="card-label">Assigned Cluster</div>
                <div class="card-sub">{'AT RISK' if is_at_risk else 'LOW RISK'}</div>
            </div>""", unsafe_allow_html=True)
        with r2:
            st.markdown(f"""<div class="glass-card accent-purple" style="opacity:1;transform:none;">
                <span class="card-icon">📊</span>
                <div class="card-value">{risk_score:.2f}</div>
                <div class="card-label">Risk Score</div>
                <div class="card-sub">0 = low, 1 = high</div>
            </div>""", unsafe_allow_html=True)
        with r3:
            st.markdown(f"""<div class="glass-card accent-blue" style="opacity:1;transform:none;">
                <span class="card-icon">📉</span>
                <div class="card-value">{dropout_rate_cl:.1f}%</div>
                <div class="card-label">Cluster Dropout Rate</div>
                <div class="card-sub">Historical rate</div>
            </div>""", unsafe_allow_html=True)

# ─── TAB 7: What-If Simulator ────────────────────────────────────────────────
with tab7:
    st.markdown('<p class="section-title">🔮 What-If Simulator</p>', unsafe_allow_html=True)
    st.markdown("""<div class="glass-card" style="opacity:1;transform:none;text-align:left;padding:1.2rem 1.5rem;">
        <p style="color:#8892b0;margin:0;">Select a baseline student, then adjust features with sliders to see how their risk cluster changes in real time.</p>
    </div>""", unsafe_allow_html=True)

    # Baseline: use median student
    baseline = df_features.median().to_dict()
    scaler_wi = StandardScaler()
    scaler_wi.fit(df_features.values)

    # Pick features to simulate
    sim_features = [f for f in feature_names if 'sem' in f.lower() or 'grade' in f.lower()
                    or 'approved' in f.lower() or 'Tuition' in f or 'Scholarship' in f]
    if len(sim_features) == 0:
        sim_features = feature_names[:6]
    sim_features = sim_features[:6]

    st.markdown("#### Adjust Features")
    sim_vals = {}
    sim_cols = st.columns(2)
    for i, feat in enumerate(sim_features):
        with sim_cols[i % 2]:
            fmin = float(df_features[feat].min())
            fmax = float(df_features[feat].max())
            fmed = float(df_features[feat].median())
            sim_vals[feat] = st.slider(feat[:40], fmin, fmax, fmed, key=f"sim_{feat}")

    # Build vector
    wi_vec = []
    for f in feature_names:
        if f in sim_vals:
            wi_vec.append(sim_vals[f])
        else:
            wi_vec.append(baseline[f])
    wi_arr = scaler_wi.transform(np.array(wi_vec).reshape(1, -1))

    wi_cluster = kmeans_model.predict(wi_arr)[0]
    wi_distances = np.linalg.norm(kmeans_model.cluster_centers_ - wi_arr, axis=1)
    wi_risk = 1.0 - (wi_distances[wi_cluster] / wi_distances.max())
    wi_at_risk = wi_cluster == at_risk_cluster
    wi_dropout = cluster_dropout_rates.get(wi_cluster, 0)

    # Also compute baseline cluster
    base_vec = [baseline[f] for f in feature_names]
    base_arr = scaler_wi.transform(np.array(base_vec).reshape(1, -1))
    base_cluster = kmeans_model.predict(base_arr)[0]

    w1, w2, w3 = st.columns(3)
    with w1:
        arrow = "🔻" if wi_cluster == at_risk_cluster and base_cluster != at_risk_cluster else (
                "🔺" if wi_cluster != at_risk_cluster and base_cluster == at_risk_cluster else "🔹")
        st.markdown(f"""<div class="glass-card {'accent-red' if wi_at_risk else 'accent-green'}" style="opacity:1;transform:none;">
            <span class="card-icon">{arrow}</span>
            <div class="card-value">C{base_cluster} → C{wi_cluster}</div>
            <div class="card-label">Cluster Change</div>
            <div class="card-sub">{'RISK INCREASED' if wi_at_risk else 'RISK DECREASED' if base_cluster==at_risk_cluster else 'STABLE'}</div>
        </div>""", unsafe_allow_html=True)
    with w2:
        st.markdown(f"""<div class="glass-card accent-purple" style="opacity:1;transform:none;">
            <span class="card-icon">📊</span>
            <div class="card-value">{wi_risk:.2f}</div>
            <div class="card-label">Simulated Risk</div>
        </div>""", unsafe_allow_html=True)
    with w3:
        st.markdown(f"""<div class="glass-card accent-blue" style="opacity:1;transform:none;">
            <span class="card-icon">📉</span>
            <div class="card-value">{wi_dropout:.1f}%</div>
            <div class="card-label">Dropout Rate</div>
        </div>""", unsafe_allow_html=True)

    # Cluster probability bar
    st.markdown("#### Distance to Each Cluster Centroid")
    dist_norm = wi_distances / wi_distances.sum()
    fig_wi = go.Figure(go.Bar(
        x=[f"C{i}" for i in range(n_clusters)], y=1-dist_norm,
        marker=dict(color=[COLORS[i] for i in range(n_clusters)]),
        text=[f"{(1-d)*100:.0f}%" for d in dist_norm], textposition='outside'))
    fig_wi.update_layout(**PLOT_LAYOUT, height=300, yaxis_title="Proximity Score",
                          xaxis_title="Cluster")
    st.plotly_chart(fig_wi, use_container_width=True)

# ─── TAB 8: Anomaly Alert Panel ──────────────────────────────────────────────
with tab8:
    st.markdown('<p class="section-title">🚨 Anomaly Detection Panel</p>', unsafe_allow_html=True)

    with st.spinner("Running Isolation Forest..."):
        ano_preds, ano_scores = run_anomaly_detection(df_scaled_json)

    anomaly_mask = ano_preds == -1
    n_anomalies = anomaly_mask.sum()
    df_raw['anomaly_score'] = ano_scores
    df_raw['is_anomaly'] = anomaly_mask

    a1, a2, a3 = st.columns(3)
    with a1:
        st.markdown(f"""<div class="glass-card accent-red" style="opacity:1;transform:none;">
            <span class="card-icon">⚡</span>
            <div class="card-value">{n_anomalies}</div>
            <div class="card-label">Anomalies</div>
            <div class="card-sub">{n_anomalies/len(df_raw)*100:.1f}% of total</div>
        </div>""", unsafe_allow_html=True)
    with a2:
        ano_in_risk = (df_raw.loc[anomaly_mask, 'Cluster'] == at_risk_cluster).mean() * 100
        st.markdown(f"""<div class="glass-card accent-purple" style="opacity:1;transform:none;">
            <span class="card-icon">🎯</span>
            <div class="card-value">{ano_in_risk:.0f}%</div>
            <div class="card-label">In At-Risk Cluster</div>
        </div>""", unsafe_allow_html=True)
    with a3:
        mean_score = df_raw.loc[anomaly_mask, 'anomaly_score'].mean()
        st.markdown(f"""<div class="glass-card accent-blue" style="opacity:1;transform:none;">
            <span class="card-icon">📏</span>
            <div class="card-value">{mean_score:.3f}</div>
            <div class="card-label">Mean Anomaly Score</div>
        </div>""", unsafe_allow_html=True)

    anomaly_df = df_raw[anomaly_mask].sort_values('anomaly_score', ascending=True)
    st.markdown("#### 🔴 Most Anomalous Students (sorted by severity)")
    display_cols = ['Cluster', 'anomaly_score'] + ([' Target'] if 'Target' in df_raw.columns else [])
    display_cols = ['Cluster', 'anomaly_score']
    if 'Target' in df_raw.columns:
        display_cols.append('Target')
    display_cols += [c for c in feature_names[:8] if c in anomaly_df.columns]
    st.dataframe(anomaly_df[display_cols].head(50), use_container_width=True, height=400)

    # Save anomaly CSV
    base_dir = os.path.dirname(__file__)
    anomaly_df.to_csv(os.path.join(base_dir, "anomaly_students.csv"), index=False)
    st.download_button("📥 Download Anomaly CSV", anomaly_df.to_csv(index=False).encode(),
                       "anomaly_students.csv", "text/csv")

# ─── TAB 9: Trajectory View ──────────────────────────────────────────────────
with tab9:
    st.markdown('<p class="section-title">📈 Semester Trajectory Analysis</p>', unsafe_allow_html=True)

    # Load trajectory image if exists, otherwise compute inline
    base_dir = os.path.dirname(__file__)
    traj_img = os.path.join(base_dir, "plots", "trajectory_matrix.png")

    # Compute transition data inline for the dashboard
    sem1_features = [c for c in df_raw.columns if '1st sem' in c and c != 'Cluster'
                     and 'Target' not in c and 'anomaly' not in c and 'is_' not in c]
    sem2_features = [c for c in df_raw.columns if '2nd sem' in c and c != 'Cluster'
                     and 'Target' not in c and 'anomaly' not in c and 'is_' not in c]

    if len(sem1_features) >= 2 and len(sem2_features) >= 2:
        from sklearn.cluster import KMeans as KM2
        scaler_s1 = StandardScaler()
        scaler_s2 = StandardScaler()
        X_s1 = scaler_s1.fit_transform(df_raw[sem1_features].fillna(0))
        X_s2 = scaler_s2.fit_transform(df_raw[sem2_features].fillna(0))
        km1 = KM2(n_clusters=3, init='k-means++', n_init=10, random_state=42)
        km2 = KM2(n_clusters=3, init='k-means++', n_init=10, random_state=42)
        l1 = km1.fit_predict(X_s1)
        l2 = km2.fit_predict(X_s2)

        # Map to risk levels
        def risk_order(labels, targets, nc):
            rates = {}
            for c in range(nc):
                m = labels == c
                rates[c] = (targets[m] == 'Dropout').mean() if m.sum() > 0 else 0
            return sorted(rates.keys(), key=lambda x: rates[x])

        if 'Target' in df_raw.columns:
            ro1 = risk_order(l1, df_raw['Target'].values, 3)
            ro2 = risk_order(l2, df_raw['Target'].values, 3)
        else:
            ro1 = list(range(3))
            ro2 = list(range(3))

        map1 = {orig: risk for risk, orig in enumerate(ro1)}
        map2 = {orig: risk for risk, orig in enumerate(ro2)}
        rl1 = np.array([map1[x] for x in l1])
        rl2 = np.array([map2[x] for x in l2])
        risk_names = ['Low Risk', 'Medium Risk', 'High Risk']

        trans = np.zeros((3, 3), dtype=int)
        for a, b in zip(rl1, rl2):
            trans[a][b] += 1

        deteriorating = (rl2 > rl1).sum()
        improving = (rl2 < rl1).sum()
        stable = (rl2 == rl1).sum()

        t1, t2, t3 = st.columns(3)
        with t1:
            st.markdown(f"""<div class="glass-card accent-red" style="opacity:1;transform:none;">
                <span class="card-icon">🔻</span>
                <div class="card-value">{deteriorating:,}</div>
                <div class="card-label">Deteriorating</div>
                <div class="card-sub">{deteriorating/len(df_raw)*100:.1f}%</div>
            </div>""", unsafe_allow_html=True)
        with t2:
            st.markdown(f"""<div class="glass-card accent-green" style="opacity:1;transform:none;">
                <span class="card-icon">🔹</span>
                <div class="card-value">{stable:,}</div>
                <div class="card-label">Stable</div>
            </div>""", unsafe_allow_html=True)
        with t3:
            st.markdown(f"""<div class="glass-card accent-blue" style="opacity:1;transform:none;">
                <span class="card-icon">🔺</span>
                <div class="card-value">{improving:,}</div>
                <div class="card-label">Improving</div>
            </div>""", unsafe_allow_html=True)

        # Heatmap
        st.markdown("#### Transition Matrix Heatmap (Sem1 → Sem2)")
        trans_pct = trans / trans.sum(axis=1, keepdims=True) * 100
        fig_trans = go.Figure(go.Heatmap(
            z=trans_pct,
            x=[f"Sem2: {n}" for n in risk_names],
            y=[f"Sem1: {n}" for n in risk_names],
            text=[[f"{trans[i][j]}<br>({trans_pct[i][j]:.1f}%)" for j in range(3)] for i in range(3)],
            texttemplate="%{text}", colorscale="YlOrRd",
            hovertemplate="From %{y} → %{x}<br>Count: %{text}<extra></extra>"))
        fig_trans.update_layout(**PLOT_LAYOUT, height=450,
            title="Risk Level Transition Probabilities",
            xaxis_title="Semester 2 Risk", yaxis_title="Semester 1 Risk")
        st.plotly_chart(fig_trans, use_container_width=True)

        # Show saved image if available
        if os.path.exists(traj_img):
            st.markdown("#### Detailed Trajectory Plot")
            st.image(traj_img, use_container_width=True)
    else:
        st.info("Semester features not found in dataset for trajectory analysis.")

# ─── Footer ──────────────────────────────────────────────────────────────────
st.markdown("""<div class="footer-glow">
    <p>🎓 <strong>Dropout Risk Pattern Discovery</strong> — Advanced Unsupervised ML Dashboard</p>
    <p>Built with Streamlit • K-Means • PCA • t-SNE • Isolation Forest • Plotly</p>
</div>""", unsafe_allow_html=True)
