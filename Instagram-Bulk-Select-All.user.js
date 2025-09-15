// ==UserScript==
// @name         Instagram Bulk Select All
// @namespace    http://tampermonkey.net/
// @version      2025-09-15
// @description  Add a "Select All" button to Instagram's bulk action interface
// @author       1337cookie
// @match        https://www.instagram.com/your_activity/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=instagram.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let buttonAdded = false;

    function addSelectAllButton() {
        // Don't add multiple buttons
        if (buttonAdded) return;

        // Find the bulk action container with "selected" text
        const containers = document.querySelectorAll('[data-bloks-name="bk.components.Text"]');
        let targetContainer = null;

        for (let container of containers) {
            if (container.textContent && container.textContent.includes('selected')) {
                targetContainer = container.closest('[data-bloks-name="bk.components.Flexbox"]');
                break;
            }
        }

        if (!targetContainer) return;

        // Find the parent container that has the row with buttons
        const parentContainer = targetContainer.parentElement;
        if (!parentContainer) return;

        // Create the "Select All" button with Instagram's styling
        const selectAllButton = document.createElement('div');
        selectAllButton.setAttribute('data-bloks-name', 'bk.components.Flexbox');
        selectAllButton.setAttribute('tabindex', '0');
        selectAllButton.setAttribute('role', 'button');
        selectAllButton.setAttribute('aria-label', 'Select All');
        selectAllButton.className = 'wbloks_1';
        selectAllButton.style.cssText = `
            pointer-events: auto;
            width: auto;
            min-height: 32px;
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
            align-items: center;
            justify-content: center;
            margin-right: 8px;
        `;

        // Create the inner content container
        const innerContainer = document.createElement('div');
        innerContainer.setAttribute('data-bloks-name', 'bk.components.Flexbox');
        innerContainer.className = 'wbloks_1';
        innerContainer.style.cssText = `
            pointer-events: none;
            width: auto;
            margin: 5px 16px;
            align-items: center;
            justify-content: center;
        `;

        // Create the text element
        const textElement = document.createElement('div');
        textElement.setAttribute('data-bloks-name', 'bk.components.RichText');
        textElement.setAttribute('dir', 'auto');
        textElement.className = 'wbloks_1';
        textElement.style.cssText = `
            line-height: 1.3;
            display: block;
            overflow: hidden;
        `;

        const textSpan = document.createElement('span');
        textSpan.setAttribute('data-bloks-name', 'bk.components.TextSpan');
        textSpan.style.cssText = `
            color: rgb(0, 149, 246);
            font-weight: 700;
            display: inline;
            font-size: 14px;
            white-space: pre-wrap;
            overflow-wrap: break-word;
        `;
        textSpan.textContent = 'Select All';

        // Create the background decoration
        const bgDecoration = document.createElement('div');
        bgDecoration.setAttribute('data-bloks-name', 'bk.components.BoxDecoration');
        bgDecoration.className = 'wbloks_6';
        bgDecoration.style.cssText = 'background: rgba(0, 0, 0, 0);';

        // Assemble the button
        textElement.appendChild(textSpan);
        innerContainer.appendChild(textElement);
        selectAllButton.appendChild(innerContainer);
        selectAllButton.appendChild(bgDecoration);

        // Add click handler
        selectAllButton.addEventListener('click', function() {
            selectAllCheckboxes();
        });

        // Insert the button into the right side of the container (before the Unlike button)
        const rightContainer = parentContainer.querySelector('[data-bloks-name="bk.components.Flexbox"]:last-child');
        if (rightContainer) {
            rightContainer.insertBefore(selectAllButton, rightContainer.firstChild);
            buttonAdded = true;
            console.log('Instagram Bulk Select: "Select All" button added');
        }
    }

    function selectAllCheckboxes() {
        const checkboxes = document.querySelectorAll('[data-testid="bulk_action_checkbox"]');

        if (checkboxes.length === 0) {
            console.log('No bulk action checkboxes found on this page.');
            return;
        }

        console.log(`Found ${checkboxes.length} checkboxes. Selecting all...`);

        // Click each checkbox with a small delay
        checkboxes.forEach((checkbox, index) => {
            setTimeout(() => {
                const button = checkbox.querySelector('[role="button"]');
                if (button) {
                    // Check if already selected (look for checked state or visual indicators)
                    const isSelected = checkbox.querySelector('[style*="circle-check"], [style*="checkmark"]') !== null;

                    if (!isSelected) {
                        button.style.pointerEvents = 'auto';
                        checkbox.style.pointerEvents = 'auto';
                        button.click();
                        console.log(`Selected checkbox ${index + 1}/${checkboxes.length}`);
                    }
                }
            }, index * 50); // 50ms delay between each click
        });

        console.log('Bulk selection process started.');
    }

    function observeForBulkInterface() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    // Reset button flag when navigating or interface changes
                    if (!document.querySelector('[data-bloks-name="bk.components.Text"]') ||
                        !Array.from(document.querySelectorAll('[data-bloks-name="bk.components.Text"]'))
                            .some(el => el.textContent && el.textContent.includes('selected'))) {
                        buttonAdded = false;
                    }

                    // Try to add button when bulk interface appears
                    setTimeout(addSelectAllButton, 500);
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Initialize
    setTimeout(() => {
        addSelectAllButton();
        observeForBulkInterface();
    }, 2000);

    console.log('Instagram Bulk Select script loaded');
})();