import RepeaterField from './RepeaterField';
import { Formik, Form } from 'formik';
import { render, screen, fireEvent } from '@testing-library/react';

const mockSubmit = jest.fn();

describe('RepeaterField', () => {
  it('renders no items correctly', () => {
    render(
      <Formik
        onSubmit={mockSubmit}
        initialValues={{
          foo: [],
        }}
      >
        {({ touched, errors }) => (
          <Form>
            <RepeaterField
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

    expect(screen.queryByRole('textbox')).toBeNull();

    expect(screen.getAllByText('Label text'));

    expect(screen.getByText('Hint text'));

    expect(screen.getByText('Add item'));
  });

  it('renders initial values correctly', () => {
    render(
      <Formik
        onSubmit={mockSubmit}
        initialValues={{
          foo: ['one', 'two', 'three'],
        }}
      >
        {({ touched, errors }) => (
          <Form>
            <RepeaterField
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

    expect(screen.getAllByRole('textbox').length).toBe(3);

    expect(screen.getByDisplayValue('one'));
    expect(screen.getByDisplayValue('two'));
    expect(screen.getByDisplayValue('three'));

    expect(screen.getByText('Add another item'));
  });

  it('renders errors', () => {
    render(
      <Formik
        onSubmit={mockSubmit}
        initialValues={{
          foo: [],
        }}
        initialErrors={{
          foo: 'Example error',
        }}
        initialTouched={{
          foo: [],
        }}
      >
        {({ touched, errors }) => (
          <RepeaterField
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

    render(
      <Formik
        onSubmit={mockSubmit}
        initialValues={{
          foo: ['one', 'two', 'three'],
        }}
        initialErrors={{
          foo: ['Example error 2'],
        }}
        initialTouched={{
          foo: true,
        }}
      >
        {({ touched, errors }) => (
          <RepeaterField
            touched={touched}
            errors={errors}
            name="foo"
            label="Label text"
            hint="Hint text"
          />
        )}
      </Formik>
    );
    expect(screen.getByText('Example error 2'));
  });

  it('allows items to be added and removed', () => {
    render(
      <Formik
        onSubmit={mockSubmit}
        initialValues={{
          foo: [],
        }}
      >
        {({ touched, errors }) => (
          <Form>
            <RepeaterField
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

    fireEvent.click(screen.getByText('Add item'));
    expect(screen.queryAllByRole('textbox').length).toBe(1);

    fireEvent.click(screen.getByText('Add another item'));
    expect(screen.queryAllByRole('textbox').length).toBe(2);

    fireEvent.click(screen.getAllByText('Remove')[0]);
    expect(screen.queryAllByRole('textbox').length).toBe(1);
  });
});
