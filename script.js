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

// Global DOM element references
let elements = {
    addCharacterBtn: null,
    printBtn: null,
    characterSelect: null,
    deleteCharacterBtn: null,
    saveCharacterBtn: null,
    characterProfile: null,
    characterName: null,
    profession: null,
    advancedProfession: null,
    magicalItemsList: null,
    notesList: null,
    addMagicalItemBtn: null,
    addNoteBtn: null,
    heroicRating: null,
    meatRating: null
};

// Function to get fresh references to all DOM elements
function getDOMElements() {
    elements = {
        addCharacterBtn: document.getElementById('addCharacterBtn'),
        printBtn: document.getElementById('printBtn'),
        characterSelect: document.getElementById('characterSelect'),
        deleteCharacterBtn: document.getElementById('deleteCharacterBtn'),
        saveCharacterBtn: document.getElementById('saveCharacterBtn'),
        characterProfile: document.getElementById('characterProfile'),
        characterName: document.getElementById('characterName'),
        profession: document.getElementById('profession'),
        advancedProfession: document.getElementById('advancedProfession'),
        magicalItemsList: document.getElementById('magicalItemsList'),
        notesList: document.getElementById('notesList'),
        addMagicalItemBtn: document.getElementById('addMagicalItemBtn'),
        addNoteBtn: document.getElementById('addNoteBtn'),
        heroicRating: document.getElementById('heroicRating'),
        meatRating: document.getElementById('meatRating')
    };
    
    // Debug logging for DOM elements
    console.log('DOM Elements:', elements);
}

// Stats categories and their types
const STAT_TYPES = {
    'Damage Output': 'physical',
    'Accessible Resources': 'social',
    'Allies': 'social',
    'Stealth': 'physical',
    'Magic': 'physical',
    'Tactics': 'social',
    'Durability': 'physical',
    'Fighting Prowess': 'physical',
    'Likeability': 'social',
    'Intelligence': 'social',
    'Speed': 'physical',
    'Range': 'physical'
};

// Color scheme for stat types
const STAT_COLORS = {
    physical: {
        background: 'rgba(196, 30, 58, 0.2)',
        border: 'rgba(196, 30, 58, 1)'
    },
    social: {
        background: 'rgba(54, 162, 235, 0.2)',
        border: 'rgba(54, 162, 235, 1)'
    }
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
    'Speed'
];

// Initialize charts
let heroicStatsChart;
let meatStatsChart;

// Character data storage
let characters = JSON.parse(localStorage.getItem('characters')) || [];
let currentCharacter = null;

// Initialize the application
function init() {
    console.log('Initializing application...');
    
    // Wait for Chart.js to be available
    if (typeof Chart === 'undefined') {
        console.error('Chart.js not loaded');
        return;
    }
    
    // Get DOM elements first
    getDOMElements();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize charts
    initCharts();
    
    // Create custom dropdown
    createCustomDropdown();
    
    // Load saved characters
    loadSavedCharacters();
    
    // Set up auto-save
    setupAutoSave();
}

// Set up auto-save functionality
function setupAutoSave() {
    let autoSaveTimeout;
    const AUTO_SAVE_DELAY = 2000; // 2 seconds delay

    // Function to trigger auto-save
    function triggerAutoSave() {
        if (currentCharacter && elements.saveCharacterBtn.classList.contains('unsaved-changes')) {
            saveCurrentCharacter();
        }
    }

    // Add input event listeners to all editable fields
    const editableFields = [
        elements.characterName,
        elements.profession,
        elements.advancedProfession
    ];

    editableFields.forEach(field => {
        if (field) {
            field.addEventListener('input', () => {
                // Clear existing timeout
                clearTimeout(autoSaveTimeout);
                
                // Set new timeout
                autoSaveTimeout = setTimeout(triggerAutoSave, AUTO_SAVE_DELAY);
            });
        }
    });

    // Add change event listeners to all stat dropdowns
    document.querySelectorAll('.stat-rating-select').forEach(select => {
        select.addEventListener('change', () => {
            clearTimeout(autoSaveTimeout);
            autoSaveTimeout = setTimeout(triggerAutoSave, AUTO_SAVE_DELAY);
        });
    });

    // Add change event listeners to all modifier selects
    document.querySelectorAll('.modifier-select').forEach(select => {
        select.addEventListener('change', () => {
            clearTimeout(autoSaveTimeout);
            autoSaveTimeout = setTimeout(triggerAutoSave, AUTO_SAVE_DELAY);
        });
    });
}

