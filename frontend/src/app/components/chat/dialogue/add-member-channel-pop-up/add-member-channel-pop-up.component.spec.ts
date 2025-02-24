import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMemberChannelPopUpComponent } from './add-member-channel-pop-up.component';

describe('AddMemberChannelPopUpComponent', () => {
  let component: AddMemberChannelPopUpComponent;
  let fixture: ComponentFixture<AddMemberChannelPopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMemberChannelPopUpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddMemberChannelPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
