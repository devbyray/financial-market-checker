import { parseCliArguments } from './utils/cli.js'

const defaultConfig = {
	llm: {
		model: 'llama3.2',
		adviceLevel: 'normal',
		language: 'en'
	},
	market: {
		timeframe: '1d',
		periods: 6,
		symbol: 'BTC-EUR'
	}
}

const args = parseCliArguments()

// Merge CLI arguments with default config
export const config = {
	llm: {
		model: args.llm || defaultConfig.llm.model,
		adviceLevel: args.level || defaultConfig.llm.adviceLevel,
		language: args.lang || defaultConfig.llm.language
	},
	market: {
		timeframe: args.timeframe || defaultConfig.market.timeframe,
		periods: defaultConfig.market.periods,
		symbol: args.pair || defaultConfig.market.symbol
	}
}
