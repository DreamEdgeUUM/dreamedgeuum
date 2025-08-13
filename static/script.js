document.addEventListener("DOMContentLoaded", () => {
  fetch("/data")
    .then(res => res.json())
    .then(data => {
      // MP info
      document.getElementById("mpName").textContent = data.mpInfo.name;
      document.getElementById("mpParty").textContent = data.mpInfo.party;
      document.getElementById("lastUpdated").textContent = new Date().toLocaleDateString();

      // Voter Summary
      document.getElementById("registeredVoters14").textContent = data.voterSummary.GE14.registeredVoters;
      document.getElementById("voterTurnout14").textContent = data.voterSummary.GE14.voterTurnout;
      document.getElementById("registeredVoters15").textContent = data.voterSummary.GE15.registeredVoters;
      document.getElementById("voterTurnout15").textContent = data.voterSummary.GE15.voterTurnout;

      // Charts
      createElectionChart("electionChart14", data.electionResults.GE14);
      createElectionChart("electionChart15", data.electionResults.GE15);
      createPieChart("genderChart", data.demographics.gender);
      createPieChart("ethnicityChart", data.demographics.ethnicity);
      createPieChart("ageChart", data.demographics.ageGroups);
      
      // Map
      initMap();

      // Additional election statistics table
      if (data.additionalStats) {
        renderStatsTable(data.additionalStats);
      } else {
        console.warn("No additionalStats found in response");
      }
    
    document.getElementById("mpProfileModal").style.display = "flex";

    });
});


////////////////////////////////////////////////////////////////
function createElectionChart(canvasId, result) {
  const colors = result.parties.map(partyName => {
    const upper = partyName.toUpperCase();
    if (upper.includes("PKR")) return "#1B76D2";        // Blue
    if (upper.includes("PH")) return "#D91C1C";         // Red
    if (upper.includes("DAP")) return "#E91E63";        // Pink
    if (upper.includes("PAS")) return "#1B9431";        // Green
    if (upper.includes("BN")) return "#0018A8";         // Dark Blue
    if (upper.includes("UMNO")) return "#AA1E1E";       // Deep Red
    if (upper.includes("BERSATU")) return "#FF4D00";    // Orange
    if (upper.includes("WARISAN")) return "#2ECCFA";    // Light Blue
    if (upper.includes("MUDA")) return "#333333";       // Gray
    if (upper.includes("IND")) return "#888888";        // Independent
    if (upper.includes("PBM")) return "#7E57C2";        // Purple
    if (upper.includes("PEJUANG")) return "#6D4C41";    // Brown
    if (upper.includes("PRM")) return "#FF69B4";        // Hot Pink
    if (upper.includes("PBB")) return "#00BCD4";        // Cyan
    if (upper.includes("GRS")) return "#009688";        // Teal
    if (upper.includes("STAR")) return "#FFB300";       // Amber
    if (upper.includes("GPS")) return "#212121";        // Black
    if (upper.includes("PN")) return "#040273";         //Deep Blue
    return "#999999"; // fallback: gray
  });

  new Chart(document.getElementById(canvasId), {
    type: "bar",
    data: {
      labels: result.parties,
      datasets: [{
        label: "Votes",
        data: result.votes,
        backgroundColor: colors
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function createPieChart(canvasId, dict) {
  const labels = Object.keys(dict);
  const values = Object.values(dict);
  const colors = [
    "#FF6384", "#36A2EB", "#FFCE56", "#8E44AD", "#2ECC71",
    "#F39C12", "#E74C3C", "#1ABC9C", "#9B59B6", "#34495E"
  ];
  new Chart(document.getElementById(canvasId), {
    type: "pie",
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors.slice(0, labels.length)
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" },
        title: { display: false }
      }
    }
  });
}

function updateAgeChart(dun, ageDataByDun) {
  const labels = Object.keys(ageDataByDun[dun]);
  const values = Object.values(ageDataByDun[dun]);

  if (ageChart) {
    ageChart.destroy();
  }

  ageChart = new Chart(document.getElementById("ageChart"), {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Voters",
        data: values,
        backgroundColor: "#3498db"
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: `Age Distribution – ${dun}` }
      }
    }
  });
}
//////////////////////////////////////////////////////////////////////////////
function initMap() {
  const map = L.map("map-container").setView([6.5, 100.4], 11);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
  }).addTo(map);
  L.marker([6.5, 100.4]).addTo(map)
    .bindPopup("<b>Kubang Pasu</b><br>Election data here.");
}
//////////////////////////////////////////////////////////////////////////////
// Detailed Election Statistics Table
function renderStatsTable(stats) {
  console.log("Rendering stats table with:", stats); // Debug log
  const tbody = document.querySelector("#statsTable tbody");
  tbody.innerHTML = "";

  for (const [key, value] of Object.entries(stats)) {
    const row = document.createElement("tr");

    const statCell = document.createElement("td");
    statCell.textContent = key.replaceAll("_", " ").toUpperCase();
    statCell.style = "border: 1px solid #ccc; padding: 10px; font-weight: bold;";

    const ge14Cell = document.createElement("td");
    ge14Cell.textContent = value?.GE14 ?? "-";
    ge14Cell.style = "border: 1px solid #ccc; padding: 10px;";

    const ge15Cell = document.createElement("td");
    ge15Cell.textContent = value?.GE15 ?? "-";
    ge15Cell.style = "border: 1px solid #ccc; padding: 10px;";

    row.appendChild(statCell);
    row.appendChild(ge14Cell);
    row.appendChild(ge15Cell);
    tbody.appendChild(row);
  }
}

