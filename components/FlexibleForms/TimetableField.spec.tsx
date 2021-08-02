import TimetableField from './TimetableField';
import { Formik } from 'formik';
import { render, screen } from '@testing-library/react';

describe('TimetableField', () => {
  it('renders correctly', () => {
    render(
      <Formik
        onSubmit={jest.fn()}
        initialValues={{
          foo: {},
        }}
      >
        <TimetableField name="foo" label="Label text" hint="Hint text" />
      </Formik>
    );

    expect(screen.getAllByRole('columnheader').length).toBe(5);
    expect(screen.getAllByRole('spinbutton').length).toBe(40);
    expect(screen.getByText('Label text'));
    expect(screen.getByText('Hint text'));
    expect(screen.getByText('0 hours total', { exact: false }));
  });

  it('accepts initial values', () => {
    render(
      <Formik
        onSubmit={jest.fn()}
        initialValues={{
          foo: {
            Mon: {
              Morning: '5',
            },
          },
        }}
      >
        <TimetableField name="foo" label="Label text" hint="Hint text" />
      </Formik>
    );
    expect(screen.getByDisplayValue('5'));
    expect(screen.getByText('5 hours total', { exact: false }));
  });

  it('renders errors', () => {
    render(
      <Formik
        onSubmit={jest.fn()}
        initialValues={{
          foo: {
            Mon: {
              Morning: '5',
            },
          },
        }}
        initialErrors={
          {
            foo: 'Example error',
          } as unknown as undefined
        }
        initialTouched={
          {
            foo: true,
          } as unknown as undefined
        }
      >
        <TimetableField name="foo" label="Label text" hint="Hint text" />
      </Formik>
    );
    expect(screen.getByText('Example error'));
  });
});
