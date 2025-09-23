let currentPage = 1;
const itemsPerPage = 5;
let totalPages = 0;
let filteredData = [];
let searchTerm = '';
let selectedState = '';
let hasSearched = false;
let hauntedPlacesData = [];

async function loadData() {
    try {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('places-container').style.display = 'none';

        const response = await fetch('haunted_places.json');
        hauntedPlacesData = await response.json();

        populateStateFilter();
        setupEventListeners();

        document.getElementById('loading').style.display = 'none';
        document.getElementById('places-container').style.display = 'block';
        document.getElementById('pagination').style.display = 'none';
        showInitialMessage();
    } catch (error) {
        document.getElementById('loading').textContent = 'Error loading data: ' + error.message;
    }
}

function showInitialMessage() {
    const container = document.getElementById('places-container');
    container.innerHTML = '<div class="initial-message">Use the search box or state filter to find haunted places.</div>';
    document.getElementById('resultsCount').textContent = '';
}

function populateStateFilter() {
    const stateFilter = document.getElementById('stateFilter');
    const states = [...new Set(hauntedPlacesData.map(place => place.state).filter(Boolean))].sort();

    states.forEach(state => {
        const option = document.createElement('option');
        option.value = state;
        option.textContent = state;
        stateFilter.appendChild(option);
    });
}

function populateCityFilter() {
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const stateFilter = document.getElementById('stateFilter');

    searchInput.addEventListener('input', handleSearch);
    stateFilter.addEventListener('change', handleStateFilter);
}

function handleSearch(event) {
    searchTerm = event.target.value.toLowerCase().trim();
    currentPage = 1;
    hasSearched = searchTerm !== '' || selectedState !== '';

    if (hasSearched) {
        filterData();
        updateDisplay();
    } else {
        showInitialMessage();
    }
}

function handleStateFilter(event) {
    selectedState = event.target.value;
    currentPage = 1;
    hasSearched = searchTerm !== '' || selectedState !== '';

    if (hasSearched) {
        filterData();
        updateDisplay();
    } else {
        showInitialMessage();
    }
}

function handleCityFilter(event) {
}

function filterData() {
    filteredData = hauntedPlacesData.filter(place => {
        const matchesSearch = !searchTerm ||
            (place.location && place.location.toLowerCase().includes(searchTerm)) ||
           (place.description && place.description.toLowerCase().includes(searchTerm)) ||
            (place.city && place.city.toLowerCase().includes(searchTerm)) ||
            (place.state && place.state.toLowerCase().includes(searchTerm));

        const matchesState = !selectedState || place.state === selectedState;

        return matchesSearch && matchesState;
    });
}

function updateDisplay() {
    totalPages = Math.ceil(filteredData.length / itemsPerPage);

    if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
    }

    document.getElementById('loading').style.display = 'none';
    document.getElementById('places-container').style.display = 'block';
    document.getElementById('pagination').style.display = filteredData.length > 0 ? 'flex' : 'none';

    displayPlaces();
    updatePagination();
    updateResultsCount();
}

function updateResultsCount() {
    const resultsCount = document.getElementById('resultsCount');
    const total = filteredData.length;
    const showing = Math.min(itemsPerPage, total - (currentPage - 1) * itemsPerPage);
    const start = total > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const end = start + showing - 1;

    if (total === 0) {
        resultsCount.textContent = 'No results found';
    } else if (total <= itemsPerPage) {
        resultsCount.textContent = `Showing ${total} result${total !== 1 ? 's' : ''}`;
    } else {
        resultsCount.textContent = `Showing ${start}-${end} of ${total} results`;
    }
}

function displayPlaces() {
    const container = document.getElementById('places-container');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const placesToShow = filteredData.slice(startIndex, endIndex);

    if (placesToShow.length === 0) {
        container.innerHTML = '<div class="no-results">No haunted places found matching your criteria.</div>';
        return;
    }

    container.innerHTML = placesToShow.map(place => `
        <div class="place-card">
            <div class="place-title">${place.location || 'Unknown Location'}</div>
            <div class="place-location">
                📍 ${place.city}, ${place.state || place.country}
            </div>
            <div class="place-description">${place.description}</div>
        </div>
    `).join('');
}

function updatePagination() {
    document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === totalPages;
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        updateDisplay();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        updateDisplay();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

document.addEventListener('DOMContentLoaded', loadData);