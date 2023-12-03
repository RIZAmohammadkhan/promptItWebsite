let isEscPressed = false;
let currentFocusedPrompt = null;
let lastActivePrompt = null;
let closestPromptToMouse = null;
let helpTimeout;
let lastFocusedPromptText = '';

document.addEventListener('keydown', handleKeyPress);


function setFocusListener(promptElement) {
    promptElement.addEventListener('focus', function() {
        currentFocusedPrompt = this;
        lastActivePrompt = this;
        // Update lastFocusedPromptText when a prompt gets focus
        lastFocusedPromptText = this.innerText;
    });
}

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        handleEnterKey(event);
    } else if (event.key === 'Enter' && event.shiftKey) {
        document.getElementById('doneButton').click();
    } else if (event.key === 'Escape') {
        isEscPressed = false;
        resetCommandModeFlags();
    } else if (isEscPressed) {
        handleCommandMode(event);
    } else {
        handleActiveMode(event);
    }
}

function handleEnterKey(event) {
    let prompts = document.querySelectorAll('.prompt-wrapper');
    if (prompts.length === 0) {
        event.preventDefault();
        createNewPrompt();
    }
}

function handleActiveMode(event) {
    if (event.key === 'Enter' && event.shiftKey) {
        document.getElementById('doneButton').click();
    }
}

function preventDefaultAndStopPropagation(event) {
    event.preventDefault();
    event.stopPropagation();
}

function resetCommandModeFlags() {
    // Add logic here if there are other flags to reset
}

function showHelp() {
    let helpPanel = document.getElementById('helpPanel');
    helpPanel.style.display = 'block';

    clearTimeout(helpTimeout);

    function handleEnterToCloseHelp(event) {
        if (event.key === 'Enter') {
            closeHelp();
            document.removeEventListener('keydown', handleEnterToCloseHelp);
        }
    }

    document.addEventListener('keydown', handleEnterToCloseHelp);

    helpTimeout = setTimeout(closeHelp, 7000);
}

function closeHelp() {
    let helpPanel = document.getElementById('helpPanel');
    helpPanel.style.display = 'none';
    clearTimeout(helpTimeout);
}

function createNewPrompt() {
    let promptsContainer = document.getElementById('promptsContainer');
    let wrapper = document.createElement('div');
    wrapper.classList.add('prompt-wrapper');

    let promptNumber = document.createElement('span');
    promptNumber.classList.add('prompt-number');

    let newPrompt = document.createElement('div');
    newPrompt.contentEditable = true;
    newPrompt.classList.add('prompt');
    newPrompt.setAttribute('data-placeholder', 'Write your prompt...');

    setFocusListener(newPrompt);

    wrapper.appendChild(promptNumber);
    wrapper.appendChild(newPrompt);
    promptsContainer.appendChild(wrapper);

    updatePromptNumbering();
    newPrompt.focus();
}

function setFocusListener(promptElement) {
    promptElement.addEventListener('focus', function() {
        currentFocusedPrompt = this;
        lastActivePrompt = this;
    });
}

function updatePromptNumbering() {
    const prompts = document.querySelectorAll('.prompt-wrapper');
    prompts.forEach((wrapper, index) => {
        const numberElement = wrapper.querySelector('.prompt-number');
        numberElement.textContent = (index + 1) + ')';
    });
}

document.getElementById('helpButton').addEventListener('click', showHelp);
document.getElementById('doneButton').addEventListener('click', createNewPrompt);

document.getElementById('copyButton').addEventListener('click', function() {
    let copyPromptNumberInput = document.getElementById('copyPromptNumberInput');
    let submitCopyButton = document.getElementById('submitCopyButton');

    copyPromptNumberInput.style.display = 'inline';
    submitCopyButton.style.display = 'inline';

    copyPromptNumberInput.focus();

    // Add an event listener to the copyPromptNumberInput to handle Enter key press
    copyPromptNumberInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            submitCopyButton.click();
        }
    });
});

document.getElementById('submitCopyButton').addEventListener('click', function() {
    let copyPromptNumberInput = document.getElementById('copyPromptNumberInput');
    let promptNumbersInput = copyPromptNumberInput.value.trim();
    let prompts = document.querySelectorAll('.prompt-wrapper');

    if (promptNumbersInput === 'A') {
        // Copy all prompts
        let allPromptsText = '';

        prompts.forEach((wrapper, index) => {
            let promptText = wrapper.querySelector('.prompt').innerText.trim();
            if (promptText !== '') {
                allPromptsText += (index + 1) + ') ' + promptText + '\n\n';
            }
        });

        if (allPromptsText !== '') {
            navigator.clipboard.writeText(allPromptsText).then(() => {
                console.log("Copied all prompts to clipboard successfully!");
            }, (error) => {
                console.error("Failed to copy all prompts: ", error);
            });
        } else {
            console.log("No prompts to copy.");
        }
    } else {
        // Parse and copy selected prompts
        let promptNumbers = parsePromptNumbers(promptNumbersInput, prompts.length);

        if (promptNumbers.length > 0) {
            let copiedPromptsText = '';

            promptNumbers.forEach((number) => {
                let promptIndex = number - 1;
                if (promptIndex >= 0 && promptIndex < prompts.length) {
                    let promptToCopy = prompts[promptIndex].querySelector('.prompt');
                    let promptText = promptToCopy.innerText.trim();
                    if (promptText !== '') {
                        copiedPromptsText += (number) + ') ' + promptText + '\n\n';
                    }
                }
            });

            if (copiedPromptsText !== '') {
                navigator.clipboard.writeText(copiedPromptsText).then(() => {
                    console.log("Copied selected prompts to clipboard successfully!");
                }, (error) => {
                    console.error("Failed to copy selected prompts: ", error);
                });
            } else {
                console.log("No valid prompts selected.");
            }
        } else {
            console.log("Invalid prompt numbers.");
        }
    }

    copyPromptNumberInput.value = '';
    copyPromptNumberInput.style.display = 'none';
    this.style.display = 'none';
    document.getElementById('copyButton').style.display = 'inline';
});


