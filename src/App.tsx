import * as React from 'react';
import { css, Global } from '@emotion/react';
import { createTheme, CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material';
import { HomePage } from './pages/home';
import styled from '@emotion/styled';

const globalStyles = css`
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  ::-webkit-scrollbar-thumb {
    background: hsl(0deg 0% 50% / 0.5);
  }
`;

export const App = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: { mode: prefersDarkMode ? 'dark' : 'light' },
        typography: { fontFamily: 'system-ui, Roboto, Arial, sans-serif' },
      }),
    [prefersDarkMode]
  );
  return (
    <ThemeProvider theme={theme}>
      <Global styles={globalStyles} />
      <CssBaseline enableColorScheme />
      <Content>
        <HomePage />
      </Content>
    </ThemeProvider>
  );
};

const Content = styled.div`
  display: grid;
  place-items: center;
`;

export default App;
