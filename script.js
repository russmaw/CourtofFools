// Rating system mapping with descriptions
const RATING_SYSTEM = {
    'F': { value: 1, description: 'Supreme incompetence - Complete inability to perform the task' },
    'E': { value: 2, description: 'Poor - Significant difficulty in performing the task' },
    'D': { value: 3, description: 'Below Average - Struggles with the task' },
    'C': { value: 4, description: 'Average - Competent but unremarkable' },
    'B': { value: 5, description: 'Above Average - Skilled at the task' },
    'A': { value: 6, description: 'Peak of Natural Skill - Maximum achievable through normal means' },
    'S': { value: 7, description: 'Supernatural - Beyond natural limits through special abilities or items' },
    'SS': { value: 8, description: 'Legendary - Exceptional supernatural ability or power' },
    'SSS': { value: 9, description: 'Mythic - Unprecedented power or ability, unique in the world' }
};

// Stats categories
const HEROIC_STATS = [
    'Damage Output',
    'Accessible Resources',
    'Allies',
    'Stealth',
    'Magic',
    'Tactics',
    'Durability',
    'Range'
];

const MEAT_STATS = [
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
let currentCharacter = null;

// DOM Elements
const addCharacterBtn = document.getElementById('addCharacterBtn');
const characterSelect = document.getElementById('characterSelect');
const deleteCharacterBtn = document.getElementById('deleteCharacterBtn');
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
    deleteCharacterBtn.addEventListener('click', deleteCurrentCharacter);
    addMagicalItemBtn.addEventListener('click', () => addMagicalItem());
    addNoteBtn.addEventListener('click', () => addNote());

    // Add event listeners for input changes
    characterName.addEventListener('change', saveCurrentCharacter);
    profession.addEventListener('change', saveCurrentCharacter);
    advancedProfession.addEventListener('change', saveCurrentCharacter);
}

// Initialize radar charts
function initializeCharts() {
    const heroicConfig = {
        type: 'radar',
        data: {
            labels: HEROIC_STATS,
            datasets: [{
                label: 'Heroic',
                data: Array(HEROIC_STATS.length).fill(1), // Start with F rating
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2
            }]
        },
        options: {
            scales: {
                r: {
                    beginAtZero: true,
                    min: 1,
                    max: 9,
                    ticks: {
                        stepSize: 1,
                        callback: function(value) {
                            return Object.keys(RATING_SYSTEM).find(key => RATING_SYSTEM[key].value === value) || '';
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const rating = Object.keys(RATING_SYSTEM).find(key => 
                                RATING_SYSTEM[key].value === context.raw
                            );
                            return `${rating}: ${RATING_SYSTEM[rating].description}`;
                        }
                    }
                }
            },
            onClick: function(event, elements) {
                const chart = this;
                const points = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);
                
                if (points.length) {
                    const point = points[0];
                    const datasetIndex = point.datasetIndex;
                    const index = point.index;
                    
                    // Show rating selector
                    showRatingSelector(event.x, event.y, (rating) => {
                        const currentValue = chart.data.datasets[datasetIndex].data[index];
                        chart.data.datasets[datasetIndex].data[index] = RATING_SYSTEM[rating].value;
                        chart.update();
                        
                        // Save the changes
                        currentCharacter.heroicStats[HEROIC_STATS[index]] = rating;
                        saveCurrentCharacter();
                        updateOverallRatings(currentCharacter);
                    });
                }
            }
        }
    };

    const meatConfig = {
        type: 'radar',
        data: {
            labels: MEAT_STATS,
            datasets: [{
                label: 'Meat',
                data: Array(MEAT_STATS.length).fill(1), // Start with F rating
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2
            }]
        },
        options: {
            scales: {
                r: {
                    beginAtZero: true,
                    min: 1,
                    max: 9,
                    ticks: {
                        stepSize: 1,
                        callback: function(value) {
                            return Object.keys(RATING_SYSTEM).find(key => RATING_SYSTEM[key].value === value) || '';
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const rating = Object.keys(RATING_SYSTEM).find(key => 
                                RATING_SYSTEM[key].value === context.raw
                            );
                            return `${rating}: ${RATING_SYSTEM[rating].description}`;
                        }
                    }
                }
            },
            onClick: function(event, elements) {
                const chart = this;
                const points = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);
                
                if (points.length) {
                    const point = points[0];
                    const datasetIndex = point.datasetIndex;
                    const index = point.index;
                    
                    // Show rating selector
                    showRatingSelector(event.x, event.y, (rating) => {
                        const currentValue = chart.data.datasets[datasetIndex].data[index];
                        chart.data.datasets[datasetIndex].data[index] = RATING_SYSTEM[rating].value;
                        chart.update();
                        
                        // Save the changes
                        currentCharacter.meatStats[MEAT_STATS[index]] = rating;
                        saveCurrentCharacter();
                        updateOverallRatings(currentCharacter);
                    });
                }
            }
        }
    };

    heroicStatsChart = new Chart(document.getElementById('heroicStatsChart'), heroicConfig);
    meatStatsChart = new Chart(document.getElementById('meatStatsChart'), meatConfig);
}

