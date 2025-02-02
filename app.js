import Bitvavo from 'bitvavo'
import * as dateFns from 'date-fns'
import table from 'cli-table'
import chalk from 'chalk'
import { analyzeMarketData } from './marketAnalyzer.js'
import { config } from './config.js'

const bitvavo = new Bitvavo()
const euroFormatter = new Intl.NumberFormat('nl-NL', {
	style: 'currency',
	currency: 'EUR'
})

// Get exact timestamps based on configured timeframe
const endTime = new Date()
const startTime = (() => {
	const intervals = {
		'1m': () => dateFns.subMinutes(endTime, config.market.periods),
		'5m': () => dateFns.subMinutes(endTime, config.market.periods * 5),
		'15m': () => dateFns.subMinutes(endTime, config.market.periods * 15),
		'30m': () => dateFns.subMinutes(endTime, config.market.periods * 30),
		'1h': () => dateFns.subHours(endTime, config.market.periods),
		'2h': () => dateFns.subHours(endTime, config.market.periods * 2),
		'4h': () => dateFns.subHours(endTime, config.market.periods * 4),
		'6h': () => dateFns.subHours(endTime, config.market.periods * 6),
		'8h': () => dateFns.subHours(endTime, config.market.periods * 8),
		'12h': () => dateFns.subHours(endTime, config.market.periods * 12),
		'1d': () => dateFns.subDays(endTime, config.market.periods)
	}

	if (!intervals[config.market.timeframe]) {
		console.error('Invalid timeframe, falling back to 1h')
		return intervals['1h']()
	}

	return intervals[config.market.timeframe]()
})()

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
	config.market.symbol,
	config.market.timeframe,
	{
		start: startTime.getTime(),
		end: endTime.getTime(),
		limit: config.market.periods
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
