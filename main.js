// Исходные данные
const data = {
    words: [
        { idword: 1, word: "word1", region: "Region1", centerregion: { x: 150, y: 150 }, gps: "40.7128, -74.0060", comments: ["Первый комментарий"] },
        { idword: 2, word: "word2", region: "Region1", centerregion: { x: 150, y: 150 }, gps: "40.7128, -74.0060", comments: [] },
        { idword: 3, word: "word2", region: "Region2", centerregion: { x: 250, y: 200 }, gps: "34.0522, -118.2437", comments: [] },
        { idword: 4, word: "word3", region: "Region2", centerregion: { x: 250, y: 200 }, gps: "34.0522, -118.2437", comments: ["test1"] },
        { idword: 5, word: "word1", region: "Region3", centerregion: { x: 350, y: 250 }, gps: "51.5074, -0.1278", comments: ["Комментарий в Лондоне"] },
        { idword: 6, word: "word3", region: "Region3", centerregion: { x: 350, y: 250 }, gps: "51.5074, -0.1278", comments: ["test2"] },
        { idword: 7, word: "word4", region: "Region3", centerregion: { x: 350, y: 250 }, gps: "51.5074, -0.1278", comments: [] }
    ]
};

// Формирование уникального списка слов и привязка иконок
const words = [...new Set(data.words.map(w => w.word))];
const wordToIconMap = new Map();
const icons = ["oval", "triangle", "quadro"];

words.forEach((word, index) => {
    const iconType = icons[index % icons.length];
    wordToIconMap.set(word, `icon/${iconType}/${iconType}_${Math.ceil((index + 1) / icons.length)}.png`);
});

// Функция размещения иконок на карте
function placeIcons() {
    const mapContainer = document.getElementById("map-container");
    mapContainer.innerHTML = `<img id="map" src="map.jpg" alt="Map">`;
    
    // Группируем записи по региону
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
            
            // Создаем изображение иконки
            const iconImage = document.createElement("img");
            iconImage.src = iconPath;
            iconImage.alt = wordData.word;
            iconElement.appendChild(iconImage);
            
            // При наведении выделяем слово
            iconElement.addEventListener("mouseenter", () => highlightWord(wordData.word));
            iconElement.addEventListener("mouseleave", () => unhighlightWord(wordData.word));
            
            // При клике выделяем слово и регион, обновляем таблицы и детали
            iconElement.addEventListener("click", () => {
                resetHighlight();
                highlightWord(wordData.word);
                highlightRegionsForWord(wordData.word);
                showTables(wordData.word);
                selectWordAndRegion(wordData.word, wordData.region);
                showDetails(wordData.idword);
            });
            
            mapContainer.appendChild(iconElement);
        });
    });
}

// Функции для подсветки и сброса выделений иконок
function highlightWord(word) {
    document.querySelectorAll(".icon img").forEach(img => {
        if (img.alt === word) {
            img.style.filter = "brightness(1.5)";
        }
    });
}

function unhighlightWord(word) {
    document.querySelectorAll(".icon img").forEach(img => {
        if (img.alt === word) {
            img.style.filter = "brightness(1)";
        }
    });
}

function highlightRegionsForWord(word) {
    document.querySelectorAll(".icon").forEach(icon => {
        if (icon.dataset.word === word) {
            icon.style.border = "2px solid red";
        }
    });
}

function resetHighlight() {
    // Сбрасываем границы у всех иконок
    document.querySelectorAll(".icon").forEach(icon => {
        icon.style.border = "none";
    });
    // Снимаем выделение с ячеек таблиц
    document.querySelectorAll(".word, .region").forEach(el => el.classList.remove("selected"));
}