// Show rating selector popup
function showRatingSelector(x, y, callback) {
    // Remove any existing rating selector
    const existingSelector = document.getElementById('ratingSelector');
    if (existingSelector) {
        existingSelector.remove();
    }

    // Create rating selector
    const selector = document.createElement('div');
    selector.id = 'ratingSelector';
    selector.style.position = 'absolute';
    selector.style.left = `${x}px`;
    selector.style.top = `${y}px`;
    selector.style.backgroundColor = 'var(--card-background)';
    selector.style.border = '1px solid var(--border-color)';
    selector.style.borderRadius = 'var(--border-radius)';
    selector.style.padding = '8px';
    selector.style.zIndex = '1000';
    selector.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';

    // Add rating options
    Object.keys(RATING_SYSTEM).forEach(rating => {
        const option = document.createElement('div');
        option.textContent = rating;
        option.style.padding = '4px 8px';
        option.style.cursor = 'pointer';
        option.style.borderRadius = '2px';
        
        option.addEventListener('mouseover', () => {
            option.style.backgroundColor = 'var(--accent-color)';
        });
        
        option.addEventListener('mouseout', () => {
            option.style.backgroundColor = 'transparent';
        });
        
        option.addEventListener('click', () => {
            callback(rating);
            selector.remove();
        });
        
        selector.appendChild(option);
    });

    // Close when clicking outside
    document.addEventListener('click', function closeSelector(e) {
        if (!selector.contains(e.target)) {
            selector.remove();
            document.removeEventListener('click', closeSelector);
        }
    });

    document.body.appendChild(selector);
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
    HEROIC_STATS.forEach(category => {
        newCharacter.heroicStats[category] = 'F';
    });
    MEAT_STATS.forEach(category => {
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
    currentCharacter = characters.find(char => char.id === (typeof characterId === 'string' ? parseInt(characterId) : characterId));
    if (!currentCharacter) return;

    characterSelect.value = currentCharacter.id;
    characterName.value = currentCharacter.name;
    profession.value = currentCharacter.profession;
    advancedProfession.value = currentCharacter.advancedProfession;

    // Update charts
    updateChart(heroicStatsChart, currentCharacter.heroicStats, HEROIC_STATS);
    updateChart(meatStatsChart, currentCharacter.meatStats, MEAT_STATS);

    // Update magical items
    magicalItemsList.innerHTML = '';
    currentCharacter.magicalItems.forEach(item => {
        addMagicalItem(item);
    });

    // Update notes
    notesList.innerHTML = '';
    currentCharacter.notes.forEach(note => {
        addNote(note);
    });

    // Update overall ratings
    updateOverallRatings(currentCharacter);
}

// Update chart data
function updateChart(chart, stats, categories) {
    chart.data.datasets[0].data = categories.map(category => RATING_SYSTEM[stats[category]].value);
    chart.update();
}

// Add magical item
function addMagicalItem(itemData = {}) {
    const itemContainer = document.createElement('div');
    itemContainer.className = 'magical-item';
    
    const itemName = document.createElement('input');
    itemName.type = 'text';
    itemName.className = 'item-name';
    itemName.placeholder = 'Item Name';
    itemName.value = itemData.name || '';
    
    const itemDescription = document.createElement('textarea');
    itemDescription.className = 'item-description';
    itemDescription.placeholder = 'Item Description';
    itemDescription.value = itemData.description || '';
    
    // Add stat modifiers section
    const statModifiers = document.createElement('div');
    statModifiers.className = 'stat-modifiers';
    
    // Heroic modifiers
    const heroicModifiers = document.createElement('div');
    heroicModifiers.className = 'modifier-group';
    heroicModifiers.innerHTML = '<h4>Heroic Modifiers</h4>';
    
    HEROIC_STATS.forEach(stat => {
        const modifierContainer = document.createElement('div');
        modifierContainer.className = 'stat-modifier';
        
        const label = document.createElement('label');
        label.textContent = stat;
        
        const select = document.createElement('select');
        select.className = 'modifier-select';
        select.value = itemData.heroicModifiers?.[stat] || '0';
        
        // Add options from -2 to +2
        for (let i = -2; i <= 2; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i > 0 ? `+${i}` : i.toString();
            select.appendChild(option);
        }
        
        select.addEventListener('change', () => {
            saveCurrentCharacter();
            updateChartsWithModifiers();
        });
        
        modifierContainer.appendChild(label);
        modifierContainer.appendChild(select);
        heroicModifiers.appendChild(modifierContainer);
    });
    
    // Meat modifiers
    const meatModifiers = document.createElement('div');
    meatModifiers.className = 'modifier-group';
    meatModifiers.innerHTML = '<h4>Meat Modifiers</h4>';
    
    MEAT_STATS.forEach(stat => {
        const modifierContainer = document.createElement('div');
        modifierContainer.className = 'stat-modifier';
        
        const label = document.createElement('label');
        label.textContent = stat;
        
        const select = document.createElement('select');
        select.className = 'modifier-select';
        select.value = itemData.meatModifiers?.[stat] || '0';
        
        // Add options from -2 to +2
        for (let i = -2; i <= 2; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i > 0 ? `+${i}` : i.toString();
            select.appendChild(option);
        }
        
        select.addEventListener('change', () => {
            saveCurrentCharacter();
            updateChartsWithModifiers();
        });
        
        modifierContainer.appendChild(label);
        modifierContainer.appendChild(select);
        meatModifiers.appendChild(modifierContainer);
    });
    
    statModifiers.appendChild(heroicModifiers);
    statModifiers.appendChild(meatModifiers);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    
    // Add event listeners
    itemName.addEventListener('change', saveCurrentCharacter);
    itemDescription.addEventListener('change', saveCurrentCharacter);
    deleteBtn.addEventListener('click', () => {
        itemContainer.remove();
        saveCurrentCharacter();
        updateChartsWithModifiers();
    });
    
    itemContainer.appendChild(itemName);
    itemContainer.appendChild(itemDescription);
    itemContainer.appendChild(statModifiers);
    itemContainer.appendChild(deleteBtn);
    magicalItemsList.appendChild(itemContainer);
}

// Add note
function addNote(noteData = {}) {
    const noteContainer = document.createElement('div');
    noteContainer.className = 'note';
    
    const noteTitle = document.createElement('input');
    noteTitle.type = 'text';
    noteTitle.className = 'note-title';
    noteTitle.placeholder = 'Note Title';
    noteTitle.value = noteData.title || '';
    
    const noteContent = document.createElement('textarea');
    noteContent.className = 'note-content';
    noteContent.placeholder = 'Note Content';
    noteContent.value = noteData.content || '';
    
    // Add stat modifiers section
    const statModifiers = document.createElement('div');
    statModifiers.className = 'stat-modifiers';
    
    // Heroic modifiers
    const heroicModifiers = document.createElement('div');
    heroicModifiers.className = 'modifier-group';
    heroicModifiers.innerHTML = '<h4>Heroic Modifiers</h4>';
    
    HEROIC_STATS.forEach(stat => {
        const modifierContainer = document.createElement('div');
        modifierContainer.className = 'stat-modifier';
        
        const label = document.createElement('label');
        label.textContent = stat;
        
        const select = document.createElement('select');
        select.className = 'modifier-select';
        select.value = noteData.heroicModifiers?.[stat] || '0';
        
        // Add options from -2 to +2
        for (let i = -2; i <= 2; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i > 0 ? `+${i}` : i.toString();
            select.appendChild(option);
        }
        
        select.addEventListener('change', () => {
            saveCurrentCharacter();
            updateChartsWithModifiers();
        });
        
        modifierContainer.appendChild(label);
        modifierContainer.appendChild(select);
        heroicModifiers.appendChild(modifierContainer);
    });
    
    // Meat modifiers
    const meatModifiers = document.createElement('div');
    meatModifiers.className = 'modifier-group';
    meatModifiers.innerHTML = '<h4>Meat Modifiers</h4>';
    
    MEAT_STATS.forEach(stat => {
        const modifierContainer = document.createElement('div');
        modifierContainer.className = 'stat-modifier';
        
        const label = document.createElement('label');
        label.textContent = stat;
        
        const select = document.createElement('select');
        select.className = 'modifier-select';
        select.value = noteData.meatModifiers?.[stat] || '0';
        
        // Add options from -2 to +2
        for (let i = -2; i <= 2; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i > 0 ? `+${i}` : i.toString();
            select.appendChild(option);
        }
        
        select.addEventListener('change', () => {
            saveCurrentCharacter();
            updateChartsWithModifiers();
        });
        
        modifierContainer.appendChild(label);
        modifierContainer.appendChild(select);
        meatModifiers.appendChild(modifierContainer);
    });
    
    statModifiers.appendChild(heroicModifiers);
    statModifiers.appendChild(meatModifiers);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    
    // Add event listeners
    noteTitle.addEventListener('change', saveCurrentCharacter);
    noteContent.addEventListener('change', saveCurrentCharacter);
    deleteBtn.addEventListener('click', () => {
        noteContainer.remove();
        saveCurrentCharacter();
        updateChartsWithModifiers();
    });
    
    noteContainer.appendChild(noteTitle);
    noteContainer.appendChild(noteContent);
    noteContainer.appendChild(statModifiers);
    noteContainer.appendChild(deleteBtn);
    notesList.appendChild(noteContainer);
}

// Save current character data
function saveCurrentCharacter() {
    if (!currentCharacter) return;

    currentCharacter.name = characterName.value;
    currentCharacter.profession = profession.value;
    currentCharacter.advancedProfession = advancedProfession.value;

    // Save magical items with modifiers
    currentCharacter.magicalItems = Array.from(magicalItemsList.children).map(item => ({
        name: item.querySelector('.item-name').value,
        description: item.querySelector('.item-description').value,
        heroicModifiers: getModifiersFromContainer(item, 'heroic'),
        meatModifiers: getModifiersFromContainer(item, 'meat')
    }));

    // Save notes with modifiers
    currentCharacter.notes = Array.from(notesList.children).map(note => ({
        title: note.querySelector('.note-title').value,
        content: note.querySelector('.note-content').value,
        heroicModifiers: getModifiersFromContainer(note, 'heroic'),
        meatModifiers: getModifiersFromContainer(note, 'meat')
    }));

    // Update character list
    const index = characters.findIndex(char => char.id === currentCharacter.id);
    if (index !== -1) {
        characters[index] = currentCharacter;
    }

    saveCharacters();
    updateCharacterSelect();
}

// Get modifiers from a container
function getModifiersFromContainer(container, type) {
    const modifiers = {};
    const modifierGroup = container.querySelector(`.modifier-group:has(h4:contains('${type}'))`);
    if (modifierGroup) {
        modifierGroup.querySelectorAll('.stat-modifier').forEach(mod => {
            const label = mod.querySelector('label');
            const select = mod.querySelector('select');
            modifiers[label.textContent] = parseInt(select.value);
        });
    }
    return modifiers;
}

// Update charts with modifiers
function updateChartsWithModifiers() {
    if (!currentCharacter) return;
    
    // Calculate total modifiers for each stat
    const heroicModifiers = {};
    const meatModifiers = {};
    
    // Initialize modifiers
    HEROIC_STATS.forEach(stat => {
        heroicModifiers[stat] = 0;
    });
    MEAT_STATS.forEach(stat => {
        meatModifiers[stat] = 0;
    });
    
    // Add modifiers from magical items
    currentCharacter.magicalItems.forEach(item => {
        if (item.heroicModifiers) {
            Object.entries(item.heroicModifiers).forEach(([stat, value]) => {
                heroicModifiers[stat] += value;
            });
        }
        if (item.meatModifiers) {
            Object.entries(item.meatModifiers).forEach(([stat, value]) => {
                meatModifiers[stat] += value;
            });
        }
    });
    
    // Add modifiers from notes
    currentCharacter.notes.forEach(note => {
        if (note.heroicModifiers) {
            Object.entries(note.heroicModifiers).forEach(([stat, value]) => {
                heroicModifiers[stat] += value;
            });
        }
        if (note.meatModifiers) {
            Object.entries(note.meatModifiers).forEach(([stat, value]) => {
                meatModifiers[stat] += value;
            });
        }
    });
    
    // Update charts with modified values
    updateChart(heroicStatsChart, currentCharacter.heroicStats, HEROIC_STATS, heroicModifiers);
    updateChart(meatStatsChart, currentCharacter.meatStats, MEAT_STATS, meatModifiers);
}

// Update chart data with modifiers
function updateChart(chart, stats, categories, modifiers) {
    chart.data.datasets[0].data = categories.map(category => {
        const baseValue = RATING_SYSTEM[stats[category]].value;
        const modifier = modifiers[category] || 0;
        const modifiedValue = Math.max(1, Math.min(9, baseValue + modifier));
        return modifiedValue;
    });
    chart.update();
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
    const values = Object.values(stats).map(rating => RATING_SYSTEM[rating].value);
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    return Object.keys(RATING_SYSTEM).find(key => 
        RATING_SYSTEM[key].value === Math.round(average)
    );
}

// Delete current character
function deleteCurrentCharacter() {
    if (!currentCharacter) return;
    
    if (confirm('Are you sure you want to delete this character? This action cannot be undone.')) {
        // Remove character from array
        characters = characters.filter(char => char.id !== currentCharacter.id);
        
        // Save to localStorage
        saveCharacters();
        
        // Reset current character
        currentCharacter = null;
        
        // Clear form
        characterName.value = '';
        profession.value = '';
        advancedProfession.value = '';
        magicalItemsList.innerHTML = '';
        notesList.innerHTML = '';
        
        // Update select dropdown
        updateCharacterSelect();
        
        // Reset charts
        updateChart(heroicStatsChart, {}, HEROIC_STATS);
        updateChart(meatStatsChart, {}, MEAT_STATS);
        
        // Clear overall ratings
        document.getElementById('heroicRating').textContent = '';
        document.getElementById('meatRating').textContent = '';
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', init); 