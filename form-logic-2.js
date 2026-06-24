document.addEventListener('DOMContentLoaded', () => {
    // 1. City Data
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

    // Floating Debugger
    const debugBox = document.createElement('div');
    debugBox.style.cssText = "position:fixed; bottom:20px; right:20px; background:#111; color:#00ff66; padding:12px 18px; border-radius:6px; font-family:monospace; font-size:12px; z-index:999999; border:1px solid #00ff66; pointer-events:none; box-shadow: 0 4px 20px rgba(0,0,0,0.5);";
    document.body.appendChild(debugBox);


    // Populate Dropdowns
    document.querySelectorAll('[country]').forEach(countryEl => {
        const id = countryEl.getAttribute('country');
        const cityEl = document.querySelector(`[city="${id}"]`);

        countryEl.innerHTML = `<option value="">Select a country...</option>`;
        countries.forEach(c => {
            const opt = document.createElement('option');
            opt.value = opt.textContent = c;
            countryEl.appendChild(opt);
        });

        if (cityEl) {
            countryEl.addEventListener('change', (e) => updateCityDropdown(cityEl, e.target.value));
            if (countries.includes("United Kingdom")) {
                countryEl.value = "United Kingdom";
                updateCityDropdown(cityEl, "United Kingdom", "London");
            }
        }
    });

    function updateCityDropdown(cityEl, countryName, defaultValue = "") {
        const cities = locationData[countryName] || [];
        cityEl.innerHTML = `<option value="">Select a city...</option>`;

        if (cities.length > 0) {
            cities.sort().forEach(c => {
                const opt = document.createElement('option');
                opt.value = opt.textContent = c;
                cityEl.appendChild(opt);
            });
            cityEl.disabled = false;
            if (defaultValue && cities.includes(defaultValue)) cityEl.value = defaultValue;
        } else {
            cityEl.innerHTML = '<option value="">No cities required</option>';
            cityEl.disabled = true;
        }
    }

    // --- SAFE WEBFLOW STATE CHECKER ---
    const isChecked = (el) => {
        if (el.checked) return true;
        const labelParent = el.closest('label');
        return labelParent ? !!labelParent.querySelector('.w--redirected-checked') : false;
    };

    const profileRadios = document.querySelectorAll('input[name="Profile"]');
    const allQuestionSets = document.querySelectorAll('[question-set]');
    const questionSet3 = document.querySelector('[question-set="3"]');
    const questionPrompt = document.querySelector('[question="prompt"]');

    // --- THE CORE VALIDATOR ---
    const validateCompletion = () => {
        const activeProfile = Array.from(profileRadios).find(isChecked);

        if (!activeProfile) {
            debugBox.innerHTML = "Status: Pick a profile above";
            return;
        }

        const setId = activeProfile.getAttribute('show-question-set');

        if (setId === '3') {
            debugBox.innerHTML = "Profile 'Other' -> Unlocking Step 3";
            renderFinal(true);
            return;
        }

        const activeSetDom = document.querySelector(`[question-set="${setId}"]`);
        if (!activeSetDom) return;

        const questionItems = Array.from(activeSetDom.querySelectorAll('.question_item'));
        let score = 0;
        let stuckOn = "None";

        for (const q of questionItems) {
            let passed = false;
            const qTitle = q.querySelector('.question_text')?.textContent.trim() || "Question";

            const selects = Array.from(q.querySelectorAll('select'));
            const inputs = Array.from(q.querySelectorAll('input[type="radio"], input[type="checkbox"]'));

            if (selects.length > 0) {
                passed = selects.every(s => s.disabled || (s.value && s.value.trim() !== ""));
            } else if (inputs.length > 0) {
                passed = inputs.some(isChecked);
            } else {
                passed = true;
            }

            if (passed) {
                score++;
            } else if (stuckOn === "None") {
                stuckOn = qTitle;
            }
        }

        const isFinished = (score === questionItems.length);

        if (isFinished) {
            debugBox.innerHTML = `<b>Set ${setId} Complete! (${score}/${questionItems.length})</b>`;
        } else {
            debugBox.innerHTML = `Set ${setId} progress: ${score}/${questionItems.length} <br><span style="color:#ff4444">Blank:</span> "${stuckOn}"`;
        }

        renderFinal(isFinished);
    };

    const renderFinal = (ready) => {
        if (questionSet3) questionSet3.style.display = ready ? 'block' : 'none';
        if (questionPrompt) questionPrompt.style.display = ready ? 'none' : 'block';
    };

    const updateQuestionSets = () => {
        const activeProfile = Array.from(profileRadios).find(isChecked);
        if (!activeProfile) return;

        const selectedSetId = activeProfile.getAttribute('show-question-set');

        profileRadios.forEach(input => {
            const line = input.closest('label')?.querySelector('.radio-checkbox_field_line');
            if (line) line.classList.toggle('selected', isChecked(input));
        });

        allQuestionSets.forEach(set => set.style.display = 'none');

        const targetDom = document.querySelector(`[question-set="${selectedSetId}"]`);
        if (targetDom) targetDom.style.display = 'block';

        validateCompletion();
    };

    // --- THE MASTER OVERRIDE: Capture Phase listeners ---
    // The 'true' at the end forces the browser to hand us the event BEFORE Webflow can call stopPropagation()
    ['click', 'change', 'input'].forEach(eventType => {
        document.addEventListener(eventType, (e) => {
            if (e.target.closest('.w-form')) {
                // 150ms buffer lets Webflow's internal script finish applying its visual CSS classes
                setTimeout(() => {
                    if (e.target.closest('.radio-checkbox_field_var2')) {
                        updateQuestionSets();
                    } else {
                        validateCompletion();
                    }
                    triggerSubFields();
                }, 150);
            }
        }, true);
    });

    // Toggle "Other - Please specify" text boxes
    const triggerSubFields = () => {
        document.querySelectorAll('[field-show]').forEach(trigger => {
            const fieldId = trigger.getAttribute('field-show');
            const targetField = document.querySelector(`[field="${fieldId}"]`);
            if (!targetField) return;

            if (trigger.type === 'checkbox') {
                targetField.style.display = isChecked(trigger) ? 'block' : 'none';
            } else if (trigger.type === 'radio') {
                const activeGroupRadio = Array.from(document.querySelectorAll(`input[name="${trigger.name}"]`)).find(isChecked);
                targetField.style.display = (activeGroupRadio?.getAttribute('field-show') === fieldId) ? 'block' : 'none';
            }
        });
    };

    // Initial kickstart
    setTimeout(() => {
        updateQuestionSets();
        triggerSubFields();
    }, 200);
});
