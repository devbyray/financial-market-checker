# Financial Market Checker

Real-time cryptocurrency market analysis tool with AI-powered insights.

Check the demo on [Youtube](https://youtu.be/lArQ83rFLwc).

## Features

-   Real-time market data from Bitvavo
-   Configurable time intervals (1m to 1d)
-   AI-powered market analysis using Ollama
-   Multiple expertise levels (noob, normal, expert)
-   Multi-language support
-   Support for different trading pairs

## Installation

1. Install NodeJS
2. Install Ollama from https://ollama.ai
3. Run `npm install`

## Configuration

Edit `config.js` to customize your experience:

```javascript
export const config = {
	llm: {
		model: 'deepseek-r1:latest', // Your preferred Ollama model
		adviceLevel: 'normal', // 'noob', 'normal', 'expert'
		language: 'en' // 'en', 'nl', 'es', etc.
	},
	market: {
		timeframe: '1d', // '1m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d'
		periods: 6, // Number of periods to analyze
		symbol: 'BTC-EUR' // Trading pair
	}
}
```

## Usage

1. Run `node app.js`
2. View the market data table
3. Wait for AI analysis

## Example Output

```
╔════════════════╤══════════════╤══════════════╤══════════════╤══════════════╤═══════════╤════════╤═══════════╗
║ Timestamp      │ Open         │ High         │ Low          │ Close        │ Diff      │ Diff % │ Volume    ║
╟────────────────┼──────────────┼──────────────┼──────────────┼──────────────┼───────────┼────────┼───────────╢
║ 5 days ago     │ € 98.720,00  │ € 98.948,00  │ € 98.604,00  │ € 98.781,00  │ +€ 197,00 │ +0.20% │ 2.72081261║
║ 4 days ago     │ € 98.780,00  │ € 99.034,00  │ € 98.722,00  │ € 98.933,00  │ +€ 152,00 │ +0.15% │ 4.69083087║
║ 3 days ago     │ € 98.946,00  │ € 99.022,00  │ € 98.643,00  │ € 98.864,00  │ -€ 69,00  │ -0.07% │ 4.94676898║
║ 2 days ago     │ € 98.863,00  │ € 98.941,00  │ € 98.600,00  │ € 98.616,00  │ -€ 248,00 │ -0.25% │ 6.95339241║
║ yesterday      │ € 98.616,00  │ € 98.731,00  │ € 98.574,00  │ € 98.584,00  │ -€ 32,00  │ -0.03% │ 3.25533777║
╚════════════════╧══════════════╧══════════════╧══════════════╧══════════════╧═══════════╧════════╧═══════════╝

AI Market Analysis:
──────────────────────────────────────────────────────
🤖 [Analysis based on your configured expertise level]
[Investment advice in your chosen language]
──────────────────────────────────────────────────────
```