// Smooth scroll navigation
function navigate(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    window.scrollTo({
      top: section.offsetTop - 50,
      behavior: "smooth"
    });
  } else {
    alert("Section not found!");
  }
}
///////////////////////////////////////////////////////////////////
// Scroll-triggered section reveal
document.addEventListener("scroll", function () {
  document.querySelectorAll("section").forEach(section => {
    if (section.getBoundingClientRect().top < window.innerHeight * 0.75) {
      section.classList.add("show");
    }
  });
});

//////////////////
document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("mpProfileModal");
  const modalContent = document.getElementById("mpProfileContent");
  
  let mpData = null;

  document.addEventListener("click", function (event) {
  const btn = event.target.closest("#mpProfileBtn");
  if (!btn) return; // Click wasn't on the button

  fetch("/data/mp_profile")
    .then(res => res.json())
    .then(data => {
      mpData = data;
      showProfileList();
      document.getElementById("mpProfileModal").style.display = "flex";
    })
    .catch(err => {
      document.getElementById("mpProfileContent").innerHTML =
        "<div class='alert alert-danger'>Error loading MP data.</div>";
      console.error("Fetch error:", err);
    });
  });
  
  // Ensure button is clickable after page fully loads
  window.addEventListener("load", () => {
    // 1. Remove any loading overlay that might block clicks
    const overlay = document.querySelector(".loading-overlay, .spinner-overlay, #loadingOverlay");
    if (overlay) {
      overlay.style.display = "none"; // hide it
    }

    // 2. Make sure the button is on top
    const mpBtn = document.getElementById("mpProfileBtn");
    if (mpBtn) {
      mpBtn.style.position = "relative";
      mpBtn.style.zIndex = "9999";
      mpBtn.style.pointerEvents = "auto";
    }
  });
  
   // Show Profile List
  function showProfileList() {
    const profiles = mpData.profile;
    modalContent.innerHTML = `
      <h3 class="mb-3">Select MP Profile</h3>
      <div class="list-group">
        ${profiles.map(p => `
          <button class="list-group-item list-group-item-action profile-btn" data-id="${p.profile_id}">
            <strong>${p.name}</strong> - ${p.age} years old
          </button>`).join("")}
      </div>
    `;
  }

  // Event delegation for profile buttons
  document.body.addEventListener("click", function (e) {
    if (e.target && e.target.classList.contains("profile-btn")) {
      const profileId = parseInt(e.target.dataset.id);
      showVideos(profileId);
    }
  });

  function showVideos(profileId) {
    const profile = mpData.profile.find(p => p.profile_id === profileId);
    const videos = mpData.video.filter(v => v.speaker === profile.name);

    modalContent.innerHTML = `
      <button class="btn btn-outline-secondary mb-3 back-btn" data-back="profiles">
        <i class="bi bi-arrow-left"></i> Back to Profiles
      </button>
      <h3 class="mb-3">${profile.name} - Related Videos</h3>
      <div class="list-group">
        ${videos.map(v => `
          <button class="list-group-item list-group-item-action video-btn" data-id="${v.youtube_id}" data-profile="${profileId}">
            <i class="bi bi-play-btn"></i> ${v.title}
            <small class="text-muted">(${v.date})</small>
          </button>`).join("")}
      </div>
    `;
  }

  // Back button handling
  document.body.addEventListener("click", function (e) {
    if (e.target && e.target.classList.contains("back-btn")) {
      const backType = e.target.dataset.back;
      if (backType === "profiles") {
        showProfileList();
      } else if (backType === "videos") {
        const profileId = parseInt(e.target.dataset.profile);
        showVideos(profileId);
      } else if (backType === "videoDetails") {
        const profileId = parseInt(e.target.dataset.profile);
        const youtubeId = e.target.dataset.youtube;
        showVideoDetails(profileId, youtubeId);
      }
    }
  });

  // Show video details
  document.body.addEventListener("click", function (e) {
    if (e.target && e.target.classList.contains("video-btn")) {
      const profileId = parseInt(e.target.dataset.profile);
      const youtubeId = e.target.dataset.id;
      showVideoDetails(profileId, youtubeId);
    }
  });

