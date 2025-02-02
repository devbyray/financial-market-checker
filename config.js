export const config = {
	// LLM Configuration
	llm: {
		model: 'llama3.2', // or 'llama2' or other Ollama models
		adviceLevel: 'normal', // Options: 'noob', 'normal', 'expert'
		language: 'en' // Options: 'en', 'nl', 'es', etc. (ISO 639-1 codes)
	},

	// Market Data Configuration
	market: {
		// Valid intervals: '1m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d'
		timeframe: '1d',
		periods: 6, // Number of periods to fetch
		symbol: 'BTC-EUR' // Trading pair
	}
}
