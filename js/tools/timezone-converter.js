// Time Zone Converter Tool
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const fromTimezone = document.getElementById('from-timezone');
    const toTimezone = document.getElementById('to-timezone');
    const fromTime = document.getElementById('from-time');
    const swapBtn = document.getElementById('swap-btn');
    const convertBtn = document.getElementById('convert-btn');
    const resultBox = document.getElementById('result-box');
    const resultTime = document.getElementById('result-time');
    const resultDate = document.getElementById('result-date');
    const resultDiff = document.getElementById('result-diff');
    const currentTimeDisplay = document.getElementById('current-time-display');
    const infoAlert = document.getElementById('info-alert');
    const errorAlert = document.getElementById('error-alert');

    // Initialize Luxon
    const DateTime = luxon.DateTime;

    // Time Zone Groups
    const timeZoneGroups = {
        'Popular': [
            'America/New_York',
            'Europe/London',
            'Asia/Tokyo',
            'Australia/Sydney',
            'Europe/Paris',
            'Asia/Dubai',
            'Asia/Shanghai',
            'America/Los_Angeles'
        ],
        'North America': [
            'America/New_York',
            'America/Chicago',
            'America/Denver',
            'America/Los_Angeles',
            'America/Phoenix',
            'America/Toronto',
            'America/Vancouver',
            'America/Mexico_City'
        ],
        'Europe': [
            'Europe/London',
            'Europe/Paris',
            'Europe/Berlin',
            'Europe/Rome',
            'Europe/Madrid',
            'Europe/Amsterdam',
            'Europe/Moscow',
            'Europe/Istanbul'
        ],
        'Asia': [
            'Asia/Tokyo',
            'Asia/Shanghai',
            'Asia/Hong_Kong',
            'Asia/Singapore',
            'Asia/Dubai',
            'Asia/Seoul',
            'Asia/Bangkok',
            'Asia/Kolkata'
        ],
        'Pacific': [
            'Australia/Sydney',
            'Australia/Melbourne',
            'Australia/Perth',
            'Pacific/Auckland',
            'Pacific/Fiji',
            'Pacific/Honolulu'
        ]
    };

    // Show info message
    function showInfo(message) {
        infoAlert.textContent = message;
        infoAlert.classList.remove('d-none');
        errorAlert.classList.add('d-none');
        setTimeout(() => {
            infoAlert.classList.add('d-none');
        }, 3000);
    }

    // Show error message
    function showError(message) {
        errorAlert.textContent = message;
        errorAlert.classList.remove('d-none');
        infoAlert.classList.add('d-none');
        setTimeout(() => {
            errorAlert.classList.add('d-none');
        }, 3000);
    }

    // Format time zone name for display
    function formatTimeZoneName(zoneName) {
        return zoneName.split('/').pop().replace(/_/g, ' ');
    }

    // Get time zone abbreviation
    function getTimeZoneAbbr(timezone) {
        const now = DateTime.now().setZone(timezone);
        return now.toFormat('ZZZZ');
    }

    // Populate time zone dropdowns
    function populateTimeZones() {
        const fragment = document.createDocumentFragment();
        
        // Add optgroup for each region
        Object.entries(timeZoneGroups).forEach(([group, zones]) => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = group;
            
            zones.forEach(zone => {
                const option = document.createElement('option');
                option.value = zone;
                const abbr = getTimeZoneAbbr(zone);
                option.textContent = `${formatTimeZoneName(zone)} (${abbr})`;
                optgroup.appendChild(option);
            });
            
            fragment.appendChild(optgroup);
        });

        fromTimezone.appendChild(fragment);
        toTimezone.appendChild(fragment.cloneNode(true));

        // Set default values
        const userTimezone = DateTime.local().zoneName;
        fromTimezone.value = userTimezone;
        toTimezone.value = 'America/New_York';
    }

    // Update current time display
    function updateCurrentTime() {
        const now = DateTime.now();
        currentTimeDisplay.textContent = now.toFormat('fff');
        setTimeout(updateCurrentTime, 1000);
    }

    // Convert time zones
    function convertTimeZones() {
        const fromZone = fromTimezone.value;
        const toZone = toTimezone.value;
        const inputTime = fromTime.value;

        if (!inputTime) {
            showError('Please select a date and time');
            return;
        }

        try {
            // Parse input time
            const dt = DateTime.fromISO(inputTime, { zone: fromZone });
            if (!dt.isValid) {
                throw new Error('Invalid date/time');
            }

            // Convert to target timezone
            const converted = dt.setZone(toZone);
            if (!converted.isValid) {
                throw new Error('Invalid conversion');
            }

            // Calculate time difference
            const fromNow = DateTime.now().setZone(fromZone);
            const toNow = DateTime.now().setZone(toZone);
            const diffHours = toNow.offset - fromNow.offset;
            const diffText = diffHours === 0 
                ? 'Same time zone'
                : `${Math.abs(diffHours)} hour${Math.abs(diffHours) !== 1 ? 's' : ''} ${diffHours > 0 ? 'ahead' : 'behind'}`;

            // Update result
            resultTime.textContent = converted.toFormat('t');
            resultDate.textContent = converted.toFormat('cccc, DD');
            resultDiff.textContent = diffText;
            resultBox.classList.remove('d-none');

            showInfo('Time converted successfully');
        } catch (error) {
            showError('Failed to convert time. Please try again.');
            console.error('Conversion error:', error);
        }
    }

    // Swap time zones
    function swapTimeZones() {
        const temp = fromTimezone.value;
        fromTimezone.value = toTimezone.value;
        toTimezone.value = temp;

        if (fromTime.value) {
            convertTimeZones();
        }
    }

    // Handle popular time zone selection
    function handlePopularTimeZone(e) {
        if (e.target.classList.contains('popular-timezone')) {
            toTimezone.value = e.target.dataset.timezone;
            if (fromTime.value) {
                convertTimeZones();
            }
        }
    }

    // Set current date and time in input
    function setCurrentDateTime() {
        const now = DateTime.now();
        fromTime.value = now.toFormat("yyyy-MM-dd'T'HH:mm");
    }

    // Event Listeners
    convertBtn.addEventListener('click', convertTimeZones);
    swapBtn.addEventListener('click', swapTimeZones);
    document.querySelector('.list-group').addEventListener('click', handlePopularTimeZone);
    
    // Handle time zone changes
    [fromTimezone, toTimezone].forEach(select => {
        select.addEventListener('change', () => {
            if (fromTime.value) {
                convertTimeZones();
            }
        });
    });

    // Handle time input
    fromTime.addEventListener('change', () => {
        if (fromTime.value) {
            convertTimeZones();
        }
    });

    // Initialize
    populateTimeZones();
    updateCurrentTime();
    setCurrentDateTime();
}); 