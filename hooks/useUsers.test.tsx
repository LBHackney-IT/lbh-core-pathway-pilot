import useUsers from "./useUsers";
import {render} from "@testing-library/react";

const MockComponent = (): React.ReactElement => {
    const {data: users} = useUsers('test');
    return (
        <div>{JSON.stringify(users)}</div>
    );
};

describe('getting users', () => {
    const fetchOriginal = global.fetch;

    beforeAll(() => {
      global.fetch = jest.fn();
      render(<MockComponent />);
    });
    afterAll(() => global.fetch = fetchOriginal);

    test('fetch called with XSRF-TOKEN', () => {
        expect(global.fetch).toHaveBeenCalledWith('/api/users', {
            headers: {'XSRF-TOKEN': 'test'}
        })
    });
});
