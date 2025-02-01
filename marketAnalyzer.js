import ollama from 'ollama'
import chalk from 'chalk'

function updateLoadingIndicator() {
	process.stdout.write('.')
}

export async function analyzeMarketData(marketData) {
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

	const prompt = `As a financial expert, analyze this Bitcoin market data for the last ${formattedData.length} hours:

${formattedData
	.map(
		(data, index) => `Hour ${index + 1}:
    - Time: ${data.timestamp.toISOString()}
    - Opening price: €${data.open}
    - Closing price: €${data.close}
    - Highest price: €${data.high}
    - Lowest price: €${data.low}
    - Trading volume: ${data.volume}
`
	)
	.join('\n')}

Based on this complete dataset, provide a short but comprehensive recommendation if it's a good time to invest.
Consider the price movement trends, volatility patterns, and volume changes across all hours.
Keep the answer under 150 words.`

	try {
		const loadingInterval = setInterval(updateLoadingIndicator, 500)
		const startTime = performance.now()

		const completion = await ollama.chat({
			model: 'deepseek-r1:latest',
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
