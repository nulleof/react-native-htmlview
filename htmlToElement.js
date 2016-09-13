import React from 'react';
import { Text, StyleSheet } from 'react-native';

import { Parser, DomHandler } from 'htmlparser2';

const LINE_BREAK = '\n';
const PARAGRAPH_BREAK = '\n\n';
const BULLET = '\u2022 ';

const ltrim = (str) => {
  return str.replace(/^\s+/g, '');
};

const htmlToElement = (rawHtml, opts, done) => {
  const domToElement = (dom, parent) => {
    if (!dom) {
      return null;
    }

    return dom.map((node, index, list) => {
      if (opts.customRenderer) {
        const rendered = opts.customRenderer(node, index, list);
        if (rendered || rendered === null) {
          return rendered;
        }
      }

      if (node.type === 'text') {
        let data = node.data;

        if (parent) {
          const name = parent.name;
          if (name === 'p'
            || name === 'pre'
            || name === 'a'
            || name === 'div'
            || name === 'h1'
            || name === 'h2'
            || name === 'h3'
            || name === 'h4'
            || name === 'h5') {
            data = ltrim(data);
          }
        }

        if (node.prev && node.prev.type === 'tag') {
          const name = node.prev.name;

          if (name === 'p'
            || name === 'pre'
            || name === 'div'
            || name === 'br'
            || name === 'h1'
            || name === 'h2'
            || name === 'h3'
            || name === 'h4'
            || name === 'h5') {
            data = ltrim(data);
          }
        }

        return (
          <Text
            key={index}
            style={[
              null,
              opts.styles.default,
              (parent && parent.name) ? opts.styles[parent.name] : null,
              (parent && parent.style) ? StyleSheet.create({ style: parent.style }).style : null,
            ]}
          >
            {data}
          </Text>
        );
      }

      if (node.type === 'tag') {
        let linkPressHandler = null;
        if (node.name === 'a' && node.attribs && node.attribs.href) {
          linkPressHandler = () => opts.linkHandler(node.attribs.href);
        }

        const style = {};

        if (parent) {
          Object.assign(style, parent.style || {});

          switch (parent.name) {
            case 'i':
              style.fontStyle = 'italic';
              break;
            case 'b':
            case 'strong':
              style.fontWeight = 'bold';
              break;
            case 'a':
              style.textDecorationLine = 'underline';
              break;
            default:
              break;
          }
        }

        if (node.attribs && node.attribs.style) {
          const styles = node.attribs.style.split(';');
          styles.forEach((innerStyle) => {
            const exploded = innerStyle.split(':');
            if (exploded.length === 2) {
              switch (exploded[0].trim()) {
                case 'color':
                  style.color = exploded[1].trim();
                  break;
                default:
                  break;
              }
            }
          });
        }

        node.style = style;

        return (
          <Text key={index} onPress={linkPressHandler}>
            {node.name === 'pre' || node.name === 'div' ? LINE_BREAK : null}
            {node.name === 'li' ? BULLET : null}
            {domToElement(node.children, node)}
            {node.name === 'br' || node.name === 'li' ? LINE_BREAK : null}
            {node.name === 'p' && index < list.length - 1 ? PARAGRAPH_BREAK : null}
            {node.name === 'ul' && index < list.length - 1 ? LINE_BREAK : null}
            {node.name === 'h1' || node.name === 'h2' || node.name === 'h3' || node.name === 'h4' || node.name === 'h5' ? LINE_BREAK : null}
          </Text>
        );
      }

      return null;
    });
  };

  const handler = new DomHandler((err, dom) => {
    if (err) {
      done(err);
    }
    done(null, domToElement(dom));
  });
  const parser = new Parser(handler, { decodeEntities: true });
  parser.write(rawHtml);
  parser.done();
};

export default htmlToElement;
