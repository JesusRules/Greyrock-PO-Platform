export const truncateWithSmartDots = (text: string, amount: number=24) => {
    const base = text.slice(0, amount); // always show the first 24 chars
    const dotCount = Math.min(text.length - amount, 3); // up to 3 dots
    const dots = dotCount > 0 ? '.'.repeat(dotCount) : '';
    return base + dots;
};
