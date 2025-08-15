// Initialize elements
const progressEl = document.getElementById('progress');
const showOnlyIncomplete = document.getElementById('showOnlyIncomplete');
const darkModeToggle = document.getElementById('darkModeToggle');
const hideControversialToggle = document.getElementById('hideControversial');
const controversialIds = ['run', 'bowsersfury', 'nslu'];

const games = {
    '2d-list': [
        ["smb1", "Super Mario Bros. (1985)"],
        ["lostlevels", "Super Mario Bros.: The Lost Levels (1986)"],
        ["smb2", "Super Mario Bros. 2 (1988)"],
        ["smb3", "Super Mario Bros. 3 (1988)"],
        ["land1", "Super Mario Land (1989)"],
        ["world", "Super Mario World (1990)"],
        ["land2", "Super Mario Land 2: 6 Golden Coins (1992)"],
        ["world2", "Super Mario World 2: Yoshi's Island (1995)"],
        ["nsmb", "New Super Mario Bros. (2006)"],
        ["nsmbw", "New Super Mario Bros. Wii (2009)"],
        ["nsmb2", "New Super Mario Bros. 2 (2012)"],
        ["nsmbu", "New Super Mario Bros. U (2012)"],
        ["nslu", "New Super Luigi U (2013)"],
        ["run", "Super Mario Run (2016)"],
        ["wonder", "Super Mario Bros. Wonder (2023)"]
    ],
    '3d-list': [
        ["sm64", "Super Mario 64 (1996)"],
        ["sunshine", "Super Mario Sunshine (2002)"],
        ["galaxy", "Super Mario Galaxy (2007)"],
        ["galaxy2", "Super Mario Galaxy 2 (2010)"],
        ["3dland", "Super Mario 3D Land (2011)"],
        ["3dworld", "Super Mario 3D World (2013)"],
        ["odyssey", "Super Mario Odyssey (2017)"],
        ["bowsersfury", "Bowser's Fury (2021)"]
    ]
};

// Function to render checkboxes
function renderCheckboxes() {
    Object.entries(games).forEach(([sectionId, gameList]) => {
        const container = document.getElementById(sectionId);
        container.innerHTML = '';
        gameList.forEach(([id, title]) => {
            const label = document.createElement('label');
            label.innerHTML = `<input type="checkbox" data-id="${id}"> ${title}`;
            if (controversialIds.includes(id)) {
                label.classList.add('controversial');
            }
            container.appendChild(label);
        });
    });

    const checkboxes = document.querySelectorAll('input[type=checkbox][data-id]');
    checkboxes.forEach(cb => {
        cb.checked = localStorage.getItem(cb.dataset.id) === 'true';
        cb.addEventListener('change', () => {
            localStorage.setItem(cb.dataset.id, cb.checked);
            updateProgress();
            applyFilter();
        });
    });
    updateProgress();
}

// Function to update progress
function updateProgress() {
    const hideControversial = hideControversialToggle && hideControversialToggle.checked;
    const all = Array.from(document.querySelectorAll('input[data-id]')).filter(cb => {
        if (!hideControversial) return true;
        return !controversialIds.includes(cb.dataset.id);
    });
    const done = all.filter(cb => cb.checked);
    const percent = all.length === 0 ? 100 : Math.round((done.length / all.length) * 100);
    progressEl.textContent = `Completed: ${percent}%`;
}

// Password system
// NOTE: Passwords are version-dependent! If you add/remove games, old passwords will NOT restore the correct state.
function getAllGameIds() {
    return [
        ...games['2d-list'].map(([id]) => id),
        ...games['3d-list'].map(([id]) => id)
    ];
}

// Generate password from current checklist
function generatePassword() {
    // Encode checked state as a binary string
    const ids = getAllGameIds();
    let bits = '';
    ids.forEach(id => {
        bits += localStorage.getItem(id) === 'true' ? '1' : '0';
    });
    // Encode filter settings
    bits += localStorage.getItem('darkMode') === 'true' ? '1' : '0';
    bits += localStorage.getItem('showIncomplete') === 'true' ? '1' : '0';
    bits += localStorage.getItem('hideControversial') === 'true' ? '1' : '0';

    // Convert binary to base32 for shorter password
    const base32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let num = BigInt('0b' + bits);
    let password = '';
    do {
        password = base32[num % 32n] + password;
        num /= 32n;
    } while (num > 0n);

    return password;
}

// Decode password and apply state
function applyPassword(pw) {
    const base32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let num = 0n;
    for (let i = 0; i < pw.length; i++) {
        const idx = base32.indexOf(pw[i].toUpperCase());
        if (idx === -1) return false;
        num = num * 32n + BigInt(idx);
    }
    let bits = num.toString(2).padStart(getAllGameIds().length + 3, '0');
    if (bits.length < getAllGameIds().length + 3) return false;

    // Apply game states
    const ids = getAllGameIds();
    document.querySelectorAll('input[data-id]').forEach((cb, i) => {
        cb.checked = bits[i] === '1';
        localStorage.setItem(cb.dataset.id, cb.checked);
    });
    // Apply filter settings
    const darkMode = bits[ids.length] === '1';
    const showIncomplete = bits[ids.length + 1] === '1';
    const hideControversial = bits[ids.length + 2] === '1';

    localStorage.setItem('darkMode', darkMode);
    document.body.classList.toggle('dark', darkMode);
    darkModeToggle.checked = darkMode;

    localStorage.setItem('showIncomplete', showIncomplete);
    showOnlyIncomplete.checked = showIncomplete;

    localStorage.setItem('hideControversial', hideControversial);
    hideControversialToggle.checked = hideControversial;

    applyFilter();
    updateProgress();
    return true;
}

