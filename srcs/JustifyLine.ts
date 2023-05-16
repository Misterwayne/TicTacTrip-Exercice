export function justifyText(text: string, lineLength: number): string {
	if (typeof text !== 'string') {
		// Convert non-string value to a string
		text = String(text);
	}
	const lines = text.split(' ');
	let currentLine : string = '';
	const justifiedLines: string[] = [];

	for (const word of lines) {
		if (currentLine.length + word.length + 1 <= lineLength) {
			currentLine += word + ' ';
		} else {
			justifiedLines.push(justifyLine(currentLine.trim(), lineLength));
			currentLine = word + ' ';
		}
	}

	justifiedLines.push(justifyLine(currentLine.trim(), lineLength));

	return justifiedLines.join('\n');
}

export function justifyLine(line: string, lineLength: number): string {
	const words = line.split(' ');
	const totalSpaces = lineLength - line.replace(/\s/g, '').length;
	const spacesPerGap = Math.floor(totalSpaces / (words.length - 1));
	const extraSpaces = totalSpaces % (words.length - 1);

	let justifiedLine = '';

	for (let i = 0; i < words.length; i++) {
		justifiedLine += words[i];
		if (i < words.length - 1) {
			justifiedLine += ' '.repeat(spacesPerGap);
			if (i < extraSpaces) {
				justifiedLine += ' ';
			}
		}
	}
	return justifiedLine;
}