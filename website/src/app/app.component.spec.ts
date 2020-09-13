import { PowerTunerToken } from './models/power-tuner-token';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { HttpService } from './services/http.service';
import { from } from 'rxjs';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let app: AppComponent;
  const token: PowerTunerToken = {
    executionToken: 'test-token'
  };

  const mockHttpService = jasmine.createSpyObj('mockHttpService',
    ['performPowerTunerStepFunction', 'fetchPowerTunerStepFunction']);

  beforeEach(async(() => {
    mockHttpService.performPowerTunerStepFunction.and.returnValue(from([token]));
    mockHttpService.fetchPowerTunerStepFunction.and.returnValue(from([{}]));

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: HttpService, useValue: mockHttpService }
      ],
      declarations: [
        AppComponent
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  it('should create the power value range', () => {
    const expected = [
      128, 192, 256, 320, 384, 448, 512, 576, 640, 704, 768,
      832, 896, 960, 1024, 1088, 1152, 1216, 1280, 1344, 1408,
      1472, 1536, 1600, 1664, 1728, 1792, 1856, 1920, 1984, 2048,
      2112, 2176, 2240, 2304, 2368, 2432, 2496, 2560, 2624, 2688,
      2752, 2816, 2880, 2944, 3008
    ];
    expect(app.getPowerValues()).toEqual(expected);
    expect(app.powerValues).toEqual(expected);
  });

  it('should return the New Tuner operation type on init', () => {
    app.ngOnInit();
    expect(app.operationType).toEqual('New Tuner');
  });

  it('should return the correct form label', () => {
    app.ngOnInit();
    expect(app.getFormLabel).toEqual('Start power tuner');
    app.formGroup.controls.operationType.setValue('Existing execution ID');
    expect(app.getFormLabel).toEqual('Fetch tuner result');
  });

  it('should indicate if results has the visualisation url', () => {
    app.resultsBack = true;
    app.results = {
      stateMachine: {
        visualization: 'URL'
      }
    };
    expect(app.hasVisualisation).toBeTruthy();
    app.resultsBack = false;
    expect(app.hasVisualisation).toBeFalsy();
    app.resultsBack = true;
    app.results = {};
    expect(app.hasVisualisation).toBeFalsy();
    app.resultsBack = true;
    app.results = {
      stateMachine: {}
    };
    expect(app.hasVisualisation).toBeFalsy();
  });

  it('should return the correct visualisation label', () => {
    app.ngOnInit();
    expect(app.getVisLabel).toEqual('Visualization with balanced strategy (0.5)');
    app.formGroup.controls.strategy.setValue('speed');
    expect(app.getVisLabel).toEqual('Visualization with speed strategy');
  });

  it('should update operation type', () => {
    app.ngOnInit();
    expect(app.formGroup.controls.operationType.value).toEqual('New Tuner');
    app.updateOperationType('Test');
    expect(app.formGroup.controls.operationType.value).toEqual('Test');
  });

  it('should reset the payload when include payload is false', () => {
    app.ngOnInit();
    app.formGroup.controls.payload.setValue('Test payload');
    app.formGroup.controls.includePayload.setValue(true);
    expect(app.formGroup.controls.payload.value).toEqual('Test payload');
    app.formGroup.controls.includePayload.setValue(false);
    expect(app.formGroup.controls.payload.value).toEqual('{}');
  });

  it('should update the balanced weight when the strategy changes', () => {
    app.ngOnInit();
    app.formGroup.controls.strategy.setValue('speed');
    expect(app.formGroup.controls.balancedWeight.value).toEqual(1);
    app.formGroup.controls.strategy.setValue('cost');
    expect(app.formGroup.controls.balancedWeight.value).toEqual(0);
    app.formGroup.controls.strategy.setValue('balanced');
    expect(app.formGroup.controls.balancedWeight.value).toEqual(0.5);
  });

  it('should format a value to N decimal places', () => {
    expect(app.formatValue(40.44, 0)).toEqual('40');
    expect(app.formatValue(40.441, 1)).toEqual('40.4');
    expect(app.formatValue(40.441, 2)).toEqual('40.44');
  });

  it('should reset the tuner flag', () => {
    app.resultsBack = true;
    app.resultsProcessing = true;
    app.resetTuner();
    expect(app.resultsBack).toBeFalsy();
    expect(app.resultsProcessing).toBeFalsy();
  });

  it('should reset tuning', () => {
    app.ngOnInit();
    app.resetTuning();
    expect(app.results).toBeNull();
    expect(app.resultsBack).toBeFalsy();
    expect(app.resultsProcessing).toBeFalsy();
    expect(app.resultsError).toBeFalsy();
    expect(localStorage.getItem('token')).toEqual('');
  });

  it('should call the http service when valid form to start the tuning and poll', () => {
    app.ngOnInit();
    const arn =
      'arn:aws:lambda:us-east-1:000000000000:function:TestLambda';
    app.formGroup.controls.lambdaARN.setValue(arn);
    app.startTuning();
    expect(app.formGroup.valid).toBe(true);
    expect(mockHttpService.performPowerTunerStepFunction).toHaveBeenCalledWith({
      operationType: 'New Tuner',
      lambdaARN: 'arn:aws:lambda:us-east-1:000000000000:function:TestLambda',
      strategy: 'balanced',
      powerValues: 'ALL',
      balancedWeight: 0.5,
      num: 10,
      payload: Object({}),
      includePayload: false,
      useCustom: false,
      executionId: '',
      parallelInvocation: true
    });
    expect(mockHttpService.fetchPowerTunerStepFunction).toHaveBeenCalledWith(token);
    expect(app.formGroup.controls.executionId.value).toEqual(token.executionToken);
    expect(localStorage.getItem('token')).toEqual(token.executionToken);
  });

  it('should correctly flag error results', () => {
    app.processResults({});
    expect(app.resultsError).toBeTruthy();
  });

  it('should correctly process error results', () => {
    app.processErrorResults();
    expect(app.resultsError).toBeTruthy();
    app.processErrorResults(null, true);
    expect(app.resultsError).toBeTruthy();
    expect(app.executionToken).toEqual('');
  });

  it('should correctly check status to end policy', () => {
    expect(app.checkStatusToEndPolling('SUCCEEDED')).toBeTruthy();
    expect(app.checkStatusToEndPolling('FAILED')).toBeTruthy();
    expect(app.checkStatusToEndPolling('CANCELLED')).toBeTruthy();
    expect(app.checkStatusToEndPolling('IN PROGRESS')).toBeFalsy();
  });




});
