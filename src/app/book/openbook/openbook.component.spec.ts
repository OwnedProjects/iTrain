import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenbookComponent } from './openbook.component';

describe('OpenbookComponent', () => {
  let component: OpenbookComponent;
  let fixture: ComponentFixture<OpenbookComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenbookComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenbookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
