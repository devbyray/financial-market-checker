import fs from 'fs/promises'
import path from 'path'

export async function saveToMarkdown(data, config, tableString) {
	const date = new Date().toISOString().split('T')[0]
	const filename = `${date}_${config.market.symbol}_${config.llm.language}.md`

	// Remove any escape characters from the data
	const sanitizedData = data.replace(/\x1b\[[0-9;]*m/g, '')

	const markdownContent = `# ${config.market.symbol} Analysis
## Configuration
🤖 Model: ${config.llm.model}
🌐 Language: ${config.llm.language}
📊 Level: ${config.llm.adviceLevel}
💱 Pair: ${config.market.symbol}
⏱️ Timeframe: ${config.market.timeframe}

## Price Table
${tableString}

## Analysis
${sanitizedData}
`

	try {
		// Create reports directory if it doesn't exist
		const reportsDir = path.join(process.cwd(), 'reports')
		await fs.mkdir(reportsDir, { recursive: true })

		await fs.writeFile(path.join(reportsDir, filename), markdownContent)
		return filename
	} catch (error) {
		console.error('Error saving markdown:', error)
		return null
	}
}
