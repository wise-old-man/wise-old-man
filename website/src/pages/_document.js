/* eslint-disable react/jsx-filename-extension */
import Document, { Html, Head, Main, NextScript } from 'next/document';

class BaseDocument extends Document {
  getInitialProps = async (ctx) => {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  };

  render() {
    return (
      <Html>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default BaseDocument;
