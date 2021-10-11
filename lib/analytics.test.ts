import ReactGA from "react-ga"
import {initGA} from "./analytics"

jest.mock('react-ga');

describe('production environment', () => {
  const currentPropId = process.env.NEXT_PUBLIC_GA_PROPERTY_ID;

  beforeAll(() => process.env.NEXT_PUBLIC_GA_PROPERTY_ID = "UA-000000");
  afterAll(() => {
    process.env.NEXT_PUBLIC_GA_PROPERTY_ID = currentPropId;
    (ReactGA.initialize as jest.Mock).mockClear();
  });

  test('google analytics is initialised', () => {
    initGA();

    expect(ReactGA.initialize).toHaveBeenCalledWith("UA-000000", expect.anything());
  });
});

describe('non-production environment', () => {
  const currentPropId = process.env.NEXT_PUBLIC_GA_PROPERTY_ID;

  beforeAll(() => process.env.NEXT_PUBLIC_GA_PROPERTY_ID = "N/A");
  afterAll(() => {
    process.env.NEXT_PUBLIC_GA_PROPERTY_ID = currentPropId;
    (ReactGA.initialize as jest.Mock).mockClear();
  });
  test('google analytics is initialised', () => {
    initGA();

    expect(ReactGA.initialize).not.toHaveBeenCalled();
  });
});
