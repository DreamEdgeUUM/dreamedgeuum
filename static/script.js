//let ageChart; 
//let globalAgeByDun;
//let currentProfileId = 1; // only Rafizi for now
//let profileData = [], videoData = [], statementData = [], commentData = [];
//let mpData = null;
//let currentProfile = null;

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
      
      /*For Adun Age Chart
      globalAgeByDun = data.demographics.ageByDun;
    
      updateAgeChart("Bukit Kayu Hitam", globalAgeByDun);
      document.getElementById("dunSelector").addEventListener("change", e => {
        updateAgeChart(e.target.value, globalAgeByDun);
      }); */
    
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
    if (upper.includes("PKR")) return "#1B76D2";       // Blue
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
////////////////////////////////////////////////////////////////////
/* document.addEventListener("DOMContentLoaded", function () {
      document.getElementById("mpProfileBtn").addEventListener("click", function () {
        fetch("/data/mp_profile")
          .then(res => res.json())
          .then(data => {
            const profile = data.profile[0];
            const statements = data.statements.filter(s => s.profile_id === profile.profile_id);
            const videos = data.video.filter(v => v.speaker === profile.name);

            let html = `
              <h2>${profile.name}</h2>
              <p><strong>Age:</strong> ${profile.age}</p>
              <p><strong>Education:</strong> ${profile.education} (${profile.university})</p>
              <p><strong>Background:</strong> ${profile.job_background}</p>
              <p><strong>Political Career:</strong> ${profile.political_career}</p>
              <p><strong>Notable Contributions:</strong> ${profile.notable_contributions}</p>
              <hr />
              <h4>Recent Statements</h4>
              <ul>${statements.slice(0, 3).map(s => `<li><strong>${s.year}:</strong> ${s.summary}</li>`).join("")}</ul>
              <h4>Related Videos</h4>
              <ul>${videos.slice(0, 3).map(v => `<li><a href="${v.link}" target="_blank">${v.title}</a> (${v.date})</li>`).join("")}</ul>
            `;

            document.getElementById("mpProfileContent").innerHTML = html;
          })
          .catch(err => {
            document.getElementById("mpProfileContent").innerHTML = "<p>Error loading MP data.</p>";
            console.error("Fetch error:", err);
          });
      });
    }); */

