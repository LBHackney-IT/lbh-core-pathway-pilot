import s from "./PageAnnouncement.module.scss"
interface Props {
  title: string
  children: React.ReactChild
  className?: string
}

const PageAnnouncement = ({
  title,
  children,
  className = "lbh-page-announcement--info",
}: Props): React.ReactElement => (
  <section
    role="alert"
    data-testid="page-announcement"
    className={`lbh-page-announcement ${className} ${s.lessPadding}`}
  >
    <h3 className="lbh-page-announcement__title">{title}</h3>
    <div className="lbh-page-announcement__content">{children}</div>
  </section>
)

export default PageAnnouncement
