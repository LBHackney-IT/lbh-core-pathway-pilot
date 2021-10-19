import {perPage} from "../config"
import Link from "next/link"
import useQueryState from "../hooks/useQueryState";

interface Props {
  total: number
}

const Pagination = ({ total }: Props): React.ReactElement => {
  const [page, setPage] = useQueryState<number>("page", 0);

  if (total <= perPage) return null

  const lowerBound = (page * perPage) + 1;
  const upperBound = Math.min((page * perPage) + perPage, total);
  const isOnLastPage = Math.ceil(total / perPage) - 1 <= page;

  return (
    <nav className="lbh-pagination">
      <div className="lbh-pagination__summary">
        Showing {lowerBound} - {upperBound} of {total} results
      </div>

      <ul className="lbh-pagination">
        {page > 0 && (
          <li className="lbh-pagination__item">
            <Link href="#">
              <a
                className="lbh-pagination__link"
                href="#"
                onClick={() => setPage(page - 1)}
                aria-label="Previous page"
              >
                <span aria-hidden="true" role="presentation">
                  &laquo;
                </span>{" "}
                Previous
              </a>
            </Link>
          </li>
        )}

        <li className="lbh-pagination__item">
          <a
            className="lbh-pagination__link lbh-pagination__link--current"
            aria-current="true"
            aria-label={`Page ${page + 1}, current page`}
          >
            {page + 1}
          </a>
        </li>

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
