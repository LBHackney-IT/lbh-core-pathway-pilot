import ReactGA from "react-ga"

export const initGA = (): void =>
  process.env.NEXT_PUBLIC_GA_PROPERTY_ID !== "N/A" &&
  ReactGA.initialize(process.env.NEXT_PUBLIC_GA_PROPERTY_ID, {
    testMode: process.env.NODE_ENV === "test",
  })

export const logPageView = (): void => {
  ReactGA.set({ page: window.location.pathname })
  ReactGA.pageview(window.location.pathname)
}

export const logEvent = (category = "", action = ""): void =>
  window.GA_INITIALIZED && ReactGA.event({ category, action })
