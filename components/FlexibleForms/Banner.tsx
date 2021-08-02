import cx from 'classnames';

interface Props {
  title: string;
  children: React.ReactChild | React.ReactChild[];
  className?: string;
}

const Banner = ({ title, children, className }: Props): React.ReactElement => (
  <section role="alert" className={cx(`lbh-page-announcement`, className)}>
    <h3 className="lbh-page-announcement__title">{title}</h3>
    <div className="lbh-page-announcement__content">{children}</div>
  </section>
);

export default Banner;