function showVideoDetails(profileId, youtubeId) {
  const profile = mpData.profile.find(p => p.profile_id === profileId);
  const video = mpData.video.find(v => v.youtube_id === youtubeId);
  const statements = mpData.statements.filter(s => s.youtube_id === youtubeId);
  const comments = mpData.comments.filter(c => c.youtube_id === youtubeId);

  modalContent.innerHTML = `
    <button class="btn btn-outline-secondary mb-3 back-btn" data-back="videos" data-profile="${profileId}">
      <i class="bi bi-arrow-left"></i> Back to Videos
    </button>
    <div class="card shadow-sm border-0">
      <div class="card-body">
        <h4 class="card-title fw-bold">${video.title}</h4>
        <p class="text-muted mb-3"><small>${video.date}</small></p>
        <div class="d-flex gap-2">
          <a href="${video.link}" target="_blank" 
             class="btn btn-lg btn-danger shadow-sm px-4" 
             style="border-radius: 50px; display: flex; align-items: center; gap: 8px;">
            <i class="bi bi-youtube" style="font-size: 1.5rem;"></i> 
            <span>Watch on YouTube</span>
          </a>
        </div>
      </div>
    </div>

    <hr>

    <h5 class="fw-semibold">Statements</h5>
    ${statements.length ? 
      `<ul class="list-group mb-3">
        ${statements.map(s => `
          <li class="list-group-item">
            <strong>${s.year}:</strong> ${s.summary}
          </li>`).join("")}
      </ul>` : 
      `<p class="text-muted">No statements available.</p>`}

    <h5 class="fw-semibold">Comments</h5>
    ${comments.length ? 
      `<ul class="list-group">
        ${comments.map(c => {
          let sentimentClass = "secondary";
          if (c.rule_sentiment_updated?.toLowerCase() === "positive") sentimentClass = "success";
          else if (c.rule_sentiment_updated?.toLowerCase() === "negative") sentimentClass = "danger";
          else if (c.rule_sentiment_updated?.toLowerCase() === "neutral") sentimentClass = "secondary";

          return `
            <li class="list-group-item d-flex justify-content-between align-items-start">
              <div>
                <strong>${c.username}:</strong> ${c.comment}
                <br><small class="text-muted">${c.estimated_date || ''}</small>
              </div>
              <span class="badge bg-${sentimentClass} align-self-center">
                ${c.rule_sentiment_updated || "Unknown"}
              </span>
            </li>
          `;
        }).join("")}
      </ul>` : 
      `<p class="text-muted">No comments available.</p>`}
  `;
}
});

