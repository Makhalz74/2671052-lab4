// DOM Element References
const countryInput = document.getElementById('country-input');
const searchBtn = document.getElementById('search-btn');
const loadingSpinner = document.getElementById('loading-spinner');
const countryInfo = document.getElementById('country-info');
const borderingCountries = document.getElementById('bordering-countries');
const errorMessage = document.getElementById('error-message');

// API Base URL
const API_URL = 'https://restcountries.com/v3.1';

// Function to show loading spinner
function showLoading() {
    loadingSpinner.classList.remove('hidden');
    countryInfo.classList.add('hidden');
    borderingCountries.classList.add('hidden');
    errorMessage.classList.add('hidden');
}

// Function to hide loading spinner
function hideLoading() {
    loadingSpinner.classList.add('hidden');
}

// Function to show errors
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    countryInfo.classList.add('hidden');
    borderingCountries.classList.add('hidden');
}

// Main Search Function
async function searchCountry(countryName) {
    // Validation: Check if input is empty
    if (!countryName.trim()) {
        showError('Please enter a country name.');
        return;
    }

    showLoading();

    try {
        // 1. Fetch Country Data
        const response = await fetch(`${API_URL}/name/${countryName}`);
        
        if (!response.ok) {
            throw new Error('Country not found. Please check the spelling.');
        }

        const data = await response.json();
        
        // The API returns an array, we take the first result
        const country = data[0];

        // 2. Update DOM for Main Country Info
        displayCountryInfo(country);

        // 3. Fetch and Display Bordering Countries
        await displayBorderingCountries(country.borders);

    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

// Helper function to display main country data
function displayCountryInfo(country) {
    // Handle capital (some countries like Tokelau might not have one)
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
    // Clear previous borders
    borderingCountries.innerHTML = '';

    // Handle countries with no borders (islands, etc.)
    if (!borderCodes || borderCodes.length === 0) {
        borderingCountries.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #777;">No bordering countries found.</p>';
        borderingCountries.classList.remove('hidden');
        return;
    }

    // Create an array of promises to fetch all border details in parallel
    const borderPromises = borderCodes.map(code => 
        fetch(`${API_URL}/alpha/${code}`).then(res => res.json())
    );

    try {
        const bordersData = await Promise.all(borderPromises);

        // Loop through results and create HTML elements
        bordersData.forEach(data => {
            // The alpha endpoint returns an array with one item
            const neighbor = data[0];
            
            const borderDiv = document.createElement('div');
            borderDiv.classList.add('border-item'); // Using a generic class for grid items
            
            borderDiv.innerHTML = `
                <img src="${neighbor.flags.svg}" alt="Flag of ${neighbor.name.common}">
                <p>${neighbor.name.common}</p>
            `;
            
            borderingCountries.appendChild(borderDiv);
        });

        borderingCountries.classList.remove('hidden');

    } catch (error) {
        console.error('Error fetching bordering countries:', error);
        // We don't show a main error here, just log it, as the main search was successful
        borderingCountries.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #777;">Could not load neighbor details.</p>';
        borderingCountries.classList.remove('hidden');
    }
}

// Event Listeners

// 1. Click event for search button
searchBtn.addEventListener('click', () => {
    const country = countryInput.value;
    searchCountry(country);
});

// 2. Enter key press in input field
countryInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const country = countryInput.value;
        searchCountry(country);
    }
});
