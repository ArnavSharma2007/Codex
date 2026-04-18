import '@testing-library/jest-dom';

jest.mock('framer-motion', () => {
  const React = require('react');

  // Strip motion props so React doesn't complain about unrecognized attributes
  const cleanProps = (props) => {
    const {
      initial, animate, exit, transition, whileHover, whileTap,
      variants, style, layoutId, onHoverStart, onHoverEnd, ...rest
    } = props;
    return rest;
  };

  // Safely forward refs and render raw HTML elements
  const mockComponent = (Tag) => React.forwardRef((props, ref) => {
    return React.createElement(Tag, { ...cleanProps(props), ref });
  });

  return {
    __esModule: true,
    motion: {
      div: mockComponent('div'),
      form: mockComponent('form'),
      h1: mockComponent('h1'),
      h2: mockComponent('h2'),
      p: mockComponent('p'),
      span: mockComponent('span'),
      button: mockComponent('button'),
      input: mockComponent('input'),
      a: mockComponent('a'),
      img: mockComponent('img'),
      nav: mockComponent('nav'),
      ul: mockComponent('ul'),
      li: mockComponent('li'),
    },
    AnimatePresence: ({ children }) => React.createElement(React.Fragment, null, children),
    useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
    useTransform: () => ({ get: () => 0 }),
    useSpring: () => ({ get: () => 0 }),
    useAnimation: () => ({ start: jest.fn(), stop: jest.fn() }),
    useInView: () => true
  };
});
