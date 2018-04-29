import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllfavoriteComponent } from './allfavorite.component';

describe('AllfavoriteComponent', () => {
  let component: AllfavoriteComponent;
  let fixture: ComponentFixture<AllfavoriteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllfavoriteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllfavoriteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
