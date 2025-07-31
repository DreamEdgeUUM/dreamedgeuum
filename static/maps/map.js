document.addEventListener("DOMContentLoaded", function() {
    var map = L.map("map-container").setView([6.5, 100.4], 11); // Adjust coordinates

    // Add base tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors"
    }).addTo(map);

    // Example of adding a marker (you can customize this)
    L.marker([6.5, 100.4]).addTo(map)
        .bindPopup("<b>Kubang Pasu</b><br>Voter Density: High")
        .openPopup();
});