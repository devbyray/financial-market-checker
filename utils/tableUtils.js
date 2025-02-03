import table from 'cli-table'
import chalk from 'chalk'
import * as dateFns from 'date-fns'

export function formatPriceTable(entries, previousClose, euroFormatter) {
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

	for (let entry of entries) {
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

	return priceTable
}

export function generateMarkdownTable(entries, previousClose, euroFormatter) {
	return [
		'| Timestamp | Open | High | Low | Close | Diff | Diff % | Volume |',
		'|-----------|------|------|-----|-------|------|--------|--------|',
		...entries.map(entry => {
			const [timestamp, open, high, low, currentClose, volume] = entry
			const date = new Date(timestamp)
			const formattedDate = dateFns.formatDistanceToNow(date, { addSuffix: true })
			const diff = currentClose - previousClose
			const percentChange = (diff / previousClose) * 100
			const sign = diff >= 0 ? '+' : ''
			const diffAmount = `${sign}${euroFormatter.format(diff)}`
			const diffPercent = `${sign}${percentChange.toFixed(2)}%`
			return `| ${formattedDate} | ${euroFormatter.format(open)} | ${euroFormatter.format(
				high
			)} | ${euroFormatter.format(low)} | ${euroFormatter.format(
				currentClose
			)} | ${diffAmount} | ${diffPercent} | ${volume} |`
		})
	].join('\n')
}