// Load saved characters from localStorage
function loadSavedCharacters() {
    console.log('Loading saved characters...');
    try {
        const savedCharacters = localStorage.getItem('characters');
        if (savedCharacters) {
            characters = JSON.parse(savedCharacters);
            console.log('Loaded characters:', characters);
            
            // Clean up any old character data
            characters = characters.map(cleanupCharacterData);
            
            // Update the character select dropdown
            updateCharacterSelect();
            
            // If there are characters, load the first one
            if (characters.length > 0) {
                loadCharacter(characters[0].id);
            }
        } else {
            console.log('No saved characters found');
        }
    } catch (error) {
        console.error('Error loading characters:', error);
        characters = [];
    }
}

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Only add event listeners if elements exist
    if (elements.characterSelect) {
        elements.characterSelect.addEventListener('change', handleCharacterSelect);
    }
    
    if (elements.addCharacterBtn) {
        elements.addCharacterBtn.addEventListener('click', createNewCharacter);
    }
    
    if (elements.printBtn) {
        elements.printBtn.addEventListener('click', () => {
            if (!currentCharacter) {
                alert('Please select a character to print');
                return;
            }
            generatePDF();
        });
    }
    
    if (elements.deleteCharacterBtn) {
        elements.deleteCharacterBtn.addEventListener('click', deleteCurrentCharacter);
    }
    
    if (elements.saveCharacterBtn) {
        elements.saveCharacterBtn.addEventListener('click', () => {
            saveCurrentCharacter();
            showSaveNotification();
        });
    }
    
    if (elements.characterName) {
        elements.characterName.addEventListener('input', handleCharacterNameChange);
    }
    
    if (elements.profession) {
        elements.profession.addEventListener('input', handleProfessionChange);
    }
    
    if (elements.advancedProfession) {
        elements.advancedProfession.addEventListener('input', handleAdvancedProfessionChange);
    }
    
    if (elements.addMagicalItemBtn) {
        elements.addMagicalItemBtn.addEventListener('click', addMagicalItem);
    }
    
    if (elements.addNoteBtn) {
        elements.addNoteBtn.addEventListener('click', addNote);
    }
}

// Wait for both DOM and Chart.js to be ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing application...');
    init();
});

// Initialize radar charts
function initCharts() {
    // Destroy existing charts if they exist
    if (heroicStatsChart) {
        heroicStatsChart.destroy();
    }
    if (meatStatsChart) {
        meatStatsChart.destroy();
    }

    // Remove existing stat dropdowns if they exist
    const existingDropdowns = document.querySelectorAll('.stat-dropdowns');
    existingDropdowns.forEach(dropdown => dropdown.remove());

    const heroicConfig = {
        type: 'radar',
        data: {
            labels: HEROIC_STATS,
            datasets: [{
                label: 'Heroic',
                data: Array(HEROIC_STATS.length).fill(1), // Start with F rating
                backgroundColor: HEROIC_STATS.map(stat => STAT_COLORS[STAT_TYPES[stat]].background),
                borderColor: HEROIC_STATS.map(stat => STAT_COLORS[STAT_TYPES[stat]].border),
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
                            const statType = STAT_TYPES[context.label];
                            return [
                                `Type: ${statType.charAt(0).toUpperCase() + statType.slice(1)}`,
                                `Rating: ${rating}`,
                                RATING_SYSTEM[rating].description
                            ];
                        }
                    }
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
                backgroundColor: MEAT_STATS.map(stat => STAT_COLORS[STAT_TYPES[stat]].background),
                borderColor: MEAT_STATS.map(stat => STAT_COLORS[STAT_TYPES[stat]].border),
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
                            const statType = STAT_TYPES[context.label];
                            return [
                                `Type: ${statType.charAt(0).toUpperCase() + statType.slice(1)}`,
                                `Rating: ${rating}`,
                                RATING_SYSTEM[rating].description
                            ];
                        }
                    }
                }
            }
        }
    };

    const heroicChartElement = document.getElementById('heroicStatsChart');
    const meatChartElement = document.getElementById('meatStatsChart');

    if (heroicChartElement) {
        heroicStatsChart = new Chart(heroicChartElement, heroicConfig);
    }
    if (meatChartElement) {
        meatStatsChart = new Chart(meatChartElement, meatConfig);
    }

    // Add dropdown menus for each stat
    addStatDropdowns('heroicStatsChart', HEROIC_STATS, 'heroic');
    addStatDropdowns('meatStatsChart', MEAT_STATS, 'meat');
}

// Update chart data
function updateChart(chart, stats, categories, modifiers = {}) {
    console.log('Updating chart with:', {
        chart: chart ? 'valid' : 'null',
        stats,
        categories,
        modifiers
    });
    
    if (!chart || !stats || !categories) {
        console.error('Invalid parameters for chart update:', {
            chart: chart ? 'valid' : 'null',
            stats: stats ? 'valid' : 'null',
            categories: categories ? 'valid' : 'null'
        });
        return;
    }
    
    const newData = categories.map(category => {
        const baseValue = RATING_SYSTEM[stats[category]]?.value || 1;
        const modifier = modifiers[category] || 0;
        const modifiedValue = Math.max(1, Math.min(9, baseValue + modifier));
        console.log(`Category ${category}:`, {
            baseValue,
            modifier,
            modifiedValue
        });
        return modifiedValue;
    });
    
    console.log('New chart data:', newData);
    chart.data.datasets[0].data = newData;
    
    try {
        chart.update('none');
        console.log('Chart updated successfully');
    } catch (error) {
        console.error('Error updating chart:', error);
    }
}