function showPasswordPopup(mode) {
    if (mode === 'generate') {
        const pw = generatePassword();
        alert("Your Save Password: " + pw);
    } else {
        const val = prompt("Enter Save Password:");
        if (val !== null && val.trim() !== "") {
            const ok = applyPassword(val.trim());
            if (!ok) {
                alert("Invalid password!");
            }
        }
    }
}

// Function to apply the filter to show incomplete games and/or hide controversial
function applyFilter() {
    const showIncomplete = showOnlyIncomplete.checked;
    const hideControversial = hideControversialToggle && hideControversialToggle.checked;
    document.querySelectorAll('input[data-id]').forEach(cb => {
        let hide = false;
        if (hideControversial && controversialIds.includes(cb.dataset.id)) {
            hide = true;
        }
        if (showIncomplete && cb.checked) {
            hide = true;
        }
        cb.parentElement.classList.toggle('hidden', hide);
    });
    updateProgress();
}

// When page loads, initialize preferences
document.addEventListener('DOMContentLoaded', () => {
    // Apply Dark Mode from localStorage
    const darkModePreference = localStorage.getItem('darkMode');
    if (darkModePreference === 'true') {
        document.body.classList.add('dark');
        darkModeToggle.checked = true;
    } else {
        document.body.classList.remove('dark');
        darkModeToggle.checked = false;
    }

    // Apply Show Only Incomplete filter from localStorage
    const showIncompletePreference = localStorage.getItem('showIncomplete');
    if (showIncompletePreference === 'true') {
        showOnlyIncomplete.checked = true;
    } else {
        showOnlyIncomplete.checked = false;
    }

    // Apply Hide Controversial filter from localStorage
    const hideControversialPreference = localStorage.getItem('hideControversial');
    if (hideControversialPreference === 'true') {
        hideControversialToggle.checked = true;
    } else {
        hideControversialToggle.checked = false;
    }

    renderCheckboxes();
    applyFilter();
});

// Save Dark Mode preference to localStorage
darkModeToggle.addEventListener('change', () => {
    const isDarkMode = darkModeToggle.checked;
    localStorage.setItem('darkMode', isDarkMode);
    document.body.classList.toggle('dark', isDarkMode);
});

// Save Show Only Incomplete preference to localStorage
showOnlyIncomplete.addEventListener('change', () => {
    const showIncomplete = showOnlyIncomplete.checked;
    localStorage.setItem('showIncomplete', showIncomplete);
    applyFilter();
});

// Save Hide Controversial preference to localStorage
hideControversialToggle.addEventListener('change', () => {
    const hideControversial = hideControversialToggle.checked;
    localStorage.setItem('hideControversial', hideControversial);
    applyFilter();
});

// Initialize the checklist UI
renderCheckboxes();

// Import checklist from JSON
function importChecklist(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);
            if (typeof data !== 'object' || Array.isArray(data)) throw new Error();

            // Import game checklist
            let validKeys = 0;
            document.querySelectorAll('input[data-id]').forEach(cb => {
                if (data.games && data.games.hasOwnProperty(cb.dataset.id)) {
                    cb.checked = data.games[cb.dataset.id];
                    localStorage.setItem(cb.dataset.id, cb.checked);
                    validKeys++;
                }
            });

            if (validKeys === 0) {
                alert('No valid game entries found in the JSON.');
                return;
            }

            // Import settings (Dark Mode, Show Only Incomplete, Hide Controversial)
            if (data.hasOwnProperty('darkMode')) {
                localStorage.setItem('darkMode', data.darkMode);
                document.body.classList.toggle('dark', data.darkMode);
                darkModeToggle.checked = data.darkMode;
            }

            if (data.hasOwnProperty('showIncomplete')) {
                localStorage.setItem('showIncomplete', data.showIncomplete);
                showOnlyIncomplete.checked = data.showIncomplete;
                applyFilter();
            }

            if (data.hasOwnProperty('hideControversial')) {
                localStorage.setItem('hideControversial', data.hideControversial);
                hideControversialToggle.checked = data.hideControversial;
                applyFilter();
                updateProgress();
            }

            updateProgress();
            applyFilter();
        } catch (err) {
            if (err.message === 'Unexpected token' || err.message.includes('JSON')) {
                alert('Invalid JSON format.');
            } else {
                alert('Error importing checklist. Please make sure the file is valid.');
            }
        }
    };
    reader.readAsText(file);
}

// Export checklist as JSON
function exportChecklist() {
    const data = {
        darkMode: localStorage.getItem('darkMode') === 'true',
        showIncomplete: localStorage.getItem('showIncomplete') === 'true',
        hideControversial: localStorage.getItem('hideControversial') === 'true',
        games: {}
    };

    document.querySelectorAll('input[data-id]').forEach(cb => {
        data.games[cb.dataset.id] = cb.checked;
    });

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mario_checklist.json';
    a.click();
    URL.revokeObjectURL(url);
}