///////////////////////
document.addEventListener("DOMContentLoaded", () => {
  const modalEl = document.getElementById("mpAnalysisModal");
  const modalContent = modalEl.querySelector(".modal-body");
  const modal = new bootstrap.Modal(modalEl);

  let mpData = null; // store fetched data here
  let sentimentTimeChart = null; // chart instance

  // Show the profile list inside modal
  function showProfileListForAnalysis() {
    if (!mpData || !mpData.profile) {
      modalContent.innerHTML = `<p>Loading profiles or no profiles found.</p>`;
      return;
    }

    modalContent.innerHTML = `
      <h3 class="mb-3">Select Profile for Analysis</h3>
      <div class="list-group">
        ${mpData.profile.map(p => `
          <button class="list-group-item list-group-item-action profile-analysis-btn" data-id="${p.profile_id}">
            <strong>${p.name}</strong> - ${p.age} years old
          </button>
        `).join("")}
      </div>
    `;
  }

  // Show analysis buttons for chosen profile
  function showAnalysisOptions(profileId) {
    const profile = mpData.profile.find(p => p.profile_id === profileId);
    if (!profile) {
      modalContent.innerHTML = `<p>Profile not found.</p>`;
      return;
    }
    modalContent.innerHTML = `
      <button class="btn btn-outline-secondary mb-3 back-btn-analysis" data-back="profileList">
        &larr; Back to Profiles
      </button>
      <h3>Analysis for ${profile.name}</h3>
      <p>Select an analysis type:</p>
      <div class="d-grid gap-2">
        <button class="btn btn-primary analysis-btn" data-type="sentiment-time" data-profile="${profile.profile_id}">Sentiment % Over Time</button>
        <button class="btn btn-success analysis-btn" data-type="sentiment-theme" data-profile="${profile.profile_id}">Sentiment % by Theme</button>
        <button class="btn btn-warning analysis-btn" data-type="sentiment-profile" data-profile="${profile.profile_id}">Sentiment % by Profile</button>
      </div>
    `;
  }

  // Sentiment Over Time Chart
  function renderSentimentTimeChart(profileId, period = "month") {
    const comments = mpData.comments || [];

    // Filter by profile_id (directly or via statements)
    const profileComments = comments.filter(c => {
      if (c.profile_id && c.profile_id === profileId) return true;
      const relatedStatement = mpData.statements?.find(s => s.youtube_id === c.youtube_id);
      return relatedStatement && relatedStatement.profile_id === profileId;
    });

    if (!profileComments.length) {
      modalContent.innerHTML = "<p>No comments found for this profile.</p>";
      return;
    }

    // Aggregate by time period & sentiment
    const grouped = {};
    profileComments.forEach(c => {
      // Pick estimated date first, fallback to crawl date
      let dateStr = c["extimated_date"] || c["crawl_date"];
      if (!dateStr) return;

      const dateObj = new Date(dateStr);
      if (isNaN(dateObj)) return; // skip invalid date

      const dateKey = period === "month"
        ? `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}`
        : `${dateObj.getFullYear()}`;

      if (!grouped[dateKey]) {
        grouped[dateKey] = { positive: 0, negative: 0, neutral: 0 };
      }

      const sentiment = (c.rule_sentiment_updated || c.rule_sentiment || "").toLowerCase();
      if (sentiment.includes("pos")) {
        grouped[dateKey].positive++;
      } else if (sentiment.includes("neg")) {
        grouped[dateKey].negative++;
      } else {
        grouped[dateKey].neutral++;
      }
    });

    const labels = Object.keys(grouped).sort();
    const positiveData = labels.map(l => grouped[l].positive);
    const negativeData = labels.map(l => grouped[l].negative);
    const neutralData = labels.map(l => grouped[l].neutral);

    // Chart HTML
    modalContent.innerHTML = `
      <h3>Sentiment Over Time (${period})</h3>
      <select id="timePeriodSelect" class="form-select mb-3" style="width:auto;display:inline-block;">
        <option value="month" ${period === "month" ? "selected" : ""}>Monthly</option>
        <option value="year" ${period === "year" ? "selected" : ""}>Yearly</option>
      </select>
      <canvas id="sentimentTimeChart"></canvas>
      <button class="btn btn-outline-secondary mt-3 back-btn-analysis">&larr; Back</button>
    `;

    const ctx = document.getElementById("sentimentTimeChart").getContext("2d");
    if (sentimentTimeChart) sentimentTimeChart.destroy();

    sentimentTimeChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "Positive", data: positiveData, backgroundColor: "rgba(0, 204, 102, 0.7)" },
          { label: "Negative", data: negativeData, backgroundColor: "rgba(255, 51, 0, 0.7)" },
          { label: "Neutral", data: neutralData, backgroundColor: "rgba(51, 153, 255, 0.7)" }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: `Sentiment Over Time (${period})` },
          tooltip: { mode: "index", intersect: false }
        },
        interaction: { mode: "nearest", axis: "x", intersect: false },
        scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } }
      }
    });

    // Period change handler
    document.getElementById("timePeriodSelect").addEventListener("change", function () {
      renderSentimentTimeChart(profileId, this.value);
    });
  }

  // Sentiment % by Theme
  function renderSentimentByThemeChart(profileId) {
    const statements = mpData.statements || [];

    // Filter statements by profile_id
    const profileStatements = statements.filter(s => s.profile_id === profileId);

    if (!profileStatements.length) {
      modalContent.innerHTML = "<p>No statements found for this profile.</p>";
      return;
    }

    function toneToSentiment(tone) {
      if (!tone) return "neutral";
      const t = tone.toLowerCase();
      if (t.includes("pos") || t.includes("optimis") || t.includes("baik") || t.includes("teg")) return "positive";
      if (t.includes("neg")) return "negative";
      return "neutral";
    }

    const grouped = {};
    profileStatements.forEach(s => {
      const theme = s.theme || "Unknown";
      if (!grouped[theme]) {
        grouped[theme] = { positive: 0, negative: 0, neutral: 0 };
      }
      const sentiment = toneToSentiment(s.tone);
      grouped[theme][sentiment]++;
    });

    const labels = Object.keys(grouped);
    const positiveData = labels.map(l => grouped[l].positive);
    const negativeData = labels.map(l => grouped[l].negative);
    const neutralData = labels.map(l => grouped[l].neutral);

    modalContent.innerHTML = `
      <h3>Sentiment % by Theme</h3>
      <canvas id="sentimentThemeChart"></canvas>
      <button class="btn btn-outline-secondary mt-3 back-btn-analysis">&larr; Back</button>
    `;

    const ctx = document.getElementById("sentimentThemeChart").getContext("2d");
    if (sentimentTimeChart) sentimentTimeChart.destroy();

    sentimentTimeChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "Positive", data: positiveData, backgroundColor: "rgba(0, 204, 102, 0.7)" },
          { label: "Negative", data: negativeData, backgroundColor: "rgba(255, 51, 0, 0.7)" },
          { label: "Neutral", data: neutralData, backgroundColor: "rgba(51, 153, 255, 0.7)" }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: "Sentiment % by Theme" },
          tooltip: { mode: "index", intersect: false }
        },
        interaction: { mode: "nearest", axis: "x", intersect: false },
        scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } }
      }
    });
  }

  // Sentiment % by Profile
  function renderSentimentByProfileChart() {
    const profiles = mpData.profile || [];
    const statements = mpData.statements || [];
    const comments = mpData.comments || [];

    if (!profiles.length || !comments.length || !statements.length) {
      modalContent.innerHTML = "<p>Insufficient data to show sentiment by profile.</p>";
      return;
    }

    // Map: profile_id -> [youtube_id,...] from statements
    const profileVideosMap = {};
    profiles.forEach(p => {
      profileVideosMap[p.profile_id] = statements
        .filter(s => s.profile_id === p.profile_id)
        .map(s => s.youtube_id);
    });

    // Aggregate sentiment counts per profile
    const grouped = {};
    profiles.forEach(p => {
      grouped[p.profile_id] = { positive: 0, negative: 0, neutral: 0 };
    });

    comments.forEach(c => {
      // Find profile_id of comment by matching comment.youtube_id to statement.youtube_id
      let commentProfileId = null;
      for (const [pid, vids] of Object.entries(profileVideosMap)) {
        if (vids.includes(c.youtube_id)) {
          commentProfileId = Number(pid);
          break;
        }
      }
      if (!commentProfileId) return; // skip comment if no profile found

      const sentiment = (c.rule_sentiment_updated || c.rule_sentiment || "").toLowerCase();
      if (sentiment.includes("pos")) {
        grouped[commentProfileId].positive++;
      } else if (sentiment.includes("neg")) {
        grouped[commentProfileId].negative++;
      } else {
        grouped[commentProfileId].neutral++;
      }
    });

    const labels = profiles.map(p => p.name);
    const positiveData = profiles.map(p => grouped[p.profile_id].positive);
    const negativeData = profiles.map(p => grouped[p.profile_id].negative);
    const neutralData = profiles.map(p => grouped[p.profile_id].neutral);

    modalContent.innerHTML = `
      <h3>Sentiment % by Profile</h3>
      <canvas id="sentimentProfileChart"></canvas>
      <button class="btn btn-outline-secondary mt-3 back-btn-analysis">&larr; Back</button>
    `;

    const ctx = document.getElementById("sentimentProfileChart").getContext("2d");
    if (sentimentTimeChart) sentimentTimeChart.destroy();

    sentimentTimeChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "Positive", data: positiveData, backgroundColor: "rgba(0, 204, 102, 0.7)" },
          { label: "Negative", data: negativeData, backgroundColor: "rgba(255, 51, 0, 0.7)" },
          { label: "Neutral", data: neutralData, backgroundColor: "rgba(51, 153, 255, 0.7)" }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: "Sentiment % by Profile" },
          tooltip: { mode: "index", intersect: false }
        },
        interaction: { mode: "nearest", axis: "x", intersect: false },
        scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } }
      }
    });
  }

  // Click handlers inside modal
  modalContent.addEventListener("click", (e) => {
    if (e.target.classList.contains("profile-analysis-btn")) {
      const profileId = parseInt(e.target.dataset.id);
      showAnalysisOptions(profileId);

    } else if (e.target.classList.contains("back-btn-analysis")) {
      showProfileListForAnalysis();

    } else if (e.target.classList.contains("analysis-btn")) {
      const type = e.target.dataset.type;
      const profileId = parseInt(e.target.dataset.profile);

      if (type === "sentiment-time") {
        renderSentimentTimeChart(profileId, "month");
      } else if (type === "sentiment-theme") {
        renderSentimentByThemeChart(profileId);
      } else if (type === "sentiment-profile") {
        renderSentimentByProfileChart();
      } else {
        alert(`Analysis selected: ${type} (Coming soon!)`);
      }
    }
  });

  // Open modal and fetch data
  document.getElementById("btnAnalysis").addEventListener("click", () => {
    modal.show();
    if (mpData) {
      showProfileListForAnalysis();
    } else {
      fetch("/data/mp_profile")
        .then(res => res.json())
        .then(data => {
          mpData = data; // contains profile, statements, videos, comments
          showProfileListForAnalysis();
        })
        .catch(err => {
          modalContent.innerHTML = `<p class="text-danger">Failed to load profiles.</p>`;
          console.error("Fetch error:", err);
        });
    }
  });
});
