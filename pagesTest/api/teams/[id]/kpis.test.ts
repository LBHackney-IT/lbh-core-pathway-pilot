import {beforeAll, beforeEach, describe, test} from "@jest/globals";
import { handler } from "../../../../pages/api/teams/[id]/kpis";
import {testApiHandlerUnsupportedMethods } from "../../../../lib/auth/test-functions";

describe("/api/teams/[id]/kpis", () => {
  testApiHandlerUnsupportedMethods(handler, ['GET']);
});
