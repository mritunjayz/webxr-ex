/**
 *
 * App
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 */

import React from 'react';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';
import { Switch, Route } from 'react-router-dom';

import PersianCat from 'containers/PersianCat/Loadable';
import TokyoCity from 'containers/TokyoCity/Loadable';
import School from 'containers/School/Loadable';
// import Cars from 'containers/Cars/Loadable';
import Dog from 'containers/Dog/Loadable';
import HomePage from 'containers/HomePage/Loadable';
import FeaturePage from 'containers/FeaturePage/Loadable';
import NotFoundPage from 'containers/NotFoundPage/Loadable';
import Header from 'components/Header';
import Footer from 'components/Footer';

import GlobalStyle from '../../global-styles';

const AppWrapper = styled.div`
  max-width: calc(768px + 16px * 2);
  margin: 0 auto;
  display: flex;
  min-height: 100%;
  padding: 0 16px;
  flex-direction: column;
`;

export default function App() {
  return (
    <AppWrapper>
      <Helmet
        titleTemplate="%s - Verse Labs"
        defaultTitle="Verse Labs"
      >
        <meta name="description" content="Versel" />
      </Helmet>
      {/* <Header /> */}
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route exact path="/cat" component={PersianCat} />
        {/* <Route exact path="/cars" component={Cars} /> */}
        <Route exact path="/dog" component={Dog} />
        <Route exact path="/city" component={TokyoCity} />
        <Route exact path="/school" component={School} />
        <Route path="/features" component={FeaturePage} />
        <Route path="" component={NotFoundPage} />
      </Switch>
      {/* <Footer /> */}
      <GlobalStyle />
    </AppWrapper>
  );
}
