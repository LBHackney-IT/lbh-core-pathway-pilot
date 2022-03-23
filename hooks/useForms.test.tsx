import useForms from "./useForms";
import {formsForThisEnv as getForms} from "../config/forms"
import {mockForm} from "../fixtures/form";
import {render, screen} from "@testing-library/react";

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
;(getForms as jest.Mock).mockReturnValue(formsList)

// beforeAll(
//   global.Storage.prototype.getForms = jest.fn(() => formsList)
// )

 const MockComponent = (formId: string) => {
  const form = useForms(formId)
   return (
    <>
      <h1>{form.id}</h1>
    </>
 )
}

describe('useForms',  () => {
  it('can find a form from a list of multiple existing forms', () => {
    const findFormId = "formB1"
    render(<MockComponent formId={"formB1"} />)
    expect(screen.getByText("formB1"))
  });

  it('returns null if the form ID is not matched to any forms', () => {
    const findFormId = "formB1"
    render(<MockComponent formId={"formB1"} />)
    expect(screen.getByText("formB1"))
  });
});