var color = ["CadetBlue", "Crimson", "DarkCyan", "DarkOliveGreen", "DarkMagenta", "DarkSlateGrey", "ForestGreen", "SteelBlue", "Tomato", "GoldenRod", "DimGrey"];

// dom ready
document.addEventListener("DOMContentLoaded", function (event) {
    start()
});

function start() {
    document.getElementById("BG").style.backgroundColor = color[Math.floor(Math.random() * color.length)];
}