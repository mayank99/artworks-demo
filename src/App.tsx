import * as React from 'react';
import { css, Global } from '@emotion/react';
import { createTheme, CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material';
import { HomePage } from './pages/home';

const globalStyles = css`
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  ::-webkit-scrollbar-thumb {
    background: hsl(0deg 0% 25% / 0.5);
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
      <HomePage />
    </ThemeProvider>
  );
};

export default App;
