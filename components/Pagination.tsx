import { perPage } from "../config"
import Link from "next/link"
import useQueryState from "../hooks/useQueryState"

interface Props {
  total: number
}

const Linky = ({
  newPage,
  setPage,
}: {
  newPage: number
  setPage: (number) => void
}) => (
  <li className="lbh-pagination__item">
    <a
      className="lbh-pagination__link"
      href="#"
      onClick={() => setPage(newPage)}
      aria-label={`Page ${newPage + 1}`}
    >
      {newPage + 1}
    </a>
  </li>
)

const Pagination = ({ total }: Props): React.ReactElement => {
  const [page, setPage] = useQueryState<number>("page", 0)

  if (total <= perPage) return null

  const lowerBound = page * perPage + 1
  const upperBound = Math.min(page * perPage + perPage, total)
  const totalPages = Math.ceil(total / perPage)
  const isOnLastPage = totalPages - 1 <= page

  return (
    <nav className="lbh-pagination">
      <div className="lbh-pagination__summary">
        Showing {lowerBound} - {upperBound} of {total} results
      </div>

      <ul className="lbh-pagination">
        {page > 0 && (
          <li className="lbh-pagination__item">
            <a
              href="#"
              className="lbh-pagination__link"
              onClick={() => setPage(page - 1)}
              aria-label="Previous page"
            >
              <span aria-hidden="true" role="presentation">
                &laquo;
              </span>{" "}
              Previous
            </a>
          </li>
        )}

        {page - 3 >= 0 && <Linky newPage={page - 3} setPage={setPage} />}
        {page - 2 >= 0 && <Linky newPage={page - 2} setPage={setPage} />}
        {page - 1 >= 0 && <Linky newPage={page - 1} setPage={setPage} />}

        <li className="lbh-pagination__item">
          <span
            className="lbh-pagination__link lbh-pagination__link--current"
            aria-current="true"
            aria-label={`Page ${page + 1}, current page`}
          >
            {page + 1}
          </span>
        </li>

        {page + 1 < totalPages && (
          <Linky newPage={page + 1} setPage={setPage} />
        )}
        {page + 2 < totalPages && (
          <Linky newPage={page + 2} setPage={setPage} />
        )}
        {page + 3 < totalPages && (
          <Linky newPage={page + 3} setPage={setPage} />
        )}

        {!isOnLastPage && (
          <li className="lbh-pagination__item">
            <a
              className="lbh-pagination__link"
              href="#"
              onClick={() => setPage(page + 1)}
              aria-label="Next page"
            >
              Next{" "}
              <span aria-hidden="true" role="presentation">
                &raquo;
              </span>
            </a>
          </li>
        )}
      </ul>
    </nav>
  )
}

export default Pagination
