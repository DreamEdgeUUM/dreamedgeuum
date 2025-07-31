from flask import Flask, render_template, jsonify
from collections import OrderedDict
import pandas as pd
import numpy as np
import json

app = Flask(__name__)

def safe_dict(series):
    return {str(k): int(v) for k, v in series.items() if pd.notna(v)}

def safe_val(val):
    try:
        return int(val)
    except:
        try:
            return round(float(val), 4)
        except:
            return str(val)

@app.route('/')
def index():
    return render_template("index.html")

@app.route("/data/mp_profile")
def get_mp_profile():
    try:
        with open("dataset/profile.json", encoding="utf-8") as f:
            profile = json.load(f)
        with open("dataset/video.json", encoding="utf-8") as f:
            video = json.load(f)
        with open("dataset/statements.json", encoding="utf-8") as f:
            statements = json.load(f)
        with open("dataset/comments.json", encoding="utf-8") as f:
            comments = json.load(f)
        return jsonify({
            "profile": profile,
            "video": video,
            "statements": statements,
            "comments": comments
        })
    except Exception as e:
        return jsonify({"error": str(e)})

@app.route('/data')
def get_data():
    #Extended Results for Voter Summary 
    results14 = pd.read_csv("https://raw.githubusercontent.com/Thevesh/analysis-election-msia/main/data/results_parlimen_ge14.csv")
    results15 = pd.read_csv("https://raw.githubusercontent.com/Thevesh/analysis-election-msia/main/data/results_parlimen_ge15.csv")

    row14 = results14[results14["parlimen"].str.lower().str.contains("kubang pasu")].iloc[0]
    row15 = results15[results15["parlimen"].str.lower().str.contains("kubang pasu")].iloc[0]

    reg14 = int(row14["pengundi_jumlah"])
    reg15 = int(row15["pengundi_jumlah"])
    turnout14 = f"{float(row14['peratus_keluar']):.2f}%"
    turnout15 = f"{float(row15['peratus_keluar']):.2f}%"

    election_extended = {
        "GE14": row14.to_dict(),
        "GE15": row15.to_dict()
    }

    # Bar Chart & MP Info
    ge14_votes = pd.read_csv("https://raw.githubusercontent.com/Thevesh/analysis-election-msia/main/data/candidates_ge14.csv")
    ge15_votes = pd.read_csv("https://raw.githubusercontent.com/Thevesh/analysis-election-msia/main/data/candidates_ge15.csv")

    kp14 = ge14_votes[ge14_votes["parlimen"].str.lower().str.contains("kubang pasu")]
    kp15 = ge15_votes[ge15_votes["parlimen"].str.lower().str.contains("kubang pasu")]

    votes14 = kp14.groupby("party")["votes"].sum().sort_values(ascending=False)
    votes15 = kp15.groupby("party")["votes"].sum().sort_values(ascending=False)

    winner = kp15[kp15["result"] == 1].iloc[0]
    mp_info = {"name": str(winner["name"]), "party": str(winner["party"])}

    # Demographics
    dosm_url = "https://storage.dosm.gov.my/population/population_parlimen.parquet"
    df_dosm = pd.read_parquet(dosm_url)
    df_dosm = df_dosm[df_dosm["parlimen"].str.lower().str.contains("p.006")].copy()
    df_dosm["population"] = pd.to_numeric(df_dosm["population"], errors="coerce") * 1000
    df_dosm = df_dosm.dropna(subset=["population"])

    gender = df_dosm[df_dosm["sex"].isin(["male", "female"])].groupby("sex")["population"].sum()
    ethnicity = df_dosm[df_dosm["ethnicity"].notna()].groupby("ethnicity")["population"].sum()

    # Age group
    demo_df = pd.read_csv("https://raw.githubusercontent.com/Thevesh/analysis-election-msia/main/data/voters_ge15.csv")
    # Filter only for Kubang Pasu (P.006), which includes N.05 and N.06
    demo_kp = demo_df[demo_df["parlimen"].str.lower().str.contains("p.006")].copy()

    # Define age bins using the column names
    age_bins = {
        "18–29": ["male_18_20", "female_18_20", "male_21_29", "female_21_29"],
        "30–39": ["male_30_39", "female_30_39"],
        "40–49": ["male_40_49", "female_40_49"],
        "50–59": ["male_50_59", "female_50_59"],
        "60–69": ["male_60_69", "female_60_69"],
        "70–79": ["male_70_79", "female_70_79"],
        "80–89": ["male_80_89", "female_80_89"],
        "90+":   ["male_90+", "female_90+"]
    }

    # Sum age groups properly across the two DUNs
    age_group_counts = OrderedDict()
    for label, cols in age_bins.items():
        count = demo_kp[cols].sum().sum()  # sum all values in specified columns
        age_group_counts[label] = int(count)
    
    # Age group breakdown by DUN (N.05 & N.06)
    dun_age_data = {}
    for dun_name in demo_kp["dun"].unique():
        subset = demo_kp[demo_kp["dun"] == dun_name]
        age_counts = {}
        for label, cols in age_bins.items():
            count = subset[cols].sum().sum()
            age_counts[label] = int(count)
        dun_age_data[dun_name] = age_counts

    # Format selected columns as additional stats
    selected_columns = [
        "majoriti", "parlimen", "pengundi_jumlah", "pengundi_tidak_hadir",
        "peratus_keluar", "rosak_vs_keseluruhan", "rosak_vs_majoriti",
        "state", "tidakhadir_vs_majoriti", "undi_dalam_peti", "undi_keluar_peti",
        "undi_rosak", "undi_tak_kembali", "undi_tolak"
    ]

    additional_stats = {
        col: {
            "GE14": safe_val(row14.get(col)),
            "GE15": safe_val(row15.get(col))
        }
        for col in selected_columns
    }


    return jsonify({
        "mpInfo": mp_info,
        "voterSummary": {
            "GE14": {"registeredVoters": str(reg14), "voterTurnout": turnout14},
            "GE15": {"registeredVoters": str(reg15), "voterTurnout": turnout15}
        },
        "electionResults": {
            "GE14": {
                "parties": [str(p) for p in votes14.index],
                "votes": [int(v) for v in votes14.values]
            },
            "GE15": {
                "parties": [str(p) for p in votes15.index],
                "votes": [int(v) for v in votes15.values]
            },
            "extended": election_extended
        },
        "demographics": {
            "gender": safe_dict(gender),
            "ethnicity": safe_dict(ethnicity),
            "ageGroups": age_group_counts,
            "ageByDun": dun_age_data
        },
        "additionalStats": additional_stats
    })




if __name__ == '__main__':
    app.run(debug=True)
