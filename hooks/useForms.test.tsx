import useForms from "./useForms";
import {formsForThisEnv as getForms} from "../config/forms"
import {mockForm} from "../fixtures/form";
import {render, screen, waitFor} from "@testing-library/react";

const formsList = [
  {
    ...mockForm,
    id: "formA1"
  },
  {
    ...mockForm,
    id: "formB1"
  }
]

jest.mock("../config/forms")
;(getForms as jest.Mock).mockResolvedValue(formsList)

beforeEach( () => {
  jest.clearAllMocks()
})

 const MockComponent = ({ formId }: { formId: string } ) => {
  const form = useForms(formId)
   return (
    <>
      <h1>{form?.id || "unknown"}</h1>
    </>
 )
}

describe('useForms',  () => {
  it('can find a form from a list of multiple existing forms', async () => {
    const findFormId = "formB1"
    render(<MockComponent formId={"formB1"} />)
    await waitFor( () => expect(screen.getByText("formB1")))
  });

  it('returns null if the form ID is not matched to any forms', async () => {
    const findFormId = "formB1"
    render(<MockComponent formId={"formC3"} />)
    await waitFor( () => expect(screen.getByText("unknown",)))
  });
});