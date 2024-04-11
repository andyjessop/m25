type IntervalCount = {
	timestamp: number;
	count: number;
};

export function groupTimestampsByInterval(
	timestamps: number[],
	interval: number,
): IntervalCount[] {
	if (timestamps.length === 0 || interval <= 0) {
		throw new Error(
			"Invalid input: timestamps array must not be empty and interval must be positive",
		);
	}

	// Sort the timestamps in ascending order
	const sortedTimestamps = timestamps.slice().sort((a, b) => a - b);
	const result: IntervalCount[] = [];

	// Define the start and end of the range based on the sorted timestamps
	const intervalStart = sortedTimestamps[0];
	const lastTimestamp = sortedTimestamps[sortedTimestamps.length - 1];

	// Initialize count and index for iterating through timestamps
	let count = 0;
	let index = 0;

	// Iterate over intervals from the first to the last timestamp
	for (
		let currentStart = intervalStart;
		currentStart <= lastTimestamp;
		currentStart += interval
	) {
		// Reset count for the new interval
		count = 0;

		// Count timestamps that fall within the current interval
		while (
			index < sortedTimestamps.length &&
			sortedTimestamps[index] < currentStart + interval
		) {
			count++;
			index++;
		}

		// Add the interval and count to the result, including intervals with a count of 0
		result.push({ timestamp: currentStart, count: count });
	}

	return result;
}
