import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoveMemberTeamPopUpComponent } from './remove-member-team-pop-up.component';

describe('RemoveMemberTeamPopUpComponent', () => {
  let component: RemoveMemberTeamPopUpComponent;
  let fixture: ComponentFixture<RemoveMemberTeamPopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemoveMemberTeamPopUpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemoveMemberTeamPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
