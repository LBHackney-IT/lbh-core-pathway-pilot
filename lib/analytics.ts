import ReactGA from "react-ga4"

export const initGA = (): void => {
  if (
    process.env.NEXT_PUBLIC_GA_PROPERTY_ID
    && process.env.NEXT_PUBLIC_GA_PROPERTY_ID !== "N/A"
  ) ReactGA.initialize(process.env.NEXT_PUBLIC_GA_PROPERTY_ID, {
      testMode: process.env.NODE_ENV === "test",
    })
}

export const logPageView = (): void => {
  if (!window.GA_INITIALIZED) return;
  ReactGA.set({ page: window.location.pathname })
  ReactGA.send("pageview");
}

export const logEvent = (category = "", action = ""): void =>
  window.GA_INITIALIZED && ReactGA.event({ category, action })
