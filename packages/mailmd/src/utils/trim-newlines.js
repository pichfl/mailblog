export default function trimNewlines(string) {
	return string.replace(/^\n+|\n+$/g, '');
}
