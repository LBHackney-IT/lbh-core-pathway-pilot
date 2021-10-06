import SocialCareIdField from './SocialCareIdField';
import { Formik, Form } from 'formik';
import { render, screen } from '@testing-library/react';
import useResident from "../../hooks/useResident"
import { mockResident } from '../../fixtures/residents';

jest.mock("../../hooks/useResident")
;(useResident as jest.Mock).mockReturnValue({
  data: mockResident,
})

const mockSubmit = jest.fn();

describe('SocialCareIdField', () => {
  it('renders correctly', async() => {
    render(
      <Formik
        onSubmit={mockSubmit}
        initialValues={{
          foo: {
              Name: "",
              "Social care ID": "",
              "Date of birth": ""
          },
        }}
      >
        {({ touched, errors }) => (
          <Form>
            <SocialCareIdField
              touched={touched}
              errors={errors}
              name="foo"
              label="Label text"
              hint="Hint text"
            />
          </Form>
        )}
      </Formik>
    );

    expect(await screen.findByRole('textbox'));
    expect(await screen.findByLabelText('Label text'));
    expect(await screen.findByText('Hint text'));
  });

  it('accepts an initial value/option', async () => {
    render(
      <Formik
        onSubmit={mockSubmit}
        initialValues={{
          foo: {
              "Social care ID": "bar"
          },
        }}
      >
        {({ touched, errors }) => (
          <Form>
            <SocialCareIdField
              touched={touched}
              errors={errors}
              name="foo"
              label="Label text"
              hint="Hint text"
            />
          </Form>
        )}
      </Formik>
    );

    expect(await screen.findByDisplayValue('bar'));
  });

  it("renders the selected resident", async () => {
    render(
        <Formik
          onSubmit={mockSubmit}
          initialValues={{}}
        >
          {({ touched, errors }) => (
            <Form>
              <SocialCareIdField
                touched={touched}
                errors={errors}
                name="foo"
                label="Label text"
                hint="Hint text"
              />
            </Form>
          )}
        </Formik>
      );

      expect(await screen.findByText("Firstname Surname"))
      expect(await screen.findByText("Born 1 Oct 2000"))
      expect(await screen.findByText("123 Town St", {exact: false}))
      expect(await screen.findByText("W1A", {exact: false}))
  })

  it('renders errors', async () => {
    render(
      <Formik
        onSubmit={mockSubmit}
        initialValues={{
          foo: {
              "Name": ""
          },
        }}
        initialErrors={{
          foo: {
              "Name": 'Example error'
          },
        }}
        initialTouched={{
          foo: true,
        }}
      >
        {({ touched, errors }) => (
          <SocialCareIdField
            touched={touched}
            errors={errors}
            name="foo"
            label="Label text"
            hint="Hint text"
          />
        )}
      </Formik>
    );

    expect(await screen.findByText('Example error'));
  });
});
