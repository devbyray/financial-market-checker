import Bitvavo from 'bitvavo'
import * as dateFns from 'date-fns'
import table from 'cli-table'

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
	(error, response) => {
		if (error === null) {
			// Sort newest first but keep the oldest entry for diff calculation
			const sortedResponse = response.sort((a, b) => b[0] - a[0])

			// Get the oldest entry for initial diff calculation
			let previousClose = sortedResponse[sortedResponse.length - 1][4]

			// Take first 5 entries (newest entries including current hour)
			const displayEntries = sortedResponse.slice(0, 5)

			for (let entry of displayEntries) {
				const currentClose = entry[4]
				let diffAmount = '-'
				let diffPercent = '-'

				if (previousClose !== null) {
					const diff = currentClose - previousClose
					const percentChange = (diff / previousClose) * 100
					const sign = diff >= 0 ? '+' : ''
					const color = diff >= 0 ? '\x1b[32m' : '\x1b[31m'
					diffAmount = `${color}${sign}${euroFormatter.format(diff)}\x1b[0m`
					diffPercent = `${color}${sign}${percentChange.toFixed(2)}%\x1b[0m`
				}

				const date = new Date(entry[0])
				const formattedDate = dateFns.formatDistanceToNow(date, { addSuffix: true })

				priceTable.push([
					formattedDate,
					euroFormatter.format(entry[1]),
					euroFormatter.format(entry[2]),
					euroFormatter.format(entry[3]),
					euroFormatter.format(entry[4]),
					diffAmount,
					diffPercent,
					entry[5]
				])

				previousClose = currentClose
			}

			console.log(priceTable.toString())
		} else {
			console.log(error)
		}
	}
)
