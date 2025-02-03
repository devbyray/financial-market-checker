import ollama from 'ollama'
import chalk from 'chalk'
import { config } from '../config.js'

function updateLoadingIndicator() {
	process.stdout.write('.')
}

const adviceLevelPrompts = {
	noob: `Explain in very simple terms, avoiding technical jargon. Focus on basic concepts and use analogies where possible. Include a brief explanation of what Bitcoin is and what affects its price.`,

	normal: `Provide a balanced analysis using common trading terminology. Include both technical and fundamental factors in your recommendation.`,

	expert: `Provide an in-depth technical analysis including key support/resistance levels, relevant technical indicators, market sentiment analysis, and macro-economic factors. Use advanced trading terminology.`
}

function getCryptoName(symbol) {
	return symbol.split('-')[0] // Extracts 'BTC' from 'BTC-EUR'
}

export async function analyzeMarketData(marketData) {
	const intervalLabels = {
		'1m': 'minute',
		'5m': '5 minutes',
		'15m': '15 minutes',
		'30m': '30 minutes',
		'1h': 'hour',
		'2h': '2 hours',
		'4h': '4 hours',
		'6h': '6 hours',
		'8h': '8 hours',
		'12h': '12 hours',
		'1d': 'day'
	}

	const intervalLabel = intervalLabels[config.market.timeframe] || 'period'
	const cryptoName = getCryptoName(config.market.symbol)

	// Format all data points for analysis
	const formattedData = marketData
		.map(([timestamp, open, high, low, close, volume]) => ({
			timestamp: new Date(timestamp),
			open,
			high,
			low,
			close,
			volume
		}))
		.sort((a, b) => a.timestamp - b.timestamp) // Sort chronologically

	const prompt = `IMPORTANT: Please provide your complete analysis and advice in authentic ${config.llm.language.toUpperCase()} language only.

You are a financial expert analyzing ${cryptoName} market data.

[Data Analysis Section]
${formattedData
	.map(
		(data, index) => `${intervalLabel.charAt(0).toUpperCase() + intervalLabel.slice(1)} ${index + 1}:
    - Time: ${data.timestamp.toISOString()}
    - Opening price: €${data.open}
    - Closing price: €${data.close}
    - Highest price: €${data.high}
    - Lowest price: €${data.low}
    - Trading volume: ${data.volume}
`
	)
	.join('\n')}

[Analysis Instructions]
${(() => {
	const basePrompt = adviceLevelPrompts[config.llm.adviceLevel] || adviceLevelPrompts.normal
	return basePrompt.replace(/Bitcoin/g, cryptoName) // Replace any hardcoded "Bitcoin" with dynamic crypto name
})()}

Based on this complete dataset, provide a short but comprehensive recommendation if it's a good time to invest in ${cryptoName}.
Consider the price movement trends, volatility patterns, and volume changes across all ${intervalLabel}s.
Keep the answer under 150 words.

Remember: Your entire response MUST be in ${config.llm.language.toUpperCase()} language.`

	try {
		const loadingInterval = setInterval(updateLoadingIndicator, 500)
		const startTime = performance.now()

		const completion = await ollama.chat({
			model: config.llm.model,
			messages: [{ role: 'user', content: prompt }],
			stream: false
		})

		const endTime = performance.now()
		const processingTime = ((endTime - startTime) / 1000).toFixed(2)
		clearInterval(loadingInterval)
		process.stdout.write('\n') // New line after loading dots

		const response = completion.message.content

		// Extract thinking process and answer
		const thinkingMatch = response.match(/<think>(.*?)<\/think>/s)
		const thinking = thinkingMatch ? thinkingMatch[1].trim() : ''
		const answer = response.replace(/<think>.*?<\/think>/s, '').trim()

		// Format the output with different colors
		let formattedResponse = ''
		formattedResponse += chalk.gray(`[Processed in ${processingTime}s]\n\n`)
		if (thinking) {
			formattedResponse += chalk.yellow('Thinking Process:\n')
			formattedResponse += chalk.blue(thinking + '\n\n')
		}
		formattedResponse += chalk.yellow('Investment Advice:\n')
		formattedResponse += chalk.green(answer)

		return formattedResponse
	} catch (error) {
		clearInterval(loadingInterval)
		process.stdout.write('\n') // New line after loading dots
		console.error('AI Analysis Error:', error)
		return 'Unable to generate investment advice at this moment.'
	}
}
