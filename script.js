// Image Preview Functionality (unchanged)
document.getElementById('chart-image').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('preview');
    if (file) {
        preview.src = URL.createObjectURL(file);
        preview.style.display = 'block';
    }
});

// Analyze Cryptocurrency
async function analyzeCrypto() {
    const cryptoName = document.getElementById('crypto-name').value.trim().toLowerCase();
    const resultDiv = document.getElementById('analysis-result');

    if (!cryptoName) {
        resultDiv.innerHTML = '<p style="color: red;">Please enter a cryptocurrency name.</p>';
        return;
    }

    resultDiv.innerHTML = '<p>Loading analysis...</p>';

    try {
        // Fetch real-time price data
        const priceResponse = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptoName}&vs_currencies=usd`);
        const currentPrice = priceResponse.data[cryptoName]?.usd;

        if (!currentPrice) {
            resultDiv.innerHTML = '<p style="color: red;">Cryptocurrency not found. Please check the name.</p>';
            return;
        }

        // Fetch 30-day historical data for analysis
        const historicalResponse = await axios.get(`https://api.coingecko.com/api/v3/coins/${cryptoName}/market_chart?vs_currency=usd&days=30`);
        const prices = historicalResponse.data.prices.map(price => price[1]); // Array of prices

        // Calculate Moving Averages
        const sma7 = calculateSMA(prices.slice(-7));
        const sma14 = calculateSMA(prices.slice(-14));
        const sma30 = calculateSMA(prices.slice(-30));

        // Trend Analysis
        const trend = currentPrice > sma7 ? 'Bullish' : 'Bearish';

        // Support and Resistance (simplified: lowest and highest prices in last 30 days)
        const support = Math.min(...prices);
        const resistance = Math.max(...prices);

        // Volatility (standard deviation of last 14 days)
        const volatility = calculateVolatility(prices.slice(-14));

        // Entry, Stop Loss, Targets, Exit
        const entryPoint = currentPrice;
        const stopLoss = entryPoint * 0.95; // 5% below entry
        const target1 = entryPoint * 1.05;  // 5% above entry
        const target2 = entryPoint * 1.10;  // 10% above entry
        const target3 = entryPoint * 1.15;  // 15% above entry
        const exit = trend === 'Bullish' ? resistance * 0.98 : support * 1.02; // Near resistance/support

        // Display Detailed Analysis
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

// Simple Moving Average Calculation
function calculateSMA(prices) {
    const sum = prices.reduce((a, b) => a + b, 0);
    return sum / prices.length;
}

// Volatility Calculation (Standard Deviation)
function calculateVolatility(prices) {
    const mean = calculateSMA(prices);
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
    return Math.sqrt(variance); // Standard deviation
}