// Add dropdown menus for stats
function addStatDropdowns(chartId, stats, type) {
    const chartContainer = document.getElementById(chartId).parentElement;
    const dropdownsContainer = document.createElement('div');
    dropdownsContainer.className = 'stat-dropdowns';
    
    stats.forEach(stat => {
        const dropdownWrapper = document.createElement('div');
        dropdownWrapper.className = 'stat-dropdown-wrapper';
        
        const label = document.createElement('label');
        label.textContent = stat;
        
        const select = document.createElement('select');
        select.className = 'stat-rating-select';
        
        // Add rating options
        Object.keys(RATING_SYSTEM).forEach(rating => {
            const option = document.createElement('option');
            option.value = RATING_SYSTEM[rating].value;
            option.textContent = `${rating} - ${RATING_SYSTEM[rating].description}`;
            select.appendChild(option);
        });
        
        // Set initial value
        if (currentCharacter) {
            const currentRating = type === 'heroic' ? 
                currentCharacter.heroicStats[stat] : 
                currentCharacter.meatStats[stat];
            select.value = RATING_SYSTEM[currentRating].value;
        }
        
        // Add change event listener
        select.addEventListener('change', () => {
            console.log(`Stat ${stat} changed to value:`, select.value);
            const rating = Object.keys(RATING_SYSTEM).find(key => 
                RATING_SYSTEM[key].value === parseInt(select.value)
            );
            console.log('Mapped rating:', rating);
            
            if (!currentCharacter) {
                console.log('No current character selected');
                return;
            }
            
            if (type === 'heroic') {
                console.log('Updating heroic stats:', currentCharacter.heroicStats);
                currentCharacter.heroicStats[stat] = rating;
                console.log('New heroic stats:', currentCharacter.heroicStats);
                updateChart(heroicStatsChart, currentCharacter.heroicStats, HEROIC_STATS);
            } else {
                console.log('Updating meat stats:', currentCharacter.meatStats);
                currentCharacter.meatStats[stat] = rating;
                console.log('New meat stats:', currentCharacter.meatStats);
                updateChart(meatStatsChart, currentCharacter.meatStats, MEAT_STATS);
            }
            
            updateOverallRatings(currentCharacter);
            elements.saveCharacterBtn.classList.add('unsaved-changes');
        });
        
        dropdownWrapper.appendChild(label);
        dropdownWrapper.appendChild(select);
        dropdownsContainer.appendChild(dropdownWrapper);
    });
    
    chartContainer.appendChild(dropdownsContainer);
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
    
    // Set as current character immediately
    currentCharacter = newCharacter;
    
    // Update UI
    updateCharacterSelect();
    loadCharacter(newCharacter.id);
    
    // Focus the name input
    const characterName = document.getElementById('characterName');
    if (characterName) {
        characterName.focus();
    }
}

// Update character select dropdown
function updateCharacterSelect() {
    if (!elements.characterSelect) return;
    
    elements.characterSelect.innerHTML = '<option value="">Select a Character</option>';
    characters.forEach(char => {
        const option = document.createElement('option');
        option.value = char.id;
        option.textContent = char.name || 'Unnamed Character';
        elements.characterSelect.appendChild(option);
    });
    
    // If there's a current character, make sure it's selected
    if (currentCharacter) {
        elements.characterSelect.value = currentCharacter.id;
    }
}

