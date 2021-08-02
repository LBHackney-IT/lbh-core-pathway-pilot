import SelectField from './SelectField';
import { Formik, Form } from 'formik';
import { render, screen } from '@testing-library/react';

const mockSubmit = jest.fn();

const choices = [
  {
    value: '1',
    label: 'Foo option',
  },
  {
    value: '2',
    label: 'Bar option',
  },
];

describe('SelectField', () => {
  it('renders correctly', () => {
    render(
      <Formik
        onSubmit={mockSubmit}
        initialValues={{
          foo: false,
        }}
      >
        {({ touched, errors }) => (
          <Form>
            <SelectField
              touched={touched}
              errors={errors}
              name="foo"
              label="Label text"
              hint="Hint text"
              choices={choices}
            />
          </Form>
        )}
      </Formik>
    );

    expect(screen.getByRole('combobox'));
    expect(screen.getByLabelText('Label text'));
    expect(screen.getByText('Hint text'));

    expect(screen.getByText('Foo option'));
    expect(screen.getByText('Bar option'));
  });

  it('accepts an initial value/option', () => {
    render(
      <Formik
        onSubmit={mockSubmit}
        initialValues={{
          foo: '2',
        }}
      >
        {({ touched, errors }) => (
          <Form>
            <SelectField
              touched={touched}
              errors={errors}
              name="foo"
              label="Label text"
              hint="Hint text"
              choices={choices}
            />
          </Form>
        )}
      </Formik>
    );
    expect(screen.getByDisplayValue('Bar option'));
  });

  it('renders errors', () => {
    render(
      <Formik
        onSubmit={mockSubmit}
        initialValues={{
          foo: '',
        }}
        initialErrors={{
          foo: 'Example error',
        }}
        initialTouched={{
          foo: true,
        }}
      >
        {({ touched, errors }) => (
          <SelectField
            touched={touched}
            errors={errors}
            name="foo"
            label="Label text"
            hint="Hint text"
            choices={choices}
          />
        )}
      </Formik>
    );
    expect(screen.getByText('Example error'));
  });
});
