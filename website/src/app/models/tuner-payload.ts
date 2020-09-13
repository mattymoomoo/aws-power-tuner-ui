export interface TunerPayload {
    operationType: string;
    executionId: string;
    lambdaARN: string;
    powerValues: string[] | string;
    num: number;
    payload: string;
    parallelInvocation: boolean;
    strategy: string;
    balancedWeight: number;
    useCustom: boolean;
}

export function defaultTunerPayload() {
    return {
        operationType: 'New Tuner',
        lambdaARN: '',
        strategy: 'balanced',
        balancedWeight: 0.5,
        executionId: '',
        num: 10,
        payload: `{}`,
        parallelInvocation: true,
        powerValues: 'ALL',
        useCustom: false
    } as TunerPayload;
}
