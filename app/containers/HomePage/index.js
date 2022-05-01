/**
 * NotFoundPage
 *
 * This is the page we show when the user visits a url that doesn't have a route
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import H1 from 'components/H1';
import messages from './messages';

export default function NotFound({ location }) {
  const search = location.search;
  const admin = new URLSearchParams(search).get('dev-space');

  return (
    <article>
      <H1>
        <FormattedMessage {...messages.header} />
      </H1>
      <hr />
      {admin && (
        <span>
          <Link to="/school?dev-space=true">
            <button type="button">School</button>
          </Link>
          <hr />
          <Link to="/cars?dev-space=true">
            <button type="button">Cars</button>
          </Link>
          <hr />
          <Link to="/dog?dev-space=true">
            <button type="button">Dog</button>
          </Link>
        </span>
      )}
    </article>
  );
}
