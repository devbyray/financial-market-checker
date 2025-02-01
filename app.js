import Bitvavo from 'bitvavo'
import * as dateFns from 'date-fns'
import table from 'cli-table'
import chalk from 'chalk'
import { analyzeMarketData } from './marketAnalyzer.js'

const bitvavo = new Bitvavo()
const euroFormatter = new Intl.NumberFormat('nl-NL', {
	style: 'currency',
	currency: 'EUR'
})

// Get exact timestamps for the last 5 hours plus current hour
const endTime = dateFns.addHours(new Date(), 1) // Add 1 hour to include current hour
const startTime = dateFns.subHours(endTime, 6) // Get 6 hours of data

const priceTable = new table({
	head: ['Timestamp', 'Open', 'High', 'Low', 'Close', 'Diff', 'Diff %', 'Volume'],
	chars: {
		top: '═',
		'top-mid': '╤',
		'top-left': '╔',
		'top-right': '╗',
		bottom: '═',
		'bottom-mid': '╧',
		'bottom-left': '╚',
		'bottom-right': '╝',
		left: '║',
		'left-mid': '╟',
		mid: '─',
		'mid-mid': '┼',
		right: '║',
		'right-mid': '╢',
		middle: '│'
	},
	style: {
		head: ['cyan'],
		border: ['grey']
	}
})

bitvavo.candles(
	'BTC-EUR',
	'1h',
	{
		start: startTime.getTime(),
		end: endTime.getTime(),
		limit: 6 // Explicitly request 6 entries
	},
	async (error, response) => {
		if (error === null) {
			// Sort newest first but keep the oldest entry for diff calculation
			const sortedResponse = response.sort((a, b) => b[0] - a[0])

			// Get the oldest entry for initial diff calculation
			const [, , , , previousClose] = sortedResponse[sortedResponse.length - 1]

			// Take first 5 entries (newest entries including current hour)
			const displayEntries = sortedResponse.slice(0, 5)

			for (let entry of displayEntries) {
				const [timestamp, open, high, low, currentClose, volume] = entry
				let diffAmount = '-'
				let diffPercent = '-'

				if (previousClose !== null) {
					const diff = currentClose - previousClose
					const percentChange = (diff / previousClose) * 100
					const sign = diff >= 0 ? '+' : ''
					const color = diff >= 0 ? chalk.green : chalk.red
					diffAmount = color(`${sign}${euroFormatter.format(diff)}`)
					diffPercent = color(`${sign}${sign}${percentChange.toFixed(2)}%`)
				}

				const date = new Date(timestamp)
				const formattedDate = dateFns.formatDistanceToNow(date, { addSuffix: true })

				priceTable.push([
					formattedDate,
					euroFormatter.format(open),
					euroFormatter.format(high),
					euroFormatter.format(low),
					euroFormatter.format(currentClose),
					diffAmount,
					diffPercent,
					volume
				])
			}

			console.log(priceTable.toString())

			// Add AI analysis
			console.log('\nAI Market Analysis:')
			console.log(chalk.yellow('─'.repeat(50)))
			process.stdout.write(chalk.blue('🤖 Processing market data... '))
			const advice = await analyzeMarketData(sortedResponse)
			process.stdout.write('\r' + ' '.repeat(50) + '\r') // Clear processing message
			console.log(advice)
			console.log(chalk.yellow('─'.repeat(50)))
		} else {
			console.log(error)
		}
	}
)
