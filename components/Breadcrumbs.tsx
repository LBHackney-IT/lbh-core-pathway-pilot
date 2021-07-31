export interface Crumb {
  href: string
  text: string
  current?: boolean
}

interface Props {
  crumbs: Crumb[]
  fullWidth?: boolean
}

const Breadcrumbs = ({ crumbs, fullWidth }: Props): React.ReactElement => (
  <div
    data-testid="full-width-container"
    className={`govuk-breadcrumbs lbh-breadcrumbs lbh-container ${
      fullWidth && "lmf-full-width"
    }`}
  >
    <ol className="govuk-breadcrumbs__list">
      {crumbs.map(crumb => (
        <li
          className="govuk-breadcrumbs__list-item"
          key={`${crumb.href}-${crumb.text}`}
          aria-current={crumb.current ? "page" : false}
        >
          {crumb.current ? (
            <a className="govuk-breadcrumbs__link" href={crumb.href}>
              {crumb.text}
            </a>
          ) : (
            crumb.text
          )}
        </li>
      ))}
    </ol>
  </div>
)

export default Breadcrumbs
