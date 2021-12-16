import {pilotGroup} from "../config/allowedGroups";
import {mockUser} from "./users";
import {UserSession} from "../lib/auth/types";

export const mockSession: UserSession = {
    approver: mockUser.approver,
    email: mockUser.email,
    groups: [pilotGroup],
    inPilot: true,
    name: mockUser.name,
    panelApprover: mockUser.panelApprover,
    shortcuts: mockUser.shortcuts,
    team: mockUser.team,
};
export const mockSessionNotInPilot: UserSession = {
  ...mockSession,
  inPilot: false,
  groups: [],
}
export const mockSessionApprover: UserSession = {
  ...mockSession,
  approver: true,
};
export const mockSessionPanelApprover: UserSession = {
  ...mockSession,
  panelApprover: true,
};
