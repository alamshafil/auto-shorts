import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Easy to Use',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        auto-shorts is designed to be easy to use, with a simple and intuitive UI.
      </>
    ),
  },
  {
    title: 'Generate any type of short',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        auto-shorts can generate any type of short, from simple to complex. Read the docs to learn more.  
      </>
    ),
  },
  {
    title: 'Use CLI, API, or Web Interface',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        auto-shorts can be used in multiple ways, including CLI, API (JS/TS), or Web Interface.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
