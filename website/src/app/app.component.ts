import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription, Subject, interval } from 'rxjs';
import { startWith, take, takeUntil, switchMap } from 'rxjs/operators';
import { HttpService } from './services/http.service';
import { PowerTunerToken } from './models/power-tuner-token';
import { TunerPayload, defaultTunerPayload } from './models/tuner-payload';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  private readonly trackedSubscriptions: Subscription[] = [];

  startModel = defaultTunerPayload();
  formGroup: FormGroup;
  resultsBack: boolean;
  results = null;
  resultsProcessing: boolean;
  resultsError: boolean;
  executionToken: string;
  visualisationUrl: SafeResourceUrl;
  validationTriggered = false;

  operationTypes = [
    'New Tuner',
    'Existing execution ID'
  ];

  strategies = [
    {
      label: 'Balanced',
      value: 'balanced'
    },
    {
      label: 'Cost',
      value: 'cost'
    },
    {
      label: 'Speed',
      value: 'speed'
    }
  ];

  powerValues = this.getPowerValues();

  get operationType(): string {
    return this.formGroup.controls.operationType.value;
  }

  get hasVisualisation(): boolean {
    return this.resultsBack && this.results && this.results.stateMachine && this.results.stateMachine.visualization;
  }

  get formDisabled(): boolean {
    return ((this.operationType === 'Existing execution ID' && !this.formGroup.controls.executionId.value)
      || (this.operationType === 'New Tuner' && this.formGroup.invalid)) || this.resultsProcessing;
  }

  get getFormLabel(): string {
    return this.operationType === 'New Tuner' ? 'Start power tuner' : 'Fetch tuner result';
  }

  get getVisLabel(): string {
    const strat = this.formGroup.controls.strategy.value;
    let base = `Visualization with ${this.formGroup.controls.strategy.value} strategy`;
    if (strat === 'balanced') {
      base += ` (${this.formGroup.controls.balancedWeight.value})`;
    }

    return base;
  }

  constructor(
    private sanitizer: DomSanitizer,
    private formBuilder: FormBuilder,
    private httpService: HttpService
  ) { }

  ngOnInit() {
    this.setupFormGroup();
  }

  setupFormGroup() {
    const token = localStorage.getItem('token');
    this.startModel.executionId = token ? token : '',
      this.formGroup = this.formBuilder.group({
        operationType: [this.startModel.operationType],
        lambdaARN: [this.startModel.lambdaARN, [Validators.required,
        // tslint:disable-next-line:max-line-length
        Validators.pattern('arn:(aws[a-zA-Z-]*)?:lambda:[a-z]{2}((-gov)|(-iso(b?)))?-[a-z]+-\\d{1}:\\d{12}:function:[a-zA-Z0-9-_]+(:(\\$LATEST|[a-zA-Z0-9-_]+))?$')]],
        strategy: [this.startModel.strategy],
        powerValues: [this.startModel.powerValues, [Validators.required]],
        balancedWeight: [this.startModel.balancedWeight, [Validators.required]],
        num: [this.startModel.num, [Validators.required]],
        payload: [this.startModel.payload],
        includePayload: [false],
        useCustom: [this.startModel.useCustom],
        executionId: [this.startModel.executionId],
        parallelInvocation: [this.startModel.parallelInvocation]
      });

    this.formGroup.controls.strategy.valueChanges.subscribe(value => {
      if (value === 'speed') {
        this.formGroup.controls.balancedWeight.setValue(1);
      } else if (value === 'cost') {
        this.formGroup.controls.balancedWeight.setValue(0);
      } else {
        this.formGroup.controls.balancedWeight.setValue(0.5);
      }
    });

    this.formGroup.controls.includePayload.valueChanges.subscribe(value => {
      if (!value) {
        this.formGroup.controls.payload.setValue(`{}`);
      }
    });

    this.formGroup.controls.useCustom.valueChanges.subscribe(value => {
      if (value === 'custom') {
        this.formGroup.controls.powerValues.setValue([]);
      } else if (value === 'default') {
        this.formGroup.controls.powerValues.setValue(['128', '256', '512', '1024', '1536', '3008']);
      } else {
        this.formGroup.controls.powerValues.setValue('ALL');
      }
    });
  }

  getPowerValues() {
    const increment = 64;
    const powerValues = [];
    for (let value = 128; value <= 10240; value += increment) {
      powerValues.push(value);
    }
    return powerValues;
  }

  updateOperationType(type: string) {
    this.formGroup.controls.operationType.setValue(type);
  }

  resetTuning() {
    this.results = null;
    this.resetTuner();
    localStorage.setItem('token', '');
    this.resultsError = false;
    this.startModel.operationType = this.operationType;
    this.setupFormGroup();
  }

  formatValue(duration: number, noDecimals = 0): string {
    return duration.toFixed(noDecimals);
  }

  resetTuner() {
    this.resultsBack = false;
    this.resultsProcessing = false;
  }

  startTuning() {
    this.executionToken = '';
    this.results = null;
    this.resultsError = false;
    this.resultsBack = false;
    this.resultsProcessing = true;
    const form = this.formGroup.getRawValue() as TunerPayload;
    if (this.operationType === 'New Tuner') {
      if (this.formGroup.valid) {
        form.payload = JSON.parse(form.payload);
        this.trackedSubscriptions.push(this.httpService.performPowerTunerStepFunction(form).subscribe(token => {
          this.startPolling(token);
        }, (error) => {
          this.processErrorResults(error, true);
        }));
      }
    } else {
      const token = {
        executionToken: this.formGroup.controls.executionId.value
      } as PowerTunerToken;
      this.startPolling(token);
    }
  }

  startPolling(token: PowerTunerToken) {
    this.executionToken = token.executionToken;
    this.formGroup.controls.executionId.setValue(this.executionToken);
    localStorage.setItem('token', this.executionToken);

    const subject = new Subject<string>();
    let attempt = 0;
    this.trackedSubscriptions.push(interval(5000)
      .pipe(
        startWith(0),
        take(24),
        takeUntil(subject),
        switchMap(() => this.httpService.fetchPowerTunerStepFunction(token))
      )
      .subscribe(
        ratesResult => {
          attempt += 1;
          if (this.checkStatusToEndPolling(ratesResult.status)) {
            if (ratesResult.status === 'SUCCEEDED') {
              this.processResults(JSON.parse(ratesResult.output));
              this.resultsBack = true;
              this.resultsProcessing = false;
            } else {
              this.resultsError = true;
              this.resetTuner();
            }
            subject.next('Finished');
          }
          if (attempt >= 24) {
            subject.next('Finished');
          }
        },
        error => {
          this.processErrorResults(error);
          subject.next('Error');
        }
      ));
  }

  navigateToUrl(url: string) {
    window.open(url, '_blank');
  }

  processResults(results) {
    this.results = results;
    if (results && results.stateMachine && results.stateMachine.visualization) {
      this.visualisationUrl = this.sanitizer.bypassSecurityTrustResourceUrl(results.stateMachine.visualization);
    } else {
      this.resultsError = true;
    }
  }

  checkStatusToEndPolling(status: string) {
    return status === 'SUCCEEDED' || status === 'FAILED' || status === 'CANCELLED' || !status;
  }

  processErrorResults(error: HttpErrorResponse = null, firstCall = false) {
    this.resetTuner();
    if (firstCall) {
      this.executionToken = '';
    }
    this.resultsError = true;
  }

}
