// Image Handling
const imageInput = document.getElementById('chart-image');
const preview = document.getElementById('preview');

// Handle image upload or capture
imageInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        preview.src = URL.createObjectURL(file);
        preview.style.display = 'block';
    }
});

// Fallback: Use camera via getUserMedia if file input isn’t supported or preferred
function captureImageFallback() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                const video = document.createElement('video');
                video.srcObject = stream;
                video.play();

                // Temporary canvas to capture image
                const canvas = document.createElement('canvas');
                canvas.width = 640;
                canvas.height = 480;
                const context = canvas.getContext('2d');

                // Capture image after 2 seconds (time to position camera)
                setTimeout(() => {
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    preview.src = canvas.toDataURL('image/png');
                    preview.style.display = 'block';
                    stream.getTracks().forEach(track => track.stop()); // Stop camera
                }, 2000);
            })
            .catch(err => {
                console.error('Camera access denied or unavailable:', err);
                alert('Unable to access camera. Please use file upload instead.');
            });
    } else {
        alert('Camera not supported in this browser.');
    }
}

// Optional: Trigger fallback if needed (e.g., via a button or if no file is selected)
// Uncomment the line below and add a button in HTML if you want manual fallback
// document.getElementById('capture-btn').addEventListener('click', captureImageFallback);

// Existing Analyze Crypto Function (unchanged from previous detailed version)
async function analyzeCrypto() {
    const cryptoName = document.getElementById('crypto-name').value.trim().toLowerCase();
    const resultDiv = document.getElementById('analysis-result');

    if (!cryptoName) {
        resultDiv.innerHTML = '<p style="color: red;">Please enter a cryptocurrency name.</p>';
        return;
    }

    resultDiv.innerHTML = '<p>Loading analysis...</p>';

    try {
        const priceResponse = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptoName}&vs_currencies=usd`);
        const currentPrice = priceResponse.data[cryptoName]?.usd;

        if (!currentPrice) {
            resultDiv.innerHTML = '<p style="color: red;">Cryptocurrency not found. Please check the name.</p>';
            return;
        }

        const historicalResponse = await axios.get(`https://api.coingecko.com/api/v3/coins/${cryptoName}/market_chart?vs_currency=usd&days=30`);
        const prices = historicalResponse.data.prices.map(price => price[1]);

        const sma7 = calculateSMA(prices.slice(-7));
        const sma14 = calculateSMA(prices.slice(-14));
        const sma30 = calculateSMA(prices.slice(-30));
        const trend = currentPrice > sma7 ? 'Bullish' : 'Bearish';
        const support = Math.min(...prices);
        const resistance = Math.max(...prices);
        const volatility = calculateVolatility(prices.slice(-14));

        const entryPoint = currentPrice;
        const stopLoss = entryPoint * 0.95;
        const target1 = entryPoint * 1.05;
        const target2 = entryPoint * 1.10;
        const target3 = entryPoint * 1.15;
        const exit = trend === 'Bullish' ? resistance * 0.98 : support * 1.02;

        resultDiv.innerHTML = `
            <h3>${cryptoName.toUpperCase()} Technical Analysis</h3>
            <p><strong>Current Price:</strong> $${currentPrice.toFixed(2)}</p>
            <p><strong>Trend:</strong> ${trend}</p>
            <p><strong>7-Day SMA:</strong> $${sma7.toFixed(2)}</p>
            <p><strong>14-Day SMA:</strong> $${sma14.toFixed(2)}</p>
            <p><strong>30-Day SMA:</strong> $${sma30.toFixed(2)}</p>
            <p><strong>Volatility (14-Day):</strong> $${volatility.toFixed(2)}</p>
            <hr>
            <h4>Trading Levels</h4>
            <p><strong>Entry Point:</strong> $${entryPoint.toFixed(2)}</p>
            <p><strong>Stop Loss:</strong> $${stopLoss.toFixed(2)} (5% below entry)</p>
            <p><strong>Target 1:</strong> $${target1.toFixed(2)} (5% profit)</p>
            <p><strong>Target 2:</strong> $${target2.toFixed(2)} (10% profit)</p>
            <p><strong>Target 3:</strong> $${target3.toFixed(2)} (15% profit)</p>
            <p><strong>Exit Level:</strong> $${exit.toFixed(2)} (${trend === 'Bullish' ? 'Near Resistance' : 'Near Support'})</p>
            <hr>
            <h4>Key Levels</h4>
            <p><strong>Support:</strong> $${support.toFixed(2)}</p>
            <p><strong>Resistance:</strong> $${resistance.toFixed(2)}</p>
            <p><em>Note: This is a simplified real-time analysis. Always verify with additional tools.</em></p>
        `;
    } catch (error) {
        console.error(error);
        resultDiv.innerHTML = '<p style="color: red;">Error fetching data. Please try again later.</p>';
    }
}

// Utility Functions (unchanged)
function calculateSMA(prices) {
    const sum = prices.reduce((a, b) => a + b, 0);
    return sum / prices.length;
}

function calculateVolatility(prices) {
    const mean = calculateSMA(prices);
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
    return Math.sqrt(variance);
}