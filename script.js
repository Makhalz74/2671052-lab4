// DOM Element References
const countryInput = document.getElementById('country-input');
const searchBtn = document.getElementById('search-btn');
const loadingSpinner = document.getElementById('loading-spinner');
const countryInfo = document.getElementById('country-info');
const borderingCountries = document.getElementById('bordering-countries');
const errorMessage = document.getElementById('error-message');

// API Base URL
const API_URL = 'https://restcountries.com/v3.1';

// 1. Initialize UI State (Hide dynamic elements on load)
loadingSpinner.classList.add('hidden');
countryInfo.classList.add('hidden');
borderingCountries.classList.add('hidden');
errorMessage.classList.add('hidden');

// 2. Helper Functions using .hidden class
function showLoading() {
    loadingSpinner.classList.remove('hidden'); // Show spinner
    countryInfo.classList.add('hidden');       // Hide results
    borderingCountries.classList.add('hidden');
    errorMessage.classList.add('hidden');
}

function hideLoading() {
    loadingSpinner.classList.add('hidden'); // Hide spinner
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden'); // Show error
    countryInfo.classList.add('hidden');
    borderingCountries.classList.add('hidden');
}

// Main Search Function
async function searchCountry(countryName) {
    if (!countryName.trim()) {
        showError('Please enter a country name.');
        return;
    }

    showLoading();

    try {
        const response = await fetch(`${API_URL}/name/${countryName}`);
        
        if (!response.ok) {
            throw new Error('Country not found.');
        }

        const data = await response.json();
        const country = data[0];

        displayCountryInfo(country);
        await displayBorderingCountries(country.borders);

    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

// Helper function to display main country data
function displayCountryInfo(country) {
    const capital = country.capital ? country.capital[0] : 'N/A';
    
    countryInfo.innerHTML = `
        <h2>${country.name.common}</h2>
        <img src="${country.flags.svg}" alt="Flag of ${country.name.common}">
        <p><strong>Capital:</strong> ${capital}</p>
        <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
        <p><strong>Region:</strong> ${country.region}</p>
    `;
    
    countryInfo.classList.remove('hidden');
}

// Helper function to fetch and display neighbors
async function displayBorderingCountries(borderCodes) {
    borderingCountries.innerHTML = '';

    if (!borderCodes || borderCodes.length === 0) {
        borderingCountries.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #777;">No bordering countries found.</p>';
        borderingCountries.classList.remove('hidden');
        return;
    }

    const borderPromises = borderCodes.map(code => 
        fetch(`${API_URL}/alpha/${code}`).then(res => res.json())
    );

    try {
        const bordersData = await Promise.all(borderPromises);

        bordersData.forEach(data => {
            const neighbor = data[0];
            
            const borderDiv = document.createElement('div');
            borderDiv.classList.add('border-item');
            
            borderDiv.innerHTML = `
                <img src="${neighbor.flags.svg}" alt="Flag of ${neighbor.name.common}">
                <p>${neighbor.name.common}</p>
            `;
            
            borderingCountries.appendChild(borderDiv);
        });

        borderingCountries.classList.remove('hidden');

    } catch (error) {
        console.error('Error fetching bordering countries:', error);
        borderingCountries.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #777;">Could not load neighbor details.</p>';
        borderingCountries.classList.remove('hidden');
    }
}

// Event Listeners
searchBtn.addEventListener('click', () => {
    const country = countryInput.value;
    searchCountry(country);
});

countryInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const country = countryInput.value;
        searchCountry(country);
    }
});
