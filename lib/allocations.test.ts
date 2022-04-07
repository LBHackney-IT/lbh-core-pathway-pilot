import {getAllocationsByEmail} from "./allocations";
import fetch from "node-fetch";

jest.mock('node-fetch', () => jest.fn().mockResolvedValue({
  json: jest.fn().mockResolvedValue({allocations: [{status: "open"}]})
}));
describe('allocations', () => {
  let response;
  const api_key = process.env.SOCIAL_CARE_API_KEY
  beforeAll(async () => {
    process.env.SOCIAL_CARE_API_KEY = "test-api-key";
    response = await getAllocationsByEmail("test@example.com");
  });

  afterAll(() => {
    process.env.SOCIAL_CARE_API_KEY = api_key
  })
  it("calls the social care api with the correct data", () => {
    expect(fetch).toHaveBeenCalledWith(
      "https://virtserver.swaggerhub.com/Hackney/social-care-case-viewer-api/1.0.0/allocations?worker_email=test@example.com&status=open",
      {"headers": {"x-api-key": expect.anything()}}
    );
  })
  it("receives allocation data", () => {
    expect(response).toEqual([{status: "open"}]);
  });
});