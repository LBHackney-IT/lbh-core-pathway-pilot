import {Team} from "@prisma/client";

export interface UserSession {
  name: string;
  email: string;
  approver: boolean;
  panelApprover: boolean;
  team: Team;
  groups: Array<string>;
  shortcuts: Array<string>;
  inPilot: boolean;
}
