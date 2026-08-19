export class DiceManager {

    roll(count) {
        const results = [];

        for (let i = 0; i < count; i++) {
            const value = Math.floor(Math.random() * 6) + 1;
            results.push(value);
        }

        const total = results.reduce(
            (sum, value) => sum + value,
            0
        );

        return {
            results,
            total,
            count
        };
    }
}