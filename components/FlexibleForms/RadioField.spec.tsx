import RadioField from './RadioField';
import { Formik, Form } from 'formik';
import { fireEvent, render, screen } from '@testing-library/react';

const mockSubmit = jest.fn();
const mockHandler = jest.fn();

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

describe('RadioField', () => {
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
            <RadioField
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

    expect(screen.getAllByRole('radio').length).toBe(2);

    expect(screen.getByText('Label text'));

    expect(screen.getByText('Hint text'));

    expect(screen.getByText('Foo option'));
    expect(screen.getByText('Bar option'));
  });

  it('accepts an initial value/option', () => {
    render(
      <Formik
        onSubmit={mockSubmit}
        initialValues={{
          foo: '1',
        }}
      >
        {({ touched, errors }) => (
          <Form>
            <RadioField
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

    const chosenChoice = screen.getByLabelText(
      'Foo option'
    ) as HTMLInputElement;
    expect(chosenChoice.checked).toBe(true);
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
        {({ errors, touched }) => (
          <RadioField
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

  it('calls a custom change handler', () => {
    render(
      <Formik
        onSubmit={mockSubmit}
        initialValues={{
          foo: false,
        }}
      >
        <RadioField
          touched={{}}
          errors={{}}
          name="foo"
          label="Label text"
          hint="Hint text"
          choices={choices}
          onChange={mockHandler}
        />
      </Formik>
    );

    fireEvent.click(screen.getByText('Foo option'));
    expect(mockHandler).toBeCalled();
  });
});
