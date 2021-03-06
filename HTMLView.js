import React, { Component, PropTypes } from 'react';
import { Linking, StyleSheet, View, InteractionManager, Text } from 'react-native';
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
    viewportWidth: PropTypes.number,
    style: Text.propTypes.style,
    imageLinkStyle: Text.propTypes.style,
    onImageLinkPress: PropTypes.func,
  };

  static defaultProps = {
    value: '',
    stylesheet: null,
    imageLinkStyle: null,
    renderNode: null,
    viewportWidth: null,
    style: null,
    onLinkPress: url => Linking.openURL(url),
    onImageLinkPress: () => {},
    onError: () => {},
  };

  constructor(props) {
    super(props);

    this.element = null;

    this.state = {
      loading: true,
    };
  }

  componentDidMount() {
    this.startHtmlRender(this.props.value);

    InteractionManager.runAfterInteractions(() => {
      this.setState({
        loading: false,
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) {
      this.startHtmlRender(nextProps.value);
    }
  }

  componentWillUnmount() {
    this.setState({
      loading: false,
    });
  }

  startHtmlRender(value) {
    if (!value) {
      this.element = null;
      return;
    }

    const opts = {
      linkHandler: this.props.onLinkPress,
      styles: Object.assign({}, baseStyles, this.props.stylesheet),
      customRenderer: this.props.renderNode,
      viewportWidth: this.props.viewportWidth,
      imageLinkHandler: this.props.onImageLinkPress,
      imageLinkStyle: this.props.imageLinkStyle,
    };

    htmlToElement(value, opts, (err, element) => {
      if (err) {
        this.props.onError(err);
        return;
      }

      this.element = element;
    });
  }

  render() {
    if (this.state.loading || !this.element) {
      return <View />;
    }

    return <Text style={this.props.style} children={this.element} />;
  }
}

export default HTMLView;
