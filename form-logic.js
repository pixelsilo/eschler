document.addEventListener('DOMContentLoaded', () => {
  // 1. Define high-level data for "Major Cities"
  // You can easily expand this list as needed.
  const locationData = {
    "Australia": ["Sydney", "Melbourne", "Brisbane", "Perth"],
    "Austria": ["Vienna"],
    "Belgium": ["Brussels"],
    "Brazil": ["São Paulo", "Rio de Janeiro"],
    "Canada": ["Toronto", "Vancouver", "Montreal"],
    "China": ["Shanghai", "Beijing", "Shenzhen"],
    "Denmark": ["Copenhagen"],
    "Finland": ["Helsinki"],
    "France": ["Paris", "Lyon"],
    "Germany": ["Frankfurt", "Berlin", "Munich", "Hamburg"],
    "Hong Kong": ["Hong Kong"],
    "India": ["Mumbai", "Bangalore", "Delhi"],
    "Ireland": ["Dublin"],
    "Israel": ["Tel Aviv"],
    "Italy": ["Milan", "Rome"],
    "Japan": ["Tokyo", "Osaka"],
    "Luxembourg": ["Luxembourg City"],
    "Mexico": ["Mexico City"],
    "Netherlands": ["Amsterdam", "Rotterdam"],
    "New Zealand": ["Auckland", "Wellington"],
    "Norway": ["Oslo"],
    "Qatar": ["Doha"],
    "Saudi Arabia": ["Riyadh", "Jeddah"],
    "Singapore": ["Singapore"],
    "South Africa": ["Johannesburg", "Cape Town"],
    "South Korea": ["Seoul"],
    "Spain": ["Madrid", "Barcelona"],
    "Sweden": ["Stockholm"],
    "Switzerland": ["Zurich", "Geneva", "Lugano"],
    "United Arab Emirates": ["Dubai", "Abu Dhabi"],
    "United Kingdom": ["London", "Manchester", "Edinburgh", "Birmingham"],
    "United States": ["New York", "San Francisco", "Chicago", "Miami", "Boston", "Los Angeles"],
  };

  const countries = Object.keys(locationData).sort();

  // 2. Identify all country/city pairs based on your custom attributes
  const countrySelectors = document.querySelectorAll('[country]');

  countrySelectors.forEach(countryEl => {
    const id = countryEl.getAttribute('country');
    const cityEl = document.querySelector(`[city="${id}"]`);
    
    // 3. Populate Country Dropdown
    populateDropdown(countryEl, countries, "Select a country...");

    // 4. Handle City logic only if a paired city field exists
    if (cityEl) {
      countryEl.addEventListener('change', (e) => {
        const selectedCountry = e.target.value;
        updateCityDropdown(cityEl, selectedCountry);
      });

      // 5. Set Defaults: United Kingdom & London (Specific to pair #1)
      setDefaults(countryEl, cityEl, "United Kingdom", "London");
    }
  });

  /**
   * Helper to populate a select element
   */
  function populateDropdown(el, items, placeholder) {
    // Clear existing (except Webflow's default first option if preferred)
    el.innerHTML = `<option value="">${placeholder}</option>`;
    
    items.forEach(item => {
      const option = document.createElement('option');
      option.value = item;
      option.textContent = item;
      el.appendChild(option);
    });
  }

  /**
   * Updates the city dropdown based on country selection
   */
  function updateCityDropdown(cityEl, countryName, defaultValue = "") {
    const cities = locationData[countryName] || [];
    
    if (cities.length > 0) {
      populateDropdown(cityEl, cities.sort(), "Select a city...");
      cityEl.disabled = false;
      
      if (defaultValue && cities.includes(defaultValue)) {
        cityEl.value = defaultValue;
      }
    } else {
      cityEl.innerHTML = '<option value="">Select a country first</option>';
      cityEl.disabled = true;
    }

    // Trigger a change event for Webflow/other scripts to notice
    cityEl.dispatchEvent(new Event('change'));
  }

  /**
   * Logic to handle the initial pre-selection
   */
  function setDefaults(countryEl, cityEl, defaultCountry, defaultCity) {
    if (countries.includes(defaultCountry)) {
      countryEl.value = defaultCountry;
      // Manually trigger the city update
      updateCityDropdown(cityEl, defaultCountry, defaultCity);
      
      // Dispatch change so any Webflow "Active" classes apply
      countryEl.dispatchEvent(new Event('change'));
    }
  }

  // --- NEW: Question Set Toggling Logic ---
  const profileRadios = document.querySelectorAll('input[name="Profile"]');
  const allQuestionSets = document.querySelectorAll('[question-set]');
  const questionSet3 = document.querySelector('[question-set="3"]'); // The final contact form
  const questionPrompt = document.querySelector('[question="prompt"]');

  /**
   * Checks if the active question set (1 or 2) is fully answered.
   * If complete, reveals the final contact form (set 3).
   */
  const validateCompletion = () => {
    const activeProfile = document.querySelector('input[name="Profile"]:checked');
    if (!activeProfile || !questionSet3) return;

    const setId = activeProfile.getAttribute('show-question-set');
    const currentSet = document.querySelector(`[question-set="${setId}"]`);
    let isComplete = false;

    if (setId === '3') {
      // Directly jumping to the final set counts as completion for prompt visibility
      isComplete = true;
    } else if (currentSet) {
      // A set is complete if all dropdowns have a value and all radio groups have a selection
      const selects = currentSet.querySelectorAll('select');
      const radioGroups = new Set();
      currentSet.querySelectorAll('input[type="radio"]').forEach(r => radioGroups.add(r.name));

      const isDropdownsFilled = Array.from(selects).every(s => s.value !== "");
      const isRadiosFilled = Array.from(radioGroups).every(name => !!currentSet.querySelector(`input[name="${name}"]:checked`));

      isComplete = isDropdownsFilled && isRadiosFilled;
    }

    // Synchronize visibility of Set 3 and the Prompt div
    questionSet3.style.display = isComplete ? 'block' : 'none';
    if (questionPrompt) questionPrompt.style.display = isComplete ? 'none' : 'block';
  };

  /**
   * Handles showing the correct question set based on profile selection
   */
  const updateQuestionSets = (radio) => {
    const selectedSetId = radio.getAttribute('show-question-set');

    // Update visual selection classes for the radio group
    document.querySelectorAll(`input[name="${radio.name}"]`).forEach(input => {
      const line = input.closest('label')?.querySelector('.radio-checkbox_field_line');
      if (line) {
        line.classList.toggle('selected', input.checked);
      }
    });

    // Hide all sets first
    allQuestionSets.forEach(set => {
      set.style.display = 'none';
    });

    // Show the specific set for the profile
    const currentProfileSet = document.querySelector(`[question-set="${selectedSetId}"]`);
    if (currentProfileSet) {
      currentProfileSet.style.display = 'block';
    }

    // Re-evaluate completion when profile changes
    validateCompletion();
  };

  profileRadios.forEach(radio => {
    radio.addEventListener('change', () => updateQuestionSets(radio));
  });

  // Initialize visibility based on current selection (handles page refreshes)
  const checkedProfile = document.querySelector('input[name="Profile"]:checked');
  if (checkedProfile) updateQuestionSets(checkedProfile);

  // Listen for any changes inside question sets to trigger visibility of the final step
  document.querySelector('#email-form')?.addEventListener('change', (e) => {
    if (e.target.closest('[question-set]')) {
      validateCompletion();
    }
  });

  // --- Existing: Individual Field Toggling (e.g. "Other - Please Specify") ---
  const fieldTriggers = document.querySelectorAll('[field-show]');
  fieldTriggers.forEach(trigger => {
    const fieldId = trigger.getAttribute('field-show');
    const targetField = document.querySelector(`[field="${fieldId}"]`);
    if (!targetField) return;

    const toggleField = () => {
      if (trigger.type === 'checkbox') {
        targetField.style.display = trigger.checked ? 'block' : 'none';
      } else if (trigger.type === 'radio') {
        const name = trigger.name;
        const checkedRadio = document.querySelector(`input[name="${name}"]:checked`);
        const activeFieldId = checkedRadio ? checkedRadio.getAttribute('field-show') : null;
        targetField.style.display = (activeFieldId === fieldId) ? 'block' : 'none';
      }
    };

    trigger.addEventListener('change', toggleField);
    toggleField(); // Run once on load to sync initial state

    // For radios, listen to the whole group to hide when a different option is picked
    if (trigger.type === 'radio') {
      document.querySelectorAll(`input[name="${trigger.name}"]`).forEach(radio => {
        if (radio !== trigger) radio.addEventListener('change', toggleField);
      });
    }
  });
});