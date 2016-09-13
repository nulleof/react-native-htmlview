import React, { Component, PropTypes } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import htmlToElement from './htmlToElement';

const boldStyle = { fontWeight: '500' };
const italicStyle = { fontStyle: 'italic' };
const codeStyle = { fontFamily: 'Menlo' };

/* eslint-disable */
const baseStyles = StyleSheet.create({
  b: boldStyle,
  strong: boldStyle,
  i: italicStyle,
  em: italicStyle,
  pre: codeStyle,
  code: codeStyle,
  a: {
    fontWeight: '500',
    color: '#007AFF',
  },
});
/* eslint-enable */

class HTMLView extends Component {
  static propTypes = {
    value: PropTypes.string,
    stylesheet: PropTypes.object,
    onLinkPress: PropTypes.func,
    onError: PropTypes.func,
    renderNode: PropTypes.func,
  };

  static defaultProps = {
    onLinkPress: url => Linking.openURL(url),
    onError: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      element: null,
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.startHtmlRender(this.props.value);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) {
      this.startHtmlRender(nextProps.value);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  startHtmlRender(value) {
    if (!value) {
      this.setState({ element: null });
      return;
    }

    const opts = {
      linkHandler: this.props.onLinkPress,
      styles: Object.assign({}, baseStyles, this.props.stylesheet),
      customRenderer: this.props.renderNode,
    };

    htmlToElement(value, opts, (err, element) => {
      if (err) {
        this.props.onError(err);
        return;
      }

      if (this.mounted) {
        this.setState({ element });
      }
    });
  }

  render() {
    if (this.state.element) {
      return <View children={this.state.element} />;
    }
    return <View />;
  }
}

export default HTMLView;
