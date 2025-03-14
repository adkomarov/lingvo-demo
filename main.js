const data = {
    words: [
        { idword: 1, word: "word1", region: "Region1", centerregion: { x: 150, y: 150 }, gps: "40.7128, -74.0060", comments: ["Первый комментарий"] },
        { idword: 2, word: "word2", region: "Region1", centerregion: { x: 150, y: 150 }, gps: "40.7128, -74.0060", comments: [] },
        { idword: 3, word: "word2", region: "Region2", centerregion: { x: 250, y: 200 }, gps: "34.0522, -118.2437", comments: [] },
        { idword: 4, word: "word3", region: "Region2", centerregion: { x: 250, y: 200 }, gps: "34.0522, -118.2437", comments: [] },
        { idword: 5, word: "word1", region: "Region3", centerregion: { x: 350, y: 250 }, gps: "51.5074, -0.1278", comments: ["Комментарий в Лондоне"] },
        { idword: 6, word: "word3", region: "Region3", centerregion: { x: 350, y: 250 }, gps: "51.5074, -0.1278", comments: [] },
        { idword: 7, word: "word4", region: "Region3", centerregion: { x: 350, y: 250 }, gps: "51.5074, -0.1278", comments: [] }
    ]
};

// Уникальные слова и привязка иконок
const words = [...new Set(data.words.map(w => w.word))];
const wordToIconMap = new Map();
const icons = ["oval", "triangle", "quadro"];

words.forEach((word, index) => {
    const iconType = icons[index % icons.length];
    wordToIconMap.set(word, `icon/${iconType}/${iconType}_${Math.ceil((index + 1) / icons.length)}.png`);
});

function placeIcons() {
    const mapContainer = document.getElementById("map-container");
    mapContainer.innerHTML = `<img id="map" src="map.jpg" alt="Map">`;

    const groupedByRegion = data.words.reduce((acc, item) => {
        acc[item.region] = acc[item.region] || [];
        acc[item.region].push(item);
        return acc;
    }, {});

    Object.values(groupedByRegion).forEach(regionWords => {
        const numWords = regionWords.length;
        const { x: centerX, y: centerY } = regionWords[0].centerregion;
        const baseRadius = 9;
        const radius = baseRadius + numWords * 5;
        const angleStep = (2 * Math.PI) / numWords;

        regionWords.forEach((wordData, index) => {
            const iconPath = wordToIconMap.get(wordData.word);
            const angle = angleStep * index;
            const offsetX = radius * Math.cos(angle);
            const offsetY = radius * Math.sin(angle);

            const xPercent = ((centerX + offsetX) / 500) * 100;
            const yPercent = ((centerY + offsetY) / 500) * 100;

            const iconElement = document.createElement("button");
            iconElement.className = "icon";
            iconElement.style.left = `${xPercent}%`;
            iconElement.style.top = `${yPercent}%`;
            iconElement.dataset.word = wordData.word;
            iconElement.dataset.region = wordData.region;
            iconElement.dataset.idword = wordData.idword;

            const iconImage = document.createElement("img");
            iconImage.src = iconPath;
            iconImage.alt = wordData.word;
            iconElement.appendChild(iconImage);

            iconElement.addEventListener("mouseenter", () => highlightWord(wordData.word));
            iconElement.addEventListener("mouseleave", () => unhighlightWord(wordData.word));

            iconElement.addEventListener("click", () => {
                resetHighlight();
                highlightWord(wordData.word);
                highlightRegionsForWord(wordData.word);
                showTables();
                selectWordAndRegion(wordData.word, wordData.region);
                showDetails(wordData.idword); // Обновляем комментарии при клике
            });

            document.getElementById("map-container").appendChild(iconElement);
        });
    });
}

// Подсветка всех иконок с одним и тем же словом
function highlightWord(word) {
    document.querySelectorAll(".icon img").forEach(img => {
        if (img.alt === word) {
            img.style.filter = "brightness(1.5)";
        }
    });
}

// Убрать подсветку
function unhighlightWord(word) {
    document.querySelectorAll(".icon img").forEach(img => {
        if (img.alt === word) {
            img.style.filter = "brightness(1)";
        }
    });
}

// Подсветить все регионы, содержащие слово
function highlightRegionsForWord(word) {
    document.querySelectorAll(".icon").forEach(icon => {
        if (icon.dataset.word === word) {
            icon.style.border = "2px solid red";
        }
    });
}

// Сбросить выделение
function resetHighlight() {
    document.querySelectorAll(".icon").forEach(icon => {
        icon.style.border = "none";
    });
    document.querySelectorAll(".word, .region").forEach(el => {
        el.classList.remove("selected");
    });
}

// Отображение таблицы слов
function showTables() {
    const tableWords = document.getElementById("word-table");
    tableWords.innerHTML = words.map(word => `<tr><td class="word" onclick="handleWordClick('${word}')">${word}</td></tr>`).join("");
}

// Обработчик клика по слову
function handleWordClick(word) {
    resetHighlight();
    highlightWord(word);
    highlightRegionsForWord(word);
    selectWord(word);

    // Находим первый регион для этого слова и показываем его детали
    const firstRegionData = data.words.find(w => w.word === word);
    if (firstRegionData) {
        showDetails(firstRegionData.idword);
    }
}

// Отобразить регионы по слову
function selectWord(word) {
    document.querySelectorAll(".word").forEach(el => {
        if (el.textContent === word) el.classList.add("selected");
    });

    const tableRegions = document.getElementById("region-table");
    const filteredRegions = [...new Set(data.words.filter(w => w.word === word).map(w => w.region))];

    tableRegions.innerHTML = filteredRegions.map(region => `
        <tr><td class="region" onclick="handleRegionClick('${region}')">${region}</td></tr>
    `).join("");
}

// Обработчик клика по региону
function handleRegionClick(region) {
    resetHighlight();
    selectRegion(region);

    // Находим первое слово для этого региона и показываем его детали
    const firstWordData = data.words.find(w => w.region === region);
    if (firstWordData) {
        showDetails(firstWordData.idword);
    }
}

// Подсветка выбранного региона
function selectRegion(region) {
    document.querySelectorAll(".region").forEach(el => {
        el.classList.remove("selected");
        if (el.textContent === region) el.classList.add("selected");
    });
}

// Подсветка выбранного слова и региона при клике на иконку
function selectWordAndRegion(word, region) {
    selectWord(word);
    selectRegion(region);
}

// Отобразить детали региона
function showDetails(idword) {
    const wordData = data.words.find(w => w.idword == idword);
    if (!wordData) return;

    // Отображение GPS
    const gpsInput = document.getElementById("gps-coordinates");
    gpsInput.value = wordData.gps;

    // Кнопка сохранения GPS
    const saveGpsButton = document.getElementById("save-gps");
    saveGpsButton.onclick = () => {
        const newGps = gpsInput.value.trim();
        if (newGps) {
            wordData.gps = newGps;
            alert("GPS координаты обновлены!");
        }
    };

    // Отображение комментариев
    const commentsContainer = document.getElementById("comments");
    commentsContainer.innerHTML = wordData.comments.map(comment => `<p>${comment}</p>`).join("");

    // Форма добавления комментария
    document.getElementById("comment-form").onsubmit = (e) => {
        e.preventDefault();
        const commentInput = document.getElementById("new-comment");
        if (commentInput.value.trim()) {
            wordData.comments.push(commentInput.value.trim());
            commentInput.value = "";
            showDetails(idword); // Обновляем отображение комментариев
        }
    };
}

window.addEventListener("load", placeIcons);
window.addEventListener("resize", placeIcons);