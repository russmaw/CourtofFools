// Rating system mapping
const RATING_SYSTEM = {
    'F': 1,
    'E': 2,
    'D': 3,
    'C': 4,
    'B': 5,
    'A': 6,
    'S': 7,
    'SS': 8,
    'SSS': 9
};

// Stats categories
const STATS_CATEGORIES = [
    'Damage Output',
    'Fighting Prowess',
    'Accessible Resources',
    'Likeability',
    'Allies',
    'Stealth',
    'Magic',
    'Tactics',
    'Intelligence',
    'Durability',
    'Speed',
    'Range'
];

// Initialize charts
let heroicStatsChart;
let meatStatsChart;

// Character data storage
let characters = JSON.parse(localStorage.getItem('characters')) || [];

// DOM Elements
const addCharacterBtn = document.getElementById('addCharacterBtn');
const characterSelect = document.getElementById('characterSelect');
const characterProfile = document.getElementById('characterProfile');
const characterName = document.getElementById('characterName');
const profession = document.getElementById('profession');
const advancedProfession = document.getElementById('advancedProfession');
const magicalItemsList = document.getElementById('magicalItemsList');
const notesList = document.getElementById('notesList');
const addMagicalItemBtn = document.getElementById('addMagicalItemBtn');
const addNoteBtn = document.getElementById('addNoteBtn');

// Initialize the application
function init() {
    updateCharacterSelect();
    setupEventListeners();
    initializeCharts();
}

// Setup event listeners
function setupEventListeners() {
    addCharacterBtn.addEventListener('click', createNewCharacter);
    characterSelect.addEventListener('change', loadCharacter);
    addMagicalItemBtn.addEventListener('click', addMagicalItem);
    addNoteBtn.addEventListener('click', addNote);
}

// Initialize radar charts
function initializeCharts() {
    const chartConfig = {
        type: 'radar',
        data: {
            labels: STATS_CATEGORIES,
            datasets: [{
                label: 'Stats',
                data: Array(STATS_CATEGORIES.length).fill(0),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2
            }]
        },
        options: {
            scales: {
                r: {
                    beginAtZero: true,
                    max: 9,
                    ticks: {
                        stepSize: 1,
                        callback: function(value) {
                            return Object.keys(RATING_SYSTEM).find(key => RATING_SYSTEM[key] === value);
                        }
                    }
                }
            }
        }
    };

    heroicStatsChart = new Chart(document.getElementById('heroicStatsChart'), chartConfig);
    meatStatsChart = new Chart(document.getElementById('meatStatsChart'), chartConfig);
}

// Create a new character
function createNewCharacter() {
    const newCharacter = {
        id: Date.now(),
        name: '',
        profession: '',
        advancedProfession: '',
        heroicStats: {},
        meatStats: {},
        magicalItems: [],
        notes: []
    };

    // Initialize stats with F rating
    STATS_CATEGORIES.forEach(category => {
        newCharacter.heroicStats[category] = 'F';
        newCharacter.meatStats[category] = 'F';
    });

    characters.push(newCharacter);
    saveCharacters();
    updateCharacterSelect();
    loadCharacter(newCharacter.id);
}

// Update character select dropdown
function updateCharacterSelect() {
    characterSelect.innerHTML = '<option value="">Select a Character</option>';
    characters.forEach(char => {
        const option = document.createElement('option');
        option.value = char.id;
        option.textContent = char.name || 'Unnamed Character';
        characterSelect.appendChild(option);
    });
}

// Load character data
function loadCharacter(characterId) {
    const character = characters.find(char => char.id === parseInt(characterId));
    if (!character) return;

    characterName.value = character.name;
    profession.value = character.profession;
    advancedProfession.value = character.advancedProfession;

    // Update charts
    updateChart(heroicStatsChart, character.heroicStats);
    updateChart(meatStatsChart, character.meatStats);

    // Update magical items
    magicalItemsList.innerHTML = '';
    character.magicalItems.forEach(item => {
        addMagicalItem(item);
    });

    // Update notes
    notesList.innerHTML = '';
    character.notes.forEach(note => {
        addNote(note);
    });

    // Update overall ratings
    updateOverallRatings(character);
}

// Update chart data
function updateChart(chart, stats) {
    chart.data.datasets[0].data = STATS_CATEGORIES.map(category => RATING_SYSTEM[stats[category]]);
    chart.update();
}

// Add magical item
function addMagicalItem(itemData = {}) {
    const template = document.getElementById('magicalItemTemplate');
    const itemElement = template.content.cloneNode(true);
    
    const itemName = itemElement.querySelector('.item-name');
    const itemDescription = itemElement.querySelector('.item-description');
    const deleteBtn = itemElement.querySelector('.delete-btn');

    itemName.value = itemData.name || '';
    itemDescription.value = itemData.description || '';

    deleteBtn.addEventListener('click', () => {
        itemElement.querySelector('.magical-item').remove();
        saveCurrentCharacter();
    });

    magicalItemsList.appendChild(itemElement);
}

// Add note
function addNote(noteData = {}) {
    const template = document.getElementById('noteTemplate');
    const noteElement = template.content.cloneNode(true);
    
    const noteTitle = noteElement.querySelector('.note-title');
    const noteContent = noteElement.querySelector('.note-content');
    const deleteBtn = noteElement.querySelector('.delete-btn');

    noteTitle.value = noteData.title || '';
    noteContent.value = noteData.content || '';

    deleteBtn.addEventListener('click', () => {
        noteElement.querySelector('.note').remove();
        saveCurrentCharacter();
    });

    notesList.appendChild(noteElement);
}

// Save current character data
function saveCurrentCharacter() {
    const characterId = parseInt(characterSelect.value);
    if (!characterId) return;

    const character = characters.find(char => char.id === characterId);
    if (!character) return;

    character.name = characterName.value;
    character.profession = profession.value;
    character.advancedProfession = advancedProfession.value;

    // Save magical items
    character.magicalItems = Array.from(magicalItemsList.children).map(item => ({
        name: item.querySelector('.item-name').value,
        description: item.querySelector('.item-description').value
    }));

    // Save notes
    character.notes = Array.from(notesList.children).map(note => ({
        title: note.querySelector('.note-title').value,
        content: note.querySelector('.note-content').value
    }));

    saveCharacters();
}

// Save all characters to localStorage
function saveCharacters() {
    localStorage.setItem('characters', JSON.stringify(characters));
}

// Calculate and update overall ratings
function updateOverallRatings(character) {
    const heroicAverage = calculateAverageRating(character.heroicStats);
    const meatAverage = calculateAverageRating(character.meatStats);

    document.getElementById('heroicRating').textContent = `Heroic Rating: ${heroicAverage}`;
    document.getElementById('meatRating').textContent = `Meat Rating: ${meatAverage}`;
}

// Calculate average rating
function calculateAverageRating(stats) {
    const values = Object.values(stats).map(rating => RATING_SYSTEM[rating]);
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    return Object.keys(RATING_SYSTEM).find(key => 
        RATING_SYSTEM[key] === Math.round(average)
    );
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', init); 