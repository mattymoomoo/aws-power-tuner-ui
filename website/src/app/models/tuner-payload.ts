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
  useCustom: string;
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
    powerValues: ['128', '256', '512', '1024', '1536', '3008'],
    useCustom: 'default'
  } as TunerPayload;
}