// Create a custom dropdown with delete buttons
function createCustomDropdown() {
    // Create wrapper for custom dropdown
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-dropdown-wrapper';
    
    // Check if sort control already exists
    const existingSortControl = document.querySelector('.sort-control');
    if (!existingSortControl) {
        // Create sort control only if it doesn't exist
        const sortControl = document.createElement('div');
        sortControl.className = 'sort-control';
        
        const sortLabel = document.createElement('label');
        sortLabel.textContent = 'Sort by:';
        
        const sortSelect = document.createElement('select');
        sortSelect.className = 'sort-select';
        sortSelect.innerHTML = `
            <option value="name">Name</option>
            <option value="profession">Profession</option>
            <option value="advancedProfession">Advanced Profession</option>
        `;
        
        sortControl.appendChild(sortLabel);
        sortControl.appendChild(sortSelect);
        wrapper.appendChild(sortControl);
    }
    
    // Create the main select element
    const select = document.createElement('select');
    select.id = 'characterSelect';
    select.className = 'character-selector';
    select.innerHTML = '<option value="">Select a Character</option>';
    
    // Function to update dropdown options
    function updateDropdownOptions(sortBy = 'name') {
        console.log('Updating dropdown options with sort:', sortBy);
        
        // Clear existing options except the first one
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        // Create a copy of characters array for sorting
        const sortedCharacters = [...characters].sort((a, b) => {
            let aValue, bValue;
            
            switch (sortBy) {
                case 'name':
                    aValue = a.name || 'Unnamed Character';
                    bValue = b.name || 'Unnamed Character';
                    break;
                case 'profession':
                    aValue = a.profession || '';
                    bValue = b.profession || '';
                    break;
                case 'advancedProfession':
                    aValue = a.advancedProfession || '';
                    bValue = b.advancedProfession || '';
                    break;
                default:
                    return 0;
            }
            
            return aValue.localeCompare(bValue);
        });
        
        console.log('Sorted characters:', sortedCharacters);
        
        // Add sorted options
        sortedCharacters.forEach(char => {
            const option = document.createElement('option');
            option.value = char.id;
            
            // Create a formatted display string
            let displayText = char.name || 'Unnamed Character';
            if (char.profession || char.advancedProfession) {
                displayText += ' - ';
                if (char.profession) displayText += char.profession;
                if (char.advancedProfession) displayText += ` (${char.advancedProfession})`;
            }
            
            option.textContent = displayText;
            select.appendChild(option);
        });
        
        // Restore current selection if exists
        if (currentCharacter) {
            select.value = currentCharacter.id;
        }
    }
    
    // Initial population of options
    updateDropdownOptions();
    
    // Add change event listener to sort select if it exists
    const sortSelect = document.querySelector('.sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            console.log('Sort select changed to:', e.target.value);
            updateDropdownOptions(e.target.value);
        });
    }
    
    wrapper.appendChild(select);
    
    // Replace the old select with the new wrapper
    const oldSelect = document.getElementById('characterSelect');
    if (oldSelect) {
        oldSelect.parentNode.replaceChild(wrapper, oldSelect);
    } else {
        document.querySelector('.character-select-container').appendChild(wrapper);
    }
    
    // Add change event listener to the select
    select.addEventListener('change', (e) => {
        console.log('Character select changed:', e.target.value);
        loadCharacter(e.target.value);
    });
}

// Clean up old character data
function cleanupCharacterData(character) {
    // Remove Range from meat stats if it exists
    if (character.meatStats && 'Range' in character.meatStats) {
        delete character.meatStats['Range'];
    }
    
    // Ensure all current stats exist with default values
    MEAT_STATS.forEach(stat => {
        if (!(stat in character.meatStats)) {
            character.meatStats[stat] = 'F';
        }
    });
    
    HEROIC_STATS.forEach(stat => {
        if (!(stat in character.heroicStats)) {
            character.heroicStats[stat] = 'F';
        }
    });
    
    return character;
}

// Update stats breakdown display
function updateStatsBreakdown() {
    if (!currentCharacter) return;

    // Update Heroic stats breakdown
    const heroicBreakdown = document.getElementById('heroicStatsBreakdown');
    if (heroicBreakdown) {
        heroicBreakdown.innerHTML = HEROIC_STATS.map(stat => `
            <div class="stat-item">
                <span>${stat}</span>
                <span>${currentCharacter.heroicStats[stat]}</span>
            </div>
        `).join('');
    }

    // Update Meat stats breakdown
    const meatBreakdown = document.getElementById('meatStatsBreakdown');
    if (meatBreakdown) {
        meatBreakdown.innerHTML = MEAT_STATS.map(stat => `
            <div class="stat-item">
                <span>${stat}</span>
                <span>${currentCharacter.meatStats[stat]}</span>
            </div>
        `).join('');
    }
}

// Modify loadCharacter function to include stats breakdown update
function loadCharacter(characterId) {
    console.log('Loading character:', characterId);
    
    if (!characterId) {
        console.log('No character ID provided');
        currentCharacter = null;
        return;
    }
    
    // Convert string ID to number if needed
    const id = typeof characterId === 'string' ? parseInt(characterId) : characterId;
    console.log('Looking for character with ID:', id);
    
    currentCharacter = characters.find(char => char.id === id);
    console.log('Found character:', currentCharacter);
    
    if (!currentCharacter) {
        console.log('No character found with ID:', id);
        return;
    }

    // Clean up and validate character data
    currentCharacter = cleanupCharacterData(currentCharacter);

    // Get fresh references to elements
    getDOMElements();

    // Update form fields
    if (elements.characterName) elements.characterName.value = currentCharacter.name || '';
    if (elements.profession) elements.profession.value = currentCharacter.profession || '';
    if (elements.advancedProfession) elements.advancedProfession.value = currentCharacter.advancedProfession || '';

    // Update charts
    updateChart(heroicStatsChart, currentCharacter.heroicStats, HEROIC_STATS);
    updateChart(meatStatsChart, currentCharacter.meatStats, MEAT_STATS);

    // Update stats breakdown
    updateStatsBreakdown();

    // Update magical items
    if (elements.magicalItemsList) {
        elements.magicalItemsList.innerHTML = '';
        currentCharacter.magicalItems.forEach(item => {
            // Clean up modifiers in magical items
            if (item.meatModifiers && 'Range' in item.meatModifiers) {
                delete item.meatModifiers['Range'];
            }
            addMagicalItem(item);
        });
    }

    // Update notes
    if (elements.notesList) {
        elements.notesList.innerHTML = '';
        currentCharacter.notes.forEach(note => {
            // Clean up modifiers in notes
            if (note.meatModifiers && 'Range' in note.meatModifiers) {
                delete note.meatModifiers['Range'];
            }
            addNote(note);
        });
    }

    // Update overall ratings
    updateOverallRatings(currentCharacter);
    
    // Remove unsaved changes indicator
    if (elements.saveCharacterBtn) elements.saveCharacterBtn.classList.remove('unsaved-changes');
    
    console.log('Character loaded successfully');
}