function parsePromptNumbers(input, maxPromptNumber) {
    let promptNumbers = [];

    let ranges = input.split(',');
    ranges.forEach((range) => {
        range = range.trim();
        if (range === 'A') {
            for (let i = 1; i <= maxPromptNumber; i++) {
                promptNumbers.push(i);
            }
        } else if (range.includes('-')) {
            let [start, end] = range.split('-').map(Number);
            if (!isNaN(start) && !isNaN(end) && start <= end && start >= 1 && end <= maxPromptNumber) {
                for (let i = start; i <= end; i++) {
                    promptNumbers.push(i);
                }
            }
        } else {
            let number = parseInt(range);
            if (!isNaN(number) && number >= 1 && number <= maxPromptNumber) {
                promptNumbers.push(number);
            }
        }
    });

    return promptNumbers;
}





document.getElementById('saveButton').addEventListener('click', function() {
    let filenameInput = document.getElementById('filenameInput');
    let submitFilenameButton = document.getElementById('submitFilenameButton');

    filenameInput.style.display = 'inline';
    submitFilenameButton.style.display = 'inline';

    filenameInput.focus();
});

document.getElementById('submitFilenameButton').addEventListener('click', function() {
    let filenameInput = document.getElementById('filenameInput');
    let prompts = document.querySelectorAll('.prompt-wrapper');
    let allPromptsText = '';

    prompts.forEach((wrapper, index) => {
        let promptNumber = index + 1;
        let promptText = wrapper.querySelector('.prompt').innerText;
        allPromptsText += `${promptNumber}) ${promptText}\n\n`;
    });

    let blob = new Blob([allPromptsText], { type: "text/plain;charset=utf-8" });
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;

    let filename = filenameInput.value || 'prompts.txt';
    a.download = filename;
    a.click();

    filenameInput.value = '';
    filenameInput.style.display = 'none';
    this.style.display = 'none';
    document.getElementById('saveButton').style.display = 'inline';
});

function toggleFullScreen() {
    let fsButton = document.getElementById('fullscreenButton');
    if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement) {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen();
        }
        fsButton.innerText = '↙️';
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
        fsButton.innerText = '↗️';
    }
}

document.getElementById('fullscreenButton').addEventListener('click', toggleFullScreen);

document.addEventListener('fullscreenchange', updateFullScreenButton);
document.addEventListener('webkitfullscreenchange', updateFullScreenButton);
document.addEventListener('mozfullscreenchange', updateFullScreenButton);
document.addEventListener('MSFullscreenChange', updateFullScreenButton);

function updateFullScreenButton() {
    let fsButton = document.getElementById('fullscreenButton');
    fsButton.innerText = document.fullscreenElement ? '↙️' : '↗️';
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Backspace' && currentFocusedPrompt) {
        if (currentFocusedPrompt.innerText.trim() === '') {
            event.preventDefault();

            let wrapper = currentFocusedPrompt.closest('.prompt-wrapper');
            if (wrapper) {
                let prompts = Array.from(document.querySelectorAll('.prompt-wrapper'));
                let currentIndex = prompts.indexOf(wrapper);

                wrapper.remove();
                updatePromptNumbering();

                if (currentIndex > 0) {
                    prompts[currentIndex - 1].querySelector('.prompt').focus();
                }

                if (prompts.length === 1) {
                    currentFocusedPrompt = null;
                }
            }
        }
    }
});

document.getElementById('filenameInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        document.getElementById('submitFilenameButton').click();
    }
});

document.getElementById('filenameInput').addEventListener('focusout', function() {
    if (this.value === '') {
        this.style.display = 'none';
        document.getElementById('saveButton').style.display = 'inline';
        document.getElementById('submitFilenameButton').style.display = 'none';
    }
});

document.getElementById('deleteButton').addEventListener('click', function() {
    if (currentFocusedPrompt && currentFocusedPrompt.parentElement) {
        let wrapper = currentFocusedPrompt.closest('.prompt-wrapper');
        if (wrapper) {
            wrapper.remove();
            updatePromptNumbering();
            currentFocusedPrompt = null;
            handlePostDeleteActions();
        }
    }
});

function handlePostDeleteActions() {
    const prompts = document.querySelectorAll('.prompt-wrapper');
    if (prompts.length > 0) {
        prompts[0].querySelector('.prompt').focus();
    }
}
document.addEventListener('keydown', function(event) {
    // Check if either 'Ctrl+Arrow Up' or 'Ctrl+Arrow Down' is pressed
    if (event.ctrlKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
        event.preventDefault(); // Prevent default behavior
        let prompts = Array.from(document.querySelectorAll('.prompt-wrapper .prompt'));
        let currentIndex = prompts.findIndex(prompt => prompt === document.activeElement);

        if (currentIndex !== -1) {
            if (event.key === 'ArrowUp' && currentIndex > 0) {
                // Move focus to the previous prompt
                prompts[currentIndex - 1].focus();
            } else if (event.key === 'ArrowDown' && currentIndex < prompts.length - 1) {
                // Move focus to the next prompt
                prompts[currentIndex + 1].focus();
            }
        }
    }
});
