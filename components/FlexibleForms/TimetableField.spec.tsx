import TimetableField from "./TimetableField"
import {Formik} from "formik"
import {render, screen, waitFor, fireEvent} from "@testing-library/react"
import {costPerHour} from "../../config"
import {generateInitialValues} from "../../lib/forms"

const initialValues = generateInitialValues([
  {id: "foo", type: "timetable", question: "foo"},
])

describe("TimetableField", () => {
  it("renders correctly", async () => {
    render(
      <Formik
        onSubmit={jest.fn()}
        initialValues={{
          foo: {},
        }}
      >
        <TimetableField name="foo" label="Label text" hint="Hint text"/>
      </Formik>
    )

    expect(screen.getAllByRole("columnheader").length).toBe(5)
    expect(screen.getAllByRole("spinbutton").length).toBe(40)
    expect(screen.getByText("Label text")).toBeVisible()
    expect(screen.getByText("Hint text")).toBeVisible()
  })

  it("accepts initial values", async () => {
    render(
      <Formik
        onSubmit={jest.fn()}
        initialValues={{
          foo: {
            timetable: {
              Mon: {
                Morning: "15",
              },
            },
          },
        }}
      >
        <TimetableField name="foo" label="Label text" hint="Hint text"/>
      </Formik>
    )

    expect(screen.getByDisplayValue("15")).toBeVisible();
  })

  it("renders errors", async () => {
    render(
      <Formik
        onSubmit={jest.fn()}
        initialValues={{
          foo: {
            timetable: {
              Mon: {
                Morning: "5",
              },
            },
          },
        }}
        initialErrors={
          {
            foo: "Example error",
          } as unknown as undefined
        }
        initialTouched={
          {
            foo: true,
          } as unknown as undefined
        }
      >
        <TimetableField name="foo" label="Label text" hint="Hint text"/>
      </Formik>
    )

    expect(screen.getByText("Example error")).toBeVisible();
  })

  it("calculates total hours, if asked", async () => {
    render(
      <Formik onSubmit={jest.fn()} initialValues={initialValues}>
        <TimetableField name="foo" label="Label text" summaryStats={true}/>
      </Formik>
    )

    expect(screen.getByText(/0(.*)hours(.*)total/, {exact: false})).toBeVisible();

    await waitFor(() => {
      fireEvent.change(screen.getAllByRole("spinbutton")[0], {
        target: {value: "60"},
      })
    })

    expect(screen.getByText(/1(.*)hour(.*)total/, {exact: false})).toBeVisible();

    await waitFor(() => {
      fireEvent.change(screen.getAllByRole("spinbutton")[1], {
        target: {value: "120"},
      })
      fireEvent.change(screen.getAllByRole("spinbutton")[2], {
        target: {value: "60"},
      })
    });

    expect(screen.getByText(/4(.*)hours(.*)total/, {exact: false})).toBeVisible();
  })

  it("calculates total cost, if asked", async () => {
    render(
      <Formik onSubmit={jest.fn()} initialValues={initialValues}>
        <TimetableField name="foo" label="Label text" summaryStats={true}/>
      </Formik>
    )

    expect(
      screen.getByText(/£(.*)0(.*)estimated annual cost/, {exact: false})
    ).toBeVisible();

    await waitFor(() => {
      fireEvent.change(screen.getAllByRole("spinbutton")[0], {
        target: {value: "120"},
      })
    });

    expect(
      screen.getByText((costPerHour * 2 * 52).toLocaleString("en-GB"), {
        exact: false,
      })
    ).toBeVisible();
  })
})