// Show save notification
function showSaveNotification() {
    const notification = document.createElement('div');
    notification.className = 'save-notification';
    notification.textContent = 'Changes saved!';
    document.body.appendChild(notification);

    // Remove notification after 2 seconds
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

// Get modifiers from a container
function getModifiersFromContainer(container, type) {
    const modifiers = {};
    const modifierElements = container.querySelectorAll(`.stat-modifier[data-type="${type}"]`);
    
    modifierElements.forEach(mod => {
        const stat = mod.getAttribute('data-stat');
        const select = mod.querySelector('.modifier-select');
        if (stat && select) {
            modifiers[stat] = parseInt(select.value);
        }
    });
    
    return modifiers;
}

// Add magical item
function addMagicalItem(itemData = {}) {
    const itemContainer = document.createElement('div');
    itemContainer.className = 'magical-item';
    
    // Create name and description fields
    const itemName = document.createElement('input');
    itemName.type = 'text';
    itemName.className = 'item-name';
    itemName.placeholder = 'Item Name';
    itemName.value = itemData.name || '';
    
    const itemDescription = document.createElement('textarea');
    itemDescription.className = 'item-description';
    itemDescription.placeholder = 'Item Description';
    itemDescription.value = itemData.description || '';
    
    // Create modifiers container
    const modifiersContainer = document.createElement('div');
    modifiersContainer.className = 'modifiers-container';
    
    // Create add modifier button
    const addModifierBtn = document.createElement('button');
    addModifierBtn.className = 'add-modifier-btn secondary-btn';
    addModifierBtn.textContent = 'Add Modifier';
    
    // Create modifier type selector
    const modifierTypeSelect = document.createElement('select');
    modifierTypeSelect.className = 'modifier-type-select';
    modifierTypeSelect.innerHTML = `
        <option value="heroic">Heroic Modifier</option>
        <option value="meat">Meat Modifier</option>
    `;
    
    // Create stat selector
    const statSelect = document.createElement('select');
    statSelect.className = 'stat-select';
    
    // Update stat options based on modifier type
    function updateStatOptions() {
        const type = modifierTypeSelect.value;
        const stats = type === 'heroic' ? HEROIC_STATS : MEAT_STATS;
        
        // Clear existing options
        statSelect.innerHTML = '';
        
        // Add options
        stats.forEach(stat => {
            const option = document.createElement('option');
            option.value = stat;
            option.textContent = stat;
            statSelect.appendChild(option);
        });
    }
    
    // Initial population of stat options
    updateStatOptions();
    
    // Update stat options when modifier type changes
    modifierTypeSelect.addEventListener('change', updateStatOptions);
    
    // Create modifier controls container
    const modifierControls = document.createElement('div');
    modifierControls.className = 'modifier-controls';
    modifierControls.appendChild(modifierTypeSelect);
    modifierControls.appendChild(statSelect);
    modifierControls.appendChild(addModifierBtn);
    
    // Function to add a new modifier
    function addModifier() {
        const type = modifierTypeSelect.value;
        const stat = statSelect.value;
        
        // Check if modifier already exists
        const existingModifier = modifiersContainer.querySelector(`.stat-modifier[data-type="${type}"][data-stat="${stat}"]`);
        if (existingModifier) {
            alert('This modifier already exists!');
            return;
        }
        
        // Create modifier container
        const modifierContainer = document.createElement('div');
        modifierContainer.className = 'stat-modifier';
        modifierContainer.setAttribute('data-type', type);
        modifierContainer.setAttribute('data-stat', stat);
        
        // Create label
        const label = document.createElement('label');
        label.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} - ${stat}`;
        
        // Create select for modifier value
        const select = document.createElement('select');
        select.className = 'modifier-select';
        
        // Add options from -2 to +2
        for (let i = -2; i <= 2; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i > 0 ? `+${i}` : i.toString();
            select.appendChild(option);
        }
        
        // Set initial value from itemData if it exists
        if (itemData[`${type}Modifiers`] && itemData[`${type}Modifiers`][stat] !== undefined) {
            select.value = itemData[`${type}Modifiers`][stat];
        } else {
            select.value = '0';
        }
        
        // Create remove button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-modifier-btn';
        removeBtn.textContent = '×';
        
        // Add event listeners
        select.addEventListener('change', () => {
            saveCurrentCharacter();
            updateChartsWithModifiers();
        });
        
        removeBtn.addEventListener('click', () => {
            modifierContainer.remove();
            saveCurrentCharacter();
            updateChartsWithModifiers();
        });
        
        // Assemble modifier
        modifierContainer.appendChild(label);
        modifierContainer.appendChild(select);
        modifierContainer.appendChild(removeBtn);
        modifiersContainer.appendChild(modifierContainer);
    }
    
    // Add click event to add modifier button
    addModifierBtn.addEventListener('click', addModifier);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    
    // Update event listeners
    itemName.addEventListener('input', () => {
        elements.saveCharacterBtn.classList.add('unsaved-changes');
    });
    itemDescription.addEventListener('input', () => {
        elements.saveCharacterBtn.classList.add('unsaved-changes');
    });
    
    deleteBtn.addEventListener('click', () => {
        itemContainer.remove();
        saveCurrentCharacter();
    });
    
    // Assemble the item
    itemContainer.appendChild(itemName);
    itemContainer.appendChild(itemDescription);
    itemContainer.appendChild(modifierControls);
    itemContainer.appendChild(modifiersContainer);
    itemContainer.appendChild(deleteBtn);
    
    elements.magicalItemsList.appendChild(itemContainer);
    
    // Add existing modifiers if they exist
    if (itemData.heroicModifiers) {
        Object.entries(itemData.heroicModifiers).forEach(([stat, value]) => {
            modifierTypeSelect.value = 'heroic';
            updateStatOptions();
            statSelect.value = stat;
            addModifier();
        });
    }
    if (itemData.meatModifiers) {
        Object.entries(itemData.meatModifiers).forEach(([stat, value]) => {
            modifierTypeSelect.value = 'meat';
            updateStatOptions();
            statSelect.value = stat;
            addModifier();
        });
    }
}

// Add note
function addNote(noteData = {}) {
    const noteContainer = document.createElement('div');
    noteContainer.className = 'note';
    
    // Create title and content fields
    const noteTitle = document.createElement('input');
    noteTitle.type = 'text';
    noteTitle.className = 'note-title';
    noteTitle.placeholder = 'Note Title';
    noteTitle.value = noteData.title || '';
    
    const noteContent = document.createElement('textarea');
    noteContent.className = 'note-content';
    noteContent.placeholder = 'Note Content';
    noteContent.value = noteData.content || '';
    
    // Create modifiers container
    const modifiersContainer = document.createElement('div');
    modifiersContainer.className = 'modifiers-container';
    
    // Create add modifier button
    const addModifierBtn = document.createElement('button');
    addModifierBtn.className = 'add-modifier-btn secondary-btn';
    addModifierBtn.textContent = 'Add Modifier';
    
    // Create modifier type selector
    const modifierTypeSelect = document.createElement('select');
    modifierTypeSelect.className = 'modifier-type-select';
    modifierTypeSelect.innerHTML = `
        <option value="heroic">Heroic Modifier</option>
        <option value="meat">Meat Modifier</option>
    `;
    
    // Create stat selector
    const statSelect = document.createElement('select');
    statSelect.className = 'stat-select';
    
    // Update stat options based on modifier type
    function updateStatOptions() {
        const type = modifierTypeSelect.value;
        const stats = type === 'heroic' ? HEROIC_STATS : MEAT_STATS;
        
        // Clear existing options
        statSelect.innerHTML = '';
        
        // Add options
        stats.forEach(stat => {
            const option = document.createElement('option');
            option.value = stat;
            option.textContent = stat;
            statSelect.appendChild(option);
        });
    }
    
    // Initial population of stat options
    updateStatOptions();
    
    // Update stat options when modifier type changes
    modifierTypeSelect.addEventListener('change', updateStatOptions);
    
    // Create modifier controls container
    const modifierControls = document.createElement('div');
    modifierControls.className = 'modifier-controls';
    modifierControls.appendChild(modifierTypeSelect);
    modifierControls.appendChild(statSelect);
    modifierControls.appendChild(addModifierBtn);
    
    // Function to add a new modifier
    function addModifier() {
        const type = modifierTypeSelect.value;
        const stat = statSelect.value;
        
        // Check if modifier already exists
        const existingModifier = modifiersContainer.querySelector(`.stat-modifier[data-type="${type}"][data-stat="${stat}"]`);
        if (existingModifier) {
            alert('This modifier already exists!');
            return;
        }
        
        // Create modifier container
        const modifierContainer = document.createElement('div');
        modifierContainer.className = 'stat-modifier';
        modifierContainer.setAttribute('data-type', type);
        modifierContainer.setAttribute('data-stat', stat);
        
        // Create label
        const label = document.createElement('label');
        label.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} - ${stat}`;
        
        // Create select for modifier value
        const select = document.createElement('select');
        select.className = 'modifier-select';
        
        // Add options from -2 to +2
        for (let i = -2; i <= 2; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i > 0 ? `+${i}` : i.toString();
            select.appendChild(option);
        }
        
        // Set initial value from itemData if it exists
        if (itemData[`${type}Modifiers`] && itemData[`${type}Modifiers`][stat] !== undefined) {
            select.value = itemData[`${type}Modifiers`][stat];
        } else {
            select.value = '0';
        }
        
        // Create remove button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-modifier-btn';
        removeBtn.textContent = '×';
        
        // Add event listeners
        select.addEventListener('change', () => {
            saveCurrentCharacter();
            updateChartsWithModifiers();
        });
        
        removeBtn.addEventListener('click', () => {
            modifierContainer.remove();
            saveCurrentCharacter();
            updateChartsWithModifiers();
        });
        
        // Assemble modifier
        modifierContainer.appendChild(label);
        modifierContainer.appendChild(select);
        modifierContainer.appendChild(removeBtn);
        modifiersContainer.appendChild(modifierContainer);
    }
    
    // Add click event to add modifier button
    addModifierBtn.addEventListener('click', addModifier);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    
    // Update event listeners
    noteTitle.addEventListener('input', () => {
        elements.saveCharacterBtn.classList.add('unsaved-changes');
    });
    noteContent.addEventListener('input', () => {
        elements.saveCharacterBtn.classList.add('unsaved-changes');
    });
    
    deleteBtn.addEventListener('click', () => {
        noteContainer.remove();
        saveCurrentCharacter();
    });
    
    // Assemble the note
    noteContainer.appendChild(noteTitle);
    noteContainer.appendChild(noteContent);
    noteContainer.appendChild(modifierControls);
    noteContainer.appendChild(modifiersContainer);
    noteContainer.appendChild(deleteBtn);
    
    elements.notesList.appendChild(noteContainer);
}

