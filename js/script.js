const runBtn = document.getElementById('runBtn');
const clearBtn = document.getElementById('clearBtn');
const outputPre = document.getElementById('output');
const codeArea = document.getElementById('code');
const canvasContainer = document.getElementById('canvas-container');
const statusBadge = document.getElementById('status');

let pyodide = null;

// Initialize Pyodide
async function main() {
    try {
        statusBadge.innerText = 'Loading Pyodide...';
        pyodide = await loadPyodide();
        
        statusBadge.innerText = 'Loading Libraries...';
        // Pre-load common scientific packages
        await pyodide.loadPackage(["numpy", "matplotlib"]);
        
        statusBadge.innerText = 'Ready';
        statusBadge.classList.add('ready');
        runBtn.disabled = false;
        
    } catch (err) {
        statusBadge.innerText = 'Error Loading Pyodide';
        statusBadge.classList.add('error');
        console.error(err);
        outputPre.innerText = "Failed to load Python environment.\n" + err;
    }
}

// Start initialization immediately
main();

function addToOutput(text) {
    outputPre.innerText += text;
    // Auto-scroll
    const container = document.querySelector('.output-container');
    container.scrollTop = container.scrollHeight;
}

// Custom Matplotlib backend injection
// We replace plt.show with a function that extracts the figure as a base64 PNG
// and appends it to our DOM. This works reliably across browsers without separate backend files.
const MATPLOTLIB_SHIM = `
import matplotlib.pyplot as plt
from js import document
import io, base64

def custom_show():
    # Get current figure
    fig = plt.gcf()
    
    # Save to buffer
    buf = io.BytesIO()
    fig.savefig(buf, format='png')
    buf.seek(0)
    
    # Encode
    img_str = 'data:image/png;base64,' + base64.b64encode(buf.read()).decode('UTF-8')
    
    # Create DOM element
    img = document.createElement('img')
    img.src = img_str
    
    # Append to container
    container = document.getElementById("canvas-container")
    container.appendChild(img)
    
    # Close figure
    plt.close(fig)

# Monkey patch
plt.show = custom_show
`;

async function runCode() {
    if (!pyodide) return;

    const code = codeArea.value;
    
    // UI State
    outputPre.innerText = '';
    canvasContainer.innerHTML = '';
    runBtn.classList.add('loading');
    runBtn.disabled = true;
    statusBadge.innerText = 'Running...';
    statusBadge.classList.remove('ready');

    try {
        // Redirect stdout/stderr
        pyodide.setStdout({ batched: (msg) => addToOutput(msg + "\n") });
        pyodide.setStderr({ batched: (msg) => addToOutput(msg + "\n") });

        // Ensure Shim is active (in case of restart/reload context if we implemented that)
        // Ideally we only run this once, but running it again is safe enough or we can check.
        // For now, let's just prepend it or run it.
        // Running it every time ensures if user somehow reset things it works, 
        // but slightly inefficient. Let's just run it.
        await pyodide.runPythonAsync(MATPLOTLIB_SHIM);

        // Run User Code
        await pyodide.runPythonAsync(code);
        
    } catch (err) {
        addToOutput("\nTraceback (most recent call last):\n" + err);
    } finally {
        runBtn.classList.remove('loading');
        runBtn.disabled = false;
        statusBadge.innerText = 'Ready';
        statusBadge.classList.add('ready');
    }
}

runBtn.addEventListener('click', runCode);

clearBtn.addEventListener('click', () => {
    outputPre.innerText = '';
    canvasContainer.innerHTML = '';
});

// Support Control+Enter to run
codeArea.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (!runBtn.disabled) runCode();
    }
});
