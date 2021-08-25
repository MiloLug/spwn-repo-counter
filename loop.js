module.exports = async (fn, interval) => {
    const loop = async () => {
        try {
            await fn();
        } catch(e) {
            console.log(e);
        }
        setTimeout(loop, interval);
    };
    await loop();
}
