import ReactGA from "react-ga"

export const initGA = (): void => ReactGA.initialize(process.env.GA_PROPERTY_ID)

export const logPageView = (): void => {
  ReactGA.set({ page: window.location.pathname })
  ReactGA.pageview(window.location.pathname)
}

export const logEvent = (category = "", action = ""): void =>
  ReactGA.event({ category, action })