// Save current character data
function saveCurrentCharacter() {
    console.log('Saving current character...');
    if (!currentCharacter) {
        console.log('No current character to save');
        return;
    }

    // Update character data
    currentCharacter.name = elements.characterName.value;
    currentCharacter.profession = elements.profession.value;
    currentCharacter.advancedProfession = elements.advancedProfession.value;

    console.log('Updated character data:', currentCharacter);

    // Save magical items with modifiers
    currentCharacter.magicalItems = Array.from(elements.magicalItemsList.children).map(item => ({
        name: item.querySelector('.item-name').value,
        description: item.querySelector('.item-description').value,
        heroicModifiers: getModifiersFromContainer(item, 'heroic'),
        meatModifiers: getModifiersFromContainer(item, 'meat')
    }));

    // Save notes with modifiers
    currentCharacter.notes = Array.from(elements.notesList.children).map(note => ({
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

    // Save to localStorage
    saveCharacters();
    
    // Update the dropdown options without recreating the entire structure
    const select = document.getElementById('characterSelect');
    const sortSelect = document.querySelector('.sort-select');
    if (select && sortSelect) {
        // Clear existing options except the first one
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        // Get current sort value
        const sortBy = sortSelect.value;
        
        // Create a copy of characters array for sorting
        const sortedCharacters = [...characters].sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return (a.name || 'Unnamed Character').localeCompare(b.name || 'Unnamed Character');
                case 'profession':
                    return (a.profession || '').localeCompare(b.profession || '');
                case 'advancedProfession':
                    return (a.advancedProfession || '').localeCompare(b.advancedProfession || '');
                default:
                    return 0;
            }
        });
        
        // Add sorted options
        sortedCharacters.forEach(char => {
            const option = document.createElement('option');
            option.value = char.id;
            
            // Create a formatted display string
            let displayText = char.name || 'Unnamed Character';
            if (char.profession || char.advancedProfession) {
                displayText += ' - ';
                if (char.profession) displayText += char.profession;
                if (char.advancedProfession) displayText += ` (${char.advancedProfession})`;
            }
            
            option.textContent = displayText;
            select.appendChild(option);
        });
        
        // Restore current selection
        select.value = currentCharacter.id;
    }
    
    // Remove unsaved changes indicator
    elements.saveCharacterBtn.classList.remove('unsaved-changes');
    console.log('Character saved successfully');
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

// Save all characters to localStorage
function saveCharacters() {
    localStorage.setItem('characters', JSON.stringify(characters));
}

// Calculate and update overall ratings
function updateOverallRatings(character) {
    if (!character) {
        elements.heroicRating.textContent = '';
        elements.meatRating.textContent = '';
        return;
    }

    // Calculate averages for both stat types
    const heroicAverage = calculateAverageRating(character.heroicStats);
    const meatAverage = calculateAverageRating(character.meatStats);

    // Update the display elements
    if (elements.heroicRating) {
        elements.heroicRating.textContent = `Heroic Rating: ${heroicAverage}`;
        elements.heroicRating.style.color = getRatingColor(heroicAverage);
    }

    if (elements.meatRating) {
        elements.meatRating.textContent = `Meat Rating: ${meatAverage}`;
        elements.meatRating.style.color = getRatingColor(meatAverage);
    }
}

// Calculate average rating
function calculateAverageRating(stats) {
    if (!stats || Object.keys(stats).length === 0) return 'F';
    
    const values = Object.values(stats)
        .map(rating => RATING_SYSTEM[rating]?.value || 1)
        .filter(value => !isNaN(value));
    
    if (values.length === 0) return 'F';
    
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const roundedAverage = Math.round(average);
    
    // Find the closest rating
    return Object.keys(RATING_SYSTEM).find(key => 
        RATING_SYSTEM[key].value === roundedAverage
    ) || 'F';
}

// Get color for rating
function getRatingColor(rating) {
    const ratingColors = {
        'F': '#ff0000',
        'E': '#ff4000',
        'D': '#ff8000',
        'C': '#ffff00',
        'B': '#80ff00',
        'A': '#00ff00',
        'S': '#00ffff',
        'SS': '#0000ff',
        'SSS': '#8000ff'
    };
    return ratingColors[rating] || '#ffffff';
}

// Delete current character
function deleteCurrentCharacter() {
    console.log('Attempting to delete character...');
    if (!currentCharacter) {
        console.log('No current character to delete');
        return;
    }
    
    if (confirm('Are you sure you want to delete this character? This action cannot be undone.')) {
        console.log('Deleting character:', currentCharacter.id);
        // Remove character from array
        characters = characters.filter(char => char.id !== currentCharacter.id);
        
        // Save to localStorage
        saveCharacters();
        
        // Reset current character
        currentCharacter = null;
        
        // Get fresh references to elements
        getDOMElements();
        
        // Clear form
        if (elements.characterName) elements.characterName.value = '';
        if (elements.profession) elements.profession.value = '';
        if (elements.advancedProfession) elements.advancedProfession.value = '';
        if (elements.magicalItemsList) elements.magicalItemsList.innerHTML = '';
        if (elements.notesList) elements.notesList.innerHTML = '';
        
        // Update charts
        updateChart(heroicStatsChart, {}, HEROIC_STATS);
        updateChart(meatStatsChart, {}, MEAT_STATS);
        
        // Clear overall ratings
        if (elements.heroicRating) elements.heroicRating.textContent = '';
        if (elements.meatRating) elements.meatRating.textContent = '';
        
        // Recreate the dropdown
        createCustomDropdown();
        
        // Remove unsaved changes indicator
        if (elements.saveCharacterBtn) elements.saveCharacterBtn.classList.remove('unsaved-changes');
        console.log('Character deleted successfully');
    }
}

function handleCharacterSelect(e) {
    console.log('Character select changed:', e.target.value);
    loadCharacter(e.target.value);
}

function handleCharacterNameChange() {
    console.log('Character name changed');
    elements.saveCharacterBtn.classList.add('unsaved-changes');
}

function handleProfessionChange() {
    console.log('Profession changed');
    elements.saveCharacterBtn.classList.add('unsaved-changes');
}

function handleAdvancedProfessionChange() {
    console.log('Advanced profession changed');
    elements.saveCharacterBtn.classList.add('unsaved-changes');
}

// Generate PDF of character profile
function generatePDF() {
    if (!currentCharacter) return;

    // Check if html2pdf is available
    if (typeof html2pdf === 'undefined') {
        alert('PDF generation is not available at the moment. Please try again in a few seconds.');
        return;
    }

    // Create a temporary container for the PDF content
    const container = document.createElement('div');
    container.className = 'pdf-container';
    
    // Clone the character profile
    const profileClone = elements.characterProfile.cloneNode(true);
    
    // Remove buttons and interactive elements
    const buttonsToRemove = profileClone.querySelectorAll('button, input, textarea, select');
    buttonsToRemove.forEach(element => {
        if (element) {
            // Replace inputs and textareas with their values
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                const span = document.createElement('span');
                span.textContent = element.value || '';
                element.parentNode.replaceChild(span, element);
            } else {
                element.remove();
            }
        }
    });
    
    // Add the cloned profile to the container
    container.appendChild(profileClone);
    
    // Configure PDF options
    const opt = {
        margin: 10,
        filename: `${currentCharacter.name || 'character'}-profile.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            logging: false
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait' 
        }
    };
    
    // Check if running on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    if (isIOS) {
        // For iOS, generate the PDF and open it in a new window
        html2pdf().set(opt).from(container).outputPdf().then(pdf => {
            // Create a blob from the PDF
            const blob = new Blob([pdf], { type: 'application/pdf' });
            
            // Create a URL for the blob
            const url = URL.createObjectURL(blob);
            
            // Open the PDF in a new window
            window.open(url, '_blank');
            
            // Clean up
            setTimeout(() => {
                URL.revokeObjectURL(url);
                container.remove();
            }, 1000);
        });
    } else {
        // For PC, use the standard save method
        html2pdf().set(opt).from(container).save().then(() => {
            container.remove();
        }).catch(error => {
            console.error('PDF generation failed:', error);
            alert('Failed to generate PDF. Please try again.');
            container.remove();
        });
    }
}

document.addEventListener('DOMContentLoaded', init); 