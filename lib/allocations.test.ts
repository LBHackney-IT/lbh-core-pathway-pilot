import {getAllocationsByEmail} from "./allocations";
import fetch from "node-fetch";

jest.mock('node-fetch')

;(fetch as unknown as jest.Mock).mockResolvedValueOnce({
  json: jest.fn().mockResolvedValue([{id: 2993}])
})

;(fetch as unknown as jest.Mock).mockResolvedValueOnce({
  json: jest.fn().mockResolvedValue({allocations: [{status: "open"}]})
})

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
  it("calls the social care api for worker data", () => {
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/workers?email=test@example.com"),
      {"headers": {"x-api-key": "test-api-key"}}
    );
  })
  it("calls the social care api for allocations data", () => {
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/allocations?worker_id=2993&status=open"),
      {"headers": {"x-api-key": "test-api-key"}}
    );
  })
  it("receives allocation data", () => {
    expect(response).toEqual([{status: "open"}]);
  });
});