document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("mpProfileModal");
  const modalContent = document.getElementById("mpProfileContent");
  
  let mpData = null;

  // Open modal on button click
  document.getElementById("mpProfileBtn").addEventListener("click", function () {
    fetch("/data/mp_profile")
      .then(res => res.json())
      .then(data => {
        mpData = data;
        showProfileList();
        modal.style.display = "flex";
      })
      .catch(err => {
        modalContent.innerHTML = "<div class='alert alert-danger'>Error loading MP data.</div>";
        console.error("Fetch error:", err);
      });
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

    document.querySelectorAll(".profile-btn").forEach(btn => {
      btn.addEventListener("click", function () {
        const profileId = parseInt(this.dataset.id);
        showVideos(profileId);
      });
    });
  }

  // Show Related Videos
  function showVideos(profileId) {
    const profile = mpData.profile.find(p => p.profile_id === profileId);
    const videos = mpData.video.filter(v => v.speaker === profile.name);

    modalContent.innerHTML = `
      <button class="btn btn-outline-secondary mb-3 back-btn">
        <i class="bi bi-arrow-left"></i> Back to Profiles
      </button>
      <h3 class="mb-3">${profile.name} - Related Videos</h3>
      <div class="list-group">
        ${videos.map(v => `
          <button class="list-group-item list-group-item-action video-btn" data-id="${v.youtube_id}">
            <i class="bi bi-play-btn"></i> ${v.title}
            <small class="text-muted">(${v.date})</small>
          </button>`).join("")}
      </div>
    `;

    document.querySelector(".back-btn").addEventListener("click", showProfileList);

    document.querySelectorAll(".video-btn").forEach(btn => {
      btn.addEventListener("click", function () {
        const youtubeId = this.dataset.id;
        showVideoDetails(profileId, youtubeId);
      });
    });
  }

  function showVideoDetails(profileId, youtubeId) {
  const profile = mpData.profile.find(p => p.profile_id === profileId);
  const video = mpData.video.find(v => v.youtube_id === youtubeId);
  const statements = mpData.statements.filter(s => s.youtube_id === youtubeId);
  const comments = mpData.comments.filter(c => c.youtube_id === youtubeId);

  modalContent.innerHTML = `
    <button class="btn btn-outline-secondary mb-3 back-btn">
      <i class="bi bi-arrow-left"></i> Back to Videos
    </button>
    <div class="card shadow-sm">
      <div class="card-body">
        <h4 class="card-title">${video.title}</h4>
        <p><small class="text-muted">${video.date}</small></p>
        <div class="d-flex gap-2">
          <a href="${video.link}" target="_blank" class="btn btn-danger btn-sm">
            <i class="bi bi-youtube"></i> Watch on YouTube
          </a>
          <button class="btn btn-primary btn-sm analytics-btn">
            <i class="bi bi-graph-up"></i> Analytics
          </button>
        </div>
      </div>
    </div>

    <hr>

    <h5>Statements</h5>
    ${statements.length ? 
      `<ul class="list-group mb-3">
        ${statements.map(s => `
          <li class="list-group-item">
            <strong>${s.year}:</strong> ${s.summary}
          </li>`).join("")}
      </ul>` : 
      `<p class="text-muted">No statements available.</p>`}

    <h5>Comments</h5>
    ${comments.length ? 
      `<ul class="list-group">
        ${comments.map(c => `
          <li class="list-group-item">
            <strong>${c.username}:</strong> ${c.comment}
            <br><small class="text-muted">${c.estimated_date || ''}</small>
          </li>`).join("")}
      </ul>` : 
      `<p class="text-muted">No comments available.</p>`}
  `;

  // Back button works
  document.querySelector(".back-btn").addEventListener("click", function () {
    showVideos(profileId);
  });

  // Analytics button works
  document.querySelector(".analytics-btn").addEventListener("click", function () {
    showAnalyticsOptions(profileId, youtubeId);
  });
}

// --- Analytics Section ---
function showAnalyticsOptions(profileId, youtubeId) {
  const analyticsHtml = `
    <div class="mt-3">
      <button class="btn btn-outline-primary me-2" id="sentimentTimeBtn">Sentiment Over Time</button>
      <button class="btn btn-outline-primary me-2" id="sentimentThemeBtn">Sentiment by Theme</button>
      <button class="btn btn-outline-primary" id="sentimentProfileBtn">Sentiment by Profile</button>
    </div>
    <div class="mt-3">
      <canvas id="analyticsChart" style="max-height:400px;"></canvas>
    </div>
  `;
  document.getElementById("analyticsContainer").innerHTML = analyticsHtml;

  let analyticsChart = null; // Local chart reference

  // Helper to destroy previous chart safely
  function renderAnalyticsChart(type, chartData) {
    if (analyticsChart) {
      analyticsChart.destroy();
    }
    analyticsChart = new Chart(document.getElementById("analyticsChart"), chartData);
  }

  // --- Button Actions ---
  document.getElementById("sentimentTimeBtn").addEventListener("click", function () {
    const videoComments = mpData.comments.filter(c => c.youtube_id === youtubeId);
    const videoStatements = mpData.statements.filter(s => s.youtube_id === youtubeId);

    // Merge & group by month-year
    const allData = [...videoComments, ...videoStatements];
    const grouped = {};
    allData.forEach(item => {
      const dateKey = (item.estimated_date || item.date || "Unknown").slice(0, 7);
      if (!grouped[dateKey]) grouped[dateKey] = { Positive: 0, Neutral: 0, Negative: 0 };
      grouped[dateKey][item.rule_sentiment_updated || item.rule_sentiment]++;
    });

    const labels = Object.keys(grouped);
    const pos = labels.map(l => grouped[l].Positive);
    const neu = labels.map(l => grouped[l].Neutral);
    const neg = labels.map(l => grouped[l].Negative);

    renderAnalyticsChart("bar", {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "Positive", data: pos, backgroundColor: "green" },
          { label: "Neutral", data: neu, backgroundColor: "gray" },
          { label: "Negative", data: neg, backgroundColor: "red" }
        ]
      },
      options: { responsive: true, plugins: { title: { display: true, text: "Sentiment Over Time" } }, scales: { x: { stacked: true }, y: { stacked: true } } }
    });
  });

  document.getElementById("sentimentThemeBtn").addEventListener("click", function () {
    const videoStatements = mpData.statements.filter(s => s.youtube_id === youtubeId);

    const grouped = {};
    videoStatements.forEach(s => {
      if (!grouped[s.theme]) grouped[s.theme] = { Positive: 0, Neutral: 0, Negative: 0 };
      grouped[s.theme][s.tone]++;
    });

    const labels = Object.keys(grouped);
    const pos = labels.map(l => grouped[l].Positive);
    const neu = labels.map(l => grouped[l].Neutral);
    const neg = labels.map(l => grouped[l].Negative);

    renderAnalyticsChart("bar", {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "Positive", data: pos, backgroundColor: "green" },
          { label: "Neutral", data: neu, backgroundColor: "gray" },
          { label: "Negative", data: neg, backgroundColor: "red" }
        ]
      },
      options: { responsive: true, plugins: { title: { display: true, text: "Sentiment by Theme" } } }
    });
  });

  document.getElementById("sentimentProfileBtn").addEventListener("click", function () {
    const profileComments = mpData.comments.filter(c => c.profile_id === profileId);
    const profileStatements = mpData.statements.filter(s => s.profile_id === profileId);

    const allData = [...profileComments, ...profileStatements];
    let counts = { Positive: 0, Neutral: 0, Negative: 0 };
    allData.forEach(item => {
      counts[item.rule_sentiment_updated || item.rule_sentiment]++;
    });

    renderAnalyticsChart("pie", {
      type: "pie",
      data: {
        labels: ["Positive", "Neutral", "Negative"],
        datasets: [{
          data: [counts.Positive, counts.Neutral, counts.Negative],
          backgroundColor: ["green", "gray", "red"]
        }]
      },
      options: { responsive: true, plugins: { title: { display: true, text: "Sentiment by Profile" } } }
    });
  });
}

});

    


