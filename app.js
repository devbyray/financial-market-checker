import Bitvavo from 'bitvavo'
import * as dateFns from 'date-fns'

const bitvavo = new Bitvavo()
const euroFormatter = new Intl.NumberFormat('nl-NL', {
	style: 'currency',
	currency: 'EUR'
})

bitvavo.candles('BTC-EUR', '1h', {}, (error, response) => {
	if (error === null) {
		let previousClose = null

		// Print table header
		console.log('| Timestamp | Open | High | Low | Close | Diff | Volume |')
		console.log('|-----------|------|------|-----|-------|------|---------|')

		for (let entry of response) {
			const currentClose = entry[4]
			let diffStr = '-'

			if (previousClose !== null) {
				const diff = currentClose - previousClose
				const percentChange = (diff / previousClose) * 100
				const sign = diff >= 0 ? '+' : ''
				const color = diff >= 0 ? '\x1b[32m' : '\x1b[31m' // Green for positive, red for negative
				diffStr = `${color}${sign}${euroFormatter.format(diff)} / ${sign}${percentChange.toFixed(2)}%\x1b[0m`
			}

			console.log(
				`| ${dateFns.format(new Date(entry[0]), 'dd-MM-yyyy HH:mm:ss')} | ${euroFormatter.format(
					entry[1]
				)} | ${euroFormatter.format(entry[2])} | ${euroFormatter.format(entry[3])} | ${euroFormatter.format(
					entry[4]
				)} | ${diffStr} | ${entry[5]} |`
			)

			previousClose = currentClose
		}
	} else {
		console.log(error)
	}
})
