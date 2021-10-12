import { useRouter } from "next/router"
import { perPage } from "../config"
import Link from "next/link"

interface Props {
  currentPage: number
  totalWorkflows: number
}

const Pagination = ({
  currentPage,
  totalWorkflows,
}: Props): React.ReactElement => {
  const {
    asPath,
    query: { page },
  } = useRouter()

  // if all the workflows fit on one page, don't show pagination
  if (totalWorkflows <= perPage) return null

  return (
    <nav className="lbh-pagination">
      <div className="lbh-pagination__summary">
        Showing 101—150 of {totalWorkflows} results
      </div>

      <ul className="lbh-pagination">
        {currentPage > 1 && (
          <li className="lbh-pagination__item">
            <Link href="#">
              <a className="lbh-pagination__link" aria-label="Previous page">
                <span aria-hidden="true" role="presentation">
                  &laquo;
                </span>{" "}
                Previous
              </a>
            </Link>
          </li>
        )}

        {/* <li className="lbh-pagination__item">
          <a className="lbh-pagination__link" href="#" aria-label="Page 1">
            1
          </a>
        </li>
        <li className="lbh-pagination__item">
          <a className="lbh-pagination__link" href="#" aria-label="Page 2">
            2
          </a>
        </li> */}

        <li className="lbh-pagination__item">
          <a
            className="lbh-pagination__link lbh-pagination__link--current"
            href="#"
            aria-current="true"
            aria-label={`Page ${currentPage}, current page`}
          >
            {currentPage}
          </a>
        </li>

        {/* <li className="lbh-pagination__item">
          <a className="lbh-pagination__link" href="#" aria-label="Page 4">
            4
          </a>
        </li>
        <li className="lbh-pagination__item">
          <a className="lbh-pagination__link" href="#" aria-label="Page 5">
            5
          </a>
        </li> */}

        <li className="lbh-pagination__item">
          <a className="lbh-pagination__link" href="#" aria-label="Next page">
            Next{" "}
            <span aria-hidden="true" role="presentation">
              &raquo;
            </span>
          </a>
        </li>
      </ul>
    </nav>
  )
}

export default Pagination
