module.exports = async (fn, interval) => {
    const loop = async () => (
        await fn(),
        setTimeout(loop, interval)
    );
    await loop();
}
