import Bitvavo from 'bitvavo'
import chalk from 'chalk'
import readline from 'readline'
import { analyzeMarketData } from './utils/marketAnalyzer.js'
import { config } from './config.js'
import { saveToMarkdown } from './utils/saveMarkdown.js'
import { formatPriceTable, generateMarkdownTable } from './utils/tableUtils.js'
import { getStartTime } from './utils/timeUtils.js'
import { parseCliArguments } from './utils/cli.js'

const args = parseCliArguments()

const bitvavo = new Bitvavo()
const euroFormatter = new Intl.NumberFormat('nl-NL', {
	style: 'currency',
	currency: 'EUR'
})

// Add this after the existing constants
const configInfo = {
	model: chalk.blue(config.llm.model),
	language: chalk.yellow(config.llm.language.toUpperCase()),
	level: chalk.green(config.llm.adviceLevel),
	pair: chalk.magenta(config.market.symbol),
	timeframe: chalk.cyan(config.market.timeframe)
}

console.log(chalk.bold('\nFinancial Market Checker Configuration:'))
console.log('───────────────────────────────────────')
console.log(`🤖 Model     : ${configInfo.model}`)
console.log(`🌐 Language  : ${configInfo.language}`)
console.log(`📊 Level     : ${configInfo.level}`)
console.log(`💱 Pair      : ${configInfo.pair}`)
console.log(`⏱️  Timeframe : ${configInfo.timeframe}`)
console.log('───────────────────────────────────────\n')

const endTime = new Date()
const startTime = getStartTime(endTime, config.market.timeframe, config.market.periods)

bitvavo.candles(
	config.market.symbol,
	config.market.timeframe,
	{
		start: startTime.getTime(),
		end: endTime.getTime(),
		limit: config.market.periods
	},
	async (error, response) => {
		if (error === null) {
			const sortedResponse = response.sort((a, b) => b[0] - a[0])
			const [, , , , previousClose] = sortedResponse[sortedResponse.length - 1]
			const displayEntries = sortedResponse.slice(0, 5)

			const priceTable = formatPriceTable(displayEntries, previousClose, euroFormatter)
			const tableString = priceTable.toString()
			console.log(tableString)

			const markdownTable = generateMarkdownTable(displayEntries, previousClose, euroFormatter)

			console.log('\nAI Market Analysis:')
			console.log(chalk.yellow('─'.repeat(50)))
			process.stdout.write(chalk.blue('🤖 Processing market data... '))
			const advice = await analyzeMarketData(sortedResponse)
			process.stdout.write('\r' + ' '.repeat(50) + '\r')
			console.log(advice)
			console.log(chalk.yellow('─'.repeat(50)))

			const rl = readline.createInterface({
				input: process.stdin,
				output: process.stdout
			})

			rl.question(chalk.blue('\nSave this analysis as Markdown? (y/N): '), async answer => {
				if (answer.toLowerCase() === 'y') {
					const savedFile = await saveToMarkdown(advice, config, markdownTable)
					if (savedFile) {
						console.log(chalk.green(`\nAnalysis saved to reports/${savedFile}`))
					}
				}
				rl.close()
				process.exit(0)
			})

			setTimeout(() => {
				rl.close()
				process.exit(0)
			}, 30000)
		} else {
			console.log(error)
		}
	}
)
