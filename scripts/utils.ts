import { UIProvider, sleep } from "@ton/blueprint";

export const waitForStateChange = async <T>(ui: UIProvider, cb: () => Promise<T>, maxRetries = 20): Promise<T> => {
    ui.write('Waiting for state change...');

    const stateBefore = await cb();
    let stateAfter = stateBefore;
    let attempt = 1;
    while (stateAfter === stateBefore) {
        if (attempt > maxRetries) {
            ui.write('Max retries exceeded');
            break;
        }
        ui.setActionPrompt(`Attempt ${attempt}\n`);
        await sleep(2000);
        try {
            stateAfter = await cb();
        } catch (_) {
            // ignore error
        }
        attempt++;
    }

    ui.clearActionPrompt();
    return stateAfter;
}