// Функция отображения таблиц слов и регионов
function showTables(selectedWord) {
    const tableWords = document.getElementById("word-table");
    // Отображаем уникальные слова без дублирования
    tableWords.innerHTML = words
        .map(word => `<tr><td class="word" onclick="handleWordClick('${word}')">${word}</td></tr>`)
        .join("");
    
    if (selectedWord) {
        // Подсвечиваем выбранное слово в таблице
        document.querySelectorAll(".word").forEach(el => {
            if (el.textContent === selectedWord) el.classList.add("selected");
        });
        // Формируем таблицу регионов для выбранного слова
        const tableRegions = document.getElementById("region-table");
        const filteredRegions = [...new Set(data.words.filter(w => w.word === selectedWord).map(w => w.region))];
        tableRegions.innerHTML = filteredRegions
            .map(region => `<tr><td class="region" onclick="handleRegionClick('${region}')">${region}</td></tr>`)
            .join("");
    }
}

// Обработчик клика по слову из таблицы
function handleWordClick(word) {
    resetHighlight();
    highlightWord(word);
    highlightRegionsForWord(word);
    selectWord(word);
    const firstData = data.words.find(w => w.word === word);
    if (firstData) {
        showDetails(firstData.idword);
    }
}

// Выделение выбранного слова и формирование таблицы регионов для него
function selectWord(word) {
    // Подсвечиваем слово в таблице
    document.querySelectorAll(".word").forEach(el => {
        if (el.textContent === word) el.classList.add("selected");
    });
    // Формируем таблицу регионов для выбранного слова
    const tableRegions = document.getElementById("region-table");
    const filteredRegions = [...new Set(data.words.filter(w => w.word === word).map(w => w.region))];
    tableRegions.innerHTML = filteredRegions
        .map(region => `<tr><td class="region" onclick="handleRegionClick('${region}')">${region}</td></tr>`)
        .join("");
}

// Обработчик клика по региону из таблицы
function handleRegionClick(region) {
    // Сбрасываем выделение для регионов
    resetRegionHighlight();
    selectRegion(region);
    // Получаем текущее выбранное слово из таблицы слов
    const currentWordElement = document.querySelector(".word.selected");
    let word = currentWordElement ? currentWordElement.textContent : null;
    let selectedData;
    if (word) {
        selectedData = data.words.find(w => w.word === word && w.region === region);
    }
    if (!selectedData) {
        // Если по выбранному слову нет совпадения, берем первое совпадение по региону
        selectedData = data.words.find(w => w.region === region);
    }
    if (selectedData) {
        highlightWord(selectedData.word);
        highlightRegionsForWord(selectedData.word);
        showDetails(selectedData.idword);
        selectRegion(region);
    }
}

function resetRegionHighlight() {
    document.querySelectorAll(".region").forEach(el => el.classList.remove("selected"));
}

// Выделение выбранного региона в таблице
function selectRegion(region) {
    document.querySelectorAll(".region").forEach(el => {
        if (el.textContent === region) el.classList.add("selected");
    });
}

// Выделение выбранных слова и региона одновременно (при клике на иконку)
function selectWordAndRegion(word, region) {
    selectWord(word);
    selectRegion(region);
}

// Отображение деталей: GPS и комментариев
function showDetails(idword) {
    const wordData = data.words.find(w => w.idword == idword);
    if (!wordData) return;
    
    const gpsInput = document.getElementById("gps-coordinates");
    gpsInput.value = wordData.gps;
    
    const saveGpsButton = document.getElementById("save-gps");
    saveGpsButton.onclick = () => {
        const newGps = gpsInput.value.trim();
        if (newGps) {
            wordData.gps = newGps;
            alert("GPS координаты обновлены!");
        }
    };
    
    const commentsContainer = document.getElementById("comments");
    commentsContainer.innerHTML = wordData.comments.map(comment => `<p>${comment}</p>`).join("");
    
    document.getElementById("comment-form").onsubmit = (e) => {
        e.preventDefault();
        const commentInput = document.getElementById("new-comment");
        if (commentInput.value.trim()) {
            wordData.comments.push(commentInput.value.trim());
            commentInput.value = "";
            showDetails(idword);
        }
    };
}

// Обработчики загрузки и изменения размеров окна
window.addEventListener("load", () => {
    placeIcons();
    showTables();
});

window.addEventListener("resize", placeIcons);
