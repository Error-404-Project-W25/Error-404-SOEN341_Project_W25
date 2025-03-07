import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddChannelMembersDialogue } from './add-member-channel.dialogue';

describe('AddMemberChannelPopUpComponent', () => {
  let component: AddChannelMembersDialogue;
  let fixture: ComponentFixture<AddChannelMembersDialogue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddChannelMembersDialogue],
    }).compileComponents();

    fixture = TestBed.createComponent(AddChannelMembersDialogue);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
