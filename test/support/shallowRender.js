import TestUtils from 'react-addons-test-utils';

shallowRender = (element) => {
  var shallowRenderer = TestUtils.createRenderer();

  shallowRenderer.render(element);
  return shallowRenderer
};

module.exports = shallowRender;
