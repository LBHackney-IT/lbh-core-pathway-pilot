import DateTimeField from './DateTimeField';
import { Formik, Form } from 'formik';
import { render, screen } from '@testing-library/react';

const mockSubmit = jest.fn();

describe('DateTimeField', () => {
  it('renders two text inputs with the right types', () => {
    render(
      <Formik
        onSubmit={mockSubmit}
        initialValues={{
          foo: false,
        }}
      >
        {({ touched, errors }) => (
          <Form>
            <DateTimeField
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

    expect(screen.getByText('Label text'));
    expect(screen.getByText('Hint text'));
    expect((screen.getByLabelText('Date') as HTMLInputElement).type).toBe(
      'date'
    );
    expect((screen.getByLabelText('Time') as HTMLInputElement).type).toBe(
      'time'
    );
  });

  it('accepts an initial value', () => {
    render(
      <Formik
        onSubmit={mockSubmit}
        initialValues={{
          foo: ['2021-12-01', '12:00'],
        }}
      >
        {({ touched, errors }) => (
          <Form>
            <DateTimeField
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
    expect(screen.getByDisplayValue('2021-12-01'));
    expect(screen.getByDisplayValue('12:00'));
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
          <DateTimeField
            touched={touched}
            errors={errors}
            name="foo"
            label="Label text"
            hint="Hint text"
          />
        )}
      </Formik>
    );
    expect(screen.getByText('Example error'));
  });
});
