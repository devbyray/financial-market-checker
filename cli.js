import minimist from 'minimist'

export function parseCliArguments() {
	const args = minimist(process.argv.slice(2), {
		string: ['llm', 'lang', 'level', 'timeframe', 'pair'],
		alias: {
			h: 'help',
			l: 'llm',
			g: 'lang',
			a: 'level',
			t: 'timeframe',
			p: 'pair'
		},
		default: {}
	})

	if (args.help) {
		console.log(`
Financial Market Checker - Command Line Options:

--llm, -l       : LLM model to use (e.g., deepseek-r1, llama2)
--lang, -g      : Language for analysis (e.g., en, nl, es)
--level, -a     : Advice level (noob, normal, expert)
--timeframe, -t : Time interval (1m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d)
--pair, -p      : Trading pair (e.g., BTC-EUR, ETH-EUR)
--help, -h      : Show this help message

Example:
node app.js --llm deepseek-r1 --lang nl --level expert --timeframe 1h --pair ETH-EUR
`)
		process.exit(0)
	}

	return args
}
