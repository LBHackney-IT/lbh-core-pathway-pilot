interface Props {
  currentPage: number
  totalPages: number
}

const Pagination = ({ currentPage, totalPages }: Props): React.ReactElement => (
  <nav className="lbh-pagination">
    <div className="lbh-pagination__summary">
      Showing 101—150 of 246 results
    </div>
    <ul className="lbh-pagination">
      {currentPage > 1 && (
        <li className="lbh-pagination__item">
          <a
            className="lbh-pagination__link"
            href="#"
            aria-label="Previous page"
          >
            <span aria-hidden="true" role="presentation">
              &laquo;
            </span>{" "}
            Previous
          </a>
        </li>
      )}

      <li className="lbh-pagination__item">
        <a className="lbh-pagination__link" href="#" aria-label="Page 1">
          1
        </a>
      </li>
      <li className="lbh-pagination__item">
        <a className="lbh-pagination__link" href="#" aria-label="Page 2">
          2
        </a>
      </li>
      <li className="lbh-pagination__item">
        <a
          className="lbh-pagination__link lbh-pagination__link--current"
          href="#"
          aria-current="true"
          aria-label="Page 3, current page"
        >
          3
        </a>
      </li>
      <li className="lbh-pagination__item">
        <a className="lbh-pagination__link" href="#" aria-label="Page 4">
          4
        </a>
      </li>
      <li className="lbh-pagination__item">
        <a className="lbh-pagination__link" href="#" aria-label="Page 5">
          5
        </a>
      </li>
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

export default Pagination
