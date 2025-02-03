import * as dateFns from 'date-fns'

export function getStartTime(endTime, timeframe, periods) {
	const intervals = {
		'1m': () => dateFns.subMinutes(endTime, periods),
		'5m': () => dateFns.subMinutes(endTime, periods * 5),
		'15m': () => dateFns.subMinutes(endTime, periods * 15),
		'30m': () => dateFns.subMinutes(endTime, periods * 30),
		'1h': () => dateFns.subHours(endTime, periods),
		'2h': () => dateFns.subHours(endTime, periods * 2),
		'4h': () => dateFns.subHours(endTime, periods * 4),
		'6h': () => dateFns.subHours(endTime, periods * 6),
		'8h': () => dateFns.subHours(endTime, periods * 8),
		'12h': () => dateFns.subHours(endTime, periods * 12),
		'1d': () => dateFns.subDays(endTime, periods)
	}

	if (!intervals[timeframe]) {
		console.error('Invalid timeframe, falling back to 1h')
		return intervals['1h']()
	}

	return intervals[timeframe]()
}
