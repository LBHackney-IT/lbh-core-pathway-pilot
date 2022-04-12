import { handler } from "../../../pages/api/residents/[id]"
import { getResidentById, getFullResidentById } from "../../../lib/residents"
import { mockUser } from "../../../fixtures/users"
import {NextApiRequest, NextApiResponse} from "next"

jest.mock("../../../lib/residents")

describe('residents endpoint', () => {
    let response

    beforeEach(() => {
    jest.clearAllMocks()
      
    response = {
        status: jest.fn().mockImplementation(() => response),
        json: jest.fn(),
      } as unknown as NextApiResponse
    })

    it("it returns some resident details for the specific resident", async () => {
        const request = {
          method: "GET",
          session: { user: mockUser },
          query: { id: "123" },
        } as unknown as NextApiRequest
    
        await handler(request, response);
    
        expect(getResidentById).toBeCalledWith("123");
        expect(getFullResidentById).not.toBeCalled();
      })

      it("it returns all resident details for the specific resident when the fullView query is true", async () => {
        const request = {
          method: "GET",
          session: { user: mockUser },
          query: { id: "12345", fullView: "true"},
        } as unknown as NextApiRequest
    
        await handler(request, response);
    
        expect(getFullResidentById).toBeCalledWith("12345");
        expect(getResidentById).not.toBeCalled();
      })

      it("it returns some resident details for the specific resident when the fullView query is false", async () => {
        const request = {
          method: "GET",
          session: { user: mockUser },
          query: { id: "12345", fullView: "false"},
        } as unknown as NextApiRequest
    
        await handler(request, response);
    
        expect(getResidentById).toBeCalledWith("12345");
        expect(getFullResidentById).not.toBeCalled();
      })
})