function convertToUrl(value: string) {
    return value
        .replace(/[^a-z0-9_]+/gi, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase();
}

export default convertToUrl