import { TunerPayload } from './../models/tuner-payload';
import { HttpService } from './http.service';
import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { PowerTunerToken } from '../models/power-tuner-token';

describe('HttpService', () => {
  let httpTestingController: HttpTestingController;
  let service: HttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpService],
      imports: [HttpClientTestingModule]
    });

    httpTestingController = TestBed.get(HttpTestingController);
    service = TestBed.get(HttpService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should post to power tuner endpoint to start with the payload and return a token', () => {
    const mockTuner = {
      executionToken: 'Test-Token'
    };
    service.performPowerTunerStepFunction({} as TunerPayload)
      .subscribe(res => {
        expect(res.executionToken).toEqual(mockTuner.executionToken);
      });
    const req = httpTestingController.expectOne('http://localhost:8080/power-tuner');
    expect(req.request.method).toEqual('POST');
    req.flush(mockTuner);
  });

  it('should post to pwoer tuner result endpoint to fetch the result', () => {
    const mockTunerResult = {
      status: 'SUCCEEDED',
      output: 'Test-output'
    };
    service.fetchPowerTunerStepFunction({} as PowerTunerToken)
      .subscribe(res => {
        expect(res.status).toEqual(mockTunerResult.status);
        expect(res.output).toEqual(mockTunerResult.output);
      });
    const req = httpTestingController.expectOne('http://localhost:8080/power-tuner/result');
    expect(req.request.method).toEqual('POST');
    req.flush(mockTunerResult);
  });
});
